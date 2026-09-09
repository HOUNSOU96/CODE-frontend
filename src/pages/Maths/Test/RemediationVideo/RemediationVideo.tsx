import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/utils/axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ChevronRight,
  X,
  List,
} from "lucide-react";
import CountdownCircle from "@/components/CountdownCircle";
import { useExitNotifier } from "@/hooks/useExitNotifier";

// ============================================================
// TYPES
// ============================================================

interface Question {
  id: number;
  question: string;
  options: string[];
  bonne_reponse: string;
  explication?: string;
}

interface VideoData {
  id: number;
  titre: string;
  niveau: string;
  fichier: string;

  // Conservé pour ne pas toucher au backend.
  // Cette donnée n'est simplement plus affichée.
  mois?: string;

  notions?: string[];
  prerequis?: string[];
  questions?: Question[];
  videoUrl?: string;
  exercices?: string[];
  enseignant?: string | null;
}

interface TeacherProfile {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  pays_residence?: string | null;
  subjects?: string[];
  teacher_photo?: string | null;
}

// ============================================================
// COMPOSANT
// ============================================================

const RemediationVideo: React.FC = () => {
  const navigate = useNavigate();

  const { niveau, serie } = useParams<{
    niveau: string;
    serie?: string;
  }>();

  // ============================================================
  // ETATS
  // ============================================================

  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [teacherProfiles, setTeacherProfiles] = useState<
    Record<string, TeacherProfile>
  >({});

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // ============================================================
  // RECUPERATION DES VIDEOS
  // ============================================================

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/api/videos/remediation", {
          params: {
            niveau,
            serie,
          },
        });

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.videos || [];

        setVideos(data);
      } catch (err) {
        console.error("Erreur récupération vidéos :", err);

        setError(
          "Impossible de récupérer les vidéos de remédiation."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [niveau, serie]);

  // ============================================================
  // VIDEOS ORDONNEES
  // ============================================================

  const orderedVideos = [...videos];

  // ============================================================
  // VIDEO COURANTE
  // ============================================================

  const currentVideo =
    orderedVideos.length > 0
      ? orderedVideos[currentVideoIndex]
      : null;

  // ============================================================
  // RECUPERATION DES PROFILS ENSEIGNANTS
  // ============================================================

  useEffect(() => {
    const fetchTeacherProfiles = async () => {
      const emails = Array.from(
        new Set(
          orderedVideos
            .map((video) => video.enseignant)
            .filter(
              (email): email is string =>
                Boolean(email)
            )
        )
      );

      if (emails.length === 0) {
        return;
      }

      const profiles: Record<string, TeacherProfile> = {};

      await Promise.all(
        emails.map(async (email) => {
          try {
            const response = await api.get(
              "/api/teacher/public-profile",
              {
                params: {
                  email,
                },
              }
            );

            profiles[email] = response.data;
          } catch (err) {
            console.error(
              `Erreur récupération profil enseignant ${email}:`,
              err
            );
          }
        })
      );

      setTeacherProfiles(profiles);
    };

    if (orderedVideos.length > 0) {
      fetchTeacherProfiles();
    }
  }, [videos]);

  // ============================================================
  // ENSEIGNANT DE LA VIDEO COURANTE
  // ============================================================

  const currentTeacher =
    currentVideo?.enseignant
      ? teacherProfiles[currentVideo.enseignant]
      : null;

  // ============================================================
  // URL PHOTO ENSEIGNANT
  // ============================================================

  const currentTeacherPhoto =
    currentTeacher?.teacher_photo
      ? currentTeacher.teacher_photo.startsWith("http")
        ? currentTeacher.teacher_photo
        : `${
            api.defaults.baseURL?.replace(/\/$/, "") || ""
          }/${currentTeacher.teacher_photo.replace(/^\//, "")}`
      : null;

  // ============================================================
  // NOM ENSEIGNANT
  // ============================================================

  const currentTeacherName =
    currentTeacher
      ? `${currentTeacher.prenom || ""} ${
          currentTeacher.nom || ""
        }`.trim()
      : currentVideo?.enseignant || "";

  // ============================================================
  // QUESTIONS DE LA VIDEO
  // ============================================================

  const questions = currentVideo?.questions || [];

  const currentQuestion =
    questions.length > 0
      ? questions[currentQuestionIndex]
      : null;

  // ============================================================
  // VIDEO URL
  // ============================================================

  const getVideoUrl = (video: VideoData) => {
    if (!video) return "";

    if (video.videoUrl) {
      if (
        video.videoUrl.startsWith("http://") ||
        video.videoUrl.startsWith("https://")
      ) {
        return video.videoUrl;
      }

      return `${
        api.defaults.baseURL?.replace(/\/$/, "") || ""
      }/${video.videoUrl.replace(/^\//, "")}`;
    }

    if (video.fichier) {
      if (
        video.fichier.startsWith("http://") ||
        video.fichier.startsWith("https://")
      ) {
        return video.fichier;
      }

      return `${
        api.defaults.baseURL?.replace(/\/$/, "") || ""
      }/${video.fichier.replace(/^\//, "")}`;
    }

    return "";
  };

  // ============================================================
  // CHANGEMENT DE VIDEO
  // ============================================================

  const handleVideoChange = (index: number) => {
    setCurrentVideoIndex(index);

    setShowQuiz(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
    setScore(0);
    setQuizFinished(false);

    setIsSidebarOpen(false);

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    }, 100);
  };

  // ============================================================
  // DEMARRER LE QUIZ
  // ============================================================

  const handleStartQuiz = () => {
    if (!questions.length) {
      return;
    }

    setShowQuiz(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
    setScore(0);
    setQuizFinished(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ============================================================
  // SELECTION REPONSE
  // ============================================================

  const handleSelectAnswer = (answer: string) => {
    if (answerSubmitted) {
      return;
    }

    setSelectedAnswer(answer);
  };

  // ============================================================
  // VALIDATION REPONSE
  // ============================================================

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) {
      return;
    }

    const isCorrect =
      selectedAnswer === currentQuestion.bonne_reponse;

    if (isCorrect) {
      setScore((previous) => previous + 1);
    }

    setAnswerSubmitted(true);
  };

  // ============================================================
  // QUESTION SUIVANTE
  // ============================================================

  const handleNextQuestion = () => {
    if (!answerSubmitted) {
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(
        (previous) => previous + 1
      );

      setSelectedAnswer(null);
      setAnswerSubmitted(false);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      setQuizFinished(true);
    }
  };

  // ============================================================
  // RETOUR VIDEO
  // ============================================================

  const handleBackToVideo = () => {
    setShowQuiz(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
    setQuizFinished(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ============================================================
  // CHARGEMENT
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />

          <p className="text-gray-600 dark:text-gray-300">
            Chargement des vidéos de remédiation...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERREUR
  // ============================================================

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="text-5xl mb-4">
            ⚠️
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Une erreur est survenue
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error}
          </p>

          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // AUCUNE VIDEO
  // ============================================================

  if (!currentVideo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="text-5xl mb-4">
            🎥
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Aucune vidéo disponible
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Aucune vidéo de remédiation n'est disponible
            pour cette sélection.
          </p>

          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDU
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">

      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />

            <span className="font-semibold">
              Retour
            </span>
          </button>

          <div className="text-center min-w-0">

            <p className="text-xs text-gray-500 dark:text-gray-400">
              NIVEAU
            </p>

            <h1 className="font-bold truncate">
              {niveau}
              {serie ? ` — ${serie}` : ""}
            </h1>

          </div>

          <button
            onClick={() =>
              setIsSidebarOpen((previous) => !previous)
            }
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition"
          >
            <List className="w-5 h-5" />

            <span className="hidden sm:inline">
              Vidéos
            </span>
          </button>

        </div>
      </div>

      {/* ========================================================
          CONTENU PRINCIPAL
      ======================================================== */}

      <div className="max-w-7xl mx-auto px-4 py-6">

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

          {/* ====================================================
              COLONNE PRINCIPALE
          ==================================================== */}

          <main>

            <AnimatePresence mode="wait">

              <motion.div
                key={`${currentVideo.id}-${showQuiz}`}
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
                  duration: 0.25,
                }}
              >

                {/* ==================================================
                    TITRE VIDEO

                    IMPORTANT :
                    "mois" n'est volontairement PAS affiché ici.
                ================================================== */}

                <div className="mb-5">

                  <h2 className="text-2xl md:text-3xl font-extrabold">
                    {currentVideo.titre}
                  </h2>

                </div>

                {/* ==================================================
                    ENSEIGNANT SOUS LE TITRE

                    Ce bloc disparaît lorsque showQuiz === true.
                ================================================== */}

                {!showQuiz &&
                  currentVideo?.enseignant && (
                    <div className="mb-6">

                      <button
                        type="button"
                        onClick={() => {
                          const teacherEmail =
                            currentTeacher?.email ||
                            currentVideo.enseignant;

                          if (teacherEmail) {
                            navigate(
                              `/enseignant/profil/${encodeURIComponent(
                                teacherEmail
                              )}`
                            );
                          }
                        }}
                        className="group flex items-center gap-3 w-full p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:shadow-md transition-all"
                      >

                        {currentTeacherPhoto ? (
                          <img
                            src={currentTeacherPhoto}
                            alt={currentTeacherName}
                            className="w-11 h-11 rounded-full object-cover border-2 border-blue-500 shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
                            👨‍🏫
                          </div>
                        )}

                        <div className="text-left min-w-0">

                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Enseignant de cette vidéo
                          </p>

                          <p className="font-bold text-blue-700 dark:text-blue-300 group-hover:underline truncate">
                            {currentTeacherName}
                          </p>

                        </div>

                      </button>

                    </div>
                  )}

                {/* ==================================================
                    VIDEO
                ================================================== */}

                {!showQuiz && (
                  <div className="rounded-3xl overflow-hidden bg-black shadow-xl">

                    <video
                      ref={videoRef}
                      key={currentVideo.id}
                      src={getVideoUrl(currentVideo)}
                      controls
                      playsInline
                      className="w-full aspect-video object-contain bg-black"
                    />

                  </div>
                )}

                {/* ==================================================
                    INFORMATIONS VIDEO
                ================================================== */}

                {!showQuiz && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* NOTIONS */}

                    {currentVideo.notions &&
                      currentVideo.notions.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">

                          <h3 className="font-bold text-lg mb-3">
                            📚 Notions travaillées
                          </h3>

                          <div className="flex flex-wrap gap-2">

                            {currentVideo.notions.map(
                              (notion, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm"
                                >
                                  {notion}
                                </span>
                              )
                            )}

                          </div>

                        </div>
                      )}

                    {/* PREREQUIS */}

                    {currentVideo.prerequis &&
                      currentVideo.prerequis.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">

                          <h3 className="font-bold text-lg mb-3">
                            🔑 Prérequis
                          </h3>

                          <div className="flex flex-wrap gap-2">

                            {currentVideo.prerequis.map(
                              (prerequis, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-sm"
                                >
                                  {prerequis}
                                </span>
                              )
                            )}

                          </div>

                        </div>
                      )}

                  </div>
                )}

                {/* ==================================================
                    BOUTON EVALUATION
                ================================================== */}

                {!showQuiz &&
                  questions.length > 0 && (
                    <div className="mt-8">

                      <button
                        onClick={handleStartQuiz}
                        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                      >
                        Commencer l'évaluation
                      </button>

                    </div>
                  )}

                {/* ==================================================
                    QUIZ
                ================================================== */}

                {showQuiz && (
                  <div className="space-y-6">

                    {/* ==================================================
                        BARRE DE PROGRESSION
                    ================================================== */}

                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">

                      <div className="flex items-center justify-between gap-4 mb-3">

                        <div>

                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Progression
                          </p>

                          <p className="font-bold">
                            Question{" "}
                            {Math.min(
                              currentQuestionIndex + 1,
                              questions.length
                            )}{" "}
                            / {questions.length}
                          </p>

                        </div>

                        <div className="text-right">

                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Score
                          </p>

                          <p className="font-bold text-blue-600 dark:text-blue-400">
                            {score} / {questions.length}
                          </p>

                        </div>

                      </div>

                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">

                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                          initial={{
                            width: 0,
                          }}
                          animate={{
                            width: `${
                              ((currentQuestionIndex + 1) /
                                questions.length) *
                              100
                            }%`,
                          }}
                          transition={{
                            duration: 0.3,
                          }}
                        />

                      </div>

                    </div>

                    {/* ==================================================
                        ENSEIGNANT PENDANT LES QUESTIONS
                    ================================================== */}

                    {currentVideo?.enseignant && (
                      <div className="mb-6">

                        <button
                          type="button"
                          onClick={() => {
                            const teacherEmail =
                              currentTeacher?.email ||
                              currentVideo.enseignant;

                            if (teacherEmail) {
                              navigate(
                                `/enseignant/profil/${encodeURIComponent(
                                  teacherEmail
                                )}`
                              );
                            }
                          }}
                          className="group flex items-center gap-3 w-full p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:shadow-md transition-all"
                        >

                          {currentTeacherPhoto ? (
                            <img
                              src={currentTeacherPhoto}
                              alt={currentTeacherName}
                              className="w-11 h-11 rounded-full object-cover border-2 border-blue-500 shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
                              👨‍🏫
                            </div>
                          )}

                          <div className="text-left min-w-0">

                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Enseignant de cette vidéo
                            </p>

                            <p className="font-bold text-blue-700 dark:text-blue-300 group-hover:underline truncate">
                              {currentTeacherName}
                            </p>

                          </div>

                        </button>

                      </div>
                    )}

                    {/* ==================================================
                        RESULTAT FINAL
                    ================================================== */}

                    {quizFinished ? (

                      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8 text-center shadow-lg">

                        <div className="text-6xl mb-5">
                          {score === questions.length
                            ? "🎉"
                            : score >=
                              questions.length * 0.75
                            ? "👏"
                            : "📚"}
                        </div>

                        <h2 className="text-3xl font-extrabold mb-3">
                          Évaluation terminée
                        </h2>

                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                          Vous avez obtenu
                        </p>

                        <div className="text-5xl font-black text-blue-600 dark:text-blue-400 mb-6">
                          {score} / {questions.length}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">

                          <button
                            onClick={() => {
                              setCurrentQuestionIndex(0);
                              setSelectedAnswer(null);
                              setAnswerSubmitted(false);
                              setScore(0);
                              setQuizFinished(false);
                            }}
                            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition"
                          >
                            Recommencer
                          </button>

                          <button
                            onClick={handleBackToVideo}
                            className="px-6 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold transition"
                          >
                            Revoir la vidéo
                          </button>

                        </div>

                      </div>

                    ) : (

                      <>

                        {/* ==================================================
                            QUESTION
                        ================================================== */}

                        {currentQuestion && (

                          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 shadow-lg">

                            <h2 className="text-xl md:text-2xl font-bold mb-8 leading-relaxed">
                              {currentQuestion.question}
                            </h2>

                            {/* OPTIONS */}

                            <div className="space-y-3">

                              {currentQuestion.options.map(
                                (option, index) => {

                                  const isSelected =
                                    selectedAnswer === option;

                                  const isCorrect =
                                    answerSubmitted &&
                                    option ===
                                      currentQuestion.bonne_reponse;

                                  const isWrong =
                                    answerSubmitted &&
                                    isSelected &&
                                    option !==
                                      currentQuestion.bonne_reponse;

                                  return (

                                    <button
                                      key={index}
                                      type="button"
                                      disabled={answerSubmitted}
                                      onClick={() =>
                                        handleSelectAnswer(
                                          option
                                        )
                                      }
                                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                                        isCorrect
                                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                          : isWrong
                                          ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                          : isSelected
                                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                          : "border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                      }`}
                                    >

                                      <div className="flex items-start gap-3">

                                        <span
                                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold ${
                                            isCorrect
                                              ? "bg-green-500 text-white"
                                              : isWrong
                                              ? "bg-red-500 text-white"
                                              : isSelected
                                              ? "bg-blue-600 text-white"
                                              : "bg-gray-100 dark:bg-gray-700"
                                          }`}
                                        >
                                          {String.fromCharCode(
                                            65 + index
                                          )}
                                        </span>

                                        <span className="pt-1">
                                          {option}
                                        </span>

                                      </div>

                                    </button>
                                  );
                                }
                              )}

                            </div>

                            {/* ==================================================
                                EXPLICATION
                            ================================================== */}

                            {answerSubmitted &&
                              currentQuestion.explication && (

                                <div className="mt-6 p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">

                                  <p className="font-bold text-blue-700 dark:text-blue-300 mb-2">
                                    Explication
                                  </p>

                                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {currentQuestion.explication}
                                  </p>

                                </div>
                              )}

                            {/* ==================================================
                                BOUTON VALIDATION / SUIVANT
                            ================================================== */}

                            <div className="mt-8 flex justify-end">

                              {!answerSubmitted ? (

                                <button
                                  onClick={
                                    handleSubmitAnswer
                                  }
                                  disabled={!selectedAnswer}
                                  className={`px-6 py-3 rounded-xl font-bold transition ${
                                    selectedAnswer
                                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                                      : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                                  }`}
                                >
                                  Valider la réponse
                                </button>

                              ) : (

                                <button
                                  onClick={
                                    handleNextQuestion
                                  }
                                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition"
                                >

                                  {currentQuestionIndex <
                                  questions.length - 1
                                    ? "Question suivante"
                                    : "Voir le résultat"}

                                  <ChevronRight className="w-5 h-5" />

                                </button>
                              )}

                            </div>

                          </div>
                        )}

                        {/* ==================================================
                            RETOUR A LA VIDEO
                        ================================================== */}

                        <button
                          onClick={handleBackToVideo}
                          className="w-full py-3 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition"
                        >
                          ← Revenir à la vidéo
                        </button>

                      </>
                    )}

                  </div>
                )}

              </motion.div>

            </AnimatePresence>

          </main>

          {/* ========================================================
              SIDEBAR DES VIDEOS
          ======================================================== */}

          <aside
            className={`lg:block ${
              isSidebarOpen ? "block" : "hidden"
            }`}
          >

            <div className="sticky top-24">

              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">

                {/* HEADER SIDEBAR */}

                <div className="p-5 border-b border-gray-200 dark:border-gray-700">

                  <div className="flex items-center justify-between gap-3">

                    <div>

                      <h3 className="font-extrabold text-lg">
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
                      onClick={() =>
                        setIsSidebarOpen(false)
                      }
                      className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
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
                        index === currentVideoIndex;

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
                            : `${
                                api.defaults.baseURL?.replace(
                                  /\/$/,
                                  ""
                                ) || ""
                              }/${teacher.teacher_photo.replace(
                                /^\//,
                                ""
                              )}`
                          : null;

                      const teacherName = teacher
                        ? `${teacher.prenom || ""} ${
                            teacher.nom || ""
                          }`.trim()
                        : video.enseignant || "";

                      return (

                        <div
                          key={video.id}
                          className={`rounded-2xl border transition-all ${
                            isActive
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                          }`}
                        >

                          {/* VIDEO */}

                          <button
                            type="button"
                            onClick={() =>
                              handleVideoChange(index)
                            }
                            className="w-full text-left p-4"
                          >

                            <div className="flex items-start gap-3">

                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                                  isActive
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-700"
                                }`}
                              >
                                {index + 1}
                              </div>

                              <div className="min-w-0">

                                <p
                                  className={`font-bold ${
                                    isActive
                                      ? "text-blue-700 dark:text-blue-300"
                                      : ""
                                  }`}
                                >
                                  {video.titre}
                                </p>

                              </div>

                            </div>

                          </button>

                          {/* ==================================================
                              ENSEIGNANT SIDEBAR

                              "mois" n'est volontairement PAS affiché.
                          ================================================== */}

                          {video.enseignant && (

                            <button
                              type="button"
                              onClick={() => {
                                navigate(
                                  `/enseignant/profil/${encodeURIComponent(
                                    video.enseignant!
                                  )}`
                                );
                              }}
                              className="w-full flex items-center gap-2 px-4 pb-4 pt-0 text-left group"
                            >

                              {teacherPhoto ? (

                                <img
                                  src={teacherPhoto}
                                  alt={teacherName}
                                  className="w-8 h-8 rounded-full object-cover border border-blue-500 shrink-0"
                                />

                              ) : (

                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm shrink-0">
                                  👨‍🏫
                                </div>

                              )}

                              <div className="min-w-0">

                                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                  Enseignant
                                </p>

                                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 group-hover:underline truncate">
                                  {teacherName}
                                </p>

                              </div>

                            </button>
                          )}

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

            </div>

          </aside>

        </div>

      </div>

    </div>
  );
};

export default RemediationVideo;