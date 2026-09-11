
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  RefreshCw,
  User,
  Clock,
  BookOpen,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  Hourglass,
  GraduationCap,
  CalendarDays,
  ShieldCheck,
  Sparkles,
  XCircle,
  Info,
} from "lucide-react";
import api from "../../utils/axios";

// ============================================================
// TYPES
// ============================================================

interface Message {
  id: number;
  sender_role: string;
  content: string;
  created_at: string;
}

interface Question {
  id: number;
  recipient_type: string;
  subject: string | null;
  is_learner: boolean;
  learner_class: string | null;
  title: string;
  content: string;
  status: string;
  created_at: string;
  expires_at: string;
  updated_at: string;
  messages: Message[];
}

// ============================================================
// COMPOSANT
// ============================================================

const ConversationEnseignant: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  // ============================================================
  // RETOUR À LA PAGE PRÉCÉDENTE
  // ============================================================

  const retourPagePrecedente = () => {
    navigate(-1);
  };

  // ============================================================
  // CHARGEMENT DE LA CONVERSATION
  // ============================================================

  const chargerConversation = async () => {
    if (!questionId) {
      setError("Identifiant de conversation invalide.");
      setLoading(false);
      return;
    }

    const id = Number(questionId);

    if (!Number.isInteger(id) || id <= 0) {
      setError("Identifiant de conversation invalide.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.get<Question>(
        `/api/teacher/questions/${id}`
      );

      setQuestion(response.data);
    } catch (err: any) {
      console.error(
        "Erreur lors du chargement de la conversation :",
        err
      );

      const detail =
        err?.response?.data?.detail ||
        "Impossible de charger cette conversation.";

      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CHARGEMENT INITIAL
  // ============================================================

  useEffect(() => {
    chargerConversation();
  }, [questionId]);

  // ============================================================
  // ENVOI D'UN MESSAGE
  // ============================================================

  const envoyerMessage = async () => {
    if (!questionId) return;

    const contenu = message.trim();

    if (!contenu) {
      return;
    }

    const id = Number(questionId);

    if (!Number.isInteger(id) || id <= 0) {
      setError("Identifiant de conversation invalide.");
      return;
    }

    try {
      setSending(true);
      setError(null);

      await api.post(`/api/teacher/questions/${id}/messages`, {
        content: contenu,
      });

      setMessage("");

      await chargerConversation();
    } catch (err: any) {
      console.error(
        "Erreur lors de l'envoi du message :",
        err
      );

      const detail =
        err?.response?.data?.detail ||
        "Impossible d'envoyer le message.";

      setError(detail);
    } finally {
      setSending(false);
    }
  };

  // ============================================================
  // ENVOI AVEC CTRL + ENTRÉE
  // ============================================================

  const gererTouche = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && event.ctrlKey) {
      event.preventDefault();
      envoyerMessage();
    }
  };

  // ============================================================
  // FORMATAGE DES DATES
  // ============================================================

  const formaterDate = (date: string) => {
    try {
      return new Date(date).toLocaleString("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return date;
    }
  };

  // ============================================================
  // STATUT
  // ============================================================

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "waiting":
        return "En attente";

      case "in_progress":
        return "En cours";

      case "answered":
        return "Répondue";

      case "expired":
        return "Expirée";

      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "waiting":
        return `
          bg-amber-100
          text-amber-700
          dark:bg-amber-500/15
          dark:text-amber-300
          ring-1
          ring-amber-200
          dark:ring-amber-500/20
        `;

      case "in_progress":
        return `
          bg-blue-100
          text-blue-700
          dark:bg-blue-500/15
          dark:text-blue-300
          ring-1
          ring-blue-200
          dark:ring-blue-500/20
        `;

      case "answered":
        return `
          bg-emerald-100
          text-emerald-700
          dark:bg-emerald-500/15
          dark:text-emerald-300
          ring-1
          ring-emerald-200
          dark:ring-emerald-500/20
        `;

      case "expired":
        return `
          bg-red-100
          text-red-700
          dark:bg-red-500/15
          dark:text-red-300
          ring-1
          ring-red-200
          dark:ring-red-500/20
        `;

      default:
        return `
          bg-slate-100
          text-slate-700
          dark:bg-slate-700
          dark:text-slate-200
          ring-1
          ring-slate-200
          dark:ring-slate-600
        `;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "waiting":
        return <Hourglass size={13} />;

      case "in_progress":
        return <Clock size={13} />;

      case "answered":
        return <CheckCircle2 size={13} />;

      case "expired":
        return <XCircle size={13} />;

      default:
        return <Info size={13} />;
    }
  };

  // ============================================================
  // CHARGEMENT
  // ============================================================

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-8 dark:bg-slate-950">
        {/* DÉCORATION */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative flex min-h-[75vh] items-center justify-center">
          <div className="flex flex-col items-center gap-5 rounded-3xl border border-slate-200 bg-white px-8 py-10 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <RefreshCw
                size={30}
                className="animate-spin"
              />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Chargement de la conversation
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Récupération des informations...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERREUR / CONVERSATION INTROUVABLE
  // ============================================================

  if (error && !question) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6">
        {/* DÉCORATION */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl">
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

          <div className="overflow-hidden rounded-3xl border border-red-200 bg-white shadow-xl dark:border-red-500/20 dark:bg-slate-900">
            <div className="h-1.5 bg-gradient-to-r from-red-500 to-rose-500" />

            <div className="p-6 sm:p-8">
              <div className="flex flex-col items-start gap-5 sm:flex-row">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  <AlertCircle size={27} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Impossible d'afficher la conversation
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="relative min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={retourPagePrecedente}
            className="
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
              hover:bg-slate-50
              hover:text-slate-900
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
        </div>
      </div>
    );
  }

  // ============================================================
  // CONVERSATION EXPIRÉE
  // ============================================================

  const estExpiree =
    question.status === "expired" ||
    new Date(question.expires_at).getTime() < Date.now();

  // ============================================================
  // AFFICHAGE
  // ============================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      {/* ========================================================
          ARRIÈRE-PLAN DÉCORATIF
      ======================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/5" />

        <div className="absolute right-[-120px] top-[25%] h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/5" />

        <div className="absolute -bottom-40 left-[25%] h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl dark:bg-cyan-500/5" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* ======================================================
            BARRE SUPÉRIEURE
        ====================================================== */}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={retourPagePrecedente}
            className="
              inline-flex
              w-fit
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

          <button
            type="button"
            onClick={chargerConversation}
            disabled={loading}
            className="
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-xl
              bg-blue-600
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-lg
              shadow-blue-600/20
              transition
              hover:bg-blue-700
              disabled:cursor-not-allowed
              disabled:opacity-60
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              focus:ring-offset-2
              dark:focus:ring-offset-slate-950
            "
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Actualiser
          </button>
        </div>

        {/* ======================================================
            BANDEAU TITRE
        ====================================================== */}

        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            <MessageCircle size={15} />
            Assistance pédagogique
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            Conversation avec l'apprenant
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Consultez la question, échangez avec l'apprenant et
            apportez une réponse pédagogique adaptée.
          </p>
        </div>

        {/* ======================================================
            ERREUR APRÈS CHARGEMENT
        ====================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 shadow-sm dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Une erreur est survenue
              </p>

              <p className="mt-1 leading-5">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ======================================================
            EN-TÊTE DE LA QUESTION
        ====================================================== */}

        <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
          {/* BANDEAU */}
          <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-5 py-6 dark:border-slate-800 dark:from-blue-500/10 dark:via-slate-900 dark:to-indigo-500/10 sm:px-7">
            <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                {/* BADGES */}
                <div className="mb-3 flex flex-wrap items-center gap-2">
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
                    <BookOpen size={13} />

                    {question.subject || "Matière non précisée"}
                  </span>

                  <span
                    className={`
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      px-3
                      py-1.5
                      text-xs
                      font-bold
                      ${getStatusClass(question.status)}
                    `}
                  >
                    {getStatusIcon(question.status)}

                    {getStatusLabel(question.status)}
                  </span>

                  {question.is_learner && (
                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-full
                        bg-violet-100
                        px-3
                        py-1.5
                        text-xs
                        font-bold
                        text-violet-700
                        ring-1
                        ring-violet-200
                        dark:bg-violet-500/15
                        dark:text-violet-300
                        dark:ring-violet-500/20
                      "
                    >
                      <GraduationCap size={13} />
                      Apprenant
                    </span>
                  )}
                </div>

                {/* TITRE */}
                <h2 className="break-words text-2xl font-black leading-tight text-slate-950 dark:text-white sm:text-3xl">
                  {question.title}
                </h2>

                {/* ID */}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    Conversation #{question.id}
                  </span>

                  <span className="hidden h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600 sm:block" />

                  <span>
                    Mise à jour :{" "}
                    {formaterDate(question.updated_at)}
                  </span>
                </div>
              </div>

              {/* PROFIL ENSEIGNANT */}
              <div
                className="
                  flex
                  shrink-0
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-blue-100
                  bg-white/80
                  px-4
                  py-3
                  shadow-sm
                  backdrop-blur
                  dark:border-blue-500/20
                  dark:bg-slate-800/70
                "
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                  <User size={19} />
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    Destinataire
                  </p>

                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    Enseignant
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ====================================================
              INFORMATIONS
          ==================================================== */}

          <div className="grid grid-cols-1 gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-3">
            {question.is_learner &&
              question.learner_class && (
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-slate-100
                    bg-slate-50
                    px-4
                    py-3
                    dark:border-slate-800
                    dark:bg-slate-800/60
                  "
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400">
                    <GraduationCap size={19} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Classe
                    </p>

                    <p className="truncate text-sm font-bold text-slate-800 dark:text-white">
                      {question.learner_class}
                    </p>
                  </div>
                </div>
              )}

            <div
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-slate-100
                bg-slate-50
                px-4
                py-3
                dark:border-slate-800
                dark:bg-slate-800/60
              "
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm dark:bg-slate-700 dark:text-slate-300">
                <CalendarDays size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Créée le
                </p>

                <p className="truncate text-sm font-bold text-slate-800 dark:text-white">
                  {formaterDate(question.created_at)}
                </p>
              </div>
            </div>

            <div
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-slate-100
                bg-slate-50
                px-4
                py-3
                dark:border-slate-800
                dark:bg-slate-800/60
              "
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm dark:bg-slate-700 dark:text-amber-400">
                <Clock size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Expiration
                </p>

                <p className="truncate text-sm font-bold text-slate-800 dark:text-white">
                  {formaterDate(question.expires_at)}
                </p>
              </div>
            </div>
          </div>

          {/* ====================================================
              QUESTION INITIALE
          ==================================================== */}

          <div className="p-5 sm:p-7">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                  <MessageCircle size={19} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Question de l'apprenant
                  </h3>

                  <p className="text-xs text-slate-400">
                    Message initial
                  </p>
                </div>
              </div>

              <Sparkles
                size={18}
                className="text-blue-500 dark:text-blue-400"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 text-sm leading-7 text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
              <p className="whitespace-pre-wrap">
                {question.content}
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================
            CONVERSATION
        ====================================================== */}

        <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
          {/* HEADER */}
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                <MessageCircle size={19} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Conversation
                </h2>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {question.messages.length}{" "}
                  {question.messages.length > 1
                    ? "messages échangés"
                    : "message échangé"}
                </p>
              </div>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <ShieldCheck size={14} />
              Échange privé
            </div>
          </div>

          {/* MESSAGES */}
          <div className="space-y-5 px-5 py-6 sm:px-7">
            {question.messages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center dark:border-slate-700 dark:bg-slate-800/40">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm dark:bg-slate-800 dark:text-slate-600">
                  <MessageCircle size={27} />
                </div>

                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  Aucun message supplémentaire
                </p>

                <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400 dark:text-slate-500">
                  Vous pouvez envoyer votre première réponse à
                  l'apprenant dans la zone située ci-dessous.
                </p>
              </div>
            ) : (
              question.messages.map((msg) => {
                const estEnseignant =
                  msg.sender_role === "teacher";

                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      estEnseignant
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`
                        max-w-[94%]
                        sm:max-w-[78%]
                        lg:max-w-[70%]
                        ${
                          estEnseignant
                            ? "items-end"
                            : "items-start"
                        }
                      `}
                    >
                      {/* IDENTITÉ */}
                      <div
                        className={`
                          mb-1.5
                          flex
                          items-center
                          gap-2
                          px-1
                          ${
                            estEnseignant
                              ? "justify-end"
                              : "justify-start"
                          }
                        `}
                      >
                        <div
                          className={`
                            flex
                            items-center
                            gap-1.5
                            text-[11px]
                            font-bold
                            ${
                              estEnseignant
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-slate-500 dark:text-slate-400"
                            }
                          `}
                        >
                          {estEnseignant ? (
                            <>
                              <User size={12} />
                              Vous
                            </>
                          ) : (
                            <>
                              <GraduationCap size={12} />
                              Apprenant
                            </>
                          )}
                        </div>

                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {formaterDate(msg.created_at)}
                        </span>
                      </div>

                      {/* BULLE */}
                      <div
                        className={`
                          rounded-2xl
                          px-4
                          py-3.5
                          shadow-sm
                          ${
                            estEnseignant
                              ? `
                                rounded-br-md
                                bg-blue-600
                                text-white
                                shadow-blue-600/10
                              `
                              : `
                                rounded-bl-md
                                border
                                border-slate-200
                                bg-slate-100
                                text-slate-800
                                dark:border-slate-700
                                dark:bg-slate-800
                                dark:text-slate-200
                              `
                          }
                        `}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-6">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ======================================================
            ZONE DE RÉPONSE
        ====================================================== */}

        {estExpiree ? (
          <div className="overflow-hidden rounded-3xl border border-red-200 bg-white shadow-xl shadow-slate-200/30 dark:border-red-500/20 dark:bg-slate-900 dark:shadow-black/20">
            <div className="h-1.5 bg-gradient-to-r from-red-500 to-rose-500" />

            <div className="p-5 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  <Clock size={23} />
                </div>

                <div>
                  <h3 className="text-base font-bold text-red-800 dark:text-red-300">
                    Conversation expirée
                  </h3>

                  <p className="mt-1.5 max-w-2xl text-sm leading-6 text-red-700/80 dark:text-red-300/70">
                    Cette conversation a dépassé sa durée
                    maximale de traitement. Il n'est plus
                    possible d'envoyer de nouveau message.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
            {/* HEADER */}
            <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                  <Send size={18} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">
                    Répondre à l'apprenant
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Votre réponse sera ajoutée directement à
                    cette conversation.
                  </p>
                </div>
              </div>
            </div>

            {/* FORMULAIRE */}
            <div className="p-5 sm:p-7">
              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                onKeyDown={gererTouche}
                disabled={sending}
                maxLength={5000}
                rows={6}
                placeholder="Écrivez votre réponse à l'apprenant..."
                className="
                  w-full
                  resize-y
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  py-4
                  text-sm
                  leading-6
                  text-slate-800
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-blue-500
                  focus:bg-white
                  focus:ring-4
                  focus:ring-blue-500/10
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  dark:border-slate-700
                  dark:bg-slate-800/70
                  dark:text-slate-200
                  dark:placeholder:text-slate-500
                  dark:focus:border-blue-500
                  dark:focus:bg-slate-800
                  dark:focus:ring-blue-500/10
                "
              />

              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-600 dark:text-slate-300">
                      Ctrl + Entrée
                    </span>{" "}
                    pour envoyer
                  </p>

                  <p
                    className={`text-xs ${
                      message.length >= 4800
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {message.length}/5000 caractères
                  </p>
                </div>

                <button
                  type="button"
                  onClick={envoyerMessage}
                  disabled={
                    sending ||
                    !message.trim()
                  }
                  className="
                    inline-flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-blue-600
                    px-6
                    py-3
                    text-sm
                    font-bold
                    text-white
                    shadow-lg
                    shadow-blue-600/20
                    transition
                    hover:bg-blue-700
                    hover:shadow-blue-600/30
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    sm:w-auto
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                    focus:ring-offset-2
                    dark:focus:ring-offset-slate-900
                  "
                >
                  {sending ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="animate-spin"
                      />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      Envoyer la réponse
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================
            FOOTER INFORMATIF
        ====================================================== */}

        <div className="mt-6 flex flex-col items-center justify-center gap-2 text-center text-xs text-slate-400 dark:text-slate-500 sm:flex-row">
          <ShieldCheck size={14} />

          <span>
            Les échanges avec les apprenants sont traités dans
            l'espace sécurisé de CODE.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ConversationEnseignant;

