import { useEffect, useRef } from "react";
import { AudioLines, MessageCircle, Plus } from "lucide-react";
import MessageBubble from "./MessageBubble";

export default function ChatPanel({
  messages,
  busy,
  onNew,
  onReplay,
  canReplay,
}) {
  const scroll = useRef(null);
  useEffect(() => {
    const node = scroll.current;
    if (node)
      node.scrollTo({
        top: node.scrollHeight,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  }, [messages, busy]);
  return (
    <>
      <div className="conversation-heading">
        <div>
          <MessageCircle size={19} strokeWidth={1.5} />
          <h2>Conversation</h2>
        </div>
        <button
          className="icon-button"
          onClick={onNew}
          aria-label="New conversation"
          title="Start fresh"
        >
          <Plus size={18} />
        </button>
      </div>
      <div
        ref={scroll}
        className="chat-scroll"
        role="log"
        aria-label="Conversation"
        aria-live="polite"
      >
        {!messages.length ? (
          <div className="empty-state">
            <div className="empty-symbol" aria-hidden="true">
              <AudioLines size={28} strokeWidth={1.25} />
              <span />
              <span />
            </div>
            <h3>Start a conversation.</h3>
            <p>Type below or use your voice.</p>
          </div>
        ) : (
          <div className="messages">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onReplay={onReplay}
                canReplay={canReplay}
              />
            ))}
            {busy && (
              <div className="thinking-line" role="status">
                <span className="loading-dots">
                  <i />
                  <i />
                  <i />
                </span>
                <span>
                  Thinking it through…
                  <small>
                    First responses may take longer while the model loads.
                  </small>
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
