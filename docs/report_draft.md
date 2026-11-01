# VoxAI — Intelligent Voice Assistant Powered by Generative AI

**Course:** Open Elective — Generative AI  
**Institution / guide:** [Insert actual details]  
**Team:** [Member A], [Member B], [Member C], [Member D]  
**Date:** 29 October 2026  
**Submission note:** This is an editable draft, intended for approximately 3–5 pages using conventional academic formatting. Confirm the final page count after formatting. Complete real-device checks and independent human scoring before representing them as finished work.

## 1. Abstract

VoxAI is a conversational voice assistant that connects a browser interface to a locally running pretrained language model. Users can ask questions through text or browser speech recognition. A FastAPI backend validates the request, assembles a system prompt and recent conversation history, and obtains a generated response from Ollama using Qwen 2.5 3B. The React interface displays the answer and optionally reads it using browser speech synthesis. Three prompting modes demonstrate how instructions influence response style. The implementation includes genuine service health checks, bounded session memory, cancellation, and voice-error fallbacks. Evaluation combines automated engineering checks, recorded model outputs and a proposed human scoring rubric. The observed evaluation includes a privacy hallucination, its prompt-based correction, and remaining factual weaknesses, illustrating why successful generation is not equivalent to reliable knowledge.

## 2. Introduction and Motivation

Conversational interfaces can make educational material easier to explore, particularly when students want to ask follow-up questions aloud. However, many demonstrations rely on paid cloud APIs or present a static chatbot without explaining the underlying generative process. The problem addressed here is to create an accessible, locally powered assistant that is practical for a live college demonstration and makes prompt engineering, inference and context management visible.

The proposed solution uses software already available on the project laptop: Ollama and the `qwen2.5:3b` model. A web interface supports both microphone interaction and a dependable typed alternative. The central objective is generation of relevant, contextual explanations. Speech recognition and synthesis serve as input/output adapters; they are not the language-generation engine. The project does not claim that every part of voice processing is offline.

## 3. Background: OE Generative AI Concepts

A language model predicts probable continuations of a token sequence. Tokens are vocabulary units rather than necessarily whole words. Autoregressive generation produces subsequent tokens conditioned on earlier tokens. A finite context window limits the information available during inference; supplying conversation history gives the appearance of memory without changing model weights.

Qwen 2.5 belongs to a separate decoder-only Transformer model family. It is not an OpenAI GPT model, although both can illustrate autoregressive language-model concepts. Transformer self-attention uses query–key relationships to weight value representations. Positional information helps represent order. These mechanisms are background properties of the pretrained model; this repository does not implement or train attention layers.

Prompt engineering supplies a role, task instructions, relevant context and constraints. In VoxAI, a system message identifies the assistant and documents its limits. Mode-specific instructions ask for compact, educational or technical explanations. Temperature adjusts sampling variation, not truthfulness. These features connect the working application to the module topics in the supplied project brief; a separate institution-issued syllabus has not been independently verified.

## 4. System Design and Architecture

The workflow is: user speech → browser recognition → text question → React → FastAPI → Ollama chat API → Qwen generation → React display → optional browser synthesis. A typed question enters the same pipeline after the recognition stage.

The frontend uses React, Vite, JavaScript, CSS and Lucide icons. FastAPI, Pydantic and HTTPX provide validated request handling and local inference access. Vite proxies `/api` requests to the backend. FastAPI binds to loopback and allows configured local frontend origins. The health endpoint checks both Ollama connectivity and model availability, rather than assuming a connected state.

Each generation request contains a system prompt, selected recent user/assistant pairs and the current question. The backend keeps at most six pairs and 6,000 history characters, with a 4,000-character question limit. The runtime context is set to 8,192 tokens. Character-based limits are approximate rather than exact tokenizer accounting. Clear removes displayed messages and future supplied context. No database or persistent conversation store is used.

## 5. Team Contributions

The proposed four-person ownership plan assigns Member A to backend integration and tests; Member B to system prompts, modes and context review; Member C to React, voice features and demonstration flows; and Member D to evaluation, report and presentation. Each student should record actual work and peer review in `team_contributions.md`. These assignments are review responsibilities, not claims that unidentified students authored particular generated files. All members should understand the complete inference workflow and participate in the viva.

## 6. Implementation

The interface provides a dark responsive layout, an animated orb, distinct message cards, safe Markdown/code display and an input panel. Orb states reflect listening, waiting for generation, speech playback and errors. Settings expose temperature, response-token limit, voice and playback speed. Concise mode requests brief answers; Educational requests a definition, steps and an example; Technical emphasizes mechanisms, terminology and tradeoffs.

