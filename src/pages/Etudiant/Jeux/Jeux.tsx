
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaChess,
  FaPuzzlePiece,
  FaGamepad,
  FaBrain,
  FaTrophy,
  FaUsers,
} from "react-icons/fa";

const Jeux: React.FC = () => {
  const navigate = useNavigate();

  const sousDomaines = [
    {
      id: "echecs",
      titre: "Échecs",
      description:
        "Développez votre stratégie, votre anticipation et votre capacité de raisonnement grâce au jeu d'échecs.",
      icon: FaChess,
      color: "text-slate-700",
      route: "/domaines/jeux/echecs",
    },
    {
      id: "puzzles",
      titre: "Puzzles",
      description:
        "Résolvez des problèmes, casse-têtes et énigmes pour développer votre logique et votre capacité d'analyse.",
      icon: FaPuzzlePiece,
      color: "text-purple-600",
      route: "/domaines/jeux/puzzles",
    },
    {
      id: "jeux-mathematiques",
      titre: "Jeux mathématiques",
      description:
        "Apprenez les mathématiques autrement grâce aux défis, jeux et problèmes mathématiques.",
      icon: FaBrain,
      color: "text-blue-600",
      route: "/domaines/jeux/jeux-mathematiques",
    },
    {
      id: "jeux-strategie",
      titre: "Jeux de stratégie",
      description:
        "Développez votre planification, votre anticipation et votre capacité à prendre des décisions.",
      icon: FaTrophy,
      color: "text-amber-600",
      route: "/domaines/jeux/jeux-strategie",
    },
    {
      id: "jeux-societe",
      titre: "Jeux de société",
      description:
        "Découvrez les jeux favorisant la coopération, la communication et la réflexion collective.",
      icon: FaUsers,
      color: "text-green-600",
      route: "/domaines/jeux/jeux-societe",
    },
    {
      id: "game-design",
      titre: "Game Design",
      description:
        "Apprenez à concevoir des jeux, leurs règles, leurs mécanismes et leurs expériences.",
      icon: FaGamepad,
      color: "text-indigo-600",
      route: "/domaines/jeux/game-design",
    },
  ];

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10 text-white z-20"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-10 max-w-5xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold">
          CODE
        </h1>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-2">
          JEUX, LOGIQUE & COMPÉTITIONS
        </h2>

        <p className="mt-4 text-sm sm:text-base text-gray-200 max-w-3xl mx-auto">
          Développez votre intelligence, votre logique, votre stratégie
          et votre créativité à travers les jeux, les défis et les
          compétitions.
        </p>

        <p className="mt-3 italic font-semibold text-blue-200">
          « Jouer, réfléchir, apprendre et progresser. »
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6 max-w-6xl">
        {sousDomaines.map((sousDomaine) => {
          const Icon = sousDomaine.icon;

          return (
            <div
              key={sousDomaine.id}
              className="w-40 sm:w-44 md:w-48 h-48 perspective cursor-pointer"
              onClick={() => navigate(sousDomaine.route)}
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
                whileHover={{
                  scale: 1.05,
                }}
              >
                <div className="card-face flex flex-col items-center justify-center gap-3 bg-white/90 dark:bg-gray-700 shadow-lg rounded-xl p-4 text-center">
                  <Icon
                    className={`text-5xl mb-1 ${sousDomaine.color}`}
                  />

                  <div className="leading-tight font-semibold text-gray-800 dark:text-white">
                    {sousDomaine.titre}
                  </div>

                  <p className="text-xs font-normal text-gray-600 dark:text-gray-300 leading-snug">
                    {sousDomaine.description}
                  </p>
                </div>

                <div
                  className="card-face card-back bg-cover bg-center rounded-xl shadow-lg"
                  style={{
                    backgroundImage: "url('/coin.svg')",
                  }}
                />
              </motion.div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => navigate("/domaines")}
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
        }

        .card-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </motion.div>
  );
};

export default Jeux;

