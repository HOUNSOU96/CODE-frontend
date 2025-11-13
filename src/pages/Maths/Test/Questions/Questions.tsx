// Questions.tsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/utils/axios";
import { motion } from "framer-motion";
import { Loader2, CheckCircle } from "lucide-react";
import DarkModeToggle from "@/components/DarkModeToggle";
import AudioManager from "@/components/AudioManager";
import CountdownCircle from "@/components/CountdownCircle";
import { useAuth } from "../../../../hooks/useAuth";
import { serialize } from "v8";

type Question = {
  id: string;
  question: string;
  choix: string[];
  bonneReponse: string;
  notion: string;
  duree?: number;
  situation?: {
    texte?: string;
    image?: string;
  };
};

type Reponse = {
  questionId: string;
  reponse: number | null;
  notion: string;
};

type TimerStatus = {
  [key: string]: boolean;
};

const Questions = () => {
  const { niveau, serie } = useParams<{ niveau: string; serie: string }>();
  const navigate = useNavigate();
  const { loading: authLoading } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [reponses, setReponses] = useState<Reponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [timersEnded, setTimersEnded] = useState<TimerStatus>({});
  const [testId, setTestId] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<{ [key: string]: number }>({});

  const questionSoundRef = useRef<HTMLAudioElement | null>(null);

  const generalLevels = ['6e', '5e', '4e', '3e'] as const;
  const lyceeLevels = ['2nde', '1ere', 'tle'] as const;

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const allAnswered = reponses.every(r => r.reponse !== null);

  useEffect(() => {
    questionSoundRef.current = new Audio("/sounds/click.mp3");
  }, []);

  // Récupération de la génération du test + questions + testId
  useEffect(() => {
  const fetchTest = async () => {
    try {
      // Déterminer les niveaux à inclure
      let niveauxAInclure: string[] = [];

      const generalLevels = ['6e', '5e', '4e', '3e'];
      const lyceeLevels = ['2nde', '1ere', 'tle'];

      if (generalLevels.includes(niveau!)) {
        const index = generalLevels.indexOf(niveau!);
        niveauxAInclure = generalLevels.slice(0, index + 1);
      } else if (lyceeLevels.includes(niveau!)) {
        const index = lyceeLevels.indexOf(niveau!);
        // Ajouter aussi les niveaux du collège
        niveauxAInclure = [...generalLevels, ...lyceeLevels.slice(0, index + 1)];
      }

      // Construire l’URL avec plusieurs niveaux
      let url = `/api/questions/${niveau}/generation${serie ? `?serie=${serie}` : ''}`;
      if (serie && serie.toLowerCase() !== "none") {
        url += `&serie=${serie}`;
      }

      const res = await api.get(url);
      const { test_id, questions: questionsRecues } = res.data;

      setTestId(test_id);
      setQuestions(questionsRecues);
      setReponses(
        questionsRecues.map((q: Question) => ({
          questionId: q.id,
          reponse: null,
          notion: q.notion,
        }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des questions :", error);
      setLoading(false);
    }
  };

  if (niveau) fetchTest();
}, [niveau, serie]);


  const playClickSound = () => {
    questionSoundRef.current?.play().catch((e) => console.warn("Son non joué :", e));
  };

  const handleOptionSelect = (questionId: string, selected: number) => {
    setReponses((prev) =>
      prev.map((r) =>
        r.questionId === questionId ? { ...r, reponse: selected } : r
      )
    );
  };

  const handleNext = () => {
    const currentReponse = reponses.find(r => r.questionId === currentQuestion.id);
    if (currentReponse?.reponse === null) {
      alert("Veuillez choisir une réponse avant de continuer.");
      return;
    }

    playClickSound();
    let nextIndex = currentIndex + 1;
    while (
      nextIndex < totalQuestions &&
      timersEnded[questions[nextIndex].id]
    ) {
      nextIndex++;
    }

    if (nextIndex < totalQuestions) {
      setCurrentIndex(nextIndex);
    }
  };

  const handlePrevious = () => {
    playClickSound();
    let prevIndex = currentIndex - 1;
    while (prevIndex >= 0 && timersEnded[questions[prevIndex].id]) {
      prevIndex--;
    }

    if (prevIndex >= 0) {
      setCurrentIndex(prevIndex);
    }
  };

  const handleSubmit = async () => {
    if (!testId) {
      alert("Erreur : test ID manquant, impossible de soumettre les réponses.");
      return;
    }

    const toutesLesReponses = reponses.map((r) => {
      const lettre = ["a", "b", "c", "d", "e"][r.reponse ?? 0];
      return { id: String(r.questionId), reponse: lettre };
    });

    try {
      const baseUrl = `/api/questions/${niveau}/resultats?test_id=${testId}`;
      const url =
        serie && serie.toLowerCase() !== "none"
          ? `${baseUrl}&serie=${serie}`
          : baseUrl;

      const res = await api.post(url, { resultats: toutesLesReponses });
      const { note, mention, notionsNonAcquises } = res.data;

      navigate(`/maths/test/resultats/${niveau}/${serie ?? "none"}`, {
        replace: true,
        state: { resultats: { note, mention, notionsNonAcquises } },
      });
    } catch (error) {
      console.error("Erreur soumission :", error);
      alert("Une erreur s'est produite lors de la soumission.");
    }
  };

  const handleTimeUp = () => {
    const currentId = currentQuestion?.id;
    if (!currentId) return;

    const currentReponse = reponses.find(r => r.questionId === currentId);
    const isUnanswered = currentReponse?.reponse === null;

    if (isUnanswered) {
      alert("Temps écoulé sans réponse. L'évaluation va recommencer.");
      // Recharger la page actuelle pour relancer l'évaluation
      navigate("/matiere"); // ou window.location.reload();
      return;
    }

    setTimersEnded((prev) => ({ ...prev, [currentId]: true }));

    if (currentIndex < totalQuestions - 1) {
      handleNext();
    } else {
      handleSubmit();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center mt-20 text-center gap-4 text-gray-700 dark:text-gray-300">
        <Loader2 className="animate-spin h-10 w-10" />
        <p>Chargement des questions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 relative">
      <div className="absolute top-4 right-4 flex items-center gap-4">
        <DarkModeToggle />
        <AudioManager />
      </div>

      <div className="rounded-2xl p-6 shadow-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-700 dark:text-blue-300">
          ÉVALUATION DIAGNOSTIQUE : {niveau} {serie}
        </h1>

        <div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
          <p className="text-sm text-center mt-1 text-gray-600 dark:text-gray-400">
            Question {currentIndex + 1} / {totalQuestions}
          </p>
        </div>

        {currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 border rounded-xl shadow-md bg-white dark:bg-gray-800"
          >
            {currentQuestion.situation?.texte && (
              <p className="mb-3 italic text-gray-700 dark:text-gray-300">
                {currentQuestion.situation.texte}
              </p>
            )}

            {currentQuestion.situation?.image && (
              <div className="mb-4 flex justify-center">
                <img
                  src={currentQuestion.situation.image}
                  alt="Illustration"
                  className="rounded-lg shadow max-w-full h-auto"
                />
              </div>
            )}

            <div className="flex justify-between items-start mb-4">
              <div
                className="font-medium text-lg text-gray-800 dark:text-gray-200 w-full pr-4"
                dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
              />
              <CountdownCircle
  key={currentQuestion.id} // utiliser l'ID pour éviter reset quand on reste sur la même question
  duration={currentQuestion.duree ?? 60}
  initialRemainingTime={remainingTime[currentQuestion.id]} // temps restant s'il existe
  onTick={(timeLeft) =>
    setRemainingTime((prev) => ({ ...prev, [currentQuestion.id]: timeLeft }))
  }
  onComplete={handleTimeUp}
/>

            </div>

            {/* ** CORRECTION AJOUTÉE ICI ** */}
            {!currentQuestion.choix ? (
              <div>Chargement des options...</div>
            ) : (
              <div className="grid gap-4 mt-4">
                {currentQuestion.choix.map((opt, idx) => {
                  const selected =
                    reponses.find((r) => r.questionId === currentQuestion.id)
                      ?.reponse === idx;

                  return (
                    <label
                      key={idx}
                      className={`flex items-center gap-3 p-4 border rounded-lg shadow-sm cursor-pointer transition text-base
                        ${
                          selected
                            ? "bg-blue-100 dark:bg-blue-800/40 border-blue-500"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                    >
                      <input
                        type="radio"
                        name={`q-${currentQuestion.id}`}
                        value={idx}
                        checked={selected}
                        onChange={() =>
                          handleOptionSelect(currentQuestion.id, idx)
                        }
                        className="accent-blue-600 scale-125"
                      />
                      <span className="text-gray-800 dark:text-gray-200">
                        {opt}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-4 py-2 rounded-full border text-sm transition disabled:opacity-40
              bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
          >
            ← Précédent
          </button>

          {currentIndex < totalQuestions - 1 ? (
            <button
              onClick={handleNext}
              className="bg-blue-600 text-white px-6 py-2 rounded-full shadow hover:bg-blue-700 transition"
            >
              Suivant →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className={`px-6 py-2 rounded-full shadow flex items-center gap-2 transition
                ${allAnswered
                  ? "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                  : "bg-gray-400 text-gray-700 cursor-not-allowed"
                }`}
            >
              <CheckCircle className="w-5 h-5" />
              Terminer l'évaluation
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Questions;
