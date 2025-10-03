import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../utils/axios"; // remplace axios par api

import { useAuth } from "../../context/AuthContext";

type Question = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
};

type VideoStep = {
  titre: string;
  niveau: string;
  serie?: string;
  videoUrl: string;
  questions: Question[];
};

type Props = {
  data: VideoStep[];
  currentNotion: string;
  remainingNotions: string[];
  classeActuelle: string;
  serieActuelle?: string;
};

const ordreNiveaux = ["6e", "5e", "4e", "3e", "2nde", "1ere", "Tle"];

const RemediationFlow = ({
  data,
  currentNotion,
  remainingNotions,
  classeActuelle,
  serieActuelle,
}: Props) => {
  const { user } = useAuth();
  const nom = user?.nom ?? "";
  const email = user?.email ?? "";
  const userId = user?.id ?? "";

  const navigate = useNavigate();

  const [filteredData, setFilteredData] = useState<VideoStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const [studentProgress, setStudentProgress] = useState<any>(null);
  const [progression, setProgression] = useState<any>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const current = filteredData[currentStep];

  // Filtrer les vidéos selon les niveaux précédents et la série
  useEffect(() => {
    const indexClasse = ordreNiveaux.indexOf(classeActuelle);
    if (indexClasse <= 0) return;

    const niveauxAnterieurs = ordreNiveaux.slice(0, indexClasse);

    const filtrees = data.filter((video) => {
      const estDansNiveau = niveauxAnterieurs.includes(video.niveau);
      const niveauIndex = ordreNiveaux.indexOf(video.niveau);
      const estCollege = niveauIndex < ordreNiveaux.indexOf("2nde");
      const estLycee = !estCollege;
      const bonneSerie = !video.serie || video.serie === serieActuelle;

      return estDansNiveau && (estCollege || (estLycee && bonneSerie));
    });

    setFilteredData(filtrees);
  }, [data, classeActuelle, serieActuelle]);

  // Chargement progression backend
  useEffect(() => {
    if (!userId) return;
    const fetchProgress = async () => {
      try {
        const res = await api.get(`/api/progress/${userId}`);
        setStudentProgress(res.data);
        setProgression(res.data);
      } catch (err) {
        console.error("Erreur chargement progression :", err);
      }
    };
    fetchProgress();
  }, [userId]);

  // Charger progression localStorage
  useEffect(() => {
    if (!email) return;
    const saved = localStorage.getItem(`remediationProgress_${email}`);
    if (saved) setProgression(JSON.parse(saved));
  }, [email]);

  // Sauvegarder progression dans localStorage
  useEffect(() => {
    if (!email || !progression) return;
    localStorage.setItem(`remediationProgress_${email}`, JSON.stringify(progression));
  }, [email, progression]);

  // Sauvegarder progression backend (POST)
  useEffect(() => {
    if (!userId || !progression) return;
    const saveProgressionBackend = async () => {
      try {
        const token = sessionStorage.getItem("token");
        await api.post("/api/progress/update", {
          user_id: userId,
          ...progression,
        });
      } catch (error) {
        console.error("Erreur sauvegarde progression backend :", error);
      }
    };
    saveProgressionBackend();
  }, [userId, progression]);

  // Clé localStorage pour état démarrage vidéo et temps courant
  const videoStartedKey = `videoStarted-${currentNotion}-${current?.niveau}`;
  const videoTimeKey = `videoTime-${currentNotion}-${current?.niveau}`;

  // Au chargement, récupérer si vidéo déjà démarrée et temps de reprise
  useEffect(() => {
    if (!current) return;

    const started = localStorage.getItem(videoStartedKey) === "true";
    setVideoStarted(started);

    if (started && videoRef.current) {
      const savedTime = localStorage.getItem(videoTimeKey);
      if (savedTime) {
        videoRef.current.currentTime = parseFloat(savedTime);
      }
    }
  }, [current, videoStartedKey, videoTimeKey]);

  // Quand vidéo démarre via bouton, on stocke le flag
  const handleStartVideo = () => {
    setVideoStarted(true);
    localStorage.setItem(videoStartedKey, "true");
  };

  // Sauvegarder la position de lecture toutes les secondes environ
  useEffect(() => {
    if (!videoStarted || !videoRef.current) return;

    const video = videoRef.current;
    const handleTimeUpdate = () => {
      localStorage.setItem(videoTimeKey, video.currentTime.toString());
    };

    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [videoStarted, videoTimeKey]);

  const handleAnswer = (questionIndex: number, answerIndex: number) => {
    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = answerIndex;
    setAnswers(updatedAnswers);
  };

  const validateAnswers = async () => {
    if (!current) return;

    let correct = 0;
    current.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswerIndex) correct++;
    });

    const scorePercentage = Math.round((correct / current.questions.length) * 100);
    setScore(scorePercentage);

    setProgression({
      notion: currentNotion,
      niveau: current.niveau,
      currentStep,
      score: scorePercentage,
      testPassed: scorePercentage === 100,
    });

    try {
      await api.post("/api/progress/update", {
        user_id: userId,
        notion: currentNotion,
        videoLevel: current.niveau,
        testPassed: scorePercentage === 100,
        failedQuestions:
          scorePercentage === 100
            ? []
            : current.questions
                .map((_, i) => i)
                .filter((i) => answers[i] !== current.questions[i].correctAnswerIndex),
      });
    } catch (err) {
      console.error("Erreur API update progression :", err);
    }
  };

  const goToNextStep = () => {
    const nextStep = currentStep + 1;
    if (nextStep < filteredData.length) {
      setCurrentStep(nextStep);
      setAnswers([]);
      setScore(null);
      setShowQuiz(false);
      setVideoEnded(false);
      setVideoStarted(false);

      // Optionnel: supprimer stockage local de la vidéo précédente
      localStorage.removeItem(`videoStarted-${currentNotion}-${current?.niveau}`);
      localStorage.removeItem(`videoTime-${currentNotion}-${current?.niveau}`);
    } else {
      navigate("/examen-notion", {
        state: {
          currentNotion,
          remainingNotions,
          classeActuelle,
          serieActuelle,
        },
      });
    }
  };

  if (!current) {
    return (
      <div className="p-8 text-center text-red-600">
        Aucune vidéo de remédiation disponible pour ce niveau.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-transparent">
      <div className="w-full max-w-3xl p-6 sm:p-8 space-y-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-xl shadow-lg">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-blue-700 dark:text-white">
          {current.titre}
        </h2>

        {!showQuiz && (
          <div className="space-y-4">
            {!videoStarted ? (
              <motion.button
                onClick={handleStartVideo}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
              >
                ▶️ Lancer la vidéo
              </motion.button>
            ) : (
              <video
                ref={videoRef}
                src={current.videoUrl}
                controls
                muted
                onEnded={() => setVideoEnded(true)}
                className="w-full rounded-xl shadow"
              />
            )}

            {videoEnded && (
              <motion.button
                onClick={() => setShowQuiz(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition"
              >
                🎯 EVALUATION
              </motion.button>
            )}
          </div>
        )}

        {showQuiz && score === null && (
          <div className="space-y-6">
            {current.questions.map((q, i) => (
              <div key={i}>
                <p className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                  {i + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, j) => (
                    <label
                      key={j}
                      className={`block px-4 py-3 rounded-xl border cursor-pointer transition ${
                        answers[i] === j
                          ? "bg-blue-600 text-white border-blue-700"
                          : "bg-white hover:bg-blue-100 border-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q${i}`}
                        value={j}
                        checked={answers[i] === j}
                        onChange={() => handleAnswer(i, j)}
                        className="mr-2"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={validateAnswers}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
            >
              ✅ Valider mes réponses
            </button>
          </div>
        )}

        {score !== null && (
          <div className="p-6 bg-white/80 dark:bg-gray-700/80 rounded-xl text-center space-y-4">
            <p className="text-lg font-bold text-gray-800 dark:text-white">
              Résultat : {score}% {score === 100 ? "🎉 Parfait !" : "❌ À revoir"}
            </p>

            {score === 100 ? (
              <button
                onClick={goToNextStep}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
              >
                ▶️ Continuer
              </button>
            ) : (
              <button
                onClick={() => {
                  setAnswers([]);
                  setScore(null);
                  setShowQuiz(false);
                  setVideoEnded(false);
                  setVideoStarted(false);
                }}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-xl transition"
              >
                🔁 Revoir la vidéo et refaire le test
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RemediationFlow;
