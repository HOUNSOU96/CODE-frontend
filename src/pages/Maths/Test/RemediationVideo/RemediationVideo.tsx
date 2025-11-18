// 📁 RemediationVideo.tsx
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "@/utils/axios";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronDown, ChevronRight, X, List } from "lucide-react";
import CountdownCircle from "@/components/CountdownCircle";
import { useExitNotifier } from "@/hooks/useExitNotifier";

/* -------------------- TYPES -------------------- */
interface Question {
  id: string;
  question: string;
  choix: string[];
  bonne_reponse: string;
  duration?: number;
  // autres champs possibles (notion, niveau...) sont tolérés par la source
}

interface VideoData {
  id: string;
  titre: string;
  niveau: string;
  fichier?: string; // fichier local ou url
  videoUrl?: string; // compatibilité avec source actuelle
  notions: string[];
  prerequis: string[];
  questions: Question[];
  matiere?: string;
  mois?: string[];
}

/* -------------------- CONSTANTES & HELPERS -------------------- */
// niveaux / séries
const generalLevels = ["6e", "5e", "4e", "3e"] as const;
const lyceeLevels = ["2nde", "1ère", "Terminale"] as const;
const subSeriesMap: Record<string, string[]> = {
  A: ["A1", "A2"],
  F: ["F1", "F2", "F3", "F4"],
  G: ["G1", "G2", "G3"],
};

const cleanUrl = (url?: string) => (url ? url.trim().replace(/^"|"$/g, "") : "");
const isYouTubeUrl = (url: string) =>
  url.includes("youtube.com") || url.includes("youtu.be");
const shuffleArray = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);

const normalize = (str: string) =>
  (str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const isVideoForLevel = (videoNiveau: string, userNiveau: string, serie?: string) => {
  if (generalLevels.includes(userNiveau as any)) {
    return videoNiveau === userNiveau;
  }
  if (lyceeLevels.includes(userNiveau as any)) {
    const [level, videoSerie] = videoNiveau.split(" ");
    if (level !== userNiveau) return false;
    if (!serie) return true;
    const allowedSubSeries = subSeriesMap[videoSerie as keyof typeof subSeriesMap];
    return !allowedSubSeries || allowedSubSeries.includes(serie);
  }
  return false;
};

/** transform youtube watch/short/youtu.be -> youtube-nocookie embed url */
const getSafeYouTubeUrl = (url: string): string => {
  try {
    if (!url) return "";
    // handle normal watch?v=, youtu.be/ and embed/
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    // watch?v=
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      const vid = u.searchParams.get("v");
      return `https://www.youtube-nocookie.com/embed/${vid}?rel=0&modestbranding=1&controls=1&disablekb=1`;
    }
    // youtu.be short
    if (u.hostname.includes("youtu.be")) {
      const vid = u.pathname.replace("/", "");
      return `https://www.youtube-nocookie.com/embed/${vid}?rel=0&modestbranding=1&controls=1&disablekb=1`;
    }
    // embed already or other
    return url;
  } catch {
    return url;
  }
};

/* -------------------- PREREQUIS & QUEUE BUILDERS -------------------- */
/**
 * Expand prereqs recursively (same logic que backend)
 */
const expandPrereqs = (
  video: VideoData,
  allVideos: VideoData[],
  niveauActuel: string,
  seenAtLevel: Set<string>
): VideoData[] => {
  const result: VideoData[] = [];

  for (const prereqNotion of video.prerequis || []) {
    const prereqVideo = allVideos.find((v) => v.notions.includes(prereqNotion));
    if (!prereqVideo) continue;

    if (prereqVideo.niveau === niveauActuel) {
      if (!seenAtLevel.has(prereqVideo.id)) {
        seenAtLevel.add(prereqVideo.id);
        result.push(prereqVideo);
      }
    } else {
      const sub = expandPrereqs(prereqVideo, allVideos, niveauActuel, seenAtLevel);
      sub.forEach((v) => {
        if (v.niveau !== niveauActuel || !seenAtLevel.has(v.id)) {
          result.push(v);
          if (v.niveau === niveauActuel) seenAtLevel.add(v.id);
        }
      });
      if (!result.includes(prereqVideo)) result.push(prereqVideo);
    }
  }

  return result;
};

