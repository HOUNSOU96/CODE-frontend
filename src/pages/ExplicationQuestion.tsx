// 📁 ExplicationQuestion.tsx

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

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
  BarChart3,
  Route,
  Video,
  CheckCircle2,
  XCircle,
  Play,
  Clock,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import api from "@/utils/axios";

/* ======================================================
   TYPES
====================================================== */

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
  | "ia"
  | "question"
  | "parcours"
  | "diagnostic"
  | "objectif"
  | "enseignant"
  | "actions"
  | "video"
  | null;

interface TeacherProfile {
  id?: number | string;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  pays_residence?: string;

  // Champ utilisé par ton backend actuel
  teacher_photo?: string;

  // Compatibilité avec d'autres formats éventuels
  photo?: string;
  photo_url?: string;
  avatar?: string;
  photo_profil?: string;
  profile_photo?: string;
  profilePhoto?: string;
  image?: string;
  image_url?: string;
  imageUrl?: string;

  subjects?: string[];

  [key: string]: unknown;
}

interface QuestionContext {
  id?: number | string;
  question?: string;
  texte?: string;
  enonce?: string;
  choix?: unknown;
  options?: unknown;
  bonne_reponse?: unknown;
  bonneReponse?: unknown;
  reponse_correcte?: unknown;
  reponseCorrecte?: unknown;
  reponse_apprenant?: unknown;
  reponseApprenant?: unknown;
  notion?: string;
  matiere?: string;
  niveau?: string;
  classe?: string;
  serie?: string;
  enseignant?: string;
  professeur?: string;
  teacher?: string;
  duree?: number;
  duration?: number;
  [key: string]: unknown;
}

interface ResultatsContext {
  reponse?: unknown;
  reponse_apprenant?: unknown;
  reponseApprenant?: unknown;
  answer?: unknown;
  bonne_reponse?: unknown;
  bonneReponse?: unknown;
  correct_answer?: unknown;
  correctAnswer?: unknown;
  [key: string]: unknown;
}

interface LocationState {
  question?: QuestionContext;
  resultats?: ResultatsContext;
  [key: string]: unknown;
}

interface MessageIA {
  id: number;
  role: "ia" | "eleve";
  contenu: string;
}

interface DiagnosticIA {
  niveauConfiance: number;
  comprehension: NiveauComprehension;
  tentative: number;
  erreurIdentifiee: string;
  notionsMaitrisees: string[];
  notionsFragiles: string[];
}

interface DiagnosticGemini {
  niveau_confiance?: number;
  niveauConfiance?: number;
  comprehension?: NiveauComprehension | string;
  erreur_identifiee?: string;
  erreurIdentifiee?: string;
  notions_maitrisees?: string[];
  notionsMaitrisees?: string[];
  notions_fragiles?: string[];
  notionsFragiles?: string[];
  tentative?: number;
  [key: string]: unknown;
}

interface ReponseGemini {
  message?: string;
  contenu?: string;
  reponse?: string;
  diagnostic?: DiagnosticGemini;
  etape_suivante?: string;
  etapeSuivante?: string;
  solution_revelee?: boolean;
  solutionRevelee?: boolean;
  niveau_aide?: string;
  [key: string]: unknown;
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

interface RemediationVideoQuestion {
  id: number | string;
  niveau?: string;
  notion?: string;
  duration?: number;
  question: string;
  choix: string[];
  bonne_reponse: string;
  [key: string]: unknown;
}

interface RemediationVideo {
  id: number | string;
  titre: string;
  niveau?: string;
  videoUrl?: string;
  video_url?: string;
  questions: RemediationVideoQuestion[];
  [key: string]: unknown;
}

/* ======================================================
   API
====================================================== */

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

const API_IA_URL =
  `${API_BASE_URL}/api/ia/explication-question`;

/* ======================================================
   UTILITAIRES
====================================================== */

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
    return valeur.trim();
  }

  if (
    typeof valeur === "number" ||
    typeof valeur === "boolean"
  ) {
    return String(valeur);
  }

  if (Array.isArray(valeur)) {
    return valeur
      .map((item) => convertirEnTexte(item))
      .filter(Boolean)
      .join(", ");
  }

  if (typeof valeur === "object") {
    const objet = valeur as Record<
      string,
      unknown
    >;

    return (
      convertirEnTexte(objet.texte) ||
      convertirEnTexte(objet.text) ||
      convertirEnTexte(objet.value) ||
      convertirEnTexte(objet.label) ||
      ""
    );
  }

  return "";
}

