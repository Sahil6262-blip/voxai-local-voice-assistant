# Viva questions and concise answers

1. **What is Generative AI?** It generates new content conditioned on prompts and patterns learned during training. VoxAI generates conversational text using a pretrained model.
2. **What is an LLM?** A large language model learns statistical relationships in token sequences and can generate continuations. Its fluent outputs are not guaranteed facts.
3. **What is Ollama?** The local model runtime and HTTP API used to load and run Qwen. React talks to our FastAPI service, which calls Ollama.
4. **What is Qwen 2.5 3B?** A roughly three-billion-parameter model in the Qwen family. The installed artifact reports 3.1B parameters and Q4_K_M quantization. Qwen is separate from OpenAI's GPT models.
5. **Did you train the model?** No. This project performs inference with downloaded pretrained weights. Prompt changes do not train or fine-tune it.
6. **What is a Transformer?** An attention-based neural architecture with feed-forward transformations and positional information. The original paper used an encoder–decoder design; Qwen is decoder-only.
7. **How does self-attention work?** Queries and keys determine attention weights, which combine value representations. Causal masking in a decoder blocks attention to future tokens. Cross-attention to encoder outputs is a different mechanism.
8. **What is a token?** A model vocabulary unit, often a word fragment. Tokens and characters or words are not interchangeable counts.
9. **What is a context window?** The finite number of tokens available during inference. VoxAI requests an 8,192-token runtime context and separately bounds history by characters and complete message pairs.
10. **What does autoregressive mean?** Generation predicts the next token from preceding tokens, appends it, and repeats. Transformer prompt processing can be parallelized, but generated tokens are produced sequentially.
11. **What is prompt engineering?** Designing instructions, roles, context and constraints to guide output. Our three modes use different instructions in a backend-owned system message.
12. **How do the modes differ?** Concise asks for short spoken answers. Educational asks for definitions, steps and an example. Technical asks for terminology, mechanisms, tradeoffs and code when relevant.
13. **Does temperature measure confidence?** No. It adjusts sampling variation. Lower values tend to be more predictable but can still produce confident falsehoods.
14. **How is context maintained?** The browser sends recent successful user/assistant pairs on every request. The backend selects a bounded suffix. The model weights do not change.
15. **What happens on Clear?** Displayed messages and future supplied history are removed; speech and the browser's pending request are canceled. Ollama may still finish computing a discarded request.
16. **What is speech recognition?** Converting microphone audio to text. We use the browser SpeechRecognition API where available and submit the final transcript once.
17. **Is recognition local?** Not necessarily. The browser may send audio to an external recognition service and require internet. Local Ollama does not make browser speech private or offline.
18. **What is text-to-speech?** Converting response text into audible speech. We use browser synthesis, selecting available voices and rate, and cancel previous playback to prevent overlap.
19. **Why React?** Its component and state model organizes conversation, settings and application states. It is the UI layer, not the language model.
20. **Why FastAPI?** It provides typed request/response schemas, validation, async HTTP integration and interactive API documentation with a compact Python implementation.
21. **What is a REST API here?** An HTTP interface: GET checks service/model health and POST submits a chat request. JSON carries structured fields between frontend and backend.
22. **Why non-streaming?** A complete JSON response simplifies correctness and error handling for the initial implementation. Streaming is a future improvement, not a current feature.
23. **What is a hallucination?** A generated unsupported or false claim. The recorded initial privacy answer is an example; the final technical output also shows that prompting cannot eliminate every error.
24. **How did you evaluate it?** We recorded actual responses for 18 cases, ran backend/browser tests, and prepared a human 0–4 rubric. Automated success is not factual correctness. Human ratings remain pending until students fill them.
25. **What exactly was browser-tested?** Two tests used actual local Qwen responses. Nine controlled tests exercised UI, error, voice-event and responsive behavior. They do not certify real audio hardware or the browser recognition service.
26. **How is code handled?** Model-generated code is formatted and displayed. The application never executes it.
27. **Does VoxAI use RAG?** No. It can explain retrieval-augmented generation, but no document retrieval or vector database is implemented.
28. **Can it answer live weather or prices?** It has no live-data tool. It should admit that limitation, but students must still check for unsupported claims.
29. **What are the security limits?** Loopback binding, configured local CORS and validation support a personal demo. CORS is not authentication; exposing it publicly would require a separate security design.
30. **What should be improved next?** Fully local speech recognition, exact token budgeting, better evaluation and optional course-material retrieval are reasonable future directions. They are not part of the current implementation.

For architecture facts use [the Transformer paper](https://arxiv.org/abs/1706.03762) and [Qwen's release description](https://qwenlm.github.io/blog/qwen2.5/); for voice behavior use [MDN's Web Speech documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API). Do not memorize an unverified model answer as the viva reference.
