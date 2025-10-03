// Exemple : 6e
const videosDivisibilite = [
  {
    id: "video1",
    titre: "Divisibilité - Introduction (Classe : 6e)",
    videoUrl: "http://localhost:8000/RemediationVideos/6e/arithmetique/divisibilite.mp4",
    questions: [
      {
        id: "q1",
        question: "Un nombre est divisible par 2 si...",
        options: ["Il est pair", "Il est impair", "Il est premier"],
        correctAnswerIndex: 0,
      },
    ],
  },
  {
    id: "video2",
    titre: "Divisibilité - Applications simples (Classe : 6e)",
    videoUrl: "http://localhost:8000/RemediationVideos/6e/arithmetique/pgcd.mp4",
    questions: [
      {
        id: "q2",
        question: "12 est divisible par :",
        options: ["2", "3", "4", "Toutes les réponses"],
        correctAnswerIndex: 3,
      },
    ],
  },
];

export default videosDivisibilite;

