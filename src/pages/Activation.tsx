import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

type Step = 1 | 2 | 3 | 4;

type ActivationTarget = "self" | "other" | null;

interface UserInfo {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  pays?: string;
}

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

// ==========================================================
// PLAYLIST VIDÉO
// ==========================================================
// Tu peux ajouter d'autres vidéos plus tard.
//
// Exemple :
//
// const videoPlaylist = [
//   "/videos/pre.mp4",
//   "/videos/video3.mp4",
//   "/videos/intro3.mp4",
// ];
//
// ==========================================================

const videoPlaylist = [
  "/videos/pre.mp4",

  // "/videos/video3.mp4",
  // "/videos/intro3.mp4",
];

// ==========================================================
// COMPOSANT
// ==========================================================

const Activation: React.FC = () => {

  // ========================================================
  // VIDÉOS
  // ========================================================

  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const [fadeVideo1, setFadeVideo1] = useState(true);

  const [videoFinished, setVideoFinished] = useState(false);

  const [skipTimer, setSkipTimer] = useState(5);

  const [soundUnlocked, setSoundUnlocked] = useState(true);

  // ========================================================
  // ACTIVATION
  // ========================================================

  const [step, setStep] = useState<Step>(1);

  const [email, setEmail] = useState("");

  const [code, setCode] = useState("");

  const [target, setTarget] =
    useState<ActivationTarget>(null);

  const [beneficiaryEmail, setBeneficiaryEmail] =
    useState("");

  const [userExists, setUserExists] =
    useState<boolean | null>(null);

  const [userInfo, setUserInfo] =
    useState<UserInfo | null>(null);

  // ========================================================
  // INFORMATIONS UTILISATEUR
  // ========================================================

  const [nom, setNom] = useState("");

  const [prenom, setPrenom] = useState("");

  const [telephone, setTelephone] = useState("");

  const [pays, setPays] = useState("");

  const [ville, setVille] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [documentInfo, setDocumentInfo] =
    useState<any>(null);

  // ========================================================
  // ÉTATS
  // ========================================================

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ==========================================================
  // LECTURE INITIALE DE LA VIDÉO
  // ==========================================================

  useEffect(() => {

    if (videoFinished) return;

    if (videoPlaylist.length === 0) {
      setVideoFinished(true);
      return;
    }

    const currentRef = fadeVideo1
      ? videoRef1.current
      : videoRef2.current;

    if (currentRef) {

      currentRef.src =
        videoPlaylist[currentVideoIndex];

      currentRef.currentTime = 0;

      currentRef.muted = !soundUnlocked;

      currentRef.volume = 1;

      currentRef
        .play()
        .catch(() => {});

    }

  }, [
    currentVideoIndex,
    fadeVideo1,
    soundUnlocked,
    videoFinished,
  ]);

  // ==========================================================
  // COMPTEUR POUR PASSER LA VIDÉO
  // ==========================================================

  useEffect(() => {

    if (videoFinished) return;

    const interval = setInterval(() => {

      setSkipTimer((prev) =>
        prev > 0 ? prev - 1 : 0
      );

    }, 1000);

    return () =>
      clearInterval(interval);

  }, [videoFinished]);

  // ==========================================================
  // VIDÉO TERMINÉE
  // ==========================================================

  const handleVideoEnd = () => {
    goNextVideo();
  };

  // ==========================================================
  // PASSER LA VIDÉO
  // ==========================================================

  const handleSkip = () => {

    if (skipTimer === 0) {
      goNextVideo();
    }

  };

  // ==========================================================
  // PASSER À LA VIDÉO SUIVANTE
  // ==========================================================

  const goNextVideo = () => {

    // --------------------------------------------------------
    // Dernière vidéo
    // --------------------------------------------------------

    if (
      currentVideoIndex >=
      videoPlaylist.length - 1
    ) {

      setVideoFinished(true);

      return;
    }

    // --------------------------------------------------------
    // Vidéo suivante
    // --------------------------------------------------------

    const nextIndex =
      currentVideoIndex + 1;

    const fadeOut =
      fadeVideo1
        ? videoRef1.current
        : videoRef2.current;

    const fadeIn =
      fadeVideo1
        ? videoRef2.current
        : videoRef1.current;

    if (fadeOut && fadeIn) {

      fadeIn.src =
        videoPlaylist[nextIndex];

      fadeIn.currentTime = 0;

      fadeIn.volume = 0;

      fadeIn.muted =
        !soundUnlocked;

      fadeIn
        .play()
        .catch(() => {});

      let progress = 0;

      const steps = 20;

      const interval = setInterval(() => {

        progress++;

        const ratio =
          progress / steps;

        fadeOut.volume =
          1 - ratio;

        fadeIn.volume =
          ratio;

        fadeOut.style.opacity =
          `${1 - ratio}`;

        fadeIn.style.opacity =
          `${ratio}`;

        if (progress >= steps) {

          clearInterval(interval);

          fadeOut.pause();

          fadeOut.volume = 1;

          fadeIn.volume = 1;

          setCurrentVideoIndex(
            nextIndex
          );

          setFadeVideo1(
            !fadeVideo1
          );

          setSkipTimer(5);
        }

      }, 35);

    }

  };

  // ==========================================================
  // ACTIVER LE SON
  // ==========================================================

  const enableSound = async () => {

    const currentRef =
      fadeVideo1
        ? videoRef1.current
        : videoRef2.current;

    if (currentRef) {

      currentRef.muted = false;

      currentRef.volume = 1;

      try {

        await currentRef.play();

        setSoundUnlocked(true);

      } catch {}

    }

  };

  // ==========================================================
  // ÉTAPE 1 : VÉRIFICATION EMAIL + CODE
  // ==========================================================

  const handleVerifyCode = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    setError("");

    setLoading(true);

    try {

      const response = await fetch(
        `${API_URL}/api/activation/verify`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email,
            activation_code: code,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.detail ||
            "Impossible de vérifier le code."
        );

      }

      setDocumentInfo(
        data.document
      );

      setStep(2);

    } catch (err: any) {

      setError(
        err.message ||
          "Une erreur est survenue."
      );

    } finally {

      setLoading(false);

    }

  };

  // ==========================================================
  // ÉTAPE 2 : CHOIX DU BÉNÉFICIAIRE
  // ==========================================================

  const handleTargetChoice = async (
    selectedTarget:
      | "self"
      | "other"
  ) => {

    setError("");

    setTarget(
      selectedTarget
    );

    if (
      selectedTarget === "self"
    ) {

      await verifyBeneficiary(
        email
      );

    } else {

      setBeneficiaryEmail("");

      setUserExists(null);

      setUserInfo(null);

      setStep(3);

    }

  };

  // ==========================================================
  // VÉRIFIER LE COMPTE DU BÉNÉFICIAIRE
  // ==========================================================

  const verifyBeneficiary = async (
    beneficiary: string
  ) => {

    setError("");

    setLoading(true);

    try {

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
              email: beneficiary,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.detail ||
            "Impossible de vérifier le compte."
        );

      }

      setUserExists(
        data.exists
      );

      if (data.exists) {

        setUserInfo(
          data.user
        );

        setNom(
          data.user.nom || ""
        );

        setPrenom(
          data.user.prenom || ""
        );

        setTelephone(
          data.user.telephone || ""
        );

        setPays(
          data.user.pays || ""
        );

        setStep(4);

      } else {

        setStep(4);

      }

    } catch (err: any) {

      setError(
        err.message ||
          "Erreur lors de la vérification du compte."
      );

    } finally {

      setLoading(false);

    }

  };

  // ==========================================================
  // POUR AUTRUI : VÉRIFIER L'EMAIL
  // ==========================================================

  const handleVerifyOther = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (
      !beneficiaryEmail.trim()
    ) {

      setError(
        "Veuillez renseigner l'adresse e-mail du bénéficiaire."
      );

      return;
    }

    await verifyBeneficiary(
      beneficiaryEmail.trim()
    );

  };

  // ==========================================================
  // ACTIVATION FINALE
  // ==========================================================

  const handleActivation = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    setError("");

    setSuccess("");

    // --------------------------------------------------------
    // Si le compte n'existe pas
    // --------------------------------------------------------

    if (!userExists) {

      if (
        !nom ||
        !prenom ||
        !telephone ||
        !pays
      ) {

        setError(
          "Veuillez renseigner toutes les informations demandées."
        );

        return;
      }

      if (!password) {

        setError(
          "Veuillez créer un mot de passe."
        );

        return;
      }

      if (
        password !==
        confirmPassword
      ) {

        setError(
          "Les mots de passe ne correspondent pas."
        );

        return;
      }

    }

    setLoading(true);

    try {

      const response =
        await fetch(
          `${API_URL}/api/activation/activate`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              activation_code:
                code,

              buyer_email:
                email,

              activation_type:
                target,

              beneficiary_email:
                target === "self"
                  ? email
                  : beneficiaryEmail,

              nom:
                userExists
                  ? undefined
                  : nom,

              prenom:
                userExists
                  ? undefined
                  : prenom,

              telephone:
                userExists
                  ? undefined
                  : telephone,

              pays_residence:
                userExists
                  ? undefined
                  : pays,

              password:
                userExists
                  ? undefined
                  : password,

            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.detail ||
            "L'activation du document a échoué."
        );

      }

      setSuccess(
        "Votre document a été activé avec succès."
      );

      setStep(4);

    } catch (err: any) {

      setError(
        err.message ||
          "Une erreur est survenue pendant l'activation."
      );

    } finally {

      setLoading(false);

    }

  };

  // ==========================================================
  // AFFICHAGE
  // ==========================================================

  return (

    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative bg-black">

      {/* ==================================================== */}
      {/* VIDÉOS D'INTRODUCTION */}
      {/* ==================================================== */}

      {!videoFinished && (
        <>

          {/* Vidéo 1 */}

          <video
            ref={videoRef1}
            className="
              absolute inset-0
              w-full h-full
              object-cover
              opacity-100
              transition-opacity
              duration-300
            "
            playsInline
            onEnded={handleVideoEnd}
          />

          {/* Vidéo 2 */}

          <video
            ref={videoRef2}
            className="
              absolute inset-0
              w-full h-full
              object-cover
              opacity-0
              transition-opacity
              duration-300
            "
            playsInline
            onEnded={handleVideoEnd}
          />

          {/* ------------------------------------------------ */}
          {/* BOUTON SON */}
          {/* ------------------------------------------------ */}

          {!soundUnlocked && (

            <button
              onClick={enableSound}
              className="
                absolute
                top-4
                left-4
                z-10
                bg-yellow-500
                text-black
                px-3
                py-2
                rounded-lg
                shadow-lg
                hover:bg-yellow-400
                transition
              "
            >
              🔊 Activer le son
            </button>

          )}

          {/* ------------------------------------------------ */}
          {/* BOUTON PASSER */}
          {/* ------------------------------------------------ */}

          <div
            className="
              absolute
              bottom-4
              left-4
              z-10
            "
          >

            {skipTimer > 0 ? (

              <div
                className="
                  bg-gray-700/60
                  text-white
                  px-3
                  py-2
                  rounded-lg
                  backdrop-blur-sm
                "
              >
                Passer dans {skipTimer}s
              </div>

            ) : (

              <button
                onClick={handleSkip}
                className="
                  bg-yellow-500
                  text-black
                  px-4
                  py-2
                  rounded-lg
                  font-semibold
                  shadow-lg
                  hover:bg-yellow-400
                  transition
                "
              >
                Passer la vidéo
              </button>

            )}

          </div>

        </>
      )}

      {/* ==================================================== */}
      {/* CONTENU APRÈS LA VIDÉO */}
      {/* ==================================================== */}

      {videoFinished && (

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="
            bg-white
            dark:bg-gray-900
            w-full
            max-w-3xl
            p-6
            sm:p-8
            rounded-2xl
            shadow-xl
            z-20
            text-gray-900
            dark:text-white
          "
        >

          {/* ================================================= */}
          {/* TOUT LE CONTENU DE LA PAGE EST DANS CE DIV */}
          {/* ================================================= */}

          {/* ------------------------------------------------- */}
          {/* EN-TÊTE */}
          {/* ------------------------------------------------- */}

          <div className="text-center mb-8">

            <Link
              to="/login"
              className="
                inline-flex
                items-center
                text-sm
                text-blue-600
                dark:text-blue-400
                hover:text-blue-800
                dark:hover:text-blue-300
                mb-5
              "
            >
              ← Retour à la connexion
            </Link>

            <h1
              className="
                text-3xl
                font-bold
                text-blue-700
                dark:text-white
              "
            >
              ACTIVER MON DOCUMENT
            </h1>

            <p
              className="
                mt-2
                text-gray-600
                dark:text-gray-300
              "
            >
              Activez votre document CODE
              en quelques étapes.
            </p>

          </div>

          {/* ------------------------------------------------- */}
          {/* INDICATEUR D'ÉTAPES */}
          {/* ------------------------------------------------- */}

          <div
            className="
              flex
              items-center
              justify-center
              mb-8
            "
          >

            {[1, 2, 3, 4].map(
              (item, index) => (

                <React.Fragment
                  key={item}
                >

                  <div
                    className={`
                      w-9
                      h-9
                      rounded-full
                      flex
                      items-center
                      justify-center
                      text-sm
                      font-semibold
                      ${
                        step >= item
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300"
                      }
                    `}
                  >
                    {item}
                  </div>

                  {index < 3 && (

                    <div
                      className={`
                        w-12
                        h-1
                        ${
                          step > item
                            ? "bg-blue-600"
                            : "bg-gray-200 dark:bg-gray-700"
                        }
                      `}
                    />

                  )}

                </React.Fragment>

              )
            )}

          </div>

          {/* ------------------------------------------------- */}
          {/* ERREUR */}
          {/* ------------------------------------------------- */}

          {error && (

            <div
              className="
                mb-6
                rounded-lg
                bg-red-50
                dark:bg-red-900/30
                border
                border-red-200
                dark:border-red-800
                px-4
                py-3
                text-sm
                text-red-700
                dark:text-red-300
              "
            >
              {error}
            </div>

          )}

          {/* ------------------------------------------------- */}
          {/* SUCCÈS */}
          {/* ------------------------------------------------- */}

          {success && (

            <div
              className="
                mb-6
                rounded-lg
                bg-green-50
                dark:bg-green-900/30
                border
                border-green-200
                dark:border-green-800
                px-4
                py-3
                text-sm
                text-green-700
                dark:text-green-300
              "
            >
              {success}
            </div>

          )}

          {/* ================================================= */}
          {/* ÉTAPE 1 */}
          {/* ================================================= */}

          {step === 1 && (

            <form
              onSubmit={
                handleVerifyCode
              }
            >

              <div className="mb-6">

                <h2
                  className="
                    text-xl
                    font-bold
                    text-gray-900
                    dark:text-white
                  "
                >
                  Vérification du document
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-gray-500
                    dark:text-gray-300
                  "
                >
                  Entrez l'adresse e-mail
                  utilisée lors de l'achat
                  ainsi que le code figurant
                  sur votre document.
                </p>

              </div>

              <div className="space-y-5">

                {/* Email */}

                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-medium
                      text-gray-700
                      dark:text-white
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
                    required
                    className="
                      w-full
                      rounded-xl
                      border
                      border-gray-300
                      dark:border-gray-600
                      bg-white
                      dark:bg-gray-800
                      text-gray-900
                      dark:text-white
                      px-4
                      py-3
                      outline-none
                      focus:border-blue-600
                      focus:ring-2
                      focus:ring-blue-100
                      dark:focus:ring-blue-900
                    "
                  />

                </div>

                {/* Code */}

                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-medium
                      text-gray-700
                      dark:text-white
                      mb-2
                    "
                  >
                    Code du document
                  </label>

                  <input
                    type="text"
                    value={code}
                    onChange={(e) =>
                      setCode(
                        e.target.value.toUpperCase()
                      )
                    }
                    placeholder="CODE-XXXX-XXXX-XXXX-XXXX"
                    required
                    className="
                      w-full
                      rounded-xl
                      border
                      border-gray-300
                      dark:border-gray-600
                      bg-white
                      dark:bg-gray-800
                      text-gray-900
                      dark:text-white
                      px-4
                      py-3
                      uppercase
                      tracking-wider
                      outline-none
                      focus:border-blue-600
                      focus:ring-2
                      focus:ring-blue-100
                      dark:focus:ring-blue-900
                    "
                  />

                </div>

              </div>

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  mt-7
                  rounded-xl
                  bg-blue-600
                  hover:bg-blue-700
                  disabled:bg-blue-300
                  text-white
                  font-semibold
                  py-3
                  transition
                "
              >
                {loading
                  ? "Vérification..."
                  : "Vérifier mon document"}
              </button>

            </form>

          )}

          {/* ================================================= */}
          {/* ÉTAPE 2 */}
          {/* ================================================= */}

          {step === 2 && (

            <div>

              <div
                className="
                  text-center
                  mb-7
                "
              >

                <div
                  className="
                    mx-auto
                    mb-4
                    w-14
                    h-14
                    rounded-full
                    bg-green-100
                    dark:bg-green-900/40
                    flex
                    items-center
                    justify-center
                    text-2xl
                  "
                >
                  ✓
                </div>

                <h2
                  className="
                    text-xl
                    font-bold
                    text-gray-900
                    dark:text-white
                  "
                >
                  Document reconnu
                </h2>

                {documentInfo && (

                  <p
                    className="
                      mt-2
                      text-sm
                      text-gray-600
                      dark:text-gray-300
                    "
                  >
                    {documentInfo.nom ||
                      "Document CODE"}
                  </p>

                )}

              </div>

              <p
                className="
                  text-center
                  text-gray-600
                  dark:text-gray-300
                  mb-6
                "
              >
                Pour qui souhaitez-vous
                activer ce document ?
              </p>

              <div
                className="
                  grid
                  md:grid-cols-2
                  gap-4
                "
              >

                {/* POUR MOI */}

                <button
                  type="button"
                  onClick={() =>
                    handleTargetChoice(
                      "self"
                    )
                  }
                  disabled={loading}
                  className="
                    rounded-2xl
                    border-2
                    border-gray-200
                    dark:border-gray-700
                    hover:border-blue-600
                    hover:bg-blue-50
                    dark:hover:bg-blue-900/20
                    p-6
                    text-left
                    transition
                  "
                >

                  <div className="text-3xl mb-3">
                    👤
                  </div>

                  <h3
                    className="
                      font-bold
                      text-gray-900
                      dark:text-white
                    "
                  >
                    Pour moi
                  </h3>

                  <p
                    className="
                      text-sm
                      text-gray-500
                      dark:text-gray-300
                      mt-1
                    "
                  >
                    Je vais utiliser ce
                    document personnellement.
                  </p>

                </button>

                {/* POUR AUTRUI */}

                <button
                  type="button"
                  onClick={() =>
                    handleTargetChoice(
                      "other"
                    )
                  }
                  disabled={loading}
                  className="
                    rounded-2xl
                    border-2
                    border-gray-200
                    dark:border-gray-700
                    hover:border-blue-600
                    hover:bg-blue-50
                    dark:hover:bg-blue-900/20
                    p-6
                    text-left
                    transition
                  "
                >

                  <div className="text-3xl mb-3">
                    👥
                  </div>

                  <h3
                    className="
                      font-bold
                      text-gray-900
                      dark:text-white
                    "
                  >
                    Pour autrui
                  </h3>

                  <p
                    className="
                      text-sm
                      text-gray-500
                      dark:text-gray-300
                      mt-1
                    "
                  >
                    Ce document est destiné
                    à une autre personne.
                  </p>

                </button>

              </div>

            </div>

          )}

          {/* ================================================= */}
          {/* ÉTAPE 3 */}
          {/* ================================================= */}

          {step === 3 && (

            <form
              onSubmit={
                handleVerifyOther
              }
            >

              <div className="mb-6">

                <h2
                  className="
                    text-xl
                    font-bold
                    text-gray-900
                    dark:text-white
                  "
                >
                  Bénéficiaire du document
                </h2>

                <p
                  className="
                    mt-2
                    text-sm
                    text-gray-600
                    dark:text-gray-300
                  "
                >
                  Renseignez l'adresse
                  e-mail de la personne
                  qui utilisera ce document.
                </p>

              </div>

              <label
                className="
                  block
                  text-sm
                  font-medium
                  text-gray-700
                  dark:text-white
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
                required
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  dark:border-gray-600
                  bg-white
                  dark:bg-gray-800
                  text-gray-900
                  dark:text-white
                  px-4
                  py-3
                  outline-none
                  focus:border-blue-600
                  focus:ring-2
                  focus:ring-blue-100
                  dark:focus:ring-blue-900
                "
              />

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  mt-6
                  rounded-xl
                  bg-blue-600
                  hover:bg-blue-700
                  disabled:bg-blue-300
                  text-white
                  font-semibold
                  py-3
                "
              >
                {loading
                  ? "Vérification..."
                  : "Continuer"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setStep(2)
                }
                className="
                  w-full
                  mt-3
                  text-sm
                  text-gray-500
                  dark:text-gray-300
                  hover:text-gray-700
                  dark:hover:text-white
                "
              >
                ← Retour
              </button>

            </form>

          )}

          {/* ================================================= */}
          {/* ÉTAPE 4 */}
          {/* ================================================= */}

          {step === 4 && !success && (

            <form
              onSubmit={
                handleActivation
              }
            >

              <div className="mb-6">

                <h2
                  className="
                    text-xl
                    font-bold
                    text-gray-900
                    dark:text-white
                  "
                >
                  {userExists
                    ? "Compte trouvé"
                    : "Créer votre compte"}
                </h2>

                {userExists ? (

                  <div
                    className="
                      mt-3
                      rounded-xl
                      bg-blue-50
                      dark:bg-blue-900/30
                      border
                      border-blue-100
                      dark:border-blue-800
                      p-4
                      text-sm
                      text-blue-800
                      dark:text-blue-200
                    "
                  >

                    <p className="font-semibold">
                      Ce bénéficiaire possède
                      déjà un compte CODE.
                    </p>

                    <p className="mt-1">
                      Ses informations seront
                      automatiquement associées
                      au document.
                    </p>

                  </div>

                ) : (

                  <p
                    className="
                      mt-2
                      text-sm
                      text-gray-600
                      dark:text-gray-300
                    "
                  >
                    Aucun compte n'a été trouvé
                    avec cette adresse e-mail.
                    Renseignez les informations
                    nécessaires pour créer le compte.
                  </p>

                )}

              </div>

              {/* ------------------------------------------------ */}
              {/* COMPTE EXISTANT */}
              {/* ------------------------------------------------ */}

              {userExists ? (

                <div className="space-y-3">

                  <div
                    className="
                      flex
                      justify-between
                      border-b
                      border-gray-200
                      dark:border-gray-700
                      pb-3
                    "
                  >

                    <span
                      className="
                        text-gray-500
                        dark:text-gray-400
                      "
                    >
                      Nom
                    </span>

                    <span
                      className="
                        font-semibold
                        text-gray-900
                        dark:text-white
                      "
                    >
                      {userInfo?.nom}
                    </span>

                  </div>

                  <div
                    className="
                      flex
                      justify-between
                      border-b
                      border-gray-200
                      dark:border-gray-700
                      pb-3
                    "
                  >

                    <span
                      className="
                        text-gray-500
                        dark:text-gray-400
                      "
                    >
                      Prénom
                    </span>

                    <span
                      className="
                        font-semibold
                        text-gray-900
                        dark:text-white
                      "
                    >
                      {userInfo?.prenom}
                    </span>

                  </div>

                  <div
                    className="
                      flex
                      justify-between
                      border-b
                      border-gray-200
                      dark:border-gray-700
                      pb-3
                    "
                  >

                    <span
                      className="
                        text-gray-500
                        dark:text-gray-400
                      "
                    >
                      E-mail
                    </span>

                    <span
                      className="
                        font-semibold
                        text-gray-900
                        dark:text-white
                      "
                    >
                      {userInfo?.email}
                    </span>

                  </div>

                  <div
                    className="
                      flex
                      justify-between
                    "
                  >

                    <span
                      className="
                        text-gray-500
                        dark:text-gray-400
                      "
                    >
                      Téléphone
                    </span>

                    <span
                      className="
                        font-semibold
                        text-gray-900
                        dark:text-white
                      "
                    >
                      {userInfo?.telephone ||
                        "-"}
                    </span>

                  </div>

                </div>

              ) : (

                /* ------------------------------------------------ */
                /* CRÉATION DE COMPTE */
                /* ------------------------------------------------ */

                <div className="space-y-4">

                  {/* Nom + prénom */}

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
                          font-medium
                          text-gray-700
                          dark:text-white
                          mb-2
                        "
                      >
                        Nom
                      </label>

                      <input
                        type="text"
                        value={nom}
                        onChange={(e) =>
                          setNom(
                            e.target.value
                          )
                        }
                        required
                        className="
                          w-full
                          rounded-xl
                          border
                          border-gray-300
                          dark:border-gray-600
                          bg-white
                          dark:bg-gray-800
                          text-gray-900
                          dark:text-white
                          px-4
                          py-3
                        "
                      />

                    </div>

                    <div>

                      <label
                        className="
                          block
                          text-sm
                          font-medium
                          text-gray-700
                          dark:text-white
                          mb-2
                        "
                      >
                        Prénom
                      </label>

                      <input
                        type="text"
                        value={prenom}
                        onChange={(e) =>
                          setPrenom(
                            e.target.value
                          )
                        }
                        required
                        className="
                          w-full
                          rounded-xl
                          border
                          border-gray-300
                          dark:border-gray-600
                          bg-white
                          dark:bg-gray-800
                          text-gray-900
                          dark:text-white
                          px-4
                          py-3
                        "
                      />

                    </div>

                  </div>

                  {/* Téléphone */}

                  <div>

                    <label
                      className="
                        block
                        text-sm
                        font-medium
                        text-gray-700
                        dark:text-white
                        mb-2
                      "
                    >
                      Téléphone
                    </label>

                    <input
                      type="tel"
                      value={telephone}
                      onChange={(e) =>
                        setTelephone(
                          e.target.value
                        )
                      }
                      required
                      className="
                        w-full
                        rounded-xl
                        border
                        border-gray-300
                        dark:border-gray-600
                        bg-white
                        dark:bg-gray-800
                        text-gray-900
                        dark:text-white
                        px-4
                        py-3
                      "
                    />

                  </div>

                  {/* Pays */}

                  <div>

                    <label
                      className="
                        block
                        text-sm
                        font-medium
                        text-gray-700
                        dark:text-white
                        mb-2
                      "
                    >
                      Pays
                    </label>

                    <input
                      type="text"
                      value={pays}
                      onChange={(e) =>
                        setPays(
                          e.target.value
                        )
                      }
                      required
                      className="
                        w-full
                        rounded-xl
                        border
                        border-gray-300
                        dark:border-gray-600
                        bg-white
                        dark:bg-gray-800
                        text-gray-900
                        dark:text-white
                        px-4
                        py-3
                      "
                    />

                  </div>

                  {/* Mot de passe */}

                  <div>

                    <label
                      className="
                        block
                        text-sm
                        font-medium
                        text-gray-700
                        dark:text-white
                        mb-2
                      "
                    >
                      Créer un mot de passe
                    </label>

                    <input
                      type="password"
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      required
                      className="
                        w-full
                        rounded-xl
                        border
                        border-gray-300
                        dark:border-gray-600
                        bg-white
                        dark:bg-gray-800
                        text-gray-900
                        dark:text-white
                        px-4
                        py-3
                      "
                    />

                  </div>

                  {/* Confirmation */}

                  <div>

                    <label
                      className="
                        block
                        text-sm
                        font-medium
                        text-gray-700
                        dark:text-white
                        mb-2
                      "
                    >
                      Confirmer le mot de passe
                    </label>

                    <input
                      type="password"
                      value={
                        confirmPassword
                      }
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      required
                      className="
                        w-full
                        rounded-xl
                        border
                        border-gray-300
                        dark:border-gray-600
                        bg-white
                        dark:bg-gray-800
                        text-gray-900
                        dark:text-white
                        px-4
                        py-3
                      "
                    />

                  </div>

                </div>

              )}

              {/* ------------------------------------------------ */}
              {/* BOUTON ACTIVATION */}
              {/* ------------------------------------------------ */}

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  mt-7
                  rounded-xl
                  bg-blue-600
                  hover:bg-blue-700
                  disabled:bg-blue-300
                  text-white
                  font-semibold
                  py-3
                  transition
                "
              >
                {loading
                  ? "Activation..."
                  : "Activer le document"}
              </button>

            </form>

          )}

          {/* ================================================= */}
          {/* SUCCÈS */}
          {/* ================================================= */}

          {success && (

            <div
              className="
                text-center
                py-6
              "
            >

              <div
                className="
                  mx-auto
                  w-20
                  h-20
                  rounded-full
                  bg-green-100
                  dark:bg-green-900/40
                  flex
                  items-center
                  justify-center
                  text-4xl
                  text-green-600
                  dark:text-green-400
                  mb-5
                "
              >
                ✓
              </div>

              <h2
                className="
                  text-2xl
                  font-bold
                  text-gray-900
                  dark:text-white
                "
              >
                Document activé !
              </h2>

              <p
                className="
                  mt-3
                  text-gray-600
                  dark:text-gray-300
                "
              >
                Votre document est maintenant
                associé au compte bénéficiaire.
              </p>

              <Link
                to="/login"
                className="
                  inline-block
                  mt-7
                  rounded-xl
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  font-semibold
                  px-6
                  py-3
                "
              >
                Aller à la connexion
              </Link>

            </div>

          )}

          {/* ------------------------------------------------- */}
          {/* PIED DE PAGE */}
          {/* ------------------------------------------------- */}

          <p
            className="
              text-center
              text-sm
              text-gray-500
              dark:text-gray-400
              mt-6
            "
          >
            Vous avez déjà un compte ?{" "}

            <Link
              to="/login"
              className="
                text-blue-600
                dark:text-blue-400
                font-medium
                hover:underline
              "
            >
              Se connecter
            </Link>

          </p>

        </motion.div>

      )}

    </div>

  );
};

export default Activation;