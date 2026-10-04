const DB_NAME = "CODE_OFFLINE_DB";
const DB_VERSION = 1;

export const STORES = {
  announcements: "announcements",
  questions: "questions",
  courses: "courses",
  exercises: "exercises",
  notions: "notions",
  results: "results",
  progress: "progress",
  documents: "documents",
  syncQueue: "syncQueue",
} as const;

type StoreName =
  (typeof STORES)[keyof typeof STORES];

let dbPromise: Promise<IDBDatabase> | null = null;

// ============================================================
// BASE DE DONNÉES
// ============================================================

const createDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(
      DB_NAME,
      DB_VERSION
    );

    request.onupgradeneeded = () => {
      const db = request.result;

      Object.values(STORES).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, {
            keyPath: "id",
          });
        }
      });
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

const getDatabase = async (): Promise<IDBDatabase> => {
  if (!dbPromise) {
    dbPromise = createDatabase();
  }

  return dbPromise;
};

// ============================================================
// SAUVEGARDE
// ============================================================

export const saveOfflineData = async <
  T extends { id: string }
>(
  storeName: StoreName,
  data: T
): Promise<void> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      storeName,
      "readwrite"
    );

    const store =
      transaction.objectStore(storeName);

    store.put(data);

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
};

// ============================================================
// RÉCUPÉRATION PAR ID
// ============================================================

export const getOfflineData = async <
  T extends { id: string }
>(
  storeName: StoreName,
  id: string
): Promise<T | null> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      storeName,
      "readonly"
    );

    const store =
      transaction.objectStore(storeName);

    const request = store.get(id);

    request.onsuccess = () => {
      resolve(
        (request.result as T | undefined) ??
          null
      );
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

// ============================================================
// TOUTES LES DONNÉES
// ============================================================

export const getAllOfflineData = async <
  T extends { id: string }
>(
  storeName: StoreName
): Promise<T[]> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      storeName,
      "readonly"
    );

    const store =
      transaction.objectStore(storeName);

    const request = store.getAll();

    request.onsuccess = () => {
      resolve(
        (request.result as T[]) ?? []
      );
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

// ============================================================
// SUPPRESSION
// ============================================================

export const deleteOfflineData = async (
  storeName: StoreName,
  id: string
): Promise<void> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      storeName,
      "readwrite"
    );

    const store =
      transaction.objectStore(storeName);

    store.delete(id);

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
};