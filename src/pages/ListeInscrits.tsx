// 📁 ListeInscrits.tsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/utils/axios";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

interface UserInscrit {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  date_inscription: string;
  is_validated: boolean;
  is_blocked?: boolean;
  status?: "pending" | "validated" | "refused";
  last_warning?: string;
  is_online?: boolean;
  is_admin?: boolean;
  parrain_email: string;
  lieu_naissance?: string;
  filleuls_emails?: string[]; // ✅ nouveau champ
}

const PAGE_SIZE = 10;

const ListeInscrits: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [inscrits, setInscrits] = useState<UserInscrit[]>([]);
  const [loadingListe, setLoadingListe] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastInscritRef = useCallback(
    (node: HTMLTableRowElement) => {
      if (loadingListe) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadingListe, hasMore]
  );

  // 🔹 Redirection si pas admin
  useEffect(() => {
    if (!authLoading) {
      if (!user) navigate("/login");
      else if (!user.is_admin) navigate("/page2");
    }
  }, [authLoading, user]);

  // 🔹 Récupération paginée des inscrits
  useEffect(() => {
    if (!user?.is_admin || !hasMore) return;

    const fetchInscrits = async () => {
      setLoadingListe(true);
      try {
        const response = await api.get("/api/admin/liste-inscrits", {
          params: { page, page_size: PAGE_SIZE },
        });

        let nouvelleListe: UserInscrit[] = response.data.inscrits
          .filter((i: any) => i.email !== "deogratiashounsou@gmail.com")
          .map((i: any) => ({
            ...i,
            telephone: i.telephone,
            status: i.is_validated
              ? "validated"
              : i.status === "SUSPENDED"
              ? "refused"
              : "pending",
            is_online: i.is_online,
            is_admin: i.is_admin,
            parrain_email: i.parrain_email,
            lieu_naissance: i.lieu_naissance,
            filleuls_emails: i.filleuls_emails || [],
          }));

        setInscrits((prev) => {
          const ids = new Set(prev.map((u) => u.id));
          const filtered = nouvelleListe.filter((u) => !ids.has(u.id));
          return [...prev, ...filtered];
        });

        if (inscrits.length + nouvelleListe.length >= response.data.total) {
          setHasMore(false);
        }
      } catch (err) {
        console.error("Erreur récupération inscrits :", err);
      } finally {
        setLoadingListe(false);
      }
    };

    fetchInscrits();
  }, [page, user]);

  // 🔹 Actions utilisateur
  const handleValider = async (id: number) => {
    try {
      const res = await api.post(`/api/admin/valider-inscrit/${id}`);
      setInscrits((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, status: "validated", is_validated: true } : u
        )
      );
      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la validation.");
    }
  };

  const handleRefuser = async (id: number) => {
    try {
      const res = await api.post(`/api/admin/refuser-inscrit/${id}`);
      setInscrits((prev) => prev.filter((u) => u.id !== id));
      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert("Erreur lors du refus.");
    }
  };

  const handleBlock = async (id: number, blocked?: boolean) => {
    try {
      const action = blocked ? "reactivate" : "block";
      const res = await api.post(`/api/admin/${action}-user/${id}`);
      setInscrits((prev) =>
        prev.map((u) => (u.id === id ? { ...u, is_blocked: !blocked } : u))
      );
      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert("Erreur lors du blocage/réactivation.");
    }
  };

  const pendingCount = inscrits.filter((i) => i.status === "pending").length;

  if (authLoading) return <div>Chargement...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900"
    >
      <h1 className="text-3xl font-bold text-center text-blue-700 dark:text-white mb-4">
        Liste des Apprenants Inscrits
      </h1>

      <p className="text-center text-gray-600 dark:text-gray-300 mb-4">
        Inscriptions en attente :{" "}
        <span className="font-semibold">{pendingCount}</span>
      </p>

      {inscrits.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-300">
          Aucun inscrit pour le moment.
        </p>
      ) : (
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2">Prénom</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Parrain</th>
                <th className="px-4 py-2">Filleuls</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Date inscription</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2">Blocage</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {inscrits.map((i, index) => {
                const isLast = inscrits.length === index + 1;
                return (
                  <tr
                    key={i.id}
                    ref={isLast ? lastInscritRef : null}
                    className="border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-2 flex items-center gap-2">
                      {i.nom}
                      {i.is_online ? (
                        <span className="px-2 py-0.5 bg-green-500 text-white rounded-full text-xs">
                          Connecté
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
                          Déconnecté
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-2">{i.prenom}</td>
                    <td className="px-4 py-2">{i.email}</td>

                    <td className="px-4 py-2">
                      {i.parrain_email ? (
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/parrain/${encodeURIComponent(
                                i.parrain_email
                              )}`
                            )
                          }
                          className="text-blue-600 hover:underline"
                        >
                          {i.parrain_email}
                        </button>
                      ) : (
                        <span className="text-gray-400 italic">Aucun</span>
                      )}
                    </td>

                    <td className="px-4 py-2">
                      {i.filleuls_emails && i.filleuls_emails.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {i.filleuls_emails.map((mail) => (
                            <button
                              key={mail}
                              onClick={() =>
                                navigate(
                                  `/admin/parrain/${encodeURIComponent(mail)}`
                                )
                              }
                              className="text-blue-600 hover:underline text-sm"
                            >
                              {mail}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Aucun</span>
                      )}
                    </td>

                    <td className="px-4 py-2">{i.telephone}</td>
                    <td className="px-4 py-2">
                      {new Date(i.date_inscription).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      {i.status === "validated" && "✅ Validé"}
                      {i.status === "pending" && "⏳ En attente"}
                      {i.status === "refused" && "❌ Refusé"}
                    </td>

                    <td className="px-4 py-2 text-center">
                      {i.is_blocked ? (
                        <span className="text-red-600 font-semibold">
                          🚫 Bloqué
                        </span>
                      ) : (
                        <span className="text-green-600 font-semibold">
                          ✅ Actif
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-2">
                      {i.status === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleValider(i.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                          >
                            Valider
                          </button>
                          <button
                            onClick={() => handleRefuser(i.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                          >
                            Refuser
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleBlock(i.id, i.is_blocked)}
                            className={`px-3 py-1 rounded-xl text-white ${
                              i.is_blocked
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-red-600 hover:bg-red-700"
                            } transition`}
                          >
                            {i.is_blocked ? "Réactiver" : "Bloquer"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {loadingListe && <p className="text-center mt-4">Chargement...</p>}
        </div>
      )}

      {/* 🔹 Bloc boutons centré avec espacement uniforme */}
      <div className="flex flex-col items-center space-y-4 mt-6">
        <button
          onClick={() => navigate("/admin/historique-connections")}
          className="px-6 py-3 font-semibold rounded-xl bg-green-600 text-white hover:bg-green-700 transition w-64 text-center"
        >
          Voir l'historique des connexions
        </button>

        <button
          onClick={() => navigate("/page2")}
          disabled={pendingCount > 0}
          className={`px-6 py-3 font-semibold rounded-xl transition w-64 text-center ${
            pendingCount > 0
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          CONTINUER
        </button>

        {pendingCount > 0 && (
          <p className="text-sm text-red-600 mt-2 text-center">
            ⚠️ Vous devez traiter toutes les inscriptions avant de continuer.
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default ListeInscrits;
