import { useEffect, useRef, useState } from "react";
import { AudioLines, Check, Copy, Volume2 } from "lucide-react";
import Markdown from "react-markdown";

export default function MessageBubble({ message, onReplay, canReplay }) {
  const assistant = message.role === "assistant";
  const [copyState, setCopyState] = useState("idle");
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopyState("idle"), 2200);
  }
  return (
    <article
      className={`message ${message.role} ${message.failed ? "failed" : ""}`}
      data-testid={`${message.role}-message`}
    >
      <div className="message-meta">
        {assistant ? (
          <span className="message-avatar">
            <AudioLines size={16} />
          </span>
        ) : null}
        <strong>{assistant ? "VoxAI" : "You"}</strong>
        <span>
          {assistant
            ? `${(message.elapsed_ms / 1000).toFixed(1)}s · ${message.mode}`
            : message.failed
              ? "No answer · try again"
              : "Just now"}
        </span>
      </div>
      <div className="message-content">
        {assistant ? (
          <Markdown>{message.content}</Markdown>
        ) : (
          <p>{message.content}</p>
        )}
      </div>
      {message.truncated && (
        <small className="warning-text">
          Length limit reached. Ask “Continue” or increase the limit in
          settings.
        </small>
      )}
      {assistant && (
        <div className="message-actions">
          <button onClick={copy} aria-label="Copy answer" title="Copy answer">
            {copyState === "copied" ? <Check size={15} /> : <Copy size={15} />}
          </button>
          <button
            onClick={() => onReplay(message.content)}
            disabled={!canReplay}
            aria-label="Read this answer aloud"
            title="Read aloud"
          >
            <Volume2 size={16} />
          </button>
          <span role="status">
            {copyState === "copied"
              ? "Copied"
              : copyState === "failed"
                ? "Could not copy. Select the text instead."
                : ""}
          </span>
        </div>
      )}
    </article>
  );
}
