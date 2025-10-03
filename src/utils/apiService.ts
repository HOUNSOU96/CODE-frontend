// 📁 src/utils/apiService.ts
import api from "./axios";

// ----------------------------
// Auth / Utilisateur
// ----------------------------
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data; // devrait contenir token et info utilisateur
  } catch (err: any) {
    console.error("Erreur login :", err.message);
    throw err;
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get("/api/auth/profile");
    return response.data;
  } catch (err: any) {
    console.error("Erreur récupération profil :", err.message);
    throw err;
  }
};

// ----------------------------
// Test de positionnement
// ----------------------------
export const getQuestions = async (niveau?: string, notion?: string) => {
  try {
    const response = await api.get("/api/questions", {
      params: { niveau, notion },
    });
    return response.data;
  } catch (err: any) {
    console.error("Erreur récupération questions :", err.message);
    throw err;
  }
};

export const submitTest = async (testId: string, answers: any) => {
  try {
    const response = await api.post(`/api/questions/${testId}/submit`, { answers });
    return response.data; // note, mentions, notions non acquises
  } catch (err: any) {
    console.error("Erreur soumission test :", err.message);
    throw err;
  }
};

// ----------------------------
// Remédiation / Vidéos
// ----------------------------
export const getRemediationVideos = async (niveau: string, notion: string) => {
  try {
    const response = await api.get(`/api/remediation/${niveau}/${notion}`);
    return response.data; // liste vidéos
  } catch (err: any) {
    console.error("Erreur récupération vidéos :", err.message);
    throw err;
  }
};

export const submitVideoTest = async (videoId: string, answers: any) => {
  try {
    const response = await api.post(`/api/remediation/video/${videoId}/submit`, { answers });
    return response.data; // réussite ou échec
  } catch (err: any) {
    console.error("Erreur soumission test vidéo :", err.message);
    throw err;
  }
};

// ----------------------------
// Annonces
// ----------------------------
export const getCurrentAnnouncements = async () => {
  try {
    const response = await api.get("/api/announcements/current");
    return response.data;
  } catch (err: any) {
    console.error("Erreur récupération annonces :", err.message);
    return [];
  }
};

// ----------------------------
// Autres endpoints à ajouter ici
// ----------------------------
