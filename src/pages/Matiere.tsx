// 📁 Matiere.tsx (Harmonisé 3D + Offline)

import React, { useEffect, useMemo, useState } from "react";
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

type MatiereItem = {
  name: string;
  label: string;
  icon: React.ElementType;
  color: string;
};

type FloatingElement = {
  id: number;
  top: number;
  left: number;
  duration: number;
  delay: number;
  symbol: string;
  color: string;
};

const Matiere: React.FC = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();

  const [isOffline, setIsOffline] = useState<boolean>(() => {
    if (typeof navigator === "undefined") {
      return false;
    }

    return !navigator.onLine;
  });

  const matieres: MatiereItem[] = [
    {
      name: "maths",
      label: "Mathématiques",
      icon: PiMathOperationsBold,
      color: "text-red-500",
    },
    {
      name: "pct",
      label: "Physique, Chimie et Technologie (PCT)",
      icon: GiAtom,
      color: "text-purple-500",
    },
    {
      name: "svt",
      label: "Science de la Vie et de la Terre (SVT)",
      icon: GiChemicalDrop,
      color: "text-green-500",
    },
    {
      name: "langue",
      label: "Étude et apprentissage de Langue",
      icon: GiOpenBook,
      color: "text-yellow-500",
    },
    {
      name: "histoire",
      label: "Histoire",
      icon: FaHistory,
      color: "text-orange-500",
    },
    {
      name: "geographie",
      label: "Géographie",
      icon: GiEarthAfricaEurope,
      color: "text-teal-500",
    },
    {
      name: "philosophie",
      label: "Philosophie",
      icon: MdPsychology,
      color: "text-pink-500",
    },
    {
      name: "informatique",
      label: "Informatique",
      icon: FaLaptopCode,
      color: "text-blue-500",
    },
    {
      name: "intelligenceartificielle",
      label: "Intelligence Artificielle (IA)",
      icon: SiOpenai,
      color: "text-indigo-500",
    },
    {
      name: "musique",
      label: "Musique",
      icon: GiMusicalNotes,
      color: "text-fuchsia-500",
    },
    {
      name: "eps",
      label: "Éducation Physique et Sportive (EPS)",
      icon: FaRunning,
      color: "text-lime-500",
    },
    {
      name: "divertissement",
      label: "Divertissement",
      icon: BiJoystick,
      color: "text-cyan-500",
    },
  ];

  /*
   * Éléments décoratifs générés une seule fois.
   * Cela évite que Math.random() soit recalculé à chaque rendu.
   */
  const floatingElements = useMemo<FloatingElement[]>(() => {
    const colors = [
      "#FF69B4",
      "#FFD700",
      "#00FFFF",
      "#ADFF2F",
      "#FFA07A",
    ];

    const symbols = ["✦", "✧", "•", "✦", "✧"];

    return Array.from({ length: 12 }, (_, index) => ({
      id: index,
      top: 5 + Math.random() * 90,
      left: 3 + Math.random() * 94,
      duration: 4 + Math.random() * 4,
      delay: Math.random() * 3,
      symbol: symbols[index % symbols.length],
      color: colors[index % colors.length],
    }));
  }, []);

  /*
   * Gestion de l'état réseau.
   * La page reste totalement navigable hors connexion.
   */
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-lg font-semibold">
            Chargement...
          </div>
        </motion.div>
      </div>
    );
  }

  const cardStyle =
    "flex flex-col items-center justify-center gap-3 bg-white/90 dark:bg-gray-700 shadow-lg rounded-xl p-4 text-center hover:bg-blue-100 dark:hover:bg-blue-900 transition text-sm sm:text-base font-semibold text-gray-800 dark:text-white cursor-pointer";

  const handleChoice = (matiere: string) => {
    switch (matiere) {
      case "maths":
        navigate("/home/homemaths");
        break;

      case "pct":
        navigate("/matieres/matierespct");
        break;

      case "svt":
        navigate("/home/homesvt");
        break;

      case "langue":
        navigate("/matieres/matiereslangue");
        break;

      case "histoire":
        navigate("/matieres/matiereshistoire");
        break;

      case "geographie":
        navigate("/matieres/matieresgeographie");
        break;

      case "philosophie":
        navigate("/home/homephilosophie");
        break;

      case "informatique":
        navigate("/matieres/matieresinformatique");
        break;

      case "intelligenceartificielle":
        navigate("/home/homeintelligenceartificielle");
        break;

      case "musique":
        navigate("/matieres/matieresmusique");
        break;

      case "eps":
        navigate("/matieres/matiereseps");
        break;

      case "divertissement":
        navigate("/matieres/matieresdivertissement");
        break;

      default:
        break;
    }
  };

  return (
    <motion.div
      className="
        relative
        min-h-screen
        flex
        flex-col
        items-center
        justify-center
        px-4
        py-10
        text-white
        z-20
        overflow-hidden
      "
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingElements.map((element) => (
          <motion.div
            key={element.id}
            className="absolute text-lg sm:text-2xl"
            style={{
              top: `${element.top}%`,
              left: `${element.left}%`,
              color: element.color,
            }}
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.7,
            }}
            animate={{
              opacity: [0, 0.7, 0],
              y: [20, -80],
              scale: [0.7, 1, 0.8],
            }}
            transition={{
              duration: element.duration,
              delay: element.delay,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            }}
          >
            {element.symbol}
          </motion.div>
        ))}
      </div>

      {/* Titre */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
        }}
        className="
          relative
          z-10
          text-2xl
          sm:text-3xl
          md:text-4xl
          font-bold
          text-center
          mb-8
          sm:mb-10
          text-white
        "
      >
        CHOISISSEZ LA MATIÈRE
      </motion.h1>

      {/* Cartes des matières */}
      <div
        className="
          relative
          z-10
          flex
          flex-wrap
          justify-center
          gap-5
          sm:gap-6
          max-w-5xl
          w-full
        "
      >
        {matieres.map((m, index) => {
          const Icon = m.icon;

          return (
            <motion.div
              key={m.name}
              className="
                w-32
                h-32
                sm:w-36
                sm:h-36
                perspective
              "
              initial={{
                opacity: 0,
                y: 25,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{
                duration: 0.4,
                delay: index * 0.04,
                ease: "easeOut",
              }}
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
                onClick={() => handleChoice(m.name)}
                whileHover={{
                  scale: 1.04,
                }}
                whileTap={{
                  scale: 0.96,
                }}
              >
                {/* Face avant */}
                <div
                  className={`${cardStyle} card-face`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();
                      handleChoice(m.name);
                    }
                  }}
                  aria-label={`Choisir ${m.label}`}
                >
                  <Icon
                    className={`text-4xl sm:text-5xl mb-2 ${m.color}`}
                  />

                  <span className="leading-tight">
                    {m.label}
                  </span>
                </div>

                {/* Face arrière */}
                <div
                  className="
                    card-face
                    card-back
                    bg-cover
                    bg-center
                    rounded-xl
                    shadow-lg
                  "
                  style={{
                    backgroundImage: "url('/coin.svg')",
                  }}
                  aria-hidden="true"
                />
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* CODE-ARENA */}
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.7,
          duration: 0.5,
        }}
        className="relative z-10"
      >
        <Link
          to="/etudiant"
          className="
            mt-10
            inline-flex
            items-center
            gap-2
            px-5
            py-3
            rounded-lg
            bg-blue-600
            hover:bg-blue-700
            active:bg-blue-800
            transition-all
            duration-200
            text-white
            font-semibold
            shadow-lg
            hover:shadow-xl
            focus:outline-none
            focus:ring-2
            focus:ring-blue-400
            focus:ring-offset-2
            focus:ring-offset-black
          "
        >
          <PlayCircle className="w-5 h-5" />
          CODE-ARENA
        </Link>
      </motion.div>

      {/* Indicateur hors ligne */}
      {isOffline && (
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 0.75,
            y: 0,
          }}
          className="
            relative
            z-10
            mt-5
            text-xs
            text-gray-400
            text-center
            pointer-events-none
          "
        >
          Mode hors ligne
        </motion.div>
      )}

      {/* Styles 3D */}
      <style>{`
        .perspective {
          perspective: 1000px;
        }

        .card-3d {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          cursor: pointer;
        }

        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
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

export default Matiere;