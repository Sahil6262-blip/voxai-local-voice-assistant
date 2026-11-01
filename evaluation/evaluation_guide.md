# Evaluation protocol

`test_cases.csv` contains 18 questions covering academic concepts, technical explanations, programming, contextual follow-ups, ambiguity, unsupported information and limitations. `manual_checks.csv` covers real device checks. Blank human score fields are intentional.

## Run actual inference

Keep FastAPI and Ollama running. From the project root:

```powershell
.\.venv\Scripts\python.exe evaluation\run_evaluation.py --output my_results.csv
.\.venv\Scripts\python.exe evaluation\run_evaluation.py --ids A03 --modes concise,educational,technical --max-tokens 1024 --output my_comparison.csv
```

For a full comparison use `--modes concise,educational,technical` without `--ids`. The evaluator overwrites its named output file; choose a new filename to preserve prior experiments. Each independent case starts with empty history. Context cases first obtain an actual setup answer, then send that complete pair with the follow-up. The latency column measures the final question's HTTP round trip, excluding setup. Output records setup text, answer, status, nonempty success, truncation and context count. Network/API failures are recorded rather than counted as successful answers. A failed health check stops the run.

All cases use temperature 0.3; the default response limit is 512 tokens. This is a functional evaluation on one computer, not a controlled model benchmark. Warm cache, model loading, response length, hardware and concurrent work affect latency. The evaluator does not fix the sampling seed. Repeat runs will differ. For stronger experiments, record the hardware and Ollama version, avoid competing workloads, run at least three repeats per case, and distinguish cold from warm runs.

## Human scoring rubric

Use a separate copy of the CSV and enter reviewer identity. Two students should score independently before resolving disagreements. Check correctness against lecture notes and primary references, not another unsupported model answer.

| Score | Relevance | Factual correctness | Clarity | Mode compliance |
|---|---|---|---|---|
| 0 | Unrelated | Fundamentally false or fabricated | Incomprehensible | Opposite of requested style |
| 1 | Mostly misses question | Major errors | Hard to follow | Little evidence of mode |
| 2 | Partially addresses question | Mixed or incomplete | Understandable with effort | Some expected structure |
| 3 | Answers main request | Mostly correct; minor issue | Clear | Mostly follows style |
| 4 | Direct and complete | Accurate at requested level | Clear and well organized | Matches requested mode well |

Mark unsupported claims **yes/no/uncertain**, with the exact claim and a reference in notes. An admission of unavailable live information is a successful limitation response, not an irrelevant answer. Mark factual correctness **N/A** when no factual answer is requested, and exclude it from that dimension's average. Mark truncation independently; unfinished answers can lose clarity/completeness points. Do not claim that automated success is a human quality score.

## Measures and comparison

- Automated success rate = HTTP-successful, nonempty outputs / attempted final questions.
- Latency: median, range, and optionally p95 across successful final questions; state the percentile method.
- Human quality: mean and count for each rubric dimension; disclose missing or N/A ratings.
- Unsupported-claim rate: reviewed outputs containing an unsupported claim / reviewed outputs.
- Voice: manual pass/fail with browser version and observation. Test doubles verify event handling only.
- Compare output length, latency, truncation and structure across identical prompts and settings. One prompt cannot establish universal mode performance.

## Evidence retained from development

`results.csv` and `mode_comparison.csv` are initial real runs. `results_revised.csv` uses the added runtime/privacy facts. `mode_comparison_revised.csv` uses the final prompts and a 1,024-token comparison limit. Changing both prompt wording and token budget means the latter is a practical demonstration comparison, **not a causal experiment isolating prompt revision**. Each within-file mode comparison uses identical settings.

The initial A18 answer falsely guaranteed offline microphone processing. The initial A03 answer overstated sequence length support. Those original outputs are retained. After adding explicit runtime facts, A18 acknowledged the external speech service and A03 no longer made the unlimited-length claim in the observed retest. This is evidence of one improvement, not a guarantee that hallucinations are eliminated.

Read `results_summary.md` for measured numbers and remaining verification limits. No human rubric scores have been fabricated or prefilled. The report is ready for the four students to review and complete.
