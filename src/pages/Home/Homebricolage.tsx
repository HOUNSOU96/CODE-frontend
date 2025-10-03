import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ListChecks } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from "../../hooks/useAuth";
const generalLevels = ['6e', '5e', '4e', '3e'] as const;
const lyceeLevels = ['2nde', '1ère', 'Terminale'] as const;
const series = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;

const subSeriesMap: Record<string, string[]> = {
  A: ['A1', 'A2'],
  F: ['F1', 'F2', 'F3', 'F4'],
  G: ['G1', 'G2', 'G3'],
};

type Level = (typeof generalLevels | typeof lyceeLevels)[number];
type Serie = (typeof series)[number];

export default function Homebricolage() {
  const { loading } = useAuth();


  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [showSeries, setShowSeries] = useState(false);
  const [selectedSerie, setSelectedSerie] = useState<Serie | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  // Simulation de l’état de progression
  const studentProgress = {
    generalExamPassed: false,
    classFinale: 'TleC',
  };

  useEffect(() => {
    if (studentProgress?.generalExamPassed) {
      navigate(`/cours/${studentProgress.classFinale}`);
    }
  }, [studentProgress, navigate]);

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

  const niveauToUrlPart = (level: string) => {
    if (level.toLowerCase() === 'terminale') return 'tle';
    if (level.toLowerCase() === '1ère') return '1ere';
    if (level.toLowerCase() === '2nde') return '2nde';
    return slugify(level);
  };

  /* ---------------------------------
     Navigation vers la route dynamique
     /maths/test/questions/:classe/:serie
  ---------------------------------- */
  const goToTest = (classe: string, serie?: string) => {
    const serieSlug = serie ? serie.toLowerCase() : 'none';
    const target = `/bricolage/test/questions/${niveauToUrlPart(classe)}/${serieSlug}`;
    navigate(target);
  };

  const handleLevelSelect = (level: Level) => {
    setConfirmation(null);
    setSelectedSerie(null);

    if (lyceeLevels.includes(level as any)) {
      setSelectedLevel(level);
      setShowSeries(true);
    } else {
      goToTest(level);
    }
  };

  const handleSeriesSelect = (serie: Serie) => {
    setSelectedSerie(serie);
    const hasSubSeries = subSeriesMap[serie];

    if (!hasSubSeries && selectedLevel) {
      setConfirmation(`Vous avez choisi : ${selectedLevel} ${serie}`);
      setTimeout(() => goToTest(selectedLevel, serie), 1000);
    }
  };

  const handleSubSeriesSelect = (subSerie: string) => {
    if (selectedLevel) {
      setConfirmation(`Vous avez choisi : ${selectedLevel} ${subSerie}`);
      setTimeout(() => goToTest(selectedLevel, subSerie), 1000);
    }
  };


  if (loading) return <div>Chargement...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8 text-white z-20">
        <h1 className="text-3xl font-extrabold mb-6">🎓 BIENVENUE SUR CODE</h1>
        <p className="mb-6 text-lg text-white/90">
          Choisissez votre classe pour commencer le BRICOLAGE :
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {[...generalLevels, ...lyceeLevels].map((level) => (
            <button
              key={level}
              onClick={() => handleLevelSelect(level)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
            >
              <GraduationCap size={20} />
              {level}
            </button>
          ))}
        </div>

        {showSeries && (
          <div className="mt-6 text-center">
            <p className="mb-4 font-semibold text-white">
              Vous êtes en {selectedLevel} ? Choisissez votre série :
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {series.map((serie) => (
                <button
                  key={serie}
                  onClick={() => handleSeriesSelect(serie)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded shadow-md hover:bg-green-700 transition-transform transform hover:scale-105"
                >
                  <ListChecks size={18} />
                  Série {serie}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedSerie && subSeriesMap[selectedSerie] && (
          <div className="mt-6 text-center">
            <p className="mb-4 font-semibold text-white">
              Vous avez choisi la série {selectedSerie}. Sélectionnez votre sous-série :
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {subSeriesMap[selectedSerie].map((sub) => (
                <button
                  key={sub}
                  onClick={() => handleSubSeriesSelect(sub)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded shadow-md hover:bg-purple-700 transition-transform transform hover:scale-105"
                >
                  <ListChecks size={18} />
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}

        {confirmation && (
          <p className="mt-6 text-green-300 font-semibold animate-pulse">
            ✅ {confirmation}... redirection en cours...
          </p>
        )}

        <button
          onClick={() => navigate('/matiere')}
          className="mt-12 px-6 py-3 bg-white/80 dark:bg-gray-600 hover:bg-white dark:hover:bg-gray-500 rounded-full text-sm text-gray-800 dark:text-white transition font-medium"
        >
          ⬅️ Changer de matière
        </button>
      </div>
    </motion.div>
  );
}
