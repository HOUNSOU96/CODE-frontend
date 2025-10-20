import React, { useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";

type LocationState = {
  notions_non_acquises?: string[];
  niveauActuel?: string;
  serieActuelle?: string;
};

const niveauxSansSerie = ["6e", "5e", "4e", "3e"];
const niveauxAvecSerie = ["2nde", "1ere", "tle"];

const Remediation = () => {
  const { loading, user } = useAuth();
  const location = useLocation() as { state: LocationState };
  const navigate = useNavigate();

  const niveau = location.state?.niveauActuel ?? "";
  const serie = location.state?.serieActuelle || "";

  // Normalisation des notions
  const notions = (location.state?.notions_non_acquises || []).map((n) =>
    n.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  );

  const isNiveauSansSerie = niveauxSansSerie.includes(niveau.toLowerCase());
  const titreNiveau = isNiveauSansSerie ? niveau.toUpperCase() : `${niveau} ${serie}`.toUpperCase();

  // Peut commencer même si aucune notion non acquise
  const handleStartRemediation = () => {
    navigate(
      `/maths/test/remediationvideo/${niveau.toLowerCase()}/${(serie || "none").toLowerCase()}`,
      {
        replace: true,
        state: {
          currentNotion: notions[0] || null, // null si aucune notion
          remainingNotions: notions.slice(1),
          niveauActuel: niveau,
          serieActuelle: serie || "",
        },
      }
    );
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 sm:p-10 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-700 dark:text-white mb-2">
            Remédiation (Niveau : {titreNiveau})
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            La suite de ce programme vous permet de corriger vos difficultés dans cette matière en suivant le programme de votre niveau avec les prérequis nécessaires pour chaque notion !
          </p>
        </div>

        <section className="bg-gray-100 dark:bg-gray-700 p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            🎯 Objectifs de la remédiation
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-200 space-y-2">
            <li>Accéder aux vidéos de votre niveau avec les prérequis correspondants.</li>
            <li>Réaliser des exercices portant sur chaque vidéo visualisée afin de valider votre compréhension par rapport à cette notion.</li>
          </ul>
        </section>

        {notions.length > 0 ? (
          <section className="bg-blue-50 dark:bg-blue-900 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-blue-700 dark:text-white mb-3">
              📌 Les notions qui vous dérangent
            </h2>
            <ul className="list-disc list-inside text-blue-800 dark:text-blue-200 space-y-1">
              {notions.map((notion, index) => (
                <li key={index}>{notion}</li>
              ))}
            </ul>
          </section>
        ) : (
          <div className="text-center text-green-600 dark:text-green-400 font-semibold italic">
            🎉 Félicitations ! Toutes les notions sont acquises pour ce test.
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleStartRemediation}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition"
          >
            🚀 Commencer
          </button>
        </div>
      </div>
    </div>
  );
};

export default Remediation;
