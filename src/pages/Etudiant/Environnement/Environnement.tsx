import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  FaLeaf,
  FaSeedling,
  FaGlobeAfrica,
  FaCloudSun,
  FaTint,
  FaRecycle,
  FaSolarPanel,
} from "react-icons/fa";

// ============================================================
// CODE — ENVIRONNEMENT & DÉVELOPPEMENT DURABLE
// ============================================================

const Environnement: React.FC = () => {
  const navigate = useNavigate();

  // ==========================================================
  // SOUS-DOMAINES DE L'ENVIRONNEMENT
  // ==========================================================

  const sousDomaines = [
    {
      name: "ecologie",
      label: "ÉCOLOGIE",
      icon: FaLeaf,
      color: "text-green-600",
      description:
        "Comprendre les relations entre les êtres vivants et leur environnement.",
      route: "/domaines/environnement/ecologie",
    },

    {
      name: "biodiversite",
      label: "BIODIVERSITÉ",
      icon: FaGlobeAfrica,
      color: "text-emerald-600",
      description:
        "Découvrir la diversité du vivant et les moyens de la préserver.",
      route: "/domaines/environnement/biodiversite",
    },

    {
      name: "agriculture-durable",
      label: "AGRICULTURE DURABLE",
      icon: FaSeedling,
      color: "text-lime-600",
      description:
        "Développer une agriculture productive, responsable et respectueuse des ressources.",
      route: "/domaines/environnement/agriculture-durable",
    },

    {
      name: "climat",
      label: "CLIMAT",
      icon: FaCloudSun,
      color: "text-sky-600",
      description:
        "Comprendre le climat, ses évolutions et les changements climatiques.",
      route: "/domaines/environnement/climat",
    },

    {
      name: "eau",
      label: "EAU",
      icon: FaTint,
      color: "text-blue-600",
      description:
        "Étudier les ressources en eau, leur gestion et leur préservation.",
      route: "/domaines/environnement/eau",
    },

    {
      name: "energies-renouvelables",
      label: "ÉNERGIES RENOUVELABLES",
      icon: FaSolarPanel,
      color: "text-yellow-600",
      description:
        "Découvrir les sources d'énergie renouvelable et leurs applications.",
      route: "/domaines/environnement/energies-renouvelables",
    },

    {
      name: "gestion-dechets",
      label: "GESTION DES DÉCHETS",
      icon: FaRecycle,
      color: "text-teal-600",
      description:
        "Apprendre à réduire, trier, recycler et valoriser les déchets.",
      route: "/domaines/environnement/gestion-dechets",
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
          ENVIRONNEMENT & DÉVELOPPEMENT DURABLE
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
          Explorez les connaissances et les compétences nécessaires
          pour comprendre notre environnement, préserver les ressources
          naturelles et construire un développement durable.
        </p>

        <p
          className="
            mt-3
            text-sm
            sm:text-base
            italic
            font-semibold
            text-green-200
          "
        >
          « Comprendre notre environnement, c'est apprendre à mieux
          construire notre avenir. »
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
          <strong>CODE</strong> permet à chacun de développer
          les connaissances et les compétences nécessaires pour
          comprendre, protéger et valoriser son environnement.
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

export default Environnement;