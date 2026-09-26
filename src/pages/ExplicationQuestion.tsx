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
  bonne_reponse_lettre?: string;
  bonneReponseLettre?: string;
  reponse_apprenant?: string;
  reponseApprenant?: string;
  reponseUtilisateur?: string;
  reponse_user?: string;
  reponse?: string;
  answer?: string;
  reponse_attendue?: string;
  notion?: string;
  matiere?: string;
  niveau?: string;
  classe?: string;
  serie?: string | string[] | null;
  correcte?: boolean;
  enseignant?: string | null;
}

interface ResultatsContext {
  matiere?: string;
  niveau?: string;
  serie?: string | string[] | null;
  classe?: string;
  question?: string;
  questionActuelle?: QuestionContext;
  reponse_apprenant?: string;
  reponseApprenant?: string;
  reponseUtilisateur?: string;
  reponse_user?: string;
  reponse?: string;
  answer?: string;
  bonne_reponse?: string;
  bonneReponse?: string;
  bonne_reponse_lettre?: string;
  bonneReponseLettre?: string;
  reponse_attendue?: string;
  correcte?: boolean;
  [key: string]: unknown;
}

interface LocationState {
  question?: QuestionContext;
  questionActuelle?: QuestionContext;
  reponseUtilisateur?: string;
  reponseApprenant?: string;
  reponse_apprenant?: string;
  reponse_user?: string;
  reponse?: string;
  answer?: string;
  bonneReponse?: string;
  bonne_reponse?: string;
  bonne_reponse_lettre?: string;
  bonneReponseLettre?: string;
  reponse_attendue?: string;
  correcte?: boolean;
  notion?: string;
  matiereActuelle?: string;
  matiere?: string;
  niveauActuel?: string;
  niveau?: string;
  classe?: string;
  serieActuelle?: string | string[] | null;
  serie?: string | string[] | null;
  enseignant?: string | null;
  origineAcces?: string;
  sourcePage?: string;
  source?: string;
  resultats?: ResultatsContext | null;
  [key: string]: unknown;
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
   VIDÉOS DE REMÉDIATION
======================================================== */

interface RemediationVideoQuestion {
  id: string;
  question: string;
  choix: string[];
  bonne_reponse: string;
  niveau?: string;
  notion?: string;
  duration?: number;
}

interface RemediationVideo {
  id: string;
  titre: string;
  niveau?: string;
  serie?: string | string[];
  mois?: string[];
  videoUrl?: string;
  notions?: string[];
  prerequis?: string[];
  questions: RemediationVideoQuestion[];
  enseignant?: string;
  matiere?: string;
}

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
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normaliserMatiere(
  valeur: unknown
): string {
  return convertirEnTexte(valeur)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[-_]/g, "")
    .trim();
}

function normaliserNiveau(
  valeur: unknown
): string {
  const niveau =
    normaliserTexte(valeur);

  const correspondances: Record<
    string,
    string
  > = {
    terminale: "tle",
    tle: "tle",
    "1ere": "1ere",
    "1re": "1ere",
    premiere: "1ere",
    "2nde": "2nde",
    seconde: "2nde",
    "6eme": "6e",
    "5eme": "5e",
    "4eme": "4e",
    "3eme": "3e",
  };

  return (
    correspondances[niveau] ||
    niveau
  );
}

function normaliserSerie(
  valeur: unknown
): string {
  if (
    valeur === null ||
    valeur === undefined
  ) {
    return "";
  }

  if (Array.isArray(valeur)) {
    return valeur
      .map(normaliserSerie)
      .filter(Boolean)
      .join(", ");
  }

  const serie =
    normaliserTexte(valeur);

  if (
    !serie ||
    serie === "none" ||
    serie === "null"
  ) {
    return "";
  }

  return serie.toUpperCase();
}

function construireUrlPhoto(
  photo?: string | null
): string | null {
  if (!photo) {
    return null;
  }

  if (/^https?:\/\//i.test(photo)) {
    return photo;
  }

  if (photo.startsWith("/")) {
    return `${API_BASE_URL}${photo}`;
  }

  return `${API_BASE_URL}/${photo}`;
}

function construireUrlVideo(
  videoUrl?: string | null
): string | null {
  if (!videoUrl) {
    return null;
  }

  if (/^https?:\/\//i.test(videoUrl)) {
    return videoUrl;
  }

  if (videoUrl.startsWith("/")) {
    return `${API_BASE_URL}${videoUrl}`;
  }

  return `${API_BASE_URL}/${videoUrl}`;
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

  if ("resultats" in state) {
    return state.resultats == null
      ? "remediation-video"
      : "remediation";
  }

  return "inconnue";
}

