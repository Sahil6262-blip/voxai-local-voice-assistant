# VoxAI presentation — 10 slides, approximately 11 minutes

Replace the four name placeholders before presenting. Use screenshots of the actual application and the recorded results. Do not label the physical voice checklist or human scoring complete until the team has performed them.

| Slide | Speaker | Time | On-slide content | Speaker notes |
|---|---|---|---|---|
| 1. VoxAI | D | 0:25 | Intelligent Voice Assistant Powered by Generative AI; course; four real student names | Introduce the local model and the project's scope. |
| 2. Problem | D | 0:35 | Natural interaction; affordable local generation; visible AI concepts; reliable text fallback | The central problem is useful conversational generation; speech is an interface. |
| 3. Objectives and solution | D | 0:35 | Voice/text → generated answer → display/speech; three modes; session context | No paid API, no training a new model, no database. |
| 4. Technology stack | A | 0:45 | React/Vite; Web Speech APIs; FastAPI/Pydantic/HTTPX; Ollama/Qwen 2.5 3B | Separate the browser speech service from the local language model. |
| 5. System architecture | A | 0:55 | Show architecture diagram; health and chat endpoints; system + history + current question | Explain validation, bounded history, loopback and error translation. |
| 6. Generative AI and prompts | B | 2:00 | Tokens, autoregressive inference, role/instruction/context/constraints, three modes, temperature | Run Demo 2: same Transformer question, Clear between modes, fixed settings. Explain that style changes do not guarantee accuracy. |
| 7. Implemented features | C | 0:40 | Reactive orb, Markdown, mic fallback, replay/stop, settings, actual health | Use an actual screenshot; explain the state behind each animation. |
| 8. Live voice and context demos | C | 2:45 | Demo 1: Generative AI voice question; Demo 3: LSTM → RNN follow-up; live weather limitation | Allow about 75 seconds for voice and 90 for context/limits. Switch to text if speech service fails and disclose it. |
| 9. Evaluation, ethics and limits | D | 1:25 | 18/18 nonempty answers; 29 backend + 11 browser tests; privacy failure and retest; human scoring pending | Distinguish engineering success from correctness. Explain that 9 browser tests use controlled doubles. Mention remaining technical inaccuracies and manual voice checks. |
| 10. Conclusion and future scope | D, with one sentence each from A/B/C | 0:40 | Working local generative pipeline; lessons about prompting/context; future local STT, tokenizer budgeting, retrieval | State what is built and what remains future work. Invite questions. |

Total planned duration: 10 minutes 45 seconds; allow a small buffer for generation and transitions. Keep all terminals running before presenting. Use temperature 0.3 and 1,024 output tokens for Demo 2. Switch automatic voice off for the long mode comparison, then back on for Demo 1.

## Suggested visual assets

- Slide 5: render the Mermaid diagram from `architecture.md` or recreate it with labeled boxes in the presentation editor.
- Slide 7: take a real application screenshot with no private conversation visible.
- Slide 9: use the final three-mode comparison table in `evaluation/results_summary.md`. Preserve the caveat that different response lengths affect latency.

## Rehearsal and handoffs

Member A explains the `/api/chat` payload; Member B points out the actual role and mode strings in `prompts.py`; Member C operates the interface; Member D records limitations and assessment evidence. Rehearse the exact questions in `demo_scenarios.md`. Keep the README commands available if a terminal is closed. Do not edit code during the demonstration.

If asked whether everything is private/offline, say: “The language-model inference is local. Browser recognition may use an external service; typed interaction is the offline-capable path after installation.” If an answer is factually wrong, identify it as a model limitation and show how the evaluation rubric captures it.
