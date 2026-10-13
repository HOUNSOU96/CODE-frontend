// 📁 Resultats.tsx

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import api from "@/utils/axios";

import {
  getOfflineData,
  saveOfflineData,
  STORES,
} from "@/offline/offlineDB";

import {
  trierNotionsNonAcquises,
} from "../../../../data/utils/notions";

import { useAuth } from "../../../../hooks/useAuth";

import DarkModeToggle from "@/components/DarkModeToggle";
import AudioManager from "@/components/AudioManager";

import {
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Download,
  GraduationCap,
  Loader2,
  Mail,
  QrCode,
  RefreshCw,
  Sparkles,
  Target,
  User,
  ArrowRight,
  AlertCircle,
  FileText,
  Send,
  ShieldCheck,
  WifiOff,
} from "lucide-react";

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "react-qr-code";

// ============================================================
// ANIMATION CODE
// ============================================================

const mots = [
  "BIENVENU",
  "SUR",
  "CODE",
];

const couleurs = [
  "#00FF00",
  "#FFFF00",
  "#FF0000",
];

// ============================================================
// COULEURS DES MENTIONS
// ============================================================

const mentionColors: Record<string, string> = {
  Excellente:
    "bg-emerald-600 text-white border-emerald-500 dark:bg-emerald-500 dark:border-emerald-400",

  "Très Bien":
    "bg-emerald-500 text-white border-emerald-400 dark:bg-emerald-500 dark:border-emerald-400",

  Bien:
    "bg-blue-500 text-white border-blue-400 dark:bg-blue-500 dark:border-blue-400",

  "Assez Bien":
    "bg-yellow-400 text-gray-900 border-yellow-300 dark:bg-yellow-400 dark:text-gray-900 dark:border-yellow-300",

  Passable:
    "bg-orange-500 text-white border-orange-400 dark:bg-orange-500 dark:border-orange-400",

  Insuffisant:
    "bg-red-600 text-white border-red-500 dark:bg-red-600 dark:border-red-500",
};

// ============================================================
// TYPES
// ============================================================

type ResultatType = {
  note: number;
  mention: string;

  matiere?: string;
  niveau?: string;
  serie?: string | null;

  notionsNonAcquises?: string[];
  notions_non_acquises?: string[];

  nbQuestions?: number;
  nbBonnesReponses?: number;

  questionsRemediation?: any[];
  questions_remediation?: any[];

  [key: string]: any;
};

type ResultatsLocationState = {
  resultats?: ResultatType;

  questionsRemediation?: any[];
  questionsDuTest?: any[];
  reponsesDuTest?: any[];

  notionsNonAcquises?: string[];

  matiereActuelle?: string;
  niveauActuel?: string;
  serieActuelle?: string;

  testId?: string;

  offline?: boolean;
  pendingSync?: boolean;

  [key: string]: any;
};

// ============================================================
// RÉSULTAT MIS EN CACHE HORS LIGNE
// ============================================================

type CachedResult = {
  id: string;

  resultats: ResultatType;

  questionsRemediation: any[];

  questionsDuTest: any[];

  reponsesDuTest: any[];

  notionsNonAcquises: string[];

  matiereActuelle: string;

  niveauActuel: string;

  serieActuelle: string;

  testId?: string;

  offline?: boolean;

  pendingSync?: boolean;

  cachedAt: number;
};

// ============================================================
// COMPOSANT
// ============================================================

