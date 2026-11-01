import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Box,
  Code2,
  Compass,
  Home,
  MessageSquare,
  Mic,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import StatusIndicator from "./components/StatusIndicator";
import PromptShelf from "./components/PromptShelf";
import ExplorePanel from "./components/ExplorePanel";
import Header from "./components/Header";
import VoiceOrb from "./components/VoiceOrb";
import ChatPanel from "./components/ChatPanel";
import VoiceControls from "./components/VoiceControls";
import SettingsPanel from "./components/SettingsPanel";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "./hooks/useSpeechSynthesis";
import { getHealth, sendChat } from "./services/api";

const modes = [
  {
    key: "concise",
    title: "Concise",
    detail: "A little less, said well",
    Icon: Sparkles,
  },
  {
    key: "educational",
    title: "Educational",
    detail: "Learn, one step at a time",
    Icon: BookOpen,
  },
  {
    key: "technical",
    title: "Technical",
    detail: "Get into the details",
    Icon: Code2,
  },
];
const initialSettings = {
  mode: "concise",
  temperature: 0.5,
  max_tokens: 512,
  voiceURI: "",
  rate: 1,
};

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [health, setHealth] = useState(null);
  const [checking, setChecking] = useState(false);
  const [settings, setSettings] = useState(initialSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [view, setView] = useState("home");
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("voxai-theme") === "evening"
        ? "evening"
        : "light";
    } catch {
      return "light";
    }
  });
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("voxai-theme", theme);
    } catch {
      /* optional preference storage */
    }
  }, [theme]);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const autoSpeakRef = useRef(autoSpeak);
  autoSpeakRef.current = autoSpeak;
  const request = useRef(null);
  const history = useRef([]);
  const healthRequest = useRef(null);
  const speech = useSpeechSynthesis(setError);
  const recognition = useSpeechRecognition({
    onTranscript: setInput,
    onSubmit: (text) => send(text, true),
    onError: setError,
    beforeListen: () => {
      speech.stop();
      setError("");
    },
  });
  const checkHealth = useCallback(async () => {
    if (healthRequest.current) return;
    const controller = new AbortController();
    healthRequest.current = controller;
    setChecking(true);
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const result = await getHealth(controller.signal);
      if (healthRequest.current === controller) setHealth(result);
    } catch (e) {
      if (healthRequest.current === controller)
        setHealth({
          status: "offline",
          error:
            e.name === "AbortError"
              ? "Connection check timed out. Check that FastAPI and Ollama are running."
              : e.message,
        });
    } finally {
      clearTimeout(timer);
      if (healthRequest.current === controller) {
        healthRequest.current = null;
        setChecking(false);
      }
    }
  }, []);
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 20000);
    return () => {
      clearInterval(interval);
      healthRequest.current?.abort();
      healthRequest.current = null;
      request.current?.abort();
    };
  }, [checkHealth]);

  async function send(raw, fromVoice = false) {
    const message = raw.trim();
    if (
      !message ||
      message.length > 4000 ||
      request.current ||
      (recognition.listening && !fromVoice)
    )
      return;
    setView((current) => (current === "voice" ? "home" : current));
    recognition.cancel();
    speech.stop();
    setError("");
    setInput("");
    const controller = new AbortController();
    request.current = controller;
    const userId = crypto.randomUUID();
    setBusy(true);
    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", content: message },
    ]);
    const timer = setTimeout(() => controller.abort(), 190000);
    try {
      const result = await sendChat(
        {
          message,
          history: history.current.slice(-12),
          mode: settings.mode,
          settings: {
            temperature: settings.temperature,
            max_tokens: settings.max_tokens,
          },
        },
        controller.signal,
      );
      if (request.current !== controller) return;
      const answer = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.answer,
        mode: settings.mode,
        ...result,
      };
      history.current = [
        ...history.current,
        { role: "user", content: message },
        { role: "assistant", content: result.answer },
      ].slice(-12);
      setMessages((prev) => [...prev, answer]);
      if (autoSpeakRef.current) speech.speak(result.answer, settings);
    } catch (e) {
      if (request.current !== controller) return;
      setError(
        controller.signal.aborted
          ? "Response timed out. The local model may still be loading. Try a shorter question."
          : e.message,
      );
      setMessages((prev) =>
        prev.map((m) => (m.id === userId ? { ...m, failed: true } : m)),
      );
      setInput((current) => current || message);
      checkHealth();
    } finally {
      clearTimeout(timer);
      if (request.current === controller) {
        request.current = null;
        setBusy(false);
      }
    }
  }
  function cancelResponse() {
    request.current?.abort();
    request.current = null;
    setBusy(false);
    setMessages((prev) =>
      prev.map((m, i) =>
        i === prev.length - 1 && m.role === "user" ? { ...m, failed: true } : m,
      ),
    );
  }
  function clear() {
    cancelResponse();
    recognition.cancel();
    speech.stop();
    history.current = [];
    setMessages([]);
    setInput("");
    setError("");
  }
  const latestAnswer = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");
  const state = recognition.listening
    ? "listening"
    : busy
      ? "thinking"
      : speech.speaking
        ? "speaking"
        : error || (health && health.status !== "connected")
          ? "error"
          : "idle";
  const greeting =
    now.getHours() < 12
      ? "Good morning."
      : now.getHours() < 17
        ? "Good afternoon."
        : "Good evening.";
  const replay = (text) => speech.speak(text, settings);
  const orbAction = () => {
    if (recognition.listening) recognition.cancel();
    else if (busy) cancelResponse();
    else if (speech.speaking) speech.stop();
    else recognition.start();
  };
  const navigate = (next) => {
    setView(next);
    if (next === "conversation")
      requestAnimationFrame(() =>
        document.getElementById("conversation-panel")?.focus(),
      );
  };

  return (
    <div className={`app-shell theme-${theme} view-${view}`}>
      <div className="studio-backdrop" aria-hidden="true" />
      <div className="studio-wash" aria-hidden="true" />
      <a className="skip-link" href="#main">
        Skip to assistant
      </a>
      <aside className="sidebar">
        <a
          className="brand"
          href="#main"
          onClick={() => setView("home")}
          aria-label="VoxAI home"
        >
          <span className="brand-wave" aria-hidden="true">
            {[17, 32, 46, 30, 16].map((height, i) => (
              <i key={i} style={{ height }} />
            ))}
          </span>
          <strong>
            VOXAI<span>✳</span>
          </strong>
          <small>Your voice companion</small>
        </a>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <button
            className={view === "home" ? "nav-selected" : ""}
            onClick={() => navigate("home")}
            aria-label="Home"
            aria-current={view === "home" ? "page" : undefined}
          >
            <Home size={21} strokeWidth={1.5} />
            <span>Home</span>
            <span className="nav-dot" />
          </button>
          <button
            className={view === "voice" ? "nav-selected" : ""}
            onClick={() => navigate("voice")}
            aria-label="Voice space"
            aria-current={view === "voice" ? "page" : undefined}
          >
            <Mic size={21} strokeWidth={1.5} />
            <span>Voice space</span>
            <span className="nav-dot" />
          </button>
          <button
            className={view === "conversation" ? "nav-selected" : ""}
            onClick={() => navigate("conversation")}
            aria-label="Conversation"
            aria-current={view === "conversation" ? "page" : undefined}
          >
            <MessageSquare size={21} strokeWidth={1.5} />
            <span>Conversation</span>
            <span className="nav-dot" />
          </button>
          <button onClick={() => setExploreOpen(true)} aria-label="Explore">
            <Compass size={21} strokeWidth={1.5} />
            <span>Explore</span>
            <ArrowUpRight size={13} className="nav-external" />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Open settings"
          >
            <SlidersHorizontal size={21} strokeWidth={1.5} />
            <span>Settings</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="local-card">
            <Box size={25} strokeWidth={1.2} />
            <span>
              Local model<small>Qwen 2.5 · 3B</small>
            </span>
          </div>
          <StatusIndicator
            health={health}
            checking={checking}
            onRefresh={checkHealth}
          />
        </div>
      </aside>
      <main id="main" className="main-panel">
        <Header
          health={health}
          theme={theme}
          onTheme={() =>
            setTheme((current) => (current === "light" ? "evening" : "light"))
          }
        />
        <div className="workspace">
          <section className="voice-workspace">
            <div className="welcome">
              <p className="date-line">
                {new Intl.DateTimeFormat("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                }).format(now)}
                <span className="date-line-rule" />
              </p>
              <h1>
                {greeting}
                <br />
                What's on <em>your mind?</em>
              </h1>
            </div>
            <VoiceOrb
              state={state}
              onAction={orbAction}
              disabled={busy || !recognition.supported}
              focus={view === "voice"}
            />
          </section>
          <section
            className="conversation-panel"
            id="conversation-panel"
            tabIndex={-1}
            aria-label="Your conversation"
          >
            <ChatPanel
              messages={messages}
              busy={busy}
              onNew={clear}
              onReplay={replay}
              canReplay={!busy && !recognition.listening && speech.supported}
            />
            <div className="mode-section">
              <div className="mode-heading">
                <h3>Response mode</h3>
              </div>
              <div
                className="mode-options"
                role="group"
                aria-label="Response style"
              >
                {modes.map(({ key, title, detail, Icon }) => (
                  <button
                    key={key}
                    className={`mode-card ${settings.mode === key ? "selected" : ""}`}
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, mode: key }))
                    }
                    aria-pressed={settings.mode === key}
                    aria-label={`${title} ${detail}`}
                    title={detail}
                  >
                    <Icon size={16} strokeWidth={1.5} />
                    <span>{title}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
        <div className="bottom-dock">
          <div className="feedback-area">
            {health && health.status !== "connected" && (
              <div className="connection-alert" role="status">
                <span>
                  {health.error ||
                    "Start Ollama and ensure qwen2.5:3b is installed."}
                </span>
                <button onClick={checkHealth} disabled={checking}>
                  Retry connection
                </button>
              </div>
            )}
            {error && (
              <div className="error-alert" role="alert">
                <span>{error}</span>
                <button
                  className="icon-button"
                  onClick={() => setError("")}
                  aria-label="Dismiss error"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
          <VoiceControls
            input={input}
            setInput={setInput}
            busy={busy}
            recognition={recognition}
            speech={speech}
            onSend={send}
            onClear={clear}
            onReplay={() => {
              if (latestAnswer) replay(latestAnswer.content);
            }}
            onCancel={cancelResponse}
            hasAnswer={Boolean(latestAnswer)}
            autoSpeak={autoSpeak}
            setAutoSpeak={(value) => {
              setAutoSpeak(value);
              if (!value) speech.stop();
            }}
          />
          <PromptShelf
            onPrompt={send}
            disabled={busy || recognition.listening}
          />
        </div>
      </main>
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onChange={setSettings}
        voices={speech.voices}
      />
      <ExplorePanel
        open={exploreOpen}
        onClose={() => setExploreOpen(false)}
        onPrompt={send}
        disabled={busy || recognition.listening}
      />
    </div>
  );
}
