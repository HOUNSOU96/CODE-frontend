
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Download,
  FileText,
  Loader2,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  LockKeyhole,
  Sparkles,
  Smartphone,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://code-backend-iuol.onrender.com";

interface SecureDocument {
  id?: number | string;
  document_id?: number | string;
  document_name?: string;
  name?: string;
  title?: string;
  authorized?: boolean;
  access_id?: number | string;
  activation_code?: string;
}

const DEVICE_ID_KEY = "CODE_DEVICE_ID";

/**
 * Récupère l'identifiant persistant de l'appareil.
 *
 * IMPORTANT :
 * Le device_id ne constitue pas à lui seul une preuve d'autorisation.
 * Le backend doit toujours vérifier l'autorisation correspondante.
 */
function getDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      deviceId = crypto.randomUUID();
    } else {
      deviceId =
        `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}-${Math.random()
          .toString(36)
          .substring(2)}`;
    }

    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}

const MesDocuments: React.FC = () => {
  const navigate = useNavigate();

  const [documents, setDocuments] =
    useState<SecureDocument[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [deviceId, setDeviceId] =
    useState("");

  useEffect(() => {
    const id = getDeviceId();

    setDeviceId(id);

    const loadDocuments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/my-secure-documents`,
          {
            method: "GET",
            headers: {
              "X-Device-ID": id,
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            setDocuments([]);
            return;
          }

          const text =
            await response.text();

          let message =
            "Impossible de récupérer les documents.";

          try {
            const data =
              JSON.parse(text);

            message =
              data?.detail ||
              data?.message ||
              message;
          } catch {
            // Réponse non JSON :
            // on conserve le message par défaut.
          }

          throw new Error(message);
        }

        const data =
          await response.json();

        /*
         * Le backend peut retourner directement :
         *
         * [
         *   {...},
         *   {...}
         * ]
         *
         * ou :
         *
         * {
         *   documents: [...]
         * }
         */

        const receivedDocuments =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.documents)
            ? data.documents
            : [];

        const authorizedDocuments =
          receivedDocuments.filter(
            (document: SecureDocument) =>
              document.authorized !== false
          );

        setDocuments(
          authorizedDocuments
        );
      } catch (err) {
        console.error(
          "Erreur MesDocuments :",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Une erreur est survenue lors de la récupération des documents."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  /**
   * Ouvre le document sécurisé.
   *
   * Le PDF lui-même n'est pas chargé ici.
   * SecureDocument.tsx demandera le fichier au backend
   * avec le même X-Device-ID.
   */
  const openDocument = (
    document: SecureDocument
  ) => {
    const documentId =
      document.document_id ??
      document.id;

    if (
      documentId === undefined ||
      documentId === null ||
      String(documentId).trim() === ""
    ) {
      setError(
        "Impossible d'identifier ce document."
      );
      return;
    }

    navigate(
      `/secure-document/${encodeURIComponent(
        String(documentId)
      )}`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">

      {/* ======================================================
          EN-TÊTE
      ====================================================== */}

      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl transition-colors duration-300 dark:border-slate-800/80 dark:bg-slate-950/90">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
            aria-label="Retour"
          >
            <ArrowLeft
              size={18}
              className="transition-transform group-hover:-translate-x-0.5"
            />

            <span className="hidden sm:inline">
              Retour
            </span>
          </button>

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-sm dark:bg-emerald-950/60 dark:text-emerald-400">
              <BookOpen size={21} />
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                CODE
              </p>

              <h1 className="text-base font-bold text-slate-900 dark:text-white">
                Mes documents
              </h1>
            </div>

          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
            <LockKeyhole
              size={16}
              className="text-emerald-600 dark:text-emerald-400"
            />

            <span className="hidden text-xs font-semibold text-slate-600 dark:text-slate-300 sm:inline">
              Accès sécurisé
            </span>
          </div>

        </div>
      </header>

      {/* ======================================================
          CONTENU PRINCIPAL
      ====================================================== */}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

        {/* ==================================================
            HERO
        ================================================== */}

        <section className="relative mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-100/70 blur-3xl dark:bg-emerald-950/30" />

          <div className="absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-sky-100/60 blur-3xl dark:bg-sky-950/20" />

          <div className="relative p-6 sm:p-8 lg:p-10">

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div className="max-w-3xl">

                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <Sparkles size={14} />
                  Bibliothèque personnelle
                </div>

                <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                  Vos documents,
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {" "}toujours à portée de main.
                  </span>
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                  Retrouvez les documents numériques que vous
                  avez déjà activés sur cet appareil. Votre
                  compte CODE n'est pas nécessaire pour
                  consulter cette bibliothèque.
                </p>

              </div>

              <div className="hidden shrink-0 md:flex">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-emerald-200 bg-emerald-50 shadow-inner dark:border-emerald-900/60 dark:bg-emerald-950/40">
                  <LockKeyhole
                    size={42}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                </div>
              </div>

            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Accès sécurisé
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    Vérifié par CODE
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400">
                  <Smartphone size={18} />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Cet appareil
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    Autorisations associées
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400">
                  <FileText size={18} />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Vos ressources
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    Documents autorisés
                  </p>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ==================================================
            CHARGEMENT
        ================================================== */}

        {loading && (
          <section className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50">

              <Loader2
                size={30}
                className="animate-spin text-emerald-600 dark:text-emerald-400"
              />

            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
              Vérification de votre bibliothèque
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              Nous vérifions les documents autorisés
              pour cet appareil...
            </p>

          </section>
        )}

        {/* ==================================================
            ERREUR
        ================================================== */}

        {!loading && error && (
          <section className="overflow-hidden rounded-3xl border border-red-200 bg-white shadow-sm dark:border-red-900/60 dark:bg-slate-900">

            <div className="border-b border-red-100 bg-red-50 px-6 py-5 dark:border-red-900/40 dark:bg-red-950/30">
              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                  <AlertCircle size={22} />
                </div>

                <div>
                  <h3 className="font-bold text-red-900 dark:text-red-300">
                    Impossible d'accéder à votre bibliothèque
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-400">
                    {error}
                  </p>
                </div>

              </div>
            </div>

            <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Vérifiez votre connexion puis réessayez.
              </p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                <RefreshCw size={17} />
                Réessayer
              </button>

            </div>

          </section>
        )}

        {/* ==================================================
            AUCUN DOCUMENT
        ================================================== */}

        {!loading &&
          !error &&
          documents.length === 0 && (
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <div className="px-6 py-12 text-center sm:px-10">

                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 shadow-inner dark:border-slate-700 dark:bg-slate-950">
                  <FileText
                    size={34}
                    className="text-slate-400 dark:text-slate-500"
                  />
                </div>

                <div className="mx-auto mt-6 max-w-xl">

                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    Bibliothèque vide
                  </div>

                  <h3 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">
                    Aucun document disponible
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    Aucun document sécurisé n'est actuellement
                    associé à cet appareil. Vous pouvez activer
                    un nouveau document pour l'ajouter à votre
                    bibliothèque personnelle.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/activation")
                    }
                    className="group mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/25 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:focus:ring-offset-slate-900"
                  >
                    <Download size={18} />

                    Activer un document

                    <ChevronRight
                      size={17}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </button>

                </div>

              </div>

              <div className="border-t border-slate-200 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/50">

                <div className="flex flex-col items-center justify-center gap-2 text-center text-xs text-slate-500 dark:text-slate-400 sm:flex-row">
                  <LockKeyhole
                    size={14}
                    className="text-emerald-600 dark:text-emerald-400"
                  />

                  <span>
                    Les documents sont protégés par le système
                    d'autorisation de CODE.
                  </span>
                </div>

              </div>

            </section>
          )}

        {/* ==================================================
            DOCUMENTS AUTORISÉS
        ================================================== */}

        {!loading &&
          !error &&
          documents.length > 0 && (
            <section>

              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />

                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Bibliothèque active
                    </span>
                  </div>

                  <h3 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                    Vos documents
                  </h3>
                </div>

                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  <FileText
                    size={15}
                    className="text-emerald-600 dark:text-emerald-400"
                  />

                  {documents.length}{" "}
                  {documents.length > 1
                    ? "documents"
                    : "document"}
                </div>

              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                {documents.map(
                  (document, index) => {
                    const documentId =
                      document.document_id ??
                      document.id ??
                      index;

                    const documentName =
                      document.document_name ??
                      document.name ??
                      document.title ??
                      "Document sécurisé";

                    return (
                      <article
                        key={String(
                          documentId
                        )}
                        className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-900/70 dark:hover:shadow-black/20"
                      >

                        {/* Bande supérieure */}
                        <div className="h-1.5 bg-emerald-600 dark:bg-emerald-500" />

                        <div className="p-5 sm:p-6">

                          <div className="flex items-start justify-between gap-4">

                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-400">
                              <FileText size={27} />
                            </div>

                            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
                              <ShieldCheck size={13} />
                              Autorisé
                            </div>

                          </div>

                          <div className="mt-5">

                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                              Document CODE
                            </p>

                            <h4 className="mt-2 min-h-[52px] break-words text-lg font-black leading-7 text-slate-900 dark:text-white">
                              {documentName}
                            </h4>

                          </div>

                          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-950/70">

                            <div className="flex items-center gap-2.5">

                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400">
                                <LockKeyhole size={15} />
                              </div>

                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                  Accès sécurisé
                                </p>

                                <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
                                  Autorisation liée à cet appareil
                                </p>
                              </div>

                            </div>

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              openDocument(
                                document
                              )
                            }
                            className="group/button mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-600/15 transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:focus:ring-offset-slate-900"
                          >
                            <BookOpen
                              size={18}
                            />

                            <span>
                              Ouvrir le document
                            </span>

                            <ChevronRight
                              size={17}
                              className="transition-transform group-hover/button:translate-x-0.5"
                            />
                          </button>

                        </div>
                      </article>
                    );
                  }
                )}

              </div>
            </section>
          )}

        {/* ==================================================
            INFORMATIONS DE SÉCURITÉ
        ================================================== */}

        {!loading && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <ShieldCheck size={19} />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Protection de vos documents
                  </h4>

                  <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400">
                    L'accès est vérifié par le serveur CODE
                    et associé à cet appareil. Votre
                    bibliothèque peut être consultée sans
                    connexion à votre compte CODE.
                  </p>
                </div>

              </div>

              <div className="shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-center dark:border-emerald-900/60 dark:bg-emerald-950/40">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Statut
                </p>

                <p className="mt-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Appareil reconnu
                </p>
              </div>

            </div>

          </section>
        )}

      </main>

      {/* ======================================================
          PIED DE PAGE
      ====================================================== */}

      <footer className="border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-950">

        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">

          <p className="text-xs text-slate-500 dark:text-slate-400">
            CODE — L'écosystème éducatif mondial
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <LockKeyhole size={13} />
            Documents sécurisés
          </div>

        </div>

      </footer>

    </div>
  );
};

export default MesDocuments;

