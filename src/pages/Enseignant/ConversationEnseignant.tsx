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
        return "bg-amber-100 text-amber-700";

      case "in_progress":
        return "bg-blue-100 text-blue-700";

      case "answered":
        return "bg-emerald-100 text-emerald-700";

      case "expired":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // ============================================================
  // CHARGEMENT
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <RefreshCw
            size={30}
            className="animate-spin text-blue-600"
          />

          <p className="text-sm">
            Chargement de la conversation...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERREUR / CONVERSATION INTROUVABLE
  // ============================================================

  if (error && !question) {
    return (
      <div className="min-h-[70vh] px-4 py-6">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={retourPagePrecedente}
            className="
              mb-5
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-slate-600
              shadow-sm
              ring-1
              ring-slate-200
              transition
              hover:bg-slate-100
              hover:text-slate-900
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          >
            <ArrowLeft size={17} />
            Retour à la page précédente
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            <div className="flex items-start gap-3">
              <MessageCircle
                size={22}
                className="mt-0.5 shrink-0"
              />

              <div>
                <h2 className="font-semibold">
                  Impossible d'afficher la conversation
                </h2>

                <p className="mt-1 text-sm">
                  {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-[70vh] px-4 py-6">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={retourPagePrecedente}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-slate-600
              shadow-sm
              ring-1
              ring-slate-200
              transition
              hover:bg-slate-100
              hover:text-slate-900
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          >
            <ArrowLeft size={17} />
            Retour à la page précédente
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
    <div className="min-h-[70vh] px-4 py-6">
      <div className="mx-auto max-w-5xl">

        {/* ======================================================
            BARRE SUPÉRIEURE
        ====================================================== */}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <button
            type="button"
            onClick={retourPagePrecedente}
            className="
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-xl
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-slate-600
              shadow-sm
              ring-1
              ring-slate-200
              transition
              hover:bg-slate-100
              hover:text-slate-900
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          >
            <ArrowLeft size={17} />
            Retour à la page précédente
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
              shadow-sm
              transition
              hover:bg-blue-700
              disabled:cursor-not-allowed
              disabled:opacity-60
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              focus:ring-offset-2
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
            ERREUR APRÈS CHARGEMENT
        ====================================================== */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ======================================================
            EN-TÊTE DE LA CONVERSATION
        ====================================================== */}

        <div className="mb-5 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">

          <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-5 sm:px-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

              <div className="min-w-0 flex-1">

                <div className="mb-2 flex flex-wrap items-center gap-2">

                  <span className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    bg-blue-100
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    text-blue-700
                  ">
                    <BookOpen size={13} />
                    {question.subject || "Matière"}
                  </span>

                  <span
                    className={`
                      inline-flex
                      items-center
                      rounded-full
                      px-3
                      py-1
                      text-xs
                      font-semibold
                      ${getStatusClass(question.status)}
                    `}
                  >
                    {getStatusLabel(question.status)}
                  </span>

                </div>

                <h1 className="
                  break-words
                  text-xl
                  font-bold
                  text-slate-900
                  sm:text-2xl
                ">
                  {question.title}
                </h1>

              </div>

              <div className="
                flex
                shrink-0
                items-center
                gap-2
                rounded-xl
                bg-white
                px-3
                py-2
                text-xs
                font-semibold
                text-blue-700
                shadow-sm
              ">
                <User size={16} />
                Enseignant
              </div>

            </div>
          </div>

          {/* ====================================================
              INFORMATIONS
          ==================================================== */}

          <div className="
            grid
            grid-cols-1
            gap-3
            border-b
            border-slate-100
            px-5
            py-4
            sm:grid-cols-2
            sm:px-6
          ">

            {question.is_learner && question.learner_class && (
              <div className="
                flex
                items-center
                gap-3
                rounded-xl
                bg-slate-50
                px-4
                py-3
              ">
                <div className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  bg-white
                  text-blue-600
                  shadow-sm
                ">
                  <BookOpen size={18} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Classe
                  </p>

                  <p className="text-sm font-semibold text-slate-800">
                    {question.learner_class}
                  </p>
                </div>
              </div>
            )}

            <div className="
              flex
              items-center
              gap-3
              rounded-xl
              bg-slate-50
              px-4
              py-3
            ">
              <div className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-white
                text-slate-600
                shadow-sm
              ">
                <Clock size={18} />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Créée le
                </p>

                <p className="text-sm font-semibold text-slate-800">
                  {formaterDate(question.created_at)}
                </p>
              </div>
            </div>

          </div>

          {/* ====================================================
              QUESTION INITIALE
          ==================================================== */}

          <div className="px-5 py-5 sm:px-6">

            <div className="mb-2 flex items-center gap-2">
              <div className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                bg-blue-100
                text-blue-700
              ">
                <MessageCircle size={16} />
              </div>

              <h2 className="font-semibold text-slate-900">
                Question de l'apprenant
              </h2>
            </div>

            <div className="
              whitespace-pre-wrap
              rounded-xl
              bg-slate-50
              px-4
              py-4
              text-sm
              leading-6
              text-slate-700
            ">
              {question.content}
            </div>

          </div>
        </div>

        {/* ======================================================
            MESSAGES
        ====================================================== */}

        <div className="mb-5 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">

          <div className="
            border-b
            border-slate-100
            px-5
            py-4
            sm:px-6
          ">
            <div className="flex items-center justify-between gap-3">

              <div>
                <h2 className="font-semibold text-slate-900">
                  Conversation
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  {question.messages.length}{" "}
                  {question.messages.length > 1
                    ? "messages"
                    : "message"}
                </p>
              </div>

            </div>
          </div>

          <div className="space-y-4 px-5 py-5 sm:px-6">

            {question.messages.length === 0 ? (
              <div className="
                rounded-xl
                border
                border-dashed
                border-slate-200
                px-5
                py-8
                text-center
              ">
                <MessageCircle
                  size={30}
                  className="mx-auto mb-3 text-slate-300"
                />

                <p className="text-sm font-medium text-slate-500">
                  Aucun message supplémentaire.
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Vous pouvez envoyer votre première réponse
                  ci-dessous.
                </p>
              </div>
            ) : (
              question.messages.map((msg) => {

                const estEnseignant =
                  msg.sender_role === "teacher";

                return (
                  <div
                    key={msg.id}
                    className={`
                      flex
                      ${
                        estEnseignant
                          ? "justify-end"
                          : "justify-start"
                      }
                    `}
                  >
                    <div
                      className={`
                        max-w-[90%]
                        rounded-2xl
                        px-4
                        py-3
                        sm:max-w-[75%]
                        ${
                          estEnseignant
                            ? "rounded-br-md bg-blue-600 text-white"
                            : "rounded-bl-md bg-slate-100 text-slate-800"
                        }
                      `}
                    >

                      <div className="
                        mb-1.5
                        flex
                        items-center
                        justify-between
                        gap-4
                      ">

                        <span
                          className={`
                            text-xs
                            font-semibold
                            ${
                              estEnseignant
                                ? "text-blue-100"
                                : "text-slate-500"
                            }
                          `}
                        >
                          {estEnseignant
                            ? "Vous"
                            : "Apprenant"}
                        </span>

                        <span
                          className={`
                            text-[11px]
                            ${
                              estEnseignant
                                ? "text-blue-100"
                                : "text-slate-400"
                            }
                          `}
                        >
                          {formaterDate(msg.created_at)}
                        </span>

                      </div>

                      <p className="
                        whitespace-pre-wrap
                        text-sm
                        leading-6
                      ">
                        {msg.content}
                      </p>

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
          <div className="
            rounded-2xl
            border
            border-red-200
            bg-red-50
            px-5
            py-5
            text-red-700
            shadow-sm
          ">
            <div className="flex items-start gap-3">

              <Clock
                size={21}
                className="mt-0.5 shrink-0"
              />

              <div>
                <h3 className="font-semibold">
                  Conversation expirée
                </h3>

                <p className="mt-1 text-sm leading-6">
                  Cette conversation a dépassé sa durée
                  maximale de traitement. Il n'est plus
                  possible d'envoyer de nouveau message.
                </p>
              </div>

            </div>
          </div>
        ) : (
          <div className="
            overflow-hidden
            rounded-2xl
            bg-white
            shadow-sm
            ring-1
            ring-slate-200
          ">

            <div className="
              border-b
              border-slate-100
              px-5
              py-4
              sm:px-6
            ">
              <h2 className="font-semibold text-slate-900">
                Répondre à l'apprenant
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Votre réponse sera ajoutée directement à
                cette conversation.
              </p>
            </div>

            <div className="px-5 py-5 sm:px-6">

              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                onKeyDown={gererTouche}
                disabled={sending}
                maxLength={5000}
                rows={5}
                placeholder="Écrivez votre réponse..."
                className="
                  w-full
                  resize-y
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  py-3
                  text-sm
                  text-slate-800
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-blue-500
                  focus:bg-white
                  focus:ring-2
                  focus:ring-blue-100
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />

              <div className="
                mt-3
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              ">

                <p className="text-xs text-slate-400">
                  Ctrl + Entrée pour envoyer
                  {" • "}
                  {message.length}/5000
                </p>

                <button
                  type="button"
                  onClick={envoyerMessage}
                  disabled={
                    sending ||
                    !message.trim()
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-blue-600
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-blue-700
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                    focus:ring-offset-2
                  "
                >
                  {sending ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="animate-spin"
                      />
                      Envoi...
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

      </div>
    </div>
  );
};

export default ConversationEnseignant;