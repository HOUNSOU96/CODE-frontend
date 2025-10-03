// 📁 Matiere.tsx (Etudiant harmonisé style PCT)
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";

// Icônes par matière
import { PiMathOperationsBold } from "react-icons/pi";
import { GiAtom, GiChemicalDrop, GiOpenBook, GiMusicalNotes } from "react-icons/gi";
import { FaLaptopCode } from "react-icons/fa";
import { SiOpenai } from "react-icons/si";
import { MdPsychology } from "react-icons/md";

const Etudiant: React.FC = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();

  const matieres = [
    { name: "mia", label: "Mathématiques (MIA)", icon: PiMathOperationsBold, color: "text-blue-600" },
    { name: "pct", label: "Physique-Chimie (PC)", icon: GiAtom, color: "text-red-600" },
    { name: "svt", label: "Biologie", icon: GiChemicalDrop, color: "text-green-600" },
    { name: "medecine", label: "Médecine", icon: GiOpenBook, color: "text-purple-600" },
    { name: "comptabilite", label: "Comptabilité", icon: FaLaptopCode, color: "text-orange-600" },
    { name: "informatique", label: "Informatique", icon: FaLaptopCode, color: "text-indigo-600" },
    { name: "intelligenceartificielle", label: "Intelligence Artificielle (IA)", icon: SiOpenai, color: "text-indigo-600" },
    { name: "musique", label: "Musique", icon: GiMusicalNotes, color: "text-pink-600" },
    { name: "philosophie", label: "Philosophie", icon: MdPsychology, color: "text-yellow-600" },
  ];

  const cardStyle =
    "flex flex-col items-center justify-center gap-3 bg-white/90 dark:bg-gray-700 shadow-lg rounded-xl p-6 text-center hover:bg-blue-100 dark:hover:bg-blue-900 transition text-sm sm:text-base font-semibold text-gray-800 dark:text-white";

  if (loading) return <div>Chargement...</div>;

  const handleChoice = (matiere: string) => {
    switch (matiere) {
      case "mia": navigate("/home/homemia"); break;
      case "pct": navigate("/matieres/matierespc"); break;
      case "svt": navigate("/home/homebiologie"); break;
      case "medecine": navigate("/home/homemedecine"); break;
      case "comptabilite": navigate("/home/homecomptabilite"); break;
      case "informatique": navigate("/matieres/matieresinformatique"); break;
      case "intelligenceartificielle": navigate("/home/homeintelligenceartificielle"); break;
      case "musique": navigate("/matieres/matieresmusique"); break;
      case "philosophie": navigate("/home/homephilosophie"); break;
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
      <h1 className="text-3xl font-bold text-center mb-10 text-white">CHOISISSEZ UNE MATIÈRE</h1>

      <div className="flex flex-wrap justify-center gap-6 max-w-5xl">
        {matieres.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.name} className="w-36 h-36 perspective cursor-pointer">
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
        ⬅️ Retour
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

export default Etudiant;
