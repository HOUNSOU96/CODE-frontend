// 📁 buildRemediationPath.ts
import { VideoData } from "@/types/progression";
import remediationVideosRaw from "../backend/data/remediationVideos.json";

// ⚡️ On force le type du JSON
const remediationVideos: VideoData[] = remediationVideosRaw as VideoData[];

const niveauxOrdres = ["6e", "5e", "4e", "3e", "2nde", "1ere", "Tle"];

/**
 * Construit le parcours de remédiation pour un apprenant
 * @param classeFinale Classe finale de l'apprenant (ex: "3e")
 * @param serieFinale Série finale de l'apprenant (ex: "G2")
 * @param notionsNonAcquises Liste des notions non acquises
 * @returns Tableau d'objets { notion, videos } pour le parcours
 */
export function buildRemediationPath(
  classeFinale: string,
  serieFinale: string,
  notionsNonAcquises: string[]
) {
  const indexFin = niveauxOrdres.indexOf(classeFinale);
  const niveauxJusquALaClasse = niveauxOrdres.slice(0, indexFin + 1);

  return notionsNonAcquises.map((notion) => {
    const videos = remediationVideos.filter((video) => {
      // ✅ Vérifie que la vidéo contient la notion
      const notionMatch = video.notions.includes(notion);

      // ✅ Vérifie que la vidéo est dans les niveaux jusqu'à la classe finale
      const niveauMatch = niveauxJusquALaClasse.includes(video.niveau);

      // ✅ Séries facultatives : si elles n'existent pas (collège), on considère un match
      const serieMatch =
        video.niveau === "1ere" || video.niveau === "Tle"
          ? video.serie === serieFinale
          : true;

      return notionMatch && niveauMatch && serieMatch;
    });

    return {
      notion,
      videos,
    };
  });
}
