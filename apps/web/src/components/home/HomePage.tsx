import { useNavigate } from "react-router-dom";
import { useAppPalette } from "../../context/AppPaletteContext";
import { APP_PALETTES } from "../../lib/appPalettes";
import "../../styles/home.css";

const cards = [
  {
    id: "create",
    label: "Start",
    title: "Create video",
    hint: "Open the creation flow and generate a new promo.",
    route: "/create",
  },
  {
    id: "dashboard",
    label: "Overview",
    title: "Check dashboard",
    hint: "Review saved videos and recent activity.",
    route: "/dashboard",
  },
  {
    id: "settings",
    label: "Product",
    title: "Settings & UI design",
    hint: "Tune style guide, effects, and interface checks.",
    route: "/settings",
  },
] as const;

export function HomePage() {
  const navigate = useNavigate();
  const { paletteId, setPaletteId } = useAppPalette();

  return (
    <>
      <div className="shadow" aria-hidden="true" />
      <div className="home">
        <header className="home__header">
          <p className="home__eyebrow">Ai slop machine</p>
          <h1 className="home__title">Promotion studio</h1>
          <p className="home__lede">
            Turn front-end captures into guided video briefs—then ship motion
            with your Remotion pipeline.
          </p>
        </header>

        <fieldset className="home__palette">
          <legend className="home__palette-legend">Color palette</legend>
          <div
            className="home__palette-grid"
            role="radiogroup"
            aria-label="App color theme"
          >
            {APP_PALETTES.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={paletteId === p.id}
                className={
                  "home-palette-btn" +
                  (paletteId === p.id ? " home-palette-btn--active" : "")
                }
                onClick={() => setPaletteId(p.id)}
              >
                <span className="home-palette-btn__strip" aria-hidden="true">
                  {p.swatch.map((hex, i) => (
                    <span
                      key={i}
                      className="home-palette-btn__swatch"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </span>
                <span className="home-palette-btn__label">{p.label}</span>
                <span className="home-palette-btn__hint">{p.hint}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <main>
          <div className="home__grid" role="list">
            {cards.map((card) => (
              <button
                key={card.id}
                type="button"
                className="home-card"
                role="listitem"
                onClick={() => navigate(card.route)}
              >
                <span className="home-card__accent" aria-hidden="true" />
                <span className="home-card__label">{card.label}</span>
                <h2 className="home-card__title">{card.title}</h2>
                <div className="home-card__row">
                  <p className="home-card__hint">{card.hint}</p>
                  <span className="home-card__arrow" aria-hidden="true">
                    <svg
                      className="home-card__arrow-icon"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 10h10m0 0-3.5-3.5M14 10l-3.5 3.5"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
