
// CODE — FORMATIONS ACADÉMIQUES
// Univers du savoir et des compétences

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  FaCalculator,
  FaAtom,
  FaFlask,
  FaDna,
  FaGlobeAfrica,
  FaLaptopCode,
  FaLanguage,
  FaBook,
  FaLandmark,
} from "react-icons/fa";

// ============================================================
// TYPES
// ============================================================

interface SousDomaine {
  id: string;
  titre: string;
  description: string;
  route: string;
  color: string;
  icon: React.ElementType;
}

// ============================================================
// COMPOSANT
// ============================================================

const Academique: React.FC = () => {
  const navigate = useNavigate();

  // ==========================================================
  // SOUS-DOMAINES DES FORMATIONS ACADÉMIQUES
  // ==========================================================

  const sousDomaines: SousDomaine[] = [

    // ========================================================
    // 1 — MATHÉMATIQUES
    // ========================================================

    {
      id: "mathematiques",
      titre: "MATHÉMATIQUES",
      description:
        "Nombres, algèbre, géométrie, analyse, probabilités, statistiques et logique.",
      route: "/domaines/academique/mathematiques",
      color: "text-blue-600",
      icon: FaCalculator,
    },

    // ========================================================
    // 2 — PHYSIQUE
    // ========================================================

    {
      id: "physique",
      titre: "PHYSIQUE",
      description:
        "Mécanique, électricité, optique, thermodynamique, ondes et électromagnétisme.",
      route: "/domaines/academique/physique",
      color: "text-indigo-600",
      icon: FaAtom,
    },

    // ========================================================
    // 3 — CHIMIE
    // ========================================================

    {
      id: "chimie",
      titre: "CHIMIE",
      description:
        "Chimie générale, organique, minérale, analytique, biochimie et thermochimie.",
      route: "/domaines/academique/chimie",
      color: "text-purple-600",
      icon: FaFlask,
    },

    // ========================================================
    // 4 — SCIENCES DE LA VIE
    // ========================================================

    {
      id: "sciences-vie",
      titre: "SCIENCES DE LA VIE",
      description:
        "Biologie, génétique, microbiologie, physiologie, écologie et évolution.",
      route: "/domaines/academique/sciences-vie",
      color: "text-green-600",
      icon: FaDna,
    },

    // ========================================================
    // 5 — SCIENCES DE LA TERRE
    // ========================================================

    {
      id: "sciences-terre",
      titre: "SCIENCES DE LA TERRE",
      description:
        "Géologie, géophysique, météorologie, climatologie et hydrologie.",
      route: "/domaines/academique/sciences-terre",
      color: "text-emerald-600",
      icon: FaGlobeAfrica,
    },

    // ========================================================
    // 6 — INFORMATIQUE
    // ========================================================

    {
      id: "informatique",
      titre: "INFORMATIQUE",
      description:
        "Algorithmique, programmation, systèmes, bases de données, réseaux et génie logiciel.",
      route: "/domaines/academique/informatique",
      color: "text-cyan-600",
      icon: FaLaptopCode,
    },

    // ========================================================
    // 7 — LANGUES
    // ========================================================

    {
      id: "langues",
      titre: "LANGUES",
      description:
        "Français, anglais, espagnol, allemand et langues africaines.",
      route: "/domaines/academique/langues",
      color: "text-orange-600",
      icon: FaLanguage,
    },

    // ========================================================
    // 8 — SCIENCES HUMAINES ET SOCIALES
    // ========================================================

    {
      id: "sciences-humaines-sociales",
      titre: "SCIENCES HUMAINES & SOCIALES",
      description:
        "Histoire, géographie, sociologie, psychologie, économie et philosophie.",
      route: "/domaines/academique/sciences-humaines-sociales",
      color: "text-amber-600",
      icon: FaLandmark,
    },

    // ========================================================
    // 9 — LITTÉRATURE ET ARTS
    // ========================================================

    {
      id: "litterature-arts",
      titre: "LITTÉRATURE & ARTS",
      description:
        "Littérature, poésie, théâtre, histoire de l'art et expression artistique.",
      route: "/domaines/academique/litterature-arts",
      color: "text-pink-600",
      icon: FaBook,
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
  // NAVIGATION
  // ==========================================================

  const handleChoice = (sousDomaine: SousDomaine) => {
    navigate(sousDomaine.route);
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
          TITRE
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
          FORMATIONS ACADÉMIQUES
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
          Explorez les grandes disciplines académiques permettant
          d'acquérir des connaissances scientifiques, linguistiques,
          humaines et techniques.
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
          « Comprendre le monde commence par apprendre à le connaître. »
        </p>

      </div>

      {/* =====================================================
          GRILLE DES SOUS-DOMAINES
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

        {sousDomaines.map((sousDomaine) => {

          const Icon = sousDomaine.icon;

          return (
            <div
              key={sousDomaine.id}
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
                onClick={() => handleChoice(sousDomaine)}
                whileHover={{
                  scale: 1.05,
                }}
              >

                {/* ==========================================
                    FACE AVANT
                =========================================== */}

                <div className={`${cardStyle} card-face`}>

                  <Icon
                    className={`text-5xl mb-1 ${sousDomaine.color}`}
                  />

                  <div className="leading-tight">
                    {sousDomaine.titre}
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
                    {sousDomaine.description}
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
          <strong>CODE</strong> organise les formations académiques
          en disciplines afin de permettre à chaque apprenant
          d'explorer progressivement les connaissances qui
          correspondent à ses objectifs.
        </p>

      </div>

      {/* =====================================================
          RETOUR
      ====================================================== */}

      <button
        onClick={() => navigate("/etudiant")}
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

export default Academique;

