// 📁 RemediationVideo.tsx
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams} from "react-router-dom";
import api from "@/utils/axios";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronDown, ChevronRight, X, List } from "lucide-react";
import ReactPlayer from "react-player";
import CountdownCircle from "@/components/CountdownCircle";
import { useExitNotifier } from "@/hooks/useExitNotifier";

interface Question {
  id: string;
  question: string;
  choix: string[];
  bonne_reponse: string;
  duration?: number;
}

interface VideoData {
  id: string;
  titre: string;
  videoUrl: string;
  notions: string[];
  prerequis: string[];
  questions: Question[];
  niveau: string;
  matiere?: string; 
  mois?: string[]; // ✅ ajout du champ mois
}

interface LocationState {
  niveauActuel: string;
}

interface Feedback {
  type: "success" | "error";
  message: string;
}

// ✅ Définition des niveaux et sous-séries
const generalLevels = ['6e', '5e', '4e', '3e'] as const;
const lyceeLevels = ['2nde', '1ère', 'Terminale'] as const;
const series = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;
const subSeriesMap: Record<string, string[]> = {
  A: ['A1', 'A2'],
  F: ['F1', 'F2', 'F3', 'F4'],
  G: ['G1', 'G2', 'G3'],
};





const cleanUrl = (url: string | undefined): string =>
  url ? url.trim().replace(/^"|"$/g, "") : "";

const isYouTubeUrl = (url: string) =>
  url.includes("youtube.com") || url.includes("youtu.be");

const shuffleArray = <T,>(array: T[]): T[] =>
  [...array].sort(() => Math.random() - 0.5);

const getCurrentMonthName = (): string => {
  return new Date().toLocaleString("fr-FR", { month: "long" });
};



const normalize = (str: string) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const isVideoForLevel = (videoNiveau: string, userNiveau: string, serie?: string): boolean => {
  // Collège : ignorer la série
  if (generalLevels.includes(userNiveau as any)) {
    return videoNiveau === userNiveau;
  }

  // Lycée : vérifier le niveau et la série
  if (lyceeLevels.includes(userNiveau as any)) {
    const [level, videoSerie] = videoNiveau.split(" ");
    if (level !== userNiveau) return false;

    if (!serie) return true; // pas de série spécifique
    const allowedSubSeries = subSeriesMap[videoSerie as keyof typeof subSeriesMap];
    return !allowedSubSeries || allowedSubSeries.includes(serie);
  }

  return false;
};


/**
 * Étend les prérequis
 */
