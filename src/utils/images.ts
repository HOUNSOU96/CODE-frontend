// 📁 src/utils/images.ts
export const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function getImageUrl(path?: string, seed?: string, width = 800, height = 600) {
  if (!path) return fallbackImage(seed, width, height);
  if (path.startsWith("http")) return path;

  // 🔧 supprime le slash en double
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${apiBase}/${cleanPath}`;
}

export function fallbackImage(seed?: string, width = 800, height = 600) {
  const s = encodeURIComponent(seed || "moravi");
  return `https://picsum.photos/seed/${s}/${width}/${height}`;
}
