// 📁 src/pages/NotFound.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.6,
          ease: 'easeOut',
        }}
        className="w-full max-w-xl text-center"
      >
        {/* CODE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.15,
            duration: 0.5,
            ease: 'easeOut',
          }}
          className="mb-6"
        >
          <div className="text-7xl sm:text-8xl font-black tracking-tight text-blue-600">
            404
          </div>
        </motion.div>

        {/* Titre */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.25,
            duration: 0.5,
          }}
          className="
            text-2xl
            sm:text-3xl
            font-bold
            text-gray-900
            dark:text-white
            mb-4
          "
        >
          Page non trouvée
        </motion.h1>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.35,
            duration: 0.5,
          }}
          className="
            text-gray-600
            dark:text-gray-300
            text-base
            sm:text-lg
            leading-relaxed
            mb-8
          "
        >
          Désolé, cette page n’existe pas ou n’est plus disponible.
        </motion.p>

        {/* Bouton */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.45,
            duration: 0.5,
          }}
        >
          <Link
            to="/"
            className="
              inline-flex
              items-center
              justify-center
              bg-blue-600
              hover:bg-blue-700
              active:bg-blue-800
              text-white
              font-semibold
              py-3
              px-6
              rounded-xl
              transition-all
              duration-200
              shadow-md
              hover:shadow-lg
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              focus:ring-offset-2
              dark:focus:ring-offset-gray-950
            "
          >
            Retour à l’accueil
          </Link>
        </motion.div>

        {/* Signature CODE */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 0.7,
            duration: 0.6,
          }}
          className="
            mt-12
            text-sm
            text-gray-400
            dark:text-gray-500
          "
        >
          CODE — L’écosystème éducatif mondial
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;