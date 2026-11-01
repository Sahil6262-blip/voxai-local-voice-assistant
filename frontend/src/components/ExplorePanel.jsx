import { useEffect, useRef } from "react";
import { ArrowUpRight, Compass, X } from "lucide-react";
import { starters } from "./PromptShelf";

export default function ExplorePanel({ open, onClose, onPrompt, disabled }) {
  const dialog = useRef(null);
  useEffect(() => {
    if (open) dialog.current.showModal();
    else dialog.current.close();
  }, [open]);
  return (
    <dialog
      ref={dialog}
      className="settings-dialog explore-dialog"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
      aria-labelledby="explore-title"
    >
      <div className="settings-heading">
        <Compass size={22} />
        <h2 id="explore-title">Where shall we start?</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close explore"
        >
          <X size={19} />
        </button>
      </div>
      <p className="muted">
        A question is all it takes. Pick one and make it your own.
      </p>
      <div className="explore-list">
        {starters.map(({ Icon, title, prompt }) => (
          <button
            key={title}
            disabled={disabled}
            onClick={() => {
              onClose();
              onPrompt(prompt);
            }}
          >
            <Icon size={23} />
            <span>
              <small>{title}</small>
              <strong>{prompt}</strong>
            </span>
            <ArrowUpRight size={18} />
          </button>
        ))}
      </div>
    </dialog>
  );
}
