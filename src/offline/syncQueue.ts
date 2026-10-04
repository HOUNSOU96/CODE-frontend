// 📁 src/offline/syncQueue.ts

import api from "@/utils/axios";

import {
  getAllOfflineData,
  deleteOfflineData,
  STORES,
} from "@/offline/offlineDB";

// ============================================================
// TYPE : RÉSULTAT DE QUESTIONNAIRE HORS LIGNE
// ============================================================

type OfflineQuestionnaireResult = {
  id: string;

  type: "questionnaire_result";

  createdAt: number;

  status: "pending";

  endpoint: string;

  method: "POST";

  payload: {
    matiere: string;
    niveau: string;
    serie: string;
    test_id: string;

    resultats: {
      id: string;
      reponse: string;
    }[];
  };
};

// ============================================================
// TYPE : QUESTION CRÉÉE HORS LIGNE
// ============================================================

type OfflineQuestionSubmission = {
  id: string;

  type: "question_submission";

  createdAt: number;

  status: "pending";

  endpoint: string;

  method: "POST";

  payload: {
    recipient_type: "admin" | "subject";

    subject: string | null;

    is_learner: boolean;

    learner_class: string | null;

    title: string;

    content: string;
  };
};

// ============================================================
// TYPE GÉNÉRAL D'UNE SOUMISSION HORS LIGNE
// ============================================================

type OfflineSubmission =
  | OfflineQuestionnaireResult
  | OfflineQuestionSubmission;

// ============================================================
// SYNCHRONISATION D'UNE SOUMISSION
// ============================================================

const syncSubmission = async (
  submission: OfflineSubmission
): Promise<boolean> => {
  try {
    // --------------------------------------------------------
    // VÉRIFICATION DE LA CONNEXION
    // --------------------------------------------------------

    if (!navigator.onLine) {
      console.log(
        "📴 Connexion perdue pendant la synchronisation."
      );

      return false;
    }

    // --------------------------------------------------------
    // INFORMATIONS DE SYNCHRONISATION
    // --------------------------------------------------------

    console.log(
      "📤 Synchronisation de l'élément :",
      {
        id: submission.id,
        type: submission.type,
        endpoint: submission.endpoint,
      }
    );

    // --------------------------------------------------------
    // ENVOI POST
    // --------------------------------------------------------

    if (submission.method === "POST") {
      await api.post(
        submission.endpoint,
        submission.payload
      );
    }

    // --------------------------------------------------------
    // MÉTHODE INCONNUE
    // --------------------------------------------------------

    else {
      console.warn(
        "⚠️ Méthode HTTP non prise en charge :",
        submission.method
      );

      return false;
    }

    // --------------------------------------------------------
    // SUCCÈS
    // --------------------------------------------------------

    console.log(
      "✅ Élément synchronisé avec succès :",
      submission.id,
      submission.type
    );

    // --------------------------------------------------------
    // SUPPRESSION DE LA FILE
    // --------------------------------------------------------

    await deleteOfflineData(
      STORES.syncQueue,
      submission.id
    );

    console.log(
      "🗑️ Élément retiré de syncQueue :",
      submission.id
    );

    return true;
  } catch (error: any) {
    // --------------------------------------------------------
    // ANALYSE DE L'ÉCHEC
    // --------------------------------------------------------

    const status =
      error?.response?.status;

    // --------------------------------------------------------
    // ERREUR RÉSEAU
    //
    // On conserve l'élément dans la file.
    // --------------------------------------------------------

    if (
      !error?.response ||
      !navigator.onLine
    ) {
      console.warn(
        "📴 Synchronisation impossible pour le moment :",
        submission.id
      );

      return false;
    }

    // --------------------------------------------------------
    // ERREURS SERVEUR
    //
    // On conserve également l'élément pour éviter
    // de perdre les données hors ligne.
    //
    // Les erreurs 4xx peuvent nécessiter une intervention
    // côté serveur ou une évolution du payload.
    // --------------------------------------------------------

    console.warn(
      "⚠️ Le backend a refusé la synchronisation :",
      {
        id: submission.id,
        type: submission.type,
        status,
        error,
      }
    );

    return false;
  }
};

// ============================================================
// SYNCHRONISATION DE LA FILE HORS LIGNE
// ============================================================

export const syncOfflineQueue = async (): Promise<void> => {
  // ----------------------------------------------------------
  // PAS INTERNET → AUCUNE TENTATIVE
  // ----------------------------------------------------------

  if (!navigator.onLine) {
    console.log(
      "📴 Synchronisation ignorée : appareil hors ligne."
    );

    return;
  }

  try {
    // --------------------------------------------------------
    // RÉCUPÉRER LES ÉLÉMENTS EN ATTENTE
    // --------------------------------------------------------

    const queue =
      await getAllOfflineData<OfflineSubmission>(
        STORES.syncQueue
      );

    if (queue.length === 0) {
      console.log(
        "✅ La file de synchronisation est vide."
      );

      return;
    }

    console.log(
      `🔄 ${queue.length} élément(s) à synchroniser...`
    );

    // --------------------------------------------------------
    // TRAITER CHAQUE ÉLÉMENT
    // --------------------------------------------------------

    for (const submission of queue) {
      // ------------------------------------------------------
      // IGNORER LES ÉLÉMENTS QUI NE SONT PAS EN ATTENTE
      // ------------------------------------------------------

      if (submission.status !== "pending") {
        continue;
      }

      // ------------------------------------------------------
      // SI INTERNET EST PERDU AU MILIEU DE LA SYNCHRONISATION
      // ------------------------------------------------------

      if (!navigator.onLine) {
        console.log(
          "📴 Connexion perdue. Synchronisation arrêtée."
        );

        break;
      }

      // ------------------------------------------------------
      // SYNCHRONISER
      // ------------------------------------------------------

      await syncSubmission(submission);
    }

    // --------------------------------------------------------
    // FIN
    // --------------------------------------------------------

    console.log(
      "🏁 Synchronisation de la file terminée."
    );
  } catch (error) {
    console.error(
      "❌ Erreur lors de la lecture de syncQueue :",
      error
    );
  }
};