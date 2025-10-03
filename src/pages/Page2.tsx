// 📁 Page2.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from "../hooks/useAuth";
import api from "@/utils/axios";   // ton axios configuré
import { useExitNotifier } from "@/hooks/useExitNotifier";

const mots: string[] = ['BIENVENU', 'SUR', 'CODE'];
const couleurs: string[] = ['#00FF00', '#FFFF00', '#FF0000'];

const Page2: React.FC = () => {
  const { loading, user } = useAuth();
  const navigate = useNavigate();

  

  const [motActuel, setMotActuel] = useState<number>(0);
  const [orActif, setOrActif] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<string>('3rem');

  

  // Ajustement dynamique de la taille du texte selon la largeur de l'écran
  const updateFontSize = () => {
    const width = window.innerWidth;
    if (width < 400) setFontSize('1.8rem');
    else if (width < 640) setFontSize('2.5rem');
    else if (width < 1024) setFontSize('3.5rem');
    else setFontSize('5rem');
  };

  useEffect(() => {
    updateFontSize();
    window.addEventListener('resize', updateFontSize);
    return () => window.removeEventListener('resize', updateFontSize);
  }, []);

  // Animation des mots
  useEffect(() => {
    const motTimer = setInterval(() => {
      setMotActuel((prev) => {
        if (prev + 1 === mots.length) {
          setTimeout(() => setOrActif(true), 1000);
        }
        return prev + 1;
      });
    }, 1000);

    const totalTimer = setTimeout(() => {
      clearInterval(motTimer);
      navigate('/accueil');
    }, 5000);

    return () => {
      clearInterval(motTimer);
      clearTimeout(totalTimer);
    };
  }, [navigate]);

  if (loading) return <div className="text-white text-center mt-10">Chargement...</div>;

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-black overflow-hidden px-4">
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
              key={index}
              initial={{ y: 50, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ color: orActif ? 'gold' : couleurs[index] }}
            >
              {mot}
            </motion.span>
          ))}
        </motion.div>
      </div>

      {/* Ballons et étoiles animés */}
      {[...Array(15)].map((_, i) => {
        const duration = window.innerWidth < 640 ? 4 + Math.random() * 2 : 5 + Math.random() * 3;
        const size = window.innerWidth < 640 ? 'text-lg' : 'text-2xl';
        return (
          <motion.div
            key={i}
            className={`absolute ${size}`}
            style={{
              top: `${Math.random() * 90}%`,
              left: `${Math.random() * 90}%`,
              color: ["#FF69B4", "#FFD700", "#00FFFF", "#ADFF2F", "#FFA07A"][i % 5],
            }}
            animate={{ y: [0, -150], opacity: [1, 0] }}
            transition={{ duration, repeat: Infinity }}
          >
            {i % 2 === 0 ? '🎈' : '⭐'}
          </motion.div>
        );
      })}
    </div>
  );
};

export default Page2;
