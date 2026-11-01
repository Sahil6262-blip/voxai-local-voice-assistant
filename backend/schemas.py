from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints
from typing_extensions import Annotated

MessageText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=4000)]
HistoryText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=16000)]


class HistoryMessage(BaseModel):
    model_config = ConfigDict(extra="forbid")
    role: Literal["user", "assistant"]
    content: HistoryText


class GenerationSettings(BaseModel):
    model_config = ConfigDict(extra="forbid")
    temperature: float = Field(default=0.5, ge=0, le=1.5)
    max_tokens: int = Field(default=512, ge=64, le=1536)


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    message: MessageText
    history: list[HistoryMessage] = Field(default_factory=list, max_length=20)
    mode: Literal["concise", "educational", "technical"] = "concise"
    settings: GenerationSettings = Field(default_factory=GenerationSettings)


class ChatResponse(BaseModel):
    answer: str
    model: str
    status: Literal["success"] = "success"
    elapsed_ms: int
    context_messages: int
    truncated: bool = False


class HealthResponse(BaseModel):
    status: Literal["connected", "offline", "error"]
    backend: Literal["ok"] = "ok"
    ollama_connected: bool
    model_available: bool
    model: str
    error: str | None = None
