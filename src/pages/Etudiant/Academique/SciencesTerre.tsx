
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// ============================================================
// CODE — SCIENCES DE LA TERRE
// ============================================================

interface SousDomaine {
  id: string;
  titre: string;
  description: string;
  route: string;
}

const sousDomaines: SousDomaine[] = [
  {
    id: "geologie",
    titre: "Géologie",
    description:
      "Étude de la structure, de la composition, de l'histoire et de l'évolution de la Terre.",
    route: "/evaluation/geologie",
  },
  {
    id: "geophysique",
    titre: "Géophysique",
    description:
      "Étude de la Terre à l'aide des méthodes et des lois de la physique.",
    route: "/evaluation/geophysique",
  },
  {
    id: "meteorologie",
    titre: "Météorologie",
    description:
      "Étude de l'atmosphère, du temps et des phénomènes météorologiques.",
    route: "/evaluation/meteorologie",
  },
  {
    id: "climatologie",
    titre: "Climatologie",
    description:
      "Étude des climats, de leur évolution et des phénomènes qui les influencent.",
    route: "/evaluation/climatologie",
  },
  {
    id: "hydrologie",
    titre: "Hydrologie",
    description:
      "Étude de l'eau sur Terre, de son cycle et de sa répartition.",
    route: "/evaluation/hydrologie",
  },
];

// ============================================================
// COMPOSANT
// ============================================================

const SciencesTerre: React.FC = () => {
  const navigate = useNavigate();

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
          SCIENCES DE LA TERRE
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
          Explorez les sciences qui permettent de comprendre
          la structure, le fonctionnement, l'histoire et
          l'évolution de notre planète.
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
          « Comprendre la Terre, c'est comprendre notre environnement
          et notre histoire. »
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

                <div
                  className="
                    text-5xl
                    mb-1
                    text-blue-600
                  "
                >
                  🌍
                </div>

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
          <strong>CODE</strong> permet d'explorer progressivement
          les différentes disciplines consacrées à l'étude de la Terre,
          de son atmosphère et de ses ressources.
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

export default SciencesTerre;

