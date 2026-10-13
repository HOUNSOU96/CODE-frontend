
// CODE — INFORMATIQUE
// UNIVERS DU SAVOIR ET DES COMPÉTENCES

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// ============================================================
// COMPOSANT
// ============================================================

const Informatique: React.FC = () => {
  const navigate = useNavigate();

  // ==========================================================
  // LES SOUS-DOMAINES DE L'INFORMATIQUE
  // ==========================================================

  const sousDomaines = [
    {
      name: "algorithmique",
      label: "ALGORITHMIQUE",
      icon: "🧠",
      color: "text-blue-600",
      description:
        "Étude des algorithmes, de la logique, des structures de données et des méthodes de résolution de problèmes.",
      route: "/domaines/academique/informatique/algorithmique",
    },

    {
      name: "systemes",
      label: "SYSTÈMES INFORMATIQUES",
      icon: "💻",
      color: "text-indigo-600",
      description:
        "Compréhension des systèmes d'exploitation, de l'architecture des ordinateurs et du fonctionnement des systèmes informatiques.",
      route: "/domaines/academique/informatique/systemes",
    },

    {
      name: "bases-donnees",
      label: "BASES DE DONNÉES",
      icon: "🗄️",
      color: "text-green-600",
      description:
        "Organisation, stockage, gestion, interrogation et sécurisation des données informatiques.",
      route: "/domaines/academique/informatique/bases-donnees",
    },

    {
      name: "reseaux-informatiques",
      label: "RÉSEAUX INFORMATIQUES",
      icon: "🌐",
      color: "text-cyan-600",
      description:
        "Communication entre ordinateurs, protocoles, réseaux, Internet et infrastructures numériques.",
      route: "/domaines/academique/informatique/reseaux-informatiques",
    },

    {
      name: "genie-logiciel",
      label: "GÉNIE LOGICIEL",
      icon: "⚙️",
      color: "text-orange-600",
      description:
        "Conception, développement, test, déploiement et maintenance des logiciels.",
      route: "/domaines/academique/informatique/genie-logiciel",
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

  const handleChoice = (sousDomaine: { route: string }) => {
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
          INFORMATIQUE
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
          Explorez les différents sous-domaines de l'informatique
          et développez progressivement vos compétences numériques.
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
          « Comprendre l'informatique, c'est apprendre à
          transformer l'information en solutions. »
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

        {sousDomaines.map((sousDomaine) => (

          <div
            key={sousDomaine.name}
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

                <div
                  className={`
                    text-5xl
                    mb-1
                    ${sousDomaine.color}
                  `}
                >
                  {sousDomaine.icon}
                </div>

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
          <strong>CODE</strong> organise l'informatique en plusieurs
          sous-domaines afin de permettre à chaque apprenant de
          progresser des fondements de l'informatique vers des
          compétences plus avancées.
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

export default Informatique;

