// 📁 src/pages/Login.tsx

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, WifiOff } from "lucide-react";
import InstallPWA from "@/components/InstallPWA";
import { motion } from "framer-motion";
import { syncOfflineQueue } from "@/offline/syncQueue";

const ADMINS = [
  "deogratiashounsou@gmail.com",
  "admin2@example.com",
  "admin3@exemple.com",
];

// ============================================================
// COMPOSANT
// ============================================================

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [erreurLocal, setErreurLocal] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [blink, setBlink] = useState(false);

  // ============================================================
  // ÉTAT DE LA CONNEXION INTERNET
  // ============================================================

  const [isOffline, setIsOffline] = useState<boolean>(() => {
    if (typeof navigator === "undefined") {
      return false;
    }

    return !navigator.onLine;
  });

  const {
    loginWithPassword,
    erreur,
    setErreur,
    setUser,
  } = useAuth();

  const navigate = useNavigate();

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8000";

  // ============================================================
  // DÉTECTION DE LA CONNEXION INTERNET
  // ============================================================

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ============================================================
  // DÉTECTION DE LA SAISIE DU MOT DE PASSE
  // ============================================================

  useEffect(() => {
    if (!password) {
      setIsTyping(false);
      return;
    }

    setIsTyping(true);

    const timer = setTimeout(() => {
      setIsTyping(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [password]);

  // ============================================================
  // CLIGNEMENT AUTOMATIQUE
  // ============================================================

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let blinkTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleBlink = () => {
      const timeout = Math.random() * 3000 + 2000;

      timer = setTimeout(() => {
        setBlink(true);

        blinkTimer = setTimeout(() => {
          setBlink(false);
        }, 200);

        scheduleBlink();
      }, timeout);
    };

    scheduleBlink();

    return () => {
      if (timer) {
        clearTimeout(timer);
      }

      if (blinkTimer) {
        clearTimeout(blinkTimer);
      }
    };
  }, []);

  // ============================================================
  // CONNEXION
  // ============================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ----------------------------------------------------------
    // VÉRIFICATION HORS LIGNE
    // ----------------------------------------------------------

    if (!navigator.onLine) {
      setErreurLocal(
        "Vous êtes actuellement hors ligne. La connexion nécessite une connexion Internet."
      );

      setIsOffline(true);
      return;
    }

    setLoading(true);
    setErreurLocal("");
    setErreur(null);

    try {
      const res = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      let data: any = null;

      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        // ======================================================
        // UTILISATEUR BLOQUÉ
        // ======================================================

        if (data?.detail === "USER_BLOCKED") {
          setErreurLocal(
            "Votre compte a été bloqué. Contactez un administrateur."
          );
        }

        // ======================================================
        // UTILISATEUR NON VALIDÉ
        // ======================================================

        else if (data?.detail === "USER_NOT_VALIDATED") {
          setErreurLocal(
            "Votre compte n'est pas encore validé. Veuillez vérifier vos emails ou vous inscrire."
          );
        }

        // ======================================================
        // AUTRE ERREUR
        // ======================================================

        else {
          setErreurLocal(
            data?.detail ||
              "Email ou mot de passe incorrect."
          );
        }

        return;
      }

      // ========================================================
      // CONNEXION RÉUSSIE
      // ========================================================

      if (data?.access_token && data?.user) {
        const token = data.access_token;

        // ======================================================
        // DÉTECTION ADMIN
        // ======================================================

        const userEmail =
          typeof data.user.email === "string"
            ? data.user.email.toLowerCase()
            : "";

        const dataUser = {
          ...data.user,

          is_admin: ADMINS
            .map((e) => e.toLowerCase())
            .includes(userEmail),
        };

        // ======================================================
        // ENREGISTREMENT DANS AUTH CONTEXT
        // ======================================================

        loginWithPassword(token, dataUser);
        setUser(dataUser);

        // ======================================================
        // SYNCHRONISATION DES DONNÉES HORS LIGNE
        //
        // La connexion vient d'être établie.
        // Le token est maintenant disponible pour les requêtes
        // authentifiées effectuées par syncOfflineQueue().
        //
        // Une erreur de synchronisation ne doit jamais empêcher
        // l'utilisateur de se connecter.
        // ======================================================

        try {
          await syncOfflineQueue();

          console.log(
            "🔄 Synchronisation hors ligne effectuée après connexion."
          );
        } catch (syncError) {
          console.error(
            "⚠️ Erreur lors de la synchronisation hors ligne :",
            syncError
          );
        }

        // ======================================================
        // NOTIFICATION DE CONNEXION
        // ======================================================

        try {
          await fetch(
            `${API_URL}/api/notify/connect`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: dataUser.email,
              }),
            }
          );
        } catch (notificationError) {
          // La notification ne doit jamais empêcher
          // une connexion réussie.
          console.error(
            "Erreur notification connexion :",
            notificationError
          );
        }

        // ======================================================
        // REDIRECTION SELON LE RÔLE
        // ======================================================

        if (
          dataUser.enseignant &&
          dataUser.enseignant_actif &&
          !dataUser.teacher_profile_validated
        ) {
          navigate("/enseignant/profil");
        } else if (
          dataUser.enseignant &&
          dataUser.enseignant_actif
        ) {
          navigate("/enseignant");
        } else if (dataUser.is_admin) {
          navigate("/liste-inscrits");
        } else {
          navigate("/page2");
        }
      } else {
        throw new Error(
          "Réponse invalide du serveur"
        );
      }
    } catch (err: any) {
      // ========================================================
      // ERREUR RÉSEAU
      // ========================================================

      if (!navigator.onLine) {
        setIsOffline(true);

        setErreurLocal(
          "Connexion Internet perdue. Veuillez vérifier votre connexion puis réessayer."
        );
      } else {
        setErreurLocal(
          err?.message ||
            "Erreur lors de la connexion."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // AFFICHAGE
  // ============================================================

  return (
    <div className="min-h-screen flex flex-col bg-transparent">

      {/* ======================================================
          INSTALLATION PWA
      ====================================================== */}

      <InstallPWA />

      {/* ======================================================
          INDICATEUR HORS LIGNE
      ====================================================== */}

      {isOffline && (
        <motion.div
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="
            fixed
            top-3
            left-1/2
            -translate-x-1/2
            z-50
            flex
            items-center
            gap-2
            px-4
            py-2
            rounded-full
            bg-gray-900
            text-gray-200
            text-xs
            sm:text-sm
            shadow-lg
            pointer-events-none
          "
        >
          <WifiOff className="w-4 h-4" />
          Mode hors ligne
        </motion.div>
      )}

      {/* ======================================================
          CONTENU PRINCIPAL
      ====================================================== */}

      <main className="flex-grow flex items-center justify-center px-4 py-10">

        <motion.form
          onSubmit={handleSubmit}
          initial={{
            opacity: 0,
            y: 25,
            scale: 0.98,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          className="
            bg-white
            dark:bg-gray-900
            p-6
            sm:p-8
            rounded-2xl
            shadow-lg
            w-full
            max-w-md
            space-y-6
          "
          aria-label="Formulaire de connexion"
        >

          {/* ==================================================
              TITRE
          ================================================== */}

          <motion.h2
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.15,
              duration: 0.4,
            }}
            className="
              text-3xl
              font-extrabold
              text-center
              text-blue-700
              dark:text-white
              tracking-tight
            "
          >
            Connexion à CODE
          </motion.h2>

          {/* ==================================================
              EMAIL
          ================================================== */}

          <div>
            <label
              htmlFor="email"
              className="
                block
                text-sm
                font-semibold
                text-gray-700
                dark:text-gray-300
              "
            >
              Adresse Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="nom@exemple.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              autoFocus
              autoComplete="email"
              className="
                mt-1
                w-full
                px-4
                py-2
                rounded-lg
                border
                border-gray-300
                dark:border-gray-700
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                dark:bg-gray-800
                dark:text-white
                transition
              "
            />
          </div>

          {/* ==================================================
              MOT DE PASSE
          ================================================== */}

          <div className="relative">

            <label
              htmlFor="password"
              className="
                block
                text-sm
                font-semibold
                text-gray-700
                dark:text-gray-300
              "
            >
              Mot de passe
            </label>

            <input
              id="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Mot de passe"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
              autoComplete="current-password"
              className="
                mt-1
                w-full
                px-4
                py-2
                rounded-lg
                border
                border-gray-300
                dark:border-gray-700
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                dark:bg-gray-800
                dark:text-white
                pr-10
                transition
              "
            />

            <button
              type="button"
              aria-label={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
              aria-pressed={showPassword}
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              className="
                absolute
                right-3
                top-1/2
                transform
                -translate-y-1/2
                w-6
                h-6
                text-gray-700
                dark:text-gray-300
                hover:text-blue-600
                dark:hover:text-blue-400
                transition
              "
            >
              <div className="relative w-full h-full">

                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}

                <motion.div
                  className="
                    absolute
                    top-0
                    left-0
                    w-full
                    h-full
                    bg-gray-900
                    dark:bg-gray-200
                    origin-top
                    rounded
                    pointer-events-none
                  "
                  animate={{
                    scaleY:
                      isTyping || blink
                        ? [0, 1, 0]
                        : 0,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                />

              </div>
            </button>

          </div>

          {/* ==================================================
              ERREUR
          ================================================== */}

          {(erreur || erreurLocal) && (
            <motion.p
              initial={{
                opacity: 0,
                y: -5,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="
                text-sm
                text-red-600
                dark:text-red-400
                text-center
                leading-relaxed
              "
              role="alert"
            >
              {erreurLocal || erreur}
            </motion.p>
          )}

          {/* ==================================================
              CONNEXION
          ================================================== */}

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={
              !loading
                ? { scale: 0.98 }
                : undefined
            }
            className="
              mt-4
              w-full
              py-3
              rounded-lg
              bg-blue-600
              hover:bg-blue-700
              active:bg-blue-800
              text-white
              font-semibold
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed
              shadow-sm
              hover:shadow-md
            "
          >
            {loading
              ? "Connexion en cours..."
              : "Se connecter"}
          </motion.button>

          {/* ==================================================
              ACTIVATION
          ================================================== */}

          <Link
            to="/activation"
            className="
              block
              w-full
              text-center
              py-3
              rounded-lg
              border
              border-blue-600
              text-blue-600
              hover:bg-blue-50
              dark:hover:bg-blue-950
              font-semibold
              transition
            "
          >
            📚 Activer mon document CODE
          </Link>

          {/* ==================================================
              PROJETS
          ================================================== */}

          <button
            type="button"
            onClick={() =>
              navigate("/projets")
            }
            className="
              block
              w-full
              text-center
              py-3
              rounded-lg
              border
              border-purple-600
              text-purple-600
              hover:bg-purple-50
              dark:hover:bg-purple-950
              font-semibold
              transition
            "
          >
            💡 Découvrir les projets et idées
          </button>

        </motion.form>

      </main>

      {/* ======================================================
          PIED DE PAGE
      ====================================================== */}

      <footer
        className="
          py-6
          bg-transparent
          border-t
          border-gray-200
          dark:border-gray-700
        "
      >
        <div className="max-w-md mx-auto text-center px-4">

          <p className="text-gray-700 dark:text-gray-300 mb-3">
            Pas encore de compte ?
          </p>

          <Link
            to="/inscription"
            className="
              inline-block
              px-8
              py-3
              bg-green-600
              hover:bg-green-700
              active:bg-green-800
              text-white
              font-semibold
              rounded-lg
              transition
              shadow-sm
              hover:shadow-md
            "
          >
            S’inscrire
          </Link>

        </div>
      </footer>

    </div>
  );
};

export default Login;