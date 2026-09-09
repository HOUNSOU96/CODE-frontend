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

type Question = {
  id: string;
  question: string;
  choix: string[];
  bonneReponse?: string;
  bonne_reponse?: string;
  notion: string;
  duree?: number;

  // Enseignant ayant proposé la question
  enseignant?: string;

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

// ============================================================
// PROFIL PUBLIC DE L'ENSEIGNANT
// ============================================================

type TeacherProfile = {
  nom: string;
  prenom: string;
  email: string;

  // Numéro de téléphone / WhatsApp
  telephone?: string | null;

  teacher_photo?: string | null;
};

const Questions = () => {
  const { niveau, serie } = useParams<{
    niveau: string;
    serie: string;
  }>();

  const navigate = useNavigate();

  const { loading: authLoading } = useAuth();

  // ==========================================================
  // ÉTATS DES QUESTIONS
  // ==========================================================

  const [questions, setQuestions] = useState<Question[]>([]);

  const [reponses, setReponses] = useState<Reponse[]>([]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);

  const [timersEnded, setTimersEnded] =
    useState<TimerStatus>({});

  const [testId, setTestId] =
    useState<string | null>(null);

  const [remainingTime, setRemainingTime] =
    useState<{ [key: string]: number }>({});

  // ==========================================================
  // PROFILS DES ENSEIGNANTS
  // ==========================================================

  const [teacherProfiles, setTeacherProfiles] =
    useState<Record<string, TeacherProfile | null>>({});

  const questionSoundRef =
    useRef<HTMLAudioElement | null>(null);

  // ==========================================================
  // REMONTER EN HAUT À CHAQUE CHANGEMENT DE QUESTION
  // ==========================================================

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [currentIndex]);

  // ==========================================================
  // NIVEAUX
  // ==========================================================

  const generalLevels = [
    "6e",
    "5e",
    "4e",
    "3e",
  ] as const;

  const lyceeLevels = [
    "2nde",
    "1ere",
    "tle",
  ] as const;

  // ==========================================================
  // QUESTION ACTUELLE
  // ==========================================================

  const currentQuestion =
    questions[currentIndex];

  const totalQuestions =
    questions.length;

  const allAnswered =
    reponses.every(
      (r) => r.reponse !== null
    );

  // ==========================================================
  // INITIALISATION DU SON
  // ==========================================================

  useEffect(() => {
    questionSoundRef.current =
      new Audio("/sounds/click.mp3");
  }, []);

  // ==========================================================
  // RÉCUPÉRER LES PROFILS DES ENSEIGNANTS
  // ==========================================================

  const fetchTeacherProfiles = async (
    questionsRecues: Question[]
  ) => {
    /*
     * Récupérer les emails des enseignants
     * présents dans les questions.
     *
     * Le Set permet d'éviter plusieurs requêtes
     * pour le même enseignant.
     */

    const emails = [
      ...new Set(
        questionsRecues
          .map((q) => q.enseignant)
          .filter(
            (
              email
            ): email is string =>
              typeof email === "string" &&
              email.trim() !== ""
          )
      ),
    ];

    // Aucun enseignant trouvé
    if (emails.length === 0) {
      return;
    }

    const profiles: Record<
      string,
      TeacherProfile | null
    > = {};

    await Promise.all(
      emails.map(async (email) => {
        try {
          const res = await api.get(
            "/api/teacher/public-profile",
            {
              params: {
                email,
              },
            }
          );

          profiles[email] =
            res.data;
        } catch (error) {
          console.error(
            `Impossible de récupérer l'enseignant ${email}`,
            error
          );

          profiles[email] = null;
        }
      })
    );

    setTeacherProfiles(profiles);
  };

  // ==========================================================
  // RÉCUPÉRATION DU TEST
  // ==========================================================

  useEffect(() => {
    const fetchTest = async () => {
      try {
        // ------------------------------------------------------
        // Déterminer les niveaux à inclure
        // ------------------------------------------------------

        let niveauxAInclure: string[] = [];

        if (
          generalLevels.includes(
            niveau as (typeof generalLevels)[number]
          )
        ) {
          const index =
            generalLevels.indexOf(
              niveau as (typeof generalLevels)[number]
            );

          niveauxAInclure =
            generalLevels.slice(
              0,
              index + 1
            );
        } else if (
          lyceeLevels.includes(
            niveau as (typeof lyceeLevels)[number]
          )
        ) {
          const index =
            lyceeLevels.indexOf(
              niveau as (typeof lyceeLevels)[number]
            );

          // Ajouter également les niveaux du collège
          niveauxAInclure = [
            ...generalLevels,
            ...lyceeLevels.slice(
              0,
              index + 1
            ),
          ];
        }

        // ------------------------------------------------------
        // Construire l'URL
        // ------------------------------------------------------

        let url =
          `/api/questions/${niveau}/generation` +
          `${serie ? `?serie=${serie}` : ""}`;

        if (
          serie &&
          serie.toLowerCase() !== "none"
        ) {
          url += `&serie=${serie}`;
        }

        // ------------------------------------------------------
        // Appel backend
        // ------------------------------------------------------

        const res =
          await api.get(url);

        const {
          test_id,
          questions: questionsRecues,
        } = res.data;

        // ------------------------------------------------------
        // Enregistrer le test
        // ------------------------------------------------------

        setTestId(test_id);

        // ------------------------------------------------------
        // Enregistrer les questions
        // ------------------------------------------------------

        setQuestions(
          questionsRecues
        );

        // ------------------------------------------------------
        // Initialiser les réponses
        // ------------------------------------------------------

        setReponses(
          questionsRecues.map(
            (q: Question) => ({
              questionId: q.id,
              reponse: null,
              notion: q.notion,
            })
          )
        );

        // ------------------------------------------------------
        // Récupérer les profils enseignants
        // ------------------------------------------------------

        await fetchTeacherProfiles(
          questionsRecues
        );

        // ------------------------------------------------------
        // Fin du chargement
        // ------------------------------------------------------

        setLoading(false);

      } catch (error) {
        console.error(
          "Erreur lors du chargement des questions :",
          error
        );

        setLoading(false);
      }
    };

    if (niveau) {
      fetchTest();
    }
  }, [niveau, serie]);

  // ==========================================================
  // SON DE CLIC
  // ==========================================================

  const playClickSound = () => {
    questionSoundRef.current
      ?.play()
      .catch((e) =>
        console.warn(
          "Son non joué :",
          e
        )
      );
  };

  // ==========================================================
  // SÉLECTION D'UNE OPTION
  // ==========================================================

  const handleOptionSelect = (
    questionId: string,
    selected: number
  ) => {
    setReponses((prev) =>
      prev.map((r) =>
        r.questionId === questionId
          ? {
              ...r,
              reponse: selected,
            }
          : r
      )
    );
  };

  // ==========================================================
  // QUESTION SUIVANTE
  // ==========================================================

  const handleNext = () => {
    const currentReponse =
      reponses.find(
        (r) =>
          r.questionId ===
          currentQuestion.id
      );

    if (
      currentReponse?.reponse === null
    ) {
      alert(
        "Veuillez choisir une réponse avant de continuer."
      );

      return;
    }

    playClickSound();

    let nextIndex =
      currentIndex + 1;

    while (
      nextIndex < totalQuestions &&
      timersEnded[
        questions[nextIndex].id
      ]
    ) {
      nextIndex++;
    }

    if (
      nextIndex < totalQuestions
    ) {
      setCurrentIndex(
        nextIndex
      );
    }
  };

  // ==========================================================
  // QUESTION PRÉCÉDENTE
  // ==========================================================

  const handlePrevious = () => {
    playClickSound();

    let prevIndex =
      currentIndex - 1;

    while (
      prevIndex >= 0 &&
      timersEnded[
        questions[prevIndex].id
      ]
    ) {
      prevIndex--;
    }

    if (prevIndex >= 0) {
      setCurrentIndex(
        prevIndex
      );
    }
  };

  // ==========================================================
  // SOUMISSION
  // ==========================================================

  const handleSubmit = async () => {
    if (!testId) {
      alert(
        "Erreur : test ID manquant, impossible de soumettre les réponses."
      );

      return;
    }

    /*
     * ========================================================
     * 1. CONSTRUIRE LES RÉPONSES DE L'APPRENANT
     * ========================================================
     */

    const toutesLesReponses =
      reponses.map((r) => {
        const lettre =
          [
            "a",
            "b",
            "c",
            "d",
            "e",
          ][r.reponse ?? 0];

        return {
          id: String(
            r.questionId
          ),
          reponse: lettre,
        };
      });

    /*
     * ========================================================
     * 2. CONSTRUIRE LES QUESTIONS AVEC LA RÉPONSE
     * ========================================================
     */

    const questionsAvecReponses =
      questions.map(
        (question) => {
          const reponse =
            reponses.find(
              (r) =>
                String(
                  r.questionId
                ) ===
                String(
                  question.id
                )
            );

          const indexReponse =
            reponse?.reponse ??
            null;

          const reponseApprenant =
            indexReponse !== null
              ? [
                  "a",
                  "b",
                  "c",
                  "d",
                  "e",
                ][indexReponse]
              : null;

          /*
           * La bonne réponse peut
           * venir de bonneReponse
           * ou bonne_reponse.
           */

          const bonneReponse =
            question.bonneReponse ??
            question.bonne_reponse ??
            "";

          /*
           * ==================================================
           * COMPARAISON
           * ==================================================
           */

          const correcte =
            reponseApprenant !==
              null &&
            String(
              reponseApprenant
            )
              .trim()
              .toLowerCase() ===
            String(
              bonneReponse
            )
              .trim()
              .toLowerCase();

          return {
            ...question,

            /*
             * Réponse de l'apprenant
             */

            reponse_apprenant:
              reponseApprenant,

            /*
             * Bonne réponse
             */

            bonne_reponse:
              bonneReponse,

            /*
             * Résultat
             */

            correcte,

            /*
             * Classe
             */

            classe: niveau,

            /*
             * Notion
             */

            notion:
              question.notion ??
              null,
          };
        }
      );

    /*
     * ========================================================
     * 3. QUESTIONS INCORRECTES
     * ========================================================
     */

    const questionsRemediation =
      questionsAvecReponses.filter(
        (question) =>
          question.correcte ===
          false
      );

    /*
     * ========================================================
     * 4. NOTIONS NON ACQUISES
     * ========================================================
     */

    const notionsNonAcquises =
      [
        ...new Set(
          questionsRemediation
            .map(
              (question) =>
                question.notion
            )
            .filter(
              (
                notion
              ): notion is string =>
                typeof notion ===
                  "string" &&
                notion.trim() !==
                  ""
            )
        ),
      ];

    /*
     * ========================================================
     * DEBUG
     * ========================================================
     */

    console.log(
      "================================================"
    );

    console.log(
      "📋 QUESTIONS DU TEST :",
      questions
    );

    console.log(
      "📋 RÉPONSES APPRENANT :",
      reponses
    );

    console.log(
      "📋 QUESTIONS AVEC COMPARAISON :",
      questionsAvecReponses
    );

    console.log(
      "❌ QUESTIONS DE REMÉDIATION :",
      questionsRemediation
    );

    console.log(
      "📚 NOTIONS NON ACQUISES :",
      notionsNonAcquises
    );

    console.log(
      "📊 Nombre questions :",
      questions.length
    );

    console.log(
      "📊 Nombre questions remédiation :",
      questionsRemediation.length
    );

    console.log(
      "================================================"
    );

    /*
     * ========================================================
     * 5. ENVOYER LES RÉPONSES AU BACKEND
     * ========================================================
     */

    try {
      const baseUrl =
        `/api/questions/${niveau}/resultats?test_id=${testId}`;

      const url =
        serie &&
        serie.toLowerCase() !==
          "none"
          ? `${baseUrl}&serie=${serie}`
          : baseUrl;

      const res =
        await api.post(
          url,
          {
            resultats:
              toutesLesReponses,
          }
        );

      /*
       * ======================================================
       * 6. DEBUG BACKEND
       * ======================================================
       */

      console.log(
        "📥 RÉPONSE BACKEND :",
        res.data
      );

      /*
       * ======================================================
       * 7. ENVOYER À RESULTATS.TSX
       * ======================================================
       */

      navigate(
        `/maths/test/resultats/${niveau}/${serie ?? "none"}`,
        {
          replace: true,

          state: {
            /*
             * Résultat officiel
             */

            resultats:
              res.data,

            /*
             * Les questions originales
             */

            questionsDuTest:
              questions,

            /*
             * Réponses brutes
             */

            reponsesDuTest:
              reponses,

            /*
             * Questions avec comparaison
             */

            questionsAvecReponses:
              questionsAvecReponses,

            /*
             * Questions incorrectes
             */

            questionsRemediation:
              questionsRemediation,

            /*
             * Notions non acquises
             */

            notionsNonAcquises:
              notionsNonAcquises,

            /*
             * Réponses envoyées
             */

            toutesLesReponses:
              toutesLesReponses,

            /*
             * Informations du test
             */

            testId:
              testId,

            niveauActuel:
              niveau,

            serieActuelle:
              serie ?? "",
          },
        }
      );

    } catch (error) {
      console.error(
        "❌ Erreur soumission :",
        error
      );

      alert(
        "Une erreur s'est produite lors de la soumission."
      );
    }
  };

  // ==========================================================
  // FIN DU TEMPS
  // ==========================================================

  const handleTimeUp = () => {
    const currentId =
      currentQuestion?.id;

    if (!currentId) {
      return;
    }

    const currentReponse =
      reponses.find(
        (r) =>
          r.questionId ===
          currentId
      );

    const isUnanswered =
      currentReponse?.reponse ===
      null;

    if (isUnanswered) {
      alert(
        "Temps écoulé sans réponse. L'évaluation va recommencer."
      );

      navigate("/matiere");

      return;
    }

    setTimersEnded(
      (prev) => ({
        ...prev,
        [currentId]: true,
      })
    );

    if (
      currentIndex <
      totalQuestions - 1
    ) {
      handleNext();
    } else {
      handleSubmit();
    }
  };

  // ==========================================================
  // PROFIL DE L'ENSEIGNANT ACTUEL
  // ==========================================================

  const currentTeacher =
    currentQuestion?.enseignant
      ? teacherProfiles[
          currentQuestion.enseignant
        ]
      : null;

  // ==========================================================
  // URL DE LA PHOTO DE L'ENSEIGNANT
  // ==========================================================

  const currentTeacherPhoto =
    currentTeacher?.teacher_photo
      ? currentTeacher.teacher_photo.startsWith(
          "http"
        )
        ? currentTeacher.teacher_photo
        : (() => {
            const baseUrl =
              api.defaults.baseURL?.replace(
                /\/$/,
                ""
              ) || "";

            const normalizedBase =
              baseUrl.endsWith("/api")
                ? baseUrl.slice(
                    0,
                    -4
                  )
                : baseUrl;

            return `${normalizedBase}/${currentTeacher.teacher_photo.replace(
              /^\//,
              ""
            )}`;
          })()
      : null;

  // ==========================================================
  // CHARGEMENT
  // ==========================================================

  if (
    authLoading ||
    loading
  ) {
    return (
      <div className="flex flex-col items-center mt-20 text-center gap-4 text-gray-700 dark:text-gray-300">
        <Loader2 className="animate-spin h-10 w-10" />

        <p>
          Chargement des questions...
        </p>
      </div>
    );
  }

  // ==========================================================
  // AFFICHAGE
  // ==========================================================

  return (
    <div className="max-w-3xl mx-auto p-4 relative">

      {/* ======================================================
          CONTRÔLES
      ====================================================== */}

      <div className="absolute top-4 right-4 flex items-center gap-4">
        <DarkModeToggle />
        <AudioManager />
      </div>

      {/* ======================================================
          CONTENEUR PRINCIPAL
      ====================================================== */}

      <div className="rounded-2xl p-6 shadow-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 space-y-6">

        {/* ====================================================
            TITRE
        ==================================================== */}

        <h1 className="text-3xl font-bold text-center text-blue-700 dark:text-blue-300">
          ÉVALUATION DIAGNOSTIQUE :{" "}
          {niveau} {serie}
        </h1>

        {/* ====================================================
            PROGRESSION
        ==================================================== */}

        <div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">

            <div
              className="bg-blue-600 h-full transition-all duration-500"
              style={{
                width: `${
                  ((currentIndex + 1) /
                    totalQuestions) *
                  100
                }%`,
              }}
            />

          </div>

          <p className="text-sm text-center mt-1 text-gray-600 dark:text-gray-400">
            Question{" "}
            {currentIndex + 1} /{" "}
            {totalQuestions}
          </p>
        </div>

        {/* ====================================================
            ENSEIGNANT DE LA QUESTION
            Placé immédiatement après la barre de progression
        ==================================================== */}

        {currentQuestion?.enseignant && (

          <div className="mt-2 mb-2 flex items-center gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm dark:border-blue-800 dark:bg-blue-950/30">

            {/* ================================================
                PHOTO
            ================================================= */}

            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-blue-500 bg-gray-200 dark:bg-gray-700">

              {currentTeacherPhoto ? (

                <img
                  src={currentTeacherPhoto}
                  alt={
                    currentTeacher
                      ? `Photo de ${currentTeacher.prenom} ${currentTeacher.nom}`
                      : "Photo de l'enseignant"
                  }
                  className="h-full w-full object-cover"

                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />

              ) : (

                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-blue-700 dark:text-blue-300">

                  {currentTeacher
                    ? `${currentTeacher.prenom?.[0] ?? ""}${currentTeacher.nom?.[0] ?? ""}`
                    : "?"}

                </div>

              )}

            </div>

            {/* ================================================
                INFORMATIONS
            ================================================= */}

            <div className="min-w-0 flex-1">

              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Enseignant
              </p>

              {currentTeacher ? (

                <>

                  {/* NOM ET PRÉNOM */}

                  <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    {currentTeacher.prenom}{" "}
                    {currentTeacher.nom}
                  </p>

                  {/* EMAIL */}

                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {currentTeacher.email}
                  </p>

                  {/* =================================================
                      TÉLÉPHONE / WHATSAPP
                  ================================================= */}

                  {currentTeacher.telephone && (

                    <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">
                      📞{" "}
                      {currentTeacher.telephone}
                    </p>

                  )}

                </>

              ) : (

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Chargement de l'enseignant...
                </p>

              )}

            </div>

          </div>

        )}

        {/* ====================================================
            QUESTION ACTUELLE
        ==================================================== */}

        {currentQuestion && (

          <motion.div
            key={
              currentQuestion.id
            }

            initial={{
              opacity: 0,
              y: 20,
            }}

            animate={{
              opacity: 1,
              y: 0,
            }}

            transition={{
              duration: 0.5,
            }}

            className="p-4 border rounded-xl shadow-md bg-white dark:bg-gray-800"
          >

            {/* ================================================
                SITUATION
            ================================================= */}

            {currentQuestion
              .situation
              ?.texte && (

              <p className="mb-3 italic text-gray-700 dark:text-gray-300">
                {
                  currentQuestion
                    .situation
                    .texte
                }
              </p>

            )}

            {/* ================================================
                IMAGE DE LA SITUATION
            ================================================= */}

            {currentQuestion
              .situation
              ?.image && (

              <div className="mb-4 flex justify-center">

                <img
                  src={
                    currentQuestion
                      .situation
                      .image
                  }
                  alt="Illustration"
                  className="rounded-lg shadow max-w-full h-auto"
                />

              </div>

            )}

            {/* ================================================
                QUESTION + CHRONOMÈTRE
            ================================================= */}

            <div className="flex justify-between items-start mb-4">

              <div
                className="font-medium text-lg text-gray-800 dark:text-gray-200 w-full pr-4"

                dangerouslySetInnerHTML={{
                  __html:
                    currentQuestion.question,
                }}
              />

              <CountdownCircle
                key={
                  currentQuestion.id
                }

                duration={
                  currentQuestion.duree ??
                  60
                }

                initialRemainingTime={
                  remainingTime[
                    currentQuestion.id
                  ]
                }

                onTick={(
                  timeLeft
                ) =>
                  setRemainingTime(
                    (prev) => ({
                      ...prev,
                      [currentQuestion.id]:
                        timeLeft,
                    })
                  )
                }

                onComplete={
                  handleTimeUp
                }
              />

            </div>

            {/* ==================================================
                OPTIONS
            ================================================== */}

            {!currentQuestion.choix ? (

              <div>
                Chargement des options...
              </div>

            ) : (

              <div className="grid gap-4 mt-4">

                {currentQuestion.choix.map(
                  (
                    opt,
                    idx
                  ) => {

                    const selected =
                      reponses.find(
                        (r) =>
                          r.questionId ===
                          currentQuestion.id
                      )?.reponse ===
                      idx;

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

                          checked={
                            selected
                          }

                          onChange={() =>
                            handleOptionSelect(
                              currentQuestion.id,
                              idx
                            )
                          }

                          className="accent-blue-600 scale-125"
                        />

                        <span className="text-gray-800 dark:text-gray-200">
                          {opt}
                        </span>

                      </label>

                    );
                  }
                )}

              </div>

            )}

          </motion.div>

        )}

        {/* ======================================================
            NAVIGATION
        ====================================================== */}

        <div className="flex justify-between items-center mt-6">

          {/* ====================================================
              PRÉCÉDENT
          ==================================================== */}

          <button
            onClick={
              handlePrevious
            }

            disabled={
              currentIndex === 0
            }

            className="px-4 py-2 rounded-full border text-sm transition disabled:opacity-40
              bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
          >
            ← Précédent
          </button>

          {/* ====================================================
              SUIVANT / TERMINER
          ==================================================== */}

          {currentIndex <
          totalQuestions - 1 ? (

            <button
              onClick={
                handleNext
              }

              className="bg-blue-600 text-white px-6 py-2 rounded-full shadow hover:bg-blue-700 transition"
            >
              Suivant →
            </button>

          ) : (

            <button
              onClick={
                handleSubmit
              }

              disabled={
                !allAnswered
              }

              className={`px-6 py-2 rounded-full shadow flex items-center gap-2 transition
                ${
                  allAnswered
                    ? "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                    : "bg-gray-400 text-gray-700 cursor-not-allowed"
                }`}
            >

              <CheckCircle className="w-5 h-5" />

              Terminer
              l'évaluation

            </button>

          )}

        </div>

      </div>

    </div>
  );
};

export default Questions;