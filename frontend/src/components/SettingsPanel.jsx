import { useEffect, useRef } from "react";
import { X, SlidersHorizontal } from "lucide-react";
export default function SettingsPanel({
  open,
  onClose,
  settings,
  onChange,
  voices,
}) {
  const dialog = useRef(null);
  useEffect(() => {
    if (open) dialog.current.showModal();
    else dialog.current.close();
  }, [open]);
  const set = (key, value) => onChange({ ...settings, [key]: value });
  return (
    <dialog
      ref={dialog}
      className="settings-dialog"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === dialog.current) onClose();
      }}
      aria-labelledby="settings-title"
    >
      <div className="settings-heading">
        <SlidersHorizontal size={22} />
        <h2 id="settings-title">Settings</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close settings"
        >
          <X size={20} />
        </button>
      </div>
      <p className="muted">Changes apply to your next response.</p>
      <label>
        Response mode
        <select
          value={settings.mode}
          onChange={(e) => set("mode", e.target.value)}
        >
          <option value="concise">Concise — short and conversational</option>
          <option value="educational">Educational — steps and examples</option>
          <option value="technical">
            Technical — mechanisms and tradeoffs
          </option>
        </select>
      </label>
      <label>
        Temperature <strong>{settings.temperature.toFixed(1)}</strong>
        <input
          type="range"
          min="0"
          max="1.5"
          step="0.1"
          value={settings.temperature}
          onChange={(e) => set("temperature", Number(e.target.value))}
        />
        <small>
          Lower is more predictable; higher increases variation. Neither
          guarantees accuracy.
        </small>
      </label>
      <label>
        Maximum response tokens
        <select
          value={settings.max_tokens}
          onChange={(e) => set("max_tokens", Number(e.target.value))}
        >
          <option value={256}>256 · Short</option>
          <option value={512}>512 · Balanced</option>
          <option value={1024}>1024 · Detailed</option>
          <option value={1536}>1536 · Extended</option>
        </select>
      </label>
      <label>
        Speaking voice
        <select
          value={settings.voiceURI}
          onChange={(e) => set("voiceURI", e.target.value)}
        >
          <option value="">Automatic English voice</option>
          {voices.map((v) => (
            <option value={v.voiceURI} key={v.voiceURI}>
              {v.name} ({v.lang}){v.localService ? " · device" : " · online"}
            </option>
          ))}
        </select>
      </label>
      <label>
        Speech speed <strong>{settings.rate.toFixed(1)}×</strong>
        <input
          type="range"
          min="0.6"
          max="1.5"
          step="0.1"
          value={settings.rate}
          onChange={(e) => set("rate", Number(e.target.value))}
        />
      </label>
      <div className="settings-note">
        Conversation memory lasts only for this tab session. Clear removes the
        displayed conversation and the context sent with your next question.
      </div>
      <button className="primary-button" onClick={onClose}>
        Done
      </button>
    </dialog>
  );
}
