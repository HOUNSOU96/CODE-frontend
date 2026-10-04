
import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  GraduationCap,
  Info,
  Loader2,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  Video,
  Volume2,
  VolumeX,
  XCircle,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

// ============================================================
// TYPES
// ============================================================

interface DocumentInfo {
  id: number;
  name: string;
}

interface UserInfo {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  sexe?: string | null;
  date_naissance?: string | null;
  lieu_naissance?: string | null;
  nationalite?: string | null;
  pays_residence?: string | null;
}

// ============================================================
// COMPOSANT
// ============================================================

const Activation: React.FC = () => {
  // ==========================================================
  // INTRODUCTION VIDÉO
  // ==========================================================

  const [videoIntroFinished, setVideoIntroFinished] =
    useState(false);

  const [videoContinueReady, setVideoContinueReady] =
    useState(false);

  const [videoCountdown, setVideoCountdown] =
    useState(5);

  const [videoSoundEnabled, setVideoSoundEnabled] =
    useState(false);

  const videoIntroRef =
    useRef<HTMLVideoElement | null>(null);

  // ==========================================================
  // ÉTAPE
  // ==========================================================

  const [step, setStep] = useState(1);

  // ==========================================================
  // ÉTAPE 1 — CODE
  // ==========================================================

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  // ==========================================================
  // DOCUMENT
  // ==========================================================

  const [document, setDocument] =
    useState<DocumentInfo | null>(null);

  // ==========================================================
  // ÉTAPE 2 — TYPE D'ACTIVATION
  // ==========================================================

  const [target, setTarget] =
    useState<"self" | "other" | null>(null);

  // ==========================================================
  // ÉTAPE 3 — BÉNÉFICIAIRE
  // ==========================================================

  const [beneficiaryEmail, setBeneficiaryEmail] =
    useState("");

  // ==========================================================
  // IDENTITÉ
  // ==========================================================

  const [userExists, setUserExists] = useState(false);

  const [user, setUser] =
    useState<UserInfo | null>(null);

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [pays, setPays] = useState("");
  const [password, setPassword] = useState("");

  // ==========================================================
  // PERSONNALISATION DU DOCUMENT
  // ==========================================================

  const [etablissement, setEtablissement] =
    useState("");

  const [ville, setVille] =
    useState("");

  const [anneeScolaire, setAnneeScolaire] =
    useState("");

  const [photo, setPhoto] =
    useState<File | null>(null);

  // ==========================================================
  // RÉSULTAT
  // ==========================================================

  const [downloaded, setDownloaded] =
    useState(false);

  const [emailSent, setEmailSent] =
    useState<boolean | null>(null);

  // ==========================================================
  // CHARGEMENT / ERREUR
  // ==========================================================

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==========================================================
  // NOM DU DOCUMENT
  // ==========================================================

  const documentName =
    document?.name || "votre document";

  // ==========================================================
  // FONCTION UTILITAIRE — NOM DE FICHIER
  // ==========================================================

  const getFallbackFilename = () => {
    const safeName =
      documentName
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          ""
        )
        .replace(
          /[^\w\s-]/g,
          ""
        )
        .trim()
        .replace(
          /\s+/g,
          "-"
        );

    return `${
      safeName || "CODE-document"
    }-personnalise.pdf`;
  };

  // ==========================================================
  // FONCTION UTILITAIRE — ERREUR API
  // ==========================================================

  const getApiError = async (
    response: Response
  ): Promise<string> => {
    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    if (
      contentType.includes(
        "application/json"
      )
    ) {
      try {
        const data =
          await response.json();

        if (
          typeof data?.detail ===
          "string"
        ) {
          switch (data.detail) {
            case "DOCUMENT_PDF_NOT_CONFIGURED":
              return "Le modèle PDF de ce document n'est pas encore disponible. L'activation n'a pas été effectuée.";

            case "DOCUMENT_TEMPLATE_NOT_FOUND":
              return "Le modèle PDF de ce document est actuellement indisponible. L'activation n'a pas été effectuée.";

            case "DOCUMENT_ALREADY_ACTIVATED":
              return "Ce code d'activation a déjà été utilisé.";

            case "CODE_DOCUMENT_INVALID":
              return "Le code d'activation est invalide ou n'existe pas.";

            case "SELF_ACTIVATION_EMAIL_MISMATCH":
              return "Pour une activation personnelle, l'e-mail du bénéficiaire doit être identique à l'e-mail utilisé lors de l'achat.";

            case "EMAIL_CODE_MISMATCH":
              return "L'adresse e-mail ne correspond pas à celle utilisée lors de l'achat de ce code.";

            case "PHOTO_FORMAT_INVALID":
              return "La photo doit être au format JPG, JPEG ou PNG.";

            case "PHOTO_TOO_LARGE":
              return "La photo ne doit pas dépasser 5 Mo.";

            case "NOM_REQUIRED":
              return "Le nom est obligatoire.";

            case "PRENOM_REQUIRED":
              return "Le prénom est obligatoire.";

            case "PAYS_RESIDENCE_REQUIRED":
              return "Le pays de résidence est obligatoire.";

            case "PASSWORD_REQUIRED":
              return "Veuillez définir un mot de passe.";

            case "PASSWORD_TOO_SHORT":
              return "Le mot de passe doit contenir au moins 6 caractères.";

            case "ACTIVATION_TYPE_INVALID":
              return "Le type d'activation est invalide.";

            case "TYPST_NOT_AVAILABLE":
              return "Le générateur de documents n'est pas disponible sur le serveur.";

            case "PDF_GENERATION_TIMEOUT":
              return "La génération du document a pris trop de temps. Veuillez réessayer.";

            case "PDF_GENERATION_FAILED":
              return "Une erreur est survenue pendant la génération du PDF.";

            case "DOCUMENT_GENERATOR_NOT_SUPPORTED":
              return "Le générateur de ce document n'est pas encore pris en charge.";

            case "DOCUMENT_PDF_INVALID":
              return "Le PDF généré est invalide ou vide.";

            default:
              return data.detail;
          }
        }

        if (
          typeof data?.message ===
          "string"
        ) {
          return data.message;
        }
      } catch {
        // Message générique ci-dessous.
      }
    }

    return `Une erreur est survenue (${response.status}).`;
  };

  // ==========================================================
  // INTRODUCTION VIDÉO — LECTURE
  // ==========================================================

  useEffect(() => {
    if (videoIntroFinished) {
      return;
    }

    const video =
      videoIntroRef.current;

    if (!video) {
      return;
    }

    video.volume = 1;

    /*
     * On démarre la vidéo avec le son désactivé afin de respecter
     * les politiques d'autoplay des navigateurs.
     */
    video.muted = true;

    video.play().catch(() => {
      // L'utilisateur pourra lancer la vidéo manuellement.
    });
  }, [videoIntroFinished]);

  // ==========================================================
  // INTRODUCTION VIDÉO — COMPTEUR 5 SECONDES
  // ==========================================================

  useEffect(() => {
    if (videoIntroFinished) {
      return;
    }

    if (videoContinueReady) {
      return;
    }

    const interval =
      window.setInterval(() => {
        setVideoCountdown((previous) => {
          if (previous <= 1) {
            window.clearInterval(
              interval
            );

            setVideoContinueReady(
              true
            );

            return 0;
          }

          return previous - 1;
        });
      }, 1000);

    return () =>
      window.clearInterval(
        interval
      );
  }, [
    videoIntroFinished,
    videoContinueReady,
  ]);

  // ==========================================================
  // INTRODUCTION VIDÉO — SON
  // ==========================================================

  const enableVideoSound =
    async () => {
      const video =
        videoIntroRef.current;

      if (!video) {
        return;
      }

      try {
        video.muted = false;
        video.volume = 1;

        setVideoSoundEnabled(
          true
        );

        await video.play();
      } catch {
        setVideoSoundEnabled(
          false
        );
      }
    };

  // ==========================================================
  // INTRODUCTION VIDÉO — VOLUME
  // ==========================================================

  const handleVideoVolumeChange = (
    event: React.SyntheticEvent<HTMLVideoElement>
  ) => {
    const video =
      event.currentTarget;

    setVideoSoundEnabled(
      !video.muted
    );
  };

  // ==========================================================
  // INTRODUCTION VIDÉO — FIN
  // ==========================================================

  const handleVideoEnded = () => {
    setVideoContinueReady(
      true
    );

    setVideoCountdown(0);
  };

  // ==========================================================
  // INTRODUCTION VIDÉO — CONTINUER
  // ==========================================================

  const continueAfterVideo = () => {
    if (!videoContinueReady) {
      return;
    }

    const video =
      videoIntroRef.current;

    if (video) {
      video.pause();
    }

    setVideoIntroFinished(
      true
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================================
  // ÉTAPE 1 — VÉRIFICATION DU CODE
  // ==========================================================

  const verifyCode = async () => {
    setError("");

    if (!email.trim()) {
      setError(
        "Veuillez saisir votre adresse e-mail."
      );
      return;
    }

    if (!code.trim()) {
      setError(
        "Veuillez saisir le code d'activation."
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await fetch(
          `${API_URL}/api/activation/verify`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              email:
                email.trim(),
              activation_code:
                code.trim(),
            }),
          }
        );

      if (!response.ok) {
        const message =
          await getApiError(
            response
          );

        throw new Error(
          message
        );
      }

      const data =
        await response.json();

      setDocument(
        data.document ||
          null
      );

      setStep(2);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de vérifier le code."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // VÉRIFICATION DU BÉNÉFICIAIRE
  // ==========================================================

  const verifyBeneficiary =
    async (
      beneficiary: string
    ) => {
      setError("");

      if (!beneficiary.trim()) {
        setError(
          "L'adresse e-mail du bénéficiaire est obligatoire."
        );
        return;
      }

      try {
        setLoading(true);

        const response =
          await fetch(
            `${API_URL}/api/activation/check-user`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                email:
                  beneficiary.trim(),
              }),
            }
          );

        if (!response.ok) {
          const message =
            await getApiError(
              response
            );

          throw new Error(
            message
          );
        }

        const data =
          await response.json();

        if (data.exists) {
          setUserExists(true);

          setUser(
            data.user
          );

          setNom(
            data.user.nom ||
              ""
          );

          setPrenom(
            data.user.prenom ||
              ""
          );

          setTelephone(
            data.user.telephone ||
              ""
          );

          setPays(
            data.user.pays_residence ||
              ""
          );
        } else {
          setUserExists(false);
          setUser(null);

          setNom("");
          setPrenom("");
          setTelephone("");
          setPays("");
          setPassword("");
        }

        setStep(4);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de vérifier le bénéficiaire."
        );
      } finally {
        setLoading(false);
      }
    };

  // ==========================================================
  // ÉTAPE 2 — CHOIX DU BÉNÉFICIAIRE
  // ==========================================================

  const handleTargetSelection =
    async (
      selectedTarget:
        | "self"
        | "other"
    ) => {
      setError("");

      setTarget(
        selectedTarget
      );

      if (
        selectedTarget ===
        "self"
      ) {
        setBeneficiaryEmail(
          email.trim()
        );

        await verifyBeneficiary(
          email
        );

        return;
      }

      setBeneficiaryEmail("");
      setStep(3);
    };

  // ==========================================================
  // ÉTAPE 3 — AUTRE BÉNÉFICIAIRE
  // ==========================================================

  const continueWithBeneficiary =
    async () => {
      setError("");

      if (
        !beneficiaryEmail.trim()
      ) {
        setError(
          "Veuillez saisir l'adresse e-mail du bénéficiaire."
        );

        return;
      }

      await verifyBeneficiary(
        beneficiaryEmail
      );
    };

  // ==========================================================
  // PHOTO
  // ==========================================================

  const handlePhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setError("");

    const file =
      event.target.files?.[0] ||
      null;

    if (!file) {
      setPhoto(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "La photo doit être au format .jpg, .jpeg ou .png."
      );

      event.target.value =
        "";

      setPhoto(null);

      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (
      file.size >
      maxSize
    ) {
      setError(
        "La photo ne doit pas dépasser 5 Mo."
      );

      event.target.value =
        "";

      setPhoto(null);

      return;
    }

    setPhoto(file);
  };

  // ==========================================================
  // ACTIVATION + GÉNÉRATION PDF
  // ==========================================================

  const handleActivation =
    async () => {
      setError("");
      setDownloaded(false);
      setEmailSent(null);

      // ------------------------------------------------------
      // Validation identité nouveau compte
      // ------------------------------------------------------

      if (!userExists) {
        if (!nom.trim()) {
          setError(
            "Le nom est obligatoire."
          );
          return;
        }

        if (!prenom.trim()) {
          setError(
            "Le prénom est obligatoire."
          );
          return;
        }

        if (!pays.trim()) {
          setError(
            "Le pays de résidence est obligatoire."
          );
          return;
        }

        if (!password.trim()) {
          setError(
            "Veuillez définir un mot de passe."
          );
          return;
        }

        if (
          password.length < 6
        ) {
          setError(
            "Le mot de passe doit contenir au moins 6 caractères."
          );
          return;
        }
      }

      // ------------------------------------------------------
      // Détermination e-mail bénéficiaire
      // ------------------------------------------------------

      const finalBeneficiaryEmail =
        target === "self"
          ? email.trim()
          : beneficiaryEmail.trim();

      if (
        !finalBeneficiaryEmail
      ) {
        setError(
          "L'adresse e-mail du bénéficiaire est obligatoire."
        );
        return;
      }

      // ------------------------------------------------------
      // FormData
      // ------------------------------------------------------

      const formData =
        new FormData();

      formData.append(
        "activation_code",
        code.trim()
      );

      formData.append(
        "buyer_email",
        email.trim()
      );

      formData.append(
        "activation_type",
        target || "self"
      );

      formData.append(
        "beneficiary_email",
        finalBeneficiaryEmail
      );

      // ------------------------------------------------------
      // Identité
      // ------------------------------------------------------

      if (!userExists) {
        formData.append(
          "nom",
          nom.trim()
        );

        formData.append(
          "prenom",
          prenom.trim()
        );

        if (
          telephone.trim()
        ) {
          formData.append(
            "telephone",
            telephone.trim()
          );
        }

        formData.append(
          "pays_residence",
          pays.trim()
        );

        if (
          password.trim()
        ) {
          formData.append(
            "password",
            password
          );
        }
      }

      // ------------------------------------------------------
      // Personnalisation
      // ------------------------------------------------------

      if (
        etablissement.trim()
      ) {
        formData.append(
          "etablissement",
          etablissement.trim()
        );
      }

      if (
        ville.trim()
      ) {
        formData.append(
          "ville",
          ville.trim()
        );
      }

      if (
        anneeScolaire.trim()
      ) {
        formData.append(
          "annee_scolaire",
          anneeScolaire.trim()
        );
      }

      if (photo) {
        formData.append(
          "photo",
          photo
        );
      }

      // ------------------------------------------------------
      // Activation
      // ------------------------------------------------------

      try {
        setLoading(true);

        const response =
          await fetch(
            `${API_URL}/api/activation/activate`,
            {
              method: "POST",
              body: formData,
            }
          );

        if (!response.ok) {
          const message =
            await getApiError(
              response
            );

          throw new Error(
            message
          );
        }

        // ----------------------------------------------------
        // Vérification PDF
        // ----------------------------------------------------

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        if (
          !contentType.includes(
            "application/pdf"
          )
        ) {
          throw new Error(
            "Le serveur n'a pas retourné le PDF attendu."
          );
        }

        const pdfBlob =
          await response.blob();

        if (
          pdfBlob.size === 0
        ) {
          throw new Error(
            "Le PDF généré est vide."
          );
        }

        // ----------------------------------------------------
        // Téléchargement
        // ----------------------------------------------------

        const blobUrl =
          window.URL.createObjectURL(
            pdfBlob
          );

        const downloadLink =
          window.document.createElement(
            "a"
          );

        downloadLink.href =
          blobUrl;

        const contentDisposition =
          response.headers.get(
            "Content-Disposition"
          );

        let filename =
          getFallbackFilename();

        if (
          contentDisposition
        ) {
          const filenameMatch =
            contentDisposition.match(
              /filename="?([^"]+)"?/i
            );

          if (
            filenameMatch?.[1]
          ) {
            filename =
              filenameMatch[1];
          }
        }

        downloadLink.download =
          filename;

        window.document.body.appendChild(
          downloadLink
        );

        downloadLink.click();

        window.document.body.removeChild(
          downloadLink
        );

        window.URL.revokeObjectURL(
          blobUrl
        );

        setDownloaded(true);

        // ----------------------------------------------------
        // Statut e-mail
        // ----------------------------------------------------

        const emailStatus =
          response.headers.get(
            "X-Email-Sent"
          );

        setEmailSent(
          emailStatus ===
            "true"
        );

        // ----------------------------------------------------
        // Nettoyage local de la photo
        // ----------------------------------------------------

        setPhoto(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible d'activer le document."
        );
      } finally {
        setLoading(false);
      }
    };

  // ==========================================================
  // RETOUR
  // ==========================================================

  const goBack = () => {
    setError("");

    if (step > 1) {
      setStep(
        step - 1
      );
    }
  };

  // ==========================================================
  // CLASSES COMMUNES
  // ==========================================================

  const cardClass = `
    bg-white/85
    backdrop-blur-xl
    rounded-3xl
    border
    border-white/60
    shadow-2xl
    shadow-black/10
    dark:bg-gray-900/85
    dark:border-gray-700/70
    dark:shadow-black/30
  `;

  const inputClass = `
    w-full
    px-4
    py-3.5
    border
    border-gray-300
    rounded-xl
    bg-white/90
    text-gray-900
    outline-none
    transition
    focus:ring-4
    focus:ring-blue-500/10
    focus:border-blue-500
    dark:border-gray-700
    dark:bg-gray-950/90
    dark:text-white
    dark:placeholder-gray-500
  `;

  // ==========================================================
  // INTRODUCTION VIDÉO — AFFICHAGE PRIORITAIRE
  // ==========================================================

  if (!videoIntroFinished) {
    return (
      <div
        className="
          fixed
          inset-0
          z-[9999]
          bg-black
          overflow-hidden
        "
      >
        {/* ====================================================
            VIDÉO
        ==================================================== */}

        <video
          ref={videoIntroRef}
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
          "
          playsInline
          controls
          preload="auto"
          onEnded={
            handleVideoEnded
          }
          onVolumeChange={
            handleVideoVolumeChange
          }
        >
          <source
            src="/videos/pre.mp4"
            type="video/mp4"
          />

          Votre navigateur ne prend pas en charge
          la lecture vidéo.
        </video>

        {/* ====================================================
            VOILE LÉGER
        ==================================================== */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-black/70
            via-transparent
            to-black/20
            pointer-events-none
          "
        />

        {/* ====================================================
            IDENTITÉ CODE
        ==================================================== */}

        <div
          className="
            absolute
            top-5
            left-5
            sm:top-8
            sm:left-8
            flex
            items-center
            gap-3
            z-10
          "
        >
          <div
            className="
              w-11
              h-11
              sm:w-12
              sm:h-12
              rounded-2xl
              bg-gradient-to-br
              from-blue-500
              via-indigo-600
              to-violet-700
              text-white
              flex
              items-center
              justify-center
              font-black
              text-xl
              shadow-2xl
              shadow-blue-900/40
              border
              border-white/20
            "
          >
            C
          </div>

          <div
            className="
              hidden
              sm:block
            "
          >
            <p
              className="
                text-white
                font-black
                text-lg
                tracking-tight
              "
            >
              CODE
            </p>

            <p
              className="
                text-white/60
                text-xs
              "
            >
              L'écosystème éducatif
            </p>
          </div>
        </div>

        {/* ====================================================
            SON
        ==================================================== */}

        {!videoSoundEnabled && (
          <button
            type="button"
            onClick={
              enableVideoSound
            }
            className="
              absolute
              top-5
              right-5
              sm:top-8
              sm:right-8
              z-20
              inline-flex
              items-center
              gap-2
              px-4
              py-3
              rounded-2xl
              bg-white/10
              hover:bg-white/20
              backdrop-blur-xl
              border
              border-white/20
              text-white
              font-bold
              text-sm
              shadow-xl
              transition-all
            "
          >
            <Volume2
              className="w-4 h-4"
            />
            Activer le son
          </button>
        )}

        {videoSoundEnabled && (
          <div
            className="
              absolute
              top-5
              right-5
              sm:top-8
              sm:right-8
              z-20
              inline-flex
              items-center
              gap-2
              px-4
              py-3
              rounded-2xl
              bg-black/30
              backdrop-blur-xl
              border
              border-white/10
              text-white/80
              text-sm
            "
          >
            <Volume2
              className="w-4 h-4"
            />
            Son activé
          </div>
        )}

        {/* ====================================================
            ZONE BASSE
        ==================================================== */}

        <div
          className="
            absolute
            left-0
            right-0
            bottom-0
            z-20
            p-5
            sm:p-8
            flex
            flex-col
            items-center
            justify-end
          "
        >
          {/* --------------------------------------------------
              MESSAGE PENDANT LES 5 SECONDES
          -------------------------------------------------- */}

          {!videoContinueReady && (
            <div
              className="
                flex
                flex-col
                items-center
                gap-3
                text-center
              "
            >
              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-5
                  py-3
                  rounded-2xl
                  bg-black/45
                  backdrop-blur-xl
                  border
                  border-white/10
                  text-white
                  shadow-2xl
                "
              >
                <Clock3
                  className="
                    w-5
                    h-5
                    text-blue-300
                  "
                />

                <span
                  className="
                    text-sm
                    sm:text-base
                    font-semibold
                  "
                >
                  Vous pourrez continuer dans
                  {" "}
                  <span
                    className="
                      font-black
                      text-blue-300
                    "
                  >
                    {videoCountdown}
                  </span>
                  {" "}
                  seconde
                  {videoCountdown > 1
                    ? "s"
                    : ""}
                </span>
              </div>

              <p
                className="
                  text-white/60
                  text-xs
                  sm:text-sm
                "
              >
                Regardez cette courte présentation
                avant de poursuivre.
              </p>
            </div>
          )}

          {/* --------------------------------------------------
              BOUTON CONTINUER APRÈS 5 SECONDES
          -------------------------------------------------- */}

          {videoContinueReady && (
            <div
              className="
                flex
                flex-col
                items-center
                gap-3
              "
            >
              

              <button
                type="button"
                onClick={
                  continueAfterVideo
                }
                className="
                  group
                  inline-flex
                  items-center
                  justify-center
                  gap-3
                  px-7
                  sm:px-9
                  py-4
                  rounded-2xl
                  bg-gradient-to-r
                  from-blue-600
                  via-indigo-600
                  to-violet-700
                  hover:from-blue-500
                  hover:via-indigo-500
                  hover:to-violet-600
                  text-white
                  font-black
                  text-base
                  sm:text-lg
                  shadow-2xl
                  shadow-blue-900/40
                  border
                  border-white/20
                  transition-all
                  duration-200
                  hover:-translate-y-1
                  active:scale-[0.98]
                "
              >
                Continuer vers l'activation

                <ArrowRight
                  className="
                    w-5
                    h-5
                    transition-transform
                    group-hover:translate-x-1
                  "
                />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDU PRINCIPAL
  // ==========================================================

  return (
    <div
      className="
        relative
        min-h-screen
        w-full
        overflow-hidden
        bg-gradient-to-br
        from-slate-50
        via-blue-50/60
        to-indigo-50
        dark:from-gray-950
        dark:via-gray-950
        dark:to-blue-950/30
      "
    >
      {/* ======================================================
          DÉCORATIONS
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -top-32
          -left-32
          w-80
          h-80
          rounded-full
          bg-blue-500/20
          blur-3xl
          dark:bg-blue-600/10
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          top-1/3
          -right-40
          w-96
          h-96
          rounded-full
          bg-violet-500/15
          blur-3xl
          dark:bg-violet-600/10
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          left-1/3
          w-80
          h-80
          rounded-full
          bg-cyan-400/10
          blur-3xl
        "
      />

      {/* ======================================================
          CONTENU
      ====================================================== */}

      <div
        className="
          relative
          z-10
          max-w-5xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          py-8
          sm:py-10
        "
      >
        {/* ====================================================
            EN-TÊTE
        ==================================================== */}

        <div
          className="
            mb-6
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-4
          "
        >
          <div
            className="
              flex
              items-center
              gap-4
            "
          >
            <div
              className="
                w-14
                h-14
                shrink-0
                rounded-2xl
                bg-gradient-to-br
                from-blue-600
                via-indigo-600
                to-violet-700
                text-white
                flex
                items-center
                justify-center
                shadow-xl
                shadow-blue-600/30
                font-black
                text-2xl
                border
                border-white/20
              "
            >
              C
            </div>

            <div>
              <p
                className="
                  text-sm
                  font-semibold
                  text-blue-700
                  dark:text-blue-300
                "
              >
                CODE
              </p>

              <h1
                className="
                  text-2xl
                  sm:text-3xl
                  font-black
                  tracking-tight
                  text-blue-700
                  dark:text-white
                "
              >
                Activation de votre document
              </h1>

              {document && (
                <p
                  className="
                    mt-1
                    text-sm
                    text-gray-700
                    dark:text-gray-300
                  "
                >
                  Document :
                  {" "}
                  <span
                    className="
                      font-extrabold
                      text-blue-700
                      dark:text-blue-400
                    "
                  >
                    {document.name}
                  </span>
                </p>
              )}
            </div>
          </div>

          <Link
            to="/"
            className="
              self-start
              sm:self-auto
              inline-flex
              items-center
              gap-2
              px-4
              py-2.5
              rounded-xl
              bg-white/80
              backdrop-blur
              border
              border-white/70
              text-blue-700
              hover:bg-white
              hover:-translate-y-0.5
              transition
              shadow-lg
              font-semibold
              dark:bg-gray-900/80
              dark:border-gray-700
              dark:text-blue-300
              dark:hover:bg-gray-800
            "
          >
            <ArrowLeft
              className="w-4 h-4"
            />

            Accueil
          </Link>
        </div>

        {/* ====================================================
            INDICATEUR D'ÉTAPES
        ==================================================== */}

        <div
          className="
            mb-8
            rounded-2xl
            border
            border-white/60
            bg-white/80
            backdrop-blur-xl
            p-4
            sm:p-6
            shadow-xl
            dark:border-gray-700/70
            dark:bg-gray-900/80
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-2
            "
          >
            {[
              {
                number: 1,
                label: "Code",
              },
              {
                number: 2,
                label: "Bénéficiaire",
              },
              {
                number: 3,
                label: "E-mail",
              },
              {
                number: 4,
                label: "Personnalisation",
              },
            ].map(
              (item) => (
                <React.Fragment
                  key={
                    item.number
                  }
                >
                  <div
                    className="
                      flex
                      flex-col
                      items-center
                      min-w-0
                    "
                  >
                    <div
                      className={`
                        w-10
                        h-10
                        rounded-full
                        flex
                        items-center
                        justify-center
                        font-bold
                        transition-all
                        duration-300
                        ${
                          step >=
                          item.number
                            ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/30"
                            : "bg-gray-100/90 text-gray-500 dark:bg-gray-800/90 dark:text-gray-500"
                        }
                      `}
                    >
                      {step >
                      item.number ? (
                        <Check
                          className="
                            w-5
                            h-5
                          "
                        />
                      ) : (
                        item.number
                      )}
                    </div>

                    <span
                      className="
                        text-[11px]
                        sm:text-xs
                        mt-2
                        text-center
                        font-medium
                        text-gray-700
                        dark:text-gray-400
                      "
                    >
                      {item.label}
                    </span>
                  </div>

                  {item.number <
                    4 && (
                    <div
                      className={`
                        flex-1
                        h-1
                        rounded-full
                        mx-1
                        sm:mx-2
                        transition-all
                        duration-300
                        ${
                          step >
                          item.number
                            ? "bg-blue-600"
                            : "bg-gray-300/80 dark:bg-gray-700"
                        }
                      `}
                    />
                  )}
                </React.Fragment>
              )
            )}
          </div>
        </div>

        {/* ====================================================
            ERREUR
        ==================================================== */}

        {error && (
          <div
            className="
              mb-6
              p-4
              rounded-2xl
              border
              border-red-300
              bg-red-50/90
              backdrop-blur
              text-red-700
              shadow-lg
              dark:border-red-900/70
              dark:bg-red-950/70
              dark:text-red-300
            "
          >
            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              <div
                className="
                  w-9
                  h-9
                  shrink-0
                  rounded-xl
                  bg-red-100
                  flex
                  items-center
                  justify-center
                  dark:bg-red-900/60
                "
              >
                <XCircle
                  className="
                    w-5
                    h-5
                  "
                />
              </div>

              <p
                className="
                  text-sm
                  sm:text-base
                  font-medium
                  pt-1
                "
              >
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ====================================================
            ÉTAPE 1 — CODE
        ==================================================== */}

        {step === 1 && (
          <div
            className={`
              ${cardClass}
              overflow-hidden
            `}
          >
            <div
              className="
                bg-gradient-to-r
                from-blue-600/95
                via-indigo-600/95
                to-violet-700/95
                p-6
                sm:p-8
                text-white
              "
            >
              <div
                className="
                  flex
                  items-start
                  gap-4
                "
              >
                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-white/15
                    border
                    border-white/20
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >
                  <ShieldCheck
                    className="
                      w-6
                      h-6
                    "
                  />
                </div>

                <div>
                  <h2
                    className="
                      text-xl
                      sm:text-2xl
                      font-extrabold
                    "
                  >
                    Vérification du code
                  </h2>

                  <p
                    className="
                      text-blue-100
                      mt-1
                      text-sm
                      sm:text-base
                    "
                  >
                    Activez votre document en toute simplicité.
                  </p>
                </div>
              </div>
            </div>

            <div
              className="
                p-5
                sm:p-8
              "
            >
              <p
                className="
                  text-gray-700
                  dark:text-gray-300
                  mb-6
                "
              >
                Saisissez l'adresse e-mail utilisée lors de
                l'achat ainsi que votre code d'activation.
              </p>


              {/* =================================================
                  FORMULAIRE
              ================================================= */}

              <div
                className="
                  space-y-5
                "
              >
                <div>
                  <label
                    className="
                      block
                      text-sm
                      font-bold
                      text-gray-700
                      dark:text-gray-300
                      mb-2
                    "
                  >
                    Adresse e-mail
                  </label>

                  <div
                    className="
                      relative
                    "
                  >
                    <Mail
                      className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        w-5
                        h-5
                        text-gray-400
                      "
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(
                          e.target.value
                        )
                      }
                      placeholder="exemple@email.com"
                      autoComplete="email"
                      className={`
                        ${inputClass}
                        pl-12
                      `}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="
                      block
                      text-sm
                      font-bold
                      text-gray-700
                      dark:text-gray-300
                      mb-2
                    "
                  >
                    Code d'activation
                  </label>

                  <div
                    className="
                      relative
                    "
                  >
                    <ShieldCheck
                      className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        w-5
                        h-5
                        text-gray-400
                      "
                    />

                    <input
                      type="text"
                      value={code}
                      onChange={(e) =>
                        setCode(
                          e.target.value
                        )
                      }
                      placeholder="CODE-XXXX-XXXX-XXXX-XXXX"
                      autoComplete="off"
                      className={`
                        ${inputClass}
                        pl-12
                        uppercase
                        tracking-wide
                      `}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    verifyCode
                  }
                  disabled={loading}
                  className="
                    w-full
                    inline-flex
                    items-center
                    justify-center
                    gap-3
                    bg-gradient-to-r
                    from-blue-600
                    to-indigo-700
                    hover:from-blue-700
                    hover:to-indigo-800
                    disabled:from-gray-400
                    disabled:to-gray-500
                    text-white
                    font-bold
                    py-3.5
                    px-6
                    rounded-xl
                    shadow-xl
                    shadow-blue-600/25
                    transition-all
                    duration-200
                    active:scale-[0.99]
                  "
                >
                  {loading ? (
                    <>
                      <Loader2
                        className="
                          w-5
                          h-5
                          animate-spin
                        "
                      />

                      Vérification...
                    </>
                  ) : (
                    <>
                      Vérifier le code

                      <ChevronRight
                        className="
                          w-5
                          h-5
                        "
                      />
                    </>
                  )}
                </button>
              </div>

              <div
                className="
                  mt-6
                  flex
                  items-start
                  gap-3
                  p-4
                  rounded-2xl
                  bg-blue-50/80
                  border
                  border-blue-100
                  dark:bg-blue-950/30
                  dark:border-blue-900/60
                "
              >
                <Info
                  className="
                    w-5
                    h-5
                    text-blue-600
                    dark:text-blue-400
                    shrink-0
                  "
                />

                <p
                  className="
                    text-xs
                    sm:text-sm
                    text-blue-800
                    dark:text-blue-300
                  "
                >
                  Utilisez l'adresse e-mail associée à
                  l'achat de votre code d'activation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            ÉTAPE 2 — BÉNÉFICIAIRE
        ==================================================== */}

        {step === 2 && (
          <div
            className={`
              ${cardClass}
              p-6
              sm:p-8
            `}
          >
            <div
              className="
                text-center
                max-w-2xl
                mx-auto
                mb-8
              "
            >
              <div
                className="
                  mx-auto
                  w-16
                  h-16
                  rounded-2xl
                  bg-blue-100
                  text-blue-700
                  flex
                  items-center
                  justify-center
                  mb-4
                  dark:bg-blue-950
                  dark:text-blue-300
                "
              >
                <Users
                  className="
                    w-8
                    h-8
                  "
                />
              </div>

              <h2
                className="
                  text-2xl
                  sm:text-3xl
                  font-extrabold
                  text-gray-900
                  dark:text-white
                "
              >
                Qui va utiliser le document ?
              </h2>

              <p
                className="
                  text-gray-700
                  dark:text-gray-400
                  mt-2
                "
              >
                Indiquez si le document est destiné à vous-même
                ou à une autre personne.
              </p>
            </div>

            <div
              className="
                grid
                md:grid-cols-2
                gap-5
              "
            >
              <button
                type="button"
                onClick={() =>
                  handleTargetSelection(
                    "self"
                  )
                }
                disabled={loading}
                className="
                  group
                  border-2
                  border-gray-200
                  bg-white/70
                  hover:border-blue-500
                  hover:bg-blue-50/90
                  rounded-2xl
                  p-6
                  sm:p-8
                  text-left
                  transition-all
                  duration-200
                  hover:-translate-y-1
                  hover:shadow-xl
                  dark:border-gray-700
                  dark:bg-gray-950/50
                  dark:hover:border-blue-500
                  dark:hover:bg-blue-950/40
                "
              >
                <div
                  className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-blue-100
                    flex
                    items-center
                    justify-center
                    mb-5
                    dark:bg-blue-950
                  "
                >
                  <User
                    className="
                      w-7
                      h-7
                      text-blue-700
                      dark:text-blue-300
                    "
                  />
                </div>

                <h3
                  className="
                    font-extrabold
                    text-xl
                    text-gray-900
                    dark:text-white
                  "
                >
                  Pour moi
                </h3>

                <p
                  className="
                    text-sm
                    text-gray-700
                    dark:text-gray-400
                    mt-2
                    leading-relaxed
                  "
                >
                  Le document sera associé à votre compte et
                  personnalisé avec vos informations.
                </p>

                <div
                  className="
                    mt-5
                    flex
                    items-center
                    gap-2
                    text-sm
                    font-bold
                    text-blue-600
                    dark:text-blue-400
                  "
                >
                  Continuer

                  <ArrowRight
                    className="
                      w-4
                      h-4
                      transition-transform
                      group-hover:translate-x-1
                    "
                  />
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleTargetSelection(
                    "other"
                  )
                }
                disabled={loading}
                className="
                  group
                  border-2
                  border-gray-200
                  bg-white/70
                  hover:border-indigo-500
                  hover:bg-indigo-50/90
                  rounded-2xl
                  p-6
                  sm:p-8
                  text-left
                  transition-all
                  duration-200
                  hover:-translate-y-1
                  hover:shadow-xl
                  dark:border-gray-700
                  dark:bg-gray-950/50
                  dark:hover:border-indigo-500
                  dark:hover:bg-indigo-950/40
                "
              >
                <div
                  className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-indigo-100
                    flex
                    items-center
                    justify-center
                    mb-5
                    dark:bg-indigo-950
                  "
                >
                  <Users
                    className="
                      w-7
                      h-7
                      text-indigo-700
                      dark:text-indigo-300
                    "
                  />
                </div>

                <h3
                  className="
                    font-extrabold
                    text-xl
                    text-gray-900
                    dark:text-white
                  "
                >
                  Pour une autre personne
                </h3>

                <p
                  className="
                    text-sm
                    text-gray-700
                    dark:text-gray-400
                    mt-2
                    leading-relaxed
                  "
                >
                  Le document sera personnalisé pour un autre
                  bénéficiaire.
                </p>

                <div
                  className="
                    mt-5
                    flex
                    items-center
                    gap-2
                    text-sm
                    font-bold
                    text-indigo-600
                    dark:text-indigo-400
                  "
                >
                  Continuer

                  <ArrowRight
                    className="
                      w-4
                      h-4
                      transition-transform
                      group-hover:translate-x-1
                    "
                  />
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={
                goBack
              }
              className="
                mt-8
                inline-flex
                items-center
                gap-2
                text-gray-700
                hover:text-gray-950
                dark:text-gray-400
                dark:hover:text-white
                font-semibold
                transition
              "
            >
              <ArrowLeft
                className="
                  w-4
                  h-4
                "
              />

              Retour
            </button>
          </div>
        )}

        {/* ====================================================
            ÉTAPE 3 — E-MAIL BÉNÉFICIAIRE
        ==================================================== */}

        {step === 3 && (
          <div
            className={`
              ${cardClass}
              p-6
              sm:p-8
            `}
          >
            <div
              className="
                text-center
                max-w-2xl
                mx-auto
                mb-8
              "
            >
              <div
                className="
                  mx-auto
                  w-16
                  h-16
                  rounded-2xl
                  bg-indigo-100
                  text-indigo-700
                  flex
                  items-center
                  justify-center
                  mb-4
                  dark:bg-indigo-950
                  dark:text-indigo-300
                "
              >
                <Mail
                  className="
                    w-8
                    h-8
                  "
                />
              </div>

              <h2
                className="
                  text-2xl
                  sm:text-3xl
                  font-extrabold
                  text-gray-900
                  dark:text-white
                "
              >
                E-mail du bénéficiaire
              </h2>

              <p
                className="
                  text-gray-700
                  dark:text-gray-400
                  mt-2
                "
              >
                Saisissez l'adresse e-mail de la personne qui
                recevra et utilisera le document.
              </p>
            </div>

            <div>
              <label
                className="
                  block
                  text-sm
                  font-bold
                  text-gray-700
                  dark:text-gray-300
                  mb-2
                "
              >
                E-mail du bénéficiaire
              </label>

              <div
                className="
                  relative
                "
              >
                <Mail
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    w-5
                    h-5
                    text-gray-400
                  "
                />

                <input
                  type="email"
                  value={
                    beneficiaryEmail
                  }
                  onChange={(e) =>
                    setBeneficiaryEmail(
                      e.target.value
                    )
                  }
                  placeholder="beneficiaire@email.com"
                  autoComplete="email"
                  className={`
                    ${inputClass}
                    pl-12
                  `}
                />
              </div>
            </div>

            <div
              className="
                flex
                items-center
                justify-between
                mt-8
                gap-4
              "
            >
              <button
                type="button"
                onClick={
                  goBack
                }
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-gray-700
                  hover:text-gray-950
                  dark:text-gray-400
                  dark:hover:text-white
                  font-semibold
                "
              >
                <ArrowLeft
                  className="
                    w-4
                    h-4
                  "
                />

                Retour
              </button>

              <button
                type="button"
                onClick={
                  continueWithBeneficiary
                }
                disabled={loading}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  bg-gradient-to-r
                  from-blue-600
                  to-indigo-700
                  hover:from-blue-700
                  hover:to-indigo-800
                  disabled:from-gray-400
                  disabled:to-gray-500
                  text-white
                  font-bold
                  py-3.5
                  px-6
                  rounded-xl
                  shadow-xl
                  shadow-blue-600/25
                  transition
                "
              >
                {loading ? (
                  <>
                    <Loader2
                      className="
                        w-5
                        h-5
                        animate-spin
                      "
                    />

                    Vérification...
                  </>
                ) : (
                  <>
                    Continuer

                    <ArrowRight
                      className="
                        w-5
                        h-5
                      "
                    />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ====================================================
            ÉTAPE 4
        ==================================================== */}

        {step === 4 && (
          <div
            className="
              space-y-6
            "
          >
            {/* ==================================================
                IDENTITÉ
            ================================================== */}

            <div
              className={`
                ${cardClass}
                p-6
                sm:p-8
              `}
            >
              <div
                className="
                  flex
                  items-start
                  gap-4
                  mb-7
                "
              >
                <div
                  className="
                    w-12
                    h-12
                    shrink-0
                    rounded-2xl
                    bg-green-100
                    text-green-700
                    flex
                    items-center
                    justify-center
                    dark:bg-green-950
                    dark:text-green-300
                  "
                >
                  <User
                    className="
                      w-6
                      h-6
                    "
                  />
                </div>

                <div>
                  <h2
                    className="
                      text-xl
                      sm:text-2xl
                      font-extrabold
                      text-gray-900
                      dark:text-white
                    "
                  >
                    Informations du bénéficiaire
                  </h2>

                  <p
                    className="
                      text-gray-700
                      dark:text-gray-400
                      mt-1
                    "
                  >
                    Les informations du bénéficiaire serviront
                    à personnaliser {documentName}.
                  </p>
                </div>
              </div>

              {userExists ? (
                <div
                  className="
                    space-y-5
                  "
                >
                  <div
                    className="
                      p-4
                      bg-green-50/90
                      border
                      border-green-200
                      rounded-2xl
                      dark:bg-green-950/40
                      dark:border-green-900
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >
                      <div
                        className="
                          w-10
                          h-10
                          bg-green-100
                          rounded-full
                          flex
                          items-center
                          justify-center
                          dark:bg-green-900/50
                        "
                      >
                        <Check
                          className="
                            w-5
                            h-5
                            text-green-700
                            dark:text-green-300
                          "
                        />
                      </div>

                      <div>
                        <p
                          className="
                            font-bold
                            text-green-800
                            dark:text-green-300
                          "
                        >
                          Compte existant
                        </p>

                        <p
                          className="
                            text-sm
                            text-green-700
                            dark:text-green-400
                          "
                        >
                          Les informations de votre compte ont
                          été récupérées automatiquement.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="
                      grid
                      md:grid-cols-2
                      gap-4
                    "
                  >
                    <div>
                      <label
                        className="
                          block
                          text-sm
                          font-semibold
                          text-gray-700
                          dark:text-gray-300
                          mb-1
                        "
                      >
                        Nom
                      </label>

                      <input
                        type="text"
                        value={
                          nom
                        }
                        disabled
                        className="
                          w-full
                          px-4
                          py-3
                          bg-gray-100/90
                          border
                          border-gray-300
                          rounded-xl
                          text-gray-700
                          dark:bg-gray-800/90
                          dark:border-gray-700
                          dark:text-gray-300
                        "
                      />
                    </div>

                    <div>
                      <label
                        className="
                          block
                          text-sm
                          font-semibold
                          text-gray-700
                          dark:text-gray-300
                          mb-1
                        "
                      >
                        Prénom(s)
                      </label>

                      <input
                        type="text"
                        value={
                          prenom
                        }
                        disabled
                        className="
                          w-full
                          px-4
                          py-3
                          bg-gray-100/90
                          border
                          border-gray-300
                          rounded-xl
                          text-gray-700
                          dark:bg-gray-800/90
                          dark:border-gray-700
                          dark:text-gray-300
                        "
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="
                        block
                        text-sm
                        font-semibold
                        text-gray-700
                        dark:text-gray-300
                        mb-1
                      "
                    >
                      E-mail
                    </label>

                    <input
                      type="email"
                      value={
                        user?.email ||
                        (
                          target ===
                          "self"
                            ? email
                            : beneficiaryEmail
                        )
                      }
                      disabled
                      className="
                        w-full
                        px-4
                        py-3
                        bg-gray-100/90
                        border
                        border-gray-300
                        rounded-xl
                        text-gray-700
                        dark:bg-gray-800/90
                        dark:border-gray-700
                        dark:text-gray-300
                      "
                    />
                  </div>

                  <div
                    className="
                      grid
                      md:grid-cols-2
                      gap-4
                    "
                  >
                    <div>
                      <label
                        className="
                          block
                          text-sm
                          font-semibold
                          text-gray-700
                          dark:text-gray-300
                          mb-1
                        "
                      >
                        Téléphone
                      </label>

                      <input
                        type="text"
                        value={
                          telephone
                        }
                        disabled
                        className="
                          w-full
                          px-4
                          py-3
                          bg-gray-100/90
                          border
                          border-gray-300
                          rounded-xl
                          text-gray-700
                          dark:bg-gray-800/90
                          dark:border-gray-700
                          dark:text-gray-300
                        "
                      />
                    </div>

                    <div>
                      <label
                        className="
                          block
                          text-sm
                          font-semibold
                          text-gray-700
                          dark:text-gray-300
                          mb-1
                        "
                      >
                        Pays de résidence
                      </label>

                      <input
                        type="text"
                        value={
                          pays
                        }
                        disabled
                        className="
                          w-full
                          px-4
                          py-3
                          bg-gray-100/90
                          border
                          border-gray-300
                          rounded-xl
                          text-gray-700
                          dark:bg-gray-800/90
                          dark:border-gray-700
                          dark:text-gray-300
                        "
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="
                    space-y-5
                  "
                >
                  <div
                    className="
                      grid
                      md:grid-cols-2
                      gap-4
                    "
                  >
                    <div>
                      <label
                        className="
                          block
                          text-sm
                          font-semibold
                          text-gray-700
                          dark:text-gray-300
                          mb-2
                        "
                      >
                        Nom *
                      </label>

                      <input
                        type="text"
                        value={
                          nom
                        }
                        onChange={(e) =>
                          setNom(
                            e.target.value
                          )
                        }
                        placeholder="Nom"
                        autoComplete="family-name"
                        className={
                          inputClass
                        }
                      />
                    </div>

                    <div>
                      <label
                        className="
                          block
                          text-sm
                          font-semibold
                          text-gray-700
                          dark:text-gray-300
                          mb-2
                        "
                      >
                        Prénom(s) *
                      </label>

                      <input
                        type="text"
                        value={
                          prenom
                        }
                        onChange={(e) =>
                          setPrenom(
                            e.target.value
                          )
                        }
                        placeholder="Prénom(s)"
                        autoComplete="given-name"
                        className={
                          inputClass
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="
                        block
                        text-sm
                        font-semibold
                        text-gray-700
                        dark:text-gray-300
                        mb-2
                      "
                    >
                      E-mail
                    </label>

                    <input
                      type="email"
                      value={
                        target ===
                        "self"
                          ? email
                          : beneficiaryEmail
                      }
                      disabled
                      className="
                        w-full
                        px-4
                        py-3
                        bg-gray-100/90
                        border
                        border-gray-300
                        rounded-xl
                        text-gray-700
                        dark:bg-gray-800/90
                        dark:border-gray-700
                        dark:text-gray-300
                      "
                    />
                  </div>

                  <div
                    className="
                      grid
                      md:grid-cols-2
                      gap-4
                    "
                  >
                    <div>
                      <label
                        className="
                          block
                          text-sm
                          font-semibold
                          text-gray-700
                          dark:text-gray-300
                          mb-2
                        "
                      >
                        Téléphone
                        <span
                          className="
                            text-gray-400
                            font-normal
                          "
                        >
                          {" "}
                          (facultatif)
                        </span>
                      </label>

                      <input
                        type="tel"
                        value={
                          telephone
                        }
                        onChange={(e) =>
                          setTelephone(
                            e.target.value
                          )
                        }
                        placeholder="+229 ..."
                        autoComplete="tel"
                        className={
                          inputClass
                        }
                      />
                    </div>

                    <div>
                      <label
                        className="
                          block
                          text-sm
                          font-semibold
                          text-gray-700
                          dark:text-gray-300
                          mb-2
                        "
                      >
                        Pays de résidence *
                      </label>

                      <input
                        type="text"
                        value={
                          pays
                        }
                        onChange={(e) =>
                          setPays(
                            e.target.value
                          )
                        }
                        placeholder="Bénin"
                        autoComplete="country-name"
                        className={
                          inputClass
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="
                        block
                        text-sm
                        font-semibold
                        text-gray-700
                        dark:text-gray-300
                        mb-2
                      "
                    >
                      Mot de passe *
                    </label>

                    <input
                      type="password"
                      value={
                        password
                      }
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      placeholder="Au moins 6 caractères"
                      autoComplete="new-password"
                      className={
                        inputClass
                      }
                    />

                    <p
                      className="
                        text-xs
                        text-gray-600
                        dark:text-gray-500
                        mt-2
                      "
                    >
                      Ce mot de passe permettra au bénéficiaire
                      de se connecter à son compte.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ==================================================
                PERSONNALISATION
            ================================================== */}

            <div
              className={`
                ${cardClass}
                p-6
                sm:p-8
              `}
            >
              <div
                className="
                  flex
                  items-start
                  gap-4
                  mb-7
                "
              >
                <div
                  className="
                    w-12
                    h-12
                    shrink-0
                    rounded-2xl
                    bg-violet-100
                    text-violet-700
                    flex
                    items-center
                    justify-center
                    dark:bg-violet-950
                    dark:text-violet-300
                  "
                >
                  <Sparkles
                    className="
                      w-6
                      h-6
                    "
                  />
                </div>

                <div>
                  <h2
                    className="
                      text-xl
                      sm:text-2xl
                      font-extrabold
                      text-gray-900
                      dark:text-white
                    "
                  >
                    Personnalisation de {documentName}
                  </h2>

                  <p
                    className="
                      text-gray-700
                      dark:text-gray-400
                      mt-1
                    "
                  >
                    Ces informations sont facultatives. Elles
                    servent uniquement à personnaliser le PDF
                    qui sera généré pour vous.
                  </p>
                </div>
              </div>

              <div
                className="
                  space-y-5
                "
              >
                <div>
                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-gray-700
                      dark:text-gray-300
                      mb-2
                    "
                  >
                    Établissement
                    <span
                      className="
                        text-gray-400
                        font-normal
                      "
                    >
                      {" "}
                      (facultatif)
                    </span>
                  </label>

                  <input
                    type="text"
                    value={
                      etablissement
                    }
                    onChange={(e) =>
                      setEtablissement(
                        e.target.value
                      )
                    }
                    placeholder="Nom de l'établissement"
                    className={
                      inputClass
                    }
                  />
                </div>

                <div>
                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-gray-700
                      dark:text-gray-300
                      mb-2
                    "
                  >
                    Ville / Commune
                    <span
                      className="
                        text-gray-400
                        font-normal
                      "
                    >
                      {" "}
                      (facultatif)
                    </span>
                  </label>

                  <input
                    type="text"
                    value={
                      ville
                    }
                    onChange={(e) =>
                      setVille(
                        e.target.value
                      )
                    }
                    placeholder="Ville ou commune"
                    className={
                      inputClass
                    }
                  />
                </div>

                <div>
                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-gray-700
                      dark:text-gray-300
                      mb-2
                    "
                  >
                    Année scolaire
                    <span
                      className="
                        text-gray-400
                        font-normal
                      "
                    >
                      {" "}
                      (facultatif)
                    </span>
                  </label>

                  <input
                    type="text"
                    value={
                      anneeScolaire
                    }
                    onChange={(e) =>
                      setAnneeScolaire(
                        e.target.value
                      )
                    }
                    placeholder="Exemple : 2026-2027"
                    className={
                      inputClass
                    }
                  />
                </div>

                <div>
                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-gray-700
                      dark:text-gray-300
                      mb-2
                    "
                  >
                    Photo
                    <span
                      className="
                        text-gray-400
                        font-normal
                      "
                    >
                      {" "}
                      (facultatif)
                    </span>
                  </label>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={
                      handlePhotoChange
                    }
                    className="
                      w-full
                      px-4
                      py-3
                      border
                      border-gray-300
                      rounded-xl
                      bg-white/90
                      text-gray-900
                      dark:border-gray-700
                      dark:bg-gray-950/90
                      dark:text-gray-200
                    "
                  />

                  <p
                    className="
                      text-xs
                      text-gray-600
                      dark:text-gray-500
                      mt-2
                    "
                  >
                    Formats acceptés : .jpg, .jpeg et .png.
                    Taille maximale : 5 Mo.
                  </p>

                  {photo && (
                    <div
                      className="
                        mt-3
                        p-3
                        bg-blue-50/90
                        border
                        border-blue-200
                        rounded-xl
                        dark:bg-blue-950/40
                        dark:border-blue-900
                      "
                    >
                      <p
                        className="
                          text-sm
                          text-blue-800
                          dark:text-blue-300
                        "
                      >
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-2
                          "
                        >
                          <FileText
                            className="
                              w-4
                              h-4
                            "
                          />

                          Photo sélectionnée :
                        </span>
                        {" "}
                        <span
                          className="
                            font-bold
                          "
                        >
                          {photo.name}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ==================================================
                RÉCAPITULATIF
            ================================================== */}

            <div
              className="
                bg-gray-100/85
                backdrop-blur-xl
                rounded-3xl
                border
                border-white/60
                p-6
                sm:p-8
                shadow-xl
                dark:bg-gray-900/85
                dark:border-gray-700/70
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-3
                  mb-5
                "
              >
                <div
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-gray-200/90
                    flex
                    items-center
                    justify-center
                    dark:bg-gray-800
                  "
                >
                  <FileText
                    className="
                      w-5
                      h-5
                      text-gray-700
                      dark:text-gray-300
                    "
                  />
                </div>

                <h3
                  className="
                    font-extrabold
                    text-lg
                    text-gray-900
                    dark:text-white
                  "
                >
                  Récapitulatif
                </h3>
              </div>

              <div
                className="
                  grid
                  sm:grid-cols-2
                  gap-3
                  text-sm
                "
              >
                <p
                  className="
                    p-3
                    rounded-xl
                    bg-white/90
                    dark:bg-gray-950/90
                    text-gray-700
                    dark:text-gray-300
                  "
                >
                  <span
                    className="
                      font-bold
                    "
                  >
                    Document :
                  </span>
                  {" "}
                  {documentName}
                </p>

                <p
                  className="
                    p-3
                    rounded-xl
                    bg-white/90
                    dark:bg-gray-950/90
                    text-gray-700
                    dark:text-gray-300
                  "
                >
                  <span
                    className="
                      font-bold
                    "
                  >
                    Bénéficiaire :
                  </span>
                  {" "}
                  {prenom} {nom}
                </p>

                <p
                  className="
                    p-3
                    rounded-xl
                    bg-white/90
                    dark:bg-gray-950/90
                    text-gray-700
                    dark:text-gray-300
                  "
                >
                  <span
                    className="
                      font-bold
                    "
                  >
                    E-mail :
                  </span>
                  {" "}
                  {target ===
                  "self"
                    ? email
                    : beneficiaryEmail}
                </p>

                {etablissement && (
                  <p
                    className="
                      p-3
                      rounded-xl
                      bg-white/90
                      dark:bg-gray-950/90
                      text-gray-700
                      dark:text-gray-300
                    "
                  >
                    <span
                      className="
                        font-bold
                      "
                    >
                      Établissement :
                    </span>
                    {" "}
                    {etablissement}
                  </p>
                )}

                {ville && (
                  <p
                    className="
                      p-3
                      rounded-xl
                      bg-white/90
                      dark:bg-gray-950/90
                      text-gray-700
                      dark:text-gray-300
                    "
                  >
                    <span
                      className="
                        font-bold
                      "
                    >
                      Ville / Commune :
                    </span>
                    {" "}
                    {ville}
                  </p>
                )}

                {anneeScolaire && (
                  <p
                    className="
                      p-3
                      rounded-xl
                      bg-white/90
                      dark:bg-gray-950/90
                      text-gray-700
                      dark:text-gray-300
                    "
                  >
                    <span
                      className="
                        font-bold
                      "
                    >
                      Année scolaire :
                    </span>
                    {" "}
                    {anneeScolaire}
                  </p>
                )}

                <p
                  className="
                    p-3
                    rounded-xl
                    bg-white/90
                    dark:bg-gray-950/90
                    text-gray-700
                    dark:text-gray-300
                  "
                >
                  <span
                    className="
                      font-bold
                    "
                  >
                    Photo :
                  </span>
                  {" "}
                  {photo
                    ? "Oui"
                    : "Non"}
                </p>
              </div>
            </div>

            {/* ==================================================
                BOUTONS
            ================================================== */}

            {!downloaded && (
              <div
                className="
                  flex
                  flex-col-reverse
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  gap-4
                "
              >
                <button
                  type="button"
                  onClick={
                    goBack
                  }
                  disabled={loading}
                  className="
                    inline-flex
                    items-center
                    gap-2
                    text-gray-700
                    hover:text-gray-950
                    disabled:text-gray-400
                    dark:text-gray-400
                    dark:hover:text-white
                    font-semibold
                  "
                >
                  <ArrowLeft
                    className="
                      w-4
                      h-4
                    "
                  />

                  Retour
                </button>

                <button
                  type="button"
                  onClick={
                    handleActivation
                  }
                  disabled={loading}
                  className="
                    w-full
                    sm:w-auto
                    inline-flex
                    items-center
                    justify-center
                    gap-3
                    bg-gradient-to-r
                    from-blue-600
                    via-indigo-600
                    to-violet-600
                    hover:from-blue-700
                    hover:via-indigo-700
                    hover:to-violet-700
                    disabled:from-gray-400
                    disabled:via-gray-400
                    disabled:to-gray-500
                    text-white
                    font-extrabold
                    py-4
                    px-8
                    rounded-2xl
                    shadow-2xl
                    shadow-blue-600/25
                    transition-all
                    duration-200
                    active:scale-[0.99]
                  "
                >
                  {loading ? (
                    <>
                      <Loader2
                        className="
                          w-5
                          h-5
                          animate-spin
                        "
                      />

                      Génération du PDF...
                    </>
                  ) : (
                    <>
                      <Sparkles
                        className="
                          w-5
                          h-5
                        "
                      />

                      Activer et générer {documentName}
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ==================================================
                SUCCÈS
            ================================================== */}

            {downloaded && (
              <div
                className={`
                  ${cardClass}
                  p-6
                  sm:p-8
                  border-green-300
                  dark:border-green-900
                `}
              >
                <div
                  className="
                    text-center
                  "
                >
                  <div
                    className="
                      mx-auto
                      w-20
                      h-20
                      bg-green-100
                      text-green-600
                      rounded-full
                      flex
                      items-center
                      justify-center
                      mb-5
                      shadow-xl
                      dark:bg-green-950
                      dark:text-green-400
                    "
                  >
                    <CheckCircle2
                      className="
                        w-12
                        h-12
                      "
                    />
                  </div>

                  <h2
                    className="
                      text-2xl
                      sm:text-3xl
                      font-extrabold
                      text-gray-900
                      dark:text-white
                    "
                  >
                    {documentName} activé !
                  </h2>

                  <p
                    className="
                      text-gray-700
                      dark:text-gray-400
                      mt-2
                    "
                  >
                    Votre document personnalisé a été généré
                    avec succès.
                  </p>
                </div>

                {/* =================================================
                    TÉLÉCHARGEMENT
                ================================================= */}

                <div
                  className="
                    mt-7
                    p-5
                    bg-green-50/90
                    border
                    border-green-200
                    rounded-2xl
                    dark:bg-green-950/30
                    dark:border-green-900
                  "
                >
                  <p
                    className="
                      flex
                      items-center
                      gap-2
                      font-bold
                      text-green-800
                      dark:text-green-300
                    "
                  >
                    <Download
                      className="
                        w-5
                        h-5
                      "
                    />

                    PDF téléchargé
                  </p>

                  <p
                    className="
                      text-sm
                      text-green-700
                      dark:text-green-400
                      mt-1
                    "
                  >
                    Votre fichier{" "}
                    <span
                      className="font-bold"
                    >
                      {documentName}
                    </span>{" "}
                    personnalisé a été téléchargé sur votre appareil.
                  </p>
                </div>

                {/* =================================================
                    E-MAIL
                ================================================= */}

                {emailSent ===
                  true && (
                  <div
                    className="
                      mt-4
                      p-5
                      bg-blue-50/90
                      border
                      border-blue-200
                      rounded-2xl
                      dark:bg-blue-950/30
                      dark:border-blue-900
                    "
                  >
                    <p
                      className="
                        flex
                        items-center
                        gap-2
                        font-bold
                        text-blue-800
                        dark:text-blue-300
                      "
                    >
                      <Mail
                        className="
                          w-5
                          h-5
                        "
                      />

                      PDF envoyé par e-mail
                    </p>

                    <p
                      className="
                        text-sm
                        text-blue-700
                        dark:text-blue-400
                        mt-1
                      "
                    >
                      Le même document PDF a été envoyé à :
                      {" "}
                      <span
                        className="
                          font-bold
                        "
                      >
                        {target ===
                        "self"
                          ? email
                          : beneficiaryEmail}
                      </span>
                    </p>
                  </div>
                )}

                {emailSent ===
                  false && (
                  <div
                    className="
                      mt-4
                      p-5
                      bg-yellow-50/90
                      border
                      border-yellow-200
                      rounded-2xl
                      dark:bg-yellow-950/30
                      dark:border-yellow-900
                    "
                  >
                    <p
                      className="
                        flex
                        items-center
                        gap-2
                        font-bold
                        text-yellow-800
                        dark:text-yellow-300
                      "
                    >
                      <Info
                        className="
                          w-5
                          h-5
                        "
                      />

                      PDF téléchargé, mais e-mail non envoyé
                    </p>

                    <p
                      className="
                        text-sm
                        text-yellow-700
                        dark:text-yellow-400
                        mt-1
                      "
                    >
                      Le document a bien été généré et téléchargé.
                      Un problème est survenu lors de son envoi
                      par e-mail.
                    </p>
                  </div>
                )}

                {/* =================================================
                    COMPTE
                ================================================= */}

                <div
                  className="
                    mt-7
                    text-center
                  "
                >
                  <Link
                    to="/login"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      bg-gray-900
                      hover:bg-black
                      text-white
                      font-bold
                      py-3.5
                      px-7
                      rounded-xl
                      transition
                      shadow-xl
                      dark:bg-white
                      dark:text-gray-900
                      dark:hover:bg-gray-200
                    "
                  >
                    Se connecter à CODE

                    <ArrowRight
                      className="
                        w-4
                        h-4
                      "
                    />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====================================================
            PIED DE PAGE
        ==================================================== */}

        <div
          className="
            mt-8
            flex
            flex-col
            sm:flex-row
            items-center
            justify-between
            gap-3
            text-xs
            text-gray-500
            dark:text-gray-500
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <ShieldCheck
              className="
                w-4
                h-4
              "
            />

            <span>
              Activation sécurisée par CODE
            </span>
          </div>

          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <GraduationCap
              className="
                w-4
                h-4
              "
            />

            <span>
              L'écosystème éducatif mondial
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activation;