Speech recognition checks browser support, displays interim text, and submits a final transcript once. Cancellation invalidates callbacks; a watchdog prevents indefinite listening. Starting the microphone cancels speech output. Synthesis cancels prior playback, uses short utterance segments and supports replay/stop. Permission denial, silence and unavailable browser services produce text fallbacks. The application never executes model-generated code.

FastAPI rejects invalid inputs and translates unreachable Ollama, missing model, timeout and malformed upstream response conditions into readable errors. The frontend guards concurrent submissions and discards replies after Clear. Only successful turns enter subsequent model history. Browser cancellation does not guarantee immediate termination of the upstream inference computation.

## 7. Evaluation and Results

The evaluation set contains 18 questions across academic, programming, technical, context, ambiguous and unsupported-information categories. Automated measurements record HTTP success, nonempty response, latency, truncation and context count. Human review is designed to score relevance, factual correctness, clarity and mode compliance on a 0–4 scale, with separate unsupported-claim annotations. Human score fields remain blank pending independent student review.

Both initial and revised concise runs returned 18/18 successful nonempty final answers. Their median HTTP latencies were 427.5 ms and 420 ms respectively. These are warmed, single-machine observations with no claim of a controlled speed improvement. A final three-mode comparison on the Transformer question took 763 ms, 5,740 ms and 8,055 ms for Concise, Educational and Technical respectively, with a common 1,024-token cap. All three completed without truncation. The longer outputs showed numbered explanations and additional detail, but did not consistently respect suggested word counts.

An initial answer falsely described microphone processing as entirely offline. Explicit application privacy facts were added to the system prompt, and the observed retest correctly acknowledged possible external recognition. However, the final Technical comparison still made an unrestricted sequence-length claim and confused attention concepts. The recorded evidence therefore supports functional generation and visible style differences, not universal correctness or complete hallucination prevention.

Engineering verification passed 29 backend tests and 11 Chrome browser tests. Two browser tests used real Qwen responses; nine used controlled test doubles to exercise UI and voice-event behavior. The frontend build and Python dependency check passed. Responsive screenshots were captured. Physical microphone capture, audible output, other browser engines and disconnected-network operation remain unverified manual checks.

## 8. Ethical Considerations

The interface discloses that browser voice services may use the internet, even though model inference is local. Users should avoid sensitive audio until they understand their browser service's behavior. Speech synthesis may also use an online voice. The implementation does not save ordinary user transcripts to a database; evaluation scripts explicitly write their test outputs for review.

Generated answers can hallucinate, oversimplify technical concepts, or fail to follow instructions. The team should verify academic claims against credible sources rather than treating model fluency as evidence. Displayed code is not executed. Local binding, explicit CORS and validation reduce accidental exposure but are not a security design for a public service. No paid account, third-party API key or hidden cloud language model is required.

## 9. Limitations and Future Scope

The small model trades capability for accessible local operation. Long histories are discarded, character limits approximate token usage, and speech features vary by browser, installed voices and connectivity. Non-streaming responses prioritize a simple reliable pipeline over immediate token-by-token display. Prompt constraints can reduce particular failures but cannot guarantee truthfulness, brevity or privacy awareness in every generated answer.

Future work could evaluate fully local speech recognition, exact tokenizer-based context budgeting, streaming with proper cancellation, and retrieval over reviewed course material. These are proposed extensions, not implemented integrations. Before the live demonstration, students should finish the physical voice checklist, independently score outputs and rehearse the documented fallback flow. Further evaluation should use repeated runs and a larger set of unseen questions.

## 10. References

1. Vaswani et al. (2017), [Attention Is All You Need](https://arxiv.org/abs/1706.03762).
2. Qwen Team (2024), [Qwen2.5: A Party of Foundation Models](https://qwenlm.github.io/blog/qwen2.5/).
3. Ollama, [Generate a chat message API documentation](https://docs.ollama.com/api/chat).
4. FastAPI, [Tutorial — User Guide](https://fastapi.tiangolo.com/tutorial/).
5. MDN, [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) and [SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition).
6. Vite, [Getting Started](https://vite.dev/guide/).
7. Project evidence: `evaluation/results.csv`, `results_revised.csv`, `mode_comparison.csv`, `mode_comparison_revised.csv` and `results_summary.md`.
