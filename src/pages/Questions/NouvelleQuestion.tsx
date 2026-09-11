
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Loader2,
  AlertCircle,
  ShieldCheck,
  BookOpen,
  CheckCircle2,
  MessageCircle,
  GraduationCap,
  UserRound,
  Sparkles,
  Info,
  ChevronRight,
  CircleHelp,
  Check,
} from "lucide-react";

import api from "../../utils/axios";

// ============================================================
// CONSTANTES
// ============================================================

const CLASSES = [
  "6e",
  "5e",
  "4e",
  "3e",
  "2nde",
  "1ère",
  "Terminale",
];

// ============================================================
// TYPES
// ============================================================

type RecipientType = "admin" | "subject";

type QuestionCreatedResponse = {
  id: number;
  recipient_type?: RecipientType;
  subject?: string | null;
  status?: string;
};

// ============================================================
// COMPOSANT
// ============================================================

const NouvelleQuestion: React.FC = () => {
  const navigate = useNavigate();

  // ----------------------------------------------------------
  // DESTINATAIRE
  // ----------------------------------------------------------

  const [recipientType, setRecipientType] =
    useState<RecipientType>("admin");

  // ----------------------------------------------------------
  // MATIÈRES
  // ----------------------------------------------------------

  const [subjects, setSubjects] = useState<string[]>([]);

  const [subject, setSubject] = useState("");

  const [loadingSubjects, setLoadingSubjects] =
    useState(false);

  // ----------------------------------------------------------
  // APPRENANT
  // ----------------------------------------------------------

  const [isLearner, setIsLearner] =
    useState<boolean>(false);

  const [learnerClass, setLearnerClass] =
    useState("");

  // ----------------------------------------------------------
  // QUESTION
  // ----------------------------------------------------------

  const [title, setTitle] = useState("");

  const [content, setContent] = useState("");

  // ----------------------------------------------------------
  // ÉTATS
  // ----------------------------------------------------------

  const [sending, setSending] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  // ----------------------------------------------------------
  // ÉTAPE ACTUELLE
  // ----------------------------------------------------------

  const [step, setStep] = useState(1);

  const totalSteps = 3;

  // ==========================================================
  // RETOUR À LA PAGE PRÉCÉDENTE
  // ==========================================================

  const retourPagePrecedente = () => {
    navigate(-1);
  };

  // ==========================================================
  // CHARGER LES MATIÈRES DISPONIBLES
  // ==========================================================

  useEffect(() => {
    const chargerMatieres = async () => {
      try {
        setLoadingSubjects(true);

        console.log(
          "📚 Chargement des matières disponibles..."
        );

        /*
         * GET /api/teacher/subjects
         *
         * Cette route retourne les matières pour lesquelles
         * des enseignants sont configurés.
         *
         * Le token JWT est automatiquement ajouté par
         * utils/axios.ts.
         */

        const response = await api.get<string[]>(
          "/api/teacher/subjects"
        );

        console.log(
          "✅ Matières reçues du backend :",
          response.data
        );

        if (Array.isArray(response.data)) {
          setSubjects(response.data);
        } else {
          setSubjects([]);
        }
      } catch (err: any) {
        console.warn(
          "⚠️ Impossible de charger les matières :",
          err
        );

        /*
         * Si aucun enseignant n'est encore configuré,
         * on conserve une liste locale pour permettre
         * de construire/tester le formulaire.
         *
         * IMPORTANT :
         * le backend reste l'autorité lors de l'envoi.
         */

        setSubjects([
          "Mathématiques",
          "Français",
          "Anglais",
          "Informatique",
          "Sciences",
        ]);
      } finally {
        setLoadingSubjects(false);
      }
    };

    chargerMatieres();
  }, []);

  // ==========================================================
  // CHANGEMENT DE DESTINATAIRE
  // ==========================================================

  const choisirDestinataire = (
    type: RecipientType
  ) => {
    setRecipientType(type);

    setError(null);

    /*
     * Si l'utilisateur choisit l'administrateur,
     * la matière ne doit plus être conservée.
     */

    if (type === "admin") {
      setSubject("");
    }
  };

  // ==========================================================
  // CHANGEMENT APPRENANT
  // ==========================================================

  const choisirApprenant = (value: boolean) => {
    setIsLearner(value);

    setError(null);

    /*
     * Si la personne n'est pas apprenante,
     * la classe devient inutile.
     */

    if (!value) {
      setLearnerClass("");
    }
  };

  // ==========================================================
  // VALIDATION ÉTAPE 1
  // ==========================================================

  const validerEtape1 = (): boolean => {
    if (
      recipientType === "subject" &&
      !subject
    ) {
      setError(
        "Veuillez choisir une matière avant de continuer."
      );

      return false;
    }

    return true;
  };

  // ==========================================================
  // VALIDATION ÉTAPE 2
  // ==========================================================

  const validerEtape2 = (): boolean => {
    if (
      isLearner &&
      !learnerClass
    ) {
      setError(
        "Veuillez sélectionner votre classe avant de continuer."
      );

      return false;
    }

    return true;
  };

  // ==========================================================
  // VALIDATION ÉTAPE 3
  // ==========================================================

  const validerEtape3 = (): boolean => {
    const titre = title.trim();

    const question = content.trim();

    // --------------------------------------------------------
    // TITRE
    // --------------------------------------------------------

    if (!titre) {
      setError(
        "Veuillez renseigner le titre de votre question."
      );

      return false;
    }

    // --------------------------------------------------------
    // CONTENU
    // --------------------------------------------------------

    if (!question) {
      setError(
        "Veuillez écrire votre question."
      );

      return false;
    }

    return true;
  };

  // ==========================================================
  // PASSER À L'ÉTAPE SUIVANTE
  // ==========================================================

  const continuer = () => {
    setError(null);

    if (step === 1) {
      if (!validerEtape1()) {
        return;
      }

      setStep(2);

      return;
    }

    if (step === 2) {
      if (!validerEtape2()) {
        return;
      }

      setStep(3);

      return;
    }
  };

  // ==========================================================
  // REVENIR À L'ÉTAPE PRÉCÉDENTE
  // ==========================================================

  const precedent = () => {
    setError(null);

    if (step > 1) {
      setStep((ancienneEtape) => ancienneEtape - 1);
    }
  };

  // ==========================================================
  // ENVOYER LA QUESTION
  // ==========================================================

  const envoyer = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (sending) {
      return;
    }

    setError(null);
    setSuccess(null);

    // --------------------------------------------------------
    // VALIDATION FINALE
    // --------------------------------------------------------

    if (!validerEtape3()) {
      return;
    }

    try {
      setSending(true);

      console.log(
        "📤 Envoi d'une nouvelle question..."
      );

      // ------------------------------------------------------
      // DONNÉES ENVOYÉES AU BACKEND
      // ------------------------------------------------------

      const donnees = {
        recipient_type: recipientType,

        /*
         * Une question adressée à l'admin n'a pas de matière.
         */

        subject:
          recipientType === "subject"
            ? subject
            : null,

        is_learner: isLearner,

        /*
         * Une personne non apprenante n'a pas de classe.
         */

        learner_class:
          isLearner
            ? learnerClass
            : null,

        title: title.trim(),

        content: content.trim(),
      };

      console.log(
        "📦 Données envoyées au backend :",
        donnees
      );

      // ------------------------------------------------------
      // POST /api/questions
      // ------------------------------------------------------

      const response =
        await api.post<QuestionCreatedResponse>(
          "/api/questions",
          donnees
        );

      console.log(
        "✅ Question créée par le backend :",
        response.data
      );

      // ------------------------------------------------------
      // VÉRIFICATION DE L'ID
      // ------------------------------------------------------

      if (!response.data?.id) {
        console.error(
          "⚠️ Le backend n'a pas retourné d'identifiant :",
          response.data
        );

        setError(
          "La question semble avoir été envoyée, mais le serveur n'a pas retourné son identifiant."
        );

        return;
      }

      // ------------------------------------------------------
      // SUCCÈS
      // ------------------------------------------------------

      setSuccess(
        "Votre question a été envoyée avec succès."
      );

      /*
       * Petite pause afin que l'utilisateur puisse voir
       * le message de succès avant d'ouvrir la conversation.
       */

      setTimeout(() => {
        navigate(
          `/questions/${response.data.id}`
        );
      }, 500);
    } catch (err: any) {
      console.error(
        "❌ Erreur lors de l'envoi de la question :",
        err
      );

      const statusCode =
        err?.response?.status;

      const backendMessage =
        err?.response?.data?.detail;

      // ------------------------------------------------------
      // ERREURS HTTP
      // ------------------------------------------------------

      if (statusCode === 400) {
        setError(
          backendMessage ||
            "Les informations envoyées sont invalides."
        );
      } else if (statusCode === 401) {
        setError(
          "Votre session a expiré. Veuillez vous reconnecter."
        );
      } else if (statusCode === 403) {
        setError(
          backendMessage ||
            "Vous n'avez pas l'autorisation de poser cette question."
        );
      } else if (statusCode === 404) {
        setError(
          backendMessage ||
            "Le service demandé est introuvable."
        );
      } else if (statusCode === 422) {
        setError(
          "Certaines informations sont incorrectes. Vérifiez le formulaire."
        );
      } else if (statusCode === 500) {
        setError(
          "Une erreur interne est survenue sur le serveur. Veuillez réessayer."
        );
      } else if (backendMessage) {
        setError(backendMessage);
      } else if (err?.request) {
        setError(
          "Impossible de contacter le serveur. Vérifiez que le backend CODE est démarré."
        );
      } else {
        setError(
          "Impossible d'envoyer votre question."
        );
      }
    } finally {
      setSending(false);
    }
  };

  // ==========================================================
  // INFORMATIONS DES ÉTAPES
  // ==========================================================

  const informationsEtapes = [
    {
      numero: 1,
      titre: "Destinataire",
      description: "À qui poser votre question ?",
      icon: ShieldCheck,
    },
    {
      numero: 2,
      titre: "Votre profil",
      description: "Quelques informations sur vous",
      icon: GraduationCap,
    },
    {
      numero: 3,
      titre: "Votre question",
      description: "Décrivez votre demande",
      icon: MessageCircle,
    },
  ];

  // ==========================================================
  // RENDU
  // ==========================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 transition-colors dark:bg-slate-950 md:px-8">

      {/* ==================================================
          DÉCORATION DE FOND
          ================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-900/20" />

        <div className="absolute right-[-120px] top-1/4 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-900/20" />

        <div className="absolute bottom-[-150px] left-1/3 h-96 w-96 rounded-full bg-sky-200/20 blur-3xl dark:bg-sky-900/10" />

      </div>

      <div className="relative z-10 mx-auto max-w-5xl">

        {/* ==================================================
            RETOUR
            ================================================== */}

        <button
          type="button"
          onClick={retourPagePrecedente}
          className="group mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm backdrop-blur transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:text-blue-400"
        >
          <ArrowLeft
            size={18}
            className="transition-transform group-hover:-translate-x-1"
          />

          Retour à la page précédente
        </button>

        {/* ==================================================
            EN-TÊTE
            ================================================== */}

        <div className="mb-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="relative p-6 md:p-8">

            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-400/10" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div className="flex items-start gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20">
                  <MessageCircle size={27} />
                </div>

                <div>

                  <div className="mb-1 flex items-center gap-2">

                    <Sparkles
                      size={15}
                      className="text-blue-500"
                    />

                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                      Espace de communication CODE
                    </span>

                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                    Poser une question
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Suivez les étapes pour transmettre
                    votre demande au bon interlocuteur.
                  </p>

                </div>

              </div>

              <div className="hidden shrink-0 items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 dark:border-blue-900/50 dark:bg-blue-950/30 md:flex">

                <CircleHelp
                  size={20}
                  className="text-blue-600 dark:text-blue-400"
                />

                <div>

                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-300">
                    Besoin d'aide ?
                  </p>

                  <p className="text-[11px] text-blue-700/70 dark:text-blue-400/70">
                    Une étape à la fois.
                  </p>

                </div>

              </div>

            </div>
          </div>
        </div>

        {/* ==================================================
            PROGRESSION
            ================================================== */}

        <div className="mb-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-6">

          <div className="mb-5 flex items-center justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600 dark:text-blue-400">
                Progression
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                Étape {step} sur {totalSteps}
              </p>

            </div>

            <div className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              {Math.round(
                (step / totalSteps) * 100
              )}%
            </div>

          </div>

          {/* BARRE */}

          <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">

            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
              style={{
                width: `${(step / totalSteps) * 100}%`,
              }}
            />

          </div>

          {/* ÉTAPES */}

          <div className="grid grid-cols-3 gap-2 md:gap-4">

            {informationsEtapes.map(
              (etape) => {
                const Icon = etape.icon;

                const active =
                  step === etape.numero;

                const completed =
                  step > etape.numero;

                return (
                  <div
                    key={etape.numero}
                    className={`flex items-center gap-2 rounded-2xl border p-2.5 transition md:p-3 ${
                      active
                        ? "border-blue-200 bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/20"
                        : completed
                        ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/10"
                        : "border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40"
                    }`}
                  >

                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                        active
                          ? "bg-blue-600 text-white"
                          : completed
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500"
                      }`}
                    >
                      {completed ? (
                        <Check size={15} />
                      ) : (
                        <Icon size={15} />
                      )}
                    </div>

                    <div className="hidden min-w-0 sm:block">

                      <p
                        className={`truncate text-xs font-bold ${
                          active
                            ? "text-blue-700 dark:text-blue-400"
                            : completed
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-slate-500 dark:text-slate-500"
                        }`}
                      >
                        {etape.titre}
                      </p>

                      <p className="mt-0.5 hidden truncate text-[10px] text-slate-400 lg:block dark:text-slate-600">
                        {etape.description}
                      </p>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        </div>

        {/* ==================================================
            CARTE PRINCIPALE
            ================================================== */}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">

          {/* ==================================================
              BARRE DE SECTION
              ================================================== */}

          <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/40">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">

                {step === 1 && (
                  <ShieldCheck size={18} />
                )}

                {step === 2 && (
                  <GraduationCap size={18} />
                )}

                {step === 3 && (
                  <MessageCircle size={18} />
                )}

              </div>

              <div>

                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {informationsEtapes[
                    step - 1
                  ].titre}
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-500">
                  {
                    informationsEtapes[
                      step - 1
                    ].description
                  }
                </p>

              </div>

            </div>
          </div>

          <div className="p-6 md:p-8">

            {/* ==================================================
                MESSAGES
                ================================================== */}

            {error && (
              <div className="mb-7 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/50">
                  <AlertCircle size={19} />
                </div>

                <div className="pt-1">

                  <p className="font-semibold">
                    Vérification nécessaire
                  </p>

                  <p className="mt-1 leading-5">
                    {error}
                  </p>

                </div>

              </div>
            )}

            {success && (
              <div className="mb-7 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/50">
                  <CheckCircle2 size={19} />
                </div>

                <div className="pt-1">

                  <p className="font-semibold">
                    Question envoyée
                  </p>

                  <p className="mt-1 leading-5">
                    {success}
                  </p>

                </div>

              </div>
            )}

            {/* ==================================================
                FORMULAIRE
                ================================================== */}

            <form
              onSubmit={envoyer}
              className="space-y-8"
            >

              {/* ==================================================
                  ÉTAPE 1 — DESTINATAIRE
                  ================================================== */}

              {step === 1 && (
                <section>

                  <div className="mb-6">

                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Choisissez votre interlocuteur
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Indiquez si votre question concerne
                      l'administration de CODE ou une
                      matière précise.
                    </p>

                  </div>

                  <div className="grid gap-4 md:grid-cols-2">

                    {/* ADMIN */}

                    <button
                      type="button"
                      onClick={() =>
                        choisirDestinataire("admin")
                      }
                      disabled={sending}
                      className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                        recipientType === "admin"
                          ? "border-blue-500 bg-blue-50/80 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/10 dark:border-blue-500 dark:bg-blue-950/20"
                          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800"
                      }`}
                    >

                      {recipientType === "admin" && (
                        <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white">
                          <Check size={15} />
                        </div>
                      )}

                      <div
                        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${
                          recipientType === "admin"
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                            : "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                        }`}
                      >
                        <ShieldCheck size={23} />
                      </div>

                      <p className="font-bold text-slate-900 dark:text-white">
                        Administrateur CODE
                      </p>

                      <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        Question générale concernant
                        la plateforme, votre compte ou
                        le fonctionnement de CODE.
                      </p>

                      <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        Assistance générale
                        <ChevronRight
                          size={14}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </div>

                    </button>

                    {/* MATIÈRE */}

                    <button
                      type="button"
                      onClick={() =>
                        choisirDestinataire("subject")
                      }
                      disabled={sending}
                      className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                        recipientType === "subject"
                          ? "border-indigo-500 bg-indigo-50/80 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/10 dark:border-indigo-500 dark:bg-indigo-950/20"
                          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
                      }`}
                    >

                      {recipientType === "subject" && (
                        <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white">
                          <Check size={15} />
                        </div>
                      )}

                      <div
                        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${
                          recipientType === "subject"
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                            : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                        }`}
                      >
                        <BookOpen size={23} />
                      </div>

                      <p className="font-bold text-slate-900 dark:text-white">
                        Une matière
                      </p>

                      <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        Question pédagogique destinée
                        à un enseignant spécialisé dans
                        une matière.
                      </p>

                      <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        Assistance pédagogique
                        <ChevronRight
                          size={14}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </div>

                    </button>

                  </div>

                  {/* MATIÈRE */}

                  {recipientType === "subject" && (
                    <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5 dark:border-indigo-900/40 dark:bg-indigo-950/10">

                      <div className="mb-4 flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                          <BookOpen size={18} />
                        </div>

                        <div>
                          <label
                            htmlFor="subject"
                            className="block text-sm font-bold text-slate-800 dark:text-slate-200"
                          >
                            Matière
                          </label>

                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">
                            Sélectionnez la matière
                            concernée.
                          </p>
                        </div>

                      </div>

                      <select
                        id="subject"
                        value={subject}
                        onChange={(e) =>
                          setSubject(e.target.value)
                        }
                        disabled={
                          loadingSubjects ||
                          sending
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:disabled:bg-slate-950"
                      >

                        <option value="">
                          {loadingSubjects
                            ? "Chargement des matières..."
                            : "Sélectionner une matière"}
                        </option>

                        {subjects.map((item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        ))}

                      </select>

                      {!loadingSubjects &&
                        subjects.length === 0 && (
                          <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                            <AlertCircle size={15} />

                            <span>
                              Aucune matière n'est
                              actuellement associée à
                              un enseignant.
                            </span>
                          </div>
                        )}

                    </div>
                  )}

                </section>
              )}

              {/* ==================================================
                  ÉTAPE 2 — PROFIL
                  ================================================== */}

              {step === 2 && (
                <section>

                  <div className="mb-6">

                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Parlez-nous un peu de vous
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Ces informations permettent de
                      mieux contextualiser votre demande.
                    </p>

                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/40">

                    <div className="mb-5 flex items-center gap-3">

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                        <UserRound size={20} />
                      </div>

                      <div>

                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          Êtes-vous apprenant ?
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">
                          Sélectionnez votre situation.
                        </p>

                      </div>

                    </div>

                    <div className="grid grid-cols-2 gap-3">

                      <button
                        type="button"
                        onClick={() =>
                          choisirApprenant(true)
                        }
                        disabled={sending}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-5 py-4 text-sm font-semibold transition ${
                          isLearner
                            ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-600/15"
                            : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:text-blue-400"
                        }`}
                      >
                        <GraduationCap size={19} />

                        Oui
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          choisirApprenant(false)
                        }
                        disabled={sending}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-5 py-4 text-sm font-semibold transition ${
                          !isLearner
                            ? "border-slate-500 bg-slate-800 text-white shadow-lg shadow-slate-800/10 dark:border-slate-500 dark:bg-slate-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600"
                        }`}
                      >
                        <UserRound size={19} />

                        Non
                      </button>

                    </div>

                  </div>

                  {isLearner && (
                    <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/40 p-5 dark:border-blue-900/40 dark:bg-blue-950/10">

                      <div className="mb-4 flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                          <GraduationCap size={18} />
                        </div>

                        <div>

                          <label
                            htmlFor="learnerClass"
                            className="block text-sm font-bold text-slate-800 dark:text-slate-200"
                          >
                            Votre classe
                          </label>

                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">
                            Indiquez votre niveau actuel.
                          </p>

                        </div>

                      </div>

                      <select
                        id="learnerClass"
                        value={learnerClass}
                        onChange={(e) =>
                          setLearnerClass(
                            e.target.value
                          )
                        }
                        disabled={sending}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-blue-500 dark:disabled:bg-slate-950"
                      >

                        <option value="">
                          Sélectionner votre classe
                        </option>

                        {CLASSES.map((classe) => (
                          <option
                            key={classe}
                            value={classe}
                          >
                            {classe}
                          </option>
                        ))}

                      </select>

                    </div>
                  )}

                  {!isLearner && (
                    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <Info size={17} />
                      </div>

                      <p className="pt-1 text-xs leading-5 text-slate-500 dark:text-slate-500">
                        Aucun niveau scolaire ne sera
                        demandé puisque vous avez indiqué
                        ne pas être apprenant.
                      </p>

                    </div>
                  )}

                </section>
              )}

              {/* ==================================================
                  ÉTAPE 3 — QUESTION
                  ================================================== */}

              {step === 3 && (
                <section>

                  <div className="mb-6">

                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Décrivez votre question
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Plus votre demande sera précise,
                      plus votre interlocuteur pourra vous
                      apporter une réponse pertinente.
                    </p>

                  </div>

                  <div className="space-y-5">

                    {/* TITRE */}

                    <div>

                      <label
                        htmlFor="title"
                        className="mb-2.5 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Titre de la question
                      </label>

                      <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) =>
                          setTitle(e.target.value)
                        }
                        maxLength={255}
                        disabled={sending}
                        placeholder="Exemple : Je ne comprends pas cette notion..."
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600 dark:focus:border-blue-500 dark:disabled:bg-slate-950"
                      />

                      <div className="mt-2 flex justify-end">

                        <p className="text-xs text-slate-400 dark:text-slate-600">
                          {title.length}/255
                        </p>

                      </div>

                    </div>

                    {/* CONTENU */}

                    <div>

                      <label
                        htmlFor="content"
                        className="mb-2.5 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Votre question
                      </label>

                      <textarea
                        id="content"
                        value={content}
                        onChange={(e) =>
                          setContent(e.target.value)
                        }
                        rows={9}
                        disabled={sending}
                        placeholder="Expliquez votre problème le plus précisément possible..."
                        className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600 dark:focus:border-blue-500 dark:disabled:bg-slate-950"
                      />

                      <div className="mt-2 flex items-center justify-between gap-3">

                        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-600">

                          <Info size={13} />

                          <span>
                            Une question précise facilite
                            une réponse précise.
                          </span>

                        </div>

                        <p className="text-xs text-slate-400 dark:text-slate-600">
                          {content.length} caractère
                          {content.length > 1 ? "s" : ""}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* RAPPEL */}

                  <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/10">

                    <div className="flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                        <ShieldCheck size={18} />
                      </div>

                      <div>

                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-300">
                          Avant d'envoyer
                        </p>

                        <p className="mt-1 text-xs leading-5 text-blue-700/70 dark:text-blue-400/70">
                          Vérifiez que le titre et la
                          description représentent bien
                          votre demande.
                        </p>

                      </div>

                    </div>

                  </div>

                </section>
              )}

              {/* ==================================================
                  NAVIGATION ENTRE LES ÉTAPES
                  ================================================== */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">

                {/* PRÉCÉDENT */}

                {step > 1 ? (
                  <button
                    type="button"
                    onClick={precedent}
                    disabled={sending}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                  >
                    <ArrowLeft size={18} />

                    Précédent
                  </button>
                ) : (
                  <div />
                )}

                {/* CONTINUER */}

                {step < totalSteps && (
                  <button
                    type="button"
                    onClick={continuer}
                    disabled={sending}
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:min-w-[180px]"
                  >
                    Continuer

                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </button>
                )}

                {/* ENVOYER */}

                {step === totalSteps && (
                  <button
                    type="submit"
                    disabled={sending}
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:min-w-[220px]"
                  >

                    {sending ? (
                      <>
                        <Loader2
                          size={19}
                          className="animate-spin"
                        />

                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send
                          size={18}
                          className="transition-transform group-hover:translate-x-0.5"
                        />

                        Envoyer la question
                      </>
                    )}

                  </button>
                )}

              </div>

            </form>
          </div>
        </div>

        {/* ==================================================
            PIED DE PAGE
            ================================================== */}

        <div className="mt-6 flex items-center justify-center gap-2 px-4 text-center text-xs text-slate-400 dark:text-slate-600">

          <ShieldCheck size={14} />

          <span>
            Vos échanges sont traités dans un espace
            sécurisé de la plateforme CODE.
          </span>

        </div>

      </div>
    </div>
  );
};

export default NouvelleQuestion;

