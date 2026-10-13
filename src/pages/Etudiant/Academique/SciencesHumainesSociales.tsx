
// CODE — SCIENCES HUMAINES & SOCIALES
// Univers du savoir et des compétences

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";

import {
  FaHistory,
  FaGlobeAfrica,
  FaUsers,
  FaBrain,
  FaChartLine,
  FaLightbulb,
} from "react-icons/fa";

// ============================================================
// TYPES
// ============================================================

interface SousDomaine {
  id: string;
  label: string;
  description: string;
  color: string;
  icon: React.ElementType;
}

// ============================================================
// COMPOSANT
// ============================================================

const SciencesHumainesSociales: React.FC = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();

  // ==========================================================
  // SOUS-DOMAINES
  // ==========================================================

  const sousDomaines: SousDomaine[] = [
    {
      id: "histoire",
      label: "HISTOIRE",
      description:
        "Étude des sociétés, des civilisations, des événements et des transformations du passé.",
      color: "text-amber-600",
      icon: FaHistory,
    },

    {
      id: "geographie",
      label: "GÉOGRAPHIE",
      description:
        "Étude des territoires, des populations, des milieux, des ressources et des relations entre les sociétés et leur espace.",
      color: "text-green-600",
      icon: FaGlobeAfrica,
    },

    {
      id: "sociologie",
      label: "SOCIOLOGIE",
      description:
        "Étude des sociétés, des groupes sociaux, des comportements collectifs et des relations entre les individus.",
      color: "text-blue-600",
      icon: FaUsers,
    },

    {
      id: "psychologie",
      label: "PSYCHOLOGIE",
      description:
        "Étude des comportements, des processus mentaux, des émotions et du développement de la personne.",
      color: "text-pink-600",
      icon: FaBrain,
    },

    {
      id: "economie",
      label: "ÉCONOMIE",
      description:
        "Étude de la production, de la consommation, des échanges, des marchés et de la gestion des ressources.",
      color: "text-emerald-600",
      icon: FaChartLine,
    },

    {
      id: "philosophie",
      label: "PHILOSOPHIE",
      description:
        "Réflexion critique sur l'être humain, la connaissance, la vérité, la morale, la société et le monde.",
      color: "text-violet-600",
      icon: FaLightbulb,
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

  const handleChoice = (sousDomaine: SousDomaine) => {
    navigate(
      `/evaluation/academique/sciences-humaines-sociales/${sousDomaine.id}`
    );
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

        <div className="flex justify-center mb-4">
          <FaUsers className="text-6xl text-blue-400" />
        </div>

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
          SCIENCES HUMAINES & SOCIALES
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
          Explorez les disciplines qui permettent de comprendre
          l'être humain, les sociétés, les territoires, leur histoire,
          leur fonctionnement et leur évolution.
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
          « Comprendre l'être humain et la société, c'est mieux
          comprendre le monde dans lequel nous vivons. »
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
                    {sousDomaine.label}
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
          <strong>CODE</strong> rassemble les connaissances permettant
          d'étudier l'être humain, les sociétés, les territoires,
          les cultures, les comportements et les grandes idées
          qui façonnent le monde.
        </p>
      </div>

      {/* =====================================================
          RETOUR
      ====================================================== */}

      <button
        onClick={() =>
          navigate("/domaines/academique")
        }
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

export default SciencesHumainesSociales;

