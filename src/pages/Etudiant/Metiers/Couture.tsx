import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  FaCut,
  FaTshirt,
  FaRuler,
  FaPalette,
  FaGem,
  FaPencilRuler,
} from "react-icons/fa";

interface SousDomaine {
  id: string;
  titre: string;
  description: string;
  route: string;
  color: string;
  icon: React.ElementType;
}

const Couture: React.FC = () => {
  const navigate = useNavigate();

  const sousDomaines: SousDomaine[] = [
    {
      id: "coupe",
      titre: "COUPE",
      description:
        "Techniques de coupe, préparation des tissus et précision des formes.",
      route: "/evaluation",
      color: "text-pink-600",
      icon: FaCut,
    },
    {
      id: "confection",
      titre: "CONFECTION",
      description:
        "Assemblage, couture et réalisation de vêtements et accessoires.",
      route: "/evaluation",
      color: "text-purple-600",
      icon: FaTshirt,
    },
    {
      id: "patronage",
      titre: "PATRONAGE",
      description:
        "Création et adaptation des patrons nécessaires à la confection.",
      route: "/evaluation",
      color: "text-blue-600",
      icon: FaRuler,
    },
    {
      id: "design-mode",
      titre: "DESIGN DE MODE",
      description:
        "Création, conception et développement de modèles vestimentaires.",
      route: "/evaluation",
      color: "text-indigo-600",
      icon: FaPalette,
    },
    {
      id: "broderie",
      titre: "BRODERIE",
      description:
        "Décoration textile, motifs, broderie traditionnelle et moderne.",
      route: "/evaluation",
      color: "text-red-500",
      icon: FaGem,
    },
    {
      id: "dessin-mode",
      titre: "DESSIN DE MODE",
      description:
        "Représentation graphique des vêtements et création de collections.",
      route: "/evaluation",
      color: "text-orange-500",
      icon: FaPencilRuler,
    },
  ];

  const cardStyle =
    "flex flex-col items-center justify-center gap-3 " +
    "bg-white/90 dark:bg-gray-700 shadow-lg rounded-xl " +
    "p-4 text-center hover:bg-blue-100 dark:hover:bg-blue-900 " +
    "transition text-sm sm:text-base font-semibold " +
    "text-gray-800 dark:text-white";

  const handleChoice = (sousDomaine: SousDomaine) => {
    navigate(sousDomaine.route);
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10 text-white z-20"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >

      <div className="text-center mb-10 max-w-5xl">

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
          CODE
        </h1>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-2">
          COUTURE
        </h2>

        <p className="mt-4 text-sm sm:text-base text-gray-200 max-w-3xl mx-auto">
          Découvrez les techniques de conception, de coupe, de confection
          et de décoration des vêtements et accessoires.
        </p>

        <p className="mt-3 text-sm sm:text-base italic font-semibold text-blue-200">
          « Créer un vêtement, c'est donner forme à une idée. »
        </p>

      </div>

      <div className="flex flex-wrap justify-center gap-6 max-w-6xl">

        {sousDomaines.map((sousDomaine) => {

          const Icon = sousDomaine.icon;

          return (
            <div
              key={sousDomaine.id}
              className="w-40 sm:w-44 md:w-48 h-48 perspective cursor-pointer"
            >

              <motion.div
                className="card-3d w-full h-full rounded-xl"
                animate={{ rotateY: [0, 360] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  repeatDelay: 10,
                  ease: "easeInOut",
                }}
                onClick={() => handleChoice(sousDomaine)}
                whileHover={{ scale: 1.05 }}
              >

                <div className={`${cardStyle} card-face`}>

                  <Icon
                    className={`text-5xl mb-1 ${sousDomaine.color}`}
                  />

                  <div className="leading-tight">
                    {sousDomaine.titre}
                  </div>

                  <p className="text-xs font-normal text-gray-600 dark:text-gray-300 leading-snug">
                    {sousDomaine.description}
                  </p>

                </div>

                <div
                  className="card-face card-back bg-cover bg-center rounded-xl shadow-lg"
                  style={{ backgroundImage: "url('/coin.svg')" }}
                />

              </motion.div>

            </div>
          );
        })}

      </div>

      <div className="mt-10 max-w-3xl text-center text-sm sm:text-base text-gray-200">
        <p>
          <strong>CODE</strong> valorise les savoir-faire de la couture
          et permet à chacun de développer sa créativité et sa maîtrise technique.
        </p>
      </div>

      <button
        onClick={() => navigate("/domaines/metiers")}
        className="mt-10 px-6 py-3 bg-white/80 dark:bg-gray-600 hover:bg-white dark:hover:bg-gray-500 rounded-full text-sm text-gray-800 dark:text-white transition font-medium"
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

export default Couture;