// 📁 Matiere.tsx (Divertissement Harmonisé)
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { GiGamepad, GiHammerNails, GiOpenBook, GiMoneyStack, GiReceiveMoney, GiDiceSixFacesSix } from "react-icons/gi";

const Matiere: React.FC = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();

  const matieresDivertissement = [
    { name: "jeux", label: "Jeux", icon: GiGamepad, color: "text-blue-600" },
    { name: "bricolage", label: "Bricolage", icon: GiHammerNails, color: "text-red-600" },
    { name: "proverbesetvertus", label: "Proverbes et Vertus", icon: GiOpenBook, color: "text-green-600" },
    { name: "libertefinanciere", label: "Liberté Financière", icon: GiMoneyStack, color: "text-purple-600" },
    { name: "trading", label: "Trading", icon: GiReceiveMoney, color: "text-yellow-600" },
    { name: "1xbet", label: "1XBET", icon: GiDiceSixFacesSix, color: "text-pink-600" },
  ];

  if (loading) return <div>Chargement...</div>;

  const cardStyle =
    "flex flex-col items-center justify-center gap-3 bg-white/90 dark:bg-gray-700 shadow-lg rounded-xl p-4 text-center hover:bg-blue-100 dark:hover:bg-blue-900 transition text-sm sm:text-base font-semibold text-gray-800 dark:text-white cursor-pointer";

  const handleChoice = (matiere: string) => {
    switch (matiere) {
      case "jeux": navigate("/home/homejeux"); break;
      case "bricolage": navigate("/home/homebricolage"); break;
      case "proverbesetvertus": navigate("/home/homeproverbesetvertus"); break;
      case "libertefinanciere": navigate("/home/homelibertefinanciere"); break;
      case "trading": navigate("/home/hometrading"); break;
      case "1xbet": navigate("/home/home1xbet"); break;
      default: break;
    }
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-white z-20"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold text-center mb-10 text-white">FAÎTES UN CHOIX</h1>

      <div className="flex flex-wrap justify-center gap-6 max-w-5xl">
        {matieresDivertissement.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.name} className="w-36 h-36 perspective">
              <motion.div
                className="card-3d w-full h-full rounded-xl"
                animate={{ rotateY: [0, 360] }}
                transition={{
                  duration: 6,          // la rotation dure 6 secondes
                  repeat: Infinity,     // tourne en boucle
                  repeatDelay: 10,       // attend 8 secondes avant de relancer
                  ease: "easeInOut",
                }}
                onClick={() => handleChoice(m.name)}
              >
                {/* Face avant */}
                <div className={`${cardStyle} card-face`}>
                  <Icon className={`text-5xl mb-2 ${m.color}`} />
                  {m.label}
                </div>

                {/* Face arrière */}
                <div
                  className="card-face card-back bg-cover bg-center rounded-xl shadow-lg"
                  style={{ backgroundImage: "url('/coin.svg')" }}
                ></div>
              </motion.div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => navigate("/matiere")}
        className="mt-12 px-6 py-3 bg-white/80 dark:bg-gray-600 hover:bg-white dark:hover:bg-gray-500 rounded-full text-sm text-gray-800 dark:text-white transition font-medium"
      >
        ⬅️ Changer de matière
      </button>

      <style>{`
        .perspective { perspective: 1000px; }
        .card-3d { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; }
        .card-face { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 1rem; padding: 10px; }
        .card-back { transform: rotateY(180deg); }
      `}</style>
    </motion.div>
  );
};

export default Matiere;
