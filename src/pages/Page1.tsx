import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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

  /* ============================================================
   * CONFETTIS
   * ============================================================ */
  const renderConfetti = () => {
    if (!confetti) return null;

    const colors = [
      '#FFD700',
      '#FF4500',
      '#00FF00',
      '#1E90FF',
      '#FF69B4',
      '#FFFFFF',
    ];

    return (
      <div className="absolute top-1/2 left-1/2 pointer-events-none">
        {Array.from({ length: 30 }, (_, i) => {
          const angle = Math.random() * 2 * Math.PI;
          const radius = Math.random() * 150 + 50;

          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          const size = Math.random() * 8 + 4;
          const color =
            colors[Math.floor(Math.random() * colors.length)];

          return (
            <motion.div
              key={i}
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
                scale: 1,
              }}
              animate={{
                x,
                y,
                opacity: 0,
                scale: 0,
              }}
              transition={{
                duration: 0.9,
                ease: 'easeOut',
              }}
              className="absolute"
              style={{
                width: size,
                height: size,
                borderRadius: '50%',
                backgroundColor: color,
                boxShadow: `0 0 ${size * 2}px ${color}`,
              }}
            />
          );
        })}
      </div>
    );
  };

  /* ============================================================
   * 🌍 GLOBE TERRESTRE
   *
   * Ce globe est placé par-dessus le O de coin.svg.
   * Taille réduite et légèrement déplacée vers la droite.
   * ============================================================ */
  const renderGlobe = () => {
    return (
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.3,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          delay: 6,
          duration: 1.2,
          ease: 'easeOut',
        }}
        className="absolute pointer-events-none"
        style={{
          width: '100%',
          height: '100%',
          left: 0,
          top: 0,
          zIndex: 10,
        }}
      >
        {/* ==================================================
            HALO EXTÉRIEUR
            ================================================== */}
        <div
          style={{
            position: 'absolute',
            inset: '-8px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(80,160,255,0.08) 45%, transparent 72%)',
            filter: 'blur(5px)',
          }}
        />

        {/* ==================================================
            SPHÈRE TERRESTRE
            ================================================== */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            overflow: 'hidden',
            background:
              'radial-gradient(circle at 32% 27%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.12) 12%, rgba(15,55,100,0.95) 58%, rgba(2,10,25,1) 100%)',
            boxShadow:
              'inset -14px -12px 25px rgba(0,0,0,0.75), inset 8px 8px 15px rgba(255,255,255,0.18), 0 0 18px rgba(100,180,255,0.55)',
            border: '1px solid rgba(255,255,255,0.4)',
          }}
        >
          {/* ==================================================
              ROTATION DU GLOBE
              ================================================== */}
          <motion.div
            animate={{
              rotateY: [0, 360],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Méridien 1 */}
            <div
              style={{
                position: 'absolute',
                inset: '5%',
                borderRadius: '50%',
                borderLeft:
                  '1px solid rgba(255,255,255,0.22)',
                borderRight:
                  '1px solid rgba(255,255,255,0.22)',
                transform: 'scaleX(0.38)',
              }}
            />

            {/* Méridien 2 */}
            <div
              style={{
                position: 'absolute',
                inset: '5%',
                borderRadius: '50%',
                borderLeft:
                  '1px solid rgba(255,255,255,0.15)',
                borderRight:
                  '1px solid rgba(255,255,255,0.15)',
                transform: 'scaleX(0.7)',
              }}
            />

            {/* Équateur */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '42%',
                top: '29%',
                borderTop:
                  '1px solid rgba(255,255,255,0.2)',
                borderBottom:
                  '1px solid rgba(255,255,255,0.14)',
                borderRadius: '50%',
              }}
            />

            {/* ==================================================
                CONTINENTS
                ================================================== */}
            <svg
              viewBox="0 0 200 200"
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                inset: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="coinContinentGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#ffffff"
                    stopOpacity="0.95"
                  />

                  <stop
                    offset="55%"
                    stopColor="#d8f5ff"
                    stopOpacity="0.9"
                  />

                  <stop
                    offset="100%"
                    stopColor="#7bc8ff"
                    stopOpacity="0.7"
                  />
                </linearGradient>

                <filter id="coinContinentGlow">
                  <feGaussianBlur
                    stdDeviation="1.3"
                    result="blur"
                  />

                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Amérique du Nord */}
              <path
                d="M27 49 L36 38 L48 34 L58 38 L64 47 L57 54 L48 53 L43 62 L34 60 L28 68 L23 61 Z"
                fill="url(#coinContinentGradient)"
                opacity="0.82"
                filter="url(#coinContinentGlow)"
              />

              {/* Amérique du Sud */}
              <path
                d="M62 92 L70 99 L72 110 L68 120 L64 132 L58 144 L53 136 L55 124 L51 115 L55 106 L53 98 Z"
                fill="url(#coinContinentGradient)"
                opacity="0.78"
                filter="url(#coinContinentGlow)"
              />

              {/* Europe */}
              <path
                d="M91 49 L101 44 L111 47 L117 53 L110 58 L101 57 L96 63 L88 59 Z"
                fill="url(#coinContinentGradient)"
                opacity="0.9"
                filter="url(#coinContinentGlow)"
              />

              {/* Asie */}
              <path
                d="M110 49 L124 42 L139 45 L153 52 L165 63 L160 72 L147 70 L137 75 L127 69 L116 68 L108 60 Z"
                fill="url(#coinContinentGradient)"
                opacity="0.85"
                filter="url(#coinContinentGlow)"
              />

              {/* AFRIQUE */}
              <motion.path
                d="M96 68 L108 64 L118 70 L121 82 L117 94 L112 103 L108 116 L102 130 L96 119 L93 107 L88 99 L91 88 L89 79 Z"
                fill="#FFFFFF"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="1"
                filter="url(#coinContinentGlow)"
                animate={{
                  opacity: [0.72, 1, 0.72],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Madagascar */}
              <path
                d="M121 111 L124 119 L121 129 L118 122 Z"
                fill="#dff8ff"
                opacity="0.85"
              />

              {/* Australie */}
              <path
                d="M145 113 L157 108 L169 113 L173 122 L166 130 L154 129 L146 123 Z"
                fill="url(#coinContinentGradient)"
                opacity="0.8"
                filter="url(#coinContinentGlow)"
              />
            </svg>
          </motion.div>

          {/* ==================================================
              REFLET
              ================================================== */}
          <div
            style={{
              position: 'absolute',
              width: '42%',
              height: '25%',
              top: '7%',
              left: '13%',
              borderRadius: '50%',
              background:
                'radial-gradient(ellipse, rgba(255,255,255,0.45), transparent 70%)',
              transform: 'rotate(-25deg)',
              filter: 'blur(3px)',
            }}
          />

          {/* ==================================================
              OMBRE INFÉRIEURE
              ================================================== */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background:
                'linear-gradient(135deg, transparent 40%, rgba(0,0,0,0.45) 100%)',
            }}
          />
        </div>

        {/* ==================================================
            ANNEAU LUMINEUX
            ================================================== */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            inset: '-4px',
            borderRadius: '50%',
            border:
              '1px solid rgba(255,255,255,0.35)',
            boxShadow:
              '0 0 12px rgba(120,200,255,0.35)',
          }}
        />
      </motion.div>
    );
  };

  /* ============================================================
   * LOGO coin.svg + GLOBE DANS LE O
   *
   * coin.svg reste l'image principale.
   * Le globe est superposé au-dessus du O.
   * ============================================================ */
  const renderCoinLogo = () => {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* ==================================================
            IMAGE ORIGINALE coin.svg
            ================================================== */}
        <img
          src="/coin.svg"
          alt="Coin Logo"
          className={`w-full h-full object-contain rounded-full shadow-2xl ${
            shine ? 'animate-shine' : ''
          }`}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
          }}
        />

        {/* ==================================================
            🌍 GLOBE DANS LE O
            Taille réduite d'environ 1/3
            et légèrement déplacé vers la droite.
            ================================================== */}
        <div
          style={{
            position: 'absolute',

            /*
             * Position horizontale :
             * 50% = centre
             * 53% = légèrement vers la droite
             */
            left: '43%',

            /*
             * Position verticale inchangée
             */
            top: '50%',

            /*
             * Ancienne taille : 31%
             * Nouvelle taille : 21%
             * ≈ réduction d'un tiers
             */
            width: '15%',
            height: '15%',

            transform:
              'translate(-50%, -50%)',

            zIndex: 5,

            borderRadius: '50%',
          }}
        >
          {renderGlobe()}
        </div>
      </div>
    );
  };

  /* ============================================================
   * PAGE
   * ============================================================ */
  return (
    <div
      className="flex justify-center items-center h-screen bg-black relative overflow-hidden"
      style={{
        fontFamily:
          'Inter, Arial, Helvetica, sans-serif',
      }}
    >
      {/* ========================================================
          FOND PROFESSIONNEL
          ======================================================== */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at center, rgba(25,35,55,0.22) 0%, rgba(0,0,0,0.85) 52%, #000000 100%)',
        }}
      />

      {/* ========================================================
          HALO GÉNÉRAL
          ======================================================== */}
      <motion.div
        className="absolute pointer-events-none"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: [0.4, 0.75, 0.4],
          scale: [0.95, 1.04, 0.95],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          width: 440,
          height: 440,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(100,150,255,0.035) 35%, transparent 70%)',
          filter: 'blur(14px)',
        }}
      />

      {/* ========================================================
          CONTENEUR PRINCIPAL
          ======================================================== */}
      <motion.div
        className="absolute flex flex-col items-center"
        initial={{
          x: '-40vw',
          y: '-40vh',
        }}
        animate={{
          x: [
            '-40vw',
            '0vw',
            '40vw',
            '0vw',
          ],
          y: [
            '-40vh',
            '40vh',
            '-40vh',
            '0vh',
          ],
          rotateZ: [
            0,
            720,
            1440,
            2160,
          ],
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
      >
        {/* ======================================================
            ZONE DU LOGO
            ====================================================== */}
        <div
          style={{
            width: 'min(300px, 72vw)',
            height: 'min(300px, 72vw)',
            perspective: '1000px',
            position: 'relative',
          }}
        >
          {/* ==================================================
              TRAÎNÉE LUMINEUSE
              ================================================== */}
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

          {/* ==================================================
              LOGO AVEC REBOND + VIBRATION
              ================================================== */}
          <motion.div
            animate={
              rebound || vibrate
                ? {
                    scale: [
                      1,
                      1.2,
                      0.95,
                      1.05,
                      1,
                    ],
                    x: vibrate
                      ? [0, -5, 5, -5, 5, 0]
                      : 0,
                    y: vibrate
                      ? [0, 3, -3, 3, -3, 0]
                      : 0,
                    scaleY: [
                      1,
                      0.8,
                      1.2,
                      1,
                    ],
                  }
                : {}
            }
            transition={{
              duration: 0.8,
              ease: 'easeOut',
            }}
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* ==================================================
                coin.svg + globe dans le O
                ================================================== */}
            {renderCoinLogo()}

            {/* Confettis */}
            {renderConfetti()}
          </motion.div>
        </div>

        {/* ======================================================
            SIGNATURE
            ====================================================== */}
        <motion.div
          initial={{
            opacity: 0,
            y: 25,
            scale: 0.85,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            delay: 6.1,
            duration: 1.4,
            ease: 'easeOut',
          }}
          className="relative flex flex-col items-center mt-7"
        >
          {/* ==================================================
              LIGNE SUPÉRIEURE
              ================================================== */}
          <motion.div
            initial={{
              width: 0,
              opacity: 0,
              boxShadow:
                '0 0 0 rgba(255,255,255,0)',
            }}
            animate={{
              width: 115,
              opacity: [0, 1, 0.75, 1],
              boxShadow: [
                '0 0 0 rgba(255,255,255,0)',
                '0 0 18px rgba(255,255,255,0.95)',
                '0 0 6px rgba(255,255,255,0.3)',
                '0 0 10px rgba(255,255,255,0.5)',
              ],
            }}
            transition={{
              delay: 6.4,
              duration: 1.3,
              ease: 'easeOut',
            }}
            style={{
              height: 1,
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
              marginBottom: 12,
            }}
          />

          {/* ==================================================
              L'ÉCOSYSTÈME ÉDUCATIF MONDIAL
              ================================================== */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.92,
              filter: 'blur(8px)',
              textShadow:
                '0 0 0 rgba(255,255,255,0)',
            }}
            animate={{
              opacity: [0, 1, 0.9, 1],
              y: [20, -2, 0],
              scale: [0.92, 1.04, 1],
              filter: [
                'blur(8px)',
                'blur(0px)',
                'blur(0px)',
              ],
              textShadow: [
                '0 0 0 rgba(255,255,255,0)',
                '0 0 30px rgba(255,255,255,1)',
                '0 0 12px rgba(255,255,255,0.35)',
                '0 0 20px rgba(255,255,255,0.65)',
              ],
            }}
            transition={{
              delay: 6.45,
              duration: 1.7,
              ease: 'easeOut',
            }}
            style={{
              color: '#FFFFFF',
              fontSize:
                'clamp(12px, 2vw, 22px)',
              fontWeight: 700,
              letterSpacing:
                'clamp(0.12em, 0.28em, 0.28em)',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              fontFamily:
                'Arial, Helvetica, sans-serif',
            }}
          >
            L'ÉCOSYSTÈME ÉDUCATIF MONDIAL
          </motion.div>

          {/* ==================================================
              LIGNE INFÉRIEURE
              ================================================== */}
          <motion.div
            initial={{
              opacity: 0,
              scaleX: 0,
              boxShadow:
                '0 0 0 rgba(255,255,255,0)',
            }}
            animate={{
              opacity: [0, 1, 0.75, 1],
              scaleX: [
                0,
                1.15,
                0.95,
                1,
              ],
              boxShadow: [
                '0 0 0 rgba(255,255,255,0)',
                '0 0 18px rgba(255,255,255,0.95)',
                '0 0 6px rgba(255,255,255,0.3)',
                '0 0 10px rgba(255,255,255,0.5)',
              ],
            }}
            transition={{
              delay: 6.75,
              duration: 1.3,
              ease: 'easeOut',
            }}
            style={{
              width: 70,
              height: 2,
              marginTop: 12,
              borderRadius: 999,
              background:
                'linear-gradient(90deg, transparent, #FFFFFF, transparent)',
            }}
          />

          {/* ==================================================
              TEXTE INFÉRIEUR
              ================================================== */}
          <motion.div
            initial={{
              opacity: 0,
              y: 14,
              scale: 0.9,
              filter: 'blur(6px)',
              textShadow:
                '0 0 0 rgba(255,255,255,0)',
            }}
            animate={{
              opacity: [0, 0.9, 0.55, 0.75],
              y: [14, -1, 0],
              scale: [0.9, 1.05, 1],
              filter: [
                'blur(6px)',
                'blur(0px)',
                'blur(0px)',
              ],
              textShadow: [
                '0 0 0 rgba(255,255,255,0)',
                '0 0 18px rgba(255,255,255,0.85)',
                '0 0 5px rgba(255,255,255,0.2)',
                '0 0 10px rgba(255,255,255,0.45)',
              ],
            }}
            transition={{
              delay: 6.95,
              duration: 1.6,
              ease: 'easeOut',
            }}
            style={{
              marginTop: 10,
              color:
                'rgba(255,255,255,0.45)',
              fontSize: 9,
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
            }}
          >
            Apprendre • Comprendre • Évoluer
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Page1;