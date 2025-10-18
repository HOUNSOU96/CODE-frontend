// 📁 App.tsx
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AnimatedRoutes from "./AnimatedRoutes";
import DarkModeToggle from "./components/DarkModeToggle";
import AudioManager from "./components/AudioManager";
import AnnouncementBanner from "./components/AnnouncementBanner";
import InstallPWA from "./components/InstallPWA"; // <-- import

const App: React.FC = () => {
  return (
    <Router>
      {/* Installation PWA */}
      <InstallPWA />

      {/* Bandeau d'annonces affiché partout */}
      <AnnouncementBanner />

      {/* Gestion audio (unique instance) */}
      <AudioManager />

      {/* Navigation avec animations */}
      <AnimatedRoutes />

      {/* Bouton dark/light mode */}
      <DarkModeToggle />
    </Router>
  );
};

export default App;
