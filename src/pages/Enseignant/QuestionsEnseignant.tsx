import React, { useCallback, useEffect, useState } from "react";
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

  // ----------------------------------------------------------
  // ÉTATS
  // ----------------------------------------------------------

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

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

        const response =
          await api.get<Question[]>(
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
          setError(
            "Impossible de contacter le serveur."
          );
        } else {
          setError(
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
    charger();
  }, [charger]);

  // ==========================================================
  // STATUT
  // ==========================================================

  const renderStatus = (value: string) => {
    switch (value) {
      case "waiting":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            <Clock size={13} />
            En attente
          </span>
        );

      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            <MessageCircle size={13} />
            En cours
          </span>
        );

      case "answered":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            <CheckCircle2 size={13} />
            Répondue
          </span>
        );

      case "expired":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            <CircleDot size={13} />
            Expirée
          </span>
        );

      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
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

      if (
        Number.isNaN(
          parsedDate.getTime()
        )
      ) {
        return date;
      }

      return new Intl.DateTimeFormat(
        "fr-FR",
        {
          dateStyle: "short",
          timeStyle: "short",
        }
      ).format(parsedDate);
    } catch {
      return date;
    }
  };

  // ==========================================================
  // NOMBRE DE MESSAGES
  // ==========================================================

  const nombreMessages = (
    question: Question
  ) => {
    return question.messages?.length || 0;
  };

  // ==========================================================
  // CHARGEMENT
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">

        <div className="mx-auto flex min-h-[400px] max-w-6xl items-center justify-center">

          <div className="flex flex-col items-center gap-3">

            <Loader2
              size={35}
              className="animate-spin text-blue-600"
            />

            <p className="text-sm text-slate-500">
              Chargement des questions...
            </p>

          </div>

        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDU PRINCIPAL
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">

      <div className="mx-auto max-w-6xl">

        {/* ==================================================
            RETOUR
            ================================================== */}

        <button
          type="button"
          onClick={retourPagePrecedente}
          className="mb-5 inline-flex items-center gap-2
                     rounded-xl bg-white px-4 py-2.5
                     text-sm font-semibold text-slate-600
                     shadow-sm ring-1 ring-slate-200
                     transition hover:bg-slate-100
                     hover:text-slate-900
                     focus:outline-none
                     focus:ring-2 focus:ring-blue-500"
        >
          <ArrowLeft size={17} />
          Retour à la page précédente
        </button>

        {/* ==================================================
            EN-TÊTE
            ================================================== */}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <MessageCircle size={23} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
                  Questions reçues
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Questions des apprenants concernant
                  vos matières.
                </p>
              </div>

            </div>

            {/* COMPTEUR */}

            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">

              <BookOpen size={16} />

              <span>
                {questions.length}{" "}
                {questions.length > 1
                  ? "questions"
                  : "question"}
              </span>

            </div>

          </div>

          {/* ==================================================
              BOUTONS D'ACTION
              ================================================== */}

          <div className="flex flex-wrap items-center gap-2">

            {/* ESPACE ENSEIGNANT */}

            <button
              type="button"
              onClick={allerEspaceEnseignant}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              title="Retourner à l'espace enseignant"
            >
              <Home size={18} />
              <span>
                Espace enseignant
              </span>
            </button>

            {/* ACTUALISER */}

            <button
              type="button"
              onClick={() => charger(true)}
              disabled={refreshing}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 md:px-4"
              title="Actualiser les questions"
            >

              {refreshing ? (
                <Loader2
                  size={19}
                  className="animate-spin"
                />
              ) : (
                <RefreshCw size={19} />
              )}

              <span className="text-sm font-medium">
                Actualiser
              </span>

            </button>

          </div>

        </div>

        {/* ==================================================
            ERREUR
            ================================================== */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">

            <div className="flex items-start gap-3 text-red-700">

              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0"
              />

              <div className="flex-1">

                <p className="text-sm font-medium">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => charger()}
                  className="mt-2 text-xs font-semibold underline hover:no-underline"
                >
                  Réessayer
                </button>

              </div>

            </div>

          </div>
        )}

        {/* ==================================================
            AUCUNE QUESTION
            ================================================== */}

        {questions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">

              <MessageCircle
                size={34}
                className="text-slate-300"
              />

            </div>

            <h2 className="font-semibold text-slate-700">
              Aucune question reçue
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Les questions adressées à vos matières
              apparaîtront automatiquement ici.
            </p>

            <button
              type="button"
              onClick={() => charger()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <RefreshCw size={17} />
              Actualiser
            </button>

          </div>
        ) : (

          /* =================================================
             LISTE DES QUESTIONS
             ================================================= */

          <div className="space-y-4">

            {questions.map(
              (question) => (

                <button
                  key={question.id}
                  type="button"
                  onClick={() =>
                    navigate(
                      `/enseignant/questions/${question.id}`
                    )
                  }
                  className="group w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                >

                  <div className="flex items-start gap-4">

                    {/* ICÔNE */}

                    <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:flex">

                      <MessageCircle
                        size={23}
                      />

                    </div>

                    {/* CONTENU */}

                    <div className="min-w-0 flex-1">

                      {/* BADGES */}

                      <div className="mb-2 flex flex-wrap items-center gap-2">

                        {/* MATIÈRE */}

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">

                          <BookOpen
                            size={12}
                          />

                          {question.subject ||
                            "Matière"}

                        </span>

                        {/* CLASSE */}

                        {question.learner_class && (
                          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                            {question.learner_class}
                          </span>
                        )}

                        {/* STATUT */}

                        {renderStatus(
                          question.status
                        )}

                      </div>

                      {/* TITRE */}

                      <h2 className="truncate font-bold text-slate-800 transition group-hover:text-blue-600">

                        {question.title}

                      </h2>

                      {/* CONTENU */}

                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">

                        {question.content}

                      </p>

                      {/* INFORMATIONS */}

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">

                        <span>
                          {formatDate(
                            question.created_at
                          )}
                        </span>

                        <span>
                          {nombreMessages(
                            question
                          )}{" "}
                          {nombreMessages(
                            question
                          ) > 1
                            ? "messages"
                            : "message"}
                        </span>

                      </div>

                    </div>

                    {/* FLÈCHE */}

                    <ChevronRight
                      size={23}
                      className="mt-2 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
                    />

                  </div>

                </button>
              )
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default QuestionsEnseignant;