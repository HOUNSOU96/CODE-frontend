import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/utils/axios";
import { motion } from "framer-motion";

interface ActivationCode {
  id?: number;
  numero?: number | string;
  activation_code: string;
  document_name: string;
  buyer_email?: string | null;
  user_id?: number | null;
  is_activated?: boolean;
  activated_at?: string | null;
  activation_type?: string | null;
}

type StatusFilter = "all" | "available" | "activated";

const AdminActivationCodes: React.FC = () => {
  const navigate = useNavigate();

  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [documentFilter, setDocumentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCodes = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/api/admin/activation-codes");
        const data = response.data;

        setCodes(
          Array.isArray(data)
            ? data
            : Array.isArray(data.codes)
            ? data.codes
            : []
        );
      } catch (err) {
        console.error("Erreur récupération codes :", err);
        setError(
          "Impossible de récupérer les codes. " +
          "Vérifie que la route /api/admin/activation-codes existe côté backend."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCodes();
  }, []);

  const documents = useMemo(() => {
    return Array.from(
      new Set(codes.map((code) => code.document_name).filter(Boolean))
    ).sort();
  }, [codes]);

  const filteredCodes = useMemo(() => {
    const term = search.trim().toLowerCase();

    return codes.filter((code) => {
      const activated = Boolean(code.is_activated);

      if (statusFilter === "available" && activated) return false;
      if (statusFilter === "activated" && !activated) return false;

      if (
        documentFilter &&
        code.document_name !== documentFilter
      ) {
        return false;
      }

      if (!term) return true;

      return [
        code.activation_code,
        code.document_name,
        code.buyer_email,
        code.user_id,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(term)
        );
    });
  }, [codes, search, documentFilter, statusFilter]);

  const total = codes.length;
  const activatedCount = codes.filter((c) => c.is_activated).length;
  const availableCount = total - activatedCount;

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
            <h1 className="text-3xl font-bold text-orange-600 dark:text-white">
              🔑 Codes d'activation
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Consultation des codes disponibles et de leur état.
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
            <p className="text-gray-500 dark:text-gray-400">Total</p>
            <p className="text-3xl font-bold text-blue-600">{total}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
            <p className="text-gray-500 dark:text-gray-400">Disponibles</p>
            <p className="text-3xl font-bold text-green-600">
              {availableCount}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
            <p className="text-gray-500 dark:text-gray-400">Activés</p>
            <p className="text-3xl font-bold text-red-600">
              {activatedCount}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un code, email..."
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-orange-500"
            />

            <select
              value={documentFilter}
              onChange={(e) => setDocumentFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Tous les documents</option>
              {documents.map((document) => (
                <option key={document} value={document}>
                  {document}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as StatusFilter)
              }
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tous les états</option>
              <option value="available">Disponibles</option>
              <option value="activated">Activés</option>
            </select>
          </div>
        </div>

        {loading && (
          <p className="text-center py-10 text-gray-600 dark:text-gray-300">
            Chargement des codes...
          </p>
        )}

        {!loading && error && (
          <div className="bg-red-100 text-red-700 rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        {!loading && !error && filteredCodes.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-10 text-center text-gray-500">
            Aucun code trouvé.
          </div>
        )}

        {!loading && filteredCodes.length > 0 && (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
            <table className="min-w-full">
              <thead>
                <tr className="bg-orange-600 text-white">
                  <th className="px-4 py-3 text-left">N°</th>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Document</th>
                  <th className="px-4 py-3 text-left">Acheteur</th>
                  <th className="px-4 py-3 text-center">État</th>
                  <th className="px-4 py-3 text-left">Activation</th>
                </tr>
              </thead>

              <tbody>
                {filteredCodes.map((code, index) => (
                  <tr
                    key={code.id ?? `${code.activation_code}-${index}`}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-3 font-semibold">
                      {code.numero ?? index + 1}
                    </td>

                    <td className="px-4 py-3">
                      <code className="font-mono font-bold tracking-wide">
                        {code.activation_code}
                      </code>
                    </td>

                    <td className="px-4 py-3">
                      {code.document_name}
                    </td>

                    <td className="px-4 py-3">
                      {code.buyer_email || (
                        <span className="text-gray-400 italic">
                          Aucun acheteur
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {code.is_activated ? (
                        <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
                          🔴 Activé
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                          🟢 Disponible
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {code.activated_at
                        ? new Date(code.activated_at).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && (
          <p className="text-center text-sm text-gray-500 mt-4">
            {filteredCodes.length} code(s) affiché(s) sur {total}.
          </p>
        )}

        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => navigate("/admin/documents")}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700"
          >
            📚 Documents
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

export default AdminActivationCodes;