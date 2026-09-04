import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  FaBrain,
  FaClock,
  FaUsers,
  FaUserTie,
  FaLightbulb,
  FaBalanceScale,
} from "react-icons/fa";

const DeveloppementHumain: React.FC = () => {
  const navigate = useNavigate();

  const sousDomaines = [
    {
      name: "developpement-personnel",
      label: "DÉVELOPPEMENT PERSONNEL",
      icon: FaBrain,
      color: "text-pink-600",
      description:
        "Connaissance de soi, confiance en soi, motivation, discipline et amélioration personnelle.",
      route: "/domaines/developpement-humain/developpement-personnel",
    },
    {
      name: "gestion-temps",
      label: "GESTION DU TEMPS",
      icon: FaClock,
      color: "text-blue-600",
      description:
        "Organisation, planification, priorités, productivité et gestion efficace du temps.",
      route: "/domaines/developpement-humain/gestion-temps",
    },
    {
      name: "leadership",
      label: "LEADERSHIP",
      icon: FaUserTie,
      color: "text-purple-600",
      description:
        "Leadership, responsabilité, influence positive, travail d'équipe et conduite de projets.",
      route: "/domaines/developpement-humain/leadership",
    },
    {
      name: "pensee-critique",
      label: "PENSÉE CRITIQUE",
      icon: FaLightbulb,
      color: "text-yellow-600",
      description:
        "Analyse, raisonnement, esprit critique, résolution de problèmes et évaluation des informations.",
      route: "/domaines/developpement-humain/pensee-critique",
    },
    {
      name: "prise-decision",
      label: "PRISE DE DÉCISION",
      icon: FaBalanceScale,
      color: "text-cyan-600",
      description:
        "Analyse des situations, choix, stratégie, gestion des risques et résolution de problèmes.",
      route: "/domaines/developpement-humain/prise-decision",
    },
    {
      name: "relations-humaines",
      label: "RELATIONS HUMAINES",
      icon: FaUsers,
      color: "text-red-600",
      description:
        "Communication, écoute, empathie, coopération, gestion des conflits et relations sociales.",
      route: "/domaines/developpement-humain/relations-humaines",
    },
  ];

  const cardStyle =
    "flex flex-col items-center justify-center gap-3 " +
    "bg-white/90 dark:bg-gray-700 shadow-lg rounded-xl " +
    "p-4 text-center hover:bg-blue-100 dark:hover:bg-blue-900 " +
    "transition text-sm sm:text-base font-semibold " +
    "text-gray-800 dark:text-white";

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
          DÉVELOPPEMENT HUMAIN & COMPÉTENCES DE VIE
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
          Développez les compétences personnelles, intellectuelles
          et sociales nécessaires pour apprendre, agir, communiquer
          et construire votre avenir.
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
          « Se développer soi-même, c'est aussi apprendre à mieux
          comprendre et construire le monde. »
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
                onClick={() => navigate(domaine.route)}
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
          <strong>CODE</strong> considère le développement humain
          comme une composante essentielle de l'apprentissage et
          de l'autonomie de chaque individu.
        </p>
      </div>

      {/* =====================================================
          RETOUR
      ====================================================== */}

      <button
        onClick={() => navigate("/domaines")}
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

export default DeveloppementHumain;