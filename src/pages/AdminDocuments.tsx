import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/utils/axios";
import { motion } from "framer-motion";

interface DocumentRecord {
  numero: number | string;
  document_name: string;
  user_id?: number | null;
  nom?: string | null;
  prenom?: string | null;
  email?: string | null;
  telephone?: string | null;
  is_activated?: boolean;
  activation_code?: string | null;
}

const AdminDocuments: React.FC = () => {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/api/admin/documents");
        const data = response.data;

        setDocuments(
          Array.isArray(data)
            ? data
            : Array.isArray(data.documents)
            ? data.documents
            : []
        );
      } catch (err) {
        console.error("Erreur récupération documents :", err);
        setError(
          "Impossible de récupérer les informations des documents. " +
          "Vérifie que la route /api/admin/documents existe côté backend."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const filteredDocuments = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return documents;

    return documents.filter((doc) =>
      [
        doc.numero,
        doc.document_name,
        doc.nom,
        doc.prenom,
        doc.email,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [documents, search]);

  const totalDocuments = documents.length;
  const documentsAffectes = documents.filter(
    (doc) => doc.user_id || doc.email
  ).length;
  const documentsLibres = totalDocuments - documentsAffectes;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-700 dark:text-white">
              📚 Gestion des documents
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Documents CODE et utilisateurs associés.
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 rounded-xl bg-gray-700 text-white hover:bg-gray-800"
          >
            ← Retour
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
            <p className="text-gray-500 dark:text-gray-400">Total documents</p>
            <p className="text-3xl font-bold text-blue-600">{totalDocuments}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
            <p className="text-gray-500 dark:text-gray-400">Associés</p>
            <p className="text-3xl font-bold text-green-600">
              {documentsAffectes}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
            <p className="text-gray-500 dark:text-gray-400">Non associés</p>
            <p className="text-3xl font-bold text-orange-600">
              {documentsLibres}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par numéro, document, nom, prénom ou email..."
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading && (
          <p className="text-center py-10 text-gray-600 dark:text-gray-300">
            Chargement des documents...
          </p>
        )}

        {!loading && error && (
          <div className="bg-red-100 text-red-700 rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        {!loading && !error && filteredDocuments.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-10 text-center text-gray-500">
            Aucun document trouvé.
          </div>
        )}

        {!loading && filteredDocuments.length > 0 && (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
            <table className="min-w-full">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="px-4 py-3 text-left">N°</th>
                  <th className="px-4 py-3 text-left">Document</th>
                  <th className="px-4 py-3 text-left">Utilisateur</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Téléphone</th>
                  <th className="px-4 py-3 text-center">État</th>
                </tr>
              </thead>

              <tbody>
                {filteredDocuments.map((doc, index) => {
                  const associe = Boolean(doc.user_id || doc.email);

                  return (
                    <tr
                      key={`${doc.numero}-${doc.document_name}-${index}`}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-3 font-semibold">
                        {doc.numero}
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-semibold">
                          {doc.document_name}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {associe ? (
                          <div>
                            <p className="font-semibold">
                              {doc.nom || ""} {doc.prenom || ""}
                            </p>
                            {doc.user_id && (
                              <p className="text-xs text-gray-500">
                                ID utilisateur : {doc.user_id}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">
                            Aucun utilisateur
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {doc.email || (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {doc.telephone || (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {associe ? (
                          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                            ✓ Associé
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-semibold">
                            Disponible
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => navigate("/admin/codes-activation")}
            className="px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700"
          >
            🔑 Voir les codes d'activation
          </button>

          <button
            onClick={() => navigate("/admin/historique-connections")}
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
          >
            Connexions
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDocuments;