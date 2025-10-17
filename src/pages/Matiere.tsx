// 📁 Matiere.tsx (Harmonisé 3D)
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { PlayCircle } from "lucide-react";

// Icônes par matière
import { PiMathOperationsBold } from "react-icons/pi";
import {
  GiAtom,
  GiChemicalDrop,
  GiOpenBook,
  GiEarthAfricaEurope,
  GiMusicalNotes,
} from "react-icons/gi";
import { FaHistory, FaLaptopCode, FaRunning } from "react-icons/fa";
import { MdPsychology } from "react-icons/md";
import { BiJoystick } from "react-icons/bi";
import { SiOpenai } from "react-icons/si";

const Matiere: React.FC = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();

  const matieres = [
    { name: "maths", label: "Mathématiques", icon: PiMathOperationsBold, color: "text-red-500" },
    { name: "pct", label: "Physique, Chimie et Technologie (PCT)", icon: GiAtom, color: "text-purple-500" },
    { name: "svt", label: "Science de la Vie et de la Terre (SVT)", icon: GiChemicalDrop, color: "text-green-500" },
    { name: "langue", label: "Étude et apprentissage de Langue", icon: GiOpenBook, color: "text-yellow-500" },
    { name: "histoire", label: "Histoire", icon: FaHistory, color: "text-orange-500" },
    { name: "geographie", label: "Géographie", icon: GiEarthAfricaEurope, color: "text-teal-500" },
    { name: "philosophie", label: "Philosophie", icon: MdPsychology, color: "text-pink-500" },
    { name: "informatique", label: "Informatique", icon: FaLaptopCode, color: "text-blue-500" },
    { name: "intelligenceartificielle", label: "Intelligence Artificielle (IA)", icon: SiOpenai, color: "text-indigo-500" },
    { name: "musique", label: "Musique", icon: GiMusicalNotes, color: "text-fuchsia-500" },
    { name: "eps", label: "Éducation Physique et Sportive (EPS)", icon: FaRunning, color: "text-lime-500" },
    { name: "divertissement", label: "Divertissement", icon: BiJoystick, color: "text-cyan-500" },
  ];

  if (loading) return <div>Chargement...</div>;

  const cardStyle =
    "flex flex-col items-center justify-center gap-3 bg-white/90 dark:bg-gray-700 shadow-lg rounded-xl p-4 text-center hover:bg-blue-100 dark:hover:bg-blue-900 transition text-sm sm:text-base font-semibold text-gray-800 dark:text-white cursor-pointer";

  const handleChoice = (matiere: string) => {
    switch (matiere) {
      case "maths": navigate("/home/homemaths"); break;
     // case "pct": navigate("/matieres/matierespct"); break;
     // case "svt": navigate("/home/homesvt"); break;
      //case "langue": navigate("/matieres/matiereslangue"); break;
      //case "histoire": navigate("/matieres/matiereshistoire"); break;
      //case "geographie": navigate("/matieres/matieresgeographie"); break;
     // case "philosophie": navigate("/home/homephilosophie"); break;
     // case "informatique": navigate("/matieres/matieresinformatique"); break;
      //case "intelligenceartificielle": navigate("/home/homeintelligenceartificielle"); break;
     // case "musique": navigate("/matieres/matieresmusique"); break;
     // case "eps": navigate("/matieres/matiereseps"); break;
     // case "divertissement": navigate("/matieres/matieresdivertissement"); break;
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

      <Link
        to="/etudiant"
        className="mt-10 inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white font-semibold shadow-lg"
      >
        <PlayCircle className="w-5 h-5" />
        Si vous êtes un étudiant, cliquez ici!
      </Link>

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
