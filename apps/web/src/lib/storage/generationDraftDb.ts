import type { GenerationDraft } from "../../types/generating-artifact";

const DB_NAME = "ai-slop-generation-drafts";
const STORE = "drafts";
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

type Row = { key: string; draft: GenerationDraft };

function keyForBundle(bundleId: string): string {
  return `bundle:${bundleId}`;
}

export async function saveGenerationDraft(draft: GenerationDraft): Promise<void> {
  const db = await openDb();
  const row: Row = {
    key: keyForBundle(draft.websiteBundleId),
    draft: { ...draft, updatedAt: new Date().toISOString() },
  };
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(row);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("IndexedDB write failed"));
    });
  } finally {
    db.close();
  }
}

export async function loadGenerationDraft(
  websiteBundleId: string
): Promise<GenerationDraft | null> {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(keyForBundle(websiteBundleId));
      req.onsuccess = () => {
        const row = req.result as Row | undefined;
        resolve(row?.draft ?? null);
      };
      req.onerror = () => reject(req.error ?? new Error("IndexedDB read failed"));
    });
  } finally {
    db.close();
  }
}
