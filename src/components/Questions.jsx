import React, { useState, useEffect } from "react";

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [resultats, setResultats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch("http://localhost:8001/api/questions");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        console.log("Questions reçues:", data);
        setQuestions(data);
      } catch (e) {
        setError("Impossible de charger les questions. Veuillez réessayer plus tard.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  function handleOptionSelect(option) {
    setAnswers((prev) => ({ ...prev, [questions[current].id]: option }));
  }

  async function handleNext() {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      try {
        const res = await fetch("http://localhost:8000/api/questions/resultats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resultats }),
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setResultats(data);
      } catch (e) {
        setError("Erreur lors de l'envoi des réponses.");
        console.error(e);
      }
    }
  }

  if (loading) return <p>Chargement des questions...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (resultats)
    return (
      <div>
        <h2>Résultat du test</h2>
        <p>
          Score : {resultats.score} / {resultats.total}
        </p>
        <p>{resultats.message}</p>
      </div>
    );

  if (questions.length === 0) return <p>Aucune question disponible.</p>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Test de positionnement</h2>
      <p className="mb-4 text-lg">{questions[current].question}</p>
      <div className="space-y-2 mb-6">
        {questions[current].options.map((opt, i) => (
          <button
            key={i}
            className={`block w-full text-left px-4 py-2 border rounded ${
              resultats[questions[current].id] === opt
                ? "bg-blue-600 text-white"
                : "bg-white"
            }`}
            onClick={() => handleOptionSelect(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
      <button
        disabled={!resultats[questions[current].id]}
        onClick={handleNext}
        className="bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded hover:bg-green-700 transition"
      >
        {current === questions.length - 1 ? "Terminer" : "Suivant"}
      </button>
    </div>
  );
}

