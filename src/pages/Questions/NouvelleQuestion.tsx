import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Loader2,
  AlertCircle,
  ShieldCheck,
  BookOpen,
  CheckCircle2,
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
  // VALIDATION DU FORMULAIRE
  // ==========================================================

  const validerFormulaire = (): boolean => {
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

    // --------------------------------------------------------
    // DESTINATAIRE MATIÈRE
    // --------------------------------------------------------

    if (
      recipientType === "subject" &&
      !subject
    ) {
      setError(
        "Veuillez choisir une matière."
      );

      return false;
    }

    // --------------------------------------------------------
    // CLASSE APPRENANT
    // --------------------------------------------------------

    if (
      isLearner &&
      !learnerClass
    ) {
      setError(
        "Veuillez sélectionner votre classe."
      );

      return false;
    }

    return true;
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
    // VALIDATION
    // --------------------------------------------------------

    if (!validerFormulaire()) {
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
  // RENDU
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-3xl">

        {/* ==================================================
            RETOUR
            ================================================== */}

        <button
          type="button"
          onClick={retourPagePrecedente}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft size={18} />

          Retour à la page précédente
        </button>

        {/* ==================================================
            CARTE PRINCIPALE
            ================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

          {/* ------------------------------------------------
              TITRE
              ------------------------------------------------ */}

          <div className="mb-8">

            <div className="mb-3 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <MessageCircleIcon />
              </div>

              <h1 className="text-2xl font-bold text-slate-800">
                Poser une question
              </h1>

            </div>

            <p className="text-sm leading-6 text-slate-500">
              Décrivez clairement votre besoin afin que
              l'interlocuteur puisse vous répondre
              efficacement.
            </p>

          </div>

          {/* ==================================================
              MESSAGE D'ERREUR
              ================================================== */}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0"
              />

              <span>
                {error}
              </span>

            </div>
          )}

          {/* ==================================================
              MESSAGE DE SUCCÈS
              ================================================== */}

          {success && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">

              <CheckCircle2
                size={19}
                className="mt-0.5 shrink-0"
              />

              <span>
                {success}
              </span>

            </div>
          )}

          {/* ==================================================
              FORMULAIRE
              ================================================== */}

          <form
            onSubmit={envoyer}
            className="space-y-6"
          >

            {/* ==================================================
                DESTINATAIRE
                ================================================== */}

            <div>

              <label className="mb-3 block text-sm font-semibold text-slate-700">
                À qui souhaitez-vous poser votre question ?
              </label>

              <div className="grid gap-3 md:grid-cols-2">

                {/* ADMIN */}

                <button
                  type="button"
                  onClick={() =>
                    choisirDestinataire("admin")
                  }
                  disabled={sending}
                  className={`rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    recipientType === "admin"
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                >

                  <ShieldCheck className="mb-2 text-blue-600" />

                  <p className="font-semibold text-slate-800">
                    Administrateur CODE
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Question générale concernant
                    la plateforme, le compte ou
                    le fonctionnement de CODE.
                  </p>

                </button>

                {/* MATIÈRE */}

                <button
                  type="button"
                  onClick={() =>
                    choisirDestinataire("subject")
                  }
                  disabled={sending}
                  className={`rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    recipientType === "subject"
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                >

                  <BookOpen className="mb-2 text-blue-600" />

                  <p className="font-semibold text-slate-800">
                    Une matière
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Question pédagogique destinée
                    à un enseignant de la matière.
                  </p>

                </button>

              </div>
            </div>

            {/* ==================================================
                MATIÈRE
                ================================================== */}

            {recipientType === "subject" && (
              <div>

                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Matière
                </label>

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
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
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
                    <p className="mt-2 text-xs text-amber-600">
                      Aucune matière n'est actuellement
                      associée à un enseignant.
                    </p>
                  )}

              </div>
            )}

            {/* ==================================================
                APPRENANT
                ================================================== */}

            <div>

              <label className="mb-3 block text-sm font-semibold text-slate-700">
                Êtes-vous apprenant ?
              </label>

              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={() =>
                    choisirApprenant(true)
                  }
                  disabled={sending}
                  className={`rounded-xl border px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    isLearner
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:border-blue-300"
                  }`}
                >
                  Oui
                </button>

                <button
                  type="button"
                  onClick={() =>
                    choisirApprenant(false)
                  }
                  disabled={sending}
                  className={`rounded-xl border px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    !isLearner
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:border-blue-300"
                  }`}
                >
                  Non
                </button>

              </div>
            </div>

            {/* ==================================================
                CLASSE
                ================================================== */}

            {isLearner && (
              <div>

                <label
                  htmlFor="learnerClass"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Votre classe
                </label>

                <select
                  id="learnerClass"
                  value={learnerClass}
                  onChange={(e) =>
                    setLearnerClass(
                      e.target.value
                    )
                  }
                  disabled={sending}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
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

            {/* ==================================================
                TITRE
                ================================================== */}

            <div>

              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Titre
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
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {title.length}/255
              </p>

            </div>

            {/* ==================================================
                CONTENU
                ================================================== */}

            <div>

              <label
                htmlFor="content"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Votre question
              </label>

              <textarea
                id="content"
                value={content}
                onChange={(e) =>
                  setContent(e.target.value)
                }
                rows={7}
                disabled={sending}
                placeholder="Expliquez votre problème le plus précisément possible..."
                className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {content.length} caractère
                {content.length > 1 ? "s" : ""}
              </p>

            </div>

            {/* ==================================================
                BOUTON ENVOI
                ================================================== */}

            <button
              type="submit"
              disabled={sending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                  <Send size={19} />

                  Envoyer la question
                </>
              )}

            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// PETIT COMPOSANT ICÔNE
// ============================================================

const MessageCircleIcon = () => {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
    </svg>
  );
};

export default NouvelleQuestion;