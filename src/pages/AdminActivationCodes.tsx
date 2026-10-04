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
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");
  const [error, setError] = useState("");

  // ============================================================
  // ÉTAT DE LA CONNEXION
  // ============================================================

  const [isOffline, setIsOffline] = useState<boolean>(() => {
    if (typeof navigator === "undefined") {
      return false;
    }

    return !navigator.onLine;
  });

  const [lastFetchFailed, setLastFetchFailed] =
    useState(false);

  // ============================================================
  // PAGINATION
  // ============================================================

  const [currentPage, setCurrentPage] = useState(1);

  const CODES_PER_PAGE = 100;

  // ============================================================
  // SURVEILLANCE DE LA CONNEXION
  // ============================================================

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setLastFetchFailed(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ============================================================
  // RÉCUPÉRATION DES CODES
  // ============================================================

  const fetchCodes = async () => {
    setLoading(true);
    setError("");
    setLastFetchFailed(false);

    // ----------------------------------------------------------
    // Vérification immédiate de la connexion
    // ----------------------------------------------------------

    if (
      typeof navigator !== "undefined" &&
      !navigator.onLine
    ) {
      setIsOffline(true);

      setError(
        "Vous êtes actuellement hors ligne. " +
          "Les codes d'activation nécessitent une connexion " +
          "Internet pour être récupérés."
      );

      setLastFetchFailed(true);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(
        "/api/admin/activation-codes"
      );

      const data = response.data;

      const normalizedCodes: ActivationCode[] =
        Array.isArray(data)
          ? data
          : Array.isArray(data.codes)
          ? data.codes
          : [];

      setCodes(normalizedCodes);

      setIsOffline(false);
      setLastFetchFailed(false);
    } catch (err) {
      console.error(
        "Erreur récupération codes :",
        err
      );

      // --------------------------------------------------------
      // Vérification après l'échec
      // --------------------------------------------------------

      if (
        typeof navigator !== "undefined" &&
        !navigator.onLine
      ) {
        setIsOffline(true);

        setError(
          "La connexion Internet a été interrompue. " +
            "Les codes d'activation ne peuvent pas être " +
            "actualisés hors ligne."
        );
      } else {
        setError(
          "Impossible de récupérer les codes. " +
            "Vérifie que la route /api/admin/activation-codes existe côté backend."
        );
      }

      setLastFetchFailed(true);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CHARGEMENT INITIAL
  // ============================================================

  useEffect(() => {
    fetchCodes();
  }, []);

  // ============================================================
  // NOUVELLE TENTATIVE
  // ============================================================

  const handleRetry = () => {
    fetchCodes();
  };

  // ============================================================
  // DOCUMENTS DISPONIBLES
  // ============================================================

  const documents = useMemo(() => {
    return Array.from(
      new Set(
        codes
          .map((code) => code.document_name)
          .filter(Boolean)
      )
    ).sort();
  }, [codes]);

  // ============================================================
  // FILTRAGE
  // ============================================================

  const filteredCodes = useMemo(() => {
    const term = search.trim().toLowerCase();

    return codes.filter((code) => {
      const activated = Boolean(code.is_activated);

      // --------------------------------------------------------
      // Filtre par état
      // --------------------------------------------------------

      if (
        statusFilter === "available" &&
        activated
      ) {
        return false;
      }

      if (
        statusFilter === "activated" &&
        !activated
      ) {
        return false;
      }

      // --------------------------------------------------------
      // Filtre par document
      // --------------------------------------------------------

      if (
        documentFilter &&
        code.document_name !== documentFilter
      ) {
        return false;
      }

      // --------------------------------------------------------
      // Recherche
      // --------------------------------------------------------

      if (!term) {
        return true;
      }

      return [
        code.activation_code,
        code.document_name,
        code.buyer_email,
        code.user_id,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(term)
        );
    });
  }, [
    codes,
    search,
    documentFilter,
    statusFilter,
  ]);

  // ============================================================
  // STATISTIQUES
  // ============================================================

  const total = codes.length;

  const activatedCount = codes.filter(
    (c) => c.is_activated
  ).length;

  const availableCount =
    total - activatedCount;

  // ============================================================
  // CALCUL DE LA PAGINATION
  // ============================================================

  const totalPages = Math.ceil(
    filteredCodes.length /
      CODES_PER_PAGE
  );

  const startIndex =
    (currentPage - 1) *
    CODES_PER_PAGE;

  const endIndex =
    startIndex + CODES_PER_PAGE;

  const paginatedCodes =
    filteredCodes.slice(
      startIndex,
      endIndex
    );

  // ============================================================
  // RETOUR À LA PAGE 1 LORS D'UN CHANGEMENT DE FILTRE
  // ============================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    documentFilter,
    statusFilter,
  ]);

  // ============================================================
  // PROTECTION DE LA PAGE COURANTE
  // ============================================================

  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  // ============================================================
  // PAGINATION : PAGES VISIBLES
  // ============================================================

  const visiblePages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    const pages: number[] = [];

    pages.push(1);

    for (
      let page = Math.max(
        2,
        currentPage - 2
      );
      page <=
      Math.min(
        totalPages - 1,
        currentPage + 2
      );
      page++
    ) {
      pages.push(page);
    }

    pages.push(totalPages);

    return Array.from(
      new Set(pages)
    );
  }, [
    currentPage,
    totalPages,
  ]);

  // ============================================================
  // AFFICHAGE
  // ============================================================

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 25,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
      }}
      className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900"
    >
      <div className="max-w-7xl mx-auto">

        {/* ======================================================
            INDICATEUR HORS LIGNE
        ====================================================== */}

        {isOffline && (
          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-5 rounded-xl border border-orange-300 bg-orange-50 dark:bg-orange-900/30 dark:border-orange-700 px-4 py-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <div>
                <p className="font-semibold text-orange-700 dark:text-orange-300">
                  📴 Mode hors ligne
                </p>

                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                  La consultation des codes d'activation
                  nécessite une connexion Internet.
                </p>
              </div>

              <button
                onClick={handleRetry}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading
                  ? "Vérification..."
                  : "Réessayer"}
              </button>

            </div>
          </motion.div>
        )}

        {/* ======================================================
            EN-TÊTE
        ====================================================== */}

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
            className="px-5 py-2 rounded-xl bg-gray-700 text-white hover:bg-gray-800 transition"
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
              Total
            </p>

            <p className="text-3xl font-bold text-blue-600">
              {total}
            </p>

          </div>

          {/* DISPONIBLES */}

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">

            <p className="text-gray-500 dark:text-gray-400">
              Disponibles
            </p>

            <p className="text-3xl font-bold text-green-600">
              {availableCount}
            </p>

          </div>

          {/* ACTIVÉS */}

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">

            <p className="text-gray-500 dark:text-gray-400">
              Activés
            </p>

            <p className="text-3xl font-bold text-red-600">
              {activatedCount}
            </p>

          </div>

        </div>

        {/* ======================================================
            FILTRES
        ====================================================== */}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* RECHERCHE */}

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Rechercher un code, email..."
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-orange-500"
            />

            {/* DOCUMENT */}

            <select
              value={documentFilter}
              onChange={(e) =>
                setDocumentFilter(
                  e.target.value
                )
              }
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">
                Tous les documents
              </option>

              {documents.map(
                (document) => (
                  <option
                    key={document}
                    value={document}
                  >
                    {document}
                  </option>
                )
              )}
            </select>

            {/* ÉTAT */}

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target
                    .value as StatusFilter
                )
              }
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">
                Tous les états
              </option>

              <option value="available">
                Disponibles
              </option>

              <option value="activated">
                Activés
              </option>
            </select>

          </div>

        </div>

        {/* ======================================================
            CHARGEMENT
        ====================================================== */}

        {loading && (
          <div className="text-center py-10">

            <p className="text-gray-600 dark:text-gray-300">
              Chargement des codes...
            </p>

          </div>
        )}

        {/* ======================================================
            ERREUR
        ====================================================== */}

        {!loading && error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl p-4 mb-6">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <p>
                {error}
              </p>

              {lastFetchFailed &&
                !isOffline && (
                  <button
                    onClick={handleRetry}
                    className="shrink-0 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                  >
                    Réessayer
                  </button>
                )}

            </div>

          </div>
        )}

        {/* ======================================================
            AUCUN RÉSULTAT
        ====================================================== */}

        {!loading &&
          !error &&
          filteredCodes.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-10 text-center text-gray-500">
              Aucun code trouvé.
            </div>
          )}

        {/* ======================================================
            TABLEAU
        ====================================================== */}

        {!loading &&
          filteredCodes.length > 0 && (
            <>

              <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">

                <table className="min-w-full">

                  <thead>

                    <tr className="bg-orange-600 text-white">

                      <th className="px-4 py-3 text-left">
                        N°
                      </th>

                      <th className="px-4 py-3 text-left">
                        Code
                      </th>

                      <th className="px-4 py-3 text-left">
                        Document
                      </th>

                      <th className="px-4 py-3 text-left">
                        Acheteur
                      </th>

                      <th className="px-4 py-3 text-center">
                        État
                      </th>

                      <th className="px-4 py-3 text-left">
                        Activation
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {paginatedCodes.map(
                      (code, index) => (
                        <tr
                          key={
                            code.id ??
                            `${code.activation_code}-${index}`
                          }
                          className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >

                          {/* NUMÉRO */}

                          <td className="px-4 py-3 font-semibold">
                            {code.numero ??
                              startIndex +
                                index +
                                1}
                          </td>

                          {/* CODE */}

                          <td className="px-4 py-3">

                            <code className="font-mono font-bold tracking-wide">
                              {
                                code.activation_code
                              }
                            </code>

                          </td>

                          {/* DOCUMENT */}

                          <td className="px-4 py-3">
                            {
                              code.document_name
                            }
                          </td>

                          {/* ACHETEUR */}

                          <td className="px-4 py-3">

                            {code.buyer_email || (
                              <span className="text-gray-400 italic">
                                Aucun acheteur
                              </span>
                            )}

                          </td>

                          {/* ÉTAT */}

                          <td className="px-4 py-3 text-center">

                            {code.is_activated ? (

                              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                                🟢 Activé
                              </span>

                            ) : (

                              <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
                                🔴 Disponible
                              </span>

                            )}

                          </td>

                          {/* DATE D'ACTIVATION */}

                          <td className="px-4 py-3">

                            {code.activated_at
                              ? new Date(
                                  code.activated_at
                                ).toLocaleString()
                              : "—"}

                          </td>

                        </tr>
                      )
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

                          {/* ... */}

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
                                ? "bg-orange-600 text-white shadow"
                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-orange-100 dark:hover:bg-gray-700"
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
                      filteredCodes.length
                    )}
                  </span>{" "}
                  sur{" "}
                  <span className="font-semibold">
                    {
                      filteredCodes.length
                    }
                  </span>{" "}
                  code(s).
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

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">

          <button
            onClick={() =>
              navigate(
                "/admin/documents"
              )
            }
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition"
          >
            📚 Documents
          </button>

          <button
            onClick={() =>
              navigate(
                "/admin/historique-connections"
              )
            }
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
          >
            Connexions
          </button>

        </div>

      </div>
    </motion.div>
  );
};

export default AdminActivationCodes;