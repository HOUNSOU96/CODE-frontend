
// CODE — FORMATIONS ACADÉMIQUES — PHYSIQUE

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  FaAtom,
  FaCogs,
  FaBolt,
  FaLightbulb,
  FaTemperatureHigh,
  FaWaveSquare,
  FaMagnet,
  FaRocket,
} from "react-icons/fa";

// ============================================================
// COMPOSANT
// ============================================================

const Physique: React.FC = () => {
  const navigate = useNavigate();

  // ==========================================================
  // LES GRANDES NOTIONS DE PHYSIQUE
  // ==========================================================

  const notions = [
    {
      id: "mecanique",
      label: "MÉCANIQUE",
      icon: FaCogs,
      color: "text-blue-600",
      description:
        "Étude des mouvements, des forces, de l'équilibre et des interactions mécaniques.",
    },

    {
      id: "electricite-physique",
      label: "ÉLECTRICITÉ",
      icon: FaBolt,
      color: "text-yellow-500",
      description:
        "Courant électrique, tension, résistance, circuits et lois de l'électricité.",
    },

    {
      id: "optique",
      label: "OPTIQUE",
      icon: FaLightbulb,
      color: "text-amber-500",
      description:
        "Lumière, propagation, réflexion, réfraction, lentilles et systèmes optiques.",
    },

    {
      id: "thermodynamique",
      label: "THERMODYNAMIQUE",
      icon: FaTemperatureHigh,
      color: "text-red-600",
      description:
        "Température, chaleur, énergie, transformations et lois de la thermodynamique.",
    },

    {
      id: "ondes",
      label: "ONDES ET VIBRATIONS",
      icon: FaWaveSquare,
      color: "text-purple-600",
      description:
        "Vibrations, propagation des ondes, fréquence, longueur d'onde et phénomènes ondulatoires.",
    },

    {
      id: "electromagnetisme",
      label: "ÉLECTROMAGNÉTISME",
      icon: FaMagnet,
      color: "text-indigo-600",
      description:
        "Champs électriques et magnétiques, induction et interactions électromagnétiques.",
    },

    {
      id: "physique-moderne",
      label: "PHYSIQUE MODERNE",
      icon: FaAtom,
      color: "text-violet-600",
      description:
        "Relativité, mécanique quantique, physique atomique et phénomènes modernes.",
    },

    {
      id: "physique-nucleaire",
      label: "PHYSIQUE NUCLÉAIRE",
      icon: FaAtom,
      color: "text-green-600",
      description:
        "Noyau atomique, radioactivité, réactions nucléaires et énergie nucléaire.",
    },

    {
      id: "physique-spatiale",
      label: "PHYSIQUE SPATIALE",
      icon: FaRocket,
      color: "text-cyan-600",
      description:
        "Physique de l'espace, gravitation, corps célestes et phénomènes spatiaux.",
    },
  ];

  // ==========================================================
  // NAVIGATION VERS L'ÉVALUATION
  // ==========================================================

  const handleChoice = (id: string) => {
    navigate(`/evaluation?notion=${id}`);
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
          PHYSIQUE
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
          Explorez les lois, les phénomènes et les modèles physiques
          permettant de comprendre le fonctionnement du monde qui nous entoure.
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
          « Comprendre la physique, c'est apprendre à lire les lois
          qui gouvernent la nature. »
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

                onClick={() => handleChoice(notion.id)}

                whileHover={{
                  scale: 1.05,
                }}
              >

                {/* ==========================================
                    FACE AVANT
                =========================================== */}

                <div
                  className="
                    card-face
                    flex
                    flex-col
                    items-center
                    justify-center
                    gap-3
                    bg-white/90
                    dark:bg-gray-700
                    shadow-lg
                    rounded-xl
                    p-4
                    text-center
                    text-sm
                    sm:text-base
                    font-semibold
                    text-gray-800
                    dark:text-white
                  "
                >

                  <Icon
                    className={`
                      text-5xl
                      mb-1
                      ${notion.color}
                    `}
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
          <strong>CODE</strong> permet d'explorer progressivement
          les différentes branches de la physique et de développer
          une compréhension scientifique des phénomènes naturels.
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

export default Physique;

