
import React, {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";

import {
  ArrowLeft,
  RefreshCw,
  Send,
  User,
  GraduationCap,
  Mail,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Clock3,
  MessageSquare,
  CalendarDays,
  CircleCheck,
  CircleAlert,
} from "lucide-react";

import api from "../../utils/axios";

// ============================================================
// TYPES
// ============================================================

interface Message {
  id: number;
  sender_role: "user" | "admin" | "teacher";
  content: string;
  created_at: string;
}

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

  teacher_names?: string[];

  messages: Message[];
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
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return date;
  }
}

// ============================================================
// COMPOSANT
// ============================================================

export default function ConversationAdmin() {
  const navigate = useNavigate();

  const { questionId } = useParams();

  const location = useLocation();

  // ==========================================================
  // ÉTATS
  // ==========================================================

  const [question, setQuestion] =
    useState<Question | null>(null);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [error, setError] = useState("");

  // ==========================================================
  // IDENTIFIANT
  // ==========================================================

  const id = Number(questionId);

  // ==========================================================
  // TYPE DE CONVERSATION
  // ==========================================================

  const isTeacherConversation =
    location.pathname.startsWith(
      "/admin/conversations-enseignants/"
    );

  // ==========================================================
  // RETOUR
  // ==========================================================

  const retour = () => {
    navigate("/admin/liste-inscrits");
  };

  // ==========================================================
  // CHARGER LA CONVERSATION
  // ==========================================================

  const charger = useCallback(async () => {
    if (!Number.isInteger(id) || id <= 0) {
      setError(
        "Identifiant de conversation invalide."
      );

      setLoading(false);

      return;
    }

    try {
      setError("");

      const endpoint =
        isTeacherConversation
          ? `/api/admin/teacher-conversations/${id}`
          : `/api/admin/questions/${id}`;

      const response =
        await api.get<Question>(endpoint);

      setQuestion(response.data);
    } catch (err: any) {
      console.error(
        "[ConversationAdmin]",
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
          "Vous n'avez pas les droits nécessaires."
        );
      } else if (status === 404) {
        setError(
          "Cette conversation n'existe pas."
        );
      } else {
        setError(
          err?.response?.data?.detail ||
            "Impossible de charger la conversation."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, isTeacherConversation]);

  // ==========================================================
  // CHARGEMENT INITIAL
  // ==========================================================

  useEffect(() => {
    charger();
  }, [charger]);

  // ==========================================================
  // ENVOYER UN MESSAGE
  // ==========================================================

  const envoyerMessage = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    const contenu = message.trim();

    if (!contenu || sending) {
      return;
    }

    if (contenu.length > 5000) {
      setError(
        "Le message ne peut pas dépasser 5000 caractères."
      );

      return;
    }

    try {
      setSending(true);
      setError("");

      const endpoint =
        isTeacherConversation
          ? `/api/admin/teacher-conversations/${id}/messages`
          : `/api/admin/questions/${id}/messages`;

      await api.post(endpoint, {
        content: contenu,
      });

      setMessage("");

      await charger();
    } catch (err: any) {
      console.error(
        "[ConversationAdmin] erreur envoi",
        err?.response?.data || err
      );

      setError(
        err?.response?.data?.detail ||
          "Impossible d'envoyer le message."
      );
    } finally {
      setSending(false);
    }
  };

  // ==========================================================
  // ACTUALISER
  // ==========================================================

  const actualiser = async () => {
    setRefreshing(true);

    await charger();
  };

  // ==========================================================
  // CHARGEMENT
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="flex flex-col items-center">

            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200 bg-blue-100 shadow-lg shadow-blue-500/10 dark:border-blue-400/20 dark:bg-blue-500/10">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
            </div>

            <p className="mt-5 text-sm font-bold text-slate-700 dark:text-slate-200">
              Chargement de la conversation...
            </p>

            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Veuillez patienter
            </p>

          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERREUR
  // ==========================================================

  if (error && !question) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 md:py-12">

        <div className="mx-auto max-w-2xl">

          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">

            <div className="h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-600" />

            <div className="p-7 sm:p-9 md:p-10">

              <div className="flex flex-col items-center text-center">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-200 bg-red-50 dark:border-red-400/20 dark:bg-red-500/10">
                  <AlertCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
                </div>

                <h1 className="mt-6 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Impossible d'ouvrir la conversation
                </h1>

                <p className="mt-3 max-w-lg text-sm leading-7 text-red-600 dark:text-red-300">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={retour}
                  className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-black text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  <ArrowLeft className="h-5 w-5" />

                  {isTeacherConversation
                    ? "Retour aux conversations enseignants"
                    : "Retour aux questions"}
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================================
  // AUCUNE QUESTION
  // ==========================================================

  if (!question) {
    return null;
  }

  // ==========================================================
  // AFFICHAGE
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">

      {/* ====================================================
          ARRIÈRE-PLAN
      ==================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-500/10" />

        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/5 blur-3xl dark:bg-indigo-500/10" />

      </div>

      {/* ====================================================
          CONTENU PRINCIPAL
      ==================================================== */}

      <div className="relative mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">

        {/* ==================================================
            BARRE DE NAVIGATION
        ================================================== */}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <button
            type="button"
            onClick={retour}
            className="group inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />

            <span>
              {isTeacherConversation
                ? "Conversations enseignants"
                : "Questions"}
            </span>
          </button>

          <button
            type="button"
            onClick={actualiser}
            disabled={refreshing}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}

            Actualiser
          </button>

        </div>

        {/* ==================================================
            EN-TÊTE ADMINISTRATEUR
        ================================================== */}

        <div className="mb-6 overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-indigo-50 shadow-sm dark:border-blue-900/50 dark:from-blue-950/40 dark:via-slate-900 dark:to-indigo-950/30">

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-100 dark:border-blue-400/20 dark:bg-blue-500/10">
                <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>

              <div>
                <p className="text-sm font-black text-blue-900 dark:text-blue-200">
                  Vue administrateur
                </p>

                <p className="mt-0.5 text-xs text-blue-700/70 dark:text-blue-300/60">
                  Conversation complète et intervention de l'administration
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">

              <MessageSquare className="h-4 w-4" />

              {question.messages.length}{" "}
              {question.messages.length > 1
                ? "messages"
                : "message"}

            </div>

          </div>

        </div>

        {/* ==================================================
            INFORMATIONS DE LA CONVERSATION
        ================================================== */}

        <section className="mb-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">

          {/* ----------------------------------------------
              BANDEAU
          ---------------------------------------------- */}

          <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/40 sm:px-6">

            <div className="flex flex-wrap items-center justify-between gap-3">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10">
                  <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                    Conversation
                  </p>

                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    #{question.id}
                  </p>
                </div>

              </div>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black ${
                  statutClass[question.status]
                }`}
              >
                {question.status === "answered" ? (
                  <CircleCheck className="h-3.5 w-3.5" />
                ) : question.status === "expired" ? (
                  <CircleAlert className="h-3.5 w-3.5" />
                ) : (
                  <Clock3 className="h-3.5 w-3.5" />
                )}

                {statutLabel[question.status]}
              </span>

            </div>

          </div>

          {/* ----------------------------------------------
              CONTENU
          ---------------------------------------------- */}

          <div className="p-5 sm:p-6 lg:p-8">

            {/* BADGES */}

            <div className="mb-5 flex flex-wrap items-center gap-2">

              {question.recipient_type ===
              "subject" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300">

                  <GraduationCap className="h-4 w-4" />

                  Enseignant

                  {question.subject
                    ? ` — ${question.subject}`
                    : ""}

                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-300">

                  <ShieldCheck className="h-4 w-4" />

                  Administration CODE

                </span>
              )}

              {question.learner_class && (
                <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {question.learner_class}
                </span>
              )}

            </div>

            {/* TITRE */}

            <h1 className="max-w-4xl text-2xl font-black leading-tight tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
              {question.title}
            </h1>

            {/* INFORMATIONS */}

            <div className="mt-7 grid gap-4 lg:grid-cols-2">

              {/* ÉLÈVE */}

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/50">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-900">
                    <User className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                      Élève
                    </p>

                    <p className="mt-1 font-black text-slate-900 dark:text-white">
                      {question.user_prenom}{" "}
                      {question.user_nom}
                    </p>

                    <div className="mt-2 flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400">

                      <Mail className="mt-0.5 h-4 w-4 shrink-0" />

                      <span className="break-all">
                        {question.user_email}
                      </span>

                    </div>

                  </div>

                </div>

              </div>

              {/* ENSEIGNANTS */}

              {isTeacherConversation ? (
                <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-5 dark:border-violet-900/40 dark:bg-violet-950/20">

                  <div className="flex items-start gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-900">
                      <GraduationCap className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-violet-500 dark:text-violet-400">
                        Enseignant(s)
                      </p>

                      {question.teacher_names &&
                      question.teacher_names.length >
                        0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">

                          {question.teacher_names.map(
                            (teacher) => (
                              <span
                                key={teacher}
                                className="rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-xs font-bold text-violet-800 shadow-sm dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300"
                              >
                                {teacher}
                              </span>
                            )
                          )}

                        </div>
                      ) : (
                        <p className="mt-2 text-sm italic text-violet-600 dark:text-violet-400">
                          Aucun enseignant n'a encore répondu.
                        </p>
                      )}

                    </div>

                  </div>

                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/50">

                  <div className="flex items-start gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-900">
                      <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>

                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                        Destinataire
                      </p>

                      <p className="mt-1 font-black text-slate-900 dark:text-white">
                        Administration CODE
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Suivi administratif de la demande
                      </p>
                    </div>

                  </div>

                </div>
              )}

            </div>

            {/* DATES */}

            <div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:grid-cols-3">

              <div className="flex items-center gap-3">

                <CalendarDays className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Créée le
                  </p>

                  <p className="mt-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {formatDate(
                      question.created_at
                    )}
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-3">

                <RefreshCw className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Modification
                  </p>

                  <p className="mt-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {formatDate(
                      question.updated_at
                    )}
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-3">

                <Clock3 className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Expiration
                  </p>

                  <p className="mt-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {formatDate(
                      question.expires_at
                    )}
                  </p>
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ==================================================
            QUESTION INITIALE
        ================================================== */}

        <section className="mb-5 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-lg shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">

          <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/40 sm:px-6">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800">
              <User className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </div>

            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                Question initiale
              </p>

              <p className="text-xs text-slate-400 dark:text-slate-500">
                Message envoyé par l'élève
              </p>
            </div>

          </div>

          <div className="p-5 sm:p-6">

            <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300 sm:text-[15px]">
              {question.content}
            </div>

          </div>

        </section>

        {/* ==================================================
            MESSAGES
        ================================================== */}

        {question.messages.length > 0 && (
          <section className="mb-5">

            <div className="mb-4 flex items-center justify-between gap-3 px-1">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                  Historique
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                  Échanges de la conversation
                </h2>

              </div>

              <span className="hidden rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 sm:inline-flex">
                {question.messages.length}{" "}
                message
                {question.messages.length > 1
                  ? "s"
                  : ""}
              </span>

            </div>

            <div className="space-y-4">

              {question.messages.map((msg) => {

                const isAdmin =
                  msg.sender_role === "admin";

                const isTeacher =
                  msg.sender_role === "teacher";

                return (
                  <article
                    key={msg.id}
                    className={`rounded-[1.5rem] border p-5 shadow-sm transition-all duration-300 sm:p-6 ${
                      isAdmin
                        ? "ml-0 border-blue-200 bg-blue-50/80 shadow-blue-900/5 dark:border-blue-900/50 dark:bg-blue-950/25 sm:ml-12 lg:ml-24"
                        : isTeacher
                        ? "mr-0 border-violet-200 bg-violet-50/70 shadow-violet-900/5 dark:border-violet-900/50 dark:bg-violet-950/20 sm:mr-12 lg:mr-24"
                        : "mr-0 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 sm:mr-12 lg:mr-24"
                    }`}
                  >

                    {/* EN-TÊTE */}

                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-center gap-3">

                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            isAdmin
                              ? "bg-blue-100 dark:bg-blue-500/10"
                              : isTeacher
                              ? "bg-violet-100 dark:bg-violet-500/10"
                              : "bg-slate-100 dark:bg-slate-800"
                          }`}
                        >
                          {isAdmin ? (
                            <ShieldCheck
                              className="h-5 w-5 text-blue-600 dark:text-blue-400"
                            />
                          ) : isTeacher ? (
                            <GraduationCap
                              className="h-5 w-5 text-violet-600 dark:text-violet-400"
                            />
                          ) : (
                            <User
                              className="h-5 w-5 text-slate-500 dark:text-slate-400"
                            />
                          )}
                        </div>

                        <div>

                          <p className="text-sm font-black text-slate-900 dark:text-white">
                            {isAdmin
                              ? "Administration CODE"
                              : isTeacher
                              ? "Enseignant"
                              : "Élève"}
                          </p>

                          <p className="mt-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                            {isAdmin
                              ? "Intervention administrative"
                              : isTeacher
                              ? "Réponse pédagogique"
                              : "Demande de l'élève"}
                          </p>

                        </div>

                      </div>

                      <span className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">

                        <Clock3 className="h-3.5 w-3.5" />

                        {formatDate(
                          msg.created_at
                        )}

                      </span>

                    </div>

                    {/* CONTENU */}

                    <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">
                      {msg.content}
                    </div>

                  </article>
                );
              })}

            </div>

          </section>
        )}

        {/* ==================================================
            ERREUR DYNAMIQUE
        ================================================== */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">

            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="text-sm font-bold">
                Une erreur est survenue
              </p>

              <p className="mt-1 text-sm leading-6">
                {error}
              </p>
            </div>

          </div>
        )}

        {/* ==================================================
            RÉPONSE ADMINISTRATEUR
        ================================================== */}

        {question.status !== "expired" && (
          <section className="overflow-hidden rounded-[2rem] border border-blue-200 bg-white shadow-xl shadow-blue-900/5 dark:border-blue-900/50 dark:bg-slate-900 dark:shadow-black/20">

            {/* ----------------------------------------------
                EN-TÊTE
            ---------------------------------------------- */}

            <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-5 dark:border-blue-900/40 dark:from-blue-950/30 dark:to-indigo-950/20 sm:px-6">

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10">
                  <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>

                <div>

                  <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
                    Administration
                  </p>

                  <h2 className="mt-0.5 text-lg font-black text-slate-900 dark:text-white">
                    Intervention de l'administration
                  </h2>

                </div>

              </div>

            </div>

            {/* ----------------------------------------------
                FORMULAIRE
            ---------------------------------------------- */}

            <form
              onSubmit={envoyerMessage}
              className="p-5 sm:p-6"
            >

              <textarea
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                maxLength={5000}
                rows={6}
                placeholder={
                  isTeacherConversation
                    ? "Écrire un message visible dans cette conversation..."
                    : "Écrire votre réponse..."
                }
                className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-950"
              />

              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center justify-between gap-4 sm:justify-start">

                  <span
                    className={`text-xs font-semibold ${
                      message.length > 4500
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {message.length}/5000 caractères
                  </span>

                </div>

                <button
                  type="submit"
                  disabled={
                    !message.trim() ||
                    sending
                  }
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50 sm:w-auto"
                >

                  {sending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  )}

                  {sending
                    ? "Envoi..."
                    : "Envoyer le message"}

                </button>

              </div>

            </form>

          </section>
        )}

        {/* ==================================================
            CONVERSATION EXPIRÉE
        ================================================== */}

        {question.status === "expired" && (
          <div className="rounded-2xl border border-slate-200 bg-slate-100 p-5 dark:border-slate-800 dark:bg-slate-900">

            <div className="flex items-start gap-3">

              <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400" />

              <div>

                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Cette conversation est expirée.
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Aucun nouveau message ne peut être envoyé
                  dans cette conversation.
                </p>

              </div>

            </div>

          </div>
        )}

        {/* ==================================================
            RETOUR EN BAS
        ================================================== */}

        <div className="flex justify-center pb-6 pt-8 sm:pb-10">

          <button
            type="button"
            onClick={retour}
            className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
          >

            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />

            {isTeacherConversation
              ? "Retour aux conversations enseignants"
              : "Retour aux questions"}

          </button>

        </div>

      </div>

    </div>
  );
}

