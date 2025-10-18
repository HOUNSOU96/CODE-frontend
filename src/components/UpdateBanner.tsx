// 📁 src/components/UpdateBanner.tsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button"; // <-- chemin adapté avec alias

const UpdateBanner: React.FC = () => {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Vérifie si un service worker est déjà enregistré
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (!registration) return;

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setShowBanner(true);
              }
            });
          }
        });
      });

      // Écoute les messages du SW pour les mises à jour
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data === "NEW_VERSION_AVAILABLE") {
          setShowBanner(true);
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    waitingWorker?.postMessage({ type: "SKIP_WAITING" });
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 shadow-lg flex items-center justify-between z-50 rounded-t-2xl"
        >
          <span className="font-medium">
            🚀 Nouvelle version de <strong>CODE</strong> disponible !
          </span>
          <Button
            onClick={handleUpdate}
            className="bg-white text-blue-700 hover:bg-blue-100 font-semibold rounded-lg"
          >
            Mettre à jour
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdateBanner;
