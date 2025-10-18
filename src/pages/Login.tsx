import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import InstallPWA from "@/components/InstallPWA";
import { motion } from "framer-motion";

const ADMINS = [
  "deogratiashounsou@gmail.com",
  "admin2@example.com",
  "admin3@exemple.com"
]; // 🔹 Liste des emails admin

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [erreurLocal, setErreurLocal] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [blink, setBlink] = useState(false);
  const { loginWithPassword, erreur, setErreur, setUser } = useAuth();

  const navigate = useNavigate();

  // Détecte quand l'utilisateur tape
  useEffect(() => {
    if (!password) return;
    setIsTyping(true);
    const timer = setTimeout(() => setIsTyping(false), 1000);
    return () => clearTimeout(timer);
  }, [password]);

  // Clignement automatique toutes les 2 à 5 secondes
  useEffect(() => {
    const scheduleBlink = () => {
      const timeout = Math.random() * 3000 + 2000;
      const timer = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 200);
        scheduleBlink();
      }, timeout);
      return () => clearTimeout(timer);
    };
    const cleanup = scheduleBlink();
    return cleanup;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErreurLocal("");
    setErreur(null);

    try {
      const res = await fetch("https://code-backend-iuol.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // ⚠️ Cas utilisateur bloqué ou non validé
        if (data.detail === "USER_BLOCKED") {
          setErreurLocal("Votre compte a été bloqué. Contactez un administrateur.");
        } else if (data.detail === "USER_NOT_VALIDATED") {
          setErreurLocal("Votre compte n'est pas encore validé. Veuillez vérifier vos emails ou vous inscrire.");
        } else {
          setErreurLocal(data.detail || "Email ou mot de passe incorrect.");
        }
        return;
      }

      if (data.access_token && data.user) {
        const token = data.access_token;

        // 🔹 Détection admin
        const dataUser = {
          ...data.user,
          is_admin: ADMINS.map(e => e.toLowerCase()).includes(data.user.email.toLowerCase()),
        };

        loginWithPassword(token, dataUser);
        setUser(dataUser);

        // 🔹 Redirection selon rôle
        if (dataUser.is_admin) {
          navigate("/liste-inscrits");
        } else {
          navigate("/page2");
        }
      } else {
        throw new Error("Réponse invalide du serveur");
      }
    } catch (err: any) {
      setErreurLocal(err.message || "Erreur lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <main className="flex-grow flex items-center justify-center px-4 py-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6"
          aria-label="Formulaire de connexion"
        >
          <h2 className="text-3xl font-extrabold text-center text-blue-700 dark:text-white tracking-tight">
            Connexion à CODE
          </h2>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Adresse Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="nom@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white pr-10"
            />

            <button
              type="button"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6"
            >
              <div className="relative w-full h-full">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                <motion.div
                  className="absolute top-0 left-0 w-full h-full bg-gray-900 dark:bg-gray-200 origin-top rounded"
                  animate={{
                    scaleY: isTyping || blink ? [0, 1, 0] : 0,
                  }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </button>
          </div>

          {(erreur || erreurLocal) && (
            <p className="text-sm text-red-600 text-center">
              {erreurLocal || erreur}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-50"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>
      </main>

      <footer className="py-6 bg-transparent border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-md mx-auto text-center px-4">
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            Pas encore de compte ?
          </p>
          <Link
            to="/inscription"
            className="inline-block px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
          >
            S’inscrire
          </Link>
        </div>
      </footer>
      
    </div>
  );
};

export default Login;
