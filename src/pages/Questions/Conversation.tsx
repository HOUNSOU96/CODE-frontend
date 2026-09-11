
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Loader2,
  MessageCircle,
  AlertCircle,
  ShieldCheck,
  BookOpen,
  RefreshCw,
  Clock,
  CheckCircle2,
  Sparkles,
  CalendarDays,
  UserRound,
  LockKeyhole,
  Info,
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

type QuestionStatus =
  | "waiting"
  | "in_progress"
  | "answered"
  | "expired"
  | string;

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
  messages: Message[];
};

// ============================================================
// COMPOSANT
// ============================================================

const Conversation: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();

  // ----------------------------------------------------------
  // ÉTATS
  // ----------------------------------------------------------

  const [question, setQuestion] =
    useState<Question | null>(null);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [sending, setSending] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // ==========================================================
  // RETOUR À LA PAGE PRÉCÉDENTE
  // ==========================================================

  const retourPagePrecedente = () => {
    navigate(-1);
  };

  // ==========================================================
  // VÉRIFICATION DE L'ID
  // ==========================================================

  const questionIdNumber = Number(questionId);

  // ==========================================================
  // CHARGER LA CONVERSATION
  // ==========================================================

  const charger = useCallback(
    async (silent = false) => {
      // --------------------------------------------------------
      // Vérification de l'identifiant
      // --------------------------------------------------------

      if (
        !questionId ||
        !Number.isInteger(questionIdNumber) ||
        questionIdNumber <= 0
      ) {
        setError(
          "Identifiant de question invalide."
        );

        setLoading(false);
        return;
      }

      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        console.log(
          "📨 Chargement de la conversation :",
          questionIdNumber
        );

        // ------------------------------------------------------
        // BACKEND
        //
        // GET /api/questions/{question_id}
        // ------------------------------------------------------

        const response =
          await api.get<Question>(
            `/api/questions/${questionIdNumber}`
          );

        console.log(
          "✅ Conversation reçue du backend :",
          response.data
        );

        setQuestion(response.data);
      } catch (err: any) {
        console.error(
          "❌ Erreur lors du chargement de la conversation :",
          err
        );

        const statusCode =
          err?.response?.status;

        const backendMessage =
          err?.response?.data?.detail;

        if (statusCode === 401) {
          setError(
            "Votre session a expiré. Veuillez vous reconnecter."
          );
        } else if (statusCode === 403) {
          setError(
            backendMessage ||
              "Vous n'avez pas accès à cette conversation."
          );
        } else if (statusCode === 404) {
          setError(
            backendMessage ||
              "Cette question est introuvable."
          );
        } else if (statusCode === 500) {
          setError(
            "Une erreur interne est survenue sur le serveur."
          );
        } else if (backendMessage) {
          setError(backendMessage);
        } else if (err?.request) {
          setError(
            "Impossible de contacter le serveur."
          );
        } else {
          setError(
            "Impossible de charger cette conversation."
          );
        }

        setQuestion(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [questionId, questionIdNumber]
  );

  // ==========================================================
  // CHARGEMENT INITIAL
  // ==========================================================

  useEffect(() => {
    charger();
  }, [charger]);

  // ==========================================================
  // ENVOYER UN MESSAGE
  // ==========================================================

  const envoyer = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const contenu = message.trim();

    if (!contenu || sending) {
      return;
    }

    if (
      !questionId ||
      !Number.isInteger(questionIdNumber) ||
      questionIdNumber <= 0
    ) {
      setError(
        "Impossible d'identifier cette question."
      );
      return;
    }

    // --------------------------------------------------------
    // Une conversation expirée ne peut plus recevoir
    // de message.
    // --------------------------------------------------------

    if (question?.status === "expired") {
      setError(
        "Cette question est expirée. Vous ne pouvez plus envoyer de message."
      );
      return;
    }

    try {
      setSending(true);
      setError(null);

      console.log(
        "📤 Envoi d'un message pour la question :",
        questionIdNumber
      );

      console.log(
        "📝 Contenu du message :",
        contenu
      );

      // ------------------------------------------------------
      // BACKEND
      //
      // POST /api/questions/{question_id}/messages
      // ------------------------------------------------------

      await api.post(
        `/api/questions/${questionIdNumber}/messages`,
        {
          content: contenu,
        }
      );

      console.log(
        "✅ Message envoyé avec succès."
      );

      // ------------------------------------------------------
      // Vider le champ
      // ------------------------------------------------------

      setMessage("");

      // ------------------------------------------------------
      // Recharger la conversation depuis le backend
      // afin d'afficher le message réellement enregistré.
      // ------------------------------------------------------

      await charger(true);
    } catch (err: any) {
      console.error(
        "❌ Erreur lors de l'envoi du message :",
        err
      );

      const statusCode =
        err?.response?.status;

      const backendMessage =
        err?.response?.data?.detail;

      if (statusCode === 400) {
        setError(
          backendMessage ||
            "Le message envoyé est invalide."
        );
      } else if (statusCode === 401) {
        setError(
          "Votre session a expiré. Veuillez vous reconnecter."
        );
      } else if (statusCode === 403) {
        setError(
          backendMessage ||
            "Vous n'avez pas l'autorisation de répondre à cette question."
        );
      } else if (statusCode === 404) {
        setError(
          backendMessage ||
            "Cette question est introuvable."
        );
      } else if (statusCode === 422) {
        setError(
          "Le contenu du message est invalide."
        );
      } else if (statusCode === 500) {
        setError(
          "Une erreur interne est survenue sur le serveur."
        );
      } else if (backendMessage) {
        setError(backendMessage);
      } else if (err?.request) {
        setError(
          "Impossible de contacter le serveur."
        );
      } else {
        setError(
          "Impossible d'envoyer le message."
        );
      }
    } finally {
      setSending(false);
    }
  };

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
        dateStyle: "short",
        timeStyle: "short",
      }).format(parsedDate);
    } catch {
      return date;
    }
  };

  // ==========================================================
  // INFORMATIONS DU STATUT
  // ==========================================================

  const getStatusInfo = (
    status: QuestionStatus
  ) => {
    switch (status) {
      case "waiting":
        return {
          label: "En attente",
          icon: Clock,
          className:
            "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 dark:border dark:border-amber-400/20",
        };

      case "in_progress":
        return {
          label: "En cours",
          icon: MessageCircle,
          className:
            "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 dark:border dark:border-blue-400/20",
        };

      case "answered":
        return {
          label: "Répondue",
          icon: CheckCircle2,
          className:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border dark:border-emerald-400/20",
        };

      case "expired":
        return {
          label: "Expirée",
          icon: AlertCircle,
          className:
            "bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300 dark:border dark:border-slate-600",
        };

      default:
        return {
          label: status,
          icon: Clock,
          className:
            "bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300 dark:border dark:border-slate-600",
        };
    }
  };

  // ==========================================================
  // CHARGEMENT
  // ==========================================================

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 dark:bg-slate-950">

        {/* Décoration */}

        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/10" />

        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/10" />

        <div className="relative flex flex-col items-center gap-5 rounded-3xl border border-slate-200 bg-white px-10 py-12 text-center shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10">

            <Loader2
              size={32}
              className="animate-spin text-blue-600 dark:text-blue-400"
            />

          </div>

          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white">
              Chargement de la conversation
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Veuillez patienter quelques instants...
            </p>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================================
  // QUESTION INTROUVABLE
  // ==========================================================

  if (!question) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-8 dark:bg-slate-950 md:px-8">

        {/* Décoration */}

        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">

          <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/30 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 md:p-12">

            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 dark:bg-red-500/10">

              <AlertCircle
                size={42}
                className="text-red-500 dark:text-red-400"
              />

            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300">
              <Info size={14} />
              Accès à la conversation
            </span>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Conversation inaccessible
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {error ||
                "Question introuvable."}
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

              <button
                type="button"
                onClick={() => charger()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <RefreshCw size={17} />

                Réessayer
              </button>

              <button
                type="button"
                onClick={retourPagePrecedente}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <ArrowLeft size={17} />

                Retour à la page précédente
              </button>

            </div>

          </div>

        </div>
      </div>
    );
  }

  // ==========================================================
  // DESTINATAIRE
  // ==========================================================

  const recipient =
    question.recipient_type === "admin"
      ? "Administrateur CODE"
      : question.subject || "Matière";

  const RecipientIcon =
    question.recipient_type === "admin"
      ? ShieldCheck
      : BookOpen;

  // ==========================================================
  // STATUT
  // ==========================================================

  const status =
    getStatusInfo(question.status);

  const StatusIcon = status.icon;

  // ==========================================================
  // RENDU
  // ==========================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100 md:px-8 md:py-8">

      {/* ======================================================
          ARRIÈRE-PLAN DÉCORATIF
          ====================================================== */}

      <div className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-600/10" />

      <div className="pointer-events-none absolute right-[-180px] top-[25%] h-[420px] w-[420px] rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-600/10" />

      <div className="pointer-events-none absolute bottom-[-180px] left-[25%] h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-3xl dark:bg-cyan-500/5" />

      <div className="relative mx-auto max-w-5xl">

        {/* ==================================================
            BARRE SUPÉRIEURE
            ================================================== */}

        <div className="mb-6 flex items-center justify-between gap-3">

          <button
            type="button"
            onClick={retourPagePrecedente}
            className="group inline-flex items-center gap-2 rounded-xl border border-transparent px-2 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-blue-400"
          >
            <ArrowLeft
              size={18}
              className="transition-transform group-hover:-translate-x-0.5"
            />

            <span>
              Retour
            </span>
          </button>

          <button
            type="button"
            onClick={() => charger(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800"
          >

            {refreshing ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <RefreshCw size={16} />
            )}

            <span className="hidden sm:inline">
              Actualiser
            </span>

          </button>

        </div>

        {/* ==================================================
            CARTE PRINCIPALE
            ================================================== */}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">

          {/* ==================================================
              EN-TÊTE
              ================================================== */}

          <div className="border-b border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-7">

            <div className="flex flex-col gap-5">

              {/* Ligne supérieure */}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                <div className="min-w-0">

                  <div className="mb-3 flex flex-wrap items-center gap-2">

                    {/* DESTINATAIRE */}

                    <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-300">

                      <RecipientIcon size={14} />

                      {recipient}

                    </span>

                    {/* CLASSE */}

                    {question.is_learner &&
                      question.learner_class && (
                        <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 dark:border-purple-400/20 dark:bg-purple-500/10 dark:text-purple-300">

                          <UserRound size={13} />

                          {question.learner_class}

                        </span>
                      )}

                    {/* STATUT */}

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${status.className}`}
                    >

                      <StatusIcon size={14} />

                      {status.label}

                    </span>

                  </div>

                  <h1 className="max-w-3xl text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                    {question.title}
                  </h1>

                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400 dark:text-slate-500">

                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={14} />

                      Créée le{" "}
                      {formatDate(
                        question.created_at
                      )}
                    </span>

                    {question.status !== "expired" &&
                      question.expires_at && (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock size={14} />

                          Expire le{" "}
                          {formatDate(
                            question.expires_at
                          )}
                        </span>
                      )}

                  </div>

                </div>

                {/* Icône conversation */}

                <div className="hidden shrink-0 sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10">

                  <MessageCircle
                    size={26}
                    className="text-blue-600 dark:text-blue-400"
                  />

                </div>

              </div>

              {/* Petite ligne d'information */}

              <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50">

                <Sparkles
                  size={15}
                  className="shrink-0 text-blue-500 dark:text-blue-400"
                />

                <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Cette conversation vous permet d'échanger directement au sujet de votre question.
                </p>

              </div>

            </div>

          </div>

          {/* ==================================================
              ZONE DES MESSAGES
              ================================================== */}

          <div className="bg-slate-50/80 p-4 dark:bg-slate-950/40 sm:p-6 md:p-8">

            <div className="mx-auto max-w-4xl space-y-5">

              {/* QUESTION INITIALE */}

              <div className="flex justify-end">

                <div className="max-w-[88%] sm:max-w-[75%]">

                  <div className="mb-1.5 flex justify-end px-1">

                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                      Votre question
                    </span>

                  </div>

                  <div className="rounded-2xl rounded-tr-md bg-blue-600 p-4 text-white shadow-lg shadow-blue-600/10 dark:bg-blue-500">

                    <p className="whitespace-pre-wrap text-sm leading-6">
                      {question.content}
                    </p>

                    <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-blue-100">
                      <CheckCircle2 size={12} />

                      {formatDate(
                        question.created_at
                      )}
                    </div>

                  </div>

                </div>

              </div>

              {/* MESSAGES */}

              {question.messages &&
                question.messages.length > 0 &&
                question.messages.map(
                  (msg) => {

                    const isUser =
                      msg.sender_role ===
                      "user";

                    const isTeacher =
                      msg.sender_role ===
                      "teacher";

                    const isAdmin =
                      msg.sender_role ===
                      "admin";

                    return (
                      <div
                        key={msg.id}
                        className={
                          isUser
                            ? "flex justify-end"
                            : "flex justify-start"
                        }
                      >

                        <div className="max-w-[88%] sm:max-w-[75%]">

                          {/* EXPÉDITEUR */}

                          <div
                            className={`mb-1.5 flex items-center gap-2 px-1 text-[11px] font-semibold ${
                              isUser
                                ? "justify-end text-slate-400 dark:text-slate-500"
                                : "text-slate-500 dark:text-slate-400"
                            }`}
                          >

                            {!isUser && (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm dark:bg-slate-800">

                                {isTeacher ? (
                                  <BookOpen
                                    size={11}
                                    className="text-emerald-500"
                                  />
                                ) : isAdmin ? (
                                  <ShieldCheck
                                    size={11}
                                    className="text-blue-500"
                                  />
                                ) : (
                                  <MessageCircle
                                    size={11}
                                    className="text-slate-500"
                                  />
                                )}

                              </div>
                            )}

                            <span>
                              {isTeacher
                                ? "Enseignant"
                                : isAdmin
                                ? "Administrateur CODE"
                                : "Vous"}
                            </span>

                          </div>

                          {/* BULLE */}

                          <div
                            className={`rounded-2xl p-4 shadow-sm ${
                              isUser
                                ? "rounded-tr-md bg-blue-600 text-white dark:bg-blue-500"
                                : "rounded-tl-md border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                            }`}
                          >

                            <p className="whitespace-pre-wrap text-sm leading-6">
                              {msg.content}
                            </p>

                            <p
                              className={`mt-3 text-[11px] ${
                                isUser
                                  ? "text-right text-blue-100"
                                  : "text-slate-400 dark:text-slate-500"
                              }`}
                            >
                              {formatDate(
                                msg.created_at
                              )}
                            </p>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              {/* AUCUNE RÉPONSE */}

              {(!question.messages ||
                question.messages.length === 0) && (
                <div className="py-8 text-center">

                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-900">

                    <MessageCircle
                      size={22}
                      className="text-slate-300 dark:text-slate-600"
                    />

                  </div>

                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Aucun message supplémentaire
                    pour le moment.
                  </p>

                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Votre question est en attente d'une réponse.
                  </p>

                </div>
              )}

            </div>

          </div>

          {/* ==================================================
              ERREUR
              ================================================== */}

          {error && (
            <div className="border-t border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/5">

              <div className="mx-auto flex max-w-4xl items-start gap-3 rounded-xl border border-red-200 bg-white p-3 text-sm text-red-700 shadow-sm dark:border-red-500/20 dark:bg-slate-900 dark:text-red-300">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-500/10">

                  <AlertCircle
                    size={17}
                    className="text-red-500 dark:text-red-400"
                  />

                </div>

                <div className="min-w-0">

                  <p className="font-semibold">
                    Une erreur est survenue
                  </p>

                  <p className="mt-0.5 text-xs leading-5 text-red-600/80 dark:text-red-300/80">
                    {error}
                  </p>

                </div>

              </div>

            </div>
          )}

          {/* ==================================================
              FORMULAIRE DE RÉPONSE
              ================================================== */}

          {question.status !== "expired" && (
            <form
              onSubmit={envoyer}
              className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
            >

              <div className="mx-auto max-w-4xl">

                <div className="mb-3 flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">

                    <Send
                      size={15}
                      className="text-blue-600 dark:text-blue-400"
                    />

                  </div>

                  <div>

                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Votre réponse
                    </p>

                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Répondez directement à {recipient}.
                    </p>

                  </div>

                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">

                  <div className="relative flex-1">

                    <textarea
                      value={message}
                      onChange={(e) =>
                        setMessage(
                          e.target.value
                        )
                      }
                      rows={3}
                      disabled={sending}
                      maxLength={5000}
                      placeholder="Écrivez votre message..."
                      className="min-h-[100px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:border-blue-500 dark:focus:bg-slate-950"
                    />

                  </div>

                  <button
                    type="submit"
                    disabled={
                      sending ||
                      !message.trim()
                    }
                    className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                    title="Envoyer"
                  >

                    {sending ? (
                      <>
                        <Loader2
                          size={19}
                          className="animate-spin"
                        />

                        <span>
                          Envoi...
                        </span>
                      </>
                    ) : (
                      <>
                        <Send size={18} />

                        <span>
                          Envoyer
                        </span>
                      </>
                    )}

                  </button>

                </div>

                <div className="mt-3 flex flex-col gap-1 text-xs text-slate-400 dark:text-slate-500 sm:flex-row sm:items-center sm:justify-between">

                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck size={13} />

                    Votre message sera envoyé à{" "}
                    {recipient}.
                  </span>

                  <span>
                    {message.length}/5000
                  </span>

                </div>

              </div>

            </form>
          )}

          {/* ==================================================
              QUESTION EXPIRÉE
              ================================================== */}

          {question.status === "expired" && (
            <div className="border-t border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50">

              <div className="mx-auto flex max-w-4xl items-center justify-center">

                <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">

                    <LockKeyhole
                      size={17}
                      className="text-slate-500 dark:text-slate-400"
                    />

                  </div>

                  <div>

                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      Conversation expirée
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      Cette question est expirée. Il n'est plus possible d'y répondre.
                    </p>

                  </div>

                </div>

              </div>

            </div>
          )}

        </div>

        {/* ==================================================
            PIED DE PAGE
            ================================================== */}

        <div className="mt-5 flex flex-col items-center justify-center gap-2 text-center text-xs text-slate-400 dark:text-slate-600 sm:flex-row">

          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={13} />
            Conversation sécurisée
          </span>

          <span className="hidden sm:inline">
            •
          </span>

          <span>
            CODE — Écosystème éducatif
          </span>

        </div>

      </div>
    </div>
  );
};

export default Conversation;