/* ========================================================
   EXTRACTION DES RÉPONSES
======================================================== */

function estLettreReponse(
  valeur: string
): boolean {
  return /^[a-e]$/i.test(
    valeur.trim()
  );
}

function normaliserLettre(
  valeur: unknown
): string {
  return convertirEnTexte(valeur)
    .trim()
    .toLowerCase();
}

function convertirChoixEnTableau(
  valeur: unknown
): string[] {
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
    const objet =
      valeur as Record<
        string,
        unknown
      >;

    const ordre = [
      "a",
      "b",
      "c",
      "d",
      "e",
    ];

    const valeursOrdonnees =
      ordre
        .filter(
          (lettre) =>
            lettre in objet
        )
        .map(
          (lettre) =>
            convertirEnTexte(
              objet[lettre]
            )
        );

    if (
      valeursOrdonnees.length > 0
    ) {
      return valeursOrdonnees;
    }

    return Object.values(
      objet
    ).map(convertirEnTexte);
  }

  return [];
}

function obtenirChoix(
  question?: QuestionContext
): string[] {
  return convertirChoixEnTableau(
    question?.choix
  );
}

function lettreVersChoix(
  lettre: unknown,
  choix: string[]
): string {
  const valeur =
    normaliserLettre(lettre);

  if (
    !estLettreReponse(valeur)
  ) {
    return convertirEnTexte(
      lettre
    );
  }

  const index =
    valeur.charCodeAt(0) -
    "a".charCodeAt(0);

  return (
    choix[index] ||
    valeur.toUpperCase()
  );
}

function rechercherReponseApprenant(
  state: LocationState,
  question: QuestionContext,
  resultats:
    | ResultatsContext
    | null
    | undefined
): string {
  const candidates = [
    state.reponseUtilisateur,
    state.reponseApprenant,
    state.reponse_apprenant,
    state.reponse_user,
    state.reponse,
    state.answer,
    question.reponse_apprenant,
    question.reponseApprenant,
    question.reponseUtilisateur,
    question.reponse_user,
    question.reponse,
    question.answer,
    resultats?.reponseUtilisateur,
    resultats?.reponseApprenant,
    resultats?.reponse_apprenant,
    resultats?.reponse_user,
    resultats?.reponse,
    resultats?.answer,
  ];

  for (const candidate of candidates) {
    const texte =
      convertirEnTexte(
        candidate
      ).trim();

    if (texte) {
      return texte;
    }
  }

  return "";
}

function rechercherBonneReponse(
  state: LocationState,
  question: QuestionContext,
  resultats:
    | ResultatsContext
    | null
    | undefined
): string {
  const candidates = [
    state.bonneReponse,
    state.bonne_reponse,
    state.reponse_attendue,
    question.bonne_reponse,
    question.bonneReponse,
    question.reponse_attendue,
    resultats?.bonneReponse,
    resultats?.bonne_reponse,
    resultats?.reponse_attendue,
  ];

  for (const candidate of candidates) {
    const texte =
      convertirEnTexte(
        candidate
      ).trim();

    if (texte) {
      return texte;
    }
  }

  return "";
}

function rechercherBonneReponseLettre(
  state: LocationState,
  question: QuestionContext,
  resultats:
    | ResultatsContext
    | null
    | undefined
): string {
  const candidates = [
    state.bonne_reponse_lettre,
    state.bonneReponseLettre,
    question.bonne_reponse_lettre,
    question.bonneReponseLettre,
    resultats?.bonne_reponse_lettre,
    resultats?.bonneReponseLettre,
  ];

  for (const candidate of candidates) {
    const texte =
      convertirEnTexte(
        candidate
      ).trim();

    if (texte) {
      return normaliserLettre(
        texte
      );
    }
  }

  return "";
}

/* ========================================================
   COMPOSANT
======================================================== */

