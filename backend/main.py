import os
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from . import ollama_client
from .schemas import ChatRequest, ChatResponse, HealthResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with httpx.AsyncClient(base_url=ollama_client.BASE_URL,
                                timeout=httpx.Timeout(ollama_client.TIMEOUT, connect=5),
                                trust_env=False) as client:
        app.state.ollama = client
        yield


app = FastAPI(title="VoxAI API", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware,
                   allow_origins=os.getenv("FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(","),
                   allow_methods=["GET", "POST"], allow_headers=["Content-Type"])


@app.exception_handler(ollama_client.OllamaError)
async def ollama_error_handler(request: Request, exc: ollama_client.OllamaError):
    return JSONResponse(status_code=exc.status_code, content={"detail": str(exc)})


@app.get("/api/health", response_model=HealthResponse)
async def get_health(request: Request):
    return await ollama_client.health(request.app.state.ollama)


@app.post("/api/chat", response_model=ChatResponse)
async def post_chat(body: ChatRequest, request: Request):
    return await ollama_client.chat(request.app.state.ollama, body)
