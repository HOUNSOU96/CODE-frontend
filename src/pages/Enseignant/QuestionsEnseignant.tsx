
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronRight,
  Clock,
  CheckCircle2,
  CircleDot,
  BookOpen,
  ArrowLeft,
  Home,
  GraduationCap,
  Activity,
  Hourglass,
  XCircle,
  Inbox,
  MessageSquareText,
} from "lucide-react";

import api from "../../utils/axios";

// ============================================================
// TYPES
// ============================================================

type Message = {
  id: number;
  sender_role: string;
  content: string;
  created_at: string;
};

type Question = {
  id: number;
  recipient_type: string;
  subject?: string | null;
  is_learner: boolean;
  learner_class?: string | null;
  title: string;
  content: string;
  status: string;
  created_at: string;
  expires_at: string;
  updated_at: string;
  messages: Message[];
};

// ============================================================
// COMPOSANT
// ============================================================

const QuestionsEnseignant: React.FC = () => {
  const navigate = useNavigate();

  // ==========================================================
  // ÉTATS
  // ==========================================================

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==========================================================
  // RETOUR À LA PAGE PRÉCÉDENTE
  // ==========================================================

  const retourPagePrecedente = () => {
    navigate(-1);
  };

  // ==========================================================
  // ACCÈS À LA PAGE ENSEIGNANT
  // ==========================================================

  const allerEspaceEnseignant = () => {
    navigate("/enseignant");
  };

  // ==========================================================
  // CHARGEMENT DES QUESTIONS
  // ==========================================================

  const charger = useCallback(
    async (silent = false) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        console.log(
          "📨 Chargement des questions reçues par l'enseignant..."
        );

        // ------------------------------------------------------
        // BACKEND
        //
        // GET /api/teacher/questions
        // ------------------------------------------------------

        const response = await api.get<Question[]>(
          "/api/teacher/questions"
        );

        console.log(
          "✅ Questions reçues du backend :",
          response.data
        );

        setQuestions(response.data);
      } catch (err: any) {
        console.error(
          "❌ Erreur lors du chargement des questions enseignant :",
          err
        );

        const statusCode = err?.response?.status;
        const backendMessage = err?.response?.data?.detail;

        if (statusCode === 401) {
          setError(
            "Votre session a expiré. Veuillez vous reconnecter."
          );
        } else if (statusCode === 403) {
          setError(
            backendMessage ||
              "Vous n'avez pas accès à l'espace enseignant."
          );
        } else if (statusCode === 404) {
          setError(
            backendMessage ||
              "Le service des questions enseignants est introuvable."
          );
        } else if (statusCode === 500) {
          setError(
            "Une erreur interne est survenue sur le serveur."
          );
        } else if (backendMessage) {
          setError(backendMessage);
        } else if (err?.request) {
          setError("Impossible de contacter le serveur.");
        } else {
          setError("Impossible de charger les questions.");
        }
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
    charger();
  }, [charger]);

  // ==========================================================
  // STATISTIQUES
  // ==========================================================

  const statistiques = useMemo(() => {
    const waiting = questions.filter(
      (question) => question.status === "waiting"
    ).length;

    const inProgress = questions.filter(
      (question) => question.status === "in_progress"
    ).length;

    const answered = questions.filter(
      (question) => question.status === "answered"
    ).length;

    const expired = questions.filter(
      (question) => question.status === "expired"
    ).length;

    return {
      total: questions.length,
      waiting,
      inProgress,
      answered,
      expired,
    };
  }, [questions]);

  // ==========================================================
  // STATUT
  // ==========================================================

  const renderStatus = (value: string) => {
    switch (value) {
      case "waiting":
        return (
          <span
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-full
              bg-amber-100
              px-3
              py-1.5
              text-xs
              font-bold
              text-amber-700
              ring-1
              ring-amber-200
              dark:bg-amber-500/15
              dark:text-amber-300
              dark:ring-amber-500/20
            "
          >
            <Clock size={13} />
            En attente
          </span>
        );

      case "in_progress":
        return (
          <span
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-full
              bg-blue-100
              px-3
              py-1.5
              text-xs
              font-bold
              text-blue-700
              ring-1
              ring-blue-200
              dark:bg-blue-500/15
              dark:text-blue-300
              dark:ring-blue-500/20
            "
          >
            <MessageCircle size={13} />
            En cours
          </span>
        );

      case "answered":
        return (
          <span
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-full
              bg-emerald-100
              px-3
              py-1.5
              text-xs
              font-bold
              text-emerald-700
              ring-1
              ring-emerald-200
              dark:bg-emerald-500/15
              dark:text-emerald-300
              dark:ring-emerald-500/20
            "
          >
            <CheckCircle2 size={13} />
            Répondue
          </span>
        );

      case "expired":
        return (
          <span
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-full
              bg-slate-100
              px-3
              py-1.5
              text-xs
              font-bold
              text-slate-600
              ring-1
              ring-slate-200
              dark:bg-slate-700
              dark:text-slate-300
              dark:ring-slate-600
            "
          >
            <XCircle size={13} />
            Expirée
          </span>
        );

      default:
        return (
          <span
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-full
              bg-slate-100
              px-3
              py-1.5
              text-xs
              font-bold
              text-slate-600
              ring-1
              ring-slate-200
              dark:bg-slate-700
              dark:text-slate-300
              dark:ring-slate-600
            "
          >
            <CircleDot size={13} />
            {value}
          </span>
        );
    }
  };

  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (date: string) => {
    try {
      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        return date;
      }

      return new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(parsedDate);
    } catch {
      return date;
    }
  };

  // ==========================================================
  // NOMBRE DE MESSAGES
  // ==========================================================

  const nombreMessages = (question: Question) => {
    return question.messages?.length || 0;
  };

  // ==========================================================
  // CHARGEMENT
  // ==========================================================

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-8 dark:bg-slate-950">
        {/* DÉCORATION */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/5" />

          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/5" />
        </div>

        <div className="relative flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-5 rounded-3xl border border-slate-200 bg-white px-9 py-10 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Loader2
                size={31}
                className="animate-spin"
              />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Chargement des questions
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Récupération de vos échanges avec les apprenants...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDU PRINCIPAL
  // ==========================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      {/* ======================================================
          ARRIÈRE-PLAN DÉCORATIF
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/5" />

        <div className="absolute right-[-140px] top-[25%] h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/5" />

        <div className="absolute -bottom-40 left-[20%] h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl dark:bg-cyan-500/5" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* ==================================================
            RETOUR
        ================================================== */}

        <button
          type="button"
          onClick={retourPagePrecedente}
          className="
            mb-6
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            py-2.5
            text-sm
            font-semibold
            text-slate-600
            shadow-sm
            transition
            hover:border-slate-300
            hover:bg-slate-50
            hover:text-slate-900
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            dark:border-slate-800
            dark:bg-slate-900
            dark:text-slate-300
            dark:hover:bg-slate-800
            dark:hover:text-white
          "
        >
          <ArrowLeft size={17} />
          Retour
        </button>

        {/* ==================================================
            EN-TÊTE
        ================================================== */}

        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
              <Inbox size={15} />
              Espace enseignant
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 shadow-sm dark:bg-blue-500/15 dark:text-blue-300">
                <MessageCircle size={27} />
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                  Questions reçues
                </h1>

                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Consultez les questions des apprenants,
                  suivez leur traitement et répondez directement
                  depuis cet espace.
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={allerEspaceEnseignant}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-blue-600
                px-4
                py-3
                text-sm
                font-bold
                text-white
                shadow-lg
                shadow-blue-600/20
                transition
                hover:bg-blue-700
                hover:shadow-blue-600/30
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:ring-offset-2
                dark:focus:ring-offset-slate-950
              "
              title="Retourner à l'espace enseignant"
            >
              <Home size={18} />
              Espace enseignant
            </button>

            <button
              type="button"
              onClick={() => charger(true)}
              disabled={refreshing}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-3
                text-sm
                font-semibold
                text-slate-600
                shadow-sm
                transition
                hover:border-slate-300
                hover:bg-slate-50
                hover:text-slate-900
                disabled:cursor-not-allowed
                disabled:opacity-60
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                dark:border-slate-800
                dark:bg-slate-900
                dark:text-slate-300
                dark:hover:bg-slate-800
                dark:hover:text-white
              "
              title="Actualiser les questions"
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
          </div>
        </div>

        {/* ==================================================
            STATISTIQUES
        ================================================== */}

        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {/* TOTAL */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                  {statistiques.total}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Question
                  {statistiques.total > 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <Inbox size={21} />
              </div>
            </div>
          </div>

          {/* EN ATTENTE */}
          <div className="rounded-2xl border border-amber-200/70 bg-white p-5 shadow-sm dark:border-amber-500/20 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  En attente
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                  {statistiques.waiting}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  À traiter
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <Hourglass size={21} />
              </div>
            </div>
          </div>

          {/* EN COURS */}
          <div className="rounded-2xl border border-blue-200/70 bg-white p-5 shadow-sm dark:border-blue-500/20 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  En cours
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                  {statistiques.inProgress}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Conversations actives
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <Activity size={21} />
              </div>
            </div>
          </div>

          {/* RÉPONDUES */}
          <div className="rounded-2xl border border-emerald-200/70 bg-white p-5 shadow-sm dark:border-emerald-500/20 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Répondues
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                  {statistiques.answered}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Traitées
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <CheckCircle2 size={21} />
              </div>
            </div>
          </div>

          {/* EXPIRÉES */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Expirées
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                  {statistiques.expired}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Hors délai
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <XCircle size={21} />
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            ERREUR
        ================================================== */}

        {error && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm dark:border-red-500/20 dark:bg-slate-900">
            <div className="h-1 bg-red-500" />

            <div className="flex items-start gap-3 p-5 text-red-700 dark:text-red-300">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <AlertCircle size={20} />
              </div>

              <div className="flex-1">
                <p className="font-bold">
                  Impossible de charger les questions
                </p>

                <p className="mt-1 text-sm leading-5 text-red-600/80 dark:text-red-300/70">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => charger()}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-red-700 underline underline-offset-2 transition hover:no-underline dark:text-red-300"
                >
                  <RefreshCw size={13} />
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            BANDEAU CONTEXTE
        ================================================== */}

        {questions.length > 0 && (
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <BookOpen size={17} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  Vos questions et conversations
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sélectionnez une question pour ouvrir la
                  conversation.
                </p>
              </div>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <MessageSquareText size={14} />
              {questions.length} élément
              {questions.length > 1 ? "s" : ""}
            </div>
          </div>
        )}

        {/* ==================================================
            AUCUNE QUESTION
        ================================================== */}

        {questions.length === 0 ? (
          <div className="overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600">
                <MessageCircle size={38} />
              </div>

              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                Aucune question reçue
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">
                Les questions adressées à vos matières
                apparaîtront automatiquement dans cet espace.
                Vous pourrez ensuite ouvrir chaque conversation
                et répondre directement à l'apprenant.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => charger()}
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-blue-600
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-white
                    shadow-lg
                    shadow-blue-600/20
                    transition
                    hover:bg-blue-700
                  "
                >
                  <RefreshCw size={17} />
                  Actualiser
                </button>

                <button
                  type="button"
                  onClick={allerEspaceEnseignant}
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-slate-600
                    transition
                    hover:bg-slate-50
                    dark:border-slate-700
                    dark:bg-slate-800
                    dark:text-slate-300
                    dark:hover:bg-slate-700
                  "
                >
                  <Home size={17} />
                  Espace enseignant
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* =================================================
             LISTE DES QUESTIONS
             ================================================= */

          <div className="space-y-4">
            {questions.map((question) => (
              <button
                key={question.id}
                type="button"
                onClick={() =>
                  navigate(
                    `/enseignant/questions/${question.id}`
                  )
                }
                className="
                  group
                  w-full
                  overflow-hidden
                  rounded-3xl
                  border
                  border-slate-200
                  bg-white
                  text-left
                  shadow-sm
                  transition
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-blue-300
                  hover:shadow-xl
                  hover:shadow-blue-900/5
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500
                  focus:ring-offset-2
                  dark:border-slate-800
                  dark:bg-slate-900
                  dark:hover:border-blue-500/40
                  dark:hover:shadow-black/20
                  dark:focus:ring-offset-slate-950
                "
              >
                {/* INDICATEUR SUPÉRIEUR */}
                <div
                  className={`
                    h-1
                    w-full
                    ${
                      question.status === "waiting"
                        ? "bg-amber-400"
                        : question.status === "in_progress"
                        ? "bg-blue-500"
                        : question.status === "answered"
                        ? "bg-emerald-500"
                        : question.status === "expired"
                        ? "bg-slate-400"
                        : "bg-blue-500"
                    }
                  `}
                />

                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    {/* ==================================================
                        ICÔNE
                    ================================================== */}

                    <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-500/10 dark:text-blue-400 sm:flex">
                      <MessageCircle size={25} />
                    </div>

                    {/* ==================================================
                        CONTENU
                    ================================================== */}

                    <div className="min-w-0 flex-1">
                      {/* BADGES */}
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        {/* MATIÈRE */}
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            bg-blue-50
                            px-3
                            py-1.5
                            text-xs
                            font-bold
                            text-blue-700
                            ring-1
                            ring-blue-100
                            dark:bg-blue-500/10
                            dark:text-blue-300
                            dark:ring-blue-500/20
                          "
                        >
                          <BookOpen size={12} />

                          {question.subject || "Matière"}
                        </span>

                        {/* CLASSE */}
                        {question.learner_class && (
                          <span
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-full
                              bg-violet-50
                              px-3
                              py-1.5
                              text-xs
                              font-bold
                              text-violet-700
                              ring-1
                              ring-violet-100
                              dark:bg-violet-500/10
                              dark:text-violet-300
                              dark:ring-violet-500/20
                            "
                          >
                            <GraduationCap size={12} />

                            {question.learner_class}
                          </span>
                        )}

                        {/* STATUT */}
                        {renderStatus(question.status)}
                      </div>

                      {/* TITRE */}
                      <h2 className="line-clamp-2 text-base font-black leading-6 text-slate-900 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 sm:text-lg">
                        {question.title}
                      </h2>

                      {/* CONTENU */}
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {question.content}
                      </p>

                      {/* INFORMATIONS */}
                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400 dark:text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock size={13} />

                          {formatDate(
                            question.created_at
                          )}
                        </span>

                        <span className="hidden h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700 sm:block" />

                        <span className="inline-flex items-center gap-1.5">
                          <MessageSquareText size={13} />

                          {nombreMessages(question)}{" "}
                          {nombreMessages(question) > 1
                            ? "messages"
                            : "message"}
                        </span>

                        {question.is_learner && (
                          <>
                            <span className="hidden h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700 sm:block" />

                            <span className="inline-flex items-center gap-1.5">
                              <GraduationCap size={13} />

                              Apprenant
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* ==================================================
                        FLÈCHE
                    ================================================== */}

                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-300 transition group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-slate-800 dark:text-slate-600 dark:group-hover:bg-blue-500/10 dark:group-hover:text-blue-400">
                      <ChevronRight
                        size={21}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="mt-7 flex flex-col items-center justify-center gap-2 pb-4 text-center text-xs text-slate-400 dark:text-slate-500 sm:flex-row">
          <MessageCircle size={14} />

          <span>
            Les questions des apprenants sont centralisées dans
            cet espace pour faciliter leur suivi.
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuestionsEnseignant;

