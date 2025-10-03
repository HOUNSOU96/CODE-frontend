import React from 'react';
import { NavLink } from 'react-router-dom';

// On importe le type NavLinkProps pour typer l'argument
import type { NavLinkProps } from 'react-router-dom';

const Header = () => {
  return (
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
  );
};

export default Header;
