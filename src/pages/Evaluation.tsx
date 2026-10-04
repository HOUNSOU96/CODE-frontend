// 📁 src/pages/Evaluation.tsx
//
// CODE — UNIVERS DU SAVOIR ET DES COMPÉTENCES
// Évaluation universelle de tout apprentissage.
//
// Cette page peut être utilisée pour :
// - Formations académiques
// - Métiers
// - Technologies
// - Vie professionnelle
// - Finance
// - Environnement
// - Développement humain
// - Société
// - Santé
// - Sciences & innovation
// - Pédagogie
// - Jeux
// - Arts
// - Recherche
// - Afrique
// - Autres
//
// Principe :
// Tout apprentissage sélectionné dans CODE arrive ici.
//

import React, {
  useEffect,
  useState,
  useRef,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import api from "@/utils/axios";

import { motion } from "framer-motion";

import {
  Loader2,
  CheckCircle,
  AlertCircle,
  WifiOff,
} from "lucide-react";

import DarkModeToggle from "@/components/DarkModeToggle";
import AudioManager from "@/components/AudioManager";
import CountdownCircle from "@/components/CountdownCircle";

import { useAuth } from "@/hooks/useAuth";

import {
  getOfflineData,
  saveOfflineData,
  STORES,
} from "@/offline/offlineDB";


// ============================================================
// TYPES
// ============================================================

type Question = {
  id: string;

  question: string;

  choix: string[];

  bonneReponse?: string;

  bonne_reponse?: string;

  notion?: string;

  duree?: number;

  situation?: {
    texte?: string;
    image?: string;
  };
};


type Reponse = {
  questionId: string;

  reponse: number | null;

  notion: string | null;
};


type TimerStatus = {
  [key: string]: boolean;
};


type RemainingTime = {
  [key: string]: number;
};


type CachedEvaluation = {
  id: string;

  test_id: string | null;

  domaine: string;

  sousDomaine: string;

  questions: Question[];

  cachedAt: number;
};


type OfflineEvaluationSubmission = {
  id: string;

  type: "evaluation_result";

  createdAt: number;

  status: "pending";

  endpoint: string;

  method: "POST";

  payload: {
    resultats: {
      id: string;
      reponse: string | null;
    }[];
  };

  domaine: string;

  sousDomaine: string;

  testId: string;
};


// ============================================================
// COMPOSANT
// ============================================================

const Evaluation: React.FC = () => {

  const navigate = useNavigate();

  const {
    domaine,
    sousDomaine,
  } = useParams<{
    domaine: string;
    sousDomaine: string;
  }>();

  const { loading: authLoading } = useAuth();


  // ==========================================================
  // ÉTATS
  // ==========================================================

  const [
    questions,
    setQuestions,
  ] = useState<Question[]>([]);


  const [
    reponses,
    setReponses,
  ] = useState<Reponse[]>([]);


  const [
    currentIndex,
    setCurrentIndex,
  ] = useState<number>(0);


  const [
    loading,
    setLoading,
  ] = useState<boolean>(true);


  const [
    error,
    setError,
  ] = useState<string | null>(null);


  const [
    timersEnded,
    setTimersEnded,
  ] = useState<TimerStatus>({});


  const [
    remainingTime,
    setRemainingTime,
  ] = useState<RemainingTime>({});


  const [
    testId,
    setTestId,
  ] = useState<string | null>(null);


  const [
    isOffline,
    setIsOffline,
  ] = useState<boolean>(() => {
    if (typeof navigator === "undefined") {
      return false;
    }

    return !navigator.onLine;
  });


  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState<boolean>(false);


  const [
    pendingSync,
    setPendingSync,
  ] = useState<boolean>(false);


  const questionSoundRef =
    useRef<HTMLAudioElement | null>(null);


  // ==========================================================
  // IDENTIFIANT UNIQUE DU CACHE
  // ==========================================================

  const evaluationCacheId =
    domaine && sousDomaine
      ? `evaluation_${encodeURIComponent(
          domaine
        )}_${encodeURIComponent(
          sousDomaine
        )}`
      : "";


  // ==========================================================
  // QUESTION COURANTE
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
  // DÉTECTION DU RÉSEAU
  // ==========================================================

  useEffect(() => {

    const handleOnline = () => {
      setIsOffline(false);
    };


    const handleOffline = () => {
      setIsOffline(true);
    };


    window.addEventListener(
      "online",
      handleOnline
    );

    window.addEventListener(
      "offline",
      handleOffline
    );


    return () => {

      window.removeEventListener(
        "online",
        handleOnline
      );

      window.removeEventListener(
        "offline",
        handleOffline
      );

    };

  }, []);


  // ==========================================================
  // REMONTER EN HAUT À CHAQUE QUESTION
  // ==========================================================

  useEffect(() => {

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });

  }, [currentIndex]);


  // ==========================================================
  // SON
  // ==========================================================

  useEffect(() => {

    questionSoundRef.current =
      new Audio("/sounds/click.mp3");

  }, []);


  const playClickSound = () => {

    questionSoundRef.current
      ?.play()
      .catch(
        (e) =>
          console.warn(
            "Son non joué :",
            e
          )
      );

  };


  // ==========================================================
  // CONSTRUCTION DES RÉPONSES INITIALES
  // ==========================================================

  const initializeResponses = (
    questionsRecues: Question[]
  ) => {

    return questionsRecues.map(
      (q: Question) => ({

        questionId:
          String(q.id),

        reponse:
          null,

        notion:
          q.notion ??
          null,

      })
    );

  };


  // ==========================================================
  // CHARGEMENT DE L'ÉVALUATION
  // ==========================================================

  useEffect(() => {

    let cancelled = false;


    const fetchEvaluation = async () => {

      setLoading(true);

      setError(null);


      try {

        /*
         * =====================================================
         * VÉRIFICATION DES PARAMÈTRES
         * =====================================================
         */

        if (!domaine || !sousDomaine) {

          throw new Error(
            "Domaine ou sous-domaine manquant."
          );

        }


        /*
         * =====================================================
         * URL UNIVERSELLE
         *
         * Exemple :
         *
         * /api/evaluation/academique/mathematiques
         *
         * ou :
         *
         * /api/evaluation/metiers/mecanique
         * =====================================================
         */

        const url =
          `/api/evaluation/${encodeURIComponent(
            domaine
          )}/${encodeURIComponent(
            sousDomaine
          )}`;


        /*
         * =====================================================
         * SI HORS LIGNE :
         * essayer d'abord le cache local.
         * =====================================================
         */

        if (!navigator.onLine) {

          setIsOffline(true);


          if (!evaluationCacheId) {

            throw new Error(
              "Cette évaluation n'est pas disponible hors ligne."
            );

          }


          const cached =
            await getOfflineData<CachedEvaluation>(
              STORES.questions,
              evaluationCacheId
            );


          if (
            !cached ||
            !Array.isArray(
              cached.questions
            ) ||
            cached.questions.length === 0
          ) {

            throw new Error(
              "Cette évaluation n'a pas encore été enregistrée sur cet appareil."
            );

          }


          if (cancelled) {
            return;
          }


          setTestId(
            cached.test_id
          );


          setQuestions(
            cached.questions
          );


          setReponses(
            initializeResponses(
              cached.questions
            )
          );


          setLoading(false);

          return;

        }


        /*
         * =====================================================
         * MODE EN LIGNE
         * =====================================================
         */

        console.log(
          "📥 Chargement de l'évaluation :",
          url
        );


        const res =
          await api.get(url);


        const {
          test_id,
          questions:
            questionsRecues,
        } = res.data;


        if (
          !questionsRecues ||
          !Array.isArray(
            questionsRecues
          )
        ) {

          throw new Error(
            "Aucune question valide reçue du serveur."
          );

        }


        if (cancelled) {
          return;
        }


        setTestId(
          test_id ?? null
        );


        setQuestions(
          questionsRecues
        );


        setReponses(
          initializeResponses(
            questionsRecues
          )
        );


        /*
         * =====================================================
         * CACHE LOCAL
         *
         * L'évaluation pourra être utilisée plus tard
         * même sans connexion.
         * =====================================================
         */

        if (evaluationCacheId) {

          try {

            await saveOfflineData(
              STORES.questions,
              {
                id:
                  evaluationCacheId,

                test_id:
                  test_id ??
                  null,

                domaine,

                sousDomaine,

                questions:
                  questionsRecues,

                cachedAt:
                  Date.now(),

              }
            );

          } catch (cacheError) {

            console.warn(
              "⚠️ Impossible de mettre l'évaluation en cache :",
              cacheError
            );

          }

        }


        setLoading(false);

      }

      catch (err) {

        console.error(
          "❌ Erreur lors du chargement de l'évaluation :",
          err
        );


        /*
         * =====================================================
         * FALLBACK CACHE
         *
         * Si la connexion existe mais que le serveur
         * est momentanément indisponible, on essaie
         * quand même le cache local.
         * =====================================================
         */

        try {

          if (
            domaine &&
            sousDomaine &&
            evaluationCacheId
          ) {

            const cached =
              await getOfflineData<CachedEvaluation>(
                STORES.questions,
                evaluationCacheId
              );


            if (
              cached &&
              Array.isArray(
                cached.questions
              ) &&
              cached.questions.length > 0
            ) {

              if (cancelled) {
                return;
              }


              setIsOffline(true);

              setTestId(
                cached.test_id
              );

              setQuestions(
                cached.questions
              );

              setReponses(
                initializeResponses(
                  cached.questions
                )
              );

              setLoading(false);

              return;

            }

          }

        } catch (cacheError) {

          console.warn(
            "⚠️ Erreur lecture cache évaluation :",
            cacheError
          );

        }


        if (cancelled) {
          return;
        }


        if (!navigator.onLine) {

          setIsOffline(true);

          setError(
            "Cette évaluation n'est pas disponible hors ligne. Ouvrez-la au moins une fois avec une connexion Internet pour pouvoir l'utiliser hors connexion."
          );

        } else {

          setError(
            "Impossible de charger cette évaluation."
          );

        }


        setLoading(false);

      }

    };


    fetchEvaluation();


    return () => {

      cancelled = true;

    };

  }, [
    domaine,
    sousDomaine,
    evaluationCacheId,
  ]);


  // ==========================================================
  // SÉLECTION D'UNE RÉPONSE
  // ==========================================================

  const handleOptionSelect = (
    questionId: string,
    selected: number
  ) => {

    setReponses(
      (prev) =>

        prev.map(
          (r) =>

            String(r.questionId) ===
            String(questionId)

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

    if (!currentQuestion) {
      return;
    }


    const currentReponse =
      reponses.find(
        (r) =>
          String(r.questionId) ===
          String(
            currentQuestion.id
          )
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
        questions[
          nextIndex
        ].id
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
        questions[
          prevIndex
        ].id
      ]

    ) {

      prevIndex--;

    }


    if (
      prevIndex >= 0
    ) {

      setCurrentIndex(
        prevIndex
      );

    }

  };


  // ==========================================================
  // SOUMISSION
  // ==========================================================

  const handleSubmit = async () => {

    if (isSubmitting) {
      return;
    }


    if (!testId) {

      alert(
        "Erreur : identifiant de l'évaluation manquant."
      );

      return;

    }


    /*
     * ========================================================
     * 1. RÉPONSES DE L'APPRENANT
     * ========================================================
     */

    const toutesLesReponses =
      reponses.map(
        (r) => {

          const lettre =
            r.reponse !== null
              ? [
                  "a",
                  "b",
                  "c",
                  "d",
                  "e",
                ][r.reponse] ?? null
              : null;


          return {

            id:
              String(
                r.questionId
              ),

            reponse:
              lettre,

          };

        }
      );


    /*
     * ========================================================
     * 2. QUESTIONS + RÉPONSES
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
                ][
                  indexReponse
                ] ?? null

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

            reponse_apprenant:
              reponseApprenant,

            bonne_reponse:
              bonneReponse,

            correcte,

            domaine,

            sous_domaine:
              sousDomaine,

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

    const notionsNonAcquises = [
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

              notion.trim() !== ""

          )

      ),
    ];


    /*
     * ========================================================
     * DEBUG
     * ========================================================
     */

    console.log(
      "=============================================="
    );

    console.log(
      "🌍 DOMAINE :",
      domaine
    );

    console.log(
      "📚 SOUS-DOMAINE :",
      sousDomaine
    );

    console.log(
      "📋 QUESTIONS :",
      questions
    );

    console.log(
      "📝 RÉPONSES :",
      reponses
    );

    console.log(
      "❌ QUESTIONS À REMÉDIER :",
      questionsRemediation
    );

    console.log(
      "📚 NOTIONS NON ACQUISES :",
      notionsNonAcquises
    );

    console.log(
      "=============================================="
    );


    /*
     * ========================================================
     * 5. PRÉPARATION DE L'URL
     * ========================================================
     */

    const url =
      `/api/evaluation/${encodeURIComponent(
        domaine ?? ""
      )}/${encodeURIComponent(
        sousDomaine ?? ""
      )}/resultats?test_id=${encodeURIComponent(
        testId
      )}`;


    /*
     * ========================================================
     * 6. SI HORS LIGNE
     *
     * La réponse n'est pas perdue.
     * Elle est placée dans syncQueue.
     * ========================================================
     */

    if (!navigator.onLine) {

      setIsOffline(true);


      const offlineId =
        `evaluation_result_${testId}_${Date.now()}`;


      const offlineSubmission:
        OfflineEvaluationSubmission = {

          id:
            offlineId,

          type:
            "evaluation_result",

          createdAt:
            Date.now(),

          status:
            "pending",

          endpoint:
            url,

          method:
            "POST",

          payload: {

            resultats:
              toutesLesReponses,

          },

          domaine:
            domaine ?? "",

          sousDomaine:
            sousDomaine ?? "",

          testId,

        };


      try {

        await saveOfflineData(
          STORES.syncQueue,
          offlineSubmission
        );


        setPendingSync(true);


        /*
         * ======================================================
         * PAGE RÉSULTATS
         *
         * On conserve exactement la même structure de
         * navigation que la version en ligne, mais on indique
         * que le résultat attend encore sa synchronisation.
         * ======================================================
         */

        navigate(
          `/evaluation/${encodeURIComponent(
            domaine ?? ""
          )}/${encodeURIComponent(
            sousDomaine ?? ""
          )}/resultats`,
          {

            replace: true,

            state: {

              resultats: {

                offline:
                  true,

                pendingSync:
                  true,

                test_id:
                  testId,

              },

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

              domaineActuel:
                domaine,

              sousDomaineActuel:
                sousDomaine,

              offline:
                true,

              pendingSync:
                true,

            },

          }
        );


      } catch (queueError) {

        console.error(
          "❌ Impossible d'enregistrer la soumission hors ligne :",
          queueError
        );


        alert(
          "Impossible d'enregistrer votre évaluation hors ligne. Veuillez réessayer."
        );

      }


      return;

    }


    /*
     * ========================================================
     * 7. ENVOI AU BACKEND
     * ========================================================
     */

    setIsSubmitting(true);


    try {

      const res =
        await api.post(
          url,
          {
            resultats:
              toutesLesReponses,
          }
        );


      console.log(
        "📥 RÉPONSE DU BACKEND :",
        res.data
      );


      /*
       * ======================================================
       * PAGE RÉSULTATS
       * ======================================================
       */

      navigate(
        `/evaluation/${encodeURIComponent(
          domaine ?? ""
        )}/${encodeURIComponent(
          sousDomaine ?? ""
        )}/resultats`,
        {

          replace: true,

          state: {

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

            domaineActuel:
              domaine,

            sousDomaineActuel:
              sousDomaine,

            offline:
              false,

            pendingSync:
              false,

          },

        }
      );

    }

    catch (err) {

      console.error(
        "❌ Erreur lors de la soumission :",
        err
      );


      /*
       * ======================================================
       * SI LA CONNEXION A ÉTÉ PERDUE PENDANT L'ENVOI
       * ======================================================
       */

      if (!navigator.onLine) {

        setIsOffline(true);


        const offlineId =
          `evaluation_result_${testId}_${Date.now()}`;


        const offlineSubmission:
          OfflineEvaluationSubmission = {

            id:
              offlineId,

            type:
              "evaluation_result",

            createdAt:
              Date.now(),

            status:
              "pending",

            endpoint:
              url,

            method:
              "POST",

            payload: {

              resultats:
                toutesLesReponses,

            },

            domaine:
              domaine ?? "",

            sousDomaine:
              sousDomaine ?? "",

            testId,

          };


        try {

          await saveOfflineData(
            STORES.syncQueue,
            offlineSubmission
          );


          setPendingSync(true);


          navigate(
            `/evaluation/${encodeURIComponent(
              domaine ?? ""
            )}/${encodeURIComponent(
              sousDomaine ?? ""
            )}/resultats`,
            {

              replace: true,

              state: {

                resultats: {

                  offline:
                    true,

                  pendingSync:
                    true,

                  test_id:
                    testId,

                },

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

                domaineActuel:
                  domaine,

                sousDomaineActuel:
                  sousDomaine,

                offline:
                  true,

                pendingSync:
                  true,

              },

            }
          );


        } catch (queueError) {

          console.error(
            "❌ Erreur d'enregistrement dans la file hors ligne :",
            queueError
          );


          alert(
            "La connexion a été perdue et l'évaluation n'a pas pu être enregistrée localement."
          );

        }

      } else {

        alert(
          "Une erreur s'est produite lors de la soumission de l'évaluation."
        );

      }

    }

    finally {

      setIsSubmitting(false);

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
          String(
            r.questionId
          ) ===
          String(
            currentId
          )
      );


    const isUnanswered =
      currentReponse?.reponse ===
      null;


    if (
      isUnanswered
    ) {

      alert(
        "Temps écoulé sans réponse. L'évaluation va recommencer."
      );


      navigate(
        "/etudiant"
      );


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

    }

    else {

      handleSubmit();

    }

  };


  // ==========================================================
  // CHARGEMENT
  // ==========================================================

  if (
    authLoading ||
    loading
  ) {

    return (

      <div className="
        flex
        flex-col
        items-center
        justify-center
        min-h-[60vh]
        text-center
        gap-4
        text-gray-700
        dark:text-gray-300
      ">

        <Loader2
          className="
            animate-spin
            h-10
            w-10
          "
        />

        <p>
          Préparation de votre évaluation...
        </p>

      </div>

    );

  }


  // ==========================================================
  // ERREUR
  // ==========================================================

  if (error) {

    return (

      <div className="
        max-w-2xl
        mx-auto
        p-6
        text-center
      ">

        <div className="
          bg-white
          dark:bg-gray-900
          rounded-2xl
          shadow-xl
          border
          border-red-200
          dark:border-red-900
          p-8
        ">

          <AlertCircle
            className="
              w-14
              h-14
              mx-auto
              mb-4
              text-red-500
            "
          />

          <h1 className="
            text-2xl
            font-bold
            text-red-600
            dark:text-red-400
            mb-3
          ">

            Évaluation indisponible

          </h1>


          <p className="
            text-gray-600
            dark:text-gray-300
            mb-6
          ">

            {error}

          </p>


          <button
            onClick={() =>
              navigate(
                "/etudiant"
              )
            }
            className="
              px-6
              py-3
              rounded-full
              bg-blue-600
              text-white
              hover:bg-blue-700
              transition
            "
          >

            ← Retour

          </button>

        </div>

      </div>

    );

  }


  // ==========================================================
  // AUCUNE QUESTION
  // ==========================================================

  if (
    totalQuestions === 0
  ) {

    return (

      <div className="
        max-w-2xl
        mx-auto
        p-6
        text-center
      ">

        <div className="
          bg-white
          dark:bg-gray-900
          rounded-2xl
          shadow-xl
          p-8
        ">

          <h1 className="
            text-2xl
            font-bold
            text-gray-800
            dark:text-white
            mb-4
          ">

            Aucune question disponible

          </h1>


          <p className="
            text-gray-600
            dark:text-gray-300
            mb-6
          ">

            Cette évaluation n'est pas encore disponible
            pour cet apprentissage.

          </p>


          <button
            onClick={() =>
              navigate(
                "/etudiant"
              )
            }
            className="
              px-6
              py-3
              rounded-full
              bg-blue-600
              text-white
              hover:bg-blue-700
              transition
            "
          >

            ← Retour

          </button>

        </div>

      </div>

    );

  }


  // ==========================================================
  // INTERFACE
  // ==========================================================

  return (

    <div className="
      max-w-3xl
      mx-auto
      p-4
      relative
    ">


      {/* ======================================================
          INDICATEUR HORS LIGNE
      ====================================================== */}

      {isOffline && (
        <motion.div
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="
            mb-4
            flex
            items-center
            justify-center
            gap-2
            text-xs
            sm:text-sm
            text-gray-600
            dark:text-gray-300
          "
        >

          <WifiOff className="w-4 h-4" />

          <span>
            Mode hors ligne
            {pendingSync
              ? " — résultat en attente de synchronisation"
              : ""}
          </span>

        </motion.div>
      )}


      {/* ======================================================
          COMMANDES
      ====================================================== */}

      <div className="
        absolute
        top-4
        right-4
        flex
        items-center
        gap-4
      ">

        <DarkModeToggle />

        <AudioManager />

      </div>


      {/* ======================================================
          CONTENEUR PRINCIPAL
      ====================================================== */}

      <div className="
        rounded-2xl
        p-6
        shadow-xl
        bg-white
        dark:bg-gray-900
        border
        border-gray-300
        dark:border-gray-700
        space-y-6
      ">


        {/* ====================================================
            TITRE
        ==================================================== */}

        <div className="text-center">

          <p className="
            text-sm
            uppercase
            tracking-widest
            text-blue-600
            dark:text-blue-400
            font-semibold
            mb-2
          ">

            CODE — Univers du savoir
            et des compétences

          </p>


          <h1 className="
            text-3xl
            font-bold
            text-blue-700
            dark:text-blue-300
          ">

            ÉVALUATION DIAGNOSTIQUE

          </h1>


          <p className="
            mt-2
            text-gray-600
            dark:text-gray-400
          ">

            {domaine}

            {" / "}

            {sousDomaine}

          </p>

        </div>


        {/* ====================================================
            PROGRESSION
        ==================================================== */}

        <div>

          <div className="
            w-full
            bg-gray-200
            dark:bg-gray-700
            h-3
            rounded-full
            overflow-hidden
          ">

            <div
              className="
                bg-blue-600
                h-full
                transition-all
                duration-500
              "
              style={{
                width:
                  `${
                    (
                      (
                        currentIndex + 1
                      ) /
                      totalQuestions
                    ) *
                    100
                  }%`,
              }}
            />

          </div>


          <p className="
            text-sm
            text-center
            mt-2
            text-gray-600
            dark:text-gray-400
          ">

            Question{" "}

            {currentIndex + 1}

            {" / "}

            {totalQuestions}

          </p>

        </div>


        {/* ====================================================
            QUESTION
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

            className="
              p-4
              border
              rounded-xl
              shadow-md
              bg-white
              dark:bg-gray-800
            "
          >


            {/* =================================================
                SITUATION
            ================================================= */}

            {currentQuestion
              .situation
              ?.texte && (

              <p className="
                mb-3
                italic
                text-gray-700
                dark:text-gray-300
              ">

                {
                  currentQuestion
                    .situation
                    .texte
                }

              </p>

            )}


            {/* =================================================
                IMAGE
            ================================================= */}

            {currentQuestion
              .situation
              ?.image && (

              <div className="
                mb-4
                flex
                justify-center
              ">

                <img
                  src={
                    currentQuestion
                      .situation
                      .image
                  }

                  alt="Illustration"

                  className="
                    rounded-lg
                    shadow
                    max-w-full
                    h-auto
                  "
                />

              </div>

            )}


            {/* =================================================
                QUESTION + CHRONOMÈTRE
            ================================================= */}

            <div className="
              flex
              justify-between
              items-start
              mb-4
            ">


              <div
                className="
                  font-medium
                  text-lg
                  text-gray-800
                  dark:text-gray-200
                  w-full
                  pr-4
                "

                dangerouslySetInnerHTML={{
                  __html:
                    currentQuestion
                      .question,
                }}

              />


              <CountdownCircle

                key={
                  currentQuestion.id
                }

                duration={
                  currentQuestion
                    .duree ??
                  60
                }

                initialRemainingTime={
                  remainingTime[
                    currentQuestion.id
                  ]
                }

                onTick={
                  (timeLeft) =>

                    setRemainingTime(
                      (prev) => ({

                        ...prev,

                        [
                          currentQuestion.id
                        ]:
                          timeLeft,

                      })
                    )
                }

                onComplete={
                  handleTimeUp
                }

              />

            </div>


            {/* =================================================
                OPTIONS
            ================================================= */}

            {!currentQuestion.choix ? (

              <div className="
                text-center
                text-gray-500
                dark:text-gray-400
                py-4
              ">

                Chargement des options...

              </div>

            ) : (

              <div className="
                grid
                gap-4
                mt-4
              ">

                {currentQuestion
                  .choix
                  .map(
                    (
                      opt,
                      idx
                    ) => {

                      const selected =

                        reponses.find(
                          (r) =>

                            String(
                              r.questionId
                            ) ===
                            String(
                              currentQuestion.id
                            )
                        )
                        ?.reponse ===
                        idx;


                      return (

                        <label
                          key={idx}

                          className={`
                            flex
                            items-center
                            gap-3
                            p-4
                            border
                            rounded-lg
                            shadow-sm
                            cursor-pointer
                            transition
                            text-base

                            ${
                              selected

                                ? "bg-blue-100 dark:bg-blue-800/40 border-blue-500"

                                : "hover:bg-gray-100 dark:hover:bg-gray-700"
                            }
                          `}
                        >

                          <input
                            type="radio"

                            name={
                              `q-${currentQuestion.id}`
                            }

                            value={
                              idx
                            }

                            checked={
                              selected
                            }

                            onChange={() =>
                              handleOptionSelect(
                                currentQuestion.id,
                                idx
                              )
                            }

                            className="
                              accent-blue-600
                              scale-125
                            "
                          />


                          <span className="
                            text-gray-800
                            dark:text-gray-200
                          ">

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
        ==================================================== */}

        <div className="
          flex
          justify-between
          items-center
          mt-6
        ">


          <button

            onClick={
              handlePrevious
            }

            disabled={
              currentIndex === 0
            }

            className="
              px-4
              py-2
              rounded-full
              border
              text-sm
              transition
              disabled:opacity-40
              bg-blue-600
              text-white
              hover:bg-blue-700
              border-blue-600
            "
          >

            ← Précédent

          </button>


          {currentIndex <
          totalQuestions - 1 ? (

            <button

              onClick={
                handleNext
              }

              className="
                bg-blue-600
                text-white
                px-6
                py-2
                rounded-full
                shadow
                hover:bg-blue-700
                transition
              "
            >

              Suivant →

            </button>

          ) : (

            <button

              onClick={
                handleSubmit
              }

              disabled={
                !allAnswered ||
                isSubmitting
              }

              className={`

                px-6
                py-2
                rounded-full
                shadow
                flex
                items-center
                gap-2
                transition

                ${
                  allAnswered &&
                  !isSubmitting

                    ? "bg-green-600 text-white hover:bg-green-700 cursor-pointer"

                    : "bg-gray-400 text-gray-700 cursor-not-allowed"
                }

              `}
            >

              {isSubmitting ? (

                <>

                  <Loader2
                    className="
                      w-5
                      h-5
                      animate-spin
                    "
                  />

                  Envoi...

                </>

              ) : (

                <>

                  <CheckCircle
                    className="
                      w-5
                      h-5
                    "
                  />

                  {isOffline
                    ? "Terminer hors ligne"
                    : "Terminer l'évaluation"}

                </>

              )}

            </button>

          )}

        </div>


      </div>

    </div>

  );

};


export default Evaluation;