export default function ExplicationQuestion() {
  const location =
    useLocation();

  const navigate =
    useNavigate();

  const state = useMemo(
    () =>
      (location.state ||
        {}) as LocationState,
    [location.state]
  );

  /* ======================================================
     DEBUG
  ====================================================== */

  useEffect(() => {
    console.log(
      "=============================================="
    );

    console.log(
      "CODE — CONTEXTE ExplicationQuestion"
    );

    console.log(
      "location.state :",
      state
    );

    console.log(
      "question :",
      state.question
    );

    console.log(
      "questionActuelle :",
      state.questionActuelle
    );

    console.log(
      "resultats :",
      state.resultats
    );

    console.log(
      "réponse apprenant brute :",
      state.reponseUtilisateur ??
        state.reponseApprenant ??
        state.reponse_apprenant ??
        state.reponse_user ??
        state.reponse ??
        state.answer
    );

    console.log(
      "bonne réponse brute :",
      state.bonneReponse ??
        state.bonne_reponse ??
        state.reponse_attendue
    );

    console.log(
      "=============================================="
    );
  }, [state]);

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

    return () =>
      observer.disconnect();
  }, []);

  /* ======================================================
     QUESTION
  ====================================================== */

  const question =
    useMemo<QuestionContext>(
      () =>
        state.questionActuelle ||
        state.question || {
          question: "",
        },
      [
        state.questionActuelle,
        state.question,
      ]
    );

  const resultats =
    state.resultats ?? null;

  const texteQuestion =
    convertirEnTexte(
      question.question ??
        resultats?.question ??
        ""
    );

  /* ======================================================
     CHOIX
  ====================================================== */

  const choix =
    useMemo(() => {
      return obtenirChoix(
        question
      );
    }, [question]);

  /* ======================================================
     RÉPONSE APPRENANT
  ====================================================== */

  const reponseApprenantBrute =
    useMemo(
      () =>
        rechercherReponseApprenant(
          state,
          question,
          resultats
        ),
      [
        state,
        question,
        resultats,
      ]
    );

  const reponseApprenant =
    useMemo(() => {
      if (
        !reponseApprenantBrute
      ) {
        return "";
      }

      if (
        estLettreReponse(
          reponseApprenantBrute
        ) &&
        choix.length > 0
      ) {
        return lettreVersChoix(
          reponseApprenantBrute,
          choix
        );
      }

      return reponseApprenantBrute;
    }, [
      reponseApprenantBrute,
      choix,
    ]);

  /* ======================================================
     BONNE RÉPONSE
  ====================================================== */

  const bonneReponseBrute =
    useMemo(
      () =>
        rechercherBonneReponse(
          state,
          question,
          resultats
        ),
      [
        state,
        question,
        resultats,
      ]
    );

  const bonneReponseLettre =
    useMemo(
      () =>
        rechercherBonneReponseLettre(
          state,
          question,
          resultats
        ),
      [
        state,
        question,
        resultats,
      ]
    );

  const bonneReponse =
    useMemo(() => {
      if (
        bonneReponseBrute
      ) {
        if (
          estLettreReponse(
            bonneReponseBrute
          ) &&
          choix.length > 0
        ) {
          return lettreVersChoix(
            bonneReponseBrute,
            choix
          );
        }

        return bonneReponseBrute;
      }

      if (
        bonneReponseLettre &&
        choix.length > 0
      ) {
        return lettreVersChoix(
          bonneReponseLettre,
          choix
        );
      }

      return "";
    }, [
      bonneReponseBrute,
      bonneReponseLettre,
      choix,
    ]);

  /* ======================================================
     NOTION
  ====================================================== */

  const notion =
    convertirEnTexte(
      state.notion ??
        question.notion
    );

  /* ======================================================
     MATIÈRE
  ====================================================== */

  const matiere =
    useMemo(() => {
      const valeur =
        state.matiereActuelle ??
        state.matiere ??
        question.matiere ??
        resultats?.matiere ??
        "";

      return normaliserMatiere(
        valeur
      );
    }, [
      state.matiereActuelle,
      state.matiere,
      question.matiere,
      resultats?.matiere,
    ]);

  /* ======================================================
     NIVEAU
  ====================================================== */

  const niveau =
    useMemo(() => {
      const valeur =
        state.niveauActuel ??
        state.niveau ??
        question.niveau ??
        resultats?.niveau ??
        "";

      return normaliserNiveau(
        valeur
      );
    }, [
      state.niveauActuel,
      state.niveau,
      question.niveau,
      resultats?.niveau,
    ]);

  /* ======================================================
     CLASSE
  ====================================================== */

  const classe =
    convertirEnTexte(
      state.classe ??
        question.classe ??
        resultats?.classe ??
        niveau
    );

  /* ======================================================
     SÉRIE
  ====================================================== */

  const serie =
    useMemo(() => {
      const valeur =
        state.serieActuelle ??
        state.serie ??
        question.serie ??
        resultats?.serie ??
        "";

      return normaliserSerie(
        valeur
      );
    }, [
      state.serieActuelle,
      state.serie,
      question.serie,
      resultats?.serie,
    ]);

  const seriePourAPI =
    serie || "none";

  /* ======================================================
     CORRECTION
  ====================================================== */

  const correcte =
    useMemo(() => {
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
        typeof resultats?.correcte ===
        "boolean"
      ) {
        return resultats.correcte;
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

      if (
        reponseApprenantBrute &&
        bonneReponseLettre &&
        estLettreReponse(
          reponseApprenantBrute
        )
      ) {
        return (
          normaliserLettre(
            reponseApprenantBrute
          ) ===
          normaliserLettre(
            bonneReponseLettre
          )
        );
      }

      return false;
    }, [
      state.correcte,
      question.correcte,
      resultats?.correcte,
      reponseApprenant,
      bonneReponse,
      reponseApprenantBrute,
      bonneReponseLettre,
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
  ] =
    useState(false);

  const [
    teacherError,
    setTeacherError,
  ] =
    useState<string | null>(
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
          setTeacherProfile(
            null
          );
          return;
        }

        setTeacherLoading(
          true
        );

        setTeacherError(
          null
        );

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
            setTeacherLoading(
              false
            );
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
      if (
        teacherProfileUrl
      ) {
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
     VIDÉO DE REMÉDIATION — ÉTAT
  ====================================================== */

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
  ] =
    useState(false);

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
  ] =
    useState<
      "video" | "questions" | "termine"
    >("video");

  const [
    videoQuestionIndex,
    setVideoQuestionIndex,
  ] =
    useState(0);

  const [
    videoReponses,
    setVideoReponses,
  ] =
    useState<
      Record<string, string>
    >({});

  const [
    videoQuestionValidee,
    setVideoQuestionValidee,
  ] =
    useState(false);

  const [
    videoQuestionCorrecte,
    setVideoQuestionCorrecte,
  ] =
    useState<boolean | null>(
      null
    );

  /* ======================================================
     QUESTION VIDÉO ACTUELLE
  ====================================================== */

  const videoQuestionActuelle =
    videoSelectionnee?.questions?.[
      videoQuestionIndex
    ] ?? null;

  const videoScore =
    useMemo(() => {
      if (
        !videoSelectionnee
      ) {
        return 0;
      }

      return videoSelectionnee.questions.reduce(
        (
          total,
          questionVideo
        ) => {
          const reponse =
            videoReponses[
              questionVideo.id
            ] ?? "";

          if (
            normaliserTexte(
              reponse
            ) ===
            normaliserTexte(
              questionVideo.bonne_reponse
            )
          ) {
            return total + 1;
          }

          return total;
        },
        0
      );
    }, [
      videoSelectionnee,
      videoReponses,
    ]);

  /* ======================================================
     SAISIE IA
  ====================================================== */

  const [
    texteSaisi,
    setTexteSaisi,
  ] = useState("");

  /* ======================================================
     RÉFÉRENCE POUR LA FIN DE CONVERSATION
  ====================================================== */

  const finConversationRef =
    useRef<HTMLDivElement | null>(
      null
    );

  /* ======================================================
     SCROLL AUTOMATIQUE
  ====================================================== */

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

  /* ======================================================
     BLOQUER LE SCROLL DE LA PAGE
  ====================================================== */

  useEffect(() => {
    if (!fenetreActive) {
      return;
    }

    const ancienOverflow =
      document.body.style.overflow;

    const ancienPaddingRight =
      document.body.style.paddingRight;

    const largeurAvant =
      window.innerWidth -
      document.documentElement
        .clientWidth;

    document.body.style.overflow =
      "hidden";

    if (largeurAvant > 0) {
      document.body.style.paddingRight =
        `${largeurAvant}px`;
    }

    return () => {
      document.body.style.overflow =
        ancienOverflow;

      document.body.style.paddingRight =
        ancienPaddingRight;
    };
  }, [fenetreActive]);

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
        matiere,
        niveau,
        serie:
          seriePourAPI,
        question:
          texteQuestion,
        choix,
        reponse_apprenant:
          reponseApprenant,
        reponse_apprenant_brute:
          reponseApprenantBrute,
        bonne_reponse:
          bonneReponse,
        bonne_reponse_lettre:
          bonneReponseLettre,
        notion,
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

      console.log(
        "CODE IA — payload envoyé :",
        payload
      );

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
        let detailsTechniques =
          "";

        try {
          detailsTechniques =
            await response.text();
        } catch {
          detailsTechniques =
            "";
        }

        console.error(
          "Erreur API CODE IA :",
          response.status,
          detailsTechniques
        );

        throw new Error(
          `CODE_IA_API_${response.status}`
        );
      }

      const resultat =
        (await response.json()) as ReponseGemini;

      if (
        !resultat ||
        typeof resultat.message !==
          "string"
      ) {
        console.error(
          "Réponse IA invalide :",
          resultat
        );

        throw new Error(
          "CODE_IA_RESPONSE_INVALID"
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
      contenu: string,
      modeUtilise?: ModeIA,
      etapeUtilisee?: EtapePedagogique
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
            nouveauxMessages,
            modeUtilise ?? mode,
            etapeUtilisee ?? etape
          );

        traiterReponseGemini(
          resultat
        );
      } catch (error) {
        console.error(
          "CODE IA - erreur technique :",
          error
        );

        const messageErreur =
          "CODE IA est momentanément indisponible pour les explications avancées. Tu peux continuer ton apprentissage et réessayer un peu plus tard.";

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

  const executerAction =
    async (
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

      const nouvelleEtape =
        etapes[action];

      setEtape(
        nouvelleEtape
      );

      await envoyerMessage(
        actions[action],
        mode,
        nouvelleEtape
      );
    };

  /* ======================================================
     CHANGEMENT DE MODE
  ====================================================== */

  const changerMode =
    async (
      nouveauMode: ModeIA
    ) => {
      if (
        iaEnCours ||
        nouveauMode === mode
      ) {
        return;
      }

      let message = "";

      let nouvelleEtape: EtapePedagogique =
        "raisonnement";

      if (
        nouveauMode ===
        "comprendre"
      ) {
        nouvelleEtape =
          "raisonnement";

        message =
          "Je veux comprendre cette question en profondeur. Guide-moi dans le raisonnement sans simplement donner la réponse.";
      }

      if (
        nouveauMode ===
        "corriger"
      ) {
        nouvelleEtape =
          "diagnostic";

        message =
          "Analyse mon raisonnement, identifie précisément mon erreur éventuelle et aide-moi à la corriger.";
      }

      if (
        nouveauMode ===
        "approfondir"
      ) {
        nouvelleEtape =
          "approfondissement";

        message =
          "Je veux approfondir cette notion avec des exemples, des variantes et des applications.";
      }

      setMode(
        nouveauMode
      );

      setEtape(
        nouvelleEtape
      );

      await envoyerMessage(
        message,
        nouveauMode,
        nouvelleEtape
      );
    };

  /* ======================================================
     RECOMMENCER
  ====================================================== */

  const recommencer =
    () => {
      const connue =
        solutionConnueAuDepart;

      const nouveauMode: ModeIA =
        connue
          ? "comprendre"
          : "corriger";

      const nouvelleEtape: EtapePedagogique =
        connue
          ? "raisonnement"
          : "accueil";

      setMode(
        nouveauMode
      );

      setEtape(
        nouvelleEtape
      );

      setSolutionRevelee(
        connue
      );

      setDiagnostic({
        niveauConfiance:
          connue ? 40 : 20,

        tentative: 1,

        niveauAide: 0,

        erreurIdentifiee:
          null,

        notionsMaitrisees:
          [],

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

      setErreurAPI(
        null
      );

      setTexteSaisi("");

      setFenetreActive(
        null
      );
    };

  /* ======================================================
     VIDÉO — OUVRIR ET RECHERCHER
  ====================================================== */

  const ouvrirFenetreVideo =
    async () => {
      if (videoLoading) {
        return;
      }

      setFenetreActive(
        "video"
      );

      setVideoLoading(
        true
      );

      setVideoError(
        null
      );

      setVideoSelectionnee(
        null
      );

      setVideoEtape(
        "video"
      );

      setVideoQuestionIndex(
        0
      );

      setVideoReponses(
        {}
      );

      setVideoQuestionValidee(
        false
      );

      setVideoQuestionCorrecte(
        null
      );

      if (!notion) {
        setVideoError(
          "La notion de la question actuelle n'est pas disponible. CODE ne peut pas rechercher une vidéo de remédiation."
        );

        setVideoLoading(
          false
        );

        return;
      }

      if (!niveau) {
        setVideoError(
          "Le niveau de la question actuelle n'est pas disponible."
        );

        setVideoLoading(
          false
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

        const data =
          response.data;

        const videosBrutes =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.videos
              )
            ? data.videos
            : [];

        const videos =
          videosBrutes.filter(
            (
              video: unknown
            ): video is RemediationVideo => {
              if (
                !video ||
                typeof video !==
                  "object"
              ) {
                return false;
              }

              const objet =
                video as Record<
                  string,
                  unknown
                >;

              return (
                typeof objet.id ===
                  "string" &&
                Array.isArray(
                  objet.questions
                )
              );
            }
          );

        const notionNormalisee =
          normaliserTexte(
            notion
          );

        /*
         * CRITÈRE PRINCIPAL :
         *
         * La vidéo doit contenir AU MOINS
         * UNE question dont la notion
         * correspond à la notion de la
         * question actuelle.
         */
        const candidats = videos.filter((video: RemediationVideo) => {
  if (!Array.isArray(video.questions)) {
    return false;
  }

  return video.questions.some(
    (questionVideo: RemediationVideoQuestion) => {
      const notionQuestion = normaliserTexte(
        questionVideo.notion ?? ""
      );

      return (
        notionQuestion === notionNormalisee
      );
    }
  );
});

        const videoTrouvee =
          candidats[0] ??
          null;

        if (!videoTrouvee) {
          setVideoError(
            `Aucune vidéo de remédiation ne contient une question correspondant à la notion « ${notion} ».`
          );

          return;
        }

        /*
         * On conserve TOUTES les questions
         * de la vidéo.
         *
         * La notion sert uniquement à
         * sélectionner la vidéo.
         */
        setVideoSelectionnee(
          videoTrouvee
        );
      } catch (error) {
        console.error(
          "Erreur recherche vidéo de remédiation :",
          error
        );

        setVideoError(
          "Impossible de charger les vidéos de remédiation. Vérifie que le serveur CODE est accessible."
        );
      } finally {
        setVideoLoading(
          false
        );
      }
    };

  /* ======================================================
     VIDÉO — RÉPONDRE À UNE QUESTION
  ====================================================== */

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
          [videoQuestionActuelle.id]:
            reponse,
        })
      );
    };

  /* ======================================================
     VIDÉO — VALIDER UNE QUESTION
  ====================================================== */

  const validerQuestionVideo =
    () => {
      if (
        !videoQuestionActuelle
      ) {
        return;
      }

      const reponse =
        videoReponses[
          videoQuestionActuelle.id
        ] ?? "";

      if (!reponse) {
        return;
      }

      const estCorrecte =
        normaliserTexte(
          reponse
        ) ===
        normaliserTexte(
          videoQuestionActuelle.bonne_reponse
        );

      setVideoQuestionCorrecte(
        estCorrecte
      );

      setVideoQuestionValidee(
        true
      );
    };

  /* ======================================================
     VIDÉO — QUESTION SUIVANTE
  ====================================================== */

  const passerQuestionVideo =
    () => {
      if (
        !videoSelectionnee ||
        !videoQuestionActuelle ||
        !videoQuestionValidee
      ) {
        return;
      }

      const derniereQuestion =
        videoQuestionIndex >=
        videoSelectionnee.questions.length -
          1;

      if (derniereQuestion) {
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
        null
      );
    };

  /* ======================================================
     VIDÉO — RECOMMENCER LES QUESTIONS
  ====================================================== */

  const recommencerQuestionsVideo =
    () => {
      setVideoEtape(
        "questions"
      );

      setVideoQuestionIndex(
        0
      );

      setVideoReponses(
        {}
      );

      setVideoQuestionValidee(
        false
      );

      setVideoQuestionCorrecte(
        null
      );
    };

  /* ======================================================
     PROGRESSION
  ====================================================== */

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

  const envoyerTexteSaisi =
    async () => {
      const texte =
        texteSaisi.trim();

      if (
        !texte ||
        iaEnCours
      ) {
        return;
      }

      setTexteSaisi("");

      await envoyerMessage(
        texte
      );
    };

  const gererTouche = (
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
     OUVERTURE DES FENÊTRES
  ====================================================== */

  const ouvrirFenetre =
    (
      fenetre: Exclude<
        FenetreActive,
        null
      >
    ) => {
      setFenetreActive(
        fenetre
      );
    };

  const fermerFenetre =
    () => {
      if (
        iaEnCours
      ) {
        return;
      }

      setFenetreActive(
        null
      );
    };

  /* ======================================================
     PORTAIL
  ====================================================== */

  const portail = (
    contenu: React.ReactNode
  ) => {
    if (
      typeof document ===
      "undefined"
    ) {
      return null;
    }

    return createPortal(
      contenu,
      document.body
    );
  };

  /* ======================================================
     FENÊTRE CLASSIQUE
  ====================================================== */

  const fenetreClassique =
    fenetreActive &&
    fenetreActive !==
      "ia"
      ? portail(
          <div
            className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-6"
            onClick={
              fermerFenetre
            }
          >
            <div
              className={`${surfaceClass} my-4 flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border shadow-2xl sm:my-6 sm:max-h-[calc(100dvh-3rem)]`}
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
            >
              {/* EN-TÊTE */}

              <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
                <div className="flex min-w-0 items-center gap-3">
                  {fenetreActive ===
                    "actions" && (
                    <ListChecks
                      size={20}
                      className="shrink-0 text-blue-600"
                    />
                  )}

                  {fenetreActive ===
                    "question" && (
                    <CircleHelp
                      size={20}
                      className="shrink-0 text-blue-600"
                    />
                  )}

                  {fenetreActive ===
                    "parcours" && (
                    <Route
                      size={20}
                      className="shrink-0 text-blue-600"
                    />
                  )}

                  {fenetreActive ===
                    "diagnostic" && (
                    <BarChart3
                      size={20}
                      className="shrink-0 text-blue-600"
                    />
                  )}

                  {fenetreActive ===
                    "objectif" && (
                    <Target
                      size={20}
                      className="shrink-0 text-blue-600"
                    />
                  )}

                  {fenetreActive ===
                    "enseignant" && (
                    <GraduationCap
                      size={20}
                      className="shrink-0 text-blue-600"
                    />
                  )}

                  {fenetreActive ===
                    "video" && (
                    <Video
                      size={20}
                      className="shrink-0 text-blue-600"
                    />
                  )}

                  <h3 className="truncate font-bold">
                    {fenetreActive ===
                      "actions" &&
                      "Types de questions et aides"}

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
                      "video" &&
                      "Vidéo de remédiation"}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={
                    fermerFenetre
                  }
                  className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Fermer"
                >
                  <X
                    size={20}
                  />
                </button>
              </div>

              {/* CONTENU */}

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">

                {/* ==================================================
                    ACTIONS
                ================================================== */}

                {fenetreActive ===
                  "actions" && (
                  <div className="space-y-3">
                    <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                      Choisis ce que tu veux faire avec cette question.
                    </p>

                    {[
                      {
                        action:
                          "autrement" as ActionRapide,
                        icon: (
                          <MessageCircle className="shrink-0 text-blue-600" />
                        ),
                        titre:
                          "Explique autrement",
                        texte:
                          "Une autre explication plus simple.",
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
                          "Un indice progressif sans donner directement la solution.",
                      },
                      {
                        action:
                          "similaire" as ActionRapide,
                        icon: (
                          <RotateCcw className="shrink-0 text-green-600" />
                        ),
                        titre:
                          "Question similaire",
                        texte:
                          "Vérifier si la méthode est réellement comprise.",
                      },
                      {
                        action:
                          "difficile" as ActionRapide,
                        icon: (
                          <Brain className="shrink-0 text-purple-600" />
                        ),
                        titre:
                          "Question plus difficile",
                        texte:
                          "Aller plus loin avec le même raisonnement.",
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
                    VIDÉO DE REMÉDIATION
                ================================================== */}

                {fenetreActive ===
                  "video" && (
                  <div className="space-y-5">

                    {/* CHARGEMENT */}

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

                    {/* ERREUR */}

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

                    {/* ==================================================
                        VIDÉO
                    ================================================== */}

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

                    {/* ==================================================
                        QUESTIONS
                    ================================================== */}

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
                                    videoQuestionActuelle.id
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
                                  videoQuestionActuelle.id
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

                    {/* ==================================================
                        RÉSULTAT FINAL
                    ================================================== */}

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
            {/* EN-TÊTE IA */}

            <header
              className={`shrink-0 border-b ${
                darkMode
                  ? "border-gray-800 bg-gray-950"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-3 py-3 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
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
                      size={22}
                    />
                  </button>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    <Brain
                      size={21}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="font-bold">
                      CODE IA
                    </p>

                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      Ton accompagnateur pédagogique
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <div className="hidden items-center gap-1 sm:flex">
                    {matiere && (
                      <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                        {matiere.toUpperCase()}
                      </span>
                    )}

                    {niveau && (
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {niveau}
                      </span>
                    )}

                    {serie && (
                      <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-[11px] font-semibold text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                        {serie}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={
                      recommencer
                    }
                    disabled={
                      iaEnCours
                    }
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
              </div>
            </header>

            {/* CORPS IA */}

            <div className="min-h-0 flex-1 overflow-hidden">
              <div className="mx-auto flex h-full w-full max-w-7xl flex-col">
                {/* CONTEXTE QUESTION */}

                <div className="shrink-0 border-b border-gray-200 px-3 py-3 dark:border-gray-800 sm:px-6">
                  <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-900">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <CircleHelp
                        size={14}
                        className="text-gray-500"
                      />

                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Question étudiée
                      </span>

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
                          Série{" "}
                          {serie}
                        </span>
                      )}
                    </div>

                    <p className="line-clamp-2 text-sm font-medium">
                      {texteQuestion ||
                        "Question non disponible"}
                    </p>

                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="rounded-lg bg-blue-50 p-2.5 dark:bg-blue-900/20">
                        <p className="text-[10px] font-semibold uppercase text-blue-600 dark:text-blue-400">
                          Réponse de l'apprenant
                        </p>

                        <p className="mt-1 text-xs font-medium">
                          {reponseApprenant ||
                            "Non disponible"}
                        </p>
                      </div>

                      <div className="rounded-lg bg-green-50 p-2.5 dark:bg-green-900/20">
                        <p className="text-[10px] font-semibold uppercase text-green-600 dark:text-green-400">
                          Réponse attendue
                        </p>

                        <p className="mt-1 text-xs font-medium">
                          {solutionRevelee
                            ? bonneReponse ||
                              "Non disponible"
                            : "Non révélée pour le moment"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MODES IA */}

                <div className="shrink-0 border-b border-gray-200 px-3 py-3 dark:border-gray-800 sm:px-6">
                  <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-2 sm:grid-cols-3">
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
                      className={`rounded-xl border p-3 text-left transition ${
                        mode ===
                        "comprendre"
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
                      disabled={
                        iaEnCours
                      }
                      className={`rounded-xl border p-3 text-left transition ${
                        mode ===
                        "corriger"
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
                      disabled={
                        iaEnCours
                      }
                      className={`rounded-xl border p-3 text-left transition ${
                        mode ===
                        "approfondir"
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
                </div>

                {/* CONVERSATION */}

                <div
                  className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-5 sm:px-6"
                  style={{
                    scrollbarWidth:
                      "thin",
                  }}
                >
                  <div className="mx-auto w-full max-w-6xl space-y-5">
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
                              className={`w-fit max-w-[96%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm sm:max-w-[88%] lg:max-w-[82%] ${
                                estEleve
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                              }`}
                            >
                              <div
                                className={`mb-2 flex items-center gap-2 text-xs font-semibold ${
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
                        <div className="max-w-[96%] rounded-2xl bg-gray-100 px-5 py-4 text-sm text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-400">
                          <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
                            <Brain
                              size={14}
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
                  <div className="shrink-0 px-3 pb-2 sm:px-6">
                    <div className="mx-auto max-w-6xl rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                      {
                        erreurAPI
                      }
                    </div>
                  </div>
                )}

                {/* ZONE DE SAISIE */}

                <div className="shrink-0 border-t border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950 sm:p-4">
                  <div className="mx-auto w-full max-w-6xl">
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
                        rows={3}
                        placeholder="Écris ta question ou explique ton raisonnement à CODE IA..."
                        className="min-h-[72px] min-w-0 flex-1 resize-none rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900"
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
                        className="flex h-[72px] w-[58px] shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Envoyer"
                      >
                        <Send
                          size={20}
                        />
                      </button>
                    </div>

                    <p className="mt-2 text-center text-[11px] text-gray-400">
                      Entrée pour envoyer · Maj + Entrée pour une nouvelle ligne
                    </p>
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="shrink-0 border-t border-gray-200 bg-gray-50 px-3 py-3 dark:border-gray-800 dark:bg-gray-900/70 sm:px-6">
                  <div className="mx-auto w-full max-w-6xl">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Actions rapides
                    </p>

                    <div className="flex gap-2 overflow-x-auto overscroll-contain pb-1">
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
                        className="flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold transition hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                      >
                        <MessageCircle
                          size={15}
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
                        className="flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold transition hover:border-yellow-400 hover:bg-yellow-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                      >
                        <Lightbulb
                          size={15}
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
                        className="flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold transition hover:border-green-400 hover:bg-green-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                      >
                        <RotateCcw
                          size={15}
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
                        className="flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold transition hover:border-purple-400 hover:bg-purple-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                      >
                        <Brain
                          size={15}
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
                        className="flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold transition hover:border-orange-400 hover:bg-orange-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                      >
                        <Sparkles
                          size={15}
                        />

                        Application
                      </button>
                    </div>
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
                reponseApprenantBrute !==
                  reponseApprenant && (
                  <p className="mt-1 text-xs text-gray-400">
                    Réponse enregistrée :{" "}
                    {
                      reponseApprenantBrute
                    }
                  </p>
                )}

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

              {/* ==================================================
                  VIDÉO
              ================================================== */}

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