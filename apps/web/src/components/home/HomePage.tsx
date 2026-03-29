import { useNavigate } from "react-router-dom";
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
                <p className="home-card__hint">{card.hint}</p>
                <span className="home-card__arrow" aria-hidden="true">
                  →
                </span>
              </button>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
