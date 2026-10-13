import React, { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/utils/axios";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Globe2,
  Lightbulb,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
  Sparkles,
  User,
  X,
  Info,
} from "lucide-react";

// ============================================================
// 📦 STOCKAGE HORS CONNEXION
// ============================================================

import {
  getOfflineData,
  saveOfflineData,
  STORES,
} from "@/offline/offlineDB";

interface ProjetPublic {
  id: number;
  nom: string;
  prenom: string;
  pays: string;
  titre: string;
  description: string;
  probleme?: string | null;
  solution?: string | null;
  vision?: string | null;
  impact?: string | null;
  categorie?: string | null;
  date_publication?: string | null;
}

// ============================================================
// 📦 DONNÉES CACHE
// ============================================================

type CachedProjets = {
  id: string;
  type: "projets_publics";
  projets: ProjetPublic[];
  cachedAt: number;
};

// ============================================================
// 📤 SOUMISSION HORS CONNEXION
// ============================================================

type OfflineProjetSubmission = {
  id: string;
  type: "projet_submission";
  createdAt: number;
  status: "pending";
  endpoint: string;
  method: "POST";
  payload: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    pays: string;
    titre: string;
    description: string;
    probleme: string | null;
    solution: string | null;
    vision: string | null;
    impact: string | null;
    categorie: string;
    consentement_publication: boolean;
    declaration_droits: boolean;
  };
};

const PROJETS_CACHE_ID = "projets_publics_current";

const categories = [
  "Éducation",
  "Technologie",
  "Agriculture",
  "Artisanat",
  "Industrie",
  "Santé",
  "Environnement",
  "Entrepreneuriat",
  "Sciences",
  "Arts",
  "Développement humain",
  "Autre",
];

type FenetreActive =
  | "soumission"
  | "memoire"
  | "fonctionnement"
  | null;

