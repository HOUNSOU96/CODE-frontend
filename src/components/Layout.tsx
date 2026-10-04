
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
  School,
  X,
  CheckCircle2,
  Clock3,
  BookOpen,
  Menu,
  ChevronRight,
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
// 🏫 TYPES ECOLE
// ============================================================

interface SchoolItem {
  id: number;
  nom: string;
  adresse?: string | null;
  ville?: string | null;
  pays?: string | null;
  email?: string | null;
  telephone?: string | null;
  is_active?: boolean;
}

interface SchoolMembership {
  membership_id: number;
  school_id: number;
  school_name: string;
  role: "teacher" | "student";
  status: "pending" | "approved" | "rejected";
  academic_year: string;
  requested_at?: string | null;
  approved_at?: string | null;
}

interface MySchoolResponse {
  role: "teacher" | "student";
  academic_year: string;
  can_choose_school: boolean;
  is_director?: boolean;
  memberships: SchoolMembership[];
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
  // 📂 MENU LATÉRAL
  // ==========================================================

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

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
  // 🏫 ÉTAT ECOLE
  // ==========================================================

  const [
    schoolModalOpen,
    setSchoolModalOpen,
  ] = useState(false);

  const [
    schools,
    setSchools,
  ] = useState<SchoolItem[]>([]);

  const [
    schoolMemberships,
    setSchoolMemberships,
  ] = useState<SchoolMembership[]>([]);

  const [
    schoolLoading,
    setSchoolLoading,
  ] = useState(false);

  const [
    schoolSubmitting,
    setSchoolSubmitting,
  ] = useState<number | null>(null);

  const [
    schoolError,
    setSchoolError,
  ] = useState("");

  const [
    schoolSuccess,
    setSchoolSuccess,
  ] = useState("");

  const [
    schoolCanChoose,
    setSchoolCanChoose,
  ] = useState(false);

  const [
    schoolIsDirector,
    setSchoolIsDirector,
  ] = useState(false);

  const [
    schoolAcademicYear,
    setSchoolAcademicYear,
  ] = useState("");

  // ============================================================
  // ROUTER
  // ============================================================

  const location =
    useLocation();

  const navigate =
    useNavigate();

  // ============================================================
  // AUTHENTIFICATION
  // ============================================================

  const {
    user,
    logout,
  } = useAuth();

  // ============================================================
  // 🔔 NOTIFICATIONS CONNEXION / DÉCONNEXION
  // ============================================================

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
  // 📂 FERMER LE MENU LORS D'UN CHANGEMENT DE PAGE
  // ============================================================

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // ============================================================
  // 📂 FERMER AVEC LA TOUCHE ESC
  // ============================================================

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (
        event.key === "Escape"
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [menuOpen]);

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

    if (!texteNettoye) {
      return false;
    }

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

    if (
      /^[\d\s.,:%/+−\-×÷=<>()[\]{}]+$/.test(
        texteNettoye
      )
    ) {
      return false;
    }

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

    const textesSansCache:
      TexteTraduit[] = [];

    textesValides.forEach(
      (item) => {
        const traductionEnCache =
          cacheTraductionsRef.current.get(
            item.original
          );

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

    if (
      !textesSansCache.length
    ) {
      return;
    }

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
        traduction
      );

      cacheTraductionsRef.current.set(
        item.original,
        traduction
      );

      item.node.textContent =
        traduction;
    }

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

      if (
        traductionMutationLockRef.current
      ) {
        return;
      }

