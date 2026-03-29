import { useState, useEffect, useRef } from "react";

interface SaveVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description: string) => void;
  isSaving: boolean;
  defaultTitle?: string;
}

export function SaveVideoModal({
  isOpen,
  onClose,
  onSave,
  isSaving,
  defaultTitle = "Promo Video",
}: SaveVideoModalProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(defaultTitle);
      setDescription("");
      // Focus input after modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, defaultTitle]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && !isSaving) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, isSaving]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title.trim(), description.trim());
  }

  return (
    <div
      className={`modal-overlay${isOpen ? " modal-overlay--open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-video-title"
    >
      <div className="modal">
        <button
          type="button"
          className="modal__close"
          onClick={onClose}
          disabled={isSaving}
          aria-label="Close"
        >
          &times;
        </button>

        <h2 id="save-video-title" className="modal__title">
          Save this video?
        </h2>
        <p className="modal__desc">
          Add this video to your dashboard for easy access later. Give it a name and optional description.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="video-title"
              style={{
                display: "block",
                fontFamily: "var(--font-sans)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--color-ink)",
                marginBottom: "0.35rem",
              }}
            >
              Title
            </label>
            <input
              ref={inputRef}
              id="video-title"
              type="text"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              disabled={isSaving}
              required
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              htmlFor="video-desc"
              style={{
                display: "block",
                fontFamily: "var(--font-sans)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--color-ink)",
                marginBottom: "0.35rem",
              }}
            >
              Description <span style={{ fontWeight: 400, color: "var(--color-ink-muted)" }}>(optional)</span>
            </label>
            <textarea
              id="video-desc"
              className="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes about this video..."
              disabled={isSaving}
              style={{ minHeight: "4rem" }}
            />
          </div>

          <div className="modal__actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Skip
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSaving || !title.trim()}
            >
              {isSaving ? "Saving..." : "Save video"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
