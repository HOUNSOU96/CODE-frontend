
import React, {
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  ShieldCheck,
  RefreshCw,
  LockKeyhole,
  FileText,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://code-backend-iuol.onrender.com";

const DEVICE_ID_KEY =
  "CODE_DEVICE_ID";

/**
 * Récupère l'identifiant persistant
 * de l'appareil.
 *
 * IMPORTANT :
 * Cet identifiant n'est pas une preuve
 * d'autorisation.
 *
 * Le backend vérifie toujours que
 * cet appareil possède réellement
 * l'accès au document demandé.
 */
function getDeviceId(): string {
  let deviceId =
    localStorage.getItem(
      DEVICE_ID_KEY
    );

  if (!deviceId) {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID ===
        "function"
    ) {
      deviceId =
        crypto.randomUUID();
    } else {
      deviceId =
        `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}-${Math.random()
          .toString(36)
          .substring(2)}`;
    }

    localStorage.setItem(
      DEVICE_ID_KEY,
      deviceId
    );
  }

  return deviceId;
}

const SecureDocument: React.FC =
  () => {
    const navigate = useNavigate();

    const { documentId } =
      useParams<{
        documentId: string;
      }>();

    const [pdfUrl, setPdfUrl] =
      useState<string | null>(
        null
      );

    const [loading, setLoading] =
      useState(true);

    const [error, setError] =
      useState("");

    const [documentName, setDocumentName] =
      useState(
        "Document sécurisé"
      );

    /**
     * Chargement du PDF sécurisé.
     */
    useEffect(() => {
      let objectUrl: string | null =
        null;

      const loadDocument =
        async () => {
          try {
            setLoading(true);
            setError("");

            if (!documentId) {
              throw new Error(
                "Identifiant du document manquant."
              );
            }

            const deviceId =
              getDeviceId();

            const response =
              await fetch(
                `${API_URL}/api/secure-documents/${encodeURIComponent(
                  documentId
                )}`,
                {
                  method: "GET",
                  headers: {
                    "X-Device-ID":
                      deviceId,
                    Accept:
                      "application/pdf",
                  },
                  cache: "no-store",
                }
              );

            if (!response.ok) {
              let message =
                "Impossible d'ouvrir ce document.";

              const contentType =
                response.headers.get(
                  "content-type"
                ) || "";

              if (
                contentType.includes(
                  "application/json"
                )
              ) {
                try {
                  const data =
                    await response.json();

                  message =
                    data?.detail ||
                    data?.message ||
                    message;
                } catch {
                  // Message par défaut.
                }
              } else {
                try {
                  const text =
                    await response.text();

                  if (text) {
                    message = text;
                  }
                } catch {
                  // Message par défaut.
                }
              }

              if (
                response.status ===
                403
              ) {
                message =
                  "Cet appareil n'est pas autorisé à accéder à ce document.";
              } else if (
                response.status ===
                404
              ) {
                message =
                  "Ce document n'existe pas ou n'est plus disponible.";
              }

              throw new Error(
                message
              );
            }

            /*
             * Le backend renvoie directement
             * le PDF.
             */
            const blob =
              await response.blob();

            if (
              !blob ||
              blob.size === 0
            ) {
              throw new Error(
                "Le document PDF reçu est vide."
              );
            }

            objectUrl =
              URL.createObjectURL(
                blob
              );

            setPdfUrl(objectUrl);

            /*
             * Le nom peut être fourni
             * par le backend.
             */
            const filename =
              response.headers.get(
                "X-Document-Name"
              );

            if (filename) {
              setDocumentName(
                filename
              );
            }
          } catch (err) {
            console.error(
              "Erreur SecureDocument :",
              err
            );

            setError(
              err instanceof Error
                ? err.message
                : "Une erreur est survenue lors de l'ouverture du document."
            );
          } finally {
            setLoading(false);
          }
        };

      loadDocument();

      /*
       * Nettoyage du Blob URL.
       */
      return () => {
        if (objectUrl) {
          URL.revokeObjectURL(
            objectUrl
          );
        }
      };
    }, [documentId]);

    /**
     * Recharge la page complète.
     */
    const retry = () => {
      window.location.reload();
    };

    return (
      <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">

        {/* ==================================================
            EN-TÊTE
        ================================================== */}

        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl transition-colors duration-300 dark:border-slate-800/80 dark:bg-slate-950/95">

          <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

            {/* Retour */}
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/mes-documents"
                )
              }
              className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
              aria-label="Retour aux documents"
            >
              <ArrowLeft
                size={18}
                className="transition-transform group-hover:-translate-x-0.5"
              />

              <span className="hidden sm:inline">
                Mes documents
              </span>
            </button>

            {/* Titre */}
            <div className="min-w-0 flex-1 text-center">

              <div className="mx-auto flex max-w-xl items-center justify-center gap-2">

                <FileText
                  size={18}
                  className="hidden shrink-0 text-emerald-600 dark:text-emerald-400 sm:block"
                />

                <h1 className="truncate text-sm font-black text-slate-900 dark:text-white sm:text-base lg:text-lg">
                  {documentName}
                </h1>

              </div>

              <div className="mt-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 sm:text-xs">

                <ShieldCheck
                  size={14}
                />

                <span>
                  Document sécurisé
                </span>

              </div>
            </div>

            {/* Badge sécurité */}
            <div className="flex shrink-0 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-900/60 dark:bg-emerald-950/40">

              <LockKeyhole
                size={16}
                className="text-emerald-600 dark:text-emerald-400"
              />

              <span className="hidden text-xs font-bold text-emerald-700 dark:text-emerald-400 sm:inline">
                Protégé
              </span>

            </div>

          </div>
        </header>

        {/* ==================================================
            CONTENU
        ================================================== */}

        <main className="flex flex-1 flex-col">

          {/* ================================================
              CHARGEMENT
          ================================================= */}

          {loading && (
            <div className="flex flex-1 items-center justify-center px-4 py-12">

              <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">

                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-100 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/40">

                  <Loader2
                    size={36}
                    className="animate-spin text-emerald-600 dark:text-emerald-400"
                  />

                </div>

                <h2 className="mt-6 text-xl font-black text-slate-900 dark:text-white">
                  Ouverture du document
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Vérification de votre autorisation
                  et préparation du document sécurisé...
                </p>

                <div className="mx-auto mt-6 h-1.5 max-w-xs overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full w-1/2 animate-pulse rounded-full bg-emerald-500" />
                </div>

              </div>

            </div>
          )}

          {/* ================================================
              ERREUR
          ================================================= */}

          {!loading &&
            error && (
              <div className="flex flex-1 items-center justify-center px-4 py-12">

                <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-red-200 bg-white shadow-lg dark:border-red-900/60 dark:bg-slate-900">

                  <div className="border-b border-red-100 bg-red-50 px-6 py-6 dark:border-red-900/40 dark:bg-red-950/30">

                    <div className="flex flex-col items-center text-center">

                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">

                        <AlertCircle
                          size={32}
                        />

                      </div>

                      <h2 className="mt-5 text-xl font-black text-red-900 dark:text-red-300">
                        Document inaccessible
                      </h2>

                      <p className="mt-3 text-sm leading-6 text-red-700 dark:text-red-400">
                        {error}
                      </p>

                    </div>

                  </div>

                  <div className="p-6 sm:p-7">

                    <div className="mb-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-400">
                        <ShieldCheck
                          size={17}
                        />
                      </div>

                      <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                        L'accès au document est vérifié
                        par le serveur CODE pour cet
                        appareil.
                      </p>

                    </div>

                    <div className="flex w-full flex-col gap-3 sm:flex-row">

                      <button
                        type="button"
                        onClick={
                          retry
                        }
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-600/15 transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:focus:ring-offset-slate-900"
                      >
                        <RefreshCw
                          size={17}
                        />

                        Réessayer
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            "/mes-documents"
                          )
                        }
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-600"
                      >
                        <ChevronLeft
                          size={17}
                        />

                        Mes documents
                      </button>

                    </div>

                  </div>

                </div>

              </div>
            )}

          {/* ================================================
              LECTEUR PDF
          ================================================= */}

          {!loading &&
            !error &&
            pdfUrl && (
              <div className="flex flex-1 flex-col">

                {/* Barre d'information du lecteur */}
                <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

                  <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">

                    <div className="flex min-w-0 items-center gap-2">

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                        <CheckCircle2
                          size={16}
                        />
                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-xs font-bold text-slate-700 dark:text-slate-200">
                          Accès autorisé
                        </p>

                        <p className="hidden truncate text-[10px] text-slate-400 dark:text-slate-500 sm:block">
                          Ce document est associé à cet appareil.
                        </p>

                      </div>

                    </div>

                    <div className="flex shrink-0 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 dark:border-emerald-900/60 dark:bg-emerald-950/40">

                      <ShieldCheck
                        size={13}
                        className="text-emerald-600 dark:text-emerald-400"
                      />

                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 sm:text-xs">
                        Sécurisé
                      </span>

                    </div>

                  </div>

                </div>

                {/* Lecteur */}
                <div className="flex-1 p-2 sm:p-4 lg:p-5">

                  <div className="mx-auto h-[calc(100vh-155px)] min-h-[600px] max-w-7xl overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-xl shadow-slate-300/20 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">

                    <iframe
                      src={pdfUrl}
                      title={
                        documentName
                      }
                      className="h-full w-full"
                      style={{
                        border: "none",
                      }}
                    />

                  </div>

                </div>

              </div>
            )}

        </main>

        {/* ==================================================
            PIED DE PAGE
        ================================================== */}

        {!loading &&
          !pdfUrl &&
          !error && (
            <footer className="border-t border-slate-200 bg-white py-5 dark:border-slate-800 dark:bg-slate-950">

              <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 text-xs text-slate-500 dark:text-slate-400">

                <LockKeyhole
                  size={13}
                  className="text-emerald-600 dark:text-emerald-400"
                />

                Document protégé par le système
                sécurisé de CODE.

              </div>

            </footer>
          )}

      </div>
    );
  };

export default SecureDocument;

