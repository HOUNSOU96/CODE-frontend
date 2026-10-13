
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  MessageSquare,
  GraduationCap,
  Users,
  ChevronRight,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Clock3,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
} from "lucide-react";
import api from "../../utils/axios";

interface Question {
  id: number;

  user_id: number;
  user_nom: string;
  user_prenom: string;
  user_email: string;

  recipient_type: "admin" | "subject";
  subject?: string | null;

  is_learner: boolean;
  learner_class?: string | null;

  title: string;
  content: string;

  status:
    | "waiting"
    | "in_progress"
    | "answered"
    | "expired";

  created_at: string;
  expires_at: string;
  updated_at: string;

  messages?: {
    id: number;
    sender_role: string;
    content: string;
    created_at: string;
  }[];
}

// ============================================================
// STATUTS
// ============================================================

const statutLabel: Record<string, string> = {
  waiting: "En attente",
  in_progress: "En cours",
  answered: "Répondue",
  expired: "Expirée",
};

const statutClass: Record<string, string> = {
  waiting:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300",

  in_progress:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300",

  answered:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300",

  expired:
    "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400",
};

// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return date;
  }
}

// ============================================================
// COMPOSANT
// ============================================================

export default function QuestionsAdmin() {
  const navigate = useNavigate();

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==========================================================
  // CHARGEMENT DES QUESTIONS
  // ==========================================================

  const chargerQuestions = useCallback(
    async () => {
      try {
        setError("");

        const response =
          await api.get<Question[]>(
            "/api/admin/questions"
          );

        setQuestions(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (err: any) {
        console.error(
          "[QuestionsAdmin] erreur :",
          err?.response?.data || err
        );

        const status =
          err?.response?.status;

        if (status === 401) {
          setError(
            "Votre session n'est plus valide."
          );
        } else if (status === 403) {
          setError(
            "Accès réservé à l'administration."
          );
        } else if (status === 404) {
          setError(
            "La route administrative est introuvable."
          );
        } else {
          setError(
            err?.response?.data?.detail ||
              "Impossible de charger les questions."
          );
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
    chargerQuestions();
  }, [chargerQuestions]);

  // ==========================================================
  // ACTUALISER
  // ==========================================================

  const actualiser = async () => {
    setRefreshing(true);

    await chargerQuestions();
  };

  // ==========================================================
  // RETOUR
  // ==========================================================

  const retour = () => {
    navigate(-1);
  };

  // ==========================================================
  // STATISTIQUES
  // ==========================================================

  const totalQuestions = questions.length;

  const questionsEnAttente =
    questions.filter(
      (question) =>
        question.status === "waiting"
    ).length;

  const questionsEnCours =
    questions.filter(
      (question) =>
        question.status === "in_progress"
    ).length;

  const questionsRepondues =
    questions.filter(
      (question) =>
        question.status === "answered"
    ).length;

  // ==========================================================
  // RENDU
  // ==========================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100 md:px-8 md:py-8">

      {/* =====================================================
          ARRIÈRE-PLAN DÉCORATIF
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/10" />

        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-500/10" />

        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/5 blur-3xl" />

      </div>

      <div className="relative mx-auto max-w-7xl">

        {/* ==================================================
            EN-TÊTE
        ================================================== */}

        <header className="mb-8">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div className="min-w-0">

              {/* RETOUR */}

              <button
                type="button"
                onClick={retour}
                className="group mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />

                Retour
              </button>

              {/* TITRE */}

              <div className="flex items-start gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-600 text-white shadow-xl shadow-blue-600/20 dark:border-blue-400/20 dark:bg-blue-500">
                  <ShieldCheck className="h-7 w-7" />
                </div>

                <div className="min-w-0">

                  <div className="mb-1 flex items-center gap-2">

                    <Sparkles className="h-4 w-4 text-blue-500 dark:text-blue-400" />

                    <span className="text-xs font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                      Administration CODE
                    </span>

                  </div>

                  <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                    Centre de conversations
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-[15px]">
                    Supervision des échanges entre les
                    utilisateurs, l'administration et les
                    enseignants de CODE.
                  </p>

                </div>

              </div>

            </div>

            {/* ACTUALISER */}

            <button
              type="button"
              onClick={actualiser}
              disabled={refreshing}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
            >
              {refreshing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Actualisation...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5" />
                  Actualiser
                </>
              )}
            </button>

          </div>

        </header>

        {/* ==================================================
            STATISTIQUES
        ================================================== */}

        {!loading && !error && (
          <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* TOTAL */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">

              <div className="flex items-center justify-between gap-4">

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Total
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                    {totalQuestions}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    conversations
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10">
                  <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>

              </div>

            </div>

            {/* EN ATTENTE */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">

              <div className="flex items-center justify-between gap-4">

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    En attente
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                    {questionsEnAttente}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    à traiter
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/10">
                  <Clock3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>

              </div>

            </div>

            {/* EN COURS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">

              <div className="flex items-center justify-between gap-4">

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    En cours
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                    {questionsEnCours}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    conversations actives
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>

              </div>

            </div>

            {/* RÉPONDUES */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">

              <div className="flex items-center justify-between gap-4">

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Répondues
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                    {questionsRepondues}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    conversations traitées
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/10">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>

              </div>

            </div>

          </section>
        )}

        {/* ==================================================
            ACCÈS RAPIDES
        ================================================== */}

        <section className="mb-7">

          <div className="mb-4">

            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Accès rapides
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Accédez rapidement aux différents espaces
              de conversation de CODE.
            </p>

          </div>

          <div className="grid gap-4 lg:grid-cols-2">

            {/* QUESTIONS ADMIN */}

            <button
              type="button"
              onClick={() => {
                const element =
                  document.getElementById(
                    "questions-admin"
                  );

                if (element) {
                  element.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }
              }}
              className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/30"
            >

              <div className="p-5 sm:p-6">

                <div className="mb-5 flex items-center justify-between">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10">
                    <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>

                  <ChevronRight className="h-5 w-5 text-slate-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-600 dark:text-slate-600 dark:group-hover:text-blue-400" />

                </div>

                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Questions adressées à CODE
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Consultez et traitez les questions
                  envoyées directement à
                  l'administration de CODE.
                </p>

                <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                  <BookOpen className="h-3.5 w-3.5" />
                  Voir les questions
                </div>

              </div>

            </button>

            {/* ENSEIGNANTS */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/conversations-enseignants"
                )
              }
              className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-500/30"
            >

              <div className="p-5 sm:p-6">

                <div className="mb-5 flex items-center justify-between">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/10">
                    <GraduationCap className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>

                  <ChevronRight className="h-5 w-5 text-slate-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-violet-600 dark:text-slate-600 dark:group-hover:text-violet-400" />

                </div>

                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Élèves ↔ Enseignants
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Consultez toutes les conversations
                  entre les élèves et les enseignants
                  de CODE.
                </p>

                <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                  <GraduationCap className="h-3.5 w-3.5" />
                  Voir les conversations
                </div>

              </div>

            </button>

          </div>

        </section>

        {/* ==================================================
            ERREUR
        ================================================== */}

        {error && (
          <section className="mb-7 overflow-hidden rounded-2xl border border-red-200 bg-white shadow-lg dark:border-red-900/50 dark:bg-slate-900">

            <div className="h-1.5 bg-red-500" />

            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/10">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>

                <div>

                  <p className="font-black text-slate-900 dark:text-white">
                    Impossible de charger les questions
                  </p>

                  <p className="mt-1 text-sm leading-6 text-red-600 dark:text-red-300">
                    {error}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={chargerQuestions}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
              >
                <RefreshCw className="h-4 w-4" />
                Réessayer
              </button>

            </div>

          </section>
        )}

        {/* ==================================================
            LISTE DES QUESTIONS
        ================================================== */}

        <section
          id="questions-admin"
          className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-lg shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20"
        >

          {/* EN-TÊTE */}

          <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-5 dark:border-slate-800 dark:bg-slate-950/40 sm:px-6">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800">
                  <MessageSquare className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                </div>

                <div>

                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Toutes les questions
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                    Questions adressées à l'administration
                  </p>

                </div>

              </div>

              {!loading && (
                <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                  {questions.length} conversation
                  {questions.length > 1
                    ? "s"
                    : ""}
                </span>
              )}

            </div>

          </div>

          {/* CHARGEMENT */}

          {loading ? (

            <div className="flex min-h-[380px] flex-col items-center justify-center p-10">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-500/10">

                <Loader2 className="h-7 w-7 animate-spin text-blue-600 dark:text-blue-400" />

              </div>

              <p className="mt-5 text-sm font-bold text-slate-600 dark:text-slate-300">
                Chargement des questions...
              </p>

              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Veuillez patienter
              </p>

            </div>

          ) : questions.length === 0 ? (

            /* ================================================
               AUCUNE QUESTION
            ================================================= */

            <div className="p-10 text-center sm:p-14">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">

                <MessageSquare className="h-7 w-7 text-slate-400 dark:text-slate-500" />

              </div>

              <h3 className="mt-5 text-lg font-black text-slate-900 dark:text-white">
                Aucune question pour le moment
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Les questions adressées à
                l'administration apparaîtront ici dès
                qu'un utilisateur en enverra une.
              </p>

            </div>

          ) : (

            /* ================================================
               QUESTIONS
            ================================================= */

            <div className="divide-y divide-slate-100 dark:divide-slate-800">

              {questions.map((question) => (

                <button
                  key={question.id}
                  type="button"
                  onClick={() =>
                    navigate(
                      `/admin/questions/${question.id}`
                    )
                  }
                  className="group w-full text-left transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >

                  <div className="p-5 sm:p-6">

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      {/* CONTENU */}

                      <div className="min-w-0 flex-1">

                        {/* BADGES */}

                        <div className="mb-3 flex flex-wrap items-center gap-2">

                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-black ${
                              statutClass[
                                question.status
                              ] ||
                              "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {question.status ===
                              "waiting" && (
                              <Clock3 className="mr-1.5 h-3.5 w-3.5" />
                            )}

                            {question.status ===
                              "in_progress" && (
                              <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                            )}

                            {question.status ===
                              "answered" && (
                              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                            )}

                            {question.status ===
                              "expired" && (
                              <XCircle className="mr-1.5 h-3.5 w-3.5" />
                            )}

                            {statutLabel[
                              question.status
                            ] ||
                              question.status}
                          </span>

                          {question.recipient_type ===
                          "subject" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[11px] font-black text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300">
                              <GraduationCap className="h-3.5 w-3.5" />
                              Enseignant
                              {question.subject
                                ? ` — ${question.subject}`
                                : ""}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-black text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-300">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Administration CODE
                            </span>
                          )}

                          {question.learner_class && (
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {question.learner_class}
                            </span>
                          )}

                        </div>

                        {/* TITRE */}

                        <h3 className="truncate text-base font-black text-slate-900 transition-colors group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300 sm:text-lg">
                          {question.title}
                        </h3>

                        {/* UTILISATEUR */}

                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">

                          <span className="font-semibold text-slate-500 dark:text-slate-400">
                            Utilisateur :
                          </span>

                          <span className="font-black text-slate-800 dark:text-slate-200">
                            {question.user_prenom}{" "}
                            {question.user_nom}
                          </span>

                        </div>

                        <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">
                          {question.user_email}
                        </p>

                        {/* DATE */}

                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400 dark:text-slate-500">

                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 className="h-3.5 w-3.5" />
                            Créée le{" "}
                            {formatDate(
                              question.created_at
                            )}
                          </span>

                          {question.updated_at !==
                            question.created_at && (
                            <span className="inline-flex items-center gap-1.5">
                              <RefreshCw className="h-3.5 w-3.5" />
                              Mise à jour le{" "}
                              {formatDate(
                                question.updated_at
                              )}
                            </span>
                          )}

                        </div>

                      </div>

                      {/* ACTION */}

                      <div className="flex shrink-0 items-center justify-between gap-4 border-t border-slate-100 pt-4 lg:w-48 lg:flex-col lg:items-end lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0 dark:border-slate-800">

                        {question.messages && (
                          <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
                            <MessageSquare className="h-4 w-4" />

                            {question.messages.length} message
                            {question.messages.length > 1
                              ? "s"
                              : ""}
                          </span>
                        )}

                        <span className="inline-flex items-center gap-2 text-xs font-black text-blue-600 transition-colors group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300">

                          Ouvrir

                          <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />

                        </span>

                      </div>

                    </div>

                  </div>

                </button>

              ))}

            </div>
          )}

        </section>

        {/* ==================================================
            PIED DE PAGE
        ================================================== */}

        {!loading && questions.length > 0 && (
          <div className="flex justify-center pb-8 pt-7">

            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-400 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-500">

              <ShieldCheck className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />

              Centre de supervision — CODE

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

