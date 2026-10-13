
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
  Clock3,
  Users,
  Filter,
  X,
} from "lucide-react";
import api from "../../utils/axios";

// ============================================================
// TYPES
// ============================================================

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

  // ==========================================================
  // CHARGEMENT
  // ==========================================================

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

  // ==========================================================
  // CHARGEMENT INITIAL
  // ==========================================================

  useEffect(() => {
    charger();
  }, [charger]);

  // ==========================================================
  // FILTRAGE
  // ==========================================================

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

  // ==========================================================
  // MATIÈRES
  // ==========================================================

  const subjects = Array.from(
    new Set(
      conversations
        .map((conversation) => conversation.subject)
        .filter(Boolean) as string[]
    )
  ).sort();

  // ==========================================================
  // ACTUALISER
  // ==========================================================

  const actualiser = async () => {
    setRefreshing(true);

    await charger();
  };

  // ==========================================================
  // RÉINITIALISER LES FILTRES
  // ==========================================================

  const reinitialiserFiltres = () => {
    setSearch("");
    setSubjectFilter("all");
    setStatusFilter("all");
  };

  const filtresActifs =
    search.trim() !== "" ||
    subjectFilter !== "all" ||
    statusFilter !== "all";

  // ==========================================================
  // STATISTIQUES
  // ==========================================================

  const totalConversations = conversations.length;

  const conversationsEnAttente = conversations.filter(
    (conversation) => conversation.status === "waiting"
  ).length;

  const conversationsEnCours = conversations.filter(
    (conversation) => conversation.status === "in_progress"
  ).length;

  const conversationsRepondues = conversations.filter(
    (conversation) => conversation.status === "answered"
  ).length;

  // ==========================================================
  // AFFICHAGE
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">

      {/* ====================================================
          ARRIÈRE-PLAN
      ==================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-violet-500/5 blur-3xl dark:bg-violet-500/10" />

        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-500/10" />

      </div>

      {/* ====================================================
          CONTENU
      ==================================================== */}

      <div className="relative mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">

        {/* ==================================================
            EN-TÊTE
        ================================================== */}

        <header className="mb-7">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div className="min-w-0">

              {/* RETOUR */}

              <button
                type="button"
                onClick={() =>
                  navigate("/admin/liste-inscrits")
                }
                className="group mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-500/30 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-violet-500/40 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />

                Retour à la liste des inscrits
              </button>

              {/* TITRE */}

              <div className="flex items-start gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-200 bg-violet-100 shadow-sm dark:border-violet-400/20 dark:bg-violet-500/10">

                  <GraduationCap className="h-7 w-7 text-violet-600 dark:text-violet-400" />

                </div>

                <div className="min-w-0">

                  <div className="mb-1 flex flex-wrap items-center gap-2">

                    <span className="text-xs font-black uppercase tracking-[0.16em] text-violet-600 dark:text-violet-400">
                      Administration CODE
                    </span>

                  </div>

                  <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                    Élèves ↔ Enseignants
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-[15px]">
                    Centralisez et consultez toutes les conversations
                    entre les élèves et les enseignants de CODE.
                  </p>

                </div>

              </div>

            </div>

            {/* ACTUALISER */}

            <button
              type="button"
              onClick={actualiser}
              disabled={refreshing}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-violet-500/40 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
            >
              {refreshing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <RefreshCw className="h-5 w-5" />
              )}

              Actualiser
            </button>

          </div>

        </header>

        {/* ==================================================
            STATISTIQUES RAPIDES
        ================================================== */}

        {!loading && !error && (
          <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* TOTAL */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Total
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                    {totalConversations}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    conversations
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/10">

                  <MessageSquare className="h-5 w-5 text-violet-600 dark:text-violet-400" />

                </div>

              </div>

            </div>

            {/* EN ATTENTE */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    En attente
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                    {conversationsEnAttente}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    nécessitent une attention
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/10">

                  <Clock3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />

                </div>

              </div>

            </div>

            {/* EN COURS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    En cours
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                    {conversationsEnCours}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    conversations actives
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10">

                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />

                </div>

              </div>

            </div>

            {/* RÉPONDUES */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Répondues
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                    {conversationsRepondues}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    conversations traitées
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/10">

                  <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />

                </div>

              </div>

            </div>

          </section>
        )}

        {/* ==================================================
            ERREUR
        ================================================== */}

        {error && (
          <section className="mb-7 overflow-hidden rounded-2xl border border-red-200 bg-white shadow-lg dark:border-red-900/50 dark:bg-slate-900">

            <div className="h-1.5 bg-red-500" />

            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/10">

                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />

                </div>

                <div>

                  <p className="font-black text-slate-900 dark:text-white">
                    Impossible de charger les conversations
                  </p>

                  <p className="mt-1 text-sm leading-6 text-red-600 dark:text-red-300">
                    {error}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={charger}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
              >
                <RefreshCw className="h-4 w-4" />

                Réessayer
              </button>

            </div>

          </section>
        )}

        {/* ==================================================
            FILTRES
        ================================================== */}

        <section className="mb-7 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-lg shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">

          <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/40 sm:px-6">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/10">

                  <Filter className="h-5 w-5 text-violet-600 dark:text-violet-400" />

                </div>

                <div>

                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    Rechercher et filtrer
                  </p>

                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Affinez la liste des conversations
                  </p>

                </div>

              </div>

              {filtresActifs && (
                <button
                  type="button"
                  onClick={reinitialiserFiltres}
                  className="inline-flex w-fit items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />

                  Réinitialiser
                </button>
              )}

            </div>

          </div>

          <div className="p-5 sm:p-6">

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">

              {/* RECHERCHE */}

              <div className="relative">

                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Élève, enseignant, matière, question..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-violet-500 dark:focus:bg-slate-950"
                />

              </div>

              {/* MATIÈRE */}

              <select
                value={subjectFilter}
                onChange={(e) =>
                  setSubjectFilter(e.target.value)
                }
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition-all duration-300 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-violet-500 dark:focus:bg-slate-950"
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

              {/* STATUT */}

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition-all duration-300 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-violet-500 dark:focus:bg-slate-950"
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

        </section>

        {/* ==================================================
            BARRE DE RÉSULTATS
        ================================================== */}

        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-2">

            <MessageSquare className="h-5 w-5 text-violet-600 dark:text-violet-400" />

            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Conversations
            </h2>

            {!loading && (
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                {filtered.length}
              </span>
            )}

          </div>

          {!loading && filtresActifs && (
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
              Résultats filtrés
            </p>
          )}

        </div>

        {/* ==================================================
            CHARGEMENT
        ================================================== */}

        {loading ? (
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-16 shadow-lg shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900">

            <div className="flex flex-col items-center justify-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-500/10">

                <Loader2 className="h-7 w-7 animate-spin text-violet-600 dark:text-violet-400" />

              </div>

              <p className="mt-5 text-sm font-bold text-slate-600 dark:text-slate-300">
                Chargement des conversations...
              </p>

              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Veuillez patienter
              </p>

            </div>

          </div>

        ) : filtered.length === 0 ? (

          /* ==================================================
             AUCUN RÉSULTAT
          ================================================== */

          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-lg shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900">

            <div className="p-10 text-center sm:p-14">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">

                <MessageSquare className="h-7 w-7 text-slate-400 dark:text-slate-500" />

              </div>

              <h3 className="mt-5 text-lg font-black text-slate-900 dark:text-white">
                Aucune conversation trouvée
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Aucune conversation ne correspond aux critères
                de recherche ou de filtrage sélectionnés.
              </p>

              {filtresActifs && (
                <button
                  type="button"
                  onClick={reinitialiserFiltres}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-xl"
                >
                  <X className="h-4 w-4" />

                  Effacer les filtres
                </button>
              )}

            </div>

          </div>

        ) : (

          /* ==================================================
             LISTE
          ================================================== */

          <div className="space-y-4">

            {filtered.map((conversation) => (

              <button
                key={conversation.id}
                type="button"
                onClick={() =>
                  navigate(
                    `/admin/conversations-enseignants/${conversation.id}`
                  )
                }
                className="group w-full overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-xl hover:shadow-slate-900/5 focus:outline-none focus:ring-2 focus:ring-violet-500/30 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-900/60 dark:hover:shadow-black/30"
              >

                <div className="p-5 sm:p-6">

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center">

                    {/* ==================================================
                        IDENTITÉ / CONVERSATION
                    ================================================== */}

                    <div className="flex min-w-0 flex-1 gap-4">

                      {/* ICÔNE */}

                      <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 sm:flex">

                        <User className="h-5 w-5 text-slate-500 dark:text-slate-400" />

                      </div>

                      <div className="min-w-0 flex-1">

                        {/* BADGES */}

                        <div className="mb-3 flex flex-wrap items-center gap-2">

                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-black ${
                              statutClass[
                                conversation.status
                              ]
                            }`}
                          >
                            {statutLabel[
                              conversation.status
                            ]}
                          </span>

                          {conversation.subject && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[11px] font-black text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300">

                              <BookOpen className="h-3.5 w-3.5" />

                              {conversation.subject}

                            </span>
                          )}

                          {conversation.learner_class && (
                            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {conversation.learner_class}
                            </span>
                          )}

                        </div>

                        {/* TITRE */}

                        <h3 className="truncate text-base font-black text-slate-900 transition-colors group-hover:text-violet-700 dark:text-white dark:group-hover:text-violet-300 sm:text-lg">
                          {conversation.title}
                        </h3>

                        {/* ÉLÈVE */}

                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">

                          <span className="font-semibold text-slate-500 dark:text-slate-400">
                            Élève :
                          </span>

                          <span className="font-black text-slate-800 dark:text-slate-200">
                            {conversation.user_prenom}{" "}
                            {conversation.user_nom}
                          </span>

                        </div>

                        <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">
                          {conversation.user_email}
                        </p>

                        {/* ENSEIGNANTS */}

                        <div className="mt-4">

                          {conversation.teacher_names.length >
                          0 ? (
                            <div className="flex flex-wrap gap-2">

                              {conversation.teacher_names.map(
                                (teacher) => (
                                  <span
                                    key={teacher}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                                  >

                                    <GraduationCap className="h-3.5 w-3.5" />

                                    {teacher}

                                  </span>
                                )
                              )}

                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs italic text-slate-400 dark:text-slate-500">

                              <GraduationCap className="h-3.5 w-3.5" />

                              Aucun enseignant n'a encore répondu

                            </span>
                          )}

                        </div>

                      </div>

                    </div>

                    {/* ==================================================
                        INFORMATIONS À DROITE
                    ================================================== */}

                    <div className="flex shrink-0 items-center justify-between gap-5 border-t border-slate-100 pt-4 lg:w-56 lg:flex-col lg:items-end lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0 dark:border-slate-800">

                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">

                        <MessageSquare className="h-4 w-4" />

                        <span>
                          {conversation.message_count}{" "}
                          message
                          {conversation.message_count > 1
                            ? "s"
                            : ""}
                        </span>

                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">

                        <Clock3 className="h-4 w-4" />

                        <span>
                          {formatDate(
                            conversation.updated_at
                          )}
                        </span>

                      </div>

                      <div className="hidden items-center gap-2 text-xs font-black text-violet-600 transition-all duration-300 group-hover:flex dark:text-violet-400 lg:flex">

                        Ouvrir

                        <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />

                      </div>

                    </div>

                  </div>

                </div>

              </button>

            ))}

          </div>

        )}

        {/* ==================================================
            PIED DE LISTE
        ================================================== */}

        {!loading && filtered.length > 0 && (
          <div className="flex justify-center pb-8 pt-7">

            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">

              Affichage de{" "}
              <span className="font-black text-slate-600 dark:text-slate-300">
                {filtered.length}
              </span>{" "}
              conversation
              {filtered.length > 1 ? "s" : ""}

            </p>

          </div>
        )}

      </div>

    </div>
  );
}

