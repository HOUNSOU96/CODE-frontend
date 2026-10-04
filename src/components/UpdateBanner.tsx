import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type UpdateStatus =
  | "idle"
  | "updating"
  | "success"
  | "error";

const UpdateBanner: React.FC = () => {
  const [waitingWorker, setWaitingWorker] =
    useState<ServiceWorker | null>(null);

  const [showBanner, setShowBanner] =
    useState<boolean>(false);

  const [status, setStatus] =
    useState<UpdateStatus>("idle");

  const [message, setMessage] =
    useState<string>("");

  useEffect(() => {
    // Vérifier si le navigateur prend en charge les Service Workers
    if (!("serviceWorker" in navigator)) {
      return;
    }

    let mounted = true;

    const showUpdateAvailable = (
      worker: ServiceWorker
    ) => {
      if (!mounted) return;

      setWaitingWorker(worker);
      setShowBanner(true);
    };

    const checkRegistration = async () => {
      try {
        const registration =
          await navigator.serviceWorker.getRegistration();

        if (!registration || !mounted) {
          return;
        }

        // --------------------------------------------------
        // Un Service Worker attend déjà
        // --------------------------------------------------

        if (registration.waiting) {
          showUpdateAvailable(registration.waiting);
        }

        // --------------------------------------------------
        // Un Service Worker est actuellement en installation
        // --------------------------------------------------

        if (registration.installing) {
          const installingWorker =
            registration.installing;

          installingWorker.addEventListener(
            "statechange",
            () => {
              if (
                installingWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                showUpdateAvailable(
                  installingWorker
                );
              }
            }
          );
        }

        // --------------------------------------------------
        // Détection d'une nouvelle version
        // --------------------------------------------------

        registration.addEventListener(
          "updatefound",
          () => {
            const newWorker =
              registration.installing;

            if (!newWorker) {
              return;
            }

            newWorker.addEventListener(
              "statechange",
              () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  showUpdateAvailable(
                    newWorker
                  );
                }
              }
            );
          }
        );
      } catch (error) {
        console.error(
          "Erreur lors de la vérification de la mise à jour :",
          error
        );
      }
    };

    // Vérification initiale
    checkRegistration();

    // --------------------------------------------------
    // Message envoyé par le Service Worker
    // --------------------------------------------------

    const handleServiceWorkerMessage = (
      event: MessageEvent
    ) => {
      if (
        event.data ===
        "NEW_VERSION_AVAILABLE"
      ) {
        checkRegistration();
      }
    };

    navigator.serviceWorker.addEventListener(
      "message",
      handleServiceWorkerMessage
    );

    // --------------------------------------------------
    // Nettoyage
    // --------------------------------------------------

    return () => {
      mounted = false;

      navigator.serviceWorker.removeEventListener(
        "message",
        handleServiceWorkerMessage
      );
    };
  }, []);

  // ======================================================
  // LANCER LA MISE À JOUR
  // ======================================================

  const handleUpdate = async () => {
    // Le bouton disparaît immédiatement.
    setShowBanner(false);

    setStatus("updating");
    setMessage(
      "Mise à jour de CODE en cours…"
    );

    try {
      // Récupérer l'enregistrement actuel
      const registration =
        await navigator.serviceWorker.getRegistration();

      if (!registration) {
        throw new Error(
          "Le Service Worker de CODE n'est pas disponible."
        );
      }

      // Chercher le worker qui attend
      const worker =
        waitingWorker ||
        registration.waiting;

      if (!worker) {
        throw new Error(
          "La nouvelle version de CODE n'est plus disponible."
        );
      }

      // --------------------------------------------------
      // Attendre que le nouveau Service Worker
      // prenne effectivement le contrôle
      // --------------------------------------------------

      const controllerChange =
        new Promise<void>((resolve) => {
          let resolved = false;

          const finish = () => {
            if (resolved) return;

            resolved = true;

            window.clearTimeout(
              timeout
            );

            resolve();
          };

          const timeout =
            window.setTimeout(() => {
              finish();
            }, 10000);

          navigator.serviceWorker.addEventListener(
            "controllerchange",
            finish,
            {
              once: true,
            }
          );
        });

      // Demander au nouveau Service Worker
      // de devenir actif immédiatement
      worker.postMessage({
        type: "SKIP_WAITING",
      });

      await controllerChange;

      // --------------------------------------------------
      // Succès
      // --------------------------------------------------

      setStatus("success");

      setMessage(
        "CODE a été mis à jour. Actualisation de l'application…"
      );

      window.setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error(
        "Erreur pendant la mise à jour de CODE :",
        error
      );

      setStatus("error");

      setMessage(
        error instanceof Error
          ? error.message
          : "La mise à jour de CODE n'a pas pu être effectuée. Vous pouvez continuer à utiliser l'application normalement."
      );

      // Le message disparaît automatiquement
      window.setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 7000);
    }
  };

  // ======================================================
  // AFFICHAGE
  // ======================================================

  return (
    <>
      {/* ==================================================
          BANNIÈRE
      =================================================== */}

      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{
              y: 100,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: 100,
              opacity: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 80,
              damping: 15,
            }}
            className="
              fixed
              bottom-0
              left-0
              right-0
              z-50
              bg-blue-600
              text-white
              p-4
              shadow-lg
              rounded-t-2xl
            "
          >
            <div
              className="
                max-w-4xl
                mx-auto
                flex
                flex-col
                sm:flex-row
                items-center
                justify-between
                gap-3
              "
            >
              <div className="text-center sm:text-left">
                <p className="font-semibold">
                  🚀 Une nouvelle version de{" "}
                  <strong>CODE</strong> est disponible.
                </p>

                <p className="text-sm opacity-90 mt-1">
                  Mettez à jour l'application pour
                  utiliser la dernière version.
                </p>
              </div>

              <Button
                type="button"
                onClick={handleUpdate}
                className="
                  bg-white
                  text-blue-700
                  hover:bg-blue-100
                  font-semibold
                  rounded-lg
                  flex
                  items-center
                  gap-2
                  shrink-0
                "
              >
                <RefreshCw size={18} />

                Mettre à jour
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================================================
          MESSAGE DE MISE À JOUR
      =================================================== */}

      <AnimatePresence>
        {status !== "idle" && (
          <motion.div
            initial={{
              y: 60,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: 60,
              opacity: 0,
            }}
            className={`
              fixed
              bottom-6
              left-1/2
              -translate-x-1/2
              z-[100]
              w-[calc(100%-2rem)]
              max-w-md
              rounded-2xl
              px-5
              py-4
              shadow-2xl
              text-white
              ${
                status === "success"
                  ? "bg-green-600"
                  : status === "error"
                  ? "bg-red-600"
                  : "bg-blue-600"
              }
            `}
          >
            <div className="flex items-start gap-3">
              {/* Mise à jour */}
              {status === "updating" && (
                <RefreshCw
                  size={22}
                  className="
                    shrink-0
                    mt-0.5
                    animate-spin
                  "
                />
              )}

              {/* Succès */}
              {status === "success" && (
                <CheckCircle
                  size={22}
                  className="
                    shrink-0
                    mt-0.5
                  "
                />
              )}

              {/* Erreur */}
              {status === "error" && (
                <AlertTriangle
                  size={22}
                  className="
                    shrink-0
                    mt-0.5
                  "
                />
              )}

              <p
                className="
                  text-sm
                  font-medium
                  leading-relaxed
                "
              >
                {message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UpdateBanner;