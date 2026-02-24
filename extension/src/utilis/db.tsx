
export interface Note {
  id: string;
  fileId: string;
  videoId: string | null;
  url: string;
  videoTitle: string;
  timestamp: number | null;
  image?: string;
  text?: string;
  createdAt: number;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
}

export interface FileItem {
  id: string;
  name: string;
  folderId: string | null;
  createdAt: number;
}



const DB_NAME = "easy-notes-db";
const DB_VERSION = 3; 


// ==========================
// OPEN DATABASE
// ==========================

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains("folders")) {
        db.createObjectStore("folders", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("notes")) {
        db.createObjectStore("notes", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta", { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ==========================
// ACTIVE FILE MANAGEMENT
// ==========================

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

export async function ensureActiveFile(): Promise<string> {
  const activeFileId = await getActiveFile();

  if (activeFileId) return activeFileId;

  const newFileId = await createFile("Quick Notes", null);
  return newFileId;
}

// ==========================
// FOLDER FUNCTIONS
// ==========================

export async function createFolder(
  name: string,
  parentId: string | null = null
): Promise<string> {
  const db = await openDB();

  const newFolder: Folder = {
    id: crypto.randomUUID(),
    name,
    parentId,
    createdAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction("folders", "readwrite");
    const store = tx.objectStore("folders");

    const request = store.add(newFolder);

    request.onsuccess = () => resolve(newFolder.id);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllFolders(): Promise<Folder[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction("folders", "readonly");
    const store = tx.objectStore("folders");

    const request = store.getAll();

    request.onsuccess = () => {
      const folders = request.result as Folder[];
      resolve(folders.sort((a, b) => a.createdAt - b.createdAt));
    };

    request.onerror = () => reject(request.error);
  });
}

// ==========================
// FILE FUNCTIONS
// ==========================

export async function createFile(
  name: string,
  folderId: string | null = null
): Promise<string> {
  const db = await openDB();

  const newFile: FileItem = {
    id: crypto.randomUUID(),
    name,
    folderId,
    createdAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
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

export async function getAllFiles(): Promise<FileItem[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction("files", "readonly");
    const store = tx.objectStore("files");

    const request = store.getAll();

    request.onsuccess = () => {
      const files = request.result as FileItem[];
      resolve(files.sort((a, b) => a.createdAt - b.createdAt));
    };

    request.onerror = () => reject(request.error);
  });
}

// ==========================
// NOTE FUNCTIONS
// ==========================

export async function saveNote(note: Note) {
  const db = await openDB();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction("notes", "readwrite");
    const store = tx.objectStore("notes");

    const request = store.add(note);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getNotesByFileId(
  fileId: string
): Promise<Note[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction("notes", "readonly");
    const store = tx.objectStore("notes");

    const request = store.getAll();

    request.onsuccess = () => {
      const allNotes = request.result as Note[];

      const filtered = allNotes
        .filter((note) => note.fileId === fileId)
        .sort((a, b) => a.createdAt - b.createdAt);

      resolve(filtered);
    };

    request.onerror = () => reject(request.error);
  });
}