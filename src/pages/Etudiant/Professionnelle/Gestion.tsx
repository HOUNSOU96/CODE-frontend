import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaChartLine } from "react-icons/fa";

const Gestion: React.FC = () => {
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

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold">
          CODE
        </h1>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-2">
          GESTION
        </h2>

        <p className="mt-4 text-sm sm:text-base text-gray-200 max-w-3xl mx-auto">
          Maîtrisez les principes d'organisation, de planification,
          de gestion des ressources et de pilotage des activités.
        </p>

        <p className="mt-3 italic font-semibold text-green-200">
          « Bien gérer, c'est transformer les ressources en résultats. »
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

            <FaChartLine className="text-5xl text-green-600" />

            <div className="font-semibold text-gray-800 dark:text-white">
              GESTION
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300">
              Organisation, planification et gestion des ressources.
            </p>

          </div>

          <div
            className="card-face card-back bg-cover bg-center rounded-xl shadow-lg"
            style={{ backgroundImage: "url('/coin.svg')" }}
          />

        </motion.div>

      </div>

      <button
        onClick={() => navigate("/domaines/professionnelle")}
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

export default Gestion;