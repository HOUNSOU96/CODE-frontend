
// 📁 src/pages/admin/ParrainDetails.tsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/utils/axios";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  UserCheck,
  UserX,
  Mail,
  Phone,
  CalendarDays,
  ShieldCheck,
  Wifi,
  WifiOff,
  AlertCircle,
  Loader2,
  UserRound,
  Sparkles,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================

interface Filleul {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  date_inscription: string;
  is_blocked?: boolean;
  is_online?: boolean;
}

interface ParrainInfo {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  date_inscription: string;
  is_blocked?: boolean;
  total_filleuls: number;
  filleuls: Filleul[];
}

// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

// ============================================================
// COMPOSANT
// ============================================================

const ParrainDetails: React.FC = () => {
  const { email } = useParams<{ email: string }>();
  const navigate = useNavigate();

  const [parrain, setParrain] =
    useState<ParrainInfo | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================================
  // RÉCUPÉRATION DU PARRAIN
  // ==========================================================

  useEffect(() => {
    const fetchParrain = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(
          `/api/admin/parrain/${email}`
        );

        setParrain(res.data);
      } catch (err: any) {
        console.error(
          "Erreur récupération parrain :",
          err
        );

        const status =
          err?.response?.status;

        if (status === 401) {
          setError(
            "Votre session n'est plus valide. Veuillez vous reconnecter."
          );
        } else if (status === 403) {
          setError(
            "Accès refusé. Cette page est réservée à l'administration."
          );
        } else if (status === 404) {
          setError(
            "Le parrain demandé est introuvable."
          );
        } else {
          setError(
            err?.response?.data?.detail ||
              "Erreur lors du chargement des informations du parrain."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchParrain();
  }, [email]);

  // ==========================================================
  // CHARGEMENT
  // ==========================================================

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 transition-colors duration-300 dark:bg-slate-950">

        {/* ARRIÈRE-PLAN */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative flex w-full max-w-md flex-col items-center rounded-[2rem] border border-slate-200 bg-white/95 p-10 text-center shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10">

            <Loader2
              className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400"
            />

          </div>

          <h1 className="mt-5 text-lg font-black text-slate-900 dark:text-white">
            Chargement du parrain
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Récupération des informations et des filleuls...
          </p>

        </div>
      </div>
    );
  }

  // ==========================================================
  // ERREUR / PARRAIN INTROUVABLE
  // ==========================================================

  if (!parrain) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-8 transition-colors duration-300 dark:bg-slate-950">

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-red-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-red-200 bg-white shadow-xl dark:border-red-500/20 dark:bg-slate-900">

          <div className="h-1.5 bg-red-500" />

          <div className="p-8 text-center sm:p-10">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-500/10">

              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />

            </div>

            <h1 className="mt-5 text-xl font-black text-slate-900 dark:text-white">
              Parrain introuvable
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {error ||
                "Les informations du parrain ne sont pas disponibles."}
            </p>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>

          </div>
        </div>

      </div>
    );
  }

  // ==========================================================
  // FILTRER LE PARRAIN HORS DES FILLEULS
  // ==========================================================

  const filleulsExclusParrain =
    parrain.filleuls.filter(
      (f) => f.email !== parrain.email
    );

  const totalFilleuls =
    filleulsExclusParrain.length;

  const filleulsActifs =
    filleulsExclusParrain.filter(
      (f) => !f.is_blocked
    ).length;

  const filleulsBloques =
    filleulsExclusParrain.filter(
      (f) => f.is_blocked
    ).length;

  const filleulsConnectes =
    filleulsExclusParrain.filter(
      (f) => f.is_online
    ).length;

  // ==========================================================
  // RENDU
  // ==========================================================

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -25 }}
      transition={{ duration: 0.45 }}
      className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100 md:px-8 md:py-8"
    >

      {/* =====================================================
          ARRIÈRE-PLAN DÉCORATIF
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/10" />

        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/10" />

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
                onClick={() => navigate(-1)}
                className="group mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                Retour
              </button>

              {/* TITRE */}

              <div className="flex items-start gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-600 text-white shadow-xl shadow-blue-600/20 dark:border-blue-400/20 dark:bg-blue-500">
                  <Users className="h-7 w-7" />
                </div>

                <div className="min-w-0">

                  <div className="mb-1 flex items-center gap-2">

                    <Sparkles className="h-4 w-4 text-blue-500 dark:text-blue-400" />

                    <span className="text-xs font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                      Administration CODE
                    </span>

                  </div>

                  <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl md:text-4xl">
                    Détails du parrain
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 md:text-base">
                    Consultez le profil du parrain et
                    l'ensemble des filleuls associés à
                    son compte.
                  </p>

                </div>

              </div>

            </div>

            {/* IDENTIFIANT DU PARRAIN */}

            <div className="hidden shrink-0 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur sm:block dark:border-slate-800 dark:bg-slate-900/90">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                  <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>

                <div>

                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Identifiant
                  </p>

                  <p className="mt-0.5 max-w-[230px] truncate text-xs font-bold text-slate-700 dark:text-slate-200">
                    {parrain.email}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </header>

        {/* ==================================================
            PROFIL DU PARRAIN
        ================================================== */}

        <section className="mb-7 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-lg shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">

          {/* BARRE */}

          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

          <div className="p-5 sm:p-7">

            {/* PROFIL */}

            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

              <div className="flex min-w-0 items-start gap-4 sm:gap-5">

                {/* AVATAR */}

                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 shadow-sm dark:border-blue-500/20 dark:from-blue-500/10 dark:to-indigo-500/10 dark:text-blue-300 sm:h-20 sm:w-20">

                  <UserRound className="h-8 w-8 sm:h-9 sm:w-9" />

                  <span
                    className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-[3px] border-white dark:border-slate-900 ${
                      parrain.is_blocked
                        ? "bg-red-500"
                        : "bg-emerald-500"
                    }`}
                  />

                </div>

                {/* NOM */}

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-2">

                    <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                      {parrain.prenom}{" "}
                      {parrain.nom}
                    </h2>

                    {parrain.is_blocked ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                        <UserX className="h-3 w-3" />
                        Bloqué
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                        <UserCheck className="h-3 w-3" />
                        Actif
                      </span>
                    )}

                  </div>

                  <div className="mt-2 flex flex-col gap-1.5 text-sm text-slate-500 dark:text-slate-400">

                    <span className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {parrain.email}
                      </span>
                    </span>

                    <span className="inline-flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0" />
                      {parrain.telephone || "Téléphone non renseigné"}
                    </span>

                  </div>

                </div>

              </div>

              {/* TOTAL FILLEULS */}

              <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-500/15 dark:bg-blue-500/5">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 dark:bg-blue-500">
                  <Users className="h-6 w-6" />
                </div>

                <div>

                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    {totalFilleuls}
                  </p>

                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {totalFilleuls === 1
                      ? "filleul"
                      : "filleuls"}
                  </p>

                </div>

              </div>

            </div>

            {/* INFORMATIONS */}

            <div className="mt-7 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-slate-800">

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-900">
                    <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>

                  <div>

                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Inscription
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">
                      {formatDate(
                        parrain.date_inscription
                      )}
                    </p>

                  </div>

                </div>

              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-900">
                    <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>

                  <div>

                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Parrainage
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">
                      {totalFilleuls}{" "}
                      {totalFilleuls === 1
                        ? "filleul"
                        : "filleuls"}
                    </p>

                  </div>

                </div>

              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 sm:col-span-2 lg:col-span-1">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-900">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <div>

                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      État du compte
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">
                      {parrain.is_blocked
                        ? "Compte bloqué"
                        : "Compte actif"}
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ==================================================
            STATISTIQUES DES FILLEULS
        ================================================== */}

        <section className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* TOTAL */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Total
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                  {totalFilleuls}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  filleuls
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>

            </div>

          </div>

          {/* ACTIFS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Actifs
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                  {filleulsActifs}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  comptes actifs
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/10">
                <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>

            </div>

          </div>

          {/* BLOQUÉS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Bloqués
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                  {filleulsBloques}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  comptes bloqués
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/10">
                <UserX className="h-5 w-5 text-red-600 dark:text-red-400" />
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
                  {filleulsConnectes}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  actuellement en ligne
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 dark:bg-cyan-500/10">
                <Wifi className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>

            </div>

          </div>

        </section>

        {/* ==================================================
            LISTE DES FILLEULS
        ================================================== */}

        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-lg shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">

          {/* EN-TÊTE */}

          <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-5 dark:border-slate-800 dark:bg-slate-950/40 sm:px-6">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>

                <div>

                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Liste des filleuls
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                    Utilisateurs associés à ce parrain
                  </p>

                </div>

              </div>

              <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                {totalFilleuls}{" "}
                {totalFilleuls === 1
                  ? "filleul"
                  : "filleuls"}
              </span>

            </div>

          </div>

          {/* ==================================================
              AUCUN FILLEUL
          ================================================== */}

          {totalFilleuls === 0 ? (

            <div className="p-10 text-center sm:p-14">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">

                <Users className="h-7 w-7 text-slate-400 dark:text-slate-500" />

              </div>

              <h3 className="mt-5 text-lg font-black text-slate-900 dark:text-white">
                Aucun filleul trouvé
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Ce parrain n'a actuellement aucun
                filleul associé à son compte.
              </p>

            </div>

          ) : (

            /* ==================================================
               TABLEAU
            ================================================== */

            <div className="overflow-x-auto">

              <table className="min-w-[1050px] w-full">

                {/* EN-TÊTE DU TABLEAU */}

                <thead>

                  <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/50">

                    <th className="px-5 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Filleul
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Contact
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Inscription
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Compte
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Connexion
                    </th>

                  </tr>

                </thead>

                {/* CORPS */}

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                  {filleulsExclusParrain.map(
                    (filleul) => (

                      <tr
                        key={filleul.id}
                        className="group transition-colors duration-200 hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                      >

                        {/* FILLEUL */}

                        <td className="px-5 py-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/15">

                              <UserRound className="h-5 w-5" />

                            </div>

                            <div className="min-w-0">

                              <p className="font-black text-slate-800 dark:text-slate-100">
                                {filleul.prenom}{" "}
                                {filleul.nom}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                                ID #{filleul.id}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* CONTACT */}

                        <td className="px-5 py-5">

                          <div className="space-y-1.5">

                            <div className="flex max-w-[260px] items-center gap-2 text-sm text-slate-600 dark:text-slate-300">

                              <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                              <span className="truncate">
                                {filleul.email}
                              </span>

                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">

                              <Phone className="h-3.5 w-3.5 shrink-0" />

                              {filleul.telephone ||
                                "Téléphone non renseigné"}

                            </div>

                          </div>

                        </td>

                        {/* DATE */}

                        <td className="px-5 py-5">

                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">

                            <CalendarDays className="h-4 w-4 text-slate-400 dark:text-slate-500" />

                            {formatDate(
                              filleul.date_inscription
                            )}

                          </div>

                        </td>

                        {/* COMPTE */}

                        <td className="px-5 py-5">

                          {filleul.is_blocked ? (

                            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-black text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">

                              <UserX className="h-3.5 w-3.5" />

                              Bloqué

                            </span>

                          ) : (

                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">

                              <UserCheck className="h-3.5 w-3.5" />

                              Actif

                            </span>

                          )}

                        </td>

                        {/* CONNEXION */}

                        <td className="px-5 py-5">

                          {filleul.is_online ? (

                            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-black text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300">

                              <Wifi className="h-3.5 w-3.5" />

                              Connecté

                            </span>

                          ) : (

                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">

                              <WifiOff className="h-3.5 w-3.5" />

                              Déconnecté

                            </span>

                          )}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* ==================================================
            RETOUR
        ================================================== */}

        <div className="flex justify-center pb-8 pt-8">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-black text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-slate-500/30 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
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

            Administration sécurisée — CODE

          </div>

        </div>

      </div>
    </motion.div>
  );
};

export default ParrainDetails;

