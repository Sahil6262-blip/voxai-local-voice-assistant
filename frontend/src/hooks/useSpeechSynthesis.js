import { useEffect, useRef, useState } from "react";

function spokenText(text) {
  return text
    .replace(/```[\s\S]*?```/g, " Code is shown in the conversation. ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_`>]/g, "")
    .trim();
}
export function useSpeechSynthesis(onError) {
  const supported =
    "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  const [voices, setVoices] = useState([]);
  const [speaking, setSpeaking] = useState(false);
  const generation = useRef(0);
  const currentUtterance = useRef(null);
  const errorCallback = useRef(onError);
  errorCallback.current = onError;
  function stop() {
    generation.current += 1;
    if (supported) window.speechSynthesis.cancel();
    currentUtterance.current = null;
    setSpeaking(false);
  }
  function speak(text, { voiceURI, rate }) {
    stop();
    if (!supported) return;
    const cleaned = spokenText(text);
    if (!cleaned) return;
    const chunks = cleaned.match(/.{1,180}(?:\s|$)|\S{1,180}/g) || [cleaned];
    const token = generation.current;
    const voice =
      voices.find((v) => v.voiceURI === voiceURI) ||
      voices.find((v) => v.lang.startsWith("en") && v.localService) ||
      voices.find((v) => v.lang.startsWith("en"));
    let index = 0;
    setSpeaking(true);
    const next = () => {
      if (token !== generation.current) return;
      if (index >= chunks.length) {
        setSpeaking(false);
        currentUtterance.current = null;
        return;
      }
      const utterance = new SpeechSynthesisUtterance(chunks[index++]);
      currentUtterance.current = utterance;
      utterance.lang = voice?.lang || "en-US";
      utterance.voice = voice || null;
      utterance.rate = rate;
      utterance.onend = next;
      utterance.onerror = (event) => {
        if (token !== generation.current) return;
        setSpeaking(false);
        if (!["canceled", "interrupted"].includes(event.error))
          errorCallback.current(
            "Speech playback failed. Your answer is available in the chat. Try Replay or choose another voice.",
          );
      };
      window.speechSynthesis.speak(utterance);
    };
    next();
  }
  useEffect(() => {
    if (!supported) return;
    const update = () => setVoices(window.speechSynthesis.getVoices());
    update();
    window.speechSynthesis.addEventListener("voiceschanged", update);
    return () => {
      generation.current += 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.removeEventListener("voiceschanged", update);
    };
  }, [supported]);
  return { supported, voices, speaking, speak, stop };
}