const buildLearningQueue = (allVideos: VideoData[], niveau: string): VideoData[] => {
  const result: VideoData[] = [];
  const seenAtLevel = new Set<string>();
  const videosByNiveau = [...allVideos].sort((a, b) => a.niveau.localeCompare(b.niveau));

  for (const video of videosByNiveau) {
    const prereqs = expandPrereqs(video, allVideos, niveau, seenAtLevel);
    prereqs.forEach((v) => {
      if (!result.find((vv) => vv.id === v.id)) {
        result.push(v);
        if (v.niveau === niveau) seenAtLevel.add(v.id);
      }
    });

    if (!result.find((vv) => vv.id === video.id)) {
      result.push(video);
      if (video.niveau === niveau) seenAtLevel.add(video.id);
    }

    if (video.niveau === niveau) {
      const sameNotionVideos = allVideos.filter(
        (v) =>
          v.niveau === niveau &&
          v.notions.some((n) => video.notions.includes(n)) &&
          v.id !== video.id
      );
      for (const v of sameNotionVideos) {
        if (!result.find((vv) => vv.id === v.id)) {
          result.push(v);
          seenAtLevel.add(v.id);
        }
      }
    }
  }

  return result;
};

const shuffleQuestionsWithChoices = (questions: Question[]) =>
  shuffleArray(questions || []).map((q) => ({ ...q, choix: shuffleArray(q.choix || []) }));

/* -------------------- composant principal -------------------- */

const RemediationVideo: React.FC = () => {
  const [timerEnded, setTimerEnded] = useState(false);
  const [timerResetCounter, setTimerResetCounter] = useState(0);

  
  const location = useLocation();
  const { niveau: niveauRoute, serie } = useParams<{ niveau: string; serie?: string }>();
  const state = location.state as { niveauActuel?: string; matiere?: string } | undefined;
  const niveauParam = new URLSearchParams(location.search).get("niveau");
  const niveau = state?.niveauActuel || niveauParam || niveauRoute || "6e";
  const serieEffective = generalLevels.includes(niveau as any) ? undefined : serie;
  const matiere = state?.matiere || "maths";

  const navigate = useNavigate();
  const { user } = useAuth();

  useExitNotifier({ eventType: "remediation" });
  useExitNotifier({ eventType: "videofinish" });

  // états principaux
  const [orderedVideos, setOrderedVideos] = useState<VideoData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [accessMessage, setAccessMessage] = useState<string | null>(null);


  useEffect(() => {
  if (!niveau) {
    navigate("/", { replace: true });
    return;
  }

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await api.get<VideoData[]>(`/api/videos/remediation?niveau=${niveau}`);
      const allVideos = Array.isArray(res.data) ? res.data : [];

      const cleaned = allVideos.map((v) => ({
        ...v,
        videoUrl: cleanUrl(v.videoUrl),
        fichier: v["fichier"] || v["videoUrl"] || v["fichier"], 
        notions: Array.isArray(v.notions) ? v.notions : [],
        prerequis: Array.isArray(v.prerequis) ? v.prerequis : [],
        questions: Array.isArray(v.questions) ? v.questions : [],
        mois: Array.isArray(v.mois) ? v.mois : [],
        matiere: v.matiere,
      }));

      const filtered = cleaned
        .filter((v) => (v.matiere ? v.matiere.toLowerCase() === matiere.toLowerCase() : true))
        .filter((v) => isVideoForLevel(v.niveau, niveau, serieEffective));

      const queue = buildLearningQueue(filtered, niveau);
      setOrderedVideos(queue);

      // 🔑 Reprendre la dernière vidéo visionnée
      const lastVideoId = localStorage.getItem("lastVideoWatched");
      if (lastVideoId) {
        const lastIndex = queue.findIndex((v) => v.id === lastVideoId);
        if (lastIndex !== -1) setCurrentIndex(lastIndex);
      }

      setLoading(false);
    } catch (err) {
      console.error("Erreur fetch vidéos remediation:", err);
      setOrderedVideos([]);
      setLoading(false);
    }
  };

  fetchVideos();
}, [niveau, matiere, serieEffective, navigate]);


  // lecture + quiz
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  // UI & progression
  const [answerStatus, setAnswerStatus] = useState<"none" | "correct" | "wrong">("none");
  const [fadeKey, setFadeKey] = useState(0);
  const [quizKey, setQuizKey] = useState(0);
  const [completedVideos, setCompletedVideos] = useState<Set<string>>(new Set());
  const [seenVideosAtLevel, setSeenVideosAtLevel] = useState<Set<string>>(new Set());
  const [openNotion, setOpenNotion] = useState<string | null>(null);
  const [canShowQuiz, setCanShowQuiz] = useState(false);
  useEffect(() => {
    const savedCompleted = localStorage.getItem("completedVideos");
    if (savedCompleted) {
      setCompletedVideos(new Set(JSON.parse(savedCompleted)));
    }
  }, []);


  // evaluation
  const [evaluationMode, setEvaluationMode] = useState(false);
  const [evaluationQuestions, setEvaluationQuestions] = useState<Question[]>([]);
  const [evaluationVideoQueue, setEvaluationVideoQueue] = useState<VideoData[]>([]);
  const [evaluationIndex, setEvaluationIndex] = useState(0);

  // refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const questionSoundRef = useRef<HTMLAudioElement | null>(null);

  

   // ====== FONCTION handleTimeUp ======
