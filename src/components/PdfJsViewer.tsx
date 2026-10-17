import { useEffect, useRef, useState } from "react";
import {
  getDocument,
  GlobalWorkerOptions,
  type PDFDocumentProxy,
} from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface PdfJsViewerProps {
  fileUrl: string;
}

export default function PdfJsViewer({
  fileUrl,
}: PdfJsViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState("");

  // Charger le document PDF.
  useEffect(() => {
    let disposed = false;

    setLoading(true);
    setError("");
    setPdf(null);
    setPageNumber(1);
    setPageCount(0);

    const loadingTask = getDocument({ url: fileUrl });

    loadingTask.promise
      .then((document) => {
        if (disposed) {
          void document.destroy();
          return;
        }

        setPdf(document);
        setPageCount(document.numPages);
        setLoading(false);
      })
      .catch((reason: unknown) => {
        if (disposed) return;

        console.error("Erreur de chargement PDF.js :", reason);
        setError(
          "Le lecteur n'a pas réussi à charger le document PDF."
        );
        setLoading(false);
      });

    return () => {
      disposed = true;
      void loadingTask.destroy();
    };
  }, [fileUrl]);

  // Adapter la largeur du lecteur aux dimensions de l'écran.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => {
      setContainerWidth(container.clientWidth);
    };

    updateWidth();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateWidth);
      observer.observe(container);

      return () => observer.disconnect();
    }

    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  // Afficher uniquement la page sélectionnée.
  useEffect(() => {
    if (!pdf || !canvasRef.current || containerWidth <= 0) {
      return;
    }

    let cancelled = false;
    let renderTask:
      | ReturnType<
          Awaited<ReturnType<PDFDocumentProxy["getPage"]>>["render"]
        >
      | undefined;

    setRendering(true);
    setError("");

    pdf
      .getPage(pageNumber)
      .then((page) => {
        if (cancelled || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Impossible de créer le contexte du lecteur.");
        }

        const baseViewport = page.getViewport({ scale: 1 });
        const availableWidth = Math.max(240, containerWidth - 24);
        const fitScale = Math.min(
          availableWidth / baseViewport.width,
          1.5
        );
        const viewport = page.getViewport({
          scale: fitScale * zoom,
        });

        // Limiter la résolution interne pour maîtriser la mémoire.
        const pixelRatio = Math.min(
          window.devicePixelRatio || 1,
          2
        );

        canvas.width = Math.ceil(viewport.width * pixelRatio);
        canvas.height = Math.ceil(viewport.height * pixelRatio);
        canvas.style.width = `${Math.ceil(viewport.width)}px`;
        canvas.style.height = `${Math.ceil(viewport.height)}px`;

        renderTask = page.render({
          canvasContext: context,
          viewport,
          transform:
            pixelRatio === 1
              ? undefined
              : [
                  pixelRatio,
                  0,
                  0,
                  pixelRatio,
                  0,
                  0,
                ],
        });

        return renderTask.promise;
      })
      .catch((reason: unknown) => {
        const renderError = reason as { name?: string };

        if (
          !cancelled &&
          renderError?.name !== "RenderingCancelledException"
        ) {
          console.error("Erreur de rendu PDF.js :", reason);
          setError("Impossible d'afficher cette page du document.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setRendering(false);
        }
      });

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [pdf, pageNumber, zoom, containerWidth]);

  return (
    <div className="w-full">
      <div className="sticky top-0 z-20 mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={!pdf || pageNumber <= 1 || rendering}
            className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40 dark:border-slate-700"
          >
            Précédente
          </button>

          <span className="whitespace-nowrap text-sm font-medium">
            {pageCount ? `${pageNumber} / ${pageCount}` : "—"}
          </span>

          <button
            type="button"
            onClick={() =>
              setPageNumber((p) => Math.min(pageCount, p + 1))
            }
            disabled={!pdf || pageNumber >= pageCount || rendering}
            className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40 dark:border-slate-700"
          >
            Suivante
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
            disabled={zoom <= 0.7}
            aria-label="Réduire le zoom"
            className="rounded-lg border px-3 py-2 text-lg disabled:opacity-40 dark:border-slate-700"
          >
            −
          </button>

          <span className="min-w-12 text-center text-sm">
            {Math.round(zoom * 100)} %
          </span>

          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
            disabled={zoom >= 2.5}
            aria-label="Augmenter le zoom"
            className="rounded-lg border px-3 py-2 text-lg disabled:opacity-40 dark:border-slate-700"
          >
            +
          </button>
        </div>
      </div>

      {loading && (
        <p className="p-6 text-center text-sm text-slate-500">
          Chargement du document…
        </p>
      )}

      {rendering && !loading && (
        <p className="mb-2 text-center text-xs text-slate-500">
          Affichage de la page…
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="m-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full overflow-x-auto rounded-lg bg-slate-200 p-2 dark:bg-slate-950"
      >
        <div className="flex min-h-48 justify-center">
          <canvas
            ref={canvasRef}
            aria-label={`Page ${pageNumber} sur ${pageCount}`}
            className="h-auto max-w-none bg-white shadow-md"
          />
        </div>
      </div>
    </div>
  );
}
