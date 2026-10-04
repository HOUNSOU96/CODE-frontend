// 📁 Header.tsx

import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { WifiOff } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const Header: React.FC = () => {
  const { loading } = useAuth();

  const [isOffline, setIsOffline] = useState<boolean>(() => {
    if (typeof navigator === "undefined") {
      return false;
    }

    return !navigator.onLine;
  });

  // ============================================================
  // DÉTECTION DE LA CONNEXION
  // ============================================================

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
      <div className="text-white text-center py-4">
        Chargement...
      </div>
    );
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -20,
      }}
      transition={{
        duration: 0.4,
      }}
    >
      <nav
        className="
          bg-gray-800
          text-white
          px-4
          py-3
          sm:p-4
          flex
          flex-wrap
          items-center
          justify-center
          gap-x-5
          gap-y-3
          sm:space-x-6
          sm:gap-y-0
        "
        aria-label="Navigation principale"
      >
        {/* ======================================================
            ACCUEIL
        ====================================================== */}

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `
              transition
              duration-200
              focus:outline-none
              focus:ring-2
              focus:ring-blue-400
              rounded
              px-1
              ${
                isActive
                  ? "underline font-bold text-blue-300"
                  : "hover:underline"
              }
            `
          }
        >
          Accueil
        </NavLink>

        {/* ======================================================
            TEST
        ====================================================== */}

        <NavLink
          to="/questions"
          className={({ isActive }) =>
            `
              transition
              duration-200
              focus:outline-none
              focus:ring-2
              focus:ring-blue-400
              rounded
              px-1
              ${
                isActive
                  ? "underline font-bold text-blue-300"
                  : "hover:underline"
              }
            `
          }
        >
          Test
        </NavLink>

        {/* ======================================================
            RÉSULTATS
        ====================================================== */}

        <NavLink
          to="/resultats"
          className={({ isActive }) =>
            `
              transition
              duration-200
              focus:outline-none
              focus:ring-2
              focus:ring-blue-400
              rounded
              px-1
              ${
                isActive
                  ? "underline font-bold text-blue-300"
                  : "hover:underline"
              }
            `
          }
        >
          Résultats
        </NavLink>

        {/* ======================================================
            INDICATEUR HORS LIGNE
        ====================================================== */}

        {isOffline && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.2,
            }}
            className="
              flex
              items-center
              gap-1.5
              text-xs
              text-gray-300
              ml-1
              sm:ml-2
              pointer-events-none
            "
            aria-label="Mode hors ligne"
          >
            <WifiOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              Hors ligne
            </span>
          </motion.div>
        )}
      </nav>
    </motion.div>
  );
};

export default Header;