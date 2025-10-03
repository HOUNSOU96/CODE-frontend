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

const RemediationFlow = RemediationFlowModule.default || RemediationFlowModule;

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
  // on force remainingNotions à tableau vide si absent, pour compatibilité typage Props
  const remainingNotions = state?.remainingNotions ?? [];
  const classeActuelle = state?.classeActuelle;
  const serieActuelle = state?.serieActuelle;
  const nouvelleProgression = state?.nouvelleProgression;

  const { setProgression } = useProgression();
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const parcoursRemediation: ClasseSerie[] | null =
    classeActuelle && serieActuelle
      ? genererParcoursRemediation(`${classeActuelle} ${serieActuelle}`)
      : null;

  useEffect(() => {
    if (nouvelleProgression) {
      setProgression(nouvelleProgression);
      saveProgression(nouvelleProgression);
    }
  }, [nouvelleProgression, setProgression]);

  useEffect(() => {
    const loadAllRemediationVideos = async () => {
      setIsLoading(true);

      if (!parcoursRemediation || !currentNotion) {
        console.error("❌ Paramètres manquants :", {
          parcoursRemediation,
          currentNotion,
        });
        setIsLoading(false);
        return;
      }

      const allData: any[] = [];

      for (const { classe, serie } of parcoursRemediation) {
        const niveauNettoye = classe.toLowerCase().replace("è", "e");
        const notion = currentNotion.toLowerCase().trim();
        const serieFinale = ["6e", "5e", "4e", "3e"].includes(classe)
          ? "Général"
          : serie || serieActuelle;
        const chemin = `/src/data/Maths/Remediation/${niveauNettoye}/${serieFinale}/${notion}`;

        try {
          const module = await import(/* @vite-ignore */ chemin);
          const videos = module?.default;

          if (Array.isArray(videos)) {
            const enrichies = videos.map((video: any) => ({
              ...video,
              niveau: classe,
              serie: serieFinale,
            }));
            allData.push(...enrichies);
          } else {
            console.warn(`⚠️ Le module ${chemin} ne contient pas un tableau.`);
          }
        } catch (err) {
          console.warn(
            `⚠️ Aucune vidéo trouvée pour ${classe} (${serieFinale}) - ${notion}`,
            err
          );
        }
      }

      setAllVideos(allData);
      setIsLoading(false);
    };

    if (currentNotion && parcoursRemediation) {
      loadAllRemediationVideos();
    }
  }, [currentNotion, parcoursRemediation, serieActuelle]);

  if (loading)
    return <div className="p-6 text-center">🔐 Chargement utilisateur...</div>;

  if (!RemediationFlow) {
    return (
      <div className="text-red-500 p-6">
        ❌ Composant RemediationFlow non disponible.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        📺 Chargement de la remédiation...
      </div>
    );
  }

  if (allVideos.length === 0) {
    return (
      <div className="p-6 text-center text-red-500">
        ❌ Aucune vidéo de remédiation disponible pour cette notion et ces niveaux.
      </div>
    );
  }

  // Validation stricte des props obligatoires avant de rendre RemediationFlow
  if (!currentNotion || !classeActuelle) {
    return (
      <div className="p-6 text-center text-red-500">
        ❌ Données manquantes pour afficher la remédiation.
      </div>
    );
  }

  return (
    <RemediationFlow
      data={allVideos}
      currentNotion={currentNotion}
      remainingNotions={remainingNotions}
      classeActuelle={classeActuelle}
      serieActuelle={serieActuelle}
    />
  );
};

export default RemediationFlowWrapper;
