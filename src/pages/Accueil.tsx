// 📁 src/pages/Accueil.tsx
import React, {
  useRef,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

interface AccueilProps {
  videos: string[];
  skipDelay?: number;
}

const Accueil: React.FC<AccueilProps> = ({
  videos,
  skipDelay = 5,
}) => {
  const navigate = useNavigate();

  const videoRef1 =
    useRef<HTMLVideoElement>(null);

  const videoRef2 =
    useRef<HTMLVideoElement>(null);

  const crossfadeIntervalRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  const [currentVideoIndex, setCurrentVideoIndex] =
    useState(0);

  const [fadeVideo1, setFadeVideo1] =
    useState(true);

  const [skipTimer, setSkipTimer] =
    useState(skipDelay);

  const [soundUnlocked, setSoundUnlocked] =
    useState(true);

  // ============================================================
  // ÉTAT DE LA CONNEXION
  // ============================================================

  const [isOffline, setIsOffline] =
    useState<boolean>(() => {
      if (
        typeof navigator === "undefined"
      ) {
        return false;
      }

      return !navigator.onLine;
    });

  const [videoError, setVideoError] =
    useState(false);

  // ============================================================
  // SURVEILLANCE DE LA CONNEXION
  // ============================================================

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setVideoError(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener(
      "online",
      handleOnline
    );

    window.addEventListener(
      "offline",
      handleOffline
    );

    return () => {
      window.removeEventListener(
        "online",
        handleOnline
      );

      window.removeEventListener(
        "offline",
        handleOffline
      );
    };
  }, []);

  // ============================================================
  // PROTECTION SI AUCUNE VIDÉO N'EST FOURNIE
  // ============================================================

  useEffect(() => {
    if (videos.length === 0) {
      setVideoError(true);
    } else {
      setVideoError(false);
    }
  }, [videos]);

  // ============================================================
  // TIMER SKIP
  // ============================================================

  useEffect(() => {
    setSkipTimer(skipDelay);

    const interval =
      setInterval(() => {
        setSkipTimer((prev) =>
          prev > 0 ? prev - 1 : 0
        );
      }, 1000);

    return () =>
      clearInterval(interval);
  }, [
    currentVideoIndex,
    skipDelay,
  ]);

  // ============================================================
  // NETTOYAGE DU CROSSFADE
  // ============================================================

  useEffect(() => {
    return () => {
      if (
        crossfadeIntervalRef.current
      ) {
        clearInterval(
          crossfadeIntervalRef.current
        );

        crossfadeIntervalRef.current =
          null;
      }
    };
  }, []);

  // ============================================================
  // LECTURE INITIALE
  // ============================================================

  useEffect(() => {
    if (videos.length === 0) {
      return;
    }

    const currentRef =
      fadeVideo1
        ? videoRef1.current
        : videoRef2.current;

    if (!currentRef) {
      return;
    }

    const videoUrl =
      videos[currentVideoIndex];

    if (!videoUrl) {
      setVideoError(true);
      return;
    }

    setVideoError(false);

    currentRef.src = videoUrl;
    currentRef.currentTime = 0;
    currentRef.muted =
      !soundUnlocked;
    currentRef.volume = 1;

    currentRef.play().catch(() => {
      // Le navigateur peut bloquer
      // la lecture automatique.
    });
  }, [
    currentVideoIndex,
    fadeVideo1,
    soundUnlocked,
    videos,
  ]);

  // ============================================================
  // PASSAGE À LA VIDÉO SUIVANTE AVEC CROSSFADE
  // ============================================================

  const goNext = () => {
    if (videos.length === 0) {
      navigate("/matiere");
      return;
    }

    if (
      currentVideoIndex >=
      videos.length - 1
    ) {
      navigate("/matiere");
      return;
    }

    const nextIndex =
      currentVideoIndex + 1;

    const fadeOut = fadeVideo1
      ? videoRef1.current
      : videoRef2.current;

    const fadeIn = fadeVideo1
      ? videoRef2.current
      : videoRef1.current;

    if (!fadeOut || !fadeIn) {
      setCurrentVideoIndex(
        nextIndex
      );
      setFadeVideo1(
        !fadeVideo1
      );
      return;
    }

    const nextVideoUrl =
      videos[nextIndex];

    if (!nextVideoUrl) {
      setVideoError(true);
      return;
    }

    // Nettoyer un éventuel ancien crossfade
    if (
      crossfadeIntervalRef.current
    ) {
      clearInterval(
        crossfadeIntervalRef.current
      );

      crossfadeIntervalRef.current =
        null;
    }

    setVideoError(false);

    fadeIn.src =
      nextVideoUrl;

    fadeIn.currentTime = 0;
    fadeIn.volume = 0;
    fadeIn.muted =
      !soundUnlocked;

    fadeIn.style.opacity = "0";

    fadeIn.play().catch(() => {});

    let progress = 0;

    const steps = 20;

    crossfadeIntervalRef.current =
      setInterval(() => {
        progress++;

        const ratio =
          progress / steps;

        fadeOut.volume =
          1 - ratio;

        fadeIn.volume =
          ratio;

        fadeOut.style.opacity =
          `${1 - ratio}`;

        fadeIn.style.opacity =
          `${ratio}`;

        if (
          progress >= steps
        ) {
          if (
            crossfadeIntervalRef.current
          ) {
            clearInterval(
              crossfadeIntervalRef.current
            );

            crossfadeIntervalRef.current =
              null;
          }

          fadeOut.pause();

          fadeOut.volume = 1;

          fadeIn.volume = 1;

          setCurrentVideoIndex(
            nextIndex
          );

          setFadeVideo1(
            !fadeVideo1
          );
        }
      }, 35);
  };

  // ============================================================
  // ACTIVATION DU SON
  // ============================================================

  const enableSound =
    async () => {
      const currentRef =
        fadeVideo1
          ? videoRef1.current
          : videoRef2.current;

      if (!currentRef) {
        return;
      }

      currentRef.muted = false;
      currentRef.volume = 1;

      try {
        await currentRef.play();

        setSoundUnlocked(true);
      } catch {
        // Le navigateur peut encore
        // refuser la lecture.
      }
    };

  // ============================================================
  // VIDÉO INDISPONIBLE
  // ============================================================

  const handleVideoError =
    () => {
      setVideoError(true);
    };

  // ============================================================
  // SI AUCUNE VIDÉO N'EST DISPONIBLE
  // ============================================================

  if (videos.length === 0) {
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-black flex items-center justify-center px-6">

        <div className="text-center text-white max-w-md">

          <div className="text-5xl mb-5">
            🎬
          </div>

          <h1 className="text-xl sm:text-2xl font-bold mb-3">
            Vidéo indisponible
          </h1>

          <p className="text-gray-300 text-sm sm:text-base mb-6">
            Aucune vidéo d'accueil n'est
            actuellement disponible.
          </p>

          <button
            onClick={() =>
              navigate("/matiere")
            }
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-5 py-3 rounded-lg shadow-lg transition-all"
          >
            Continuer
          </button>

        </div>
      </div>
    );
  }

  // ============================================================
  // AFFICHAGE PRINCIPAL
  // ============================================================

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">

      {/* ======================================================
          VIDÉO 1
      ====================================================== */}

      <video
        ref={videoRef1}
        className="absolute inset-0 w-full h-full object-cover opacity-1 transition-opacity duration-300"
        playsInline
        controls={false}
        onEnded={goNext}
        onError={handleVideoError}
        disablePictureInPicture
      />

      {/* ======================================================
          VIDÉO 2
      ====================================================== */}

      <video
        ref={videoRef2}
        className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300"
        playsInline
        controls={false}
        onEnded={goNext}
        onError={handleVideoError}
        disablePictureInPicture
      />

      {/* ======================================================
          VOILE
      ====================================================== */}

      <div className="absolute inset-0 bg-black/30" />

      {/* ======================================================
          MODE HORS LIGNE
      ====================================================== */}

      {isOffline && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">

          <div className="bg-black/70 text-gray-200 border border-gray-600 rounded-full px-4 py-2 text-xs sm:text-sm shadow-lg backdrop-blur-sm">
            📴 Mode hors ligne
          </div>

        </div>
      )}

      {/* ======================================================
          VIDÉO INDISPONIBLE / ERREUR
      ====================================================== */}

      {videoError && (
        <div className="absolute inset-0 flex justify-center items-center z-20 px-6">

          <div className="bg-black/75 backdrop-blur-sm rounded-2xl p-6 sm:p-8 text-center max-w-md shadow-2xl">

            <div className="text-4xl mb-4">
              🎬
            </div>

            <h2 className="text-white text-lg sm:text-xl font-bold mb-3">
              Vidéo momentanément indisponible
            </h2>

            <p className="text-gray-300 text-sm mb-5">
              {isOffline
                ? "Cette vidéo nécessite une connexion ou n'a pas encore été disponible hors ligne."
                : "La vidéo n'a pas pu être chargée."}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">

              <button
                onClick={() => {
                  setVideoError(false);

                  const currentRef =
                    fadeVideo1
                      ? videoRef1.current
                      : videoRef2.current;

                  if (currentRef) {
                    currentRef.load();

                    currentRef
                      .play()
                      .catch(() => {});
                  }
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-5 py-2 rounded-lg transition"
              >
                Réessayer
              </button>

              <button
                onClick={() =>
                  navigate("/matiere")
                }
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-5 py-2 rounded-lg transition"
              >
                Continuer
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ======================================================
          ACTIVATION DU SON
      ====================================================== */}

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

      {/* ======================================================
          BOUTON PASSER / CONTINUER
      ====================================================== */}

      <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 z-20 flex flex-col items-start gap-2 w-44 sm:w-52 p-2 sm:p-0">

        {skipTimer > 0 ? (

          <div className="bg-gray-700/50 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm flex flex-col gap-1">

            <span>
              Passer dans{" "}
              {skipTimer}s
            </span>

            <div className="w-full h-1 bg-gray-500 rounded overflow-hidden">

              <div
                className="h-1 bg-yellow-500 transition-all duration-300 ease-linear"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      ((skipDelay -
                        skipTimer) /
                        Math.max(
                          skipDelay,
                          1
                        )) *
                        100
                    )
                  )}%`,
                }}
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

      {/* ======================================================
          ANIMATION
      ====================================================== */}

      <style>{`
        @keyframes pulseSlow {
          0%, 100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.05);
          }
        }

        .animate-pulseSlow {
          animation: pulseSlow 2s infinite;
        }
      `}</style>

    </div>
  );
};

export default Accueil;