const handleTimeUp = () => {
  // Afficher un message d’avertissement
  setFeedback({
    type: "error",
    message: "⏰ Temps écoulé ! Vous devez revoir la vidéo avant de retenter le quiz.",
  });

  // Cacher le quiz et remettre les compteurs à zéro
  setShowQuiz(false);
  setVideoPlaying(false);
  setShowCountdown(false);
  setCurrentQuestionIndex(0);
  setSelectedAnswer("");
  setAnswerStatus("none");

  // Recharger les questions de la vidéo
  setShuffledQuestions(shuffleQuestionsWithChoices(currentVideo?.questions || []));

  // Optionnel : Revenir au mode “vidéo à revoir” après une petite pause
  setTimeout(() => {
    setFeedback(null);
    // Rejouer la vidéo courante (sans passer à la suivante)
    setVideoPlaying(true);
    setShowCountdown(true);
  }, 2500);
};


  // titres
  const currentVideoTitle = orderedVideos[currentIndex]?.titre || "";
  const nextVideoTitle = orderedVideos[currentIndex + 1]?.titre || null;

  // son click
  useEffect(() => {
    questionSoundRef.current = new Audio("/sounds/click.mp3");
    return () => {
      questionSoundRef.current?.pause();
      questionSoundRef.current = null;
    };
  }, []);

  // notifications start (envoie info quand la vidéo change)
  useEffect(() => {
    const notify = async () => {
      if (!user?.email) return;
      const startMonth = orderedVideos[currentIndex]?.mois?.[0] ?? "";
      try {
        await api.post("/api/notify/remediation", {
          niveau,
          video_titre: currentVideoTitle,
          next_video_titre: nextVideoTitle ?? null,
          start_month: startMonth,
        });
      } catch (err) {
        console.error("Erreur envoi notif RemediationVideo:", err);
      }
    };
    notify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentVideoTitle, nextVideoTitle, niveau, currentIndex]);

  // notification fin de vidéo (appel chaque changement d'index)
  useEffect(() => {
    const notifyFinish = async () => {
      if (!user?.email) return;
      try {
        await api.post("/api/notify/videofinish", {
          video_titre: currentVideoTitle,
          next_video_titre: nextVideoTitle ?? null,
        });
      } catch (err) {
        console.error("Erreur envoi notif videofinish:", err);
      }
    };
    notifyFinish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, user]);

  // fetch vidéos depuis backend
  useEffect(() => {
    if (!niveau) {
      navigate("/", { replace: true });
      return;
    }

    const fetchVideos = async () => {
      try {
        setLoading(true);
        const res = await api.get<VideoData[]>(`/api/videos/remediation?niveau=${niveau}`);
        const allVideos = Array.isArray(res.data) ? res.data : [];

        const cleaned = allVideos.map((v) => ({
          ...v,
          videoUrl: cleanUrl(v.videoUrl),
          fichier: v["fichier"] || v["videoUrl"] || v["fichier"], // compatibilité
          notions: Array.isArray(v.notions) ? v.notions : [],
          prerequis: Array.isArray(v.prerequis) ? v.prerequis : [],
          questions: Array.isArray(v.questions) ? v.questions : [],
          mois: Array.isArray(v.mois) ? v.mois : [],
          matiere: v.matiere,
        }));

        // Filtrer par matière si renseignée
        const filtered = cleaned
          .filter((v) => (v.matiere ? v.matiere.toLowerCase() === matiere.toLowerCase() : true))
          .filter((v) => isVideoForLevel(v.niveau, niveau, serieEffective));

        const queue = buildLearningQueue(filtered, niveau);
        setOrderedVideos(queue);
        setLoading(false);
      } catch (err) {
        console.error("Erreur fetch vidéos remediation:", err);
        setOrderedVideos([]);
        setLoading(false);
      }
    };

    fetchVideos();
    // include matiere & serieEffective so we refetch when they change
  }, [niveau, matiere, serieEffective, navigate]);

  // helper to compute current month normalized
  const currentMonth = normalize(new Date().toLocaleString("fr-FR", { month: "long" }));

  // current video & url
  const currentVideo = orderedVideos[currentIndex];
  const videoUrl = currentVideo?.fichier || currentVideo?.videoUrl || "";
  const isUrlValid = !!videoUrl && /^https?:\/\/.+/.test(videoUrl);
  // Sauvegarder la vidéo courante dans localStorage
