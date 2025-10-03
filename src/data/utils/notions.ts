import axios from "axios";

// Types
export type Question = {
  id: string;
  question: string;
  niveau: string;
  serie?: string;
  notion: string;
  options: string[];
  duration?: number;
  situation?: { texte: string; image: string };
};

// Constantes
export const generalLevels = ['6e', '5e', '4e', '3e'] as const;
export const lyceeLevels = ['2nde', '1ere', 'Terminale'] as const;
export const series = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;

export const subSeriesMap: Record<string, string[]> = {
  A: ['A1', 'A2'],
  F: ['F1', 'F2', 'F3', 'F4'],
  G: ['G1', 'G2', 'G3'],
};

// Notions par niveau
export const notionsOrdreParNiveau: Record<string, string[]> = {
  "6e": ["Nombres entiers", "Additions", "Soustractions", "Multiplications", "Divisions", "Fractions", "Géométrie de base", "Mesures"],
  "5e": ["Arithmétique", "Fractions", "Proportionnalité", "Symétrie axiale", "Géométrie", "Périmètres et aires", "Volumes", "Angles"],
  "4e": ["Arithmétique", "Calcul littéral", "Équations", "Fonctions", "Géométrie", "Aires", "Volumes", "Proportionnalité", "Statistiques"],
  "3e": ["Arithmétique", "Divisibilité", "Calcul littéral", "Équations", "Fonctions", "Géométrie", "Aires", "Volumes", "Proportionnalité", "Statistiques", "Probabilités", "Théorèmes (Thalès, Pythagore)"],
  "2nde": ["Nombres et calculs", "Fonctions", "Statistiques", "Géométrie", "Équations et inéquations", "Vecteurs", "Produits scalaires"],
  "1ere": ["Fonctions (affine, carré, inverse, racine)", "Suites numériques", "Probabilités", "Statistiques", "Trigonométrie", "Dérivation", "Géométrie analytique"],
  "Terminale": ["Fonctions (logarithmes, exponentielles)", "Limites et continuité", "Dérivées et variations", "Suites", "Probabilités conditionnelles", "Loi binomiale et loi normale", "Géométrie dans l'espace", "Calcul intégral"],
};

// Trier les notions non acquises dans l’ordre du programme
export function trierNotionsNonAcquises(notionsNonAcquises: string[], niveau: string): string[] {
  const ordre = notionsOrdreParNiveau[niveau] || [];
  return [...notionsNonAcquises].sort((a, b) => {
    const indexA = ordre.indexOf(a);
    const indexB = ordre.indexOf(b);
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}

// Appréciation en fonction de la note
export function appreciation(note: number): string {
  if (note >= 18) return "Excellent travail, continue comme ça !";
  if (note >= 16) return "Très Bien, bravo !";
  if (note >= 14) return "Bon travail, tu progresses bien.";
  if (note >= 12) return "Assez bien, mais tu peux faire mieux.";
  if (note >= 10) return "Passable, il faut un peu plus d’efforts.";
  if (note >= 7)  return "Insuffisant, il faut revoir les notions importantes.";
  return "Très insuffisant, il faut beaucoup travailler.";
}

// Fonction utilitaire pour choisir aléatoirement n éléments dans un tableau
export function choisirAleatoire<T>(arr: T[], n: number): T[] {
  const copie = [...arr];
  const result: T[] = [];
  for (let i = 0; i < n && copie.length > 0; i++) {
    const index = Math.floor(Math.random() * copie.length);
    result.push(copie.splice(index, 1)[0]);
  }
  return result;
}

// --- 🔗 Appel à l'API backend pour obtenir les questions ---

const API_BASE = "http://localhost:8000/api"; // ajuste si besoin

/**
 * Récupère les questions d'un niveau et de notions depuis le backend (sans bonne réponse)
 */
export async function getQuestions(niveau: string, notions: string[], page = 1, pageSize = 5): Promise<{
  total: number;
  page: number;
  pageSize: number;
  questions: Question[];
}> {
  const response = await axios.get(`${API_BASE}/questions`, {
    params: {
      niveau,
      notions: notions.join(","),
      page,
      pageSize,
    },
  });

  return response.data;
}
// Récupération de résultats simulés depuis le backend
export async function getFakeResultats(niveau: string, serie?: string): Promise<{
  note: number;
  mention: string;
  notionsNonAcquises: string[];
}> {
  const response = await axios.get("http://localhost:8000/api/fake-resultats", {
    params: {
      niveau,
      serie,
    },
  });

  return response.data;
}
