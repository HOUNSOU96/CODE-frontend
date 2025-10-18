import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, CheckCircle } from "lucide-react";

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [skipInstall, setSkipInstall] = useState(false); // <-- Nouvel état

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(ios);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
      }
      setDeferredPrompt(null);
    }
  };

  // ✅ Ne pas afficher si installé ou choisi “Pas maintenant”
  if (isInstalled || skipInstall) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 backdrop-blur-md bg-black/60 flex items-center justify-center px-6"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-b from-blue-800 to-blue-600 text-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center border border-blue-400/30"
        >
          <h1 className="text-2xl font-extrabold mb-3 tracking-wide text-gold">
            🚀 Installez <span className="text-yellow-400">CODE</span>
          </h1>
          <p className="text-sm opacity-90 mb-6">
            Pour continuer, installez l’application <strong>CODE</strong> sur votre appareil.
          </p>

          {isIos ? (
            <p className="text-sm leading-relaxed">
              📱 Sur iPhone : Ouvrez Safari → <strong className="text-yellow-300">Partager</strong> → <strong className="text-yellow-300">Ajouter à l’écran d’accueil</strong>.
            </p>
          ) : (
            <>
              <motion.button
                onClick={handleInstallClick}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 font-bold px-6 py-3 rounded-full shadow-lg hover:scale-105 hover:shadow-yellow-200/50 transition-all duration-300 w-full mt-3 flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Installer CODE
              </motion.button>

              {/* ⬅️ Bouton "Pas maintenant" */}
              <button
                onClick={() => setSkipInstall(true)}
                className="mt-3 text-sm underline opacity-80 hover:opacity-100"
              >
                Pas maintenant
              </button>
            </>
          )}
        </motion.div>
      </motion.div>

      {/* ✅ Toast de confirmation */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-green-600 text-white rounded-2xl px-4 py-2 shadow-lg flex items-center space-x-2 z-50"
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
