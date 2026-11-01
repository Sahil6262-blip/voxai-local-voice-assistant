export default function StatusIndicator({ health, checking, onRefresh }) {
  const state = health?.status || "connecting";
  return (
    <button
      className={`connection ${state}`}
      onClick={onRefresh}
      disabled={checking}
      title="Check backend and Ollama connection"
      aria-label="Refresh connection status"
    >
      <span className="status-dot" />
      {checking
        ? "Checking connection"
        : {
            connected: "Local model connected",
            offline: "Connection offline",
            error: "Connection error",
            connecting: "Connecting",
          }[state]}
    </button>
  );
}
