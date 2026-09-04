
// CODE — LANGUES
// Univers du savoir et des compétences

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";

import {
  FaLanguage,
  FaFlag,
  FaGlobeAfrica,
} from "react-icons/fa";

// ============================================================
// TYPES
// ============================================================

interface Langue {
  id: string;
  label: string;
  description: string;
  color: string;
}

// ============================================================
// COMPOSANT
// ============================================================

const Langues: React.FC = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();

  // ==========================================================
  // LANGUES
  // ==========================================================

  const langues: Langue[] = [
    {
      id: "francais",
      label: "FRANÇAIS",
      description:
        "Compréhension, expression orale et écrite, grammaire, vocabulaire et littérature.",
      color: "text-blue-600",
    },

    {
      id: "anglais",
      label: "ANGLAIS",
      description:
        "Communication, compréhension, expression, vocabulaire, grammaire et culture anglophone.",
      color: "text-red-600",
    },

    {
      id: "espagnol",
      label: "ESPAGNOL",
      description:
        "Communication, compréhension, expression, grammaire, vocabulaire et culture hispanique.",
      color: "text-yellow-600",
    },

    {
      id: "allemand",
      label: "ALLEMAND",
      description:
        "Compréhension, expression, grammaire, vocabulaire et communication en allemand.",
      color: "text-gray-700",
    },

    {
      id: "langues-africaines",
      label: "LANGUES AFRICAINES",
      description:
        "Apprentissage, pratique, préservation et valorisation des langues africaines.",
      color: "text-emerald-600",
    },

    {
      id: "linguistique",
      label: "LINGUISTIQUE",
      description:
        "Étude du langage, des langues, de leur structure, de leur évolution et de leur fonctionnement.",
      color: "text-violet-600",
    },

    {
      id: "communication",
      label: "COMMUNICATION",
      description:
        "Techniques d'expression, prise de parole, écoute, argumentation et communication efficace.",
      color: "text-cyan-600",
    },

    {
      id: "traduction",
      label: "TRADUCTION",
      description:
        "Techniques de traduction, interprétation et passage d'une langue à une autre.",
      color: "text-orange-600",
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
  // NAVIGATION VERS EVALUATION
  // ==========================================================

  const handleChoice = (langue: Langue) => {
    navigate(`/evaluation/academique/langues/${langue.id}`);
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
          <FaLanguage className="text-6xl text-blue-400" />
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
          LANGUES
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
          Développez votre capacité à comprendre, communiquer,
          lire et écrire dans différentes langues.
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
          « Apprendre une langue, c'est découvrir une nouvelle
          manière de comprendre le monde. »
        </p>

      </div>

      {/* =====================================================
          GRILLE DES LANGUES
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

        {langues.map((langue) => (
          <div
            key={langue.id}
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
              onClick={() => handleChoice(langue)}
              whileHover={{
                scale: 1.05,
              }}
            >

              {/* ==========================================
                  FACE AVANT
              =========================================== */}

              <div className={`${cardStyle} card-face`}>

                {langue.id === "langues-africaines" ? (
                  <FaGlobeAfrica
                    className={`text-5xl mb-1 ${langue.color}`}
                  />
                ) : (
                  <FaFlag
                    className={`text-5xl mb-1 ${langue.color}`}
                  />
                )}

                <div className="leading-tight">
                  {langue.label}
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
                  {langue.description}
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
        ))}

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
          <strong>CODE</strong> considère les langues comme des
          compétences fondamentales permettant d'apprendre,
          de communiquer et de transmettre les connaissances.
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

export default Langues;

