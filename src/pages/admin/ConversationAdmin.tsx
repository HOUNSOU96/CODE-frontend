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
  waiting: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  answered: "bg-green-100 text-green-800",
  expired: "bg-gray-200 text-gray-700",
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

  /*
   * Si l'URL commence par :
   *
   * /admin/conversations-enseignants/
   *
   * alors il s'agit d'une conversation destinée
   * aux enseignants.
   *
   * Sinon, il s'agit d'une question destinée
   * à l'administration.
   */

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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2
          className="h-10 w-10 animate-spin text-blue-600"
        />
      </div>
    );
  }

  // ==========================================================
  // ERREUR
  // ==========================================================

  if (error && !question) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">

          {/* ----------------------------------------------
              ERREUR
          ---------------------------------------------- */}

          <div className="flex items-start gap-3 text-red-700">

            <AlertCircle className="h-6 w-6 shrink-0" />

            <div>

              <h1 className="font-bold">
                Impossible d'ouvrir la conversation
              </h1>

              <p className="mt-1">
                {error}
              </p>

            </div>

          </div>

          {/* ----------------------------------------------
              BOUTON RETOUR
          ---------------------------------------------- */}

          <button
            onClick={retour}
            className="mt-6 inline-flex items-center gap-2
                       rounded-xl bg-gray-900 px-4 py-3
                       font-medium text-white
                       shadow-sm transition
                       hover:bg-gray-800
                       focus:outline-none
                       focus:ring-2
                       focus:ring-gray-500"
          >
            <ArrowLeft className="h-5 w-5" />

            {isTeacherConversation
              ? "Retour aux conversations enseignants"
              : "Retour aux questions"}
          </button>

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
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-8">

      <div className="mx-auto max-w-5xl">

        {/* ====================================================
            NAVIGATION
        ==================================================== */}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

          {/* ----------------------------------------------
              RETOUR
          ---------------------------------------------- */}

          <button
            onClick={retour}
            className="inline-flex items-center gap-2
                       rounded-xl bg-white px-4 py-3
                       font-medium text-gray-700
                       shadow-sm ring-1 ring-gray-200
                       transition
                       hover:bg-gray-50
                       hover:text-gray-900
                       focus:outline-none
                       focus:ring-2
                       focus:ring-blue-500"
          >
            <ArrowLeft className="h-5 w-5" />

            <span>
              {isTeacherConversation
                ? "Retour aux conversations enseignants"
                : "Retour aux questions"}
            </span>
          </button>

          {/* ----------------------------------------------
              ACTUALISER
          ---------------------------------------------- */}

          <button
            onClick={actualiser}
            disabled={refreshing}
            className="inline-flex items-center gap-2
                       rounded-xl bg-white px-4 py-3
                       font-medium text-gray-700
                       shadow-sm ring-1 ring-gray-200
                       transition
                       hover:bg-gray-50
                       disabled:cursor-not-allowed
                       disabled:opacity-60"
          >

            {refreshing ? (
              <Loader2
                className="h-5 w-5 animate-spin"
              />
            ) : (
              <RefreshCw className="h-5 w-5" />
            )}

            Actualiser

          </button>

        </div>

        {/* ====================================================
            BADGE ADMINISTRATEUR
        ==================================================== */}

        <div
          className="mb-5 flex items-center gap-2
                     rounded-xl border border-blue-200
                     bg-blue-50 p-4 text-blue-800"
        >

          <ShieldCheck className="h-5 w-5" />

          <span className="text-sm font-medium">
            Vue administrateur — conversation complète
          </span>

        </div>

        {/* ====================================================
            INFORMATIONS DE LA CONVERSATION
        ==================================================== */}

        <div
          className="mb-5 rounded-2xl bg-white p-6
                     shadow-sm ring-1 ring-gray-200"
        >

          {/* ----------------------------------------------
              BADGES
          ---------------------------------------------- */}

          <div className="mb-4 flex flex-wrap items-center gap-2">

            {/* STATUT */}

            <span
              className={`rounded-full px-3 py-1
                          text-xs font-semibold
                          ${
                            statutClass[
                              question.status
                            ]
                          }`}
            >
              {
                statutLabel[
                  question.status
                ]
              }
            </span>

            {/* DESTINATAIRE */}

            {question.recipient_type ===
            "subject" ? (
              <span
                className="inline-flex items-center gap-1
                           rounded-full bg-purple-100
                           px-3 py-1 text-xs
                           font-semibold
                           text-purple-800"
              >

                <GraduationCap
                  className="h-4 w-4"
                />

                Enseignant —{" "}
                {question.subject}

              </span>
            ) : (
              <span
                className="rounded-full
                           bg-blue-100 px-3 py-1
                           text-xs font-semibold
                           text-blue-800"
              >
                Administration CODE
              </span>
            )}

            {/* CLASSE */}

            {question.learner_class && (
              <span
                className="rounded-full
                           bg-gray-100 px-3 py-1
                           text-xs text-gray-700"
              >
                {question.learner_class}
              </span>
            )}

          </div>

          {/* ----------------------------------------------
              TITRE
          ---------------------------------------------- */}

          <h1
            className="text-2xl font-bold
                       text-gray-900"
          >
            {question.title}
          </h1>

          {/* ----------------------------------------------
              INFORMATIONS ÉLÈVE
          ---------------------------------------------- */}

          <div
            className="mt-5 grid gap-4 md:grid-cols-2"
          >

            <div
              className="rounded-xl
                         bg-gray-50 p-4"
            >

              <div
                className="mb-2 flex items-center
                           gap-2 text-sm
                           font-semibold
                           text-gray-700"
              >

                <User className="h-4 w-4" />

                Élève

              </div>

              <p
                className="font-bold
                           text-gray-900"
              >
                {question.user_prenom}{" "}
                {question.user_nom}
              </p>

              <div
                className="mt-1 flex items-center
                           gap-2 text-sm
                           text-gray-500"
              >

                <Mail className="h-4 w-4" />

                {question.user_email}

              </div>

            </div>

            {/* ------------------------------------------
                ENSEIGNANTS
            ------------------------------------------ */}

            {isTeacherConversation && (
              <div
                className="rounded-xl
                           bg-purple-50 p-4"
              >

                <div
                  className="mb-2 flex items-center
                             gap-2 text-sm
                             font-semibold
                             text-purple-800"
                >

                  <GraduationCap
                    className="h-4 w-4"
                  />

                  Enseignant(s)

                </div>

                {question.teacher_names &&
                question.teacher_names.length >
                  0 ? (
                  <div className="flex flex-wrap gap-2">

                    {question.teacher_names.map(
                      (teacher) => (
                        <span
                          key={teacher}
                          className="rounded-lg
                                     bg-white px-3 py-1
                                     text-sm
                                     font-medium
                                     text-purple-800
                                     shadow-sm"
                        >
                          {teacher}
                        </span>
                      )
                    )}

                  </div>
                ) : (
                  <p
                    className="text-sm italic
                               text-purple-600"
                  >
                    Aucun enseignant n'a encore
                    répondu.
                  </p>
                )}

              </div>
            )}

          </div>

          {/* ----------------------------------------------
              DATES
          ---------------------------------------------- */}

          <div
            className="mt-5 flex flex-wrap
                       gap-4 text-xs
                       text-gray-400"
          >

            <span>
              Créée le{" "}
              {formatDate(
                question.created_at
              )}
            </span>

            <span>
              Dernière modification :{" "}
              {formatDate(
                question.updated_at
              )}
            </span>

            <span>
              Expire le{" "}
              {formatDate(
                question.expires_at
              )}
            </span>

          </div>

        </div>

        {/* ====================================================
            QUESTION INITIALE
        ==================================================== */}

        <div
          className="mb-4 rounded-2xl bg-white
                     p-6 shadow-sm
                     ring-1 ring-gray-200"
        >

          <div
            className="mb-3 flex items-center
                       gap-2"
          >

            <User
              className="h-5 w-5
                         text-gray-500"
            />

            <span
              className="font-semibold
                         text-gray-800"
            >
              Question de l'élève
            </span>

          </div>

          <div
            className="whitespace-pre-wrap
                       text-gray-700"
          >
            {question.content}
          </div>

        </div>

        {/* ====================================================
            MESSAGES
        ==================================================== */}

        <div className="space-y-4">

          {question.messages.map((msg) => {

            const isAdmin =
              msg.sender_role === "admin";

            const isTeacher =
              msg.sender_role === "teacher";

            return (
              <div
                key={msg.id}
                className={`rounded-2xl p-5
                            shadow-sm ring-1
                            ${
                              isAdmin
                                ? "ml-4 bg-blue-50 ring-blue-100 md:ml-20"
                                : isTeacher
                                ? "mr-4 bg-purple-50 ring-purple-100 md:mr-20"
                                : "mr-4 bg-white ring-gray-200 md:mr-20"
                            }`}
              >

                {/* ------------------------------------------
                    EN-TÊTE MESSAGE
                ------------------------------------------ */}

                <div
                  className="mb-3 flex items-center
                             justify-between gap-3"
                >

                  <div
                    className="flex items-center
                               gap-2"
                  >

                    {isAdmin ? (
                      <ShieldCheck
                        className="h-5 w-5
                                   text-blue-600"
                      />
                    ) : isTeacher ? (
                      <GraduationCap
                        className="h-5 w-5
                                   text-purple-600"
                      />
                    ) : (
                      <User
                        className="h-5 w-5
                                   text-gray-500"
                      />
                    )}

                    <span className="font-semibold">
                      {isAdmin
                        ? "Administration CODE"
                        : isTeacher
                        ? "Enseignant"
                        : "Élève"}
                    </span>

                  </div>

                  <span
                    className="text-xs
                               text-gray-400"
                  >
                    {formatDate(
                      msg.created_at
                    )}
                  </span>

                </div>

                {/* ------------------------------------------
                    CONTENU MESSAGE
                ------------------------------------------ */}

                <div
                  className="whitespace-pre-wrap
                             text-gray-700"
                >
                  {msg.content}
                </div>

              </div>
            );
          })}

        </div>

        {/* ====================================================
            ERREUR DYNAMIQUE
        ==================================================== */}

        {error && (
          <div
            className="mt-5 flex items-start
                       gap-3 rounded-xl
                       border border-red-200
                       bg-red-50 p-4
                       text-red-800"
          >

            <AlertCircle
              className="h-5 w-5 shrink-0"
            />

            <span>
              {error}
            </span>

          </div>
        )}

        {/* ====================================================
            RÉPONSE ADMINISTRATEUR
        ==================================================== */}

        {question.status !== "expired" && (
          <form
            onSubmit={envoyerMessage}
            className="mt-6 rounded-2xl
                       bg-white p-6
                       shadow-sm
                       ring-1 ring-gray-200"
          >

            <div
              className="mb-4 flex items-center
                         gap-2"
            >

              <ShieldCheck
                className="h-5 w-5
                           text-blue-600"
              />

              <h2
                className="font-bold
                           text-gray-900"
              >
                Intervention de
                l'administration
              </h2>

            </div>

            {/* ----------------------------------------------
                CHAMP MESSAGE
            ---------------------------------------------- */}

            <textarea
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              maxLength={5000}
              rows={5}
              placeholder={
                isTeacherConversation
                  ? "Écrire un message visible dans cette conversation..."
                  : "Écrire votre réponse..."
              }
              className="w-full resize-none
                         rounded-xl border
                         border-gray-200 p-4
                         outline-none
                         transition
                         focus:border-blue-500
                         focus:ring-2
                         focus:ring-blue-100"
            />

            {/* ----------------------------------------------
                BAS DU FORMULAIRE
            ---------------------------------------------- */}

            <div
              className="mt-3 flex flex-col
                         gap-3 sm:flex-row
                         sm:items-center
                         sm:justify-between"
            >

              <span
                className="text-xs
                           text-gray-400"
              >
                {message.length}/5000
              </span>

              <button
                type="submit"
                disabled={
                  !message.trim() ||
                  sending
                }
                className="inline-flex
                           items-center
                           justify-center
                           gap-2 rounded-xl
                           bg-blue-600
                           px-5 py-3
                           font-semibold
                           text-white
                           transition
                           hover:bg-blue-700
                           disabled:cursor-not-allowed
                           disabled:opacity-50
                           focus:outline-none
                           focus:ring-2
                           focus:ring-blue-500"
              >

                {sending ? (
                  <Loader2
                    className="h-5 w-5
                               animate-spin"
                  />
                ) : (
                  <Send className="h-5 w-5" />
                )}

                Envoyer

              </button>

            </div>

          </form>
        )}

        {/* ====================================================
            RETOUR EN BAS DE PAGE
        ==================================================== */}

        <div className="mt-8 flex justify-center pb-8">

          <button
            onClick={retour}
            className="inline-flex items-center
                       gap-2 rounded-xl
                       bg-gray-900 px-5 py-3
                       font-semibold text-white
                       shadow-md transition
                       hover:bg-gray-800
                       hover:scale-[1.02]
                       focus:outline-none
                       focus:ring-2
                       focus:ring-gray-500"
          >

            <ArrowLeft className="h-5 w-5" />

            {isTeacherConversation
              ? "Retour aux conversations enseignants"
              : "Retour aux questions"}

          </button>

        </div>

      </div>

    </div>
  );
}