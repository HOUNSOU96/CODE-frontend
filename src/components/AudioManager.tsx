// 📁 AudioManager.tsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

// Playlist de musiques
const audioPlaylist = [
  "/sounds/hymne.mp3",
  "/sounds/hymnefon.mp3",
  "/sounds/hymneadja.mp3",
  "/sounds/conference.mp3",
];

// Pages où la musique doit s’arrêter automatiquement
const shouldPauseAudio = ["/accueil","/inscription","/remediationvideo"];

// Global audio partagé
let globalAudio: HTMLAudioElement | null = null;

const AudioManager: React.FC = () => {
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 2500);
  };

  // Fonction pour choisir un morceau aléatoire
  const playRandomTrack = () => {
    if (!globalAudio) return;
    const randomIndex = Math.floor(Math.random() * audioPlaylist.length);
    globalAudio.src = audioPlaylist[randomIndex];
    globalAudio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  };

  // Initialisation audio et événement fin de morceau
  useEffect(() => {
    if (!globalAudio) {
      globalAudio = new Audio(audioPlaylist[Math.floor(Math.random() * audioPlaylist.length)]);
      globalAudio.loop = false;
      globalAudio.addEventListener("ended", playRandomTrack);
    }
    audioRef.current = globalAudio;
  }, []);

  // Auto play / pause selon la page
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const path = location.pathname.toLowerCase();
    const shouldPause = shouldPauseAudio.some((p) => path.includes(p.toLowerCase()));

    if (shouldPause && !audio.paused) {
      audio.pause();
      setIsPlaying(false);
    } else if (!shouldPause && audio.paused) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [location.pathname]);

  // Bouton Play/Pause manuel
  const handleToggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          showNotification("▶️ Musique reprise");
        })
        .catch(() => showNotification("⚠️ Lecture impossible"));
    } else {
      audio.pause();
      setIsPlaying(false);
      showNotification("⏸️ Musique en pause");
    }
  };

  // Le bouton n’apparaît **que sur Page2**
  const path = location.pathname.toLowerCase();
  const isVisible = path === "/page2";

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white/90 dark:bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col items-center gap-2 w-[160px]">
      <button
        onClick={handleToggleAudio}
        className="w-full text-sm font-semibold text-gray-800 dark:text-white bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition"
      >
        {isPlaying ? "⏸️ Pause" : "▶️ Play"}
      </button>

      <div className="text-[11px] text-gray-500 dark:text-gray-400 italic text-center">
        {isPlaying ? "Lecture en cours..." : "Cliquez pour reprendre."}
      </div>

      {notification && (
        <div className="absolute top-[-40px] right-0 bg-black/80 text-white text-xs px-3 py-1 rounded shadow-lg">
          {notification}
        </div>
      )}
    </div>
  );
};

export default AudioManager;
