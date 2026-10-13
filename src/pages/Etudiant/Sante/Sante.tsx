
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  FaHeartbeat,
  FaUserMd,
  FaAppleAlt,
  FaPills,
  FaHandsWash,
  FaHospital,
  FaUserNurse,
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

const Sante: React.FC = () => {
  const navigate = useNavigate();

  // ==========================================================
  // SOUS-DOMAINES DE LA SANTÉ
  // ==========================================================

  const sousDomaines: SousDomaine[] = [

    // ========================================================
    // 1 — MÉDECINE
    // ========================================================

    {
      id: "medecine",
      titre: "MÉDECINE",
      description:
        "Anatomie, physiologie, maladies, prévention, diagnostic et principes des soins médicaux.",
      route: "/domaines/sante/medecine",
      color: "text-red-600",
      icon: FaUserMd,
    },

    // ========================================================
    // 2 — SOINS INFIRMIERS
    // ========================================================

    {
      id: "soins-infirmiers",
      titre: "SOINS INFIRMIERS",
      description:
        "Soins aux patients, surveillance, hygiène, prévention et accompagnement des personnes malades.",
      route: "/domaines/sante/soins-infirmiers",
      color: "text-pink-600",
      icon: FaUserNurse,
    },

    // ========================================================
    // 3 — NUTRITION
    // ========================================================

    {
      id: "nutrition",
      titre: "NUTRITION",
      description:
        "Alimentation, nutriments, équilibre alimentaire, besoins nutritionnels et santé.",
      route: "/domaines/sante/nutrition",
      color: "text-green-600",
      icon: FaAppleAlt,
    },

    // ========================================================
    // 4 — PHARMACIE
    // ========================================================

    {
      id: "pharmacie",
      titre: "PHARMACIE",
      description:
        "Médicaments, formes pharmaceutiques, usage rationnel et principes de pharmacologie.",
      route: "/domaines/sante/pharmacie",
      color: "text-purple-600",
      icon: FaPills,
    },

    // ========================================================
    // 5 — HYGIÈNE
    // ========================================================

    {
      id: "hygiene",
      titre: "HYGIÈNE",
      description:
        "Hygiène personnelle, hygiène alimentaire, assainissement et prévention des infections.",
      route: "/domaines/sante/hygiene",
      color: "text-cyan-600",
      icon: FaHandsWash,
    },

    // ========================================================
    // 6 — SANTÉ PUBLIQUE
    // ========================================================

    {
      id: "sante-publique",
      titre: "SANTÉ PUBLIQUE",
      description:
        "Prévention, épidémiologie, promotion de la santé et protection de la santé des populations.",
      route: "/domaines/sante/sante-publique",
      color: "text-blue-600",
      icon: FaHospital,
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
          SANTÉ, BIEN-ÊTRE & SPORT
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
          Explorez les connaissances et compétences liées à la santé,
          à la prévention, à l'alimentation, aux soins et au bien-être
          des personnes et des populations.
        </p>

        <p
          className="
            mt-3
            text-sm
            sm:text-base
            italic
            font-semibold
            text-red-200
          "
        >
          « Prévenir, comprendre et prendre soin pour mieux vivre. »
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
          <strong>CODE</strong> rassemble les connaissances et
          compétences nécessaires pour mieux comprendre la santé,
          prévenir les risques et contribuer au bien-être individuel
          et collectif.
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

export default Sante;

