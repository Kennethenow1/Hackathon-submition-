/** Primary action to mark a brief step done (closes panel + triggers flow animation in parent). */

type BriefStepFooterProps = {
  complete: boolean;
  onComplete: () => void;
};

export function BriefStepFooter({ complete, onComplete }: BriefStepFooterProps) {
  if (complete) {
    return (
      <div className="brief-section__footer brief-section__footer--done">
        <span className="brief-section__footer-check" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8L6.5 11.5L13 4.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span>Step complete</span>
      </div>
    );
  }

  return (
    <div className="brief-section__footer">
      <button type="button" className="brief-step-complete-btn" onClick={onComplete}>
        <span className="brief-step-complete-btn__icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle
              cx="10"
              cy="10"
              r="8.25"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M6 10.2L8.8 13L14 7"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        Mark step complete
      </button>
    </div>
  );
}
