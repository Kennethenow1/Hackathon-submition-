import { useState, useRef, useEffect } from "react";
import { useAppPalette } from "../../context/AppPaletteContext";
import { APP_PALETTES, type AppPaletteMeta } from "../../lib/appPalettes";

export function PaletteFab() {
  const { paletteId, setPaletteId } = useAppPalette();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const currentPalette = APP_PALETTES.find((p) => p.id === paletteId) ?? APP_PALETTES[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current &&
        triggerRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  function handleSelect(palette: AppPaletteMeta) {
    setPaletteId(palette.id);
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div className="palette-fab">
      <button
        ref={triggerRef}
        type="button"
        className="palette-fab__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Change color theme. Current: ${currentPalette.label}`}
        title="Change color theme"
      >
        <span className="palette-fab__swatches" aria-hidden="true">
          {currentPalette.swatch.map((hex, i) => (
            <span
              key={i}
              className="palette-fab__swatch"
              style={{ backgroundColor: hex }}
            />
          ))}
        </span>
      </button>

      <div
        ref={menuRef}
        className={`palette-fab__menu${isOpen ? " palette-fab__menu--open" : ""}`}
        role="listbox"
        aria-label="Color themes"
      >
        {APP_PALETTES.map((p) => (
          <button
            key={p.id}
            type="button"
            role="option"
            aria-selected={paletteId === p.id}
            className={`palette-fab__option${paletteId === p.id ? " palette-fab__option--active" : ""}`}
            onClick={() => handleSelect(p)}
          >
            <span className="palette-fab__option-swatch" aria-hidden="true">
              {p.swatch.map((hex, i) => (
                <span key={i} style={{ backgroundColor: hex }} />
              ))}
            </span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
