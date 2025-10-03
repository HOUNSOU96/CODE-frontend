const videosDivisibilite = [
  {
    id: "video1",
    titre: "Divisibilité - Raisonnements avancés (Classe : 1ère G3)",
    videoUrl: "http://localhost:8000/RemediationVideos/1ere/G3/arithmetique/pgcd.mp4",
    questions: [
      {
        id: "q1",
        question: "Si a divise b et b divise c, que peut-on conclure ?",
        options: [
          "a divise c",
          "c divise a",
          "b et c sont premiers entre eux",
        ],
        correctAnswerIndex: 0,
      },
    ],
  },
  {
    id: "video2",
    titre: "Divisibilité - Application en arithmétique modulaire (Classe : 1ère G3)",
    videoUrl: "http://localhost:8000/RemediationVideos/1ere/G3/arithmetique/divisibilite.mp4",
    questions: [
      {
        id: "q2",
        question: "Si a ≡ b [n], cela signifie :",
        options: [
          "a divise b",
          "a et b sont congrus modulo n",
          "a est premier",
        ],
        correctAnswerIndex: 1,
      },
    ],
  },
];

export default videosDivisibilite;

