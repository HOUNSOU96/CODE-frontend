import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";

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
  // VIDÉO
  // ==========================================================

  const [videoEnded, setVideoEnded] =
    useState(false);

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const [videoSoundEnabled, setVideoSoundEnabled] =
    useState(false);

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
  // VIDÉO — ACTIVATION DU SON
  // ==========================================================

  const enableVideoSound = async () => {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    try {
      video.muted = false;
      video.volume = 1;

      setVideoSoundEnabled(true);

      await video.play();
    } catch {
      setVideoSoundEnabled(
        !video.muted
      );
    }
  };

  // ==========================================================
  // VIDÉO — INITIALISATION
  // ==========================================================

  useEffect(() => {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    video.volume = 1;
    video.muted = false;
  }, []);

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
  // RENDU
  // ==========================================================

  return (
  <div className="relative z-20 min-h-screen w-full bg-transparent">

      {/* ======================================================
          CONTENU
      ====================================================== */}

      <div
        className="
          max-w-5xl
          mx-auto
          py-8
          sm:py-10
        "
      >

        {/* ====================================================
            EN-TÊTE DE PAGE
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
            ← Accueil
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
              (
                item
              ) => (
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
                      item.number
                        ? "✓"
                        : item.number}
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

              <span
                className="
                  w-8
                  h-8
                  shrink-0
                  rounded-full
                  bg-red-100
                  flex
                  items-center
                  justify-center
                  font-black
                  dark:bg-red-900/60
                "
              >
                !
              </span>

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
            ÉTAPE 1
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
                    text-2xl
                    shrink-0
                  "
                >
                  🔐
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
                  VIDÉO
              ================================================= */}

              {!videoEnded && (
                <div
                  className="
                    mb-8
                    rounded-2xl
                    overflow-hidden
                    border
                    border-gray-800/60
                    bg-gray-950
                    shadow-2xl
                  "
                >

                  <video
                    ref={videoRef}
                    className="
                      w-full
                      aspect-video
                      object-cover
                      bg-black
                    "
                    controls
                    playsInline
                    preload="metadata"
                    onVolumeChange={(event) =>
                      setVideoSoundEnabled(
                        !event.currentTarget
                          .muted
                      )
                    }
                    onLoadedMetadata={(
                      event
                    ) => {
                      event.currentTarget.volume =
                        1;

                      event.currentTarget.muted =
                        false;

                      setVideoSoundEnabled(
                        true
                      );
                    }}
                    onEnded={() =>
                      setVideoEnded(
                        true
                      )
                    }
                  >

                    <source
                      src="/videos/pre.mp4"
                      type="video/mp4"
                    />

                    Votre navigateur ne prend pas en charge
                    la lecture vidéo.

                  </video>

                  <div
                    className="
                      flex
                      flex-col
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                      gap-3
                      p-3
                      sm:p-4
                      bg-gray-900
                      text-white
                    "
                  >

                    <p
                      className="
                        text-xs
                        sm:text-sm
                        text-gray-300
                      "
                    >
                      {videoSoundEnabled
                        ? "🔊 Le son de la vidéo est activé."
                        : "🔇 Le son de la vidéo est désactivé."}
                    </p>

                    {!videoSoundEnabled && (
                      <button
                        type="button"
                        onClick={
                          enableVideoSound
                        }
                        className="
                          inline-flex
                          items-center
                          justify-center
                          gap-2
                          px-4
                          py-2
                          rounded-xl
                          bg-blue-600
                          hover:bg-blue-500
                          text-white
                          text-sm
                          font-bold
                          transition
                        "
                      >
                        🔊 Activer le son
                      </button>
                    )}

                  </div>

                </div>
              )}

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
                    className={inputClass}
                  />

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
                      uppercase
                      tracking-wide
                    `}
                  />

                </div>

                <button
                  type="button"
                  onClick={
                    verifyCode
                  }
                  disabled={loading}
                  className="
                    w-full
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
                  {loading
                    ? "Vérification..."
                    : "Vérifier le code →"}
                </button>

              </div>

            </div>

          </div>
        )}

        {/* ====================================================
            ÉTAPE 2
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
                  text-3xl
                  mb-4
                  dark:bg-blue-950
                  dark:text-blue-300
                "
              >
                👥
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
                    text-3xl
                    mb-5
                    dark:bg-blue-950
                  "
                >
                  👤
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
                    text-3xl
                    mb-5
                    dark:bg-indigo-950
                  "
                >
                  👥
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

              </button>

            </div>

            <button
              type="button"
              onClick={
                goBack
              }
              className="
                mt-8
                text-gray-700
                hover:text-gray-950
                dark:text-gray-400
                dark:hover:text-white
                font-semibold
                transition
              "
            >
              ← Retour
            </button>

          </div>
        )}

        {/* ====================================================
            ÉTAPE 3
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
                  text-3xl
                  mb-4
                  dark:bg-indigo-950
                  dark:text-indigo-300
                "
              >
                ✉️
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
                className={inputClass}
              />

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
                  text-gray-700
                  hover:text-gray-950
                  dark:text-gray-400
                  dark:hover:text-white
                  font-semibold
                "
              >
                ← Retour
              </button>

              <button
                type="button"
                onClick={
                  continueWithBeneficiary
                }
                disabled={loading}
                className="
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
                {loading
                  ? "Vérification..."
                  : "Continuer →"}
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
                    text-2xl
                    dark:bg-green-950
                    dark:text-green-300
                  "
                >
                  👤
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
                        ✓
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
                        className={inputClass}
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
                        className={inputClass}
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
                        className={inputClass}
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
                        className={inputClass}
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
                      className={inputClass}
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
                    text-2xl
                    dark:bg-violet-950
                    dark:text-violet-300
                  "
                >
                  ✨
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

                {/* =================================================
                    ÉTABLISSEMENT
                ================================================= */}

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
                    className={inputClass}
                  />

                </div>

                {/* =================================================
                    VILLE
                ================================================= */}

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
                    className={inputClass}
                  />

                </div>

                {/* =================================================
                    ANNÉE SCOLAIRE
                ================================================= */}

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
                    className={inputClass}
                  />

                </div>

                {/* =================================================
                    PHOTO
                ================================================= */}

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
                        📷 Photo sélectionnée :
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
                  📋
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
                  "
                >
                  <span
                    className="
                      font-bold
                      text-gray-700
                      dark:text-gray-300
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
                  "
                >
                  <span
                    className="
                      font-bold
                      text-gray-700
                      dark:text-gray-300
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
                  "
                >
                  <span
                    className="
                      font-bold
                      text-gray-700
                      dark:text-gray-300
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
                    "
                  >
                    <span
                      className="
                        font-bold
                        text-gray-700
                        dark:text-gray-300
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
                    "
                  >
                    <span
                      className="
                        font-bold
                        text-gray-700
                        dark:text-gray-300
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
                    "
                  >
                    <span
                      className="
                        font-bold
                        text-gray-700
                        dark:text-gray-300
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
                  "
                >
                  <span
                    className="
                      font-bold
                      text-gray-700
                      dark:text-gray-300
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
                    text-gray-700
                    hover:text-gray-950
                    disabled:text-gray-400
                    dark:text-gray-400
                    dark:hover:text-white
                    font-semibold
                  "
                >
                  ← Retour
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
                  {loading
                    ? "Génération du PDF..."
                    : `Activer et générer ${documentName}`}
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
                      text-4xl
                      mb-5
                      shadow-xl
                      dark:bg-green-950
                      dark:text-green-400
                    "
                  >
                    ✓
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
                      font-bold
                      text-green-800
                      dark:text-green-300
                    "
                  >
                    ✓ PDF téléchargé
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
                        font-bold
                        text-blue-800
                        dark:text-blue-300
                      "
                    >
                      ✓ PDF envoyé par e-mail
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
                        font-bold
                        text-yellow-800
                        dark:text-yellow-300
                      "
                    >
                      ⚠ PDF téléchargé, mais e-mail non envoyé
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
                  </Link>

                </div>

              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};

export default Activation;