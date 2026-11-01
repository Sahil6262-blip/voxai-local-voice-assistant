# Four-member contribution and review plan

This is a proposed division of ownership for **exactly four students**. It does not claim that named students authored the generated implementation. Replace placeholders with actual names and record each person's completed review, experiments, fixes, and presentation work.

| Member | Name | Ownership | Evidence to produce | Speaking section |
|---|---|---|---|---|
| A | [Member A name] | Backend and LLM integration: FastAPI, Ollama health/chat, validation, failure handling, backend tests | Walk through `backend/`; run 29 tests; capture health and live response; explain error mapping | Slides 4–5, API questions |
| B | [Member B name] | Prompt engineering: system role, three modes, history boundaries, prompt comparison | Review `prompts.py` and `bounded_history`; compare identical prompts; explain the privacy prompt revision | Slide 6, Demo 2 |
| C | [Member C name] | React interface, orb states, microphone and synthesis, three demo flows | Run frontend build/browser tests; complete physical voice checklist; demonstrate responsive controls | Slides 7–8, Demos 1 and 3 |
| D | [Member D name] | Evaluation, hallucination review, results, report, presentation | Run evaluator; independently score outputs against sources; document results honestly; finalize report | Slides 1–3 and 9–10 |

## Individual review record

Each student should add dated entries below, describing work actually performed, commands run, problems found, and changes made. Use Git commits, screenshots, evaluation annotations, or rehearsal notes as evidence. Do not replace this record with a claim of equal authorship without supporting work.

| Member | Date | Work actually completed | Artifact or commit | Peer review |
|---|---|---|---|---|
| A | | | | |
| B | | | | |
| C | | | | |
| D | | | | |

All four members should rehearse the complete data flow, distinguish local inference from potentially online speech, and be able to explain why the project performs inference rather than training.
