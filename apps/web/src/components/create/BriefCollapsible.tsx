import { useId, useState, type ReactNode } from "react";

export type BriefCollapsibleProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  /** Step finished — palette accent on the header */
  complete?: boolean;
  defaultOpen?: boolean;
  /** When set, component is controlled */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Footer pinned below content (e.g. “Mark step complete”) */
  footer?: ReactNode;
  children: ReactNode;
};

export function BriefCollapsible({
  title,
  subtitle,
  badge,
  complete = false,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  footer,
  children,
}: BriefCollapsibleProps) {
  const panelId = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  function setOpen(next: boolean) {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  const showBadge = badge ?? (complete ? "Done" : undefined);

  return (
    <section
      className={
        "brief-section" +
        (open ? " brief-section--open" : "") +
        (complete ? " brief-section--complete" : "")
      }
    >
      <button
        type="button"
        className="brief-section__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
      >
        <span
          className={
            "brief-section__chevron" +
            (complete && !open ? " brief-section__chevron--done" : "")
          }
          aria-hidden="true"
        >
          {complete && !open ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2.5 7L5.5 10L11.5 3.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M4.5 2.5L8 6L4.5 9.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span className="brief-section__headings">
          <span className="brief-section__title">{title}</span>
          {subtitle ? (
            <span className="brief-section__subtitle">{subtitle}</span>
          ) : null}
        </span>
        {showBadge ? (
          <span
            className={
              "brief-section__badge" +
              (complete ? " brief-section__badge--complete" : "")
            }
          >
            {showBadge}
          </span>
        ) : null}
      </button>
      <div id={panelId} className="brief-section__panel" aria-hidden={!open}>
        <div className="brief-section__panel-inner">
          {children}
          {footer ? (
            <div className="brief-section__footer-slot">{footer}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