      for (
        const mutation of mutations
      ) {
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

          if (
            derniereTraduction !==
              undefined &&
            texteActuel ===
              derniereTraduction
          ) {
            continue;
          }

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

        await traduireLot(
          textes
        );

        traductionActiveRef.current =
          true;

        setTraductionActive(
          true
        );

        localStorage.setItem(
          CLE_LANGUE_TRADUCTION,
          "en"
        );

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
      localStorage.setItem(
        CLE_LANGUE_TRADUCTION,
        "fr"
      );

      traductionActiveRef.current =
        false;

      setTraductionActive(
        false
      );

      observerRef.current?.disconnect();

      observerRef.current =
        null;

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

      mutationQueueRef.current =
        [];

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
  // 🏫 LOGIQUE ECOLE
  // ============================================================

  const isSimpleLearner =
    !!user &&
    user.is_admin !== true &&
    user.enseignant !== true;

  // ============================================================
  // 🏫 ACTUALISER L'ÉTAT DE L'ÉCOLE
  // ============================================================

  const refreshLearnerSchoolStatus =
    async () => {
      if (!isSimpleLearner) {
        setSchoolCanChoose(false);
        setSchoolIsDirector(false);
        setSchoolMemberships([]);
        return;
      }

      try {
        const response =
          await api.get<MySchoolResponse>(
            "/api/schools/me"
          );

        const data =
          response.data;

        setSchoolCanChoose(
          data?.can_choose_school ===
            true
        );

        setSchoolIsDirector(
          data?.is_director ===
            true
        );

        setSchoolAcademicYear(
          data?.academic_year ||
            ""
        );

        setSchoolMemberships(
          data?.memberships ||
            []
        );
      } catch (error) {
        console.error(
          "Erreur récupération état école :",
          error
        );

        setSchoolCanChoose(false);
        setSchoolIsDirector(false);
      }
    };

  // ============================================================
  // 🏫 CHARGEMENT AUTOMATIQUE DE L'ÉTAT ECOLE
  // ============================================================

  useEffect(() => {
    if (!user) {
      setSchoolCanChoose(false);
      setSchoolIsDirector(false);
      setSchoolMemberships([]);
      return;
    }

    void refreshLearnerSchoolStatus();
  }, [
    user?.id,
    user?.is_admin,
    user?.enseignant,
    location.pathname,
  ]);

  // ============================================================
  // 🏫 RAFRAÎCHISSEMENT PÉRIODIQUE
  // ============================================================

  useEffect(() => {
    if (!isSimpleLearner) {
      return;
    }

    const interval =
      setInterval(() => {
        void refreshLearnerSchoolStatus();
      }, 60 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [
    user?.id,
    user?.is_admin,
    user?.enseignant,
  ]);

  // ============================================================
  // 🏫 CHARGER LES ÉCOLES
  // ============================================================

  const loadSchoolData =
    async () => {
      if (!isSimpleLearner) {
        return;
      }

      setSchoolLoading(true);
      setSchoolError("");
      setSchoolSuccess("");

      try {
        const [
          schoolsResponse,
          meResponse,
        ] = await Promise.all([
          api.get<
            | SchoolItem[]
            | {
                schools?: SchoolItem[];
              }
          >(
            "/api/schools"
          ),
          api.get<MySchoolResponse>(
            "/api/schools/me"
          ),
        ]);

        const schoolsData =
          schoolsResponse.data;

        const availableSchools =
          Array.isArray(
            schoolsData
          )
            ? schoolsData
            : schoolsData?.schools ||
              [];

        setSchools(
          availableSchools.filter(
            (school) =>
              school.is_active !== false
          )
        );

        setSchoolMemberships(
          meResponse.data
            ?.memberships || []
        );

        setSchoolCanChoose(
          meResponse.data
            ?.can_choose_school ===
            true
        );

        setSchoolIsDirector(
          meResponse.data
            ?.is_director ===
            true
        );

        setSchoolAcademicYear(
          meResponse.data
            ?.academic_year || ""
        );
      } catch (error: any) {
        console.error(
          "Erreur chargement des écoles :",
          error
        );

        setSchoolError(
          error?.response?.data
            ?.detail ||
            "Impossible de charger les écoles."
        );
      } finally {
        setSchoolLoading(false);
      }
    };

  // ============================================================
  // 🏫 OUVRIR MODALE ÉCOLE
  // ============================================================

  const handleOpenSchoolModal =
    async () => {
      setMenuOpen(false);

      setSchoolModalOpen(true);
      setSchoolError("");
      setSchoolSuccess("");

      await loadSchoolData();
    };

  // ============================================================
  // 🏫 FERMER MODALE ÉCOLE
  // ============================================================

  const handleCloseSchoolModal =
    () => {
      if (
        schoolSubmitting !==
        null
      ) {
        return;
      }

      setSchoolModalOpen(false);
      setSchoolError("");
      setSchoolSuccess("");
    };

  // ============================================================
  // 🏫 DEMANDER UNE ÉCOLE
  // ============================================================

  const handleSchoolRequest =
    async (
      schoolId: number
    ) => {
      setSchoolSubmitting(
        schoolId
      );

      setSchoolError("");
      setSchoolSuccess("");

      try {
        await api.post(
          "/api/schools/request",
          {
            school_id:
              schoolId,
          }
        );

        setSchoolSuccess(
          "Votre demande a été envoyée. Elle doit maintenant être validée par le directeur de l'école."
        );

        await loadSchoolData();

        await refreshLearnerSchoolStatus();
      } catch (error: any) {
        console.error(
          "Erreur demande école :",
          error
        );

        setSchoolError(
          error?.response?.data
            ?.detail ||
            "Impossible d'envoyer votre demande."
        );
      } finally {
        setSchoolSubmitting(
          null
        );
      }
    };

  // ============================================================
  // 🏫 BOUTON CHOIX ECOLE
  // ============================================================

  const showSchoolChoiceButton =
    isSimpleLearner &&
    !schoolIsDirector &&
    schoolCanChoose;

  // ============================================================
  // 🏫 ÉCOLE EN ATTENTE
  // ============================================================

  const currentPendingSchool =
    schoolMemberships.find(
      (membership) =>
        membership.role ===
          "student" &&
        membership.status ===
          "pending"
    );

  // ============================================================
  // 🏫 ÉCOLE VALIDÉE
  // ============================================================

  const currentApprovedSchool =
    schoolMemberships.find(
      (membership) =>
        membership.role ===
          "student" &&
        membership.status ===
          "approved"
    );

  // ============================================================
  // 🔴 DÉCONNEXION
  // ============================================================

  const handleLogout =
    async () => {
      setMenuOpen(false);

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
          ☰ BOUTON UNIQUE DU MENU
          
          Le bouton du mode sombre n'est volontairement
          PAS regroupé ici.
          ====================================================== */}

      <div
  data-no-translate
  className="
    fixed
    bottom-10
    right-4
    z-[70]
  "
>
        <button
          type="button"
          onClick={() =>
            setMenuOpen(true)
          }
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            border
            border-white/20
            bg-black/70
            text-white
            shadow-xl
            backdrop-blur-md
            transition-all
            duration-300
            hover:scale-110
            hover:bg-black/85
            focus:outline-none
            focus:ring-2
            focus:ring-white/70
          "
          aria-label="Ouvrir le menu"
          title="Menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* ======================================================
          📂 FENÊTRE LATÉRALE DU MENU
          ====================================================== */}

      {menuOpen && (
        <div
          data-no-translate
          className="
            fixed
            inset-0
            z-[200]
          "
        >

          {/* ==================================================
              FOND SOMBRE
              ================================================== */}

          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() =>
              setMenuOpen(false)
            }
            className="
              absolute
              inset-0
              h-full
              w-full
              cursor-default
              bg-black/55
              backdrop-blur-[2px]
            "
          />

          {/* ==================================================
              BARRE LATÉRALE
              ================================================== */}

          <aside
            className="
              absolute
              right-0
              top-0
              flex
              h-full
              w-full
              max-w-sm
              flex-col
              overflow-hidden
              border-l
              border-slate-200
              bg-white
              shadow-2xl
              dark:border-slate-700
              dark:bg-slate-950
            "
            role="dialog"
            aria-modal="true"
            aria-label="Menu principal"
          >

            {/* ==================================================
                HEADER
                ================================================== */}

            <div
              className="
                flex
                shrink-0
                items-center
                justify-between
                border-b
                border-slate-200
                bg-white
                px-5
                py-4
                dark:border-slate-800
                dark:bg-slate-950
              "
            >
              <div>
                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.15em]
                    text-emerald-600
                    dark:text-emerald-400
                  "
                >
                  CODE
                </p>

                <h2
                  className="
                    mt-0.5
                    text-xl
                    font-bold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Menu
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  text-slate-500
                  transition
                  hover:bg-slate-100
                  hover:text-slate-900
                  focus:outline-none
                  focus:ring-2
                  focus:ring-emerald-500
                  dark:text-slate-400
                  dark:hover:bg-slate-800
                  dark:hover:text-white
                "
                aria-label="Fermer le menu"
                title="Fermer"
              >
                <X size={23} />
              </button>
            </div>

            {/* ==================================================
                CONTENU DU MENU
                ================================================== */}

            <div
              className="
                flex-1
                overflow-y-auto
                px-4
                py-5
              "
            >

              {/* =================================================
                  SECTION : ACCÈS RAPIDES
                  ================================================= */}

              <div className="mb-6">
                <p
                  className="
                    mb-3
                    px-2
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-400
                    dark:text-slate-500
                  "
                >
                  Accès rapides
                </p>

                <div className="space-y-2">

                  {/* =============================================
                      MES DOCUMENTS
                      ============================================= */}

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate(
                        "/mes-documents"
                      );
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      border
                      border-emerald-100
                      bg-emerald-50
                      px-4
                      py-3.5
                      text-left
                      transition
                      hover:border-emerald-200
                      hover:bg-emerald-100
                      focus:outline-none
                      focus:ring-2
                      focus:ring-emerald-500
                      dark:border-emerald-900/50
                      dark:bg-emerald-950/40
                      dark:hover:bg-emerald-900/50
                    "
                  >
                    <span
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-emerald-600
                        text-white
                        shadow-sm
                      "
                    >
                      <BookOpen
                        size={21}
                      />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span
                        className="
                          block
                          font-semibold
                          text-slate-900
                          dark:text-white
                        "
                      >
                        Mes documents
                      </span>

                      <span
                        className="
                          mt-0.5
                          block
                          text-xs
                          text-slate-500
                          dark:text-slate-400
                        "
                      >
                        Accéder à mes documents sécurisés
                      </span>
                    </span>

                    <ChevronRight
                      size={19}
                      className="
                        shrink-0
                        text-slate-400
                      "
                    />
                  </button>

                </div>
              </div>

              {/* =================================================
                  SECTION : LANGUE
                  ================================================= */}

              <div className="mb-6">
                <p
                  className="
                    mb-3
                    px-2
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-400
                    dark:text-slate-500
                  "
                >
                  Langue
                </p>

                <button
                  type="button"
                  onClick={() => {
                    if (
                      traductionActive
                    ) {
                      restaurerFrancais();
                    } else {
                      void traduirePage();
                    }
                  }}
                  disabled={
                    traductionEnCours
                  }
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    py-3.5
                    text-left
                    transition
                    hover:bg-slate-100
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    focus:outline-none
                    focus:ring-2
                    focus:ring-emerald-500
                    dark:border-slate-700
                    dark:bg-slate-900
                    dark:hover:bg-slate-800
                  "
                  aria-label={
                    traductionActive
                      ? "Revenir au français"
                      : "Traduire la page en anglais"
                  }
                >
                  <span
                    className={`
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      text-white
                      ${
                        traductionActive
                          ? "bg-slate-700"
                          : "bg-emerald-600"
                      }
                    `}
                  >
                    {traductionEnCours ? (
                      <Loader2
                        size={21}
                        className="animate-spin"
                      />
                    ) : traductionActive ? (
                      <RotateCcw
                        size={21}
                      />
                    ) : (
                      <Languages
                        size={21}
                      />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className="
                        block
                        font-semibold
                        text-slate-900
                        dark:text-white
                      "
                    >
                      {traductionEnCours
                        ? "Traduction en cours..."
                        : traductionActive
                          ? "Revenir au français"
                          : "English"}
                    </span>

                    <span
                      className="
                        mt-0.5
                        block
                        text-xs
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      {traductionActive
                        ? "Repasser l'interface en français"
                        : "Traduire la page actuelle en anglais"}
                    </span>
                  </span>

                  {!traductionEnCours && (
                    <ChevronRight
                      size={19}
                      className="
                        shrink-0
                        text-slate-400
                      "
                    />
                  )}
                </button>
              </div>

              {/* =================================================
                  SECTION UTILISATEUR
                  ================================================= */}

              {user && (
                <div className="mb-6">
                  <p
                    className="
                      mb-3
                      px-2
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-slate-400
                      dark:text-slate-500
                    "
                  >
                    Mon espace
                  </p>

                  <div className="space-y-2">

                    {/* ===========================================
                        CHOISIR MON ÉCOLE
                        =========================================== */}

                    {showSchoolChoiceButton && (
                      <button
                        type="button"
                        onClick={
                          handleOpenSchoolModal
                        }
                        className="
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-xl
                          border
                          border-slate-200
                          bg-slate-50
                          px-4
                          py-3.5
                          text-left
                          transition
                          hover:border-blue-200
                          hover:bg-blue-50
                          focus:outline-none
                          focus:ring-2
                          focus:ring-blue-500
                          dark:border-slate-700
                          dark:bg-slate-900
                          dark:hover:bg-blue-950/40
                        "
                      >
                        <span
                          className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-blue-600
                            text-white
                          "
                        >
                          <School
                            size={21}
                          />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span
                            className="
                              block
                              font-semibold
                              text-slate-900
                              dark:text-white
                            "
                          >
                            Choisir mon école
                          </span>

                          <span
                            className="
                              mt-0.5
                              block
                              text-xs
                              text-slate-500
                              dark:text-slate-400
                            "
                          >
                            Sélectionner mon établissement
                          </span>
                        </span>

                        <ChevronRight
                          size={19}
                          className="
                            shrink-0
                            text-slate-400
                          "
                        />
                      </button>
                    )}

                    {/* ===========================================
                        QUESTIONS
                        =========================================== */}

                    {canAccessQuestions && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          navigate(
                            "/questions"
                          );
                        }}
                        className="
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-xl
                          border
                          border-slate-200
                          bg-slate-50
                          px-4
                          py-3.5
                          text-left
                          transition
                          hover:border-indigo-200
                          hover:bg-indigo-50
                          focus:outline-none
                          focus:ring-2
                          focus:ring-indigo-500
                          dark:border-slate-700
                          dark:bg-slate-900
                          dark:hover:bg-indigo-950/40
                        "
                      >
                        <span
                          className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-indigo-600
                            text-white
                          "
                        >
                          <MessageCircle
                            size={21}
                          />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span
                            className="
                              block
                              font-semibold
                              text-slate-900
                              dark:text-white
                            "
                          >
                            Mes questions
                          </span>

                          <span
                            className="
                              mt-0.5
                              block
                              text-xs
                              text-slate-500
                              dark:text-slate-400
                            "
                          >
                            Questions et conversations
                          </span>
                        </span>

                        <ChevronRight
                          size={19}
                          className="
                            shrink-0
                            text-slate-400
                          "
                        />
                      </button>
                    )}

                    {/* ===========================================
                        ENSEIGNANT
                        =========================================== */}

                    {canAccessTeacherQuestions && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          navigate(
                            "/enseignant/questions"
                          );
                        }}
                        className="
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-xl
                          border
                          border-slate-200
                          bg-slate-50
                          px-4
                          py-3.5
                          text-left
                          transition
                          hover:border-purple-200
                          hover:bg-purple-50
                          focus:outline-none
                          focus:ring-2
                          focus:ring-purple-500
                          dark:border-slate-700
                          dark:bg-slate-900
                          dark:hover:bg-purple-950/40
                        "
                      >
                        <span
                          className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-purple-600
                            text-white
                          "
                        >
                          <GraduationCap
                            size={21}
                          />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span
                            className="
                              block
                              font-semibold
                              text-slate-900
                              dark:text-white
                            "
                          >
                            Espace enseignant
                          </span>

                          <span
                            className="
                              mt-0.5
                              block
                              text-xs
                              text-slate-500
                              dark:text-slate-400
                            "
                          >
                            Questions destinées aux enseignants
                          </span>
                        </span>

                        <ChevronRight
                          size={19}
                          className="
                            shrink-0
                            text-slate-400
                          "
                        />
                      </button>
                    )}

