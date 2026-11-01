# VoxAI — Intelligent Voice Assistant Powered by Generative AI

A working local voice and text companion built with React, Vite, FastAPI and your installed Ollama `qwen2.5:3b` model. It includes an animated state orb, safe Markdown/code display, three response modes, session context, real connection health, browser speech recognition, voice selection/speed, replay/stop, and graceful text fallback. No account, paid API, database, or additional model is required.

**Privacy:** LLM inference uses local Ollama. Browser speech recognition may send audio to an external service and need internet. Some synthesis voices also use online services. Typed chat can operate offline after installation. Model answers can be wrong; the evaluation preserves a real privacy hallucination and its retest.

## Quick start in Windows PowerShell

The project is already installed in `D:\AI_OE`, including `.venv` and frontend dependencies. Use the two **start** commands below in separate terminals. The installation commands are included so another student can reproduce the project.

### 1. Check Ollama

```powershell
Set-Location D:\AI_OE
ollama --version
ollama list
Invoke-RestMethod http://127.0.0.1:11434/api/tags
```

Confirm `qwen2.5:3b` appears. If Ollama is not running, open its installed Windows application, or run `ollama serve` in a separate terminal. If port 11434 is already bound by Ollama, do not start a second server. The model is already installed on this machine; no download was performed. Only on another machine where `ollama list` proves it missing, run `ollama pull qwen2.5:3b`.

### 2. Install backend (first time on another checkout)

Python 3.11+ is recommended; this checkout was tested with 3.12.5.

```powershell
Set-Location D:\AI_OE
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend\requirements-lock.txt
```

The lock file records the successfully installed versions. `backend/requirements.txt` expresses compatible version ranges for deliberate dependency updates. The application uses defaults without a `.env` file. For customization, copy `backend/.env.example` to `backend/.env` and edit it; restart FastAPI after changes. Keep the loopback URL and local origins for this demo.

Optional virtual environment activation:

```powershell
.\.venv\Scripts\Activate.ps1
```

Activation is not required when using the explicit interpreter paths below. No execution-policy change is necessary.

### 3. Start backend — terminal one

```powershell
Set-Location D:\AI_OE
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

Run from the project root, not `backend/`, because imports use the backend package. Add `--reload` if actively editing Python. API documentation: <http://127.0.0.1:8000/docs>. Health: <http://127.0.0.1:8000/api/health>.

### 4. Start frontend — terminal two

Use Node.js compatible with Vite: 20.19+, 22.12+, or a supported newer release. This checkout was tested with Node 25.3.0 and npm 11.19.1.

```powershell
Set-Location D:\AI_OE\frontend
npm.cmd ci
npm.cmd run dev
```

`npm.cmd ci` is only needed for first installation or a changed lock file; subsequent runs need just `npm.cmd run dev`. Open **<http://localhost:5173>** or <http://127.0.0.1:5173>. Vite proxies API requests to FastAPI. Both servers must remain running. Stop them with Ctrl+C when finished.

## Use the app

- Type a question and press Enter or Send. Shift+Enter inserts a newline. Questions are limited to 4,000 characters.
- Click the microphone, grant permission and speak. Interim text appears; a final transcript is submitted once recognition ends. Click the microphone again to cancel.
- Switch between Concise, Educational and Technical in the sidebar or Settings. These change backend instructions, not the model.
- Use Voice response, Stop speaking and Replay. Settings offers installed voices, speed, temperature and output length. Code blocks are displayed rather than read character by character.
- Clear/New conversation cancels the current wait, stops voice and resets context. Only recent successful turns are sent to Qwen; no long-term memory is claimed.
- Click the status label to refresh connectivity. “Connected” requires FastAPI, Ollama and the model to be available.
- Cancel response discards the pending reply, but Ollama may continue computing until its generation finishes. Avoid repeatedly starting expensive requests.

## Verified results and remaining checks

Development verification on 29 October 2026:

| Check | Observed result |
|---|---|
| Backend automated tests | 29 passed |
| Browser tests in installed Chrome | 11 passed: 2 real Ollama tests and 9 controlled browser-contract tests |
| Text chat end to end | Actual Qwen answer rendered in React |
| Context and Clear | Actual follow-up recalled supplied codename; next request after Clear sent zero context messages |
| Frontend production build | Passed |
| Python dependencies | `pip check` passed |
| npm dependency audit | No vulnerabilities reported at installation; see final verification record |
| Real evaluation | 18/18 nonempty successful responses in each of the initial and revised concise runs |
| Final three-mode comparison | Three real outputs recorded; no output truncation at 1,024 tokens |
| Layout | Chrome screenshots and no horizontal overflow at 1440, 820 and 390 pixels |
| Physical mic and audible playback | **Not verified**; complete the manual checklist before the live presentation |
| Internet physically disconnected | **Not verified**; local-only text path is implemented |

Automated speech tests inject browser API test doubles to exercise permission errors, final events, cancellation, replay and unsupported features. They do not prove that a real microphone, recognition service or speaker works. Human rubric scores remain blank. Longer model outputs still contain inaccuracies and sometimes ignore suggested word lengths; see [evaluation results](evaluation/results_summary.md).

## Run checks

With the backend and Vite running for browser tests:

```powershell
Set-Location D:\AI_OE
.\.venv\Scripts\python.exe -m pytest backend\tests -q
.\.venv\Scripts\python.exe -m pip check
.\.venv\Scripts\python.exe evaluation\run_evaluation.py --output my_results.csv
Set-Location frontend
npm.cmd run build
npm.cmd test
npm.cmd audit
```

Playwright uses the installed Chrome channel; no browser was downloaded during development. On a machine without Chrome, install it or change `channel` in `playwright.config.js` to `msedge` if Edge is installed. For testing the production bundle locally, stop Vite development first and run `npm.cmd run preview`; FastAPI must remain running. The static `dist/` folder alone has no Python backend.

## Three demonstrations

1. **Voice:** Concise mode → microphone → “What is Generative AI?” → observe transcript, generated answer, speech, Stop and Replay.
2. **Prompt modes:** Clear between runs and ask “Explain the Transformer architecture.” in Concise, Educational and Technical. Keep temperature and response limit constant; use 1,024 tokens for this comparison.
3. **Context and limits:** Ask “What is an LSTM?” then “How is it different from an RNN?” without clearing. Next ask for live Mumbai weather and discuss the absence of real-time access.

The [full demo and manual verification guide](docs/demo_scenarios.md) gives exact steps, fallback behavior and rehearsal checks.

## Project structure

```text
AI_OE/
  backend/
    main.py                 FastAPI routes, lifespan and CORS
    ollama_client.py        Local inference, health and history bounds
    schemas.py              Request/response validation
    prompts.py              System role and three response modes
    requirements.txt        Dependency ranges
    requirements-lock.txt   Tested dependency versions
    .env.example
    tests/test_api.py
  frontend/
    src/
      components/           Header, orb, messages, settings and controls
      hooks/                Recognition and synthesis adapters
      services/api.js
      App.jsx
      main.jsx
      index.css
    public/favicon.svg
    tests/                  Real integration and controlled browser tests
    scripts/inspect.mjs     Local screenshot/chat diagnostic
    index.html
    package.json
    package-lock.json
    vite.config.js
    playwright.config.js
  evaluation/
    test_cases.csv          18 cases and blank human scoring fields
    manual_checks.csv       Real device checklist
    run_evaluation.py
    evaluation_guide.md
    results*.csv            Actual initial/revised runs
    mode_comparison*.csv    Actual comparison outputs
    results_summary.md
  docs/
    architecture.md
    syllabus_mapping.md
    team_contributions.md
    demo_scenarios.md
    presentation_outline.md
    report_draft.md
    viva.md
  README.md
  .gitignore
