import os
from pathlib import Path
from time import perf_counter

import httpx
from dotenv import load_dotenv

from .prompts import system_prompt
from .schemas import ChatRequest, ChatResponse, HealthResponse

load_dotenv(Path(__file__).with_name(".env"))
MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")
BASE_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434").rstrip("/")
TIMEOUT = float(os.getenv("OLLAMA_TIMEOUT", "180"))
GUIDANCE = "Start Ollama and ensure qwen2.5:3b is installed."


class OllamaError(Exception):
    def __init__(self, message: str, status_code: int = 503):
        super().__init__(message)
        self.status_code = status_code


def bounded_history(request: ChatRequest) -> list[dict]:
    # Keep complete recent user/assistant pairs; exclude incomplete/failed turns.
    pairs = []
    pending = None
    for item in request.history:
        if item.role == "user":
            pending = item
        elif pending is not None:
            pairs.append([pending.model_dump(), item.model_dump()])
            pending = None
    selected = []
    remaining = 6000
    for pair in reversed(pairs[-6:]):
        size = sum(len(item["content"]) for item in pair)
        if size > remaining:
            break
        selected = pair + selected
        remaining -= size
    return selected


async def health(client: httpx.AsyncClient) -> HealthResponse:
    try:
        response = await client.get("/api/tags", timeout=5)
        response.raise_for_status()
        names = [model["name"] for model in response.json()["models"]]
        available = MODEL in names
        return HealthResponse(status="connected" if available else "error", ollama_connected=True,
                              model_available=available, model=MODEL,
                              error=None if available else f"Model {MODEL} is not installed. {GUIDANCE}")
    except httpx.RequestError:
        return HealthResponse(status="offline", ollama_connected=False, model_available=False,
                              model=MODEL, error=f"Cannot reach Ollama. {GUIDANCE}")
    except (httpx.HTTPStatusError, ValueError, KeyError, TypeError):
        return HealthResponse(status="error", ollama_connected=False, model_available=False,
                              model=MODEL, error="Ollama returned an unexpected health response.")


async def chat(client: httpx.AsyncClient, request: ChatRequest) -> ChatResponse:
    history = bounded_history(request)
    payload = {
        "model": MODEL, "stream": False,
        "messages": [{"role": "system", "content": system_prompt(request.mode)}, *history,
                     {"role": "user", "content": request.message}],
        "options": {"temperature": request.settings.temperature,
                    "num_predict": request.settings.max_tokens, "num_ctx": 8192},
        "keep_alive": "10m",
    }
    started = perf_counter()
    try:
        response = await client.post("/api/chat", json=payload)
        if response.status_code == 404:
            raise OllamaError(f"Model {MODEL} was not found. {GUIDANCE}")
        response.raise_for_status()
        data = response.json()
        answer = data["message"]["content"]
        if not isinstance(answer, str) or not answer.strip():
            raise ValueError("empty answer")
        return ChatResponse(answer=answer.strip(), model=MODEL,
                            elapsed_ms=round((perf_counter() - started) * 1000),
                            context_messages=len(history), truncated=data.get("done_reason") == "length")
    except httpx.TimeoutException as exc:
        raise OllamaError("The local model took too long. Let it finish loading, shorten your question, or lower the response length and try again.", 504) from exc
    except httpx.RequestError as exc:
        raise OllamaError(f"Cannot reach Ollama. {GUIDANCE}") from exc
    except httpx.HTTPStatusError as exc:
        raise OllamaError("Ollama could not generate a response. Check its terminal and available memory.", 502) from exc
    except (ValueError, KeyError, TypeError) as exc:
        raise OllamaError("Ollama returned an empty or unexpected response. Please try again.", 502) from exc
