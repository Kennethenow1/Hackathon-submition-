import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  APP_PALETTE_STORAGE_KEY,
  type AppPaletteId,
  isAppPaletteId,
} from "../lib/appPalettes";

type AppPaletteContextValue = {
  paletteId: AppPaletteId;
  setPaletteId: (id: AppPaletteId) => void;
};

const AppPaletteContext = createContext<AppPaletteContextValue | null>(null);

function readStoredPalette(): AppPaletteId {
  try {
    const raw = localStorage.getItem(APP_PALETTE_STORAGE_KEY);
    if (raw && isAppPaletteId(raw)) return raw;
  } catch {
    /* ignore */
  }
  return "blush";
}

export function AppPaletteProvider({ children }: { children: ReactNode }) {
  const [paletteId, setPaletteIdState] = useState<AppPaletteId>(() => {
    if (typeof window === "undefined") return "blush";
    return readStoredPalette();
  });

  useLayoutEffect(() => {
    document.documentElement.dataset.appPalette = paletteId;
  }, [paletteId]);

  const setPaletteId = useCallback((id: AppPaletteId) => {
    setPaletteIdState(id);
    try {
      localStorage.setItem(APP_PALETTE_STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ paletteId, setPaletteId }),
    [paletteId, setPaletteId]
  );

  return (
    <AppPaletteContext.Provider value={value}>
      {children}
    </AppPaletteContext.Provider>
  );
}

export function useAppPalette(): AppPaletteContextValue {
  const ctx = useContext(AppPaletteContext);
  if (!ctx) {
    throw new Error("useAppPalette must be used within AppPaletteProvider");
  }
  return ctx;
}
