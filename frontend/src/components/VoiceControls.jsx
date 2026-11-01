import {
  ArrowUpRight,
  Mic,
  Square,
  RotateCcw,
  VolumeX,
  Trash2,
  ShieldCheck,
} from "lucide-react";
export default function VoiceControls({
  input,
  setInput,
  busy,
  recognition,
  speech,
  onSend,
  onClear,
  onReplay,
  onCancel,
  hasAnswer,
  autoSpeak,
  setAutoSpeak,
}) {
  return (
    <div className="interaction">
      <form
        className={`composer ${recognition.listening ? "is-listening" : ""}`}
        onSubmit={(e) => {
          e.preventDefault();
          onSend(input);
        }}
      >
        <button
          type="button"
          className={`mic-button ${recognition.listening ? "active" : ""}`}
          disabled={busy || !recognition.supported}
          onClick={
            recognition.listening ? recognition.cancel : recognition.start
          }
          aria-label={
            recognition.listening ? "Cancel listening" : "Start listening"
          }
          title={
            recognition.supported
              ? "Ask with your voice"
              : "Speech recognition unavailable; use text input"
          }
        >
          {recognition.listening ? <Square size={20} /> : <Mic size={23} />}
        </button>
        <textarea
          aria-label="Message VoxAI"
          rows={1}
          maxLength={4000}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            recognition.listening
              ? "Listening to your question…"
              : "Ask anything, or tap the mic…"
          }
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              onSend(input);
            }
          }}
        />
        <button
          className="send-button"
          type="submit"
          disabled={!input.trim() || busy || recognition.listening}
          aria-label="Send message"
        >
          <ArrowUpRight size={25} strokeWidth={1.5} />
        </button>
      </form>
      <div className="composer-tools">
        <label className="auto-voice">
          <input
            type="checkbox"
            aria-label="Speak responses automatically"
            checked={autoSpeak}
            disabled={!speech.supported}
            onChange={(e) => setAutoSpeak(e.target.checked)}
          />
          <span className="switch" />
          Voice response
        </label>
        <div className="tool-actions">
          {busy && (
            <button onClick={onCancel}>
              <Square size={14} />
              Cancel response
            </button>
          )}
          <button onClick={speech.stop} disabled={!speech.speaking}>
            <VolumeX size={15} />
            Stop speaking
          </button>
          <button
            onClick={onReplay}
            disabled={
              !hasAnswer || busy || recognition.listening || !speech.supported
            }
          >
            <RotateCcw size={14} />
            Replay
          </button>
          <button onClick={onClear}>
            <Trash2 size={14} />
            Clear
          </button>
        </div>
      </div>
      <p className="privacy-note">
        <ShieldCheck size={13} />
        Local AI. Browser voice may use online services. Answers can be
        inaccurate.
      </p>
      {!recognition.supported && (
        <p className="support-note">
          Speech recognition is unavailable in this browser. Text chat works
          normally; try Chrome for voice input.
        </p>
      )}
      {!speech.supported && (
        <p className="support-note">
          Speech playback is unavailable in this browser. Read responses in the
          chat.
        </p>
      )}
    </div>
  );
}
