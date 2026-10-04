// 📁 components/AnnouncementBanner.tsx

import React, { useEffect, useState } from "react";
import api from "@/utils/axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";

import {
  getOfflineData,
  saveOfflineData,
  STORES,
} from "@/offline/offlineDB";

interface Announcement {
  id: number;
  message: string;
  type: "alerte" | "avantage" | "info";
  start_date?: string;
  end_date?: string;
}

interface CachedAnnouncement {
  id: string;
  announcement: Announcement | null;
  cachedAt: number;
}

const ANNOUNCEMENT_CACHE_ID = "current";

const AnnouncementBanner: React.FC = () => {
  const [announcement, setAnnouncement] =
    useState<Announcement | null>(null);

  const [direction, setDirection] =
    useState<"left" | "right">("left");

  useEffect(() => {
    let previousId: number | null = null;
    let isMounted = true;

    /**
     * Charge la dernière annonce sauvegardée
     * dans IndexedDB.
     */
    const loadOfflineAnnouncement = async () => {
      try {
        const cached =
          await getOfflineData<CachedAnnouncement>(
            STORES.announcements,
            ANNOUNCEMENT_CACHE_ID
          );

        if (
          cached &&
          cached.announcement &&
          isMounted
        ) {
          setAnnouncement(cached.announcement);
          previousId = cached.announcement.id;
        }
      } catch (error) {
        console.error(
          "Erreur lecture annonce hors connexion :",
          error
        );
      }
    };

    /**
     * Récupère l'annonce depuis le serveur
     * et la sauvegarde localement.
     */
    const fetchCurrentAnnouncement = async () => {
      // IMPORTANT :
      // On ne contacte jamais Render lorsque
      // le navigateur indique qu'il est hors connexion.
      if (!navigator.onLine) {
        await loadOfflineAnnouncement();
        return;
      }

      try {
        const res = await api.get(
          "/api/announcements/current"
        );

        const currentAnnouncement:
          | Announcement
          | null = res.data || null;

        if (!isMounted) {
          return;
        }

        // Une nouvelle annonce vient d'apparaître
        if (
          currentAnnouncement &&
          currentAnnouncement.id !== previousId
        ) {
          setDirection(
            Math.random() > 0.5
              ? "left"
              : "right"
          );
        }

        previousId =
          currentAnnouncement?.id ?? null;

        // Mise à jour de l'affichage
        setAnnouncement(currentAnnouncement);

        // Sauvegarde locale pour le mode hors connexion
        await saveOfflineData<CachedAnnouncement>(
          STORES.announcements,
          {
            id: ANNOUNCEMENT_CACHE_ID,
            announcement: currentAnnouncement,
            cachedAt: Date.now(),
          }
        );
      } catch (error) {
        /**
         * Si une coupure survient exactement pendant
         * la requête, on bascule silencieusement
         * vers la dernière donnée locale.
         */
        console.warn(
          "Impossible de récupérer l'annonce en ligne. Lecture du cache local."
        );

        await loadOfflineAnnouncement();
      }
    };

    /**
     * Lorsque Internet revient :
     * récupération immédiate de l'annonce.
     */
    const handleOnline = () => {
      fetchCurrentAnnouncement();
    };

    /**
     * Lorsque Internet disparaît :
     * lecture immédiate du cache local.
     */
    const handleOffline = () => {
      loadOfflineAnnouncement();
    };

    window.addEventListener(
      "online",
      handleOnline
    );

    window.addEventListener(
      "offline",
      handleOffline
    );

    /**
     * Première récupération.
     *
     * Si l'application est hors connexion,
     * aucune requête réseau n'est effectuée.
     */
    fetchCurrentAnnouncement();

    /**
     * Vérification régulière.
     *
     * Le backend n'est interrogé que lorsque
     * le navigateur est réellement en ligne.
     */
    const interval = window.setInterval(() => {
      if (navigator.onLine) {
        fetchCurrentAnnouncement();
      }
    }, 1000);

    return () => {
      isMounted = false;

      window.removeEventListener(
        "online",
        handleOnline
      );

      window.removeEventListener(
        "offline",
        handleOffline
      );

      window.clearInterval(interval);
    };
  }, []);

  const getBannerColorHex = (
    type: Announcement["type"]
  ) => {
    switch (type) {
      case "alerte":
        return "#EF4444";

      case "avantage":
        return "#22C55E";

      case "info":
        return "#3B82F6";

      default:
        return "#FACC15";
    }
  };

  const getBannerIcon = (
    type: Announcement["type"]
  ) => {
    switch (type) {
      case "alerte":
        return (
          <AlertTriangle className="w-5 h-5" />
        );

      case "avantage":
        return (
          <CheckCircle className="w-5 h-5" />
        );

      case "info":
        return (
          <Info className="w-5 h-5" />
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {announcement && (
        <motion.div
          key={announcement.id}
          initial={{
            opacity: 0,
            x:
              direction === "left"
                ? -100
                : 100,
          }}
          animate={{
            opacity: 1,
            x: 0,
            backgroundColor:
              getBannerColorHex(
                announcement.type
              ),
            y: [0, -10, 0],
          }}
          exit={{
            opacity: 0,
            x:
              direction === "left"
                ? 100
                : -100,
          }}
          transition={{
            duration: 0.8,
          }}
          className="fixed top-0 w-full z-50 text-center py-2 shadow-md flex items-center justify-center text-white"
        >
          <motion.div
            initial={{
              opacity: 0,
              x: -10,
            }}
            animate={{
              opacity: 1,
              x: [0, -2, 2, -2, 2, 0],
            }}
            transition={{
              duration: 0.5,
              delay: 0.1,
            }}
          >
            {getBannerIcon(
              announcement.type
            )}
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              x: 10,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.2,
            }}
          >
            <div className="text-sm font-medium">
              {announcement.message}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnnouncementBanner;