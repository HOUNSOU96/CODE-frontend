// 📁 src/pages/admin/ParrainDetails.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/utils/axios";
import { motion } from "framer-motion";

interface Filleul {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  date_inscription: string;
  is_blocked?: boolean;
  is_online?: boolean;
}

interface ParrainInfo {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  date_inscription: string;
  is_blocked?: boolean;
  total_filleuls: number;
  filleuls: Filleul[];
}

const ParrainDetails: React.FC = () => {
  const { email } = useParams<{ email: string }>();
  const navigate = useNavigate();
  const [parrain, setParrain] = useState<ParrainInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Récupération du parrain et de ses filleuls
  useEffect(() => {
    const fetchParrain = async () => {
      try {
        const res = await api.get(`/api/admin/parrain/${email}`);
        setParrain(res.data);
      } catch (err) {
        console.error("Erreur récupération parrain :", err);
        alert("Erreur lors du chargement des informations du parrain.");
      } finally {
        setLoading(false);
      }
    };
    fetchParrain();
  }, [email]);

  if (loading) return <div className="text-center mt-6">Chargement...</div>;
  if (!parrain) return <div className="text-center mt-6">Parrain introuvable.</div>;

  // 🔹 Filtrer le parrain lui-même hors des filleuls
  const filleulsExclusParrain = parrain.filleuls.filter(f => f.email !== parrain.email);
  const totalFilleuls = filleulsExclusParrain.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900"
    >
      <h1 className="text-3xl font-bold text-center text-blue-700 dark:text-white mb-4">
        Détails du Parrain
      </h1>

      {/* Informations du parrain */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <p><strong>Nom :</strong> {parrain.nom}</p>
          <p><strong>Prénom :</strong> {parrain.prenom}</p>
          <p><strong>Email :</strong> {parrain.email}</p>
          <p><strong>Téléphone :</strong> {parrain.telephone || "—"}</p>
          <p><strong>Date d’inscription :</strong> {new Date(parrain.date_inscription).toLocaleDateString()}</p>
          <p>
            <strong>État :</strong>{" "}
            {parrain.is_blocked ? (
              <span className="text-red-600 font-semibold">🚫 Bloqué</span>
            ) : (
              <span className="text-green-600 font-semibold">✅ Actif</span>
            )}
          </p>
        </div>

        {/* Nombre de filleuls */}
        <div className="mt-4">
          <p><strong>Nombre de filleuls :</strong> {totalFilleuls}</p>
        </div>
      </div>

      {/* Liste des filleuls */}
      <h2 className="text-2xl font-semibold text-center text-blue-600 dark:text-blue-300 mb-3">
        Liste des Filleuls
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="px-4 py-2">Nom</th>
              <th className="px-4 py-2">Prénom</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Téléphone</th>
              <th className="px-4 py-2">Date d’inscription</th>
              <th className="px-4 py-2">Blocage</th>
              <th className="px-4 py-2">Statut</th>
            </tr>
          </thead>
          <tbody>
            {totalFilleuls === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  Aucun filleul trouvé.
                </td>
              </tr>
            ) : (
              filleulsExclusParrain.map((f) => (
                <tr key={f.id} className="border-b dark:border-gray-700">
                  <td className="px-4 py-2">{f.nom}</td>
                  <td className="px-4 py-2">{f.prenom}</td>
                  <td className="px-4 py-2">{f.email}</td>
                  <td className="px-4 py-2">{f.telephone || "—"}</td>
                  <td className="px-4 py-2">{new Date(f.date_inscription).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    {f.is_blocked ? (
                      <span className="text-red-600 font-semibold">🚫 Bloqué</span>
                    ) : (
                      <span className="text-green-600 font-semibold">✅ Actif</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {f.is_online ? (
                      <span className="text-green-500 font-semibold">Connecté</span>
                    ) : (
                      <span className="text-gray-400">Déconnecté</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="text-center mt-6">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          RETOUR
        </button>
      </div>
    </motion.div>
  );
};

export default ParrainDetails;
