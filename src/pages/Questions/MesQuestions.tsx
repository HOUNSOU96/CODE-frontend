
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  ShieldCheck,
  BookOpen,
  ArrowLeft,
  Sparkles,
  Inbox,
  Activity,
  CircleDot,
  CalendarDays,
  MessageSquareText,
} from "lucide-react";

import api from "../../utils/axios";

// ============================================================
// TYPES
// ============================================================

type QuestionStatus =
  | "waiting"
  | "in_progress"
  | "answered"
  | "expired";

type QuestionMessage = {
  id: number;
  sender_role: string;
  content: string;
  created_at: string;
};

type Question = {
  id: number;

  recipient_type: "admin" | "subject";

  subject?: string | null;

  is_learner: boolean;

  learner_class?: string | null;

  title: string;

  content: string;

  status: QuestionStatus;

  created_at: string;

  expires_at: string;

  updated_at: string;

  messages?: QuestionMessage[];
};

// ============================================================
// COMPOSANT
// ============================================================

const MesQuestions: React.FC = () => {
  const navigate = useNavigate();

  // ----------------------------------------------------------
  // ÉTATS
  // ----------------------------------------------------------

  const [questions, setQuestions] = useState<Question[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);

  // ==========================================================
  // RETOUR À LA PAGE PRÉCÉDENTE
  // ==========================================================

  const retourPagePrecedente = () => {
    navigate(-1);
  };

  // ==========================================================
  // CHARGEMENT DES QUESTIONS DE L'UTILISATEUR
  // ==========================================================

  const chargerQuestions = useCallback(
    async (silent = false) => {
      try {
        // ------------------------------------------------------
        // État de chargement
        // ------------------------------------------------------

        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        console.log(
          "📨 Chargement des questions de l'utilisateur..."
        );

        // ------------------------------------------------------
        // APPEL BACKEND
        //
        // GET /api/questions/my
        //
        // Le token JWT est ajouté automatiquement par
        // ../../utils/axios.ts
        // ------------------------------------------------------

        const response = await api.get<Question[]>(
          "/api/questions/my"
        );

        console.log(
          "✅ Questions reçues du backend :",
          response.data
        );

        // ------------------------------------------------------
        // Sécurité : vérifier que le backend renvoie bien
        // un tableau
        // ------------------------------------------------------

        if (Array.isArray(response.data)) {
          setQuestions(response.data);
        } else {
          console.error(
            "⚠️ Réponse inattendue du backend :",
            response.data
          );

          setQuestions([]);

          setError(
            "Le serveur a retourné des données inattendues."
          );
        }
      } catch (err: any) {
        console.error(
          "❌ Erreur lors du chargement des questions :",
          err
        );

        // ------------------------------------------------------
        // Récupération du message FastAPI
        // ------------------------------------------------------

        const statusCode = err?.response?.status;

        const backendMessage =
          err?.response?.data?.detail;

        // ------------------------------------------------------
        // Messages adaptés aux différents cas
        // ------------------------------------------------------

        if (statusCode === 401) {
          setError(
            "Votre session a expiré ou vous n'êtes pas authentifié."
          );
        } else if (statusCode === 403) {
          setError(
            "Vous n'avez pas l'autorisation d'accéder à vos questions."
          );
        } else if (statusCode === 404) {
          setError(
            "Le service des questions est introuvable."
          );
        } else if (statusCode === 500) {
          setError(
            "Une erreur interne est survenue sur le serveur."
          );
        } else if (backendMessage) {
          setError(backendMessage);
        } else if (err?.request) {
          setError(
            "Impossible de contacter le serveur. Vérifiez que le backend CODE est bien démarré."
          );
        } else {
          setError(
            "Impossible de charger vos questions."
          );
        }

        setQuestions([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // ==========================================================
  // CHARGEMENT INITIAL
  // ==========================================================

  useEffect(() => {
    chargerQuestions();
  }, [chargerQuestions]);

  // ==========================================================
  // FORMATAGE DES DATES
  // ==========================================================

  const formatDate = (date: string) => {
    try {
      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        return date;
      }

      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(parsedDate);
    } catch {
      return date;
    }
  };

  // ==========================================================
  // INFORMATIONS SUR LE STATUT
  // ==========================================================

  const getStatusInfo = (status: QuestionStatus) => {
    switch (status) {
      case "waiting":
        return {
          label: "En attente",
          icon: Clock,
          className:
            "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-300",
        };

      case "in_progress":
        return {
          label: "En cours",
          icon: MessageCircle,
          className:
            "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-300",
        };

      case "answered":
        return {
          label: "Répondue",
          icon: CheckCircle2,
          className:
            "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300",
        };

      case "expired":
        return {
          label: "Expirée",
          icon: AlertCircle,
          className:
            "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400",
        };

      default:
        return {
          label: status,
          icon: Clock,
          className:
            "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400",
        };
    }
  };

  // ==========================================================
  // INFORMATIONS SUR LE DESTINATAIRE
  // ==========================================================

  const getRecipientInfo = (question: Question) => {
    if (question.recipient_type === "admin") {
      return {
        label: "Administrateur CODE",
        icon: ShieldCheck,
      };
    }

    return {
      label: question.subject || "Matière",
      icon: BookOpen,
    };
  };

  // ==========================================================
  // STATISTIQUES
  // ==========================================================

  const statistiques = useMemo(() => {
    return {
      total: questions.length,

      waiting: questions.filter(
        (question) =>
          question.status === "waiting"
      ).length,

      inProgress: questions.filter(
        (question) =>
          question.status === "in_progress"
      ).length,

      answered: questions.filter(
        (question) =>
          question.status === "answered"
      ).length,

      expired: questions.filter(
        (question) =>
          question.status === "expired"
      ).length,
    };
  }, [questions]);

  // ==========================================================
  // OUVRIR UNE CONVERSATION
  // ==========================================================

  const ouvrirQuestion = (questionId: number) => {
    console.log(
      "➡️ Ouverture de la question :",
      questionId
    );

    navigate(`/questions/${questionId}`);
  };

  // ==========================================================
  // NOUVELLE QUESTION
  // ==========================================================

  const nouvelleQuestion = () => {
    console.log(
      "➡️ Navigation vers la création d'une question"
    );

    navigate("/questions/nouvelle");
  };

  // ==========================================================
  // RENDU
  // ==========================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100 md:px-8 md:py-8">

      {/* ======================================================
          ARRIÈRE-PLAN DÉCORATIF
          ====================================================== */}

      <div className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-600/10" />

      <div className="pointer-events-none absolute right-[-180px] top-[20%] h-[420px] w-[420px] rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-600/10" />

      <div className="pointer-events-none absolute bottom-[-180px] left-[25%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl dark:bg-cyan-500/5" />

      <div className="relative mx-auto max-w-6xl">

        {/* ==================================================
            BOUTON RETOUR
            ================================================== */}

        <button
          type="button"
          onClick={retourPagePrecedente}
          className="group mb-6 inline-flex items-center gap-2 rounded-xl border border-transparent px-2 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-blue-400"
        >
          <ArrowLeft
            size={18}
            className="transition-transform group-hover:-translate-x-0.5"
          />

          Retour
        </button>

        {/* ==================================================
            EN-TÊTE
            ================================================== */}

        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div className="min-w-0">

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-300">

              <Sparkles size={14} />

              Espace de communication CODE

            </div>

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 dark:bg-blue-500">

                <MessageCircle size={27} />

              </div>

              <div className="min-w-0">

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                  Mes questions
                </h1>

                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Consultez et poursuivez vos échanges avec l'équipe CODE et les enseignants.
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              ACTIONS
              ================================================= */}

          <div className="flex flex-col gap-2 sm:flex-row">

            <button
              type="button"
              onClick={() => chargerQuestions(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
            >

              {refreshing ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <RefreshCw size={18} />
              )}

              Actualiser

            </button>

            <button
              type="button"
              onClick={nouvelleQuestion}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-blue-600/30 dark:bg-blue-500 dark:hover:bg-blue-600"
            >

              <Plus size={19} />

              Nouvelle question

            </button>

          </div>

        </div>

        {/* ==================================================
            STATISTIQUES
            ================================================== */}

        {!loading && questions.length > 0 && (
          <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-5">

            {/* TOTAL */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <div className="flex items-center justify-between">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">

                  <Inbox
                    size={17}
                    className="text-blue-600 dark:text-blue-400"
                  />

                </div>

                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {statistiques.total}
                </span>

              </div>

              <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total
              </p>

            </div>

            {/* EN ATTENTE */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <div className="flex items-center justify-between">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10">

                  <Clock
                    size={17}
                    className="text-amber-600 dark:text-amber-400"
                  />

                </div>

                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {statistiques.waiting}
                </span>

              </div>

              <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                En attente
              </p>

            </div>

            {/* EN COURS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <div className="flex items-center justify-between">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">

                  <Activity
                    size={17}
                    className="text-blue-600 dark:text-blue-400"
                  />

                </div>

                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {statistiques.inProgress}
                </span>

              </div>

              <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                En cours
              </p>

            </div>

            {/* RÉPONDUES */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <div className="flex items-center justify-between">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">

                  <CheckCircle2
                    size={17}
                    className="text-emerald-600 dark:text-emerald-400"
                  />

                </div>

                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {statistiques.answered}
                </span>

              </div>

              <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Répondues
              </p>

            </div>

            {/* EXPIRÉES */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <div className="flex items-center justify-between">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">

                  <AlertCircle
                    size={17}
                    className="text-slate-500 dark:text-slate-400"
                  />

                </div>

                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {statistiques.expired}
                </span>

              </div>

              <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Expirées
              </p>

            </div>

          </div>
        )}

        {/* ==================================================
            ERREUR
            ================================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/5">

            <div className="flex items-start gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/10">

                <AlertCircle
                  size={18}
                  className="text-red-500 dark:text-red-400"
                />

              </div>

              <div className="min-w-0 flex-1">

                <p className="font-bold text-red-700 dark:text-red-300">
                  Une erreur est survenue
                </p>

                <p className="mt-1 text-sm leading-6 text-red-600/80 dark:text-red-300/80">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => chargerQuestions()}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-red-700 underline underline-offset-2 dark:text-red-300"
                >
                  <RefreshCw size={14} />

                  Réessayer
                </button>

              </div>

            </div>

          </div>
        )}

        {/* ==================================================
            CHARGEMENT
            ================================================== */}

        {loading && (
          <div className="flex min-h-[380px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/30 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">

            <div className="flex flex-col items-center gap-5 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10">

                <Loader2
                  size={32}
                  className="animate-spin text-blue-600 dark:text-blue-400"
                />

              </div>

              <div>

                <p className="text-base font-bold text-slate-800 dark:text-white">
                  Chargement de vos questions
                </p>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Récupération de vos conversations...
                </p>

              </div>

            </div>

          </div>
        )}

        {/* ==================================================
            AUCUNE QUESTION
            ================================================== */}

        {!loading &&
          !error &&
          questions.length === 0 && (
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-xl shadow-slate-200/30 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 md:px-10">

              <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative">

                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 dark:bg-blue-500/10">

                  <MessageCircle
                    size={34}
                    className="text-blue-600 dark:text-blue-400"
                  />

                </div>

                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">

                  <CircleDot size={13} />

                  Votre espace est prêt

                </span>

                <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
                  Aucune question pour le moment
                </h2>

                <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Vous pouvez poser une question à
                  l'administrateur de CODE ou directement à
                  un enseignant d'une matière.
                </p>

                <button
                  type="button"
                  onClick={nouvelleQuestion}
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >

                  <Plus size={18} />

                  Poser ma première question

                </button>

              </div>

            </div>
          )}

        {/* ==================================================
            LISTE DES QUESTIONS
            ================================================== */}

        {!loading &&
          !error &&
          questions.length > 0 && (

            <div>

              {/* En-tête de liste */}

              <div className="mb-4 flex items-center justify-between">

                <div>

                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Vos conversations
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">
                    {questions.length} conversation
                    {questions.length > 1
                      ? "s"
                      : ""} enregistrée
                    {questions.length > 1
                      ? "s"
                      : ""}
                  </p>

                </div>

                <div className="hidden items-center gap-2 text-xs text-slate-400 dark:text-slate-500 sm:flex">

                  <MessageSquareText size={14} />

                  Cliquez sur une conversation pour l'ouvrir

                </div>

              </div>

              <div className="space-y-4">

                {questions.map((question) => {

                  const status =
                    getStatusInfo(
                      question.status
                    );

                  const StatusIcon =
                    status.icon;

                  const recipient =
                    getRecipientInfo(
                      question
                    );

                  const RecipientIcon =
                    recipient.icon;

                  const messageCount =
                    question.messages
                      ?.length ?? 0;

                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() =>
                        ouvrirQuestion(
                          question.id
                        )
                      }
                      className="group w-full rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-xl hover:shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/40 dark:hover:shadow-black/20 md:p-6"
                    >

                      <div className="flex gap-4 md:gap-5">

                        {/* ----------------------------------
                            ICÔNE
                            ---------------------------------- */}

                        <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white sm:flex dark:bg-blue-500/10 dark:text-blue-400 dark:group-hover:bg-blue-500 dark:group-hover:text-white">

                          <MessageCircle
                            size={24}
                          />

                        </div>

                        {/* ----------------------------------
                            CONTENU
                            ---------------------------------- */}

                        <div className="min-w-0 flex-1">

                          {/* DESTINATAIRE + STATUT */}

                          <div className="mb-3 flex flex-wrap items-center gap-2">

                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">

                              <RecipientIcon
                                size={13}
                              />

                              {recipient.label}

                            </span>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${status.className}`}
                            >

                              <StatusIcon
                                size={13}
                              />

                              {status.label}

                            </span>

                            {question.is_learner &&
                              question.learner_class && (
                                <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 dark:border-purple-400/20 dark:bg-purple-500/10 dark:text-purple-300">
                                  {question.learner_class}
                                </span>
                              )}

                          </div>

                          {/* TITRE */}

                          <h2 className="truncate text-lg font-bold text-slate-900 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 md:text-xl">
                            {question.title}
                          </h2>

                          {/* CONTENU */}

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                            {question.content}
                          </p>

                          {/* INFORMATIONS */}

                          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400 dark:text-slate-500">

                            <span className="inline-flex items-center gap-1.5">

                              <CalendarDays
                                size={13}
                              />

                              {formatDate(
                                question.created_at
                              )}

                            </span>

                            {messageCount >
                              0 && (
                              <span className="inline-flex items-center gap-1.5">

                                <MessageCircle
                                  size={13}
                                />

                                {messageCount}{" "}
                                message
                                {messageCount >
                                1
                                  ? "s"
                                  : ""}

                              </span>
                            )}

                            {question.expires_at && (
                              <span className="hidden items-center gap-1.5 sm:inline-flex">

                                <Clock
                                  size={13}
                                />

                                Expire le{" "}
                                {formatDate(
                                  question.expires_at
                                )}

                              </span>
                            )}

                          </div>

                        </div>

                        {/* ----------------------------------
                            FLÈCHE
                            ---------------------------------- */}

                        <div className="hidden shrink-0 items-center text-slate-300 transition duration-200 group-hover:translate-x-1 group-hover:text-blue-600 dark:text-slate-700 dark:group-hover:text-blue-400 sm:flex">

                          <ChevronRight
                            size={25}
                          />

                        </div>

                      </div>

                    </button>
                  );
                })}

              </div>

            </div>
          )}

        {/* ==================================================
            PIED DE PAGE
            ================================================== */}

        {!loading && (
          <div className="mt-8 flex flex-col items-center justify-center gap-2 text-center text-xs text-slate-400 dark:text-slate-600 sm:flex-row">

            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={13} />

              Vos conversations sont sécurisées
            </span>

            <span className="hidden sm:inline">
              •
            </span>

            <span>
              CODE — Écosystème éducatif
            </span>

          </div>
        )}

      </div>
    </div>
  );
};

export default MesQuestions;
