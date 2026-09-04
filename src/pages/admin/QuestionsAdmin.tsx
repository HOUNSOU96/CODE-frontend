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

        setQuestions(response.data);
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
  // AFFICHAGE
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-8">

      <div className="mx-auto max-w-7xl">

        {/* ====================================================
            NAVIGATION
        ==================================================== */}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

          {/* ----------------------------------------------
              BOUTON RETOUR
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

            Retour

          </button>

          {/* ----------------------------------------------
              ACTUALISER
          ---------------------------------------------- */}

          <button
            onClick={actualiser}
            disabled={refreshing}
            className="inline-flex items-center
                       justify-center gap-2
                       rounded-xl bg-white
                       px-4 py-3
                       font-medium text-gray-700
                       shadow
                       ring-1 ring-gray-200
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
              <RefreshCw
                className="h-5 w-5"
              />
            )}

            Actualiser

          </button>

        </div>

        {/* ====================================================
            EN-TÊTE
        ==================================================== */}

        <div
          className="mb-6 flex flex-col
                     gap-4 md:flex-row
                     md:items-center
                     md:justify-between"
        >

          <div>

            <div
              className="mb-2 flex items-center
                         gap-2"
            >

              <ShieldCheck
                className="h-7 w-7
                           text-blue-600"
              />

              <h1
                className="text-2xl font-bold
                           text-gray-900"
              >
                Centre de conversations
              </h1>

            </div>

            <p className="text-gray-600">
              Supervision des échanges entre
              les utilisateurs, l'administration
              et les enseignants.
            </p>

          </div>

        </div>

        {/* ====================================================
            ACCÈS RAPIDES
        ==================================================== */}

        <div
          className="mb-8 grid gap-5
                     md:grid-cols-2"
        >

          {/* ==================================================
              QUESTIONS ADMIN
          ================================================== */}

          <button
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
            className="group rounded-2xl
                       bg-white p-6 text-left
                       shadow-sm ring-1
                       ring-gray-200
                       transition
                       hover:-translate-y-1
                       hover:shadow-lg"
          >

            <div
              className="mb-4 flex items-center
                         justify-between"
            >

              <div
                className="rounded-xl
                           bg-blue-100 p-3"
              >

                <MessageSquare
                  className="h-7 w-7
                             text-blue-600"
                />

              </div>

              <ChevronRight
                className="h-6 w-6
                           text-gray-400
                           transition
                           group-hover:translate-x-1"
              />

            </div>

            <h2
              className="text-lg font-bold
                         text-gray-900"
            >
              Questions adressées à CODE
            </h2>

            <p
              className="mt-2 text-sm
                         text-gray-600"
            >
              Consultez et traitez les questions
              envoyées directement à
              l'administration.
            </p>

          </button>

          {/* ==================================================
              CONVERSATIONS ENSEIGNANTS
          ================================================== */}

          <button
            onClick={() =>
              navigate(
                "/admin/conversations-enseignants"
              )
            }
            className="group rounded-2xl
                       bg-white p-6 text-left
                       shadow-sm ring-1
                       ring-gray-200
                       transition
                       hover:-translate-y-1
                       hover:shadow-lg"
          >

            <div
              className="mb-4 flex items-center
                         justify-between"
            >

              <div
                className="rounded-xl
                           bg-purple-100 p-3"
              >

                <GraduationCap
                  className="h-7 w-7
                             text-purple-600"
                />

              </div>

              <ChevronRight
                className="h-6 w-6
                           text-gray-400
                           transition
                           group-hover:translate-x-1"
              />

            </div>

            <h2
              className="text-lg font-bold
                         text-gray-900"
            >
              Élèves ↔ Enseignants
            </h2>

            <p
              className="mt-2 text-sm
                         text-gray-600"
            >
              Voir toutes les conversations entre
              les élèves et l'ensemble des
              enseignants de CODE.
            </p>

          </button>

        </div>

        {/* ====================================================
            ERREUR
        ==================================================== */}

        {error && (
          <div
            className="mb-6 flex items-start
                       gap-3 rounded-xl
                       border border-red-200
                       bg-red-50 p-4
                       text-red-800"
          >

            <AlertCircle
              className="mt-0.5 h-5 w-5
                         shrink-0"
            />

            <div className="flex-1">

              <p className="font-medium">
                {error}
              </p>

              <button
                onClick={chargerQuestions}
                className="mt-2 font-semibold
                           underline"
              >
                Réessayer
              </button>

            </div>

          </div>
        )}

        {/* ====================================================
            LISTE
        ==================================================== */}

        <div
          id="questions-admin"
          className="rounded-2xl
                     bg-white shadow-sm
                     ring-1 ring-gray-200"
        >

          {/* ----------------------------------------------
              EN-TÊTE DE LA LISTE
          ---------------------------------------------- */}

          <div
            className="border-b
                       border-gray-200 p-5"
          >

            <div
              className="flex items-center
                         gap-3"
            >

              <Users
                className="h-6 w-6
                           text-gray-600"
              />

              <div>

                <h2
                  className="text-lg font-bold
                             text-gray-900"
                >
                  Toutes les questions
                </h2>

                {!loading && (
                  <p
                    className="text-sm
                               text-gray-500"
                  >
                    {questions.length} conversation
                    {questions.length > 1
                      ? "s"
                      : ""}
                  </p>
                )}

              </div>

            </div>

          </div>

          {/* ----------------------------------------------
              CHARGEMENT
          ---------------------------------------------- */}

          {loading ? (
            <div
              className="flex items-center
                         justify-center p-12"
            >

              <Loader2
                className="h-8 w-8
                           animate-spin
                           text-blue-600"
              />

            </div>

          ) : questions.length === 0 ? (

            /* --------------------------------------------
               AUCUNE QUESTION
            -------------------------------------------- */

            <div className="p-12 text-center">

              <MessageSquare
                className="mx-auto h-12 w-12
                           text-gray-300"
              />

              <p
                className="mt-4 font-medium
                           text-gray-700"
              >
                Aucune question pour le moment.
              </p>

            </div>

          ) : (

            /* --------------------------------------------
               QUESTIONS
            -------------------------------------------- */

            <div
              className="divide-y
                         divide-gray-100"
            >

              {questions.map((question) => (

                <button
                  key={question.id}
                  onClick={() =>
                    navigate(
                      `/admin/questions/${question.id}`
                    )
                  }
                  className="group w-full
                             p-5 text-left
                             transition
                             hover:bg-gray-50"
                >

                  <div
                    className="flex flex-col
                               gap-4 md:flex-row
                               md:items-center
                               md:justify-between"
                  >

                    <div
                      className="min-w-0
                                 flex-1"
                    >

                      {/* --------------------------------
                          BADGES
                      -------------------------------- */}

                      <div
                        className="mb-2 flex
                                   flex-wrap
                                   items-center
                                   gap-2"
                      >

                        {/* STATUT */}

                        <span
                          className={`rounded-full
                                      px-3 py-1
                                      text-xs
                                      font-semibold
                                      ${
                                        statutClass[
                                          question.status
                                        ] ||
                                        "bg-gray-100 text-gray-700"
                                      }`}
                        >
                          {statutLabel[
                            question.status
                          ] ||
                            question.status}
                        </span>

                        {/* DESTINATAIRE */}

                        {question.recipient_type ===
                        "subject" ? (
                          <span
                            className="rounded-full
                                       bg-purple-100
                                       px-3 py-1
                                       text-xs
                                       font-semibold
                                       text-purple-800"
                          >
                            Enseignant —{" "}
                            {question.subject}
                          </span>
                        ) : (
                          <span
                            className="rounded-full
                                       bg-blue-100
                                       px-3 py-1
                                       text-xs
                                       font-semibold
                                       text-blue-800"
                          >
                            Administration CODE
                          </span>
                        )}

                        {/* CLASSE */}

                        {question.learner_class && (
                          <span
                            className="rounded-full
                                       bg-gray-100
                                       px-3 py-1
                                       text-xs
                                       text-gray-700"
                          >
                            {question.learner_class}
                          </span>
                        )}

                      </div>

                      {/* --------------------------------
                          TITRE
                      -------------------------------- */}

                      <h3
                        className="truncate
                                   font-bold
                                   text-gray-900"
                      >
                        {question.title}
                      </h3>

                      {/* --------------------------------
                          UTILISATEUR
                      -------------------------------- */}

                      <p
                        className="mt-1
                                   text-sm
                                   text-gray-600"
                      >
                        {question.user_prenom}{" "}
                        {question.user_nom}
                      </p>

                      <p
                        className="text-xs
                                   text-gray-500"
                      >
                        {question.user_email}
                      </p>

                      {/* --------------------------------
                          DATE
                      -------------------------------- */}

                      <p
                        className="mt-2
                                   text-xs
                                   text-gray-400"
                      >
                        Créée le{" "}
                        {formatDate(
                          question.created_at
                        )}
                      </p>

                    </div>

                    {/* --------------------------------
                        FLÈCHE
                    -------------------------------- */}

                    <ChevronRight
                      className="h-6 w-6
                                 shrink-0
                                 text-gray-300
                                 transition
                                 group-hover:translate-x-1
                                 group-hover:text-blue-600"
                    />

                  </div>

                </button>

              ))}

            </div>
          )}

        </div>

        {/* ====================================================
            RETOUR EN BAS
        ==================================================== */}

        <div
          className="mt-8 flex justify-center
                     pb-8"
        >

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

            Retour

          </button>

        </div>

      </div>
    </div>
  );
}