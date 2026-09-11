import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  UserCheck,
  UserX,
  Loader2,
  AlertCircle,
  BookOpen,
  Save,
  Trash2,
  RefreshCw,
  Mail,
  CheckCircle2,
  XCircle,
  Users,
  ShieldCheck,
  GraduationCap,
  Sparkles,
} from "lucide-react";

import api from "../../utils/axios";

// ============================================================
// TYPES
// ============================================================

type Teacher = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  enseignant: boolean;
  enseignant_actif: boolean;
  subjects: string[];
};

// ============================================================
// MATIÈRES DISPONIBLES
// ============================================================

const SUBJECTS = [
  "Mathématiques",
  "Français",
  "Anglais",
  "Informatique",
  "Physique",
  "Chimie",
  "SVT",
  "Histoire",
  "Géographie",
  "Économie",
  "Philosophie",
];

// ============================================================
// COMPOSANT
// ============================================================

const GestionEnseignants: React.FC = () => {
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [saving, setSaving] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);

  // ==========================================================
  // CHARGER LES ENSEIGNANTS
  // ==========================================================

  const charger = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        console.log(
          "[GestionEnseignants] Chargement des enseignants..."
        );

        const response = await api.get<Teacher[]>(
          "/api/admin/teachers"
        );

        console.log(
          "[GestionEnseignants] Enseignants reçus :",
          response.data
        );

        setTeachers(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (err: any) {
        console.error(
          "[GestionEnseignants] Erreur :",
          err
        );

        const status = err?.response?.status;
        const detail = err?.response?.data?.detail;

        if (status === 401) {
          setError(
            "Votre session a expiré. Veuillez vous reconnecter."
          );
        } else if (status === 403) {
          setError(
            "Accès refusé. Cette page est réservée aux administrateurs CODE."
          );
        } else if (status === 404) {
          setError(
            "Le service de gestion des enseignants est introuvable."
          );
        } else if (status >= 500) {
          setError(
            "Le serveur rencontre actuellement un problème. Veuillez réessayer."
          );
        } else {
          setError(
            detail ||
              "Impossible de charger les enseignants."
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
  // RETOUR À LA LISTE DES INSCRITS
  // ==========================================================

  const retourListeInscrits = () => {
    navigate("/admin/liste-inscrits");
  };

  // ==========================================================
  // MODIFIER LES MATIÈRES LOCALEMENT
  // ==========================================================

  const modifierMatieres = (
    teacherId: number,
    subject: string
  ) => {
    setTeachers((current) =>
      current.map((teacher) => {
        if (teacher.id !== teacherId) {
          return teacher;
        }

        const exists =
          teacher.subjects.includes(subject);

        return {
          ...teacher,
          subjects: exists
            ? teacher.subjects.filter(
                (item) => item !== subject
              )
            : [...teacher.subjects, subject],
        };
      })
    );
  };

  // ==========================================================
  // ACTIVER / DÉSACTIVER UN ENSEIGNANT
  // ==========================================================

  const activer = async (teacher: Teacher) => {
    try {
      setSaving(teacher.id);
      setError(null);

      console.log(
        "[GestionEnseignants] Modification enseignant :",
        teacher.id
      );

      await api.post(
        `/api/admin/teachers/${teacher.id}`
      );

      await charger(true);
    } catch (err: any) {
      console.error(
        "[GestionEnseignants] Erreur activation/désactivation :",
        err
      );

      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;

      if (status === 401) {
        setError(
          "Votre session a expiré. Veuillez vous reconnecter."
        );
      } else if (status === 403) {
        setError(
          "Vous n'avez pas les droits nécessaires pour modifier cet enseignant."
        );
      } else if (status === 404) {
        setError(
          "Cet utilisateur n'existe plus."
        );
      } else {
        setError(
          detail ||
            "Impossible de modifier cet enseignant."
        );
      }
    } finally {
      setSaving(null);
    }
  };

  // ==========================================================
  // SAUVEGARDER LES MATIÈRES
  // ==========================================================

  const sauvegarderMatieres = async (
    teacher: Teacher
  ) => {
    try {
      setSaving(teacher.id);
      setError(null);

      console.log(
        "[GestionEnseignants] Sauvegarde des matières :",
        {
          teacherId: teacher.id,
          subjects: teacher.subjects,
        }
      );

      await api.put(
        `/api/admin/teachers/${teacher.id}/subjects`,
        {
          subjects: teacher.subjects,
        }
      );

      await charger(true);
    } catch (err: any) {
      console.error(
        "[GestionEnseignants] Erreur sauvegarde matières :",
        err
      );

      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;

      if (status === 401) {
        setError(
          "Votre session a expiré. Veuillez vous reconnecter."
        );
      } else if (status === 403) {
        setError(
          "Vous n'avez pas les droits nécessaires pour modifier les matières."
        );
      } else if (status === 404) {
        setError(
          "Cet enseignant n'existe plus."
        );
      } else if (status === 422) {
        setError(
          detail ||
            "Les matières sélectionnées ne sont pas valides."
        );
      } else {
        setError(
          detail ||
            "Impossible d'enregistrer les matières."
        );
      }
    } finally {
      setSaving(null);
    }
  };

  // ==========================================================
  // RETIRER LE STATUT ENSEIGNANT
  // ==========================================================

  const supprimerEnseignant = async (
    teacher: Teacher
  ) => {
    const confirmation = window.confirm(
      `Voulez-vous vraiment retirer le statut enseignant de ${teacher.prenom} ${teacher.nom} ?\n\nSes matières attribuées seront également supprimées.`
    );

    if (!confirmation) {
      return;
    }

    try {
      setSaving(teacher.id);
      setError(null);

      console.log(
        "[GestionEnseignants] Retrait du statut enseignant :",
        teacher.id
      );

      await api.delete(
        `/api/admin/teachers/${teacher.id}`
      );

      await charger(true);
    } catch (err: any) {
      console.error(
        "[GestionEnseignants] Erreur retrait enseignant :",
        err
      );

      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;

      if (status === 401) {
        setError(
          "Votre session a expiré. Veuillez vous reconnecter."
        );
      } else if (status === 403) {
        setError(
          "Vous n'avez pas les droits nécessaires pour retirer cet enseignant."
        );
      } else if (status === 404) {
        setError(
          "Cet enseignant n'existe pas."
        );
      } else {
        setError(
          detail ||
            "Impossible de retirer le statut enseignant."
        );
      }
    } finally {
      setSaving(null);
    }
  };

  // ==========================================================
  // RENDU
  // ==========================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100 md:px-8 md:py-8">

      {/* =====================================================
          ARRIÈRE-PLAN DÉCORATIF
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/10" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/10" />
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
                onClick={retourListeInscrits}
                className="mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
              >
                <ArrowLeft size={17} />

                Retour à la liste des inscrits
              </button>

              {/* TITRE */}

              <div className="flex items-start gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-600 text-white shadow-xl shadow-blue-600/20 dark:border-blue-400/20 dark:bg-blue-500">
                  <Users size={27} />
                </div>

                <div className="min-w-0">

                  <div className="mb-1 flex items-center gap-2">

                    <Sparkles className="h-4 w-4 text-blue-500 dark:text-blue-400" />

                    <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                      Administration CODE
                    </span>

                  </div>

                  <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
                    Gestion des enseignants
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 md:text-base">
                    Gérez les profils enseignants, leur statut
                    d'activité et les matières qu'ils sont
                    autorisés à enseigner sur CODE.
                  </p>

                </div>

              </div>

              {/* INDICATEURS */}

              {!loading && (
                <div className="mt-5 flex flex-wrap gap-3">

                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">

                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/15">
                      <Users
                        size={13}
                        className="text-blue-600 dark:text-blue-400"
                      />
                    </div>

                    {teachers.length}{" "}
                    {teachers.length === 1
                      ? "enseignant"
                      : "enseignants"}

                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/90 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">

                    <CheckCircle2 size={15} />

                    {
                      teachers.filter(
                        (teacher) =>
                          teacher.enseignant_actif
                      ).length
                    }{" "}
                    actifs

                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">

                    <BookOpen
                      size={15}
                      className="text-indigo-500 dark:text-indigo-400"
                    />

                    {
                      new Set(
                        teachers.flatMap(
                          (teacher) =>
                            teacher.subjects
                        )
                      ).size
                    }{" "}
                    matières utilisées

                  </div>

                </div>
              )}

            </div>

            {/* ACTUALISER */}

            <button
              type="button"
              onClick={() => charger(true)}
              disabled={loading || refreshing}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
            >
              {refreshing ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Actualisation...
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  Actualiser
                </>
              )}
            </button>

          </div>

        </header>

        {/* ==================================================
            ERREUR
        ================================================== */}

        {error && (
          <div className="mb-7 overflow-hidden rounded-2xl border border-red-200 bg-red-50 shadow-sm dark:border-red-500/20 dark:bg-red-500/10">

            <div className="flex items-start gap-4 p-5">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/15">
                <AlertCircle
                  size={20}
                  className="text-red-600 dark:text-red-400"
                />
              </div>

              <div className="min-w-0 flex-1">

                <p className="font-black text-red-800 dark:text-red-300">
                  Une erreur est survenue
                </p>

                <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300/80">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => charger()}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-3.5 py-2 text-sm font-bold text-white transition hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                >
                  <RefreshCw size={15} />
                  Réessayer
                </button>

              </div>

            </div>

          </div>
        )}

        {/* ==================================================
            CHARGEMENT
        ================================================== */}

        {loading ? (

          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[2rem] border border-slate-200 bg-white/90 p-10 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">

            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-blue-200 bg-blue-50 shadow-lg dark:border-blue-500/20 dark:bg-blue-500/10">

              <div className="absolute inset-0 animate-pulse rounded-3xl bg-blue-500/5" />

              <Loader2
                size={38}
                className="relative animate-spin text-blue-600 dark:text-blue-400"
              />

            </div>

            <h2 className="mt-6 text-lg font-black text-slate-900 dark:text-white">
              Chargement des enseignants
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Récupération des données depuis le serveur...
            </p>

          </div>

        ) : teachers.length === 0 ? (

          /* ==================================================
             AUCUN ENSEIGNANT
          ================================================== */

          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-10 text-center shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 md:p-16">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-slate-100 dark:bg-slate-800">
              <GraduationCap
                size={38}
                className="text-slate-400 dark:text-slate-500"
              />
            </div>

            <h2 className="mt-6 text-2xl font-black text-slate-900 dark:text-white">
              Aucun enseignant
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              Aucun utilisateur n'est actuellement
              enregistré comme enseignant sur CODE.
            </p>

            <button
              type="button"
              onClick={() => charger(true)}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <RefreshCw size={17} />
              Actualiser
            </button>

          </div>

        ) : (

          /* ==================================================
             LISTE DES ENSEIGNANTS
          ================================================== */

          <div className="space-y-6">

            {teachers.map((teacher) => {

              const isSaving =
                saving === teacher.id;

              return (
                <article
                  key={teacher.id}
                  className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white/95 shadow-lg shadow-slate-900/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-black/20"
                >

                  {/* ========================================
                      BARRE SUPÉRIEURE DE LA CARTE
                  ======================================== */}

                  <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

                  <div className="p-5 md:p-7">

                    {/* ======================================
                        PROFIL + ACTIONS
                    ====================================== */}

                    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">

                      {/* PROFIL */}

                      <div className="min-w-0 flex-1">

                        <div className="flex items-start gap-4">

                          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 shadow-sm dark:border-blue-500/20 dark:from-blue-500/10 dark:to-indigo-500/10 dark:text-blue-300">

                            <UserCheck size={25} />

                            <span
                              className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 ${
                                teacher.enseignant_actif
                                  ? "bg-emerald-500"
                                  : "bg-red-500"
                              }`}
                            />

                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap items-center gap-2">

                              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white md:text-2xl">
                                {teacher.prenom}{" "}
                                {teacher.nom}
                              </h2>

                              {teacher.enseignant_actif && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                                  <CheckCircle2 size={12} />
                                  Actif
                                </span>
                              )}

                            </div>

                            <p className="mt-1.5 flex min-w-0 items-center gap-2 text-sm text-slate-500 dark:text-slate-400">

                              <Mail
                                size={15}
                                className="shrink-0"
                              />

                              <span className="truncate">
                                {teacher.email}
                              </span>

                            </p>

                          </div>

                        </div>

                        {/* BADGES */}

                        <div className="mt-5 flex flex-wrap gap-2">

                          {teacher.enseignant_actif ? (
                            <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                              <CheckCircle2 size={14} />
                              Enseignant actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                              <XCircle size={14} />
                              Enseignant désactivé
                            </span>
                          )}

                          <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            <BookOpen size={14} />

                            {teacher.subjects.length}{" "}
                            {teacher.subjects.length === 1
                              ? "matière"
                              : "matières"}
                          </span>

                        </div>

                      </div>

                      {/* ======================================
                          ACTIONS
                      ====================================== */}

                      <div className="flex flex-wrap gap-2 xl:max-w-sm xl:justify-end">

                        <button
                          type="button"
                          onClick={() =>
                            activer(teacher)
                          }
                          disabled={isSaving}
                          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${
                            teacher.enseignant_actif
                              ? "bg-amber-600 shadow-amber-600/15 hover:bg-amber-700 hover:shadow-lg dark:bg-amber-500 dark:hover:bg-amber-600"
                              : "bg-blue-600 shadow-blue-600/15 hover:bg-blue-700 hover:shadow-lg dark:bg-blue-500 dark:hover:bg-blue-600"
                          }`}
                        >
                          {isSaving ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : teacher.enseignant_actif ? (
                            <UserX size={17} />
                          ) : (
                            <UserCheck size={17} />
                          )}

                          {teacher.enseignant_actif
                            ? "Désactiver"
                            : "Activer"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            supprimerEnseignant(
                              teacher
                            )
                          }
                          disabled={isSaving}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/20 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-500/10"
                        >
                          <Trash2 size={17} />

                          Retirer enseignant
                        </button>

                      </div>

                    </div>

                    {/* ======================================
                        SÉPARATION
                    ====================================== */}

                    <div className="my-7 border-t border-slate-100 dark:border-slate-800" />

                    {/* ======================================
                        SECTION MATIÈRES
                    ====================================== */}

                    <div>

                      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10">
                            <BookOpen
                              size={19}
                              className="text-blue-600 dark:text-blue-400"
                            />
                          </div>

                          <div>

                            <h3 className="font-black text-slate-900 dark:text-white">
                              Matières attribuées
                            </h3>

                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                              Sélectionnez les matières que cet
                              enseignant peut enseigner.
                            </p>

                          </div>

                        </div>

                        {teacher.subjects.length > 0 && (
                          <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                            {teacher.subjects.length} sélectionnée
                            {teacher.subjects.length > 1
                              ? "s"
                              : ""}
                          </span>
                        )}

                      </div>

                      {/* ====================================
                          GRILLE DES MATIÈRES
                      ==================================== */}

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                        {SUBJECTS.map((subject) => {

                          const selected =
                            teacher.subjects.includes(
                              subject
                            );

                          return (
                            <button
                              key={subject}
                              type="button"
                              onClick={() =>
                                modifierMatieres(
                                  teacher.id,
                                  subject
                                )
                              }
                              disabled={isSaving}
                              className={`group/subject relative flex min-h-[48px] items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                                selected
                                  ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/10 dark:border-blue-400/50 dark:bg-blue-500/10 dark:text-blue-300"
                                  : "border-slate-200 bg-slate-50/80 text-slate-600 hover:border-blue-300 hover:bg-blue-50/70 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                              }`}
                            >

                              <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black transition ${
                                  selected
                                    ? "bg-blue-600 text-white dark:bg-blue-500"
                                    : "bg-white text-slate-400 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-500 dark:ring-slate-700"
                                }`}
                              >
                                {selected ? "✓" : "+"}
                              </span>

                              <span className="min-w-0">
                                {subject}
                              </span>

                            </button>
                          );
                        })}

                      </div>

                      {/* ====================================
                          ATTRIBUTION ACTUELLE
                      ==================================== */}

                      {teacher.subjects.length > 0 && (
                        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-500/15 dark:bg-blue-500/5">

                          <div className="mb-3 flex items-center gap-2">

                            <ShieldCheck
                              size={16}
                              className="text-blue-600 dark:text-blue-400"
                            />

                            <p className="text-xs font-black uppercase tracking-[0.12em] text-blue-700 dark:text-blue-300">
                              Attribution actuelle
                            </p>

                          </div>

                          <div className="flex flex-wrap gap-2">

                            {teacher.subjects.map(
                              (subject) => (
                                <span
                                  key={subject}
                                  className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm dark:border-blue-500/20 dark:bg-slate-900 dark:text-blue-300"
                                >
                                  <CheckCircle2
                                    size={12}
                                  />

                                  {subject}
                                </span>
                              )
                            )}

                          </div>

                        </div>
                      )}

                      {/* ====================================
                          SAUVEGARDER
                      ==================================== */}

                      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-800/40">

                        <div className="flex items-start gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-900">
                            <Save
                              size={16}
                              className="text-slate-500 dark:text-slate-400"
                            />
                          </div>

                          <div>

                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                              Enregistrer les modifications
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                              Les nouvelles matières seront
                              appliquées au profil de cet enseignant.
                            </p>

                          </div>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            sauvegarderMatieres(
                              teacher
                            )
                          }
                          disabled={isSaving}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                        >
                          {isSaving ? (
                            <>
                              <Loader2
                                size={17}
                                className="animate-spin"
                              />
                              Enregistrement...
                            </>
                          ) : (
                            <>
                              <Save size={17} />
                              Enregistrer
                            </>
                          )}
                        </button>

                      </div>

                    </div>

                  </div>

                </article>
              );
            })}

          </div>
        )}

        {/* ==================================================
            PIED DE PAGE
        ================================================== */}

        {!loading && teachers.length > 0 && (
          <div className="mt-8 flex justify-center pb-6">

            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">

              <ShieldCheck
                size={14}
                className="text-blue-500 dark:text-blue-400"
              />

              Administration sécurisée — CODE

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default GestionEnseignants;