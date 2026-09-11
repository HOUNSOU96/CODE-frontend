import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import api from "@/utils/axios";

/*
 * ==========================================================
 * TYPES
 * ==========================================================
 */

type QuestionRemediation = {
  id: string | number;

  question: string;

  choix?: string[];

  bonne_reponse?: string | null;

  bonneReponse?: string | null;

  reponse_apprenant?: string | null;

  reponseUser?: string | null;

  reponse_user?: string | null;

  notion?: string | null;

  notions?: string | null;

  theme?: string | null;

  chapitre?: string | null;

  niveau?: string | null;

  classe?: string | null;

  enseignant?: string | null;

  situation?: {
    texte?: string;

    image?: string;
  };

  correcte?: boolean;

  [key: string]: any;
};

/*
 * ==========================================================
 * PROFIL PUBLIC DE L'ENSEIGNANT
 * ==========================================================
 */

type TeacherProfile = {
  id?: number;

  nom: string;

  prenom: string;

  email: string;

  telephone?: string | null;

  pays_residence?: string | null;

  teacher_photo?: string | null;

  subjects?: string[];
};

/*
 * ==========================================================
 * RÉSULTATS
 * ==========================================================
 */

type ResultatType = {
  note: number;

  mention: string;

  niveau?: string;

  serie?: string | null;

  nbQuestions?: number;

  nbBonnesReponses?: number;

  notionsNonAcquises?: string[];

  notions_non_acquises?: string[];

  questionsRemediation?: QuestionRemediation[];

  questions_remediation?: QuestionRemediation[];

  questions?: QuestionRemediation[];

  [key: string]: any;
};

/*
 * ==========================================================
 * LOCATION STATE
 * ==========================================================
 */

type LocationState = {
  resultats?: ResultatType;

  questionsRemediation?: QuestionRemediation[];

  questions_remediation?: QuestionRemediation[];

  questionsDuTest?: QuestionRemediation[];

  reponsesDuTest?: any[];

  notions_non_acquises?: string[];

  notionsNonAcquises?: string[];

  niveauActuel?: string;

  serieActuelle?: string;

  [key: string]: any;
};

/*
 * ==========================================================
 * NIVEAUX SANS SÉRIE
 * ==========================================================
 */

const niveauxSansSerie = [
  "6e",
  "5e",
  "4e",
  "3e",
];

/*
 * ==========================================================
 * COMPOSANT
 * ==========================================================
 */

