import React, { useCallback, useEffect, useState } from "react";
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
            "bg-amber-100 text-amber-700 border-amber-200",
        };

      case "in_progress":
        return {
          label: "En cours",
          icon: MessageCircle,
          className:
            "bg-blue-100 text-blue-700 border-blue-200",
        };

      case "answered":
        return {
          label: "Répondue",
          icon: CheckCircle2,
          className:
            "bg-green-100 text-green-700 border-green-200",
        };

      case "expired":
        return {
          label: "Expirée",
          icon: AlertCircle,
          className:
            "bg-gray-100 text-gray-600 border-gray-200",
        };

      default:
        return {
          label: status,
          icon: Clock,
          className:
            "bg-gray-100 text-gray-600 border-gray-200",
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
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">

        {/* ==================================================
            BOUTON RETOUR
            ================================================== */}

        <button
          type="button"
          onClick={retourPagePrecedente}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft size={18} />

          Retour à la page précédente
        </button>

        {/* ==================================================
            EN-TÊTE
            ================================================== */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
                <MessageCircle size={25} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
                  Mes questions
                </h1>

                <p className="text-sm text-slate-500">
                  Consultez vos échanges avec CODE.
                </p>
              </div>

            </div>
          </div>

          {/* ------------------------------------------------
              BOUTONS
              ------------------------------------------------ */}

          <div className="flex flex-col gap-2 sm:flex-row">

            <button
              type="button"
              onClick={() => chargerQuestions(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
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
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700"
            >
              <Plus size={19} />

              Nouvelle question
            </button>

          </div>
        </div>

        {/* ==================================================
            ERREUR
            ================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">

            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">

              <p className="font-semibold">
                Une erreur est survenue
              </p>

              <p className="mt-1 text-sm leading-6">
                {error}
              </p>

              <button
                type="button"
                onClick={() => chargerQuestions()}
                className="mt-3 text-sm font-semibold underline"
              >
                Réessayer
              </button>

            </div>
          </div>
        )}

        {/* ==================================================
            CHARGEMENT
            ================================================== */}

        {loading && (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col items-center gap-3 text-slate-500">

              <Loader2
                size={32}
                className="animate-spin text-blue-600"
              />

              <p className="text-sm">
                Chargement de vos questions...
              </p>

            </div>
          </div>
        )}

        {/* ==================================================
            AUCUNE QUESTION
            ================================================== */}

        {!loading &&
          !error &&
          questions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <MessageCircle size={30} />
              </div>

              <h2 className="text-xl font-bold text-slate-800">
                Aucune question pour le moment
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Vous pouvez poser une question à
                l'administrateur de CODE ou directement à
                un enseignant d'une matière.
              </p>

              <button
                type="button"
                onClick={nouvelleQuestion}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus size={18} />

                Poser ma première question
              </button>

            </div>
          )}

        {/* ==================================================
            LISTE DES QUESTIONS
            ================================================== */}

        {!loading &&
          !error &&
          questions.length > 0 && (

            <div className="space-y-4">

              {questions.map((question) => {

                const status =
                  getStatusInfo(question.status);

                const StatusIcon = status.icon;

                const recipient =
                  getRecipientInfo(question);

                const RecipientIcon = recipient.icon;

                const messageCount =
                  question.messages?.length ?? 0;

                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() =>
                      ouvrirQuestion(question.id)
                    }
                    className="group w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md md:p-6"
                  >

                    <div className="flex gap-4">

                      {/* ------------------------------------
                          ICÔNE
                          ------------------------------------ */}

                      <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:flex">
                        <MessageCircle size={23} />
                      </div>

                      {/* ------------------------------------
                          CONTENU PRINCIPAL
                          ------------------------------------ */}

                      <div className="min-w-0 flex-1">

                        {/* DESTINATAIRE + STATUT */}

                        <div className="mb-3 flex flex-wrap items-center gap-2">

                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">

                            <RecipientIcon size={14} />

                            {recipient.label}

                          </span>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
                          >
                            <StatusIcon size={14} />

                            {status.label}
                          </span>

                          {question.is_learner &&
                            question.learner_class && (
                              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                                {question.learner_class}
                              </span>
                            )}

                        </div>

                        {/* TITRE */}

                        <h2 className="truncate text-lg font-bold text-slate-800 transition group-hover:text-blue-600">
                          {question.title}
                        </h2>

                        {/* CONTENU */}

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                          {question.content}
                        </p>

                        {/* INFORMATIONS */}

                        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">

                          <span>
                            Créée le{" "}
                            {formatDate(
                              question.created_at
                            )}
                          </span>

                          {messageCount > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <MessageCircle size={13} />

                              {messageCount}{" "}
                              message
                              {messageCount > 1
                                ? "s"
                                : ""}
                            </span>
                          )}

                          {question.expires_at && (
                            <span className="hidden sm:inline">
                              Expire le{" "}
                              {formatDate(
                                question.expires_at
                              )}
                            </span>
                          )}

                        </div>

                      </div>

                      {/* ------------------------------------
                          FLÈCHE
                          ------------------------------------ */}

                      <div className="hidden shrink-0 items-center text-slate-300 transition group-hover:text-blue-600 sm:flex">
                        <ChevronRight size={24} />
                      </div>

                    </div>
                  </button>
                );
              })}

            </div>
          )}

      </div>
    </div>
  );
};

export default MesQuestions;