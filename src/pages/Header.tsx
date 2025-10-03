import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from "framer-motion";
// On importe le type NavLinkProps pour typer l'argument
import type { NavLinkProps } from 'react-router-dom';
import { useAuth } from "../hooks/useAuth";
const Header = () => {
const { loading } = useAuth();
if (loading) return <div>Chargement...</div>;

  return (
     <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4 }}
  >
    <nav className="bg-gray-800 text-white p-4 flex space-x-6">
      <NavLink
        to="/"
        className={({ isActive }: { isActive: boolean }) =>
          isActive ? 'underline font-bold' : 'hover:underline'
        }
        end
      >
        Accueil
      </NavLink>
      <NavLink
        to="/questions"
        className={({ isActive }: { isActive: boolean }) =>
          isActive ? 'underline font-bold' : 'hover:underline'
        }
      >
        Test
      </NavLink>
      <NavLink
        to="/resultats"
        className={({ isActive }: { isActive: boolean }) =>
          isActive ? 'underline font-bold' : 'hover:underline'
        }
      >
        Résultats
      </NavLink>
    </nav>
    </motion.div>
  );
};

export default Header;
