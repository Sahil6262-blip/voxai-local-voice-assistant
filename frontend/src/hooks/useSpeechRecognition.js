import { useEffect, useRef, useState } from "react";

const errors = {
  "not-allowed":
    "Microphone permission was denied. Allow microphone access in browser site settings, or type your question.",
  "service-not-allowed":
    "The browser speech service is unavailable. Type your question instead.",
  "audio-capture":
    "No microphone is available. Connect a microphone or use text input.",
  "no-speech": "No speech was detected. Try again or type your question.",
  network:
    "Speech recognition needs a network service in this browser. Check your connection or use text input.",
  "language-not-supported":
    "English recognition is unavailable in this browser. Please use text input.",
};

export function useSpeechRecognition({
  onTranscript,
  onSubmit,
  onError,
  beforeListen,
}) {
  const callbacks = useRef({});
  callbacks.current = { onTranscript, onSubmit, onError, beforeListen };
  const recognition = useRef(null);
  const timer = useRef(null);
  const [listening, setListening] = useState(false);
  const Recognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  function cancel() {
    clearTimeout(timer.current);
    const active = recognition.current;
    recognition.current = null;
    if (active) {
      active.onend = null;
      active.onresult = null;
      active.onerror = null;
      active.abort();
    }
    setListening(false);
  }
  function start() {
    if (!Recognition || recognition.current) return;
    callbacks.current.beforeListen();
    const active = new Recognition();
    recognition.current = active;
    active.lang = "en-US";
    active.continuous = false;
    active.interimResults = true;
    active.maxAlternatives = 1;
    let finalText = "";
    let failed = false;
    let submitted = false;
    active.onresult = (event) => {
      if (recognition.current !== active) return;
      let preview = "";
      finalText = "";
      for (let i = 0; i < event.results.length; i++) {
        preview += event.results[i][0].transcript;
        if (event.results[i].isFinal)
          finalText += event.results[i][0].transcript;
      }
      callbacks.current.onTranscript(preview.slice(0, 4000));
      if (finalText.trim()) active.stop();
    };
    active.onerror = (event) => {
      if (recognition.current !== active) return;
      failed = true;
      if (event.error !== "aborted")
        callbacks.current.onError(
          errors[event.error] ||
            "Speech recognition failed. Please try typing your question.",
        );
    };
    active.onend = () => {
      if (recognition.current !== active) return;
      clearTimeout(timer.current);
      recognition.current = null;
      setListening(false);
      if (!failed && finalText.trim() && !submitted) {
        submitted = true;
        callbacks.current.onSubmit(finalText.trim().slice(0, 4000));
      } else if (!failed && !finalText.trim())
        callbacks.current.onError(errors["no-speech"]);
    };
    try {
      active.start();
      setListening(true);
      timer.current = setTimeout(() => {
        if (recognition.current !== active) return;
        cancel();
        callbacks.current.onError(
          "Listening timed out. Try a shorter question or use text input.",
        );
      }, 30000);
    } catch {
      cancel();
      callbacks.current.onError(
        "Microphone could not start. Check browser permissions or type your question.",
      );
    }
  }
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      if (recognition.current) {
        recognition.current.onend = null;
        recognition.current.onresult = null;
        recognition.current.onerror = null;
        recognition.current.abort();
        recognition.current = null;
      }
    },
    [],
  );
  return { supported: Boolean(Recognition), listening, start, cancel };
}
