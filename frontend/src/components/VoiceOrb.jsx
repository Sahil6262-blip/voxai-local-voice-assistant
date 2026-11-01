import { Mic, Square } from "lucide-react";

const labels = {
  idle: "Ready to listen",
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Speaking…",
  error: "Check connection",
};

export default function VoiceOrb({ state, onAction, disabled, focus }) {
  const title = labels[state];
  const active = ["listening", "thinking", "speaking"].includes(state);
  return (
    <section
      className={`orb-scene ${state} ${focus ? "focused" : ""}`}
      aria-label="Voice assistant"
    >
      <div className="orb-visual" aria-hidden="true">
        <div className="orb-aura" />
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="orb-float">
          <div className="orb">
            <div className="orb-rim" />
            <div className="orb-surface" />
            <div className="orb-highlight" />
            <div className="waveform">
              {[8, 20, 36, 55, 77, 53, 35, 20, 8].map((height, i) => (
                <i
                  key={i}
                  style={{ "--bar-height": `${height}px`, "--i": i }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="orb-floor" />
      </div>
      <div className="orb-caption" role="status">
        <h2>{title}</h2>
      </div>
      <button
        className={`orb-action ${active ? "is-active" : ""}`}
        onClick={onAction}
        disabled={disabled && !active}
        aria-label={active ? "End voice session" : "Talk to VoxAI"}
      >
        {active ? <Square size={12} fill="currentColor" /> : <Mic size={15} />}
        {state === "thinking" ? "Cancel" : active ? "Stop" : "Let's talk"}
      </button>
    </section>
  );
}
