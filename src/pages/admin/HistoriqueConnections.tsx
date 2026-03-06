import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/utils/axios";
import { motion } from "framer-motion";

interface ConnectionRecord {
  id: number;
  nom: string;
  prenom: string;
  date: string;
  heure_connexion: string;
  heure_deconnexion: string;
}

type FilterType = "all" | "online" | "offline";

const HistoriqueConnections: React.FC = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState<ConnectionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentOnline, setCurrentOnline] = useState(0);

  // récupération des données
  const fetchRecords = async () => {
    try {
      const res = await api.get("/api/admin/historique-connections", {
        params: { t: Date.now() }, // évite cache navigateur
      });

      const data: ConnectionRecord[] = res.data;

      setRecords(data);

      // utilisateurs connectés uniques (moins de 5 minutes)
      const onlineUsers = new Set(
        data
          .filter((r) => {
            if (r.heure_deconnexion !== "-") return false;
            const lastConnection = new Date(`${r.date}T${r.heure_connexion}`);
            return Date.now() - lastConnection.getTime() <= 5 * 60 * 1000; // 5 min
          })
          .map((r) => r.id)
      );

      setCurrentOnline(onlineUsers.size);
    } catch (err) {
      console.error("Erreur récupération historique :", err);
    }

    setLoading(false);
  };

  // fetch initial + rafraîchissement
  useEffect(() => {
    setLoading(true);
    fetchRecords();
    const interval = setInterval(fetchRecords, 5000);
    return () => clearInterval(interval);
  }, []);

  // statistiques
  const total = records.length;
  const totalOnline = useMemo(
    () =>
      records.filter((r) => {
        if (r.heure_deconnexion !== "-") return false;
        const lastConnection = new Date(`${r.date}T${r.heure_connexion}`);
        return Date.now() - lastConnection.getTime() <= 5 * 60 * 1000;
      }).length,
    [records]
  );
  const totalOffline = total - totalOnline;

  // filtres
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const lastConnection = new Date(`${r.date}T${r.heure_connexion}`);
      const isOnline =
        r.heure_deconnexion === "-" &&
        Date.now() - lastConnection.getTime() <= 5 * 60 * 1000;

      if (filter === "online" && !isOnline) return false;
      if (filter === "offline" && isOnline) return false;
      if (dateFilter && r.date !== dateFilter) return false;

      const fullName = `${r.nom} ${r.prenom}`.toLowerCase();
      if (!fullName.includes(search.toLowerCase())) return false;

      return true;
    });
  }, [records, filter, search, dateFilter]);

  // regroupement par date
  const recordsByDate = useMemo(() => {
    const grouped: Record<string, ConnectionRecord[]> = {};
    filteredRecords.forEach((r) => {
      if (!grouped[r.date]) grouped[r.date] = [];
      grouped[r.date].push(r);
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .map(([date, recs]) => {
        const sorted = [...recs].sort((a, b) => {
          const aOnline =
            a.heure_deconnexion === "-" &&
            Date.now() - new Date(`${a.date}T${a.heure_connexion}`).getTime() <=
              5 * 60 * 1000;
          const bOnline =
            b.heure_deconnexion === "-" &&
            Date.now() - new Date(`${b.date}T${b.heure_connexion}`).getTime() <=
              5 * 60 * 1000;

          if (aOnline && !bOnline) return -1;
          if (!aOnline && bOnline) return 1;

          return (
            new Date(`1970-01-01T${b.heure_connexion}`) as any -
            (new Date(`1970-01-01T${a.heure_connexion}`) as any)
          );
        });

        return [date, sorted] as [string, ConnectionRecord[]];
      });
  }, [filteredRecords]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900"
    >
      <h1 className="text-3xl font-bold text-center text-blue-700 dark:text-white mb-6">
        Historique des Connexions
      </h1>

      {/* STATISTIQUES */}
      <div className="flex justify-center gap-6 mb-6 flex-wrap">
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

      {/* RECHERCHE + DATE */}
      <div className="flex justify-center gap-4 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Rechercher nom ou prénom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-xl border"
        />
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border"
        />
      </div>

      {/* FILTRES */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-xl font-semibold ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-300 dark:bg-gray-700"
          }`}
        >
          Tous
        </button>
        <button
          onClick={() => setFilter("online")}
          className={`px-4 py-2 rounded-xl font-semibold ${
            filter === "online"
              ? "bg-green-600 text-white"
              : "bg-gray-300 dark:bg-gray-700"
          }`}
        >
          Connectés
        </button>
        <button
          onClick={() => setFilter("offline")}
          className={`px-4 py-2 rounded-xl font-semibold ${
            filter === "offline"
              ? "bg-red-600 text-white"
              : "bg-gray-300 dark:bg-gray-700"
          }`}
        >
          Déconnectés
        </button>
      </div>

      {/* HISTORIQUE */}
      {loading ? (
        <p className="text-center">Chargement...</p>
      ) : filteredRecords.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-300">
          Aucun historique trouvé.
        </p>
      ) : (
        recordsByDate.map(([date, recs]) => (
          <div
            key={date}
            className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow"
          >
            <h2 className="text-xl font-semibold mb-2">
              {date} — {recs.length} connexion{recs.length > 1 ? "s" : ""}
            </h2>

            <table className="min-w-full">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="px-4 py-2">Nom</th>
                  <th className="px-4 py-2">Prénom</th>
                  <th className="px-4 py-2">Connexion</th>
                  <th className="px-4 py-2">Déconnexion</th>
                </tr>
              </thead>
              <tbody>
                {recs.map((r) => {
                  const isOnline =
                    r.heure_deconnexion === "-" &&
                    Date.now() -
                      new Date(`${r.date}T${r.heure_connexion}`).getTime() <=
                      5 * 60 * 1000;

                  return (
                    <tr
                      key={`${r.id}-${r.date}-${r.heure_connexion}`}
                      className={`border-b hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        isOnline ? "bg-green-100 dark:bg-green-900" : ""
                      }`}
                    >
                      <td className="px-4 py-2 font-semibold flex items-center gap-2">
                        {r.nom}
                        {isOnline && (
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        )}
                      </td>
                      <td className="px-4 py-2 font-semibold">{r.prenom}</td>
                      <td className="px-4 py-2">{r.heure_connexion}</td>
                      <td className="px-4 py-2">
                        {isOnline ? (
                          <span className="px-2 py-0.5 bg-green-500 text-white rounded-full text-xs">
                            Connecté
                          </span>
                        ) : (
                          r.heure_deconnexion
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))
      )}

      {/* BOUTONS RETOUR + DASHBOARD */}
      <div className="flex justify-center gap-4 mt-6 flex-wrap">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md"
        >
          RETOUR
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-md"
        >
          DASHBOARD
        </button>
      </div>
    </motion.div>
  );
};

export default HistoriqueConnections;