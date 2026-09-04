import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  Search,
  GraduationCap,
  MessageSquare,
  ChevronRight,
  Loader2,
  AlertCircle,
  User,
  BookOpen,
} from "lucide-react";
import api from "../../utils/axios";

interface Conversation {
  id: number;

  user_id: number;
  user_nom: string;
  user_prenom: string;
  user_email: string;

  subject?: string | null;
  learner_class?: string | null;

  title: string;
  status: "waiting" | "in_progress" | "answered" | "expired";

  created_at: string;
  updated_at: string;

  teacher_names: string[];

  message_count: number;
}

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

export default function ConversationsEnseignantsAdmin() {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filtered, setFiltered] = useState<Conversation[]>([]);

  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const charger = useCallback(async () => {
    try {
      setError("");

      const response = await api.get<Conversation[]>(
        "/api/admin/teacher-conversations"
      );

      setConversations(response.data);
    } catch (err: any) {
      console.error(
        "[ConversationsEnseignantsAdmin]",
        err?.response?.data || err
      );

      const status = err?.response?.status;

      if (status === 401) {
        setError("Votre session n'est plus valide.");
      } else if (status === 403) {
        setError("Accès réservé à l'administration.");
      } else {
        setError(
          err?.response?.data?.detail ||
            "Impossible de charger les conversations."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  useEffect(() => {
    const terme = search.trim().toLowerCase();

    const resultat = conversations.filter((conversation) => {
      const correspondRecherche =
        !terme ||
        conversation.title.toLowerCase().includes(terme) ||
        conversation.user_nom.toLowerCase().includes(terme) ||
        conversation.user_prenom.toLowerCase().includes(terme) ||
        conversation.user_email.toLowerCase().includes(terme) ||
        (conversation.subject || "")
          .toLowerCase()
          .includes(terme) ||
        conversation.teacher_names
          .join(" ")
          .toLowerCase()
          .includes(terme);

      const correspondMatiere =
        subjectFilter === "all" ||
        conversation.subject === subjectFilter;

      const correspondStatut =
        statusFilter === "all" ||
        conversation.status === statusFilter;

      return (
        correspondRecherche &&
        correspondMatiere &&
        correspondStatut
      );
    });

    setFiltered(resultat);
  }, [
    conversations,
    search,
    subjectFilter,
    statusFilter,
  ]);

  const subjects = Array.from(
    new Set(
      conversations
        .map((conversation) => conversation.subject)
        .filter(Boolean) as string[]
    )
  ).sort();

  const actualiser = async () => {
    setRefreshing(true);
    await charger();
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ================================================= */}
        {/* EN-TÊTE */}
        {/* ================================================= */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <button
  onClick={() => navigate("/admin/liste-inscrits")}
  className="mb-4 inline-flex items-center gap-2 text-sm
             font-medium text-gray-600 hover:text-gray-900"
>
  <ArrowLeft className="h-4 w-4" />
  Retour à la liste des inscrits
</button>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-purple-100 p-3">
                <GraduationCap className="h-7 w-7 text-purple-600" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Élèves ↔ Enseignants
                </h1>

                <p className="text-gray-600">
                  Toutes les conversations entre les élèves
                  et les enseignants de CODE.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={actualiser}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl
                       bg-white px-4 py-3 font-medium text-gray-700 shadow
                       ring-1 ring-gray-200 hover:bg-gray-50
                       disabled:opacity-60"
          >
            {refreshing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <RefreshCw className="h-5 w-5" />
            )}

            Actualiser
          </button>
        </div>

        {/* ================================================= */}
        {/* ERREUR */}
        {/* ================================================= */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl
                          border border-red-200 bg-red-50 p-4
                          text-red-800">
            <AlertCircle className="mt-0.5 h-5 w-5" />

            <div>
              <p className="font-medium">{error}</p>

              <button
                onClick={charger}
                className="mt-2 font-semibold underline"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* FILTRES */}
        {/* ================================================= */}

        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">

          <div className="grid gap-4 md:grid-cols-3">

            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 h-5 w-5
                           -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Élève, enseignant, matière, question..."
                className="w-full rounded-xl border border-gray-200
                           py-3 pl-10 pr-4 outline-none
                           focus:border-purple-500 focus:ring-2
                           focus:ring-purple-100"
              />
            </div>

            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-3
                         outline-none focus:border-purple-500"
            >
              <option value="all">
                Toutes les matières
              </option>

              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-3
                         outline-none focus:border-purple-500"
            >
              <option value="all">
                Tous les statuts
              </option>

              <option value="waiting">
                En attente
              </option>

              <option value="in_progress">
                En cours
              </option>

              <option value="answered">
                Répondue
              </option>

              <option value="expired">
                Expirée
              </option>
            </select>

          </div>
        </div>

        {/* ================================================= */}
        {/* COMPTEUR */}
        {/* ================================================= */}

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <MessageSquare className="h-5 w-5" />

            <span>
              {loading
                ? "Chargement..."
                : `${filtered.length} conversation${
                    filtered.length > 1 ? "s" : ""
                  }`}
            </span>
          </div>
        </div>

        {/* ================================================= */}
        {/* LISTE */}
        {/* ================================================= */}

        {loading ? (
          <div className="flex justify-center rounded-2xl bg-white p-16">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-white p-16 text-center shadow-sm">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />

            <p className="mt-4 font-medium text-gray-700">
              Aucune conversation trouvée.
            </p>
          </div>
        ) : (
          <div className="space-y-4">

            {filtered.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() =>
                  navigate(
                    `/admin/conversations-enseignants/${conversation.id}`
                  )
                }
                className="group w-full rounded-2xl bg-white p-5 text-left
                           shadow-sm ring-1 ring-gray-200 transition
                           hover:-translate-y-0.5 hover:shadow-md"
              >

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

                  {/* INFORMATIONS ÉLÈVE */}
                  <div className="flex min-w-0 flex-1 gap-4">

                    <div className="hidden rounded-xl bg-gray-100 p-3 sm:block">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="mb-2 flex flex-wrap items-center gap-2">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            statutClass[conversation.status]
                          }`}
                        >
                          {statutLabel[conversation.status]}
                        </span>

                        {conversation.subject && (
                          <span className="inline-flex items-center gap-1
                                           rounded-full bg-purple-100
                                           px-3 py-1 text-xs font-semibold
                                           text-purple-800">
                            <BookOpen className="h-3.5 w-3.5" />
                            {conversation.subject}
                          </span>
                        )}

                        {conversation.learner_class && (
                          <span className="rounded-full bg-gray-100
                                           px-3 py-1 text-xs text-gray-700">
                            {conversation.learner_class}
                          </span>
                        )}

                      </div>

                      <h2 className="truncate font-bold text-gray-900">
                        {conversation.title}
                      </h2>

                      <p className="mt-1 text-sm text-gray-700">
                        Élève :{" "}
                        <span className="font-semibold">
                          {conversation.user_prenom}{" "}
                          {conversation.user_nom}
                        </span>
                      </p>

                      <p className="text-xs text-gray-500">
                        {conversation.user_email}
                      </p>

                      {/* ENSEIGNANTS */}
                      <div className="mt-3">
                        {conversation.teacher_names.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {conversation.teacher_names.map(
                              (teacher) => (
                                <span
                                  key={teacher}
                                  className="inline-flex items-center gap-1
                                             rounded-lg bg-green-50 px-2.5
                                             py-1 text-xs font-medium
                                             text-green-700"
                                >
                                  <GraduationCap className="h-3.5 w-3.5" />
                                  {teacher}
                                </span>
                              )
                            )}
                          </div>
                        ) : (
                          <span className="text-xs italic text-gray-400">
                            Aucun enseignant n'a encore répondu
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-xs text-gray-400">
                        {conversation.message_count} message
                        {conversation.message_count > 1
                          ? "s"
                          : ""}{" "}
                        · Mise à jour le{" "}
                        {formatDate(conversation.updated_at)}
                      </p>

                    </div>
                  </div>

                  <ChevronRight
                    className="h-6 w-6 shrink-0 text-gray-300
                               transition group-hover:translate-x-1
                               group-hover:text-purple-600"
                  />

                </div>
              </button>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}