const handleVideoComplete = (videoId: string) => {
  localStorage.setItem("lastVideoWatched", videoId);
};

  // availability logic (mois)
  const isAvailable =
    !currentVideo ||
    completedVideos.has(currentVideo.id) ||
    currentVideo.niveau !== niveau ||
    !currentVideo.mois?.length ||
    currentVideo.mois.some((m) => normalize(m) === currentMonth);


  useEffect(() => {
  localStorage.setItem("lastVideoIndex", currentIndex.toString());
}, [currentIndex]);

useEffect(() => {
  const savedIndex = localStorage.getItem("lastVideoIndex");
  if (savedIndex && orderedVideos.length) {
    const idx = parseInt(savedIndex, 10);
    if (!isNaN(idx) && idx < orderedVideos.length) setCurrentIndex(idx);
  }
}, [orderedVideos]);


useEffect(() => {
  if (orderedVideos[currentIndex]) {
    localStorage.setItem("lastVideoWatched", orderedVideos[currentIndex].id);
  }
}, [currentIndex, orderedVideos]);




  // group by notion for sidebar
  const videosByNotion: Record<string, VideoData[]> = {};
  orderedVideos
    .filter((v) => v.niveau === niveau)
    .forEach((v) => {
      (v.notions || []).forEach((n) => {
        if (!videosByNotion[n]) videosByNotion[n] = [];
        videosByNotion[n].push(v);
      });
    });
  const notionOrder = Object.keys(videosByNotion);

  /* -------------------- ACTIONS -------------------- */

  const startVideo = () => {
    setFeedback(null);
    setVideoPlaying(true);
    setShowQuiz(false);
    setShowCountdown(true); 
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setShuffledQuestions(shuffleQuestionsWithChoices(currentVideo?.questions || []));
    setAnswerStatus("none");
    setFadeKey((p) => p + 1);
  };

