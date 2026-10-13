import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaBookOpen,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaGraduationCap,
  FaLayerGroup,
  FaList,
  FaPlay,
  FaPlayCircle,
  FaQuestionCircle,
  FaSearch,
  FaTimes,
  FaVideo,
  FaYoutube,
} from "react-icons/fa";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

// ============================================================
// TYPES
// ============================================================

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
  niveau: string;
  fichier?: string;
  videoUrl?: string;
  notions: string[];
  prerequis: string[];
  exercices?: string[];
  questions: Question[];
  matiere?: string;
  mois?: string[];
  enseignant?: string | null;
}

interface GroupedVideos {
  [niveau: string]: VideoData[];
}

type DetailPanel =
  | "notions"
  | "exercices"
  | null;

// ============================================================
// CONSTANTES
// ============================================================

const NIVEAUX = [
  { id: "6e", label: "6e", description: "Sixième" },
  { id: "5e", label: "5e", description: "Cinquième" },
  { id: "4e", label: "4e", description: "Quatrième" },
  { id: "3e", label: "3e", description: "Troisième" },
  { id: "2nde", label: "2nde", description: "Seconde" },
  { id: "1ere", label: "1ère", description: "Première" },
  { id: "Tle", label: "Terminale", description: "Terminale" },
];

// ============================================================
// UTILITAIRES
// ============================================================

const normalizeString = (
  value?: string | null
): string => {
  if (!value) return "";

  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

const cleanUrl = (url?: string): string => {
  if (!url) return "";

  return url
    .trim()
    .replace(/^"|"$/g, "")
    .replace(/^'|'$/g, "");
};

const isYouTubeUrl = (url: string): boolean => {
  const normalized = url.toLowerCase();

  return (
    normalized.includes("youtube.com") ||
    normalized.includes("youtu.be")
  );
};

const getYouTubeEmbedUrl = (
  url: string
): string => {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      const videoId = parsed.pathname
        .replace("/", "")
        .trim();

      if (!videoId) return "";

      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
    }

    if (parsed.hostname.includes("youtube.com")) {
      const videoId =
        parsed.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
      }

      if (
        parsed.pathname.startsWith("/embed/")
      ) {
        return `${url}${
          url.includes("?") ? "&" : "?"
        }rel=0&modestbranding=1`;
      }

      if (
        parsed.pathname.startsWith("/shorts/")
      ) {
        const videoIdFromShort =
          parsed.pathname
            .replace("/shorts/", "")
            .split("/")[0];

        if (videoIdFromShort) {
          return `https://www.youtube.com/embed/${videoIdFromShort}?rel=0&modestbranding=1`;
        }
      }
    }
  } catch {
    return "";
  }

  return "";
};

const getVideoUrl = (
  video: VideoData
): string => {
  const fichier = cleanUrl(video.fichier);

  if (fichier) return fichier;

  return cleanUrl(video.videoUrl);
};

const getLevelKey = (
  niveau?: string
): string => {
  const normalized =
    normalizeString(niveau);

  if (normalized === "6e") return "6e";
  if (normalized === "5e") return "5e";
  if (normalized === "4e") return "4e";
  if (normalized === "3e") return "3e";

  if (
    normalized === "2nde" ||
    normalized === "seconde"
  ) {
    return "2nde";
  }

  if (
    normalized === "1ere" ||
    normalized === "premiere"
  ) {
    return "1ere";
  }

  if (
    normalized === "tle" ||
    normalized === "terminale" ||
    normalized === "term"
  ) {
    return "Tle";
  }

  return niveau?.trim() || "Autre";
};

const getLevelLabel = (
  niveau?: string
): string => {
  const key = getLevelKey(niveau);

  const found = NIVEAUX.find(
    (niveauItem) =>
      niveauItem.id === key
  );

  return (
    found?.label ||
    niveau ||
    "Autres domaines"
  );
};

const getLevelDescription = (
  niveau?: string
): string => {
  const key = getLevelKey(niveau);

  const found = NIVEAUX.find(
    (niveauItem) =>
      niveauItem.id === key
  );

  return (
    found?.description ||
    "Vidéos sans niveau scolaire"
  );
};