const Projets: React.FC = () => {
  const navigate = useNavigate();

  const [projets, setProjets] = useState<ProjetPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [etape, setEtape] = useState(1);

  const [projetSelectionne, setProjetSelectionne] =
    useState<ProjetPublic | null>(null);

  /*
   * UNE SEULE FENÊTRE PRINCIPALE À LA FOIS
   */
  const [fenetreActive, setFenetreActive] =
    useState<FenetreActive>(null);

  /*
   * 🌐 ÉTAT DE LA CONNEXION
   */
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== "undefined"
      ? !navigator.onLine
      : false
  );

  /*
   * FORMULAIRE DE SOUMISSION
   */
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    pays: "",
    titre: "",
    description: "",
    probleme: "",
    solution: "",
    vision: "",
    impact: "",
    categorie: "",
    consentement_publication: false,
    declaration_droits: false,
  });

  /*
   * ============================================================
   * 🌐 SURVEILLANCE DE LA CONNEXION
   * ============================================================
   */

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  /*
   * ============================================================
   * 📦 CHARGEMENT DES PROJETS PUBLICS
   *
   * Stratégie :
   *
   * 1. On tente l'API.
   * 2. Si ça fonctionne, on sauvegarde dans IndexedDB.
   * 3. Si ça échoue, on récupère le dernier cache disponible.
   * ============================================================
   */

  const chargerProjets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/projets");

      const donnees =
        Array.isArray(response.data)
          ? response.data
          : [];

      setProjets(donnees);

      /*
       * 💾 Sauvegarde locale
       */
      try {
        const cache: CachedProjets = {
          id: PROJETS_CACHE_ID,
          type: "projets_publics",
          projets: donnees,
          cachedAt: Date.now(),
        };

        await saveOfflineData(
          STORES.documents,
          cache
        );
      } catch (cacheError) {
        /*
         * Une erreur de cache ne doit jamais
         * empêcher l'utilisation normale de CODE.
         */
        console.warn(
          "⚠️ Impossible de mettre les projets en cache :",
          cacheError
        );
      }
    } catch (err) {
      console.error("Erreur chargement projets :", err);

      /*
       * 🔄 FALLBACK INDEXEDDB
       */
      try {
        const cached =
          await getOfflineData<CachedProjets>(
            STORES.documents,
            PROJETS_CACHE_ID
          );

        if (
          cached &&
          Array.isArray(cached.projets)
        ) {
          setProjets(cached.projets);

          console.info(
            "📦 Projets publics récupérés depuis le cache hors connexion."
          );

          /*
           * On ne considère pas cela comme une erreur
           * si le cache existe.
           */
          setError("");
        } else {
          setProjets([]);

          setError(
            "Impossible de charger les idées actuellement. Veuillez réessayer."
          );
        }
      } catch (cacheError) {
        console.error(
          "Erreur récupération cache projets :",
          cacheError
        );

        setProjets([]);

        setError(
          "Impossible de charger les idées actuellement. Veuillez réessayer."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerProjets();
  }, []);

  /*
   * ============================================================
   * 🔄 RECHARGEMENT LORS DU RETOUR DE LA CONNEXION
   * ============================================================
   */

  useEffect(() => {
    const handleOnline = () => {
      chargerProjets();
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  /*
   * ============================================================
   * BLOQUER LE SCROLL DE LA PAGE LORSQU'UNE FENÊTRE EST OUVERTE
   * ============================================================
   */

  useEffect(() => {
    if (fenetreActive || projetSelectionne) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [fenetreActive, projetSelectionne]);

  /*
   * ============================================================
   * ÉCHAP POUR FERMER LES FENÊTRES
   * ============================================================
   */

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFenetreActive(null);
        setProjetSelectionne(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /*
   * ============================================================
   * GESTION DES CHAMPS DU FORMULAIRE
   * ============================================================
   */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;

      setForm((prev) => ({
        ...prev,
        [name]: checkbox.checked,
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const afficherErreur = (texte: string) => {
    setError(texte);
  };

  /*
   * ============================================================
   * VALIDATION DES ÉTAPES
   * ============================================================
   */

  const validerEtape = () => {
    setError("");

    if (etape === 1) {
      if (!form.nom.trim()) {
        afficherErreur("Veuillez renseigner votre nom.");
        return false;
      }

      if (!form.prenom.trim()) {
        afficherErreur("Veuillez renseigner votre prénom.");
        return false;
      }

      if (!form.email.trim()) {
        afficherErreur(
          "Veuillez renseigner votre adresse email."
        );
        return false;
      }

      if (!form.telephone.trim()) {
        afficherErreur(
          "Veuillez renseigner votre numéro de téléphone."
        );
        return false;
      }

      if (!form.pays.trim()) {
        afficherErreur(
          "Veuillez renseigner votre pays."
        );
        return false;
      }
    }

    if (etape === 2) {
      if (!form.titre.trim()) {
        afficherErreur(
          "Veuillez donner un titre à votre idée."
        );
        return false;
      }

      if (!form.description.trim()) {
        afficherErreur(
          "Veuillez décrire votre idée ou votre projet."
        );
        return false;
      }
    }

    return true;
  };

  const allerEtapeSuivante = () => {
    if (!validerEtape()) return;

    setEtape((ancienne) =>
      Math.min(3, ancienne + 1)
    );
  };

  const allerEtapePrecedente = () => {
    setError("");

    setEtape((ancienne) =>
      Math.max(1, ancienne - 1)
    );
  };

  /*
   * ============================================================
   * OUVRIR LA FENÊTRE DE SOUMISSION
   * ============================================================
   */

  const ouvrirSoumission = () => {
    setMessage("");
    setError("");
    setEtape(1);
    setFenetreActive("soumission");
  };

  /*
   * ============================================================
   * OUVRIR LA MÉMOIRE DES IDÉES
   * ============================================================
   */

  const ouvrirMemoire = async () => {
    setMessage("");
    setError("");

    setFenetreActive("memoire");

    /*
     * On recharge les idées lorsque la mémoire est ouverte.
     */
    await chargerProjets();
  };

  const fermerFenetre = () => {
    setFenetreActive(null);
    setError("");
  };

  /*
   * ============================================================
   * 💾 ENREGISTRER UNE SOUMISSION HORS CONNEXION
   * ============================================================
   */

  const enregistrerSoumissionHorsConnexion =
    async () => {
      const offlineSubmission: OfflineProjetSubmission = {
        id: `projet_submission_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 10)}`,

        type: "projet_submission",

        createdAt: Date.now(),

        status: "pending",

        endpoint: "/api/projets/soumettre",

        method: "POST",

        payload: {
          nom: form.nom.trim(),
          prenom: form.prenom.trim(),
          email: form.email.trim(),
          telephone: form.telephone.trim(),
          pays: form.pays.trim(),
          titre: form.titre.trim(),
          description: form.description.trim(),
          probleme:
            form.probleme.trim() || null,
          solution:
            form.solution.trim() || null,
          vision:
            form.vision.trim() || null,
          impact:
            form.impact.trim() || null,
          categorie: form.categorie,
          consentement_publication:
            form.consentement_publication,
          declaration_droits:
            form.declaration_droits,
        },
      };

      await saveOfflineData(
        STORES.syncQueue,
        offlineSubmission
      );

      return offlineSubmission;
    };

  /*
   * ============================================================
   * 📤 SOUMISSION DU PROJET
   * ============================================================
   */

  const soumettreProjet = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!validerEtape()) return;

    if (!form.consentement_publication) {
      afficherErreur(
        "Vous devez autoriser CODE à publier votre idée après examen."
      );
      return;
    }

    if (!form.declaration_droits) {
      afficherErreur(
        "Vous devez accepter la déclaration relative à l'exploitation libre de l'idée."
      );
      return;
    }

    try {
      setSubmitting(true);

      /*
       * ========================================================
       * 📡 MODE HORS CONNEXION
       * ========================================================
       *
       * L'idée est conservée localement.
       * Elle sera envoyée au backend par le mécanisme
       * de synchronisation de syncQueue lorsque la
       * connexion sera disponible.
       */

      if (
        typeof navigator !== "undefined" &&
        !navigator.onLine
      ) {
        await enregistrerSoumissionHorsConnexion();

        setMessage(
          "Votre idée a été enregistrée sur cet appareil. Elle sera envoyée à l'équipe CODE dès que la connexion Internet sera rétablie."
        );

        /*
         * RÉINITIALISATION DU FORMULAIRE
         */
        setForm({
          nom: "",
          prenom: "",
          email: "",
          telephone: "",
          pays: "",
          titre: "",
          description: "",
          probleme: "",
          solution: "",
          vision: "",
          impact: "",
          categorie: "",
          consentement_publication: false,
          declaration_droits: false,
        });

        setEtape(1);
        setFenetreActive(null);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      }

      /*
       * ========================================================
       * 🌐 MODE CONNECTÉ
       * ========================================================
       */

      const response = await api.post(
        "/api/projets/soumettre",
        {
          ...form,
          probleme:
            form.probleme.trim() || null,
          solution:
            form.solution.trim() || null,
          vision:
            form.vision.trim() || null,
          impact:
            form.impact.trim() || null,
        }
      );

      setMessage(
        response.data?.message ||
          "Votre idée a bien été soumise à l'équipe CODE pour examen."
      );

      /*
       * RÉINITIALISATION DU FORMULAIRE
       */
      setForm({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        pays: "",
        titre: "",
        description: "",
        probleme: "",
        solution: "",
        vision: "",
        impact: "",
        categorie: "",
        consentement_publication: false,
        declaration_droits: false,
      });

      setEtape(1);

      /*
       * On ferme la fenêtre après la soumission.
       */
      setFenetreActive(null);

      await chargerProjets();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err: any) {
      console.error(
        "Erreur soumission projet :",
        err
      );

      /*
       * ========================================================
       * 🔄 FALLBACK
       *
       * Même si navigator.onLine indique "connecté",
       * la requête peut échouer à cause d'une connexion
       * instable ou inexistante.
       *
       * Dans ce cas, on place également la soumission
       * dans la file hors connexion.
       * ========================================================
       */

      try {
        await enregistrerSoumissionHorsConnexion();

        setMessage(
          "La connexion n'a pas permis d'envoyer votre idée. Elle a été enregistrée sur cet appareil et sera envoyée dès que la connexion sera rétablie."
        );

        setForm({
          nom: "",
          prenom: "",
          email: "",
          telephone: "",
          pays: "",
          titre: "",
          description: "",
          probleme: "",
          solution: "",
          vision: "",
          impact: "",
          categorie: "",
          consentement_publication: false,
          declaration_droits: false,
        });

        setEtape(1);
        setFenetreActive(null);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } catch (queueError) {
        console.error(
          "Erreur enregistrement soumission hors connexion :",
          queueError
        );

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Impossible de soumettre votre idée."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * ============================================================
   * FORMATAGE DES DATES
   * ============================================================
   */

  const formatDate = (
    date?: string | null
  ) => {
    if (!date) return "";

    try {
      return new Date(
        date
      ).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

        {/* =========================================================
            INDICATEUR HORS CONNEXION
        ========================================================= */}

        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="
              mb-5
              rounded-xl
              border border-orange-200 dark:border-orange-900
              bg-orange-50 dark:bg-orange-950/30
              px-4 py-3
              text-sm
              text-orange-800 dark:text-orange-200
            "
          >
            <div className="flex items-center gap-2">
              <Globe2 size={17} />
              <span>
                📡 Vous êtes hors connexion. Les idées déjà
                chargées restent accessibles et vos nouvelles
                soumissions peuvent être enregistrées localement.
              </span>
            </div>
          </motion.div>
        )}

        {/* =========================================================
            BARRE SUPÉRIEURE
        ========================================================= */}

        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              inline-flex items-center gap-2
              px-4 py-2.5
              rounded-xl
              bg-white dark:bg-slate-900
              border border-slate-200 dark:border-slate-800
              text-slate-700 dark:text-slate-200
              hover:bg-slate-100 dark:hover:bg-slate-800
              transition
              shadow-sm
            "
          >
            <ArrowLeft size={18} />
            Retour
          </button>

          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Globe2 size={17} />
            <span>La mémoire des idées</span>
          </div>
        </div>

        {/* =========================================================
            HERO
        ========================================================= */}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="
            relative overflow-hidden
            rounded-3xl
            bg-gradient-to-br
            from-blue-700
            via-indigo-700
            to-purple-800
            text-white
            shadow-2xl
            mb-8
          "
        >
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

          <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl" />

          <div className="relative p-7 md:p-12 lg:p-14">
            <div className="max-w-4xl">

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm mb-5">
                <Sparkles size={16} />
                <span>Une idée peut survivre à son époque</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                Projets & Idées
              </h1>

              <p className="mt-5 text-blue-100 text-base md:text-lg leading-relaxed max-w-3xl">
                CODE veut préserver les idées et les rêves qui n'ont
                pas pu être réalisés, afin qu'ils puissent être
                découverts, étudiés, adaptés et éventuellement
                concrétisés par les générations présentes et futures.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">

                {/* BOUTON 1 */}

                <button
                  type="button"
                  onClick={ouvrirSoumission}
                  className="
                    inline-flex items-center justify-center gap-2
                    px-6 py-3.5
                    rounded-xl
                    bg-white
                    text-blue-700
                    font-bold
                    hover:bg-blue-50
                    transition
                    shadow-lg
                  "
                >
                  <Lightbulb size={19} />
                  Déposer une idée
                </button>

                {/* BOUTON 2 */}

                <button
                  type="button"
                  onClick={ouvrirMemoire}
                  className="
                    inline-flex items-center justify-center gap-2
                    px-6 py-3.5
                    rounded-xl
                    bg-white/10
                    border border-white/25
                    text-white
                    font-semibold
                    hover:bg-white/20
                    transition
                  "
                >
                  <FileText size={19} />
                  Explorer les idées
                </button>

              </div>
            </div>
          </div>
        </motion.section>

        {/* =========================================================
            MESSAGE DE SUCCÈS
        ========================================================= */}

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="
                mb-8
                rounded-2xl
                border border-green-200 dark:border-green-800
                bg-green-50 dark:bg-green-950/40
                p-4
                text-green-800 dark:text-green-200
              "
            >
              <div className="flex items-start gap-3">

                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-white">
                  <Check size={16} />
                </div>

                <div>
                  <p className="font-bold">
                    Soumission réussie
                  </p>

                  <p className="text-sm mt-1">
                    {message}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setMessage("")}
                  className="ml-auto text-green-700 dark:text-green-300 hover:opacity-70"
                >
                  <X size={18} />
                </button>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =========================================================
            TROIS BLOCS D'INFORMATION
        ========================================================= */}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

          {/* BLOC 1 */}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="
              group
              bg-white dark:bg-slate-900
              border border-slate-200 dark:border-slate-800
              rounded-2xl
              p-6
              shadow-sm
              hover:shadow-xl
              hover:-translate-y-1
              transition
              flex flex-col
            "
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 flex items-center justify-center mb-5">
              <Lightbulb size={23} />
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Déposez votre idée
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed flex-1">
              Vous avez imaginé quelque chose sans avoir pu le
              réaliser ? Transmettez votre idée à CODE afin qu'elle
              puisse être conservée.
            </p>

            <button
              type="button"
              onClick={ouvrirSoumission}
              className="
                mt-5
                inline-flex items-center justify-center gap-2
                w-full
                px-4 py-2.5
                rounded-xl
                bg-blue-600
                hover:bg-blue-700
                text-white
                font-bold
                transition
              "
            >
              Déposer mon idée
              <ArrowRight size={17} />
            </button>
          </motion.div>

          {/* BLOC 2 */}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="
              group
              bg-white dark:bg-slate-900
              border border-slate-200 dark:border-slate-800
              rounded-2xl
              p-6
              shadow-sm
              hover:shadow-xl
              hover:-translate-y-1
              transition
              flex flex-col
            "
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 flex items-center justify-center mb-5">
              <FileText size={23} />
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              CODE examine
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed flex-1">
              Chaque proposition est examinée par l'équipe CODE
              avant qu'une éventuelle publication puisse avoir lieu.
            </p>

            <button
              type="button"
              onClick={() =>
                setFenetreActive("fonctionnement")
              }
              className="
                mt-5
                inline-flex items-center justify-center gap-2
                w-full
                px-4 py-2.5
                rounded-xl
                bg-purple-600
                hover:bg-purple-700
                text-white
                font-bold
                transition
              "
            >
              En savoir plus
              <Info size={17} />
            </button>
          </motion.div>

          {/* BLOC 3 */}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.19 }}
            className="
              group
              bg-white dark:bg-slate-900
              border border-slate-200 dark:border-slate-800
              rounded-2xl
              p-6
              shadow-sm
              hover:shadow-xl
              hover:-translate-y-1
              transition
              flex flex-col
            "
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 flex items-center justify-center mb-5">
              <Globe2 size={23} />
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Transmettez aux générations futures
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed flex-1">
              Les idées retenues peuvent être publiées dans la mémoire
              de CODE afin qu'elles ne disparaissent pas avec le temps.
            </p>

            <button
              type="button"
              onClick={ouvrirMemoire}
              className="
                mt-5
                inline-flex items-center justify-center gap-2
                w-full
                px-4 py-2.5
                rounded-xl
                bg-cyan-600
                hover:bg-cyan-700
                text-white
                font-bold
                transition
              "
            >
              Explorer la mémoire
              <ArrowRight size={17} />
            </button>
          </motion.div>

        </section>

        {/* =========================================================
            FENÊTRE : SOUMISSION
        ========================================================= */}

        <AnimatePresence>
          {fenetreActive === "soumission" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="
                fixed inset-0 z-50
                bg-black/60
                backdrop-blur-sm
                flex items-center justify-center
                p-4
              "
              onClick={fermerFenetre}
            >
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: 20,
                }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
                className="
                  w-full max-w-4xl
                  max-h-[92vh]
                  overflow-y-auto
                  rounded-3xl
                  bg-white dark:bg-slate-900
                  shadow-2xl
                "
              >

                {/* EN-TÊTE MODALE */}

                <div className="
                  sticky top-0 z-20
                  bg-white/95 dark:bg-slate-900/95
                  backdrop-blur
                  border-b border-slate-200 dark:border-slate-800
                  p-5 md:p-6
                ">
                  <div className="flex items-center justify-between gap-4">

                    <div className="flex items-center gap-3">

                      <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                        <Lightbulb size={22} />
                      </div>

                      <div>
                        <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
                          Déposer une idée
                        </h2>

                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                          Votre proposition sera examinée par CODE.
                        </p>
                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={fermerFenetre}
                      className="
                        w-10 h-10
                        rounded-full
                        bg-slate-100 dark:bg-slate-800
                        text-slate-500 dark:text-slate-300
                        hover:bg-slate-200 dark:hover:bg-slate-700
                        flex items-center justify-center
                        transition
                      "
                      aria-label="Fermer"
                    >
                      <X size={20} />
                    </button>

                  </div>
                </div>

                {/* CONTENU FORMULAIRE */}

                <div className="p-6 md:p-8">

                  {/* ÉTAPES */}

                  <div className="mb-8">
                    <div className="flex items-center justify-between max-w-2xl mx-auto">

                      {[1, 2, 3].map((numero) => (
                        <React.Fragment key={numero}>

                          <div className="flex flex-col items-center">

                            <div
                              className={`
                                w-10 h-10 rounded-full
                                flex items-center justify-center
                                font-bold
                                transition
                                ${
                                  etape >= numero
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                }
                              `}
                            >
                              {etape > numero ? (
                                <Check size={18} />
                              ) : (
                                numero
                              )}
                            </div>

                            <span
                              className={`
                                mt-2 text-xs md:text-sm font-semibold
                                ${
                                  etape >= numero
                                    ? "text-blue-700 dark:text-blue-400"
                                    : "text-slate-400"
                                }
                              `}
                            >
                              {numero === 1
                                ? "Vous"
                                : numero === 2
                                ? "Votre idée"
                                : "Publication"}
                            </span>

                          </div>

                          {numero < 3 && (
                            <div
                              className={`
                                h-1 flex-1 mx-3 rounded
                                transition
                                ${
                                  etape > numero
                                    ? "bg-blue-600"
                                    : "bg-slate-200 dark:bg-slate-700"
                                }
                              `}
                            />
                          )}

                        </React.Fragment>
                      ))}

                    </div>
                  </div>

                  {/* ERREUR */}

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: -8,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          y: -8,
                        }}
                        className="
                          mb-6
                          rounded-xl
                          border border-red-200 dark:border-red-800
                          bg-red-50 dark:bg-red-950/40
                          p-4
                          text-sm
                          text-red-800 dark:text-red-200
                        "
                      >
                        <div className="flex items-start gap-3">

                          <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                            <X size={14} />
                          </div>

                          <p>{error}</p>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={soumettreProjet}>

                    <AnimatePresence mode="wait">

                      {/* =================================================
                          ÉTAPE 1
                      ================================================= */}

                      {etape === 1 && (
                        <motion.div
                          key="etape1"
                          initial={{
                            opacity: 0,
                            x: 30,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          exit={{
                            opacity: 0,
                            x: -30,
                          }}
                          transition={{
                            duration: 0.25,
                          }}
                        >

                          <div className="mb-6">
                            <div className="flex items-center gap-3">

                              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                                <User size={20} />
                              </div>

                              <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                  Qui êtes-vous ?
                                </h3>

                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  Ces informations restent privées.
                                </p>
                              </div>

                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* NOM */}

                            <div>
                              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Nom
                              </label>

                              <input
                                type="text"
                                name="nom"
                                value={form.nom}
                                onChange={handleChange}
                                placeholder="Votre nom"
                                required
                                className="
                                  w-full px-4 py-3
                                  rounded-xl
                                  border border-slate-300 dark:border-slate-700
                                  bg-white dark:bg-slate-800
                                  text-slate-900 dark:text-white
                                  outline-none
                                  focus:ring-2 focus:ring-blue-500
                                "
                              />
                            </div>

                            {/* PRÉNOM */}

                            <div>
                              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Prénom
                              </label>

                              <input
                                type="text"
                                name="prenom"
                                value={form.prenom}
                                onChange={handleChange}
                                placeholder="Votre prénom"
                                required
                                className="
                                  w-full px-4 py-3
                                  rounded-xl
                                  border border-slate-300 dark:border-slate-700
                                  bg-white dark:bg-slate-800
                                  text-slate-900 dark:text-white
                                  outline-none
                                  focus:ring-2 focus:ring-blue-500
                                "
                              />
                            </div>

                            {/* EMAIL */}

                            <div>
                              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Adresse email
                              </label>

                              <div className="relative">

                                <Mail
                                  size={17}
                                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                  type="email"
                                  name="email"
                                  value={form.email}
                                  onChange={handleChange}
                                  placeholder="nom@exemple.com"
                                  required
                                  className="
                                    w-full pl-10 pr-4 py-3
                                    rounded-xl
                                    border border-slate-300 dark:border-slate-700
                                    bg-white dark:bg-slate-800
                                    text-slate-900 dark:text-white
                                    outline-none
                                    focus:ring-2 focus:ring-blue-500
                                  "
                                />

                              </div>
                            </div>

                            {/* TÉLÉPHONE */}

                            <div>
                              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Téléphone
                              </label>

                              <div className="relative">

                                <Phone
                                  size={17}
                                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                  type="tel"
                                  name="telephone"
                                  value={form.telephone}
                                  onChange={handleChange}
                                  placeholder="Votre numéro"
                                  required
                                  className="
                                    w-full pl-10 pr-4 py-3
                                    rounded-xl
                                    border border-slate-300 dark:border-slate-700
                                    bg-white dark:bg-slate-800
                                    text-slate-900 dark:text-white
                                    outline-none
                                    focus:ring-2 focus:ring-blue-500
                                  "
                                />

                              </div>
                            </div>

                            {/* PAYS */}

                            <div className="md:col-span-2">

                              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Pays
                              </label>

                              <div className="relative">

                                <MapPin
                                  size={17}
                                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                  type="text"
                                  name="pays"
                                  value={form.pays}
                                  onChange={handleChange}
                                  placeholder="Votre pays"
                                  required
                                  className="
                                    w-full pl-10 pr-4 py-3
                                    rounded-xl
                                    border border-slate-300 dark:border-slate-700
                                    bg-white dark:bg-slate-800
                                    text-slate-900 dark:text-white
                                    outline-none
                                    focus:ring-2 focus:ring-blue-500
                                  "
                                />

                              </div>
                            </div>

                          </div>
                        </motion.div>
                      )}

                      {/* =================================================
                          ÉTAPE 2
                      ================================================= */}

                      {etape === 2 && (
                        <motion.div
                          key="etape2"
                          initial={{
                            opacity: 0,
                            x: 30,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          exit={{
                            opacity: 0,
                            x: -30,
                          }}
                          transition={{
                            duration: 0.25,
                          }}
                        >

                          <div className="mb-6">

                            <div className="flex items-center gap-3">

                              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                                <Lightbulb size={20} />
                              </div>

                              <div>

                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                  Présentez votre idée
                                </h3>

                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  Décrivez votre idée, le problème,
                                  la solution, la vision et l'impact
                                  que vous imaginez.
                                </p>

                              </div>

                            </div>

                          </div>

                          <div className="space-y-5">

                            {/* TITRE */}

                            <div>

                              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Titre de l'idée ou du projet
                              </label>

                              <input
                                type="text"
                                name="titre"
                                value={form.titre}
                                onChange={handleChange}
                                placeholder="Ex. Une bibliothèque numérique pour les villages..."
                                required
                                className="
                                  w-full px-4 py-3
                                  rounded-xl
                                  border border-slate-300 dark:border-slate-700
                                  bg-white dark:bg-slate-800
                                  text-slate-900 dark:text-white
                                  outline-none
                                  focus:ring-2 focus:ring-purple-500
                                "
                              />

                            </div>

                            {/* CATÉGORIE */}

                            <div>

                              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Catégorie
                              </label>

                              <select
                                name="categorie"
                                value={form.categorie}
                                onChange={handleChange}
                                className="
                                  w-full px-4 py-3
                                  rounded-xl
                                  border border-slate-300 dark:border-slate-700
                                  bg-white dark:bg-slate-800
                                  text-slate-900 dark:text-white
                                  outline-none
                                  focus:ring-2 focus:ring-purple-500
                                "
                              >

                                <option value="">
                                  Choisir une catégorie
                                </option>

                                {categories.map(
                                  (categorie) => (
                                    <option
                                      key={categorie}
                                      value={categorie}
                                    >
                                      {categorie}
                                    </option>
                                  )
                                )}

                              </select>

                            </div>

                            {/* DESCRIPTION */}

                            <div>

                              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Description de l'idée
                              </label>

                              <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Expliquez votre idée, son fonctionnement, ce que vous imaginez..."
                                required
                                rows={7}
                                className="
                                  w-full px-4 py-3
                                  rounded-xl
                                  border border-slate-300 dark:border-slate-700
                                  bg-white dark:bg-slate-800
                                  text-slate-900 dark:text-white
                                  outline-none
                                  focus:ring-2 focus:ring-purple-500
                                  resize-y
                                "
                              />

                            </div>

                            {/* PROBLÈME */}

                            <div>

                              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Quel problème cette idée cherche-t-elle à
                                résoudre ?
                              </label>

                              <textarea
                                name="probleme"
                                value={form.probleme}
                                onChange={handleChange}
                                placeholder="Expliquez le problème, le besoin ou la situation observée..."
                                rows={4}
                                className="
                                  w-full px-4 py-3
                                  rounded-xl
                                  border border-slate-300 dark:border-slate-700
                                  bg-white dark:bg-slate-800
                                  text-slate-900 dark:text-white
                                  outline-none
                                  focus:ring-2 focus:ring-purple-500
                                  resize-y
                                "
                              />

                            </div>

                            {/* SOLUTION */}

                            <div>

                              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Quelle solution proposez-vous ?
                              </label>

                              <textarea
                                name="solution"
                                value={form.solution}
                                onChange={handleChange}
                                placeholder="Expliquez la solution que vous imaginez pour répondre au problème identifié..."
                                rows={5}
                                className="
                                  w-full px-4 py-3
                                  rounded-xl
                                  border border-cyan-300 dark:border-cyan-800
                                  bg-white dark:bg-slate-800
                                  text-slate-900 dark:text-white
                                  outline-none
                                  focus:ring-2 focus:ring-cyan-500
                                  resize-y
                                "
                              />

                              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                Décrivez les moyens, méthodes ou principes
                                qui pourraient permettre de résoudre le
                                problème.
                              </p>

                            </div>

                            {/* VISION */}

                            <div>

                              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Quelle est votre vision ?
                              </label>

                              <textarea
                                name="vision"
                                value={form.vision}
                                onChange={handleChange}
                                placeholder="Décrivez ce que cette idée pourrait devenir dans le futur..."
                                rows={4}
                                className="
                                  w-full px-4 py-3
                                  rounded-xl
                                  border border-slate-300 dark:border-slate-700
                                  bg-white dark:bg-slate-800
                                  text-slate-900 dark:text-white
                                  outline-none
                                  focus:ring-2 focus:ring-purple-500
                                  resize-y
                                "
                              />

                            </div>

                            {/* IMPACT */}

                            <div>

                              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Quel impact espérez-vous ?
                              </label>

                              <textarea
                                name="impact"
                                value={form.impact}
                                onChange={handleChange}
                                placeholder="Expliquez les effets positifs que votre projet pourrait produire pour les personnes, les communautés, l'environnement ou la société..."
                                rows={5}
                                className="
                                  w-full px-4 py-3
                                  rounded-xl
                                  border border-orange-300 dark:border-orange-800
                                  bg-white dark:bg-slate-800
                                  text-slate-900 dark:text-white
                                  outline-none
                                  focus:ring-2 focus:ring-orange-500
                                  resize-y
                                "
                              />

                              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                Vous pouvez expliquer les changements
                                que cette idée pourrait produire à court,
                                moyen ou long terme.
                              </p>

                            </div>

                          </div>

                        </motion.div>
                      )}

                      {/* =================================================
                          ÉTAPE 3
                      ================================================= */}

                      {etape === 3 && (
                        <motion.div
                          key="etape3"
                          initial={{
                            opacity: 0,
                            x: 30,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          exit={{
                            opacity: 0,
                            x: -30,
                          }}
                          transition={{
                            duration: 0.25,
                          }}
                        >

                          <div className="mb-6">

                            <div className="flex items-center gap-3">

                              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300 flex items-center justify-center">
                                <Send size={20} />
                              </div>

                              <div>

                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                  Dernière étape
                                </h3>

                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  Vérifiez les informations et acceptez
                                  les conditions.
                                </p>

                              </div>

                            </div>

                          </div>

                          {/* RÉCAPITULATIF */}

                          <div className="
                            mb-6
                            rounded-2xl
                            bg-slate-50 dark:bg-slate-800/70
                            border border-slate-200 dark:border-slate-700
                            p-5
                          ">

                            <h4 className="font-bold text-slate-900 dark:text-white mb-4">
                              Résumé de votre proposition
                            </h4>

                            <div className="space-y-4 text-sm">

                              <p className="text-slate-600 dark:text-slate-300">
                                <strong>Nom :</strong>{" "}
                                {form.prenom} {form.nom}
                              </p>

                              <p className="text-slate-600 dark:text-slate-300">
                                <strong>Pays :</strong>{" "}
                                {form.pays}
                              </p>

                              <p className="text-slate-600 dark:text-slate-300">
                                <strong>Titre :</strong>{" "}
                                {form.titre ||
                                  "Non renseigné"}
                              </p>

                              <p className="text-slate-600 dark:text-slate-300">
                                <strong>Catégorie :</strong>{" "}
                                {form.categorie ||
                                  "Non renseignée"}
                              </p>

                              <div>
                                <p className="font-bold text-slate-700 dark:text-slate-200">
                                  Description :
                                </p>

                                <p className="mt-1 text-slate-600 dark:text-slate-400 whitespace-pre-line line-clamp-4">
                                  {form.description ||
                                    "Non renseignée"}
                                </p>
                              </div>

                              {form.probleme.trim() && (
                                <div>
                                  <p className="font-bold text-purple-700 dark:text-purple-400">
                                    Problème :
                                  </p>

                                  <p className="mt-1 text-slate-600 dark:text-slate-400 whitespace-pre-line line-clamp-4">
                                    {form.probleme}
                                  </p>
                                </div>
                              )}

                              {form.solution.trim() && (
                                <div>
                                  <p className="font-bold text-cyan-700 dark:text-cyan-400">
                                    Solution :
                                  </p>

                                  <p className="mt-1 text-slate-600 dark:text-slate-400 whitespace-pre-line line-clamp-4">
                                    {form.solution}
                                  </p>
                                </div>
                              )}

                              {form.vision.trim() && (
                                <div>
                                  <p className="font-bold text-green-700 dark:text-green-400">
                                    Vision :
                                  </p>

                                  <p className="mt-1 text-slate-600 dark:text-slate-400 whitespace-pre-line line-clamp-4">
                                    {form.vision}
                                  </p>
                                </div>
                              )}

                              {form.impact.trim() && (
                                <div>
                                  <p className="font-bold text-orange-700 dark:text-orange-400">
                                    Impact :
                                  </p>

                                  <p className="mt-1 text-slate-600 dark:text-slate-400 whitespace-pre-line line-clamp-4">
                                    {form.impact}
                                  </p>
                                </div>
                              )}

                            </div>

                          </div>

                          {/* CONSENTEMENT */}

                          <div className="space-y-4">

                            <label className="
                              flex items-start gap-3
                              p-4
                              rounded-2xl
                              border border-slate-200 dark:border-slate-700
                              hover:bg-slate-50 dark:hover:bg-slate-800
                              transition
                              cursor-pointer
                            ">

                              <input
                                type="checkbox"
                                name="consentement_publication"
                                checked={
                                  form.consentement_publication
                                }
                                onChange={handleChange}
                                className="mt-1 w-5 h-5 accent-blue-600"
                              />

                              <span className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                                J'autorise CODE à publier mon idée
                                après son examen par l'équipe CODE.
                              </span>

                            </label>

                            <label className="
                              flex items-start gap-3
                              p-4
                              rounded-2xl
                              border border-slate-200 dark:border-slate-700
                              hover:bg-slate-50 dark:hover:bg-slate-800
                              transition
                              cursor-pointer
                            ">

                              <input
                                type="checkbox"
                                name="declaration_droits"
                                checked={
                                  form.declaration_droits
                                }
                                onChange={handleChange}
                                className="mt-1 w-5 h-5 accent-purple-600"
                              />

                              <span className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                                Je déclare que je souhaite soumettre
                                cette idée à CODE afin qu'elle puisse
                                être conservée et, après examen par
                                l'équipe CODE, publiée au bénéfice des
                                générations présentes et futures. Je
                                comprends que l'idée publiée est
                                destinée à être librement consultée,
                                étudiée, adaptée, développée et
                                éventuellement réalisée par toute
                                personne qui le souhaite, et que CODE
                                ne me garantit aucune exclusivité sur
                                sa réalisation.
                              </span>

                            </label>

                          </div>

                          <div className="
                            mt-5
                            rounded-xl
                            bg-blue-50 dark:bg-blue-950/30
                            border border-blue-100 dark:border-blue-900
                            p-4
                            text-sm
                            text-blue-800 dark:text-blue-200
                          ">
                            <strong>À savoir :</strong>{" "}
                            vos coordonnées personnelles ne seront pas
                            affichées sur la page publique. Elles restent
                            accessibles à l'équipe CODE pour les besoins
                            liés à votre soumission.
                          </div>

                          {isOffline && (
                            <div className="
                              mt-4
                              rounded-xl
                              bg-orange-50 dark:bg-orange-950/30
                              border border-orange-200 dark:border-orange-900
                              p-4
                              text-sm
                              text-orange-800 dark:text-orange-200
                            ">
                              <strong>Mode hors connexion :</strong>{" "}
                              votre idée sera enregistrée sur cet appareil
                              et envoyée automatiquement lorsque CODE
                              pourra de nouveau communiquer avec le serveur.
                            </div>
                          )}

                        </motion.div>
                      )}

                    </AnimatePresence>

                    {/* BOUTONS */}

                    <div className="
                      mt-8
                      flex flex-col-reverse sm:flex-row
                      sm:items-center
                      sm:justify-between
                      gap-3
                      border-t border-slate-200 dark:border-slate-800
                      pt-6
                    ">

                      <button
                        type="button"
                        onClick={
                          etape === 1
                            ? fermerFenetre
                            : allerEtapePrecedente
                        }
                        className="
                          inline-flex items-center justify-center gap-2
                          px-5 py-3
                          rounded-xl
                          border border-slate-300 dark:border-slate-700
                          text-slate-700 dark:text-slate-200
                          hover:bg-slate-100 dark:hover:bg-slate-800
                          font-semibold
                          transition
                        "
                      >
                        <ArrowLeft size={18} />
                        {etape === 1
                          ? "Annuler"
                          : "Précédent"}
                      </button>

                      {etape < 3 ? (
                        <button
                          type="button"
                          onClick={allerEtapeSuivante}
                          className="
                            inline-flex items-center justify-center gap-2
                            px-6 py-3
                            rounded-xl
                            bg-blue-600
                            hover:bg-blue-700
                            text-white
                            font-bold
                            transition
                            shadow-sm
                          "
                        >
                          Continuer
                          <ArrowRight size={18} />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={submitting}
                          className="
                            inline-flex items-center justify-center gap-2
                            px-7 py-3
                            rounded-xl
                            bg-gradient-to-r
                            from-blue-600
                            to-purple-600
                            hover:from-blue-700
                            hover:to-purple-700
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                            text-white
                            font-bold
                            transition
                            shadow-lg
                          "
                        >
                          {submitting ? (
                            <>
                              <Loader2
                                size={18}
                                className="animate-spin"
                              />
                              Envoi en cours...
                            </>
                          ) : (
                            <>
                              <Send size={18} />
                              {isOffline
                                ? "Enregistrer mon idée"
                                : "Soumettre mon idée"}
                            </>
                          )}
                        </button>
                      )}

                    </div>

                  </form>

                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =========================================================
            FENÊTRE : MÉMOIRE DES IDÉES
        ========================================================= */}

        <AnimatePresence>
          {fenetreActive === "memoire" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="
                fixed inset-0 z-50
                bg-black/60
                backdrop-blur-sm
                flex items-center justify-center
                p-4
              "
              onClick={fermerFenetre}
            >
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: 20,
                }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
                className="
                  w-full max-w-6xl
                  max-h-[92vh]
                  overflow-y-auto
                  rounded-3xl
                  bg-white dark:bg-slate-900
                  shadow-2xl
                "
              >

                {/* EN-TÊTE */}

                <div className="
                  sticky top-0 z-20
                  bg-white/95 dark:bg-slate-900/95
                  backdrop-blur
                  border-b border-slate-200 dark:border-slate-800
                  p-5 md:p-6
                ">

                  <div className="flex items-center justify-between gap-4">

                    <div className="flex items-center gap-4">

                      <div className="
                        w-12 h-12
                        rounded-2xl
                        bg-cyan-100 dark:bg-cyan-950/50
                        text-cyan-700 dark:text-cyan-300
                        flex items-center justify-center
                      ">
                        <Globe2 size={24} />
                      </div>

                      <div>

                        <div className="flex flex-wrap items-center gap-3">

                          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
                            La mémoire des idées
                          </h2>

                          <span className="
                            px-2.5 py-1
                            rounded-full
                            bg-blue-100 dark:bg-blue-950/50
                            text-blue-700 dark:text-blue-300
                            text-xs font-bold
                          ">
                            {projets.length}{" "}
                            {projets.length > 1
                              ? "idées"
                              : "idée"}
                          </span>

                        </div>

                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Les idées acceptées et publiées par CODE.
                        </p>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={fermerFenetre}
                      className="
                        w-10 h-10 shrink-0
                        rounded-full
                        bg-slate-100 dark:bg-slate-800
                        text-slate-500 dark:text-slate-300
                        hover:bg-slate-200 dark:hover:bg-slate-700
                        flex items-center justify-center
                        transition
                      "
                      aria-label="Fermer"
                    >
                      <X size={20} />
                    </button>

                  </div>

                </div>

                {/* LISTE */}

                <div className="p-6 md:p-8">

                  {loading && (
                    <div className="flex flex-col items-center justify-center py-20">

                      <Loader2
                        size={36}
                        className="animate-spin text-blue-600"
                      />

                      <p className="mt-4 text-slate-500 dark:text-slate-400">
                        Chargement de la mémoire des idées...
                      </p>

                    </div>
                  )}

                  {!loading &&
                    projets.length === 0 && (
                      <div className="text-center py-20">

                        <div className="
                          mx-auto
                          w-16 h-16
                          rounded-2xl
                          bg-slate-100 dark:bg-slate-800
                          flex items-center justify-center
                          text-slate-400
                        ">
                          <Lightbulb size={28} />
                        </div>

                        <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                          La mémoire est encore vide
                        </h3>

                        <p className="mt-2 max-w-md mx-auto text-sm text-slate-500 dark:text-slate-400">
                          Aucune idée n'a encore été publiée.
                          Vous pouvez être parmi les premières personnes
                          à transmettre une idée aux générations futures.
                        </p>

                        <button
                          type="button"
                          onClick={ouvrirSoumission}
                          className="
                            mt-6
                            inline-flex items-center gap-2
                            px-5 py-3
                            rounded-xl
                            bg-blue-600
                            hover:bg-blue-700
                            text-white
                            font-bold
                            transition
                          "
                        >
                          <Lightbulb size={18} />
                          Déposer une idée
                        </button>

                      </div>
                    )}

                  {!loading &&
                    projets.length > 0 && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                        {projets.map(
                          (projet, index) => (
                            <motion.article
                              key={projet.id}
                              initial={{
                                opacity: 0,
                                y: 15,
                              }}
                              animate={{
                                opacity: 1,
                                y: 0,
                              }}
                              transition={{
                                delay: Math.min(
                                  index * 0.05,
                                  0.4
                                ),
                              }}
                              className="
                                group
                                rounded-2xl
                                border border-slate-200 dark:border-slate-800
                                bg-slate-50/70 dark:bg-slate-800/40
                                p-5
                                hover:bg-white dark:hover:bg-slate-800
                                hover:shadow-lg
                                transition
                              "
                            >

                              <div className="flex flex-wrap gap-2 mb-3">

                                {projet.categorie && (
                                  <span className="
                                    px-2.5 py-1
                                    rounded-full
                                    bg-purple-100 dark:bg-purple-950/50
                                    text-purple-700 dark:text-purple-300
                                    text-xs font-bold
                                  ">
                                    {projet.categorie}
                                  </span>
                                )}

                                <span className="
                                  px-2.5 py-1
                                  rounded-full
                                  bg-green-100 dark:bg-green-950/50
                                  text-green-700 dark:text-green-300
                                  text-xs font-bold
                                ">
                                  Publié
                                </span>

                              </div>

                              <h3 className="
                                text-lg
                                font-extrabold
                                text-slate-900 dark:text-white
                                line-clamp-2
                              ">
                                {projet.titre}
                              </h3>

                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                {projet.prenom}{" "}
                                {projet.nom} ·{" "}
                                {projet.pays}
                              </p>

                              {projet.date_publication && (
                                <p className="text-xs text-slate-400 mt-1">
                                  Publié le{" "}
                                  {formatDate(
                                    projet.date_publication
                                  )}
                                </p>
                              )}

                              <p className="
                                mt-4
                                text-sm
                                text-slate-600 dark:text-slate-300
                                leading-relaxed
                                line-clamp-3
                              ">
                                {projet.description}
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  setProjetSelectionne(
                                    projet
                                  )
                                }
                                className="
                                  mt-5
                                  inline-flex items-center gap-2
                                  text-sm
                                  font-bold
                                  text-blue-600 dark:text-blue-400
                                  hover:text-blue-800 dark:hover:text-blue-300
                                  transition
                                "
                              >
                                Découvrir cette idée
                                <ArrowRight
                                  size={16}
                                  className="
                                    group-hover:translate-x-1
                                    transition
                                  "
                                />
                              </button>

                            </motion.article>
                          )
                        )}

                      </div>
                    )}

                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =========================================================
            FENÊTRE : COMMENT ÇA FONCTIONNE ?
        ========================================================= */}

        <AnimatePresence>
          {fenetreActive === "fonctionnement" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="
                fixed inset-0 z-50
                bg-black/60
                backdrop-blur-sm
                flex items-center justify-center
                p-4
              "
              onClick={fermerFenetre}
            >

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: 20,
                }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
                className="
                  w-full
                  max-w-2xl
                  max-h-[90vh]
                  overflow-y-auto
                  rounded-3xl
                  bg-white dark:bg-slate-900
                  shadow-2xl
                "
              >

                {/* HEADER */}

                <div className="
                  flex items-center justify-between
                  gap-4
                  p-6
                  border-b border-slate-200 dark:border-slate-800
                ">

                  <div className="flex items-center gap-3">

                    <div className="
                      w-11 h-11
                      rounded-xl
                      bg-purple-100 dark:bg-purple-950/50
                      text-purple-700 dark:text-purple-300
                      flex items-center justify-center
                    ">
                      <FileText size={22} />
                    </div>

                    <div>

                      <h2 className="
                        text-xl md:text-2xl
                        font-extrabold
                        text-slate-900 dark:text-white
                      ">
                        Comment fonctionne cette mémoire ?
                      </h2>

                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Le parcours d'une idée sur CODE.
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={fermerFenetre}
                    className="
                      w-10 h-10 shrink-0
                      rounded-full
                      bg-slate-100 dark:bg-slate-800
                      text-slate-500 dark:text-slate-300
                      hover:bg-slate-200 dark:hover:bg-slate-700
                      flex items-center justify-center
                      transition
                    "
                    aria-label="Fermer"
                  >
                    <X size={20} />
                  </button>

                </div>

                {/* CONTENU */}

                <div className="p-6 md:p-8">

                  <div className="space-y-5">

                    {/* ÉTAPE 1 */}

                    <div className="
                      flex gap-4
                      p-5
                      rounded-2xl
                      bg-blue-50 dark:bg-blue-950/30
                      border border-blue-100 dark:border-blue-900
                    ">

                      <div className="
                        w-10 h-10 shrink-0
                        rounded-full
                        bg-blue-600
                        text-white
                        flex items-center justify-center
                        font-bold
                      ">
                        1
                      </div>

                      <div>

                        <h3 className="font-bold text-slate-900 dark:text-white">
                          Vous transmettez votre idée
                        </h3>

                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          Toute personne peut soumettre une idée, un
                          rêve ou un projet qu'elle souhaite laisser
                          comme trace pour les générations futures.
                        </p>

                      </div>

                    </div>

                    {/* ÉTAPE 2 */}

                    <div className="
                      flex gap-4
                      p-5
                      rounded-2xl
                      bg-purple-50 dark:bg-purple-950/30
                      border border-purple-100 dark:border-purple-900
                    ">

                      <div className="
                        w-10 h-10 shrink-0
                        rounded-full
                        bg-purple-600
                        text-white
                        flex items-center justify-center
                        font-bold
                      ">
                        2
                      </div>

                      <div>

                        <h3 className="font-bold text-slate-900 dark:text-white">
                          CODE examine la proposition
                        </h3>

                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          L'équipe CODE examine les propositions avant
                          leur publication. Une idée n'apparaît donc
                          pas automatiquement dans la mémoire publique.
                        </p>

                      </div>

                    </div>

                    {/* ÉTAPE 3 */}

                    <div className="
                      flex gap-4
                      p-5
                      rounded-2xl
                      bg-green-50 dark:bg-green-950/30
                      border border-green-100 dark:border-green-900
                    ">

                      <div className="
                        w-10 h-10 shrink-0
                        rounded-full
                        bg-green-600
                        text-white
                        flex items-center justify-center
                        font-bold
                      ">
                        3
                      </div>

                      <div>

                        <h3 className="font-bold text-slate-900 dark:text-white">
                          L'idée peut entrer dans la mémoire
                        </h3>

                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          Lorsqu'une idée est acceptée puis publiée,
                          elle devient accessible aux générations
                          présentes et futures.
                        </p>

                      </div>

                    </div>

                    {/* MESSAGE FINAL */}

                    <div className="
                      mt-6
                      p-5
                      rounded-2xl
                      bg-slate-100 dark:bg-slate-800
                      border border-slate-200 dark:border-slate-700
                    ">

                      <div className="flex items-start gap-3">

                        <Sparkles
                          size={20}
                          className="text-blue-600 shrink-0 mt-0.5"
                        />

                        <p className="
                          text-sm
                          text-slate-600 dark:text-slate-300
                          leading-relaxed
                        ">
                          L'objectif de CODE est simple :
                          <strong className="text-slate-900 dark:text-white">
                            {" "}ne pas laisser disparaître une idée
                            simplement parce que son auteur n'a pas
                            eu les moyens ou les circonstances
                            nécessaires pour la réaliser.
                          </strong>
                        </p>

                      </div>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={fermerFenetre}
                    className="
                      mt-7
                      w-full
                      px-5 py-3
                      rounded-xl
                      bg-slate-900 dark:bg-white
                      text-white dark:text-slate-900
                      font-bold
                      hover:opacity-90
                      transition
                    "
                  >
                    J'ai compris
                  </button>

                </div>

              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* =========================================================
            FENÊTRE : DÉTAIL D'UNE IDÉE
        ========================================================= */}

        <AnimatePresence>
          {projetSelectionne && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="
                fixed inset-0 z-[60]
                bg-black/70
                backdrop-blur-sm
                flex items-center justify-center
                p-4
              "
              onClick={() =>
                setProjetSelectionne(null)
              }
            >

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: 20,
                }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
                className="
                  w-full max-w-3xl
                  max-h-[90vh]
                  overflow-y-auto
                  rounded-3xl
                  bg-white dark:bg-slate-900
                  shadow-2xl
                "
              >

                {/* HEADER */}

                <div className="
                  sticky top-0 z-10
                  bg-white/95 dark:bg-slate-900/95
                  backdrop-blur
                  border-b border-slate-200 dark:border-slate-800
                  p-5 md:p-6
                ">

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <div className="flex flex-wrap gap-2 mb-3">

                        {projetSelectionne.categorie && (
                          <span className="
                            px-2.5 py-1
                            rounded-full
                            bg-purple-100 dark:bg-purple-950/50
                            text-purple-700 dark:text-purple-300
                            text-xs font-bold
                          ">
                            {projetSelectionne.categorie}
                          </span>
                        )}

                        <span className="
                          px-2.5 py-1
                          rounded-full
                          bg-green-100 dark:bg-green-950/50
                          text-green-700 dark:text-green-300
                          text-xs font-bold
                        ">
                          Publié
                        </span>

                      </div>

                      <h2 className="
                        text-2xl md:text-3xl
                        font-extrabold
                        text-slate-900 dark:text-white
                      ">
                        {projetSelectionne.titre}
                      </h2>

                      <p className="
                        text-sm
                        text-slate-500 dark:text-slate-400
                        mt-2
                      ">
                        Une idée transmise à la mémoire de CODE par{" "}
                        <strong>
                          {projetSelectionne.prenom}{" "}
                          {projetSelectionne.nom}
                        </strong>{" "}
                        — {projetSelectionne.pays}
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setProjetSelectionne(null)
                      }
                      className="
                        w-10 h-10 shrink-0
                        rounded-full
                        bg-slate-100 dark:bg-slate-800
                        text-slate-500 dark:text-slate-300
                        hover:bg-slate-200 dark:hover:bg-slate-700
                        flex items-center justify-center
                        transition
                      "
                      aria-label="Fermer"
                    >
                      <X size={20} />
                    </button>

                  </div>

                </div>

                {/* CONTENU */}

                <div className="p-6 md:p-8 space-y-7">

                  {/* L'IDÉE */}

                  <div>

                    <h3 className="
                      text-sm
                      uppercase
                      tracking-wider
                      font-bold
                      text-blue-600 dark:text-blue-400
                    ">
                      L'idée
                    </h3>

                    <p className="
                      mt-3
                      text-slate-700 dark:text-slate-300
                      leading-relaxed
                      whitespace-pre-line
                    ">
                      {projetSelectionne.description}
                    </p>

                  </div>

                  {/* LE PROBLÈME */}

                  {projetSelectionne.probleme && (
                    <div>

                      <h3 className="
                        text-sm
                        uppercase
                        tracking-wider
                        font-bold
                        text-purple-600 dark:text-purple-400
                      ">
                        Le problème
                      </h3>

                      <p className="
                        mt-3
                        text-slate-700 dark:text-slate-300
                        leading-relaxed
                        whitespace-pre-line
                      ">
                        {projetSelectionne.probleme}
                      </p>

                    </div>
                  )}

                  {/* LA SOLUTION */}

                  {projetSelectionne.solution && (
                    <div>

                      <h3 className="
                        text-sm
                        uppercase
                        tracking-wider
                        font-bold
                        text-cyan-600 dark:text-cyan-400
                      ">
                        La solution
                      </h3>

                      <p className="
                        mt-3
                        text-slate-700 dark:text-slate-300
                        leading-relaxed
                        whitespace-pre-line
                      ">
                        {projetSelectionne.solution}
                      </p>

                    </div>
                  )}

                  {/* LA VISION */}

                  {projetSelectionne.vision && (
                    <div>

                      <h3 className="
                        text-sm
                        uppercase
                        tracking-wider
                        font-bold
                        text-green-600 dark:text-green-400
                      ">
                        La vision
                      </h3>

                      <p className="
                        mt-3
                        text-slate-700 dark:text-slate-300
                        leading-relaxed
                        whitespace-pre-line
                      ">
                        {projetSelectionne.vision}
                      </p>

                    </div>
                  )}

                  {/* L'IMPACT */}

                  {projetSelectionne.impact && (
                    <div>

                      <h3 className="
                        text-sm
                        uppercase
                        tracking-wider
                        font-bold
                        text-orange-600 dark:text-orange-400
                      ">
                        L'impact
                      </h3>

                      <p className="
                        mt-3
                        text-slate-700 dark:text-slate-300
                        leading-relaxed
                        whitespace-pre-line
                      ">
                        {projetSelectionne.impact}
                      </p>

                    </div>
                  )}

                  {/* DATE */}

                  {projetSelectionne.date_publication && (
                    <div className="
                      pt-5
                      border-t border-slate-200 dark:border-slate-800
                      text-sm
                      text-slate-500 dark:text-slate-400
                    ">
                      Cette idée a été publiée dans la mémoire de CODE
                      le{" "}
                      {formatDate(
                        projetSelectionne.date_publication
                      )}
                      .
                    </div>
                  )}

                </div>

              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* =========================================================
            PIED DE PAGE
        ========================================================= */}

        <footer className="text-center py-10">

          <div className="
            inline-flex items-center gap-2
            text-slate-400 dark:text-slate-600
            text-sm
          ">
            <Sparkles size={15} />

            <span>
              CODE — Préserver les idées. Transmettre les rêves.
            </span>
          </div>

        </footer>

      </div>
    </motion.div>
  );
};

export default Projets;