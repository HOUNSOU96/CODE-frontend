
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  FaShieldAlt,
  FaDatabase,
  FaPaintBrush,
  FaMicrochip,
  FaBrain,
  FaCode,
  FaNetworkWired,
  FaRobot,
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

const Technologies: React.FC = () => {
  const navigate = useNavigate();

  // ==========================================================
  // SOUS-DOMAINES DES TECHNOLOGIES
  // ==========================================================

  const sousDomaines: SousDomaine[] = [

    // ========================================================
    // 1 — CYBERSÉCURITÉ
    // ========================================================

    {
      id: "cybersecurite",
      titre: "CYBERSÉCURITÉ",
      description:
        "Protection des systèmes, des réseaux, des données et des infrastructures numériques.",
      route: "/domaines/technologies/cybersecurite",
      color: "text-red-600",
      icon: FaShieldAlt,
    },

    // ========================================================
    // 2 — DATA SCIENCE
    // ========================================================

    {
      id: "data-science",
      titre: "DATA SCIENCE",
      description:
        "Analyse des données, statistiques, visualisation, apprentissage automatique et intelligence des données.",
      route: "/domaines/technologies/data-science",
      color: "text-blue-600",
      icon: FaDatabase,
    },

    // ========================================================
    // 3 — DESIGN NUMÉRIQUE
    // ========================================================

    {
      id: "design-numerique",
      titre: "DESIGN NUMÉRIQUE",
      description:
        "Conception graphique, interfaces, expérience utilisateur, création numérique et multimédia.",
      route: "/domaines/technologies/design-numerique",
      color: "text-pink-600",
      icon: FaPaintBrush,
    },

    // ========================================================
    // 4 — ÉLECTRONIQUE
    // ========================================================

    {
      id: "electronique",
      titre: "ÉLECTRONIQUE",
      description:
        "Circuits, composants électroniques, systèmes embarqués, capteurs et automatisation.",
      route: "/domaines/technologies/electronique",
      color: "text-yellow-600",
      icon: FaMicrochip,
    },

    // ========================================================
    // 5 — INTELLIGENCE ARTIFICIELLE
    // ========================================================

    {
      id: "intelligence-artificielle",
      titre: "INTELLIGENCE ARTIFICIELLE",
      description:
        "Apprentissage automatique, réseaux neuronaux, IA générative, vision, langage et systèmes intelligents.",
      route: "/domaines/technologies/intelligence-artificielle",
      color: "text-violet-600",
      icon: FaBrain,
    },

    // ========================================================
    // 6 — PROGRAMMATION
    // ========================================================

    {
      id: "programmation",
      titre: "PROGRAMMATION",
      description:
        "Algorithmique, langages de programmation, développement logiciel, web, mobile et applications.",
      route: "/domaines/technologies/programmation",
      color: "text-green-600",
      icon: FaCode,
    },

    // ========================================================
    // 7 — RÉSEAUX
    // ========================================================

    {
      id: "reseaux",
      titre: "RÉSEAUX",
      description:
        "Réseaux informatiques, protocoles, télécommunications, infrastructures et services réseau.",
      route: "/domaines/technologies/reseaux",
      color: "text-cyan-600",
      icon: FaNetworkWired,
    },

    // ========================================================
    // 8 — ROBOTIQUE
    // ========================================================

    {
      id: "robotique",
      titre: "ROBOTIQUE",
      description:
        "Conception, programmation, commande et utilisation de robots et de systèmes autonomes.",
      route: "/domaines/technologies/robotique",
      color: "text-orange-600",
      icon: FaRobot,
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
          TECHNOLOGIES
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
          Explorez les technologies qui permettent de concevoir,
          développer, sécuriser et utiliser les systèmes numériques
          et intelligents.
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
          « La technologie transforme les idées en solutions. »
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
          <strong>CODE</strong> rassemble les technologies
          numériques, informatiques et intelligentes afin de
          permettre à chaque apprenant de comprendre les outils
          qui transforment le monde et de développer ses propres
          solutions.
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

export default Technologies;

