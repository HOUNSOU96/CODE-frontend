const videosDivisibilite = [
  {
    id: "video1",
    titre: "Divisibilité - Nombres premiers et décompositions (Classe : 3e)",
    videoUrl: "http://localhost:8000/RemediationVideos/3e/arithmetique/divisibilite.mp4",
    questions: [
      {
        id: "q1",
        question: "Un nombre premier est...",
        options: [
          "Divisible uniquement par 1 et lui-même",
          "Toujours pair",
          "Un multiple de 2",
        ],
        correctAnswerIndex: 0,
      },
    ],
  },
  {
    id: "video2",
    titre: "Divisibilité - Utilisation du PGCD (Classe : 3e)",
    videoUrl: "http://localhost:8000/RemediationVideos/3e/arithmetique/pgcd.mp4",
    questions: [
      {
        id: "q2",
        question: "Le PGCD de 18 et 24 est :",
        options: ["2", "3", "6", "12"],
        correctAnswerIndex: 2,
      },
    ],
  },
];

export default videosDivisibilite;

