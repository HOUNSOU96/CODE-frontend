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
            "bg-amber-100 text-amber-700",
        };

      case "in_progress":
        return {
          label: "En cours",
          icon: MessageCircle,
          className:
            "bg-blue-100 text-blue-700",
        };

      case "answered":
        return {
          label: "Répondue",
          icon: CheckCircle2,
          className:
            "bg-green-100 text-green-700",
        };

      case "expired":
        return {
          label: "Expirée",
          icon: AlertCircle,
          className:
            "bg-gray-100 text-gray-600",
        };

      default:
        return {
          label: status,
          icon: Clock,
          className:
            "bg-gray-100 text-gray-600",
        };
    }
  };

  // ==========================================================
  // CHARGEMENT
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">

          <Loader2
            size={35}
            className="animate-spin text-blue-600"
          />

          <p className="text-sm text-slate-500">
            Chargement de la conversation...
          </p>

        </div>
      </div>
    );
  }

  // ==========================================================
  // QUESTION INTROUVABLE
  // ==========================================================

  if (!question) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">

        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

          <AlertCircle
            size={40}
            className="mx-auto mb-4 text-red-500"
          />

          <h1 className="text-xl font-bold text-slate-800">
            Conversation inaccessible
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error ||
              "Question introuvable."}
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">

            <button
              type="button"
              onClick={() => charger()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={17} />

              Réessayer
            </button>

            <button
              type="button"
              onClick={retourPagePrecedente}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <ArrowLeft size={17} />

              Retour à la page précédente
            </button>

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
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">

      <div className="mx-auto max-w-4xl">

        {/* ==================================================
            RETOUR + ACTUALISATION
            ================================================== */}

        <div className="mb-5 flex items-center justify-between gap-3">

          <button
            type="button"
            onClick={retourPagePrecedente}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            <ArrowLeft size={18} />

            Retour à la page précédente
          </button>

          <button
            type="button"
            onClick={() => charger(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
            CONVERSATION
            ================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* ==================================================
              EN-TÊTE DE LA QUESTION
              ================================================== */}

          <div className="border-b border-slate-200 p-6">

            <div className="mb-3 flex flex-wrap items-center gap-2">

              {/* DESTINATAIRE */}

              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">

                <RecipientIcon size={14} />

                {recipient}

              </span>

              {/* CLASSE */}

              {question.is_learner &&
                question.learner_class && (
                  <span className="rounded-full bg-purple-100 px-3 py-1.5 text-xs font-semibold text-purple-700">
                    {question.learner_class}
                  </span>
                )}

              {/* STATUT */}

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}
              >

                <StatusIcon size={14} />

                {status.label}

              </span>

            </div>

            {/* TITRE */}

            <h1 className="text-xl font-bold text-slate-800 md:text-2xl">
              {question.title}
            </h1>

            {/* DATE */}

            <p className="mt-2 text-xs text-slate-400">
              Question créée le{" "}
              {formatDate(
                question.created_at
              )}
            </p>

            {/* EXPIRATION */}

            {question.status !== "expired" &&
              question.expires_at && (
                <p className="mt-1 text-xs text-slate-400">
                  Cette question expire le{" "}
                  {formatDate(
                    question.expires_at
                  )}
                </p>
              )}

          </div>

          {/* ==================================================
              MESSAGES
              ================================================== */}

          <div className="space-y-5 bg-slate-50 p-5 md:p-8">

            {/* QUESTION INITIALE */}

            <div className="flex justify-end">

              <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-blue-600 p-4 text-white shadow-sm">

                <p className="whitespace-pre-wrap text-sm leading-6">
                  {question.content}
                </p>

                <p className="mt-2 text-right text-[11px] text-blue-100">
                  Vous ·{" "}
                  {formatDate(
                    question.created_at
                  )}
                </p>

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

                      <div
                        className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                          isUser
                            ? "rounded-tr-md bg-blue-600 text-white"
                            : "rounded-tl-md border border-slate-200 bg-white text-slate-800"
                        }`}
                      >

                        {/* EXPÉDITEUR */}

                        <div
                          className={`mb-2 flex items-center gap-2 text-xs font-semibold ${
                            isUser
                              ? "text-white"
                              : "text-slate-700"
                          }`}
                        >

                          <MessageCircle size={14} />

                          {isTeacher
                            ? "Enseignant"
                            : isAdmin
                            ? "Administrateur CODE"
                            : "Vous"}

                        </div>

                        {/* MESSAGE */}

                        <p className="whitespace-pre-wrap text-sm leading-6">
                          {msg.content}
                        </p>

                        {/* DATE */}

                        <p
                          className={`mt-2 text-[11px] ${
                            isUser
                              ? "text-blue-100"
                              : "text-slate-400"
                          }`}
                        >
                          {formatDate(
                            msg.created_at
                          )}
                        </p>

                      </div>

                    </div>
                  );
                }
              )}

            {/* AUCUNE RÉPONSE */}

            {(!question.messages ||
              question.messages.length === 0) && (
                <div className="py-4 text-center">

                  <p className="text-xs text-slate-400">
                    Aucun message supplémentaire
                    pour le moment.
                  </p>

                </div>
              )}

          </div>

          {/* ==================================================
              ERREUR
              ================================================== */}

          {error && (
            <div className="border-t border-red-200 bg-red-50 p-4">

              <div className="flex items-start gap-3 text-sm text-red-700">

                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <p className="font-medium">
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
              className="border-t border-slate-200 bg-white p-4 md:p-6"
            >

              <div className="flex flex-col gap-3 sm:flex-row">

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
                  className="min-h-[90px] flex-1 resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                />

                <button
                  type="submit"
                  disabled={
                    sending ||
                    !message.trim()
                  }
                  className="self-end rounded-xl bg-blue-600 p-3 text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Envoyer"
                >

                  {sending ? (
                    <Loader2
                      size={20}
                      className="animate-spin"
                    />
                  ) : (
                    <Send size={20} />
                  )}

                </button>

              </div>

              <div className="mt-2 flex justify-between text-xs text-slate-400">

                <span>
                  Votre message sera envoyé à{" "}
                  {recipient}.
                </span>

                <span>
                  {message.length}/5000
                </span>

              </div>

            </form>
          )}

          {/* ==================================================
              QUESTION EXPIRÉE
              ================================================== */}

          {question.status === "expired" && (
            <div className="border-t border-slate-200 bg-slate-50 p-5 text-center">

              <div className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-3 text-sm font-medium text-gray-600">

                <AlertCircle size={18} />

                Cette question est expirée.
                Il n'est plus possible d'y répondre.

              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Conversation;