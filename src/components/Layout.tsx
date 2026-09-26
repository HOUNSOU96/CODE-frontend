// 📁 Layout.tsx

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "@/context/AuthContext";

import {
  useExitNotifier,
} from "@/hooks/useExitNotifier";

import {
  LogOut,
  MessageCircle,
  GraduationCap,
  Users,
  Languages,
  RotateCcw,
  Loader2,
} from "lucide-react";

import api from "@/utils/axios";

import AudioManager from "@/components/AudioManager";

// ============================================================
// 🖼️ IMAGES DU DIAPORAMA
// ============================================================

const images = [
  "/images/b1.jpg",
  "/images/b2.jpg",
  "/images/b3.webp",
  "/images/b4.jpg",
  "/images/b5.jpeg",
  "/images/b6.jpeg",
  "/images/b7.jpg",
  "/images/b8.jpeg",
  "/images/b9.jpeg",
  "/images/b10.avif",
  "/images/b11.jpeg",
  "/images/b12.jpeg",
  "/images/b13.jpg",
  "/images/b14.jpg",
  "/images/b15.webp",
  "/images/b16.avif",
  "/images/b17.jpeg",
  "/images/b18.webp",
  "/images/b25.jpg",
  "/images/b28.webp",
  "/images/b27.jpg",
  "/images/b19.jpg",
  "/images/b21.jpg",
  "/images/b20.jpg",
  "/images/b24.jpg",
  "/images/b26.jpg",
  "/images/b22.jpeg",
  "/images/b23.webp",
  "/images/b29.jpg",
  "/images/b30.avif",
  "/images/b31.jpg",
  "/images/b32.jpg",
  "/images/b33.jpg",
  "/images/b34.jpg",
  "/images/b35.png",
  "/images/b36.jpg",
  "/images/b37.jpg",
  "/images/b38.png",
  "/images/b39.jpg",
  "/images/b40.jpg",
  "/images/b41.jpg",
  "/images/b42.jpg",
  "/images/b43.jpg",
];

// ============================================================
// 🔑 CLÉS LOCALSTORAGE
// ============================================================

const CLE_LANGUE_TRADUCTION =
  "CODE_language_preference";

const CLE_CACHE_TRADUCTION =
  "CODE_translation_cache_fr_en";

// ============================================================
// TYPES
// ============================================================

interface LayoutProps {
  children: React.ReactNode;
}

// ============================================================
// TYPES TRADUCTION
// ============================================================

interface TexteTraduit {
  node: Text;
  original: string;
}

// ============================================================
// COMPONENT
// ============================================================

