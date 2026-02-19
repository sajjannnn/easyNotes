const DB_NAME = "easy-notes-db";
const DB_VERSION = 2;

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      // Folders store
      if (!db.objectStoreNames.contains("folders")) {
        db.createObjectStore("folders", { keyPath: "id" });
      }

      // Files store
      if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files", { keyPath: "id" });
      }

      // Notes store
      if (!db.objectStoreNames.contains("notes")) {
        db.createObjectStore("notes", { keyPath: "id" });
      }

      // Meta store (for activeFileId etc)
      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta", { keyPath: "key" });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Set active file
export async function setActiveFile(fileId: string) {
  const db = await openDB();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction("meta", "readwrite");
    const store = tx.objectStore("meta");

    const request = store.put({
      key: "activeFileId",
      value: fileId,
    });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Create new file
export async function createFile(name: string, folderId: string | null = null) {
  const db = await openDB();

  const newFile = {
    id: crypto.randomUUID(),
    name,
    folderId,
    createdAt: Date.now(),
  };

  return new Promise<string>((resolve, reject) => {
    const tx = db.transaction("files", "readwrite");
    const store = tx.objectStore("files");

    const request = store.add(newFile);

    request.onsuccess = async () => {
      await setActiveFile(newFile.id);
      resolve(newFile.id);
    };

    request.onerror = () => reject(request.error);
  });
}

// Get active file
export async function getActiveFile(): Promise<string | null> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction("meta", "readonly");
    const store = tx.objectStore("meta");

    const request = store.get("activeFileId");

    request.onsuccess = () => {
      resolve(request.result?.value || null);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function saveNote(note: any) {
  const db = await openDB();

  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction("notes", "readwrite");
    const store = transaction.objectStore("notes");

    const request = store.add(note);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}