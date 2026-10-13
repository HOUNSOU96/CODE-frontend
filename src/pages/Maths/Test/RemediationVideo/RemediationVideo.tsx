import React, {
  useEffect,
  useState,
  useRef,
} from "react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "@/utils/axios";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  Loader2,
  X,
  List,
  Brain,
} from "lucide-react";

import CountdownCircle from "@/components/CountdownCircle";

import { useExitNotifier } from "@/hooks/useExitNotifier";

import {
  getOfflineData,
  saveOfflineData,
  STORES,
} from "@/offline/offlineDB";

/* ============================================================
   TYPES
============================================================ */

interface Question {
  id: string;
  question: string;
  choix: string[];
  bonne_reponse: string;
  duration?: number;
  notion?: string;
  niveau?: string;
  matiere?: string;
  serie?: string | string[] | null;
  enseignant?: string | null;
  [key: string]: any;
}

interface VideoData {
  id: string;
  titre: string;
  niveau: string;
  fichier?: string;
  videoUrl?: string;
  notions: string[];
  prerequis: string[];
  exercices?: string[];
  questions: Question[];
  matiere?: string;
  serie?: string | string[] | null;
  mois?: string[];
  enseignant?: string | null;
  [key: string]: any;
}

interface TeacherProfile {
  email?: string;
  nom?: string;
  prenom?: string;
  teacher_photo?: string;
  [key: string]: any;
}

interface PendingExplanation {
  question: Question;
  reponseUtilisateur: string;
  bonneReponse: string;
  correcte: boolean;
  notion: string;
  niveau: string;
  matiere: string;
  enseignant?: string | null;
}

/* ============================================================
   CONSTANTES
============================================================ */

const generalLevels = [
  "6e",
  "5e",
  "4e",
  "3e",
];

const lyceeLevels = [
  "2nde",
  "1ere",
  "tle",
];

const subSeriesMap: Record<
  string,
  string[]
> = {
  A: ["A1", "A2"],
  F: ["F1", "F2", "F3", "F4"],
  G: ["G1", "G2", "G3"],
};

/* ============================================================
   NORMALISATION
============================================================ */

const normalize = (
  value: any
): string =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const normalizeMatiere = (
  value: any
): string => {
  const normalized = normalize(value);

  if (
    normalized === "mathematiques" ||
    normalized === "mathematique" ||
    normalized === "math"
  ) {
    return "maths";
  }

  return normalized;
};

const normalizeNiveau = (
  value: any
): string => {
  const normalized = normalize(value);

  const map: Record<string, string> = {
    "6eme": "6e",
    "6e": "6e",
    "5eme": "5e",
    "5e": "5e",
    "4eme": "4e",
    "4e": "4e",
    "3eme": "3e",
    "3e": "3e",
    seconde: "2nde",
    "2nde": "2nde",
    "1ere": "1ere",
    premiere: "1ere",
    terminale: "tle",
    terminal: "tle",
    tle: "tle",
  };

  return map[normalized] || normalized;
};

const normalizeSerie = (
  value: any
): string => {
  const normalized = normalize(value);

  if (!normalized) {
    return "";
  }

  return normalized.toUpperCase();
};

const getVideoSeries = (
  video: VideoData
): string[] => {
  const serie = video.serie;

  if (Array.isArray(serie)) {
    return serie
      .map(normalizeSerie)
      .filter(Boolean);
  }

  if (
    typeof serie === "string" &&
    serie.trim()
  ) {
    return serie
      .split(/[,\s;/|]+/)
      .map(normalizeSerie)
      .filter(Boolean);
  }

  return [];
};

/* ============================================================
   COMPATIBILITÉ VIDÉO
============================================================ */

const isVideoForSubject = (
  video: VideoData,
  matiere: string
): boolean => {
  if (!video.matiere) {
    return true;
  }

  return (
    normalizeMatiere(video.matiere) ===
    normalizeMatiere(matiere)
  );
};

const isVideoForLevel = (
  video: VideoData,
  niveau: string,
  serie?: string
): boolean => {
  const requestedLevel =
    normalizeNiveau(niveau);

  const videoLevel =
    normalizeNiveau(video.niveau);

  if (
    generalLevels.includes(
      requestedLevel
    )
  ) {
    return videoLevel === requestedLevel;
  }

  if (
    videoLevel !== requestedLevel &&
    !(
      requestedLevel === "tle" &&
      videoLevel === "terminale"
    )
  ) {
    return false;
  }

  if (!serie) {
    return true;
  }

  const requestedSerie =
    normalizeSerie(serie);

  const videoSeries =
    getVideoSeries(video);

  if (!videoSeries.length) {
    return true;
  }

  if (
    videoSeries.includes(
      requestedSerie
    )
  ) {
    return true;
  }

  const parentSerie =
    requestedSerie.charAt(0);

  if (
    subSeriesMap[parentSerie]?.includes(
      requestedSerie
    )
  ) {
    return videoSeries.some(
      (s) =>
        s === parentSerie ||
        subSeriesMap[parentSerie]?.includes(
          s
        )
    );
  }

  return false;
};

/* ============================================================
   URLS
============================================================ */

const cleanUrl = (
  value?: string
): string => {
  if (!value) {
    return "";
  }

  return value.trim();
};

const isYouTubeUrl = (
  value: string
): boolean => {
  return /(?:youtube\.com|youtu\.be)/i.test(
    value
  );
};

const getSafeYouTubeUrl = (
  url: string
): string => {
  try {
    const parsed = new URL(url);

    let videoId = "";

    if (
      parsed.hostname.includes(
        "youtu.be"
      )
    ) {
      videoId =
        parsed.pathname.replace(
          /^\/+/,
          ""
        );
    } else {
      videoId =
        parsed.searchParams.get(
          "v"
        ) || "";

      if (
        !videoId &&
        parsed.pathname.includes(
          "/embed/"
        )
      ) {
        videoId =
          parsed.pathname
            .split("/embed/")[1]
            ?.split("/")[0] || "";
      }
    }

    if (!videoId) {
      return url;
    }

    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
  } catch {
    return url;
  }
};

/* ============================================================
   OUTILS
============================================================ */

const shuffleArray = <T,>(
  array: T[]
): T[] => {
  const result = [...array];

  for (
    let i = result.length - 1;
    i > 0;
    i--
  ) {
    const j = Math.floor(
      Math.random() * (i + 1)
    );

    [
      result[i],
      result[j],
    ] = [
      result[j],
      result[i],
    ];
  }

  return result;
};

const shuffleQuestionsWithChoices = (
  questions: Question[]
): Question[] => {
  return shuffleArray(
    questions || []
  ).map((question) => ({
    ...question,
    choix: shuffleArray(
      question.choix || []
    ),
  }));
};

const expandPrereqs = (
  videos: VideoData[]
): VideoData[] => {
  return videos;
};

const buildLearningQueue = (
  videos: VideoData[],
  niveau: string
): VideoData[] => {
  const currentLevel =
    normalizeNiveau(niveau);

  const prerequisites = videos.filter(
    (video) =>
      normalizeNiveau(video.niveau) !==
      currentLevel
  );

  const currentLevelVideos =
    videos.filter(
      (video) =>
        normalizeNiveau(video.niveau) ===
        currentLevel
    );

  return [
    ...prerequisites,
    ...currentLevelVideos,
  ];
};

/* ============================================================
   CACHE OFFLINE
============================================================ */

interface CachedRemediationVideos {
  id: string;
  niveau: string;
  matiere: string;
  serie: string;
  videos: VideoData[];
  cachedAt: number;
}

