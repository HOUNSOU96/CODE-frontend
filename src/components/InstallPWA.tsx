import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, CheckCircle } from "lucide-react";

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Détection iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(ios);

    // Vérifie si la PWA est déjà installée
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Détection Android/Desktop via beforeinstallprompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);

      // ⏳ Masquer automatiquement la bannière après 10 secondes
      setTimeout(() => {
        setShowBanner(false);
      }, 10000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        console.log("✅ PWA installée !");
        setShowBanner(false);
        setShowToast(true);

        // Masquer le toast après 5 secondes
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
      setDeferredPrompt(null);
    }
  };

  if (isInstalled) return null;

  return (
    <>
      {/* 🔹 Bannière d'installation */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white rounded-2xl shadow-lg w-[90%] max-w-md px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <Download size={22} />
              <span className="text-sm font-medium">
                Installer <strong>CODE</strong> pour un accès rapide 📱
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleInstallClick}
                className="bg-white text-blue-600 px-3 py-1 rounded-lg font-semibold text-sm hover:bg-blue-100 transition"
              >
                Installer
              </button>
              <button
                onClick={() => setShowBanner(false)}
                className="p-1 text-white hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {/* 🔹 Message spécial iPhone */}
        {isIos && !isInstalled && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white rounded-2xl shadow-lg w-[90%] max-w-md px-4 py-3 text-center"
          >
            📱 Sur iPhone : Ouvrez Safari → <strong>Partager</strong> →{" "}
            <strong>Ajouter à l’écran d’accueil</strong> pour installer CODE.
          </motion.div>
        )}

        {/* 🔹 Toast de confirmation */}
        {showToast && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed bottom-16 left-1/2 transform -translate-x-1/2 bg-green-600 text-white rounded-xl px-4 py-2 shadow-md flex items-center space-x-2 z-50"
          >
            <CheckCircle size={18} />
            <span className="text-sm font-medium">
              ✅ CODE est maintenant installé !
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InstallPWA;