function normaliserTexte(
  valeur: unknown
): string {
  return convertirEnTexte(valeur)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function normaliserMatiere(
  valeur: unknown
): string {
  return convertirEnTexte(valeur)
    .trim()
    .toLowerCase();
}

function normaliserNiveau(
  valeur: unknown
): string {
  return convertirEnTexte(valeur)
    .trim()
    .toLowerCase();
}

function normaliserSerie(
  valeur: unknown
): string {
  return convertirEnTexte(valeur)
    .trim()
    .toUpperCase();
}

function construireUrlPhoto(
  valeur: unknown
): string {
  const url = convertirEnTexte(valeur);

  if (!url) {
    return "";
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${API_BASE_URL}${url}`;
  }

  return `${API_BASE_URL}/${url}`;
}

function construireUrlVideo(
  valeur: unknown
): string {
  const url = convertirEnTexte(valeur);

  if (!url) {
    return "";
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${API_BASE_URL}${url}`;
  }

  return `${API_BASE_URL}/${url}`;
}

function normaliserEtape(
  valeur: unknown
): EtapePedagogique {
  const texte = normaliserTexte(valeur);

  if (
    texte.includes("raisonnement") ||
    texte.includes("analyse")
  ) {
    return "raisonnement";
  }

  if (
    texte.includes("diagnostic")
  ) {
    return "diagnostic";
  }

  if (
    texte.includes("indice") ||
    texte.includes("aide")
  ) {
    return "indice";
  }

  if (
    texte.includes("recherche") ||
    texte.includes("exercice")
  ) {
    return "recherche";
  }

  if (
    texte.includes("verification") ||
    texte.includes("verifier") ||
    texte.includes("verification")
  ) {
    return "verification";
  }

  if (
    texte.includes("approfond")
  ) {
    return "approfondissement";
  }

  if (
    texte.includes("termine") ||
    texte.includes("terminee") ||
    texte.includes("fin")
  ) {
    return "termine";
  }

  return "accueil";
}

function normaliserComprehension(
  valeur: unknown
): NiveauComprehension {
  const texte = normaliserTexte(valeur);

  if (
    texte.includes("solide") ||
    texte.includes("bonne")
  ) {
    return "solide";
  }

  if (
    texte.includes("partielle")
  ) {
    return "partielle";
  }

  if (
    texte.includes("fragile") ||
    texte.includes("faible")
  ) {
    return "fragile";
  }

  return "inconnue";
}

function determinerOrigineAcces(
  state: LocationState
): OrigineAcces {
  const valeurs = [
    state.origine,
    state.source,
    state.from,
    state.question?.origine,
    state.question?.source,
  ]
    .map(normaliserTexte)
    .filter(Boolean);

  if (
    valeurs.some(
      (item) =>
        item.includes("remediation-video") ||
        item.includes("video")
    )
  ) {
    return "remediation-video";
  }

  if (
    valeurs.some((item) =>
      item.includes("remediation")
    )
  ) {
    return "remediation";
  }

  return "inconnue";
}

function estLettreReponse(
  valeur: unknown
): boolean {
  return /^[A-G]$/i.test(
    convertirEnTexte(valeur)
  );
}

function normaliserLettre(
  valeur: unknown
): string {
  return convertirEnTexte(valeur)
    .trim()
    .toUpperCase();
}

function convertirChoixEnTableau(
  valeur: unknown
): string[] {
  if (Array.isArray(valeur)) {
    return valeur
      .map((item) => {
        if (
          typeof item === "string"
        ) {
          return item;
        }

        if (
          typeof item === "object" &&
          item !== null
        ) {
          const objet =
            item as Record<
              string,
              unknown
            >;

          return (
            convertirEnTexte(
              objet.texte
            ) ||
            convertirEnTexte(
              objet.text
            ) ||
            convertirEnTexte(
              objet.label
            ) ||
            convertirEnTexte(
              objet.value
            )
          );
        }

        return convertirEnTexte(item);
      })
      .filter(Boolean);
  }

  if (
    typeof valeur === "object" &&
    valeur !== null
  ) {
    const objet =
      valeur as Record<
        string,
        unknown
      >;

    return Object.entries(objet)
      .sort(([a], [b]) =>
        a.localeCompare(b)
      )
      .map(([, value]) =>
        convertirEnTexte(value)
      )
      .filter(Boolean);
  }

  if (typeof valeur === "string") {
    return valeur
      .split(/\n|;|\|/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function obtenirChoix(
  question?: QuestionContext
): string[] {
  if (!question) {
    return [];
  }

  return convertirChoixEnTableau(
    question.choix ??
      question.options
  );
}

function lettreVersChoix(
  valeur: unknown,
  choix: string[]
): string {
  const lettre =
    normaliserLettre(valeur);

  if (!estLettreReponse(lettre)) {
    return convertirEnTexte(valeur);
  }

  const index =
    lettre.charCodeAt(0) -
    65;

  return (
    choix[index] ||
    convertirEnTexte(valeur)
  );
}

function rechercherReponseApprenant(
  question: QuestionContext,
  resultats: ResultatsContext
): unknown {
  return (
    resultats.reponse_apprenant ??
    resultats.reponseApprenant ??
    resultats.reponse ??
    resultats.answer ??
    question.reponse_apprenant ??
    question.reponseApprenant
  );
}

function rechercherBonneReponse(
  question: QuestionContext,
  resultats: ResultatsContext
): unknown {
  return (
    resultats.bonne_reponse ??
    resultats.bonneReponse ??
    resultats.correct_answer ??
    resultats.correctAnswer ??
    question.bonne_reponse ??
    question.bonneReponse ??
    question.reponse_correcte ??
    question.reponseCorrecte
  );
}

function rechercherBonneReponseLettre(
  valeur: unknown,
  choix: string[]
): string {
  const texte =
    convertirEnTexte(valeur);

  if (
    estLettreReponse(texte)
  ) {
    return normaliserLettre(
      texte
    );
  }

  const index = choix.findIndex(
    (item) =>
      normaliserTexte(item) ===
      normaliserTexte(texte)
  );

  if (index >= 0) {
    return String.fromCharCode(
      65 + index
    );
  }

  return "";
}

/* ======================================================
   COMPOSANT
====================================================== */

export default function ExplicationQuestion() {
  const location =
    useLocation();

  const navigate =
    useNavigate();

  const state =
    (location.state ||
      {}) as LocationState;

  /* ====================================================
     DEBUG
  ==================================================== */

  useEffect(() => {
    console.log(
      "[ExplicationQuestion] contexte :",
      state
    );
  }, []);

  /* ====================================================
     DARK MODE
  ==================================================== */

  const [
    darkMode,
    setDarkMode,
  ] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains(
          "dark"
        )
      : false
  );

  useEffect(() => {
    if (
      typeof document ===
      "undefined"
    ) {
      return;
    }

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
        attributeFilter: [
          "class",
        ],
      }
    );

    return () =>
      observer.disconnect();
  }, []);

  /* ====================================================
     CONTEXTE QUESTION
  ==================================================== */

  const question =
    state.question || {};

  const resultats =
    state.resultats || {};

  const texteQuestion =
    convertirEnTexte(
      question.question ??
        question.texte ??
        question.enonce
    );

  const choix =
    obtenirChoix(question);

  const reponseApprenantBrute =
    rechercherReponseApprenant(
      question,
      resultats
    );

  const reponseApprenant =
    lettreVersChoix(
      reponseApprenantBrute,
      choix
    );

  const bonneReponseBrute =
    rechercherBonneReponse(
      question,
      resultats
    );

  const bonneReponse =
    lettreVersChoix(
      bonneReponseBrute,
      choix
    );

  const correcte =
    normaliserTexte(
      reponseApprenant
    ) ===
      normaliserTexte(
        bonneReponse
      ) &&
    Boolean(bonneReponse);

  const notion =
    convertirEnTexte(
      question.notion
    );

  const matiere =
    normaliserMatiere(
      question.matiere
    );

  const niveau =
    normaliserNiveau(
      question.niveau
    );

  const classe =
    convertirEnTexte(
      question.classe
    );

  const serie =
    normaliserSerie(
      question.serie
    );

  const seriePourAPI =
    serie || undefined;

  const enseignant =
    convertirEnTexte(
      question.enseignant ??
        question.professeur ??
        question.teacher
    );

  const origineAcces =
    determinerOrigineAcces(
      state
    );

  const solutionConnueAuDepart =
    Boolean(
      state.solutionConnue ??
        state.solution_revelee ??
        state.solutionRevelee ??
        false
    ) ||
    origineAcces ===
      "remediation" ||
    origineAcces ===
      "remediation-video";

  /* ====================================================
     ENSEIGNANT
  ==================================================== */

  const [
    teacherProfile,
    setTeacherProfile,
  ] =
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

  useEffect(() => {
    if (!enseignant) {
      return;
    }

    let actif = true;

    const chargerProfil =
      async () => {
        setTeacherLoading(true);
        setTeacherError(null);

        try {
          const response =
            await api.get(
              "/api/teacher/public-profile",
              {
                params: {
                  email:
                    enseignant,
                },
              }
            );

          if (!actif) {
            return;
          }

          setTeacherProfile(
            response.data || null
          );
        } catch (error) {
          console.error(
            "Erreur profil enseignant :",
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

    void chargerProfil();

    return () => {
      actif = false;
    };
  }, [enseignant]);

  const teacherPhotoUrl =
  construireUrlPhoto(
    teacherProfile?.teacher_photo ??
      teacherProfile?.photo_url ??
      teacherProfile?.photo ??
      teacherProfile?.avatar ??
      teacherProfile?.photo_profil ??
      teacherProfile?.profile_photo ??
      teacherProfile?.profilePhoto ??
      teacherProfile?.image_url ??
      teacherProfile?.imageUrl ??
      teacherProfile?.image
  );

  const teacherFullName =
    convertirEnTexte(
      teacherProfile?.full_name
    ) ||
    [
      convertirEnTexte(
        teacherProfile?.prenom
      ),
      convertirEnTexte(
        teacherProfile?.nom
      ),
    ]
      .filter(Boolean)
      .join(" ") ||
    convertirEnTexte(
      teacherProfile?.name
    ) ||
    enseignant ||
    "Enseignant";

  const teacherInitials =
    teacherFullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (partie) =>
          partie.charAt(0)
      )
      .join("")
      .toUpperCase() || "E";

  const ouvrirProfilEnseignant =
    () => {
      if (!enseignant) {
        return;
      }

      navigate(
        `/enseignant/profil/${encodeURIComponent(
          enseignant
        )}`
      );
    };

  /* ====================================================
     ÉTAT PÉDAGOGIQUE
  ==================================================== */

  const [
    mode,
    setMode,
  ] = useState<ModeIA>(
    solutionConnueAuDepart
      ? "comprendre"
      : "corriger"
  );

  const [
    etape,
    setEtape,
  ] =
    useState<EtapePedagogique>(
      solutionConnueAuDepart
        ? "raisonnement"
        : "accueil"
    );

  const [
    messages,
    setMessages,
  ] = useState<MessageIA[]>([
    {
      id: 1,
      role: "ia",
      contenu:
        solutionConnueAuDepart
          ? "La solution est déjà connue. Nous allons maintenant nous concentrer sur le raisonnement et sur la compréhension de la méthode."
          : "Je ne vais pas simplement te donner la réponse. Nous allons analyser ton raisonnement pour identifier ce qui est maîtrisé et ce qui doit être renforcé.",
    },
    {
      id: 2,
      role: "ia",
      contenu:
        "Explique-moi simplement comment tu as réfléchi pour arriver à ta réponse.",
    },
  ]);

  const [
    iaEnCours,
    setIaEnCours,
  ] = useState(false);

  const [
    erreurAPI,
    setErreurAPI,
  ] =
    useState<string | null>(
      null
    );

  const [
    solutionRevelee,
    setSolutionRevelee,
  ] = useState(
    solutionConnueAuDepart
  );

  const [
    fenetreActive,
    setFenetreActive,
  ] =
    useState<FenetreActive>(null);

  const [
    diagnostic,
    setDiagnostic,
  ] = useState<DiagnosticIA>({
    niveauConfiance:
      solutionConnueAuDepart
        ? 50
        : 0,
    comprehension:
      "inconnue",
    tentative: 0,
    erreurIdentifiee: "",
    notionsMaitrisees: [],
    notionsFragiles: [],
  });

  /* ====================================================
     VIDÉO DE REMÉDIATION
  ==================================================== */

  const [
    videoSelectionnee,
    setVideoSelectionnee,
  ] =
    useState<RemediationVideo | null>(
      null
    );

  const [
    videoLoading,
    setVideoLoading,
  ] = useState(false);

  const [
    videoError,
    setVideoError,
  ] =
    useState<string | null>(
      null
    );

  const [
    videoEtape,
    setVideoEtape,
  ] = useState<
    "video" | "questions" | "termine"
  >("video");

  const [
    videoQuestionIndex,
    setVideoQuestionIndex,
  ] = useState(0);

  const [
    videoReponses,
    setVideoReponses,
  ] = useState<
    Record<string, string>
  >({});

  const [
    videoQuestionValidee,
    setVideoQuestionValidee,
  ] = useState(false);

  const [
    videoQuestionCorrecte,
    setVideoQuestionCorrecte,
  ] = useState(false);

  const videoQuestionActuelle =
    videoSelectionnee?.questions?.[
      videoQuestionIndex
    ];

  const videoScore = useMemo(() => {
    if (!videoSelectionnee) {
      return 0;
    }

    return videoSelectionnee.questions.reduce(
      (score, item) => {
        const reponse =
          videoReponses[
            String(item.id)
          ];

        return normaliserTexte(
          reponse
        ) ===
          normaliserTexte(
            item.bonne_reponse
          )
          ? score + 1
          : score;
      },
      0
    );
  }, [
    videoSelectionnee,
    videoReponses,
  ]);

  /* ====================================================
     SAISIE / SCROLL
  ==================================================== */

  const [
    texteSaisi,
    setTexteSaisi,
  ] = useState("");

  const finConversationRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const conversationRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const [
    menuIAMobileOuvert,
    setMenuIAMobileOuvert,
  ] = useState(false);

  useEffect(() => {
    if (
      fenetreActive !== "ia"
    ) {
      return;
    }

    const element =
      finConversationRef.current;

    if (!element) {
      return;
    }

    requestAnimationFrame(() => {
      element.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  }, [
    messages,
    iaEnCours,
    fenetreActive,
  ]);

  useEffect(() => {
    if (
      fenetreActive !== "ia"
    ) {
      setMenuIAMobileOuvert(
        false
      );
    }
  }, [fenetreActive]);

  /* ====================================================
     BLOQUER LE SCROLL DE LA PAGE
  ==================================================== */

  useEffect(() => {
    if (!fenetreActive) {
      return;
    }

    const ancienOverflow =
      document.body.style
        .overflow;

    const ancienPadding =
      document.body.style
        .paddingRight;

    const largeurScrollbar =
      window.innerWidth -
      document.documentElement
        .clientWidth;

    document.body.style.overflow =
      "hidden";

    if (largeurScrollbar > 0) {
      document.body.style.paddingRight = `${largeurScrollbar}px`;
    }

    return () => {
      document.body.style.overflow =
        ancienOverflow;

      document.body.style.paddingRight =
        ancienPadding;
    };
  }, [fenetreActive]);

  /* ====================================================
     MESSAGES
  ==================================================== */

  const ajouterMessage =
    (
      role:
        | "ia"
        | "eleve",
      contenu: string
    ) => {
      setMessages((precedentes) => [
        ...precedentes,
        {
          id:
            Date.now() +
            Math.random(),
          role,
          contenu,
        },
      ]);
    };

  const construireHistorique =
    (): HistoriqueGemini[] =>
      messages.map(
        (message) => ({
          role: message.role,
          contenu:
            message.contenu,
        })
      );

  /* ====================================================
     DIAGNOSTIC
  ==================================================== */

  const resultatComprehension =
    (
      comprehension: NiveauComprehension
    ): number => {
      switch (
        comprehension
      ) {
        case "solide":
          return 85;

        case "partielle":
          return 60;

        case "fragile":
          return 30;

        default:
          return 0;
      }
    };

  const calculerNouvelleConfiance =
    (
      ancienne: number,
      comprehension: NiveauComprehension
    ): number => {
      const base =
        resultatComprehension(
          comprehension
        );

      if (!ancienne) {
        return base;
      }

      return Math.round(
        ancienne * 0.65 +
          base * 0.35
      );
    };

  const appliquerDiagnosticGemini =
    (
      diagnosticGemini?: DiagnosticGemini
    ) => {
      if (!diagnosticGemini) {
        return;
      }

      const comprehension =
        normaliserComprehension(
          diagnosticGemini.comprehension
        );

      const confianceBrute =
        Number(
          diagnosticGemini.niveau_confiance ??
            diagnosticGemini.niveauConfiance ??
            NaN
        );

      const confiance =
        Number.isFinite(
          confianceBrute
        )
          ? Math.max(
              0,
              Math.min(
                100,
                Math.round(
                  confianceBrute
                )
              )
            )
          : calculerNouvelleConfiance(
              diagnostic.niveauConfiance,
              comprehension
            );

      const notionsMaitrisees =
        Array.isArray(
          diagnosticGemini.notions_maitrisees
        )
          ? diagnosticGemini.notions_maitrisees
          : Array.isArray(
                diagnosticGemini.notionsMaitrisees
              )
            ? diagnosticGemini.notionsMaitrisees
            : diagnostic.notionsMaitrisees;

      const notionsFragiles =
        Array.isArray(
          diagnosticGemini.notions_fragiles
        )
          ? diagnosticGemini.notions_fragiles
          : Array.isArray(
                diagnosticGemini.notionsFragiles
              )
            ? diagnosticGemini.notionsFragiles
            : diagnostic.notionsFragiles;

      setDiagnostic(
        (precedent) => ({
          niveauConfiance:
            confiance,

          comprehension:
            comprehension ===
            "inconnue"
              ? precedent.comprehension
              : comprehension,

          tentative:
            Number(
              diagnosticGemini.tentative ??
                precedent.tentative + 1
            ),

          erreurIdentifiee:
            convertirEnTexte(
              diagnosticGemini.erreur_identifiee ??
                diagnosticGemini.erreurIdentifiee
            ) ||
            precedent.erreurIdentifiee,

          notionsMaitrisees:
            notionsMaitrisees.filter(
              Boolean
            ),

          notionsFragiles:
            notionsFragiles.filter(
              Boolean
            ),
        })
      );
    };

  /* ====================================================
     APPEL GEMINI
  ==================================================== */

  const demanderAIAvecGemini =
    async (
      messageUtilisateur: string
    ): Promise<ReponseGemini> => {
      const payload = {
        matiere,
        niveau,
        serie: seriePourAPI,
        classe,
        notion,
        question:
          texteQuestion,
        choix,
        reponse_apprenant:
          reponseApprenant,
        reponse_apprenant_brute:
          reponseApprenantBrute,
        reponse_correcte:
          bonneReponse,
        reponse_correcte_lettre:
          rechercherBonneReponseLettre(
            bonneReponseBrute,
            choix
          ),
        correcte,
        mode,
        etape,
        tentative:
          diagnostic.tentative,
        niveau_aide:
          diagnostic.comprehension,
        solution_revelee:
          solutionRevelee,
        message_utilisateur:
          messageUtilisateur,
        historique:
          construireHistorique(),
        origine_acces:
          origineAcces,
      };

      const response =
        await api.post(
          API_IA_URL,
          payload
        );

      if (
        !response ||
        !response.data
      ) {
        throw new Error(
          "La réponse de CODE IA est vide."
        );
      }

      return response.data as ReponseGemini;
    };

  const traiterReponseGemini =
    (
      data: ReponseGemini
    ) => {
      appliquerDiagnosticGemini(
        data.diagnostic
      );

      const prochaineEtape =
        normaliserEtape(
          data.etape_suivante ??
            data.etapeSuivante
        );

      if (
        prochaineEtape !==
        "accueil"
      ) {
        setEtape(
          prochaineEtape
        );
      }

      if (
        data.solution_revelee ===
          true ||
        data.solutionRevelee ===
          true
      ) {
        setSolutionRevelee(
          true
        );
      }

      const contenu =
        convertirEnTexte(
          data.message ??
            data.contenu ??
            data.reponse
        );

      if (contenu) {
        ajouterMessage(
          "ia",
          contenu
        );
      }
    };

  const envoyerMessage =
    async (
      message: string
    ) => {
      const texte =
        message.trim();

      if (
        !texte ||
        iaEnCours
      ) {
        return;
      }

      setErreurAPI(null);
      ajouterMessage(
        "eleve",
        texte
      );
      setTexteSaisi("");
      setIaEnCours(true);

      try {
        const data =
          await demanderAIAvecGemini(
            texte
          );

        traiterReponseGemini(
          data
        );
      } catch (error) {
        console.error(
          "Erreur CODE IA :",
          error
        );

        const messageErreur =
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la communication avec CODE IA.";

        setErreurAPI(
          messageErreur
        );

        ajouterMessage(
          "ia",
          "Je rencontre actuellement une difficulté pour répondre. Vérifie ta connexion puis réessaie."
        );
      } finally {
        setIaEnCours(false);
      }
    };

  /* ====================================================
     ACTIONS RAPIDES
  ==================================================== */

  const executerAction =
    async (
      action: ActionRapide
    ) => {
      const configurations: Record<
        ActionRapide,
        {
          prompt: string;
          etape: EtapePedagogique;
        }
      > = {
        autrement: {
          prompt:
            "Explique-moi cette notion autrement, avec des mots simples et une progression adaptée à mon niveau. Ne donne pas immédiatement la réponse finale.",
          etape:
            "raisonnement",
        },

        indice: {
          prompt:
            "Donne-moi un indice progressif pour m'aider à résoudre la question sans me donner directement la réponse.",
          etape: "indice",
        },

        similaire: {
          prompt:
            "Propose-moi une question similaire qui me permettra de vérifier si j'ai compris la notion. Guide-moi ensuite progressivement.",
          etape: "recherche",
        },

        difficile: {
          prompt:
            "Propose-moi une question plus difficile mobilisant la même notion ou les mêmes prérequis.",
          etape:
            "approfondissement",
        },

        application: {
          prompt:
            "Montre-moi une application concrète et réelle de cette notion, puis explique comment elle se relie à la question étudiée.",
          etape:
            "approfondissement",
        },
      };

      const configuration =
        configurations[action];

      setEtape(
        configuration.etape
      );

      await envoyerMessage(
        configuration.prompt
      );
    };

  /* ====================================================
     CHANGEMENT DE MODE
  ==================================================== */

  const changerMode =
    async (
      nouveauMode: ModeIA
    ) => {
      setMode(
        nouveauMode
      );

      let prompt = "";

      let prochaineEtape: EtapePedagogique =
        "raisonnement";

      if (
        nouveauMode ===
        "comprendre"
      ) {
        prompt =
          "Aide-moi à comprendre le raisonnement nécessaire pour résoudre cette question. Guide-moi sans me donner immédiatement la réponse.";
        prochaineEtape =
          "raisonnement";
      }

      if (
        nouveauMode ===
        "corriger"
      ) {
        prompt =
          "Analyse ma réponse et mon raisonnement afin d'identifier précisément mon erreur ou ma difficulté. Aide-moi ensuite à la corriger progressivement.";
        prochaineEtape =
          "diagnostic";
      }

      if (
        nouveauMode ===
        "approfondir"
      ) {
        prompt =
          "Je veux aller plus loin. Approfondis cette notion avec une explication plus riche, une question supplémentaire ou une application.";
        prochaineEtape =
          "approfondissement";
      }

      setEtape(
        prochaineEtape
      );

      await envoyerMessage(
        prompt
      );
    };

  /* ====================================================
     RECOMMENCER
  ==================================================== */

  const recommencer =
    () => {
      if (iaEnCours) {
        return;
      }

      setMode(
        solutionConnueAuDepart
          ? "comprendre"
          : "corriger"
      );

      setEtape(
        solutionConnueAuDepart
          ? "raisonnement"
          : "accueil"
      );

      setSolutionRevelee(
        solutionConnueAuDepart
      );

      setDiagnostic({
        niveauConfiance:
          solutionConnueAuDepart
            ? 50
            : 0,
        comprehension:
          "inconnue",
        tentative: 0,
        erreurIdentifiee:
          "",
        notionsMaitrisees: [],
        notionsFragiles: [],
      });

      setMessages([
        {
          id: 1,
          role: "ia",
          contenu:
            solutionConnueAuDepart
              ? "La solution est déjà connue. Nous allons maintenant nous concentrer sur le raisonnement et sur la compréhension de la méthode."
              : "Je ne vais pas simplement te donner la réponse. Nous allons analyser ton raisonnement pour identifier ce qui est maîtrisé et ce qui doit être renforcé.",
        },
        {
          id: 2,
          role: "ia",
          contenu:
            "Explique-moi simplement comment tu as réfléchi pour arriver à ta réponse.",
        },
      ]);

      setTexteSaisi("");
      setErreurAPI(null);
      setMenuIAMobileOuvert(
        false
      );
    };

  /* ====================================================
     VIDÉO
  ==================================================== */

  const ouvrirFenetreVideo =
    async () => {
      setFenetreActive(
        "video"
      );

      setVideoLoading(true);
      setVideoError(null);
      setVideoSelectionnee(
        null
      );
      setVideoEtape("video");
      setVideoQuestionIndex(0);
      setVideoReponses({});
      setVideoQuestionValidee(
        false
      );
      setVideoQuestionCorrecte(
        false
      );

      if (
        !notion ||
        !niveau
      ) {
        setVideoLoading(false);
        setVideoError(
          "La notion ou le niveau de la question est indisponible."
        );
        return;
      }

      try {
        const response =
          await api.get(
            "/api/videos/remediation",
            {
              params: {
                niveau,
              },
            }
          );

        const donnees =
          Array.isArray(
            response.data
          )
            ? response.data
            : Array.isArray(
                  response.data?.videos
                )
              ? response.data.videos
              : [];

        const videosValides =
          donnees
            .map(
              (
                video: Record<
                  string,
                  unknown
                >
              ) => ({
                ...video,
                videoUrl:
                  convertirEnTexte(
                    video.videoUrl ??
                      video.video_url
                  ),
                questions:
                  Array.isArray(
                    video.questions
                  )
                    ? video.questions
                    : [],
              })
            )
            .filter(
              (
                video: RemediationVideo
              ) =>
                video.questions
                  .length > 0
            );

        const videosCorrespondantes =
          videosValides.filter(
            (
              video: RemediationVideo
            ) =>
              video.questions.some(
                (
                  videoQuestion
                ) =>
                  normaliserTexte(
                    videoQuestion.notion
                  ) ===
                  normaliserTexte(
                    notion
                  )
              )
          );

        if (
          videosCorrespondantes.length ===
          0
        ) {
          throw new Error(
            "Aucune vidéo de remédiation liée à cette notion n'a été trouvée."
          );
        }

        const video =
          videosCorrespondantes[0] as RemediationVideo;

        setVideoSelectionnee(
          video
        );
      } catch (error) {
        console.error(
          "Erreur vidéo de remédiation :",
          error
        );

        setVideoError(
          error instanceof Error
            ? error.message
            : "Impossible de rechercher une vidéo de remédiation."
        );
      } finally {
        setVideoLoading(false);
      }
    };

  const selectionnerReponseVideo =
    (
      reponse: string
    ) => {
      if (
        videoQuestionValidee ||
        !videoQuestionActuelle
      ) {
        return;
      }

      setVideoReponses(
        (precedentes) => ({
          ...precedentes,
          [String(
            videoQuestionActuelle.id
          )]: reponse,
        })
      );
    };

  const validerQuestionVideo =
    () => {
      if (
        !videoQuestionActuelle
      ) {
        return;
      }

      const reponse =
        videoReponses[
          String(
            videoQuestionActuelle.id
          )
        ];

      if (!reponse) {
        return;
      }

      const correcteVideo =
        normaliserTexte(
          reponse
        ) ===
        normaliserTexte(
          videoQuestionActuelle.bonne_reponse
        );

      setVideoQuestionCorrecte(
        correcteVideo
      );

      setVideoQuestionValidee(
        true
      );
    };

  const passerQuestionVideo =
    () => {
      if (
        !videoSelectionnee
      ) {
        return;
      }

      if (
        videoQuestionIndex >=
        videoSelectionnee
          .questions.length -
          1
      ) {
        setVideoEtape(
          "termine"
        );
        return;
      }

      setVideoQuestionIndex(
        (precedent) =>
          precedent + 1
      );

      setVideoQuestionValidee(
        false
      );

      setVideoQuestionCorrecte(
        false
      );
    };

  const recommencerQuestionsVideo =
    () => {
      setVideoEtape(
        "questions"
      );
      setVideoQuestionIndex(0);
      setVideoReponses({});
      setVideoQuestionValidee(
        false
      );
      setVideoQuestionCorrecte(
        false
      );
    };

  /* ====================================================
     PROGRESSION
  ==================================================== */

  const progression =
    useMemo(() => {
      const valeurs: Record<
        EtapePedagogique,
        number
      > = {
        accueil: 10,
        raisonnement: 25,
        diagnostic: 40,
        indice: 55,
        recherche: 65,
        verification: 80,
        approfondissement: 90,
        termine: 100,
      };

      return valeurs[etape];
    }, [etape]);

  const titreEtape =
    useMemo(() => {
      const valeurs: Record<
        EtapePedagogique,
        string
      > = {
        accueil:
          "Accueil",
        raisonnement:
          "Analyse du raisonnement",
        diagnostic:
          "Diagnostic",
        indice:
          "Aide progressive",
        recherche:
          "Recherche",
        verification:
          "Vérification",
        approfondissement:
          "Approfondissement",
        termine:
          "Terminé",
      };

      return valeurs[etape];
    }, [etape]);

  /* ====================================================
     SAISIE
  ==================================================== */

  const envoyerTexteSaisi =
    async () => {
      await envoyerMessage(
        texteSaisi
      );
    };

  const gererTouche =
    (
      event: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
      if (
        event.key ===
          "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();

        void envoyerTexteSaisi();
      }
    };

  /* ====================================================
     STYLES
  ==================================================== */

  const pageClass =
    darkMode
      ? "min-h-screen bg-gray-950 text-gray-100"
      : "min-h-screen bg-gray-50 text-gray-900";

  const surfaceClass =
    darkMode
      ? "bg-gray-900 border-gray-800"
      : "bg-white border-gray-200";

  /* ====================================================
     FENÊTRES
  ==================================================== */

  const ouvrirFenetre =
    (
      fenetre: FenetreActive
    ) => {
      setFenetreActive(
        fenetre
      );

      if (fenetre !== "ia") {
        setMenuIAMobileOuvert(
          false
        );
      }
    };

  const fermerFenetre =
    () => {
      if (iaEnCours) {
        return;
      }

      setFenetreActive(null);
      setMenuIAMobileOuvert(
        false
      );
    };

  const portail = (
    contenu: React.ReactNode
  ) =>
    typeof document !==
    "undefined"
      ? createPortal(
          contenu,
          document.body
        )
      : null;

  /* ======================================================
     FENÊTRE CLASSIQUE
  ====================================================== */

  const fenetreClassique =
    fenetreActive &&
    fenetreActive !== "ia"
      ? portail(
          <div
            className={`fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-4 ${
              darkMode
                ? "text-gray-100"
                : "text-gray-900"
            }`}
          >
            <div
              className={`my-1 flex max-h-[calc(100dvh-0.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl sm:my-4 sm:max-h-[calc(100dvh-2rem)] ${surfaceClass}`}
            >
              {/* HEADER */}

              <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {fenetreActive ===
                      "question" && (
                      <CircleHelp
                        size={20}
                      />
                    )}

                    {fenetreActive ===
                      "parcours" && (
                      <Route
                        size={20}
                      />
                    )}

                    {fenetreActive ===
                      "diagnostic" && (
                      <BarChart3
                        size={20}
                      />
                    )}

                    {fenetreActive ===
                      "objectif" && (
                      <Target
                        size={20}
                      />
                    )}

                    {fenetreActive ===
                      "enseignant" && (
                      <GraduationCap
                        size={20}
                      />
                    )}

                    {fenetreActive ===
                      "actions" && (
                      <ListChecks
                        size={20}
                      />
                    )}

                    {fenetreActive ===
                      "video" && (
                      <Video
                        size={20}
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-bold">
                      {fenetreActive ===
                        "question" &&
                        "Détails de la question"}

                      {fenetreActive ===
                        "parcours" &&
                        "Parcours pédagogique"}

                      {fenetreActive ===
                        "diagnostic" &&
                        "Diagnostic"}

                      {fenetreActive ===
                        "objectif" &&
                        "Objectif de CODE IA"}

                      {fenetreActive ===
                        "enseignant" &&
                        "Enseignant"}

                      {fenetreActive ===
                        "actions" &&
                        "Types de questions et aides"}

                      {fenetreActive ===
                        "video" &&
                        "Vidéo de remédiation"}
                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      CODE
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    fermerFenetre
                  }
                  disabled={
                    iaEnCours
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800"
                  title="Fermer"
                >
                  <X
                    size={21}
                  />
                </button>
              </div>

              {/* CONTENU */}

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
                {/* ==================================================
                    ACTIONS
                ================================================== */}

                {fenetreActive ===
                  "actions" && (
                  <div className="space-y-3">
                    {[
                      {
                        action:
                          "autrement" as ActionRapide,
                        icon: (
                          <MessageCircle className="shrink-0 text-blue-500" />
                        ),
                        titre:
                          "Explique autrement",
                        texte:
                          "Obtenir une explication plus simple et différente.",
                      },
                      {
                        action:
                          "indice" as ActionRapide,
                        icon: (
                          <Lightbulb className="shrink-0 text-yellow-500" />
                        ),
                        titre:
                          "Donne-moi un indice",
                        texte:
                          "Recevoir une aide progressive sans dévoiler immédiatement la solution.",
                      },
                      {
                        action:
                          "similaire" as ActionRapide,
                        icon: (
                          <RotateCcw className="shrink-0 text-green-500" />
                        ),
                        titre:
                          "Question similaire",
                        texte:
                          "S'entraîner avec une nouvelle question du même type.",
                      },
                      {
                        action:
                          "difficile" as ActionRapide,
                        icon: (
                          <Brain className="shrink-0 text-purple-500" />
                        ),
                        titre:
                          "Question plus difficile",
                        texte:
                          "Aller plus loin avec un niveau de difficulté supérieur.",
                      },
                      {
                        action:
                          "application" as ActionRapide,
                        icon: (
                          <Sparkles className="shrink-0 text-orange-500" />
                        ),
                        titre:
                          "Application concrète",
                        texte:
                          "Relier la notion à une situation réelle.",
                      },
                    ].map(
                      (item) => (
                        <button
                          key={
                            item.action
                          }
                          type="button"
                          onClick={() => {
                            setFenetreActive(
                              "ia"
                            );

                            void executerAction(
                              item.action
                            );
                          }}
                          disabled={
                            iaEnCours
                          }
                          className="flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 text-left transition hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-blue-900/20"
                        >
                          {item.icon}

                          <div>
                            <p className="font-semibold">
                              {
                                item.titre
                              }
                            </p>

                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {
                                item.texte
                              }
                            </p>
                          </div>
                        </button>
                      )
                    )}
                  </div>
                )}

                {/* ==================================================
                    QUESTION
                ================================================== */}

                {fenetreActive ===
                  "question" && (
                  <div className="space-y-5 text-sm">
                    <div className="flex flex-wrap gap-2">
                      {matiere && (
                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                          {matiere.toUpperCase()}
                        </span>
                      )}

                      {niveau && (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {niveau}
                        </span>
                      )}

                      {serie && (
                        <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                          Série{" "}
                          {serie}
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Question
                      </p>

                      <p className="mt-1 leading-relaxed">
                        {
                          texteQuestion
                        }
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
                                <span className="mr-2 font-bold">
                                  {String.fromCharCode(
                                    65 +
                                      index
                                  )}
                                  .
                                </span>

                                {
                                  choixItem
                                }
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
                        {reponseApprenant ||
                          "Aucune réponse enregistrée"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-green-600">
                        Réponse attendue
                      </p>

                      <p className="mt-1 font-semibold text-green-700 dark:text-green-300">
                        {solutionRevelee
                          ? bonneReponse ||
                            "Réponse attendue non disponible"
                          : "Non révélée pour le moment"}
                      </p>
                    </div>
                  </div>
                )}

                {/* ==================================================
                    PARCOURS
                ================================================== */}

                {fenetreActive ===
                  "parcours" && (
                  <div className="space-y-3">
                    <div className="mb-4 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-semibold">
                          {
                            titreEtape
                          }
                        </span>

                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {
                            progression
                          }
                          %
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
                            {
                              item[0]
                            }
                          </p>

                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {
                              item[1]
                            }
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
                          className="h-full rounded-full bg-blue-600 transition-all duration-500"
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
                                {
                                  item
                                }
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
                                {
                                  item
                                }
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
                      CODE IA ne cherche
                      pas seulement à te
                      donner la bonne
                      réponse.
                    </p>

                    <p>
                      Son objectif est de
                      comprendre ton
                      raisonnement, détecter
                      tes difficultés et
                      adapter l'aide à ton
                      niveau.
                    </p>

                    <p>
                      Le but final est de te
                      rendre progressivement
                      autonome face aux
                      problèmes.
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

                    {teacherProfile?.email && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {
                          teacherProfile.email
                        }
                      </p>
                    )}

                    {teacherError && (
                      <p className="mt-3 text-sm text-red-500">
                        {
                          teacherError
                        }
                      </p>
                    )}
                  </div>
                )}

                {/* ==================================================
                    VIDÉO
                ================================================== */}

                {fenetreActive ===
                  "video" && (
                  <div className="space-y-5">
                    {videoLoading && (
                      <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                          <Video
                            size={26}
                            className="animate-pulse"
                          />
                        </div>

                        <p className="font-semibold">
                          Recherche d'une vidéo de remédiation...
                        </p>

                        <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                          CODE recherche une vidéo contenant une question liée à la notion :
                        </p>

                        <span className="mt-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                          {notion ||
                            "Notion inconnue"}
                        </span>
                      </div>
                    )}

                    {!videoLoading &&
                      videoError && (
                        <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
                          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300">
                            <Video
                              size={26}
                            />
                          </div>

                          <p className="font-semibold">
                            Vidéo indisponible
                          </p>

                          <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                            {
                              videoError
                            }
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              void ouvrirFenetreVideo()
                            }
                            className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                          >
                            Réessayer
                          </button>
                        </div>
                      )}

                    {!videoLoading &&
                      !videoError &&
                      videoSelectionnee &&
                      videoEtape ===
                        "video" && (
                        <div className="space-y-5">
                          <div>
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                Remédiation
                              </span>

                              {videoSelectionnee.niveau && (
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                  {
                                    videoSelectionnee.niveau
                                  }
                                </span>
                              )}
                            </div>

                            <h4 className="text-lg font-bold">
                              {
                                videoSelectionnee.titre
                              }
                            </h4>

                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                              Cette vidéo a été sélectionnée parce qu'elle contient au moins une question liée à la notion :
                            </p>

                            <div className="mt-2 inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                              {
                                notion
                              }
                            </div>
                          </div>

                          {videoSelectionnee.videoUrl ? (
                            <div className="overflow-hidden rounded-xl bg-black">
                              <video
                                key={
                                  videoSelectionnee.id
                                }
                                controls
                                playsInline
                                className="aspect-video w-full"
                                onEnded={() =>
                                  setVideoEtape(
                                    "questions"
                                  )
                                }
                              >
                                <source
                                  src={construireUrlVideo(
                                    videoSelectionnee.videoUrl
                                  )}
                                />

                                Ton navigateur ne peut pas lire cette vidéo.
                              </video>
                            </div>
                          ) : (
                            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
                              <div className="flex gap-3">
                                <Video
                                  size={20}
                                  className="mt-0.5 shrink-0 text-orange-600"
                                />

                                <div>
                                  <p className="font-semibold text-orange-700 dark:text-orange-300">
                                    Vidéo non disponible pour le moment
                                  </p>

                                  <p className="mt-1 text-sm leading-relaxed text-orange-700/80 dark:text-orange-300/80">
                                    Cette vidéo existe dans la base de remédiation, mais son champ <strong>videoUrl</strong> est encore vide.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/70">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-semibold uppercase text-gray-500">
                                  Après la vidéo
                                </p>

                                <p className="mt-1 text-sm font-semibold">
                                  {
                                    videoSelectionnee.questions.length
                                  }{" "}
                                  question
                                  {videoSelectionnee.questions.length >
                                  1
                                    ? "s"
                                    : ""}{" "}
                                  à résoudre
                                </p>
                              </div>

                              <CheckCircle2
                                size={22}
                                className="text-blue-600"
                              />
                            </div>

                            <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                              Tu devras répondre à toutes les questions associées à cette vidéo, et pas uniquement à celle correspondant à la notion initiale.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setVideoEtape(
                                "questions"
                              )
                            }
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                          >
                            <Play
                              size={17}
                            />

                            {videoSelectionnee.videoUrl
                              ? "Commencer les questions"
                              : "Passer aux questions"}
                          </button>
                        </div>
                      )}

                    {!videoLoading &&
                      !videoError &&
                      videoSelectionnee &&
                      videoEtape ===
                        "questions" &&
                      videoQuestionActuelle && (
                        <div className="space-y-5">
                          <div>
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs font-semibold uppercase text-gray-500">
                                Question de remédiation
                              </span>

                              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                {videoQuestionIndex +
                                  1}{" "}
                                /{" "}
                                {
                                  videoSelectionnee.questions.length
                                }
                              </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                              <div
                                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                                style={{
                                  width: `${
                                    ((videoQuestionIndex +
                                      1) /
                                      videoSelectionnee.questions.length) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {videoQuestionActuelle.niveau && (
                              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                {
                                  videoQuestionActuelle.niveau
                                }
                              </span>
                            )}

                            {videoQuestionActuelle.notion && (
                              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                {
                                  videoQuestionActuelle.notion
                                }
                              </span>
                            )}

                            {typeof videoQuestionActuelle.duration ===
                              "number" && (
                              <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                <Clock
                                  size={13}
                                />

                                {
                                  videoQuestionActuelle.duration
                                }
                                s
                              </span>
                            )}
                          </div>

                          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                            <p className="font-semibold leading-relaxed">
                              {
                                videoQuestionActuelle.question
                              }
                            </p>
                          </div>

                          <div className="space-y-2">
                            {videoQuestionActuelle.choix.map(
                              (
                                choixVideo,
                                index
                              ) => {
                                const selectionnee =
                                  videoReponses[
                                    String(
                                      videoQuestionActuelle.id
                                    )
                                  ] ===
                                  choixVideo;

                                const lettre =
                                  String.fromCharCode(
                                    65 +
                                      index
                                  );

                                const bonne =
                                  normaliserTexte(
                                    choixVideo
                                  ) ===
                                  normaliserTexte(
                                    videoQuestionActuelle.bonne_reponse
                                  );

                                let classeChoix =
                                  "border-gray-200 hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-blue-900/20";

                                if (
                                  videoQuestionValidee &&
                                  bonne
                                ) {
                                  classeChoix =
                                    "border-green-500 bg-green-50 dark:border-green-700 dark:bg-green-900/20";
                                } else if (
                                  videoQuestionValidee &&
                                  selectionnee &&
                                  !bonne
                                ) {
                                  classeChoix =
                                    "border-red-500 bg-red-50 dark:border-red-700 dark:bg-red-900/20";
                                } else if (
                                  selectionnee
                                ) {
                                  classeChoix =
                                    "border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20";
                                }

                                return (
                                  <button
                                    key={
                                      `${videoQuestionActuelle.id}-${index}`
                                    }
                                    type="button"
                                    onClick={() =>
                                      selectionnerReponseVideo(
                                        choixVideo
                                      )
                                    }
                                    disabled={
                                      videoQuestionValidee
                                    }
                                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition ${classeChoix} ${
                                      videoQuestionValidee
                                        ? "cursor-default"
                                        : ""
                                    }`}
                                  >
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold dark:bg-gray-800">
                                      {
                                        lettre
                                      }
                                    </span>

                                    <span className="flex-1">
                                      {
                                        choixVideo
                                      }
                                    </span>

                                    {videoQuestionValidee &&
                                      bonne && (
                                        <CheckCircle2
                                          size={19}
                                          className="shrink-0 text-green-600"
                                        />
                                      )}

                                    {videoQuestionValidee &&
                                      selectionnee &&
                                      !bonne && (
                                        <XCircle
                                          size={19}
                                          className="shrink-0 text-red-600"
                                        />
                                      )}
                                  </button>
                                );
                              }
                            )}
                          </div>

                          {videoQuestionValidee && (
                            <div
                              className={`rounded-xl border p-4 ${
                                videoQuestionCorrecte
                                  ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                                  : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {videoQuestionCorrecte ? (
                                  <CheckCircle2
                                    size={20}
                                    className="mt-0.5 shrink-0 text-green-600"
                                  />
                                ) : (
                                  <XCircle
                                    size={20}
                                    className="mt-0.5 shrink-0 text-red-600"
                                  />
                                )}

                                <div>
                                  <p
                                    className={`font-semibold ${
                                      videoQuestionCorrecte
                                        ? "text-green-700 dark:text-green-300"
                                        : "text-red-700 dark:text-red-300"
                                    }`}
                                  >
                                    {videoQuestionCorrecte
                                      ? "Bonne réponse !"
                                      : "Réponse incorrecte"}
                                  </p>

                                  {!videoQuestionCorrecte && (
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                      Réponse attendue :{" "}
                                      <strong>
                                        {
                                          videoQuestionActuelle.bonne_reponse
                                        }
                                      </strong>
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {!videoQuestionValidee ? (
                            <button
                              type="button"
                              onClick={
                                validerQuestionVideo
                              }
                              disabled={
                                !videoReponses[
                                  String(
                                    videoQuestionActuelle.id
                                  )
                                ]
                              }
                              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Valider ma réponse
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={
                                passerQuestionVideo
                              }
                              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                              {videoQuestionIndex >=
                              videoSelectionnee.questions.length -
                                1
                                ? "Voir mon résultat"
                                : "Question suivante"}

                              <ChevronRight
                                size={17}
                              />
                            </button>
                          )}
                        </div>
                      )}

                    {!videoLoading &&
                      !videoError &&
                      videoSelectionnee &&
                      videoEtape ===
                        "termine" && (
                        <div className="space-y-5 text-center">
                          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300">
                            <CheckCircle2
                              size={42}
                            />
                          </div>

                          <div>
                            <h4 className="text-xl font-bold">
                              Remédiation terminée
                            </h4>

                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                              Tu as répondu à toutes les questions de cette vidéo.
                            </p>
                          </div>

                          <div className="rounded-2xl bg-blue-50 p-6 dark:bg-blue-900/20">
                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                              Ton résultat
                            </p>

                            <p className="mt-2 text-4xl font-black text-blue-700 dark:text-blue-300">
                              {
                                videoScore
                              }
                              {" / "}
                              {
                                videoSelectionnee.questions.length
                              }
                            </p>

                            <p className="mt-2 text-sm font-medium">
                              {videoScore ===
                              videoSelectionnee.questions.length
                                ? "Toutes les questions sont correctes."
                                : videoScore >
                                  videoSelectionnee.questions.length /
                                    2
                                ? "La notion est en bonne voie. Continue à t'exercer."
                                : "Certaines difficultés persistent. Une nouvelle remédiation peut être utile."}
                            </p>
                          </div>

                          <div className="flex flex-col gap-2 sm:flex-row">
                            <button
                              type="button"
                              onClick={
                                recommencerQuestionsVideo
                              }
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                            >
                              <RotateCcw
                                size={17}
                              />

                              Refaire les questions
                            </button>

                            <button
                              type="button"
                              onClick={
                                fermerFenetre
                              }
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                              Terminer
                            </button>
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      : null;

  /* ======================================================
     MENU INTERNE CODE IA
  ====================================================== */

  const ouvrirDepuisMenuIA =
    (
      fenetre: Exclude<
        FenetreActive,
        "ia" | null
      >
    ) => {
      setMenuIAMobileOuvert(
        false
      );
      setFenetreActive(
        fenetre
      );
    };

  /* ======================================================
     FENÊTRE CODE IA
  ====================================================== */

  const fenetreIA =
    fenetreActive ===
    "ia"
      ? portail(
          <div
            className={`fixed inset-0 z-[100] flex h-[100dvh] w-full flex-col overflow-hidden ${
              darkMode
                ? "bg-gray-950 text-gray-100"
                : "bg-white text-gray-900"
            }`}
          >
            {/* ==================================================
                EN-TÊTE
            ================================================== */}

            <header
              className={`relative z-30 shrink-0 border-b ${
                darkMode
                  ? "border-gray-800 bg-gray-950"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-2 px-3 py-2.5 sm:px-5 lg:px-7">
                <div className="flex min-w-0 items-center gap-2.5">
                  <button
                    type="button"
                    onClick={
                      fermerFenetre
                    }
                    disabled={
                      iaEnCours
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800"
                    title="Fermer CODE IA"
                  >
                    <X
                      size={21}
                    />
                  </button>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    <Brain
                      size={21}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="font-bold leading-tight">
                      CODE IA
                    </p>

                    <p className="hidden truncate text-[11px] text-gray-500 dark:text-gray-400 sm:block">
                      Ton accompagnateur pédagogique
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  {/* BADGES DESKTOP */}

                  <div className="hidden items-center gap-1 lg:flex">
                    {matiere && (
                      <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                        {matiere.toUpperCase()}
                      </span>
                    )}

                    {niveau && (
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {niveau}
                      </span>
                    )}

                    {serie && (
                      <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-[10px] font-semibold text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                        {serie}
                      </span>
                    )}
                  </div>

                  {/* MENU MOBILE */}

                  <button
                    type="button"
                    onClick={() =>
                      setMenuIAMobileOuvert(
                        (ouvert) =>
                          !ouvert
                      )
                    }
                    className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 px-3 text-sm font-semibold transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 sm:hidden"
                    aria-expanded={
                      menuIAMobileOuvert
                    }
                    title="Ouvrir le menu CODE IA"
                  >
                    <ListChecks
                      size={18}
                    />

                    <span>
                      Menu
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={
                      recommencer
                    }
                    disabled={
                      iaEnCours
                    }
                    className="flex h-10 items-center gap-2 rounded-xl px-2.5 text-sm font-semibold transition hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800 sm:px-3"
                  >
                    <RotateCcw
                      size={17}
                    />

                    <span className="hidden sm:inline">
                      Recommencer
                    </span>
                  </button>
                </div>
              </div>

              {/* ==================================================
                  MENU MOBILE DANS LA FENÊTRE IA
              ================================================== */}

              {menuIAMobileOuvert && (
                <div className="absolute left-0 right-0 top-full z-50 border-b border-gray-200 bg-white p-3 shadow-2xl dark:border-gray-800 dark:bg-gray-950 sm:hidden">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold">
                        Menu CODE IA
                      </p>

                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Tous les espaces d'apprentissage
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setMenuIAMobileOuvert(
                          false
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <X
                        size={17}
                      />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setMenuIAMobileOuvert(
                          false
                        )
                      }
                      className="rounded-xl border border-blue-500 bg-blue-50 p-3 text-left dark:bg-blue-900/20"
                    >
                      <Brain
                        size={18}
                        className="mb-1 text-blue-600"
                      />

                      <p className="text-xs font-bold">
                        Discussion IA
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void changerMode(
                          "comprendre"
                        )
                      }
                      disabled={
                        iaEnCours
                      }
                      className="rounded-xl border border-gray-200 p-3 text-left dark:border-gray-700"
                    >
                      <BookOpen
                        size={18}
                        className="mb-1"
                      />

                      <p className="text-xs font-bold">
                        Comprendre
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void changerMode(
                          "corriger"
                        )
                      }
                      disabled={
                        iaEnCours
                      }
                      className="rounded-xl border border-gray-200 p-3 text-left dark:border-gray-700"
                    >
                      <CircleHelp
                        size={18}
                        className="mb-1"
                      />

                      <p className="text-xs font-bold">
                        Corriger
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void changerMode(
                          "approfondir"
                        )
                      }
                      disabled={
                        iaEnCours
                      }
                      className="rounded-xl border border-gray-200 p-3 text-left dark:border-gray-700"
                    >
                      <Sparkles
                        size={18}
                        className="mb-1"
                      />

                      <p className="text-xs font-bold">
                        Approfondir
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        ouvrirDepuisMenuIA(
                          "question"
                        )
                      }
                      className="rounded-xl border border-gray-200 p-3 text-left dark:border-gray-700"
                    >
                      <CircleHelp
                        size={18}
                        className="mb-1"
                      />

                      <p className="text-xs font-bold">
                        Question
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        ouvrirDepuisMenuIA(
                          "diagnostic"
                        )
                      }
                      className="rounded-xl border border-gray-200 p-3 text-left dark:border-gray-700"
                    >
                      <BarChart3
                        size={18}
                        className="mb-1"
                      />

                      <p className="text-xs font-bold">
                        Diagnostic
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        ouvrirDepuisMenuIA(
                          "parcours"
                        )
                      }
                      className="rounded-xl border border-gray-200 p-3 text-left dark:border-gray-700"
                    >
                      <Route
                        size={18}
                        className="mb-1"
                      />

                      <p className="text-xs font-bold">
                        Parcours
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        ouvrirDepuisMenuIA(
                          "objectif"
                        )
                      }
                      className="rounded-xl border border-gray-200 p-3 text-left dark:border-gray-700"
                    >
                      <Target
                        size={18}
                        className="mb-1"
                      />

                      <p className="text-xs font-bold">
                        Objectif
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        ouvrirDepuisMenuIA(
                          "actions"
                        )
                      }
                      className="rounded-xl border border-gray-200 p-3 text-left dark:border-gray-700"
                    >
                      <ListChecks
                        size={18}
                        className="mb-1"
                      />

                      <p className="text-xs font-bold">
                        Aides
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        ouvrirDepuisMenuIA(
                          "enseignant"
                        )
                      }
                      className="rounded-xl border border-gray-200 p-3 text-left dark:border-gray-700"
                    >
                      <GraduationCap
                        size={18}
                        className="mb-1"
                      />

                      <p className="text-xs font-bold">
                        Enseignant
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void ouvrirFenetreVideo()
                      }
                      disabled={
                        videoLoading
                      }
                      className="rounded-xl border border-gray-200 p-3 text-left disabled:opacity-50 dark:border-gray-700"
                    >
                      <Video
                        size={18}
                        className="mb-1 text-blue-600"
                      />

                      <p className="text-xs font-bold">
                        Remédiation vidéo
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={
                        recommencer
                      }
                      disabled={
                        iaEnCours
                      }
                      className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-gray-100 p-3 text-xs font-bold transition hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                      <RotateCcw
                        size={16}
                      />

                      Recommencer la discussion
                    </button>
                  </div>
                </div>
              )}
            </header>

            {/* ==================================================
                CORPS IA
            ================================================== */}

            <div className="min-h-0 flex-1 overflow-hidden">
              <div className="mx-auto flex h-full w-full max-w-[1500px] flex-col">
                {/* ==================================================
                    CONTEXTE COMPACT
                ================================================== */}

                <div className="shrink-0 border-b border-gray-200 px-3 py-2 dark:border-gray-800 sm:px-5 lg:px-7">
                  <div className="flex items-center gap-2">
                    <CircleHelp
                      size={14}
                      className="shrink-0 text-gray-500"
                    />

                    <span className="hidden text-[11px] font-semibold uppercase tracking-wide text-gray-500 sm:inline">
                      Question étudiée
                    </span>

                    <p className="min-w-0 flex-1 truncate text-xs font-medium sm:text-sm">
                      {texteQuestion ||
                        "Question non disponible"}
                    </p>

                    <div className="hidden shrink-0 items-center gap-1.5 md:flex">
                      {matiere && (
                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                          {matiere.toUpperCase()}
                        </span>
                      )}

                      {niveau && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {niveau}
                        </span>
                      )}

                      {serie && (
                        <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-semibold text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                          {serie}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    CONTENU PRINCIPAL : DISCUSSION + SIDEBAR
                ================================================== */}

                <div className="min-h-0 flex-1 overflow-hidden">
                  <div className="flex h-full min-h-0">
                    {/* ==================================================
                        DISCUSSION
                    ================================================== */}

                    <section className="flex min-w-0 flex-1 flex-col">
                      {/* MODES COMPACTS DESKTOP */}

                      <div className="hidden shrink-0 border-b border-gray-200 px-4 py-2.5 dark:border-gray-800 lg:block">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void changerMode(
                                "comprendre"
                              )
                            }
                            disabled={
                              iaEnCours
                            }
                            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                              mode ===
                              "comprendre"
                                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                            }`}
                          >
                            <BookOpen
                              size={16}
                            />

                            Comprendre
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void changerMode(
                                "corriger"
                              )
                            }
                            disabled={
                              iaEnCours
                            }
                            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                              mode ===
                              "corriger"
                                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                            }`}
                          >
                            <CircleHelp
                              size={16}
                            />

                            Corriger
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void changerMode(
                                "approfondir"
                              )
                            }
                            disabled={
                              iaEnCours
                            }
                            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                              mode ===
                              "approfondir"
                                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                            }`}
                          >
                            <Sparkles
                              size={16}
                            />

                            Approfondir
                          </button>

                          <div className="ml-auto flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                            <span>
                              {titreEtape}
                            </span>

                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                              <div
                                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                                style={{
                                  width: `${progression}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CONVERSATION */}

                      <div
                        ref={
                          conversationRef
                        }
                        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-5 sm:py-5 lg:px-8"
                        style={{
                          scrollbarWidth:
                            "thin",
                        }}
                      >
                        <div className="mx-auto w-full max-w-5xl space-y-4">
                          {messages.map(
                            (
                              message
                            ) => {
                              const estEleve =
                                message.role ===
                                "eleve";

                              return (
                                <div
                                  key={
                                    message.id
                                  }
                                  className={`flex w-full ${
                                    estEleve
                                      ? "justify-end"
                                      : "justify-start"
                                  }`}
                                >
                                  <div
                                    className={`rounded-2xl px-4 py-3.5 text-sm leading-relaxed shadow-sm sm:px-5 sm:py-4 ${
                                      estEleve
                                        ? "w-fit max-w-[94%] bg-blue-600 text-white sm:max-w-[82%]"
                                        : "w-fit max-w-[98%] bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 sm:max-w-[88%]"
                                    }`}
                                  >
                                    <div
                                      className={`mb-2 flex items-center gap-2 text-[11px] font-semibold ${
                                        estEleve
                                          ? "text-blue-100"
                                          : "text-gray-500 dark:text-gray-400"
                                      }`}
                                    >
                                      {estEleve ? (
                                        <>
                                          <User
                                            size={
                                              14
                                            }
                                          />

                                          <span>
                                            Toi
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <Brain
                                            size={
                                              14
                                            }
                                          />

                                          <span>
                                            CODE IA
                                          </span>
                                        </>
                                      )}
                                    </div>

                                    <div className="whitespace-pre-wrap break-words">
                                      {
                                        message.contenu
                                      }
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          )}

                          {iaEnCours && (
                            <div className="flex justify-start">
                              <div className="max-w-[95%] rounded-2xl bg-gray-100 px-5 py-4 text-sm text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-400">
                                <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold">
                                  <Brain
                                    size={
                                      14
                                    }
                                  />

                                  <span>
                                    CODE IA
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span>
                                    CODE IA réfléchit
                                  </span>

                                  <span className="animate-pulse">
                                    ...
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div
                            ref={
                              finConversationRef
                            }
                            className="h-px w-full"
                            aria-hidden="true"
                          />
                        </div>
                      </div>

                      {/* ERREUR */}

                      {erreurAPI && (
                        <div className="shrink-0 px-3 pb-2 sm:px-5 lg:px-8">
                          <div className="mx-auto max-w-5xl rounded-xl border border-blue-200 bg-blue-50 p-2.5 text-xs text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                            {
                              erreurAPI
                            }
                          </div>
                        </div>
                      )}

                      {/* ==================================================
                          ZONE DE SAISIE
                      ================================================== */}

                      <div className="shrink-0 border-t border-gray-200 bg-white p-2.5 dark:border-gray-800 dark:bg-gray-950 sm:p-3 lg:px-8 lg:py-3">
                        <div className="mx-auto w-full max-w-5xl">
                          <div className="flex items-end gap-2">
                            <textarea
                              value={
                                texteSaisi
                              }
                              onChange={(
                                event
                              ) =>
                                setTexteSaisi(
                                  event
                                    .target
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
                              placeholder="Écris ta question ou explique ton raisonnement à CODE IA..."
                              className="min-h-[58px] min-w-0 flex-1 resize-none rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900"
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
                              className="flex h-[58px] w-[56px] shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Envoyer"
                            >
                              <Send
                                size={20}
                              />
                            </button>
                          </div>

                          <p className="mt-1 text-center text-[10px] text-gray-400">
                            Entrée pour envoyer · Maj + Entrée pour une nouvelle ligne
                          </p>
                        </div>
                      </div>

                      {/* ACTIONS RAPIDES COMPACTES */}

                      <div className="shrink-0 border-t border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900/70 sm:px-5 lg:px-8">
                        <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto overscroll-contain pb-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              void executerAction(
                                "autrement"
                              )
                            }
                            disabled={
                              iaEnCours
                            }
                            className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold transition hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                          >
                            <MessageCircle
                              size={14}
                            />

                            Explique autrement
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void executerAction(
                                "indice"
                              )
                            }
                            disabled={
                              iaEnCours
                            }
                            className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold transition hover:border-yellow-400 hover:bg-yellow-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                          >
                            <Lightbulb
                              size={14}
                            />

                            Indice
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void executerAction(
                                "similaire"
                              )
                            }
                            disabled={
                              iaEnCours
                            }
                            className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold transition hover:border-green-400 hover:bg-green-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                          >
                            <RotateCcw
                              size={14}
                            />

                            Similaire
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void executerAction(
                                "difficile"
                              )
                            }
                            disabled={
                              iaEnCours
                            }
                            className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold transition hover:border-purple-400 hover:bg-purple-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                          >
                            <Brain
                              size={14}
                            />

                            Plus difficile
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void executerAction(
                                "application"
                              )
                            }
                            disabled={
                              iaEnCours
                            }
                            className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold transition hover:border-orange-400 hover:bg-orange-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                          >
                            <Sparkles
                              size={14}
                            />

                            Application
                          </button>
                        </div>
                      </div>
                    </section>

                    {/* ==================================================
                        PANNEAU DROIT DESKTOP
                    ================================================== */}

                    <aside className="hidden w-[280px] shrink-0 flex-col border-l border-gray-200 bg-gray-50/70 dark:border-gray-800 dark:bg-gray-900/40 xl:flex">
                      <div className="border-b border-gray-200 p-4 dark:border-gray-800">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Outils d'apprentissage
                        </p>

                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Accède rapidement aux informations de cette séance.
                        </p>
                      </div>

                      <div className="min-h-0 flex-1 overflow-y-auto p-3">
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() =>
                              setFenetreActive(
                                "question"
                              )
                            }
                            className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-blue-900/20"
                          >
                            <CircleHelp
                              size={18}
                              className="shrink-0 text-blue-600"
                            />

                            <div className="min-w-0">
                              <p className="text-sm font-semibold">
                                Question
                              </p>

                              <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                                Voir les détails
                              </p>
                            </div>

                            <ChevronRight
                              size={16}
                              className="ml-auto shrink-0 text-gray-400"
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setFenetreActive(
                                "diagnostic"
                              )
                            }
                            className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition hover:border-purple-400 hover:bg-purple-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-purple-900/20"
                          >
                            <BarChart3
                              size={18}
                              className="shrink-0 text-purple-600"
                            />

                            <div className="min-w-0">
                              <p className="text-sm font-semibold">
                                Diagnostic
                              </p>

                              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                {
                                  diagnostic.niveauConfiance
                                }
                                % de confiance
                              </p>
                            </div>

                            <ChevronRight
                              size={16}
                              className="ml-auto shrink-0 text-gray-400"
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setFenetreActive(
                                "parcours"
                              )
                            }
                            className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition hover:border-green-400 hover:bg-green-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-green-900/20"
                          >
                            <Route
                              size={18}
                              className="shrink-0 text-green-600"
                            />

                            <div className="min-w-0">
                              <p className="text-sm font-semibold">
                                Parcours
                              </p>

                              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                {
                                  progression
                                }
                                % terminé
                              </p>
                            </div>

                            <ChevronRight
                              size={16}
                              className="ml-auto shrink-0 text-gray-400"
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setFenetreActive(
                                "objectif"
                              )
                            }
                            className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition hover:border-yellow-400 hover:bg-yellow-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-yellow-900/20"
                          >
                            <Target
                              size={18}
                              className="shrink-0 text-yellow-600"
                            />

                            <div className="min-w-0">
                              <p className="text-sm font-semibold">
                                Objectif
                              </p>

                              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                Pourquoi CODE IA t'aide
                              </p>
                            </div>

                            <ChevronRight
                              size={16}
                              className="ml-auto shrink-0 text-gray-400"
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setFenetreActive(
                                "actions"
                              )
                            }
                            className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition hover:border-orange-400 hover:bg-orange-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-orange-900/20"
                          >
                            <ListChecks
                              size={18}
                              className="shrink-0 text-orange-600"
                            />

                            <div className="min-w-0">
                              <p className="text-sm font-semibold">
                                Aides
                              </p>

                              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                Actions rapides
                              </p>
                            </div>

                            <ChevronRight
                              size={16}
                              className="ml-auto shrink-0 text-gray-400"
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setFenetreActive(
                                "enseignant"
                              )
                            }
                            className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-blue-900/20"
                          >
                            <GraduationCap
                              size={18}
                              className="shrink-0 text-blue-600"
                            />

                            <div className="min-w-0">
                              <p className="text-sm font-semibold">
                                Enseignant
                              </p>

                              <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                                {
                                  teacherFullName
                                }
                              </p>
                            </div>

                            <ChevronRight
                              size={16}
                              className="ml-auto shrink-0 text-gray-400"
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void ouvrirFenetreVideo()
                            }
                            disabled={
                              videoLoading
                            }
                            className="flex w-full items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-left transition hover:border-blue-400 hover:bg-blue-100 disabled:opacity-50 dark:border-blue-800 dark:bg-blue-900/20 dark:hover:bg-blue-900/40"
                          >
                            <Video
                              size={18}
                              className="shrink-0 text-blue-600"
                            />

                            <div className="min-w-0">
                              <p className="text-sm font-semibold">
                                Remédiation vidéo
                              </p>

                              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                Vidéo + questions
                              </p>
                            </div>

                            <ChevronRight
                              size={16}
                              className="ml-auto shrink-0 text-gray-400"
                            />
                          </button>
                        </div>

                        {/* RÉSUMÉ RÉPONSES */}

                        <div className="mt-4 rounded-xl bg-white p-3 dark:bg-gray-900">
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Réponses
                          </p>

                          <div className="space-y-2">
                            <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                              <p className="text-[10px] font-semibold uppercase text-blue-600 dark:text-blue-400">
                                Ta réponse
                              </p>

                              <p className="mt-1 line-clamp-2 text-xs font-medium">
                                {reponseApprenant ||
                                  "Non disponible"}
                              </p>
                            </div>

                            <div className="rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
                              <p className="text-[10px] font-semibold uppercase text-green-600 dark:text-green-400">
                                Réponse attendue
                              </p>

                              <p className="mt-1 line-clamp-2 text-xs font-medium">
                                {solutionRevelee
                                  ? bonneReponse ||
                                    "Non disponible"
                                  : "Non révélée"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </aside>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      : null;

  /* ======================================================
     AFFICHAGE PRINCIPAL
  ====================================================== */

  return (
    <div
      className={`${pageClass} px-4 py-5 sm:px-6`}
    >
      <div className="mx-auto w-full max-w-5xl">
        {/* EN-TÊTE PRINCIPAL */}

        <div
          className={`${surfaceClass} mb-5 flex items-center justify-between rounded-2xl border px-4 py-3 shadow-sm`}
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

          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              CODE
            </p>

            <p className="font-bold">
              Question
            </p>

            {(matiere ||
              niveau ||
              serie) && (
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                {matiere &&
                  matiere.toUpperCase()}

                {niveau &&
                  ` • ${niveau}`}

                {serie &&
                  ` • ${serie}`}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              ouvrirFenetre(
                "ia"
              )
            }
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Brain
              size={17}
            />

            <span className="hidden sm:inline">
              CODE IA
            </span>
          </button>
        </div>

        {/* SECTION PRINCIPALE */}

        <div
          className={`${surfaceClass} overflow-hidden rounded-2xl border shadow-xl`}
        >
          {/* QUESTION */}

          <div className="p-5 sm:p-7">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {matiere && (
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                  {matiere.toUpperCase()}
                </span>
              )}

              {niveau && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {niveau}
                </span>
              )}

              {serie && (
                <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                  Série{" "}
                  {serie}
                </span>
              )}

              {classe && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {classe}
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

            {/* ENSEIGNANT */}

            {enseignant && (
              <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex items-center gap-4">
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
                    <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-blue-500 bg-gray-200 shadow-sm dark:bg-gray-700">
                      {teacherPhotoUrl ? (
                        <img
                          src={
                            teacherPhotoUrl
                          }
                          alt={`Photo de ${teacherFullName}`}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
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

                  <button
                    type="button"
                    onClick={() =>
                      ouvrirFenetre(
                        "enseignant"
                      )
                    }
                    className="rounded-xl p-2 text-blue-600 transition hover:bg-blue-100 dark:hover:bg-blue-900/40"
                    title="Voir l'enseignant"
                  >
                    <ChevronRight
                      size={20}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* RÉPONSE APPRENANT */}

            <div className="mt-6 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/70">
              <div className="mb-2 flex items-center gap-2">
                <User
                  size={16}
                  className="text-blue-600 dark:text-blue-400"
                />

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Ta réponse
                </p>
              </div>

              <p className="font-medium">
                {reponseApprenant ||
                  "Aucune réponse enregistrée"}
              </p>

              {reponseApprenantBrute &&
                reponseApprenantBrute !== reponseApprenant ? (
                   <p className="mt-1 text-xs text-gray-400">
                    <p className="mt-1 text-xs text-gray-400">
                       Réponse enregistrée : {String(reponseApprenantBrute)}
                    </p>
                   </p>
                 ) : null}

              {bonneReponse && (
                <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                  <div className="mb-2 flex items-center gap-2">
                    <CircleHelp
                      size={16}
                      className="text-green-600 dark:text-green-400"
                    />

                    <p className="text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400">
                      Réponse attendue
                    </p>
                  </div>

                  {solutionRevelee ? (
                    <p className="font-semibold text-green-700 dark:text-green-300">
                      {
                        bonneReponse
                      }
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      La réponse attendue sera révélée après l'analyse de ton raisonnement par CODE IA.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* MENU */}

          <div className="border-t border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900/50 sm:p-5">
            <div className="mb-4">
              <h2 className="font-bold">
                Que veux-tu faire ?
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choisis un espace pour poursuivre ton apprentissage.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {/* CODE IA */}

              <button
                type="button"
                onClick={() =>
                  ouvrirFenetre(
                    "ia"
                  )
                }
                className="group rounded-xl border border-blue-200 bg-blue-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-100 hover:shadow-md dark:border-blue-800 dark:bg-blue-900/20 dark:hover:bg-blue-900/40"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <Brain
                      size={20}
                    />
                  </div>

                  <ChevronRight
                    size={19}
                    className="text-blue-500 transition-transform group-hover:translate-x-1"
                  />
                </div>

                <p className="font-bold text-blue-700 dark:text-blue-300">
                  Discuter avec CODE IA
                </p>

                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Comprendre, corriger ton raisonnement ou approfondir.
                </p>
              </button>

              {/* QUESTION */}

              <button
                type="button"
                onClick={() =>
                  ouvrirFenetre(
                    "question"
                  )
                }
                className="group rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-700"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    <CircleHelp
                      size={20}
                    />
                  </div>

                  <ChevronRight
                    size={19}
                    className="text-gray-400 transition-transform group-hover:translate-x-1"
                  />
                </div>

                <p className="font-bold">
                  Détails de la question
                </p>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Voir les choix et les informations complètes.
                </p>
              </button>

              {/* DIAGNOSTIC */}

              <button
                type="button"
                onClick={() =>
                  ouvrirFenetre(
                    "diagnostic"
                  )
                }
                className="group rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-700"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    <BarChart3
                      size={20}
                    />
                  </div>

                  <ChevronRight
                    size={19}
                    className="text-gray-400 transition-transform group-hover:translate-x-1"
                  />
                </div>

                <p className="font-bold">
                  Diagnostic
                </p>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Voir ton niveau de compréhension et tes difficultés.
                </p>
              </button>

              {/* PARCOURS */}

              <button
                type="button"
                onClick={() =>
                  ouvrirFenetre(
                    "parcours"
                  )
                }
                className="group rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-700"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    <Route
                      size={20}
                    />
                  </div>

                  <ChevronRight
                    size={19}
                    className="text-gray-400 transition-transform group-hover:translate-x-1"
                  />
                </div>

                <p className="font-bold">
                  Parcours pédagogique
                </p>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Voir les étapes de ton accompagnement.
                </p>
              </button>

              {/* OBJECTIF */}

              <button
                type="button"
                onClick={() =>
                  ouvrirFenetre(
                    "objectif"
                  )
                }
                className="group rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-700"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                    <Target
                      size={20}
                    />
                  </div>

                  <ChevronRight
                    size={19}
                    className="text-gray-400 transition-transform group-hover:translate-x-1"
                  />
                </div>

                <p className="font-bold">
                  Objectif de CODE IA
                </p>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Comprendre comment l'IA t'accompagne.
                </p>
              </button>

              {/* ACTIONS */}

              <button
                type="button"
                onClick={() =>
                  ouvrirFenetre(
                    "actions"
                  )
                }
                className="group rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-700"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                    <ListChecks
                      size={20}
                    />
                  </div>

                  <ChevronRight
                    size={19}
                    className="text-gray-400 transition-transform group-hover:translate-x-1"
                  />
                </div>

                <p className="font-bold">
                  Types de questions et aides
                </p>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Demander un indice, une autre explication ou un exercice.
                </p>
              </button>

              {/* VIDÉO */}

              <button
                type="button"
                onClick={() =>
                  void ouvrirFenetreVideo()
                }
                disabled={
                  videoLoading
                }
                className="group rounded-xl border border-blue-200 bg-blue-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-blue-800 dark:bg-blue-900/20 dark:hover:bg-blue-900/40"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <Video
                      size={20}
                    />
                  </div>

                  <ChevronRight
                    size={19}
                    className="text-blue-500 transition-transform group-hover:translate-x-1"
                  />
                </div>

                <p className="font-bold text-blue-700 dark:text-blue-300">
                  Vidéo de remédiation
                </p>

                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Regarder une vidéo liée à la notion puis répondre à toutes ses questions.
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PORTAILS */}

      {fenetreClassique}

      {fenetreIA}
    </div>
  );
}