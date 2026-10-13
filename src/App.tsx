// 📁 App.tsx

import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";

import AnimatedRoutes from "./AnimatedRoutes";

import DarkModeToggle from "./components/DarkModeToggle";
import AudioManager from "./components/AudioManager";
import AnnouncementBanner from "./components/AnnouncementBanner";

import InstallPWA from "./components/InstallPWA";
import UpdateBanner from "./components/UpdateBanner";

import { syncOfflineQueue } from "@/offline/syncQueue";

const App: React.FC = () => {
  // ==================================================
  // SYNCHRONISATION DES DONNÉES HORS LIGNE
  // ==================================================

  useEffect(() => {
    // ------------------------------------------------
    // 1. Vérifier immédiatement s'il existe des
    //    résultats en attente au démarrage de CODE.
    // ------------------------------------------------

    void syncOfflineQueue();

    // ------------------------------------------------
    // 2. Écouter le retour d'Internet.
    // ------------------------------------------------

    const handleOnline = () => {
      console.log(
        "🌐 Internet rétabli. Synchronisation de CODE..."
      );

      void syncOfflineQueue();
    };

    window.addEventListener(
      "online",
      handleOnline
    );

    // ------------------------------------------------
    // 3. Nettoyage de l'écouteur.
    // ------------------------------------------------

    return () => {
      window.removeEventListener(
        "online",
        handleOnline
      );
    };
  }, []);

  return (
    <Router>
      {/* ==================================================
          INSTALLATION DE CODE
          ================================================== */}

      <InstallPWA />

      {/* ==================================================
          MISE À JOUR DE CODE
          ================================================== */}

      <UpdateBanner />

      {/* ==================================================
          ANNONCES
          ================================================== */}

      <AnnouncementBanner />

      {/* ==================================================
          GESTION AUDIO
          Une seule instance dans toute l'application
          ================================================== */}

      <AudioManager />

      {/* ==================================================
          NAVIGATION
          ================================================== */}

      <AnimatedRoutes />

      {/* ==================================================
          MODE SOMBRE / CLAIR
          ================================================== */}

      <DarkModeToggle />
    </Router>
  );
};

export default App;