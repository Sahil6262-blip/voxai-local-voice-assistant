# Three live demonstrations

## Before the presentation

1. Start Ollama, backend and frontend using the README. Use Chrome at `http://localhost:5173` on the laptop. Confirm the real **Local model connected** indicator.
2. Ask a short typed question to load the model. Clear afterward. The first generation may be slower.
3. Open Settings. Choose an English device voice, speed 1.0, temperature 0.3 and 1,024 response tokens for comparisons. Close Settings.
4. Verify the microphone permission and speaker volume with a rehearsal. Browser recognition may require internet; have a typed fallback ready. Do not assert offline voice capability.
5. Use Clear between independent demonstrations. Do not close the tab during the context demonstration.

## Demo 1 — voice conversation (Member C, about 90 seconds)

Select Concise. Enable Voice response. Click the microphone and allow permission. Say **“What is Generative AI?”** and pause. The input shows the transcript, the orb changes from Listening to Thinking, and an actual Qwen response appears and is spoken. Click Stop speaking, then Replay. Explain that the browser performs speech conversion while the local LLM generates the answer.

If recognition fails, read the visible error and type the same question; this is the designed fallback, not a successful voice test. If automatic playback is blocked, click Replay after interacting with the page. Never play a prerecorded model answer as if it were live.

## Demo 2 — educational prompting (Member B, about 2 minutes)

Enter **“Explain the Transformer architecture.”** in Concise mode. Point out its compact answer. Clear, select Educational, and repeat the exact prompt. Look for a definition, steps, and an example. Clear, select Technical, and repeat again. Look for mechanisms, terminology and limitations. Keep temperature and response token limit unchanged to isolate the instruction change. Turn voice off during this comparison if reading long responses would consume presentation time.

Explain the difference between role, instruction, constraints and supplied context. The mode selects different system instructions, not a different model. Style is not guaranteed, and detailed output can contain factual mistakes. If the length warning appears, increase the output limit or ask “Continue”; do not hide the truncation.

## Demo 3 — context and limitations (Members C and D, about 2 minutes)

Clear and choose Educational or Concise. Ask **“What is an LSTM?”** Then, without clearing, ask **“How is it different from an RNN?”** Explain how the previous pair lets the model resolve “it.” The API response's `context_messages` can be inspected in browser Network tools if the examiner wants evidence.

Next ask **“What is the live weather in Mumbai right now?”** The assistant should acknowledge unavailable live information. Also try **“Is everything I say through the microphone completely offline?”** Discuss the recorded initial hallucination and the subsequent explicit privacy instruction. These prompts test limitations; unexpected answers should be discussed honestly.

Finally Clear. Ask **“What subject was I talking about?”** There should be no supplied prior context. An unsupported guess is a model limitation, not evidence that the app retained memory.

## Manual voice acceptance checklist

Use a normal visible browser and the real microphone/speakers. Record date, browser version and result in `evaluation/manual_checks.csv`.

- Grant permission, speak the Demo 1 question, and verify **one** displayed user message and **one** network chat request.
- Click Cancel listening while speaking; verify no request is submitted. Text may remain as an editable draft.
- Deny mic permission in site settings, retry, and verify the message and working text fallback. Re-enable permission afterward.
- Start listening and remain silent; verify no-speech or the 30-second timeout, then retry.
- Enable automatic speech, submit a question and listen. Stop during playback, then Replay. Check that old and new speech never overlap.
- Change voice and speed; Replay and verify an audible change. Different installed voices may sound similar.
- Start listening during playback; playback should stop before recognition begins.
- Disconnect internet after dependencies/model are installed; typed chat should still work while both local servers run. Recognition may fail and must remain optional. Reconnect afterward.
- Check Firefox or another browser without recognition and verify the disabled microphone plus usable typed chat. Availability is runtime-detected, not assumed.

Physical microphone capture, actual recognition service availability and audible speaker quality cannot be established by the simulated browser tests; complete this checklist before claiming those acceptance criteria passed.
