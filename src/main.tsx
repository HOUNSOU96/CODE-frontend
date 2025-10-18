import './index.css'
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// src/main.tsx
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("Service Worker enregistré :", reg);

        // Gestion mise à jour
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          installingWorker?.addEventListener("statechange", () => {
            if (installingWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                // Nouvelle version dispo
                console.log("Nouvelle version disponible !");
              }
            }
          });
        };
      })
      .catch((err) => console.error("Erreur SW :", err));
  });
}