const Layout: React.FC<LayoutProps> = ({
  children,
}) => {
  // ==========================================================
  // 🌆 DIAPORAMA
  // ==========================================================

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [
    isVisible,
    setIsVisible,
  ] = useState(true);

  // ==========================================================
  // 🌐 ÉTAT TRADUCTION
  // ==========================================================

  const [
    traductionActive,
    setTraductionActive,
  ] = useState(false);

  const [
    traductionEnCours,
    setTraductionEnCours,
  ] = useState(false);

  const [
    erreurTraduction,
    setErreurTraduction,
  ] = useState<string | null>(null);

  // ==========================================================
  // 🌐 RÉFÉRENCE DU CONTENU
  // ==========================================================

  const contenuPrincipalRef =
    useRef<HTMLElement | null>(null);

  // ==========================================================
  // 🇫🇷 TEXTES TRADUITS
  // ==========================================================

  const textesTraduitsRef =
    useRef<TexteTraduit[]>([]);

  // ==========================================================
  // 🔒 VERROU DE TRADUCTION
  // ==========================================================

  const traductionLockRef =
    useRef(false);

  // ==========================================================
  // 🌐 ÉTAT RÉEL DE LA TRADUCTION
  // ==========================================================

  const traductionActiveRef =
    useRef(false);

  // ==========================================================
  // 👀 MUTATION OBSERVER
  // ==========================================================

  const observerRef =
    useRef<MutationObserver | null>(null);

  // ==========================================================
  // 📦 FILE DES NOUVEAUX TEXTES
  // ==========================================================

  const mutationQueueRef =
    useRef<Text[]>([]);

  // ==========================================================
  // ⏱️ TIMER DE REGROUPEMENT
  // ==========================================================

  const mutationTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  // ==========================================================
  // 🔒 VERROU DES MUTATIONS
  // ==========================================================

  const traductionMutationLockRef =
    useRef(false);

  // ==========================================================
  // 🧠 MÉMORISATION DES DERNIÈRES TRADUCTIONS
  // ==========================================================

  const derniereTraductionRef =
    useRef<WeakMap<Text, string>>(
      new WeakMap()
    );

  // ==========================================================
  // 💾 CACHE GLOBAL FR → EN
  // ==========================================================

  const cacheTraductionsRef =
    useRef<Map<string, string>>(
      new Map()
    );

  // ==========================================================
  // 🚀 INITIALISATION DE LA PRÉFÉRENCE
  // ==========================================================

  const traductionInitialiseeRef =
    useRef(false);

  // ==========================================================
  // ROUTER
  // ==========================================================

  const location =
    useLocation();

  const navigate =
    useNavigate();

  // ==========================================================
  // AUTHENTIFICATION
  // ==========================================================

  const {
    user,
    logout,
  } = useAuth();

  // ==========================================================
  // 🔔 NOTIFICATIONS CONNEXION / DÉCONNEXION
  // ==========================================================

  useExitNotifier({
    eventType: "connect",
  });

  useExitNotifier({
    eventType: "disconnect",
  });

  useEffect(() => {
    if (!user?.email) {
      return;
    }

    const notify = async (
      eventType:
        | "connect"
        | "disconnect"
    ) => {
      try {
        await api.post(
          `/api/notify/${eventType}`,
          {
            email: user.email,
          }
        );
      } catch (err) {
        console.error(
          `Erreur envoi notif ${eventType}:`,
          err
        );
      }
    };

    const isInternalUrl = (
      url: string
    ) =>
      window.location.origin &&
      url.startsWith(
        window.location.origin
      );

    const handleBeforeUnload =
      () => {
        notify("disconnect");
      };

    const handleVisibilityChange =
      () => {
        if (
          document.visibilityState ===
          "hidden"
        ) {
          notify("disconnect");
        } else if (
          document.visibilityState ===
            "visible" &&
          isInternalUrl(
            window.location.href
          )
        ) {
          notify("connect");
        }
      };

    const handleBlur = () => {
      if (!document.hidden) {
        notify("disconnect");
      }
    };

    const handleFocus = () => {
      if (
        !document.hidden &&
        isInternalUrl(
          window.location.href
        )
      ) {
        notify("connect");
      }
    };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener(
      "blur",
      handleBlur
    );

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener(
        "blur",
        handleBlur
      );

      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [user]);

  // ============================================================
  // 🌆 DIAPORAMA BACKGROUND
  // ============================================================

  useEffect(() => {
    const interval =
      setInterval(() => {
        setIsVisible(false);

        setTimeout(() => {
          setCurrentIndex(
            (prev) =>
              (prev + 1) %
              images.length
          );

          setIsVisible(true);
        }, 1000);
      }, 6000);

    return () =>
      clearInterval(interval);
  }, []);

  // ============================================================
  // 💾 CHARGER LE CACHE DES TRADUCTIONS
  // ============================================================

  useEffect(() => {
    try {
      const sauvegarde =
        localStorage.getItem(
          CLE_CACHE_TRADUCTION
        );

      if (!sauvegarde) {
        return;
      }

      const donnees =
        JSON.parse(sauvegarde);

      if (
        Array.isArray(donnees)
      ) {
        cacheTraductionsRef.current =
          new Map(donnees);
      }
    } catch (error) {
      console.error(
        "Erreur chargement cache traduction :",
        error
      );
    }
  }, []);

  // ============================================================
  // 🌐 CHARGER LA LANGUE SAUVEGARDÉE
  // ============================================================

  useEffect(() => {
    if (
      traductionInitialiseeRef.current
    ) {
      return;
    }

    traductionInitialiseeRef.current =
      true;

    const langueSauvegardee =
      localStorage.getItem(
        CLE_LANGUE_TRADUCTION
      );

    if (
      langueSauvegardee === "en"
    ) {
      traductionActiveRef.current =
        true;

      setTraductionActive(true);
    }
  }, []);

  // ============================================================
  // 🌐 SYNCHRONISER LA REF DE TRADUCTION
  // ============================================================

  useEffect(() => {
    traductionActiveRef.current =
      traductionActive;

    if (
      traductionInitialiseeRef.current
    ) {
      localStorage.setItem(
        CLE_LANGUE_TRADUCTION,
        traductionActive
          ? "en"
          : "fr"
      );
    }
  }, [traductionActive]);

  // ============================================================
  // 🌐 TESTER SI UN TEXT NODE EST TRADUISIBLE
  // ============================================================

  const estNoeudTraduisible = (
    node: Text
  ): boolean => {
    if (!node) {
      return false;
    }

    if (!node.isConnected) {
      return false;
    }

    const parent =
      node.parentElement;

    if (!parent) {
      return false;
    }

    const texte =
      node.textContent ?? "";

    const texteNettoye =
      texte.trim();

    // ----------------------------------------------------------
    // Texte vide
    // ----------------------------------------------------------

    if (!texteNettoye) {
      return false;
    }

    // ----------------------------------------------------------
    // Éléments techniques
    // ----------------------------------------------------------

    let element:
      | HTMLElement
      | null =
      parent;

    while (element) {
      const tag =
        element.tagName.toLowerCase();

      if (
        [
          "script",
          "style",
          "code",
          "pre",
          "textarea",
          "input",
          "select",
          "option",
          "noscript",
        ].includes(tag)
      ) {
        return false;
      }

      // --------------------------------------------------------
      // Éléments explicitement exclus
      // --------------------------------------------------------

      if (
        element.hasAttribute(
          "data-no-translate"
        )
      ) {
        return false;
      }

      if (
        element.classList.contains(
          "notranslate"
        )
      ) {
        return false;
      }

      element =
        element.parentElement;
    }

    // ----------------------------------------------------------
    // Texte purement numérique / symbolique
    // ----------------------------------------------------------

    if (
      /^[\d\s.,:%/+−\-×÷=<>()[\]{}]+$/.test(
        texteNettoye
      )
    ) {
      return false;
    }

    // ----------------------------------------------------------
    // Caractère isolé
    // ----------------------------------------------------------

    if (
      texteNettoye.length === 1 &&
      !/[a-zA-ZÀ-ÿ]/.test(
        texteNettoye
      )
    ) {
      return false;
    }

    return true;
  };

  // ============================================================
  // 🌐 EXTRACTION DES TEXTES DE TOUTE L'APPLICATION
  // ============================================================

  const obtenirTextesTraduisibles =
    (): TexteTraduit[] => {
      const root =
        document.getElementById(
          "root"
        );

      if (!root) {
        return [];
      }

      const textes: TexteTraduit[] =
        [];

      const walker =
        document.createTreeWalker(
          root,
          NodeFilter.SHOW_TEXT
        );

      let currentNode =
        walker.nextNode();

      while (currentNode) {
        const node =
          currentNode as Text;

        if (
          estNoeudTraduisible(node)
        ) {
          textes.push({
            node,
            original:
              node.textContent || "",
          });
        }

        currentNode =
          walker.nextNode();
      }

      return textes;
    };

  // ============================================================
  // 🔍 EXTRAIRE LES TEXTES D'UN NOUVEAU NOEUD
  // ============================================================

  const extraireTextesDuNoeud =
    (
      node: Node
    ): Text[] => {
      const resultat: Text[] =
        [];

      // --------------------------------------------------------
      // Text node
      // --------------------------------------------------------

      if (
        node.nodeType ===
        Node.TEXT_NODE
      ) {
        const textNode =
          node as Text;

        if (
          estNoeudTraduisible(
            textNode
          )
        ) {
          resultat.push(
            textNode
          );
        }

        return resultat;
      }

      // --------------------------------------------------------
      // Élément HTML
      // --------------------------------------------------------

      if (
        node.nodeType !==
        Node.ELEMENT_NODE
      ) {
        return resultat;
      }

      const element =
        node as HTMLElement;

      if (
        element.hasAttribute(
          "data-no-translate"
        ) ||
        element.classList.contains(
          "notranslate"
        )
      ) {
        return resultat;
      }

      const walker =
        document.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT
        );

      let current =
        walker.nextNode();

      while (current) {
        const textNode =
          current as Text;

        if (
          estNoeudTraduisible(
            textNode
          )
        ) {
          resultat.push(
            textNode
          );
        }

        current =
          walker.nextNode();
      }

      return resultat;
    };

  // ============================================================
  // 📦 AJOUTER UN NOEUD À LA FILE
  // ============================================================

  const ajouterNoeudAFile =
    (
      node: Text
    ) => {
      if (
        !traductionActiveRef.current
      ) {
        return;
      }

      if (
        !estNoeudTraduisible(node)
      ) {
        return;
      }

      const texteActuel =
        node.textContent ?? "";

      // --------------------------------------------------------
      // Si c'est exactement notre dernière traduction,
      // ne pas retraduire.
      // --------------------------------------------------------

      const derniereTraduction =
        derniereTraductionRef.current.get(
          node
        );

      if (
        derniereTraduction !==
          undefined &&
        texteActuel ===
          derniereTraduction
      ) {
        return;
      }

      // --------------------------------------------------------
      // Éviter les doublons
      // --------------------------------------------------------

      if (
        mutationQueueRef.current.includes(
          node
        )
      ) {
        return;
      }

      mutationQueueRef.current.push(
        node
      );

      // --------------------------------------------------------
      // Lancer le traitement groupé
      // --------------------------------------------------------

      if (
        mutationTimerRef.current ===
        null
      ) {
        mutationTimerRef.current =
          setTimeout(() => {
            mutationTimerRef.current =
              null;

            void traiterFileTraduction();
          }, 150);
      }
    };

  // ============================================================
  // 🌐 TRADUIRE UN LOT DE TEXTES
  // ============================================================

  const traduireLot = async (
    textes: TexteTraduit[]
  ) => {
    if (!textes.length) {
      return;
    }

    const textesValides =
      textes.filter(
        (item) =>
          item.node.isConnected &&
          item.original.trim()
      );

    if (
      !textesValides.length
    ) {
      return;
    }

    // ----------------------------------------------------------
    // Séparer les textes déjà présents dans le cache
    // ----------------------------------------------------------

    const textesSansCache:
      TexteTraduit[] = [];

    textesValides.forEach(
      (item) => {
        const traductionEnCache =
          cacheTraductionsRef.current.get(
            item.original
          );

        // ------------------------------------------------------
        // TRADUCTION DÉJÀ EN CACHE
        // ------------------------------------------------------

        if (
          traductionEnCache !==
          undefined
        ) {
          if (
            item.node.isConnected
          ) {
            const existeDeja =
              textesTraduitsRef.current.some(
                (ancien) =>
                  ancien.node ===
                  item.node
              );

            if (!existeDeja) {
              textesTraduitsRef.current.push(
                {
                  node: item.node,
                  original:
                    item.original,
                }
              );
            }

            derniereTraductionRef.current.set(
              item.node,
              traductionEnCache
            );

            item.node.textContent =
              traductionEnCache;
          }

          return;
        }

        textesSansCache.push(
          item
        );
      }
    );

    // ----------------------------------------------------------
    // Tout était déjà dans le cache
    // ----------------------------------------------------------

    if (
      !textesSansCache.length
    ) {
      return;
    }

    // ----------------------------------------------------------
    // TEXTES À ENVOYER À ARGOS
    // ----------------------------------------------------------

    const textesOriginaux =
      textesSansCache.map(
        (item) =>
          item.original
      );

    const response =
      await api.post(
        "/api/translate/page",
        {
          source_language: "fr",
          target_language: "en",
          texts: textesOriginaux,
        }
      );

    const translations =
      response.data?.translations;

    if (
      !Array.isArray(
        translations
      )
    ) {
      throw new Error(
        "Réponse de traduction invalide."
      );
    }

    if (
      translations.length !==
      textesSansCache.length
    ) {
      throw new Error(
        "Le nombre de traductions reçues ne correspond pas au nombre de textes envoyés."
      );
    }

    traductionMutationLockRef.current =
      true;

    // ----------------------------------------------------------
    // APPLIQUER LES NOUVELLES TRADUCTIONS
    // ----------------------------------------------------------

    for (
      let index = 0;
      index <
      textesSansCache.length;
      index++
    ) {
      const item =
        textesSansCache[index];

      const traduction =
        translations[index];

      if (
        !item.node.isConnected
      ) {
        continue;
      }

      if (
        typeof traduction !==
        "string"
      ) {
        continue;
      }

      // --------------------------------------------------------
      // Sauvegarder le texte français
      // --------------------------------------------------------

      const existeDeja =
        textesTraduitsRef.current.some(
          (ancien) =>
            ancien.node ===
            item.node
        );

      if (!existeDeja) {
        textesTraduitsRef.current.push(
          {
            node: item.node,
            original:
              item.original,
          }
        );
      }

      // --------------------------------------------------------
      // Mémoriser la traduction du noeud
      // --------------------------------------------------------

      derniereTraductionRef.current.set(
        item.node,
        traduction
      );

      // --------------------------------------------------------
      // 💾 Ajouter au cache global
      // --------------------------------------------------------

      cacheTraductionsRef.current.set(
        item.original,
        traduction
      );

      // --------------------------------------------------------
      // Remplacer dans le DOM
      // --------------------------------------------------------

      item.node.textContent =
        traduction;
    }

    // ----------------------------------------------------------
    // 💾 Sauvegarder le cache
    // ----------------------------------------------------------

    try {
      localStorage.setItem(
        CLE_CACHE_TRADUCTION,
        JSON.stringify(
          Array.from(
            cacheTraductionsRef.current.entries()
          )
        )
      );
    } catch (error) {
      console.error(
        "Erreur sauvegarde cache traduction :",
        error
      );
    }

    // ----------------------------------------------------------
    // Laisser MutationObserver absorber les mutations
    // ----------------------------------------------------------

    setTimeout(() => {
      traductionMutationLockRef.current =
        false;
    }, 0);
  };

  // ============================================================
  // 📦 TRAITER LA FILE
  // ============================================================

  const traiterFileTraduction =
    async () => {
      if (
        !traductionActiveRef.current
      ) {
        mutationQueueRef.current =
          [];

        return;
      }

      if (
        !mutationQueueRef.current
          .length
      ) {
        return;
      }

      const nodes =
        Array.from(
          new Set(
            mutationQueueRef.current
          )
        );

      mutationQueueRef.current =
        [];

      const textes: TexteTraduit[] =
        nodes
          .filter(
            (node) =>
              estNoeudTraduisible(
                node
              )
          )
          .map((node) => ({
            node,
            original:
              node.textContent || "",
          }));

      if (!textes.length) {
        return;
      }

      try {
        setTraductionEnCours(
          true
        );

        await traduireLot(
          textes
        );
      } catch (error) {
        console.error(
          "Erreur traduction nouveau contenu :",
          error
        );

        setErreurTraduction(
          "Un nouveau contenu n'a pas pu être traduit."
        );

        setTimeout(() => {
          setErreurTraduction(
            null
          );
        }, 4000);
      } finally {
        setTraductionEnCours(
          false
        );
      }

      // --------------------------------------------------------
      // Des mutations peuvent être arrivées pendant
      // la traduction.
      // --------------------------------------------------------

      if (
        traductionActiveRef.current &&
        mutationQueueRef.current
          .length
      ) {
        if (
          mutationTimerRef.current ===
          null
        ) {
          mutationTimerRef.current =
            setTimeout(() => {
              mutationTimerRef.current =
                null;

              void traiterFileTraduction();
            }, 150);
        }
      }
    };

  // ============================================================
  // 👀 MUTATION OBSERVER
  // ============================================================

  const gererMutations =
    (
      mutations: MutationRecord[]
    ) => {
      if (
        !traductionActiveRef.current
      ) {
        return;
      }

      // --------------------------------------------------------
      // Si une traduction est en train de modifier le DOM,
      // on laisse cette opération se terminer.
      // --------------------------------------------------------

      if (
        traductionMutationLockRef.current
      ) {
        return;
      }

      for (
        const mutation of mutations
      ) {
        // ======================================================
        // NOUVEAUX ÉLÉMENTS
        // ======================================================

        if (
          mutation.type ===
          "childList"
        ) {
          mutation.addedNodes.forEach(
            (addedNode) => {
              const textes =
                extraireTextesDuNoeud(
                  addedNode
                );

              textes.forEach(
                (node) => {
                  ajouterNoeudAFile(
                    node
                  );
                }
              );
            }
          );
        }

        // ======================================================
        // TEXTE MODIFIÉ
        // ======================================================

        if (
          mutation.type ===
          "characterData"
        ) {
          const node =
            mutation.target as Text;

          if (
            !node.isConnected
          ) {
            continue;
          }

          const texteActuel =
            node.textContent || "";

          const derniereTraduction =
            derniereTraductionRef.current.get(
              node
            );

          // ----------------------------------------------------
          // Mutation créée par notre traduction
          // ----------------------------------------------------

          if (
            derniereTraduction !==
              undefined &&
            texteActuel ===
              derniereTraduction
          ) {
            continue;
          }

          // ----------------------------------------------------
          // Nouveau texte
          // ----------------------------------------------------

          ajouterNoeudAFile(
            node
          );
        }
      }
    };

  // ============================================================
  // 👀 INSTALLER L'OBSERVER
  // ============================================================

  useEffect(() => {
    if (
      !traductionActive
    ) {
      observerRef.current?.disconnect();

      observerRef.current =
        null;

      return;
    }

    const root =
      document.getElementById(
        "root"
      );

    if (!root) {
      return;
    }

    const observer =
      new MutationObserver(
        gererMutations
      );

    observer.observe(
      root,
      {
        subtree: true,
        childList: true,
        characterData: true,
        characterDataOldValue: true,
      }
    );

    observerRef.current =
      observer;

    return () => {
      observer.disconnect();

      if (
        observerRef.current ===
        observer
      ) {
        observerRef.current =
          null;
      }
    };
  }, [traductionActive]);

  // ============================================================
  // 🌐 TRADUIRE LA PAGE
  // ============================================================

  const traduirePage =
    async () => {
      if (
        traductionEnCours ||
        traductionLockRef.current
      ) {
        return;
      }

      traductionLockRef.current =
        true;

      setErreurTraduction(
        null
      );

      try {
        const textes =
          obtenirTextesTraduisibles();

        if (!textes.length) {
          setErreurTraduction(
            "Aucun contenu textuel à traduire sur cette page."
          );

          return;
        }

        setTraductionEnCours(
          true
        );

        // ------------------------------------------------------
        // IMPORTANT :
        // traduireLot utilise maintenant le cache.
        // ------------------------------------------------------

        await traduireLot(
          textes
        );

        // ------------------------------------------------------
        // ACTIVER LE MODE ANGLAIS
        // ------------------------------------------------------

        traductionActiveRef.current =
          true;

        setTraductionActive(
          true
        );

        // ------------------------------------------------------
        // 💾 MÉMORISER LE CHOIX DE L'UTILISATEUR
        // ------------------------------------------------------

        localStorage.setItem(
          CLE_LANGUE_TRADUCTION,
          "en"
        );

        // ------------------------------------------------------
        // Traiter les textes éventuellement apparus
        // pendant la traduction initiale.
        // ------------------------------------------------------

        setTimeout(() => {
          traductionMutationLockRef.current =
            false;

          const nouveauxTextes =
            obtenirTextesTraduisibles();

          nouveauxTextes.forEach(
            (item) => {
              const derniereTraduction =
                derniereTraductionRef.current.get(
                  item.node
                );

              if (
                derniereTraduction !==
                item.node.textContent
              ) {
                ajouterNoeudAFile(
                  item.node
                );
              }
            }
          );
        }, 0);
      } catch (error) {
        console.error(
          "Erreur traduction de la page :",
          error
        );

        // ------------------------------------------------------
        // RESTAURATION EN CAS D'ERREUR
        // ------------------------------------------------------

        textesTraduitsRef.current.forEach(
          (item) => {
            if (
              item.node &&
              item.node.isConnected
            ) {
              item.node.textContent =
                item.original;
            }
          }
        );

        textesTraduitsRef.current =
          [];

        traductionActiveRef.current =
          false;

        setTraductionActive(
          false
        );

        localStorage.setItem(
          CLE_LANGUE_TRADUCTION,
          "fr"
        );

        setErreurTraduction(
          "Impossible de traduire cette page pour le moment."
        );
      } finally {
        setTraductionEnCours(
          false
        );

        traductionLockRef.current =
          false;

        setTimeout(() => {
          traductionMutationLockRef.current =
            false;
        }, 0);
      }
    };

  // ============================================================
  // 🇫🇷 REVENIR AU FRANÇAIS
  // ============================================================

  const restaurerFrancais =
    () => {
      // --------------------------------------------------------
      // 💾 Mémoriser le choix français
      // --------------------------------------------------------

      localStorage.setItem(
        CLE_LANGUE_TRADUCTION,
        "fr"
      );

      // --------------------------------------------------------
      // Désactiver le système
      // --------------------------------------------------------

      traductionActiveRef.current =
        false;

      setTraductionActive(
        false
      );

      // --------------------------------------------------------
      // Arrêter l'observer
      // --------------------------------------------------------

      observerRef.current?.disconnect();

      observerRef.current =
        null;

      // --------------------------------------------------------
      // Annuler le timer
      // --------------------------------------------------------

      if (
        mutationTimerRef.current !==
        null
      ) {
        clearTimeout(
          mutationTimerRef.current
        );

        mutationTimerRef.current =
          null;
      }

      // --------------------------------------------------------
      // Vider la file
      // --------------------------------------------------------

      mutationQueueRef.current =
        [];

      // --------------------------------------------------------
      // Restaurer les textes français
      // --------------------------------------------------------

      traductionMutationLockRef.current =
        true;

      textesTraduitsRef.current.forEach(
        (item) => {
          if (
            item.node &&
            item.node.isConnected
          ) {
            item.node.textContent =
              item.original;
          }

          derniereTraductionRef.current.delete(
            item.node
          );
        }
      );

      textesTraduitsRef.current =
        [];

      setErreurTraduction(
        null
      );

      setTimeout(() => {
        traductionMutationLockRef.current =
          false;
      }, 0);
    };

  // ============================================================
  // 🔄 CHANGEMENT DE PAGE
  // ============================================================

  useEffect(() => {
    /**
     * IMPORTANT :
     *
     * On ne restaure PLUS automatiquement le français
     * lors d'un changement de route.
     *
     * Si l'utilisateur a choisi English, le mode anglais
     * reste actif et le nouveau contenu de la page sera
     * automatiquement détecté.
     */

    if (
      !traductionActiveRef.current
    ) {
      return;
    }

    const timer =
      setTimeout(() => {
        const nouveauxTextes =
          obtenirTextesTraduisibles();

        const textesATraduire =
          nouveauxTextes.filter(
            (item) => {
              const derniereTraduction =
                derniereTraductionRef.current.get(
                  item.node
                );

              return (
                derniereTraduction !==
                item.node.textContent
              );
            }
          );

        textesATraduire.forEach(
          (item) => {
            ajouterNoeudAFile(
              item.node
            );
          }
        );
      }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [location.pathname]);

  // ============================================================
  // 🧹 NETTOYAGE À LA DESTRUCTION DU LAYOUT
  // ============================================================

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();

      if (
        mutationTimerRef.current !==
        null
      ) {
        clearTimeout(
          mutationTimerRef.current
        );
      }

      mutationQueueRef.current =
        [];
    };
  }, []);

  // ============================================================
  // 🔴 DÉCONNEXION
  // ============================================================

  const handleLogout =
    async () => {
      if (user?.email) {
        try {
          await api.post(
            `/api/notify/disconnect`,
            {
              email:
                user.email,
            }
          );
        } catch (err) {
          console.error(
            "Erreur lors de la déconnexion :",
            err
          );
        }
      }

      restaurerFrancais();

      logout();

      navigate("/");
    };

  // ============================================================
  // 👥 CONDITIONS D'AFFICHAGE
  // ============================================================

  const hideFooter =
    location.pathname.toLowerCase() ===
    "/page1";

  const hideFilleulsButton = [
    "/",
    "/login",
    "/inscription",
    "/activation",
  ].includes(
    location.pathname.toLowerCase()
  );

  // ============================================================
  // 💬 QUESTIONS
  // ============================================================

  const canAccessQuestions =
    !!user;

  // ============================================================
  // 👨‍🏫 ESPACE ENSEIGNANT
  // ============================================================

  const canAccessTeacherQuestions =
    !!user &&
    (
      user.is_admin === true ||
      (
        user.enseignant === true &&
        user.enseignant_actif === true
      )
    );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="
        min-h-screen
        relative
        overflow-hidden
        flex
        flex-col
      "
    >
      {/* ======================================================
          🌆 FOND DYNAMIQUE
          ====================================================== */}

      <div
        className={`
          absolute
          inset-0
          transition-opacity
          duration-1000
          z-0
          ${
            isVisible
              ? "opacity-50"
              : "opacity-0"
          }
        `}
        style={{
          backgroundImage:
            `url(${images[currentIndex]})`,
          backgroundSize:
            "cover",
          backgroundPosition:
            "center",
          backgroundRepeat:
            "no-repeat",
          width:
            "100%",
          height:
            "100%",
        }}
      />

      {/* ======================================================
          🎵 AUDIO
          ====================================================== */}

      <AudioManager />

      {/* ======================================================
          🌐 BOUTON TRADUCTION
          
          IMPORTANT :
          Ce bouton est TOUJOURS présent.
          Il permet de passer de FR → EN puis EN → FR.
          ====================================================== */}

      <div
        data-no-translate
        className="
          fixed
          top-16
          right-4
          z-50
        "
      >
        <div
          className="
            group
            relative
          "
        >
          <button
            type="button"
            onClick={
              traductionActive
                ? restaurerFrancais
                : traduirePage
            }
            disabled={
              traductionEnCours
            }
            className={`
              flex
              items-center
              gap-2
              rounded-full
              px-4
              py-3
              text-white
              shadow-xl
              transition-all
              duration-300
              hover:scale-105
              focus:outline-none
              focus:ring-2
              disabled:cursor-not-allowed
              disabled:opacity-70
              ${
                traductionActive
                  ? "bg-gray-700 hover:bg-gray-800 focus:ring-gray-500"
                  : "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
              }
            `}
            aria-label={
              traductionActive
                ? "Revenir au français"
                : "Traduire la page en anglais"
            }
          >
            {traductionEnCours ? (
              <Loader2
                size={20}
                className="
                  animate-spin
                "
              />
            ) : traductionActive ? (
              <RotateCcw
                size={20}
              />
            ) : (
              <Languages
                size={20}
              />
            )}

            <span
              className="
                hidden
                sm:inline
                font-semibold
                text-sm
              "
            >
              {traductionEnCours
                ? "Traduction..."
                : traductionActive
                  ? "Français"
                  : "English"}
            </span>
          </button>

          {/* --------------------------------------------------
              INFO AU SURVOL
              -------------------------------------------------- */}

          <span
            className="
              absolute
              right-0
              top-14
              opacity-0
              group-hover:opacity-100
              bg-black/80
              text-white
              text-xs
              rounded-md
              px-3
              py-2
              whitespace-nowrap
              transition-opacity
              duration-300
              pointer-events-none
            "
          >
            {traductionActive
              ? "Revenir au français"
              : "Traduire cette page en anglais"}
          </span>
        </div>
      </div>

      {/* ======================================================
          ⚠️ ERREUR TRADUCTION
          ====================================================== */}

      {erreurTraduction && (
        <div
          data-no-translate
          className="
            fixed
            top-32
            right-4
            z-50
            max-w-xs
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-700
            shadow-xl
            dark:border-red-800
            dark:bg-red-950/80
            dark:text-red-300
          "
        >
          {erreurTraduction}
        </div>
      )}

      {/* ======================================================
          👤 BOUTONS UTILISATEUR
          ====================================================== */}

      {user && (
        <>
          {/* ==================================================
              🖥️ DESKTOP
              ================================================== */}

          <div
            data-no-translate
            className="
              hidden
              sm:flex
              fixed
              top-4
              left-4
              z-40
              flex-col
              items-start
              gap-3
            "
          >
            {/* =================================================
                🔴 DÉCONNEXION
                ================================================= */}

            <div
              className="
                group
                relative
              "
            >
              <button
                onClick={
                  handleLogout
                }
                className="
                  bg-red-600
                  hover:bg-red-700
                  text-white
                  p-3
                  rounded-full
                  shadow-lg
                  transition-all
                  duration-300
                  transform
                  hover:scale-110
                  focus:outline-none
                  focus:ring-2
                  focus:ring-red-500
                "
                aria-label="Déconnexion"
              >
                <LogOut
                  size={22}
                />
              </button>

              <span
                className="
                  absolute
                  left-14
                  top-1/2
                  -translate-y-1/2
                  opacity-0
                  group-hover:opacity-100
                  bg-black/80
                  text-white
                  text-xs
                  rounded-md
                  px-2
                  py-1
                  whitespace-nowrap
                  transition-opacity
                  duration-300
                  pointer-events-none
                "
              >
                Déconnexion
              </span>
            </div>
          </div>

          {/* ==================================================
              🖥️ DESKTOP
              BOUTONS QUESTIONS / ENSEIGNANT / FILLEULS
              ================================================== */}

          <div
            data-no-translate
            className="
              hidden
              sm:flex
              fixed
              bottom-4
              right-4
              z-40
              flex-col
              items-end
              gap-3
            "
          >
            {/* =================================================
                💬 QUESTIONS
                ================================================= */}

            {canAccessQuestions && (
              <div
                className="
                  group
                  relative
                "
              >
                <button
                  onClick={() =>
                    navigate(
                      "/questions"
                    )
                  }
                  className="
                    bg-indigo-600
                    hover:bg-indigo-700
                    text-white
                    p-3
                    rounded-full
                    shadow-lg
                    transition-all
                    duration-300
                    transform
                    hover:scale-110
                    focus:outline-none
                    focus:ring-2
                    focus:ring-indigo-500
                  "
                  aria-label="Mes questions"
                >
                  <MessageCircle
                    size={22}
                  />
                </button>

                <span
                  className="
                    absolute
                    right-14
                    top-1/2
                    -translate-y-1/2
                    opacity-0
                    group-hover:opacity-100
                    bg-black/80
                    text-white
                    text-xs
                    rounded-md
                    px-2
                    py-1
                    whitespace-nowrap
                    transition-opacity
                    duration-300
                    pointer-events-none
                  "
                >
                  Mes questions et conversations
                </span>
              </div>
            )}

            {/* =================================================
                👨‍🏫 ENSEIGNANT
                ================================================= */}

            {canAccessTeacherQuestions && (
              <div
                className="
                  group
                  relative
                "
              >
                <button
                  onClick={() =>
                    navigate(
                      "/enseignant/questions"
                    )
                  }
                  className="
                    bg-purple-600
                    hover:bg-purple-700
                    text-white
                    p-3
                    rounded-full
                    shadow-lg
                    transition-all
                    duration-300
                    transform
                    hover:scale-110
                    focus:outline-none
                    focus:ring-2
                    focus:ring-purple-500
                  "
                  aria-label="Questions enseignant"
                >
                  <GraduationCap
                    size={22}
                  />
                </button>

                <span
                  className="
                    absolute
                    right-14
                    top-1/2
                    -translate-y-1/2
                    opacity-0
                    group-hover:opacity-100
                    bg-black/80
                    text-white
                    text-xs
                    rounded-md
                    px-2
                    py-1
                    whitespace-nowrap
                    transition-opacity
                    duration-300
                    pointer-events-none
                  "
                >
                  Questions destinées aux enseignants
                </span>
              </div>
            )}

            {/* =================================================
                👥 FILLEULS
                ================================================= */}

            {!hideFilleulsButton && (
              <div
                className="
                  group
                  relative
                "
              >
                <button
                  onClick={() =>
                    navigate(
                      `/admin/parrain/${encodeURIComponent(
                        user.email
                      )}`
                    )
                  }
                  className="
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    p-3
                    rounded-full
                    shadow-lg
                    transition-all
                    duration-300
                    transform
                    hover:scale-110
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                  "
                  aria-label="Filleuls"
                >
                  <Users
                    size={22}
                  />
                </button>

                <span
                  className="
                    absolute
                    right-14
                    top-1/2
                    -translate-y-1/2
                    opacity-0
                    group-hover:opacity-100
                    bg-black/80
                    text-white
                    text-xs
                    rounded-md
                    px-2
                    py-1
                    whitespace-nowrap
                    transition-opacity
                    duration-300
                    pointer-events-none
                  "
                >
                  Accéder aux filleuls
                </span>
              </div>
            )}
          </div>

          {/* ==================================================
              📱 MOBILE
              ================================================== */}

          <div
            data-no-translate
            className="
              sm:hidden
              fixed
              bottom-6
              left-6
              z-40
              flex
              flex-col
              gap-3
            "
          >
            {/* =================================================
                🔴 DÉCONNEXION
                ================================================= */}

            <button
              onClick={
                handleLogout
              }
              className="
                bg-red-600
                hover:bg-red-700
                text-white
                p-4
                rounded-full
                shadow-xl
                transition-all
                duration-300
                transform
                hover:scale-110
                focus:outline-none
                focus:ring-2
                focus:ring-red-500
              "
              aria-label="Déconnexion"
              title="Déconnexion"
            >
              <LogOut
                size={24}
              />
            </button>

            {/* =================================================
                💬 QUESTIONS
                ================================================= */}

            {canAccessQuestions && (
              <button
                onClick={() =>
                  navigate(
                    "/questions"
                  )
                }
                className="
                  bg-indigo-600
                  hover:bg-indigo-700
                  text-white
                  p-4
                  rounded-full
                  shadow-xl
                  transition-all
                  duration-300
                  transform
                  hover:scale-110
                  focus:outline-none
                  focus:ring-2
                  focus:ring-indigo-500
                "
                aria-label="Mes questions"
                title="Mes questions"
              >
                <MessageCircle
                  size={24}
                />
              </button>
            )}

            {/* =================================================
                👨‍🏫 ENSEIGNANT
                ================================================= */}

            {canAccessTeacherQuestions && (
              <button
                onClick={() =>
                  navigate(
                    "/enseignant/questions"
                  )
                }
                className="
                  bg-purple-600
                  hover:bg-purple-700
                  text-white
                  p-4
                  rounded-full
                  shadow-xl
                  transition-all
                  duration-300
                  transform
                  hover:scale-110
                  focus:outline-none
                  focus:ring-2
                  focus:ring-purple-500
                "
                aria-label="Questions enseignant"
                title="Questions enseignant"
              >
                <GraduationCap
                  size={24}
                />
              </button>
            )}

            {/* =================================================
                👥 FILLEULS
                ================================================= */}

            {!hideFilleulsButton && (
              <button
                onClick={() =>
                  navigate(
                    `/admin/parrain/${encodeURIComponent(
                      user.email
                    )}`
                  )
                }
                className="
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  p-4
                  rounded-full
                  shadow-xl
                  transition-all
                  duration-300
                  transform
                  hover:scale-110
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
                aria-label="Filleuls"
                title="Filleuls"
              >
                <Users
                  size={24}
                />
              </button>
            )}
          </div>
        </>
      )}

      {/* ======================================================
          📄 CONTENU PRINCIPAL
          ====================================================== */}

      <main
        ref={
          contenuPrincipalRef
        }
        className="
          relative
          z-20
          flex-grow
          pb-16
          px-4
          sm:px-6
          lg:px-12
        "
      >
        {children}
      </main>

      {/* ======================================================
          🇧🇯 FOOTER

          ⚠️ IMPORTANT :
          Il n'y a volontairement PAS de
          data-no-translate ici.

          Le footer sera donc traduit lui aussi.
          ====================================================== */}

      {!hideFooter && (
        <footer
          className="
            hidden
            sm:block
            fixed
            bottom-0
            left-0
            right-0
            z-30
            select-none
            bg-black/70
            overflow-hidden
            h-6
            md:h-7
            lg:h-8
          "
        >
          <div
            className="
              relative
              h-full
              w-[300%]
              flex
              animate-scrollX
            "
          >
            <div
              className="
                flex-1
                bg-green-600
              "
            />

            <div
              className="
                flex-1
                bg-yellow-400
                relative
              "
            >
              <span
                className="
                  absolute
                  inset-0
                  flex
                  justify-center
                  items-center
                  text-black
                  font-semibold
                  text-xs
                  md:text-sm
                  lg:text-base
                  select-none
                  pointer-events-none
                  animate-glow
                "
              >
                République du Bénin
              </span>
            </div>

            <div
              className="
                flex-1
                bg-red-600
              "
            />

            <div
              className="
                flex-1
                bg-green-600
              "
            />

            <div
              className="
                flex-1
                bg-yellow-400
              "
            />

            <div
              className="
                flex-1
                bg-red-600
              "
            />
          </div>

          <style>{`
            @keyframes scrollX {
              0% {
                transform:
                  translateX(0);
              }

              100% {
                transform:
                  translateX(-33.3333%);
              }
            }

            .animate-scrollX {
              animation:
                scrollX 10s
                linear infinite;
            }

            @keyframes glow {
              0%, 100% {
                text-shadow:
                  0 0 4px
                  rgba(0,0,0,0.6);

                color:
                  black;
              }

              50% {
                text-shadow:
                  0 0 10px
                  rgba(255,255,0,0.8);

                color:
                  #222200;
              }
            }

            .animate-glow {
              animation:
                glow 2.5s
                ease-in-out infinite;
            }
          `}</style>
        </footer>
      )}
    </div>
  );
};

export default Layout;