```

Generated `.venv/`, `node_modules/`, `dist/` and test screenshots are ignored. Academic outputs are editable Markdown/CSV. The [report draft](docs/report_draft.md), [10-slide presentation](docs/presentation_outline.md), [viva answers](docs/viva.md), [four-member ownership plan](docs/team_contributions.md), and [syllabus mapping](docs/syllabus_mapping.md) are ready for team review. Replace names only with real contributors; do not invent completed student work.

## Troubleshooting

| Problem | Action |
|---|---|
| PowerShell blocks activation or `npm.ps1` | Use the explicit `.venv\Scripts\python.exe` path and `npm.cmd`. If desired, `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` affects only the current terminal; no machine-wide change is needed. |
| Python missing / Store alias | Try `py -3 --version` and `py -3 -m venv .venv`; otherwise install Python and reopen VS Code. |
| npm missing | Install Node.js with npm, reopen the terminal, check `node --version` and `npm.cmd --version`. |
| Port occupied | Inspect `Get-NetTCPConnection -LocalPort 8000` or `5173`. Stop only the server you recognize. Vite intentionally fails rather than silently changing ports. |
| Frontend cannot reach backend | Check `http://127.0.0.1:8000/api/health`; keep both terminals running. Vite proxy target must match the backend port. |
| CORS error | Use the documented localhost origin. If intentionally changing ports, update Vite proxy and `FRONTEND_ORIGINS` in `backend/.env`, then restart. Do not use wildcard CORS as a fix. |
| Ollama unreachable | Open Ollama or run `ollama serve`; check `Invoke-RestMethod http://127.0.0.1:11434/api/tags`. |
| Model missing | Verify `ollama list`; install only `qwen2.5:3b` if actually absent. |
| Slow inference or timeout | Warm the model, close GPU-heavy programs, use Concise and 256 tokens, and shorten the prompt/history. `OLLAMA_TIMEOUT` is configurable, but increasing it alone beyond the UI's 190-second deadline will not extend the browser wait. |
| Microphone denied | Browser site settings → Microphone → Allow; reload and retry. Check Windows microphone privacy settings and the selected input device. |
| Recognition unavailable | Use typed chat. Chrome is the main voice target; API presence does not guarantee service availability. Recognition may need internet. |
| No audible speech | Enable Voice response, check volume/mute and voice selection, click Replay to provide a user gesture, select a device English voice and retry. |
| Long answer cut off | The UI shows a length-limit notice. Increase maximum tokens or ask “Continue.” |
| Changing prompts has no effect | Restart FastAPI, or use `--reload` during development; clear context before comparing modes. |
| Starlette test warning | The tested dependency set emits an HTTPX TestClient deprecation warning. Tests pass; this is a future migration notice, not a failing request. |

Browser compatibility: recognition uses either `SpeechRecognition` or `webkitSpeechRecognition`. Support and service behavior vary by browser/platform; desktop Chrome was used for browser automation. Edge and Safari may differ; Firefox generally needs typed input. Voice availability is discovered at runtime. Use localhost (or HTTPS in a separately designed deployment) for microphone access. See [MDN SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) and [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API).

## Technical references

- [Ollama chat API](https://docs.ollama.com/api/chat)
- [Qwen2.5 release and model family](https://qwenlm.github.io/blog/qwen2.5/)
- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [FastAPI tutorial](https://fastapi.tiangolo.com/tutorial/)
- [Vite setup requirements](https://vite.dev/guide/)
