import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowLeft,
  ChevronRight,
  CircleHelp,
  Lightbulb,
  RotateCcw,
  Send,
  X,
  User,
  Brain,
  Target,
  ListChecks,
  BookOpen,
  Sparkles,
  MessageCircle,
  GraduationCap,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import  api  from "@/utils/axios";

/* ========================================================
   TYPES
======================================================== */

type ModeIA =
  | "comprendre"
  | "corriger"
  | "approfondir";

type EtapePedagogique =
  | "accueil"
  | "raisonnement"
  | "diagnostic"
  | "indice"
  | "recherche"
  | "verification"
  | "approfondissement"
  | "termine";

type NiveauComprehension =
  | "inconnue"
  | "fragile"
  | "partielle"
  | "solide";

type OrigineAcces =
  | "remediation"
  | "remediation-video"
  | "inconnue";

type FenetreActive =
  | "question"
  | "parcours"
  | "diagnostic"
  | "objectif"
  | "enseignant"
  | "actions"
  | null;

interface TeacherProfile {
  id?: number | string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  pays_residence?: string;
  teacher_photo?: string;
  subjects?: string[];
}

interface QuestionContext {
  id?: number | string;
  question?: string;
  choix?: unknown;
  bonne_reponse?: string;
  bonneReponse?: string;
  reponse_apprenant?: string;
  reponseUtilisateur?: string;
  reponse_user?: string;
  notion?: string;
  niveau?: string;
  classe?: string;
  correcte?: boolean;
  enseignant?: string | null;
}

interface LocationState {
  question?: QuestionContext;
  questionActuelle?: QuestionContext;

  reponseUtilisateur?: string;
  bonneReponse?: string;
  correcte?: boolean;

  notion?: string;
  niveauActuel?: string;
  classe?: string;

  enseignant?: string | null;

  origineAcces?: string;
  sourcePage?: string;
  source?: string;

  resultats?: unknown;
}

interface MessageIA {
  id: number;
  role: "ia" | "eleve";
  contenu: string;
}

interface DiagnosticIA {
  niveauConfiance: number;
  tentative: number;
  niveauAide: number;
  erreurIdentifiee: string | null;
  notionsMaitrisees: string[];
  notionsFragiles: string[];
  comprehension: NiveauComprehension;
}

interface DiagnosticGemini {
  comprehension?: NiveauComprehension;
  erreur?: string | null;

  notions_maitrisees?: string[];
  notions_fragiles?: string[];

  notionsMaitrisees?: string[];
  notionsFragiles?: string[];
}

interface ReponseGemini {
  type?: string;
  message: string;

  diagnostic?: DiagnosticGemini;

  niveau_aide?: number;

  prochaine_etape?: string;

  doit_reveler_solution?: boolean;

  attend_reponse_eleve?: boolean;
}

interface HistoriqueGemini {
  role: "ia" | "eleve";
  contenu: string;
}

type ActionRapide =
  | "autrement"
  | "indice"
  | "similaire"
  | "difficile"
  | "application";

/* ========================================================
   API
======================================================== */

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

const API_IA_URL =
  `${API_BASE_URL}/api/ia/explication-question`;

/* ========================================================
   OUTILS
======================================================== */

function convertirEnTexte(
  valeur: unknown
): string {
  if (
    valeur === null ||
    valeur === undefined
  ) {
    return "";
  }

  if (typeof valeur === "string") {
    return valeur;
  }

  if (
    typeof valeur === "number" ||
    typeof valeur === "boolean"
  ) {
    return String(valeur);
  }

  if (Array.isArray(valeur)) {
    return valeur
      .map(convertirEnTexte)
      .filter(Boolean)
      .join(", ");
  }

  if (typeof valeur === "object") {
    try {
      return JSON.stringify(valeur);
    } catch {
      return "";
    }
  }

  return "";
}

