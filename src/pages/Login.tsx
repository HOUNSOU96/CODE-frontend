import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const Login: React.FC = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: string };
  const from = state?.from || "/"; // page de retour par défaut

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Veuillez saisir un mot de passe.");
      return;
    }

    try {
      // Envoi du mot de passe au backend pour vérification
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/check-admin`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ code: password }),
});


      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Mot de passe incorrect.");
        return;
      }

      // Si le backend valide le mot de passe, redirection vers Home
      navigate("/home");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la connexion.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      {/* Bouton Retour */}
      <div className="px-4 pt-4">
        <button
          onClick={() => navigate(from)}
          className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-600 transition"
        >
          ← Retour
        </button>
      </div>

      <main className="flex-grow flex items-center justify-center px-4 py-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6"
          aria-label="Formulaire de connexion"
        >
          <h2 className="text-3xl font-extrabold text-center text-blue-700 dark:text-white tracking-tight">
            Connexion
          </h2>

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
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button
            type="submit"
            className="mt-4 w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
          >
            Se connecter
          </button>
        </form>
      </main>
    </div>
  );
};

export default Login;
