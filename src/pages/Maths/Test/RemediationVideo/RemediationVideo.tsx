import React, { useEffect, useState, useRef } from "react";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import api from "@/utils/axios";

import { motion, AnimatePresence } from "framer-motion";

import { Loader2, X, List } from "lucide-react";

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

  exercices?: string[];

  questions: Question[];

  matiere?: string;

  mois?: string[];

  enseignant?: string | null;
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

const cleanUrl = (url?: string) =>
  url ? url.trim().replace(/^"|"$/g, "") : "";

const isYouTubeUrl = (url: string) =>
  url.includes("youtube.com") || url.includes("youtu.be");

const shuffleArray = <T,>(array: T[]): T[] =>
  [...array].sort(() => Math.random() - 0.5);

const normalize = (str: string) =>
  (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const isVideoForLevel = (
  videoNiveau: string,
  userNiveau: string,
  serie?: string
) => {
  if (generalLevels.includes(userNiveau as any)) {
    return videoNiveau === userNiveau;
  }

  if (lyceeLevels.includes(userNiveau as any)) {
    const [level, videoSerie] = videoNiveau.split(" ");

    if (level !== userNiveau) return false;

    if (!serie) return true;

    const allowedSubSeries =
      subSeriesMap[videoSerie as keyof typeof subSeriesMap];

    return !allowedSubSeries || allowedSubSeries.includes(serie);
  }

  return false;
};

/** transform youtube watch/short/youtu.be -> youtube-nocookie embed url */

const getSafeYouTubeUrl = (url: string): string => {
  try {
    if (!url) return "";

    // handle normal watch?v=, youtu.be/ and embed/
    const u = new URL(
      url.startsWith("http") ? url : `https://${url}`
    );

    // watch?v=
    if (
      u.hostname.includes("youtube.com") &&
      u.searchParams.get("v")
    ) {
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
    const prereqVideo = allVideos.find((v) =>
      v.notions.includes(prereqNotion)
    );

    if (!prereqVideo) continue;

    if (prereqVideo.niveau === niveauActuel) {
      if (!seenAtLevel.has(prereqVideo.id)) {
        seenAtLevel.add(prereqVideo.id);
        result.push(prereqVideo);
      }
    } else {
      const sub = expandPrereqs(
        prereqVideo,
        allVideos,
        niveauActuel,
        seenAtLevel
      );

      sub.forEach((v) => {
        if (
          v.niveau !== niveauActuel ||
          !seenAtLevel.has(v.id)
        ) {
          result.push(v);

          if (v.niveau === niveauActuel) {
            seenAtLevel.add(v.id);
          }
        }
      });

      if (!result.includes(prereqVideo)) {
        result.push(prereqVideo);
      }
    }
  }

  return result;
};

const buildLearningQueue = (
  allVideos: VideoData[],
  niveau: string
): VideoData[] => {
  const result: VideoData[] = [];

  const seenAtLevel = new Set<string>();

  const videosByNiveau = [...allVideos].sort((a, b) =>
    a.niveau.localeCompare(b.niveau)
  );

  for (const video of videosByNiveau) {
    const prereqs = expandPrereqs(
      video,
      allVideos,
      niveau,
      seenAtLevel
    );

    prereqs.forEach((v) => {
      if (!result.find((vv) => vv.id === v.id)) {
        result.push(v);

        if (v.niveau === niveau) {
          seenAtLevel.add(v.id);
        }
      }
    });

    if (!result.find((vv) => vv.id === video.id)) {
      result.push(video);

      if (video.niveau === niveau) {
        seenAtLevel.add(video.id);
      }
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
  shuffleArray(questions || []).map((q) => ({
    ...q,
    choix: shuffleArray(q.choix || []),
  }));

/* -------------------- ENSEIGNANT -------------------- */

interface TeacherProfile {
  nom: string;

  prenom: string;

  email: string;

  telephone?: string | null;

  pays_residence?: string | null;

  subjects?: string[];

  teacher_photo?: string | null;
}

/* -------------------- composant principal -------------------- */

const RemediationVideo: React.FC = () => {
  const [timerEnded, setTimerEnded] = useState(false);

  const [timerResetCounter, setTimerResetCounter] = useState(0);

  const location = useLocation();

  const {
    questionsIncorrectes,
    niveauActuel,
    serieActuelle,
  } = location.state || {};

  const {
    niveau: niveauRoute,
    serie,
  } = useParams<{ niveau: string; serie?: string }>();

  const state = location.state as
    | { niveauActuel?: string; matiere?: string }
    | undefined;

  const niveauParam = new URLSearchParams(
    location.search
  ).get("niveau");

  const niveau =
    state?.niveauActuel ||
    niveauParam ||
    niveauRoute ||
    "6e";

  const serieEffective = generalLevels.includes(
    niveau as any
  )
    ? undefined
    : serie;

  const matiere = state?.matiere || "maths";

  const navigate = useNavigate();

  useExitNotifier({ eventType: "remediation" });

  useExitNotifier({ eventType: "videofinish" });

  // états principaux
  const [orderedVideos, setOrderedVideos] = useState<
    VideoData[]
  >([]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(true);

  const [accessMessage, setAccessMessage] = useState<
    string | null
  >(null);

  // profils enseignants
  const [teacherProfiles, setTeacherProfiles] = useState<
    Record<string, TeacherProfile | null>
  >({});

  const [loadingTeachers, setLoadingTeachers] =
    useState(false);

  useEffect(() => {
    if (!niveau) {
      navigate("/", { replace: true });
      return;
    }

    const fetchVideos = async () => {
      try {
        setLoading(true);

        const res = await api.get<VideoData[]>(
          `/api/videos/remediation?niveau=${niveau}`
        );

        const allVideos = Array.isArray(res.data)
          ? res.data
          : [];

        const cleaned = allVideos.map((v) => ({
          ...v,

          videoUrl: cleanUrl(v.videoUrl),

          fichier: v.fichier
            ? v.fichier.trim()
            : "",

          notions: Array.isArray(v.notions)
            ? v.notions
            : [],

          prerequis: Array.isArray(v.prerequis)
            ? v.prerequis
            : [],

          questions: Array.isArray(v.questions)
            ? v.questions
            : [],

          mois: Array.isArray(v.mois)
            ? v.mois
            : [],

          matiere: v.matiere,

          enseignant: v.enseignant,
        }));

        const filtered = cleaned
          .filter((v) =>
            v.matiere
              ? v.matiere.toLowerCase() ===
                matiere.toLowerCase()
              : true
          )
          .filter((v) =>
            isVideoForLevel(
              v.niveau,
              niveau,
              serieEffective
            )
          );

        const queue = buildLearningQueue(
          filtered,
          niveau
        );

        // Séparer les prérequis (niveau différent) et les vidéos normales
        const prereqVideos = cleaned.filter(
          (v) =>
            !isVideoForLevel(
              v.niveau,
              niveau,
              serieEffective
            )
        );

        const mainVideos = queue;

        // Construire la liste finale en respectant l'ordre des notions de la sidebar
        // Regrouper par notion niveau actuel
        const videosByNotion: Record<
          string,
          VideoData[]
        > = {};

        filtered.forEach((v) => {
          (v.notions || []).forEach((n) => {
            if (!videosByNotion[n]) {
              videosByNotion[n] = [];
            }

            // Ajouter prérequis
            v.prerequis.forEach((p) => {
              const prereqVideo = cleaned.find((vid) =>
                vid.notions.includes(p)
              );

              if (
                prereqVideo &&
                !videosByNotion[n].some(
                  (x) => x.id === prereqVideo.id
                )
              ) {
                videosByNotion[n].push(
                  prereqVideo
                );
              }
            });

            // Ajouter vidéo principale
            if (
              !videosByNotion[n].some(
                (x) => x.id === v.id
              )
            ) {
              videosByNotion[n].push(v);
            }
          });
        });

        // Construire la liste finale dans l'ordre réel des notions
        const finalList: VideoData[] = [];

        for (const notion of Object.keys(
          videosByNotion
        )) {
          for (const v of videosByNotion[notion]) {
            if (
              !finalList.some(
                (x) => x.id === v.id
              )
            ) {
              finalList.push(v);
            }
          }
        }

        // Ajouter tous les prérequis présents dans la sidebar
        for (const notion in videosByNotion) {
          for (const prereqVideo of videosByNotion[
            notion
          ]) {
            if (
              !finalList.some(
                (x) => x.id === prereqVideo.id
              )
            ) {
              finalList.push(prereqVideo);
            }
          }
        }

        setOrderedVideos(finalList);

        const savedCompleted =
          localStorage.getItem(
            "completedVideos"
          );

        const completedSet: Set<string> =
          savedCompleted
            ? new Set(JSON.parse(savedCompleted))
            : new Set();

        setCompletedVideos(
          new Set(completedSet)
        );

        // Trouver la première vidéo non complétée
        let firstUnwatchedIndex =
          finalList.findIndex(
            (v) => !completedSet.has(v.id)
          );

        if (firstUnwatchedIndex === -1) {
          firstUnwatchedIndex = 0;
        }

        setCurrentIndex(
          firstUnwatchedIndex
        );

        setLoading(false);
      } catch (err) {
        console.error(
          "Erreur fetch vidéos remediation:",
          err
        );

        setOrderedVideos([]);

        setLoading(false);
      }
    };

    fetchVideos();
  }, [
    niveau,
    matiere,
    serieEffective,
    navigate,
  ]);

  // ============================================================
  // RÉCUPÉRATION DES PROFILS DES ENSEIGNANTS DES VIDÉOS
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const fetchTeacherProfiles = async () => {
      const emails = [
        ...new Set(
          orderedVideos
            .map((video) => video.enseignant)
            .filter(
              (
                email
              ): email is string =>
                typeof email === "string" &&
                email.trim() !== ""
            )
        ),
      ];

      if (!emails.length) {
        if (!cancelled) {
          setTeacherProfiles({});
          setLoadingTeachers(false);
        }

        return;
      }

      setLoadingTeachers(true);

      const profiles: Record<
        string,
        TeacherProfile | null
      > = {};

      await Promise.all(
        emails.map(async (email) => {
          try {
            const response =
              await api.get(
                "/api/teacher/public-profile",
                {
                  params: {
                    email,
                  },
                }
              );

            profiles[email] = response.data;
          } catch (error) {
            console.error(
              `Impossible de récupérer le profil enseignant ${email}`,
              error
            );

            profiles[email] = null;
          }
        })
      );

      if (!cancelled) {
        setTeacherProfiles(profiles);
        setLoadingTeachers(false);
      }
    };

    fetchTeacherProfiles();

    return () => {
      cancelled = true;
    };
  }, [orderedVideos]);

  // lecture + quiz
  const [videoPlaying, setVideoPlaying] =
    useState(false);

  const [showQuiz, setShowQuiz] =
    useState(false);

  const [showCountdown, setShowCountdown] =
    useState(false);

  const [isVideoPlaying, setIsVideoPlaying] =
    useState(false);

  const [
    currentQuestionIndex,
    setCurrentQuestionIndex,
  ] = useState(0);

  const [
    selectedAnswer,
    setSelectedAnswer,
  ] = useState("");

  const [
    shuffledQuestions,
    setShuffledQuestions,
  ] = useState<Question[]>([]);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // UI & progression
  const [
    answerStatus,
    setAnswerStatus,
  ] = useState<
    "none" | "correct" | "wrong"
  >("none");

  const [fadeKey, setFadeKey] =
    useState(0);

  const [quizKey, setQuizKey] =
    useState(0);

  const [
    completedVideos,
    setCompletedVideos,
  ] = useState<Set<string>>(new Set());

  const [
    seenVideosAtLevel,
    setSeenVideosAtLevel,
  ] = useState<Set<string>>(new Set());

  // ============================================================
  // SIDEBAR VIDÉOS
  // ============================================================

  const [
    isSidebarOpen,
    setIsSidebarOpen,
  ] = useState(false);

  const [
    canShowQuiz,
    setCanShowQuiz,
  ] = useState(false);

  // ======================================================
  // 🔝 REVENIR EN HAUT DE LA PAGE
  // ======================================================

  const scrollPageToTop = (
    behavior: ScrollBehavior = "smooth"
  ) => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior,
    });

    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior,
    });

    document.body.scrollTo({
      top: 0,
      left: 0,
      behavior,
    });
  };

  // ============================================================
  // CHANGEMENT DE VIDÉO DEPUIS LA SIDEBAR
  // ============================================================

  const handleVideoChange = (index: number) => {
    if (
      index < 0 ||
      index >= orderedVideos.length
    ) {
      return;
    }

    const video = orderedVideos[index];

    setCurrentIndex(index);

    setVideoPlaying(false);
    setShowQuiz(false);
    setShowCountdown(false);
    setTimerEnded(false);

    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setAnswerStatus("none");

    setShuffledQuestions(
      shuffleQuestionsWithChoices(
        video.questions || []
      )
    );

    setFadeKey((p) => p + 1);

    // Fermer la sidebar sur mobile
    setIsSidebarOpen(false);

    scrollPageToTop();
  };

  useEffect(() => {
    scrollPageToTop("auto");
  }, []);

  useEffect(() => {
    if (!orderedVideos.length) return;

    scrollPageToTop("smooth");
  }, [currentIndex]);

  useEffect(() => {
    if (!showQuiz) return;

    scrollPageToTop("smooth");
  }, [
    currentQuestionIndex,
    showQuiz,
  ]);

  useEffect(() => {
    const savedCompleted =
      localStorage.getItem(
        "completedVideos"
      );

    if (savedCompleted) {
      setCompletedVideos(
        new Set(JSON.parse(savedCompleted))
      );
    }
  }, []);

  useEffect(() => {
    if (!videoPlaying || showQuiz) return;

    requestAnimationFrame(() => {
      scrollPageToTop();
    });
  }, [
    videoPlaying,
    showQuiz,
    fadeKey,
  ]);

  // evaluation
  const [
    evaluationMode,
    setEvaluationMode,
  ] = useState(false);

  const [
    evaluationQuestions,
    setEvaluationQuestions,
  ] = useState<Question[]>([]);

  const [
    evaluationVideoQueue,
    setEvaluationVideoQueue,
  ] = useState<VideoData[]>([]);

  const [
    evaluationIndex,
    setEvaluationIndex,
  ] = useState(0);

  // refs
  const videoRef =
    useRef<HTMLVideoElement | null>(
      null
    );

  const questionSoundRef =
    useRef<HTMLAudioElement | null>(
      null
    );

  // ====== FONCTION handleTimeUp ======

  const handleTimeUp = () => {
    setFeedback({
      type: "error",
      message:
        "⏰ Vous avez épuisé le temps prévu pour cette question!",
    });

    setShowQuiz(false);

    setVideoPlaying(false);

    setShowCountdown(false);

    setCurrentQuestionIndex(0);

    setSelectedAnswer("");

    setAnswerStatus("none");

    setShuffledQuestions(
      shuffleQuestionsWithChoices(
        currentVideo?.questions || []
      )
    );

    setTimeout(() => {
      setFeedback(null);

      setVideoPlaying(true);

      setShowCountdown(true);
    }, 2500);
  };

  // titres
  const currentVideoTitle =
    orderedVideos[currentIndex]?.titre ||
    "";

  const nextVideoTitle =
    orderedVideos[currentIndex + 1]?.titre ||
    null;

  // son click
  useEffect(() => {
    questionSoundRef.current =
      new Audio("/sounds/click.mp3");

    return () => {
      questionSoundRef.current?.pause();

      questionSoundRef.current = null;
    };
  }, []);

  // ====== ÉTAT PLEIN ÉCRAN ======

  const [
    isFullscreen,
    setIsFullscreen,
  ] = useState(false);

  const [
    isLandscape,
    setIsLandscape,
  ] = useState(false);

  const videoContainerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const currentMonth = normalize(
    new Date().toLocaleString(
      "fr-FR",
      { month: "long" }
    )
  );

  // current video & url
  const currentVideo =
    orderedVideos[currentIndex];

  // ✔️ priorité fichier local → sinon YouTube → sinon vide
  const videoUrl =
    currentVideo?.fichier?.trim()
      ? currentVideo.fichier
      : currentVideo?.videoUrl || "";

  const isUrlValid =
    !!videoUrl &&
    /^https?:\/\/.+/.test(videoUrl);

  // Sauvegarder la vidéo courante dans localStorage
  const handleVideoComplete = (
    videoId: string
  ) => {
    localStorage.setItem(
      "lastVideoWatched",
      videoId
    );
  };

  const isPrereq = currentVideo
    ? currentVideo.niveau !== niveau
    : false;

  const isAvailable = !currentVideo
    ? false
    : completedVideos.has(
        currentVideo.id
      ) ||
      isPrereq ||
      currentVideo.niveau !== niveau ||
      !currentVideo.mois?.length ||
      currentVideo.mois.some(
        (m) =>
          normalize(m) === currentMonth
      );

  useEffect(() => {
    const handleFullscreenChange =
      () => {
        if (!document.fullscreenElement) {
          setIsLandscape(false);
        }
      };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () =>
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
  }, []);

  // NOUVEL ALGORITHME :
  // ➜ on ignore totalement les vidéos du niveau de l’apprenant
  // ➜ on garde uniquement les prérequis (niveaux inférieurs)
  // NOUVEL ALGORITHME : lister uniquement les prérequis dans la notion de la vidéo principale

  const videosByNotion: Record<
    string,
    VideoData[]
  > = {};

  orderedVideos
    .filter(
      (v) =>
        v.niveau === niveau &&
        v.notions[0] !== "Exercice"
    )
    .forEach((mainVideo) => {
      (mainVideo.notions || []).forEach(
        (notion) => {
          if (!videosByNotion[notion]) {
            videosByNotion[notion] = [];
          }

          // 🔹 Ajouter uniquement les prérequis selon le titre
          (mainVideo.prerequis || []).forEach(
            (prereqTitle) => {
              const prereqVideo =
                orderedVideos.find(
                  (v) =>
                    v.titre === prereqTitle
                );

              if (
                prereqVideo &&
                !videosByNotion[
                  notion
                ].some(
                  (v) =>
                    v.id === prereqVideo.id
                )
              ) {
                videosByNotion[
                  notion
                ].push(prereqVideo);
              }
            }
          );

          // 🔹 Ajouter uniquement les exercices associés
          const exerciceVideos =
            orderedVideos.filter(
              (v) =>
                mainVideo.exercices?.includes(
                  v.titre
                ) &&
                v.niveau === niveau &&
                !mainVideo.prerequis?.includes(
                  v.titre
                )
            );

          exerciceVideos.forEach(
            (exVideo) => {
              if (
                !videosByNotion[
                  notion
                ].some(
                  (v) =>
                    v.id === exVideo.id
                )
              ) {
                videosByNotion[
                  notion
                ].push(exVideo);
              }
            }
          );
        }
      );
    });

  const notionOrder =
    Object.keys(videosByNotion);

  const [
    focusArea,
    setFocusArea,
  ] = useState<
    "video" | "sidebar"
  >("video");

  const [
    sidebarIndex,
    setSidebarIndex,
  ] = useState(0);

  const sidebarRef =
    useRef<HTMLDivElement | null>(
      null
    );

  useEffect(() => {
    const handleKey = (
      e: KeyboardEvent
    ) => {
      if (
        [
          "ArrowUp",
          "ArrowDown",
        ].includes(e.key)
      ) {
        e.preventDefault();
      }

      if (focusArea === "sidebar") {
        if (e.key === "ArrowUp") {
          setSidebarIndex((prev) =>
            prev > 0
              ? prev - 1
              : Math.max(
                  0,
                  Object.keys(
                    videosByNotion
                  ).length - 1
                )
          );
        }

        if (e.key === "ArrowDown") {
          setSidebarIndex((prev) =>
            prev <
            Object.keys(
              videosByNotion
            ).length -
              1
              ? prev + 1
              : 0
          );
        }

        if (e.key === "Enter") {
          const notions =
            Object.keys(
              videosByNotion
            );

          const notion =
            notions[sidebarIndex];

          if (
            !notion ||
            !videosByNotion[
              notion
            ]?.length
          ) {
            return;
          }

          const targetVideo =
            videosByNotion[
              notion
            ][0];

          const index =
            orderedVideos.findIndex(
              (v) =>
                v.id === targetVideo.id
            );

          if (index !== -1) {
            setCurrentIndex(
              index
            );
          }
        }
      }

      if (
        e.key === "ArrowRight" &&
        focusArea === "video"
      ) {
        setFocusArea("sidebar");

        return;
      }

      if (
        e.key === "ArrowLeft" &&
        focusArea === "sidebar"
      ) {
        setFocusArea("video");

        return;
      }

      if (
        focusArea === "video" &&
        e.key === "Enter"
      ) {
        if (
          !videoPlaying &&
          !showQuiz
        ) {
          setVideoPlaying(true);

          setShowCountdown(true);
        } else if (
          showQuiz &&
          selectedAnswer
        ) {
          handleValidateAnswer();
        }
      }
    };

    window.addEventListener(
      "keydown",
      handleKey
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKey
      );
  }, [
    focusArea,
    sidebarIndex,
    orderedVideos,
    videosByNotion,
    videoPlaying,
    showQuiz,
    selectedAnswer,
  ]);

  const requestFullscreenLandscape = async (
    videoElement?: HTMLDivElement | null
  ) => {
    const el =
      videoElement || videoContainerRef.current;

    if (!el) return;

    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (
        (el as any).webkitRequestFullscreen
      ) {
        (el as any).webkitRequestFullscreen();
      }

      if (
        screen.orientation &&
        (screen.orientation as any).lock
      ) {
        try {
          await (
            screen.orientation as any
          ).lock("landscape");
        } catch (orientationError) {
          console.warn(
            "Verrouillage paysage non disponible :",
            orientationError
          );
        }
      }

      setIsLandscape(true);
      setIsFullscreen(true);
    } catch (err) {
      console.warn(
        "Impossible de passer en plein écran :",
        err
      );
    }
  };

  const exitFullscreenPortrait = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }

      if (
        screen.orientation &&
        screen.orientation.unlock
      ) {
        try {
          screen.orientation.unlock();
        } catch (orientationError) {
          console.warn(
            "Impossible de déverrouiller l'orientation :",
            orientationError
          );
        }
      }

      setIsLandscape(false);
      setIsFullscreen(false);
    } catch (err) {
      console.warn(
        "Impossible de quitter le plein écran :",
        err
      );
    }
  };

  useEffect(() => {
    const handleFullscreenChange =
      () => {
        if (!document.fullscreenElement) {
          setIsLandscape(false);

          setIsFullscreen(false);
        }
      };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () =>
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
  }, []);

  useEffect(() => {
    const handleKey = (
      e: KeyboardEvent
    ) => {
      const tag = (
        e.target as HTMLElement
      )?.tagName;

      if (
        tag === "INPUT" ||
        tag === "TEXTAREA"
      ) {
        return;
      }

      if (
        ![
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "Enter",
        ].includes(e.key)
      ) {
        return;
      }

      e.preventDefault();

      const notions =
        Object.keys(
          videosByNotion
        );

      const currentVideo =
        orderedVideos[currentIndex];

      if (!currentVideo) return;

      let currentNotionIndex =
        notions.findIndex((n) =>
          videosByNotion[n].some(
            (v) =>
              v.id === currentVideo.id
          )
        );

      if (
        currentNotionIndex === -1
      ) {
        currentNotionIndex = 0;
      }

      let vidsInNotion =
        videosByNotion[
          notions[currentNotionIndex]
        ] || [];

      let indexInNotion =
        vidsInNotion.findIndex(
          (v) =>
            v.id === currentVideo.id
        );

      if (
        e.key === "ArrowDown" &&
        vidsInNotion.length
      ) {
        if (
          indexInNotion <
          vidsInNotion.length - 1
        ) {
          setCurrentIndex(
            orderedVideos.findIndex(
              (v) =>
                v.id ===
                vidsInNotion[
                  indexInNotion + 1
                ].id
            )
          );
        } else {
          const nextNotionIndex =
            (currentNotionIndex + 1) %
            notions.length;

          const nextVideo =
            videosByNotion[
              notions[
                nextNotionIndex
              ]
            ][0];

          setCurrentIndex(
            orderedVideos.findIndex(
              (v) =>
                v.id === nextVideo.id
            )
          );
        }
      }

      if (
        e.key === "ArrowUp" &&
        vidsInNotion.length
      ) {
        if (indexInNotion > 0) {
          setCurrentIndex(
            orderedVideos.findIndex(
              (v) =>
                v.id ===
                vidsInNotion[
                  indexInNotion - 1
                ].id
            )
          );
        } else {
          const prevNotionIndex =
            (currentNotionIndex -
              1 +
              notions.length) %
            notions.length;

          const prevVids =
            videosByNotion[
              notions[
                prevNotionIndex
              ]
            ];

          const prevVideo =
            prevVids[
              prevVids.length - 1
            ];

          setCurrentIndex(
            orderedVideos.findIndex(
              (v) =>
                v.id === prevVideo.id
            )
          );
        }
      }

      if (e.key === "ArrowLeft") {
        setFocusArea("video");
      }

      if (e.key === "ArrowRight") {
        setFocusArea("sidebar");
      }

      setTimeout(() => {
        const activeElement =
          document.getElementById(
            `video-${orderedVideos[currentIndex]?.id}`
          );

        activeElement?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 50);
    };

    window.addEventListener(
      "keydown",
      handleKey
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKey
      );
  }, [
    orderedVideos,
    videosByNotion,
    currentIndex,
    focusArea,
  ]);

  const startVideo = () => {
    scrollPageToTop();

    setFeedback(null);

    setVideoPlaying(true);

    setShowQuiz(false);

    setShowCountdown(true);

    setCurrentQuestionIndex(0);

    setSelectedAnswer("");

    setShuffledQuestions(
      shuffleQuestionsWithChoices(
        currentVideo?.questions || []
      )
    );

    setAnswerStatus("none");

    setFadeKey((p) => p + 1);

    if (window.innerWidth < 768) {
      requestFullscreenLandscape(
        videoContainerRef.current
      );
    }
  };

  // ✅ Fonction corrigée : affiche les questions du quiz quand on clique sur “Evaluation”
  const handleGoToQuestions = () => {
    setShowCountdown(false);

    setShowQuiz(true);

    setTimerEnded(true);

    setVideoPlaying(false);

    setCurrentQuestionIndex(0);

    setSelectedAnswer("");

    setAnswerStatus("none");

    setShuffledQuestions(
      shuffleQuestionsWithChoices(
        currentVideo?.questions || []
      )
    );
  };

  const handleValidateAnswer = () => {
    const currentQ =
      shuffledQuestions[
        currentQuestionIndex
      ];

    if (!currentQ) return;

    if (
      selectedAnswer ===
      currentQ.bonne_reponse
    ) {
      setFeedback({
        type: "success",
        message:
          "✅ Bravo ! Réponse correcte",
      });

      setAnswerStatus("correct");

      questionSoundRef.current
        ?.play()
        .catch(() => {});

      setTimeout(() => {
        setFeedback(null);

        setAnswerStatus("none");

        if (
          currentQuestionIndex <
          shuffledQuestions.length - 1
        ) {
          setCurrentQuestionIndex(
            (i) => i + 1
          );

          setSelectedAnswer("");

          setQuizKey((p) => p + 1);
        } else {
          setCompletedVideos(
            (prev) =>
              new Set(prev).add(
                currentVideo.id
              )
          );

          setCompletedVideos(
            (prev) => {
              const newSet = new Set(prev);

              newSet.add(
                currentVideo.id
              );

              localStorage.setItem(
                "completedVideos",
                JSON.stringify([
                  ...newSet,
                ])
              );

              return newSet;
            }
          );

          setTimeout(() => {
            handleNextVideo();
          }, 900);
        }
      }, 900);
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

        setShuffledQuestions(
          shuffleQuestionsWithChoices(
            currentVideo?.questions || []
          )
        );

        scrollPageToTop();

        requestAnimationFrame(() => {
          scrollPageToTop();
        });
      }, 1400);
    }
  };

  const startEvaluationForNotion = (
    notion: string
  ) => {
    const videosOfNotion =
      orderedVideos.filter(
        (v) =>
          v.notions.includes(
            notion
          ) &&
          completedVideos.has(v.id)
      );

    const allQuestions: Question[] =
      [];

    videosOfNotion.forEach((v) => {
      if (
        v.questions &&
        v.questions.length
      ) {
        allQuestions.push(
          ...v.questions
        );
      }
    });

    if (!allQuestions.length)
      return;

    const evalCount = Math.max(
      1,
      Math.floor(
        allQuestions.length / 4
      )
    );

    const shuffled =
      shuffleArray(
        allQuestions
      ).slice(0, evalCount);

    setEvaluationQuestions(
      shuffleQuestionsWithChoices(
        shuffled
      )
    );

    setEvaluationVideoQueue(
      videosOfNotion
    );

    setEvaluationIndex(0);

    setEvaluationMode(true);

    setShowQuiz(true);

    setCurrentQuestionIndex(0);

    setSelectedAnswer("");

    setAnswerStatus("none");

    setFadeKey((p) => p + 1);
  };

  /**
   * handleNextVideo
   */
  const handleNextVideo = () => {
    if (!currentVideo) {
      navigate("/matiere", {
        replace: true,
      });

      return;
    }

    if (currentVideo.niveau === niveau) {
      setSeenVideosAtLevel(
        (prev) =>
          new Set(prev).add(
            currentVideo.id
          )
      );

      setCompletedVideos(
        (prev) => {
          const newSet = new Set(prev);

          newSet.add(
            currentVideo.id
          );

          return newSet;
        }
      );
    }

    const currentNotion =
      (currentVideo.notions &&
        currentVideo.notions[0]) ||
      null;

    let moveToIndex =
      currentIndex + 1;

    if (currentNotion) {
      const videosOfThisNotion =
        orderedVideos.filter(
          (v) =>
            v.notions.includes(
              currentNotion
            ) &&
            v.niveau === niveau
        );

      const allCompleted =
        videosOfThisNotion.length >
          0 &&
        videosOfThisNotion.every(
          (v) =>
            completedVideos.has(
              v.id
            ) ||
            v.id === currentVideo.id
        );

      if (allCompleted) {
        const idxN =
          notionOrder.indexOf(
            currentNotion
          );

        const nextNotion =
          idxN !== -1 &&
          idxN + 1 <
            notionOrder.length
            ? notionOrder[
                idxN + 1
              ]
            : null;

        if (nextNotion) {
          const idxVideo =
            orderedVideos.findIndex(
              (v) =>
                v.notions.includes(
                  nextNotion
                )
            );

          if (idxVideo !== -1) {
            setCurrentIndex(
              idxVideo
            );

            setVideoPlaying(false);

            setShowQuiz(false);

            setCurrentQuestionIndex(
              0
            );

            setSelectedAnswer("");

            setAnswerStatus("none");

            setFadeKey(
              (p) => p + 1
            );

            return;
          }
        }
      }
    }

    const nextIndex =
      currentIndex + 1;

    if (
      nextIndex <
      orderedVideos.length
    ) {
      let candidate = nextIndex;

      while (
        candidate <
          orderedVideos.length &&
        seenVideosAtLevel.has(
          orderedVideos[
            candidate
          ].id
        )
      ) {
        candidate++;
      }

      if (
        candidate <
        orderedVideos.length
      ) {
        setCurrentIndex(
          candidate
        );

        setVideoPlaying(false);

        setShowQuiz(false);

        setCurrentQuestionIndex(
          0
        );

        setSelectedAnswer("");

        setAnswerStatus("none");

        setFadeKey(
          (p) => p + 1
        );

        return;
      }
    }

    navigate("/matiere", {
      replace: true,
    });
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
    return (
      <div className="text-center mt-20 text-white bg-black">
        Aucune vidéo disponible.
      </div>
    );

  const currentTitle =
    currentVideo?.titre || "";

  const nextTitle =
    orderedVideos[
      currentIndex + 1
    ]?.titre ?? null;

  const safeUrl = isYouTubeUrl(
    videoUrl
  )
    ? getSafeYouTubeUrl(videoUrl)
    : videoUrl;

  // ============================================================
  // PROFIL ENSEIGNANT DE LA VIDÉO COURANTE
  // ============================================================

  const currentTeacher =
    currentVideo?.enseignant
      ? teacherProfiles[
          currentVideo.enseignant
        ]
      : null;

  // ============================================================
  // URL DE LA PHOTO DE L'ENSEIGNANT
  // ============================================================

  const currentTeacherPhoto =
    currentTeacher?.teacher_photo
      ? currentTeacher.teacher_photo.startsWith(
          "http"
        )
        ? currentTeacher.teacher_photo
        : (() => {
            const baseUrl =
              api.defaults.baseURL?.replace(
                /\/$/,
                ""
              ) || "";

            const normalizedBase =
              baseUrl.endsWith("/api")
                ? baseUrl.slice(0, -4)
                : baseUrl;

            return `${normalizedBase}/${currentTeacher.teacher_photo.replace(
              /^\//,
              ""
            )}`;
          })()
      : null;

  // ============================================================
  // NOM DE L'ENSEIGNANT
  // ============================================================

  const currentTeacherName =
    currentTeacher
      ? `${currentTeacher.prenom || ""} ${
          currentTeacher.nom || ""
        }`.trim()
      : currentVideo?.enseignant || "";

  // ============================================================
  // OUVRIR LE PROFIL DE L'ENSEIGNANT
  // ============================================================

  const handleTeacherProfile = () => {
    const teacherEmail =
      currentTeacher?.email ||
      currentVideo?.enseignant;

    if (!teacherEmail) {
      return;
    }

    navigate(
      `/enseignant/profil/${encodeURIComponent(
        teacherEmail
      )}`
    );
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-black text-white">
      {accessMessage && (
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: -20,
          }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-center"
        >
          {accessMessage}
        </motion.div>
      )}

      {/* ========================================================
          BOUTON MOBILE POUR OUVRIR LA SIDEBAR
      ======================================================== */}

      <button
        type="button"
        className="lg:hidden flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg m-4 self-start shadow hover:bg-blue-700 transition"
        onClick={() =>
          setIsSidebarOpen(true)
        }
      >
        <List className="w-5 h-5" />
        Liste des vidéos
      </button>

      {/* ========================================================
          SIDEBAR DES VIDEOS
      ======================================================== */}

      <aside
        className={`lg:block ${
          isSidebarOpen ? "block" : "hidden"
        } w-full lg:w-80 shrink-0`}
      >
        <div className="sticky top-24 p-4 lg:p-5">
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">

            {/* HEADER SIDEBAR */}
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between gap-3">

                <div>
                  <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">
                    Vidéos
                  </h3>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {orderedVideos.length} vidéo
                    {orderedVideos.length > 1
                      ? "s"
                      : ""}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setIsSidebarOpen(false)
                  }
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>

              </div>
            </div>

            {/* LISTE */}
            <div className="max-h-[calc(100vh-180px)] overflow-y-auto p-3 space-y-2">

              {orderedVideos.map(
                (video, index) => {

                  const isActive =
                    index === currentIndex;

                  const isCompleted =
                    completedVideos.has(
                      video.id
                    );

                  const teacher =
                    video.enseignant
                      ? teacherProfiles[
                          video.enseignant
                        ]
                      : null;

                  const teacherPhoto =
                    teacher?.teacher_photo
                      ? teacher.teacher_photo.startsWith(
                          "http"
                        )
                        ? teacher.teacher_photo
                        : (() => {
                            const baseUrl =
                              api.defaults.baseURL?.replace(
                                /\/$/,
                                ""
                              ) || "";

                            const normalizedBase =
                              baseUrl.endsWith("/api")
                                ? baseUrl.slice(0, -4)
                                : baseUrl;

                            return `${normalizedBase}/${teacher.teacher_photo.replace(
                              /^\//,
                              ""
                            )}`;
                          })()
                      : null;

                  const teacherName =
                    teacher
                      ? `${teacher.prenom || ""} ${
                          teacher.nom || ""
                        }`.trim()
                      : video.enseignant || "";

                  return (
                    <div
                      key={video.id}
                      id={`video-${video.id}`}
                      className={`rounded-2xl border transition-all ${
                        isActive
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : isCompleted
                          ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                      }`}
                    >

                      {/* VIDEO */}
                      <button
                        type="button"
                        onClick={() =>
                          handleVideoChange(
                            index
                          )
                        }
                        className="w-full text-left p-4"
                      >
                        <div className="flex items-start gap-3">

                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                              isActive
                                ? "bg-blue-600 text-white"
                                : isCompleted
                                ? "bg-green-600 text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                            }`}
                          >
                            {index + 1}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p
                              className={`font-bold ${
                                isActive
                                  ? "text-blue-700 dark:text-blue-300"
                                  : "text-gray-900 dark:text-gray-100"
                              }`}
                            >
                              {video.titre}
                            </p>

                            {isCompleted && (
                              <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-semibold">
                                ✓ Vidéo terminée
                              </p>
                            )}
                          </div>

                          {isActive && (
                            <span className="text-blue-600 shrink-0">
                              🔵
                            </span>
                          )}

                        </div>
                      </button>

                      {/* ENSEIGNANT SIDEBAR */}
                      {video.enseignant && (
                        <div className="px-4 pb-4 pt-0">

                          <div className="flex items-center gap-2">

                            {/* PHOTO CLIQUABLE */}
                            <button
                              type="button"
                              onClick={
                                () => {
                                  const teacherEmail =
                                    teacher?.email ||
                                    video.enseignant;

                                  if (!teacherEmail) {
                                    return;
                                  }

                                  navigate(
                                    `/enseignant/profil/${encodeURIComponent(
                                      teacherEmail
                                    )}`
                                  );
                                }
                              }
                              className="shrink-0 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
                              title="Voir le profil de l'enseignant"
                            >
                              {teacherPhoto ? (
                                <img
                                  src={
                                    teacherPhoto
                                  }
                                  alt={
                                    teacherName
                                  }
                                  className="w-8 h-8 rounded-full object-cover border border-blue-500 hover:ring-2 hover:ring-blue-400 transition-all"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm hover:ring-2 hover:ring-blue-400 transition-all">
                                  👨‍🏫
                                </div>
                              )}
                            </button>

                            <div className="min-w-0 flex-1">

                              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                Enseignant
                              </p>

                              {/* NOM CLIQUABLE */}
                              <button
                                type="button"
                                onClick={
                                  () => {
                                    const teacherEmail =
                                      teacher?.email ||
                                      video.enseignant;

                                    if (!teacherEmail) {
                                      return;
                                    }

                                    navigate(
                                      `/enseignant/profil/${encodeURIComponent(
                                        teacherEmail
                                      )}`
                                    );
                                  }
                                }
                                className="text-xs font-semibold text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 hover:underline truncate text-left focus:outline-none"
                                title="Voir le profil de l'enseignant"
                              >
                                {teacherName}
                              </button>

                            </div>

                          </div>

                        </div>
                      )}

                    </div>
                  );
                }
              )}

            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================
          MAIN
      ======================================================== */}

      <main className="flex-1 flex flex-col items-center justify-start px-4 py-6">
        <div className="w-full max-w-3xl">

          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
            <div
              className="h-2 bg-blue-600 rounded-full transition-all"
              style={{
                width: `${
                  ((currentIndex + 1) /
                    orderedVideos.length) *
                  100
                }%`,
              }}
            />
          </div>

          <h1 className="text-2xl font-bold text-center text-blue-700 dark:text-blue-300 mb-4">
            {currentTitle}
          </h1>

          {/* ============================================================
              ENSEIGNANT DE LA VIDÉO COURANTE
          ============================================================ */}

          {currentVideo?.enseignant && (
            <div className="mb-5 flex justify-center">

              <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg p-4">

                <div className="flex items-center gap-4">

                  {/* ==================================================
                      PHOTO CLIQUABLE
                  ================================================== */}

                  <button
                    type="button"
                    onClick={
                      handleTeacherProfile
                    }
                    disabled={!currentTeacher}
                    className="shrink-0 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 disabled:cursor-default"
                    title={
                      currentTeacher
                        ? "Voir le profil de l'enseignant"
                        : "Profil enseignant en cours de chargement"
                    }
                  >
                    {currentTeacherPhoto ? (
                      <img
                        src={
                          currentTeacherPhoto
                        }
                        alt={
                          currentTeacherName
                        }
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow hover:ring-4 hover:ring-blue-300 dark:hover:ring-blue-800 transition-all"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl hover:ring-4 hover:ring-blue-300 dark:hover:ring-blue-800 transition-all">
                        👨‍🏫
                      </div>
                    )}
                  </button>

                  {/* ==================================================
                      NOM DE L'ENSEIGNANT
                  ================================================== */}

                  <div className="min-w-0 flex-1 text-left">

                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Enseignant de cette vidéo
                    </p>

                    {/* NOM CLIQUABLE */}

                    <button
                      type="button"
                      onClick={
                        handleTeacherProfile
                      }
                      disabled={!currentTeacher}
                      className="font-bold text-lg text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 hover:underline transition text-left focus:outline-none disabled:no-underline disabled:cursor-default"
                      title={
                        currentTeacher
                          ? "Voir le profil de l'enseignant"
                          : undefined
                      }
                    >
                      {currentTeacherName}
                    </button>

                    {/* CHARGEMENT DU PROFIL */}

                    {!currentTeacher &&
                      loadingTeachers && (
                        <p className="text-xs text-gray-400 mt-2">
                          Chargement du profil de l'enseignant...
                        </p>
                      )}

                  </div>

                </div>

              </div>

            </div>
          )}

          {/* video player area */}
          <AnimatePresence mode="wait">

            {/* ✅ VIDEO */}
            {!showQuiz &&
              videoPlaying &&
              isUrlValid && (
                <motion.div
                  key={`video-${fadeKey}`}
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.6,
                  }}
                  className="relative rounded-xl overflow-hidden shadow-2xl w-full my-4"
                >

                  {/* 🕒 Countdown */}
                  <div className="flex flex-col items-center mb-3">
                    <CountdownCircle
                      key={`${fadeKey}-${timerResetCounter}`}
                      duration={5}
                      size={80}
                      strokeWidth={6}
                      onComplete={() =>
                        setTimerEnded(
                          true
                        )
                      }
                    />

                    <span className="text-sm text-gray-400 mt-1">
                      Temps restant
                    </span>
                  </div>

                  {/* 🎥 Zone vidéo */}
                  <div
                    ref={
                      videoContainerRef
                    }
                    className={`
                      relative
                      bg-black
                      overflow-hidden
                      w-full
                      rounded-xl
                      ${
                        isFullscreen
                          ? "fixed inset-0 z-[9999] w-screen h-[100dvh] max-w-none max-h-none rounded-none"
                          : "h-full"
                      }
                    `}
                    style={
                      isFullscreen
                        ? {
                            width: "100vw",
                            height: "100dvh",
                            maxWidth: "100vw",
                            maxHeight: "100dvh",
                          }
                        : undefined
                    }
                  >

                    {isYouTubeUrl(
                      videoUrl
                    ) ? (
                      <iframe
                        key={fadeKey}
                        src={safeUrl}
                        title={
                          currentVideoTitle
                        }
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        sandbox="allow-scripts allow-same-origin"
                        className={`
                          block
                          bg-black
                          border-0
                          ${
                            isFullscreen
                              ? "w-full h-full max-w-full max-h-full object-contain"
                              : "w-full aspect-video rounded-xl shadow-lg border border-gray-700"
                          }
                        `}
                        style={
                          isFullscreen
                            ? {
                                width: "100%",
                                height: "100%",
                                maxWidth: "100%",
                                maxHeight: "100%",
                              }
                            : undefined
                        }
                      />
                    ) : (
                      <video
                        key={fadeKey}
                        ref={videoRef}
                        src={videoUrl}
                        controls
                        autoPlay
                        playsInline
                        className={`
                          block
                          bg-black
                          ${
                            isFullscreen
                              ? "w-full h-full max-w-full max-h-full object-contain"
                              : "w-full rounded-xl shadow-md border border-gray-300"
                          }
                        `}
                        style={
                          isFullscreen
                            ? {
                                width: "100%",
                                height: "100%",
                                maxWidth: "100%",
                                maxHeight: "100%",
                                objectFit: "contain",
                              }
                            : undefined
                        }
                        onTimeUpdate={() => {
                          if (
                            !currentVideo ||
                            !videoRef.current
                          ) {
                            return;
                          }

                          localStorage.setItem(
                            `lastVideo_${matiere}_${currentVideo.id}`,
                            JSON.stringify(
                              {
                                position:
                                  videoRef
                                    .current
                                    .currentTime,
                              }
                            )
                          );
                        }}
                        onEnded={() => {
                          setVideoPlaying(
                            false
                          );

                          setFadeKey(
                            (p) => p + 1
                          );
                        }}
                        onLoadedMetadata={() => {
                          if (
                            !currentVideo ||
                            !videoRef.current
                          ) {
                            return;
                          }

                          const saved =
                            localStorage.getItem(
                              `lastVideo_${matiere}_${currentVideo.id}`
                            );

                          if (saved) {
                            const parsed =
                              JSON.parse(
                                saved
                              );

                            if (
                              parsed.position
                            ) {
                              videoRef.current.currentTime =
                                parsed.position;
                            }
                          }
                        }}
                      />
                    )}

                    {/* 🔘 Bouton plein écran */}
                    <div className="absolute bottom-4 right-4">
                      <button
                        onClick={() => {
                          if (isFullscreen) {
                            exitFullscreenPortrait();
                          } else {
                            requestFullscreenLandscape(
                              videoContainerRef.current
                            );
                          }
                        }}
                        className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700"
                      >
                        {isFullscreen
                          ? "↩️ Réduire l'écran"
                          : "↔️ Plein écran"}
                      </button>
                    </div>
                  </div>

                  {/* Bouton passer au quiz */}
                  {timerEnded && (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={
                          handleGoToQuestions
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all"
                      >
                        Evaluation
                      </button>
                    </div>
                  )}

                </motion.div>
              )}

            {/* ============================================================
                ✅ QUIZ
            ============================================================ */}

            {showQuiz &&
              shuffledQuestions.length >
                0 && (
                <motion.div
                  key={`quiz-${quizKey}`}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -20,
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                  className="w-full max-w-3xl mx-auto mt-6 p-6 border border-gray-300 dark:border-gray-700 rounded-2xl shadow-xl bg-white dark:bg-gray-900"
                >

                  <div className="flex justify-between items-start mb-4">
                    <p className="font-medium text-lg text-gray-800 dark:text-gray-200">
                      ⏱ Temps restant :
                    </p>

                    <CountdownCircle
                      key={
                        currentQuestionIndex
                      }
                      duration={90}
                      onComplete={() => {
                        setFeedback({
                          type: "error",
                          message:
                            "⏰ Temps prévu écoulé!",
                        });

                        setVideoPlaying(
                          true
                        );

                        setShowQuiz(
                          true
                        );

                        setTimerEnded(
                          true
                        );

                        setTimerResetCounter(
                          (p) => p + 1
                        );

                        setFadeKey(
                          (p) => p + 1
                        );
                      }}
                    />
                  </div>

                  <motion.div
                    key={
                      shuffledQuestions[
                        currentQuestionIndex
                      ].id
                    }
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.4,
                    }}
                    className="space-y-5"
                  >

                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {
                        shuffledQuestions[
                          currentQuestionIndex
                        ].question
                      }
                    </h2>

                    <div className="grid gap-4 mt-4">
                      {shuffledQuestions[
                        currentQuestionIndex
                      ].choix.map(
                        (
                          opt,
                          idx
                        ) => {
                          const isSelected =
                            selectedAnswer ===
                            opt;

                          const isCorrect =
                            answerStatus ===
                              "correct" &&
                            isSelected;

                          const isWrong =
                            answerStatus ===
                              "wrong" &&
                            isSelected;

                          return (
                            <motion.label
                              key={
                                idx
                              }
                              initial={{
                                opacity: 0,
                                y: 10,
                              }}
                              animate={{
                                opacity: 1,
                                y: 0,
                              }}
                              transition={{
                                delay:
                                  idx *
                                  0.05,
                                duration:
                                  0.25,
                              }}
                              className={`flex items-center gap-3 p-4 border rounded-lg shadow-sm cursor-pointer transition text-base ${
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
                                value={
                                  opt
                                }
                                checked={
                                  isSelected
                                }
                                onChange={() =>
                                  setSelectedAnswer(
                                    opt
                                  )
                                }
                                className="accent-blue-600 scale-125"
                              />

                              <span>
                                {
                                  opt
                                }
                              </span>

                            </motion.label>
                          );
                        }
                      )}
                    </div>

                    <div className="flex justify-end mt-6">
                      <button
                        onClick={
                          handleValidateAnswer
                        }
                        disabled={
                          !selectedAnswer
                        }
                        className={`px-6 py-2 rounded-full shadow transition-all text-white text-base ${
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
            {!videoPlaying &&
              !isUrlValid &&
              !showQuiz &&
              !isAvailable && (
                <motion.div
                  key={`locked-${fadeKey}`}
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  className="mt-6 px-4 py-3 rounded-lg bg-yellow-200 text-yellow-900 font-semibold text-center shadow"
                >
                  🔒 Cette vidéo sera
                  disponible à partir du
                  mois de{" "}
                  {
                    currentVideo
                      ?.mois?.[0]
                  }
                </motion.div>
              )}

            {/* START BUTTON */}
            {!videoPlaying &&
              !showQuiz &&
              isAvailable && (
                <motion.button
                  key={`start-btn-${fadeKey}`}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                  }}
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  transition={{
                    duration: 0.4,
                  }}
                  onClick={() => {
                    scrollPageToTop();

                    setVideoPlaying(
                      true
                    );

                    setTimerEnded(
                      false
                    );

                    setTimerResetCounter(
                      (p) => p + 1
                    );

                    setCurrentQuestionIndex(
                      0
                    );

                    setSelectedAnswer(
                      ""
                    );

                    setAnswerStatus(
                      "none"
                    );

                    setShuffledQuestions(
                      shuffleQuestionsWithChoices(
                        currentVideo?.questions ||
                          []
                      )
                    );
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-700 active:bg-green-800 transition-all duration-300"
                >
                  ▶️ Démarrer la vidéo
                </motion.button>
              )}

          </AnimatePresence>

          {feedback && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
              }}
              className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-4 rounded-xl shadow-lg z-50 ${
                feedback.type ===
                "success"
                  ? "bg-green-500"
                  : "bg-red-500"
              } text-white font-semibold text-lg text-center`}
            >
              {feedback.message}
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
};

export default RemediationVideo;