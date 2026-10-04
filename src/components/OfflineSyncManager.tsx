// 📁 src/components/OfflineSyncManager.tsx

import { useEffect, useRef } from "react";
import { syncOfflineQueue } from "@/offline/syncQueue";

const OfflineSyncManager: React.FC = () => {
  const syncingRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    // ============================================================
    // SYNCHRONISATION SÉCURISÉE
    // ============================================================

    const runSync = async () => {
      // ----------------------------------------------------------
      // Éviter plusieurs synchronisations simultanées
      // ----------------------------------------------------------

      if (syncingRef.current) {
        console.log(
          "⏳ Synchronisation déjà en cours."
        );

        return;
      }

      // ----------------------------------------------------------
      // Pas de connexion
      // ----------------------------------------------------------

      if (!navigator.onLine) {
        console.log(
          "📴 Synchronisation ignorée : appareil hors ligne."
        );

        return;
      }

      if (!mounted) {
        return;
      }

      syncingRef.current = true;

      try {
        console.log(
          "🔄 CODE : lancement de la synchronisation hors ligne..."
        );

        await syncOfflineQueue();

        console.log(
          "✅ CODE : synchronisation hors ligne terminée."
        );
      } catch (error) {
        console.error(
          "❌ CODE : erreur pendant la synchronisation hors ligne :",
          error
        );
      } finally {
        syncingRef.current = false;
      }
    };

    // ============================================================
    // RETOUR DE LA CONNEXION INTERNET
    // ============================================================

    const handleOnline = () => {
      console.log(
        "🌐 CODE : connexion Internet rétablie."
      );

      // Petit délai pour laisser la connexion se stabiliser.
      setTimeout(() => {
        if (mounted) {
          void runSync();
        }
      }, 1000);
    };

    // ============================================================
    // ÉVÉNEMENT HORS LIGNE
    // ============================================================

    const handleOffline = () => {
      console.log(
        "📴 CODE : appareil passé hors ligne."
      );
    };

    // ============================================================
    // ÉCOUTE DES ÉVÉNEMENTS
    // ============================================================

    window.addEventListener(
      "online",
      handleOnline
    );

    window.addEventListener(
      "offline",
      handleOffline
    );

    // ============================================================
    // SYNCHRONISATION AU DÉMARRAGE
    // ============================================================

    void runSync();

    // ============================================================
    // NETTOYAGE
    // ============================================================

    return () => {
      mounted = false;

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

  return null;
};

export default OfflineSyncManager;