const Resultats: React.FC = () => {
  const location = useLocation();

  const {
    matiere,
    niveau,
    serie,
  } = useParams<{
    matiere: string;
    niveau: string;
    serie: string;
  }>();

  const navigate = useNavigate();

  // ==========================================================
  // RÉFÉRENCES
  // ==========================================================

  const resultRef =
    useRef<HTMLDivElement>(null);

  const sentPDF =
    useRef(false);

  // ==========================================================
  // AUTHENTIFICATION
  // ==========================================================

  const {
    user: apprenant,
    token,
    loading: loadingAuth,
  } = useAuth();

  // ==========================================================
  // STATE
  // ==========================================================

  const state =
    (location.state || {}) as ResultatsLocationState;

  const [resultats, setResultats] =
    useState<ResultatType | null>(
      state.resultats ?? null
    );

  const [loadingResult, setLoadingResult] =
    useState(!state.resultats);

  const [error, setError] =
    useState<string | null>(null);

  const [sending, setSending] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [motActuel, setMotActuel] =
    useState(0);

  const [orActif, setOrActif] =
    useState(false);

  const [isOffline, setIsOffline] =
    useState(
      typeof navigator !== "undefined"
        ? !navigator.onLine
        : false
    );

  const [pendingSync, setPendingSync] =
    useState(
      Boolean(state.pendingSync)
    );

  // ==========================================================
  // DONNÉES TRANSMISES PAR QUESTIONS
  // ==========================================================

  const questionsRemediation =
    state.questionsRemediation ??
    state.resultats?.questionsRemediation ??
    state.resultats?.questions_remediation ??
    [];

  const questionsDuTest =
    state.questionsDuTest ?? [];

  const reponsesDuTest =
    state.reponsesDuTest ?? [];

  // ==========================================================
  // NIVEAUX
  // ==========================================================

  const niveauxCollege = [
    "6e",
    "5e",
    "4e",
    "3e",
  ];

  // ==========================================================
  // DONNÉES PRINCIPALES
  // ==========================================================

  const matiereActuelle =
    matiere ||
    state.matiereActuelle ||
    resultats?.matiere ||
    "";

  const niveauActuel =
    niveau ||
    state.niveauActuel ||
    resultats?.niveau ||
    "";

  const serieActuelle =
    serie ||
    state.serieActuelle ||
    resultats?.serie ||
    "none";

  const serieNormalisee =
    serieActuelle &&
    serieActuelle.toLowerCase() !== "none"
      ? serieActuelle.toLowerCase()
      : "none";

  // ==========================================================
  // CLÉ DU CACHE DU RÉSULTAT
  // ==========================================================

  const resultCacheId = [
    "latest_result",
    matiereActuelle
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9]+/g,
        "_"
      )
      .replace(
        /^_+|_+$/g,
        "" 
      ) || "none",

    niveauActuel
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9]+/g,
        "_"
      )
      .replace(
        /^_+|_+$/g,
        ""
      ) || "none",

    serieNormalisee
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9]+/g,
        "_"
      )
      .replace(
        /^_+|_+$/g,
        ""
      ) || "none",
  ].join("_");

  // ==========================================================
  // MATIÈRE
  // ==========================================================

  const formatMatiere = (
    value?: string
  ) => {
    if (!value) {
      return "Évaluation";
    }

    const labels: Record<string, string> = {
      maths: "Mathématiques",
      mathematiques: "Mathématiques",
      francais: "Français",
      anglais: "Anglais",
      pct: "Physique-Chimie",
      physiquechimie: "Physique-Chimie",
      svt: "Sciences de la Vie et de la Terre",
      histoire: "Histoire",
      geographie: "Géographie",
      programmation: "Programmation",
      informatique: "Informatique",
      volleyball: "Volleyball",
      football: "Football",
    };

    const normalized =
      value
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          ""
        )
        .toLowerCase()
        .replace(
          /[-_]/g,
          ""
        );

    if (labels[normalized]) {
      return labels[normalized];
    }

    return value
      .replace(/-/g, " ")
      .replace(/_/g, " ")
      .replace(
        /\b\w/g,
        (c) => c.toUpperCase()
      );
  };

  const matiereLabel =
    formatMatiere(
      matiereActuelle
    );

  // ==========================================================
  // NIVEAU
  // ==========================================================

  const normalizeNiveau = (
    value?: string
  ) => {
    if (!value) {
      return "";
    }

    const normalized =
      value
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          ""
        )
        .toLowerCase()
        .trim();

    const mapping: Record<string, string> = {
      "6eme": "6e",
      "5eme": "5e",
      "4eme": "4e",
      "3eme": "3e",
      "2nde": "2nde",
      seconde: "2nde",
      "1ere": "1ere",
      "1re": "1ere",
      premiere: "1ere",
      terminale: "tle",
      tle: "tle",
    };

    return (
      mapping[normalized] ??
      normalized
    );
  };

  const niveauNormalise =
    normalizeNiveau(
      niveauActuel
    );

  const formatNiveau = (
    value?: string
  ) => {
    const normalized =
      normalizeNiveau(value);

    const labels: Record<string, string> = {
      "6e": "6e",
      "5e": "5e",
      "4e": "4e",
      "3e": "3e",
      "2nde": "2nde",
      "1ere": "1ère",
      tle: "Terminale",
    };

    return (
      labels[normalized] ??
      value ??
      ""
    );
  };

  const niveauComplet =
    niveauxCollege.includes(
      niveauNormalise
    )
      ? formatNiveau(
          niveauActuel
        )
      : `${formatNiveau(
          niveauActuel
        )}${
          serieNormalisee !==
          "none"
            ? ` — Série ${serieNormalisee.toUpperCase()}`
            : ""
        }`;

  // ==========================================================
  // CHARGEMENT DU RÉSULTAT
  // PRIORITÉ :
  // 1. location.state
  // 2. IndexedDB
  // 3. API si Internet disponible
  // ==========================================================

  useEffect(() => {
    if (resultats) {
      setLoadingResult(false);
      return;
    }

    if (
      !matiereActuelle ||
      !niveauActuel
    ) {
      setLoadingResult(false);

      if (isOffline) {
        setError(
          "Impossible de récupérer ce résultat hors ligne : les informations nécessaires ne sont pas disponibles localement."
        );
      }

      return;
    }

    let cancelled = false;

    const loadResult =
      async () => {
        setLoadingResult(true);

        // ------------------------------------------------------
        // 1. TENTATIVE INDEXEDDB
        // ------------------------------------------------------

        try {
          const cached =
            await getOfflineData<CachedResult>(
              STORES.results,
              resultCacheId
            );

          if (
            cancelled
          ) {
            return;
          }

          if (cached?.resultats) {
            console.log(
              "📦 Résultat récupéré depuis IndexedDB :",
              cached
            );

            setResultats(
              cached.resultats
            );

            setPendingSync(
              Boolean(
                cached.pendingSync
              )
            );

            setError(null);

            setSuccess(
              "Résultat récupéré depuis cet appareil."
            );

            setLoadingResult(
              false
            );

            return;
          }
        } catch (offlineError) {
          console.warn(
            "⚠️ Impossible de lire le résultat depuis IndexedDB :",
            offlineError
          );
        }

        // ------------------------------------------------------
        // 2. SI HORS LIGNE ET ABSENT DU CACHE
        // ------------------------------------------------------

        if (
          isOffline ||
          !navigator.onLine
        ) {
          if (!cancelled) {
            setError(
              "Ce résultat n'est pas disponible hors ligne sur cet appareil."
            );

            setLoadingResult(
              false
            );
          }

          return;
        }

        // ------------------------------------------------------
        // 3. RÉCUPÉRATION SERVEUR
        // ------------------------------------------------------

        if (!token) {
          if (!cancelled) {
            setError(
              "Connectez-vous à Internet pour récupérer ce résultat."
            );

            setLoadingResult(
              false
            );
          }

          return;
        }

        try {
          const response =
            await api.get(
              "/api/resultats/dernier",
              {
                params: {
                  matiere:
                    matiereActuelle,

                  niveau:
                    niveauActuel,

                  serie:
                    serieNormalisee !==
                    "none"
                      ? serieNormalisee
                      : undefined,
                },

                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          if (
            cancelled
          ) {
            return;
          }

          console.log(
            "🌐 Dernier résultat reçu depuis le serveur :",
            response.data
          );

          setResultats(
            response.data
          );

          setError(null);
        } catch (requestError) {
          if (
            cancelled
          ) {
            return;
          }

          console.error(
            "Erreur récupération résultat :",
            requestError
          );

          /*
           * Une dernière vérification du cache est effectuée
           * au cas où la connexion aurait disparu pendant
           * la requête.
           */
          try {
            const cachedAfterError =
              await getOfflineData<CachedResult>(
                STORES.results,
                resultCacheId
              );

            if (
              !cancelled &&
              cachedAfterError?.resultats
            ) {
              setResultats(
                cachedAfterError.resultats
              );

              setPendingSync(
                Boolean(
                  cachedAfterError.pendingSync
                )
              );

              setError(null);

              setSuccess(
                "Connexion indisponible. Résultat restauré depuis cet appareil."
              );

              return;
            }
          } catch (cacheError) {
            console.warn(
              "Erreur lors de la seconde lecture IndexedDB :",
              cacheError
            );
          }

          if (!cancelled) {
            setError(
              "Erreur lors du chargement des résultats."
            );
          }
        } finally {
          if (
            !cancelled
          ) {
            setLoadingResult(
              false
            );
          }
        }
      };

    void loadResult();

    return () => {
      cancelled = true;
    };
  }, [
    resultats,
    token,
    matiereActuelle,
    niveauActuel,
    serieNormalisee,
    resultCacheId,
    isOffline,
  ]);

  // ==========================================================
  // SAUVEGARDE DU RÉSULTAT DANS INDEXEDDB
  // ==========================================================

  const notionsNonAcquises =
    Array.isArray(
      resultats?.notionsNonAcquises
    )
      ? resultats.notionsNonAcquises
      : Array.isArray(
          resultats?.notions_non_acquises
        )
      ? resultats.notions_non_acquises
      : state.notionsNonAcquises ??
        [];

  useEffect(() => {
    if (
      !resultats ||
      !matiereActuelle ||
      !niveauActuel
    ) {
      return;
    }

    const saveResult =
      async () => {
        try {
          const cacheData: CachedResult = {
            id: resultCacheId,

            resultats,

            questionsRemediation,

            questionsDuTest,

            reponsesDuTest,

            notionsNonAcquises,

            matiereActuelle,

            niveauActuel,

            serieActuelle:
              serieNormalisee,

            testId:
              state.testId,

            offline:
              Boolean(
                state.offline ||
                isOffline
              ),

            pendingSync,

            cachedAt:
              Date.now(),
          };

          await saveOfflineData(
            STORES.results,
            cacheData
          );

          console.log(
            "💾 Résultat sauvegardé dans IndexedDB :",
            resultCacheId
          );
        } catch (saveError) {
          console.error(
            "Impossible de sauvegarder le résultat localement :",
            saveError
          );
        }
      };

    void saveResult();
  }, [
    resultats,
    resultCacheId,
    questionsRemediation,
    questionsDuTest,
    reponsesDuTest,
    notionsNonAcquises,
    matiereActuelle,
    niveauActuel,
    serieNormalisee,
    pendingSync,
    isOffline,
    state.testId,
    state.offline,
  ]);

  // ==========================================================
  // DÉTECTION HORS LIGNE / EN LIGNE
  // ==========================================================

  useEffect(() => {
    const handleOffline =
      () => {
        console.log(
          "📴 CODE est maintenant hors ligne."
        );

        setIsOffline(true);

        setSuccess(
          "Vous êtes hors ligne. Votre résultat reste disponible sur cet appareil."
        );
      };

    const handleOnline =
      () => {
        console.log(
          "🌐 CODE est de nouveau en ligne."
        );

        setIsOffline(false);

        if (pendingSync) {
          setSuccess(
            "Connexion rétablie. Synchronisation de votre résultat..."
          );
        } else {
          setSuccess(
            "Connexion rétablie."
          );
        }
      };

    window.addEventListener(
      "offline",
      handleOffline
    );

    window.addEventListener(
      "online",
      handleOnline
    );

    return () => {
      window.removeEventListener(
        "offline",
        handleOffline
      );

      window.removeEventListener(
        "online",
        handleOnline
      );
    };
  }, [
    pendingSync,
  ]);

  // ==========================================================
  // RÉSULTAT
  // ==========================================================

  /**
   * Récupération robuste de la vraie note.
   *
   * IMPORTANT :
   * On privilégie toujours la note réellement calculée
   * et enregistrée par le backend/test.
   *
   * On ne recalcule à partir de nbBonnesReponses
   * que si aucune note n'est disponible.
   */

  const recupererNoteReelle = (
    resultat: ResultatType | null
  ): number | null => {
    if (!resultat) {
      return null;
    }

    // --------------------------------------------------------
    // 1. NOTE DIRECTE
    // --------------------------------------------------------

    const valeursPossibles = [
      resultat.note,
      resultat.note_sur_20,
      resultat.noteSur20,
      resultat.score_sur_20,
      resultat.scoreSur20,
      resultat.resultat?.note,
      resultat.resultat?.note_sur_20,
      resultat.resultat?.noteSur20,
      resultat.data?.note,
      resultat.data?.note_sur_20,
    ];

    for (
      const valeur of valeursPossibles
    ) {
      if (
        valeur !== null &&
        valeur !== undefined &&
        valeur !== "" &&
        Number.isFinite(
          Number(valeur)
        )
      ) {
        const nombre =
          Number(valeur);

        if (
          nombre >= 0 &&
          nombre <= 20
        ) {
          return nombre;
        }
      }
    }

    // --------------------------------------------------------
    // 2. NOMBRE DE BONNES RÉPONSES
    // --------------------------------------------------------

    const bonnesReponses =
      Number(
        resultat.nbBonnesReponses ??
        resultat.nb_bonnes_reponses ??
        resultat.nombreBonnesReponses ??
        resultat.nombre_bonnes_reponses ??
        resultat.score
      );

    const nombreQuestions =
      Number(
        resultat.nbQuestions ??
        resultat.nb_questions ??
        resultat.nombreQuestions ??
        resultat.nombre_questions
      );

    if (
      Number.isFinite(
        bonnesReponses
      ) &&
      Number.isFinite(
        nombreQuestions
      ) &&
      nombreQuestions > 0 &&
      bonnesReponses >= 0
    ) {
      return Number(
        (
          (bonnesReponses /
            nombreQuestions) *
          20
        ).toFixed(2)
      );
    }

    return null;
  };

  const noteReelle =
    recupererNoteReelle(
      resultats
    );

  // ----------------------------------------------------------
  // NOTE AFFICHÉE
  // ----------------------------------------------------------

  const note =
    noteReelle ?? 0;

  // ----------------------------------------------------------
  // MENTION
  // ----------------------------------------------------------

  const mention =
    resultats?.mention ??
    resultats?.mention_finale ??
    resultats?.mentionFinale ??
    resultats?.resultat?.mention ??
    "";

  // ----------------------------------------------------------
  // DEBUG NOTE
  // ----------------------------------------------------------

  useEffect(() => {
    console.log(
      "========================================"
    );

    console.log(
      "VÉRIFICATION DE LA NOTE AFFICHÉE"
    );

    console.log(
      "========================================"
    );

    console.log(
      "Objet resultats complet :",
      resultats
    );

    console.log(
      "resultats.note :",
      resultats?.note
    );

    console.log(
      "resultats.note_sur_20 :",
      resultats?.note_sur_20
    );

    console.log(
      "resultats.noteSur20 :",
      resultats?.noteSur20
    );

    console.log(
      "resultats.score :",
      resultats?.score
    );

    console.log(
      "resultats.nbBonnesReponses :",
      resultats?.nbBonnesReponses
    );

    console.log(
      "resultats.nbQuestions :",
      resultats?.nbQuestions
    );

    console.log(
      "NOTE RETENUE :",
      noteReelle
    );

    console.log(
      "NOTE AFFICHÉE :",
      note
    );

    console.log(
      "MENTION :",
      mention
    );

    console.log(
      "========================================"
    );
  }, [
    resultats,
    noteReelle,
    note,
    mention,
  ]);

  const notionsTriees =
    trierNotionsNonAcquises(
      notionsNonAcquises,
      niveauComplet
    );

  const mentionStyle =
    mentionColors[mention] ??
    "bg-gray-600 text-white border-gray-500 dark:bg-gray-700 dark:border-gray-600";

  const dateEmission =
    new Date().toLocaleDateString(
      "fr-FR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );

  // ==========================================================
  // POURCENTAGE
  // ==========================================================

  const pourcentage =
    Math.round(
      (note / 20) * 100
    );

  // ==========================================================
  // DEBUG
  // ==========================================================

  useEffect(() => {
    console.log(
      "========== RESULTATS =========="
    );

    console.log(
      "location.state =",
      location.state
    );

    console.log(
      "matiere =",
      matiere
    );

    console.log(
      "niveau =",
      niveau
    );

    console.log(
      "serie =",
      serie
    );

    console.log(
      "resultats =",
      location.state?.resultats
    );
  }, [
    location.state,
    matiere,
    niveau,
    serie,
  ]);

  // ==========================================================
  // ANIMATION CODE
  // ==========================================================

  useEffect(() => {
    if (
      motActuel >= mots.length
    ) {
      setOrActif(true);
      return;
    }

    const timer =
      window.setTimeout(() => {
        setMotActuel(
          (prev) =>
            Math.min(
              prev + 1,
              mots.length
            )
        );
      }, 1400);

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [motActuel]);

  // ==========================================================
  // GÉNÉRATION DU PDF
  // ==========================================================

  const generatePDF =
    async () => {
      if (
        !resultRef.current
      ) {
        return null;
      }

      console.log(
        "========================================"
      );

      console.log(
        "GÉNÉRATION DU PDF — UNE SEULE PAGE"
      );

      console.log(
        "========================================"
      );

      const original =
        resultRef.current;

      const pdfWidth =
        794;

      const clone =
        original.cloneNode(
          true
        ) as HTMLDivElement;

      clone.setAttribute(
        "data-pdf-report",
        "true"
      );

      clone.style.position =
        "fixed";

      clone.style.left =
        "-100000px";

      clone.style.top =
        "0";

      clone.style.width =
        `${pdfWidth}px`;

      clone.style.maxWidth =
        `${pdfWidth}px`;

      clone.style.minWidth =
        `${pdfWidth}px`;

      clone.style.margin =
        "0";

      clone.style.padding =
        "0";

      clone.style.opacity =
        "1";

      clone.style.transform =
        "none";

      clone.style.animation =
        "none";

      clone.style.transition =
        "none";

      clone.style.overflow =
        "visible";

      clone.style.height =
        "auto";

      clone.style.maxHeight =
        "none";

      clone.style.background =
        "#ffffff";

      clone.style.boxShadow =
        "none";

      clone.style.borderRadius =
        "0";

      clone
        .querySelectorAll(
          "[data-pdf-hide='true']"
        )
        .forEach(
          (element) => {
            element.remove();
          }
        );

      const pdfStyle =
        document.createElement(
          "style"
        );

      pdfStyle.setAttribute(
        "data-pdf-style",
        "true"
      );

      pdfStyle.textContent = `
        [data-pdf-report] {
          width: ${pdfWidth}px !important;
          max-width: ${pdfWidth}px !important;
          min-width: ${pdfWidth}px !important;
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
          background: #ffffff !important;
          color: #111827 !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          transform: none !important;
          animation: none !important;
          transition: none !important;
        }

        [data-pdf-report] *,
        [data-pdf-report] *::before,
        [data-pdf-report] *::after {
          box-sizing: border-box !important;
        }

        [data-pdf-report] * {
          animation: none !important;
          transition: none !important;
        }

        [data-pdf-report] section,
        [data-pdf-report] footer,
        [data-pdf-report] div {
          overflow: visible !important;
          max-height: none !important;
        }

        [data-pdf-card="student"],
        [data-pdf-card="formation"],
        [data-pdf-card="subject"] {
          min-height: 82px !important;
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
          display: flex !important;
          align-items: center !important;
          padding: 12px !important;
        }

        [data-pdf-card="student"] > div:last-child,
        [data-pdf-card="formation"] > div:last-child,
        [data-pdf-card="subject"] > div:last-child {
          min-width: 0 !important;
          height: auto !important;
          overflow: visible !important;
        }

        [data-pdf-card="student"] p,
        [data-pdf-card="formation"] p,
        [data-pdf-card="subject"] p {
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
          line-height: 1.35 !important;
          white-space: normal !important;
        }

        [data-pdf-card="student"] > div:first-child,
        [data-pdf-card="formation"] > div:first-child,
        [data-pdf-card="subject"] > div:first-child {
          width: 40px !important;
          min-width: 40px !important;
          height: 40px !important;
          min-height: 40px !important;
          flex-shrink: 0 !important;
        }

        [data-pdf-email="true"] {
          height: auto !important;
          min-height: 24px !important;
          overflow: visible !important;
          line-height: 1.4 !important;
        }

        [data-pdf-report] section {
          padding-top: 16px !important;
          padding-bottom: 16px !important;
        }

        [data-pdf-report] > div:first-child {
          padding-top: 20px !important;
          padding-bottom: 20px !important;
        }

        [data-pdf-report] h2 {
          line-height: 1.15 !important;
        }

        [data-pdf-report] h3 {
          line-height: 1.2 !important;
        }

        [data-pdf-report] p {
          line-height: 1.35 !important;
        }

        [data-pdf-notion="true"] {
          padding: 9px !important;
          min-height: 48px !important;
          height: auto !important;
          overflow: visible !important;
          break-inside: avoid !important;
        }

        [data-pdf-notion="true"] span {
          line-height: 1.35 !important;
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
        }

        [data-pdf-qr="true"] {
          padding: 10px !important;
          overflow: visible !important;
        }

        [data-pdf-qr="true"] svg {
          width: 100px !important;
          height: 100px !important;
        }

        [data-pdf-footer="true"] {
          padding-top: 10px !important;
          padding-bottom: 10px !important;
          min-height: auto !important;
          height: auto !important;
          overflow: visible !important;
        }

        [data-pdf-report] .truncate {
          overflow: visible !important;
          text-overflow: clip !important;
          white-space: normal !important;
        }
      `;

      clone.appendChild(
        pdfStyle
      );

      document.body.appendChild(
        clone
      );

      try {
        await new Promise(
          (resolve) =>
            requestAnimationFrame(
              () =>
                requestAnimationFrame(
                  resolve
                )
            )
        );

        const canvas =
          await html2canvas(
            clone,
            {
              scale: 1.15,

              useCORS: true,

              backgroundColor:
                "#ffffff",

              logging: false,

              imageTimeout:
                15000,

              removeContainer:
                true,

              windowWidth:
                pdfWidth,

              onclone: (
                clonedDocument
              ) => {
                clonedDocument.documentElement.classList.remove(
                  "dark"
                );

                clonedDocument.body.classList.remove(
                  "dark"
                );

                clonedDocument
                  .querySelectorAll(
                    "[data-pdf-report] *"
                  )
                  .forEach(
                    (element) => {
                      const el =
                        element as HTMLElement;

                      el.style.animation =
                        "none";

                      el.style.transition =
                        "none";

                      el.style.maxHeight =
                        "none";

                      el.style.overflow =
                        "visible";
                    }
                  );
              },
            }
          );

        console.log(
          "Canvas généré :",
          canvas.width,
          "x",
          canvas.height
        );

        if (
          canvas.width <= 0 ||
          canvas.height <= 0
        ) {
          throw new Error(
            "Le canvas généré est invalide."
          );
        }

        const pdf =
          new jsPDF({
            orientation:
              "portrait",

            unit:
              "mm",

            format:
              "a4",

            compress:
              true,
          });

        const pageWidth =
          pdf.internal.pageSize.getWidth();

        const pageHeight =
          pdf.internal.pageSize.getHeight();

        const margin =
          4;

        const availableWidth =
          pageWidth -
          margin * 2;

        const availableHeight =
          pageHeight -
          margin * 2;

        const scaleX =
          availableWidth /
          canvas.width;

        const scaleY =
          availableHeight /
          canvas.height;

        const finalScale =
          Math.min(
            scaleX,
            scaleY
          );

        const imageWidth =
          canvas.width *
          finalScale;

        const imageHeight =
          canvas.height *
          finalScale;

        const x =
          (pageWidth -
            imageWidth) /
          2;

        const y =
          (pageHeight -
            imageHeight) /
          2;

        console.log(
          "Dimensions A4 :",
          pageWidth,
          "x",
          pageHeight,
          "mm"
        );

        console.log(
          "Rapport dans PDF :",
          imageWidth.toFixed(2),
          "x",
          imageHeight.toFixed(2),
          "mm"
        );

        console.log(
          "Facteur de réduction :",
          finalScale.toFixed(4)
        );

        const imageData =
          canvas.toDataURL(
            "image/jpeg",
            0.72
          );

        pdf.addImage(
          imageData,
          "JPEG",
          x,
          y,
          imageWidth,
          imageHeight,
          undefined,
          "FAST"
        );

        console.log(
          "PDF UNE SEULE PAGE généré."
        );

        return pdf;
      } finally {
        if (
          clone.parentNode
        ) {
          clone.parentNode.removeChild(
            clone
          );
        }
      }
    };

  // ==========================================================
  // ENVOI AUTOMATIQUE DU PDF
  // ==========================================================

  useEffect(() => {
    const sendPDF =
      async () => {
        /*
         * Aucun résultat : il faut attendre
         * qu'il soit chargé.
         */
        if (!resultats) {
          return;
        }

        /*
         * Hors ligne :
         * on ne tente surtout pas l'envoi.
         *
         * Le résultat est déjà conservé
         * localement dans IndexedDB.
         */
        if (
          isOffline ||
          !navigator.onLine
        ) {
          console.log(
            "📴 Envoi PDF reporté : appareil hors ligne."
          );

          setSending(false);

          setSuccess(
            "Vous êtes hors ligne. Votre résultat est conservé sur cet appareil."
          );

          return;
        }

        if (
          sentPDF.current ||
          !token ||
          !apprenant?.email ||
          !resultRef.current
        ) {
          return;
        }

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              1200
            )
        );

        /*
         * La connexion peut avoir changé
         * pendant l'attente.
         */
        if (
          !navigator.onLine
        ) {
          setIsOffline(true);

          setSuccess(
            "Connexion interrompue. L'envoi du rapport sera repris lorsque Internet reviendra."
          );

          return;
        }

        setSending(true);

        try {
          console.log(
            "========================================"
          );

          console.log(
            "DÉBUT ENVOI AUTOMATIQUE DU PDF"
          );

          console.log(
            "========================================"
          );

          const pdf =
            await generatePDF();

          if (!pdf) {
            throw new Error(
              "Impossible de générer le PDF."
            );
          }

          const pdfBlob =
            pdf.output(
              "blob"
            );

          const tailleMo =
            pdfBlob.size /
            (1024 * 1024);

          console.log(
            "========================================"
          );

          console.log(
            "PDF FINAL"
          );

          console.log(
            "Taille :",
            pdfBlob.size,
            "octets"
          );

          console.log(
            "Taille :",
            tailleMo.toFixed(2),
            "Mo"
          );

          console.log(
            "========================================"
          );

          if (
            pdfBlob.size === 0
          ) {
            throw new Error(
              "Le PDF généré est vide."
            );
          }

          if (
            pdfBlob.size >
            12 * 1024 * 1024
          ) {
            console.warn(
              "⚠️ Le PDF dépasse 12 Mo."
            );

            console.warn(
              "Brevo pourrait refuser le message."
            );
          }

          const formData =
            new FormData();

          const nomFichier =
            `Resultat_${matiereLabel}_${niveauComplet}.pdf`;

          formData.append(
            "file",
            pdfBlob,
            nomFichier
          );

          formData.append(
            "matiere",
            matiereActuelle
          );

          formData.append(
            "niveau",
            niveauComplet
          );

          formData.append(
            "serie",
            serieNormalisee
          );

          formData.append(
            "apprenant",
            JSON.stringify({
              email:
                apprenant.email,

              prenom:
                apprenant.prenom,

              nom:
                apprenant.nom,
            })
          );

          console.log(
            "---------- DONNÉES ENVOYÉES ----------"
          );

          console.log(
            "Fichier :",
            nomFichier
          );

          console.log(
            "Matière :",
            matiereActuelle
          );

          console.log(
            "Niveau :",
            niveauComplet
          );

          console.log(
            "Série :",
            serieNormalisee
          );

          console.log(
            "Apprenant :",
            {
              email:
                apprenant.email,

              prenom:
                apprenant.prenom,

              nom:
                apprenant.nom,
            }
          );

          const response =
            await api.post(
              "/api/send-result-pdf",
              formData,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,

                  "Content-Type":
                    "multipart/form-data",
                },
              }
            );

          console.log(
            "========================================"
          );

          console.log(
            "PDF ENVOYÉ AVEC SUCCÈS"
          );

          console.log(
            "Réponse backend :",
            response.data
          );

          console.log(
            "========================================"
          );

          sentPDF.current =
            true;

          setSuccess(
            "Votre rapport a été envoyé avec succès."
          );
        } catch (error: any) {
          console.error(
            "========================================"
          );

          console.error(
            "ERREUR ENVOI PDF"
          );

          console.error(
            "========================================"
          );

          console.error(
            "Erreur complète :",
            error
          );

          console.error(
            "Statut HTTP :",
            error?.response?.status
          );

          console.error(
            "Réponse backend :",
            error?.response?.data
          );

          console.error(
            "Message :",
            error?.message
          );

          /*
           * Si l'échec correspond à une perte
           * de connexion, on bascule simplement
           * en mode hors ligne.
           */
          if (
            !navigator.onLine
          ) {
            setIsOffline(true);

            setSuccess(
              "Connexion interrompue. L'envoi du rapport sera repris lorsque Internet reviendra."
            );
          } else {
            setSuccess(
              "L'envoi automatique du rapport a échoué."
            );
          }

          sentPDF.current =
            false;
        } finally {
          setSending(false);
        }
      };

    void sendPDF();
  }, [
    resultats,
    token,
    apprenant,
    matiereActuelle,
    niveauComplet,
    serieNormalisee,
    matiereLabel,
    isOffline,
  ]);

  // ==========================================================
  // REPRISE AUTOMATIQUE DE L'ENVOI PDF
  // LORSQUE INTERNET REVIENT
  // ==========================================================

  useEffect(() => {
    const handleOnline =
      () => {
        if (
          sentPDF.current
        ) {
          return;
        }

        console.log(
          "🌐 Connexion revenue : tentative d'envoi du rapport PDF."
        );

        setIsOffline(false);

        setSuccess(
          "Connexion rétablie. Préparation de l'envoi du rapport..."
        );
      };

    window.addEventListener(
      "online",
      handleOnline
    );

    return () => {
      window.removeEventListener(
        "online",
        handleOnline
      );
    };
  }, []);

  // ==========================================================
  // DÉMARRER LA REMÉDIATION
  // ==========================================================

  const handleRemediationStart =
    () => {
      if (
        !matiereActuelle ||
        !niveauActuel
      ) {
        console.warn(
          "⚠️ Impossible de démarrer la remédiation."
        );

        return;
      }

      navigate(
        `/test/remediation/${matiereActuelle}/${niveauActuel.toLowerCase()}/${serieNormalisee}`,
        {
          replace: true,

          state: {
            resultats,

            questionsRemediation,

            questionsDuTest,

            reponsesDuTest,

            notions_non_acquises:
              notionsNonAcquises,

            matiereActuelle,

            niveauActuel,

            serieActuelle:
              serieNormalisee,

            offline:
              isOffline,

            pendingSync,
          },
        }
      );
    };

  // ==========================================================
  // TÉLÉCHARGER LE PDF
  // ==========================================================

  const handleDownloadPDF =
    async () => {
      try {
        setSending(true);

        const pdf =
          await generatePDF();

        if (!pdf) {
          return;
        }

        const nomFichier =
          `Resultat_${matiereLabel}_${niveauComplet}.pdf`;

        const blob =
          pdf.output(
            "blob"
          );

        console.log(
          "PDF téléchargé :",
          (
            blob.size /
            (1024 * 1024)
          ).toFixed(2),
          "Mo"
        );

        pdf.save(
          nomFichier
        );
      } catch (error) {
        console.error(
          "Erreur téléchargement PDF :",
          error
        );
      } finally {
        setSending(false);
      }
    };

  // ==========================================================
  // CHARGEMENT
  // ==========================================================

  if (
    loadingAuth ||
    loadingResult
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="flex flex-col items-center text-center"
        >

          <div className="relative mb-6">

            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl" />

            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-blue-100 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">

              <Loader2 className="h-9 w-9 animate-spin text-blue-600 dark:text-blue-400" />

            </div>

          </div>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Préparation de votre rapport
          </h2>

          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            Nous récupérons vos résultats...
          </p>

        </motion.div>

      </div>
    );
  }

  // ==========================================================
  // ERREUR
  // ==========================================================

  if (
    error ||
    !resultats
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">

        <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl dark:border-red-900/50 dark:bg-slate-900">

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">

            <AlertCircle className="h-8 w-8" />

          </div>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Résultat indisponible
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-slate-400">
            {error ??
              "Les résultats ont été soumis, mais les données nécessaires à leur affichage sont momentanément indisponibles."}
          </p>

          <button
            onClick={() =>
              navigate("/")
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >

            Retour à l'accueil

            <ArrowRight className="h-4 w-4" />

          </button>

        </div>

      </div>
    );
  }

  // ==========================================================
  // AFFICHAGE
  // ==========================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">

      {/* ======================================================
          CONTRÔLES
      ======================================================= */}

      <div className="fixed right-4 top-4 z-50 flex items-center gap-2">

        <DarkModeToggle />

        <AudioManager />

      </div>

      {/* ======================================================
          INDICATEUR HORS LIGNE
      ======================================================= */}

      {isOffline && (

        <div
          data-pdf-hide="true"
          className="fixed left-4 top-4 z-50 flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold text-orange-700 shadow-lg dark:border-orange-900/50 dark:bg-orange-950/60 dark:text-orange-300"
        >

          <WifiOff className="h-3.5 w-3.5" />

          Mode hors ligne

        </div>

      )}

      {/* ======================================================
          ANIMATION CODE
      ======================================================= */}

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">

        <AnimatePresence mode="wait">

          {mots[
            motActuel - 1
          ] && (

            <motion.span
              key={
                motActuel
              }
              className="absolute left-1/2 top-1/4 -translate-x-1/2 text-5xl font-black sm:text-8xl"
              initial={{
                y: 45,
                opacity: 0,
                scale: 0.94,
                filter:
                  "blur(8px)",
              }}
              animate={{
                y: 0,
                opacity: 0.035,
                scale: 1,
                filter:
                  "blur(0px)",
              }}
              exit={{
                y: -45,
                opacity: 0,
                scale: 1.04,
                filter:
                  "blur(8px)",
              }}
              transition={{
                duration: 0.7,
                ease: "easeInOut",
              }}
              style={{
                color:
                  orActif
                    ? "gold"
                    : couleurs[
                        motActuel -
                          1
                      ],
              }}
            >

              {
                mots[
                  motActuel -
                    1
                ]
              }

            </motion.span>

          )}

        </AnimatePresence>

      </div>

      {/* ======================================================
          PAGE
      ======================================================= */}

      <main className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">

        {/* ====================================================
            EN-TÊTE HORS PDF
        ===================================================== */}

        <div
          data-pdf-hide="true"
          className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
        >

          <div>

            <div className="mb-3 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 dark:bg-blue-500">

                <Award className="h-5 w-5" />

              </div>

              <div>

                <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                  CODE · Évaluation
                </span>

                <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-500">
                  Rapport diagnostique personnalisé
                </p>

              </div>

            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-gray-950 dark:text-white sm:text-3xl">
              Votre rapport diagnostique
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-slate-400">
              Analyse de vos prérequis en{" "}
              <span className="font-semibold text-gray-700 dark:text-slate-200">
                {matiereLabel}
              </span>
              .
            </p>

          </div>

          <button
            onClick={
              handleDownloadPDF
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-700 dark:hover:bg-slate-800 dark:hover:text-blue-400"
          >

            <Download className="h-4 w-4" />

            Télécharger le PDF

          </button>

        </div>

        {/* ====================================================
            RAPPORT
        ===================================================== */}

        <motion.div
          ref={resultRef}
          data-pdf-static="true"
          data-pdf-report="true"
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
          className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-2xl shadow-gray-200/50 transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30"
        >

          {/* ==================================================
              BANDEAU CODE
          =================================================== */}

          <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 px-6 py-8 text-white sm:px-10">

            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

            <div className="absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-cyan-400/10 blur-2xl" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="mb-3 flex items-center gap-2">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">

                    <BookOpen className="h-5 w-5" />

                  </div>

                  <span className="text-sm font-bold uppercase tracking-[0.2em]">
                    CODE
                  </span>

                </div>

                <h2 className="text-2xl font-black sm:text-3xl">
                  Rapport d'évaluation
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                  Une évaluation diagnostique destinée
                  à identifier les notions déjà maîtrisées
                  et celles qui nécessitent une remédiation.
                </p>

              </div>

              <div className="shrink-0">

                <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-center backdrop-blur">

                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">
                    Date
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    {dateEmission}
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* ==================================================
              INFORMATIONS APPRENANT
          =================================================== */}

          <section className="border-b border-gray-200 px-6 py-7 dark:border-slate-700 sm:px-10">

            <div className="grid gap-4 sm:grid-cols-3">

              <div
                data-pdf-card="student"
                className="flex min-h-[82px] items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 transition-colors dark:border-slate-700 dark:bg-slate-800/70"
              >

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">

                  <User className="h-5 w-5" />

                </div>

                <div className="min-w-0">

                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Apprenant
                  </p>

                  <p className="truncate text-sm font-bold leading-5 text-gray-900 dark:text-white">

                    {apprenant?.prenom}{" "}
                    {apprenant?.nom}

                  </p>

                </div>

              </div>

              <div
                data-pdf-card="formation"
                className="flex min-h-[82px] items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 transition-colors dark:border-slate-700 dark:bg-slate-800/70"
              >

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">

                  <GraduationCap className="h-5 w-5" />

                </div>

                <div className="min-w-0">

                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Formation
                  </p>

                  <p className="truncate text-sm font-bold leading-5 text-gray-900 dark:text-white">
                    {niveauComplet}
                  </p>

                </div>

              </div>

              <div
                data-pdf-card="subject"
                className="flex min-h-[82px] items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 transition-colors dark:border-slate-700 dark:bg-slate-800/70"
              >

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-400">

                  <BookOpen className="h-5 w-5" />

                </div>

                <div className="min-w-0">

                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Matière
                  </p>

                  <p className="truncate text-sm font-bold leading-5 text-gray-900 dark:text-white">
                    {matiereLabel}
                  </p>

                </div>

              </div>

            </div>

            {apprenant?.email && (
              <div
                data-pdf-email="true"
                className="mt-4 flex min-h-[24px] items-center gap-2 text-sm leading-5 text-gray-500 dark:text-slate-400"
              >

                <Mail className="h-4 w-4 shrink-0" />

                <span className="break-all">
                  {apprenant.email}
                </span>

              </div>
            )}

          </section>

          {/* ==================================================
              RÉSULTAT
          =================================================== */}

          <section className="px-6 py-8 dark:bg-slate-900 sm:px-10">

            <div className="grid gap-6 md:grid-cols-[1fr_260px]">

              <div className="flex flex-col justify-center">

                <div className="mb-3 flex items-center gap-2">

                  <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />

                  <span className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Résultat diagnostique
                  </span>

                </div>

                <h3 className="text-2xl font-black text-gray-950 dark:text-white sm:text-3xl">
                  Votre niveau de maîtrise
                </h3>

                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600 dark:text-slate-400">
                  Cette note représente votre niveau
                  de maîtrise des notions utilisées comme
                  prérequis pour votre niveau actuel.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">

                  <div className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">

                    <Target className="h-4 w-4" />

                    {pourcentage}% de réussite

                  </div>

                  <div className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-bold text-gray-700 dark:bg-slate-800 dark:text-slate-300">

                    <CalendarDays className="h-4 w-4" />

                    {dateEmission}

                  </div>

                </div>

              </div>

              <div className="flex flex-col items-center justify-center rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 text-center dark:border-blue-900/50 dark:from-blue-950/50 dark:to-indigo-950/50">

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                  Note obtenue
                </p>

                <div className="mt-2 flex items-baseline">

                  <span className="text-6xl font-black tracking-tight text-gray-950 dark:text-white">
                    {note}
                  </span>

                  <span className="ml-1 text-xl font-bold text-gray-400 dark:text-slate-500">
                    /20
                  </span>

                </div>

                <div
                  className={`mt-4 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-bold shadow-sm ${mentionStyle}`}
                >

                  <Award className="h-4 w-4" />

                  {mention ||
                    "Évaluation"}

                </div>

              </div>

            </div>

          </section>

          {/* ==================================================
              NOTIONS
          =================================================== */}

          <section className="border-t border-gray-200 bg-gray-50/80 px-6 py-8 dark:border-slate-700 dark:bg-slate-950/40 sm:px-10">

            <div className="mb-5 flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">

                <RefreshCw className="h-5 w-5" />

              </div>

              <div>

                <h3 className="text-xl font-extrabold text-gray-950 dark:text-white">
                  Notions à réviser
                </h3>

                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Les notions identifiées pendant
                  l'évaluation et proposées pour
                  la remédiation.
                </p>

              </div>

            </div>

            {notionsTriees.length ===
            0 ? (

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-900/50 dark:bg-emerald-950/30">

                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">

                  <CheckCircle2 className="h-6 w-6" />

                </div>

                <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
                  Toutes les notions semblent maîtrisées !
                </p>

                <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                  Félicitations pour ce résultat.
                </p>

              </div>

            ) : (

              <div className="grid gap-3 sm:grid-cols-2">

                {notionsTriees.map(
                  (
                    notion,
                    index
                  ) => (

                    <motion.div
                      key={index}
                      data-pdf-notion="true"
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay:
                          index *
                          0.04,
                      }}
                      className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/10"
                    >

                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-xs font-bold text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
                        {index + 1}
                      </span>

                      <span className="text-sm font-medium leading-6 text-gray-700 dark:text-slate-300">
                        {notion}
                      </span>

                    </motion.div>

                  )
                )}

              </div>

            )}

          </section>

          {/* ==================================================
              QR CODE
          =================================================== */}

          <section className="border-t border-gray-200 px-6 py-8 dark:border-slate-700 dark:bg-slate-900 sm:px-10">

            <div className="flex flex-col items-center text-center">

              <div className="mb-3 flex items-center gap-2">

                <QrCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />

                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Découvrez CODE
                </h3>

              </div>

              <p className="mb-5 max-w-md text-sm leading-6 text-gray-500 dark:text-slate-400">
                Retrouvez votre environnement éducatif
                et poursuivez votre apprentissage
                directement sur la plateforme CODE.
              </p>

              <div
                data-pdf-qr="true"
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700"
              >

                <QRCode
                  value="https://code-frontend-rho.vercel.app"
                  size={140}
                />

              </div>

              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500">
                CODE — L'écosystème éducatif mondial
              </p>

            </div>

          </section>

          {/* ==================================================
              ACTIONS
              EXCLUES DU PDF
          =================================================== */}

          <section
            data-pdf-hide="true"
            className="border-t border-gray-200 bg-gray-50 px-6 py-7 dark:border-slate-700 dark:bg-slate-950/50 sm:px-10"
          >

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">

              <button
                onClick={
                  handleRemediationStart
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >

                <Target className="h-4 w-4" />

                Commencer la remédiation

                <ArrowRight className="h-4 w-4" />

              </button>

              <button
                onClick={
                  handleDownloadPDF
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-6 py-3 text-sm font-bold text-blue-700 shadow-sm transition hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-400 dark:hover:border-blue-700 dark:hover:bg-slate-800"
              >

                <Download className="h-4 w-4" />

                Télécharger le rapport PDF

              </button>

            </div>

            {/* ------------------------------------------------
                MESSAGE ENVOI PDF
            ------------------------------------------------- */}

            <div className="mt-5 text-center">

              {isOffline && (

                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">

                  <WifiOff className="h-3.5 w-3.5" />

                  Résultat sauvegardé sur cet appareil

                </div>

              )}

              {pendingSync && (

                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">

                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />

                  Synchronisation du résultat en attente

                </div>

              )}

              {sending && (

                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">

                  <Loader2 className="h-3.5 w-3.5 animate-spin" />

                  Préparation et envoi de votre rapport...

                </div>

              )}

              {!sending &&
                success && (

                  <div
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${
                      success.includes(
                        "échoué"
                      )
                        ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                        : success.includes(
                            "hors ligne"
                          ) ||
                          success.includes(
                            "interrompue"
                          )
                        ? "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300"
                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    }`}
                  >

                    {success.includes(
                      "échoué"
                    ) ? (
                      <AlertCircle className="h-3.5 w-3.5" />
                    ) : success.includes(
                        "hors ligne"
                      ) ||
                      success.includes(
                        "interrompue"
                      ) ? (
                      <WifiOff className="h-3.5 w-3.5" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}

                    {success}

                  </div>

                )}

            </div>

            {/* ------------------------------------------------
                INDICATEUR DE CONFIDENTIALITÉ
            ------------------------------------------------- */}

            <div className="mt-5 flex items-center justify-center gap-2 text-[11px] font-medium text-gray-400 dark:text-slate-500">

              <ShieldCheck className="h-3.5 w-3.5" />

              Rapport personnalisé généré par CODE

              <Send className="h-3.5 w-3.5" />

              Envoyé par e-mail

            </div>

          </section>

          {/* ==================================================
              PIED DE PAGE
          =================================================== */}

          <footer
            data-pdf-footer="true"
            className="border-t border-gray-200 bg-white px-6 py-5 text-center dark:border-slate-700 dark:bg-slate-900"
          >

            <div className="flex items-center justify-center gap-2">

              <FileText className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />

              <p className="text-xs font-semibold text-gray-400 dark:text-slate-500">
                CODE — L'écosystème éducatif mondial
              </p>

            </div>

            <p className="mt-1 text-[11px] text-gray-400 dark:text-slate-600">
              Tout ce qui est enseignable doit pouvoir
              trouver sa place sur CODE.
            </p>

          </footer>

        </motion.div>

      </main>

    </div>
  );
};

export default Resultats;