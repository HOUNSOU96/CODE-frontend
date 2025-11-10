// 📁 HistoriqueConnections.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/utils/axios";
import { motion } from "framer-motion";

interface ConnectionRecord {
  id: number;
  nom: string;
  prenom: string;
  date: string; // date de connexion
  heure_connexion: string;
  heure_deconnexion: string;
}

type FilterType = "all" | "online" | "offline";

const HistoriqueConnections: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<ConnectionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [currentOnline, setCurrentOnline] = useState<number>(0);

  // 🔹 Fonction pour fetcher les données et mettre à jour l'état
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/historique-connections");
      setRecords(res.data);
      setCurrentOnline(res.data.filter((r: ConnectionRecord) => r.heure_deconnexion === "-").length);
    } catch (err) {
      console.error("Erreur récupération historique :", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 useEffect pour fetch initial et mise à jour toutes les 10s
  useEffect(() => {
    fetchRecords(); // fetch initial
    const interval = setInterval(fetchRecords, 10000); // rafraîchit toutes les 10s
    return () => clearInterval(interval);
  }, []);

  const total = records.length;
  const totalOnline = records.filter((r) => r.heure_deconnexion === "-").length;
  const totalOffline = records.filter((r) => r.heure_deconnexion !== "-").length;

  const filteredRecords = records.filter((r) => {
    if (filter === "online") return r.heure_deconnexion === "-";
    if (filter === "offline") return r.heure_deconnexion !== "-";
    return true;
  });

  const recordsByDate = Object.entries(
    filteredRecords.reduce<Record<string, ConnectionRecord[]>>((acc, curr) => {
      if (!acc[curr.date]) acc[curr.date] = [];
      acc[curr.date].push(curr);
      return acc;
    }, {})
  )
    .sort(([dateA], [dateB]) => (dateA < dateB ? 1 : -1))
    .map(([date, recs]) => {
      const sortedRecs = [...recs].sort((a, b) => {
        if (a.heure_deconnexion === "-" && b.heure_deconnexion !== "-") return -1;
        if (a.heure_deconnexion !== "-" && b.heure_deconnexion === "-") return 1;
        return b.heure_connexion.localeCompare(a.heure_connexion);
      });
      return [date, sortedRecs] as [string, ConnectionRecord[]];
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900"
    >
      <h1 className="text-3xl font-bold text-center text-blue-700 dark:text-white mb-4">
        Historique des Connexions
      </h1>

      {/* 🔹 Compteurs globaux */}
      <div className="flex justify-center gap-6 mb-4 text-center">
        <div className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-xl font-semibold">
          Total : {total}
        </div>
        <div className="px-4 py-2 bg-green-200 dark:bg-green-800 rounded-xl font-semibold">
          Connectés : {totalOnline}
        </div>
        <div className="px-4 py-2 bg-red-200 dark:bg-red-800 rounded-xl font-semibold">
          Déconnectés : {totalOffline}
        </div>
        <div className="px-4 py-2 bg-yellow-200 dark:bg-yellow-800 rounded-xl font-semibold">
          Actuellement en ligne : {currentOnline}
        </div>
      </div>

      {/* 🔹 Boutons de filtre */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-xl font-semibold transition ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          }`}
        >
          Tous
        </button>
        <button
          onClick={() => setFilter("online")}
          className={`px-4 py-2 rounded-xl font-semibold transition ${
            filter === "online"
              ? "bg-green-600 text-white"
              : "bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          }`}
        >
          Connectés
        </button>
        <button
          onClick={() => setFilter("offline")}
          className={`px-4 py-2 rounded-xl font-semibold transition ${
            filter === "offline"
              ? "bg-red-600 text-white"
              : "bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          }`}
        >
          Déconnectés
        </button>
      </div>

      {loading ? (
        <p className="text-center">Chargement...</p>
      ) : filteredRecords.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-300">
          Aucun historique correspondant pour le moment.
        </p>
      ) : (
        recordsByDate.map(([date, recs]) => (
          <div
            key={date}
            className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md"
          >
            <h2 className="text-xl font-semibold mb-2">
              {date} — {recs.length} connexion{recs.length > 1 ? "s" : ""}
            </h2>
            <table className="min-w-full bg-white dark:bg-gray-700 rounded-xl">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="px-4 py-2">Nom</th>
                  <th className="px-4 py-2">Prénom</th>
                  <th className="px-4 py-2">Heure connexion</th>
                  <th className="px-4 py-2">Heure déconnexion</th>
                </tr>
              </thead>
              <tbody>
                {recs.map((r) => (
                  <tr
                    key={r.id}
                    className={`border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      r.heure_deconnexion === "-"
                        ? "bg-green-100 dark:bg-green-900"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-2 flex items-center gap-2 font-semibold">
                      {r.nom}
                      {r.heure_deconnexion === "-" && (
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      )}
                    </td>
                    <td className="px-4 py-2 font-semibold">{r.prenom}</td>
                    <td className="px-4 py-2">{r.heure_connexion}</td>
                    <td className="px-4 py-2">
                      {r.heure_deconnexion === "-" ? (
                        <span className="px-2 py-0.5 bg-green-500 text-white rounded-full text-xs">
                          Connecté
                        </span>
                      ) : (
                        r.heure_deconnexion
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}

      {/* 🔹 Bouton RETOUR */}
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

export default HistoriqueConnections;
