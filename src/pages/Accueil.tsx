// 📁 src/pages/Accueil.tsx
import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AccueilProps {
  videos: string[];
  skipDelay?: number;
}

const Accueil: React.FC<AccueilProps> = ({ videos, skipDelay = 5 }) => {
  const navigate = useNavigate();
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [fadeVideo1, setFadeVideo1] = useState(true);
  const [skipTimer, setSkipTimer] = useState(skipDelay);
  const [soundUnlocked, setSoundUnlocked] = useState(true);

  // Timer skip
  useEffect(() => {
    setSkipTimer(skipDelay);
    const interval = setInterval(() => {
      setSkipTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentVideoIndex, skipDelay]);

  // Lecture initiale
  useEffect(() => {
    const currentRef = fadeVideo1 ? videoRef1.current : videoRef2.current;
    if (currentRef) {
      currentRef.src = videos[currentVideoIndex];
      currentRef.currentTime = 0;
      currentRef.muted = !soundUnlocked;
      currentRef.volume = 1;
      currentRef.play().catch(() => {});
    }
  }, [currentVideoIndex, fadeVideo1, soundUnlocked, videos]);

  // Passage à la vidéo suivante avec crossfade
  const goNext = () => {
    if (currentVideoIndex >= videos.length - 1) {
      navigate("/matiere");
      return;
    }

    const nextIndex = currentVideoIndex + 1;
    const fadeOut = fadeVideo1 ? videoRef1.current : videoRef2.current;
    const fadeIn = fadeVideo1 ? videoRef2.current : videoRef1.current;

    if (fadeOut && fadeIn) {
      fadeIn.src = videos[nextIndex];
      fadeIn.currentTime = 0;
      fadeIn.volume = 0;
      fadeIn.muted = !soundUnlocked;
      fadeIn.play().catch(() => {});

      let progress = 0;
      const steps = 20;
      const interval = setInterval(() => {
        progress++;
        const ratio = progress / steps;
        fadeOut.volume = 1 - ratio;
        fadeIn.volume = ratio;

        fadeOut.style.opacity = `${1 - ratio}`;
        fadeIn.style.opacity = `${ratio}`;

        if (progress >= steps) {
          clearInterval(interval);
          fadeOut.pause();
          fadeOut.volume = 1;
          fadeIn.volume = 1;
          setCurrentVideoIndex(nextIndex);
          setFadeVideo1(!fadeVideo1);
        }
      }, 35);
    }
  };

  const enableSound = async () => {
    const currentRef = fadeVideo1 ? videoRef1.current : videoRef2.current;
    if (currentRef) {
      currentRef.muted = false;
      currentRef.volume = 1;
      try {
        await currentRef.play();
        setSoundUnlocked(true);
      } catch {}
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <video
        ref={videoRef1}
        className="absolute inset-0 w-full h-full object-cover opacity-1 transition-opacity duration-300"
        playsInline
        controls={false}
        onEnded={goNext}
        disablePictureInPicture
      />
      <video
        ref={videoRef2}
        className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300"
        playsInline
        controls={false}
        onEnded={goNext}
        disablePictureInPicture
      />

      <div className="absolute inset-0 bg-black/30" />

      {!soundUnlocked && (
        <div className="absolute inset-0 flex justify-center items-center z-20 px-4 sm:px-6">
          <button
            onClick={enableSound}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg transition-all animate-pulseSlow text-sm sm:text-base"
          >
            🔊 Activer le son
          </button>
        </div>
      )}

      <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 z-20 flex flex-col items-start gap-2 w-44 sm:w-52 p-2 sm:p-0">
        {skipTimer > 0 ? (
          <div className="bg-gray-700/50 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm flex flex-col gap-1">
            <span>Passer dans {skipTimer}s</span>
            <div className="w-full h-1 bg-gray-500 rounded overflow-hidden">
              <div
                className="h-1 bg-yellow-500 transition-all duration-300 ease-linear"
                style={{ width: `${((skipDelay - skipTimer) / skipDelay) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <button
            onClick={goNext}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-3 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm shadow-lg transition-all animate-pulseSlow flex items-center gap-2 w-full justify-center"
          >
            Continuer
          </button>
        )}
      </div>

      <style>{`
        @keyframes pulseSlow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-pulseSlow {
          animation: pulseSlow 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Accueil;
