import type { WebsiteComponentFile } from "../../types/website-artifact";

const DB_NAME = "ai-slop-website-artifacts";
const STORE = "bundles";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
  });
}

type Row = { key: string; bundle: WebsiteComponentFile };

export async function saveWebsiteComponent(
  bundle: WebsiteComponentFile
): Promise<void> {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      store.put({ key: "latest", bundle } satisfies Row);
      store.put({ key: `id:${bundle.id}`, bundle } satisfies Row);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("IndexedDB write failed"));
      tx.onabort = () => reject(tx.error ?? new Error("IndexedDB tx aborted"));
    });
  } finally {
    db.close();
  }
}

export async function loadLatestWebsiteComponent(): Promise<WebsiteComponentFile | null> {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get("latest");
      req.onsuccess = () => {
        const row = req.result as Row | undefined;
        resolve(row?.bundle ?? null);
      };
      req.onerror = () => reject(req.error ?? new Error("IndexedDB read failed"));
    });
  } finally {
    db.close();
  }
}

export async function loadWebsiteComponentById(
  id: string
): Promise<WebsiteComponentFile | null> {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(`id:${id}`);
      req.onsuccess = () => {
        const row = req.result as Row | undefined;
        resolve(row?.bundle ?? null);
      };
      req.onerror = () => reject(req.error ?? new Error("IndexedDB read failed"));
    });
  } finally {
    db.close();
  }
}

export async function clearLatestWebsiteComponent(): Promise<void> {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete("latest");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("IndexedDB delete failed"));
    });
  } finally {
    db.close();
  }
}
