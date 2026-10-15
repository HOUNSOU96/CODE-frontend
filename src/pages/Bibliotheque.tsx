import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Download,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import api from "@/utils/axios";

interface DocumentVersion {
  id: number;
  document_name: string;
  version_code: number;
  version_label: string;
  title: string;
  description: string;
  published_at: string | null;
  allow_download: boolean;
}

type ActivationIntent = "read" | "download";

const getDocumentDomain = (document: DocumentVersion): string => {
  const name = `${document.document_name} ${document.title}`.toLowerCase();

  if (
    name.includes("math") ||
    name.includes("algèbre") ||
    name.includes("algebre") ||
    name.includes("géométrie") ||
    name.includes("geometrie")
  ) {
    return "Mathématiques";
  }

  if (
    name.includes("physique") ||
    name.includes("chimie") ||
    name.includes("biologie") ||
    name.includes("svt")
  ) {
    return "Sciences";
  }

  if (
    name.includes("français") ||
    name.includes("francais") ||
    name.includes("anglais") ||
    name.includes("littérature") ||
    name.includes("litterature")
  ) {
    return "Langues et littérature";
  }

  if (
    name.includes("informatique") ||
    name.includes("programmation") ||
    name.includes("numérique") ||
    name.includes("numerique") ||
    name.includes("technologie")
  ) {
    return "Informatique et technologies";
  }

  return "Autres ressources";
};

const Bibliotheque: React.FC = () => {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDocuments = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/document-versions/catalog");
      const publications: DocumentVersion[] = response.data.documents ?? [];

      setDocuments(
        publications.map((document) => ({
          ...document,
          allow_download: document.allow_download === true,
        }))
      );
    } catch (err) {
      console.error("Erreur de chargement de la bibliothèque :", err);
      setError(
        "Impossible de charger les publications pour le moment. Vérifie ta connexion puis réessaie."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDocuments();
  }, []);

  const openActivation = (
    document: DocumentVersion,
    intent: ActivationIntent
  ) => {
    navigate("/activation", {
      state: {
        documentName: document.document_name,
        versionId: document.id,
        intent,
      },
    });
  };

  const formatDate = (date: string | null) => {
    if (!date) return "";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "";

    return parsedDate.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const groupedDocuments = documents.reduce<
    Record<string, DocumentVersion[]>
  >((groups, document) => {
    const domain = getDocumentDomain(document);

    if (!groups[domain]) {
      groups[domain] = [];
    }

    groups[domain].push(document);

    return groups;
  }, {});

  const domainOrder = [
    "Mathématiques",
    "Sciences",
    "Langues et littérature",
    "Informatique et technologies",
    "Autres ressources",
  ];

  const orderedDomains = Object.keys(groupedDocuments).sort(
    (a, b) => domainOrder.indexOf(a) - domainOrder.indexOf(b)
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
            <BookOpen size={34} aria-hidden="true" />
          </div>

          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-700">
            CODE — L’écosystème éducatif mondial
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Bibliothèque CODE
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Découvrez les ouvrages et ressources publiés sur CODE,
            classés par domaine. L’accès aux documents nécessite une
            activation préalable.
          </p>
        </header>

        {loading && (
          <div className="py-12 text-center text-slate-600" role="status">
            Chargement des publications…
          </div>
        )}

        {!loading && error && (
          <div
            className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-white p-6 text-center"
            role="alert"
          >
            <p className="text-red-700">{error}</p>

            <button
              type="button"
              onClick={() => void loadDocuments()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <RefreshCw size={16} aria-hidden="true" />
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && documents.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            Aucune publication n’est disponible pour le moment.
          </div>
        )}

        {!loading && !error && documents.length > 0 && (
          <div className="space-y-12">
            {orderedDomains.map((domain) => (
              <section key={domain} aria-label={domain}>
                <div className="mb-5 border-b border-slate-200 pb-3">
                  <h2 className="text-xl font-bold text-slate-900">
                    {domain}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {groupedDocuments[domain].length} publication
                    {groupedDocuments[domain].length > 1 ? "s" : ""}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {groupedDocuments[domain].map((document) => (
                    <article
                      key={document.id}
                      className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="flex items-center justify-center overflow-hidden bg-slate-100 p-4 dark:bg-slate-800">
                        <img
                          src="/images/code-mathsI-preview.jpg"
                          alt={`Première page de ${document.title || document.document_name}`}
                          loading="lazy"
                          decoding="async"
                          className="h-72 w-full max-w-xs rounded-lg object-contain shadow-md"
                        />
                      </div>

                      <div className="flex flex-1 flex-col p-6">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                            Édition {document.version_label}
                          </span>

                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                            <ShieldCheck size={13} aria-hidden="true" />
                            Activation requise
                          </span>
                        </div>

                        <p className="flex-1 whitespace-pre-line text-sm leading-6 text-slate-600">
                          {document.description ||
                            "Consultez les informations de cette publication et activez votre accès."}
                        </p>

                        {document.published_at && (
                          <p className="mt-4 text-xs text-slate-500">
                            Publié le {formatDate(document.published_at)}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={() => openActivation(document, "read")}
                          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <BookOpen size={18} aria-hidden="true" />
                          Lire le manuel
                        </button>

                        {document.allow_download && (
                          <button
                            type="button"
                            onClick={() => openActivation(document, "download")}
                            className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-3 text-center font-semibold text-blue-800 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            <Download size={18} aria-hidden="true" />
                            Télécharger
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
          CODE — Diagnostiquer. Apprendre. Progresser.
        </footer>
      </div>
    </main>
  );
};

export default Bibliotheque;
