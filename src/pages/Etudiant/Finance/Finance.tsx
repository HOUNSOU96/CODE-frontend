
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaMoneyBillWave } from "react-icons/fa";

const Finance: React.FC = () => {
  const navigate = useNavigate();

  const sousDomaines = [
    {
      id: "finance-personnelle",
      titre: "FINANCE PERSONNELLE",
      description:
        "Apprenez à gérer vos revenus, vos dépenses, votre épargne et vos objectifs financiers.",
      couleur: "text-green-600",
      route: "/domaines/finance/finance-personnelle",
    },
    {
      id: "comptabilite",
      titre: "COMPTABILITÉ",
      description:
        "Découvrez les principes de la comptabilité, les documents comptables et le suivi financier.",
      couleur: "text-blue-600",
      route: "/domaines/finance/comptabilite",
    },
    {
      id: "banque",
      titre: "BANQUE",
      description:
        "Comprenez le fonctionnement des banques, des comptes, des crédits et des moyens de paiement.",
      couleur: "text-indigo-600",
      route: "/domaines/finance/banque",
    },
    {
      id: "investissement",
      titre: "INVESTISSEMENT",
      description:
        "Découvrez les principes de l'investissement, du risque, du rendement et de la diversification.",
      couleur: "text-emerald-600",
      route: "/domaines/finance/investissement",
    },
    {
      id: "economie",
      titre: "ÉCONOMIE",
      description:
        "Comprenez les mécanismes économiques, les marchés, la production, la consommation et les échanges.",
      couleur: "text-orange-600",
      route: "/domaines/finance/economie",
    },
    {
      id: "fiscalite",
      titre: "FISCALITÉ",
      description:
        "Découvrez les principes des impôts, des taxes et des obligations fiscales.",
      couleur: "text-purple-600",
      route: "/domaines/finance/fiscalite",
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
          FINANCES & ÉCONOMIE
        </h2>

        <p className="mt-4 text-sm sm:text-base text-gray-200 max-w-3xl mx-auto">
          Découvrez les connaissances nécessaires pour comprendre,
          gérer et développer les ressources financières et économiques.
        </p>

        <p className="mt-3 italic font-semibold text-green-200">
          « Comprendre l'argent, c'est apprendre à mieux construire son avenir. »
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6 max-w-6xl">
        {sousDomaines.map((sousDomaine) => (
          <div
            key={sousDomaine.id}
            className="w-40 sm:w-44 md:w-48 h-48 perspective cursor-pointer"
            onClick={() => navigate(sousDomaine.route)}
          >
            <motion.div
              className="card-3d w-full h-full rounded-xl"
              whileHover={{ scale: 1.05 }}
            >
              <div className="card-face flex flex-col items-center justify-center gap-3 bg-white/90 dark:bg-gray-700 shadow-lg rounded-xl p-4 text-center">
                <FaMoneyBillWave
                  className={`text-5xl ${sousDomaine.couleur}`}
                />

                <div className="font-semibold text-gray-800 dark:text-white">
                  {sousDomaine.titre}
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {sousDomaine.description}
                </p>
              </div>

              <div
                className="card-face card-back bg-cover bg-center rounded-xl shadow-lg"
                style={{ backgroundImage: "url('/coin.svg')" }}
              />
            </motion.div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/matiere")}
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

export default Finance;

