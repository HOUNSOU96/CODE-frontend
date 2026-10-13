
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  FaSearch,
  FaBook,
  FaChartBar,
  FaDatabase,
  FaPenFancy,
  FaComments,
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

const Recherche: React.FC = () => {
  const navigate = useNavigate();

  // ==========================================================
  // SOUS-DOMAINES DE LA RECHERCHE
  // ==========================================================

  const sousDomaines: SousDomaine[] = [

    // ========================================================
    // 1 — MÉTHODOLOGIE
    // ========================================================

    {
      id: "methodologie",
      titre: "MÉTHODOLOGIE",
      description:
        "Démarche scientifique, formulation des problématiques, hypothèses, méthodes et protocoles de recherche.",
      route: "/domaines/recherche/methodologie",
      color: "text-blue-600",
      icon: FaSearch,
    },

    // ========================================================
    // 2 — ANALYSE DES DONNÉES
    // ========================================================

    {
      id: "analyse-donnees",
      titre: "ANALYSE DES DONNÉES",
      description:
        "Collecte, traitement, exploration, interprétation et visualisation des données de recherche.",
      route: "/domaines/recherche/analyse-donnees",
      color: "text-cyan-600",
      icon: FaDatabase,
    },

    // ========================================================
    // 3 — STATISTIQUES
    // ========================================================

    {
      id: "statistiques",
      titre: "STATISTIQUES",
      description:
        "Statistiques descriptives, inférentielles, tests, estimation, modélisation et interprétation des résultats.",
      route: "/domaines/recherche/statistiques",
      color: "text-green-600",
      icon: FaChartBar,
    },

    // ========================================================
    // 4 — BIBLIOGRAPHIE
    // ========================================================

    {
      id: "bibliographie",
      titre: "BIBLIOGRAPHIE",
      description:
        "Recherche documentaire, sources scientifiques, références, citations et gestion bibliographique.",
      route: "/domaines/recherche/bibliographie",
      color: "text-amber-600",
      icon: FaBook,
    },

    // ========================================================
    // 5 — RÉDACTION SCIENTIFIQUE
    // ========================================================

    {
      id: "redaction-scientifique",
      titre: "RÉDACTION SCIENTIFIQUE",
      description:
        "Rédaction d'articles, mémoires, thèses, rapports scientifiques et autres documents de recherche.",
      route: "/domaines/recherche/redaction-scientifique",
      color: "text-purple-600",
      icon: FaPenFancy,
    },

    // ========================================================
    // 6 — COMMUNICATION SCIENTIFIQUE
    // ========================================================

    {
      id: "communication-scientifique",
      titre: "COMMUNICATION SCIENTIFIQUE",
      description:
        "Présentation, vulgarisation, publication et diffusion des résultats de recherche.",
      route: "/domaines/recherche/communication-scientifique",
      color: "text-pink-600",
      icon: FaComments,
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
          RECHERCHE & INNOVATION
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
          Explorez les méthodes, outils et compétences nécessaires
          pour produire, analyser, rédiger et communiquer des
          connaissances scientifiques.
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
          « Chercher, comprendre, démontrer et transmettre. »
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
          <strong>CODE</strong> accompagne l'apprenant dans
          l'acquisition des compétences nécessaires pour observer,
          questionner, analyser, produire et partager des
          connaissances nouvelles.
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

export default Recherche;

