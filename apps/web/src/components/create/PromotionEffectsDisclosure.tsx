import { useState } from "react";
import type { PromotionEffect } from "../../types/effects-manifest";

export type PromotionEffectsDisclosureProps = {
  effects: PromotionEffect[];
  selectedEffects: Set<string>;
  onToggle: (id: string) => void;
  /** Start with the list expanded (React state — not the DOM `defaultOpen` attribute). */
  initiallyExpanded?: boolean;
};

function selectionSummary(
  effects: PromotionEffect[],
  selected: Set<string>
): string {
  if (selected.size === 0) return "None selected";
  const labels = effects
    .filter((e) => selected.has(e.id))
    .map((e) => e.label);
  if (labels.length === 1) return labels[0] ?? "1 selected";
  if (labels.length === 2) return `${labels[0]}, ${labels[1]}`;
  return `${selected.size} selected`;
}

export function PromotionEffectsDisclosure({
  effects,
  selectedEffects,
  onToggle,
  initiallyExpanded = false,
}: PromotionEffectsDisclosureProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  if (effects.length === 0) {
    return <p className="brief-muted">No effects listed yet.</p>;
  }

  return (
    <details
      className="brief-effects-drop"
      open={expanded}
      onToggle={(e) => setExpanded(e.currentTarget.open)}
    >
      <summary className="brief-effects-drop__summary">
        <span className="brief-effects-drop__summary-main">
          <span className="brief-effects-drop__title">Promotion effects</span>
          <span className="brief-effects-drop__meta">
            {selectionSummary(effects, selectedEffects)}
          </span>
        </span>
        <span className="brief-effects-drop__chevron" aria-hidden />
      </summary>
      <div className="brief-effects-drop__panel">
        <div className="brief-effects">
          {effects.map((fx) => {
            const checked = selectedEffects.has(fx.id);
            return (
              <label key={fx.id} className="brief-effect">
                <input
                  type="checkbox"
                  name="effects"
                  value={fx.id}
                  checked={checked}
                  onChange={() => onToggle(fx.id)}
                />
                <span>
                  <span className="brief-effect__label">{fx.label}</span>
                  {fx.description ? (
                    <p className="brief-effect__desc">{fx.description}</p>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </details>
  );
}
