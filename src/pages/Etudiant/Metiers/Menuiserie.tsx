import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  FaChair,
  FaTree,
  FaRulerCombined,
  FaTools,
  FaCubes,
  FaPaintBrush,
} from "react-icons/fa";

interface SousDomaine {
  id: string;
  titre: string;
  description: string;
  route: string;
  color: string;
  icon: React.ElementType;
}

const Menuiserie: React.FC = () => {
  const navigate = useNavigate();

  const sousDomaines: SousDomaine[] = [
    {
      id: "travail-bois",
      titre: "TRAVAIL DU BOIS",
      description:
        "Choix, préparation, découpe et transformation du bois.",
      route: "/evaluation",
      color: "text-amber-700",
      icon: FaTree,
    },
    {
      id: "mobilier",
      titre: "FABRICATION DE MOBILIER",
      description:
        "Conception et fabrication de tables, chaises, armoires et meubles.",
      route: "/evaluation",
      color: "text-orange-600",
      icon: FaChair,
    },
    {
      id: "mesure-tracage",
      titre: "MESURE & TRAÇAGE",
      description:
        "Mesure, traçage et préparation précise des pièces en bois.",
      route: "/evaluation",
      color: "text-blue-600",
      icon: FaRulerCombined,
    },
    {
      id: "outillage",
      titre: "OUTILLAGE",
      description:
        "Utilisation et entretien des outils manuels et électriques.",
      route: "/evaluation",
      color: "text-slate-600",
      icon: FaTools,
    },
    {
      id: "assemblage",
      titre: "ASSEMBLAGE",
      description:
        "Techniques d'assemblage, de fixation et de construction des ouvrages.",
      route: "/evaluation",
      color: "text-purple-600",
      icon: FaCubes,
    },
    {
      id: "finition-bois",
      titre: "FINITION DU BOIS",
      description:
        "Ponçage, vernissage, peinture et protection des ouvrages en bois.",
      route: "/evaluation",
      color: "text-pink-600",
      icon: FaPaintBrush,
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
          MENUISERIE
        </h2>

        <p className="mt-4 text-sm sm:text-base text-gray-200 max-w-3xl mx-auto">
          Découvrez les techniques de transformation du bois,
          de fabrication de meubles, d'assemblage et de finition.
        </p>

        <p className="mt-3 text-sm sm:text-base italic font-semibold text-blue-200">
          « Du bois à l'objet, la précision transforme la matière. »
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
          <strong>CODE</strong> transmet les connaissances et techniques
          permettant de transformer le bois en objets utiles, solides et esthétiques.
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

export default Menuiserie;