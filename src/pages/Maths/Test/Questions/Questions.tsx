import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/utils/axios";
import { motion } from "framer-motion";
import { Loader2, CheckCircle } from "lucide-react";
import DarkModeToggle from "@/components/DarkModeToggle";
import AudioManager from "@/components/AudioManager";
import CountdownCircle from "@/components/CountdownCircle";
import { useAuth } from "../../../../hooks/useAuth";

// ============================================================
// TYPES
// ============================================================

type Question = {
  id: string;
  question: string;
  choix: string[];

  bonneReponse?: string;
  bonne_reponse?: string;

  notion: string;
  duree?: number;

  // Matière
  matiere?: string;

  // Série
  serie?: string | string[];

  // Enseignant
  enseignant?: string;

  situation?: {
    texte?: string;
    image?: string;
  };

  [key: string]: any;
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
  telephone?: string | null;
  pays_residence?: string | null;
  teacher_photo?: string | null;
};

// ============================================================
// COMPOSANT
// ============================================================

const Questions = () => {
  // ==========================================================
  // PARAMÈTRES URL
  //
  // /test/questions/:matiere/:niveau/:serie
  //
  // Exemples :
  // /test/questions/maths/6e/none
  // /test/questions/maths/5e/none
  // /test/questions/maths/2nde/a
  // /test/questions/maths/1ere/a1
  // /test/questions/maths/tle/d
  // ==========================================================

  const { matiere, niveau, serie } = useParams<{
    matiere: string;
    niveau: string;
    serie: string;
  }>();

  const navigate = useNavigate();

  const { loading: authLoading } = useAuth();

  // ==========================================================
  // ÉTATS
  // ==========================================================

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [reponses, setReponses] =
    useState<Reponse[]>([]);

  const [currentIndex, setCurrentIndex] =
    useState<number>(0);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [timersEnded, setTimersEnded] =
    useState<TimerStatus>({});

  const [testId, setTestId] =
    useState<string | null>(null);

  const [remainingTime, setRemainingTime] =
    useState<{ [key: string]: number }>({});

  // ==========================================================
  // PROFILS ENSEIGNANTS
  // ==========================================================

  const [teacherProfiles, setTeacherProfiles] =
    useState<Record<string, TeacherProfile | null>>({});

  const questionSoundRef =
    useRef<HTMLAudioElement | null>(null);

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
  // NORMALISATION DES NIVEAUX
  // ==========================================================

  const normalizeNiveau = (value?: string) => {
    if (!value) return "";

    const normalized = value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

    const mapping: Record<string, string> = {
      "6eme": "6e",
      "5eme": "5e",
      "4eme": "4e",
      "3eme": "3e",

      "2nde": "2nde",
      "seconde": "2nde",

      "1ere": "1ere",
      "1re": "1ere",
      "premiere": "1ere",

      terminale: "tle",
      tle: "tle",
    };

    return mapping[normalized] ?? normalized;
  };

  // ==========================================================
  // NORMALISATION MATIÈRE
  // ==========================================================

  const normalizeMatiere = (value?: string) => {
    if (!value) return "";

    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "")
      .replace(/[-_]/g, "");
  };

  // ==========================================================
  // NORMALISATION SÉRIE
  // ==========================================================

  const normalizeSerie = (value?: string) => {
    if (!value) return "";

    const normalized = value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

    if (
      normalized === "none" ||
      normalized === "null" ||
      normalized === ""
    ) {
      return "";
    }

    return normalized.toUpperCase();
  };

  // ==========================================================
  // NIVEAU NORMALISÉ ACTUEL
  // ==========================================================

  const niveauNormalise =
    normalizeNiveau(niveau);

  // ==========================================================
  // SÉRIE NORMALISÉE ACTUELLE
  // ==========================================================

  const serieNormalisee =
    normalizeSerie(serie);

  // ==========================================================
  // REMONTER EN HAUT À CHAQUE QUESTION
  // ==========================================================

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [currentIndex]);

  // ==========================================================
  // QUESTION ACTUELLE
  // ==========================================================

  const currentQuestion =
    questions[currentIndex];

  const totalQuestions =
    questions.length;

  const allAnswered =
    reponses.length > 0 &&
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
  // PROFILS DES ENSEIGNANTS
  // ==========================================================

  const fetchTeacherProfiles = async (
    questionsRecues: Question[]
  ) => {
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
          const res =
            await api.get(
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
  //
  // RÈGLE PÉDAGOGIQUE :
  //
  // 6e  -> uniquement 6e
  //
  // 5e  -> uniquement 6e
  //
  // 4e  -> 6e + 5e
  //
  // 3e  -> 6e + 5e + 4e
  //
  // 2nde -> 6e + 5e + 4e + 3e
  //
  // 1ere -> collège + 2nde de la même série
  //
  // tle -> collège + 2nde + 1ere
  //
  // JAMAIS la classe actuelle.
  // ==========================================================

  useEffect(() => {
    const fetchTest = async () => {
      try {
        // ------------------------------------------------------
        // VÉRIFICATION
        // ------------------------------------------------------

        if (!matiere || !niveau) {
          console.error(
            "Paramètres manquants :",
            {
              matiere,
              niveau,
              serie,
            }
          );

          setLoading(false);
          return;
        }

        // ------------------------------------------------------
        // NIVEAU NORMALISÉ
        // ------------------------------------------------------

        const niveauActuel =
          normalizeNiveau(niveau);

        // ------------------------------------------------------
        // SÉRIE
        // ------------------------------------------------------

        const serieActuelle =
          normalizeSerie(serie);

        // ------------------------------------------------------
        // DÉTERMINER SI L'ON EST AU COLLÈGE
        // ------------------------------------------------------

        const estCollege =
          generalLevels.includes(
            niveauActuel as
              (typeof generalLevels)[number]
          );

        // ------------------------------------------------------
        // DÉTERMINER SI L'ON EST AU LYCÉE
        // ------------------------------------------------------

        const estLycee =
          lyceeLevels.includes(
            niveauActuel as
              (typeof lyceeLevels)[number]
          );

        // ------------------------------------------------------
        // LA SÉRIE EST OBLIGATOIRE AU LYCÉE
        // ------------------------------------------------------

        if (
          estLycee &&
          !serieActuelle
        ) {
          console.error(
            "❌ Série obligatoire pour un niveau du lycée."
          );

          setLoading(false);

          alert(
            "La série est obligatoire pour ce niveau."
          );

          navigate("/");

          return;
        }

        // ------------------------------------------------------
        // INFORMATION DE DEBUG
        // ------------------------------------------------------

        console.log(
          "================================================"
        );

        console.log(
          "📚 MATIÈRE :",
          matiere
        );

        console.log(
          "🎓 NIVEAU ACTUEL :",
          niveauActuel
        );

        console.log(
          "📖 SÉRIE ACTUELLE :",
          serieActuelle || "none"
        );

        console.log(
          "📌 RÈGLE : EXCLURE LA CLASSE ACTUELLE"
        );

        console.log(
          "================================================"
        );

        // ------------------------------------------------------
        // PARAMÈTRES BACKEND
        // ------------------------------------------------------

        const params: Record<
          string,
          string
        > = {
          matiere:
            normalizeMatiere(
              matiere
            ),

          // IMPORTANT :
          // On demande au backend de construire
          // le test avec les niveaux précédents.
          //
          // Le backend doit donc :
          //
          // - exclure le niveau actuel
          // - conserver la série demandée
          //   pour les niveaux lycée précédents.
          //
          // Exemple :
          //
          // 1ere A1
          // => 6e,5e,4e,3e + 2nde A1
          //
          // Tle F2
          // => 6e,5e,4e,3e + 2nde F2 + 1ere F2

          exclure_niveau_actuel:
            "true",
        };

        // ------------------------------------------------------
        // AJOUT DE LA SÉRIE SI NÉCESSAIRE
        // ------------------------------------------------------

        if (
          estLycee &&
          serieActuelle
        ) {
          params.serie =
            serieActuelle;
        }

        // ------------------------------------------------------
        // APPEL BACKEND
        // ------------------------------------------------------

        const res =
          await api.get(
            `/api/questions/${niveauActuel}/generation`,
            {
              params,
            }
          );

        // ------------------------------------------------------
        // RÉCUPÉRATION
        // ------------------------------------------------------

        const {
          test_id,
          questions:
            questionsRecues,
        } = res.data;

        // ------------------------------------------------------
        // VALIDATION
        // ------------------------------------------------------

        if (
          !Array.isArray(
            questionsRecues
          ) ||
          questionsRecues.length === 0
        ) {
          console.error(
            "❌ Aucune question reçue."
          );

          alert(
            "Aucune question disponible pour ce niveau."
          );

          setLoading(false);

          return;
        }

        // ------------------------------------------------------
        // ENREGISTRER LE TEST
        // ------------------------------------------------------

        setTestId(test_id);

        // ------------------------------------------------------
        // ENREGISTRER LES QUESTIONS
        // ------------------------------------------------------

        setQuestions(
          questionsRecues
        );

        // ------------------------------------------------------
        // INITIALISER LES RÉPONSES
        // ------------------------------------------------------

        setReponses(
          questionsRecues.map(
            (q: Question) => ({
              questionId:
                String(q.id),

              reponse:
                null,

              notion:
                q.notion ?? "",
            })
          )
        );

        // ------------------------------------------------------
        // PROFILS ENSEIGNANTS
        // ------------------------------------------------------

        await fetchTeacherProfiles(
          questionsRecues
        );

        // ------------------------------------------------------
        // DEBUG
        // ------------------------------------------------------

        console.log(
          "📋 QUESTIONS REÇUES :",
          questionsRecues
        );

        console.log(
          "📊 NOMBRE DE QUESTIONS :",
          questionsRecues.length
        );

        // ------------------------------------------------------
        // FIN CHARGEMENT
        // ------------------------------------------------------

        setLoading(false);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des questions :",
          error
        );

        alert(
          "Impossible de charger les questions du test."
        );

        setLoading(false);
      }
    };

    if (
      matiere &&
      niveau
    ) {
      fetchTest();
    }
  }, [
    matiere,
    niveau,
    serie,
    navigate,
  ]);

  // ==========================================================
  // SON
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
  // SÉLECTION OPTION
  // ==========================================================

  const handleOptionSelect = (
    questionId: string,
    selected: number
  ) => {
    setReponses((prev) =>
      prev.map((r) =>
        r.questionId ===
        questionId
          ? {
              ...r,
              reponse:
                selected,
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
          currentQuestion?.id
      );

    if (
      currentReponse?.reponse ===
      null
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
      nextIndex <
        totalQuestions &&
      timersEnded[
        questions[nextIndex].id
      ]
    ) {
      nextIndex++;
    }

    if (
      nextIndex <
      totalQuestions
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

  const handleSubmit =
    async () => {
      if (!testId) {
        alert(
          "Erreur : test ID manquant, impossible de soumettre les réponses."
        );

        return;
      }

      if (
        !matiere ||
        !niveau
      ) {
        alert(
          "Erreur : matière ou niveau manquant."
        );

        return;
      }

      // --------------------------------------------------------
      // RÉPONSES DE L'APPRENANT
      // --------------------------------------------------------

      const toutesLesReponses =
        reponses.map((r) => {
          const lettre =
            [
              "a",
              "b",
              "c",
              "d",
              "e",
            ][
              r.reponse ?? 0
            ];

          return {
            id: String(
              r.questionId
            ),

            reponse:
              lettre,
          };
        });

      // --------------------------------------------------------
      // QUESTIONS AVEC COMPARAISON
      // --------------------------------------------------------

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
              indexReponse !==
              null
                ? [
                    "a",
                    "b",
                    "c",
                    "d",
                    "e",
                  ][
                    indexReponse
                  ]
                : null;

            const bonneReponse =
              question.bonneReponse ??
              question.bonne_reponse ??
              "";

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

              matiere:
                question.matiere ??
                matiere,

              serie:
                question.serie ??
                serie ??
                "none",

              reponse_apprenant:
                reponseApprenant,

              bonne_reponse:
                bonneReponse,

              correcte,

              classe:
                question.niveau ??
                niveau,

              notion:
                question.notion ??
                null,
            };
          }
        );

      // --------------------------------------------------------
      // QUESTIONS INCORRECTES
      // --------------------------------------------------------

      const questionsRemediation =
        questionsAvecReponses.filter(
          (question) =>
            question.correcte ===
            false
        );

      // --------------------------------------------------------
      // NOTIONS NON ACQUISES
      // --------------------------------------------------------

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

      // --------------------------------------------------------
      // DEBUG
      // --------------------------------------------------------

      console.log(
        "================================================"
      );

      console.log(
        "📚 MATIÈRE :",
        matiere
      );

      console.log(
        "🎓 NIVEAU :",
        niveau
      );

      console.log(
        "📖 SÉRIE :",
        serie
      );

      console.log(
        "🆔 TEST ID :",
        testId
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

      // --------------------------------------------------------
      // ENVOI BACKEND
      // --------------------------------------------------------

      try {
        const res =
          await api.post(
            `/api/questions/${niveau}/resultats`,
            {
              matiere,

              niveau,

              serie:
                serie &&
                serie.toLowerCase() !==
                  "none"
                  ? serie
                  : "none",

              test_id:
                testId,

              resultats:
                toutesLesReponses,
            }
          );

        // ------------------------------------------------------
        // DEBUG
        // ------------------------------------------------------

        console.log(
          "📥 RÉPONSE BACKEND :",
          res.data
        );

        // ------------------------------------------------------
        // NAVIGATION RESULTATS
        // ------------------------------------------------------

        navigate(
          `/test/resultats/${matiere}/${niveau}/${serie ?? "none"}`,
          {
            replace: true,

            state: {
              matiereActuelle:
                matiere,

              resultats:
                res.data,

              questionsDuTest:
                questions,

              reponsesDuTest:
                reponses,

              questionsAvecReponses:
                questionsAvecReponses,

              questionsRemediation:
                questionsRemediation,

              notionsNonAcquises:
                notionsNonAcquises,

              toutesLesReponses:
                toutesLesReponses,

              testId:
                testId,

              niveauActuel:
                niveau,

              serieActuelle:
                serie ?? "none",
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
        [currentId]:
          true,
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
  // ENSEIGNANT ACTUEL
  // ==========================================================

  const currentTeacher =
    currentQuestion?.enseignant
      ? teacherProfiles[
          currentQuestion
            .enseignant
        ]
      : null;

  // ==========================================================
  // PROFIL ENSEIGNANT
  // ==========================================================

  const handleTeacherProfile =
    () => {
      if (
        !currentTeacher?.email
      ) {
        return;
      }

      navigate(
        `/enseignant/profil/${encodeURIComponent(
          currentTeacher.email
        )}`
      );
    };

  // ==========================================================
  // PHOTO ENSEIGNANT
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
                /\/+$/,
                ""
              ) || "";

            const normalizedBase =
              baseUrl.endsWith(
                "/api"
              )
                ? baseUrl.slice(
                    0,
                    -4
                  )
                : baseUrl;

            return `${normalizedBase}/${currentTeacher.teacher_photo.replace(
              /^\/+/,
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
      ======================================================= */}

      <div className="absolute top-4 right-4 flex items-center gap-4">
        <DarkModeToggle />
        <AudioManager />
      </div>

      {/* ======================================================
          CONTENEUR PRINCIPAL
      ======================================================= */}

      <div className="rounded-2xl p-6 shadow-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 space-y-6">

        {/* ====================================================
            TITRE
        ===================================================== */}

        <h1 className="text-3xl font-bold text-center text-blue-700 dark:text-blue-300">
          ÉVALUATION DIAGNOSTIQUE :{" "}
          {matiere}
          {" — "}
          {niveau}

          {serie &&
          serie.toLowerCase() !==
            "none"
            ? ` — ${serie}`
            : ""}
        </h1>

        {/* ====================================================
            INFORMATION SUR LA RÈGLE
        ===================================================== */}

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Cette évaluation porte sur les
          notions des classes précédentes sauf la classe de 6ème.
        </div>

        {/* ====================================================
            PROGRESSION
        ===================================================== */}

        <div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-500"
              style={{
                width: `${
                  totalQuestions > 0
                    ? ((currentIndex + 1) /
                        totalQuestions) *
                      100
                    : 0
                }%`,
              }}
            />
          </div>

          <p className="text-sm text-center mt-1 text-gray-600 dark:text-gray-400">
            Question{" "}
            {totalQuestions > 0
              ? currentIndex + 1
              : 0}{" "}
            /{" "}
            {totalQuestions}
          </p>
        </div>

        {/* ====================================================
            ENSEIGNANT
        ===================================================== */}

        {currentQuestion?.enseignant && (
          <div className="mt-2 mb-2 flex items-center gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm dark:border-blue-800 dark:bg-blue-950/30">

            {/* PHOTO */}

            <button
              type="button"
              onClick={
                handleTeacherProfile
              }
              disabled={
                !currentTeacher
              }
              className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-blue-500 bg-gray-200 dark:bg-gray-700 hover:ring-4 hover:ring-blue-300 dark:hover:ring-blue-800 transition-all cursor-pointer disabled:cursor-default focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
              title={
                currentTeacher
                  ? "Voir le profil de l'enseignant"
                  : "Chargement de l'enseignant..."
              }
            >
              {currentTeacherPhoto ? (
                <img
                  src={
                    currentTeacherPhoto
                  }
                  alt={
                    currentTeacher
                      ? `Photo de ${currentTeacher.prenom} ${currentTeacher.nom}`
                      : "Photo de l'enseignant"
                  }
                  className="h-full w-full object-cover"
                  onError={(
                    event
                  ) => {
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
            </button>

            {/* NOM */}

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Enseignant
              </p>

              {currentTeacher ? (
                <button
                  type="button"
                  onClick={
                    handleTeacherProfile
                  }
                  className="text-lg font-bold text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 hover:underline transition text-left focus:outline-none"
                  title="Voir le profil de l'enseignant"
                >
                  {
                    currentTeacher.prenom
                  }{" "}
                  {
                    currentTeacher.nom
                  }
                </button>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Chargement de l'enseignant...
                </p>
              )}
            </div>
          </div>
        )}

        {/* ====================================================
            QUESTION
        ===================================================== */}

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

            {/* SITUATION */}

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

            {/* IMAGE */}

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

            {/* QUESTION + CHRONOMÈTRE */}

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

            {/* OPTIONS */}

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
                        className={`flex items-center gap-3 p-4 border rounded-lg shadow-sm cursor-pointer transition text-base ${
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

        {/* ====================================================
            NAVIGATION
        ===================================================== */}

        <div className="flex justify-between items-center mt-6">

          {/* PRÉCÉDENT */}

          <button
            onClick={
              handlePrevious
            }
            disabled={
              currentIndex === 0
            }
            className="px-4 py-2 rounded-full border text-sm transition disabled:opacity-40 bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
          >
            ← Précédent
          </button>

          {/* SUIVANT / TERMINER */}

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
              className={`px-6 py-2 rounded-full shadow flex items-center gap-2 transition ${
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