const Remediation: React.FC = () => {
  /*
   * ========================================================
   * REMONTER EN HAUT À L'ARRIVÉE
   * ========================================================
   */

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);

  const location = useLocation();

  const navigate = useNavigate();

  /*
   * ========================================================
   * LOCATION STATE
   * ========================================================
   */

  const state =
    (location.state || {}) as LocationState;

  /*
   * ========================================================
   * RÉSULTATS
   * ========================================================
   */

  const resultatsTransmis =
    state.resultats ?? null;

  /*
   * ========================================================
   * QUESTIONS TRANSMISES DIRECTEMENT
   * ========================================================
   */

  const questionsRemediationTransmises =
    state.questionsRemediation ??
    state.questions_remediation ??
    [];

  /*
   * ========================================================
   * QUESTIONS DU TEST
   * ========================================================
   */

  const questionsDuTest =
    state.questionsDuTest ??
    [];

  /*
   * ========================================================
   * RÉPONSES DU TEST
   * ========================================================
   */

  const reponsesDuTest =
    state.reponsesDuTest ??
    [];

  /*
   * ========================================================
   * ÉTAT LOCAL
   * ========================================================
   */

  const [resultats, setResultats] =
    useState<ResultatType | null>(
      resultatsTransmis
    );

  const [loadingResultats, setLoadingResultats] =
    useState(false);

  const [errorResultats, setErrorResultats] =
    useState<string | null>(null);

  /*
   * ========================================================
   * PROFILS DES ENSEIGNANTS
   * ========================================================
   */

  const [teacherProfiles, setTeacherProfiles] =
    useState<
      Record<
        string,
        TeacherProfile | null
      >
    >({});

  /*
   * ========================================================
   * ÉTAPE ACTUELLE
   *
   * 0 = résultats généraux
   * 1...N = questions
   * N+1 = résumé
   * N+2 = notions
   * N+3 = message final
   * ========================================================
   */

  const [currentStep, setCurrentStep] =
    useState(0);

  /*
   * ========================================================
   * NIVEAU / SÉRIE
   * ========================================================
   */

  const niveau =
    state.niveauActuel ??
    resultats?.niveau ??
    "";

  const serie =
    state.serieActuelle ??
    resultats?.serie ??
    "";

  /*
   * ========================================================
   * DEBUG
   * ========================================================
   */

  useEffect(() => {
    console.log(
      "================================================"
    );

    console.log(
      "📦 REMEDIATION.TSX"
    );

    console.log(
      "📦 location.state =",
      location.state
    );

    console.log(
      "📊 resultats =",
      resultatsTransmis
    );

    console.log(
      "📚 questionsRemediation transmises =",
      questionsRemediationTransmises
    );

    console.log(
      "📚 questionsDuTest =",
      questionsDuTest
    );

    console.log(
      "📝 reponsesDuTest =",
      reponsesDuTest
    );

    console.log(
      "📚 notionsNonAcquises =",
      state.notionsNonAcquises ??
        state.notions_non_acquises
    );

    console.log(
      "================================================"
    );
  }, [
    location.state,
    resultatsTransmis,
    questionsRemediationTransmises,
    questionsDuTest,
    reponsesDuTest,
    state.notionsNonAcquises,
    state.notions_non_acquises,
  ]);

  /*
   * ========================================================
   * RÉSULTATS TRANSMIS OU FALLBACK BACKEND
   * ========================================================
   */

  useEffect(() => {
    if (resultatsTransmis) {
      console.log(
        "✅ Résultats reçus depuis Resultats.tsx"
      );

      setResultats(
        resultatsTransmis
      );

      setLoadingResultats(false);

      return;
    }

    if (!niveau) {
      setErrorResultats(
        "Aucun résultat d'évaluation n'a été transmis."
      );

      setLoadingResultats(false);

      return;
    }

    const recupererResultats =
      async () => {
        try {
          setLoadingResultats(true);

          setErrorResultats(null);

          console.log(
            "📡 Aucun résultat dans location.state."
          );

          console.log(
            "📡 Récupération du dernier résultat depuis le backend..."
          );

          const res =
            await api.get(
              "/api/resultats/dernier",
              {
                params: {
                  niveau,

                  serie:
                    serie ||
                    undefined,
                },
              }
            );

          console.log(
            "📥 Résultat récupéré :",
            res.data
          );

          setResultats(
            res.data
          );
        } catch (error) {
          console.error(
            "❌ Erreur récupération résultats :",
            error
          );

          setErrorResultats(
            "Impossible de récupérer les résultats de l'évaluation."
          );
        } finally {
          setLoadingResultats(false);
        }
      };

    recupererResultats();
  }, [
    resultatsTransmis,
    niveau,
    serie,
  ]);

  /*
   * ========================================================
   * QUESTIONS À AFFICHER
   * ========================================================
   */

  const toutesLesQuestions =
    useMemo<QuestionRemediation[]>(() => {
      let questions:
        QuestionRemediation[] = [];

      if (
        Array.isArray(
          questionsRemediationTransmises
        ) &&
        questionsRemediationTransmises.length > 0
      ) {
        questions =
          questionsRemediationTransmises;
      } else if (
        Array.isArray(
          resultats?.questionsRemediation
        )
      ) {
        questions =
          resultats.questionsRemediation;
      } else if (
        Array.isArray(
          resultats?.questions_remediation
        )
      ) {
        questions =
          resultats.questions_remediation;
      } else if (
        Array.isArray(
          resultats?.questions
        )
      ) {
        questions =
          resultats.questions;
      }

      return questions.map(
        (
          question,
          index
        ) => ({
          ...question,

          id:
            question.id ??
            `question-remediation-${index}`,
        })
      );
    }, [
      questionsRemediationTransmises,
      resultats,
    ]);

  /*
   * ========================================================
   * RÉINITIALISER L'ÉTAPE SI LES QUESTIONS CHANGENT
   * ========================================================
   */

  useEffect(() => {
    setCurrentStep(0);
  }, [
    toutesLesQuestions.length,
  ]);

  /*
   * ========================================================
   * RÉCUPÉRATION DES PROFILS ENSEIGNANTS
   * ========================================================
   */

  useEffect(() => {
    const recupererProfilsEnseignants =
      async () => {
        const emails = [
          ...new Set(
            toutesLesQuestions
              .map(
                (question) =>
                  question.enseignant
              )
              .filter(
                (
                  email
                ): email is string =>
                  typeof email ===
                    "string" &&
                  email.trim() !== ""
              )
          ),
        ];

        if (
          emails.length === 0
        ) {
          setTeacherProfiles({});
          return;
        }

        const profiles:
          Record<
            string,
            TeacherProfile | null
          > = {};

        await Promise.all(
          emails.map(
            async (email) => {
              if (
                teacherProfiles[email]
              ) {
                profiles[email] =
                  teacherProfiles[email];

                return;
              }

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

                console.log(
                  "👨‍🏫 Profil enseignant récupéré :",
                  res.data
                );
              } catch (error) {
                console.error(
                  `❌ Impossible de récupérer le profil de ${email}`,
                  error
                );

                profiles[email] =
                  null;
              }
            }
          )
        );

        setTeacherProfiles(
          (previous) => ({
            ...previous,
            ...profiles,
          })
        );
      };

    if (
      toutesLesQuestions.length > 0
    ) {
      recupererProfilsEnseignants();
    }
  }, [
    toutesLesQuestions,
  ]);

  /*
   * ========================================================
   * DEBUG QUESTIONS
   * ========================================================
   */

  useEffect(() => {
    console.log(
      "================================================"
    );

    console.log(
      "📚 QUESTIONS DE REMÉDIATION"
    );

    console.log(
      "📚 Nombre :",
      toutesLesQuestions.length
    );

    console.log(
      "📚 Données :",
      toutesLesQuestions
    );

    toutesLesQuestions.forEach(
      (
        question,
        index
      ) => {
        console.log(
          `📌 Question ${index + 1}`,
          {
            niveau:
              question.niveau,

            bonne_reponse:
              question.bonne_reponse ??
              question.bonneReponse,

            reponse_apprenant:
              question.reponse_apprenant ??
              question.reponseUser ??
              question.reponse_user,

            choix:
              question.choix,

            enseignant:
              question.enseignant,
          }
        );
      }
    );

    console.log(
      "================================================"
    );
  }, [
    toutesLesQuestions,
  ]);

  /*
   * ========================================================
   * NORMALISER UNE VALEUR
   * ========================================================
   */

  const normaliser =
    (
      valeur: unknown
    ): string => {
      if (
        valeur === undefined ||
        valeur === null
      ) {
        return "";
      }

      return String(valeur)
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          ""
        );
    };

  /*
   * ========================================================
   * RÉCUPÉRER LE TEXTE D'UN CHOIX À PARTIR D'UNE LETTRE
   * ========================================================
   */

  const getChoixDepuisLettre =
    (
      reponse: string,
      question: QuestionRemediation
    ): string | null => {
      if (
        !Array.isArray(
          question.choix
        )
      ) {
        return null;
      }

      const reponseNormalisee =
        normaliser(
          reponse
        );

      if (
        !/^[a-e]$/.test(
          reponseNormalisee
        )
      ) {
        return null;
      }

      const index =
        reponseNormalisee.charCodeAt(0) -
        97;

      if (
        index < 0 ||
        index >= question.choix.length
      ) {
        return null;
      }

      return String(
        question.choix[index]
      );
    };

  /*
   * ========================================================
   * BONNE RÉPONSE
   * ========================================================
   */

  const getBonneReponseAffichage =
    (
      question: QuestionRemediation
    ): string => {
      const bonneReponse =
        question.bonne_reponse ??
        question.bonneReponse;

      if (
        bonneReponse === undefined ||
        bonneReponse === null ||
        String(
          bonneReponse
        ).trim() === ""
      ) {
        return "Non précisée";
      }

      const bonneReponseTexte =
        String(
          bonneReponse
        ).trim();

      const contenuChoix =
        getChoixDepuisLettre(
          bonneReponseTexte,
          question
        );

      if (
        contenuChoix !== null
      ) {
        return contenuChoix;
      }

      return bonneReponseTexte;
    };

  /*
   * ========================================================
   * RÉPONSE APPRENANT
   * ========================================================
   */

  const getReponseUserAffichage =
    (
      question: QuestionRemediation
    ): string => {
      const reponseUser =
        question.reponse_apprenant ??
        question.reponseUser ??
        question.reponse_user;

      if (
        reponseUser === undefined ||
        reponseUser === null ||
        String(
          reponseUser
        ).trim() === ""
      ) {
        return "Aucune réponse";
      }

      const reponseTexte =
        String(
          reponseUser
        ).trim();

      const contenuChoix =
        getChoixDepuisLettre(
          reponseTexte,
          question
        );

      if (
        contenuChoix !== null
      ) {
        return contenuChoix;
      }

      return reponseTexte;
    };

  /*
   * ========================================================
   * VÉRIFIER SI LA QUESTION EST CORRECTE
   * ========================================================
   */

  const estQuestionCorrecte =
    (
      question: QuestionRemediation
    ): boolean => {
      const reponseUser =
        question.reponse_apprenant ??
        question.reponseUser ??
        question.reponse_user;

      const bonneReponse =
        question.bonne_reponse ??
        question.bonneReponse;

      if (
        reponseUser === undefined ||
        reponseUser === null ||
        bonneReponse === undefined ||
        bonneReponse === null
      ) {
        return false;
      }

      const userNormalise =
        normaliser(
          reponseUser
        );

      const bonneNormalisee =
        normaliser(
          bonneReponse
        );

      if (
        userNormalise === "" ||
        bonneNormalisee === ""
      ) {
        return false;
      }

      /*
       * CAS 1 :
       * Les deux réponses sont des lettres.
       */

      if (
        /^[a-e]$/.test(
          userNormalise
        ) &&
        /^[a-e]$/.test(
          bonneNormalisee
        )
      ) {
        return (
          userNormalise ===
          bonneNormalisee
        );
      }

      /*
       * CAS 2 :
       * L'apprenant répond par une lettre,
       * la bonne réponse contient le texte.
       */

      if (
        /^[a-e]$/.test(
          userNormalise
        ) &&
        Array.isArray(
          question.choix
        )
      ) {
        const contenuChoixUser =
          getChoixDepuisLettre(
            userNormalise,
            question
          );

        if (
          contenuChoixUser !== null
        ) {
          return (
            normaliser(
              contenuChoixUser
            ) ===
            bonneNormalisee
          );
        }
      }

      /*
       * CAS 3 :
       * La bonne réponse est une lettre,
       * l'apprenant fournit le texte.
       */

      if (
        /^[a-e]$/.test(
          bonneNormalisee
        ) &&
        Array.isArray(
          question.choix
        )
      ) {
        const contenuChoixBonne =
          getChoixDepuisLettre(
            bonneNormalisee,
            question
          );

        if (
          contenuChoixBonne !== null
        ) {
          return (
            normaliser(
              contenuChoixBonne
            ) ===
            userNormalise
          );
        }
      }

      /*
       * CAS 4 :
       * Les deux sont directement du texte.
       */

      return (
        userNormalise ===
        bonneNormalisee
      );
    };

  /*
   * ========================================================
   * NOTION
   * ========================================================
   */

  const getNotionQuestion =
    (
      question: QuestionRemediation
    ): string => {
      return (
        question.notion ??
        question.notions ??
        question.theme ??
        question.chapitre ??
        "Non précisée"
      );
    };

  /*
   * ========================================================
   * CLASSE / NIVEAU DE LA QUESTION
   * ========================================================
   */

  const getClasseQuestion =
    (
      question: QuestionRemediation
    ): string => {
      return (
        question.niveau ??
        "Non précisée"
      );
    };

  /*
   * ========================================================
   * QUESTIONS CORRECTES
   * ========================================================
   */

  const questionsCorrectes =
    toutesLesQuestions.filter(
      estQuestionCorrecte
    );

  /*
   * ========================================================
   * QUESTIONS INCORRECTES
   * ========================================================
   */

  const questionsIncorrectes =
    toutesLesQuestions.filter(
      (
        question
      ) =>
        !estQuestionCorrecte(
          question
        )
    );

  /*
   * ========================================================
   * NIVEAU SANS SÉRIE
   * ========================================================
   */

  const isNiveauSansSerie =
    niveauxSansSerie.includes(
      niveau.toLowerCase()
    );

  /*
   * ========================================================
   * TITRE NIVEAU
   * ========================================================
   */

  const titreNiveau =
    isNiveauSansSerie
      ? niveau.toUpperCase()
      : `${niveau} ${serie}`.toUpperCase();

  /*
   * ========================================================
   * NOTIONS NON ACQUISES
   * ========================================================
   */

  const notionsBrutes: string[] =
    resultats?.notionsNonAcquises ??
    resultats?.notions_non_acquises ??
    state.notionsNonAcquises ??
    state.notions_non_acquises ??
    [];

  /*
   * ========================================================
   * NOMBRE TOTAL D'ÉTAPES
   *
   * 0                    = résultats
   * 1..N                 = questions
   * N + 1                = résumé
   * N + 2                = notions
   * N + 3                = message final
   * ========================================================
   */

  const totalSteps =
    toutesLesQuestions.length + 4;

  /*
   * ========================================================
   * INFORMATIONS SUR L'ÉTAPE
   * ========================================================
   */

  const isQuestionStep =
    currentStep >= 1 &&
    currentStep <=
      toutesLesQuestions.length;

  const currentQuestionIndex =
    currentStep - 1;

  const isResumeStep =
    currentStep ===
    toutesLesQuestions.length + 1;

  const isNotionsStep =
    currentStep ===
    toutesLesQuestions.length + 2;

  const isMessageStep =
    currentStep ===
    toutesLesQuestions.length + 3;

  /*
   * ========================================================
   * NAVIGATION ENTRE LES ÉTAPES
   * ========================================================
   */

  const handleNextStep =
    () => {
      setCurrentStep(
        (previous) =>
          Math.min(
            previous + 1,
            totalSteps - 1
          )
      );

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    };

  const handlePreviousStep =
    () => {
      setCurrentStep(
        (previous) =>
          Math.max(
            previous - 1,
            0
          )
      );

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    };

  /*
   * ========================================================
   * LANCER LA REMÉDIATION VIDÉO
   * ========================================================
   */

  const handleStartRemediation =
    () => {
      if (!niveau) {
        console.warn(
          "⚠️ Niveau manquant."
        );

        return;
      }

      const notions: string[] =
        notionsBrutes
          .filter(
            (
              notion
            ): notion is string =>
              typeof notion ===
              "string"
          )
          .map(
            (
              notion
            ) =>
              notion
                .normalize("NFD")
                .replace(
                  /[\u0300-\u036f]/g,
                  ""
                )
                .toLowerCase()
                .trim()
          );

      console.log(
        "================================================"
      );

      console.log(
        "🚀 DÉMARRAGE REMÉDIATION"
      );

      console.log(
        "📚 Notions :",
        notions
      );

      console.log(
        "📚 Questions :",
        toutesLesQuestions
      );

      console.log(
        "❌ Questions incorrectes :",
        questionsIncorrectes
      );

      console.log(
        "================================================"
      );

      navigate(
        `/maths/test/remediationvideo/${niveau.toLowerCase()}/${(
          serie ||
          "none"
        ).toLowerCase()}`,
        {
          replace: true,

          state: {
            currentNotion:
              notions[0] ??
              null,

            remainingNotions:
              notions.slice(1),

            niveauActuel:
              resultats?.niveau ??
              niveau,

            serieActuelle:
              resultats?.serie ??
              serie ??
              "",

            resultats,

            notions_non_acquises:
              notionsBrutes,

            questionsRemediation:
              toutesLesQuestions,

            questionsCorrectes,

            questionsIncorrectes,

            questionsDuTest,

            reponsesDuTest,

            questions:
              toutesLesQuestions,
          },
        }
      );
    };

  /*
   * ========================================================
   * CHARGEMENT
   * ========================================================
   */

  if (loadingResultats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="text-4xl mb-4">
            ⏳
          </div>

          <p className="text-gray-700 dark:text-gray-200 font-semibold">
            Chargement des résultats...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ========================================================
   * QUESTION ACTUELLE
   * ========================================================
   */

  const questionActuelle =
    isQuestionStep
      ? toutesLesQuestions[
          currentQuestionIndex
        ]
      : null;

  /*
   * ========================================================
   * INFORMATIONS QUESTION ACTUELLE
   * ========================================================
   */

  let correcteActuelle =
    false;

  let reponseUserActuelle =
    "";

  let bonneReponseActuelle =
    "";

  let teacherEmailActuel =
    "";

  let teacherActuel:
    | TeacherProfile
    | null = null;

  let teacherPhotoActuelle:
    | string
    | null = null;

  let teacherInitialsActuelles =
    "?";

  let teacherProfileUrlActuel =
    "";

  let teacherFullNameActuel =
    "Enseignant";

  if (questionActuelle) {
    correcteActuelle =
      estQuestionCorrecte(
        questionActuelle
      );

    reponseUserActuelle =
      getReponseUserAffichage(
        questionActuelle
      );

    bonneReponseActuelle =
      getBonneReponseAffichage(
        questionActuelle
      );

    teacherEmailActuel =
      questionActuelle.enseignant ??
      "";

    teacherActuel =
      teacherEmailActuel
        ? teacherProfiles[
            teacherEmailActuel
          ]
        : null;

    teacherPhotoActuelle =
      teacherActuel?.teacher_photo
        ? /^https?:\/\//i.test(
            teacherActuel.teacher_photo
          )
          ? teacherActuel.teacher_photo
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

              return `${normalizedBase}/${teacherActuel.teacher_photo.replace(
                /^\//,
                ""
              )}`;
            })()
        : null;

    teacherInitialsActuelles =
      teacherActuel
        ? `${teacherActuel.prenom?.[0] ?? ""}${teacherActuel.nom?.[0] ?? ""}`
            .toUpperCase()
        : "?";

    teacherProfileUrlActuel =
      teacherEmailActuel
        ? `/enseignant/profil/${encodeURIComponent(
            teacherEmailActuel
          )}`
        : "";

    teacherFullNameActuel =
      teacherActuel
        ? `${teacherActuel.prenom} ${teacherActuel.nom}`
        : "Enseignant";
  }

  /*
   * ========================================================
   * AFFICHAGE
   * ========================================================
   */

  return (
    <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 sm:p-10 space-y-8">

      {/* ==================================================
          EN-TÊTE GLOBAL
      ================================================== */}

      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-center text-blue-700">
          REMÉDIATION:{" "}
          {titreNiveau}
        </h1>

        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Consultez les résultats détaillés
          de votre évaluation avant de
          poursuivre le programme.
        </p>
      </div>

      {/* ==================================================
          BARRE DE PROGRESSION
      ================================================== */}

      <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
        <div className="flex items-center justify-between gap-3 mb-2">

          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Étape {currentStep + 1} sur{" "}
            {totalSteps}
          </span>

          {isQuestionStep && (
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              Question{" "}
              {currentQuestionIndex + 1} /{" "}
              {toutesLesQuestions.length}
            </span>
          )}

        </div>

        <div className="w-full h-3 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{
              width: `${((currentStep + 1) / totalSteps) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* ==================================================
          ERREUR
      ================================================== */}

      {errorResultats && (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-5 rounded-lg">
          <p className="text-red-700 dark:text-red-300 font-semibold">
            ❌ {errorResultats}
          </p>
        </div>
      )}

      {/* ==================================================
          ÉTAPE 0 : RÉSULTATS GÉNÉRAUX
      ================================================== */}

      {currentStep === 0 && (
        <section className="bg-gray-100 dark:bg-gray-700 p-6 rounded-xl shadow-md">

          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            📊 Résultats de l'évaluation
          </h2>

          {resultats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* NOTE */}

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Note
                </p>

                <p className="text-2xl font-bold text-green-600">
                  {resultats.note}/20
                </p>
              </div>

              {/* MENTION */}

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Mention
                </p>

                <p className="font-bold text-blue-700 dark:text-blue-300">
                  {resultats.mention}
                </p>
              </div>

              {/* QUESTIONS */}

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nombre de questions
                </p>

                <p className="text-2xl font-bold text-blue-600">
                  {toutesLesQuestions.length}
                </p>
              </div>

              {/* NOTIONS */}

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nombre de notions non acquises
                </p>

                <p className="text-2xl font-bold text-purple-600">
                  {notionsBrutes.length}
                </p>
              </div>

            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">
              Aucun résultat disponible.
            </p>
          )}

        </section>
      )}

      {/* ==================================================
          ÉTAPES DES QUESTIONS
      ================================================== */}

      {isQuestionStep &&
        questionActuelle && (
          <section
            className={`rounded-xl shadow-md overflow-hidden border-l-4 ${
              correcteActuelle
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : "border-red-500 bg-red-50 dark:bg-red-900/20"
            }`}
          >

            {/* ==================================================
                EN-TÊTE QUESTION
            ================================================== */}

            <div
              className={`px-5 py-4 ${
                correcteActuelle
                  ? "bg-green-100 dark:bg-green-900/40"
                  : "bg-red-100 dark:bg-red-900/40"
              }`}
            >

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                <h2 className="font-bold text-xl text-gray-800 dark:text-white">
                  Question{" "}
                  {currentQuestionIndex + 1}
                </h2>

                <span
                  className={`inline-flex items-center justify-center px-4 py-1 rounded-full font-bold ${
                    correcteActuelle
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {correcteActuelle
                    ? "✅ Correcte"
                    : "❌ Incorrecte"}
                </span>

              </div>

            </div>

            <div className="p-5 space-y-5">

              {/* =================================================
                  ENSEIGNANT
              ================================================= */}

              {teacherEmailActuel && (
                <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                    {/* PHOTO */}

                    <button
                      type="button"
                      onClick={() => {
                        if (
                          teacherProfileUrlActuel
                        ) {
                          navigate(
                            teacherProfileUrlActuel
                          );
                        }
                      }}
                      disabled={
                        !teacherActuel
                      }
                      className="group shrink-0 disabled:cursor-default"
                      title="Voir le profil de l'enseignant"
                    >
                      <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-blue-500 bg-gray-200 dark:bg-gray-700 shadow-sm group-hover:shadow-md group-hover:border-blue-700 transition">

                        {teacherPhotoActuelle ? (
                          <img
                            src={
                              teacherPhotoActuelle
                            }
                            alt={
                              teacherActuel
                                ? `Photo de ${teacherActuel.prenom} ${teacherActuel.nom}`
                                : "Photo de l'enseignant"
                            }
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                            onError={(
                              event
                            ) => {
                              event.currentTarget.style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-500 dark:text-gray-300">
                            {
                              teacherInitialsActuelles
                            }
                          </div>
                        )}

                      </div>
                    </button>

                    {/* NOM + PRÉNOM */}

                    <div className="min-w-0 flex-1">

                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Question proposée par
                      </p>

                      {teacherActuel ? (
                        <button
                          type="button"
                          onClick={() => {
                            navigate(
                              teacherProfileUrlActuel
                            );
                          }}
                          className="font-semibold text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 hover:underline transition text-left"
                        >
                          {
                            teacherFullNameActuel
                          }
                        </button>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Chargement de l'enseignant...
                        </p>
                      )}

                    </div>

                    {/* BOUTON PROFIL */}

                    {teacherActuel && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            teacherProfileUrlActuel
                          )
                        }
                        className="hidden sm:flex shrink-0 items-center justify-center h-9 w-9 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
                        title="Voir le profil de l'enseignant"
                      >
                        →
                      </button>
                    )}

                  </div>

                </div>
              )}

              {/* =================================================
                  ÉNONCÉ
              ================================================= */}

              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">

                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  Énoncé
                </p>

                <div
                  className="font-semibold text-gray-800 dark:text-white leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html:
                      questionActuelle.question ??
                      "Question non disponible",
                  }}
                />

              </div>

              {/* =================================================
                  CLASSE + NOTION
              ================================================= */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    🎓 Classe
                  </p>

                  <p className="font-semibold text-blue-700 dark:text-blue-300">
                    {getClasseQuestion(
                      questionActuelle
                    )}
                  </p>

                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    📚 Notion
                  </p>

                  <p className="font-semibold text-purple-700 dark:text-purple-300">
                    {getNotionQuestion(
                      questionActuelle
                    )}
                  </p>

                </div>

              </div>

              {/* =================================================
                  CHOIX
              ================================================= */}

              {Array.isArray(
                questionActuelle.choix
              ) &&
                questionActuelle.choix.length >
                  0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">

                    <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-2">
                      Choix proposés
                    </p>

                    <div className="space-y-2">

                      {questionActuelle.choix.map(
                        (
                          choix,
                          choixIndex
                        ) => {
                          const lettre =
                            String.fromCharCode(
                              65 +
                              choixIndex
                            );

                          return (
                            <div
                              key={
                                choixIndex
                              }
                              className="p-2 rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                            >
                              <strong>
                                {lettre}.
                              </strong>{" "}
                              {choix}
                            </div>
                          );
                        }
                      )}

                    </div>

                  </div>
                )}

              {/* =================================================
                  BONNE RÉPONSE
              ================================================= */}

              <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg p-4">

                <p className="text-sm text-green-700 dark:text-green-300 font-semibold mb-1">
                  ✅ Bonne réponse
                </p>

                <p className="font-bold text-green-800 dark:text-green-200">
                  {bonneReponseActuelle}
                </p>

              </div>

              {/* =================================================
                  RÉPONSE APPRENANT
              ================================================= */}

              <div
                className={`rounded-lg p-4 border ${
                  correcteActuelle
                    ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700"
                    : "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                }`}
              >

                <p
                  className={`text-sm font-semibold mb-1 ${
                    correcteActuelle
                      ? "text-green-700 dark:text-green-300"
                      : "text-red-700 dark:text-red-300"
                  }`}
                >
                  {correcteActuelle
                    ? "✅ Votre choix"
                    : "❌ Votre choix"}
                </p>

                <p
                  className={`font-bold ${
                    correcteActuelle
                      ? "text-green-800 dark:text-green-200"
                      : "text-red-800 dark:text-red-200"
                  }`}
                >
                  {reponseUserActuelle}
                </p>

              </div>

            </div>

          </section>
        )}

      {/* ==================================================
          ÉTAPE RÉSUMÉ
      ================================================== */}

      {isResumeStep && (
        <section className="space-y-6">

          <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-xl shadow-md">

            <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-200 mb-2">
              📊 Résumé de votre évaluation
            </h2>

            <p className="text-gray-700 dark:text-gray-200">
              Voici maintenant le bilan de
              l'ensemble de vos réponses.
            </p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div className="bg-blue-50 dark:bg-blue-900/30 p-5 rounded-xl shadow-md text-center">

              <p className="text-sm text-blue-700 dark:text-blue-300">
                Total
              </p>

              <p className="text-3xl font-bold text-blue-700 dark:text-blue-200">
                {toutesLesQuestions.length}
              </p>

            </div>

            <div className="bg-green-50 dark:bg-green-900/30 p-5 rounded-xl shadow-md text-center">

              <p className="text-sm text-green-700 dark:text-green-300">
                Correctes
              </p>

              <p className="text-3xl font-bold text-green-700 dark:text-green-200">
                {questionsCorrectes.length}
              </p>

            </div>

            <div className="bg-red-50 dark:bg-red-900/30 p-5 rounded-xl shadow-md text-center">

              <p className="text-sm text-red-700 dark:text-red-200">
                Incorrectes
              </p>

              <p className="text-3xl font-bold text-red-700 dark:text-red-200">
                {questionsIncorrectes.length}
              </p>

            </div>

          </div>

        </section>
      )}

      {/* ==================================================
          ÉTAPE NOTIONS NON ACQUISES
      ================================================== */}

      {isNotionsStep && (
        <section className="bg-purple-50 dark:bg-purple-900/30 p-6 rounded-xl shadow-md">

          <h2 className="text-2xl font-semibold text-purple-700 dark:text-purple-200 mb-4">
            📚 Notions à revoir
          </h2>

          {notionsBrutes.length > 0 ? (
            <>
              <p className="text-gray-700 dark:text-gray-200 mb-4">
                Les notions suivantes nécessitent
                une attention particulière :
              </p>

              <div className="flex flex-wrap gap-2">

                {notionsBrutes.map(
                  (
                    notion,
                    index
                  ) => (
                    <span
                      key={`${notion}-${index}`}
                      className="px-4 py-2 rounded-full bg-purple-600 text-white font-semibold text-sm"
                    >
                      {notion}
                    </span>
                  )
                )}

              </div>
            </>
          ) : (
            <p className="text-green-700 dark:text-green-300 font-semibold">
              🎉 Aucune notion non acquise n'a
              été détectée.
            </p>
          )}

        </section>
      )}

      {/* ==================================================
          ÉTAPE MESSAGE FINAL
      ================================================== */}

      {isMessageStep && (
        <section
          className={`p-6 rounded-xl shadow-md ${
            questionsIncorrectes.length > 0
              ? "bg-blue-50 dark:bg-blue-900/30"
              : "bg-green-50 dark:bg-green-900/30"
          }`}
        >

          {questionsIncorrectes.length > 0 ? (
            <>
              <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-200 mb-3">
                📚 Poursuivre le programme
              </h2>

              <p className="text-gray-700 dark:text-gray-200">
                Les réponses incorrectes
                permettent d'identifier les
                notions qui nécessitent une attention particulière.
              </p>

              <p className="text-gray-700 dark:text-gray-200 mt-3">
                Vous pouvez poursuivre le programme.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-green-700 dark:text-green-300 mb-3">
                🎉 Évaluation réussie
              </h2>

              <p className="text-gray-700 dark:text-gray-200">
                Toutes les questions sont
                correctes.
              </p>

              <p className="text-gray-700 dark:text-gray-200 mt-3">
                Vous pouvez poursuivre le programme.
              </p>
            </>
          )}

        </section>
      )}

      {/* ==================================================
          NAVIGATION
      ================================================== */}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">

        {/* BOUTON PRÉCÉDENT */}

        <button
          type="button"
          onClick={
            handlePreviousStep
          }
          disabled={
            currentStep === 0
          }
          className={`w-full sm:w-auto font-bold py-3 px-6 rounded-xl shadow-md transition ${
            currentStep === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
              : "bg-gray-600 text-white hover:bg-gray-700"
          }`}
        >
          ← Précédent
        </button>

        {/* INDICATION CENTRALE */}

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">

          {isQuestionStep ? (
            <span>
              Question{" "}
              {currentQuestionIndex + 1} sur{" "}
              {toutesLesQuestions.length}
            </span>
          ) : currentStep === 0 ? (
            <span>
              Résultats de l'évaluation
            </span>
          ) : isResumeStep ? (
            <span>
              Résumé de l'évaluation
            </span>
          ) : isNotionsStep ? (
            <span>
              Notions à revoir
            </span>
          ) : (
            <span>
              Fin de l'analyse
            </span>
          )}

        </div>

        {/* BOUTON SUIVANT OU CONTINUER */}

        {!isMessageStep ? (
          <button
            type="button"
            onClick={
              handleNextStep
            }
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition"
          >
            Suivant →
          </button>
        ) : (
          <button
            type="button"
            onClick={
              handleStartRemediation
            }
            disabled={!niveau}
            className={`w-full sm:w-auto text-white font-bold py-3 px-8 rounded-xl shadow-lg transition ${
              niveau
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            🚀 Continuez
          </button>
        )}

      </div>

    </div>
  );
};

export default Remediation;