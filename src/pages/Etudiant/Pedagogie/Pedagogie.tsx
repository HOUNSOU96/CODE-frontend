import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  FaChalkboardTeacher,
  FaBookOpen,
  FaClipboardCheck,
  FaBrain,
  FaProjectDiagram,
  FaLaptop,
  FaGraduationCap,
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

const Pedagogie: React.FC = () => {
  const navigate = useNavigate();

  // ==========================================================
  // SOUS-DOMAINES DE LA PÉDAGOGIE
  // ==========================================================

  const sousDomaines: SousDomaine[] = [

    // ========================================================
    // 1 — PÉDAGOGIE GÉNÉRALE
    // ========================================================

    {
      id: "pedagogie-generale",
      titre: "PÉDAGOGIE GÉNÉRALE",
      description:
        "Principes, méthodes, pratiques et théories générales de l'enseignement et de l'apprentissage.",
      route: "/domaines/pedagogie/pedagogie-generale",
      color: "text-blue-600",
      icon: FaChalkboardTeacher,
    },

    // ========================================================
    // 2 — DIDACTIQUE
    // ========================================================

    {
      id: "didactique",
      titre: "DIDACTIQUE",
      description:
        "Étude de l'enseignement et de l'apprentissage des disciplines et des savoirs scolaires.",
      route: "/domaines/pedagogie/didactique",
      color: "text-indigo-600",
      icon: FaBookOpen,
    },

    // ========================================================
    // 3 — ÉVALUATION
    // ========================================================

    {
      id: "evaluation",
      titre: "ÉVALUATION",
      description:
        "Évaluation des apprentissages, conception des épreuves, critères, indicateurs et remédiation.",
      route: "/domaines/pedagogie/evaluation",
      color: "text-green-600",
      icon: FaClipboardCheck,
    },

    // ========================================================
    // 4 — PSYCHOLOGIE DE L'ÉDUCATION
    // ========================================================

    {
      id: "psychologie-education",
      titre: "PSYCHOLOGIE DE L'ÉDUCATION",
      description:
        "Développement de l'apprenant, motivation, mémoire, attention et processus cognitifs.",
      route: "/domaines/pedagogie/psychologie-education",
      color: "text-purple-600",
      icon: FaBrain,
    },

    // ========================================================
    // 5 — INGÉNIERIE PÉDAGOGIQUE
    // ========================================================

    {
      id: "ingenierie-pedagogique",
      titre: "INGÉNIERIE PÉDAGOGIQUE",
      description:
        "Conception, organisation et développement de dispositifs, formations et ressources pédagogiques.",
      route: "/domaines/pedagogie/ingenierie-pedagogique",
      color: "text-orange-600",
      icon: FaProjectDiagram,
    },

    // ========================================================
    // 6 — TECHNOLOGIES ÉDUCATIVES
    // ========================================================

    {
      id: "technologies-educatives",
      titre: "TECHNOLOGIES ÉDUCATIVES",
      description:
        "Utilisation du numérique, des logiciels, des plateformes et de l'intelligence artificielle pour apprendre.",
      route: "/domaines/pedagogie/technologies-educatives",
      color: "text-cyan-600",
      icon: FaLaptop,
    },

    // ========================================================
    // 7 — FORMATION DES ENSEIGNANTS
    // ========================================================

    {
      id: "formation-enseignants",
      titre: "FORMATION DES ENSEIGNANTS",
      description:
        "Développement des compétences professionnelles, pratiques de classe et formation continue des enseignants.",
      route: "/domaines/pedagogie/formation-enseignants",
      color: "text-amber-600",
      icon: FaGraduationCap,
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
          PÉDAGOGIE & TRANSMISSION DU SAVOIR
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
          Explorez les méthodes, les sciences et les outils permettant
          de concevoir, transmettre, évaluer et améliorer les apprentissages.
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
          « Enseigner, c'est permettre à chacun de construire son propre savoir. »
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
          <strong>CODE</strong> rassemble les connaissances et les
          compétences nécessaires pour comprendre les processus
          d'apprentissage et améliorer la transmission des savoirs.
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

export default Pedagogie;