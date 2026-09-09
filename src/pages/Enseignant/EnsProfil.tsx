import React, { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaGlobeAfrica,
  FaBook,
  FaUserTie,
  FaCheckCircle,
  FaGraduationCap,
  FaWhatsapp,
  FaShieldAlt,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaTimes,
} from "react-icons/fa";

import api from "../../utils/axios";

interface TeacherProfile {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  pays_residence?: string | null;
  subjects?: string[];
  teacher_photo?: string | null;
}

const EnsProfil: React.FC = () => {
  const navigate = useNavigate();

  const { email } = useParams<{ email: string }>();

  const [profile, setProfile] =
    useState<TeacherProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  // Affichage de la photo en grand
  const [showPhoto, setShowPhoto] =
    useState(false);

  // ==========================================================
  // RÉCUPÉRATION DU PROFIL ENSEIGNANT
  // ==========================================================

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      if (!email) {
        setError(
          "Adresse email de l'enseignant introuvable."
        );

        setLoading(false);

        return;
      }

      try {
        setLoading(true);

        setError(null);

        const response = await api.get(
          "/api/teacher/public-profile",
          {
            params: {
              email: decodeURIComponent(email),
            },
          }
        );

        setProfile(response.data);

      } catch (err: any) {
        console.error(
          "Erreur lors de la récupération du profil enseignant :",
          err
        );

        setError(
          err?.response?.data?.detail ||
            "Impossible de récupérer le profil de cet enseignant."
        );

      } finally {
        setLoading(false);
      }
    };

    fetchTeacherProfile();

  }, [email]);

  // ==========================================================
  // CONSTRUIRE L'URL COMPLÈTE DE LA PHOTO
  // ==========================================================

  const getPhotoUrl = (
    photo?: string | null
  ): string | null => {
    if (!photo) {
      return null;
    }

    if (/^https?:\/\//i.test(photo)) {
      return photo;
    }

    const baseURL =
      api.defaults.baseURL;

    if (baseURL) {
      const normalizedBase =
        baseURL.endsWith("/api")
          ? baseURL.slice(0, -4)
          : baseURL;

      return `${normalizedBase.replace(
        /\/$/,
        ""
      )}/${photo.replace(/^\//, "")}`;
    }

    return photo;
  };

  // ==========================================================
  // RETOUR VERS LA PAGE PRÉCÉDENTE
  // ==========================================================

  const handleBack = () => {
    navigate(-1);
  };

  // ==========================================================
  // CHARGEMENT
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">

        <div className="w-full max-w-md">

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center">

            <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center animate-pulse">

              <FaChalkboardTeacher className="text-white text-2xl" />

            </div>

            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              Chargement du profil
            </h2>

            <p className="text-slate-500 dark:text-slate-400">
              Nous récupérons les informations de l'enseignant...
            </p>

            <div className="mt-6 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">

              <div className="h-full w-1/2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse" />

            </div>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================================
  // ERREUR
  // ==========================================================

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">

        <div className="w-full max-w-lg">

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-red-200 dark:border-red-900/40 p-8 text-center">

            <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">

              <FaUserTie className="text-red-500 text-3xl" />

            </div>

            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
              Profil indisponible
            </h2>

            <p className="text-slate-500 dark:text-slate-400 mb-8">
              {error ||
                "Le profil de cet enseignant n'est pas disponible."}
            </p>

            <button
              type="button"
              onClick={handleBack}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-6
                py-3
                rounded-xl
                bg-gradient-to-r
                from-blue-600
                to-indigo-600
                hover:from-blue-700
                hover:to-indigo-700
                text-white
                font-semibold
                shadow-lg
                shadow-blue-500/20
                transition-all
                duration-200
                hover:-translate-y-0.5
              "
            >
              <FaArrowLeft />
              Retour
            </button>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================================
  // DONNÉES DU PROFIL
  // ==========================================================

  const fullName =
    `${profile.prenom} ${profile.nom}`.trim();

  const photoUrl =
    getPhotoUrl(profile.teacher_photo);

  const subjects =
    profile.subjects &&
    profile.subjects.length > 0
      ? profile.subjects
      : [];

  // Nettoyage du numéro pour WhatsApp
  const whatsappNumber =
    profile.telephone
      ? profile.telephone.replace(/[^\d]/g, "")
      : "";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* =====================================================
          HEADER / NAVIGATION
      ===================================================== */}

      <div className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          <button
            type="button"
            onClick={handleBack}
            className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2.5
              rounded-xl
              text-slate-700
              dark:text-slate-200
              hover:bg-slate-100
              dark:hover:bg-slate-800
              font-semibold
              text-sm
              transition-all
              duration-200
              group
            "
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />

            <span>
              Retour à la remédiation
            </span>

          </button>

          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">

            <FaGraduationCap className="text-blue-500" />

            <span>
              Espace enseignant CODE
            </span>

          </div>

        </div>

      </div>

      {/* =====================================================
          CONTENU PRINCIPAL
      ===================================================== */}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        {/* ===================================================
            BANNIÈRE
        =================================================== */}

        <section className="relative overflow-hidden rounded-3xl shadow-2xl mb-8">

          <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800" />

          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative px-6 sm:px-10 lg:px-14 py-10 sm:py-14">

            <div className="flex flex-col lg:flex-row lg:items-center gap-8">

              {/* =================================================
                  PHOTO
              ================================================= */}

              <div className="flex justify-center lg:justify-start shrink-0">

                {photoUrl ? (

                  <button
                    type="button"
                    onClick={() =>
                      setShowPhoto(true)
                    }
                    className="
                      group
                      relative
                      w-36
                      h-36
                      sm:w-44
                      sm:h-44
                      rounded-full
                      overflow-hidden
                      border-4
                      border-white/80
                      shadow-2xl
                      focus:outline-none
                      focus:ring-4
                      focus:ring-white/30
                    "
                    aria-label={`Afficher la photo complète de ${fullName}`}
                  >

                    <img
                      src={photoUrl}
                      alt={`Photo de ${fullName}`}
                      className="
                        w-full
                        h-full
                        object-cover
                        transition-transform
                        duration-500
                        group-hover:scale-110
                      "
                    />

                    <div
                      className="
                        absolute
                        inset-0
                        bg-black/0
                        group-hover:bg-black/35
                        transition-all
                        duration-300
                        flex
                        items-center
                        justify-center
                      "
                    >

                      <span
                        className="
                          opacity-0
                          group-hover:opacity-100
                          text-white
                          text-sm
                          font-semibold
                          px-3
                          py-2
                          rounded-lg
                          bg-black/40
                          backdrop-blur-sm
                          transition-opacity
                        "
                      >
                        Voir la photo
                      </span>

                    </div>

                  </button>

                ) : (

                  <div
                    className="
                      w-36
                      h-36
                      sm:w-44
                      sm:h-44
                      rounded-full
                      bg-white/15
                      border-4
                      border-white/40
                      flex
                      items-center
                      justify-center
                      shadow-2xl
                    "
                  >
                    <FaUserTie className="text-white/80 text-5xl" />
                  </div>

                )}

              </div>

              {/* =================================================
                  INFORMATIONS PRINCIPALES
              ================================================= */}

              <div className="text-center lg:text-left text-white flex-1">

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-4">

                  <FaChalkboardTeacher className="text-cyan-200" />

                  <span className="text-xs sm:text-sm font-semibold tracking-wide">
                    ENSEIGNANT CODE
                  </span>

                </div>

                <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-3">

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                    {fullName}
                  </h1>

                  <span className="inline-flex items-center justify-center gap-1.5 self-center lg:self-auto px-3 py-1.5 rounded-full bg-emerald-400/20 border border-emerald-300/30 text-emerald-100 text-xs font-bold">

                    <FaCheckCircle />

                    Profil vérifié

                  </span>

                </div>

                <p className="text-blue-100 max-w-2xl text-sm sm:text-base leading-relaxed">

                  Retrouvez les informations de cet enseignant
                  et les matières qu'il propose aux apprenants
                  sur la plateforme CODE.

                </p>

                <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-3">

                  {subjects.length > 0 && (

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm text-sm">

                      <FaBook className="text-cyan-200" />

                      <span>
                        {subjects.length} matière
                        {subjects.length > 1
                          ? "s"
                          : ""}
                      </span>

                    </div>

                  )}

                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm text-sm">

                    <FaShieldAlt className="text-emerald-200" />

                    <span>
                      Enseignant actif
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ===================================================
            GRILLE PRINCIPALE
        =================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* =================================================
              COLONNE PRINCIPALE
          ================================================= */}

          <div className="lg:col-span-2 space-y-8">

            {/* =================================================
                À PROPOS
            ================================================= */}

            <section className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">

              <div className="p-6 sm:p-8">

                <div className="flex items-center gap-4 mb-6">

                  <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">

                    <FaUserTie className="text-blue-600 dark:text-blue-400 text-xl" />

                  </div>

                  <div>

                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
                      À propos de l'enseignant
                    </h2>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Informations générales
                    </p>

                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* =================================================
                      NOM
                  ================================================= */}

                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-5 border border-slate-100 dark:border-slate-700">

                    <div className="flex items-center gap-3 mb-3">

                      <FaUserTie className="text-blue-500" />

                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Nom
                      </span>

                    </div>

                    <p className="font-semibold text-slate-800 dark:text-white">
                      {profile.nom ||
                        "Non renseigné"}
                    </p>

                  </div>

                  {/* =================================================
                      PRÉNOM
                  ================================================= */}

                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-5 border border-slate-100 dark:border-slate-700">

                    <div className="flex items-center gap-3 mb-3">

                      <FaUserGraduate className="text-indigo-500" />

                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Prénom
                      </span>

                    </div>

                    <p className="font-semibold text-slate-800 dark:text-white">
                      {profile.prenom ||
                        "Non renseigné"}
                    </p>

                  </div>

                  {/* =================================================
                      EMAIL
                  ================================================= */}

                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-5 border border-slate-100 dark:border-slate-700 sm:col-span-2">

                    <div className="flex items-center gap-3 mb-3">

                      <FaEnvelope className="text-purple-500" />

                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Adresse email
                      </span>

                    </div>

                    {profile.email ? (

                      <a
                        href={`mailto:${profile.email}`}
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:underline break-all"
                      >
                        {profile.email}
                      </a>

                    ) : (

                      <p className="text-slate-400 dark:text-slate-500">
                        Non renseigné
                      </p>

                    )}

                  </div>

                  {/* =================================================
                      TÉLÉPHONE
                  ================================================= */}

                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-5 border border-slate-100 dark:border-slate-700">

                    <div className="flex items-center gap-3 mb-3">

                      <FaPhone className="text-emerald-500" />

                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Téléphone
                      </span>

                    </div>

                    {profile.telephone ? (

                      <a
                        href={`tel:${profile.telephone}`}
                        className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline break-all"
                      >
                        {profile.telephone}
                      </a>

                    ) : (

                      <p className="text-slate-400 dark:text-slate-500">
                        Non renseigné
                      </p>

                    )}

                  </div>

                  {/* =================================================
                      PAYS
                  ================================================= */}

                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-5 border border-slate-100 dark:border-slate-700">

                    <div className="flex items-center gap-3 mb-3">

                      <FaGlobeAfrica className="text-orange-500" />

                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Pays de résidence
                      </span>

                    </div>

                    <p className="font-semibold text-slate-800 dark:text-white">

                      {profile.pays_residence ||
                        "Non renseigné"}

                    </p>

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                MATIÈRES
            ================================================= */}

            <section className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">

              <div className="p-6 sm:p-8">

                <div className="flex items-center gap-4 mb-6">

                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">

                    <FaBook className="text-indigo-600 dark:text-indigo-400 text-xl" />

                  </div>

                  <div>

                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
                      Matières enseignées
                    </h2>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Domaines proposés sur CODE
                    </p>

                  </div>

                </div>

                {subjects.length > 0 ? (

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {subjects.map(
                      (subject, index) => (

                        <div
                          key={`${subject}-${index}`}
                          className="
                            group
                            relative
                            overflow-hidden
                            rounded-2xl
                            border
                            border-slate-200
                            dark:border-slate-700
                            bg-slate-50
                            dark:bg-slate-800/60
                            p-5
                            transition-all
                            duration-300
                            hover:-translate-y-1
                            hover:shadow-lg
                          "
                        >

                          <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-indigo-500/5 -translate-y-8 translate-x-8" />

                          <div className="relative flex items-center gap-4">

                            <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">

                              <FaBook className="text-indigo-600 dark:text-indigo-400" />

                            </div>

                            <div>

                              <p className="font-bold text-slate-800 dark:text-white">
                                {subject}
                              </p>

                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                Matière enseignée
                              </p>

                            </div>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                ) : (

                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">

                    <FaBook className="mx-auto text-slate-300 dark:text-slate-600 text-3xl mb-3" />

                    <p className="text-slate-500 dark:text-slate-400">
                      Aucune matière déclarée pour le moment.
                    </p>

                  </div>

                )}

              </div>

            </section>

          </div>

          {/* =================================================
              COLONNE LATÉRALE
          ================================================= */}

          <aside className="space-y-6">

            {/* =================================================
                CONTACT
            ================================================= */}

            <section className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">

              <div className="p-6">

                <div className="flex items-center gap-3 mb-6">

                  <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">

                    <FaEnvelope className="text-emerald-600 dark:text-emerald-400" />

                  </div>

                  <div>

                    <h3 className="font-bold text-slate-800 dark:text-white">
                      Contacter
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Informations de contact
                    </p>

                  </div>

                </div>

                <div className="space-y-3">

                  {/* =================================================
                      EMAIL
                  ================================================= */}

                  <a
                    href={`mailto:${profile.email}`}
                    className="
                      flex
                      items-center
                      gap-3
                      w-full
                      px-4
                      py-3
                      rounded-xl
                      bg-slate-50
                      dark:bg-slate-800
                      hover:bg-blue-50
                      dark:hover:bg-blue-900/20
                      text-slate-700
                      dark:text-slate-200
                      transition-colors
                    "
                  >

                    <FaEnvelope className="text-blue-500 shrink-0" />

                    <div className="min-w-0">

                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Email
                      </p>

                      <span className="text-sm font-medium break-all">
                        {profile.email}
                      </span>

                    </div>

                  </a>

                  {/* =================================================
                      TÉLÉPHONE
                  ================================================= */}

                  {profile.telephone && (

                    <a
                      href={`tel:${profile.telephone}`}
                      className="
                        flex
                        items-center
                        gap-3
                        w-full
                        px-4
                        py-3
                        rounded-xl
                        bg-slate-50
                        dark:bg-slate-800
                        hover:bg-emerald-50
                        dark:hover:bg-emerald-900/20
                        text-slate-700
                        dark:text-slate-200
                        transition-colors
                      "
                    >

                      <FaPhone className="text-emerald-500 shrink-0" />

                      <div>

                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          Téléphone
                        </p>

                        <span className="text-sm font-semibold">
                          {profile.telephone}
                        </span>

                      </div>

                    </a>

                  )}

                  {/* =================================================
                      WHATSAPP
                  ================================================= */}

                  {profile.telephone &&
                    whatsappNumber && (

                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        flex
                        items-center
                        gap-3
                        w-full
                        px-4
                        py-3
                        rounded-xl
                        bg-emerald-50
                        dark:bg-emerald-900/20
                        hover:bg-emerald-100
                        dark:hover:bg-emerald-900/30
                        text-emerald-700
                        dark:text-emerald-300
                        transition-colors
                      "
                    >

                      <FaWhatsapp className="text-emerald-500 text-lg shrink-0" />

                      <div>

                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                          WhatsApp
                        </p>

                        <span className="text-sm font-semibold">
                          Contacter sur WhatsApp
                        </span>

                      </div>

                    </a>

                  )}

                  {/* =================================================
                      PAYS DE RÉSIDENCE
                  ================================================= */}

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      w-full
                      px-4
                      py-3
                      rounded-xl
                      bg-slate-50
                      dark:bg-slate-800
                      text-slate-700
                      dark:text-slate-200
                    "
                  >

                    <FaGlobeAfrica className="text-orange-500 shrink-0" />

                    <div>

                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Pays de résidence
                      </p>

                      <span className="text-sm font-semibold">
                        {profile.pays_residence ||
                          "Non renseigné"}
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                PROFIL VÉRIFIÉ
            ================================================= */}

            <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-3xl shadow-xl p-6 text-white">

              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-blue-500/10" />

              <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-indigo-500/10" />

              <div className="relative">

                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center mb-5">

                  <FaShieldAlt className="text-cyan-300 text-xl" />

                </div>

                <h3 className="text-lg font-bold mb-2">
                  Profil enseignant vérifié
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed">
                  Les informations affichées sur ce profil
                  proviennent du compte enseignant enregistré
                  sur la plateforme CODE.
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm text-emerald-300 font-semibold">

                  <FaCheckCircle />

                  <span>
                    Enseignant actif
                  </span>

                </div>

              </div>

            </section>

            {/* =================================================
                RETOUR
            ================================================= */}

            <button
              type="button"
              onClick={handleBack}
              className="
                w-full
                flex
                items-center
                justify-center
                gap-3
                px-5
                py-4
                rounded-2xl
                bg-gradient-to-r
                from-blue-600
                to-indigo-600
                hover:from-blue-700
                hover:to-indigo-700
                text-white
                font-bold
                shadow-lg
                shadow-blue-500/20
                transition-all
                duration-200
                hover:-translate-y-0.5
                active:translate-y-0
              "
            >

              <FaArrowLeft />

              Retour à la remédiation

            </button>

          </aside>

        </div>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <div className="mt-10 text-center">

          <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400 dark:text-slate-500">

            <FaGraduationCap className="text-blue-500" />

            <span>
              CODE — Apprendre, progresser et réussir
            </span>

          </div>

        </div>

      </main>

      {/* =====================================================
          AFFICHAGE PLEIN ÉCRAN DE LA PHOTO
      ===================================================== */}

      {showPhoto && photoUrl && (

        <div
          className="
            fixed
            inset-0
            z-[9999]
            bg-black/95
            backdrop-blur-md
            flex
            flex-col
            items-center
            justify-center
            p-4
            sm:p-6
          "
          onClick={() =>
            setShowPhoto(false)
          }
        >

          {/* =================================================
              BOUTON RETOUR
          ================================================= */}

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setShowPhoto(false);
            }}
            className="
              absolute
              top-5
              left-5
              sm:top-7
              sm:left-7
              z-10
              inline-flex
              items-center
              gap-2
              px-4
              py-2.5
              rounded-xl
              bg-white/10
              hover:bg-white/20
              border
              border-white/20
              text-white
              backdrop-blur-md
              shadow-lg
              font-semibold
              text-sm
              transition-all
              duration-200
            "
          >

            <FaArrowLeft />

            Retour

          </button>

          {/* =================================================
              BOUTON FERMER
          ================================================= */}

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setShowPhoto(false);
            }}
            className="
              absolute
              top-5
              right-5
              sm:top-7
              sm:right-7
              z-10
              w-11
              h-11
              rounded-full
              bg-white/10
              hover:bg-white/20
              border
              border-white/20
              text-white
              flex
              items-center
              justify-center
              backdrop-blur-md
              transition-all
            "
            aria-label="Fermer"
          >

            <FaTimes />

          </button>

          {/* =================================================
              PHOTO
          ================================================= */}

          <div
            className="
              max-w-5xl
              max-h-[78vh]
              flex
              items-center
              justify-center
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <img
              src={photoUrl}
              alt={`Photo complète de ${fullName}`}
              className="
                max-w-full
                max-h-[78vh]
                object-contain
                rounded-2xl
                shadow-2xl
                border
                border-white/10
              "
            />

          </div>

          {/* =================================================
              NOM
          ================================================= */}

          <div className="absolute bottom-8 left-0 right-0 text-center px-4">

            <p className="text-white text-lg sm:text-xl font-bold">
              {fullName}
            </p>

            <p className="text-white/50 text-xs sm:text-sm mt-2">
              Cliquez en dehors de la photo pour fermer
            </p>

          </div>

        </div>

      )}

    </div>
  );
};

export default EnsProfil;