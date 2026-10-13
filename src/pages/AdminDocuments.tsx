import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/utils/axios";
import { motion } from "framer-motion";

interface DocumentRecord {
  numero: number | string;
  id?: number;
  document_name: string;
  pdf_status?: "available" | "missing" | "pending";
  pdf_filename?: string | null;
  generation_status?: string | null;
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
  const [actionInProgress, setActionInProgress] =
    useState<number | null>(null);
  const [actionMessage, setActionMessage] =
    useState("");
  const [actionError, setActionError] =
    useState("");

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

  const DOCUMENTS_PER_PAGE = 100;

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
  // RÉCUPÉRATION DES DOCUMENTS
  // ============================================================

  const fetchDocuments = async () => {
    setLoading(true);
    setError("");
    setLastFetchFailed(false);

    // ----------------------------------------------------------
    // Si l'appareil est hors ligne
    // ----------------------------------------------------------

    if (
      typeof navigator !== "undefined" &&
      !navigator.onLine
    ) {
      setIsOffline(true);
      setError(
        "Vous êtes actuellement hors ligne. " +
          "Les documents administratifs nécessitent une connexion " +
          "Internet pour être récupérés."
      );
      setLastFetchFailed(true);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(
        "/api/admin/documents"
      );

      const data = response.data;

      const normalizedDocuments: DocumentRecord[] =
        Array.isArray(data)
          ? data
          : Array.isArray(data.documents)
          ? data.documents
          : [];

      setDocuments(normalizedDocuments);

      setIsOffline(false);
      setLastFetchFailed(false);
    } catch (err) {
      console.error(
        "Erreur récupération documents :",
        err
      );

      // --------------------------------------------------------
      // Détection d'une éventuelle perte de connexion
      // --------------------------------------------------------

      if (
        typeof navigator !== "undefined" &&
        !navigator.onLine
      ) {
        setIsOffline(true);

        setError(
          "La connexion Internet a été interrompue. " +
            "Les documents administratifs ne peuvent pas être " +
            "actualisés hors ligne."
        );
      } else {
        setError(
          "Impossible de récupérer les informations des documents. " +
            "Vérifie que la route /api/admin/documents existe côté backend."
        );
      }

      setLastFetchFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // ============================================================
  // NOUVELLE TENTATIVE
  // ============================================================

  const handleRetry = () => {
    fetchDocuments();
  };

  // ============================================================
  // ACTIONS ADMINISTRATIVES SUR LES DOCUMENTS
  // ============================================================

  const handleDownloadPdf = async (
    doc: DocumentRecord
  ) => {
    if (!doc.id || doc.pdf_status !== "available") {
      return;
    }

    setActionInProgress(doc.id);
    setActionMessage("");
    setActionError("");

    try {
      const response = await api.get(
        `/api/admin/documents/${doc.id}/pdf`,
        { responseType: "blob" }
      );

      const blobUrl = URL.createObjectURL(
        new Blob([response.data], {
          type: "application/pdf",
        })
      );

      const filename =
        doc.pdf_filename ||
        (doc.document_name.toLowerCase().endsWith(".pdf")
          ? doc.document_name
          : `${doc.document_name}.pdf`);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);

      setActionMessage(
        `Téléchargement lancé : ${doc.document_name}`
      );
    } catch (err) {
      console.error("Erreur de téléchargement PDF :", err);
      setActionError(
        `Impossible de télécharger le PDF de « ${doc.document_name} ».`
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRevokeAccess = async (
    doc: DocumentRecord
  ) => {
    if (!doc.id) {
      return;
    }

    const confirmed = window.confirm(
      `Révoquer l'accès à « ${doc.document_name} » ?\n\n` +
      "Le PDF sera conservé, mais l'accès sera désactivé."
    );

    if (!confirmed) {
      return;
    }

    setActionInProgress(doc.id);
    setActionMessage("");
    setActionError("");

    try {
      await api.post(
        `/api/admin/documents/${doc.id}/revoke`
      );

      await fetchDocuments();

      setActionMessage(
        `Accès révoqué pour « ${doc.document_name} ». Le PDF est conservé.`
      );
    } catch (err) {
      console.error("Erreur de révocation :", err);
      setActionError(
        `Impossible de révoquer l'accès à « ${doc.document_name} ».`
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteActivation = async (
    doc: DocumentRecord
  ) => {
    if (!doc.id) {
      return;
    }

    const confirmed = window.confirm(
      `ATTENTION : supprimer l'activation de « ${doc.document_name} » ?\n\n` +
      "Cette opération supprimera l'activation, ses accès associés " +
      "et le PDF personnalisé correspondant, s'il existe.\n\n" +
      "Le document original partagé ne sera pas supprimé.\n\n" +
      "Cette opération est irréversible."
    );

    if (!confirmed) {
      return;
    }

    setActionInProgress(doc.id);
    setActionMessage("");
    setActionError("");

    try {
      await api.delete(
        `/api/admin/documents/${doc.id}`
      );

      await fetchDocuments();

      setActionMessage(
        `Activation supprimée : ${doc.document_name}`
      );
    } catch (err) {
      console.error("Erreur de suppression :", err);
      setActionError(
        `Impossible de supprimer l'activation de « ${doc.document_name} ».`
      );
    } finally {
      setActionInProgress(null);
    }
  };

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
          String(value)
            .toLowerCase()
            .includes(term)
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

  const paginatedDocuments =
    filteredDocuments.slice(
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
  // PROTECTION DE LA PAGE COURANTE
  // ============================================================

  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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

    // Dernière page
    pages.push(totalPages);

    return Array.from(
      new Set(pages)
    );
  }, [currentPage, totalPages]);

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
                  La gestion des documents administratifs
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
            <h1 className="text-3xl font-bold text-blue-700 dark:text-white">
              📚 Gestion des documents
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Documents CODE et utilisateurs associés.
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
            RETOUR DES ACTIONS ADMINISTRATIVES
        ====================================================== */}

        {actionMessage && (
          <div
            role="status"
            className="mb-4 rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-200"
          >
            {actionMessage}
          </div>
        )}

        {actionError && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200"
          >
            {actionError}
          </div>
        )}

        {/* ======================================================
            CHARGEMENT
        ====================================================== */}

        {loading && (
          <div className="text-center py-10">

            <p className="text-gray-600 dark:text-gray-300">
              Chargement des documents...
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

              {lastFetchFailed && !isOffline && (
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

                      <th className="px-4 py-3 text-center">
                        PDF
                      </th>

                      <th className="px-4 py-3 text-center">
                        Actions
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

                        const actionBusy =
                          actionInProgress === doc.id;

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
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
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

                            {/* STATUT DU PDF */}

                            <td className="px-4 py-3 text-center">
                              {doc.pdf_status === "available" ? (
                                <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                                  PDF disponible
                                </span>
                              ) : doc.pdf_status === "pending" ? (
                                <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-semibold">
                                  Génération en cours
                                </span>
                              ) : (
                                <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-semibold">
                                  PDF manquant
                                </span>
                              )}
                            </td>

                            {/* ACTIONS ADMINISTRATIVES */}

                            <td className="px-4 py-3">
                              <div className="flex flex-col items-stretch gap-2 min-w-36">
                                <button
                                  type="button"
                                  onClick={() => handleDownloadPdf(doc)}
                                  disabled={
                                    !doc.id ||
                                    doc.pdf_status !== "available" ||
                                    actionInProgress !== null
                                  }
                                  title="Télécharger le PDF personnalisé"
                                  className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  {actionBusy ? "Traitement..." : "Télécharger PDF"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRevokeAccess(doc)}
                                  disabled={
                                    !doc.id ||
                                    !doc.is_activated ||
                                    actionInProgress !== null
                                  }
                                  title="Désactiver l'accès sans supprimer le PDF"
                                  className="px-3 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  Révoquer l'accès
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteActivation(doc)}
                                  disabled={
                                    !doc.id ||
                                    actionInProgress !== null
                                  }
                                  title="Supprimer l'activation et son PDF personnalisé"
                                  className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  Supprimer
                                </button>
                              </div>
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

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">

          <button
            onClick={() =>
              navigate(
                "/admin/codes-activation"
              )
            }
            className="px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition"
          >
            🔑 Voir les codes d'activation
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

export default AdminDocuments;