const videosDivisibilite = [
  {
    id: "video1",
    titre: "Divisibilité - Critères de base (Classe : 5e)",
    videoUrl: "http://localhost:8000/RemediationVideos/5e/arithmetique/divisibilite.mp4",
    questions: [
      {
        id: "q1",
        question: "Un nombre divisible par 3 a...",
        options: ["Un chiffre impair", "Une somme des chiffres divisible par 3", "Un zéro à la fin"],
        correctAnswerIndex: 1,
      },
    ],
  },
  {
    id: "video2",
    titre: "Divisibilité - Exercices pratiques (Classe : 5e)",
    videoUrl: "http://localhost:8000/RemediationVideos/5e/arithmetique/pgcd.mp4",
    questions: [
      {
        id: "q2",
        question: "Quel nombre est divisible par 5 ?",
        options: ["42", "55", "23", "31"],
        correctAnswerIndex: 1,
      },
    ],
  },
];

export default videosDivisibilite;

