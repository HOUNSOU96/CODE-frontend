
// CODE — LITTÉRATURE & ARTS
// Univers du savoir et des compétences

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";

import {
  FaBookOpen,
  FaPenNib,
  FaTheaterMasks,
  FaLandmark,
  FaFilm,
  FaMusic,
} from "react-icons/fa";

// ============================================================
// TYPES
// ============================================================

interface Domaine {
  id: string;
  label: string;
  description: string;
  color: string;
  icon: React.ElementType;
}

// ============================================================
// COMPOSANT
// ============================================================

const LitteratureArts: React.FC = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();

  // ==========================================================
  // SOUS-DOMAINES
  // ==========================================================

  const sousDomaines: Domaine[] = [
    {
      id: "litterature",
      label: "LITTÉRATURE",
      description:
        "Étude des œuvres littéraires, des genres, des auteurs et des grandes traditions littéraires.",
      color: "text-blue-600",
      icon: FaBookOpen,
    },

    {
      id: "poesie",
      label: "POÉSIE",
      description:
        "Découverte de la poésie, des formes poétiques, des figures de style et de l'expression poétique.",
      color: "text-pink-600",
      icon: FaPenNib,
    },

    {
      id: "theatre",
      label: "THÉÂTRE",
      description:
        "Étude de l'art dramatique, des pièces, des personnages, de la mise en scène et du jeu théâtral.",
      color: "text-purple-600",
      icon: FaTheaterMasks,
    },

    {
      id: "histoire-art",
      label: "HISTOIRE DE L'ART",
      description:
        "Découverte des œuvres, des artistes, des mouvements artistiques et de l'évolution de l'art.",
      color: "text-amber-600",
      icon: FaLandmark,
    },

    {
      id: "cinema",
      label: "CINÉMA",
      description:
        "Compréhension du langage cinématographique, des genres, de la réalisation et de l'histoire du cinéma.",
      color: "text-red-600",
      icon: FaFilm,
    },

    {
      id: "musique",
      label: "MUSIQUE",
      description:
        "Découverte du langage musical, des œuvres, des instruments, des styles et de l'histoire de la musique.",
      color: "text-green-600",
      icon: FaMusic,
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

  const handleChoice = (domaine: Domaine) => {
    navigate(`/evaluation/academique/litterature-arts/${domaine.id}`);
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
          <FaBookOpen className="text-6xl text-blue-400" />
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
          LITTÉRATURE & ARTS
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
          Explorez la littérature, la poésie, le théâtre,
          le cinéma, la musique et les différentes formes
          d'expression artistique.
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
          « Les arts permettent à l'être humain de comprendre,
          d'exprimer et de transmettre sa vision du monde. »
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

        {sousDomaines.map((domaine) => {
          const Icon = domaine.icon;

          return (
            <div
              key={domaine.id}
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
          <strong>CODE</strong> considère la littérature et les arts
          comme des moyens essentiels de développer la créativité,
          la sensibilité, la culture et la capacité d'expression.
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

export default LitteratureArts;

