// RemediationFlowWrapper.tsx

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import * as RemediationFlowModule from "@/components/Remediation/RemediationFlow";
import { useProgression } from "@/context/ProgressionContext";
import { saveProgression } from "@/utils/progressionStorage";
import { useAuth } from "../../../../hooks/useAuth";
import {
  genererParcoursRemediation,
  ClasseSerie,
} from "@/utils/parcoursUtils";

// 🔹 Stockage hors connexion CODE
import {
  getOfflineData,
  saveOfflineData,
  STORES,
} from "@/offline/offlineDB";

const RemediationFlow =
  RemediationFlowModule.default || RemediationFlowModule;

type CachedRemediationVideos = {
  id: string;
  type: "remediation_videos";
  notion: string;
  classe: string;
  serie: string;
  chemin: string;
  videos: any[];
  cachedAt: number;
};

const RemediationFlowWrapper = () => {
  const { loading } = useAuth();
  const location = useLocation();

  const state = location.state as {
    currentNotion?: string;
    remainingNotions?: string[];
    classeActuelle?: string;
    serieActuelle?: string;
    nouvelleProgression?: any;
  };

  const currentNotion = state?.currentNotion;

  // On force remainingNotions à tableau vide si absent,
  // pour compatibilité avec les Props de RemediationFlow.
  const remainingNotions = state?.remainingNotions ?? [];

  const classeActuelle = state?.classeActuelle;
  const serieActuelle = state?.serieActuelle;
  const nouvelleProgression = state?.nouvelleProgression;

  const { setProgression } = useProgression();

  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔹 Permet d'indiquer clairement si les données utilisées
  // proviennent du cache hors connexion.
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== "undefined"
      ? !navigator.onLine
      : false
  );

  const parcoursRemediation: ClasseSerie[] | null =
    classeActuelle && serieActuelle
      ? genererParcoursRemediation(
          `${classeActuelle} ${serieActuelle}`
        )
      : null;

  /**
   * ============================================================
   * 🌐 SURVEILLANCE DE LA CONNEXION
   * ============================================================
   */
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
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

  /**
   * ============================================================
   * 📈 SAUVEGARDE DE LA PROGRESSION
   * ============================================================
   */
  useEffect(() => {
    if (nouvelleProgression) {
      setProgression(nouvelleProgression);
      saveProgression(nouvelleProgression);
    }
  }, [nouvelleProgression, setProgression]);

  /**
   * ============================================================
   * 📺 CHARGEMENT DES VIDÉOS DE REMÉDIATION
   *
   * Stratégie :
   *
   * 1. Si hors connexion :
   *    → chercher d'abord dans IndexedDB.
   *
   * 2. Si connecté :
   *    → charger les modules normalement.
   *
   * 3. Après un chargement réussi :
   *    → sauvegarder les vidéos dans IndexedDB.
   *
   * 4. Si le chargement normal échoue :
   *    → utiliser automatiquement IndexedDB.
   *
   * Cela permet à CODE de conserver les données de remédiation
   * déjà consultées par l'apprenant.
   * ============================================================
   */
  useEffect(() => {
    let cancelled = false;

    const loadAllRemediationVideos = async () => {
      setIsLoading(true);

      if (!parcoursRemediation || !currentNotion) {
        console.error("❌ Paramètres manquants :", {
          parcoursRemediation,
          currentNotion,
        });

        if (!cancelled) {
          setAllVideos([]);
          setIsLoading(false);
        }

        return;
      }

      const allData: any[] = [];

      const notion = currentNotion
        .toLowerCase()
        .trim();

      /**
       * ----------------------------------------------------------
       * Fonction utilitaire :
       * récupérer les vidéos depuis IndexedDB
       * ----------------------------------------------------------
       */
      const getCachedVideos = async (
        classe: string,
        serieFinale: string,
        chemin: string
      ): Promise<any[]> => {
        try {
          const cacheId =
            `remediation_${classe}_${serieFinale}_${notion}`
              .toLowerCase()
              .replace(/\s+/g, "_");

          const cached =
            await getOfflineData<CachedRemediationVideos>(
              STORES.documents,
              cacheId
            );

          if (
            cached &&
            Array.isArray(cached.videos)
          ) {
            console.info(
              `📦 Vidéos de remédiation récupérées depuis le cache : ${cacheId}`
            );

            return cached.videos;
          }
        } catch (error) {
          console.warn(
            "⚠️ Impossible de lire le cache IndexedDB :",
            error
          );
        }

        return [];
      };

      /**
       * ----------------------------------------------------------
       * Fonction utilitaire :
       * sauvegarder les vidéos dans IndexedDB
       * ----------------------------------------------------------
       */
      const cacheVideos = async (
        classe: string,
        serieFinale: string,
        chemin: string,
        videos: any[]
      ) => {
        try {
          const cacheId =
            `remediation_${classe}_${serieFinale}_${notion}`
              .toLowerCase()
              .replace(/\s+/g, "_");

          const cacheData: CachedRemediationVideos = {
            id: cacheId,
            type: "remediation_videos",
            notion,
            classe,
            serie: serieFinale,
            chemin,
            videos,
            cachedAt: Date.now(),
          };

          await saveOfflineData(
            STORES.documents,
            cacheData
          );

          console.info(
            `💾 Vidéos de remédiation mises en cache : ${cacheId}`
          );
        } catch (error) {
          // Le cache ne doit jamais empêcher CODE
          // d'afficher les vidéos.
          console.warn(
            "⚠️ Impossible de sauvegarder les vidéos dans IndexedDB :",
            error
          );
        }
      };

      /**
       * ----------------------------------------------------------
       * Chargement de chaque niveau / série
       * ----------------------------------------------------------
       */
      for (const {
        classe,
        serie,
      } of parcoursRemediation) {
        if (cancelled) {
          return;
        }

        const niveauNettoye = classe
          .toLowerCase()
          .replace("è", "e");

        const serieFinale: string =
  ["6e", "5e", "4e", "3e"].includes(classe)
    ? "Général"
    : serie || serieActuelle || "Général";

        const chemin =
          `/src/data/Maths/Remediation/` +
          `${niveauNettoye}/${serieFinale}/${notion}`;

        /**
         * ========================================================
         * 🔌 MODE HORS CONNEXION
         *
         * On tente d'abord IndexedDB.
         * ========================================================
         */
        if (
          typeof navigator !== "undefined" &&
          !navigator.onLine
        ) {
          const cachedVideos =
            await getCachedVideos(
              classe,
              serieFinale,
              chemin
            );

          if (cachedVideos.length > 0) {
            allData.push(...cachedVideos);
            continue;
          }
        }

        /**
         * ========================================================
         * 🌐 CHARGEMENT NORMAL DU MODULE
         * ========================================================
         */
        try {
          const module = await import(
            /* @vite-ignore */
            chemin
          );

          const videos = module?.default;

          if (Array.isArray(videos)) {
            const enrichies = videos.map(
              (video: any) => ({
                ...video,
                niveau: classe,
                serie: serieFinale,
              })
            );

            allData.push(...enrichies);

            /**
             * 💾 On sauvegarde la version enrichie
             * dans IndexedDB pour les prochaines utilisations.
             */
            await cacheVideos(
              classe,
              serieFinale,
              chemin,
              enrichies
            );
          } else {
            console.warn(
              `⚠️ Le module ${chemin} ne contient pas un tableau.`
            );
          }
        } catch (err) {
          console.warn(
            `⚠️ Impossible de charger ${classe} (${serieFinale}) - ${notion}`,
            err
          );

          /**
           * ======================================================
           * 🔄 FALLBACK INDEXEDDB
           *
           * Même connecté, si le chargement du module échoue,
           * on tente le cache local.
           * ======================================================
           */
          const cachedVideos =
            await getCachedVideos(
              classe,
              serieFinale,
              chemin
            );

          if (cachedVideos.length > 0) {
            allData.push(...cachedVideos);
          }
        }
      }

      if (cancelled) {
        return;
      }

      /**
       * Suppression éventuelle des doublons.
       *
       * On utilise l'id de la vidéo lorsqu'il existe.
       * Si aucune id n'existe, on conserve la vidéo.
       */
      const videosUniques: any[] = [];
      const idsVus = new Set<string>();

      for (const video of allData) {
        if (video?.id !== undefined && video?.id !== null) {
          const id = String(video.id);

          if (idsVus.has(id)) {
            continue;
          }

          idsVus.add(id);
        }

        videosUniques.push(video);
      }

      setAllVideos(videosUniques);
      setIsLoading(false);
    };

    if (
      currentNotion &&
      parcoursRemediation
    ) {
      loadAllRemediationVideos();
    } else {
      setIsLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [
    currentNotion,
    parcoursRemediation,
    serieActuelle,
  ]);

  /**
   * ============================================================
   * 🔐 CHARGEMENT UTILISATEUR
   * ============================================================
   */
  if (loading) {
    return (
      <div className="p-6 text-center">
        🔐 Chargement utilisateur...
      </div>
    );
  }

  /**
   * ============================================================
   * ❌ REMEDIATIONFLOW INDISPONIBLE
   * ============================================================
   */
  if (!RemediationFlow) {
    return (
      <div className="text-red-500 p-6">
        ❌ Composant RemediationFlow non disponible.
      </div>
    );
  }

  /**
   * ============================================================
   * 📺 CHARGEMENT
   * ============================================================
   */
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="text-lg">
          📺 Chargement de la remédiation...
        </div>

        {isOffline && (
          <div className="mt-2 text-sm text-orange-600">
            📡 Mode hors connexion — recherche des
            données enregistrées sur cet appareil...
          </div>
        )}
      </div>
    );
  }

  /**
   * ============================================================
   * ❌ AUCUNE VIDÉO
   * ============================================================
   */
  if (allVideos.length === 0) {
    return (
      <div className="p-6 text-center text-red-500">
        {isOffline ? (
          <>
            <div>
              📡 Aucune donnée de remédiation
              disponible hors connexion pour cette
              notion.
            </div>

            <div className="mt-2 text-sm text-gray-600">
              Connectez-vous à Internet une première
              fois pour charger cette remédiation.
            </div>
          </>
        ) : (
          <>
            ❌ Aucune vidéo de remédiation disponible
            pour cette notion et ces niveaux.
          </>
        )}
      </div>
    );
  }

  /**
   * ============================================================
   * ❌ DONNÉES OBLIGATOIRES MANQUANTES
   * ============================================================
   */
  if (!currentNotion || !classeActuelle) {
    return (
      <div className="p-6 text-center text-red-500">
        ❌ Données manquantes pour afficher la
        remédiation.
      </div>
    );
  }

  /**
   * ============================================================
   * 📺 AFFICHAGE DU PARCOURS
   * ============================================================
   */
  return (
    <div className="relative">
      {/* Indicateur discret du mode hors connexion */}
      {isOffline && (
        <div
          className="
            fixed
            top-0
            left-1/2
            z-[9999]
            -translate-x-1/2
            rounded-b-lg
            bg-orange-500
            px-4
            py-1.5
            text-xs
            font-medium
            text-white
            shadow-md
          "
        >
          📡 Mode hors connexion
        </div>
      )}

      <RemediationFlow
        data={allVideos}
        currentNotion={currentNotion}
        remainingNotions={remainingNotions}
        classeActuelle={classeActuelle}
        serieActuelle={serieActuelle}
      />
    </div>
  );
};

export default RemediationFlowWrapper;