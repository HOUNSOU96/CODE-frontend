import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  CheckCircle,
  X,
  Smartphone,
  Share,
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [isInstalled, setIsInstalled] =
    useState(false);

  const [isIos, setIsIos] =
    useState(false);

  const [showPanel, setShowPanel] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [showMessage, setShowMessage] =
    useState(false);

  useEffect(() => {
    const userAgent =
      window.navigator.userAgent.toLowerCase();

    const ios =
      /iphone|ipad|ipod/.test(userAgent) ||
      (
        navigator.platform === "MacIntel" &&
        navigator.maxTouchPoints > 1
      );

    setIsIos(ios);

    const standalone =
      window.matchMedia(
        "(display-mode: standalone)"
      ).matches ||
      (window.navigator as any).standalone === true;

    if (standalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (
      event: Event
    ) => {
      event.preventDefault();

      const installEvent =
        event as BeforeInstallPromptEvent;

      setDeferredPrompt(installEvent);

      setShowPanel(true);
    };

    const handleAppInstalled = () => {
      console.log("✅ CODE a été installé.");

      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowPanel(false);

      setMessage(
        "CODE a été installé avec succès sur votre appareil."
      );

      setShowMessage(true);

      window.setTimeout(() => {
        setShowMessage(false);
      }, 5000);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    window.addEventListener(
      "appinstalled",
      handleAppInstalled
    );

    /*
     * Sur iOS, beforeinstallprompt n'existe généralement pas.
     * On affiche donc notre panneau manuellement.
     */
    if (ios) {
      setShowPanel(true);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        "appinstalled",
        handleAppInstalled
      );
    };
  }, []);

  const closePanel = () => {
    setShowPanel(false);
  };

  const showTemporaryMessage = (
    text: string
  ) => {
    setMessage(text);
    setShowMessage(true);

    window.setTimeout(() => {
      setShowMessage(false);
    }, 6000);
  };

  const handleInstall = async () => {
    /*
     * On ferme immédiatement le panneau.
     * L'utilisateur peut donc continuer à utiliser CODE
     * même si l'installation rencontre un problème.
     */
    setShowPanel(false);

    /*
     * iPhone / iPad
     */
    if (isIos) {
      showTemporaryMessage(
        "Sur iPhone/iPad : appuyez sur Partager, puis « Ajouter à l’écran d’accueil »."
      );

      return;
    }

    /*
     * Navigateurs compatibles avec beforeinstallprompt
     */
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();

        const choice =
          await deferredPrompt.userChoice;

        if (choice.outcome === "accepted") {
          showTemporaryMessage(
            "Installation de CODE lancée."
          );
        } else {
          showTemporaryMessage(
            "Installation de CODE annulée. Vous pouvez continuer à utiliser l'application normalement."
          );
        }
      } catch (error) {
        console.error(
          "❌ Erreur pendant l'installation de CODE :",
          error
        );

        showTemporaryMessage(
          "L'installation de CODE n'a pas pu être lancée sur ce navigateur. Vous pouvez continuer à utiliser l'application normalement."
        );
      }

      setDeferredPrompt(null);

      return;
    }

    /*
     * Aucun mécanisme d'installation disponible.
     */
    showTemporaryMessage(
      "L'installation automatique n'est pas disponible sur ce navigateur. Vous pouvez continuer à utiliser CODE normalement."
    );
  };

  /*
   * Si CODE est déjà installé,
   * aucun panneau d'installation.
   */
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* =====================================================
          PANNEAU D'INSTALLATION
      ====================================================== */}

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{
              opacity: 0,
              y: -30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -30,
            }}
            transition={{
              duration: 0.3,
            }}
            className="
              fixed
              top-4
              left-1/2
              -translate-x-1/2
              z-[9999]
              w-[calc(100%-2rem)]
              max-w-md
            "
          >
            <div
              className="
                relative
                rounded-2xl
                border
                border-blue-200
                bg-white
                p-5
                shadow-2xl
              "
            >
              {/* Bouton fermer */}

              <button
                type="button"
                onClick={closePanel}
                aria-label="Fermer"
                className="
                  absolute
                  right-3
                  top-3
                  rounded-full
                  p-2
                  text-gray-500
                  transition
                  hover:bg-gray-100
                  hover:text-gray-800
                "
              >
                <X size={20} />
              </button>

              {/* Icône */}

              <div className="flex items-center gap-3 pr-8">
                <div
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-600
                    text-white
                  "
                >
                  {isIos ? (
                    <Smartphone size={25} />
                  ) : (
                    <Download size={25} />
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Installer CODE
                  </h2>

                  <p className="text-sm text-gray-600">
                    L'écosystème éducatif mondial
                  </p>
                </div>
              </div>

              {/* =================================================
                  ANDROID / NAVIGATEUR COMPATIBLE
              ================================================== */}

              {!isIos && deferredPrompt && (
                <>
                  <p className="mt-4 text-sm leading-6 text-gray-700">
                    Installez CODE sur votre appareil pour
                    accéder plus facilement à votre espace
                    éducatif.
                  </p>

                  <button
                    type="button"
                    onClick={handleInstall}
                    className="
                      mt-4
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-blue-600
                      px-4
                      py-3
                      font-semibold
                      text-white
                      transition
                      hover:bg-blue-700
                      active:scale-[0.98]
                    "
                  >
                    <Download size={19} />

                    Installer CODE
                  </button>
                </>
              )}

              {/* =================================================
                  IPHONE / IPAD
              ================================================== */}

              {isIos && (
                <>
                  <p className="mt-4 text-sm leading-6 text-gray-700">
                    Pour installer CODE sur cet appareil :
                  </p>

                  <div className="mt-4 space-y-3 text-sm text-gray-700">
                    <div className="flex gap-3">
                      <div
                        className="
                          flex
                          h-7
                          w-7
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-blue-100
                          font-bold
                          text-blue-700
                        "
                      >
                        1
                      </div>

                      <p>
                        Appuyez sur le bouton{" "}
                        <Share
                          size={16}
                          className="mx-1 inline"
                        />{" "}
                        <strong>Partager</strong>.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <div
                        className="
                          flex
                          h-7
                          w-7
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-blue-100
                          font-bold
                          text-blue-700
                        "
                      >
                        2
                      </div>

                      <p>
                        Sélectionnez{" "}
                        <strong>
                          Ajouter à l’écran d’accueil
                        </strong>
                        .
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <div
                        className="
                          flex
                          h-7
                          w-7
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-blue-100
                          font-bold
                          text-blue-700
                        "
                      >
                        3
                      </div>

                      <p>
                        Confirmez avec{" "}
                        <strong>Ajouter</strong>.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleInstall}
                    className="
                      mt-5
                      w-full
                      rounded-xl
                      bg-blue-600
                      px-4
                      py-3
                      font-semibold
                      text-white
                      transition
                      hover:bg-blue-700
                    "
                  >
                    J'ai compris
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          MESSAGE NON BLOQUANT
      ====================================================== */}

      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: 20,
            }}
            className="
              fixed
              bottom-5
              left-1/2
              z-[10000]
              w-[calc(100%-2rem)]
              max-w-md
              -translate-x-1/2
            "
          >
            <div
              className="
                flex
                items-start
                gap-3
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-4
                shadow-2xl
              "
            >
              <CheckCircle
                className="mt-0.5 shrink-0 text-green-600"
                size={22}
              />

              <p className="text-sm leading-5 text-gray-700">
                {message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InstallPWA;