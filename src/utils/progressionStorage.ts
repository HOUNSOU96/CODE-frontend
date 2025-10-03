import axios from "axios";
import { ApprenantProgression } from "@/types/progression";

const CLE = "progression_apprenant";

export function saveProgression(progression: ApprenantProgression) {
  localStorage.setItem(CLE, JSON.stringify(progression));
}

export function loadProgression(): ApprenantProgression | null {
  const data = localStorage.getItem(CLE);
  return data ? JSON.parse(data) : null;
}

export function resetProgression() {
  localStorage.removeItem(CLE);
}

// Instance Axios configurée avec baseURL et token
const instance = axios.create({
  baseURL: "http://localhost:8000", // ✅ backend port
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance; // ✅ permet d'utiliser instance ailleurs
