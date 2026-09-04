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

  // ID de l'enseignant actuellement modifié
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
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">

        {/* ================================================== */}
        {/* EN-TÊTE                                            */}
        {/* ================================================== */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            {/* ================================================== */}
            {/* RETOUR À LA LISTE DES INSCRITS                    */}
            {/* ================================================== */}

            <button
              type="button"
              onClick={retourListeInscrits}
              className="mb-4 inline-flex items-center gap-2
                         rounded-xl bg-white px-4 py-2.5
                         text-sm font-semibold text-slate-600
                         shadow-sm ring-1 ring-slate-200
                         transition hover:bg-slate-100
                         hover:text-slate-900
                         focus:outline-none
                         focus:ring-2 focus:ring-blue-500"
            >
              <ArrowLeft size={17} />

              Retour à la liste des inscrits
            </button>

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <Users size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
                  Gestion des enseignants
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Gérez les enseignants et les matières
                  qui leur sont attribuées.
                </p>
              </div>
            </div>

            {!loading && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
                <UserCheck
                  size={15}
                  className="text-blue-600"
                />

                {teachers.length}{" "}
                {teachers.length === 1
                  ? "enseignant"
                  : "enseignants"}
              </div>
            )}
          </div>

          {/* ================================================== */}
          {/* ACTUALISER                                        */}
          {/* ================================================== */}

          <button
            type="button"
            onClick={() => charger(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
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

        {/* ================================================== */}
        {/* ERREUR                                             */}
        {/* ================================================== */}

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

              <p className="mt-1 text-sm">
                {error}
              </p>

              <button
                type="button"
                onClick={() => charger()}
                className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* CHARGEMENT                                         */}
        {/* ================================================== */}

        {loading ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white">

            <Loader2
              size={38}
              className="animate-spin text-blue-600"
            />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Chargement des enseignants...
            </p>
          </div>

        ) : teachers.length === 0 ? (

          /* ================================================== */
          /* AUCUN ENSEIGNANT                                   */
          /* ================================================== */

          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <UserCheck
                size={32}
                className="text-slate-400"
              />
            </div>

            <h2 className="mt-5 font-semibold text-slate-700">
              Aucun enseignant
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Aucun utilisateur n'est actuellement
              enregistré comme enseignant.
            </p>

            <button
              type="button"
              onClick={() => charger(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <RefreshCw size={16} />
              Actualiser
            </button>
          </div>

        ) : (

          /* ================================================== */
          /* LISTE DES ENSEIGNANTS                              */
          /* ================================================== */

          <div className="space-y-5">

            {teachers.map((teacher) => {

              const isSaving =
                saving === teacher.id;

              return (
                <div
                  key={teacher.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md md:p-6"
                >

                  {/* ======================================== */}
                  {/* INFORMATIONS ENSEIGNANT                 */}
                  {/* ======================================== */}

                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                    <div className="min-w-0">

                      <div className="flex items-center gap-3">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                          <UserCheck size={23} />
                        </div>

                        <div className="min-w-0">

                          <h2 className="truncate font-bold text-slate-800">
                            {teacher.prenom}{" "}
                            {teacher.nom}
                          </h2>

                          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                            <Mail size={14} />

                            {teacher.email}
                          </p>
                        </div>
                      </div>

                      {/* ==================================== */}
                      {/* STATUT                               */}
                      {/* ==================================== */}

                      <div className="mt-4 flex flex-wrap gap-2">

                        {teacher.enseignant_actif ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                            <CheckCircle2 size={14} />
                            Enseignant actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                            <XCircle size={14} />
                            Enseignant désactivé
                          </span>
                        )}

                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                          {teacher.subjects.length}{" "}
                          {teacher.subjects.length === 1
                            ? "matière"
                            : "matières"}
                        </span>
                      </div>
                    </div>

                    {/* ====================================== */}
                    {/* ACTIONS                                 */}
                    {/* ====================================== */}

                    <div className="flex flex-wrap gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          activer(teacher)
                        }
                        disabled={isSaving}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          teacher.enseignant_actif
                            ? "bg-amber-600 hover:bg-amber-700"
                            : "bg-blue-600 hover:bg-blue-700"
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
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={17} />

                        Retirer enseignant
                      </button>
                    </div>
                  </div>

                  {/* ======================================== */}
                  {/* MATIÈRES                                 */}
                  {/* ======================================== */}

                  <div className="mt-6 border-t border-slate-100 pt-5">

                    <div className="mb-4 flex items-center justify-between gap-3">

                      <div className="flex items-center gap-2">
                        <BookOpen
                          size={19}
                          className="text-blue-600"
                        />

                        <h3 className="font-semibold text-slate-800">
                          Matières attribuées
                        </h3>
                      </div>

                      {teacher.subjects.length > 0 && (
                        <span className="text-xs font-medium text-slate-400">
                          {teacher.subjects.length} sélectionnée
                          {teacher.subjects.length > 1
                            ? "s"
                            : ""}
                        </span>
                      )}
                    </div>

                    {/* ==================================== */}
                    {/* GRILLE DES MATIÈRES                  */}
                    {/* ==================================== */}

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">

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
                            className={`rounded-xl border px-3 py-2.5 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              selected
                                ? "border-blue-500 bg-blue-50 font-semibold text-blue-700"
                                : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50/50"
                            }`}
                          >
                            {selected ? "✓ " : ""}
                            {subject}
                          </button>
                        );
                      })}
                    </div>

                    {/* ==================================== */}
                    {/* MATIÈRES ACTUELLEMENT SÉLECTIONNÉES */}
                    {/* ==================================== */}

                    {teacher.subjects.length > 0 && (
                      <div className="mt-4">

                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Attribution actuelle
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {teacher.subjects.map(
                            (subject) => (
                              <span
                                key={subject}
                                className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700"
                              >
                                {subject}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* ==================================== */}
                    {/* SAUVEGARDER                           */}
                    {/* ==================================== */}

                    <button
                      type="button"
                      onClick={() =>
                        sauvegarderMatieres(
                          teacher
                        )
                      }
                      disabled={isSaving}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
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
                          Enregistrer les matières
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionEnseignants;