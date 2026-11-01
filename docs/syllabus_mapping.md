# OE Generative AI syllabus mapping

This mapping follows the module topics supplied in the project brief. It has not been checked against a separate institution-issued syllabus PDF. The team should confirm course codes and submission formatting with its guide.

## Module 1

| Concept | Explanation | Relationship to VoxAI |
|---|---|---|
| Generative AI | Produces new content conditioned on input and learned patterns | Implemented application: Qwen generates new answers, not fixed response templates |
| NLP | Computational processing of human language | User questions and conversational answers; recognition is a separate speech subsystem |
| Language model | Assigns probabilities to token sequences | Pretrained Qwen model used through Ollama; no new training |
| Tokens | Model vocabulary units, which may be words, subwords or other fragments | Ollama tokenizes; output token limit is configurable, not a word count |
| Context window | Finite token capacity available during inference | Runtime context set to 8,192 tokens; recent history is additionally bounded by message and character limits |
| Transformer | Attention-based neural architecture with feed-forward transformations | Background architecture of Qwen, not implemented from scratch in this repository |
| Self-attention | Uses queries and keys to derive weights applied to value vectors | Background explanation; students do not implement attention kernels |

## Module 2

| Concept | Demonstration | Boundary |
|---|---|---|
| LLM | Qwen 2.5 3B produces natural-language answers | Pretrained weights, not a new model |
| GPT/autoregressive concepts | Sequential next-token generation conditioned on previous tokens | Qwen is a separate decoder-only Transformer family, **not an OpenAI GPT model** |
| Prompt engineering | Three response styles with distinct instructions | Style control is probabilistic, not a guarantee |
| Role prompting | Dedicated system message establishes identity and constraints | Clients cannot insert system-role history entries |
| Inference | `/api/chat` calls local Ollama | No backpropagation, fine-tuning, training set, or training metrics |
| Temperature | UI controls sampling variation from 0 to 1.5 | Lower temperature does not eliminate hallucinations |
| Ethics | Privacy disclosure, uncertainty, no execution of generated code | Browser speech may use external services |
| Hallucination | Real initial privacy failure retained in evaluation | HTTP success is not proof of factual correctness |
| Applications | Educational explanation, coding help, conversational assistance | No internet access, document RAG, or tool execution |

## Prompt engineering terms

**Instruction** specifies what to do: explain, compare, define, or write code. **Role** sets the assistant identity: VoxAI, an educational voice companion. **Context** supplies relevant prior successful turns, so “it” in the LSTM follow-up can be resolved. **Constraints** limit unsupported claims, verbosity, and tool assumptions; runtime facts explain that voice recognition may be online. These live in `backend/prompts.py` rather than the frontend.

**Temperature** controls the sampling distribution used for the next token. It is not a confidence score, fact checker, or volume control. **Conversation context** is supplied anew with each stateless API request and is not persistent memory or a change to the model weights.

| Mode | Instruction strategy | Intended observable difference |
|---|---|---|
| Concise | Short direct answer, usually 2–4 sentences | Suitable for spoken questions; little formatting |
| Educational | Definition, numbered steps, simple example; aim 120–180 words | Teaching structure and accessible explanation |
| Technical | Mechanisms, terms, tradeoffs, code when relevant; aim 180–250 words | Greater precision and structured detail |

Compare the same prompt in fresh conversations at the same temperature and output limit. Mode does not change model weights, knowledge, or the underlying architecture. Generated answers must be reviewed, particularly when simplifying attention or discussing architecture variants.

References: [Qwen team's Qwen2.5 release](https://qwenlm.github.io/blog/qwen2.5/); [Vaswani et al., Attention Is All You Need](https://arxiv.org/abs/1706.03762).
