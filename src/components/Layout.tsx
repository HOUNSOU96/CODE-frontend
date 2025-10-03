// 📁 Layout.tsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";    
import { useExitNotifier } from "@/hooks/useExitNotifier";   
import api from "@/utils/axios";

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

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();
  const { loading, user } = useAuth();

  useExitNotifier({ eventType: "connect" });
  useExitNotifier({ eventType: "disconnect" });

  // 🔹 Notifier connect/disconnect automatiquement
  useEffect(() => {
    if (!user?.email) return;

    const notify = async (eventType: "connect" | "disconnect") => {
      try {
        await api.post(`/api/notify/${eventType}`, { email: user.email });
      } catch (err) {
        console.error(`Erreur envoi notif ${eventType}:`, err);
      }
    };

    const isInternalUrl = (url: string) => {
      const appOrigin = window.location.origin;
      return url.startsWith(appOrigin);
    };

    const handleBeforeUnload = () => notify("disconnect");

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        notify("disconnect");
      } else if (document.visibilityState === "visible" && isInternalUrl(window.location.href)) {
        notify("connect");
      }
    };

    const handleBlur = () => {
      if (!document.hidden) notify("disconnect");
    };

    const handleFocus = () => {
      if (!document.hidden && isInternalUrl(window.location.href)) {
        notify("connect");
      }
    };

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

  const hideFooter = location.pathname.toLowerCase() === "/page1";

  // 🔹 Slideshow du fond
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

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Fond dynamique responsive */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 z-0 ${isVisible ? "opacity-50" : "opacity-0"}`}
        style={{
          backgroundImage: `url(${images[currentIndex]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          width: "100%",
          height: "100%",
        }}
      />

      {/* Contenu principal */}
      <main className="relative z-20 flex-grow pb-16 px-4 sm:px-6 lg:px-12">{children}</main>

      {/* Footer fixe */}
      {!hideFooter && (
        <footer className="hidden sm:block fixed bottom-0 left-0 right-0 z-30 select-none bg-black/70 overflow-hidden h-6 md:h-7 lg:h-8">
          <div className="relative h-full w-[300%] flex animate-scrollX">
            <div className="flex-1 bg-green-600" />
            <div className="flex-1 bg-yellow-400 relative">
              <span className="absolute inset-0 flex justify-center items-center text-black font-semibold text-xs md:text-sm lg:text-base select-none pointer-events-none animate-glow">
                République du Bénin
              </span>
            </div>
            <div className="flex-1 bg-red-600" />
            <div className="flex-1 bg-green-600" />
            <div className="flex-1 bg-yellow-400" />
            <div className="flex-1 bg-red-600" />
          </div>

          <style>{`
            @keyframes scrollX {
              0% { transform: translateX(0); }
              100% { transform: translateX(-33.3333%); }
            }
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