function normaliserTexte(
  valeur: unknown
): string {
  return convertirEnTexte(valeur)
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .replace(
      /[^\p{L}\p{N}\s]/gu,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();
}

function construireUrlPhoto(
  photo?: string | null
): string | null {
  if (!photo) {
    return null;
  }

  if (
    /^https?:\/\//i.test(photo)
  ) {
    return photo;
  }

  if (photo.startsWith("/")) {
    return `${API_BASE_URL}${photo}`;
  }

  return `${API_BASE_URL}/${photo}`;
}

function normaliserEtape(
  valeur?: string
): EtapePedagogique {
  const etapes: EtapePedagogique[] = [
    "accueil",
    "raisonnement",
    "diagnostic",
    "indice",
    "recherche",
    "verification",
    "approfondissement",
    "termine",
  ];

  return etapes.includes(
    valeur as EtapePedagogique
  )
    ? (valeur as EtapePedagogique)
    : "raisonnement";
}

function normaliserComprehension(
  valeur?: string
): NiveauComprehension {
  const niveaux: NiveauComprehension[] = [
    "inconnue",
    "fragile",
    "partielle",
    "solide",
  ];

  return niveaux.includes(
    valeur as NiveauComprehension
  )
    ? (valeur as NiveauComprehension)
    : "inconnue";
}

function determinerOrigineAcces(
  state: LocationState
): OrigineAcces {
  const valeurs = [
    state.origineAcces,
    state.sourcePage,
    state.source,
  ]
    .filter(Boolean)
    .map(normaliserTexte);

  if (
    valeurs.some(
      (valeur) =>
        valeur === "remediation video" ||
        valeur === "video"
    )
  ) {
    return "remediation-video";
  }

  if (
    valeurs.some(
      (valeur) =>
        valeur === "remediation" ||
        valeur.includes("remediation")
    )
  ) {
    return "remediation";
  }

  if (
    "resultats" in state
  ) {
    return state.resultats == null
      ? "remediation-video"
      : "remediation";
  }

  return "inconnue";
}

/* ========================================================
   COMPOSANT
======================================================== */

export default function ExplicationQuestion() {
  const location = useLocation();
  const navigate = useNavigate();

  const state =
    (location.state || {}) as LocationState;

  /* ======================================================
     DARK MODE
  ====================================================== */

  const [darkMode, setDarkMode] =
    useState(() =>
      document.documentElement.classList.contains(
        "dark"
      )
    );

  useEffect(() => {
    const observer =
      new MutationObserver(() => {
        setDarkMode(
          document.documentElement.classList.contains(
            "dark"
          )
        );
      });

    observer.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: ["class"],
      }
    );

    return () => observer.disconnect();
  }, []);

  /* ======================================================
     QUESTION
  ====================================================== */

  const question = useMemo(
    () =>
      state.questionActuelle ||
      state.question || {
        question: "",
      },
    [state.questionActuelle, state.question]
  );

  const texteQuestion =
    convertirEnTexte(
      question.question
    );

  const reponseApprenant =
    convertirEnTexte(
      state.reponseUtilisateur ??
        question.reponse_apprenant ??
        question.reponseUtilisateur ??
        question.reponse_user
    );

  const bonneReponse =
    convertirEnTexte(
      state.bonneReponse ??
        question.bonne_reponse ??
        question.bonneReponse
    );

  const notion =
    convertirEnTexte(
      state.notion ?? question.notion
    );

  const niveau =
    convertirEnTexte(
      state.niveauActuel ??
        question.niveau
    );

  const classe =
    convertirEnTexte(
      state.classe ??
        question.classe
    );

  const choix = useMemo(() => {
    const valeur = question.choix;

    if (!valeur) {
      return [];
    }

    if (Array.isArray(valeur)) {
      return valeur.map(
        convertirEnTexte
      );
    }

    if (
      typeof valeur === "object"
    ) {
      return Object.values(
        valeur as Record<string, unknown>
      ).map(convertirEnTexte);
    }

    return [];
  }, [question.choix]);

  const correcte = useMemo(() => {
    if (
      typeof state.correcte ===
      "boolean"
    ) {
      return state.correcte;
    }

    if (
      typeof question.correcte ===
      "boolean"
    ) {
      return question.correcte;
    }

    if (
      reponseApprenant &&
      bonneReponse
    ) {
      return (
        normaliserTexte(
          reponseApprenant
        ) ===
        normaliserTexte(
          bonneReponse
        )
      );
    }

    return false;
  }, [
    state.correcte,
    question.correcte,
    reponseApprenant,
    bonneReponse,
  ]);

  /* ======================================================
     ORIGINE
  ====================================================== */

  const origineAcces =
    useMemo(
      () =>
        determinerOrigineAcces(
          state
        ),
      [state]
    );

  const solutionConnueAuDepart =
    origineAcces ===
    "remediation";

  /* ======================================================
     ENSEIGNANT
  ====================================================== */

  const [teacherProfile, setTeacherProfile] =
    useState<TeacherProfile | null>(
      null
    );

  const [
    teacherLoading,
    setTeacherLoading,
  ] = useState(false);

  const [
    teacherError,
    setTeacherError,
  ] = useState<string | null>(
    null
  );

  const enseignant =
    state.enseignant ??
    question.enseignant ??
    null;

  useEffect(() => {
    let actif = true;

    const chargerProfil =
      async () => {
        if (
          !enseignant ||
          typeof enseignant !==
            "string"
        ) {
          setTeacherProfile(null);
          return;
        }

        setTeacherLoading(true);
        setTeacherError(null);

        try {
          const response =
            await api.get(
              "/api/teacher/public-profile",
              {
                params: {
                  email: enseignant,
                },
              }
            );

          if (actif) {
            setTeacherProfile(
              response.data
            );
          }
        } catch (error) {
          console.error(
            "Erreur chargement enseignant :",
            error
          );

          if (actif) {
            setTeacherError(
              "Impossible de charger le profil de l'enseignant."
            );
          }
        } finally {
          if (actif) {
            setTeacherLoading(false);
          }
        }
      };

    chargerProfil();

    return () => {
      actif = false;
    };
  }, [enseignant]);

  const teacherPhotoUrl =
    construireUrlPhoto(
      teacherProfile?.teacher_photo
    );

  const teacherFullName =
    teacherProfile
      ? `${teacherProfile.prenom} ${teacherProfile.nom}`
      : "Enseignant";

  const teacherInitials =
    teacherProfile
      ? `${teacherProfile.prenom?.[0] ?? ""}${teacherProfile.nom?.[0] ?? ""}`
          .toUpperCase()
      : "?";

  const teacherProfileUrl =
    enseignant
      ? `/enseignant/profil/${encodeURIComponent(
          enseignant
        )}`
      : "";

  const ouvrirProfilEnseignant =
    () => {
      if (teacherProfileUrl) {
        navigate(
          teacherProfileUrl
        );
      }
    };

  /* ======================================================
     ÉTAT PÉDAGOGIQUE
  ====================================================== */

  const [mode, setMode] =
    useState<ModeIA>(
      solutionConnueAuDepart
        ? "comprendre"
        : "corriger"
    );

  const [etape, setEtape] =
    useState<EtapePedagogique>(
      solutionConnueAuDepart
        ? "raisonnement"
        : "accueil"
    );

  const [messages, setMessages] =
    useState<MessageIA[]>([
      {
        id: 1,
        role: "ia",
        contenu:
          solutionConnueAuDepart
            ? "Tu connais déjà la réponse finale. Nous allons maintenant vérifier si tu maîtrises réellement le raisonnement qui permet de l'obtenir."
            : "Tu as choisi une réponse. Nous allons d'abord analyser ton raisonnement avant de te donner la solution.",
      },
      {
        id: 2,
        role: "ia",
        contenu:
          "Explique-moi simplement comment tu as réfléchi pour arriver à ta réponse.",
      },
    ]);

  const [iaEnCours, setIaEnCours] =
    useState(false);

  const [erreurAPI, setErreurAPI] =
    useState<string | null>(null);

  const [solutionRevelee, setSolutionRevelee] =
    useState(
      solutionConnueAuDepart
    );

  const [
    fenetreActive,
    setFenetreActive,
  ] =
    useState<FenetreActive>(
      null
    );

  const [diagnostic, setDiagnostic] =
    useState<DiagnosticIA>({
      niveauConfiance:
        solutionConnueAuDepart
          ? 40
          : 20,
      tentative: 1,
      niveauAide: 0,
      erreurIdentifiee: null,
      notionsMaitrisees: [],
      notionsFragiles: notion
        ? [notion]
        : [],
      comprehension:
        solutionConnueAuDepart
          ? "partielle"
          : "fragile",
    });

  /* ======================================================
     MESSAGES
  ====================================================== */

  const ajouterMessage = (
    role: "ia" | "eleve",
    contenu: string
  ) => {
    setMessages(
      (precedents) => [
        ...precedents,
        {
          id:
            Date.now() +
            Math.random(),
          role,
          contenu,
        },
      ]
    );
  };

  const construireHistorique = (
    historiqueSource =
      messages
  ): HistoriqueGemini[] => {
    return historiqueSource
      .slice(-20)
      .map((message) => ({
        role: message.role,
        contenu: message.contenu,
      }));
  };

  /* ======================================================
     DIAGNOSTIC
  ====================================================== */

  const resultatComprehension =
    (
      resultat: ReponseGemini
    ): NiveauComprehension => {
      return normaliserComprehension(
        resultat.diagnostic
          ?.comprehension
      );
    };

  const calculerNouvelleConfiance =
    (
      ancienne: number,
      resultat: ReponseGemini
    ) => {
      const comprehension =
        resultatComprehension(
          resultat
        );

      if (
        comprehension ===
        "solide"
      ) {
        return Math.min(
          100,
          Math.max(
            ancienne + 15,
            75
          )
        );
      }

      if (
        comprehension ===
        "partielle"
      ) {
        return Math.min(
          85,
          ancienne + 8
        );
      }

      if (
        comprehension ===
        "fragile"
      ) {
        return Math.max(
          10,
          ancienne - 2
        );
      }

      return ancienne;
    };

  const appliquerDiagnosticGemini =
    (
      resultat: ReponseGemini
    ) => {
      const diag =
        resultat.diagnostic;

      if (!diag) {
        return;
      }

      const comprehension =
        normaliserComprehension(
          diag.comprehension
        );

      setDiagnostic(
        (precedent) => ({
          ...precedent,

          niveauConfiance:
            calculerNouvelleConfiance(
              precedent.niveauConfiance,
              resultat
            ),

          tentative:
            precedent.tentative +
            1,

          niveauAide:
            typeof resultat.niveau_aide ===
            "number"
              ? resultat.niveau_aide
              : precedent.niveauAide,

          erreurIdentifiee:
            diag.erreur ??
            null,

          notionsMaitrisees:
            diag.notionsMaitrisees ??
            diag.notions_maitrisees ??
            precedent.notionsMaitrisees,

          notionsFragiles:
            diag.notionsFragiles ??
            diag.notions_fragiles ??
            precedent.notionsFragiles,

          comprehension,
        })
      );
    };

  /* ======================================================
     GEMINI
  ====================================================== */

  const demanderAIAvecGemini =
    async (
      messageUtilisateur: string,
      historiqueSource?: MessageIA[],
      modeUtilise: ModeIA = mode,
      etapeUtilisee: EtapePedagogique =
        etape
    ) => {
      const payload = {
        question:
          texteQuestion,

        choix,

        reponse_apprenant:
          reponseApprenant,

        bonne_reponse:
          bonneReponse,

        notion,

        niveau,

        mode: modeUtilise,

        etape: etapeUtilisee,

        tentative:
          diagnostic.tentative,

        niveau_aide:
          diagnostic.niveauAide,

        reponse_correcte:
          correcte,

        message_utilisateur:
          messageUtilisateur,

        historique:
          construireHistorique(
            historiqueSource ??
              messages
          ),
      };

      const response =
        await fetch(
          API_IA_URL,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              payload
            ),
          }
        );

      if (!response.ok) {
        throw new Error(
          `Erreur API : ${response.status}`
        );
      }

      const resultat =
        (await response.json()) as ReponseGemini;

      if (
        !resultat ||
        typeof resultat.message !==
          "string"
      ) {
        throw new Error(
          "Réponse IA invalide."
        );
      }

      return resultat;
    };

  const traiterReponseGemini =
    (
      resultat: ReponseGemini
    ) => {
      appliquerDiagnosticGemini(
        resultat
      );

      if (
        resultat.prochaine_etape
      ) {
        setEtape(
          normaliserEtape(
            resultat.prochaine_etape
          )
        );
      }

      if (
        resultat.doit_reveler_solution ===
        true
      ) {
        setSolutionRevelee(true);
      }

      ajouterMessage(
        "ia",
        resultat.message
      );
    };

  /* ======================================================
     ENVOYER MESSAGE
  ====================================================== */

  const envoyerMessage =
    async (
      contenu: string
    ) => {
      const texte =
        contenu.trim();

      if (
        !texte ||
        iaEnCours
      ) {
        return;
      }

      const messageEleve: MessageIA =
        {
          id:
            Date.now(),
          role: "eleve",
          contenu: texte,
        };

      const nouveauxMessages = [
        ...messages,
        messageEleve,
      ];

      setMessages(
        nouveauxMessages
      );

      setIaEnCours(true);
      setErreurAPI(null);

      try {
        const resultat =
          await demanderAIAvecGemini(
            texte,
            nouveauxMessages
          );

        traiterReponseGemini(
          resultat
        );
      } catch (error) {
        console.error(
          error
        );

        const messageErreur =
          "Une erreur est survenue lors de la communication avec CODE IA. Vérifie que le serveur backend est disponible et que VITE_API_URL est correctement configuré.";

        setErreurAPI(
          messageErreur
        );

        ajouterMessage(
          "ia",
          messageErreur
        );
      } finally {
        setIaEnCours(false);
      }
    };

  /* ======================================================
     ACTIONS RAPIDES
  ====================================================== */

  const executerAction = async (
    action: ActionRapide
  ) => {
    if (iaEnCours) {
      return;
    }

    const actions: Record<
      ActionRapide,
      string
    > = {
      autrement:
        "Explique-moi autrement, avec une méthode plus simple, sans me donner directement la solution.",

      indice:
        "Donne-moi un indice progressif pour m'aider à trouver la solution moi-même.",

      similaire:
        "Donne-moi une question similaire pour vérifier si j'ai compris la méthode.",

      difficile:
        "Propose-moi une question plus difficile qui utilise le même raisonnement.",

      application:
        "Montre-moi une application concrète de cette notion dans la vie réelle ou dans un autre domaine.",
    };

    const etapes: Record<
      ActionRapide,
      EtapePedagogique
    > = {
      autrement:
        "raisonnement",

      indice:
        "indice",

      similaire:
        "verification",

      difficile:
        "approfondissement",

      application:
        "approfondissement",
    };

    setEtape(
      etapes[action]
    );

    setFenetreActive(null);

    await envoyerMessage(
      actions[action]
    );
  };

  /* ======================================================
     CHANGEMENT DE MODE
  ====================================================== */

  const changerMode = async (
    nouveauMode: ModeIA
  ) => {
    if (
      iaEnCours ||
      nouveauMode === mode
    ) {
      return;
    }

    setMode(nouveauMode);

    let message = "";

    if (
      nouveauMode ===
      "comprendre"
    ) {
      setEtape(
        "raisonnement"
      );

      message =
        "Je veux comprendre cette question en profondeur. Guide-moi dans le raisonnement sans simplement donner la réponse.";
    }

    if (
      nouveauMode ===
      "corriger"
    ) {
      setEtape(
        "diagnostic"
      );

      message =
        "Analyse mon raisonnement, identifie précisément mon erreur éventuelle et aide-moi à la corriger.";
    }

    if (
      nouveauMode ===
      "approfondir"
    ) {
      setEtape(
        "approfondissement"
      );

      message =
        "Je veux approfondir cette notion avec des exemples, des variantes et des applications.";
    }

    await envoyerMessage(
      message
    );
  };

  /* ======================================================
     RECOMMENCER
  ====================================================== */

  const recommencer = () => {
    const connue =
      solutionConnueAuDepart;

    setMode(
      connue
        ? "comprendre"
        : "corriger"
    );

    setEtape(
      connue
        ? "raisonnement"
        : "accueil"
    );

    setSolutionRevelee(
      connue
    );

    setDiagnostic({
      niveauConfiance:
        connue ? 40 : 20,
      tentative: 1,
      niveauAide: 0,
      erreurIdentifiee: null,
      notionsMaitrisees: [],
      notionsFragiles:
        notion
          ? [notion]
          : [],
      comprehension:
        connue
          ? "partielle"
          : "fragile",
    });

    setMessages([
      {
        id: 1,
        role: "ia",
        contenu:
          connue
            ? "Nous recommençons l'analyse du raisonnement."
            : "Nous recommençons l'analyse de ta réponse.",
      },
      {
        id: 2,
        role: "ia",
        contenu:
          "Explique-moi comment tu as réfléchi.",
      },
    ]);

    setErreurAPI(null);
    setFenetreActive(null);
  };

  /* ======================================================
     PROGRESSION
  ====================================================== */

  const progression = useMemo(() => {
    const valeurs: Record<
      EtapePedagogique,
      number
    > = {
      accueil: 10,
      raisonnement: 25,
      diagnostic: 40,
      indice: 55,
      recherche: 70,
      verification: 85,
      approfondissement: 90,
      termine: 100,
    };

    return valeurs[etape];
  }, [etape]);

  /* ======================================================
     TITRES
  ====================================================== */

  const titreEtape =
    useMemo(() => {
      const titres: Record<
        EtapePedagogique,
        string
      > = {
        accueil:
          "Accueil",
        raisonnement:
          "Raisonnement",
        diagnostic:
          "Diagnostic",
        indice:
          "Indice",
        recherche:
          "Recherche",
        verification:
          "Vérification",
        approfondissement:
          "Approfondissement",
        termine:
          "Terminé",
      };

      return titres[etape];
    }, [etape]);

  /* ======================================================
     ENVOI DU TEXTE
  ====================================================== */

  const [texteSaisi, setTexteSaisi] =
    useState("");

  const envoyerTexteSaisi =
    async () => {
      const texte =
        texteSaisi.trim();

      if (!texte) {
        return;
      }

      setTexteSaisi("");

      await envoyerMessage(
        texte
      );
    };

  const gererTouche =
    (
      event: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        void envoyerTexteSaisi();
      }
    };

  /* ======================================================
     STYLES
  ====================================================== */

  const pageClass =
    darkMode
      ? "min-h-screen bg-gray-950 text-gray-100"
      : "min-h-screen bg-gray-50 text-gray-900";

  const surfaceClass =
    darkMode
      ? "bg-gray-900 border-gray-800"
      : "bg-white border-gray-200";

  /* ======================================================
     AFFICHAGE
  ====================================================== */

  return (
    <div
      className={`${pageClass} px-4 py-5 sm:px-6`}
    >
      <div className="mx-auto w-full max-w-5xl space-y-5">

        {/* ==================================================
            EN-TÊTE
        ================================================== */}

        <div
          className={`${surfaceClass} flex items-center justify-between rounded-2xl border px-4 py-3 shadow-sm`}
        >
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft
              size={18}
            />

            Retour
          </button>

          <div className="hidden text-center sm:block">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              CODE IA
            </p>

            <p className="font-bold">
              Explication
            </p>
          </div>

          <button
            type="button"
            onClick={recommencer}
            disabled={iaEnCours}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800"
          >
            <RotateCcw
              size={17}
            />

            <span className="hidden sm:inline">
              Recommencer
            </span>
          </button>
        </div>

        {/* ==================================================
            QUESTION + ENSEIGNANT
        ================================================== */}

        <div
          className={`${surfaceClass} rounded-2xl border shadow-xl`}
        >
          <div className="p-5 sm:p-7">

            <div className="mb-5 flex flex-wrap items-center gap-2">
              {niveau && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {niveau}
                </span>
              )}

              {notion && (
                <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  {notion}
                </span>
              )}

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  correcte
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                }`}
              >
                {correcte
                  ? "Réponse correcte"
                  : "Réponse à corriger"}
              </span>
            </div>

            <h1 className="text-xl font-bold leading-relaxed sm:text-2xl">
              {texteQuestion ||
                "Question non disponible"}
            </h1>

            {/* ==================================================
                ENSEIGNANT — VERSION COMPACTE
            ================================================== */}

            {enseignant && (
              <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">

                <div className="flex items-center gap-4">

                  {/* PHOTO CLIQUABLE */}

                  <button
                    type="button"
                    onClick={
                      ouvrirProfilEnseignant
                    }
                    disabled={
                      !teacherProfile
                    }
                    title="Voir le profil de l'enseignant"
                    className="group shrink-0 disabled:cursor-default"
                  >
                    <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-blue-500 bg-gray-200 shadow-sm transition group-hover:border-blue-700 group-hover:shadow-md dark:bg-gray-700">

                      {teacherPhotoUrl ? (
                        <img
                          src={
                            teacherPhotoUrl
                          }
                          alt={`Photo de ${teacherFullName}`}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
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
                            teacherInitials
                          }
                        </div>
                      )}
                    </div>
                  </button>

                  {/* NOM + PRÉNOM CLIQUABLES */}

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Question proposée par
                    </p>

                    {teacherProfile ? (
                      <button
                        type="button"
                        onClick={
                          ouvrirProfilEnseignant
                        }
                        className="text-left font-semibold text-blue-700 transition hover:text-blue-900 hover:underline dark:text-blue-300 dark:hover:text-blue-100"
                      >
                        {
                          teacherFullName
                        }
                      </button>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {teacherLoading
                          ? "Chargement..."
                          : "Enseignant"}
                      </p>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* ==================================================
                RÉPONSE
            ================================================== */}

            <div className="mt-6 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/70">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Ta réponse
              </p>

              <p className="font-medium">
                {reponseApprenant ||
                  "Aucune réponse enregistrée"}
              </p>

              {solutionRevelee &&
                bonneReponse && (
                  <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400">
                      Réponse attendue
                    </p>

                    <p className="font-semibold text-green-700 dark:text-green-300">
                      {bonneReponse}
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* ==================================================
            PROGRESSION COMPACTE
        ================================================== */}

        <div
          className={`${surfaceClass} rounded-2xl border p-4 shadow-sm`}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold">
              {titreEtape}
            </span>

            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {progression} %
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${progression}%`,
              }}
            />
          </div>
        </div>

        {/* ==================================================
            CODE IA
        ================================================== */}

        <div
          className={`${surfaceClass} rounded-2xl border shadow-xl`}
        >
          <div className="border-b border-gray-200 p-5 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                <Brain
                  size={21}
                />
              </div>

              <div>
                <h2 className="font-bold">
                  CODE IA
                </h2>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ton accompagnateur pédagogique
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================
              MODES
          ================================================== */}

          <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-3">
            <button
              type="button"
              onClick={() =>
                void changerMode(
                  "comprendre"
                )
              }
              disabled={iaEnCours}
              className={`rounded-xl border p-3 text-left transition ${
                mode === "comprendre"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              }`}
            >
              <BookOpen
                size={18}
                className="mb-2"
              />

              <p className="font-semibold">
                Comprendre
              </p>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Comprendre le raisonnement
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                void changerMode(
                  "corriger"
                )
              }
              disabled={iaEnCours}
              className={`rounded-xl border p-3 text-left transition ${
                mode === "corriger"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              }`}
            >
              <CircleHelp
                size={18}
                className="mb-2"
              />

              <p className="font-semibold">
                Corriger
              </p>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Identifier et corriger l'erreur
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                void changerMode(
                  "approfondir"
                )
              }
              disabled={iaEnCours}
              className={`rounded-xl border p-3 text-left transition ${
                mode === "approfondir"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              }`}
            >
              <Sparkles
                size={18}
                className="mb-2"
              />

              <p className="font-semibold">
                Approfondir
              </p>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Aller plus loin
              </p>
            </button>
          </div>

          {/* ==================================================
              CONVERSATION
          ================================================== */}

          <div className="max-h-[430px] space-y-3 overflow-y-auto border-y border-gray-200 p-4 dark:border-gray-800">
            {messages.map(
              (message) => (
                <div
                  key={
                    message.id
                  }
                  className={`flex ${
                    message.role ===
                    "eleve"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      message.role ===
                      "eleve"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                    }`}
                  >
                    {message.contenu}
                  </div>
                </div>
              )
            )}

            {iaEnCours && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  CODE IA réfléchit...
                </div>
              </div>
            )}
          </div>

          {/* ==================================================
              BOUTON TYPES DE QUESTIONS
          ================================================== */}

          <div className="p-4">
            <button
              type="button"
              onClick={() =>
                setFenetreActive(
                  "actions"
                )
              }
              disabled={iaEnCours}
              className="flex w-full items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-left font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
            >
              <span className="flex items-center gap-3">
                <ListChecks
                  size={20}
                />

                Voir les types de questions et aides
              </span>

              <ChevronRight
                size={20}
              />
            </button>
          </div>

          {/* ==================================================
              SAISIE
          ================================================== */}

          <div className="border-t border-gray-200 p-4 dark:border-gray-800">
            <div className="flex gap-2">
              <textarea
                value={
                  texteSaisi
                }
                onChange={(event) =>
                  setTexteSaisi(
                    event.target
                      .value
                  )
                }
                onKeyDown={
                  gererTouche
                }
                disabled={
                  iaEnCours
                }
                rows={2}
                placeholder="Explique ton raisonnement à CODE IA..."
                className="min-w-0 flex-1 resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800"
              />

              <button
                type="button"
                onClick={() =>
                  void envoyerTexteSaisi()
                }
                disabled={
                  iaEnCours ||
                  !texteSaisi.trim()
                }
                className="flex h-12 w-12 shrink-0 items-center justify-center self-end rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                title="Envoyer"
              >
                <Send
                  size={19}
                />
              </button>
            </div>

            <p className="mt-2 text-center text-xs text-gray-400">
              Entrée pour envoyer · Maj + Entrée pour une nouvelle ligne
            </p>
          </div>
        </div>

        {/* ==================================================
            ERREUR API
        ================================================== */}

        {erreurAPI && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {erreurAPI}
          </div>
        )}

      </div>

      {/* ====================================================
          FENÊTRE MODALE
      ==================================================== */}

      {fenetreActive && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={() =>
            setFenetreActive(
              null
            )
          }
        >
          <div
            className={`${surfaceClass} max-h-[85vh] w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl`}
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            {/* ==================================================
                EN-TÊTE FENÊTRE
            ================================================== */}

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <div className="flex items-center gap-3">

                {fenetreActive ===
                  "actions" && (
                  <ListChecks
                    size={20}
                    className="text-blue-600"
                  />
                )}

                {fenetreActive ===
                  "question" && (
                  <CircleHelp
                    size={20}
                    className="text-blue-600"
                  />
                )}

                {fenetreActive ===
                  "parcours" && (
                  <Target
                    size={20}
                    className="text-blue-600"
                  />
                )}

                {fenetreActive ===
                  "diagnostic" && (
                  <Brain
                    size={20}
                    className="text-blue-600"
                  />
                )}

                {fenetreActive ===
                  "objectif" && (
                  <Sparkles
                    size={20}
                    className="text-blue-600"
                  />
                )}

                {fenetreActive ===
                  "enseignant" && (
                  <GraduationCap
                    size={20}
                    className="text-blue-600"
                  />
                )}

                <h3 className="font-bold">
                  {fenetreActive ===
                    "actions" &&
                    "Types de questions et aides"}

                  {fenetreActive ===
                    "question" &&
                    "Question"}

                  {fenetreActive ===
                    "parcours" &&
                    "Parcours"}

                  {fenetreActive ===
                    "diagnostic" &&
                    "Diagnostic"}

                  {fenetreActive ===
                    "objectif" &&
                    "Objectif"}

                  {fenetreActive ===
                    "enseignant" &&
                    "Enseignant"}
                </h3>
              </div>

              {/* CROIX */}

              <button
                type="button"
                onClick={() =>
                  setFenetreActive(
                    null
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Fermer"
              >
                <X
                  size={20}
                />
              </button>
            </div>

            {/* ==================================================
                CONTENU FENÊTRE
            ================================================== */}

            <div className="max-h-[70vh] overflow-y-auto p-5">

              {/* ==================================================
                  ACTIONS
              ================================================== */}

              {fenetreActive ===
                "actions" && (
                <div className="space-y-3">

                  <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    Choisis ce que tu veux faire avec cette question.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      void executerAction(
                        "autrement"
                      )
                    }
                    className="flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 text-left transition hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-blue-900/20"
                  >
                    <MessageCircle
                      className="shrink-0 text-blue-600"
                    />

                    <div>
                      <p className="font-semibold">
                        Explique autrement
                      </p>

                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Une autre explication plus simple.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void executerAction(
                        "indice"
                      )
                    }
                    className="flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 text-left transition hover:border-yellow-400 hover:bg-yellow-50 dark:border-gray-700 dark:hover:bg-yellow-900/20"
                  >
                    <Lightbulb
                      className="shrink-0 text-yellow-500"
                    />

                    <div>
                      <p className="font-semibold">
                        Donne-moi un indice
                      </p>

                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Un indice progressif sans donner directement la solution.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void executerAction(
                        "similaire"
                      )
                    }
                    className="flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 text-left transition hover:border-green-400 hover:bg-green-50 dark:border-gray-700 dark:hover:bg-green-900/20"
                  >
                    <RotateCcw
                      className="shrink-0 text-green-600"
                    />

                    <div>
                      <p className="font-semibold">
                        Question similaire
                      </p>

                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Vérifier si la méthode est réellement comprise.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void executerAction(
                        "difficile"
                      )
                    }
                    className="flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 text-left transition hover:border-purple-400 hover:bg-purple-50 dark:border-gray-700 dark:hover:bg-purple-900/20"
                  >
                    <Brain
                      className="shrink-0 text-purple-600"
                    />

                    <div>
                      <p className="font-semibold">
                        Question plus difficile
                      </p>

                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Aller plus loin avec le même raisonnement.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void executerAction(
                        "application"
                      )
                    }
                    className="flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 text-left transition hover:border-orange-400 hover:bg-orange-50 dark:border-gray-700 dark:hover:bg-orange-900/20"
                  >
                    <Sparkles
                      className="shrink-0 text-orange-500"
                    />

                    <div>
                      <p className="font-semibold">
                        Application concrète
                      </p>

                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Relier la notion à une situation réelle.
                      </p>
                    </div>
                  </button>

                </div>
              )}

              {/* ==================================================
                  QUESTION
              ================================================== */}

              {fenetreActive ===
                "question" && (
                <div className="space-y-4 text-sm">

                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Question
                    </p>

                    <p className="mt-1">
                      {texteQuestion}
                    </p>
                  </div>

                  {choix.length >
                    0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
                        Choix
                      </p>

                      <div className="space-y-2">
                        {choix.map(
                          (
                            choixItem,
                            index
                          ) => (
                            <div
                              key={
                                index
                              }
                              className="rounded-lg bg-gray-100 p-3 dark:bg-gray-800"
                            >
                              {choixItem}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Ta réponse
                    </p>

                    <p className="mt-1 font-medium">
                      {
                        reponseApprenant
                      }
                    </p>
                  </div>

                  {solutionRevelee && (
                    <div>
                      <p className="text-xs font-semibold uppercase text-green-600">
                        Réponse attendue
                      </p>

                      <p className="mt-1 font-semibold text-green-700 dark:text-green-300">
                        {
                          bonneReponse
                        }
                      </p>
                    </div>
                  )}

                </div>
              )}

              {/* ==================================================
                  PARCOURS
              ================================================== */}

              {fenetreActive ===
                "parcours" && (
                <div className="space-y-3">

                  {[
                    [
                      "Analyser",
                      "Comprendre ta réponse et ton raisonnement.",
                    ],
                    [
                      "Diagnostiquer",
                      "Identifier ce qui est maîtrisé ou fragile.",
                    ],
                    [
                      "Remédier",
                      "Adapter l'aide à ton niveau réel.",
                    ],
                    [
                      "Vérifier",
                      "Tester si la notion est réellement comprise.",
                    ],
                  ].map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        key={
                          index
                        }
                        className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                      >
                        <p className="font-semibold">
                          {item[0]}
                        </p>

                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {item[1]}
                        </p>
                      </div>
                    )
                  )}

                </div>
              )}

              {/* ==================================================
                  DIAGNOSTIC
              ================================================== */}

              {fenetreActive ===
                "diagnostic" && (
                <div className="space-y-5">

                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span>
                        Confiance
                      </span>

                      <strong>
                        {
                          diagnostic.niveauConfiance
                        }
                        %
                      </strong>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${diagnostic.niveauConfiance}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">

                    <div className="rounded-xl bg-gray-100 p-4 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">
                        Compréhension
                      </p>

                      <p className="mt-1 font-bold">
                        {
                          diagnostic.comprehension
                        }
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-100 p-4 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">
                        Tentatives
                      </p>

                      <p className="mt-1 font-bold">
                        {
                          diagnostic.tentative
                        }
                      </p>
                    </div>

                  </div>

                  {diagnostic.erreurIdentifiee && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                      <p className="text-xs font-semibold uppercase text-red-600">
                        Erreur identifiée
                      </p>

                      <p className="mt-1 text-sm">
                        {
                          diagnostic.erreurIdentifiee
                        }
                      </p>
                    </div>
                  )}

                  {diagnostic.notionsMaitrisees.length >
                    0 && (
                    <div>
                      <p className="mb-2 font-semibold">
                        Notions maîtrisées
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {diagnostic.notionsMaitrisees.map(
                          (
                            item
                          ) => (
                            <span
                              key={
                                item
                              }
                              className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            >
                              {item}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {diagnostic.notionsFragiles.length >
                    0 && (
                    <div>
                      <p className="mb-2 font-semibold">
                        Notions fragiles
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {diagnostic.notionsFragiles.map(
                          (
                            item
                          ) => (
                            <span
                              key={
                                item
                              }
                              className="rounded-full bg-orange-100 px-3 py-1 text-xs text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                            >
                              {item}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ==================================================
                  OBJECTIF
              ================================================== */}

              {fenetreActive ===
                "objectif" && (
                <div className="space-y-4 text-sm leading-relaxed">

                  <p>
                    CODE IA ne cherche pas
                    seulement à te donner la
                    bonne réponse.
                  </p>

                  <p>
                    Son objectif est de
                    comprendre ton raisonnement,
                    détecter tes difficultés et
                    adapter l'aide à ton niveau.
                  </p>

                  <p>
                    Le but final est de te rendre
                    progressivement autonome face
                    aux problèmes.
                  </p>

                </div>
              )}

              {/* ==================================================
                  ENSEIGNANT
              ================================================== */}

              {fenetreActive ===
                "enseignant" && (
                <div className="flex flex-col items-center text-center">

                  <button
                    type="button"
                    onClick={
                      ouvrirProfilEnseignant
                    }
                    disabled={
                      !teacherProfile
                    }
                    className="group"
                  >
                    <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-2 border-blue-500 bg-gray-200 shadow-md dark:bg-gray-700">

                      {teacherPhotoUrl ? (
                        <img
                          src={
                            teacherPhotoUrl
                          }
                          alt={`Photo de ${teacherFullName}`}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-500 dark:text-gray-300">
                          {
                            teacherInitials
                          }
                        </div>
                      )}

                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={
                      ouvrirProfilEnseignant
                    }
                    className="mt-4 font-bold text-blue-700 hover:underline dark:text-blue-300"
                  >
                    {
                      teacherFullName
                    }
                  </button>

                  {teacherError && (
                    <p className="mt-3 text-sm text-red-500">
                      {
                        teacherError
                      }
                    </p>
                  )}

                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}