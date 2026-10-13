import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSeedling } from "react-icons/fa";

const AgricultureDurable: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10 text-white z-20"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-10 max-w-5xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
          CODE
        </h1>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-2">
          AGRICULTURE DURABLE
        </h2>

        <p className="mt-4 text-sm sm:text-base text-gray-200 max-w-3xl mx-auto">
          Apprenez les pratiques agricoles permettant de produire
          durablement tout en préservant les sols, l'eau et la biodiversité.
        </p>

        <p className="mt-3 text-sm sm:text-base italic font-semibold text-green-200">
          « Produire aujourd'hui sans compromettre les générations futures. »
        </p>
      </div>

      <div
        className="w-40 sm:w-44 md:w-48 h-48 perspective cursor-pointer"
        onClick={() => navigate("/evaluation")}
      >
        <motion.div
          className="card-3d w-full h-full rounded-xl"
          whileHover={{ scale: 1.05 }}
        >
          <div className="card-face flex flex-col items-center justify-center gap-3 bg-white/90 dark:bg-gray-700 shadow-lg rounded-xl p-4 text-center">
            <FaSeedling className="text-5xl text-lime-600" />

            <div className="font-semibold text-gray-800 dark:text-white">
              AGRICULTURE DURABLE
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300">
              Production agricole responsable et préservation des ressources.
            </p>
          </div>

          <div
            className="card-face card-back bg-cover bg-center rounded-xl shadow-lg"
            style={{ backgroundImage: "url('/coin.svg')" }}
          />
        </motion.div>
      </div>

      <button
        onClick={() => navigate("/domaines/environnement")}
        className="mt-10 px-6 py-3 bg-white/80 dark:bg-gray-600 hover:bg-white dark:hover:bg-gray-500 rounded-full text-sm text-gray-800 dark:text-white transition font-medium"
      >
        ⬅️ Retour
      </button>

      <style>{`
        .perspective { perspective: 1000px; }
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
        .card-back { transform: rotateY(180deg); }
      `}</style>
    </motion.div>
  );
};

export default AgricultureDurable;