const isKnownLevel = (
  niveau?: string
): boolean => {
  const key = getLevelKey(niveau);

  return NIVEAUX.some(
    (niveauItem) =>
      niveauItem.id === key
  );
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

const MesVideos: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ==========================================================
  // STATES
  // ==========================================================

  const [videos, setVideos] = useState<
    VideoData[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [selectedLevel, setSelectedLevel] =
    useState("all");

  const [expandedLevels, setExpandedLevels] =
    useState<Record<string, boolean>>({});

  const [selectedVideo, setSelectedVideo] =
    useState<VideoData | null>(null);

  const [showPlayer, setShowPlayer] =
    useState(false);

  // ==========================================================
  // FENÊTRE QUESTIONS D'UNE VIDÉO
  // ==========================================================

  const [
    selectedQuestionsVideo,
    setSelectedQuestionsVideo,
  ] = useState<VideoData | null>(null);

  // ==========================================================
  // PANNEAUX DÉTAILLÉS DES VIDÉOS
  // ==========================================================

  const [openDetailPanels, setOpenDetailPanels] =
    useState<Record<string, DetailPanel>>(
      {}
    );

  // ==========================================================
  // FENÊTRE DES EXERCICES
  // ==========================================================

  const [
    exercisePanelVideo,
    setExercisePanelVideo,
  ] = useState<VideoData | null>(null);

  const [
    exerciseVideos,
    setExerciseVideos,
  ] = useState<VideoData[]>([]);

  const [
    selectedExerciseVideo,
    setSelectedExerciseVideo,
  ] = useState<VideoData | null>(null);

  const [
    showExerciseQuestions,
    setShowExerciseQuestions,
  ] = useState(false);

  // ==========================================================
  // EMAIL DE L'UTILISATEUR CONNECTÉ
  // ==========================================================

  const userEmail = useMemo(() => {
    const email =
      (user as any)?.email ||
      (user as any)?.mail ||
      "";

    return typeof email === "string"
      ? email.trim()
      : "";
  }, [user]);

  // ==========================================================
  // CHARGEMENT DES VIDÉOS
  // ==========================================================

  useEffect(() => {
    const loadVideos = async () => {
      if (!userEmail) {
        setVideos([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const responses = await Promise.all(
          NIVEAUX.map(async (niveau) => {
            try {
              const response =
                await api.get<VideoData[]>(
                  `/api/videos/remediation?niveau=${encodeURIComponent(
                    niveau.id
                  )}`
                );

              return Array.isArray(
                response.data
              )
                ? response.data
                : [];
            } catch (err) {
              console.error(
                `Erreur récupération vidéos ${niveau.id} :`,
                err
              );

              return [];
            }
          })
        );

        let otherVideos: VideoData[] = [];

        try {
          const response =
            await api.get<VideoData[]>(
              "/api/videos/remediation"
            );

          if (
            Array.isArray(response.data)
          ) {
            otherVideos = response.data;
          }
        } catch (err) {
          console.info(
            "Aucune route générale de récupération des vidéos disponible.",
            err
          );
        }

        const allVideos = [
          ...responses.flat(),
          ...otherVideos,
        ];

        const cleanedVideos =
          allVideos
            .filter((video) => {
              if (!video) return false;

              const teacherEmail =
                normalizeString(
                  video.enseignant
                );

              const currentEmail =
                normalizeString(userEmail);

              return (
                teacherEmail !== "" &&
                currentEmail !== "" &&
                teacherEmail === currentEmail
              );
            })
            .map((video) => ({
              ...video,

              fichier: cleanUrl(
                video.fichier
              ),

              videoUrl: cleanUrl(
                video.videoUrl
              ),

              notions: Array.isArray(
                video.notions
              )
                ? video.notions
                : [],

              prerequis: Array.isArray(
                video.prerequis
              )
                ? video.prerequis
                : [],

              exercices: Array.isArray(
                video.exercices
              )
                ? video.exercices
                : [],

              questions: Array.isArray(
                video.questions
              )
                ? video.questions
                : [],

              mois: Array.isArray(
                video.mois
              )
                ? video.mois
                : [],

              matiere: video.matiere || "",

              enseignant:
                video.enseignant || null,
            }));

        const uniqueVideos =
          Array.from(
            new Map(
              cleanedVideos.map(
                (video) => [
                  String(video.id),
                  video,
                ]
              )
            ).values()
          );

        setVideos(uniqueVideos);

        const initialExpanded: Record<
          string,
          boolean
        > = {};

        uniqueVideos.forEach((video) => {
          const level = getLevelKey(
            video.niveau
          );

          initialExpanded[level] = true;
        });

        setExpandedLevels(
          initialExpanded
        );
      } catch (err: any) {
        console.error(
          "Erreur récupération vidéos enseignant :",
          err
        );

        setError(
          err?.response?.data?.detail ||
            "Impossible de récupérer vos vidéos."
        );
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, [userEmail]);

  // ==========================================================
  // GROUPEMENT DES VIDÉOS
  // ==========================================================

  const groupedVideos =
    useMemo<GroupedVideos>(() => {
      const groups: GroupedVideos = {};

      videos.forEach((video) => {
        const level = getLevelKey(
          video.niveau
        );

        if (!groups[level]) {
          groups[level] = [];
        }

        groups[level].push(video);
      });

      return groups;
    }, [videos]);

  // ==========================================================
  // RECHERCHE
  // ==========================================================

  const filteredGroups =
    useMemo<GroupedVideos>(() => {
      const result: GroupedVideos = {};

      const searchTerm =
        normalizeString(search);

      Object.entries(
        groupedVideos
      ).forEach(
        ([level, levelVideos]) => {
          if (
            selectedLevel !== "all" &&
            selectedLevel !== "other" &&
            level !== selectedLevel
          ) {
            return;
          }

          if (
            selectedLevel === "other" &&
            isKnownLevel(level)
          ) {
            return;
          }

          const filtered =
            levelVideos.filter(
              (video) => {
                if (!searchTerm) {
                  return true;
                }

                const searchableText = [
                  video.titre,
                  video.matiere,
                  video.niveau,
                  ...(video.notions || []),
                  ...(video.prerequis || []),
                ].join(" ");

                return normalizeString(
                  searchableText
                ).includes(searchTerm);
              }
            );

          if (filtered.length > 0) {
            result[level] = filtered;
          }
        }
      );

      return result;
    }, [
      groupedVideos,
      search,
      selectedLevel,
    ]);

  // ==========================================================
  // STATISTIQUES
  // ==========================================================

  const statistics = useMemo(() => {
    const classes =
      Object.keys(groupedVideos)
        .length;

    const notions = new Set<string>();

    let questions = 0;
    let exercices = 0;

    videos.forEach((video) => {
      (video.notions || []).forEach(
        (notion) => {
          notions.add(notion);
        }
      );

      questions += Array.isArray(
        video.questions
      )
        ? video.questions.length
        : 0;

      exercices += Array.isArray(
        video.exercices
      )
        ? video.exercices.length
        : 0;
    });

    return {
      videos: videos.length,
      classes,
      notions: notions.size,
      questions,
      exercices,
    };
  }, [
    videos,
    groupedVideos,
  ]);

  // ==========================================================
  // NIVEAUX DISPONIBLES
  // ==========================================================

  const availableLevels =
    useMemo(() => {
      return NIVEAUX.filter(
        (niveau) =>
          groupedVideos[niveau.id] &&
          groupedVideos[niveau.id].length >
            0
      );
    }, [groupedVideos]);

  // ==========================================================
  // AUTRES DOMAINES DISPONIBLES
  // ==========================================================

  const hasOtherDomains =
    useMemo(() => {
      return Object.keys(
        groupedVideos
      ).some(
        (level) => !isKnownLevel(level)
      );
    }, [groupedVideos]);

  // ==========================================================
  // TOGGLE SECTION
  // ==========================================================

  const toggleLevel = (
    level: string
  ) => {
    setExpandedLevels((previous) => ({
      ...previous,
      [level]: !previous[level],
    }));
  };

  // ==========================================================
  // FERMER UN PANNEAU DÉTAILLÉ
  // ==========================================================

  const closeDetailPanel = (
    videoId: string
  ) => {
    setOpenDetailPanels(
      (previous) => ({
        ...previous,
        [videoId]: null,
      })
    );
  };

  // ==========================================================
  // TOGGLE NOTIONS / EXERCICES
  // ==========================================================

  const toggleDetailPanel = (
    videoId: string,
    panel: DetailPanel
  ) => {
    setOpenDetailPanels(
      (previous) => ({
        ...previous,
        [videoId]:
          previous[videoId] === panel
            ? null
            : panel,
      })
    );

    // Lorsqu'on ouvre les exercices,
    // préparer immédiatement les vidéos correspondantes.
    if (panel === "exercices") {
      const sourceVideo =
        videos.find(
          (video) =>
            String(video.id) ===
            String(videoId)
        );

      if (sourceVideo) {
        const titles =
          sourceVideo.exercices || [];

        const matchingExerciseVideos =
          titles
            .map((exerciseTitle) => {
              const normalizedTitle =
                normalizeString(
                  exerciseTitle
                );

              return videos.find(
                (video) =>
                  normalizeString(
                    video.titre
                  ) === normalizedTitle
              );
            })
            .filter(
              (
                video
              ): video is VideoData =>
                Boolean(video)
            );

        const uniqueExerciseVideos =
          Array.from(
            new Map(
              matchingExerciseVideos.map(
                (video) => [
                  String(video.id),
                  video,
                ]
              )
            ).values()
          );

        setExercisePanelVideo(
          sourceVideo
        );

        setExerciseVideos(
          uniqueExerciseVideos
        );

        setSelectedExerciseVideo(
          null
        );

        setShowExerciseQuestions(
          false
        );
      }
    }
  };

  // ==========================================================
  // OUVRIR LES QUESTIONS D'UNE VIDÉO
  // ==========================================================

  const openQuestionsPanel = (
    video: VideoData
  ) => {
    setSelectedQuestionsVideo(video);
  };

  // ==========================================================
  // FERMER LES QUESTIONS D'UNE VIDÉO
  // ==========================================================

  const closeQuestionsPanel = () => {
    setSelectedQuestionsVideo(null);
  };

  // ==========================================================
  // FERMER LA FENÊTRE DES EXERCICES
  // ==========================================================

  const closeExercisePanel = () => {
    setShowExerciseQuestions(false);
    setSelectedExerciseVideo(null);
    setExerciseVideos([]);
    setExercisePanelVideo(null);
  };

  // ==========================================================
  // OUVRIR LES QUESTIONS D'UNE VIDÉO D'EXERCICE
  // ==========================================================

  const openExerciseQuestions = (
    exerciseVideo: VideoData
  ) => {
    setSelectedExerciseVideo(
      exerciseVideo
    );

    setShowExerciseQuestions(true);
  };

  // ==========================================================
  // FERMER LES QUESTIONS D'UN EXERCICE
  // ==========================================================

  const closeExerciseQuestions = () => {
    setShowExerciseQuestions(false);
    setSelectedExerciseVideo(null);
  };

  // ==========================================================
  // OUVRIR UNE VIDÉO
  // ==========================================================

  const openVideo = (
    video: VideoData
  ) => {
    setSelectedVideo(video);
    setShowPlayer(true);

    document.body.style.overflow =
      "hidden";
  };

  // ==========================================================
  // FERMER LE LECTEUR
  // ==========================================================

  const closePlayer = () => {
    setShowPlayer(false);

    document.body.style.overflow = "";

    setTimeout(() => {
      setSelectedVideo(null);
    }, 200);
  };

  // ==========================================================
  // ESCAPE POUR FERMER
  // ==========================================================

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key !== "Escape") {
        return;
      }

      if (showPlayer) {
        closePlayer();
        return;
      }

      if (showExerciseQuestions) {
        closeExerciseQuestions();
        return;
      }

      if (selectedQuestionsVideo) {
        closeQuestionsPanel();
        return;
      }

      if (exercisePanelVideo) {
        closeExercisePanel();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        "";
    };
  }, [
    showPlayer,
    showExerciseQuestions,
    selectedQuestionsVideo,
    exercisePanelVideo,
  ]);

  // ==========================================================
  // ORDRE DES SECTIONS
  // ==========================================================

  const orderedLevels =
    useMemo(() => {
      const knownLevels =
        NIVEAUX.filter(
          (niveau) =>
            filteredGroups[
              niveau.id
            ] &&
            filteredGroups[niveau.id]
              .length > 0
        ).map(
          (niveau) => niveau.id
        );

      const otherLevels =
        Object.keys(
          filteredGroups
        ).filter(
          (level) =>
            !NIVEAUX.some(
              (niveau) =>
                niveau.id === level
            )
        );

      return [
        ...knownLevels,
        ...otherLevels,
      ];
    }, [filteredGroups]);

  // ============================================================
  // RENDU
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-[#070b14] dark:text-white">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-[#070b14]/95">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">

          <button
            type="button"
            onClick={() =>
              navigate("/enseignant")
            }
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-100 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
            title="Retour"
          >
            <FaArrowLeft />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/20">
                <FaVideo className="text-lg text-white" />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold sm:text-2xl">
                  Mes vidéos
                </h1>

                <p className="truncate text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                  Gérez et consultez vos contenus pédagogiques
                </p>
              </div>

            </div>
          </div>

        </div>
      </header>

      {/* ======================================================
          CONTENU
      ====================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ====================================================
            TITRE
        ==================================================== */}

        <section className="mb-6">
          <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-xl shadow-gray-200/50 transition-colors duration-300 sm:p-7 dark:border-white/10 dark:from-[#101827] dark:to-[#0b111d] dark:shadow-2xl dark:shadow-black/20">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <div className="mb-3 flex items-center gap-2 text-blue-500 dark:text-blue-400">
                  <FaPlayCircle />

                  <span className="text-sm font-semibold uppercase tracking-wider">
                    Espace enseignant
                  </span>
                </div>

                <h2 className="text-2xl font-bold sm:text-3xl">
                  Votre bibliothèque vidéo
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400">
                  Retrouvez ici toutes les vidéos que
                  vous avez publiées sur CODE, organisées
                  par niveau et par domaine.
                </p>

              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                <div className="rounded-2xl border border-gray-200 bg-gray-100 p-4 transition-colors duration-300 dark:border-white/10 dark:bg-white/5">
                  <div className="mb-2 flex items-center gap-2 text-blue-500 dark:text-blue-400">
                    <FaVideo />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Vidéos
                    </span>
                  </div>

                  <p className="text-2xl font-bold">
                    {statistics.videos}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-100 p-4 transition-colors duration-300 dark:border-white/10 dark:bg-white/5">
                  <div className="mb-2 flex items-center gap-2 text-cyan-500 dark:text-cyan-400">
                    <FaGraduationCap />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Niveaux
                    </span>
                  </div>

                  <p className="text-2xl font-bold">
                    {statistics.classes}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-100 p-4 transition-colors duration-300 dark:border-white/10 dark:bg-white/5">
                  <div className="mb-2 flex items-center gap-2 text-purple-500 dark:text-purple-400">
                    <FaBookOpen />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Notions
                    </span>
                  </div>

                  <p className="text-2xl font-bold">
                    {statistics.notions}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-100 p-4 transition-colors duration-300 dark:border-white/10 dark:bg-white/5">
                  <div className="mb-2 flex items-center gap-2 text-emerald-500 dark:text-emerald-400">
                    <FaQuestionCircle />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Questions
                    </span>
                  </div>

                  <p className="text-2xl font-bold">
                    {statistics.questions}
                  </p>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ====================================================
            RECHERCHE + FILTRE
        ==================================================== */}

        <section className="mb-6">
          <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 transition-colors duration-300 lg:flex-row dark:border-white/10 dark:bg-[#0d1420]">

            <div className="relative flex-1">

              <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Rechercher une vidéo, une notion, une matière..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500/50 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500 dark:focus:bg-white/[0.07]"
              />

            </div>

            <div className="flex gap-2 overflow-x-auto">

              <button
                type="button"
                onClick={() =>
                  setSelectedLevel("all")
                }
                className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium transition ${
                  selectedLevel === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                }`}
              >
                Tous
              </button>

              {availableLevels.map(
                (niveau) => (
                  <button
                    key={niveau.id}
                    type="button"
                    onClick={() =>
                      setSelectedLevel(
                        niveau.id
                      )
                    }
                    className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium transition ${
                      selectedLevel ===
                      niveau.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                    }`}
                  >
                    {niveau.label}
                  </button>
                )
              )}

              {hasOtherDomains && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedLevel(
                      "other"
                    )
                  }
                  className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium transition ${
                    selectedLevel === "other"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
                >
                  Autres domaines
                </button>
              )}

            </div>
          </div>
        </section>

        {/* ====================================================
            CHARGEMENT
        ==================================================== */}

        {loading && (
          <section className="rounded-3xl border border-gray-200 bg-white p-10 text-center transition-colors duration-300 dark:border-white/10 dark:bg-[#0d1420]">

            <div className="mx-auto mb-5 flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-blue-500/10">
              <FaVideo className="text-2xl text-blue-500 dark:text-blue-400" />
            </div>

            <h3 className="text-lg font-semibold">
              Chargement de vos vidéos...
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Veuillez patienter quelques instants.
            </p>

          </section>
        )}

        {/* ====================================================
            ERREUR
        ==================================================== */}

        {!loading && error && (
          <section className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-500/20 dark:bg-red-500/5">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-500 dark:bg-red-500/10 dark:text-red-400">
              <FaTimes />
            </div>

            <h3 className="text-lg font-semibold text-red-600 dark:text-red-300">
              Une erreur est survenue
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600 dark:text-gray-400">
              {error}
            </p>

          </section>
        )}

        {/* ====================================================
            AUCUNE VIDÉO
        ==================================================== */}

        {!loading &&
          !error &&
          videos.length === 0 && (
            <section className="rounded-3xl border border-gray-200 bg-white p-10 text-center transition-colors duration-300 dark:border-white/10 dark:bg-[#0d1420]">

              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-500/10">
                <FaVideo className="text-3xl text-blue-500 dark:text-blue-400" />
              </div>

              <h3 className="text-xl font-bold">
                Aucune vidéo trouvée
              </h3>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600 dark:text-gray-400">
                Vous n'avez pas encore publié de vidéo
                pédagogique associée à votre compte.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/enseignant"
                  )
                }
                className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Retour à mon espace
              </button>

            </section>
          )}

        {/* ====================================================
            AUCUN RÉSULTAT DE RECHERCHE
        ==================================================== */}

        {!loading &&
          !error &&
          videos.length > 0 &&
          Object.keys(filteredGroups)
            .length === 0 && (
            <section className="rounded-3xl border border-gray-200 bg-white p-10 text-center transition-colors duration-300 dark:border-white/10 dark:bg-[#0d1420]">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/5">
                <FaSearch className="text-2xl text-gray-400 dark:text-gray-500" />
              </div>

              <h3 className="text-lg font-semibold">
                Aucun résultat
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Aucune vidéo ne correspond à votre
                recherche ou à votre filtre.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedLevel(
                    "all"
                  );
                }}
                className="mt-5 rounded-xl border border-gray-200 bg-gray-100 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-200 hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                Réinitialiser les filtres
              </button>

            </section>
          )}

        {/* ====================================================
            LISTE DES VIDÉOS
        ==================================================== */}

        {!loading &&
          !error &&
          Object.keys(filteredGroups)
            .length > 0 && (
            <div className="space-y-5">

              {orderedLevels.map(
                (level) => {
                  const levelVideos =
                    filteredGroups[
                      level
                    ];

                  if (
                    !levelVideos?.length
                  ) {
                    return null;
                  }

                  const knownLevel =
                    isKnownLevel(level);

                  const title =
                    knownLevel
                      ? getLevelLabel(
                          level
                        )
                      : "Autres domaines";

                  const description =
                    knownLevel
                      ? getLevelDescription(
                          level
                        )
                      : "Vidéos pédagogiques sans niveau scolaire";

                  const isExpanded =
                    expandedLevels[
                      level
                    ] !== false;

                  return (
                    <section
                      key={level}
                      className="overflow-hidden rounded-3xl border border-gray-200 bg-white transition-colors duration-300 dark:border-white/10 dark:bg-[#0d1420]"
                    >

                      {/* ========================================
                          EN-TÊTE SECTION
                      ======================================== */}

                      <button
                        type="button"
                        onClick={() =>
                          toggleLevel(
                            level
                          )
                        }
                        className="flex w-full items-center justify-between gap-4 border-b border-gray-200 p-5 text-left transition hover:bg-gray-50 sm:p-6 dark:border-white/10 dark:hover:bg-white/[0.03]"
                      >

                        <div className="flex min-w-0 items-center gap-4">

                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                              knownLevel
                                ? "bg-blue-500/10 text-blue-500 dark:text-blue-400"
                                : "bg-purple-500/10 text-purple-500 dark:text-purple-400"
                            }`}
                          >
                            {knownLevel ? (
                              <FaGraduationCap />
                            ) : (
                              <FaLayerGroup />
                            )}
                          </div>

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <h2 className="text-lg font-bold sm:text-xl">
                                {title}
                              </h2>

                              <span className="rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
                                {
                                  levelVideos.length
                                }{" "}
                                {levelVideos.length >
                                1
                                  ? "vidéos"
                                  : "vidéo"}
                              </span>

                            </div>

                            <p className="mt-1 text-sm text-gray-500">
                              {description}
                            </p>

                          </div>
                        </div>

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400">
                          {isExpanded ? (
                            <FaChevronUp />
                          ) : (
                            <FaChevronDown />
                          )}
                        </div>

                      </button>

                      {/* ========================================
                          CONTENU SECTION
                      ======================================== */}

                      {isExpanded && (
                        <div className="p-4 sm:p-6">

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

                            {levelVideos.map(
                              (video) => {
                                const videoUrl =
                                  getVideoUrl(
                                    video
                                  );

                                const youtube =
                                  isYouTubeUrl(
                                    videoUrl
                                  );

                                const activePanel =
                                  openDetailPanels[
                                    String(
                                      video.id
                                    )
                                  ] || null;

                                return (
                                  <article
                                    key={
                                      video.id
                                    }
                                    className="group overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 transition hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-950/20 dark:border-white/10 dark:bg-[#101827]"
                                  >

                                    {/* ==========================
                                        MINIATURE
                                    ========================== */}

                                    <div className="relative aspect-video overflow-hidden bg-black">

                                      {youtube ? (
                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-950/40 via-black to-black">

                                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-xl shadow-red-900/30 transition group-hover:scale-110">
                                            <FaYoutube className="text-2xl" />
                                          </div>

                                        </div>
                                      ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-950/50 via-[#101827] to-black">

                                          <FaVideo className="text-4xl text-blue-400/60" />

                                        </div>
                                      )}

                                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                      <div className="absolute left-3 top-3">
                                        <span className="rounded-lg border border-white/10 bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
                                          {knownLevel
                                            ? title
                                            : "Domaine"}
                                        </span>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          openVideo(
                                            video
                                          )
                                        }
                                        className="absolute inset-0 flex items-center justify-center"
                                        title="Lire la vidéo"
                                      >
                                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600/90 text-white opacity-90 shadow-xl transition group-hover:scale-110 group-hover:bg-blue-500">
                                          <FaPlay className="ml-1 text-lg" />
                                        </span>
                                      </button>

                                    </div>

                                    {/* ==========================
                                        INFORMATIONS
                                    ========================== */}

                                    <div className="p-4">

                                      <h3 className="line-clamp-2 min-h-[3.5rem] text-base font-bold text-gray-900 dark:text-white">
                                        {video.titre ||
                                          "Vidéo sans titre"}
                                      </h3>

                                      {video.matiere && (
                                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">

                                          <FaBookOpen className="shrink-0 text-blue-500 dark:text-blue-400" />

                                          <span className="truncate">
                                            {
                                              video.matiere
                                            }
                                          </span>

                                        </div>
                                      )}

                                      {/* ==========================
                                          APERÇU DES NOTIONS
                                      ========================== */}

                                      <div className="mt-3 flex flex-wrap gap-2">

                                        {video.notions
                                          ?.slice(
                                            0,
                                            3
                                          )
                                          .map(
                                            (
                                              notion,
                                              index
                                            ) => (
                                              <span
                                                key={`${video.id}-notion-${index}`}
                                                className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-400"
                                              >
                                                {
                                                  notion
                                                }
                                              </span>
                                            )
                                          )}

                                        {video.notions
                                          ?.length >
                                          3 && (
                                          <span className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-500">
                                            +
                                            {video
                                              .notions
                                              .length -
                                              3}
                                          </span>
                                        )}

                                      </div>

                                      {/* ==========================
                                          BOUTONS DÉTAILS
                                      ========================== */}

                                      <div className="mt-4 grid grid-cols-3 gap-2">

                                        {/* NOTIONS */}

                                        <button
                                          type="button"
                                          onClick={() =>
                                            toggleDetailPanel(
                                              String(
                                                video.id
                                              ),
                                              "notions"
                                            )
                                          }
                                          aria-expanded={
                                            activePanel ===
                                            "notions"
                                          }
                                          className={`rounded-xl p-2.5 text-center transition ${
                                            activePanel ===
                                            "notions"
                                              ? "bg-blue-600 text-white"
                                              : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                                          }`}
                                        >
                                          <FaBookOpen className="mx-auto mb-1 text-sm" />

                                          <p className="text-xs font-semibold">
                                            {video
                                              .notions
                                              ?.length ||
                                              0}
                                          </p>

                                          <p className="text-[10px] opacity-70">
                                            Notions
                                          </p>
                                        </button>

                                        {/* QUESTIONS */}

                                        <button
                                          type="button"
                                          onClick={() =>
                                            openQuestionsPanel(
                                              video
                                            )
                                          }
                                          aria-expanded={
                                            selectedQuestionsVideo?.id ===
                                            video.id
                                          }
                                          className={`rounded-xl p-2.5 text-center transition ${
                                            selectedQuestionsVideo?.id ===
                                            video.id
                                              ? "bg-purple-600 text-white"
                                              : "bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-purple-600 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-purple-500/10 dark:hover:text-purple-400"
                                          }`}
                                        >
                                          <FaQuestionCircle className="mx-auto mb-1 text-sm" />

                                          <p className="text-xs font-semibold">
                                            {video
                                              .questions
                                              ?.length ||
                                              0}
                                          </p>

                                          <p className="text-[10px] opacity-70">
                                            Questions
                                          </p>
                                        </button>

                                        {/* EXERCICES */}

                                        <button
                                          type="button"
                                          onClick={() =>
                                            toggleDetailPanel(
                                              String(
                                                video.id
                                              ),
                                              "exercices"
                                            )
                                          }
                                          aria-expanded={
                                            activePanel ===
                                            "exercices"
                                          }
                                          className={`rounded-xl p-2.5 text-center transition ${
                                            activePanel ===
                                            "exercices"
                                              ? "bg-emerald-600 text-white"
                                              : "bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                                          }`}
                                        >
                                          <FaList className="mx-auto mb-1 text-sm" />

                                          <p className="text-xs font-semibold">
                                            {video
                                              .exercices
                                              ?.length ||
                                              0}
                                          </p>

                                          <p className="text-[10px] opacity-70">
                                            Exercices
                                          </p>
                                        </button>

                                      </div>

                                      {/* ==================================================
                                          PANNEAU NOTIONS
                                      ================================================== */}

                                      {activePanel ===
                                        "notions" && (
                                        <div className="mt-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">

                                          <div className="mb-3 flex items-center justify-between gap-3">

                                            <div className="flex items-center gap-2">
                                              <FaBookOpen className="text-blue-500 dark:text-blue-400" />

                                              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                                Notions
                                              </h4>
                                            </div>

                                            <button
                                              type="button"
                                              onClick={() =>
                                                closeDetailPanel(
                                                  String(
                                                    video.id
                                                  )
                                                )
                                              }
                                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-red-500 hover:text-white dark:bg-white/10 dark:text-gray-300"
                                              title="Fermer"
                                              aria-label="Fermer les notions"
                                            >
                                              <FaTimes />
                                            </button>

                                          </div>

                                          {video.notions &&
                                          video.notions.length >
                                            0 ? (
                                            <div className="space-y-2">

                                              {video.notions.map(
                                                (
                                                  notion,
                                                  index
                                                ) => (
                                                  <div
                                                    key={`${video.id}-detail-notion-${index}`}
                                                    className="flex items-start gap-2 rounded-xl border border-blue-500/10 bg-white px-3 py-2 text-sm text-gray-700 dark:border-blue-400/10 dark:bg-white/5 dark:text-gray-300"
                                                  >
                                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-500 dark:text-blue-400">
                                                      {index +
                                                        1}
                                                    </span>

                                                    <span>
                                                      {
                                                        notion
                                                      }
                                                    </span>
                                                  </div>
                                                )
                                              )}

                                            </div>
                                          ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                              Aucune notion associée à cette vidéo.
                                            </p>
                                          )}

                                        </div>
                                      )}

                                      {/* ==================================================
                                          PANNEAU EXERCICES
                                      ================================================== */}

                                      {activePanel ===
                                        "exercices" && (
                                        <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">

                                          <div className="mb-3 flex items-center justify-between gap-3">

                                            <div className="flex items-center gap-2">
                                              <FaList className="text-emerald-500 dark:text-emerald-400" />

                                              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                                Exercices
                                              </h4>
                                            </div>

                                            <button
                                              type="button"
                                              onClick={() =>
                                                closeDetailPanel(
                                                  String(
                                                    video.id
                                                  )
                                                )
                                              }
                                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-red-500 hover:text-white dark:bg-white/10 dark:text-gray-300"
                                              title="Fermer"
                                              aria-label="Fermer les exercices"
                                            >
                                              <FaTimes />
                                            </button>

                                          </div>

                                          {video.exercices &&
                                          video.exercices.length >
                                            0 ? (
                                            <div className="space-y-2">

                                              {video.exercices.map(
                                                (
                                                  exercice,
                                                  index
                                                ) => (
                                                  <div
                                                    key={`${video.id}-detail-exercice-${index}`}
                                                    className="flex items-start gap-2 rounded-xl border border-emerald-500/10 bg-white px-3 py-2 text-sm text-gray-700 dark:border-emerald-400/10 dark:bg-white/5 dark:text-gray-300"
                                                  >
                                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-500 dark:text-emerald-400">
                                                      {index +
                                                        1}
                                                    </span>

                                                    <span className="min-w-0 flex-1">
                                                      {
                                                        exercice
                                                      }
                                                    </span>
                                                  </div>
                                                )
                                              )}

                                            </div>
                                          ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                              Aucun exercice associé à cette vidéo.
                                            </p>
                                          )}

                                          {video.exercices &&
                                            video.exercices.length >
                                              0 && (
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  toggleDetailPanel(
                                                    String(
                                                      video.id
                                                    ),
                                                    "exercices"
                                                  )
                                                }
                                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-500"
                                              >
                                                <FaPlay />
                                                Ouvrir les vidéos d'exercices
                                              </button>
                                            )}

                                        </div>
                                      )}

                                    </div>
                                  </article>
                                );
                              }
                            )}

                          </div>
                        </div>
                      )}

                    </section>
                  );
                }
              )}

            </div>
          )}

      </main>

      {/* ======================================================
          FENÊTRE CENTRÉE — QUESTIONS D'UNE VIDÉO
      ====================================================== */}

      {selectedQuestionsVideo && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm transition-colors duration-300 dark:bg-black/70 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Questions de la vidéo"
        >
          <div className="flex h-[90dvh] w-full max-w-4xl min-h-0 flex-col overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 text-gray-900 shadow-2xl transition-colors duration-300 dark:border-white/10 dark:bg-[#05070c] dark:text-white">

            {/* =================================================
                BARRE SUPÉRIEURE
            ================================================= */}

            <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 transition-colors duration-300 dark:border-white/10 dark:bg-[#080b12] sm:px-6">

              <div className="min-w-0 pr-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                    <FaQuestionCircle />
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                      Questions
                    </p>

                    <p className="truncate text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                      {selectedQuestionsVideo.titre}
                    </p>

                  </div>

                </div>

              </div>

              <button
                type="button"
                onClick={closeQuestionsPanel}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition hover:bg-red-500 hover:text-white dark:bg-white/10 dark:text-gray-300"
                title="Fermer"
                aria-label="Fermer les questions"
              >
                <FaTimes />
              </button>

            </div>

            {/* =================================================
                CONTENU QUESTIONS
            ================================================= */}

            <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 p-4 transition-colors duration-300 dark:bg-[#05070c] sm:p-6">

              <div className="mx-auto w-full max-w-4xl">

                {/* =================================================
                    INFORMATIONS VIDÉO
                ================================================= */}

                <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-[#101827]">

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="min-w-0">

                      <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                        Vidéo
                      </p>

                      <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                        {selectedQuestionsVideo.titre}
                      </h2>

                      {selectedQuestionsVideo.matiere && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {selectedQuestionsVideo.matiere}
                        </p>
                      )}

                    </div>

                    <div className="flex shrink-0 items-center gap-2 rounded-xl bg-purple-100 px-4 py-3 dark:bg-purple-500/10">

                      <FaQuestionCircle className="text-purple-600 dark:text-purple-400" />

                      <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                        {selectedQuestionsVideo.questions?.length || 0}{" "}
                        question
                        {(selectedQuestionsVideo.questions?.length || 0) > 1
                          ? "s"
                          : ""}
                      </span>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    QUESTIONS
                ================================================= */}

                {selectedQuestionsVideo.questions &&
                selectedQuestionsVideo.questions.length > 0 ? (

                  <div className="space-y-5">

                    {selectedQuestionsVideo.questions.map(
                      (question, index) => (

                        <article
                          key={`${selectedQuestionsVideo.id}-question-${question.id || index}`}
                          className="rounded-3xl border border-purple-200 bg-white p-5 shadow-lg transition-colors duration-300 dark:border-purple-500/20 dark:bg-[#101827]"
                        >

                          <div className="flex items-start gap-4">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                              {index + 1}
                            </div>

                            <div className="min-w-0 flex-1">

                              <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white sm:text-lg">
                                {question.question ||
                                  "Question sans texte"}
                              </h3>

                              {question.choix &&
                              question.choix.length > 0 && (

                                <div className="mt-4 space-y-2">

                                  {question.choix.map(
                                    (choix, choixIndex) => {

                                      const isCorrect =
                                        normalizeString(choix) ===
                                        normalizeString(
                                          question.bonne_reponse
                                        );

                                      return (
                                        <div
                                          key={`${selectedQuestionsVideo.id}-question-${index}-choice-${choixIndex}`}
                                          className={`rounded-xl border px-4 py-3 text-sm transition-colors duration-300 ${
                                            isCorrect
                                              ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                                              : "border-gray-200 bg-gray-50 text-gray-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300"
                                          }`}
                                        >

                                          <span className="mr-2 font-bold">
                                            {String.fromCharCode(
                                              65 + choixIndex
                                            )}
                                            .
                                          </span>

                                          {choix}

                                          {isCorrect && (
                                            <span className="ml-2 font-bold text-emerald-600 dark:text-emerald-400">
                                              ✓
                                            </span>
                                          )}

                                        </div>
                                      );
                                    }
                                  )}

                                </div>
                              )}

                            </div>

                          </div>

                        </article>
                      )
                    )}

                  </div>

                ) : (

                  <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-[#101827]">

                    <FaQuestionCircle className="mx-auto mb-4 text-4xl text-gray-400 dark:text-gray-600" />

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Aucune question
                    </h3>

                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Cette vidéo ne possède actuellement aucune
                      question associée.
                    </p>

                  </div>
                )}

              </div>

            </div>

          </div>
        </div>
      )}

      {/* ======================================================
          FENÊTRE MODALE CENTRÉE — EXERCICES
      ====================================================== */}

      {exercisePanelVideo && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm transition-colors duration-300 sm:p-6 dark:bg-black/70"
          role="dialog"
          aria-modal="true"
          aria-label="Vidéos des exercices"
        >

          <div
            className="flex h-[90dvh] w-full max-w-6xl min-h-0 flex-col overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 text-gray-900 shadow-2xl transition-colors duration-300 dark:border-white/10 dark:bg-[#05070c] dark:text-white"
          >

            {/* =================================================
                BARRE SUPÉRIEURE
            ================================================= */}

            <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 transition-colors duration-300 sm:px-6 dark:border-white/10 dark:bg-[#080b12]">

              <div className="min-w-0 pr-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <FaList />
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-base font-bold text-gray-900 sm:text-lg dark:text-white">
                      Exercices
                    </p>

                    <p className="truncate text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                      Vidéos d'exercices liées à:{" "}
                      {exercisePanelVideo.titre}
                    </p>

                  </div>

                </div>

              </div>

              <button
                type="button"
                onClick={closeExercisePanel}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition hover:bg-red-500 hover:text-white dark:bg-white/10 dark:text-gray-300"
                title="Fermer"
                aria-label="Fermer les exercices"
              >
                <FaTimes />
              </button>

            </div>

            {/* =================================================
                CONTENU
            ================================================= */}

            <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 p-4 transition-colors duration-300 sm:p-6 dark:bg-[#05070c]">

              {exerciseVideos.length === 0 ? (

                <div className="flex min-h-full items-center justify-center">

                  <div className="max-w-lg text-center">

                    <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10">
                      <FaVideo className="text-3xl text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Aucune vidéo d'exercice trouvée
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                      Les exercices associés à cette vidéo
                      ne correspondent actuellement à aucune
                      vidéo publiée dans votre bibliothèque.
                    </p>

                  </div>

                </div>

              ) : (

                <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

                  {exerciseVideos.map(
                    (
                      exerciseVideo,
                      index
                    ) => {

                      const videoUrl =
                        getVideoUrl(
                          exerciseVideo
                        );

                      const youtube =
                        isYouTubeUrl(
                          videoUrl
                        );

                      const questionsCount =
                        exerciseVideo.questions
                          ?.length || 0;

                      return (
                        <article
                          key={
                            exerciseVideo.id
                          }
                          className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl transition-colors duration-300 dark:border-white/10 dark:bg-[#101827]"
                        >

                          {/* =================================================
                              MINIATURE
                          ================================================= */}

                          <div className="relative aspect-video overflow-hidden bg-black">

                            {youtube ? (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-950/40 via-black to-black">

                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-xl">
                                  <FaYoutube className="text-2xl" />
                                </div>

                              </div>
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-950/40 via-gray-900 to-black">

                                <FaVideo className="text-5xl text-emerald-400/60" />

                              </div>
                            )}

                            <div className="absolute left-3 top-3">

                              <span className="rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                                Exercice{" "}
                                {index + 1}
                              </span>

                            </div>

                          </div>

                          {/* =================================================
                              INFORMATIONS
                          ================================================= */}

                          <div className="p-5">

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              {
                                exerciseVideo.titre
                              }
                            </h3>

                            {exerciseVideo.matiere && (
                              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">

                                <FaBookOpen className="text-blue-500 dark:text-blue-400" />

                                <span>
                                  {
                                    exerciseVideo.matiere
                                  }
                                </span>

                              </div>
                            )}

                            {exerciseVideo.notions &&
                              exerciseVideo.notions.length >
                                0 && (
                                <div className="mt-4 flex flex-wrap gap-2">

                                  {exerciseVideo.notions
                                    .slice(
                                      0,
                                      6
                                    )
                                    .map(
                                      (
                                        notion,
                                        notionIndex
                                      ) => (
                                        <span
                                          key={`${exerciseVideo.id}-exercise-notion-${notionIndex}`}
                                          className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-600 transition-colors dark:border-white/10 dark:bg-white/5 dark:text-gray-400"
                                        >
                                          {
                                            notion
                                          }
                                        </span>
                                      )
                                    )}

                                </div>
                              )}

                            {/* =================================================
                                BOUTONS
                            ================================================= */}

                            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">

                              <button
                                type="button"
                                onClick={() =>
                                  openVideo(
                                    exerciseVideo
                                  )
                                }
                                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                              >
                                <FaPlay />
                                Lire la vidéo
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openExerciseQuestions(
                                    exerciseVideo
                                  )
                                }
                                className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-500"
                              >
                                <FaQuestionCircle />

                                Questions

                                <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">
                                  {
                                    questionsCount
                                  }
                                </span>

                              </button>

                            </div>

                          </div>

                        </article>
                      );
                    }
                  )}

                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* ======================================================
          FENÊTRE CENTRÉE — QUESTIONS D'UN EXERCICE
      ====================================================== */}

      {showExerciseQuestions &&
        selectedExerciseVideo && (
          <div
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm transition-colors duration-300 dark:bg-black/70 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Questions de la vidéo d'exercice"
          >

            <div
              className="flex h-[90dvh] w-full max-w-4xl min-h-0 flex-col overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 text-gray-900 shadow-2xl transition-colors duration-300 dark:border-white/10 dark:bg-[#05070c] dark:text-white"
            >

              {/* =================================================
                  BARRE SUPÉRIEURE
              ================================================= */}

              <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 transition-colors duration-300 dark:border-white/10 dark:bg-[#080b12] sm:px-6">

                <div className="min-w-0 pr-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                      <FaQuestionCircle />
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                        Questions
                      </p>

                      <p className="truncate text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                        {selectedExerciseVideo.titre}
                      </p>

                    </div>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    closeExerciseQuestions
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition hover:bg-red-500 hover:text-white dark:bg-white/10 dark:text-gray-300"
                  title="Fermer"
                  aria-label="Fermer les questions"
                >
                  <FaTimes />
                </button>

              </div>

              {/* =================================================
                  CONTENU QUESTIONS
              ================================================= */}

              <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 p-4 transition-colors duration-300 dark:bg-[#05070c] sm:p-6">

                <div className="mx-auto w-full max-w-4xl">

                  {/* =================================================
                      INFORMATIONS VIDÉO
                  ================================================= */}

                  <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-[#101827]">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div className="min-w-0">

                        <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                          Vidéo d'exercice
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                          {selectedExerciseVideo.titre}
                        </h2>

                      </div>

                      <div className="flex shrink-0 items-center gap-2 rounded-xl bg-purple-100 px-4 py-3 dark:bg-purple-500/10">

                        <FaQuestionCircle className="text-purple-600 dark:text-purple-400" />

                        <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                          {selectedExerciseVideo.questions?.length || 0}{" "}
                          question
                          {(selectedExerciseVideo.questions?.length || 0) > 1
                            ? "s"
                            : ""}
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      QUESTIONS
                  ================================================= */}

                  {selectedExerciseVideo.questions &&
                  selectedExerciseVideo.questions.length > 0 ? (

                    <div className="space-y-5">

                      {selectedExerciseVideo.questions.map(
                        (question, index) => (

                          <article
                            key={`${selectedExerciseVideo.id}-exercise-question-${question.id || index}`}
                            className="rounded-3xl border border-purple-200 bg-white p-5 shadow-lg transition-colors duration-300 dark:border-purple-500/20 dark:bg-[#101827]"
                          >

                            <div className="flex items-start gap-4">

                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                                {index + 1}
                              </div>

                              <div className="min-w-0 flex-1">

                                <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white sm:text-lg">
                                  {question.question ||
                                    "Question sans texte"}
                                </h3>

                                {question.choix &&
                                question.choix.length > 0 && (

                                  <div className="mt-4 space-y-2">

                                    {question.choix.map(
                                      (choix, choixIndex) => {

                                        const isCorrect =
                                          normalizeString(choix) ===
                                          normalizeString(
                                            question.bonne_reponse
                                          );

                                        return (
                                          <div
                                            key={`${selectedExerciseVideo.id}-exercise-question-${index}-choice-${choixIndex}`}
                                            className={`rounded-xl border px-4 py-3 text-sm transition-colors duration-300 ${
                                              isCorrect
                                                ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                                                : "border-gray-200 bg-gray-50 text-gray-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300"
                                            }`}
                                          >

                                            <span className="mr-2 font-bold">
                                              {String.fromCharCode(
                                                65 + choixIndex
                                              )}
                                              .
                                            </span>

                                            {choix}

                                            {isCorrect && (
                                              <span className="ml-2 font-bold text-emerald-600 dark:text-emerald-400">
                                                ✓
                                              </span>
                                            )}

                                          </div>
                                        );
                                      }
                                    )}

                                  </div>
                                )}

                              </div>

                            </div>

                          </article>
                        )
                      )}

                    </div>

                  ) : (

                    <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-[#101827]">

                      <FaQuestionCircle className="mx-auto mb-4 text-4xl text-gray-400 dark:text-gray-600" />

                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Aucune question
                      </h3>

                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Cette vidéo d'exercice ne possède actuellement
                        aucune question associée.
                      </p>

                    </div>
                  )}

                </div>

              </div>

            </div>
          </div>
        )}

      {/* ======================================================
          LECTEUR VIDÉO PLEIN ÉCRAN
      ====================================================== */}

      {showPlayer &&
        selectedVideo && (
          <div
            className="fixed inset-0 z-[400] h-[100dvh] w-screen overflow-hidden bg-black"
            role="dialog"
            aria-modal="true"
            aria-label="Lecteur vidéo"
          >

            <div className="flex h-full min-h-0 w-full flex-col bg-black">

              {/* =================================================
                  BARRE SUPÉRIEURE
              ================================================= */}

              <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-[#080b12] px-3 sm:h-16 sm:px-5">

                <div className="min-w-0 pr-3">

                  <p className="truncate text-sm font-semibold text-white sm:text-base">
                    {selectedVideo.titre ||
                      "Lecture de la vidéo"}
                  </p>

                  {selectedVideo.matiere && (
                    <p className="truncate text-xs text-gray-500">
                      {
                        selectedVideo.matiere
                      }
                    </p>
                  )}

                </div>

                <button
                  type="button"
                  onClick={closePlayer}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-gray-300 transition hover:bg-white/20 hover:text-white"
                  title="Fermer"
                  aria-label="Fermer le lecteur"
                >
                  <FaTimes />
                </button>

              </div>

              {/* =================================================
                  ZONE VIDÉO
              ================================================= */}

              <div className="min-h-0 flex-1 bg-black">

                {(() => {
                  const videoUrl =
                    getVideoUrl(
                      selectedVideo
                    );

                  const youtube =
                    isYouTubeUrl(
                      videoUrl
                    );

                  if (!videoUrl) {
                    return (
                      <div className="flex h-full w-full items-center justify-center p-6 text-center">

                        <div>

                          <FaVideo className="mx-auto mb-4 text-4xl text-gray-600" />

                          <p className="text-lg font-semibold text-gray-300">
                            Vidéo indisponible
                          </p>

                          <p className="mt-2 text-sm text-gray-500">
                            Aucun fichier vidéo ou lien
                            YouTube n'est associé à cette
                            vidéo.
                          </p>

                        </div>

                      </div>
                    );
                  }

                  if (youtube) {
                    const embedUrl =
                      getYouTubeEmbedUrl(
                        videoUrl
                      );

                    if (!embedUrl) {
                      return (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          Lien YouTube invalide.
                        </div>
                      );
                    }

                    return (
                      <iframe
                        src={embedUrl}
                        title={
                          selectedVideo.titre ||
                          "Vidéo pédagogique"
                        }
                        className="block h-full w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    );
                  }

                  return (
                    <video
                      key={videoUrl}
                      src={videoUrl}
                      controls
                      autoPlay
                      playsInline
                      className="block h-full w-full bg-black object-contain"
                    >
                      Votre navigateur ne prend pas en charge
                      la lecture vidéo.
                    </video>
                  );
                })()}

              </div>

              {/* =================================================
                  INFORMATIONS SOUS LA VIDÉO
              ================================================= */}

              <div className="max-h-[35dvh] shrink-0 overflow-y-auto border-t border-white/10 bg-[#080b12]">

                <div className="mx-auto w-full max-w-7xl p-4 sm:p-5">

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

                    {/* DESCRIPTION */}

                    <div className="lg:col-span-2">

                      <div className="mb-3 flex items-center gap-2">
                        <FaBookOpen className="text-blue-400" />

                        <h3 className="font-semibold text-white">
                          Informations pédagogiques
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-2">

                        {selectedVideo.niveau && (
                          <span className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs text-blue-300">
                            {isKnownLevel(
                              selectedVideo.niveau
                            )
                              ? getLevelLabel(
                                  selectedVideo.niveau
                                )
                              : "Autres domaines"}
                          </span>
                        )}

                        {selectedVideo.matiere && (
                          <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300">
                            {
                              selectedVideo.matiere
                            }
                          </span>
                        )}

                        {selectedVideo.notions
                          ?.slice(0, 8)
                          .map(
                            (
                              notion,
                              index
                            ) => (
                              <span
                                key={`player-notion-${index}`}
                                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-400"
                              >
                                {notion}
                              </span>
                            )
                          )}

                      </div>

                    </div>

                    {/* STATISTIQUES */}

                    <div className="grid grid-cols-3 gap-2">

                      <div className="rounded-xl bg-white/5 p-3 text-center">
                        <FaBookOpen className="mx-auto mb-1 text-blue-400" />

                        <p className="text-sm font-bold text-white">
                          {
                            selectedVideo
                              .notions
                              ?.length
                          }
                        </p>

                        <p className="text-[10px] text-gray-500">
                          Notions
                        </p>
                      </div>

                      <div className="rounded-xl bg-white/5 p-3 text-center">
                        <FaQuestionCircle className="mx-auto mb-1 text-purple-400" />

                        <p className="text-sm font-bold text-white">
                          {
                            selectedVideo
                              .questions
                              ?.length
                          }
                        </p>

                        <p className="text-[10px] text-gray-500">
                          Questions
                        </p>
                      </div>

                      <div className="rounded-xl bg-white/5 p-3 text-center">
                        <FaList className="mx-auto mb-1 text-emerald-400" />

                        <p className="text-sm font-bold text-white">
                          {
                            selectedVideo
                              .exercices
                              ?.length
                          }
                        </p>

                        <p className="text-[10px] text-gray-500">
                          Exercices
                        </p>
                      </div>

                    </div>

                  </div>

                  {/* PRÉREQUIS */}

                  {selectedVideo.prerequis &&
                    selectedVideo.prerequis
                      .length > 0 && (
                      <div className="mt-4">

                        <div className="mb-2 flex items-center gap-2">
                          <FaCheckCircle className="text-emerald-400" />

                          <h4 className="text-sm font-semibold text-gray-300">
                            Prérequis
                          </h4>
                        </div>

                        <div className="flex flex-wrap gap-2">

                          {selectedVideo.prerequis.map(
                            (
                              prerequis,
                              index
                            ) => (
                              <span
                                key={`prerequis-${index}`}
                                className="rounded-lg border border-emerald-500/10 bg-emerald-500/5 px-3 py-1.5 text-xs text-gray-400"
                              >
                                {
                                  prerequis
                                }
                              </span>
                            )
                          )}

                        </div>

                      </div>
                    )}

                </div>
              </div>

            </div>
          </div>
        )}

    </div>
  );
};

export default MesVideos;