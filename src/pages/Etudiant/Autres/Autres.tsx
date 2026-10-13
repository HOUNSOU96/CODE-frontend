
// CODE — AUTRES SAVOIRS & COMPÉTENCES

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";

import {
  FaLightbulb,
  FaBook,
  FaGamepad,
  FaHome,
} from "react-icons/fa";

const Autres: React.FC = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();

  const sousDomaines = [
    {
      id: "competences-transversales",
      titre: "Compétences transversales",
      description:
        "Des compétences utiles dans plusieurs domaines : organisation, communication, résolution de problèmes et adaptation.",
      icon: FaLightbulb,
      color: "text-yellow-500",
      route: "/domaines/autres/competences-transversales",
    },
    {
      id: "culture-generale",
      titre: "Culture générale",
      description:
        "Des connaissances variées permettant de mieux comprendre le monde, les sociétés, les sciences et les cultures.",
      icon: FaBook,
      color: "text-blue-500",
      route: "/domaines/autres/culture-generale",
    },
    {
      id: "loisirs",
      titre: "Loisirs",
      description:
        "Des activités permettant de développer la créativité, la détente, la curiosité et les compétences personnelles.",
      icon: FaGamepad,
      color: "text-purple-500",
      route: "/domaines/autres/loisirs",
    },
    {
      id: "vie-quotidienne",
      titre: "Vie quotidienne",
      description:
        "Les connaissances et compétences nécessaires pour mieux gérer les situations de la vie courante.",
      icon: FaHome,
      color: "text-green-500",
      route: "/domaines/autres/vie-quotidienne",
    },
  ];

  const cardStyle =
    "flex flex-col items-center justify-center gap-3 " +
    "bg-white/90 dark:bg-gray-700 shadow-lg rounded-xl " +
    "p-4 text-center hover:bg-blue-100 dark:hover:bg-blue-900 " +
    "transition text-sm sm:text-base font-semibold " +
    "text-gray-800 dark:text-white";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Chargement...
      </div>
    );
  }

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
          AUTRES SAVOIRS & COMPÉTENCES
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
          Découvrez des connaissances et compétences complémentaires
          utiles à l'apprentissage, à la vie quotidienne et au
          développement personnel.
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
          « Tout savoir utile mérite une place dans l'univers CODE. »
        </p>
      </div>

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
                onClick={() => navigate(sousDomaine.route)}
                whileHover={{
                  scale: 1.05,
                }}
              >
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
          <strong>CODE</strong> permet également d'explorer les
          savoirs qui ne se limitent pas aux disciplines scolaires,
          mais qui sont utiles pour apprendre, vivre, créer et agir.
        </p>
      </div>

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

export default Autres;

