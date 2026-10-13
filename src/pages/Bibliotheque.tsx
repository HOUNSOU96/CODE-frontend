import React, { useEffect, useState } from "react";
import { BookOpen, ExternalLink, RefreshCw } from "lucide-react";
import api from "@/utils/axios";

interface DocumentVersion {
  id: number;
  document_name: string;
  version_code: number;
  version_label: string;
  title: string;
  description: string;
  published_at: string | null;
}

const Bibliotheque: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDocuments = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/document-versions/catalog");
      setDocuments(response.data.documents ?? []);
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
            Retrouvez les ouvrages et ressources publiés sur CODE.
            Consultez les versions disponibles directement dans votre navigateur.
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
              <RefreshCw size={16} />
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
          <section
            aria-label="Publications disponibles"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {documents.map((document) => {
              const originalUrl =
                `${api.defaults.baseURL}/api/document-versions/` +
                `${document.id}/original`;

              return (
                <article
                  key={document.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex min-h-44 items-center justify-center bg-gradient-to-br from-blue-900 to-slate-800 p-6 text-center text-white">
                    <div>
                      <BookOpen
                        className="mx-auto mb-3"
                        size={42}
                        aria-hidden="true"
                      />
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
                        Publication CODE
                      </p>
                      <h2 className="mt-2 text-xl font-bold">
                        {document.title || document.document_name}
                      </h2>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                        Édition {document.version_label}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                        Lecture en ligne
                      </span>
                    </div>

                    <p className="flex-1 whitespace-pre-line text-sm leading-6 text-slate-600">
                      {document.description ||
                        "Consultez cette publication directement dans votre navigateur."}
                    </p>

                    {document.published_at && (
                      <p className="mt-4 text-xs text-slate-500">
                        Publié le {formatDate(document.published_at)}
                      </p>
                    )}

                    <a
                      href={originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <BookOpen size={18} aria-hidden="true" />
                      Lire le manuel
                      <ExternalLink size={16} aria-hidden="true" />
                    </a>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
          CODE — Diagnostiquer. Apprendre. Progresser.
        </footer>
      </div>
    </main>
  );
};

export default Bibliotheque;
