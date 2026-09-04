// 📁 ListeInscrits.tsx

import React, {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import api from "@/utils/axios";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";


// ==========================================================
// DOCUMENT ATTRIBUÉ
// ==========================================================

interface DocumentAttribue {
  id: number;
  document_name: string;
  activation_code: string;
  is_activated: boolean;
  activated_at?: string | null;
  activation_type?: string | null;
}


// ==========================================================
// UTILISATEUR INSCRIT
// ==========================================================

interface UserInscrit {
  id: number;

  nom: string;
  prenom: string;

  email: string;
  telephone: string;

  date_inscription: string;

  is_validated: boolean;

  is_blocked?: boolean;

  status?: "pending" | "validated" | "refused";

  last_warning?: string;

  is_online?: boolean;

  is_admin?: boolean;

  // ========================================================
  // 👨‍🏫 STATUT ENSEIGNANT
  // ========================================================

  enseignant?: boolean;

  enseignant_actif?: boolean;

  subjects?: string[];

  // ========================================================
  // PARRAINAGE
  // ========================================================

  parrain_email: string;

  lieu_naissance?: string;

  filleuls_emails?: string[];

  // ========================================================
  // DOCUMENTS OBTENUS
  // ========================================================

  documents?: DocumentAttribue[];
}


// ==========================================================
// CONFIGURATION
// ==========================================================

const PAGE_SIZE = 10;


// ==========================================================
// COMPOSANT
// ==========================================================

const ListeInscrits: React.FC = () => {

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const navigate = useNavigate();


  // ========================================================
  // ÉTATS
  // ========================================================

  const [
    inscrits,
    setInscrits,
  ] = useState<UserInscrit[]>([]);

  const [
    loadingListe,
    setLoadingListe,
  ] = useState(false);

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    totalInscrits,
    setTotalInscrits,
  ] = useState(0);


  // ========================================================
  // REDIRECTION SI PAS ADMIN
  // ========================================================

  useEffect(() => {

    if (!authLoading) {

      if (!user) {

        navigate("/login");

      } else if (!user.is_admin) {

        navigate("/page2");

      }

    }

  }, [
    authLoading,
    user,
    navigate,
  ]);


  // ========================================================
  // RÉCUPÉRATION DES INSCRITS
  // ========================================================

  useEffect(() => {

    if (!user?.is_admin) {
      return;
    }


    const fetchInscrits = async () => {

      setLoadingListe(true);


      try {

        const response = await api.get(
          "/api/admin/liste-inscrits",
          {
            params: {
              page,
              page_size: PAGE_SIZE,
            },
          }
        );


        // ----------------------------------------------------
        // TRANSFORMATION DES DONNÉES
        // ----------------------------------------------------

        const nouvelleListe: UserInscrit[] =
          (response.data.inscrits || [])

            // Ne pas afficher l'administrateur principal
            .filter(
              (i: any) =>
                i.email !==
                "deogratiashounsou@gmail.com"
            )

            .map((i: any) => ({

              ...i,

              telephone:
                i.telephone || "",

              status:
                i.is_validated
                  ? "validated"
                  : i.status === "SUSPENDED"
                  ? "refused"
                  : "pending",

              is_online:
                i.is_online,

              is_admin:
                i.is_admin,

              // =================================================
              // 👨‍🏫 ENSEIGNANT
              // =================================================

              enseignant:
                Boolean(i.enseignant),

              enseignant_actif:
                i.enseignant_actif !== undefined
                  ? Boolean(i.enseignant_actif)
                  : true,

              subjects:
                Array.isArray(i.subjects)
                  ? i.subjects
                  : [],

              // =================================================
              // PARRAINAGE
              // =================================================

              parrain_email:
                i.parrain_email || "",

              lieu_naissance:
                i.lieu_naissance,

              filleuls_emails:
                Array.isArray(
                  i.filleuls_emails
                )
                  ? i.filleuls_emails
                  : [],

              // =================================================
              // DOCUMENTS
              // =================================================

              documents:
                Array.isArray(i.documents)
                  ? i.documents
                  : [],

            }));


        // ----------------------------------------------------
        // TRI DES INSCRITS
        //
        // Les utilisateurs possédant des documents
        // passent devant ceux qui n'en possèdent aucun.
        //
        // À nombre de documents identique,
        // on conserve l'ordre reçu du backend.
        // ----------------------------------------------------

        const listeTriee = [
          ...nouvelleListe,
        ].sort(
          (a, b) => {

            const nombreDocumentsA =
              Array.isArray(a.documents)
                ? a.documents.length
                : 0;

            const nombreDocumentsB =
              Array.isArray(b.documents)
                ? b.documents.length
                : 0;


            // A possède un document et B aucun
            if (
              nombreDocumentsA > 0 &&
              nombreDocumentsB === 0
            ) {

              return -1;

            }


            // B possède un document et A aucun
            if (
              nombreDocumentsA === 0 &&
              nombreDocumentsB > 0
            ) {

              return 1;

            }


            // Les deux possèdent des documents :
            // celui qui en possède le plus passe devant.
            if (
              nombreDocumentsA > 0 &&
              nombreDocumentsB > 0 &&
              nombreDocumentsA !==
                nombreDocumentsB
            ) {

              return (
                nombreDocumentsB -
                nombreDocumentsA
              );

            }


            return 0;

          }
        );


        setInscrits(
          listeTriee
        );


        // ----------------------------------------------------
        // TOTAL
        // ----------------------------------------------------

        const total =
          Number(
            response.data.total
          ) || 0;

        setTotalInscrits(
          total
        );


      } catch (err) {

        console.error(
          "Erreur récupération inscrits :",
          err
        );

      } finally {

        setLoadingListe(
          false
        );

      }

    };


    fetchInscrits();

  }, [
    page,
    user,
  ]);


  // ========================================================
  // NOMBRE TOTAL DE PAGES
  // ========================================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalInscrits /
        PAGE_SIZE
      )
    );


  // ========================================================
  // PAGES VISIBLES
  // ========================================================

  const visiblePages =
    React.useMemo(() => {

      if (totalPages <= 7) {

        return Array.from(
          {
            length:
              totalPages,
          },
          (_, index) =>
            index + 1
        );

      }


      const pages: number[] = [];


      // Première page
      pages.push(1);


      // Pages autour de la page courante
      for (
        let p =
          Math.max(
            2,
            page - 2
          );

        p <=
          Math.min(
            totalPages - 1,
            page + 2
          );

        p++
      ) {

        pages.push(p);

      }


      // Dernière page
      pages.push(
        totalPages
      );


      // Éliminer les éventuels doublons
      return Array.from(
        new Set(pages)
      );

    }, [
      page,
      totalPages,
    ]);


  // ========================================================
  // NUMÉRO DU PREMIER ÉLÉMENT
  // ========================================================

  const startIndex =
    totalInscrits === 0
      ? 0
      : (
          page - 1
        ) *
          PAGE_SIZE +
        1;


  // ========================================================
  // NUMÉRO DU DERNIER ÉLÉMENT
  // ========================================================

  const endIndex =
    Math.min(
      page * PAGE_SIZE,
      totalInscrits
    );


  // ========================================================
  // 👨‍🏫 DÉCLARER UN UTILISATEUR ENSEIGNANT
  // ========================================================

  const handleDeclarerEnseignant =
    async (
      id: number
    ) => {

      const utilisateur =
        inscrits.find(
          (u) =>
            u.id === id
        );


      if (!utilisateur) {
        return;
      }


      // ----------------------------------------------------
      // CONFIRMATION
      // ----------------------------------------------------

      const confirmation =
        window.confirm(
          `Voulez-vous déclarer ${utilisateur.prenom} ${utilisateur.nom} comme enseignant ?`
        );


      if (!confirmation) {
        return;
      }


      try {

        const res =
          await api.post(
            `/api/admin/teachers/${id}`
          );


        // --------------------------------------------------
        // MISE À JOUR LOCALE
        // --------------------------------------------------

        setInscrits(
          (prev) =>
            prev.map(
              (u) =>
                u.id === id
                  ? {
                      ...u,

                      enseignant:
                        true,

                      enseignant_actif:
                        true,

                      subjects:
                        [],
                    }
                  : u
            )
        );


        alert(
          res.data.message ||
          "L'utilisateur est maintenant enseignant."
        );


      } catch (err: any) {

        console.error(
          "Erreur déclaration enseignant :",
          err
        );


        // --------------------------------------------------
        // ERREURS HTTP
        // --------------------------------------------------

        if (
          err?.response?.status ===
          400
        ) {

          alert(
            err.response.data?.detail ||
            "Cet utilisateur est déjà enseignant."
          );


        } else if (
          err?.response?.status ===
          401
        ) {

          alert(
            "Votre session a expiré. Veuillez vous reconnecter."
          );


        } else if (
          err?.response?.status ===
          403
        ) {

          alert(
            "Vous n'avez pas les droits administrateur nécessaires."
          );


        } else if (
          err?.response?.status ===
          404
        ) {

          alert(
            "Utilisateur introuvable."
          );


        } else {

          alert(
            "Erreur lors de la déclaration comme enseignant."
          );

        }

      }

    };


  // ========================================================
  // VALIDATION D'UN INSCRIT
  // ========================================================

  const handleValider =
    async (
      id: number
    ) => {

      try {

        const res =
          await api.post(
            `/api/admin/valider-inscrit/${id}`
          );


        setInscrits(
          (prev) =>
            prev.map(
              (u) =>
                u.id === id
                  ? {
                      ...u,
                      status:
                        "validated",
                      is_validated:
                        true,
                    }
                  : u
            )
        );


        alert(
          res.data.message
        );


      } catch (err) {

        console.error(
          err
        );


        alert(
          "Erreur lors de la validation."
        );

      }

    };


  // ========================================================
  // REFUSER UN INSCRIT
  // ========================================================

  const handleRefuser =
    async (
      id: number
    ) => {

      try {

        const res =
          await api.post(
            `/api/admin/refuser-inscrit/${id}`
          );


        setInscrits(
          (prev) =>
            prev.filter(
              (u) =>
                u.id !== id
            )
        );


        // Le total diminue également
        setTotalInscrits(
          (prev) =>
            Math.max(
              0,
              prev - 1
            )
        );


        alert(
          res.data.message
        );


      } catch (err) {

        console.error(
          err
        );


        alert(
          "Erreur lors du refus."
        );

      }

    };


  // ========================================================
  // BLOQUER / RÉACTIVER
  // ========================================================

  const handleBlock =
    async (
      id: number,
      blocked?: boolean
    ) => {

      try {

        const action =
          blocked
            ? "reactivate"
            : "block";


        const res =
          await api.post(
            `/api/admin/${action}-user/${id}`
          );


        setInscrits(
          (prev) =>
            prev.map(
              (u) =>
                u.id === id
                  ? {
                      ...u,
                      is_blocked:
                        !blocked,
                    }
                  : u
            )
        );


        alert(
          res.data.message
        );


      } catch (err) {

        console.error(
          err
        );


        alert(
          "Erreur lors du blocage/réactivation."
        );

      }

    };


  // ========================================================
  // NOMBRE D'INSCRIPTIONS EN ATTENTE
  // ========================================================

  const pendingCount =
    inscrits.filter(
      (i) =>
        i.status ===
        "pending"
    ).length;


  // ========================================================
  // CHARGEMENT AUTHENTIFICATION
  // ========================================================

  if (authLoading) {

    return (

      <div
        className="
          flex
          items-center
          justify-center
          min-h-screen
        "
      >
        Chargement...
      </div>

    );

  }


  // ========================================================
  // AFFICHAGE
  // ========================================================

  return (

    <motion.div

      initial={{
        opacity: 0,
        y: 30,
      }}

      animate={{
        opacity: 1,
        y: 0,
      }}

      exit={{
        opacity: 0,
        y: -30,
      }}

      transition={{
        duration: 0.5,
      }}

      className="
        min-h-screen
        p-6
        bg-gray-100
        dark:bg-gray-900
      "
    >


      {/* ====================================================
          TITRE
      ==================================================== */}

      <h1
        className="
          text-3xl
          font-bold
          text-center
          text-blue-700
          dark:text-white
          mb-4
        "
      >
        Liste des Apprenants Inscrits
      </h1>


      {/* ====================================================
          COMPTE DES INSCRIPTIONS EN ATTENTE
      ==================================================== */}

      <p
        className="
          text-center
          text-gray-600
          dark:text-gray-300
          mb-4
        "
      >

        Inscriptions en attente :{" "}

        <span
          className="font-semibold"
        >
          {pendingCount}
        </span>

      </p>


      {/* ====================================================
          LISTE VIDE
      ==================================================== */}

      {loadingListe &&
      inscrits.length === 0 ? (

        <p
          className="
            text-center
            mt-8
            text-gray-600
            dark:text-gray-300
          "
        >
          Chargement...
        </p>

      ) : inscrits.length === 0 ? (

        <p
          className="
            text-center
            text-gray-600
            dark:text-gray-300
          "
        >
          Aucun inscrit pour le moment.
        </p>

      ) : (

        <>

          {/* ==================================================
              TABLEAU
          ================================================== */}

          <div
            className="
              overflow-x-auto
              mb-6
            "
          >

            <table
              className="
                min-w-full
                bg-white
                dark:bg-gray-800
                rounded-xl
                shadow-md
              "
            >

              {/* =================================================
                  EN-TÊTE
              ================================================= */}

              <thead>

                <tr
                  className="
                    bg-blue-600
                    text-white
                  "
                >

                  <th className="px-4 py-2">
                    Nom
                  </th>

                  <th className="px-4 py-2">
                    Prénom
                  </th>

                  <th className="px-4 py-2">
                    Email
                  </th>

                  <th className="px-4 py-2">
                    Parrain
                  </th>

                  <th className="px-4 py-2">
                    Filleuls
                  </th>

                  <th className="px-4 py-2">
                    Téléphone
                  </th>

                  <th className="px-4 py-2">
                    Date inscription
                  </th>

                  <th className="px-4 py-2">
                    Statut
                  </th>

                  <th className="px-4 py-2">
                    Blocage
                  </th>

                  {/* =================================================
                      👨‍🏫 ENSEIGNANT
                  ================================================= */}

                  <th className="px-4 py-2">
                    Enseignant
                  </th>

                  <th className="px-4 py-2">
                    Actions
                  </th>

                  {/* 🔑 DOCUMENTS À LA FIN */}

                  <th
                    className="
                      px-4
                      py-2
                      min-w-[280px]
                    "
                  >
                    Documents
                  </th>

                </tr>

              </thead>


              {/* =================================================
                  CORPS DU TABLEAU
              ================================================= */}

              <tbody>

                {inscrits.map(
                  (i) => {

                    const nombreDocuments =
                      Array.isArray(
                        i.documents
                      )
                        ? i.documents.length
                        : 0;


                    return (

                      <tr

                        key={i.id}

                        className="
                          border-b
                          dark:border-gray-700
                          hover:bg-gray-100
                          dark:hover:bg-gray-700
                        "
                      >


                        {/* ======================================
                            NOM + DOCUMENTS + CONNEXION
                        ====================================== */}

                        <td className="px-4 py-2">

                          <div
                            className="
                              flex
                              items-center
                              gap-2
                              whitespace-nowrap
                            "
                          >

                            {/* NOM */}

                            <span
                              className="
                                font-semibold
                              "
                            >
                              {i.nom}
                            </span>


                            {/* 🔑 NOMBRE DE DOCUMENTS */}

                            {nombreDocuments > 0 && (

                              <span

                                className="
                                  text-yellow-500
                                  text-lg
                                  tracking-tight
                                  cursor-help
                                "

                                title={
                                  `${nombreDocuments} document${
                                    nombreDocuments >
                                    1
                                      ? "s"
                                      : ""
                                  } attribué${
                                    nombreDocuments >
                                    1
                                      ? "s"
                                      : ""
                                  }`
                                }
                              >

                                {"🔑".repeat(
                                  nombreDocuments
                                )}

                              </span>

                            )}


                            {/* STATUT CONNEXION */}

                            {i.is_online ? (

                              <span
                                className="
                                  px-2
                                  py-0.5
                                  bg-green-500
                                  text-white
                                  rounded-full
                                  text-xs
                                "
                              >
                                Connecté
                              </span>

                            ) : (

                              <span
                                className="
                                  px-2
                                  py-0.5
                                  bg-red-500
                                  text-white
                                  rounded-full
                                  text-xs
                                "
                              >
                                Déconnecté
                              </span>

                            )}

                          </div>

                        </td>


                        {/* ======================================
                            PRÉNOM
                        ====================================== */}

                        <td className="px-4 py-2">
                          {i.prenom}
                        </td>


                        {/* ======================================
                            EMAIL
                        ====================================== */}

                        <td className="px-4 py-2">
                          {i.email}
                        </td>


                        {/* ======================================
                            PARRAIN
                        ====================================== */}

                        <td className="px-4 py-2">

                          {i.parrain_email ? (

                            <button

                              onClick={() =>
                                navigate(
                                  `/admin/parrain/${encodeURIComponent(
                                    i.parrain_email
                                  )}`
                                )
                              }

                              className="
                                text-blue-600
                                hover:underline
                              "
                            >
                              {i.parrain_email}
                            </button>

                          ) : (

                            <span
                              className="
                                text-gray-400
                                italic
                              "
                            >
                              Aucun
                            </span>

                          )}

                        </td>


                        {/* ======================================
                            FILLEULS
                        ====================================== */}

                        <td className="px-4 py-2">

                          {i.filleuls_emails &&
                          i.filleuls_emails.length >
                            0 ? (

                            <div
                              className="
                                flex
                                flex-col
                                gap-1
                              "
                            >

                              {i.filleuls_emails.map(
                                (mail) => (

                                  <button

                                    key={mail}

                                    onClick={() =>
                                      navigate(
                                        `/admin/parrain/${encodeURIComponent(
                                          mail
                                        )}`
                                      )
                                    }

                                    className="
                                      text-blue-600
                                      hover:underline
                                      text-sm
                                    "
                                  >
                                    {mail}
                                  </button>

                                )
                              )}

                            </div>

                          ) : (

                            <span
                              className="
                                text-gray-400
                                italic
                              "
                            >
                              Aucun
                            </span>

                          )}

                        </td>


                        {/* ======================================
                            TÉLÉPHONE
                        ====================================== */}

                        <td className="px-4 py-2">
                          {i.telephone || "-"}
                        </td>


                        {/* ======================================
                            DATE INSCRIPTION
                        ====================================== */}

                        <td className="px-4 py-2">

                          {i.date_inscription
                            ? new Date(
                                i.date_inscription
                              ).toLocaleDateString()
                            : "-"
                          }

                        </td>


                        {/* ======================================
                            STATUT
                        ====================================== */}

                        <td className="px-4 py-2">

                          {i.status ===
                            "validated" &&
                            "✅ Validé"}

                          {i.status ===
                            "pending" &&
                            "⏳ En attente"}

                          {i.status ===
                            "refused" &&
                            "❌ Refusé"}

                        </td>


                        {/* ======================================
                            BLOCAGE
                        ====================================== */}

                        <td
                          className="
                            px-4
                            py-2
                            text-center
                          "
                        >

                          {i.is_blocked ? (

                            <span
                              className="
                                text-red-600
                                font-semibold
                              "
                            >
                              🚫 Bloqué
                            </span>

                          ) : (

                            <span
                              className="
                                text-green-600
                                font-semibold
                              "
                            >
                              ✅ Actif
                            </span>

                          )}

                        </td>


                        {/* ======================================
                            👨‍🏫 ENSEIGNANT
                        ====================================== */}

                        <td
                          className="
                            px-4
                            py-2
                            text-center
                          "
                        >

                          {i.enseignant ? (

                            <div
                              className="
                                flex
                                flex-col
                                items-center
                                gap-1
                              "
                            >

                              <span
                                className="
                                  inline-flex
                                  items-center
                                  px-3
                                  py-1
                                  rounded-full
                                  bg-indigo-100
                                  text-indigo-700
                                  dark:bg-indigo-900/40
                                  dark:text-indigo-300
                                  text-sm
                                  font-semibold
                                  whitespace-nowrap
                                "
                              >
                                👨‍🏫 Enseignant
                              </span>


                              {i.enseignant_actif ===
                                false && (

                                <span
                                  className="
                                    text-xs
                                    text-red-600
                                    dark:text-red-400
                                  "
                                >
                                  Désactivé
                                </span>

                              )}

                            </div>

                          ) : (

                            <button

                              onClick={() =>
                                handleDeclarerEnseignant(
                                  i.id
                                )
                              }

                              className="
                                px-3
                                py-1
                                bg-indigo-600
                                text-white
                                rounded-xl
                                hover:bg-indigo-700
                                transition
                                font-semibold
                                whitespace-nowrap
                              "
                            >
                              👨‍🏫 Déclarer enseignant
                            </button>

                          )}

                        </td>


                        {/* ======================================
                            ACTIONS
                        ====================================== */}

                        <td className="px-4 py-2">

                          {i.status ===
                          "pending" ? (

                            <div
                              className="
                                flex
                                gap-2
                              "
                            >

                              <button

                                onClick={() =>
                                  handleValider(
                                    i.id
                                  )
                                }

                                className="
                                  px-3
                                  py-1
                                  bg-green-600
                                  text-white
                                  rounded-xl
                                  hover:bg-green-700
                                  transition
                                "
                              >
                                Valider
                              </button>


                              <button

                                onClick={() =>
                                  handleRefuser(
                                    i.id
                                  )
                                }

                                className="
                                  px-3
                                  py-1
                                  bg-red-600
                                  text-white
                                  rounded-xl
                                  hover:bg-red-700
                                  transition
                                "
                              >
                                Refuser
                              </button>

                            </div>

                          ) : (

                            <div
                              className="
                                flex
                                gap-2
                              "
                            >

                              <button

                                onClick={() =>
                                  handleBlock(
                                    i.id,
                                    i.is_blocked
                                  )
                                }

                                className={`
                                  px-3
                                  py-1
                                  rounded-xl
                                  text-white
                                  transition

                                  ${
                                    i.is_blocked

                                      ? "bg-green-600 hover:bg-green-700"

                                      : "bg-red-600 hover:bg-red-700"
                                  }
                                `}
                              >

                                {i.is_blocked
                                  ? "Réactiver"
                                  : "Bloquer"}

                              </button>

                            </div>

                          )}

                        </td>


                        {/* ======================================
                            DOCUMENTS + CODES
                            TOUJOURS À LA FIN
                        ====================================== */}

                        <td className="px-4 py-2">

                          {nombreDocuments > 0 ? (

                            <div
                              className="
                                flex
                                flex-col
                                gap-2
                                min-w-[250px]
                              "
                            >

                              {i.documents!.map(
                                (document) => (

                                  <div

                                    key={
                                      document.id
                                    }

                                    className="
                                      p-2
                                      rounded-lg
                                      bg-purple-50
                                      dark:bg-purple-900/30
                                      border
                                      border-purple-200
                                      dark:border-purple-700
                                    "
                                  >

                                    {/* NOM DU DOCUMENT */}

                                    <div
                                      className="
                                        font-semibold
                                        text-purple-700
                                        dark:text-purple-300
                                      "
                                    >
                                      📚{" "}
                                      {
                                        document.document_name
                                      }
                                    </div>


                                    {/* CODE */}

                                    <div
                                      className="
                                        text-sm
                                        text-gray-700
                                        dark:text-gray-300
                                        mt-1
                                      "
                                    >

                                      🔑 Code :{" "}

                                      <span
                                        className="
                                          font-mono
                                          font-semibold
                                        "
                                      >
                                        {
                                          document.activation_code
                                        }
                                      </span>

                                    </div>


                                    {/* ÉTAT ACTIVATION */}

                                    <div
                                      className="
                                        text-sm
                                        mt-1
                                      "
                                    >

                                      {document.is_activated ? (

                                        <span
                                          className="
                                            text-green-600
                                            font-semibold
                                          "
                                        >
                                          ✅ Activé
                                        </span>

                                      ) : (

                                        <span
                                          className="
                                            text-orange-600
                                            font-semibold
                                          "
                                        >
                                          ⏳ Non activé
                                        </span>

                                      )}

                                    </div>


                                    {/* DATE ACTIVATION */}

                                    {document.activated_at && (

                                      <div
                                        className="
                                          text-xs
                                          text-gray-500
                                          mt-1
                                        "
                                      >

                                        Activé le :{" "}

                                        {new Date(
                                          document.activated_at
                                        ).toLocaleString()}

                                      </div>

                                    )}

                                  </div>

                                )
                              )}

                            </div>

                          ) : (

                            <span
                              className="
                                text-gray-400
                                italic
                              "
                            >
                              Aucun document
                            </span>

                          )}

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>


            {/* ==================================================
                CHARGEMENT ENTRE DEUX PAGES
            ================================================== */}

            {loadingListe &&
            inscrits.length > 0 && (

              <p
                className="
                  text-center
                  mt-4
                  text-gray-600
                  dark:text-gray-300
                "
              >
                Chargement...
              </p>

            )}

          </div>


          {/* ==================================================
              INFORMATIONS DE PAGINATION
          ================================================== */}

          {totalInscrits > 0 && (

            <div
              className="
                text-center
                text-sm
                text-gray-600
                dark:text-gray-300
                mb-4
              "
            >

              Affichage de{" "}

              <span
                className="font-semibold"
              >
                {startIndex}
              </span>

              {" "}à{" "}

              <span
                className="font-semibold"
              >
                {endIndex}
              </span>

              {" "}sur{" "}

              <span
                className="font-semibold"
              >
                {totalInscrits}
              </span>

              {" "}inscrit(s).

              <div className="mt-1">

                Page{" "}

                <span
                  className="font-semibold"
                >
                  {page}
                </span>

                {" "}sur{" "}

                <span
                  className="font-semibold"
                >
                  {totalPages}
                </span>

              </div>

            </div>

          )}


          {/* ==================================================
              PAGINATION
          ================================================== */}

          {totalPages > 1 && (

            <div
              className="
                flex
                flex-wrap
                justify-center
                items-center
                gap-2
                mt-6
                mb-8
              "
            >

              {/* ============================================
                  PRÉCÉDENT
              ============================================ */}

              <button

                onClick={() =>
                  setPage(
                    (currentPage) =>
                      Math.max(
                        currentPage - 1,
                        1
                      )
                  )
                }

                disabled={
                  page === 1 ||
                  loadingListe
                }

                className={`
                  px-4
                  py-2
                  rounded-xl
                  font-semibold
                  transition

                  ${
                    page === 1 ||
                    loadingListe

                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"

                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }
                `}
              >
                ← Précédent
              </button>


              {/* ============================================
                  NUMÉROS DE PAGES
              ============================================ */}

              {visiblePages.map(
                (
                  pageNumber,
                  index
                ) => {

                  const previousPage =
                    visiblePages[
                      index - 1
                    ];

                  const showEllipsis =
                    previousPage !==
                      undefined &&
                    pageNumber -
                      previousPage >
                      1;


                  return (

                    <React.Fragment
                      key={pageNumber}
                    >

                      {/* ====================================
                          ...
                      ==================================== */}

                      {showEllipsis && (

                        <span
                          className="
                            px-2
                            text-gray-500
                            dark:text-gray-400
                          "
                        >
                          ...
                        </span>

                      )}


                      {/* ====================================
                          BOUTON PAGE
                      ==================================== */}

                      <button

                        onClick={() =>
                          setPage(
                            pageNumber
                          )
                        }

                        disabled={
                          loadingListe
                        }

                        className={`
                          min-w-[42px]
                          px-3
                          py-2
                          rounded-xl
                          font-semibold
                          transition

                          ${
                            page ===
                            pageNumber

                              ? "bg-blue-700 text-white shadow-md"

                              : "bg-white text-blue-700 border border-blue-300 hover:bg-blue-50 dark:bg-gray-800 dark:text-blue-300 dark:border-blue-700"
                          }
                        `}
                      >
                        {pageNumber}
                      </button>

                    </React.Fragment>

                  );

                }
              )}


              {/* ============================================
                  SUIVANT
              ============================================ */}

              <button

                onClick={() =>
                  setPage(
                    (currentPage) =>
                      Math.min(
                        currentPage + 1,
                        totalPages
                      )
                  )
                }

                disabled={
                  page ===
                    totalPages ||
                  loadingListe
                }

                className={`
                  px-4
                  py-2
                  rounded-xl
                  font-semibold
                  transition

                  ${
                    page ===
                      totalPages ||
                    loadingListe

                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"

                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }
                `}
              >
                Suivant →
              </button>

            </div>

          )}

        </>

      )}


      {/* ====================================================
          BOUTONS ADMINISTRATION
      ==================================================== */}

      <div
        className="
          flex
          flex-col
          items-center
          space-y-4
          mt-6
        "
      >


        {/* ==================================================
            GESTION DES DOCUMENTS
        ================================================== */}

        <button

          onClick={() =>
            navigate(
              "/admin/documents"
            )
          }

          className="
            px-6
            py-3
            font-semibold
            rounded-xl
            bg-purple-600
            text-white
            hover:bg-purple-700
            transition
            w-64
            text-center
          "
        >
          📚 GESTION DES DOCUMENTS
        </button>


        {/* ==================================================
            👨‍🏫 GESTION DES ENSEIGNANTS
        ================================================== */}

        <button

          onClick={() =>
            navigate(
              "/admin/enseignants"
            )
          }

          className="
            px-6
            py-3
            font-semibold
            rounded-xl
            bg-indigo-600
            text-white
            hover:bg-indigo-700
            transition
            w-64
            text-center
          "
        >
          👨‍🏫 GESTION DES ENSEIGNANTS
        </button>


        {/* ==================================================
            CODES D'ACTIVATION
        ================================================== */}

        <button

          onClick={() =>
            navigate(
              "/admin/codes-activation"
            )
          }

          className="
            px-6
            py-3
            font-semibold
            rounded-xl
            bg-orange-600
            text-white
            hover:bg-orange-700
            transition
            w-64
            text-center
          "
        >
          🔑 CODES D'ACTIVATION
        </button>


        {/* ==================================================
            HISTORIQUE CONNEXIONS
        ================================================== */}

        <button

          onClick={() =>
            navigate(
              "/admin/historique-connections"
            )
          }

          className="
            px-6
            py-3
            font-semibold
            rounded-xl
            bg-green-600
            text-white
            hover:bg-green-700
            transition
            w-64
            text-center
          "
        >
          Voir l'historique des connexions
        </button>


        {/* ==================================================
            CONTINUER
        ================================================== */}

        <button

          onClick={() =>
            navigate(
              "/page2"
            )
          }

          disabled={
            pendingCount > 0
          }

          className={`

            px-6
            py-3
            font-semibold
            rounded-xl
            transition
            w-64
            text-center

            ${
              pendingCount > 0

                ? "bg-gray-400 text-gray-700 cursor-not-allowed"

                : "bg-blue-600 text-white hover:bg-blue-700"
            }

          `}
        >
          CONTINUER
        </button>


        {/* ==================================================
            AVERTISSEMENT
        ================================================== */}

        {pendingCount > 0 && (

          <p
            className="
              text-sm
              text-red-600
              mt-2
              text-center
            "
          >
            ⚠️ Vous devez traiter toutes les
            inscriptions avant de continuer.
          </p>

        )}


        {/* ==================================================
            💬 CONVERSATIONS ADMIN
            TOUJOURS TOUT EN BAS
        ================================================== */}

        <div
          className="
            w-full
            flex
            justify-center
            mt-8
            pt-6
            border-t
            border-gray-300
            dark:border-gray-700
          "
        >

          <button

            onClick={() =>
              navigate(
                "/admin/questions"
              )
            }

            className="
              px-6
              py-3
              font-semibold
              rounded-xl
              bg-indigo-600
              text-white
              hover:bg-indigo-700
              transition
              w-64
              text-center
              shadow-md
            "
          >
            💬 CONVERSATIONS ADMIN
          </button>

        </div>

      </div>


    </motion.div>

  );

};


export default ListeInscrits;