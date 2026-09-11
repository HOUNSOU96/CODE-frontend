
// CODE — UNIVERS DU SAVOIR ET DES COMPÉTENCES

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";

// ============================================================
// ICÔNES CODE
// Toutes les icônes ci-dessous ont été vérifiées dans
// react-icons@5.5.0
// ============================================================

import {
  FaGraduationCap,
  FaGlobeAfrica,
  FaLaptopCode,
  FaBriefcase,
  FaMoneyBillWave,
  FaLeaf,
  FaBrain,
  FaBalanceScale,
  FaHeart,
  FaFlask,
  FaChess,
  FaLightbulb,
} from "react-icons/fa";

import {
  GiMusicalNotes,
  GiPaintBrush,
  GiTheater,
  GiFilmProjector,
} from "react-icons/gi";

// ============================================================
// COMPOSANT
// ============================================================

const Etudiant: React.FC = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();

  // ==========================================================
  // LES GRANDS DOMAINES DE CODE
  // ==========================================================

  const domaines = [
    // ========================================================
    // A — FORMATIONS ACADÉMIQUES
    // ========================================================

    {
      name: "academique",
      label: "FORMATIONS ACADÉMIQUES",
      icon: FaGraduationCap,
      color: "text-blue-600",
      description:
        "Mathématiques, sciences, langues, sciences humaines et autres formations académiques.",
      route: "/domaines/academique",
    },

    // ========================================================
    // B — MÉTIERS ET SAVOIR-FAIRE
    // ========================================================

    {
      name: "metiers",
      label: "MÉTIERS & SAVOIR-FAIRE",
      icon: FaBriefcase,
      color: "text-orange-600",
      description:
        "Mécanique, électricité, menuiserie, couture, plomberie, agriculture, cuisine et artisanat.",
      route: "/domaines/metiers",
    },

    // ========================================================
    // C — TECHNOLOGIES
    // ========================================================

    {
      name: "technologies",
      label: "TECHNOLOGIES",
      icon: FaLaptopCode,
      color: "text-indigo-600",
      description:
        "Programmation, intelligence artificielle, robotique, électronique, design et numérique.",
      route: "/domaines/technologies",
    },

    // ========================================================
    // D — VIE PROFESSIONNELLE
    // ========================================================

    {
      name: "professionnelle",
      label: "VIE PROFESSIONNELLE",
      icon: FaBriefcase,
      color: "text-purple-600",
      description:
        "Entrepreneuriat, gestion, commerce, communication, management et développement professionnel.",
      route: "/domaines/professionnelle",
    },

    // ========================================================
    // E — FINANCES & ÉCONOMIE
    // ========================================================

    {
      name: "finance",
      label: "FINANCES & ÉCONOMIE",
      icon: FaMoneyBillWave,
      color: "text-green-600",
      description:
        "Finance personnelle, comptabilité, banque, investissement et économie.",
      route: "/domaines/finance",
    },

    // ========================================================
    // F — ENVIRONNEMENT & DÉVELOPPEMENT DURABLE
    // ========================================================

    {
      name: "environnement",
      label: "ENVIRONNEMENT & DÉVELOPPEMENT DURABLE",
      icon: FaLeaf,
      color: "text-emerald-600",
      description:
        "Écologie, climat, agriculture durable, énergie et protection des ressources.",
      route: "/domaines/environnement",
    },

    // ========================================================
    // G — DÉVELOPPEMENT HUMAIN & COMPÉTENCES DE VIE
    // ========================================================

    {
      name: "developpementhumain",
      label: "DÉVELOPPEMENT HUMAIN & COMPÉTENCES DE VIE",
      icon: FaBrain,
      color: "text-pink-600",
      description:
        "Organisation, discipline, créativité, logique, communication et compétences sociales.",
      route: "/domaines/developpement-humain",
    },

    // ========================================================
    // H — CITOYENNETÉ & VIE EN SOCIÉTÉ
    // ========================================================

    {
      name: "societe",
      label: "CITOYENNETÉ & VIE EN SOCIÉTÉ",
      icon: FaBalanceScale,
      color: "text-cyan-600",
      description:
        "Citoyenneté, droit, institutions, culture, responsabilités et vie collective.",
      route: "/domaines/societe",
    },

    // ========================================================
    // I — SANTÉ, BIEN-ÊTRE & SPORT
    // ========================================================

    {
      name: "sante",
      label: "SANTÉ, BIEN-ÊTRE & SPORT",
      icon: FaHeart,
      color: "text-red-600",
      description:
        "Santé, nutrition, prévention, premiers secours, activité physique et bien-être.",
      route: "/domaines/sante",
    },

    // ========================================================
    // J — SCIENCES & INNOVATION
    // ========================================================

    {
      name: "sciencesinnovation",
      label: "SCIENCES & INNOVATION",
      icon: FaFlask,
      color: "text-violet-600",
      description:
        "Sciences avancées, recherche, biotechnologies, espace et innovation.",
      route: "/domaines/sciences-innovation",
    },

    // ========================================================
    // K — PÉDAGOGIE & TRANSMISSION DU SAVOIR
    // ========================================================

    {
      name: "pedagogie",
      label: "PÉDAGOGIE & TRANSMISSION DU SAVOIR",
      icon: FaGraduationCap,
      color: "text-amber-600",
      description:
        "Pédagogie, didactique, formation des enseignants et technologies éducatives.",
      route: "/domaines/pedagogie",
    },

    // ========================================================
    // L — JEUX, LOGIQUE & COMPÉTITIONS
    // ========================================================

    {
      name: "jeux",
      label: "JEUX, LOGIQUE & COMPÉTITIONS",
      icon: FaChess,
      color: "text-slate-600",
      description:
        "Échecs, énigmes, logique, olympiades, défis et compétitions CODE ARENA.",
      route: "/domaines/jeux",
    },

    // ========================================================
    // M — ARTS, CULTURE & LOISIRS
    // ========================================================

    {
      name: "arts",
      label: "ARTS, CULTURE & LOISIRS",
      icon: GiMusicalNotes,
      color: "text-pink-600",
      description:
        "Musique, dessin, peinture, théâtre, cinéma, danse et culture.",
      route: "/domaines/arts",
    },

    // ========================================================
    // N — RECHERCHE & INNOVATION
    // ========================================================

    {
      name: "recherche",
      label: "RECHERCHE & INNOVATION",
      icon: FaFlask,
      color: "text-teal-600",
      description:
        "Méthodologie scientifique, expérimentation, recherche et innovation.",
      route: "/domaines/recherche",
    },

    // ========================================================
    // O — SAVOIRS & COMPÉTENCES AFRICAINS
    // ========================================================

    {
      name: "afrique",
      label: "SAVOIRS & COMPÉTENCES AFRICAINS",
      icon: FaGlobeAfrica,
      color: "text-yellow-600",
      description:
        "Cultures, langues, agriculture, technologies et savoir-faire africains.",
      route: "/domaines/afrique",
    },

    // ========================================================
    // P — AUTRES SAVOIRS & COMPÉTENCES
    // ========================================================

    {
      name: "autres",
      label: "AUTRES SAVOIRS & COMPÉTENCES",
      icon: FaLightbulb,
      color: "text-yellow-500",
      description:
        "Tout savoir ou compétence enseignable qui ne trouve pas encore sa catégorie.",
      route: "/domaines/autres",
    },
  ];

  // ==========================================================
  // STYLE DES CARTES
  // ==========================================================

  const cardStyle =
    "flex flex-col items-center justify-center gap-3 " +
    "bg-white/90 dark:bg-gray-700 shadow-lg rounded-xl " +
    "p-4 text-center hover:bg-blue-100 dark:hover:bg-blue-900 " +
    "transition text-sm sm:text-base font-semibold " +
    "text-gray-800 dark:text-white";

  // ==========================================================
  // CHARGEMENT
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Chargement...
      </div>
    );
  }

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const handleChoice = (domaine: { route: string }) => {
    navigate(domaine.route);
  };

  // ==========================================================
  // AFFICHAGE
  // ==========================================================

  return (
    <motion.div
      className="
        min-h-screen
        flex flex-col
        items-center
        justify-center
        px-4
        py-10
        text-white
        z-20
      "
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >

      {/* =====================================================
          TITRE PRINCIPAL
      ====================================================== */}

      <div className="text-center mb-10 max-w-5xl">

        <h1
          className="
            text-3xl
            sm:text-4xl
            md:text-5xl
            font-extrabold
            tracking-tight
            text-white
          "
        >
          CODE
        </h1>

        <h2
          className="
            text-xl
            sm:text-2xl
            md:text-3xl
            font-bold
            text-white
            mt-2
          "
        >
          UNIVERS DU SAVOIR ET DES COMPÉTENCES
        </h2>

        <p
          className="
            mt-4
            text-sm
            sm:text-base
            text-gray-200
            max-w-3xl
            mx-auto
          "
        >
          Explorez les connaissances, les métiers, les technologies
          et les compétences qui permettent à chacun d'apprendre,
          de créer et de construire son avenir.
        </p>

        <p
          className="
            mt-3
            text-sm
            sm:text-base
            italic
            font-semibold
            text-blue-200
          "
        >
          « Tout ce qui est enseignable doit pouvoir
          trouver sa place sur CODE. »
        </p>

      </div>

      {/* =====================================================
          GRILLE DES DOMAINES
      ====================================================== */}

      <div
        className="
          flex
          flex-wrap
          justify-center
          gap-6
          max-w-6xl
        "
      >

        {domaines.map((domaine) => {
          const Icon = domaine.icon;

          return (
            <div
              key={domaine.name}
              className="
                w-40
                sm:w-44
                md:w-48
                h-48
                perspective
                cursor-pointer
              "
            >

              <motion.div
                className="card-3d w-full h-full rounded-xl"
                animate={{
                  rotateY: [0, 360],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  repeatDelay: 10,
                  ease: "easeInOut",
                }}
                onClick={() => handleChoice(domaine)}
                whileHover={{
                  scale: 1.05,
                }}
              >

                {/* ==========================================
                    FACE AVANT
                =========================================== */}

                <div className={`${cardStyle} card-face`}>

                  <Icon
                    className={`text-5xl mb-1 ${domaine.color}`}
                  />

                  <div className="leading-tight">
                    {domaine.label}
                  </div>

                  <p
                    className="
                      text-xs
                      font-normal
                      text-gray-600
                      dark:text-gray-300
                      leading-snug
                    "
                  >
                    {domaine.description}
                  </p>

                </div>

                {/* ==========================================
                    FACE ARRIÈRE
                =========================================== */}

                <div
                  className="
                    card-face
                    card-back
                    bg-cover
                    bg-center
                    rounded-xl
                    shadow-lg
                  "
                  style={{
                    backgroundImage: "url('/coin.svg')",
                  }}
                />

              </motion.div>

            </div>
          );
        })}

      </div>

      {/* =====================================================
          PHILOSOPHIE CODE
      ====================================================== */}

      <div
        className="
          mt-10
          max-w-3xl
          text-center
          text-sm
          sm:text-base
          text-gray-200
        "
      >
        <p>
          <strong>CODE</strong> réunit les connaissances scolaires,
          scientifiques, professionnelles, techniques, artistiques
          et pratiques au sein d'un même univers d'apprentissage.
        </p>
      </div>

      {/* =====================================================
          RETOUR
      ====================================================== */}

      <button
        onClick={() => navigate("/matiere")}
        className="
          mt-10
          px-6
          py-3
          bg-white/80
          dark:bg-gray-600
          hover:bg-white
          dark:hover:bg-gray-500
          rounded-full
          text-sm
          text-gray-800
          dark:text-white
          transition
          font-medium
        "
      >
        ⬅️ Retour
      </button>

      {/* =====================================================
          CSS CARTES 3D
      ====================================================== */}

      <style>{`
        .perspective {
          perspective: 1000px;
        }

        .card-3d {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
        }

        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 1rem;
          padding: 10px;
        }

        .card-back {
          transform: rotateY(180deg);
        }
      `}</style>

    </motion.div>
  );
};

export default Etudiant;

