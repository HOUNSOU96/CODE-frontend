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
  ShieldCheck,
  Users,
  Video,
  UserRound,
  Sparkles,
  X,
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

type SectionId =
  | "questions"
  | "subjects"
  | "contents"
  | "statistics";

const Enseignant: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] =
    useState<TeacherProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [activeSection, setActiveSection] =
    useState<SectionId | null>(null);

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
   * OUVERTURE DES SECTIONS
   * ==========================================================
   */
  const handleSectionClick = (
    section: SectionId
  ) => {
    /*
     * ========================================================
     * MES CONTENUS
     * ========================================================
     *
     * Cette rubrique possède maintenant sa propre page :
     * MesVideos.tsx
     */
    if (section === "contents") {
      navigate("/enseignant/mes-videos");
      return;
    }

    setActiveSection(section);
  };

  /**
   * ==========================================================
   * CHARGEMENT
   * ==========================================================
   */
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center">

          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200 bg-blue-100 shadow-sm dark:border-blue-900/50 dark:bg-blue-950/50">

            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />

          </div>

          <p className="mt-5 text-sm font-semibold text-slate-600 dark:text-slate-300">
            Chargement de votre espace enseignant...
          </p>

          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
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

        <div className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">

          <div className="p-8 text-center md:p-10">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-500/10">

              <MessageCircle className="h-8 w-8 text-red-500 dark:text-red-400" />

            </div>

            <h1 className="mt-6 text-2xl font-black text-slate-900 dark:text-white">
              Espace enseignant
            </h1>

            <p className="mt-3 leading-7 text-red-600 dark:text-red-200">
              {error ||
                "Impossible de charger votre profil enseignant."}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg transition hover:bg-blue-700"
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
   * BOUTON DE SECTION
   * ==========================================================
   */
  const SectionButton = ({
    id,
    icon,
    title,
    description,
    color,
    onClick,
  }: {
    id: SectionId;
    icon: React.ReactNode;
    title: string;
    description: string;
    color:
      | "blue"
      | "indigo"
      | "violet"
      | "emerald";
    onClick: () => void;
  }) => {
    const isActive = activeSection === id;

    const styles = {
      blue: {
        wrapper: isActive
          ? "border-blue-300 bg-blue-50 shadow-lg shadow-blue-500/10 dark:border-blue-400/40 dark:bg-blue-500/15"
          : "border-blue-200 bg-white/85 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-400/20 dark:bg-white/[0.05] dark:hover:border-blue-400/40 dark:hover:bg-blue-500/10",

        icon: "bg-blue-100 text-blue-700 border-blue-200 dark:border-blue-400/20 dark:bg-blue-400/15 dark:text-blue-300",
      },

      indigo: {
        wrapper: isActive
          ? "border-indigo-300 bg-indigo-50 shadow-lg shadow-indigo-500/10 dark:border-indigo-400/40 dark:bg-indigo-500/15"
          : "border-indigo-200 bg-white/85 hover:border-indigo-300 hover:bg-indigo-50 dark:border-indigo-400/20 dark:bg-white/[0.05] dark:hover:border-indigo-400/40 dark:hover:bg-indigo-500/10",

        icon: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:border-indigo-400/20 dark:bg-indigo-400/15 dark:text-indigo-300",
      },

      violet: {
        wrapper: isActive
          ? "border-violet-300 bg-violet-50 shadow-lg shadow-violet-500/10 dark:border-violet-400/40 dark:bg-violet-500/15"
          : "border-violet-200 bg-white/85 hover:border-violet-300 hover:bg-violet-50 dark:border-violet-400/20 dark:bg-white/[0.05] dark:hover:border-violet-400/40 dark:hover:bg-violet-500/10",

        icon: "bg-violet-100 text-violet-700 border-violet-200 dark:border-violet-400/20 dark:bg-violet-400/15 dark:text-violet-300",
      },

      emerald: {
        wrapper: isActive
          ? "border-emerald-300 bg-emerald-50 shadow-lg shadow-emerald-500/10 dark:border-emerald-400/40 dark:bg-emerald-500/15"
          : "border-emerald-200 bg-white/85 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-400/20 dark:bg-white/[0.05] dark:hover:border-emerald-400/40 dark:hover:bg-emerald-500/10",

        icon: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:border-emerald-400/20 dark:bg-emerald-400/15 dark:text-emerald-300",
      },
    };

    const current = styles[color];

    return (
      <button
        type="button"
        onClick={onClick}
        className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${current.wrapper}`}
      >

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${current.icon}`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">

          <h3 className="font-black text-slate-900 dark:text-white">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
            {description}
          </p>

        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-500 transition group-hover:bg-white group-hover:text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:group-hover:bg-white/10 dark:group-hover:text-white">

          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />

        </div>

      </button>
    );
  };

  /**
   * ==========================================================
   * RENDU PRINCIPAL
   * ==========================================================
   */
  return (
    <div className="min-h-screen bg-transparent pb-16">

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

        </div>

        {/* =====================================================
            BOUTON MON PROFIL FLOTTANT
        ====================================================== */}

        <button
          type="button"
          onClick={() =>
            navigate("/enseignant/profil")
          }
          className="group fixed right-5 top-5 z-[90] inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-2xl dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-200 dark:hover:border-blue-500/50 dark:hover:bg-slate-800 dark:hover:text-blue-300"
        >
          <UserRound className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
          Mon profil
        </button>

        {/* =====================================================
            SECTION PRINCIPALE
        ====================================================== */}

        <section className="relative mb-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-50 shadow-2xl dark:border-blue-900/40 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">

          {/* DÉCOR */}

          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="pointer-events-none absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-cyan-400/5 blur-3xl" />

          <div className="relative p-6 md:p-8 lg:p-10">

            {/* =================================================
                PROFIL
            ================================================== */}

            <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">

              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">

                {/* PHOTO */}

                <div className="relative shrink-0">

                  <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-[2rem] border-2 border-slate-200 bg-white shadow-2xl dark:border-white/20 dark:bg-white/10 md:h-36 md:w-36">

                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={`${profile.prenom} ${profile.nom}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-black text-blue-700 dark:text-white">
                        {initiales}
                      </span>
                    )}

                  </div>

                  <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-emerald-500 shadow-lg dark:border-slate-950">

                    <CheckCircle2 className="h-5 w-5 text-white" />

                  </div>

                </div>

                {/* INFORMATIONS */}

                <div className="max-w-2xl text-center sm:text-left">

                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300">

                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 dark:bg-emerald-400" />

                    Enseignant actif

                  </div>

                  <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl lg:text-5xl">

                    Bonjour,{" "}
                    <span className="text-blue-600 dark:text-blue-300">
                      {profile.prenom}
                    </span>{" "}
                    👋

                  </h1>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-blue-100 md:text-base">

                    Bienvenue dans votre espace enseignant{" "}
                    <span className="font-bold text-slate-900 dark:text-white">
                      CODE
                    </span>
                    . Gérez vos activités pédagogiques,
                    consultez les questions des élèves et
                    retrouvez vos contenus.

                  </p>

                </div>

              </div>

              {/* =================================================
                  STATUT + ADMINISTRATION
              ================================================== */}

              <div className="flex shrink-0 flex-col gap-3">

                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/10">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/15">

                      <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />

                    </div>

                    <div>

                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-blue-200">
                        Statut du profil
                      </p>

                      <p className="mt-0.5 font-black text-slate-900 dark:text-white">
                        Profil validé
                      </p>

                    </div>

                  </div>

                </div>

                {user?.is_admin === true && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/liste-inscrits")
                    }
                    className="group flex items-center gap-3 rounded-2xl bg-white px-4 py-4 text-left shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-blue-50 dark:bg-white dark:hover:bg-blue-50"
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

            {/* =================================================
                BOUTONS PRINCIPAUX
            ================================================== */}

            <div className="mt-10 border-t border-slate-200/80 pt-8 dark:border-white/10">

              <div className="mb-5">

                <div className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-300">

                  <Sparkles className="h-4 w-4" />

                  Tableau de bord

                </div>

                <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white md:text-2xl">
                  Que souhaitez-vous consulter ?
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-blue-100/70">
                  Choisissez directement une rubrique de votre
                  espace enseignant.
                </p>

              </div>

              <div className="grid gap-3 md:grid-cols-2">

                <SectionButton
                  id="questions"
                  icon={
                    <MessageCircle className="h-6 w-6" />
                  }
                  title="Questions des élèves"
                  description="Consulter et répondre aux questions qui vous sont adressées."
                  color="blue"
                  onClick={() =>
                    handleSectionClick("questions")
                  }
                />

                <SectionButton
                  id="subjects"
                  icon={
                    <BookOpen className="h-6 w-6" />
                  }
                  title="Mes matières"
                  description="Voir les matières que vous êtes habilité à enseigner sur CODE."
                  color="indigo"
                  onClick={() =>
                    handleSectionClick("subjects")
                  }
                />

                <SectionButton
                  id="contents"
                  icon={
                    <Video className="h-6 w-6" />
                  }
                  title="Mes contenus"
                  description="Retrouver toutes les vidéos associées à votre adresse email."
                  color="violet"
                  onClick={() =>
                    handleSectionClick("contents")
                  }
                />

                <SectionButton
                  id="statistics"
                  icon={
                    <BarChart3 className="h-6 w-6" />
                  }
                  title="Statistiques"
                  description="Consulter progressivement les performances de vos contenus et l'activité des élèves."
                  color="emerald"
                  onClick={() =>
                    handleSectionClick("statistics")
                  }
                />

              </div>

            </div>

          </div>
        </section>

        {/* =====================================================
            MODALE PRINCIPALE
        ====================================================== */}

        {activeSection && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md"
            onClick={() =>
              setActiveSection(null)
            }
          >

            <div
              className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-950"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              {/* EN-TÊTE MODALE */}

              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/95 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/95 md:px-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10">

                    {activeSection === "questions" && (
                      <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    )}

                    {activeSection === "subjects" && (
                      <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    )}

                    {activeSection === "statistics" && (
                      <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    )}

                  </div>

                  <div>

                    <h2 className="font-black text-slate-900 dark:text-white">

                      {activeSection === "questions" &&
                        "Questions des élèves"}

                      {activeSection === "subjects" &&
                        "Mes matières"}

                      {activeSection === "statistics" &&
                        "Statistiques"}

                    </h2>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Espace enseignant CODE
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setActiveSection(null)
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

              {/* CONTENU MODALE */}

              <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-5 md:p-7">

                {/* =================================================
                    QUESTIONS
                ================================================== */}

                {activeSection === "questions" && (
                  <div>

                    <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 dark:border-blue-900/40 dark:bg-blue-950/20">

                      <div className="flex items-start gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/60">

                          <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />

                        </div>

                        <div>

                          <h3 className="font-black text-slate-900 dark:text-white">
                            Questions des élèves
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                            Accédez aux questions qui vous sont
                            adressées, ouvrez les conversations et
                            répondez directement aux élèves.
                          </p>

                        </div>

                      </div>

                    </div>

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-900">

                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950/60">

                        <Clock3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />

                      </div>

                      <h3 className="mt-5 font-black text-slate-900 dark:text-white">
                        Accédez à vos questions
                      </h3>

                      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">
                        La liste complète des questions reçues
                        est disponible dans votre espace dédié.
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            "/enseignant/questions"
                          )
                        }
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                      >
                        Accéder aux questions

                        <ArrowRight className="h-4 w-4" />

                      </button>

                    </div>

                  </div>
                )}

                {/* =================================================
                    MATIÈRES
                ================================================== */}

                {activeSection === "subjects" && (
                  <div>

                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5 dark:border-indigo-900/40 dark:bg-indigo-950/20">

                      <div className="flex items-start gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/60">

                          <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />

                        </div>

                        <div>

                          <h3 className="font-black text-slate-900 dark:text-white">
                            Mes matières
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                            Voici les matières actuellement
                            associées à votre profil enseignant.
                          </p>

                        </div>

                      </div>

                    </div>

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">

                      {profile.subjects.length > 0 ? (
                        <div className="flex flex-wrap gap-3">

                          {profile.subjects.map(
                            (subject) => (
                              <div
                                key={subject}
                                className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-3 text-sm font-bold text-indigo-700 shadow-sm dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-300"
                              >

                                <BookOpen className="h-4 w-4" />

                                {subject}

                              </div>
                            )
                          )}

                        </div>
                      ) : (
                        <div className="py-8 text-center">

                          <BookOpen className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700" />

                          <p className="mt-4 font-bold text-slate-600 dark:text-slate-400">
                            Aucune matière déclarée.
                          </p>

                        </div>
                      )}

                    </div>

                  </div>
                )}

                {/* =================================================
                    STATISTIQUES
                ================================================== */}

                {activeSection === "statistics" && (
                  <div>

                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20">

                      <div className="flex items-start gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60">

                          <BarChart3 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />

                        </div>

                        <div>

                          <h3 className="font-black text-slate-900 dark:text-white">
                            Statistiques
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                            Les statistiques détaillées seront
                            disponibles lorsque les données
                            correspondantes seront connectées
                            au système.
                          </p>

                        </div>

                      </div>

                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">

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

                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
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

                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
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
                          —
                        </p>

                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                          Consultez vos contenus dans « Mes contenus »
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

                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                          Données en préparation
                        </p>

                      </div>

                    </div>

                  </div>
                )}

              </div>

            </div>
          </div>
        )}

        {/* =====================================================
            BOUTON CONTINUER — TOUT EN BAS
        ====================================================== */}

        <div className="mt-8 flex justify-center pb-4">

          <button
            type="button"
            onClick={() =>
              navigate("/page2")
            }
            className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-8 py-4 text-base font-black text-white shadow-xl shadow-blue-600/20 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-2xl"
          >
            CONTINUER

            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />

          </button>

        </div>

      </div>
    </div>
  );
};

export default Enseignant;