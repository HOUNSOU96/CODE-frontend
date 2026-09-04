import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  FaTractor,
  FaHardHat,
  FaCut,
  FaUtensils,
  FaBolt,
  FaCar,
  FaChair,
} from "react-icons/fa";

// ============================================================
// TYPES
// ============================================================

interface SousDomaine {
  id: string;
  titre: string;
  description: string;
  route: string;
  color: string;
  icon: React.ElementType;
}

// ============================================================
// COMPOSANT
// ============================================================

const Metiers: React.FC = () => {
  const navigate = useNavigate();

  // ==========================================================
  // SOUS-DOMAINES
  // ==========================================================

  const sousDomaines: SousDomaine[] = [
    {
      id: "agriculture",
      titre: "AGRICULTURE",
      description:
        "Production végétale, élevage, agriculture durable, irrigation et techniques agricoles.",
      route: "/domaines/metiers/agriculture",
      color: "text-green-600",
      icon: FaTractor,
    },

    {
      id: "construction",
      titre: "CONSTRUCTION",
      description:
        "Bâtiment, maçonnerie, travaux publics, matériaux et techniques de construction.",
      route: "/domaines/metiers/construction",
      color: "text-orange-600",
      icon: FaHardHat,
    },

    {
      id: "couture",
      titre: "COUTURE",
      description:
        "Conception de vêtements, patronage, coupe, assemblage, broderie et finition.",
      route: "/domaines/metiers/couture",
      color: "text-pink-600",
      icon: FaCut,
    },

    {
      id: "cuisine",
      titre: "CUISINE",
      description:
        "Préparation des aliments, techniques culinaires, hygiène, pâtisserie et restauration.",
      route: "/domaines/metiers/cuisine",
      color: "text-red-600",
      icon: FaUtensils,
    },

    {
      id: "electricite",
      titre: "ÉLECTRICITÉ",
      description:
        "Installations électriques, câblage, maintenance, sécurité et systèmes électriques.",
      route: "/domaines/metiers/electricite",
      color: "text-yellow-500",
      icon: FaBolt,
    },

    {
      id: "mecanique",
      titre: "MÉCANIQUE",
      description:
        "Mécanique automobile, machines, maintenance, diagnostic et réparation.",
      route: "/domaines/metiers/mecanique",
      color: "text-slate-600",
      icon: FaCar,
    },

    {
      id: "menuiserie",
      titre: "MENUISERIE",
      description:
        "Travail du bois, fabrication de meubles, assemblage, finition et conception.",
      route: "/domaines/metiers/menuiserie",
      color: "text-amber-700",
      icon: FaChair,
    },
  ];

  // ==========================================================
  // STYLE DES CARTES
  // ==========================================================

  const cardStyle =
    "flex flex-col items-center justify-center gap-3 " +
    "bg-white/90 dark:bg-gray-700 shadow-lg rounded-xl " +
    "p-4 text-center hover:bg-blue-100 dark:hover:bg-blue-900 " +
    "transition text-sm sm:text-base font-semibold " +
    "text-gray-800 dark:text-white";

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const handleChoice = (sousDomaine: SousDomaine) => {
    navigate(sousDomaine.route);
  };

  // ==========================================================
  // AFFICHAGE
  // ==========================================================

  return (
    <motion.div
      className="
        min-h-screen
        flex flex-col
        items-center
        justify-center
        px-4
        py-10
        text-white
        z-20
      "
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >

      <div className="text-center mb-10 max-w-5xl">

        <h1
          className="
            text-3xl
            sm:text-4xl
            md:text-5xl
            font-extrabold
            tracking-tight
            text-white
          "
        >
          CODE
        </h1>

        <h2
          className="
            text-xl
            sm:text-2xl
            md:text-3xl
            font-bold
            text-white
            mt-2
          "
        >
          MÉTIERS & SAVOIR-FAIRE
        </h2>

        <p
          className="
            mt-4
            text-sm
            sm:text-base
            text-gray-200
            max-w-3xl
            mx-auto
          "
        >
          Découvrez les métiers, les techniques et les savoir-faire
          pratiques permettant de produire, construire, réparer,
          transformer et créer.
        </p>

        <p
          className="
            mt-3
            text-sm
            sm:text-base
            italic
            font-semibold
            text-blue-200
          "
        >
          « Apprendre à faire, c'est apprendre à créer sa propre valeur. »
        </p>

      </div>

      <div
        className="
          flex
          flex-wrap
          justify-center
          gap-6
          max-w-6xl
        "
      >

        {sousDomaines.map((sousDomaine) => {

          const Icon = sousDomaine.icon;

          return (
            <div
              key={sousDomaine.id}
              className="
                w-40
                sm:w-44
                md:w-48
                h-48
                perspective
                cursor-pointer
              "
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
                onClick={() => handleChoice(sousDomaine)}
                whileHover={{
                  scale: 1.05,
                }}
              >

                <div className={`${cardStyle} card-face`}>

                  <Icon
                    className={`text-5xl mb-1 ${sousDomaine.color}`}
                  />

                  <div className="leading-tight">
                    {sousDomaine.titre}
                  </div>

                  <p
                    className="
                      text-xs
                      font-normal
                      text-gray-600
                      dark:text-gray-300
                      leading-snug
                    "
                  >
                    {sousDomaine.description}
                  </p>

                </div>

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
                />

              </motion.div>

            </div>
          );
        })}

      </div>

      <div
        className="
          mt-10
          max-w-3xl
          text-center
          text-sm
          sm:text-base
          text-gray-200
        "
      >

        <p>
          <strong>CODE</strong> valorise les métiers et les savoir-faire
          pratiques afin de permettre à chaque apprenant de développer
          des compétences utiles pour travailler, entreprendre,
          produire et contribuer à sa communauté.
        </p>

      </div>

      <button
        onClick={() => navigate("/etudiant")}
        className="
          mt-10
          px-6
          py-3
          bg-white/80
          dark:bg-gray-600
          hover:bg-white
          dark:hover:bg-gray-500
          rounded-full
          text-sm
          text-gray-800
          dark:text-white
          transition
          font-medium
        "
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

export default Metiers;