const videosDivisibilite = [
  {
    id: "video1",
    titre: "Divisibilité - Structure des entiers (Classe : 2nde G3)",
    videoUrl: "http://localhost:8000/RemediationVideos/2nde/G3/arithmetique/pgcd.mp4",
    questions: [
      {
        id: "q1",
        question: "Le produit de deux entiers premiers entre eux est...",
        options: [
          "Toujours premier",
          "Toujours pair",
          "Divisible par chacun des deux entiers",
        ],
        correctAnswerIndex: 2,
      },
    ],
  },
  {
    id: "video2",
    titre: "Divisibilité - Règles générales (Classe : 2nde G3)",
    videoUrl: "http://localhost:8000/RemediationVideos/2nde/G3/arithmetique/divisibilite.mp4",
    questions: [
      {
        id: "q2",
        question: "Si a | b et b | c, alors...",
        options: ["a | c", "c | a", "b = c", "a = b"],
        correctAnswerIndex: 0,
      },
    ],
  },
];

export default videosDivisibilite;

