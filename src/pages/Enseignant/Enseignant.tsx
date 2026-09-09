import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  FileVideo,
  Loader2,
  MessageCircle,
  PlayCircle,
  ShieldCheck,
  Users,
  Video,
  UserRound,
  Settings,
  Sparkles,
} from "lucide-react";

import api from "@/utils/axios";
import { useAuth } from "@/context/AuthContext";

type TeacherProfile = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  pays_residence: string | null;
  subjects: string[];
  teacher_photo: string | null;
  teacher_profile_validated: boolean;
  enseignant: boolean;
  enseignant_actif: boolean;
};

type TeacherVideo = {
  id: number | string;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  video_url?: string | null;
  duration?: string | null;
  views?: number;
  created_at?: string | null;
};

const Enseignant: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] =
    useState<TeacherProfile | null>(null);

  const [videos, setVideos] =
    useState<TeacherVideo[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingVideos, setLoadingVideos] =
    useState(false);

  const [error, setError] =
    useState("");

  /**
   * ==========================================================
   * CHARGEMENT DU PROFIL ENSEIGNANT
   * ==========================================================
   */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get("/api/teacher/profile");

        const data: TeacherProfile =
          response.data;

        if (
          !data.enseignant ||
          !data.enseignant_actif
        ) {
          setError(
            "Votre compte ne dispose pas actuellement des droits d'accès à l'espace enseignant."
          );
          return;
        }

        setProfile(data);

        if (!data.teacher_profile_validated) {
          navigate(
            "/enseignant/profil",
            { replace: true }
          );

          return;
        }
      } catch (err: any) {
        console.error(
          "Erreur récupération espace enseignant :",
          err
        );

        const message =
          err?.response?.data?.detail ||
          "Impossible de récupérer votre espace enseignant.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  /**
   * ==========================================================
   * VIDÉOS DE L'ENSEIGNANT
   * ==========================================================
   *
   * Le backend ne fournit pas encore l'endpoint définitif
   * permettant de récupérer les vidéos.
   */
  useEffect(() => {
    if (!profile) {
      return;
    }

    const loadTeacherVideos = async () => {
      try {
        setLoadingVideos(true);

        // Endpoint vidéo à connecter ultérieurement.
        setVideos([]);
      } finally {
        setLoadingVideos(false);
      }
    };

    loadTeacherVideos();
  }, [profile]);

  /**
   * ==========================================================
   * URL DE LA PHOTO
   * ==========================================================
   */
  const photoUrl = useMemo(() => {
    if (!profile?.teacher_photo) {
      return null;
    }

    const apiUrl =
      import.meta.env.VITE_API_URL || "";

    if (
      profile.teacher_photo.startsWith(
        "http"
      )
    ) {
      return profile.teacher_photo;
    }

    if (
      profile.teacher_photo.startsWith("/")
    ) {
      return `${apiUrl}${profile.teacher_photo}`;
    }

    return `${apiUrl}/${profile.teacher_photo}`;
  }, [profile]);

  /**
   * ==========================================================
   * CHARGEMENT
   * ==========================================================
   */
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950/50">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>

          <p className="mt-5 text-sm font-semibold text-slate-600 dark:text-slate-300">
            Chargement de votre espace enseignant...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Veuillez patienter
          </p>
        </div>
      </div>
    );
  }

  /**
   * ==========================================================
   * ERREUR
   * ==========================================================
   */
  if (error || !profile) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 shadow-2xl">

          <div className="p-8 md:p-10 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
              <MessageCircle className="h-8 w-8 text-red-400" />
            </div>

            <h1 className="mt-6 text-2xl font-black text-white">
              Espace enseignant
            </h1>

            <p className="mt-3 leading-7 text-red-200">
              {error ||
                "Impossible de charger votre profil enseignant."}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-slate-900 shadow-lg transition hover:bg-blue-50"
            >
              Réessayer
              <ArrowRight className="h-5 w-5" />
            </button>

          </div>
        </div>
      </div>
    );
  }

  /**
   * ==========================================================
   * INITIALS
   * ==========================================================
   */
  const initiales =
    `${profile.prenom?.charAt(0) || ""}${profile.nom?.charAt(0) || ""}`
      .toUpperCase();

  /**
   * ==========================================================
   * AFFICHAGE PRINCIPAL
   * ==========================================================
   */
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">

        {/* =====================================================
            BARRE SUPÉRIEURE
        ====================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <BookOpen className="h-6 w-6" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                CODE
              </p>

              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Espace enseignant
              </h2>
            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/enseignant/profil")
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <UserRound className="h-4 w-4" />
            Mon profil
          </button>

        </div>

        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="relative mb-10 overflow-hidden rounded-[2rem] border border-blue-900/40 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 shadow-2xl">

          {/* Décor */}

          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="pointer-events-none absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-cyan-400/5 blur-3xl" />

          <div className="relative p-6 md:p-8 lg:p-10">

            <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">

              {/* =================================================
                  PROFIL
              ================================================== */}

              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">

                {/* PHOTO */}

                <div className="relative shrink-0">

                  <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-[2rem] border-2 border-white/20 bg-white/10 shadow-2xl backdrop-blur-sm md:h-36 md:w-36">

                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={`${profile.prenom} ${profile.nom}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-black text-white">
                        {initiales}
                      </span>
                    )}

                  </div>

                  <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full border-4 border-slate-950 bg-emerald-500 shadow-lg">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>

                </div>

                {/* INFORMATIONS */}

                <div className="max-w-2xl text-center sm:text-left">

                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-300">

                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

                    Enseignant actif

                  </div>

                  <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl lg:text-5xl">

                    Bonjour,{" "}
                    <span className="text-blue-300">
                      {profile.prenom}
                    </span>{" "}
                    👋

                  </h1>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 md:text-base">
                    Bienvenue dans votre espace enseignant
                    <span className="font-bold text-white">
                      {" "}CODE
                    </span>.
                    Gérez vos activités pédagogiques,
                    consultez les questions des élèves et
                    retrouvez vos contenus.
                  </p>

                  {/* MATIÈRES */}

                  <div className="mt-6 flex flex-wrap justify-center gap-2 sm:justify-start">

                    {profile.subjects.length > 0 ? (
                      profile.subjects.map(
                        (subject) => (
                          <span
                            key={subject}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white backdrop-blur-sm"
                          >
                            <BookOpen className="h-4 w-4 text-blue-300" />
                            {subject}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-sm text-blue-200">
                        Aucune matière déclarée
                      </span>
                    )}

                  </div>




                  {/* =================================================
    BOUTON CONTINUER
================================================== */}

<div className="mt-7 flex justify-center sm:justify-start">
  <button
    type="button"
    onClick={() => navigate("/page2")}
    className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-7 py-3.5 text-sm font-black uppercase tracking-wide text-blue-900 shadow-xl shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-50 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-blue-950"
  >
    <span>CONTINUER</span>

    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white transition-all duration-300 group-hover:translate-x-1 group-hover:bg-blue-700">
      <ArrowRight className="h-4 w-4" />
    </span>
  </button>
</div>



                </div>
              </div>

              {/* =================================================
                  ACTIONS
              ================================================== */}

              <div className="flex shrink-0 flex-col gap-3">

                {/* PROFIL */}

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15">
                      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                        Statut du profil
                      </p>

                      <p className="mt-0.5 font-black text-white">
                        Profil validé
                      </p>
                    </div>

                  </div>

                </div>

                {/* ADMINISTRATION */}

                {user?.is_admin === true && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/liste-inscrits")
                    }
                    className="group flex items-center gap-3 rounded-2xl bg-white px-4 py-4 text-left shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-blue-50"
                  >

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                      <ShieldCheck className="h-6 w-6 text-blue-700" />
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-[11px] font-black uppercase tracking-wider text-blue-600">
                        Administration
                      </p>

                      <p className="text-sm font-black text-slate-900">
                        Espace administrateur
                      </p>

                    </div>

                    <ArrowRight className="h-5 w-5 shrink-0 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-blue-600" />

                  </button>
                )}

              </div>

            </div>
          </div>
        </section>

        {/* =====================================================
            TITRE ACTIVITÉS
        ====================================================== */}

        <section className="mb-10">

          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">

            <div>

              <div className="mb-2 inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400">
                <Sparkles className="h-4 w-4" />
                Tableau de bord
              </div>

              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white md:text-3xl">
                Mes activités
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Retrouvez rapidement les principales
                fonctionnalités de votre espace enseignant.
              </p>

            </div>

          </div>

          {/* =================================================
              CARTES
          ================================================== */}

          <div className="grid gap-5 md:grid-cols-2">

            {/* QUESTIONS */}

            <button
              type="button"
              onClick={() =>
                navigate("/enseignant/questions")
              }
              className="group relative overflow-hidden rounded-[1.75rem] border border-blue-100 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >

              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-500/5 transition group-hover:bg-blue-500/10" />

              <div className="relative p-6 md:p-7">

                <div className="flex items-start justify-between">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950/60">
                    <MessageCircle className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 transition group-hover:bg-blue-50 dark:bg-slate-800 dark:group-hover:bg-blue-950/50">
                    <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
                  </div>

                </div>

                <h3 className="mt-6 text-xl font-black text-slate-900 dark:text-white">
                  Questions des élèves
                </h3>

                <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Consultez les questions qui vous sont
                  adressées et répondez directement aux élèves.
                </p>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-black text-blue-600 dark:text-blue-400">
                  Accéder aux questions
                  <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>

              </div>
            </button>

            {/* MATIÈRES */}

            <div className="relative overflow-hidden rounded-[1.75rem] border border-indigo-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-indigo-500/5" />

              <div className="relative p-6 md:p-7">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950/60">
                  <BookOpen className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                </div>

                <h3 className="mt-6 text-xl font-black text-slate-900 dark:text-white">
                  Mes matières
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Les matières que vous êtes habilité à enseigner
                  sur la plateforme.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">

                  {profile.subjects.length > 0 ? (
                    profile.subjects.map(
                      (subject) => (
                        <span
                          key={subject}
                          className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                        >
                          <BookOpen className="h-4 w-4" />
                          {subject}
                        </span>
                      )
                    )
                  ) : (
                    <span className="text-sm text-slate-400">
                      Aucune matière déclarée.
                    </span>
                  )}

                </div>

              </div>
            </div>

            {/* CONTENUS */}

            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("mes-contenus")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
              className="group relative overflow-hidden rounded-[1.75rem] border border-violet-100 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >

              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-violet-500/5 transition group-hover:bg-violet-500/10" />

              <div className="relative p-6 md:p-7">

                <div className="flex items-start justify-between">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-950/60">
                    <Video className="h-7 w-7 text-violet-600 dark:text-violet-400" />
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800">
                    <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-violet-600" />
                  </div>

                </div>

                <h3 className="mt-6 text-xl font-black text-slate-900 dark:text-white">
                  Mes contenus
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Retrouvez les vidéos et ressources
                  pédagogiques associées à votre profil.
                </p>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-black text-violet-600 dark:text-violet-400">
                  Consulter mes contenus
                  <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>

              </div>
            </button>

            {/* STATISTIQUES */}

            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("statistiques")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
              className="group relative overflow-hidden rounded-[1.75rem] border border-emerald-100 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >

              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-500/5 transition group-hover:bg-emerald-500/10" />

              <div className="relative p-6 md:p-7">

                <div className="flex items-start justify-between">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60">
                    <BarChart3 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800">
                    <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-600" />
                  </div>

                </div>

                <h3 className="mt-6 text-xl font-black text-slate-900 dark:text-white">
                  Statistiques
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Consultez progressivement les performances
                  de vos contenus et l'activité des élèves.
                </p>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-black text-emerald-600 dark:text-emerald-400">
                  Voir les statistiques
                  <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>

              </div>
            </button>

          </div>
        </section>

        {/* =====================================================
            STATISTIQUES
        ====================================================== */}

        <section
          id="statistiques"
          className="mb-10"
        >

          <div className="mb-6">

            <h2 className="text-2xl font-black text-slate-900 dark:text-white md:text-3xl">
              Statistiques
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Les statistiques détaillées seront disponibles
              lorsque les données correspondantes seront
              connectées au système.
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* ÉLÈVES */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500 dark:text-slate-400">
                Élèves accompagnés
              </p>

              <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
                —
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Données en préparation
              </p>

            </div>

            {/* VUES */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950/50">
                <Eye className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500 dark:text-slate-400">
                Vues
              </p>

              <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
                —
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Données en préparation
              </p>

            </div>

            {/* VIDÉOS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/50">
                <FileVideo className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500 dark:text-slate-400">
                Vidéos
              </p>

              <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
                {videos.length}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Vidéos associées au profil
              </p>

            </div>

            {/* QUESTIONS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/50">
                <MessageCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500 dark:text-slate-400">
                Questions
              </p>

              <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
                —
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Données en préparation
              </p>

            </div>

          </div>
        </section>

        {/* =====================================================
            MES CONTENUS
        ====================================================== */}

        <section
          id="mes-contenus"
          className="mb-10"
        >

          <div className="mb-6">

            <h2 className="text-2xl font-black text-slate-900 dark:text-white md:text-3xl">
              Mes vidéos
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Les vidéos qui seront associées à votre profil
              apparaîtront automatiquement ici.
            </p>

          </div>

          {loadingVideos ? (

            <div className="flex items-center justify-center rounded-[1.75rem] border border-slate-200 bg-white p-12 dark:border-slate-800 dark:bg-slate-900">

              <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Chargement des vidéos...
              </div>

            </div>

          ) : videos.length > 0 ? (

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {videos.map((video) => (

                <article
                  key={video.id}
                  className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                >

                  <div className="relative aspect-video bg-slate-950">

                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <PlayCircle className="h-16 w-16 text-white/80" />
                      </div>
                    )}

                    {video.duration && (
                      <span className="absolute bottom-3 right-3 rounded-lg bg-black/75 px-2.5 py-1 text-xs font-bold text-white">
                        {video.duration}
                      </span>
                    )}

                  </div>

                  <div className="p-5">

                    <h3 className="font-black text-slate-900 dark:text-white">
                      {video.title}
                    </h3>

                    {video.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {video.description}
                      </p>
                    )}

                    <div className="mt-5 flex items-center justify-between text-xs">

                      <span className="inline-flex items-center gap-1.5 text-slate-400">
                        <Eye className="h-4 w-4" />
                        {video.views ?? 0} vues
                      </span>

                      {video.video_url && (
                        <a
                          href={video.video_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 font-black text-violet-600 dark:text-violet-400"
                        >
                          Voir
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      )}

                    </div>

                  </div>

                </article>

              ))}

            </div>

          ) : (

            <div className="relative overflow-hidden rounded-[2rem] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-8 dark:border-violet-900/40 dark:from-violet-950/20 dark:via-slate-900 dark:to-indigo-950/20 md:p-10">

              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

              <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:text-left">

                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] bg-white shadow-sm dark:bg-slate-900">

                  <Video className="h-9 w-9 text-violet-600 dark:text-violet-400" />

                </div>

                <div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Aucun contenu vidéo pour le moment
                  </h3>

                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                    Lorsque des vidéos seront associées à
                    votre adresse email par CODE, elles
                    apparaîtront automatiquement dans cette
                    section.
                  </p>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
                    <Clock3 className="h-3.5 w-3.5" />
                    Fonctionnalité en préparation
                  </div>

                </div>

              </div>

            </div>

          )}

        </section>

        {/* =====================================================
            QUESTIONS RÉCENTES
        ====================================================== */}

        <section className="mb-10">

          <div className="mb-6">

            <h2 className="text-2xl font-black text-slate-900 dark:text-white md:text-3xl">
              Questions des élèves
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Accédez à toutes les questions qui vous sont
              adressées.
            </p>

          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <button
              type="button"
              onClick={() =>
                navigate("/enseignant/questions")
              }
              className="group w-full p-5 text-left transition hover:bg-blue-50/60 dark:hover:bg-blue-950/20 md:p-6"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950/60">
                  <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>

                <div className="min-w-0 flex-1">

                  <div className="flex flex-wrap items-center gap-2">

                    <span className="font-black text-slate-900 dark:text-white">
                      Voir mes questions
                    </span>

                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                      Questions reçues
                    </span>

                  </div>

                  <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Consultez les questions des élèves,
                    ouvrez chaque conversation et répondez
                    directement.
                  </p>

                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800">

                  <ChevronRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />

                </div>

              </div>

            </button>

            <div className="border-t border-slate-100 p-8 text-center dark:border-slate-800">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                <Clock3 className="h-7 w-7 text-slate-400 dark:text-slate-600" />
              </div>

              <p className="mt-4 font-bold text-slate-700 dark:text-slate-300">
                Les questions récentes seront intégrées ici.
              </p>

              <p className="mx-auto mt-1 max-w-xl text-sm leading-6 text-slate-400">
                En attendant, utilisez le bouton ci-dessus
                pour accéder à la liste complète des questions
                qui vous sont adressées.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/enseignant/questions")
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Accéder aux questions
                <ArrowRight className="h-4 w-4" />
              </button>

            </div>

          </div>
        </section>

        {/* =====================================================
            INFORMATIONS
        ====================================================== */}

        <section>

          <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 shadow-xl">

            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-5 p-6 md:flex-row md:items-start md:p-8">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10">
                <Settings className="h-6 w-6 text-blue-400" />
              </div>

              <div>

                <h3 className="text-lg font-black text-white">
                  Votre espace enseignant évoluera progressivement
                </h3>

                <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-300">
                  De nouvelles fonctionnalités seront ajoutées
                  progressivement à CODE afin de vous permettre
                  de gérer vos contenus pédagogiques, suivre
                  l'activité des élèves, consulter vos statistiques
                  et développer votre activité d'enseignement.
                </p>

              </div>

            </div>

          </div>

        </section>

      </div>
    </div>
  );
};

export default Enseignant;