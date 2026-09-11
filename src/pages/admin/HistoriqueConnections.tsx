
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "@/utils/axios";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  History,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  Wifi,
  WifiOff,
  XCircle,
  Sparkles,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================

interface ConnectionRecord {
  id: number;
  nom: string;
  prenom: string;
  date: string;
  heure_connexion: string;
  heure_deconnexion: string | null;
  last_seen?: string;
}

type FilterType = "all" | "online" | "offline";

// ============================================================
// COMPOSANT
// ============================================================

const HistoriqueConnections: React.FC = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState<
    ConnectionRecord[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const [filter, setFilter] =
    useState<FilterType>("all");

  const [search, setSearch] =
    useState("");

  const [dateFilter, setDateFilter] =
    useState("");

  const [currentOnline, setCurrentOnline] =
    useState(0);

  // ==========================================================
  // VÉRIFIER SI UN UTILISATEUR EST EN LIGNE
  // ==========================================================

  const isUserOnline = (
    record: ConnectionRecord
  ) => {
    if (!record.last_seen) {
      return false;
    }

    const lastSeen = new Date(
      record.last_seen + "Z"
    );

    return (
      Date.now() - lastSeen.getTime() <=
      2 * 60 * 1000
    );
  };

  // ==========================================================
  // TEMPS ÉCOULÉ DEPUIS LA CONNEXION
  // ==========================================================

  const getElapsedTime = (
    record: ConnectionRecord
  ) => {
    const lastConnection = new Date(
      `${record.date}T${record.heure_connexion}`
    );

    const diffMs =
      Date.now() -
      lastConnection.getTime();

    const diffSec = Math.floor(
      diffMs / 1000
    );

    if (diffSec < 60) {
      return `${diffSec} sec`;
    }

    const diffMin = Math.floor(
      diffSec / 60
    );

    if (diffMin < 60) {
      return `${diffMin} min`;
    }

    const diffH = Math.floor(
      diffMin / 60
    );

    return `${diffH} h`;
  };

  // ==========================================================
  // RÉCUPÉRATION DES LOGS
  // ==========================================================

  const fetchRecords = async () => {
    try {
      const res =
        await api.get<ConnectionRecord[]>(
          "/api/admin_dashboard/historique-connections",
          {
            params: {
              t: Date.now(),
            },
          }
        );

      const data = Array.isArray(res.data)
        ? res.data
        : [];

      setRecords(data);

      const onlineUsers = new Set(
        data
          .filter(isUserOnline)
          .map((record) => record.id)
      );

      setCurrentOnline(
        onlineUsers.size
      );
    } catch (err) {
      console.error(
        "Erreur récupération historique :",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // CHARGEMENT INITIAL + ACTUALISATION AUTOMATIQUE
  // ==========================================================

  useEffect(() => {
    setLoading(true);

    fetchRecords();

    const interval = setInterval(
      fetchRecords,
      3000
    );

    return () =>
      clearInterval(interval);
  }, []);

  // ==========================================================
  // STATISTIQUES
  // ==========================================================

  const total = records.length;

  const totalOnline = useMemo(() => {
    return records.filter(
      isUserOnline
    ).length;
  }, [records]);

  const totalOffline =
    total - totalOnline;

  // ==========================================================
  // FILTRAGE
  // ==========================================================

  const filteredRecords = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return records.filter((record) => {
      const online =
        isUserOnline(record);

      if (
        filter === "online" &&
        !online
      ) {
        return false;
      }

      if (
        filter === "offline" &&
        online
      ) {
        return false;
      }

      if (
        dateFilter &&
        record.date !== dateFilter
      ) {
        return false;
      }

      const fullName =
        `${record.nom} ${record.prenom}`
          .toLowerCase();

      if (
        normalizedSearch &&
        !fullName.includes(
          normalizedSearch
        )
      ) {
        return false;
      }

      return true;
    });
  }, [
    records,
    filter,
    search,
    dateFilter,
  ]);

  // ==========================================================
  // GROUPEMENT PAR DATE
  // ==========================================================

  const recordsByDate = useMemo(() => {
    const grouped: Record<
      string,
      ConnectionRecord[]
    > = {};

    filteredRecords.forEach(
      (record) => {
        if (!grouped[record.date]) {
          grouped[record.date] = [];
        }

        grouped[record.date].push(
          record
        );
      }
    );

    return Object.entries(grouped)
      .sort(([a], [b]) =>
        a < b ? 1 : -1
      )
      .map(
        ([date, recs]) => {
          const sorted = [
            ...recs,
          ].sort((a, b) => {
            const aOnline =
              isUserOnline(a);

            const bOnline =
              isUserOnline(b);

            if (
              aOnline &&
              !bOnline
            ) {
              return -1;
            }

            if (
              !aOnline &&
              bOnline
            ) {
              return 1;
            }

            return (
              new Date(
                `1970-01-01T${b.heure_connexion}`
              ).getTime() -
              new Date(
                `1970-01-01T${a.heure_connexion}`
              ).getTime()
            );
          });

          return [
            date,
            sorted,
          ] as [
            string,
            ConnectionRecord[]
          ];
        }
      );
  }, [filteredRecords]);

  // ==========================================================
  // FORMAT DATE D'AFFICHAGE
  // ==========================================================

  const formatDisplayDate = (
    date: string
  ) => {
    try {
      return new Date(
        `${date}T00:00:00`
      ).toLocaleDateString(
        "fr-FR",
        {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      );
    } catch {
      return date;
    }
  };

  // ==========================================================
  // RÉINITIALISER LES FILTRES
  // ==========================================================

  const resetFilters = () => {
    setFilter("all");
    setSearch("");
    setDateFilter("");
  };

  const hasFilters =
    filter !== "all" ||
    search.trim() !== "" ||
    dateFilter !== "";

  // ==========================================================
  // RENDU
  // ==========================================================

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 25,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
      }}
      className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100 md:px-8 md:py-8"
    >
      {/* =====================================================
          ARRIÈRE-PLAN DÉCORATIF
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/5 blur-3xl" />

      </div>

      <div className="relative mx-auto max-w-7xl">

        {/* ==================================================
            EN-TÊTE
        ================================================== */}

        <header className="mb-8">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div className="min-w-0">

              {/* RETOUR */}

              <button
                type="button"
                onClick={() =>
                  navigate(-1)
                }
                className="group mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                Retour
              </button>

              {/* TITRE */}

              <div className="flex items-start gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-600 text-white shadow-xl shadow-blue-600/20 dark:border-blue-400/20 dark:bg-blue-500">
                  <History className="h-7 w-7" />
                </div>

                <div className="min-w-0">

                  <div className="mb-1 flex items-center gap-2">

                    <Sparkles className="h-4 w-4 text-blue-500 dark:text-blue-400" />

                    <span className="text-xs font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                      Administration CODE
                    </span>

                  </div>

                  <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl md:text-4xl">
                    Historique des connexions
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 md:text-base">
                    Suivez les connexions des
                    utilisateurs, leur activité
                    actuelle et l'historique de
                    leurs sessions.
                  </p>

                </div>

              </div>

            </div>

            {/* ACTUALISATION */}

            <div className="flex items-center gap-3">

              <div className="hidden items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 sm:flex">

                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

                Actualisation automatique

              </div>

              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  fetchRecords();
                }}
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <RefreshCw className="h-5 w-5" />
                )}

                Actualiser
              </button>

            </div>

          </div>

        </header>

        {/* ==================================================
            STATISTIQUES
        ================================================== */}

        <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* TOTAL */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Total
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                  {total}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  connexions enregistrées
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10">
                <History className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>

            </div>

          </div>

          {/* CONNECTÉS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Connectés
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                  {totalOnline}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  actuellement détectés
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/10">
                <Wifi className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>

            </div>

          </div>

          {/* DÉCONNECTÉS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Déconnectés
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                  {totalOffline}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  hors ligne
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                <WifiOff className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </div>

            </div>

          </div>

          {/* ACTUELLEMENT EN LIGNE */}

          <div className="rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-yellow-500/20 dark:from-yellow-500/10 dark:to-slate-900">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-yellow-700 dark:text-yellow-400">
                  En ligne
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                  {currentOnline}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  activité actuelle
                </p>

              </div>

              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100 dark:bg-yellow-500/10">

                <span className="absolute h-3 w-3 animate-ping rounded-full bg-yellow-500/50" />

                <span className="relative h-2.5 w-2.5 rounded-full bg-yellow-500" />

              </div>

            </div>

          </div>

        </section>

        {/* ==================================================
            RECHERCHE ET FILTRES
        ================================================== */}

        <section className="mb-7 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/40">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10">
                <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>

              <div>

                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  Rechercher et filtrer
                </h2>

                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Affinez l'historique affiché.
                </p>

              </div>

            </div>

          </div>

          <div className="p-5">

            {/* RECHERCHE + DATE */}

            <div className="grid gap-4 lg:grid-cols-[1fr_220px_auto]">

              {/* RECHERCHE */}

              <div className="relative">

                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />

                <input
                  type="text"
                  placeholder="Rechercher par nom ou prénom..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800"
                />

              </div>

              {/* DATE */}

              <div className="relative">

                <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />

                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) =>
                    setDateFilter(
                      e.target.value
                    )
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200 dark:focus:border-blue-500 dark:focus:bg-slate-800"
                />

              </div>

              {/* RÉINITIALISER */}

              <button
                type="button"
                onClick={resetFilters}
                disabled={!hasFilters}
                className="h-12 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition-all duration-300 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              >
                Réinitialiser
              </button>

            </div>

            {/* FILTRES STATUT */}

            <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">

              <div className="flex flex-wrap gap-2">

                <button
                  type="button"
                  onClick={() =>
                    setFilter("all")
                  }
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition-all duration-200 ${
                    filter === "all"
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 dark:bg-blue-500"
                      : "border border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Tous
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFilter("online")
                  }
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition-all duration-200 ${
                    filter === "online"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 dark:bg-emerald-500"
                      : "border border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
                  }`}
                >
                  <Wifi className="h-4 w-4" />
                  Connectés
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFilter("offline")
                  }
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition-all duration-200 ${
                    filter === "offline"
                      ? "bg-slate-700 text-white shadow-lg dark:bg-slate-600"
                      : "border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  <WifiOff className="h-4 w-4" />
                  Déconnectés
                </button>

              </div>

              <div className="text-xs font-semibold text-slate-400 dark:text-slate-500">

                {filteredRecords.length} résultat
                {filteredRecords.length > 1
                  ? "s"
                  : ""}

              </div>

            </div>

          </div>

        </section>

        {/* ==================================================
            HISTORIQUE
        ================================================== */}

        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-lg shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">

          {/* EN-TÊTE */}

          <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-5 dark:border-slate-800 dark:bg-slate-950/40 sm:px-6">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10">
                  <History className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>

                <div>

                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Journal des connexions
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                    Activité récente des utilisateurs
                  </p>

                </div>

              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">

                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />

                Mise à jour automatique

              </div>

            </div>

          </div>

          {/* CHARGEMENT */}

          {loading && records.length === 0 ? (

            <div className="flex min-h-[420px] flex-col items-center justify-center p-10">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10">

                <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />

              </div>

              <h3 className="mt-5 text-lg font-black text-slate-900 dark:text-white">
                Chargement de l'historique
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Récupération des connexions...
              </p>

            </div>

          ) : filteredRecords.length === 0 ? (

            /* ================================================
               AUCUN RÉSULTAT
            ================================================= */

            <div className="p-10 text-center sm:p-14">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">

                <History className="h-7 w-7 text-slate-400 dark:text-slate-500" />

              </div>

              <h3 className="mt-5 text-lg font-black text-slate-900 dark:text-white">
                Aucun historique trouvé
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Aucun enregistrement ne correspond
                aux critères de recherche actuels.
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Réinitialiser les filtres
                </button>
              )}

            </div>

          ) : (

            /* ================================================
               GROUPES PAR DATE
            ================================================= */

            <div className="space-y-6 p-5 sm:p-6">

              {recordsByDate.map(
                ([date, recs]) => (

                  <div
                    key={date}
                    className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800"
                  >

                    {/* DATE */}

                    <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-950/50">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-900">

                          <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />

                        </div>

                        <div>

                          <h3 className="text-sm font-black capitalize text-slate-900 dark:text-white sm:text-base">
                            {formatDisplayDate(
                              date
                            )}
                          </h3>

                          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                            {date}
                          </p>

                        </div>

                      </div>

                      <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                        {recs.length} connexion
                        {recs.length > 1
                          ? "s"
                          : ""}
                      </span>

                    </div>

                    {/* TABLEAU */}

                    <div className="overflow-x-auto">

                      <table className="min-w-[800px] w-full">

                        <thead>

                          <tr className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

                            <th className="px-5 py-3.5 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              Utilisateur
                            </th>

                            <th className="px-5 py-3.5 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              Connexion
                            </th>

                            <th className="px-5 py-3.5 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              Déconnexion
                            </th>

                            <th className="px-5 py-3.5 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              État
                            </th>

                          </tr>

                        </thead>

                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                          {recs.map(
                            (record) => {

                              const online =
                                isUserOnline(
                                  record
                                );

                              return (
                                <tr
                                  key={`${record.id}-${record.date}-${record.heure_connexion}`}
                                  className={`group transition-colors duration-200 ${
                                    online
                                      ? "bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-500/5 dark:hover:bg-emerald-500/10"
                                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                                  }`}
                                >

                                  {/* UTILISATEUR */}

                                  <td className="px-5 py-4">

                                    <div className="flex items-center gap-3">

                                      <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                        online
                                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                      }`}>

                                        <UserRound className="h-5 w-5" />

                                        {online && (
                                          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-pulse rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
                                        )}

                                      </div>

                                      <div className="min-w-0">

                                        <p className="font-black text-slate-800 dark:text-slate-100">
                                          {record.prenom}{" "}
                                          {record.nom}
                                        </p>

                                        {online && (
                                          <div className="mt-1 flex items-center gap-1.5">

                                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />

                                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                              Connecté depuis{" "}
                                              {getElapsedTime(
                                                record
                                              )}
                                            </span>

                                          </div>
                                        )}

                                      </div>

                                    </div>

                                  </td>

                                  {/* CONNEXION */}

                                  <td className="px-5 py-4">

                                    <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">

                                      <Clock3 className="h-4 w-4" />

                                      {record.heure_connexion}

                                    </div>

                                  </td>

                                  {/* DÉCONNEXION */}

                                  <td className="px-5 py-4">

                                    {online ? (

                                      <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">

                                        <Wifi className="h-4 w-4" />

                                        En cours

                                      </span>

                                    ) : record.heure_deconnexion ? (

                                      <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">

                                        <Clock3 className="h-4 w-4 text-slate-400" />

                                        {
                                          record.heure_deconnexion
                                        }

                                      </span>

                                    ) : (

                                      <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                                        —
                                      </span>

                                    )}

                                  </td>

                                  {/* ÉTAT */}

                                  <td className="px-5 py-4">

                                    {online ? (

                                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">

                                        <CheckCircle2 className="h-3.5 w-3.5" />

                                        En ligne

                                      </span>

                                    ) : (

                                      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">

                                        <XCircle className="h-3.5 w-3.5" />

                                        Hors ligne

                                      </span>

                                    )}

                                  </td>

                                </tr>
                              );
                            }
                          )}

                        </tbody>

                      </table>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </section>

        {/* ==================================================
            ACTIONS BAS DE PAGE
        ================================================== */}

        <div className="mt-8 flex flex-col items-center justify-center gap-3 pb-8 sm:flex-row">

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl sm:w-auto dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            <ShieldCheck className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />

            Dashboard
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-black text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl sm:w-auto dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />

            Retour
          </button>

        </div>

        {/* ==================================================
            PIED DE PAGE
        ================================================== */}

        <div className="flex justify-center pb-2">

          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-400 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-500">

            <ShieldCheck className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />

            Surveillance des connexions — CODE

          </div>

        </div>

      </div>
    </motion.div>
  );
};

export default HistoriqueConnections;