interface CachedTeacherProfile
  extends TeacherProfile {
  id: string;
  cachedAt: number;
}

const buildVideosCacheId = (
  matiere: string,
  niveau: string,
  serie?: string
): string =>
  `remediation_${normalizeMatiere(
    matiere
  )}_${normalizeNiveau(
    niveau
  )}_${normalizeSerie(
    serie || ""
  ) || "none"}`;

const buildTeacherCacheId = (
  email: string
): string =>
  `teacher_${normalize(email)}`;

/* ============================================================
   COMPOSANT
============================================================ */

const RemediationVideo: React.FC =
  () => {
    const [
      timerEnded,
      setTimerEnded,
    ] = useState(false);

    const [
      timerResetCounter,
      setTimerResetCounter,
    ] = useState(0);

    const location =
      useLocation();

    const navigate =
      useNavigate();

    const {
      matiere: matiereRoute,
      niveau: niveauRoute,
      serie: serieRoute,
    } = useParams<{
      matiere?: string;
      niveau?: string;
      serie?: string;
    }>();

    /* ========================================================
       ÉTAT TRANSMIS PAR LA PAGE PRÉCÉDENTE
    ======================================================== */

    const routeState =
      location.state as
        | {
            matiereActuelle?: string;
            matiere?: string;
            niveauActuel?: string;
            serieActuelle?: string;
            questionsIncorrectes?: Question[];
            resultats?: any;
          }
        | undefined;

    /* ========================================================
       PARAMÈTRES
    ======================================================== */

    const params =
      new URLSearchParams(
        location.search
      );

    const niveauParam =
      params.get("niveau") || "";

    const niveau =
      normalizeNiveau(
        routeState?.niveauActuel ||
          niveauParam ||
          niveauRoute ||
          ""
      );

    const matiere =
      routeState?.matiereActuelle ||
      routeState?.matiere ||
      routeState?.resultats?.matiere ||
      matiereRoute ||
      "maths";

    const serie =
      routeState?.serieActuelle ||
      serieRoute ||
      "";

    const serieEffective =
      generalLevels.includes(
        niveau as any
      )
        ? undefined
        : normalizeSerie(serie);

    const completedStorageKey =
      `completedVideos_${normalizeMatiere(
        matiere
      )}`;

    /* ========================================================
       NOTIFICATIONS SORTIE
    ======================================================== */

    useExitNotifier({
  eventType: "remediation",
});

useExitNotifier({
  eventType: "videofinish",
});

    /* ========================================================
       VALIDATION PARAMÈTRES
    ======================================================== */

    useEffect(() => {
      if (!niveau || !matiere) {
        navigate("/", {
          replace: true,
        });
      }
    }, [
      niveau,
      matiere,
      navigate,
    ]);

    /* ========================================================
       VIDÉOS
    ======================================================== */

    const [
      orderedVideos,
      setOrderedVideos,
    ] = useState<VideoData[]>([]);

    const [
      currentIndex,
      setCurrentIndex,
    ] = useState(0);

    const [
      loading,
      setLoading,
    ] = useState(true);

    const [
      accessMessage,
      setAccessMessage,
    ] = useState<string | null>(
      null
    );

    /* ========================================================
       ENSEIGNANTS
    ======================================================== */

    const [
      teacherProfiles,
      setTeacherProfiles,
    ] = useState<
      Record<
        string,
        TeacherProfile | null
      >
    >({});

    const [
      loadingTeachers,
      setLoadingTeachers,
    ] = useState(false);

    const [
      pendingExplanation,
      setPendingExplanation,
    ] =
      useState<PendingExplanation | null>(
        null
      );

    /* ========================================================
       CHARGEMENT DES VIDÉOS
    ======================================================== */

    useEffect(() => {
      let cancelled = false;

      if (!niveau || !matiere) {
        return;
      }

      const cacheId =
        buildVideosCacheId(
          matiere,
          niveau,
          serieEffective
        );

      const loadVideos =
        async () => {
          setLoading(true);
          setAccessMessage(null);

          let apiVideos: VideoData[] =
            [];

          try {
            if (
              navigator.onLine
            ) {
              const response =
                await api.get(
                  `/api/videos/remediation?niveau=${encodeURIComponent(
                    niveau
                  )}`
                );

              const rawVideos =
                Array.isArray(
                  response.data
                )
                  ? response.data
                  : Array.isArray(
                      response.data?.videos
                    )
                  ? response.data
                      .videos
                  : [];

              apiVideos =
                rawVideos.map(
                  (
                    v: any
                  ): VideoData => ({
                    ...v,
                    videoUrl:
                      cleanUrl(
                        v.videoUrl
                      ),
                    fichier:
                      v.fichier
                        ? String(
                            v.fichier
                          ).trim()
                        : "",
                    notions:
                      Array.isArray(
                        v.notions
                      )
                        ? v.notions
                        : [],
                    prerequis:
                      Array.isArray(
                        v.prerequis
                      )
                        ? v.prerequis
                        : [],
                    questions:
                      Array.isArray(
                        v.questions
                      )
                        ? v.questions
                        : [],
                    exercices:
                      Array.isArray(
                        v.exercices
                      )
                        ? v.exercices
                        : [],
                    mois:
                      Array.isArray(
                        v.mois
                      )
                        ? v.mois
                        : [],
                    matiere:
                      v.matiere,
                    serie:
                      v.serie,
                    enseignant:
                      v.enseignant,
                  })
                );

              try {
                await saveOfflineData(
                  STORES.documents,
                  {
                    id: cacheId,
                    type:
                      "remediation_videos",
                    niveau,
                    matiere:
                      normalizeMatiere(
                        matiere
                      ),
                    serie:
                      serieEffective ||
                      "",
                    videos:
                      apiVideos,
                    cachedAt:
                      Date.now(),
                  } as any
                );
              } catch (
                cacheError
              ) {
                console.warn(
                  "Impossible de mettre les vidéos en cache offline :",
                  cacheError
                );
              }
            }
          } catch (error) {
            console.warn(
              "API vidéos indisponible. Tentative avec le cache offline.",
              error
            );
          }

          if (
            !apiVideos.length
          ) {
            try {
              const cached =
                await getOfflineData<CachedRemediationVideos>(
                  STORES.documents,
                  cacheId
                );

              if (
                cached?.videos?.length
              ) {
                apiVideos =
                  cached.videos;

                if (
                  !navigator.onLine
                ) {
                  setAccessMessage(
                    "Mode hors connexion : les vidéos disponibles précédemment sont utilisées."
                  );
                }
              }
            } catch (
              cacheError
            ) {
              console.warn(
                "Impossible de lire le cache des vidéos :",
                cacheError
              );
            }
          }

          if (cancelled) {
            return;
          }

          if (!apiVideos.length) {
            setOrderedVideos(
              []
            );
            setLoading(false);
            return;
          }

          const filtered =
            apiVideos.filter(
              (video) =>
                isVideoForSubject(
                  video,
                  matiere
                ) &&
                isVideoForLevel(
                  video,
                  niveau,
                  serieEffective
                )
            );

          if (!filtered.length) {
            setOrderedVideos(
              []
            );
            setLoading(false);
            return;
          }

          const learningQueue =
            buildLearningQueue(
              expandPrereqs(
                filtered
              ),
              niveau
            );

          const videosByNotionCache =
            new Map<
              string,
              VideoData[]
            >();

          learningQueue.forEach(
            (video) => {
              (
                video.notions ||
                []
              ).forEach(
                (notion) => {
                  if (
                    !videosByNotionCache.has(
                      notion
                    )
                  ) {
                    videosByNotionCache.set(
                      notion,
                      []
                    );
                  }

                  videosByNotionCache
                    .get(
                      notion
                    )!
                    .push(video);
                }
              );
            }
          );

          const finalList: VideoData[] =
            [];

          const seen =
            new Set<string>();

          const addVideo = (
            video: VideoData
          ) => {
            if (
              !seen.has(video.id)
            ) {
              seen.add(video.id);
              finalList.push(
                video
              );
            }
          };

          learningQueue.forEach(
            (video) => {
              if (
                video.prerequis
                  ?.length
              ) {
                video.prerequis.forEach(
                  (
                    prereqTitle
                  ) => {
                    const prereqVideo =
                      filtered.find(
                        (v) =>
                          v.titre ===
                          prereqTitle
                      );

                    if (
                      prereqVideo
                    ) {
                      addVideo(
                        prereqVideo
                      );
                    }
                  }
                );
              }

              addVideo(video);
            }
          );

          filtered.forEach(
            (video) => {
              addVideo(video);
            }
          );

          finalList.sort(
            (a, b) => {
              const aCurrent =
                normalizeNiveau(
                  a.niveau
                ) ===
                normalizeNiveau(
                  niveau
                );

              const bCurrent =
                normalizeNiveau(
                  b.niveau
                ) ===
                normalizeNiveau(
                  niveau
                );

              if (
                aCurrent ===
                bCurrent
              ) {
                return 0;
              }

              return aCurrent
                ? 1
                : -1;
            }
          );

          setOrderedVideos(
            finalList
          );

          const savedCompleted =
            localStorage.getItem(
              completedStorageKey
            );

          let completedSet =
            new Set<string>();

          if (
            savedCompleted
          ) {
            try {
              completedSet =
                new Set(
                  JSON.parse(
                    savedCompleted
                  )
                );
            } catch {
              console.warn(
                "Impossible de lire la progression locale."
              );
            }
          }

          setCompletedVideos(
            completedSet
          );

          const firstUnwatched =
            finalList.findIndex(
              (video) =>
                !completedSet.has(
                  video.id
                )
            );

          setCurrentIndex(
            firstUnwatched >= 0
              ? firstUnwatched
              : 0
          );

          setLoading(false);
        };

      loadVideos();

      return () => {
        cancelled = true;
      };
    }, [
      niveau,
      matiere,
      serieEffective,
      completedStorageKey,
    ]);

    /* ========================================================
       PROFILS ENSEIGNANTS
    ======================================================== */

    useEffect(() => {
      let cancelled = false;

      const emails = Array.from(
        new Set(
          orderedVideos
            .map(
              (video) =>
                video.enseignant
            )
            .filter(
              (
                email
              ): email is string =>
                Boolean(email)
            )
        )
      );

      if (!emails.length) {
        setTeacherProfiles(
          {}
        );
        setLoadingTeachers(
          false
        );
        return;
      }

      const loadTeachers =
        async () => {
          setLoadingTeachers(
            true
          );

          const profiles: Record<
            string,
            TeacherProfile | null
          > = {};

          await Promise.all(
            emails.map(
              async (email) => {
                const cacheId =
                  buildTeacherCacheId(
                    email
                  );

                try {
                  if (
                    navigator.onLine
                  ) {
                    const response =
                      await api.get(
                        `/api/teacher/public-profile?email=${encodeURIComponent(
                          email
                        )}`
                      );

                    const profile =
                      response.data;

                    profiles[
                      email
                    ] =
                      profile ||
                      null;

                    if (
                      profile
                    ) {
                      try {
                        await saveOfflineData(
                          STORES.documents,
                          {
                            ...profile,
                            id: cacheId,
                            cachedAt:
                              Date.now(),
                          } as CachedTeacherProfile &
                            {
                              id: string;
                            }
                        );
                      } catch (
                        cacheError
                      ) {
                        console.warn(
                          "Impossible de mettre le profil enseignant en cache :",
                          cacheError
                        );
                      }
                    }

                    return;
                  }
                } catch (
                  error
                ) {
                  console.warn(
                    `Profil enseignant indisponible pour ${email}.`,
                    error
                  );
                }

                try {
                  const cached =
                    await getOfflineData<CachedTeacherProfile>(
                      STORES.documents,
                      cacheId
                    );

                  profiles[
                    email
                  ] =
                    cached ||
                    null;
                } catch {
                  profiles[
                    email
                  ] = null;
                }
              }
            )
          );

          if (!cancelled) {
            setTeacherProfiles(
              profiles
            );
            setLoadingTeachers(
              false
            );
          }
        };

      loadTeachers();

      return () => {
        cancelled = true;
      };
    }, [
      orderedVideos,
    ]);

    /* ========================================================
       LECTURE / QUIZ
    ======================================================== */

    const [
      videoPlaying,
      setVideoPlaying,
    ] = useState(false);

    const [
      showQuiz,
      setShowQuiz,
    ] = useState(false);

    const [
      showCountdown,
      setShowCountdown,
    ] = useState(false);

    const [
      isVideoPlaying,
      setIsVideoPlaying,
    ] = useState(false);

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
    ] = useState<
      Question[]
    >([]);

    const [
      feedback,
      setFeedback,
    ] = useState<{
      type:
        | "success"
        | "error";
      message: string;
    } | null>(null);

    const [
      answerStatus,
      setAnswerStatus,
    ] = useState<
      "none" |
        "correct" |
        "wrong"
    >("none");

    const [
      fadeKey,
      setFadeKey,
    ] = useState(0);

    const [
      quizKey,
      setQuizKey,
    ] = useState(0);

    const [
      completedVideos,
      setCompletedVideos,
    ] = useState<
      Set<string>
    >(new Set());

    const [
      seenVideosAtLevel,
      setSeenVideosAtLevel,
    ] = useState<
      Set<string>
    >(new Set());

    /* ========================================================
       SIDEBAR
    ======================================================== */

    const [
      isSidebarOpen,
      setIsSidebarOpen,
    ] = useState(false);

    const [
      canShowQuiz,
      setCanShowQuiz,
    ] = useState(false);

    /* ========================================================
       SCROLL
    ======================================================== */

    const scrollPageToTop = (
      behavior: ScrollBehavior =
        "smooth"
    ) => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior,
      });

      document.documentElement.scrollTo(
        {
          top: 0,
          left: 0,
          behavior,
        }
      );

      document.body.scrollTo({
        top: 0,
        left: 0,
        behavior,
      });
    };

    /* ========================================================
       CHANGEMENT VIDÉO
    ======================================================== */

    const handleVideoChange = (
      index: number
    ) => {
      if (
        index < 0 ||
        index >=
          orderedVideos.length
      ) {
        return;
      }

      const video =
        orderedVideos[index];

      setCurrentIndex(index);
      setVideoPlaying(false);
      setShowQuiz(false);
      setShowCountdown(false);
      setTimerEnded(false);
      setCurrentQuestionIndex(
        0
      );
      setSelectedAnswer("");
      setAnswerStatus(
        "none"
      );
      setPendingExplanation(
        null
      );

      setShuffledQuestions(
        shuffleQuestionsWithChoices(
          video.questions || []
        )
      );

      setFadeKey(
        (p) => p + 1
      );

      setIsSidebarOpen(
        false
      );

      scrollPageToTop();
    };

    useEffect(() => {
      scrollPageToTop(
        "auto"
      );
    }, []);

    useEffect(() => {
      if (
        !orderedVideos.length
      ) {
        return;
      }

      scrollPageToTop(
        "smooth"
      );
    }, [currentIndex]);

    useEffect(() => {
      if (!showQuiz) {
        return;
      }

      scrollPageToTop(
        "smooth"
      );
    }, [
      currentQuestionIndex,
      showQuiz,
    ]);

    useEffect(() => {
      const savedCompleted =
        localStorage.getItem(
          completedStorageKey
        );

      if (savedCompleted) {
        try {
          setCompletedVideos(
            new Set(
              JSON.parse(
                savedCompleted
              )
            )
          );
        } catch {
          console.warn(
            `Impossible de lire ${completedStorageKey}.`
          );
        }
      }
    }, [
      completedStorageKey,
    ]);

    useEffect(() => {
      if (
        !videoPlaying ||
        showQuiz
      ) {
        return;
      }

      requestAnimationFrame(
        () => {
          scrollPageToTop();
        }
      );
    }, [
      videoPlaying,
      showQuiz,
      fadeKey,
    ]);

    /* ========================================================
       ÉVALUATION
    ======================================================== */

    const [
      evaluationMode,
      setEvaluationMode,
    ] = useState(false);

    const [
      evaluationQuestions,
      setEvaluationQuestions,
    ] = useState<
      Question[]
    >([]);

    const [
      evaluationVideoQueue,
      setEvaluationVideoQueue,
    ] = useState<
      VideoData[]
    >([]);

    const [
      evaluationIndex,
      setEvaluationIndex,
    ] = useState(0);

    /* ========================================================
       REFS
    ======================================================== */

    const videoRef =
      useRef<HTMLVideoElement | null>(
        null
      );

    const questionSoundRef =
      useRef<HTMLAudioElement | null>(
        null
      );

    /* ========================================================
       QUESTION COURANTE
    ======================================================== */

    const currentVideo =
      orderedVideos[
        currentIndex
      ];

    const currentQuestion =
      shuffledQuestions[
        currentQuestionIndex
      ];

    /* ========================================================
       EXPLICATION IA
    ======================================================== */

    const openExplanation = (
      explanation: PendingExplanation
    ) => {
      navigate(
        "/explication-question",
        {
          state: {
            question:
              explanation.question,

            questionActuelle:
              explanation.question,

            matiereActuelle:
              explanation.matiere,

            matiere:
              explanation.matiere,

            niveauActuel:
              explanation.niveau,

            serieActuelle:
              routeState?.serieActuelle ??
              serieRoute ??
              "",

            resultats:
              routeState?.resultats ??
              null,

            reponseUtilisateur:
              explanation.reponseUtilisateur,

            bonneReponse:
              explanation.bonneReponse,

            correcte:
              explanation.correcte,

            notion:
              explanation.notion,

            classe:
              explanation.niveau,

            enseignant:
              explanation.enseignant,
          },
        }
      );
    };

    const handleOpenExplicationQuestion =
      () => {
        if (
          !currentQuestion
        ) {
          return;
        }

        if (
          !selectedAnswer
        ) {
          return;
        }

        const bonneReponse =
          currentQuestion.bonne_reponse ||
          "";

        const notion =
          currentQuestion.notion ||
          currentVideo?.notions?.[0] ||
          currentVideo?.titre ||
          "Notion non précisée";

        const niveauQuestion =
          currentQuestion.niveau ||
          currentVideo?.niveau ||
          niveau;

        const enseignant =
          currentQuestion.enseignant ??
          currentVideo?.enseignant ??
          null;

        const matiereQuestion =
          currentQuestion.matiere ||
          currentVideo?.matiere ||
          matiere;

        const correcte =
          normalize(
            selectedAnswer
          ) ===
          normalize(
            bonneReponse
          );

        openExplanation({
          question: {
            ...currentQuestion,
            notion,
            niveau:
              niveauQuestion,
            matiere:
              matiereQuestion,
            enseignant,
          },

          reponseUtilisateur:
            selectedAnswer,

          bonneReponse,

          correcte,

          notion,

          niveau:
            niveauQuestion,

          matiere:
            matiereQuestion,

          enseignant,
        });
      };

    /* ========================================================
       TIME UP
    ======================================================== */

    const handleTimeUp =
      () => {
        setFeedback({
          type: "error",
          message:
            "⏰ Vous avez épuisé le temps prévu pour cette question!",
        });

        setShowQuiz(false);
        setVideoPlaying(false);
        setShowCountdown(false);
        setCurrentQuestionIndex(
          0
        );
        setSelectedAnswer("");
        setAnswerStatus(
          "none"
        );

        setShuffledQuestions(
          shuffleQuestionsWithChoices(
            currentVideo?.questions ||
              []
          )
        );

        setTimeout(() => {
          setFeedback(null);
          setVideoPlaying(
            true
          );
          setShowCountdown(
            true
          );
        }, 2500);
      };

    /* ========================================================
       TITRES
    ======================================================== */

    const currentVideoTitle =
      orderedVideos[
        currentIndex
      ]?.titre || "";

    const nextVideoTitle =
      orderedVideos[
        currentIndex + 1
      ]?.titre || null;

    /* ========================================================
       SON
    ======================================================== */

    useEffect(() => {
      questionSoundRef.current =
        new Audio(
          "/sounds/click.mp3"
        );

      return () => {
        questionSoundRef.current?.pause();
        questionSoundRef.current =
          null;
      };
    }, []);

    /* ========================================================
       PLEIN ÉCRAN
    ======================================================== */

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

    const currentMonth =
      normalize(
        new Date().toLocaleString(
          "fr-FR",
          {
            month: "long",
          }
        )
      );

    const videoUrl =
      currentVideo?.fichier?.trim()
        ? currentVideo.fichier
        : currentVideo?.videoUrl ||
          "";

    const isUrlValid =
      !!videoUrl &&
      /^https?:\/\/.+/.test(
        videoUrl
      );

    const handleVideoComplete = (
      videoId: string
    ) => {
      localStorage.setItem(
        `lastVideoWatched_${normalizeMatiere(
          matiere
        )}`,
        videoId
      );
    };

    const isPrereq =
      currentVideo
        ? normalizeNiveau(
            currentVideo.niveau
          ) !==
          normalizeNiveau(
            niveau
          )
        : false;

    const isAvailable =
      !currentVideo
        ? false
        : completedVideos.has(
            currentVideo.id
          ) ||
          isPrereq ||
          normalizeNiveau(
            currentVideo.niveau
          ) !==
            normalizeNiveau(
              niveau
            ) ||
          !currentVideo.mois
            ?.length ||
          currentVideo.mois.some(
            (m) =>
              normalize(m) ===
              currentMonth
          );

    useEffect(() => {
      const handleFullscreenChange =
        () => {
          if (
            !document.fullscreenElement
          ) {
            setIsLandscape(
              false
            );
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

    /* ========================================================
       ORGANISATION PAR NOTION
    ======================================================== */

    const videosByNotion:
      Record<
        string,
        VideoData[]
      > = {};

    orderedVideos
      .filter(
        (v) =>
          normalizeNiveau(
            v.niveau
          ) ===
            normalizeNiveau(
              niveau
            ) &&
          v.notions[0] !==
            "Exercice"
      )
      .forEach(
        (mainVideo) => {
          (
            mainVideo.notions ||
            []
          ).forEach(
            (notion) => {
              if (
                !videosByNotion[
                  notion
                ]
              ) {
                videosByNotion[
                  notion
                ] = [];
              }

              (
                mainVideo.prerequis ||
                []
              ).forEach(
                (
                  prereqTitle
                ) => {
                  const prereqVideo =
                    orderedVideos.find(
                      (v) =>
                        v.titre ===
                        prereqTitle
                    );

                  if (
                    prereqVideo &&
                    !videosByNotion[
                      notion
                    ].some(
                      (v) =>
                        v.id ===
                        prereqVideo.id
                    )
                  ) {
                    videosByNotion[
                      notion
                    ].push(
                      prereqVideo
                    );
                  }
                }
              );

              if (
                !videosByNotion[
                  notion
                ].some(
                  (v) =>
                    v.id ===
                    mainVideo.id
                )
              ) {
                videosByNotion[
                  notion
                ].push(
                  mainVideo
                );
              }

              const exerciceVideos =
                orderedVideos.filter(
                  (v) =>
                    mainVideo.exercices?.includes(
                      v.titre
                    ) &&
                    normalizeNiveau(
                      v.niveau
                    ) ===
                      normalizeNiveau(
                        niveau
                      ) &&
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
                        v.id ===
                        exVideo.id
                    )
                  ) {
                    videosByNotion[
                      notion
                    ].push(
                      exVideo
                    );
                  }
                }
              );
            }
          );
        }
      );

    const notionOrder =
      Object.keys(
        videosByNotion
      );

    /* ========================================================
       NAVIGATION CLAVIER
    ======================================================== */

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

        if (
          focusArea ===
          "sidebar"
        ) {
          if (
            e.key ===
            "ArrowUp"
          ) {
            setSidebarIndex(
              (prev) =>
                prev > 0
                  ? prev - 1
                  : Math.max(
                      0,
                      Object.keys(
                        videosByNotion
                      ).length -
                        1
                    )
            );
          }

          if (
            e.key ===
            "ArrowDown"
          ) {
            setSidebarIndex(
              (prev) =>
                prev <
                Object.keys(
                  videosByNotion
                ).length -
                  1
                  ? prev + 1
                  : 0
            );
          }

          if (
            e.key ===
            "Enter"
          ) {
            const notions =
              Object.keys(
                videosByNotion
              );

            const notion =
              notions[
                sidebarIndex
              ];

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
                  v.id ===
                  targetVideo.id
              );

            if (
              index !== -1
            ) {
              setCurrentIndex(
                index
              );
            }
          }
        }

        if (
          e.key ===
            "ArrowRight" &&
          focusArea ===
            "video"
        ) {
          setFocusArea(
            "sidebar"
          );
          return;
        }

        if (
          e.key ===
            "ArrowLeft" &&
          focusArea ===
            "sidebar"
        ) {
          setFocusArea(
            "video"
          );
          return;
        }

        if (
          focusArea ===
            "video" &&
          e.key ===
            "Enter"
        ) {
          if (
            !videoPlaying &&
            !showQuiz
          ) {
            setVideoPlaying(
              true
            );
            setShowCountdown(
              true
            );
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

    /* ========================================================
       PLEIN ÉCRAN
    ======================================================== */

    const requestFullscreenLandscape =
      async (
        videoElement?: HTMLDivElement | null
      ) => {
        const el =
          videoElement ||
          videoContainerRef.current;

        if (!el) {
          return;
        }

        try {
          if (
            el.requestFullscreen
          ) {
            await el.requestFullscreen();
          } else if (
            (el as any)
              .webkitRequestFullscreen
          ) {
            (
              el as any
            ).webkitRequestFullscreen();
          }

          if (
            screen.orientation &&
            (
              screen.orientation as any
            ).lock
          ) {
            try {
              await (
                screen.orientation as any
              ).lock(
                "landscape"
              );
            } catch (
              orientationError
            ) {
              console.warn(
                "Verrouillage paysage non disponible :",
                orientationError
              );
            }
          }

          setIsLandscape(
            true
          );

          setIsFullscreen(
            true
          );
        } catch (err) {
          console.warn(
            "Impossible de passer en plein écran :",
            err
          );
        }
      };

    const exitFullscreenPortrait =
      async () => {
        try {
          if (
            document.fullscreenElement
          ) {
            await document.exitFullscreen();
          }

          if (
            screen.orientation &&
            screen.orientation.unlock
          ) {
            try {
              screen.orientation.unlock();
            } catch (
              orientationError
            ) {
              console.warn(
                "Impossible de déverrouiller l'orientation :",
                orientationError
              );
            }
          }

          setIsLandscape(
            false
          );

          setIsFullscreen(
            false
          );
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
          if (
            !document.fullscreenElement
          ) {
            setIsLandscape(
              false
            );

            setIsFullscreen(
              false
            );
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

    /* ========================================================
       NAVIGATION CLAVIER VIDÉOS
    ======================================================== */

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

        const current =
          orderedVideos[
            currentIndex
          ];

        if (!current) {
          return;
        }

        let currentNotionIndex =
          notions.findIndex(
            (n) =>
              videosByNotion[
                n
              ].some(
                (v) =>
                  v.id ===
                  current.id
              )
          );

        if (
          currentNotionIndex ===
          -1
        ) {
          currentNotionIndex = 0;
        }

        const vidsInNotion =
          videosByNotion[
            notions[
              currentNotionIndex
            ]
          ] || [];

        const indexInNotion =
          vidsInNotion.findIndex(
            (v) =>
              v.id ===
              current.id
          );

        if (
          e.key ===
            "ArrowDown" &&
          vidsInNotion.length
        ) {
          if (
            indexInNotion <
            vidsInNotion.length -
              1
          ) {
            setCurrentIndex(
              orderedVideos.findIndex(
                (v) =>
                  v.id ===
                  vidsInNotion[
                    indexInNotion +
                      1
                  ].id
              )
            );
          } else if (
            notions.length
          ) {
            const nextNotionIndex =
              (currentNotionIndex +
                1) %
              notions.length;

            const nextVideo =
              videosByNotion[
                notions[
                  nextNotionIndex
                ]
              ][0];

            if (
              nextVideo
            ) {
              setCurrentIndex(
                orderedVideos.findIndex(
                  (v) =>
                    v.id ===
                    nextVideo.id
                )
              );
            }
          }
        }

        if (
          e.key ===
            "ArrowUp" &&
          vidsInNotion.length
        ) {
          if (
            indexInNotion > 0
          ) {
            setCurrentIndex(
              orderedVideos.findIndex(
                (v) =>
                  v.id ===
                  vidsInNotion[
                    indexInNotion -
                      1
                  ].id
              )
            );
          } else if (
            notions.length
          ) {
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
                prevVids.length -
                  1
              ];

            if (
              prevVideo
            ) {
              setCurrentIndex(
                orderedVideos.findIndex(
                  (v) =>
                    v.id ===
                    prevVideo.id
                )
              );
            }
          }
        }

        if (
          e.key ===
          "ArrowLeft"
        ) {
          setFocusArea(
            "video"
          );
        }

        if (
          e.key ===
          "ArrowRight"
        ) {
          setFocusArea(
            "sidebar"
          );
        }

        setTimeout(() => {
          const activeElement =
            document.getElementById(
              `video-${orderedVideos[currentIndex]?.id}`
            );

          activeElement?.scrollIntoView(
            {
              behavior:
                "smooth",
              block:
                "center",
            }
          );
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

    /* ========================================================
       DÉMARRER VIDÉO
    ======================================================== */

    const startVideo = () => {
      scrollPageToTop();

      setFeedback(null);

      setPendingExplanation(
        null
      );

      setVideoPlaying(
        true
      );

      setShowQuiz(false);

      setShowCountdown(
        true
      );

      setCurrentQuestionIndex(
        0
      );

      setSelectedAnswer(
        ""
      );

      setShuffledQuestions(
        shuffleQuestionsWithChoices(
          currentVideo?.questions ||
            []
        )
      );

      setAnswerStatus(
        "none"
      );

      setFadeKey(
        (p) => p + 1
      );

      if (
        window.innerWidth <
        768
      ) {
        requestFullscreenLandscape(
          videoContainerRef.current
        );
      }
    };

    /* ========================================================
       ÉVALUATION
    ======================================================== */

    const handleGoToQuestions =
      () => {
        setShowCountdown(
          false
        );

        setShowQuiz(true);

        setTimerEnded(
          true
        );

        setVideoPlaying(
          false
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
      };

    /* ========================================================
       VALIDATION
    ======================================================== */

    const handleValidateAnswer =
      () => {
        const currentQ =
          shuffledQuestions[
            currentQuestionIndex
          ];

        if (!currentQ) {
          return;
        }

        const userAnswer =
          normalize(
            selectedAnswer
          );

        const correctAnswer =
          normalize(
            currentQ.bonne_reponse
          );

        if (
          userAnswer ===
          correctAnswer
        ) {
          setFeedback({
            type: "success",
            message:
              "✅ Bravo ! Réponse correcte",
          });

          setAnswerStatus(
            "correct"
          );

          questionSoundRef.current
            ?.play()
            .catch(() => {});

          setTimeout(() => {
            setFeedback(null);

            setAnswerStatus(
              "none"
            );

            if (
              currentQuestionIndex <
              shuffledQuestions.length -
                1
            ) {
              setCurrentQuestionIndex(
                (i) => i + 1
              );

              setSelectedAnswer(
                ""
              );

              setQuizKey(
                (p) => p + 1
              );
            } else {
              if (
                !currentVideo
              ) {
                return;
              }

              setCompletedVideos(
                (prev) => {
                  const newSet =
                    new Set(
                      prev
                    );

                  newSet.add(
                    currentVideo.id
                  );

                  localStorage.setItem(
                    completedStorageKey,
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
          const bonneReponse =
            currentQ.bonne_reponse ||
            "";

          const notion =
            currentQ.notion ||
            currentVideo?.notions?.[0] ||
            currentVideo?.titre ||
            "Notion non précisée";

          const niveauQuestion =
            currentQ.niveau ||
            currentVideo?.niveau ||
            niveau;

          const enseignant =
            currentQ.enseignant ??
            currentVideo?.enseignant ??
            null;

          const matiereQuestion =
            currentQ.matiere ||
            currentVideo?.matiere ||
            matiere;

          setPendingExplanation({
            question: {
              ...currentQ,
              notion,
              niveau:
                niveauQuestion,
              matiere:
                matiereQuestion,
              enseignant,
            },

            reponseUtilisateur:
              selectedAnswer,

            bonneReponse,

            correcte: false,

            notion,

            niveau:
              niveauQuestion,

            matiere:
              matiereQuestion,

            enseignant,
          });

          setFeedback({
            type: "error",
            message:
              "❌ Mauvaise réponse ! Retournez à la vidéo pour revoir cette notion. Vous pourrez ensuite demander une explication avec CODE IA.",
          });

          setAnswerStatus(
            "wrong"
          );

          setTimeout(() => {
            setFeedback(null);

            setShowQuiz(
              false
            );

            setVideoPlaying(
              false
            );

            setShowCountdown(
              false
            );

            setTimerEnded(
              false
            );

            setCurrentQuestionIndex(
              currentQuestionIndex
            );

            setAnswerStatus(
              "none"
            );

            setFadeKey(
              (p) => p + 1
            );

            scrollPageToTop();
          }, 1800);
        }
      };

    /* ========================================================
       ÉVALUATION D'UNE NOTION
    ======================================================== */

    const startEvaluationForNotion =
      (
        notion: string
      ) => {
        const videosOfNotion =
          orderedVideos.filter(
            (v) =>
              v.notions.includes(
                notion
              ) &&
              completedVideos.has(
                v.id
              )
          );

        const allQuestions: Question[] =
          [];

        videosOfNotion.forEach(
          (v) => {
            if (
              v.questions &&
              v.questions.length
            ) {
              allQuestions.push(
                ...v.questions
              );
            }
          }
        );

        if (
          !allQuestions.length
        ) {
          return;
        }

        const evalCount =
          Math.max(
            1,
            Math.floor(
              allQuestions.length /
                4
            )
          );

        const shuffled =
          shuffleArray(
            allQuestions
          ).slice(
            0,
            evalCount
          );

        setEvaluationQuestions(
          shuffleQuestionsWithChoices(
            shuffled
          )
        );

        setEvaluationVideoQueue(
          videosOfNotion
        );

        setEvaluationIndex(
          0
        );

        setEvaluationMode(
          true
        );

        setShowQuiz(true);

        setCurrentQuestionIndex(
          0
        );

        setSelectedAnswer(
          ""
        );

        setAnswerStatus(
          "none"
        );

        setFadeKey(
          (p) => p + 1
        );
      };

    /* ========================================================
       VIDÉO SUIVANTE
    ======================================================== */

    const handleNextVideo =
      () => {
        if (
          !currentVideo
        ) {
          navigate(
            `/matiere/${matiere}`,
            {
              replace: true,
            }
          );

          return;
        }

        if (
          normalizeNiveau(
            currentVideo.niveau
          ) ===
          normalizeNiveau(
            niveau
          )
        ) {
          setSeenVideosAtLevel(
            (prev) =>
              new Set(
                prev
              ).add(
                currentVideo.id
              )
          );

          setCompletedVideos(
            (prev) => {
              const newSet =
                new Set(
                  prev
                );

              newSet.add(
                currentVideo.id
              );

              localStorage.setItem(
                completedStorageKey,
                JSON.stringify([
                  ...newSet,
                ])
              );

              return newSet;
            }
          );
        }

        const currentNotion =
          (
            currentVideo.notions &&
            currentVideo
              .notions[0]
          ) ||
          null;

        if (
          currentNotion
        ) {
          const videosOfThisNotion =
            orderedVideos.filter(
              (v) =>
                v.notions.includes(
                  currentNotion
                ) &&
                normalizeNiveau(
                  v.niveau
                ) ===
                  normalizeNiveau(
                    niveau
                  )
            );

          const allCompleted =
            videosOfThisNotion.length >
              0 &&
            videosOfThisNotion.every(
              (v) =>
                completedVideos.has(
                  v.id
                ) ||
                v.id ===
                  currentVideo.id
            );

          if (
            allCompleted
          ) {
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

            if (
              nextNotion
            ) {
              const idxVideo =
                orderedVideos.findIndex(
                  (v) =>
                    v.notions.includes(
                      nextNotion
                    )
                );

              if (
                idxVideo !==
                -1
              ) {
                setCurrentIndex(
                  idxVideo
                );

                setVideoPlaying(
                  false
                );

                setShowQuiz(
                  false
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

                setFadeKey(
                  (p) =>
                    p + 1
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
          let candidate =
            nextIndex;

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

            setVideoPlaying(
              false
            );

            setShowQuiz(
              false
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

            setFadeKey(
              (p) =>
                p + 1
            );

            return;
          }
        }

        navigate(
          `/matiere/${matiere}`,
          {
            replace: true,
          }
        );
      };

    /* ========================================================
       PROGRESSION OFFLINE
    ======================================================== */

    useEffect(() => {
      if (
        !currentVideo
      ) {
        return;
      }

      const savedPosition =
        localStorage.getItem(
          `lastVideo_${normalizeMatiere(
            matiere
          )}_${currentVideo.id}`
        );

      if (
        savedPosition &&
        videoRef.current
      ) {
        try {
          const parsed =
            JSON.parse(
              savedPosition
            );

          if (
            typeof parsed.position ===
            "number"
          ) {
            videoRef.current.currentTime =
              parsed.position;
          }
        } catch {
          console.warn(
            "Position vidéo invalide."
          );
        }
      }
    }, [
      currentVideo?.id,
      matiere,
    ]);

    /* ========================================================
       RENDU CHARGEMENT
    ======================================================== */

    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-screen gap-4 bg-black text-white">
          <Loader2 className="animate-spin h-10 w-10" />

          <p>
            Chargement des vidéos...
          </p>

          {!navigator.onLine && (
            <p className="text-sm text-yellow-400">
              Mode hors connexion
            </p>
          )}
        </div>
      );
    }

    /* ========================================================
       AUCUNE VIDÉO
    ======================================================== */

    if (!orderedVideos.length) {
      return (
        <div className="text-center mt-20 text-white bg-black min-h-screen p-8">
          <p className="text-xl font-bold mb-3">
            Aucune vidéo de remédiation
            disponible.
          </p>

          <p className="text-gray-400">
            Matière :{" "}
            {matiere}
          </p>

          <p className="text-gray-400">
            Matière normalisée :{" "}
            {normalizeMatiere(
              matiere
            )}
          </p>

          <p className="text-gray-400">
            Niveau :{" "}
            {niveau}
          </p>

          {serieEffective && (
            <p className="text-gray-400">
              Série :{" "}
              {serieEffective}
            </p>
          )}

          <p className="text-xs text-gray-600 mt-6">
            Consulte la console du
            navigateur pour voir les
            données retournées par
            l'API et le résultat du
            filtrage.
          </p>
        </div>
      );
    }

    /* ========================================================
       URL VIDÉO
    ======================================================== */

    const currentTitle =
      currentVideo?.titre ||
      "";

    const nextTitle =
      orderedVideos[
        currentIndex + 1
      ]?.titre ?? null;

    const safeUrl =
      isYouTubeUrl(
        videoUrl
      )
        ? getSafeYouTubeUrl(
            videoUrl
          )
        : videoUrl;

    /* ========================================================
       ENSEIGNANT COURANT
    ======================================================== */

    const currentTeacher =
      currentVideo?.enseignant
        ? teacherProfiles[
            currentVideo
              .enseignant
          ]
        : null;

    const buildTeacherPhotoUrl =
      (
        photo?: string
      ): string | null => {
        if (!photo) {
          return null;
        }

        if (
          /^https?:\/\/+/i.test(
            photo
          )
        ) {
          return photo;
        }

        const baseUrl =
          api.defaults.baseURL?.replace(
            /\/+$/,
            ""
          ) || "";

        const normalizedBase =
          baseUrl.endsWith(
            "/api"
          )
            ? baseUrl.slice(
                0,
                -4
              )
            : baseUrl;

        return `${normalizedBase}/${photo.replace(
          /^\/+/,
          ""
        )}`;
      };

    const currentTeacherPhoto =
      buildTeacherPhotoUrl(
        currentTeacher?.teacher_photo
      );

    const currentTeacherName =
      currentTeacher
        ? `${currentTeacher.prenom || ""} ${
            currentTeacher.nom ||
            ""
          }`.trim()
        : currentVideo?.enseignant ||
          "";

    const handleTeacherProfile =
      () => {
        const teacherEmail =
          currentTeacher?.email ||
          currentVideo?.enseignant;

        if (
          !teacherEmail
        ) {
          return;
        }

        navigate(
          `/enseignant/profil/${encodeURIComponent(
            teacherEmail
          )}`
        );
      };

    /* ========================================================
       RENDU PRINCIPAL
    ======================================================== */

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

        {!navigator.onLine && (
          <div className="fixed top-0 left-0 right-0 z-[9998] bg-yellow-500 text-black text-center text-xs font-semibold py-1">
            Mode hors connexion — les données déjà téléchargées restent accessibles.
          </div>
        )}

        {/* ====================================================
            BOUTON MOBILE
        ==================================================== */}

        <button
          type="button"
          className="lg:hidden flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg m-4 self-start shadow hover:bg-blue-700 transition"
          onClick={() =>
            setIsSidebarOpen(
              true
            )
          }
        >
          <List className="w-5 h-5" />
          Liste des vidéos
        </button>

        {/* ====================================================
            SIDEBAR
        ==================================================== */}

        <aside
          ref={
            sidebarRef
          }
          className={`lg:block ${
            isSidebarOpen
              ? "block"
              : "hidden"
          } w-full lg:w-80 shrink-0`}
        >
          <div className="sticky top-24 p-4 lg:p-5">
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">

              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between gap-3">

                  <div>
                    <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">
                      Vidéos
                    </h3>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {
                        orderedVideos.length
                      }{" "}
                      vidéo
                      {orderedVideos.length >
                      1
                        ? "s"
                        : ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setIsSidebarOpen(
                        false
                      )
                    }
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>

                </div>
              </div>

              <div className="max-h-[calc(100vh-180px)] overflow-y-auto p-3 space-y-2">

                {orderedVideos.map(
                  (
                    video,
                    index
                  ) => {
                    const isActive =
                      index ===
                      currentIndex;

                    const isCompleted =
                      completedVideos.has(
                        video.id
                      );

                    const teacher =
                      video.enseignant
                        ? teacherProfiles[
                            video
                              .enseignant
                          ]
                        : null;

                    const teacherPhoto =
                      buildTeacherPhotoUrl(
                        teacher?.teacher_photo
                      );

                    const teacherName =
                      teacher
                        ? `${teacher.prenom || ""} ${
                            teacher.nom ||
                            ""
                          }`.trim()
                        : video.enseignant ||
                          "";

                    return (
                      <div
                        key={
                          video.id
                        }
                        id={`video-${video.id}`}
                        className={`rounded-2xl border transition-all ${
                          isActive
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : isCompleted
                            ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                        }`}
                      >

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
                              {index +
                                1}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p
                                className={`font-bold ${
                                  isActive
                                    ? "text-blue-700 dark:text-blue-300"
                                    : "text-gray-900 dark:text-gray-100"
                                }`}
                              >
                                {
                                  video.titre
                                }
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

                        {video.enseignant && (
                          <div className="px-4 pb-4 pt-0">

                            <div className="flex items-center gap-2">

                              <button
                                type="button"
                                onClick={() => {
                                  const teacherEmail =
                                    teacher?.email ||
                                    video.enseignant;

                                  if (
                                    !teacherEmail
                                  ) {
                                    return;
                                  }

                                  navigate(
                                    `/enseignant/profil/${encodeURIComponent(
                                      teacherEmail
                                    )}`
                                  );
                                }}
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

                                <button
                                  type="button"
                                  onClick={() => {
                                    const teacherEmail =
                                      teacher?.email ||
                                      video.enseignant;

                                    if (
                                      !teacherEmail
                                    ) {
                                      return;
                                    }

                                    navigate(
                                      `/enseignant/profil/${encodeURIComponent(
                                        teacherEmail
                                      )}`
                                    );
                                  }}
                                  className="text-xs font-semibold text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 hover:underline truncate text-left focus:outline-none"
                                  title="Voir le profil de l'enseignant"
                                >
                                  {
                                    teacherName
                                  }
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

        {/* ====================================================
            MAIN
        ==================================================== */}

        <main className="flex-1 flex flex-col items-center justify-start px-4 py-6">

          <div className="w-full max-w-3xl">

            <div className="mb-4 text-center">

              <p className="text-sm uppercase tracking-widest text-blue-400 font-semibold">
                Remédiation
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {matiere}
                {" • "}
                {niveau}
                {serieEffective
                  ? ` • ${serieEffective}`
                  : ""}
              </p>

            </div>

            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-4">

              <div
                className="h-2 bg-blue-600 rounded-full transition-all"
                style={{
                  width: `${
                    ((currentIndex +
                      1) /
                      orderedVideos.length) *
                    100
                  }%`,
                }}
              />

            </div>

            <h1 className="text-2xl font-bold text-center text-blue-700 dark:text-blue-300 mb-4">
              {currentTitle}
            </h1>

            {/* ====================================================
                ENSEIGNANT
            ==================================================== */}

            {currentVideo?.enseignant && (
              <div className="mb-5 flex justify-center">

                <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg p-4">

                  <div className="flex items-center gap-4">

                    <button
                      type="button"
                      onClick={
                        handleTeacherProfile
                      }
                      disabled={
                        !currentTeacher
                      }
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

                    <div className="min-w-0 flex-1 text-left">

                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Enseignant de cette vidéo
                      </p>

                      <button
                        type="button"
                        onClick={
                          handleTeacherProfile
                        }
                        disabled={
                          !currentTeacher
                        }
                        className="font-bold text-lg text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 hover:underline transition text-left focus:outline-none disabled:no-underline disabled:cursor-default"
                      >
                        {
                          currentTeacherName
                        }
                      </button>

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

            {/* ====================================================
                VIDEO + QUIZ
            ==================================================== */}

            <AnimatePresence mode="wait">

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
                              width:
                                "100vw",
                              height:
                                "100dvh",
                              maxWidth:
                                "100vw",
                              maxHeight:
                                "100dvh",
                            }
                          : undefined
                      }
                    >

                      {isYouTubeUrl(
                        videoUrl
                      ) ? (
                        <iframe
                          key={
                            fadeKey
                          }
                          src={
                            safeUrl
                          }
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
                                  width:
                                    "100%",
                                  height:
                                    "100%",
                                  maxWidth:
                                    "100%",
                                  maxHeight:
                                    "100%",
                                }
                              : undefined
                          }
                        />
                      ) : (
                        <video
                          key={
                            fadeKey
                          }
                          ref={
                            videoRef
                          }
                          src={
                            videoUrl
                          }
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
                                  width:
                                    "100%",
                                  height:
                                    "100%",
                                  maxWidth:
                                    "100%",
                                  maxHeight:
                                    "100%",
                                  objectFit:
                                    "contain",
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
                              `lastVideo_${normalizeMatiere(
                                matiere
                              )}_${currentVideo.id}`,
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
                              (p) =>
                                p + 1
                            );

                            handleVideoComplete(
                              currentVideo?.id ||
                                ""
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
                                `lastVideo_${normalizeMatiere(
                                  matiere
                                )}_${currentVideo.id}`
                              );

                            if (
                              saved
                            ) {
                              try {
                                const parsed =
                                  JSON.parse(
                                    saved
                                  );

                                if (
                                  typeof parsed.position ===
                                  "number"
                                ) {
                                  videoRef.current.currentTime =
                                    parsed.position;
                                }
                              } catch {
                                console.warn(
                                  "Position vidéo invalide."
                                );
                              }
                            }
                          }}
                        />
                      )}

                      <div className="absolute bottom-4 right-4">

                        <button
                          type="button"
                          onClick={() => {
                            if (
                              isFullscreen
                            ) {
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

                    {timerEnded && (
                      <div className="flex justify-center mt-6">

                        <button
                          type="button"
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

              {/* ====================================================
                  QUIZ
              ==================================================== */}

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
                        duration={
                          90
                        }
                        onComplete={() => {
                          setFeedback({
                            type: "error",
                            message:
                              "⏰ Temps prévu écoulé!",
                          });

                          setVideoPlaying(
                            false
                          );

                          setShowQuiz(
                            true
                          );

                          setTimerEnded(
                            true
                          );

                          setTimerResetCounter(
                            (p) =>
                              p + 1
                          );

                          setFadeKey(
                            (p) =>
                              p + 1
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
                                  onChange={() => {
                                    setSelectedAnswer(
                                      opt
                                    );

                                    setAnswerStatus(
                                      "none"
                                    );
                                  }}
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

                      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">

                        {selectedAnswer && (
                          <motion.button
                            type="button"
                            initial={{
                              opacity: 0,
                              y: 8,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            whileHover={{
                              scale: 1.02,
                            }}
                            whileTap={{
                              scale: 0.98,
                            }}
                            onClick={
                              handleOpenExplicationQuestion
                            }
                            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-purple-500 bg-purple-600/10 hover:bg-purple-600 text-purple-700 dark:text-purple-300 hover:text-white font-semibold shadow transition-all"
                          >
                            <Brain className="w-5 h-5" />

                            💡 Explication avec CODE IA
                          </motion.button>
                        )}

                        <button
                          type="button"
                          onClick={
                            handleValidateAnswer
                          }
                          disabled={
                            !selectedAnswer
                          }
                          className={`px-6 py-3 rounded-xl shadow transition-all text-white text-base font-semibold ${
                            selectedAnswer
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "bg-gray-400 cursor-not-allowed"
                          }`}
                        >
                          Valider
                        </button>

                      </div>

                      {selectedAnswer && (
                        <motion.div
                          initial={{
                            opacity: 0,
                          }}
                          animate={{
                            opacity: 1,
                          }}
                          className="mt-3 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-4"
                        >
                          <div className="flex items-start gap-3">

                            <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />

                            <div>

                              <p className="font-semibold text-purple-800 dark:text-purple-300">
                                Tu veux comprendre ta réponse ?
                              </p>

                              <p className="text-sm text-purple-700 dark:text-purple-400 mt-1">
                                Choisis « Explication avec l’IA »
                                pour discuter avec CODE IA de ton
                                raisonnement, de ton erreur éventuelle
                                et de la méthode à utiliser.
                              </p>

                            </div>

                          </div>
                        </motion.div>
                      )}

                    </motion.div>

                  </motion.div>
                )}

              {/* ====================================================
                  VIDEO LOCKED
              ==================================================== */}

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
                      currentVideo?.mois?.[0]
                    }
                  </motion.div>
                )}

              {/* ====================================================
                  START BUTTON
              ==================================================== */}

              {!videoPlaying &&
                !showQuiz &&
                isAvailable && (
                  <motion.div
                    key={`start-container-${fadeKey}`}
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
                    transition={{
                      duration: 0.4,
                    }}
                    className="flex flex-col items-center gap-4"
                  >

                    <motion.button
                      type="button"
                      whileHover={{
                        scale: 1.05,
                      }}
                      whileTap={{
                        scale: 0.95,
                      }}
                      onClick={
                        startVideo
                      }
                      className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-700 active:bg-green-800 transition-all duration-300"
                    >
                      ▶️ Démarrer la vidéo
                    </motion.button>

                    {pendingExplanation && (
                      <motion.button
                        type="button"
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        whileHover={{
                          scale: 1.03,
                        }}
                        whileTap={{
                          scale: 0.97,
                        }}
                        onClick={() => {
                          openExplanation(
                            pendingExplanation
                          );
                        }}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-purple-500 bg-purple-600/10 hover:bg-purple-600 text-purple-700 dark:text-purple-300 hover:text-white font-semibold shadow-lg transition-all"
                      >
                        <Brain className="w-5 h-5" />

                        💡 Explication avec CODE IA
                      </motion.button>
                    )}

                  </motion.div>
                )}

            </AnimatePresence>

            {/* ====================================================
                FEEDBACK
            ==================================================== */}

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
                {
                  feedback.message
                }
              </motion.div>
            )}

          </div>
        </main>
      </div>
    );
  };

export default RemediationVideo;