const expandPrereqs = (
  video: VideoData,
  allVideos: VideoData[],
  niveauActuel: string,
  seenAtLevel: Set<string>
): VideoData[] => {
  const result: VideoData[] = [];

  for (const prereqNotion of video.prerequis) {
    const prereqVideo = allVideos.find((v) => v.notions.includes(prereqNotion));
    if (!prereqVideo) continue;

    if (prereqVideo.niveau === niveauActuel) {
      if (!seenAtLevel.has(prereqVideo.id)) {
        seenAtLevel.add(prereqVideo.id);
        result.push(prereqVideo);
      }
    } else {
      const subPrereqs = expandPrereqs(prereqVideo, allVideos, niveauActuel, seenAtLevel);
      subPrereqs.forEach((v) => {
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

/**
 * Construit la file d’apprentissage :
 * - prérequis (niveaux inférieurs)
 * - toutes les vidéos du niveau actuel sur la même notion (titres différents)
 */
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
  shuffleArray(questions).map((q) => ({ ...q, choix: shuffleArray(q.choix) }));

const FeedbackMessage: React.FC<Feedback & { onClose?: () => void }> = ({
  type,
  message,
  onClose,
}) => {
  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
  return (
    <AnimatePresence>
      <motion.div
        key={message}
        initial={{ opacity: 0, y: -20, scale: 0.8 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: type === "success" ? [1, 1.1, 1] : 1,
        }}
        exit={{ opacity: 0, y: -20, scale: 0.8 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-4 rounded-xl shadow-lg z-50 ${bgColor} text-white font-semibold text-lg text-center`}
      >
        {message}
        {onClose && (
          <button className="ml-4 underline" onClick={onClose}>
            ✖
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

const RemediationVideo: React.FC = () => {
  const location = useLocation();
  const { niveau: niveauRoute, serie } = useParams<{ niveau: string; serie?: string }>();
  const state = location.state as LocationState;
  const niveauParam = new URLSearchParams(location.search).get("niveau");
  const niveau = state?.niveauActuel || niveauParam || "6e";
  const serieEffective = generalLevels.includes(niveau as any) ? undefined : serie;
  // ✅ Récupérer la matière passée depuis la page Matiere.tsx
const stateMatiere = location.state as { matiere?: string };
const matiere = stateMatiere?.matiere || "maths";
  const navigate = useNavigate();
  const { user } = useAuth();

  const isNiveauSansSerie = generalLevels.includes(niveau as any);
const titreNiveau = isNiveauSansSerie
  ? niveau.toUpperCase()
  : `${niveau} ${serieEffective || ''}`.toUpperCase();

  useExitNotifier({ eventType: "remediation" });
  useExitNotifier({ eventType: "videofinish" });
  const [orderedVideos, setOrderedVideos] = useState<VideoData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [videoPlaying, setVideoPlaying] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [answerStatus, setAnswerStatus] = useState<"none" | "correct" | "wrong">("none");
  const [fadeKey, setFadeKey] = useState(0);
  const [quizKey, setQuizKey] = useState(0);
  const [completedVideos, setCompletedVideos] = useState<Set<string>>(new Set());
  const [seenVideosAtLevel, setSeenVideosAtLevel] = useState<Set<string>>(new Set());
  const [openNotion, setOpenNotion] = useState<string | null>(null);



  const currentVideoTitle = orderedVideos[currentIndex]?.titre || "";
  const nextVideoTitle = orderedVideos[currentIndex + 1]?.titre || null;

  const [evaluationMode, setEvaluationMode] = useState(false);
  const [evaluationQuestions, setEvaluationQuestions] = useState<Question[]>([]);
  const [evaluationVideoQueue, setEvaluationVideoQueue] = useState<VideoData[]>([]);
  const [evaluationIndex, setEvaluationIndex] = useState(0);
  const startMonth = orderedVideos[currentIndex]?.mois?.[0] ?? null;

  const playerRef = useRef<ReactPlayer>(null);
  const questionSoundRef = useRef<HTMLAudioElement | null>(null);



 useEffect(() => {
  const notify = async () => {
    if (!user?.email) return;

    // Récupère le premier mois disponible
    const startMonth = orderedVideos[currentIndex]?.mois?.[0] ?? "";

    try {
      await api.post("/api/notify/remediation", {     
        niveau,
        video_titre: currentVideoTitle,
        next_video_titre: nextVideoTitle ?? null,
        start_month: startMonth, // 🔥 ajouté
      });
    } catch (err) {
      console.error("Erreur envoi notif RemediationVideo:", err);
    }
  };
  notify();
}, [user, currentVideoTitle, nextVideoTitle, niveau]);




 useEffect(() => {
  const notify = async () => {
    if (!user?.email) return;
    try {
      await api.post("/api/notify/videofinish", { 
        video_titre: currentVideoTitle,
        next_video_titre: nextVideoTitle ?? null, // ✅
      });
    } catch (err) {
      console.error("Erreur envoi notif RemediationVideo:", err);
    }
  };
  notify();
}, [currentIndex, user]);




  useEffect(() => {
    questionSoundRef.current = new Audio("/sounds/click.mp3");
  }, []);

  useEffect(() => {
    if (!niveau) {
      navigate("/", { replace: true });
      return;
    }

    const fetchVideos = async () => {
      try {
        const res = await api.get<VideoData[]>(`/api/videos/remediation?niveau=${niveau}`);
        const allVideos = Array.isArray(res.data) ? res.data : [];
        const cleanedVideos = allVideos.map((v) => ({
          ...v,
          videoUrl: cleanUrl(v.videoUrl),
          notions: Array.isArray(v.notions) ? v.notions : [],
          prerequis: Array.isArray(v.prerequis) ? v.prerequis : [],
          mois: Array.isArray(v.mois) ? v.mois : [],
        }));

         // ✅ Filtrer uniquement les vidéos de la matière sélectionnée
        const filteredVideos = cleanedVideos
  .filter((v) => v.matiere?.toLowerCase() === matiere.toLowerCase())
  .filter((v) => isVideoForLevel(v.niveau, niveau, serieEffective));

setOrderedVideos(buildLearningQueue(filteredVideos, niveau));



        setOrderedVideos(buildLearningQueue(cleanedVideos, niveau));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [niveau, navigate]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-black text-white">
        <Loader2 className="animate-spin h-10 w-10" />
        <p>Chargement des vidéos...</p>
      </div>
    );

  if (!orderedVideos.length)
    return <div className="text-center mt-20 text-white bg-black">Aucune vidéo disponible.</div>;

  const currentVideo = orderedVideos[currentIndex];
  const videoUrl = currentVideo.videoUrl;
  const isUrlValid = videoUrl && /^https?:\/\/.+/.test(videoUrl);

  // ✅ Bloquer uniquement les vidéos du niveau de l’apprenant
const normalize = (str: string) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const currentMonth = normalize(
  new Date().toLocaleString("fr-FR", { month: "long" })
);

const isAvailable =
  completedVideos.has(currentVideo.id) ||
  currentVideo.niveau !== niveau ||
  !currentVideo.mois?.length ||
  currentVideo.mois.some((m) => normalize(m) === currentMonth);



  // Grouper les vidéos par notion pour la sidebar
  const videosByNotion: Record<string, VideoData[]> = {};
  orderedVideos
    .filter((v) => v.niveau === niveau)
    .forEach((v) => {
      v.notions.forEach((n) => {
        if (!videosByNotion[n]) videosByNotion[n] = [];
        videosByNotion[n].push(v);
      });
    });

  const startVideo = () => {
    setFeedback(null);
    setVideoPlaying(true);
    setShowQuiz(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setShuffledQuestions(shuffleQuestionsWithChoices(currentVideo.questions || []));
    setAnswerStatus("none");
    setFadeKey((prev) => prev + 1);
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
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer("");
          setQuizKey((prev) => prev + 1);
        } else {
          setCompletedVideos((prev) => new Set(prev).add(currentVideo.id));
          setTimeout(handleNextVideo, 1000);
        }
      }, 1200);
    } else {
      setFeedback({
        type: "error",
        message:
          "❌ Mauvaise réponse ! Vous devez revoir la vidéo",
      });
      setAnswerStatus("wrong");
      setTimeout(() => {
        setFeedback(null);
        setVideoPlaying(false);
        setShowQuiz(false);
        setCurrentQuestionIndex(0);
        setSelectedAnswer("");
        setAnswerStatus("none");
        setShuffledQuestions(shuffleQuestionsWithChoices(currentVideo.questions || []));
      }, 1800);
    }
  };

  const startEvaluationForNotion = (notion: string) => {
    const videosOfNotion = orderedVideos.filter(
      (v) => v.notions.includes(notion) && completedVideos.has(v.id)
    );

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
    setFadeKey((prev) => prev + 1);
  };

  const handleValidateEvaluationAnswer = () => {
    const currentQ = evaluationQuestions[currentQuestionIndex];
    if (!currentQ) return;

    if (selectedAnswer === currentQ.bonne_reponse) {
      setFeedback({ type: "success", message: "✅ Correct !" });
      setAnswerStatus("correct");
      questionSoundRef.current?.play().catch(() => {});
      setTimeout(() => {
        setFeedback(null);
        setAnswerStatus("none");
        if (currentQuestionIndex < evaluationQuestions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer("");
          setQuizKey((prev) => prev + 1);
        } else {
          setEvaluationMode(false);
          setShowQuiz(false);
          handleNextVideo();
        }
      }, 1200);
    } else {
      setFeedback({
        type: "error",
        message:
          "❌ Mauvaise réponse ! Vous devez revoir la vidéo portant cette question",
      });
      setAnswerStatus("wrong");
      setTimeout(() => {
        setFeedback(null);
        setAnswerStatus("none");
        setEvaluationMode(false);
        setShowQuiz(false);

        const videoToReplay = evaluationVideoQueue.find((v) =>
          v.questions.some((q) => q.id === currentQ.id)
        );
        if (videoToReplay) {
          const videoIndex = orderedVideos.findIndex((v) => v.id === videoToReplay.id);
          if (videoIndex !== -1) {
            setCurrentIndex(videoIndex);
            setVideoPlaying(false);
            setFadeKey((prev) => prev + 1);
          }
        }
      }, 1800);
    }
  };

  const handleNextVideo = () => {
    const nextIndex = currentIndex + 1;

    if (currentVideo.niveau === niveau) {
      setSeenVideosAtLevel((prev) => new Set(prev).add(currentVideo.id));
      setCompletedVideos((prev) => {
        const newSet = new Set(prev);
        newSet.add(currentVideo.id);

        currentVideo.notions.forEach((notion) => {
          const videosOfNotion = orderedVideos.filter(
            (v) => v.niveau === niveau && v.notions.includes(notion)
          );
          const allCompleted = videosOfNotion.every((v) => newSet.has(v.id));

          if (allCompleted) {
            startEvaluationForNotion(notion);
          }
        });

        return newSet;
      });
    }

    if (nextIndex < orderedVideos.length) {
      const nextVideo = orderedVideos[nextIndex];
      if (nextVideo.niveau === niveau && seenVideosAtLevel.has(nextVideo.id)) {
        setCurrentIndex(nextIndex + 1);
        handleNextVideo();
        return;
      }
      setCurrentIndex(nextIndex);
      setVideoPlaying(false);
      setShowQuiz(false);
      setCurrentQuestionIndex(0);
      setSelectedAnswer("");
      setAnswerStatus("none");
      setFadeKey((prev) => prev + 1);
    } else {
      navigate("/matiere", { replace: true });
    }
  };

  return (
  <div className="flex flex-col md:flex-row min-h-screen bg-black text-white">
    {/* Sidebar pour écran moyen et grand */}
    <aside className="hidden md:block w-80 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 p-5 border-r shadow-lg overflow-y-auto">
      <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-6 flex items-center gap-2">
  📚 Parcours – Niveau {titreNiveau}
</h2>


      <ul className="space-y-4">
        {Object.entries(videosByNotion).map(([notion, videos]) => (
          <li key={notion} className="border rounded-lg overflow-hidden">
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
                  {videos.map((vid) => {
  const isActive = orderedVideos[currentIndex]?.id === vid.id;
  const isCompleted = completedVideos.has(vid.id);

  return (
    <li
                          key={vid.id}
                          onClick={() => {
                            const index = orderedVideos.findIndex(
                              (v) => v.id === vid.id
                            );
                            if (index !== -1) setCurrentIndex(index);
                            setOpenNotion(null); // fermer drawer après sélection vidéo
                          }}
                          className={`p-2 rounded-md transition-all border cursor-pointer
                            ${
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

    {/* ✅ Bouton pour petit écran */}
    <button
      className="md:hidden flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg m-4 self-start shadow"
      onClick={() => setOpenNotion("drawer")}
    >
      <List className="w-5 h-5" /> Liste des notions
    </button>

    {/* ✅ Drawer mobile - uniquement pour petit écran */}
<AnimatePresence>
  {openNotion === "drawer" || Object.keys(videosByNotion).includes(openNotion || "") ? (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 bg-black/70 flex justify-end md:hidden" // <-- md:hidden ici
    >
      <div className="w-4/5 max-w-xs bg-white dark:bg-gray-900 h-full flex flex-col shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b dark:border-gray-700">
          <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200">
            📑 Notions
          </h2>
          <button onClick={() => setOpenNotion(null)}>
            <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Liste des notions */}
        <ul className="space-y-4 p-4">
          {Object.entries(videosByNotion).map(([notion, videos]) => (
            <li key={notion} className="border rounded-lg overflow-hidden">
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
                    {videos.map((vid) => {
                      const isActive = orderedVideos[currentIndex]?.id === vid.id;
                      const isCompleted = completedVideos.has(vid.id);

                      return (
                        <li
                          key={vid.id}
                          onClick={() => {
                            const index = orderedVideos.findIndex(
                              (v) => v.id === vid.id
                            );
                            if (index !== -1) setCurrentIndex(index);
                            setOpenNotion(null); // fermer drawer après sélection vidéo
                          }}
                          className={`p-2 rounded-md transition-all border cursor-pointer
                            ${
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

        {/* Bouton Fermer */}
        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={() => setOpenNotion(null)}
            className="w-full bg-red-600 text-white py-2 rounded-lg shadow hover:bg-red-700"
          >
            Fermer
          </button>
        </div>
      </div>
    </motion.div>
  ) : null}
</AnimatePresence>



      <main className="flex-1 flex flex-col items-center justify-start px-4 py-6">
        <div className="w-full max-w-3xl">

         {/* ✅ Bouton Retour aux matières */}
    <div className="flex justify-start mb-4">
      <button
        onClick={() => navigate("/matiere")}
        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
      >
        ⬅️ Retour aux matières
      </button>
    </div>

          {/* Progression */}
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
            <div
              className="h-2 bg-blue-600 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / orderedVideos.length) * 100}%` }}
            />
          </div>

          <h1 className="text-2xl font-bold text-center text-blue-700 dark:text-blue-300 mb-4">
            {currentVideo.titre}
          </h1>

          {/* Vidéo */}
          <AnimatePresence mode="wait">
            {videoPlaying && isUrlValid && (
              <motion.div
                key={`video-${fadeKey}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              >
                {isYouTubeUrl(videoUrl) ? (
                  <ReactPlayer
                    ref={playerRef}
                    url={videoUrl}
                    width="100%"
                    height="480px"
                    playing
                    controls
                    onEnded={() => {
                      setVideoPlaying(false);
                      setFadeKey((prev) => prev + 1);
                      setShowQuiz(true);
                    }}
                  />
                ) : (
                  <video
                    ref={playerRef as any}
                    src={videoUrl}
                    controls
                    autoPlay
                    className="w-full rounded-xl shadow-md border border-gray-300"
                    onEnded={() => {
                      setVideoPlaying(false);
                      setFadeKey((prev) => prev + 1);
                      setShowQuiz(true);
                    }}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bouton ou Message bloqué */}
          <AnimatePresence>
  {!videoPlaying && !showQuiz && (
    isAvailable ? (
      <motion.button
  key={`start-btn-${fadeKey}`}
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.9 }}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.4 }}
  onClick={startVideo}
  className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg 
             hover:bg-green-700 active:bg-green-800 transition-all duration-300"
>
  ▶️ Démarrer la vidéo
</motion.button>

    ) : (
      <motion.div
              key={`locked-${fadeKey}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6 px-4 py-3 rounded-lg bg-yellow-200 text-yellow-900 font-semibold text-center shadow"
            >
              🔒 Cette vidéo sera disponible à partir du mois de {currentVideo.mois?.[0]}
            </motion.div>
    )
  )}
</AnimatePresence>

          {/* Quiz */}
          <AnimatePresence mode="wait">
            {showQuiz && shuffledQuestions.length > 0 && (
              <motion.div
                key={`quiz-${quizKey}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl shadow-md bg-white dark:bg-gray-800 mt-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <p className="font-medium text-lg text-gray-800 dark:text-gray-200">
                    ⏱ Temps restant :
                  </p>
                  <CountdownCircle
                    key={currentQuestionIndex}
                    duration={600}
                    onComplete={() => {
                      setFeedback({
                        type: "error",
                        message:
                          "⏰ Temps écoulé ! Vous devez revoir la vidéo pour continuer",
                      });
                      setVideoPlaying(false);
                      setShowQuiz(false);
                    }}
                  />
                </div>

                <p className="font-medium text-lg text-gray-900 dark:text-gray-100 mb-4">
                  {shuffledQuestions[currentQuestionIndex].question}
                </p>

                <div className="grid gap-4">
                  {shuffledQuestions[currentQuestionIndex].choix.map((opt, idx) => (
                    <motion.label
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay:
 idx * 0.1, duration: 0.3 }}
                      className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors
  ${
    selectedAnswer === opt
      ? answerStatus === "correct"
        ? "bg-green-600 text-white border-green-700"
        : answerStatus === "wrong"
        ? "bg-red-600 text-white border-red-700"
        : "border-blue-500 text-black dark:text-gray-200"
      : "border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-gray-200"
  }`}

                    >
                      <input
                        type="radio"
                        value={opt}
                        checked={selectedAnswer === opt}
                        onChange={() => setSelectedAnswer(opt)}
                        className="accent-blue-600"
                      />
                      {opt}
                    </motion.label>
                  ))}
                </div>

                <button
                  onClick={handleValidateAnswer}
                  disabled={!selectedAnswer}
                  className="mt-4 px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Valider
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {feedback && <FeedbackMessage {...feedback} />}
        </div>
      </main>
    </div>
  );
};

export default RemediationVideo;