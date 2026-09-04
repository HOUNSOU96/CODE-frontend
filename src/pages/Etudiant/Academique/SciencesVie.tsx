
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// ============================================================
// CODE — SCIENCES DE LA VIE
// ============================================================

interface SousDomaine {
  id: string;
  titre: string;
  description: string;
  route: string;
}

// ============================================================
// SOUS-DOMAINES DES SCIENCES DE LA VIE
// ============================================================

const sousDomaines: SousDomaine[] = [
  {
    id: "biologie-cellulaire",
    titre: "Biologie cellulaire",
    description:
      "Étude de la structure, du fonctionnement et de l'organisation des cellules.",
    route: "/evaluation/biologie-cellulaire",
  },
  {
    id: "genetique",
    titre: "Génétique",
    description:
      "Étude des gènes, de l'hérédité, de la transmission des caractères et de la variation.",
    route: "/evaluation/genetique",
  },
  {
    id: "microbiologie",
    titre: "Microbiologie",
    description:
      "Étude des micro-organismes tels que les bactéries, les virus, les champignons et les parasites.",
    route: "/evaluation/microbiologie",
  },
  {
    id: "physiologie",
    titre: "Physiologie",
    description:
      "Étude du fonctionnement des organismes vivants et de leurs différents systèmes.",
    route: "/evaluation/physiologie",
  },
  {
    id: "ecologie",
    titre: "Écologie",
    description:
      "Étude des relations entre les êtres vivants et leur environnement.",
    route: "/evaluation/ecologie",
  },
  {
    id: "evolution",
    titre: "Évolution",
    description:
      "Étude de l'évolution des êtres vivants et des mécanismes à l'origine de leur diversité.",
    route: "/evaluation/evolution",
  },
];

// ============================================================
// COMPOSANT
// ============================================================

const SciencesVie: React.FC = () => {
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
          SCIENCES DE LA VIE
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
          les êtres vivants, leur organisation, leur fonctionnement,
          leur diversité et leur évolution.
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
          « Comprendre le vivant, c'est comprendre la richesse
          et la diversité de la vie. »
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
                    text-green-600
                  "
                >
                  🧬
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
          les différentes disciplines consacrées à l'étude du vivant,
          de son organisation, de son fonctionnement et de son évolution.
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

export default SciencesVie;

