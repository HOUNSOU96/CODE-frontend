// 📁 Matiere.tsx (EPS Harmonisé)
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";

// Icônes existantes
import { GiSoccerBall, GiBasketballBasket, GiVolleyballBall, GiMountainClimbing, GiRunningShoe, GiJumpingRope, GiBodyBalance } from "react-icons/gi";

const Matiere: React.FC = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();

  const matieres = [
    { name: "gymnastique", label: "Gymnastique", icon: GiBodyBalance, color: "text-blue-600" },
    { name: "enchainement", label: "Enchaînement", icon: GiBodyBalance, color: "text-red-600" },
    { name: "grimper", label: "Grimper", icon: GiMountainClimbing, color: "text-green-600" },
    { name: "sautenlongueur", label: "Saut en longueur", icon: GiJumpingRope, color: "text-purple-600" },
    { name: "sautenhauteur", label: "Saut en hauteur", icon: GiJumpingRope, color: "text-pink-600" },
    { name: "triplesaut", label: "Triple saut", icon: GiJumpingRope, color: "text-yellow-600" },
    { name: "football", label: "Football", icon: GiSoccerBall, color: "text-orange-600" },
    { name: "basketball", label: "Basketball", icon: GiBasketballBasket, color: "text-indigo-600" },
    { name: "voleyball", label: "Volleyball", icon: GiVolleyballBall, color: "text-teal-600" },
    { name: "course", label: "Course", icon: GiRunningShoe, color: "text-red-400" },
    { name: "coursehaies", label: "Course de haies", icon: GiRunningShoe, color: "text-blue-400" },
    { name: "corde", label: "Saut à la corde", icon: GiJumpingRope, color: "text-yellow-400" },
  ];

  if (loading) return <div>Chargement...</div>;

  const cardStyle =
    "flex flex-col items-center justify-center gap-3 bg-white/90 dark:bg-gray-700 shadow-lg rounded-xl p-4 text-center hover:bg-blue-100 dark:hover:bg-blue-900 transition text-sm sm:text-base font-semibold text-gray-800 dark:text-white cursor-pointer";

  const handleChoice = (matiere: string) => {
    navigate(`/home/home${matiere}`);
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-white z-20"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold text-center mb-10 text-white">
        CHOISISSEZ UNE ACTIVITÉ
      </h1>

      <div className="flex flex-wrap justify-center gap-6 max-w-5xl">
        {matieres.map((m) => {
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
                <div className={`${cardStyle} card-face`}>
                  <Icon className={`text-5xl mb-2 ${m.color}`} />
                  {m.label}
                </div>

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