// ✅ Fonction corrigée : affiche les questions du quiz quand on clique sur “Passez au quiz”
const handleGoToQuestions = () => {
  // Masquer le compte à rebours et afficher le quiz
  setShowCountdown(false);
  setShowQuiz(true);
  setTimerEnded(true);
  setVideoPlaying(false);

  // Réinitialiser les variables de quiz
  setCurrentQuestionIndex(0);
  setSelectedAnswer("");
  setAnswerStatus("none");

  // Charger les questions mélangées de la vidéo courante
  setShuffledQuestions(shuffleQuestionsWithChoices(currentVideo?.questions || []));
};




  const handleValidateAnswer = () => {
    const currentQ = shuffledQuestions[currentQuestionIndex];
    if (!currentQ) return;

    if (selectedAnswer === currentQ.bonne_reponse) {
      setFeedback({ type: "success", message: "✅ Bravo ! Réponse correcte" });
      setAnswerStatus("correct");
      questionSoundRef.current?.play().catch(() => {});
      setTimeout(() => {
        setFeedback(null);
        setAnswerStatus("none");
        if (currentQuestionIndex < shuffledQuestions.length - 1) {
          setCurrentQuestionIndex((i) => i + 1);
          setSelectedAnswer("");
          setQuizKey((p) => p + 1);
        } else {
          // marque vidéo comme complétée
          setCompletedVideos((prev) => new Set(prev).add(currentVideo.id));
         localStorage.setItem(
  "completedVideos",
  JSON.stringify([...completedVideos, currentVideo.id])
);

         
          // délai pour UX
          setTimeout(() => handleNextVideo(), 900);
        }
      }, 900);
    } else {
      setFeedback({ type: "error", message: "❌ Mauvaise réponse ! Vous devez revoir la vidéo" });
      setAnswerStatus("wrong");
      setTimeout(() => {
        setFeedback(null);
        setVideoPlaying(false);
        setShowQuiz(false);
        setCurrentQuestionIndex(0);
        setSelectedAnswer("");
        setAnswerStatus("none");
        setShuffledQuestions(shuffleQuestionsWithChoices(currentVideo?.questions || []));
      }, 1400);
    }
  };

  const startEvaluationForNotion = (notion: string) => {
    const videosOfNotion = orderedVideos.filter((v) => v.notions.includes(notion) && completedVideos.has(v.id));
    const allQuestions: Question[] = [];
    videosOfNotion.forEach((v) => {
      if (v.questions && v.questions.length) allQuestions.push(...v.questions);
    });
    if (!allQuestions.length) return;
    const evalCount = Math.max(1, Math.floor(allQuestions.length / 4));
    const shuffled = shuffleArray(allQuestions).slice(0, evalCount);
    setEvaluationQuestions(shuffleQuestionsWithChoices(shuffled));
    setEvaluationVideoQueue(videosOfNotion);
    setEvaluationIndex(0);
    setEvaluationMode(true);
    setShowQuiz(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setAnswerStatus("none");
    setFadeKey((p) => p + 1);
  };

 

  /**
   * handleNextVideo:
   * - ajoute la logique : si on termine toutes les vidéos d'une notion -> passer à la notion suivante (première vidéo)
   * - sinon, incrémente l'index linéairement
   */
  const handleNextVideo = () => {
    if (!currentVideo) {
      navigate("/matiere", { replace: true });
      return;
    }

    // ajouter current to seen/completed sets where applicable
    if (currentVideo.niveau === niveau) {
      setSeenVideosAtLevel((prev) => new Set(prev).add(currentVideo.id));
      setCompletedVideos((prev) => {
        const newSet = new Set(prev);
        newSet.add(currentVideo.id);
        return newSet;
      });
    }

    // determine current notion and check if all videos for this notion are completed
    const currentNotion = (currentVideo.notions && currentVideo.notions[0]) || null;
    let moveToIndex = currentIndex + 1;

    // If all videos for currentNotion are completed -> go to next notion first video
    if (currentNotion) {
      const videosOfThisNotion = orderedVideos.filter((v) => v.notions.includes(currentNotion) && v.niveau === niveau);
      const allCompleted = videosOfThisNotion.length > 0 && videosOfThisNotion.every((v) => completedVideos.has(v.id) || v.id === currentVideo.id);

      if (allCompleted) {
        // find next notion in notionOrder
        const idxN = notionOrder.indexOf(currentNotion);
        const nextNotion = idxN !== -1 && idxN + 1 < notionOrder.length ? notionOrder[idxN + 1] : null;
        if (nextNotion) {
          // find first video index of nextNotion
          const idxVideo = orderedVideos.findIndex((v) => v.notions.includes(nextNotion));
          if (idxVideo !== -1) {
            setCurrentIndex(idxVideo);
            setVideoPlaying(false);
            setShowQuiz(false);
            setCurrentQuestionIndex(0);
            setSelectedAnswer("");
            setAnswerStatus("none");
            setFadeKey((p) => p + 1);
            return;
          }
        }
      }
    }

    // Default: advance to next linear video that is not already seen at level
    const nextIndex = currentIndex + 1;
    if (nextIndex < orderedVideos.length) {
      // skip videos already seen at level
      let candidate = nextIndex;
      while (candidate < orderedVideos.length && seenVideosAtLevel.has(orderedVideos[candidate].id)) {
        candidate++;
      }
      if (candidate < orderedVideos.length) {
        setCurrentIndex(candidate);
        setVideoPlaying(false);
        setShowQuiz(false);
        setCurrentQuestionIndex(0);
        setSelectedAnswer("");
        setAnswerStatus("none");
        setFadeKey((p) => p + 1);
        return;
      }
    }

    // if no next, return to matiere
    navigate("/matiere", { replace: true });
  };

  /* -------------------- RENDER -------------------- */

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-black text-white">
        <Loader2 className="animate-spin h-10 w-10" />
        <p>Chargement des vidéos...</p>
      </div>
    );

  if (!orderedVideos.length)
    return <div className="text-center mt-20 text-white bg-black">Aucune vidéo disponible.</div>;

  // current video title / next video for UI
  const currentTitle = currentVideo?.titre || "";
  const nextTitle = orderedVideos[currentIndex + 1]?.titre ?? null;

  const safeUrl = isYouTubeUrl(videoUrl) ? getSafeYouTubeUrl(videoUrl) : videoUrl;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-black text-white">

     {/* ✅ Message d'accès bloqué */}
{accessMessage && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-center"
  >
    {accessMessage}
  </motion.div>
)}


      {/* Sidebar desktop */}
      <aside className="hidden md:block w-80 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 p-5 border-r shadow-lg overflow-y-auto">
        <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-6 flex items-center gap-2">
          📚 Parcours – Niveau {generalLevels.includes(niveau as any) ? niveau.toUpperCase() : `${niveau} ${serieEffective || ""}`.toUpperCase()}
        </h2>

        <ul className="space-y-4">
          {Object.entries(videosByNotion).map(([notion, vids]) => (
            <li key={notion} className="border rounded-lg overflow-hidden">
               {/* Bouton pour ouvrir/fermer la notion */}
        <button
          onClick={() => setOpenNotion(openNotion === notion ? null : notion)}
          className="flex justify-between items-center w-full px-4 py-2 font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
        >
          {notion}
          {openNotion === notion ? <ChevronDown /> : <ChevronRight />}
        </button>

              <AnimatePresence>
                {openNotion === notion && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2 px-4 py-2 bg-white dark:bg-gray-800"
                  >
                    {vids.map((vid) => {
                      const isActive = orderedVideos[currentIndex]?.id === vid.id;
                      const isCompleted = completedVideos.has(vid.id);

                      return (
                        <li
                          key={vid.id}
                          onClick={() => {
                      const vidId = vid.id;
                      const currentVid = orderedVideos[currentIndex];

                     // 🔒 Si la vidéo cliquée n'est pas encore débloquée
                      const isAccessible =
                      completedVideos.has(vidId) || vidId === currentVid.id;

                      if (!isAccessible) {
                      setAccessMessage("⚠️ Vous devez finir la vidéo actuelle avant de continuer.");

                    // Le message disparaît après 5 secondes et on revient sur la vidéo actuelle
                     setTimeout(() => {
                     setAccessMessage(null);
                   const currentIndexBackup = orderedVideos.findIndex((v) => v.id === currentVid.id);
                 if (currentIndexBackup !== -1) setCurrentIndex(currentIndexBackup);
                    }, 10);

                  return;
                        }

                // ✅ Si accessible : on change normalement de vidéo
                  const index = orderedVideos.findIndex((v) => v.id === vidId);
                  if (index !== -1) {
                  setCurrentIndex(index);
                  setOpenNotion(null);
                 }
                  }}


                          className={`p-2 rounded-md transition-all border cursor-pointer ${
                            isActive
                              ? "bg-blue-600 text-white border-blue-700 shadow-md scale-[1.02]"
                              : isCompleted
                              ? "bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 border-green-400 hover:bg-green-200 dark:hover:bg-green-700"
                              : "bg-gray-50 dark:bg-gray-900 text-gray-400 border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{vid.titre}</span>
                            {isActive && <span>🔵</span>}
                            {isCompleted && !isActive && <span>✅</span>}
                          </div>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>
      </aside>

      {/* mobile drawer button */}
      <button
        className="md:hidden flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg m-4 self-start shadow"
        onClick={() => setOpenNotion("drawer")}
      >
        <List className="w-5 h-5" /> Liste des notions
      </button>

      {/* mobile drawer */}
      <AnimatePresence>
        {openNotion === "drawer" || Object.keys(videosByNotion).includes(openNotion || "") ? (
          <motion.div
  initial={{ x: "100%" }}
  animate={{ x: 0 }}
  exit={{ x: "100%" }}
  transition={{ duration: 0.35 }}
  className="fixed inset-0 z-50 flex justify-end md:hidden"
>
  {/* fond semi-transparent cliquable pour fermer le drawer */}
  <div
    className="absolute inset-0 bg-black/70"
    onClick={() => setOpenNotion(null)}
  ></div>

  {/* contenu drawer cliquable */}
  <div
    className="relative w-4/5 max-w-xs bg-white dark:bg-gray-900 h-full flex flex-col shadow-xl overflow-y-auto"
    onClick={(e) => e.stopPropagation()} // empêche le clic de se propager au fond
  >
    <div className="flex justify-between items-center px-4 py-3 border-b dark:border-gray-700">
      <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200">📑 Notions</h2>
      <button
        onClick={() => setOpenNotion(null)}
        className="bg-red-600 text-white px-3 py-1 rounded-md shadow hover:bg-red-700"
      >
        Fermer
      </button>
    </div>

             <ul className="space-y-4">
          {Object.entries(videosByNotion).map(([notion, vids]) => (
            <li key={notion} className="border rounded-lg overflow-hidden">
               {/* Bouton pour ouvrir/fermer la notion */}
        <button
          onClick={() => setOpenNotion(openNotion === notion ? null : notion)}
          className="flex justify-between items-center w-full px-4 py-2 font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
        >
          {notion}
          {openNotion === notion ? <ChevronDown /> : <ChevronRight />}
        </button>

              <AnimatePresence>
                {openNotion === notion && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2 px-4 py-2 bg-white dark:bg-gray-800"
                  >
                    {vids.map((vid) => {
                      const isActive = orderedVideos[currentIndex]?.id === vid.id;
                      const isCompleted = completedVideos.has(vid.id);

                      return (
                        <li
                          key={vid.id}
                          onClick={() => {
                      const vidId = vid.id;
                      const currentVid = orderedVideos[currentIndex];

                     // 🔒 Si la vidéo cliquée n'est pas encore débloquée
                      const isAccessible =
                      completedVideos.has(vidId) || vidId === currentVid.id;

                      if (!isAccessible) {
                      setAccessMessage("⚠️ Vous devez finir la vidéo actuelle avant de continuer.");

                    // Le message disparaît après 5 secondes et on revient sur la vidéo actuelle
                     setTimeout(() => {
                     setAccessMessage(null);
                   const currentIndexBackup = orderedVideos.findIndex((v) => v.id === currentVid.id);
                 if (currentIndexBackup !== -1) setCurrentIndex(currentIndexBackup);
                    }, 10);

                  return;
                        }

                // ✅ Si accessible : on change normalement de vidéo
                  const index = orderedVideos.findIndex((v) => v.id === vidId);
                  if (index !== -1) {
                  setCurrentIndex(index);
                  setOpenNotion(null);
                 }
                  }}


                          className={`p-2 rounded-md transition-all border cursor-pointer ${
                            isActive
                              ? "bg-blue-600 text-white border-blue-700 shadow-md scale-[1.02]"
                              : isCompleted
                              ? "bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 border-green-400 hover:bg-green-200 dark:hover:bg-green-700"
                              : "bg-gray-50 dark:bg-gray-900 text-gray-400 border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{vid.titre}</span>
                            {isActive && <span>🔵</span>}
                            {isCompleted && !isActive && <span>✅</span>}
                          </div>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>

             
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* main */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-6">
        <div className="w-full max-w-3xl">
          <div className="flex justify-start mb-4">
            <button onClick={() => navigate("/matiere")} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition">
              ⬅️ Retour aux matières
            </button>

            
            


          </div>

          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
            <div className="h-2 bg-blue-600 rounded-full transition-all" style={{ width: `${((currentIndex + 1) / orderedVideos.length) * 100}%` }} />
          </div>

          <h1 className="text-2xl font-bold text-center text-blue-700 dark:text-blue-300 mb-4">{currentTitle }</h1>
          
       
        



          {/* video player area (iframe for youtube-nocookie, video for local file) */}
          
<AnimatePresence mode="wait">
  {/* ✅ VIDEO */}
  {!showQuiz && videoPlaying && isUrlValid && (
    <motion.div
      key={`video-${fadeKey}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="relative rounded-xl overflow-hidden shadow-2xl w-full my-4"
    >
      {/* Countdown vidéo toujours visible au centre */}
      <div className="absolute top-4 right-4 pointer-events-none z-50">
  <CountdownCircle
    key={`${fadeKey}-${timerResetCounter}`}
    duration={180}         // Durée du timer
    size={80}             // Taille du cercle
    strokeWidth={6}       // Épaisseur du cercle
    onComplete={() => setTimerEnded(true)}
  />
</div>


      {/* Contenu vidéo */}
      {isYouTubeUrl(videoUrl) ? (
        <iframe
          key={fadeKey}
          src={safeUrl}
          title={currentVideoTitle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin"
          className="w-full aspect-video rounded-2xl shadow-lg border border-gray-700"
        />
      ) : (
        <video
  ref={videoRef}
  src={videoUrl}
  controls
  autoPlay
  className="w-full rounded-xl shadow-md border border-gray-300"
  onTimeUpdate={() => {
    if (!currentVideo) return;
    localStorage.setItem(
      `lastVideo_${matiere}_${currentVideo.id}`,
      JSON.stringify({ position: videoRef.current?.currentTime || 0 })
    );
  }}
  onEnded={() => {
    setVideoPlaying(false);
    setFadeKey((p) => p + 1);
  }}
  onLoadedMetadata={() => {
    // Restauration de la position si sauvegardée
    if (!currentVideo) return;
    const saved = localStorage.getItem(`lastVideo_${matiere}_${currentVideo.id}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.position && videoRef.current) {
        videoRef.current.currentTime = parsed.position;
      }
    }
  }}
/>

      )}

      {/* Bouton passer au quiz */}
      {timerEnded && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleGoToQuestions}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all"
          >
            Evaluation
          </button>
        </div>
      )}
    </motion.div>
  )}

  {/* ✅ QUIZ */}
{showQuiz && shuffledQuestions.length > 0 && (
  <motion.div
    key={`quiz-${quizKey}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
    className="w-full max-w-3xl mx-auto mt-6 p-6 border border-gray-300 dark:border-gray-700 rounded-2xl shadow-xl bg-white dark:bg-gray-900"
  >
    <div className="flex justify-between items-start mb-4">
      <p className="font-medium text-lg text-gray-800 dark:text-gray-200">
        ⏱ Temps restant :
      </p>
      <CountdownCircle
        key={currentQuestionIndex}
        duration={shuffledQuestions[currentQuestionIndex]?.duration || 60}
        onComplete={() => {
          setFeedback({
            type: "error",
            message: "⏰ Temps écoulé ! Vous devez revoir la vidéo pour continuer",
          });
          setVideoPlaying(true);
          setShowQuiz(true);
          setTimerEnded(true);
          setTimerResetCounter((p) => p + 1);
          setFadeKey((p) => p + 1);
        }}
      />
    </div>

    <motion.div
      key={shuffledQuestions[currentQuestionIndex].id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {shuffledQuestions[currentQuestionIndex].question}
      </h2>

      <div className="grid gap-4 mt-4">
        {shuffledQuestions[currentQuestionIndex].choix.map((opt, idx) => {
          const isSelected = selectedAnswer === opt;
          const isCorrect = answerStatus === "correct" && isSelected;
          const isWrong = answerStatus === "wrong" && isSelected;

          return (
            <motion.label
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.25 }}
              className={`flex items-center gap-3 p-4 border rounded-lg shadow-sm cursor-pointer transition text-base
                ${
                  isCorrect
                    ? "bg-green-600 text-white border-green-700"
                    : isWrong
                    ? "bg-red-600 text-white border-red-700"
                    : isSelected
                    ? "bg-blue-100 dark:bg-blue-800/40 border-blue-500"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-600 text-gray-800 dark:text-gray-200"
                }`}
            >
              <input
                type="radio"
                name={`q-${currentQuestionIndex}`}
                value={opt}
                checked={isSelected}
                onChange={() => setSelectedAnswer(opt)}
                className="accent-blue-600 scale-125"
              />
              <span>{opt}</span>
            </motion.label>
          );
        })}
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleValidateAnswer}
          disabled={!selectedAnswer}
          className={`px-6 py-2 rounded-full shadow transition-all text-white text-base
            ${
              selectedAnswer
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
        >
          Valider
        </button>
      </div>
    </motion.div>
  </motion.div>
)}


  {/* VIDEO LOCKED */}
  {!videoPlaying && !isUrlValid && !showQuiz && !isAvailable && (
    <motion.div
      key={`locked-${fadeKey}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mt-6 px-4 py-3 rounded-lg bg-yellow-200 text-yellow-900 font-semibold text-center shadow"
    >
      🔒 Cette vidéo sera disponible à partir du mois de {currentVideo?.mois?.[0]}
    </motion.div>
  )}

  {/* START BUTTON */}
  {!videoPlaying && !showQuiz && isAvailable && (
    <motion.button
      key={`start-btn-${fadeKey}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.4 }}
      onClick={() => {
        setVideoPlaying(true);
        setTimerEnded(false);
        setTimerResetCounter((p) => p + 1); // réinitialiser le timer
      }}
      className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-700 active:bg-green-800 transition-all duration-300"
    >
      ▶️ Démarrer la vidéo
    </motion.button>
  )}
</AnimatePresence>











          
          {feedback && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-4 rounded-xl shadow-lg z-50 ${feedback.type === "success" ? "bg-green-500" : "bg-red-500"} text-white font-semibold text-lg text-center`}>
              {feedback.message}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RemediationVideo;