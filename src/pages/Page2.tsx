// 📁 Page2.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from "../hooks/useAuth";

const mots: string[] = ['BIENVENU', 'SUR', 'CODE'];
const couleurs: string[] = ['#00FF00', '#FFFF00', '#FF0000'];

type AnimationElement = {
  id: number;
  top: number;
  left: number;
  duration: number;
  size: string;
  color: string;
  type: 'ballon' | 'etoile';
};

const Page2: React.FC = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();

  const [motActuel, setMotActuel] = useState<number>(0);
  const [orActif, setOrActif] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<string>('3rem');
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    if (typeof navigator === 'undefined') {
      return false;
    }

    return !navigator.onLine;
  });

  /*
   * Les positions et paramètres des animations sont générés une seule fois.
   * Cela évite qu'ils changent à chaque nouveau rendu du composant.
   */
  const animationElements = useMemo<AnimationElement[]>(() => {
    const isMobile =
      typeof window !== 'undefined' && window.innerWidth < 640;

    const starColors = [
      '#FF69B4',
      '#FFD700',
      '#00FFFF',
      '#ADFF2F',
      '#FFA07A',
    ];

    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      top: Math.random() * 90,
      left: Math.random() * 90,
      duration: isMobile
        ? 4 + Math.random() * 2
        : 5 + Math.random() * 3,
      size: isMobile ? 'text-lg' : 'text-2xl',
      color: starColors[i % starColors.length],
      type: i % 2 === 0 ? 'ballon' : 'etoile',
    }));
  }, []);

  /*
   * Ajustement dynamique de la taille du texte
   * selon la largeur de l'écran.
   */
  useEffect(() => {
    const updateFontSize = () => {
      const width = window.innerWidth;

      if (width < 400) {
        setFontSize('1.8rem');
      } else if (width < 640) {
        setFontSize('2.5rem');
      } else if (width < 1024) {
        setFontSize('3.5rem');
      } else {
        setFontSize('5rem');
      }
    };

    updateFontSize();

    window.addEventListener('resize', updateFontSize);

    return () => {
      window.removeEventListener('resize', updateFontSize);
    };
  }, []);

  /*
   * Détection de la connexion réseau.
   *
   * Page2 ne dépend pas d'une requête réseau pour fonctionner :
   * elle peut donc continuer à afficher son animation même hors ligne.
   */
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /*
   * Animation des mots.
   *
   * BIENVENU → SUR → CODE
   *
   * Puis passage à l'effet doré avant la redirection.
   */
  useEffect(() => {
    let goldTimer: ReturnType<typeof setTimeout> | null = null;

    const motTimer = setInterval(() => {
      setMotActuel((prev) => {
        if (prev + 1 === mots.length) {
          goldTimer = setTimeout(() => {
            setOrActif(true);
          }, 1000);
        }

        return Math.min(prev + 1, mots.length);
      });
    }, 1000);

    const totalTimer = setTimeout(() => {
      clearInterval(motTimer);

      if (goldTimer) {
        clearTimeout(goldTimer);
      }

      navigate('/accueil');
    }, 5000);

    return () => {
      clearInterval(motTimer);
      clearTimeout(totalTimer);

      if (goldTimer) {
        clearTimeout(goldTimer);
      }
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="text-white text-center mt-10">
        Chargement...
      </div>
    );
  }

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-black overflow-hidden px-4">

      {/* Contenu principal */}
      <div className="flex flex-col justify-center items-center w-full max-w-4xl">

        {/* Texte animé */}
        <motion.div
          className="flex gap-2 sm:gap-4 text-center font-bold flex-wrap justify-center"
          style={{ fontSize }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {mots.slice(0, motActuel).map((mot, index) => (
            <motion.span
              key={`${mot}-${index}`}
              initial={{
                y: 50,
                opacity: 0,
                scale: 0.5,
              }}
              animate={{
                y: 0,
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.8,
                ease: 'easeOut',
              }}
              style={{
                color: orActif
                  ? 'gold'
                  : couleurs[index],
              }}
            >
              {mot}
            </motion.span>
          ))}
        </motion.div>

      </div>

      {/* Ballons et étoiles animés */}
      {animationElements.map((element) => (
        <motion.div
          key={element.id}
          className={`absolute ${element.size}`}
          style={{
            top: `${element.top}%`,
            left: `${element.left}%`,
            color: element.color,
          }}
          initial={{
            y: 0,
            opacity: 1,
          }}
          animate={{
            y: [0, -150],
            opacity: [1, 0],
          }}
          transition={{
            duration: element.duration,
            repeat: Infinity,
            repeatType: 'loop',
          }}
        >
          {element.type === 'ballon' ? '🎈' : '⭐'}
        </motion.div>
      ))}

      {/* Indicateur discret hors ligne.
          Il ne bloque absolument pas la navigation. */}
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
            absolute
            bottom-3
            left-1/2
            -translate-x-1/2
            text-xs
            text-gray-400
            text-center
            pointer-events-none
          "
        >
          Mode hors ligne
        </motion.div>
      )}

    </div>
  );
};

export default Page2;