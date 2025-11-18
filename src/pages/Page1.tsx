// 📁 src/pages/Page1.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion, Variants } from "framer-motion";

const Page1: React.FC = () => {
  const navigate = useNavigate();
  const { redirect } = useParams<{ redirect?: string }>();
  const location = useLocation();
  const [flash, setFlash] = useState(false);



   // 🔊 Lecture du son "moravi.wav" au chargement de la page
  useEffect(() => {
    const audio = new Audio("/sounds/moravi.wav");
    audio.volume = 0.8; // tu peux ajuster le volume ici
    audio.play().catch((err) => console.log("Autoplay bloqué :", err));

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);


  // ⏱️ Redirection automatique après 10 secondes
  useEffect(() => {
    const flashTimer = setTimeout(() => setFlash(true), 9500);
    const redirectTimer = setTimeout(() => {
      const nextUrl = redirect ? `/${redirect}${location.search}` : "/";
      navigate(nextUrl);
    }, 3000);

    return () => {
      clearTimeout(flashTimer);
      clearTimeout(redirectTimer);
    };
  }, [navigate, redirect, location.search]);

  const letters = ["M", "o", "r", "a", "v", "i"];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.25 } },
  };

  const letterVariants: Variants = {
    hidden: { opacity: 0, scale: 0.5, rotateY: 90 },
    visible: {
      opacity: 1,
      scale: [1.2, 1],
      rotateY: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  // 🌟 Particules dorées animées
  const renderParticles = () =>
    Array.from({ length: 60 }).map((_, i) => {
      const size = Math.random() * 6 + 4;
      const delay = Math.random() * 6;
      const colorOptions = ["#FFD700", "#FFA500", "#FFF8DC"];
      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];

      return (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ width: size, height: size, backgroundColor: color }}
          animate={{
            x: ["-150%", "150%"],
            y: [Math.random() * -10, Math.random() * 10],
            opacity: [0.2, 1, 0.2],
          }}
          transition={{
            repeat: Infinity,
            repeatDelay: Math.random() * 5,
            duration: 1.5 + Math.random(),
            ease: "easeInOut",
            delay,
          }}
        />
      );
    });

  return (
    <div className="flex justify-center items-center h-screen bg-black overflow-hidden relative">
      {/* Particules dorées */}
      {renderParticles()}

      {/* Conteneur principal */}
      <motion.div
        animate={{ rotateZ: [-1, 1, -1], x: [0, 2, -2, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        style={{ transform: "skewX(-10deg)" }}
      >
        <motion.div
          className="flex space-x-2 italic relative"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            fontSize: "18vw",
            fontWeight: 700,
            fontStyle: "italic",
            background: "linear-gradient(90deg, #FFD700, #FFF8DC, #FFA500, #FFD700)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 20px rgba(255,215,0,0.8), 0 0 40px rgba(255,215,0,0.6)",
            display: "flex",
          }}
        >
          {letters.map((char, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              className="relative"
              style={{ display: "inline-block", overflow: "hidden" }}
            >
              {char}

              {/* Reflet doré mobile */}
              <motion.span
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(120deg, transparent, rgba(255,255,255,0.6), transparent)",
                  mixBlendMode: "overlay",
                  transform: "skewX(-20deg)",
                  filter: "blur(4px)",
                }}
                animate={{
                  x: ["-150%", "150%"],
                  scale: [1, 1.05, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{ repeat: Infinity, repeatDelay: 5, duration: 1.5, ease: "easeInOut" }}
              />

              {/* Scintillement */}
              <motion.span
                className="absolute inset-0"
                style={{
                  background: "rgba(255,255,255,0.8)",
                  borderRadius: "50%",
                  width: "20%",
                  height: "20%",
                  top: "40%",
                  left: "40%",
                  pointerEvents: "none",
                  filter: "blur(2px)",
                }}
                animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                transition={{
                  repeat: Infinity,
                  repeatDelay: Math.random() * 3 + 1,
                  duration: 0.5,
                  ease: "easeInOut",
                }}
              />
            </motion.span>
          ))}

          {/* Flash final */}
          {flash && (
            <motion.div
              className="absolute inset-0 bg-white rounded-full"
              style={{ mixBlendMode: "screen" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          )}
        </motion.div>
      </motion.div>

      {/* Halo lumineux */}
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: [0.05, 0.2, 0.05],
          background: "radial-gradient(circle at center, rgba(255,215,0,0.1), transparent 70%)",
        }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      />
    </div>
  );
};

export default Page1;