                    {/* ===========================================
                        FILLEULS
                        =========================================== */}

                    {!hideFilleulsButton && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          navigate(
                            `/admin/parrain/${encodeURIComponent(
                              user.email
                            )}`
                          );
                        }}
                        className="
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-xl
                          border
                          border-slate-200
                          bg-slate-50
                          px-4
                          py-3.5
                          text-left
                          transition
                          hover:border-blue-200
                          hover:bg-blue-50
                          focus:outline-none
                          focus:ring-2
                          focus:ring-blue-500
                          dark:border-slate-700
                          dark:bg-slate-900
                          dark:hover:bg-blue-950/40
                        "
                      >
                        <span
                          className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-blue-600
                            text-white
                          "
                        >
                          <Users
                            size={21}
                          />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span
                            className="
                              block
                              font-semibold
                              text-slate-900
                              dark:text-white
                            "
                          >
                            Mes filleuls
                          </span>

                          <span
                            className="
                              mt-0.5
                              block
                              text-xs
                              text-slate-500
                              dark:text-slate-400
                            "
                          >
                            Accéder aux filleuls
                          </span>
                        </span>

                        <ChevronRight
                          size={19}
                          className="
                            shrink-0
                            text-slate-400
                          "
                        />
                      </button>
                    )}

                  </div>
                </div>
              )}

              {/* =================================================
                  SECTION COMPTE
                  ================================================= */}

              {user && (
                <div className="mb-2">
                  <p
                    className="
                      mb-3
                      px-2
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-slate-400
                      dark:text-slate-500
                    "
                  >
                    Compte
                  </p>

                  <button
                    type="button"
                    onClick={
                      handleLogout
                    }
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      border
                      border-red-200
                      bg-red-50
                      px-4
                      py-3.5
                      text-left
                      transition
                      hover:bg-red-100
                      focus:outline-none
                      focus:ring-2
                      focus:ring-red-500
                      dark:border-red-900/60
                      dark:bg-red-950/30
                      dark:hover:bg-red-950/60
                    "
                  >
                    <span
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-red-600
                        text-white
                      "
                    >
                      <LogOut
                        size={21}
                      />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span
                        className="
                          block
                          font-semibold
                          text-red-700
                          dark:text-red-400
                        "
                      >
                        Déconnexion
                      </span>

                      <span
                        className="
                          mt-0.5
                          block
                          text-xs
                          text-red-600/70
                          dark:text-red-400/70
                        "
                      >
                        Se déconnecter de CODE
                      </span>
                    </span>

                    <ChevronRight
                      size={19}
                      className="
                        shrink-0
                        text-red-400
                      "
                    />
                  </button>
                </div>
              )}

            </div>

            {/* ==================================================
                PIED DE MENU
                ================================================== */}

            <div
              className="
                shrink-0
                border-t
                border-slate-200
                px-5
                py-3
                dark:border-slate-800
              "
            >
              <p
                className="
                  text-center
                  text-xs
                  text-slate-400
                  dark:text-slate-500
                "
              >
                CODE — L’écosystème éducatif mondial
              </p>
            </div>

          </aside>
        </div>
      )}

      {/* ======================================================
          ⚠️ ERREUR TRADUCTION
          ====================================================== */}

      {erreurTraduction && (
        <div
          data-no-translate
          className="
            fixed
            top-20
            right-20
            z-[80]
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

      {/* ======================================================
          🏫 MODALE — CHOIX DE L'ÉCOLE
          ====================================================== */}

      {schoolModalOpen && (
        <div
          data-no-translate
          className="
            fixed
            inset-0
            z-[300]
            flex
            items-center
            justify-center
            bg-black/60
            p-4
          "
          onClick={
            handleCloseSchoolModal
          }
        >
          <div
            className="
              relative
              w-full
              max-w-2xl
              max-h-[90vh]
              overflow-hidden
              rounded-2xl
              bg-white
              shadow-2xl
              dark:bg-slate-950
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* ==================================================
                HEADER MODALE
                ================================================== */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-gray-200
                px-5
                py-4
                dark:border-slate-800
              "
            >
              <div>
                <h2
                  className="
                    text-xl
                    font-bold
                    text-gray-900
                    dark:text-white
                  "
                >
                  Choisir mon école
                </h2>

                {schoolAcademicYear && (
                  <p
                    className="
                      mt-1
                      text-sm
                      text-gray-500
                      dark:text-slate-400
                    "
                  >
                    Année scolaire{" "}
                    {schoolAcademicYear}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={
                  handleCloseSchoolModal
                }
                disabled={
                  schoolSubmitting !==
                  null
                }
                className="
                  rounded-full
                  p-2
                  text-gray-500
                  hover:bg-gray-100
                  hover:text-gray-800
                  transition
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  dark:text-slate-400
                  dark:hover:bg-slate-800
                  dark:hover:text-white
                "
                aria-label="Fermer"
              >
                <X size={22} />
              </button>
            </div>

            {/* ==================================================
                CONTENU
                ================================================== */}

            <div
              className="
                max-h-[calc(90vh-80px)]
                overflow-y-auto
                p-5
              "
            >

              {/* ==================================================
                  SUCCÈS
                  ================================================== */}

              {schoolSuccess && (
                <div
                  className="
                    mb-4
                    flex
                    items-start
                    gap-3
                    rounded-xl
                    border
                    border-green-200
                    bg-green-50
                    p-4
                    text-green-800
                    dark:border-green-900
                    dark:bg-green-950/40
                    dark:text-green-300
                  "
                >
                  <CheckCircle2
                    size={20}
                    className="
                      mt-0.5
                      shrink-0
                    "
                  />

                  <p className="text-sm">
                    {schoolSuccess}
                  </p>
                </div>
              )}

              {/* ==================================================
                  ERREUR
                  ================================================== */}

              {schoolError && (
                <div
                  className="
                    mb-4
                    rounded-xl
                    border
                    border-red-200
                    bg-red-50
                    p-4
                    text-sm
                    text-red-700
                    dark:border-red-900
                    dark:bg-red-950/40
                    dark:text-red-300
                  "
                >
                  {schoolError}
                </div>
              )}

              {/* ==================================================
                  DEMANDE EN ATTENTE
                  ================================================== */}

              {currentPendingSchool && (
                <div
                  className="
                    mb-5
                    flex
                    items-start
                    gap-3
                    rounded-xl
                    border
                    border-yellow-200
                    bg-yellow-50
                    p-4
                    dark:border-yellow-900
                    dark:bg-yellow-950/40
                  "
                >
                  <Clock3
                    size={21}
                    className="
                      mt-0.5
                      shrink-0
                      text-yellow-600
                    "
                  />

                  <div>
                    <p
                      className="
                        font-semibold
                        text-yellow-900
                        dark:text-yellow-300
                      "
                    >
                      Demande en attente
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-yellow-800
                        dark:text-yellow-200
                      "
                    >
                      Votre demande pour{" "}
                      <strong>
                        {
                          currentPendingSchool.school_name
                        }
                      </strong>{" "}
                      est en attente de validation
                      par le directeur.
                    </p>
                  </div>
                </div>
              )}

              {/* ==================================================
                  ÉCOLE VALIDÉE
                  ================================================== */}

              {currentApprovedSchool && (
                <div
                  className="
                    mb-5
                    flex
                    items-start
                    gap-3
                    rounded-xl
                    border
                    border-green-200
                    bg-green-50
                    p-4
                    dark:border-green-900
                    dark:bg-green-950/40
                  "
                >
                  <CheckCircle2
                    size={21}
                    className="
                      mt-0.5
                      shrink-0
                      text-green-600
                    "
                  />

                  <div>
                    <p
                      className="
                        font-semibold
                        text-green-900
                        dark:text-green-300
                      "
                    >
                      École actuelle
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-green-800
                        dark:text-green-200
                      "
                    >
                      Vous êtes inscrit à{" "}
                      <strong>
                        {
                          currentApprovedSchool.school_name
                        }
                      </strong>
                      .
                    </p>
                  </div>
                </div>
              )}

              {/* ==================================================
                  CHARGEMENT
                  ================================================== */}

              {schoolLoading ? (
                <div
                  className="
                    flex
                    min-h-[200px]
                    items-center
                    justify-center
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      text-gray-600
                      dark:text-slate-400
                    "
                  >
                    <Loader2
                      size={24}
                      className="
                        animate-spin
                      "
                    />

                    <span>
                      Chargement des écoles...
                    </span>
                  </div>
                </div>
              ) : schools.length === 0 ? (

                /* ==================================================
                   AUCUNE ECOLE
                   ================================================== */

                <div
                  className="
                    rounded-xl
                    bg-gray-50
                    p-6
                    text-center
                    text-gray-600
                    dark:bg-slate-900
                    dark:text-slate-400
                  "
                >
                  Aucune école disponible
                  actuellement.
                </div>

              ) : (

                /* ==================================================
                   LISTE DES ECOLES
                   ================================================== */

                <div
                  className="
                    space-y-3
                  "
                >
                  {schools.map(
                    (school) => {
                      const membership =
                        schoolMemberships.find(
                          (item) =>
                            item.school_id ===
                            school.id
                        );

                      const isPending =
                        membership?.status ===
                        "pending";

                      const isApproved =
                        membership?.status ===
                        "approved";

                      const isRejected =
                        membership?.status ===
                        "rejected";

                      const isSubmitting =
                        schoolSubmitting ===
                        school.id;

                      return (
                        <div
                          key={school.id}
                          className="
                            rounded-xl
                            border
                            border-gray-200
                            p-4
                            transition
                            hover:border-blue-300
                            hover:shadow-sm
                            dark:border-slate-700
                            dark:hover:border-blue-700
                          "
                        >
                          <div
                            className="
                              flex
                              flex-col
                              gap-4
                              sm:flex-row
                              sm:items-center
                              sm:justify-between
                            "
                          >

                            {/* ==================================
                                INFORMATIONS ECOLE
                                ================================== */}

                            <div
                              className="
                                min-w-0
                              "
                            >
                              <div
                                className="
                                  flex
                                  items-center
                                  gap-2
                                "
                              >
                                <School
                                  size={20}
                                  className="
                                    shrink-0
                                    text-blue-600
                                  "
                                />

                                <h3
                                  className="
                                    font-semibold
                                    text-gray-900
                                    dark:text-white
                                  "
                                >
                                  {school.nom}
                                </h3>
                              </div>

                              {(school.ville ||
                                school.adresse) && (
                                <p
                                  className="
                                    mt-1
                                    text-sm
                                    text-gray-500
                                    dark:text-slate-400
                                  "
                                >
                                  {school.ville &&
                                    school.ville}

                                  {school.ville &&
                                    school.adresse &&
                                    " — "}

                                  {school.adresse &&
                                    school.adresse}
                                </p>
                              )}

                              {school.pays && (
                                <p
                                  className="
                                    mt-1
                                    text-xs
                                    text-gray-400
                                    dark:text-slate-500
                                  "
                                >
                                  {school.pays}
                                </p>
                              )}

                              {/* ================================
                                  STATUT
                                  ================================ */}

                              {membership && (
                                <div
                                  className="
                                    mt-2
                                  "
                                >
                                  {isPending && (
                                    <span
                                      className="
                                        inline-flex
                                        items-center
                                        gap-1.5
                                        rounded-full
                                        bg-yellow-100
                                        px-3
                                        py-1
                                        text-xs
                                        font-medium
                                        text-yellow-800
                                        dark:bg-yellow-950
                                        dark:text-yellow-300
                                      "
                                    >
                                      <Clock3
                                        size={14}
                                      />

                                      Demande en attente
                                    </span>
                                  )}

                                  {isApproved && (
                                    <span
                                      className="
                                        inline-flex
                                        items-center
                                        gap-1.5
                                        rounded-full
                                        bg-green-100
                                        px-3
                                        py-1
                                        text-xs
                                        font-medium
                                        text-green-800
                                        dark:bg-green-950
                                        dark:text-green-300
                                      "
                                    >
                                      <CheckCircle2
                                        size={14}
                                      />

                                      École validée
                                    </span>
                                  )}

                                  {isRejected && (
                                    <span
                                      className="
                                        inline-flex
                                        items-center
                                        gap-1.5
                                        rounded-full
                                        bg-red-100
                                        px-3
                                        py-1
                                        text-xs
                                        font-medium
                                        text-red-800
                                        dark:bg-red-950
                                        dark:text-red-300
                                      "
                                    >
                                      Demande rejetée
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* ==================================
                                BOUTON
                                ================================== */}

                            <div
                              className="
                                shrink-0
                              "
                            >

                              {isApproved ? (

                                <button
                                  type="button"
                                  disabled
                                  className="
                                    flex
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-lg
                                    bg-green-100
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-green-700
                                    sm:w-auto
                                    dark:bg-green-950
                                    dark:text-green-300
                                  "
                                >
                                  <CheckCircle2
                                    size={17}
                                  />

                                  Validée
                                </button>

                              ) : isPending ? (

                                <button
                                  type="button"
                                  disabled
                                  className="
                                    flex
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-lg
                                    bg-yellow-100
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-yellow-700
                                    sm:w-auto
                                    dark:bg-yellow-950
                                    dark:text-yellow-300
                                  "
                                >
                                  <Clock3
                                    size={17}
                                  />

                                  En attente
                                </button>

                              ) : (

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSchoolRequest(
                                      school.id
                                    )
                                  }
                                  disabled={
                                    isSubmitting ||
                                    !schoolCanChoose
                                  }
                                  className="
                                    flex
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-lg
                                    bg-blue-600
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-white
                                    hover:bg-blue-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                    sm:w-auto
                                  "
                                >
                                  {isSubmitting ? (
                                    <>
                                      <Loader2
                                        size={17}
                                        className="
                                          animate-spin
                                        "
                                      />

                                      Envoi...
                                    </>
                                  ) : isRejected ? (
                                    "Demander à nouveau"
                                  ) : (
                                    "Choisir cette école"
                                  )}
                                </button>
                              )}

                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}

              {/* ==================================================
                  INFORMATIONS
                  ================================================== */}

              <div
                className="
                  mt-5
                  rounded-xl
                  border
                  border-blue-100
                  bg-blue-50
                  p-4
                  text-sm
                  text-blue-800
                  dark:border-blue-900
                  dark:bg-blue-950/40
                  dark:text-blue-300
                "
              >
                <p
                  className="
                    font-semibold
                  "
                >
                  Fonctionnement
                </p>

                <ul
                  className="
                    mt-2
                    list-disc
                    space-y-1
                    pl-5
                  "
                >
                  <li>
                    Vous choisissez une école
                    pour l'année scolaire en cours.
                  </li>

                  <li>
                    Votre demande doit être validée
                    par le directeur de l'école.
                  </li>

                  <li>
                    En tant qu'apprenant, vous ne
                    pouvez avoir qu'une seule école
                    active pour l'année scolaire.
                  </li>

                  <li>
                    Une nouvelle sélection est
                    possible à partir du{" "}
                    <strong>
                      1er septembre
                    </strong>{" "}
                    de la nouvelle année scolaire.
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Layout;

