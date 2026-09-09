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

  /*
   * IMPORTANT :
   * Le niveau appartient à chaque question.
   */
  niveau?: string | null;

  classe?: string | null;

  /*
   * ========================================================
   * ENSEIGNANT
   * ========================================================
   *
   * Email de l'enseignant ayant proposé la question.
   */

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
   *
   * La clé est l'adresse email de l'enseignant.
   *
   * Exemple :
   *
   * {
   *   "enseignant@email.com": {
   *      nom: "...",
   *      prenom: "...",
   *      ...
   *   }
   * }
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


    /*
     * ------------------------------------------------------
     * FALLBACK
     * ------------------------------------------------------
     */

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
   *
   * PRIORITÉ :
   *
   * 1. questionsRemediation transmises par Resultats.tsx
   * 2. questionsRemediation présentes dans resultats
   * 3. questions_remediation
   * 4. questions
   */

  const toutesLesQuestions =
    useMemo<QuestionRemediation[]>(() => {

      let questions:
        QuestionRemediation[] = [];


      /*
       * PRIORITÉ 1
       */

      if (
        Array.isArray(
          questionsRemediationTransmises
        ) &&
        questionsRemediationTransmises.length > 0
      ) {

        questions =
          questionsRemediationTransmises;

      }


      /*
       * PRIORITÉ 2
       */

      else if (
        Array.isArray(
          resultats?.questionsRemediation
        )
      ) {

        questions =
          resultats.questionsRemediation;

      }


      /*
       * PRIORITÉ 3
       */

      else if (
        Array.isArray(
          resultats?.questions_remediation
        )
      ) {

        questions =
          resultats.questions_remediation;

      }


      /*
       * PRIORITÉ 4
       */

      else if (
        Array.isArray(
          resultats?.questions
        )
      ) {

        questions =
          resultats.questions;

      }


      /*
       * NORMALISATION
       */

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
   * RÉCUPÉRATION DES PROFILS ENSEIGNANTS
   * ========================================================
   *
   * On récupère tous les emails présents dans les questions.
   *
   * Le Set évite de faire plusieurs requêtes pour le même
   * enseignant.
   */

  useEffect(() => {

    const recupererProfilsEnseignants =
      async () => {

        /*
         * --------------------------------------------------
         * EXTRAIRE LES EMAILS UNIQUES
         * --------------------------------------------------
         */

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


        /*
         * Aucun enseignant
         */

        if (
          emails.length === 0
        ) {

          setTeacherProfiles({});

          return;

        }


        /*
         * --------------------------------------------------
         * PROFILS
         * --------------------------------------------------
         */

        const profiles:
          Record<
            string,
            TeacherProfile | null
          > = {};


        /*
         * --------------------------------------------------
         * UNE REQUÊTE PAR ENSEIGNANT
         * --------------------------------------------------
         */

        await Promise.all(
          emails.map(
            async (email) => {

              /*
               * Si le profil est déjà en mémoire,
               * inutile de refaire la requête.
               */

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


        /*
         * --------------------------------------------------
         * ENREGISTRER LES PROFILS
         * --------------------------------------------------
         */

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
   * AFFICHAGE
   * ========================================================
   */

  return (

    <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 sm:p-10 space-y-8">


      {/* ==================================================
          EN-TÊTE
      ================================================== */}

      <div className="text-center">

        <h1 className="text-4xl font-extrabold text-center text-blue-700">

          REMÉDIATION:{" "}

          {titreNiveau}

        </h1>

        <p className="text-sm text-gray-600 dark:text-gray-400">

          Consultez les résultats détaillés
          de votre évaluation avant de
          poursuivre le programme. Ce contenu
          disparait lorsque vous cliquez sur
          CONTINUEZ en bas de la page

        </p>

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
          INFORMATIONS GÉNÉRALES
      ================================================== */}

      {resultats && (

        <section className="bg-gray-100 dark:bg-gray-700 p-6 rounded-xl shadow-md">

          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">

            📊 Résultats de l'évaluation

          </h2>


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

        </section>

      )}


      {/* ==================================================
          RÉSULTATS DÉTAILLÉS
      ================================================== */}

      <section className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-inner">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 border-b border-gray-300 dark:border-gray-600 pb-3">

          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">

            Analyse des réponses

          </h2>

          <span className="inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-full font-semibold">

            {toutesLesQuestions.length} question
            {toutesLesQuestions.length > 1
              ? "s"
              : ""}

          </span>

        </div>


        {/* ==================================================
            AUCUNE QUESTION
        ================================================== */}

        {toutesLesQuestions.length === 0 && (

          <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 p-6 rounded-lg">

            <p className="text-yellow-800 dark:text-yellow-200 font-semibold text-center">

              ⚠️ Aucune question n'a été reçue.

            </p>

            <p className="text-sm text-yellow-700 dark:text-yellow-300 text-center mt-2">

              Vérifie dans la console :

            </p>

            <pre className="mt-3 bg-gray-900 text-green-300 p-4 rounded-lg text-xs overflow-auto">

              location.state.questionsRemediation

            </pre>

          </div>

        )}


        {/* ==================================================
            QUESTIONS
        ================================================== */}

        {toutesLesQuestions.length > 0 && (

          <div className="space-y-6">

            {toutesLesQuestions.map(
              (
                question,
                index
              ) => {

                const correcte =
                  estQuestionCorrecte(
                    question
                  );


                const reponseUser =
                  getReponseUserAffichage(
                    question
                  );


                const bonneReponse =
                  getBonneReponseAffichage(
                    question
                  );


                /*
                 * =================================================
                 * PROFIL ENSEIGNANT DE CETTE QUESTION
                 * =================================================
                 */

                const teacherEmail =
                  question.enseignant ??
                  "";


                const teacher =
                  teacherEmail
                    ? teacherProfiles[
                        teacherEmail
                      ]
                    : null;


                /*
                 * =================================================
                 * URL COMPLÈTE DE LA PHOTO DE L'ENSEIGNANT
                 * =================================================
                 *
                 * Le backend peut renvoyer :
                 *
                 * /images/enseignants/photo.jpg
                 *
                 * ou directement :
                 *
                 * https://...
                 *
                 * On construit donc automatiquement l'URL
                 * complète lorsque le chemin est relatif.
                 */

                const teacherPhoto =
                  teacher?.teacher_photo
                    ? teacher.teacher_photo.startsWith(
                        "http"
                      )
                      ? teacher.teacher_photo
                      : `${
                          api.defaults.baseURL?.replace(
                            /\/$/,
                            ""
                          ) || ""
                        }/${teacher.teacher_photo.replace(
                          /^\//,
                          ""
                        )}`
                    : null;


                /*
                 * Initiales si aucune photo
                 */

                const teacherInitials =
                  teacher
                    ? `${teacher.prenom?.[0] ?? ""}${teacher.nom?.[0] ?? ""}`
                        .toUpperCase()
                    : "?";


                return (

                  <article
                    key={String(
                      question.id
                    )}
                    className={`rounded-xl shadow-md overflow-hidden border-l-4 ${
                      correcte
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-red-500 bg-red-50 dark:bg-red-900/20"
                    }`}
                  >


                    {/* ==================================================
                        EN-TÊTE
                    ================================================== */}

                    <div
                      className={`px-5 py-4 ${
                        correcte
                          ? "bg-green-100 dark:bg-green-900/40"
                          : "bg-red-100 dark:bg-red-900/40"
                      }`}
                    >

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">

                          Question{" "}
                          {index + 1}

                        </h3>


                        <span
                          className={`inline-flex items-center justify-center px-4 py-1 rounded-full font-bold ${
                            correcte
                              ? "bg-green-600 text-white"
                              : "bg-red-600 text-white"
                          }`}
                        >

                          {correcte
                            ? "✅ Correcte"
                            : "❌ Incorrecte"}

                        </span>

                      </div>

                    </div>


                    {/* ==================================================
                        CONTENU
                    ================================================== */}

                    <div className="p-5 space-y-4">


                      {/* =================================================
                          QUESTION
                      ================================================= */}

                      <div>

                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">

                          Énoncé

                        </p>

                        <div
                          className="font-semibold text-gray-800 dark:text-white leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html:
                              question.question ??
                              "Question non disponible",
                          }}
                        />

                      </div>


                      {/* =================================================
                          ENSEIGNANT
                      ================================================= */}

                      {teacherEmail && (

                        <div className="flex items-center gap-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-3">

                          {/* =============================================
                              PHOTO
                          ============================================= */}

                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-blue-500 bg-gray-200 dark:bg-gray-700">

                            {teacherPhoto ? (

                              <img
                                src={
                                  teacherPhoto
                                }
                                alt={
                                  teacher
                                    ? `Photo de ${teacher.prenom} ${teacher.nom}`
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

                              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-500 dark:text-gray-300">

                                {teacherInitials}

                              </div>

                            )}

                          </div>


                          {/* =============================================
                              NOM
                          ============================================= */}

                          <div className="min-w-0 flex-1">

                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">

                              Question proposée par

                            </p>


                            {teacher ? (

                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    `/enseignant/profil/${encodeURIComponent(
                                      teacher.email
                                    )}`
                                  )
                                }
                                className="font-semibold text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 hover:underline transition text-left"
                              >

                                {teacher.prenom}{" "}
                                {teacher.nom}

                              </button>

                            ) : (

                              <p className="text-sm text-gray-500 dark:text-gray-400">

                                Chargement de l'enseignant...

                              </p>

                            )}

                          </div>


                          {/* =============================================
                              PETIT INDICATEUR
                          ============================================= */}

                          {teacher && (

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/enseignant/profil/${encodeURIComponent(
                                    teacher.email
                                  )}`
                                )
                              }
                              className="hidden sm:flex items-center justify-center h-9 w-9 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
                              title="Voir le profil de l'enseignant"
                            >

                              →

                            </button>

                          )}

                        </div>

                      )}


                      {/* =================================================
                          CLASSE + NOTION
                      ================================================= */}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">


                        {/* NIVEAU PROPRE À LA QUESTION */}

                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">

                          <p className="text-xs text-gray-500 dark:text-gray-400">

                            🎓 Classe

                          </p>

                          <p className="font-semibold text-blue-700 dark:text-blue-300">

                            {getClasseQuestion(
                              question
                            )}

                          </p>

                        </div>


                        {/* NOTION */}

                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">

                          <p className="text-xs text-gray-500 dark:text-gray-400">

                            📚 Notion

                          </p>

                          <p className="font-semibold text-purple-700 dark:text-purple-300">

                            {getNotionQuestion(
                              question
                            )}

                          </p>

                        </div>

                      </div>


                      {/* =================================================
                          CHOIX
                      ================================================= */}

                      {Array.isArray(
                        question.choix
                      ) &&
                        question.choix.length >
                          0 && (

                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">

                            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-2">

                              Choix proposés

                            </p>


                            <div className="space-y-2">

                              {question.choix.map(
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

                          {bonneReponse}

                        </p>

                      </div>


                      {/* =================================================
                          RÉPONSE APPRENANT
                      ================================================= */}

                      <div
                        className={`rounded-lg p-4 border ${
                          correcte
                            ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700"
                            : "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                        }`}
                      >

                        <p
                          className={`text-sm font-semibold mb-1 ${
                            correcte
                              ? "text-green-700 dark:text-green-300"
                              : "text-red-700 dark:text-red-300"
                          }`}
                        >

                          {correcte
                            ? "✅ Votre choix"
                            : "❌ Votre choix"}

                        </p>

                        <p
                          className={`font-bold ${
                            correcte
                              ? "text-green-800 dark:text-green-200"
                              : "text-red-800 dark:text-red-200"
                          }`}
                        >

                          {reponseUser}

                        </p>

                      </div>


                    </div>

                  </article>

                );

              }
            )}

          </div>

        )}

      </section>


      {/* ==================================================
          RÉSUMÉ
      ================================================== */}

      {toutesLesQuestions.length > 0 && (

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">


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

        </section>

      )}


      {/* ==================================================
          NOTIONS NON ACQUISES
      ================================================== */}

      {notionsBrutes.length > 0 && (

        <section className="bg-purple-50 dark:bg-purple-900/30 p-6 rounded-xl shadow-md">

          <h2 className="text-xl font-semibold text-purple-700 dark:text-purple-200 mb-4">

            📚 Notions à revoir

          </h2>

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

        </section>

      )}


      {/* ==================================================
          MESSAGE
      ================================================== */}

      {toutesLesQuestions.length > 0 && (

        <section
          className={`p-6 rounded-xl shadow-md ${
            questionsIncorrectes.length > 0
              ? "bg-blue-50 dark:bg-blue-900/30"
              : "bg-green-50 dark:bg-green-900/30"
          }`}
        >

          {questionsIncorrectes.length > 0 ? (

            <>

              <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-200 mb-3">

                📚 Poursuivre la remédiation

              </h2>

              <p className="text-gray-700 dark:text-gray-200">

                Les réponses incorrectes
                permettent d'identifier les
                notions qui nécessitent une
                remédiation.

              </p>

            </>

          ) : (

            <>

              <h2 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-3">

                🎉 Évaluation réussie

              </h2>

              <p className="text-gray-700 dark:text-gray-200">

                Toutes les questions sont
                correctes.

              </p>

            </>

          )}

        </section>

      )}


      {/* ==================================================
          BOUTON CONTINUER
      ================================================== */}

      <div className="flex justify-center">

        <button
          onClick={
            handleStartRemediation
          }
          disabled={!niveau}
          className={`text-white font-bold py-3 px-8 rounded-xl shadow-lg transition ${
            niveau
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >

          🚀 Continuez

        </button>

      </div>


    </div>

  );

};


export default Remediation;