import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useExitNotifier } from "@/hooks/useExitNotifier";
import { LogOut } from "lucide-react";
import api from "@/utils/axios";

/* ---------------- IMAGES ---------------- */
const images = [
  "/images/b1.jpg", "/images/b2.jpg", "/images/b3.webp", "/images/b4.jpg",
  "/images/b5.jpeg", "/images/b6.jpeg", "/images/b7.jpg", "/images/b8.jpeg",
  "/images/b9.jpg", "/images/b10.avif", "/images/b11.jpeg", "/images/b12.jpeg",
  "/images/b13.jpg", "/images/b14.jpg", "/images/b15.webp", "/images/b16.avif",
  "/images/b17.jpeg", "/images/b18.webp", "/images/b25.jpg", "/images/b28.webp",
  "/images/b27.jpg", "/images/b19.jpg", "/images/b21.jpg", "/images/b20.jpg",
  "/images/b24.jpg", "/images/b26.jpg", "/images/b22.jpeg", "/images/b23.webp",
  "/images/b29.jpg", "/images/b30.avif", "/images/b31.jpg", "/images/b32.jpg",
  "/images/b33.jpg", "/images/b34.jpg", "/images/b35.png", "/images/b36.jpg",
  "/images/b37.jpg", "/images/b38.png", "/images/b39.jpg", "/images/b40.jpg",
  "/images/b41.jpg", "/images/b42.jpg", "/images/b43.jpg",
];

/* ---------------- TYPES ---------------- */
interface LayoutProps {
  children: React.ReactNode;
}

/* ---------------- COMPONENT ---------------- */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isDark, setIsDark] = useState<boolean>(() => {
    const theme = localStorage.getItem("theme");
    return (
      theme === "dark" ||
      (theme === null && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  const [themeTransition, setThemeTransition] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const state = location.state as { from?: string };
  const from = state?.from;


  useExitNotifier({ eventType: "connect" });
  useExitNotifier({ eventType: "disconnect" });

  /* ---------------- THÈME ---------------- */
  useEffect(() => {
    const root = document.documentElement;
    setThemeTransition(true);
    setTimeout(() => {
      if (isDark) {
        root.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        root.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      setTimeout(() => setThemeTransition(false), 400);
    }, 100);
  }, [isDark]);

  /* ---------------- NOTIFICATION ---------------- */
  useEffect(() => {
    if (!user?.email) return;
    const notify = async (eventType: "connect" | "disconnect") => {
      try {
        await api.post(`/api/notify/${eventType}`, { email: user.email });
      } catch (err) {
        console.error(`Erreur envoi notif ${eventType}:`, err);
      }
    };
    const isInternalUrl = (url: string) => window.location.origin && url.startsWith(window.location.origin);
    const handleBeforeUnload = () => notify("disconnect");
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") notify("disconnect");
      else if (document.visibilityState === "visible" && isInternalUrl(window.location.href)) notify("connect");
    };
    const handleBlur = () => !document.hidden && notify("disconnect");
    const handleFocus = () => !document.hidden && isInternalUrl(window.location.href) && notify("connect");

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [user]);

  /* ---------------- DIAPORAMA ---------------- */
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setIsVisible(true);
      }, 1000);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = async () => {
    if (user?.email) {
      try {
        await api.post(`/api/notify/disconnect`, { email: user.email });
      } catch (err) {
        console.error("Erreur lors de la déconnexion :", err);
      }
    }
    logout();
    navigate("/");
  };

  const hideFooter = location.pathname.toLowerCase() === "/page1";

  return (
    <div
      className={`min-h-screen relative overflow-hidden flex flex-col transition-colors duration-500 ${
        isDark ? "bg-gray-900" : "bg-white"
      }`}
    >
      {/* Fond dynamique */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 z-0 ${
          isVisible ? "opacity-50" : "opacity-0"
        }`}
        style={{
          backgroundImage: `url(${images[currentIndex]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Effet fondu thème */}
      {themeTransition && (
        <div className="fixed inset-0 bg-black/50 dark:bg-white/50 z-[60] animate-fade" />
      )}

      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          25% { opacity: 0.5; }
          50% { opacity: 1; }
          75% { opacity: 0.5; }
          100% { opacity: 0; }
        }
        .animate-fade { animation: fadeInOut 0.6s ease-in-out; }
      `}</style>

    

{location.pathname !== "/" && (
  <button
    onClick={() => {
      if (from && from !== location.pathname) navigate(from); // éviter boucle
      else if (window.history.length > 1) navigate(-2);
      else navigate("/"); // fallback vers Home
    }}
    className="fixed top-4 left-4 z-50 bg-blue-200 dark:bg-blue-700 text-xl p-2 rounded-full shadow hover:scale-105 transition"
    aria-label="Retour à la page précédente"
  >
    Retour
  </button>
)}




      {/* Bouton dark mode */}
      {location.pathname !== "/page1" && (
        <button
          onClick={() => setIsDark(!isDark)}
          className="fixed top-4 right-4 z-50 bg-gray-200 dark:bg-gray-700 text-xl p-2 rounded-full shadow hover:scale-105 transition"
          aria-label="Basculer le thème sombre"
        >
          {isDark ? "🌙" : "☀️"}
        </button>
      )}

      {/* Bouton déconnexion en bas */}
      {user && (
        <>
          <div className="hidden sm:block fixed bottom-6 right-6 z-40 group">
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <LogOut size={22} />
            </button>
            <span className="absolute right-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-black/80 text-white text-xs rounded-md px-2 py-1 transition-opacity duration-300">
              Déconnexion
            </span>
          </div>

          <div className="sm:hidden fixed bottom-6 right-6 z-40 group">
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <LogOut size={24} />
            </button>
            <span className="absolute right-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-black/80 text-white text-xs rounded-md px-2 py-1 transition-opacity duration-300">
              Déconnexion
            </span>
          </div>
        </>
      )}

      {/* Contenu */}
      <main className="relative z-20 flex-grow pb-16 px-4 sm:px-6 lg:px-12">{children}</main>

      {/* Footer */}
      {!hideFooter && (
        <footer className="hidden sm:block fixed bottom-0 left-0 right-0 z-30 select-none bg-black/70 overflow-hidden h-6 md:h-7 lg:h-8">
          <div className="relative h-full w-[300%] flex animate-scrollX">
            <div className="flex-1 bg-green-600" />
            <div className="flex-1 bg-yellow-400 relative">
              <span className="absolute inset-0 flex justify-center items-center text-black font-semibold text-xs md:text-sm lg:text-base select-none pointer-events-none animate-glow">
                Société MORAVI
              </span>
            </div>
            <div className="flex-1 bg-red-600" />
            <div className="flex-1 bg-green-600" />
            <div className="flex-1 bg-yellow-400" />
            <div className="flex-1 bg-red-600" />
          </div>

          <style>{`
            @keyframes scrollX { 0% { transform: translateX(0); } 100% { transform: translateX(-33.3333%); } }
            .animate-scrollX { animation: scrollX 10s linear infinite; }
            @keyframes glow {
              0%, 100% { text-shadow: 0 0 4px rgba(0,0,0,0.6); color: black; }
              50% { text-shadow: 0 0 10px rgba(255, 255, 0, 0.8); color: #222200; }
            }
            .animate-glow { animation: glow 2.5s ease-in-out infinite; }
          `}</style>
        </footer>
      )}
    </div>
  );
};

export default Layout;
