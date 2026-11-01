# Recorded verification results

Development run: **29 October 2026**. Raw CSV rows include UTC timestamps. Tests used local `qwen2.5:3b` (3.1B, Q4_K_M as reported by Ollama), Ollama 0.40.13, Python 3.12.5 and Node 25.3.0 on Windows. Reported hardware includes an Intel Core i5-13450HX and NVIDIA GeForce RTX 4050 Laptop GPU. These are single-machine observations, not general performance guarantees.

## Real inference measurements

| Run | Successful/nonempty final answers | Median HTTP latency | Range | Truncated answers |
|---|---:|---:|---:|---:|
| Initial concise, `results.csv` | 18/18 | 427.5 ms | 143–2,616 ms | 0 |
| Revised concise, `results_revised.csv` | 18/18 | 420 ms | 135–1,122 ms | 0 |

Both use temperature 0.3 and a 512-token output limit. Latency excludes context setup calls and includes the final request's round trip. The model was warmed during development; some runs overlapped development/browser work. No causal speed improvement is claimed. Human scoring is **not completed**. Nonempty HTTP success is not equivalent to an accurate or complete answer.

## Three-mode comparison: “Explain the Transformer architecture.”

| Mode | Initial latency / limit | Initial truncated | Final latency / limit | Final truncated | Observed structure in final output |
|---|---|---|---|---|---|
| Concise | 784 ms / 512 | No | 763 ms / 1,024 | No | One compact explanatory sentence |
| Educational | 6,670 ms / 512 | Yes | 5,740 ms / 1,024 | No | Five numbered components and a story analogy |
| Technical | 6,689 ms / 512 | Yes | 8,055 ms / 1,024 | No | Seven component sections and a final limitation |

Raw outputs: `mode_comparison.csv` and `mode_comparison_revised.csv`. All modes within each file use the same question, temperature and limit and start without history. The final comparison uses updated prompts and a larger output limit; differences across runs cannot isolate either change. Suggested word budgets were not consistently followed. The observed structure supports a style difference but does not prove quality superiority.

## Qualitative issues found during implementation review

This is an implementation-agent inspection of recorded text, **not completed independent human rubric scoring**.

- Initial A18 claimed microphone processing was completely offline, contrary to the actual browser integration. Explicit runtime privacy facts were added. Revised A18 correctly stated that the browser API may send audio to an external service.
- Initial concise A03 overstated supported sequence length. The revised concise output removed that claim, but the final **Technical** comparison still used an unrestricted sequence-length claim. This remaining failure demonstrates that prompt constraints do not guarantee compliance.
- The final Technical answer also described RNNs as fixed-length and confused decoder cross-attention with causal masking. Students should correct those points during discussion: recurrent networks can process variable-length sequences; cross-attention to encoder outputs and masking future decoder tokens are different operations.
- Educational and Technical responses describe the original encoder–decoder Transformer without clearly separating decoder-only variants such as Qwen. Use the architecture notes and primary paper when reviewing them.
- A09 and A10 received two context messages. Their observed responses resolved LSTM and recalled “computer networks.” These are limited examples, not exhaustive memory evaluation.
- Current weather, live Bitcoin price and desktop-file cases declined unavailable access in the concise observations.

The documented corrections are grounded in the [original Transformer paper](https://arxiv.org/abs/1706.03762) and [Qwen model description](https://qwenlm.github.io/blog/qwen2.5/). Students must independently score the outputs before submitting numeric quality claims.

## Engineering checks

- **29 backend tests passed:** validation, health, missing model, transport failure, timeout, malformed outputs, role ordering, three prompt instructions, bounded history, CORS.
- **11 Chrome browser tests passed:** two actual local-model integration tests plus nine controlled tests of settings, Markdown, history, Clear, speech events, unsupported speech APIs, failure handling, and responsive layout.
- Frontend production build passed. `pip check` found no broken requirements. npm installation audit reported zero vulnerabilities.
- Desktop/tablet/mobile screenshots at widths 1440/820/390 were captured; desktop and mobile were visually inspected. Browser assertions found no horizontal overflow or JavaScript page errors in the layout test.

## Still unverified

Real microphone audio capture, recognition service availability, audible TTS quality, real device permission flow, other browser engines and physical network-disconnected operation remain manual checks. Simulated voice events are expressly not evidence of audible speech. Follow `docs/demo_scenarios.md` and fill `manual_checks.csv` before the college demonstration. A test dependency deprecation warning remains, with no failing checks.
