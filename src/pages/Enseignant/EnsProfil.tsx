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
  FaInfoCircle,
  FaChevronDown,
  FaStar,
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

type SectionId =
  | "about"
  | "subjects"
  | "contact"
  | "verified";

const EnsProfil: React.FC = () => {
  const navigate = useNavigate();

  const { email } = useParams<{
    email: string;
  }>();

  const [profile, setProfile] =
    useState<TeacherProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [showPhoto, setShowPhoto] =
    useState(false);

  const [activeSection, setActiveSection] =
    useState<SectionId | null>(null);

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
      api.defaults.baseURL?.replace(/\/$/, "") || "";

    const normalizedBase =
      baseURL.endsWith("/api")
        ? baseURL.slice(0, -4)
        : baseURL;

    return `${normalizedBase}/${photo.replace(
      /^\//,
      ""
    )}`;
  };

  // ==========================================================
  // RETOUR
  // ==========================================================

  const handleBack = () => {
    navigate(-1);
  };

  // ==========================================================
  // OUVRIR / FERMER UNE SECTION
  // ==========================================================

  const handleSectionClick = (
    section: SectionId
  ) => {
    setActiveSection((previous) =>
      previous === section
        ? null
        : section
    );
  };

  // ==========================================================
  // CHARGEMENT
  // ==========================================================

  if (loading) {
    return (
      <div
        className="
          min-h-screen
          bg-transparent
          flex
          items-center
          justify-center
          px-4
        "
      >
        <div className="w-full max-w-md">
          <div
            className="
              bg-white/95
              dark:bg-slate-900/95
              backdrop-blur-2xl
              rounded-[2rem]
              shadow-2xl
              border
              border-slate-200
              dark:border-white/10
              p-8
              text-center
            "
          >
            <div
              className="
                mx-auto
                mb-6
                w-16
                h-16
                rounded-2xl
                bg-gradient-to-br
                from-slate-200
                via-indigo-200
                to-purple-200
                dark:from-slate-800
                dark:via-indigo-800
                dark:to-purple-900
                flex
                items-center
                justify-center
                animate-pulse
                shadow-xl
              "
            >
              <FaChalkboardTeacher
                className="
                  text-indigo-700
                  dark:text-white
                  text-2xl
                "
              />
            </div>

            <h2
              className="
                text-xl
                font-bold
                text-slate-900
                dark:text-white
                mb-2
              "
            >
              Chargement du profil
            </h2>

            <p
              className="
                text-slate-600
                dark:text-slate-400
              "
            >
              Nous récupérons les informations de
              l'enseignant...
            </p>

            <div
              className="
                mt-6
                h-2
                bg-slate-200
                dark:bg-slate-800
                rounded-full
                overflow-hidden
              "
            >
              <div
                className="
                  h-full
                  w-1/2
                  bg-gradient-to-r
                  from-slate-400
                  via-indigo-600
                  to-purple-600
                  rounded-full
                  animate-pulse
                "
              />
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
      <div
        className="
          min-h-screen
          bg-transparent
          flex
          items-center
          justify-center
          px-4
        "
      >
        <div className="w-full max-w-lg">
          <div
            className="
              bg-white/95
              dark:bg-slate-900/95
              backdrop-blur-2xl
              rounded-[2rem]
              shadow-2xl
              border
              border-red-200
              dark:border-red-900/40
              p-8
              text-center
            "
          >
            <div
              className="
                mx-auto
                mb-6
                w-20
                h-20
                rounded-3xl
                bg-red-100
                dark:bg-red-900/30
                flex
                items-center
                justify-center
              "
            >
              <FaUserTie
                className="
                  text-red-500
                  text-3xl
                "
              />
            </div>

            <h2
              className="
                text-2xl
                font-bold
                text-slate-900
                dark:text-white
                mb-3
              "
            >
              Profil indisponible
            </h2>

            <p
              className="
                text-slate-600
                dark:text-slate-400
                mb-8
              "
            >
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
                rounded-2xl
                bg-gradient-to-r
                from-slate-800
                to-indigo-800
                hover:from-slate-900
                hover:to-indigo-900
                dark:from-indigo-700
                dark:to-purple-800
                dark:hover:from-indigo-600
                dark:hover:to-purple-700
                text-white
                font-semibold
                shadow-xl
                shadow-slate-900/20
                transition-all
                duration-300
                hover:-translate-y-1
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

  // ==========================================================
  // NORMALISATION WHATSAPP
  // ==========================================================

  const whatsappNumber =
    profile.telephone
      ? profile.telephone.replace(/\D/g, "")
      : "";

  // ==========================================================
  // BOUTON DE NAVIGATION
  // ==========================================================

  const SectionButton = ({
    section,
    icon,
    title,
    description,
  }: {
    section: SectionId;
    icon: React.ReactNode;
    title: string;
    description: string;
  }) => {
    const isActive =
      activeSection === section;

    const styles: Record<
      SectionId,
      {
        active: string;
        inactive: string;
        icon: string;
        glow: string;
      }
    > = {
      about: {
        active:
          "bg-sky-100 border-sky-300 shadow-sky-500/20 dark:bg-sky-500/20 dark:border-sky-300/50",
        inactive:
          "bg-sky-50 border-sky-200 hover:bg-sky-100 hover:border-sky-300 dark:bg-sky-500/[0.06] dark:border-sky-300/20 dark:hover:bg-sky-500/15 dark:hover:border-sky-300/50",
        icon:
          "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-400/15 dark:text-sky-200 dark:border-sky-300/20",
        glow:
          "group-hover:shadow-sky-500/20",
      },

      subjects: {
        active:
          "bg-violet-100 border-violet-300 shadow-violet-500/20 dark:bg-violet-500/20 dark:border-violet-300/50",
        inactive:
          "bg-violet-50 border-violet-200 hover:bg-violet-100 hover:border-violet-300 dark:bg-violet-500/[0.06] dark:border-violet-300/20 dark:hover:bg-violet-500/15 dark:hover:border-violet-300/50",
        icon:
          "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-400/15 dark:text-violet-200 dark:border-violet-300/20",
        glow:
          "group-hover:shadow-violet-500/20",
      },

      contact: {
        active:
          "bg-emerald-100 border-emerald-300 shadow-emerald-500/20 dark:bg-emerald-500/20 dark:border-emerald-300/50",
        inactive:
          "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 dark:bg-emerald-500/[0.06] dark:border-emerald-300/20 dark:hover:bg-emerald-500/15 dark:hover:border-emerald-300/50",
        icon:
          "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-400/15 dark:text-emerald-200 dark:border-emerald-300/20",
        glow:
          "group-hover:shadow-emerald-500/20",
      },

      verified: {
        active:
          "bg-amber-100 border-amber-300 shadow-amber-500/20 dark:bg-amber-500/20 dark:border-amber-300/50",
        inactive:
          "bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-300 dark:bg-amber-500/[0.06] dark:border-amber-300/20 dark:hover:bg-amber-500/15 dark:hover:border-amber-300/50",
        icon:
          "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-400/15 dark:text-amber-200 dark:border-amber-300/20",
        glow:
          "group-hover:shadow-amber-500/20",
      },
    };

    const currentStyle =
      styles[section];

    return (
      <button
        type="button"
        onClick={() =>
          handleSectionClick(section)
        }
        className={`
          group
          relative
          w-full
          text-left
          rounded-2xl
          border
          p-4
          overflow-hidden
          backdrop-blur-xl
          transition-all
          duration-300
          ease-out
          hover:-translate-y-1.5
          hover:shadow-2xl
          active:translate-y-0
          focus:outline-none
          focus:ring-2
          focus:ring-indigo-500/30
          dark:focus:ring-white/30
          ${
            isActive
              ? `${currentStyle.active} shadow-xl`
              : currentStyle.inactive
          }
          ${currentStyle.glow}
        `}
      >
        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-slate-900/[0.03]
            via-white/[0.25]
            to-transparent
            dark:from-white/[0.04]
            dark:via-white/[0.10]
            dark:to-transparent
            opacity-0
            group-hover:opacity-100
            transition-opacity
            duration-300
          "
        />

        <div className="relative flex items-center gap-3">
          <div
            className={`
              shrink-0
              w-11
              h-11
              rounded-xl
              border
              flex
              items-center
              justify-center
              transition-all
              duration-300
              group-hover:scale-110
              ${currentStyle.icon}
            `}
          >
            {icon}
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="
                font-bold
                text-sm
                sm:text-base
                text-slate-900
                dark:text-white
              "
            >
              {title}
            </p>

            <p
              className="
                text-xs
                mt-1
                text-slate-600
                group-hover:text-slate-800
                dark:text-white/60
                dark:group-hover:text-white/80
                transition-colors
              "
            >
              {description}
            </p>
          </div>

          <div
            className={`
              shrink-0
              w-8
              h-8
              rounded-full
              border
              border-slate-300
              bg-white/70
              flex
              items-center
              justify-center
              transition-all
              duration-300
              group-hover:bg-white
              dark:border-white/10
              dark:bg-white/5
              dark:group-hover:bg-white/10
              ${
                isActive
                  ? "rotate-180"
                  : ""
              }
            `}
          >
            <FaChevronDown
              className="
                text-slate-600
                dark:text-white/70
                text-xs
              "
            />
          </div>
        </div>
      </button>
    );
  };

  return (
    <div
      className="
        min-h-screen
        bg-transparent
        text-slate-900
        dark:text-white
        relative
      "
    >
      {/* =====================================================
          CONTENU PRINCIPAL
      ====================================================== */}

      <main
        className="
          relative
          max-w-6xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          py-8
          sm:py-10
        "
      >
        {/* ===================================================
            GRANDE BANNIÈRE DU PROFIL
        =================================================== */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[2rem]
            shadow-2xl
            border
            border-slate-200/80
            dark:border-white/10
          "
        >
          {/* Fond adapté au thème */}
          <div
            className="
              absolute
              inset-0
              bg-gradient-to-br
              from-white/95
              via-slate-100/95
              to-indigo-100/95
              dark:from-[#0b1220]/95
              dark:via-[#111827]/95
              dark:to-[#1e1b4b]/95
            "
          />

          {/* Couche de profondeur */}
          <div
            className="
              absolute
              inset-0
              bg-gradient-to-r
              from-slate-200/40
              via-transparent
              to-indigo-200/40
              dark:from-slate-950/20
              dark:via-transparent
              dark:to-indigo-950/40
            "
          />

          {/* Lumière décorative droite */}
          <div
            className="
              absolute
              -top-32
              -right-32
              w-96
              h-96
              rounded-full
              bg-indigo-400/20
              dark:bg-indigo-500/15
              blur-3xl
            "
          />

          {/* Lumière décorative gauche */}
          <div
            className="
              absolute
              -bottom-40
              -left-24
              w-[30rem]
              h-[30rem]
              rounded-full
              bg-sky-400/20
              dark:bg-sky-500/10
              blur-3xl
            "
          />

          {/* Lumière violette */}
          <div
            className="
              absolute
              top-1/3
              right-1/4
              w-72
              h-72
              rounded-full
              bg-violet-400/15
              dark:bg-violet-500/10
              blur-3xl
            "
          />

          {/* Motif */}
          <div
            className="
              absolute
              inset-0
              opacity-[0.035]
              dark:opacity-[0.035]
              bg-[radial-gradient(circle_at_1px_1px,black_1px,transparent_0)]
              dark:bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)]
              [background-size:24px_24px]
            "
          />

          <div
            className="
              relative
              px-6
              sm:px-10
              lg:px-14
              py-10
              sm:py-14
            "
          >
            <div
              className="
                flex
                flex-col
                lg:flex-row
                lg:items-center
                gap-8
              "
            >
              {/* =================================================
                  PHOTO
              ================================================== */}

              <div
                className="
                  flex
                  justify-center
                  lg:justify-start
                  shrink-0
                "
              >
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
                      dark:border-white/70
                      shadow-2xl
                      shadow-black/30
                      focus:outline-none
                      focus:ring-4
                      focus:ring-indigo-400/30
                      dark:focus:ring-white/20
                      transition-all
                      duration-500
                      hover:-translate-y-1
                      hover:shadow-indigo-500/30
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
                        duration-700
                        group-hover:scale-110
                      "
                    />

                    <div
                      className="
                        absolute
                        inset-0
                        bg-black/0
                        group-hover:bg-black/45
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
                      bg-slate-200/80
                      dark:bg-white/[0.06]
                      border-4
                      border-slate-300/60
                      dark:border-white/20
                      flex
                      items-center
                      justify-center
                      shadow-2xl
                    "
                  >
                    <FaUserTie
                      className="
                        text-slate-500
                        dark:text-white/60
                        text-5xl
                      "
                    />
                  </div>
                )}
              </div>

              {/* =================================================
                  INFORMATIONS PRINCIPALES
              ================================================== */}

              <div
                className="
                  text-center
                  lg:text-left
                  flex-1
                "
              >
                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    px-3.5
                    py-1.5
                    rounded-full
                    bg-slate-900/[0.06]
                    dark:bg-white/[0.07]
                    border
                    border-slate-300/70
                    dark:border-white/10
                    backdrop-blur-xl
                    mb-4
                    shadow-lg
                  "
                >
                  <FaChalkboardTeacher
                    className="
                      text-sky-600
                      dark:text-sky-300
                    "
                  />

                  <span
                    className="
                      text-xs
                      sm:text-sm
                      font-semibold
                      tracking-wide
                      text-slate-700
                      dark:text-white/90
                    "
                  >
                    ENSEIGNANT CODE
                  </span>
                </div>

                <div
                  className="
                    flex
                    flex-col
                    lg:flex-row
                    lg:items-center
                    gap-3
                    mb-3
                  "
                >
                  <h1
                    className="
                      text-3xl
                      sm:text-4xl
                      lg:text-5xl
                      font-black
                      tracking-tight
                      text-slate-900
                      dark:text-white
                    "
                  >
                    {fullName}
                  </h1>

                  <span
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-1.5
                      self-center
                      lg:self-auto
                      px-3
                      py-1.5
                      rounded-full
                      bg-emerald-100
                      dark:bg-emerald-400/10
                      border
                      border-emerald-300
                      dark:border-emerald-500/20
                      text-emerald-700
                      dark:text-emerald-200
                      text-xs
                      font-bold
                      backdrop-blur-sm
                    "
                  >
                    <FaCheckCircle />
                    Profil vérifié
                  </span>
                </div>

                <p
                  className="
                    text-slate-700
                    dark:text-slate-300
                    max-w-2xl
                    text-sm
                    sm:text-base
                    leading-relaxed
                  "
                >
                  Retrouvez les informations de cet
                  enseignant et les matières qu'il
                  propose aux apprenants sur la
                  plateforme CODE.
                </p>

                <div
                  className="
                    mt-6
                    flex
                    flex-wrap
                    justify-center
                    lg:justify-start
                    gap-3
                  "
                >
                  {subjects.length > 0 && (
                    <div
                      className="
                        inline-flex
                        items-center
                        gap-2
                        px-4
                        py-2.5
                        rounded-xl
                        bg-white/70
                        dark:bg-white/[0.06]
                        border
                        border-slate-300/70
                        dark:border-white/10
                        backdrop-blur-xl
                        text-sm
                        text-slate-700
                        dark:text-slate-200
                        shadow-lg
                      "
                    >
                      <FaBook
                        className="
                          text-sky-600
                          dark:text-sky-300
                        "
                      />

                      <span>
                        {subjects.length} matière
                        {subjects.length > 1
                          ? "s"
                          : ""}
                      </span>
                    </div>
                  )}

                  <div
                    className="
                      inline-flex
                      items-center
                      gap-2
                      px-4
                      py-2.5
                      rounded-xl
                      bg-white/70
                      dark:bg-white/[0.06]
                      border
                      border-slate-300/70
                      dark:border-white/10
                      backdrop-blur-xl
                      text-sm
                      text-slate-700
                      dark:text-slate-200
                      shadow-lg
                    "
                  >
                    <FaShieldAlt
                      className="
                        text-emerald-600
                        dark:text-emerald-300
                      "
                    />

                    <span>
                      Enseignant actif
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                NAVIGATION
            ================================================== */}

            <div
              className="
                mt-10
                pt-8
                border-t
                border-slate-300/70
                dark:border-white/10
              "
            >
              <div className="mb-5">
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <div
                    className="
                      w-10
                      h-10
                      rounded-xl
                      bg-white/70
                      dark:bg-white/[0.06]
                      border
                      border-slate-300/70
                      dark:border-white/10
                      flex
                      items-center
                      justify-center
                      shadow-lg
                    "
                  >
                    <FaStar
                      className="
                        text-amber-500
                        dark:text-amber-300
                      "
                    />
                  </div>

                  <div>
                    <h2
                      className="
                        text-lg
                        sm:text-xl
                        font-bold
                        text-slate-900
                        dark:text-white
                      "
                    >
                      Explorer le profil
                    </h2>

                    <p
                      className="
                        text-xs
                        sm:text-sm
                        text-slate-600
                        dark:text-slate-400
                      "
                    >
                      Consultez les informations qui
                      vous intéressent.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  lg:grid-cols-4
                  gap-4
                "
              >
                <SectionButton
                  section="about"
                  icon={<FaUserTie />}
                  title="À propos"
                  description="Informations générales"
                />

                <SectionButton
                  section="subjects"
                  icon={<FaBook />}
                  title="Matières"
                  description="Domaines enseignés"
                />

                <SectionButton
                  section="contact"
                  icon={<FaEnvelope />}
                  title="Contacter"
                  description="Moyens de contact"
                />

                <SectionButton
                  section="verified"
                  icon={<FaShieldAlt />}
                  title="Profil vérifié"
                  description="Informations de confiance"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================
          FENÊTRE D'INFORMATIONS
      ====================================================== */}

      {activeSection && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            bg-black/60
            backdrop-blur-md
            flex
            items-center
            justify-center
            p-4
            sm:p-6
          "
          onClick={() =>
            setActiveSection(null)
          }
        >
          <div
            className="
              relative
              w-full
              max-w-5xl
              max-h-[90vh]
              overflow-y-auto
              rounded-[2rem]
              bg-white/98
              dark:bg-[#0b1220]/98
              border
              border-slate-200
              dark:border-white/10
              shadow-[0_30px_100px_rgba(0,0,0,0.65)]
              text-slate-900
              dark:text-white
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* Fond décoratif */}
            <div
              className="
                absolute
                inset-0
                overflow-hidden
                rounded-[2rem]
                pointer-events-none
              "
            >
              <div
                className="
                  absolute
                  -top-32
                  -right-32
                  w-96
                  h-96
                  rounded-full
                  bg-indigo-400/10
                  dark:bg-indigo-500/10
                  blur-3xl
                "
              />

              <div
                className="
                  absolute
                  -bottom-40
                  -left-24
                  w-[30rem]
                  h-[30rem]
                  rounded-full
                  bg-sky-400/10
                  dark:bg-sky-500/10
                  blur-3xl
                "
              />

              <div
                className="
                  absolute
                  inset-0
                  opacity-[0.025]
                  dark:opacity-[0.025]
                  bg-[radial-gradient(circle_at_1px_1px,black_1px,transparent_0)]
                  dark:bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)]
                  [background-size:24px_24px]
                "
              />
            </div>

            {/* =================================================
                EN-TÊTE MODALE
            ================================================== */}

            <div
              className="
                relative
                sticky
                top-0
                z-10
                flex
                items-center
                justify-between
                gap-4
                px-6
                sm:px-8
                py-5
                bg-white/95
                dark:bg-[#0b1220]/95
                backdrop-blur-xl
                border-b
                border-slate-200
                dark:border-white/10
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-4
                "
              >
                <div
                  className={`
                    w-12
                    h-12
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    border
                    ${
                      activeSection === "about"
                        ? "bg-sky-100 border-sky-200 text-sky-700 dark:bg-sky-500/15 dark:border-sky-300/20 dark:text-sky-300"
                        : activeSection === "subjects"
                        ? "bg-violet-100 border-violet-200 text-violet-700 dark:bg-violet-500/15 dark:border-violet-300/20 dark:text-violet-300"
                        : activeSection === "contact"
                        ? "bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-300/20 dark:text-emerald-300"
                        : "bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-500/15 dark:border-amber-300/20 dark:text-amber-300"
                    }
                  `}
                >
                  {activeSection === "about" && (
                    <FaUserTie />
                  )}

                  {activeSection === "subjects" && (
                    <FaBook />
                  )}

                  {activeSection === "contact" && (
                    <FaEnvelope />
                  )}

                  {activeSection === "verified" && (
                    <FaShieldAlt />
                  )}
                </div>

                <div>
                  <h2
                    className="
                      text-xl
                      sm:text-2xl
                      font-bold
                      text-slate-900
                      dark:text-white
                    "
                  >
                    {activeSection === "about" &&
                      "À propos de l'enseignant"}

                    {activeSection === "subjects" &&
                      "Matières enseignées"}

                    {activeSection === "contact" &&
                      "Contacter l'enseignant"}

                    {activeSection === "verified" &&
                      "Profil enseignant vérifié"}
                  </h2>

                  <p
                    className="
                      text-xs
                      sm:text-sm
                      text-slate-600
                      dark:text-slate-400
                      mt-1
                    "
                  >
                    {activeSection === "about" &&
                      "Informations générales"}

                    {activeSection === "subjects" &&
                      "Domaines proposés sur CODE"}

                    {activeSection === "contact" &&
                      "Choisissez le moyen de contact qui vous convient."}

                    {activeSection === "verified" &&
                      "Informations de confiance sur le profil"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setActiveSection(null)
                }
                className="
                  shrink-0
                  w-11
                  h-11
                  rounded-full
                  bg-slate-100
                  dark:bg-white/5
                  hover:bg-slate-200
                  dark:hover:bg-white/10
                  border
                  border-slate-300
                  dark:border-white/10
                  flex
                  items-center
                  justify-center
                  text-slate-700
                  dark:text-white
                  transition-all
                "
                aria-label="Fermer"
              >
                <FaTimes />
              </button>
            </div>

            {/* =================================================
                CONTENU MODALE
            ================================================== */}

            <div
              className="
                relative
                p-6
                sm:p-8
              "
            >
              {/* =================================================
                  À PROPOS
              ================================================== */}

              {activeSection === "about" && (
                <div
                  className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    gap-4
                  "
                >
                  <div
                    className="
                      rounded-2xl
                      bg-slate-50
                      dark:bg-white/[0.04]
                      border
                      border-slate-200
                      dark:border-white/10
                      p-5
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-3
                        mb-3
                      "
                    >
                      <FaUserTie
                        className="
                          text-sky-600
                          dark:text-sky-400
                        "
                      />

                      <span
                        className="
                          text-xs
                          font-bold
                          uppercase
                          tracking-wider
                          text-slate-500
                          dark:text-slate-400
                        "
                      >
                        Nom
                      </span>
                    </div>

                    <p
                      className="
                        font-semibold
                        text-slate-900
                        dark:text-white
                        text-lg
                      "
                    >
                      {profile.nom ||
                        "Non renseigné"}
                    </p>
                  </div>

                  <div
                    className="
                      rounded-2xl
                      bg-slate-50
                      dark:bg-white/[0.04]
                      border
                      border-slate-200
                      dark:border-white/10
                      p-5
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-3
                        mb-3
                      "
                    >
                      <FaUserGraduate
                        className="
                          text-violet-600
                          dark:text-violet-400
                        "
                      />

                      <span
                        className="
                          text-xs
                          font-bold
                          uppercase
                          tracking-wider
                          text-slate-500
                          dark:text-slate-400
                        "
                      >
                        Prénom
                      </span>
                    </div>

                    <p
                      className="
                        font-semibold
                        text-slate-900
                        dark:text-white
                        text-lg
                      "
                    >
                      {profile.prenom ||
                        "Non renseigné"}
                    </p>
                  </div>

                  <div
                    className="
                      rounded-2xl
                      bg-slate-50
                      dark:bg-white/[0.04]
                      border
                      border-slate-200
                      dark:border-white/10
                      p-5
                      sm:col-span-2
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-3
                        mb-3
                      "
                    >
                      <FaGlobeAfrica
                        className="text-orange-500"
                      />

                      <span
                        className="
                          text-xs
                          font-bold
                          uppercase
                          tracking-wider
                          text-slate-500
                          dark:text-slate-400
                        "
                      >
                        Pays de résidence
                      </span>
                    </div>

                    <p
                      className="
                        font-semibold
                        text-slate-900
                        dark:text-white
                        text-lg
                      "
                    >
                      {profile.pays_residence ||
                        "Non renseigné"}
                    </p>
                  </div>
                </div>
              )}

              {/* =================================================
                  MATIÈRES
              ================================================== */}

              {activeSection === "subjects" && (
                <>
                  {subjects.length > 0 ? (
                    <div
                      className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        gap-4
                      "
                    >
                      {subjects.map(
                        (
                          subject,
                          index
                        ) => (
                          <div
                            key={`${subject}-${index}`}
                            className="
                              group
                              relative
                              overflow-hidden
                              rounded-2xl
                              border
                              border-slate-200
                              dark:border-white/10
                              bg-slate-50
                              dark:bg-white/[0.04]
                              p-5
                              transition-all
                              duration-300
                              hover:-translate-y-1
                              hover:bg-violet-50
                              hover:border-violet-300
                              dark:hover:bg-violet-500/[0.08]
                              dark:hover:border-violet-300/30
                            "
                          >
                            <div
                              className="
                                absolute
                                top-0
                                right-0
                                w-24
                                h-24
                                rounded-full
                                bg-violet-500/10
                                -translate-y-8
                                translate-x-8
                              "
                            />

                            <div
                              className="
                                relative
                                flex
                                items-center
                                gap-4
                              "
                            >
                              <div
                                className="
                                  w-11
                                  h-11
                                  rounded-xl
                                  bg-violet-100
                                  dark:bg-violet-500/10
                                  border
                                  border-violet-200
                                  dark:border-violet-300/20
                                  flex
                                  items-center
                                  justify-center
                                  shrink-0
                                "
                              >
                                <FaBook
                                  className="
                                    text-violet-600
                                    dark:text-violet-300
                                  "
                                />
                              </div>

                              <div>
                                <p
                                  className="
                                    font-bold
                                    text-slate-900
                                    dark:text-white
                                  "
                                >
                                  {subject}
                                </p>

                                <p
                                  className="
                                    text-xs
                                    text-slate-500
                                    dark:text-slate-500
                                    mt-1
                                  "
                                >
                                  Matière enseignée
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div
                      className="
                        rounded-2xl
                        bg-slate-50
                        dark:bg-white/[0.04]
                        border
                        border-dashed
                        border-slate-300
                        dark:border-white/15
                        p-8
                        text-center
                      "
                    >
                      <FaBook
                        className="
                          mx-auto
                          text-slate-400
                          dark:text-slate-600
                          text-3xl
                          mb-3
                        "
                      />

                      <p
                        className="
                          text-slate-600
                          dark:text-slate-400
                        "
                      >
                        Aucune matière déclarée
                        pour le moment.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* =================================================
                  CONTACT
              ================================================== */}

              {activeSection === "contact" && (
                <>
                  <div
                    className="
                      grid
                      grid-cols-1
                      md:grid-cols-3
                      gap-4
                    "
                  >
                    {/* GMAIL */}
                    {profile.email && (
                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                          profile.email
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          group
                          rounded-2xl
                          border
                          border-slate-200
                          dark:border-white/10
                          bg-slate-50
                          dark:bg-white/[0.04]
                          p-5
                          hover:border-blue-300
                          hover:bg-blue-50
                          dark:hover:border-blue-300/40
                          dark:hover:bg-blue-500/[0.06]
                          hover:shadow-xl
                          hover:-translate-y-1
                          transition-all
                          duration-300
                        "
                        title="Envoyer un e-mail avec Gmail"
                      >
                        <div
                          className="
                            flex
                            items-center
                            gap-3
                            mb-4
                          "
                        >
                          <div
                            className="
                              w-11
                              h-11
                              rounded-xl
                              bg-blue-100
                              dark:bg-blue-500/10
                              border
                              border-blue-200
                              dark:border-blue-300/20
                              flex
                              items-center
                              justify-center
                            "
                          >
                            <FaEnvelope
                              className="
                                text-blue-600
                                dark:text-blue-400
                              "
                            />
                          </div>

                          <div>
                            <p
                              className="
                                text-xs
                                text-slate-500
                                dark:text-slate-500
                              "
                            >
                              E-mail
                            </p>

                            <p
                              className="
                                font-bold
                                text-slate-900
                                dark:text-white
                              "
                            >
                              Gmail
                            </p>
                          </div>
                        </div>

                        <p
                          className="
                            text-sm
                            text-slate-700
                            dark:text-slate-300
                            break-all
                          "
                        >
                          {profile.email}
                        </p>

                        <p
                          className="
                            mt-4
                            text-xs
                            font-semibold
                            text-blue-600
                            dark:text-blue-400
                          "
                        >
                          Envoyer un message →
                        </p>
                      </a>
                    )}

                    {/* TÉLÉPHONE */}
                    {profile.telephone && (
                      <a
                        href={`tel:${profile.telephone}`}
                        className="
                          group
                          rounded-2xl
                          border
                          border-slate-200
                          dark:border-white/10
                          bg-slate-50
                          dark:bg-white/[0.04]
                          p-5
                          hover:border-emerald-300
                          hover:bg-emerald-50
                          dark:hover:border-emerald-300/40
                          dark:hover:bg-emerald-500/[0.06]
                          hover:shadow-xl
                          hover:-translate-y-1
                          transition-all
                          duration-300
                        "
                        title="Appeler l'enseignant"
                      >
                        <div
                          className="
                            flex
                            items-center
                            gap-3
                            mb-4
                          "
                        >
                          <div
                            className="
                              w-11
                              h-11
                              rounded-xl
                              bg-emerald-100
                              dark:bg-emerald-500/10
                              border
                              border-emerald-200
                              dark:border-emerald-300/20
                              flex
                              items-center
                              justify-center
                            "
                          >
                            <FaPhone
                              className="
                                text-emerald-600
                                dark:text-emerald-400
                              "
                            />
                          </div>

                          <div>
                            <p
                              className="
                                text-xs
                                text-slate-500
                                dark:text-slate-500
                              "
                            >
                              Téléphone
                            </p>

                            <p
                              className="
                                font-bold
                                text-slate-900
                                dark:text-white
                              "
                            >
                              Appel direct
                            </p>
                          </div>
                        </div>

                        <p
                          className="
                            text-sm
                            font-semibold
                            text-slate-700
                            dark:text-slate-200
                          "
                        >
                          {profile.telephone}
                        </p>

                        <p
                          className="
                            mt-4
                            text-xs
                            font-semibold
                            text-emerald-600
                            dark:text-emerald-400
                          "
                        >
                          Appeler l'enseignant →
                        </p>
                      </a>
                    )}

                    {/* WHATSAPP */}
                    {whatsappNumber && (
                      <a
                        href={`https://wa.me/${whatsappNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          group
                          rounded-2xl
                          border
                          border-emerald-300
                          dark:border-emerald-300/20
                          bg-emerald-50
                          dark:bg-emerald-500/[0.06]
                          p-5
                          hover:border-emerald-400
                          hover:bg-emerald-100
                          dark:hover:border-emerald-400/50
                          dark:hover:bg-emerald-500/[0.10]
                          hover:shadow-xl
                          hover:-translate-y-1
                          transition-all
                          duration-300
                        "
                        title="Contacter l'enseignant sur WhatsApp"
                      >
                        <div
                          className="
                            flex
                            items-center
                            gap-3
                            mb-4
                          "
                        >
                          <div
                            className="
                              w-11
                              h-11
                              rounded-xl
                              bg-emerald-100
                              dark:bg-emerald-400/10
                              border
                              border-emerald-200
                              dark:border-emerald-300/20
                              flex
                              items-center
                              justify-center
                            "
                          >
                            <FaWhatsapp
                              className="
                                text-emerald-600
                                dark:text-emerald-400
                                text-lg
                              "
                            />
                          </div>

                          <div>
                            <p
                              className="
                                text-xs
                                text-emerald-600
                                dark:text-emerald-400
                              "
                            >
                              Messagerie
                            </p>

                            <p
                              className="
                                font-bold
                                text-emerald-700
                                dark:text-emerald-200
                              "
                            >
                              WhatsApp
                            </p>
                          </div>
                        </div>

                        <p
                          className="
                            text-sm
                            font-semibold
                            text-emerald-700
                            dark:text-emerald-300
                          "
                        >
                          Contacter sur WhatsApp
                        </p>

                        <p
                          className="
                            mt-4
                            text-xs
                            font-semibold
                            text-emerald-600
                            dark:text-emerald-400
                          "
                        >
                          Ouvrir WhatsApp →
                        </p>
                      </a>
                    )}
                  </div>

                  {!profile.email &&
                    !profile.telephone &&
                    !whatsappNumber && (
                      <div
                        className="
                          rounded-2xl
                          bg-slate-50
                          dark:bg-white/[0.04]
                          border
                          border-dashed
                          border-slate-300
                          dark:border-white/15
                          p-8
                          text-center
                        "
                      >
                        <FaEnvelope
                          className="
                            mx-auto
                            text-slate-400
                            dark:text-slate-600
                            text-3xl
                            mb-3
                          "
                        />

                        <p
                          className="
                            text-slate-600
                            dark:text-slate-400
                          "
                        >
                          Aucun moyen de contact
                          n'est disponible pour cet
                          enseignant.
                        </p>
                      </div>
                    )}
                </>
              )}

              {/* =================================================
                  PROFIL VÉRIFIÉ
              ================================================== */}

              {activeSection === "verified" && (
                <div>
                  <div
                    className="
                      grid
                      grid-cols-1
                      md:grid-cols-3
                      gap-4
                    "
                  >
                    <div
                      className="
                        rounded-2xl
                        bg-slate-50
                        dark:bg-white/[0.04]
                        border
                        border-slate-200
                        dark:border-white/10
                        p-5
                      "
                    >
                      <div
                        className="
                          w-10
                          h-10
                          rounded-xl
                          bg-emerald-100
                          dark:bg-emerald-400/10
                          flex
                          items-center
                          justify-center
                          mb-4
                        "
                      >
                        <FaCheckCircle
                          className="
                            text-emerald-600
                            dark:text-emerald-300
                          "
                        />
                      </div>

                      <h3
                        className="
                          font-bold
                          text-slate-900
                          dark:text-white
                          mb-2
                        "
                      >
                        Identité enregistrée
                      </h3>

                      <p
                        className="
                          text-sm
                          text-slate-700
                          dark:text-slate-300
                          leading-relaxed
                        "
                      >
                        Les informations présentées
                        proviennent du compte enseignant
                        enregistré sur CODE.
                      </p>
                    </div>

                    <div
                      className="
                        rounded-2xl
                        bg-slate-50
                        dark:bg-white/[0.04]
                        border
                        border-slate-200
                        dark:border-white/10
                        p-5
                      "
                    >
                      <div
                        className="
                          w-10
                          h-10
                          rounded-xl
                          bg-blue-100
                          dark:bg-blue-400/10
                          flex
                          items-center
                          justify-center
                          mb-4
                        "
                      >
                        <FaChalkboardTeacher
                          className="
                            text-blue-600
                            dark:text-blue-300
                          "
                        />
                      </div>

                      <h3
                        className="
                          font-bold
                          text-slate-900
                          dark:text-white
                          mb-2
                        "
                      >
                        Enseignant actif
                      </h3>

                      <p
                        className="
                          text-sm
                          text-slate-700
                          dark:text-slate-300
                          leading-relaxed
                        "
                      >
                        Cet enseignant possède un
                        profil public accessible aux
                        apprenants de CODE.
                      </p>
                    </div>

                    <div
                      className="
                        rounded-2xl
                        bg-slate-50
                        dark:bg-white/[0.04]
                        border
                        border-slate-200
                        dark:border-white/10
                        p-5
                      "
                    >
                      <div
                        className="
                          w-10
                          h-10
                          rounded-xl
                          bg-yellow-100
                          dark:bg-yellow-400/10
                          flex
                          items-center
                          justify-center
                          mb-4
                        "
                      >
                        <FaStar
                          className="
                            text-yellow-600
                            dark:text-yellow-300
                          "
                        />
                      </div>

                      <h3
                        className="
                          font-bold
                          text-slate-900
                          dark:text-white
                          mb-2
                        "
                      >
                        Présence sur CODE
                      </h3>

                      <p
                        className="
                          text-sm
                          text-slate-700
                          dark:text-slate-300
                          leading-relaxed
                        "
                      >
                        Les matières proposées par cet
                        enseignant sont présentées
                        directement sur son profil.
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      mt-6
                      rounded-2xl
                      bg-slate-50
                      dark:bg-white/[0.04]
                      border
                      border-slate-200
                      dark:border-white/10
                      p-5
                    "
                  >
                    <div
                      className="
                        flex
                        items-start
                        gap-3
                      "
                    >
                      <FaInfoCircle
                        className="
                          text-cyan-600
                          dark:text-cyan-300
                          mt-1
                          shrink-0
                        "
                      />

                      <p
                        className="
                          text-sm
                          text-slate-700
                          dark:text-slate-300
                          leading-relaxed
                        "
                      >
                        Les informations affichées sur
                        ce profil proviennent du compte
                        enseignant enregistré sur la
                        plateforme CODE.
                      </p>
                    </div>

                    <div
                      className="
                        mt-5
                        flex
                        items-center
                        gap-2
                        text-sm
                        text-emerald-700
                        dark:text-emerald-300
                        font-semibold
                      "
                    >
                      <FaCheckCircle />

                      <span>
                        Enseignant actif
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          PIED DE PAGE
      ====================================================== */}

      <div
        className="
          relative
          max-w-6xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          pb-10
        "
      >
        <div className="text-center">
          <div
            className="
              inline-flex
              items-center
              gap-2
              text-xs
              sm:text-sm
              text-slate-700
              dark:text-slate-400
              bg-white/60
              dark:bg-transparent
              px-4
              py-2
              rounded-full
              border
              border-slate-200/70
              dark:border-transparent
              backdrop-blur-sm
            "
          >
            <FaGraduationCap
              className="
                text-indigo-600
                dark:text-indigo-500
              "
            />

            <span>
              CODE — Apprendre, progresser et réussir
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          AFFICHAGE PLEIN ÉCRAN DE LA PHOTO
      ====================================================== */}

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
          {/* BOUTON RETOUR */}
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

          {/* BOUTON FERMER */}
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

          {/* PHOTO */}
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

          {/* NOM */}
          <div
            className="
              absolute
              bottom-8
              left-0
              right-0
              text-center
              px-4
            "
          >
            <p
              className="
                text-white
                text-lg
                sm:text-xl
                font-bold
              "
            >
              {fullName}
            </p>

            <p
              className="
                text-white/50
                text-xs
                sm:text-sm
                mt-2
              "
            >
              Cliquez en dehors de la photo pour
              fermer
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnsProfil;