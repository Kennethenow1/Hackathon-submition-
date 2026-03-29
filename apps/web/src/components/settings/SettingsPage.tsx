import { useNavigate } from "react-router-dom";
import { useAppPalette } from "../../context/AppPaletteContext";
import { APP_PALETTES, type AppPaletteId } from "../../lib/appPalettes";
import { PaletteFab } from "../shared/PaletteFab";
import "../../styles/settings.css";

export function SettingsPage() {
  const navigate = useNavigate();
  const { paletteId, setPaletteId } = useAppPalette();

  function handlePaletteSelect(id: AppPaletteId) {
    setPaletteId(id);
  }

  return (
    <>
      <div className="shadow" aria-hidden="true" />
      <div className="settings">
        <header className="settings__header">
          <button
            type="button"
            className="settings__back"
            onClick={() => navigate("/")}
          >
            &larr; Back to home
          </button>
          <div className="settings__header-content">
            <p className="settings__eyebrow">Settings</p>
            <h1 className="settings__title">UI design & preferences</h1>
            <p className="settings__lede">
              Customize the look and feel of your promotion studio.
            </p>
          </div>
        </header>

        <main className="settings__main">
          <section className="settings__section">
            <h2 className="settings__section-title">Color theme</h2>
            <p className="settings__section-desc">
              Choose a color palette that matches your style. The theme applies across the entire app.
            </p>

            <div className="settings__palette-grid">
              {APP_PALETTES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`settings__palette-card${paletteId === p.id ? " settings__palette-card--active" : ""}`}
                  onClick={() => handlePaletteSelect(p.id)}
                >
                  <div className="settings__palette-preview">
                    {p.swatch.map((hex, i) => (
                      <span
                        key={i}
                        className="settings__palette-swatch"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                  <div className="settings__palette-info">
                    <span className="settings__palette-label">{p.label}</span>
                    <span className="settings__palette-hint">{p.hint}</span>
                  </div>
                  {paletteId === p.id && (
                    <span className="settings__palette-check" aria-label="Selected">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>

          <section className="settings__section">
            <h2 className="settings__section-title">Video effects</h2>
            <p className="settings__section-desc">
              Default effects applied to new video generations.
            </p>

            <div className="settings__effects">
              <label className="settings__effect">
                <input type="checkbox" defaultChecked />
                <div className="settings__effect-content">
                  <span className="settings__effect-label">Motion blur</span>
                  <span className="settings__effect-desc">Smooth camera transitions</span>
                </div>
              </label>
              <label className="settings__effect">
                <input type="checkbox" defaultChecked />
                <div className="settings__effect-content">
                  <span className="settings__effect-label">Particle effects</span>
                  <span className="settings__effect-desc">Floating particles in backgrounds</span>
                </div>
              </label>
              <label className="settings__effect">
                <input type="checkbox" />
                <div className="settings__effect-content">
                  <span className="settings__effect-label">Lens flare</span>
                  <span className="settings__effect-desc">Cinematic light effects</span>
                </div>
              </label>
              <label className="settings__effect">
                <input type="checkbox" defaultChecked />
                <div className="settings__effect-content">
                  <span className="settings__effect-label">Text animations</span>
                  <span className="settings__effect-desc">Word-by-word reveal effects</span>
                </div>
              </label>
            </div>
          </section>

          <section className="settings__section">
            <h2 className="settings__section-title">Output settings</h2>
            <p className="settings__section-desc">
              Configure video output preferences.
            </p>

            <div className="settings__options">
              <div className="settings__option">
                <label className="settings__option-label">Video quality</label>
                <select className="settings__select" defaultValue="1080p">
                  <option value="720p">720p (HD)</option>
                  <option value="1080p">1080p (Full HD)</option>
                  <option value="4k">4K (Ultra HD)</option>
                </select>
              </div>
              <div className="settings__option">
                <label className="settings__option-label">Frame rate</label>
                <select className="settings__select" defaultValue="30">
                  <option value="24">24 fps (Cinematic)</option>
                  <option value="30">30 fps (Standard)</option>
                  <option value="60">60 fps (Smooth)</option>
                </select>
              </div>
              <div className="settings__option">
                <label className="settings__option-label">Default duration</label>
                <select className="settings__select" defaultValue="30">
                  <option value="15">15 seconds</option>
                  <option value="30">30 seconds</option>
                  <option value="60">60 seconds</option>
                </select>
              </div>
            </div>
          </section>
        </main>
      </div>

      <PaletteFab />
    </>
  );
}
