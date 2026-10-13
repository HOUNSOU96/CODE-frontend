// 📁 src/utils/apiService.ts

import api from "./axios";

import {
  getOfflineData,
  saveOfflineData,
  STORES,
} from "@/offline/offlineDB";

// ----------------------------
// Types locaux
// ----------------------------

export interface Announcement {
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

// ----------------------------
// Auth / Utilisateur
// ----------------------------

export const login = async (
  email: string,
  password: string
) => {
  try {
    const response = await api.post(
      "/api/auth/login",
      {
        email,
        password,
      }
    );

    return response.data;
  } catch (err: any) {
    console.error(
      "Erreur login :",
      err.message
    );

    throw err;
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get(
      "/api/auth/profile"
    );

    return response.data;
  } catch (err: any) {
    console.error(
      "Erreur récupération profil :",
      err.message
    );

    throw err;
  }
};

// ----------------------------
// Test de positionnement
// ----------------------------

export const getQuestions = async (
  niveau?: string,
  notion?: string
) => {
  try {
    const response = await api.get(
      "/api/questions",
      {
        params: {
          niveau,
          notion,
        },
      }
    );

    return response.data;
  } catch (err: any) {
    console.error(
      "Erreur récupération questions :",
      err.message
    );

    throw err;
  }
};

export const submitTest = async (
  testId: string,
  answers: any
) => {
  try {
    const response = await api.post(
      `/api/questions/${testId}/submit`,
      {
        answers,
      }
    );

    return response.data;
  } catch (err: any) {
    console.error(
      "Erreur soumission test :",
      err.message
    );

    throw err;
  }
};

// ----------------------------
// Remédiation / Vidéos
// ----------------------------

export const getRemediationVideos = async (
  niveau: string,
  notion: string
) => {
  try {
    const response = await api.get(
      `/api/remediation/${niveau}/${notion}`
    );

    return response.data;
  } catch (err: any) {
    console.error(
      "Erreur récupération vidéos :",
      err.message
    );

    throw err;
  }
};

export const submitVideoTest = async (
  videoId: string,
  answers: any
) => {
  try {
    const response = await api.post(
      `/api/remediation/video/${videoId}/submit`,
      {
        answers,
      }
    );

    return response.data;
  } catch (err: any) {
    console.error(
      "Erreur soumission test vidéo :",
      err.message
    );

    throw err;
  }
};

// ----------------------------
// Annonces
// ----------------------------

export const getCurrentAnnouncements =
  async (): Promise<Announcement | null> => {
    /**
     * HORS CONNEXION
     *
     * Ne tente surtout pas d'appeler le backend.
     */
    if (!navigator.onLine) {
      try {
        const cached =
          await getOfflineData<CachedAnnouncement>(
            STORES.announcements,
            ANNOUNCEMENT_CACHE_ID
          );

        return cached?.announcement ?? null;
      } catch (err) {
        console.error(
          "Erreur lecture annonces hors connexion :",
          err
        );

        return null;
      }
    }

    /**
     * EN LIGNE
     *
     * Récupération depuis FastAPI.
     */
    try {
      const response = await api.get(
        "/api/announcements/current"
      );

      const announcement:
        | Announcement
        | null = response.data || null;

      /**
       * Sauvegarde locale.
       *
       * Cela permettra à CODE de continuer
       * à afficher l'annonce sans Internet.
       */
      await saveOfflineData<CachedAnnouncement>(
        STORES.announcements,
        {
          id: ANNOUNCEMENT_CACHE_ID,
          announcement,
          cachedAt: Date.now(),
        }
      );

      return announcement;
    } catch (err: any) {
      /**
       * Si Internet disparaît pendant la requête,
       * on tente le cache local.
       */
      console.warn(
        "Impossible de récupérer les annonces en ligne. Lecture du cache local."
      );

      try {
        const cached =
          await getOfflineData<CachedAnnouncement>(
            STORES.announcements,
            ANNOUNCEMENT_CACHE_ID
          );

        return cached?.announcement ?? null;
      } catch (cacheError) {
        console.error(
          "Erreur lecture cache annonces :",
          cacheError
        );

        return null;
      }
    }
  };

// ----------------------------
// Autres endpoints à ajouter ici
// ----------------------------