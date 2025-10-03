import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Page1: React.FC = () => {
  const navigate = useNavigate();
  const [shine, setShine] = useState(false);
  const [rebound, setRebound] = useState(false);
  const [sparkle, setSparkle] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [vibrate, setVibrate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 20000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const renderConfetti = () => {
    if (!confetti) return null;

    const colors = ['#FFD700', '#FF4500', '#00FF00', '#1E90FF', '#FF69B4', '#FFFFFF'];
    return (
      <div className="absolute top-1/2 left-1/2">
        {Array.from({ length: 30 }, (_, i) => {
          const angle = Math.random() * 2 * Math.PI;
          const radius = Math.random() * 150 + 50;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const size = Math.random() * 8 + 4;
          const color = colors[Math.floor(Math.random() * colors.length)];

          return (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{ x, y, opacity: 0 }}
              transition={{ duration: 0.05, ease: [0.0, 0.0, 1.0, 1.0] }}
              className="absolute"
              style={{
                width: size,
                height: size,
                borderRadius: '50%',
                backgroundColor: color,
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex justify-center items-center h-screen bg-black relative overflow-hidden">
      <motion.div
        className="absolute"
        initial={{ x: '-40vw', y: '-40vh' }}
        animate={{
          x: ['-40vw', '0vw', '40vw', '0vw'],
          y: ['-40vh', '40vh', '-40vh', '0vh'],
          rotateZ: [0, 720, 1440, 2160],
        }}
        transition={{
          duration: 6,
          ease: 'easeInOut',
          times: [0, 0.3, 0.6, 1],
          onComplete: () => {
            setShine(true);
            setRebound(true);
            setSparkle(true);
            setConfetti(true);
            setVibrate(true);
          },
        }}
        style={{
          width: 300,
          height: 300,
          perspective: '1000px',
        }}
      >
        {/* Traînée lumineuse */}
        <motion.div
          className="absolute w-full h-full rounded-full"
          animate={{
            opacity: [0.4, 0.1, 0.4],
            boxShadow: [
              '0 0 30px red',
              '0 0 40px blue',
              '0 0 30px lime',
              '0 0 40px cyan',
              '0 0 30px violet',
            ],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: 'easeInOut',
          }}
        />

        {/* Image avec rebond, zoom et vibration */}
        <motion.div
          animate={
            rebound || vibrate
              ? {
                  scale: [1, 1.2, 0.95, 1.05, 1], // zoom central
                  x: vibrate ? [0, -5, 5, -5, 5, 0] : 0,
                  y: vibrate ? [0, 3, -3, 3, -3, 0] : 0,
                  scaleY: [1, 0.8, 1.2, 1], // ← effet rebond ballon
                }
              : {}
          }
          transition={{
            duration: 0.8,
            ease: 'easeOut',
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <img
            src="/coin.svg"
            alt="Coin Logo"
            className={`w-full h-full object-contain rounded-full shadow-2xl ${
              shine ? 'animate-shine' : ''
            }`}
          />

          

          {renderConfetti()}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Page1;
