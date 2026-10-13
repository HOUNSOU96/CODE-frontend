import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/utils/axios";
import { useAuth } from "@/hooks/useAuth";

interface ProjetAdmin {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  pays: string;
  titre: string;
  description: string;
  probleme?: string | null;
  vision?: string | null;
  categorie?: string | null;
  statut: "pending" | "reviewing" | "accepted" | "rejected" | "published";
  consentement_publication: boolean;
  declaration_droits: boolean;
  date_soumission: string;
  date_examen?: string | null;
  date_publication?: string | null;
}

const AdminProjets: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [projets, setProjets] = useState<ProjetAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/login");
      } else if (!user.is_admin) {
        navigate("/page2");
      }
    }
  }, [authLoading, user, navigate]);

  const chargerProjets = async () => {
    if (!user?.is_admin) return;

    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/projets/admin/toutes");

      setProjets(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.error("Erreur récupération projets :", err);

      setError(
        err?.response?.data?.detail ||
          "Impossible de récupérer les idées soumises."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerProjets();
  }, [user]);

  const executerAction = async (
    id: number,
    action: "examiner" | "accepter" | "refuser" | "publier"
  ) => {
    let confirmation = true;

    if (action === "refuser") {
      confirmation = window.confirm(
        "Voulez-vous vraiment refuser cette idée ?"
      );
    }

    if (action === "publier") {
      confirmation = window.confirm(
        "Voulez-vous publier cette idée sur la page publique de CODE ?"
      );
    }

    if (!confirmation) return;

    try {
      setActionLoading(id);
      setError("");

      await api.put(`/api/projets/admin/${id}/${action}`);

      await chargerProjets();
    } catch (err: any) {
      console.error(`Erreur action ${action} :`, err);

      setError(
        err?.response?.data?.detail ||
          `Impossible d'effectuer l'action "${action}".`
      );
    } finally {
      setActionLoading(null);
    }
  };

  const supprimerProjet = async (id: number) => {
    const confirmation = window.confirm(
      "Cette action supprimera définitivement cette idée. Continuer ?"
    );

    if (!confirmation) return;

    try {
      setActionLoading(id);
      setError("");

      await api.delete(`/api/projets/admin/${id}`);

      await chargerProjets();
    } catch (err: any) {
      console.error("Erreur suppression projet :", err);

      setError(
        err?.response?.data?.detail ||
          "Impossible de supprimer cette idée."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const statutLabel = (statut: ProjetAdmin["statut"]) => {
    switch (statut) {
      case "pending":
        return "⏳ En attente";

      case "reviewing":
        return "🔎 En examen";

      case "accepted":
        return "✅ Acceptée";

      case "rejected":
        return "❌ Refusée";

      case "published":
        return "🌍 Publiée";

      default:
        return statut;
    }
  };

  const statutClass = (statut: ProjetAdmin["statut"]) => {
    switch (statut) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";

      case "reviewing":
        return "bg-blue-100 text-blue-800";

      case "accepted":
        return "bg-green-100 text-green-800";

      case "rejected":
        return "bg-red-100 text-red-800";

      case "published":
        return "bg-purple-100 text-purple-800";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "—";

    try {
      return new Date(date).toLocaleString("fr-FR");
    } catch {
      return date;
    }
  };

  if (authLoading || !user?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">
          Vérification des droits administrateur...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-6"
    >
      <div className="max-w-7xl mx-auto">

        {/* EN-TÊTE */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-400">
              💡 Administration des projets
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Examen et gestion des idées soumises à CODE.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/projets")}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              🌍 Page publique
            </button>

            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2 rounded-xl bg-gray-700 text-white hover:bg-gray-800"
            >
              ← Retour
            </button>
          </div>
        </div>

        {/* ERREUR */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 rounded-xl p-4 mb-6">
            ⚠️ {error}
          </div>
        )}

        {/* STATISTIQUES */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">

          {[
            {
              label: "Total",
              value: projets.length,
              color: "text-blue-600",
            },
            {
              label: "En attente",
              value: projets.filter((p) => p.statut === "pending").length,
              color: "text-yellow-600",
            },
            {
              label: "En examen",
              value: projets.filter((p) => p.statut === "reviewing").length,
              color: "text-blue-600",
            },
            {
              label: "Acceptées",
              value: projets.filter((p) => p.statut === "accepted").length,
              color: "text-green-600",
            },
            {
              label: "Publiées",
              value: projets.filter((p) => p.statut === "published").length,
              color: "text-purple-600",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-xl shadow p-4"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>

              <p className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* CHARGEMENT */}
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-10 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Chargement des idées...
            </p>
          </div>
        )}

        {/* AUCUNE IDEE */}
        {!loading && projets.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-10 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Aucune idée soumise.
            </p>
          </div>
        )}

        {/* LISTE */}
        {!loading && projets.length > 0 && (
          <div className="space-y-6">
            {projets.map((projet) => (
              <article
                key={projet.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden"
              >
                {/* HEADER PROJET */}
                <div className="p-5 border-b dark:border-gray-700">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                    <div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${statutClass(
                            projet.statut
                          )}`}
                        >
                          {statutLabel(projet.statut)}
                        </span>

                        {projet.categorie && (
                          <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold">
                            {projet.categorie}
                          </span>
                        )}
                      </div>

                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {projet.titre}
                      </h2>

                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Soumis le {formatDate(projet.date_soumission)}
                      </p>
                    </div>

                    <div className="text-sm">
                      <p>
                        <strong>Consentement :</strong>{" "}
                        {projet.consentement_publication
                          ? "✅ Oui"
                          : "❌ Non"}
                      </p>

                      <p className="mt-1">
                        <strong>Déclaration :</strong>{" "}
                        {projet.declaration_droits
                          ? "✅ Oui"
                          : "❌ Non"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AUTEUR */}
                <div className="p-5 bg-gray-50 dark:bg-gray-700/30">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-3">
                    👤 Informations de l'auteur
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">

                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Nom
                      </span>
                      <p className="font-semibold dark:text-white">
                        {projet.nom}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Prénom
                      </span>
                      <p className="font-semibold dark:text-white">
                        {projet.prenom}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Email
                      </span>
                      <p className="font-semibold dark:text-white break-all">
                        {projet.email}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Téléphone
                      </span>
                      <p className="font-semibold dark:text-white">
                        {projet.telephone}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Pays
                      </span>
                      <p className="font-semibold dark:text-white">
                        {projet.pays}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CONTENU */}
                <div className="p-5">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-2">
                    📄 Description
                  </h3>

                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                    {projet.description}
                  </p>

                  {projet.probleme && (
                    <div className="mt-5">
                      <h3 className="font-bold text-gray-800 dark:text-white">
                        🎯 Problème
                      </h3>

                      <p className="mt-1 text-gray-600 dark:text-gray-300 whitespace-pre-line">
                        {projet.probleme}
                      </p>
                    </div>
                  )}

                  {projet.vision && (
                    <div className="mt-5">
                      <h3 className="font-bold text-gray-800 dark:text-white">
                        🔭 Vision
                      </h3>

                      <p className="mt-1 text-gray-600 dark:text-gray-300 whitespace-pre-line">
                        {projet.vision}
                      </p>
                    </div>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="p-5 border-t dark:border-gray-700 flex flex-wrap gap-3">

                  {projet.statut === "pending" && (
                    <button
                      disabled={actionLoading === projet.id}
                      onClick={() =>
                        executerAction(projet.id, "examiner")
                      }
                      className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      🔎 Examiner
                    </button>
                  )}

                  {(projet.statut === "pending" ||
                    projet.statut === "reviewing") && (
                    <>
                      <button
                        disabled={actionLoading === projet.id}
                        onClick={() =>
                          executerAction(projet.id, "accepter")
                        }
                        className="px-5 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400"
                      >
                        ✅ Accepter
                      </button>

                      <button
                        disabled={actionLoading === projet.id}
                        onClick={() =>
                          executerAction(projet.id, "refuser")
                        }
                        className="px-5 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400"
                      >
                        ❌ Refuser
                      </button>
                    </>
                  )}

                  {projet.statut === "accepted" && (
                    <button
                      disabled={actionLoading === projet.id}
                      onClick={() =>
                        executerAction(projet.id, "publier")
                      }
                      className="px-5 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-400"
                    >
                      🌍 Publier
                    </button>
                  )}

                  <button
                    disabled={actionLoading === projet.id}
                    onClick={() => supprimerProjet(projet.id)}
                    className="px-5 py-2 rounded-xl bg-gray-800 text-white hover:bg-black disabled:bg-gray-400"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminProjets;