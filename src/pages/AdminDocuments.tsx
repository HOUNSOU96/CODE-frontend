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

  // ============================================================
  // PAGINATION
  // ============================================================

  const [currentPage, setCurrentPage] = useState(1);

  const DOCUMENTS_PER_PAGE = 100;

  // ============================================================
  // RÉCUPÉRATION DES DOCUMENTS
  // ============================================================

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

  // ============================================================
  // FILTRAGE PAR RECHERCHE
  // ============================================================

  const filteredDocuments = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return documents;
    }

    return documents.filter((doc) =>
      [
        doc.numero,
        doc.document_name,
        doc.nom,
        doc.prenom,
        doc.email,
        doc.telephone,
        doc.user_id,
        doc.activation_code,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(term)
        )
    );
  }, [documents, search]);

  // ============================================================
  // STATISTIQUES
  // ============================================================

  const totalDocuments = documents.length;

  const documentsAffectes = documents.filter(
    (doc) => doc.user_id || doc.email
  ).length;

  const documentsLibres =
    totalDocuments - documentsAffectes;

  // ============================================================
  // CALCUL DE LA PAGINATION
  // ============================================================

  const totalPages = Math.ceil(
    filteredDocuments.length / DOCUMENTS_PER_PAGE
  );

  const startIndex =
    (currentPage - 1) * DOCUMENTS_PER_PAGE;

  const endIndex =
    startIndex + DOCUMENTS_PER_PAGE;

  const paginatedDocuments = filteredDocuments.slice(
    startIndex,
    endIndex
  );

  // ============================================================
  // RETOUR À LA PAGE 1 LORS D'UNE NOUVELLE RECHERCHE
  // ============================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // ============================================================
  // PAGES VISIBLES
  // ============================================================

  const visiblePages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    const pages: number[] = [];

    // Première page
    pages.push(1);

    // Pages autour de la page actuelle
    for (
      let page = Math.max(2, currentPage - 2);
      page <= Math.min(totalPages - 1, currentPage + 2);
      page++
    ) {
      pages.push(page);
    }

    // Dernière page
    pages.push(totalPages);

    return Array.from(new Set(pages));
  }, [currentPage, totalPages]);

  // ============================================================
  // AFFICHAGE
  // ============================================================

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900"
    >
      <div className="max-w-7xl mx-auto">

        {/* ======================================================
            EN-TÊTE
        ====================================================== */}

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

        {/* ======================================================
            STATISTIQUES
        ====================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          {/* TOTAL */}

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">

            <p className="text-gray-500 dark:text-gray-400">
              Total documents
            </p>

            <p className="text-3xl font-bold text-blue-600">
              {totalDocuments}
            </p>

          </div>

          {/* ASSOCIÉS */}

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">

            <p className="text-gray-500 dark:text-gray-400">
              Associés
            </p>

            <p className="text-3xl font-bold text-green-600">
              {documentsAffectes}
            </p>

          </div>

          {/* NON ASSOCIÉS */}

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">

            <p className="text-gray-500 dark:text-gray-400">
              Non associés
            </p>

            <p className="text-3xl font-bold text-orange-600">
              {documentsLibres}
            </p>

          </div>

        </div>

        {/* ======================================================
            RECHERCHE
        ====================================================== */}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6">

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Rechercher par numéro, document, nom, prénom, email ou téléphone..."
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

        {/* ======================================================
            CHARGEMENT
        ====================================================== */}

        {loading && (
          <p className="text-center py-10 text-gray-600 dark:text-gray-300">
            Chargement des documents...
          </p>
        )}

        {/* ======================================================
            ERREUR
        ====================================================== */}

        {!loading && error && (
          <div className="bg-red-100 text-red-700 rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        {/* ======================================================
            AUCUN RÉSULTAT
        ====================================================== */}

        {!loading &&
          !error &&
          filteredDocuments.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-10 text-center text-gray-500">
              Aucun document trouvé.
            </div>
          )}

        {/* ======================================================
            TABLEAU
        ====================================================== */}

        {!loading &&
          filteredDocuments.length > 0 && (
            <>

              <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">

                <table className="min-w-full">

                  <thead>

                    <tr className="bg-blue-600 text-white">

                      <th className="px-4 py-3 text-left">
                        N°
                      </th>

                      <th className="px-4 py-3 text-left">
                        Document
                      </th>

                      <th className="px-4 py-3 text-left">
                        Utilisateur
                      </th>

                      <th className="px-4 py-3 text-left">
                        Email
                      </th>

                      <th className="px-4 py-3 text-left">
                        Téléphone
                      </th>

                      <th className="px-4 py-3 text-center">
                        État
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {paginatedDocuments.map(
                      (doc, index) => {

                        const associe = Boolean(
                          doc.user_id ||
                            doc.email
                        );

                        return (
                          <tr
                            key={`${doc.numero}-${doc.document_name}-${index}`}
                            className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >

                            {/* NUMÉRO */}

                            <td className="px-4 py-3 font-semibold">
                              {doc.numero ??
                                startIndex +
                                  index +
                                  1}
                            </td>

                            {/* DOCUMENT */}

                            <td className="px-4 py-3">

                              <span className="font-semibold">
                                {doc.document_name}
                              </span>

                            </td>

                            {/* UTILISATEUR */}

                            <td className="px-4 py-3">

                              {associe ? (

                                <div>

                                  <p className="font-semibold">
                                    {doc.nom || ""}{" "}
                                    {doc.prenom || ""}
                                  </p>

                                  {doc.user_id && (
                                    <p className="text-xs text-gray-500">
                                      ID utilisateur :{" "}
                                      {doc.user_id}
                                    </p>
                                  )}

                                </div>

                              ) : (

                                <span className="text-gray-400 italic">
                                  Aucun utilisateur
                                </span>

                              )}

                            </td>

                            {/* EMAIL */}

                            <td className="px-4 py-3">

                              {doc.email || (
                                <span className="text-gray-400">
                                  —
                                </span>
                              )}

                            </td>

                            {/* TÉLÉPHONE */}

                            <td className="px-4 py-3">

                              {doc.telephone || (
                                <span className="text-gray-400">
                                  —
                                </span>
                              )}

                            </td>

                            {/* ÉTAT */}

                            <td className="px-4 py-3 text-center">

                              {associe ? (

                                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                                  🟢 Associé
                                </span>

                              ) : (

                                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-semibold">
                                  ⚪ Disponible
                                </span>

                              )}

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

              {/* =================================================
                  PAGINATION
              ================================================= */}

              {totalPages > 1 && (

                <div className="flex flex-wrap justify-center items-center gap-2 mt-6">

                  {/* PRÉCÉDENT */}

                  <button
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          Math.max(
                            page - 1,
                            1
                          )
                      )
                    }
                    disabled={
                      currentPage === 1
                    }
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-gray-700 text-white hover:bg-gray-800"
                    }`}
                  >
                    ← Précédent
                  </button>

                  {/* NUMÉROS DES PAGES */}

                  {visiblePages.map(
                    (page, index) => {

                      const previousPage =
                        visiblePages[
                          index - 1
                        ];

                      const showEllipsis =
                        previousPage !==
                          undefined &&
                        page -
                          previousPage >
                          1;

                      return (
                        <React.Fragment
                          key={page}
                        >

                          {/* ELLIPSIS */}

                          {showEllipsis && (
                            <span className="px-2 text-gray-500">
                              ...
                            </span>
                          )}

                          {/* PAGE */}

                          <button
                            onClick={() =>
                              setCurrentPage(
                                page
                              )
                            }
                            className={`min-w-[42px] px-3 py-2 rounded-lg font-semibold transition ${
                              currentPage ===
                              page
                                ? "bg-blue-600 text-white shadow"
                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-gray-700"
                            }`}
                          >
                            {page}
                          </button>

                        </React.Fragment>
                      );
                    }
                  )}

                  {/* SUIVANT */}

                  <button
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          Math.min(
                            page + 1,
                            totalPages
                          )
                      )
                    }
                    disabled={
                      currentPage ===
                      totalPages
                    }
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      currentPage ===
                      totalPages
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-gray-700 text-white hover:bg-gray-800"
                    }`}
                  >
                    Suivant →
                  </button>

                </div>

              )}

              {/* =================================================
                  INFORMATIONS PAGINATION
              ================================================= */}

              <div className="text-center text-sm text-gray-500 mt-4">

                <p>
                  Affichage de{" "}
                  <span className="font-semibold">
                    {startIndex + 1}
                  </span>{" "}
                  à{" "}
                  <span className="font-semibold">
                    {Math.min(
                      endIndex,
                      filteredDocuments.length
                    )}
                  </span>{" "}
                  sur{" "}
                  <span className="font-semibold">
                    {filteredDocuments.length}
                  </span>{" "}
                  document(s).
                </p>

                <p className="mt-1">
                  Page{" "}
                  <span className="font-semibold">
                    {currentPage}
                  </span>{" "}
                  sur{" "}
                  <span className="font-semibold">
                    {totalPages}
                  </span>
                </p>

              </div>

            </>
          )}

        {/* ======================================================
            NAVIGATION ADMIN
        ====================================================== */}

        <div className="flex justify-center gap-4 mt-8">

          <button
            onClick={() =>
              navigate(
                "/admin/codes-activation"
              )
            }
            className="px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700"
          >
            🔑 Voir les codes d'activation
          </button>

          <button
            onClick={() =>
              navigate(
                "/admin/historique-connections"
              )
            }
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