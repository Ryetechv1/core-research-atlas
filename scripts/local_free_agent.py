#!/usr/bin/env python3
"""Free local research agent helper.

This talks to a local Ollama server and never uses a paid cloud API. Start
Ollama, pull a model, then run server.py:

  ollama pull llama3.2:3b
  python server.py
"""

from __future__ import annotations

import json
import os
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from scripts.openai_agent import build_agent_input, build_agent_instructions


DEFAULT_LOCAL_MODEL = "llama3.2:3b"
DEFAULT_OLLAMA_BASE_URL = "http://127.0.0.1:11434"
DEFAULT_TIMEOUT = 90


class LocalAgentConfigError(RuntimeError):
    """Raised when the free local agent is not reachable."""


class LocalAgentApiError(RuntimeError):
    """Raised when the local model runtime returns an error."""


def ollama_base_url() -> str:
    return os.environ.get("LOCAL_AGENT_BASE_URL", DEFAULT_OLLAMA_BASE_URL).rstrip("/")


def configured_local_model() -> str:
    return os.environ.get("LOCAL_AGENT_MODEL", DEFAULT_LOCAL_MODEL).strip() or DEFAULT_LOCAL_MODEL


def is_local_agent_available(timeout: float = 0.7) -> bool:
    request = Request(f"{ollama_base_url()}/api/tags", method="GET")
    try:
        with urlopen(request, timeout=timeout) as response:
            return 200 <= response.status < 300
    except Exception:
        return False


def create_local_research_answer(payload: dict[str, Any]) -> dict[str, Any]:
    prompt = str(payload.get("prompt", "")).strip()
    if not prompt:
        raise ValueError("Agent prompt is required.")

    model = str(payload.get("localModel") or payload.get("model") or configured_local_model()).strip()
    request_body = {
        "model": model,
        "stream": False,
        "messages": [
            {
                "role": "system",
                "content": (
                    build_agent_instructions()
                    + " You are running as a free local model through Ollama. Keep answers grounded in the supplied app, browser, source, team, and memory-bank context."
                ),
            },
            {"role": "user", "content": build_agent_input(payload)},
        ],
        "options": {
            "temperature": float(payload.get("temperature") or 0.35),
            "num_predict": int(payload.get("max_output_tokens") or 1800),
        },
    }
    request = Request(
        f"{ollama_base_url()}/api/chat",
        method="POST",
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        data=json.dumps(request_body).encode("utf-8"),
    )
    try:
        with urlopen(request, timeout=DEFAULT_TIMEOUT) as response:
            raw = response.read().decode("utf-8", errors="replace")
            data = json.loads(raw or "{}")
    except HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")[:1600]
        raise LocalAgentApiError(f"Ollama HTTP {error.code}: {detail}") from error
    except URLError as error:
        raise LocalAgentConfigError(
            f"Ollama is not reachable at {ollama_base_url()}. Install Ollama, run `ollama pull {model}`, then start Ollama."
        ) from error
    except json.JSONDecodeError as error:
        raise LocalAgentApiError(f"Ollama returned invalid JSON: {error}") from error

    output_text = ""
    message = data.get("message")
    if isinstance(message, dict) and isinstance(message.get("content"), str):
        output_text = message["content"].strip()
    if not output_text and isinstance(data.get("response"), str):
        output_text = data["response"].strip()
    if not output_text:
        raise LocalAgentApiError("Ollama returned no text output.")

    return {
        "provider": "ollama-local-free",
        "model": model,
        "base_url": ollama_base_url(),
        "output_text": output_text,
        "usage": {
            "prompt_eval_count": data.get("prompt_eval_count"),
            "eval_count": data.get("eval_count"),
        },
    }
