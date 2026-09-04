
// CODE — MATHÉMATIQUES
// Univers du savoir et des compétences

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";

// ============================================================
// ICÔNES
// ============================================================

import {
  FaCalculator,
  FaSuperscript,
  FaShapes,
  FaChartLine,
  FaDice,
  FaChartBar,
  FaBrain,
  FaProjectDiagram,
  FaCogs,
} from "react-icons/fa";

// ============================================================
// TYPE
// ============================================================

interface Notion {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  route: string;
}

// ============================================================
// COMPOSANT
// ============================================================

const Mathematiques: React.FC = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();

  // ==========================================================
  // LES GRANDES NOTIONS DES MATHÉMATIQUES
  // ==========================================================

  const notions: Notion[] = [
    // ========================================================
    // 1 — NOMBRES ET CALCULS
    // ========================================================

    {
      id: "nombres-calculs",
      label: "NOMBRES ET CALCULS",
      description:
        "Nombres, opérations, fractions, puissances, racines, divisibilité et calcul numérique.",
      icon: FaCalculator,
      color: "text-blue-600",
      route:
        "/domaines/academique/mathematiques/nombres-et-calculs",
    },

    // ========================================================
    // 2 — ALGÈBRE
    // ========================================================

    {
      id: "algebre",
      label: "ALGÈBRE",
      description:
        "Expressions algébriques, équations, inéquations, systèmes, fonctions et structures algébriques.",
      icon: FaSuperscript,
      color: "text-purple-600",
      route:
        "/domaines/academique/mathematiques/algebre",
    },

    // ========================================================
    // 3 — GÉOMÉTRIE
    // ========================================================

    {
      id: "geometrie",
      label: "GÉOMÉTRIE",
      description:
        "Figures, constructions, transformations, propriétés géométriques, vecteurs et espaces.",
      icon: FaShapes,
      color: "text-green-600",
      route:
        "/domaines/academique/mathematiques/geometrie",
    },

    // ========================================================
    // 4 — ANALYSE
    // ========================================================

    {
      id: "analyse",
      label: "ANALYSE",
      description:
        "Suites, limites, dérivées, intégrales, fonctions et étude des variations.",
      icon: FaChartLine,
      color: "text-red-600",
      route:
        "/domaines/academique/mathematiques/analyse",
    },

    // ========================================================
    // 5 — PROBABILITÉS
    // ========================================================

    {
      id: "probabilites",
      label: "PROBABILITÉS",
      description:
        "Hasard, événements, probabilités conditionnelles, variables aléatoires et lois.",
      icon: FaDice,
      color: "text-orange-600",
      route:
        "/domaines/academique/mathematiques/probabilites",
    },

    // ========================================================
    // 6 — STATISTIQUES
    // ========================================================

    {
      id: "statistiques",
      label: "STATISTIQUES",
      description:
        "Collecte, organisation, représentation et analyse des données statistiques.",
      icon: FaChartBar,
      color: "text-cyan-600",
      route:
        "/domaines/academique/mathematiques/statistiques",
    },

    // ========================================================
    // 7 — LOGIQUE MATHÉMATIQUE
    // ========================================================

    {
      id: "logique-mathematique",
      label: "LOGIQUE MATHÉMATIQUE",
      description:
        "Propositions, raisonnements, démonstrations, ensembles, relations et logique formelle.",
      icon: FaBrain,
      color: "text-pink-600",
      route:
        "/domaines/academique/mathematiques/logique-mathematique",
    },

    // ========================================================
    // 8 — MATHÉMATIQUES DISCRÈTES
    // ========================================================

    {
      id: "mathematiques-discretes",
      label: "MATHÉMATIQUES DISCRÈTES",
      description:
        "Combinatoire, graphes, arithmétique, ensembles finis et structures discrètes.",
      icon: FaProjectDiagram,
      color: "text-indigo-600",
      route:
        "/domaines/academique/mathematiques/mathematiques-discretes",
    },

    // ========================================================
    // 9 — MATHÉMATIQUES APPLIQUÉES
    // ========================================================

    {
      id: "mathematiques-appliquees",
      label: "MATHÉMATIQUES APPLIQUÉES",
      description:
        "Modélisation, optimisation, calcul numérique et applications des mathématiques aux sciences.",
      icon: FaCogs,
      color: "text-amber-600",
      route:
        "/domaines/academique/mathematiques/mathematiques-appliquees",
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

  const handleChoice = (notion: Notion) => {
    navigate(notion.route);
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
          MATHÉMATIQUES
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
          Explorez les différentes branches des mathématiques,
          des nombres et calculs jusqu'aux mathématiques appliquées.
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
          « Comprendre les mathématiques, c'est apprendre à
          raisonner, modéliser et résoudre. »
        </p>

      </div>

      {/* =====================================================
          GRILLE DES NOTIONS
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

        {notions.map((notion) => {
          const Icon = notion.icon;

          return (
            <div
              key={notion.id}
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
                onClick={() => handleChoice(notion)}
                whileHover={{
                  scale: 1.05,
                }}
              >

                {/* ==========================================
                    FACE AVANT
                =========================================== */}

                <div className={`${cardStyle} card-face`}>

                  <Icon
                    className={`text-5xl mb-1 ${notion.color}`}
                  />

                  <div className="leading-tight">
                    {notion.label}
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
                    {notion.description}
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
          PHILOSOPHIE
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
          <strong>CODE</strong> organise les mathématiques
          en différents domaines afin de permettre à chacun
          de progresser progressivement, de construire ses
          connaissances et de développer son raisonnement.
        </p>
      </div>

      {/* =====================================================
          RETOUR
      ====================================================== */}

      <button
        onClick={() => navigate("/domaines/academique")}
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

export default Mathematiques;

