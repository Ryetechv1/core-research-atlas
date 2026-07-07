#!/usr/bin/env python3
"""OpenAI-backed research agent helper.

The browser app sends only research context and never receives the API key.
This helper uses the Responses API directly through Python stdlib so the local
server can run without an extra SDK install.
"""

from __future__ import annotations

import json
import os
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


OPENAI_RESPONSES_ENDPOINT = "https://api.openai.com/v1/responses"
DEFAULT_AGENT_MODEL = "gpt-5.5"
DEFAULT_TIMEOUT = 45
MAX_CONTEXT_CHARS = 36_000


class OpenAIAgentConfigError(RuntimeError):
    """Raised when the OpenAI agent backend is not configured."""


class OpenAIAgentApiError(RuntimeError):
    """Raised when OpenAI returns an API error."""


def configured_api_key() -> str:
    key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not key:
        raise OpenAIAgentConfigError("OPENAI_API_KEY is not configured server-side.")
    return key


def configured_model() -> str:
    return os.environ.get("OPENAI_AGENT_MODEL", DEFAULT_AGENT_MODEL).strip() or DEFAULT_AGENT_MODEL


def create_research_answer(payload: dict[str, Any]) -> dict[str, Any]:
    prompt = str(payload.get("prompt", "")).strip()
    if not prompt:
        raise ValueError("Agent prompt is required.")

    model = str(payload.get("model") or configured_model()).strip()
    instructions = build_agent_instructions()
    input_text = build_agent_input(payload)
    request_body = {
        "model": model,
        "instructions": instructions,
        "input": input_text,
        "max_output_tokens": int(payload.get("max_output_tokens") or 1800),
    }
    request = Request(
        OPENAI_RESPONSES_ENDPOINT,
        method="POST",
        headers={
            "Authorization": f"Bearer {configured_api_key()}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        data=json.dumps(request_body).encode("utf-8"),
    )
    try:
        with urlopen(request, timeout=DEFAULT_TIMEOUT) as response:
            raw = response.read().decode("utf-8", errors="replace")
            data = json.loads(raw or "{}")
    except HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")[:1600]
        raise OpenAIAgentApiError(f"OpenAI Responses API HTTP {error.code}: {detail}") from error
    except URLError as error:
        raise OpenAIAgentApiError(f"OpenAI Responses API request failed: {error.reason}") from error
    except json.JSONDecodeError as error:
        raise OpenAIAgentApiError(f"OpenAI Responses API returned invalid JSON: {error}") from error

    output_text = extract_output_text(data)
    if not output_text:
        raise OpenAIAgentApiError("OpenAI Responses API returned no text output.")

    return {
        "provider": "openai-responses-api",
        "model": model,
        "output_text": output_text,
        "response_id": data.get("id", ""),
        "usage": data.get("usage", {}),
    }


def build_agent_instructions() -> str:
    return (
        "You are the CORE ChatGPT Pro Research Agent for a collaborative research web app. "
        "Answer from the supplied web result cards, scraped site previews, app archive records, "
        "active browser context, team posts, profiles, and uploaded-reference metadata. "
        "Keep URLs visible for citation follow-up. Separate historical, cultural, occult, "
        "metaphysical, psychological, and biological-analogy claims. Do not present supernatural "
        "or physical shapeshifting claims as established biology. When evidence is weak, say so "
        "plainly and suggest the next source to extract."
    )


def build_agent_input(payload: dict[str, Any]) -> str:
    focused = {
        "prompt": payload.get("prompt"),
        "mode": payload.get("mode"),
        "depth": payload.get("depth"),
        "sourceTypes": payload.get("sourceTypes"),
        "browserContext": payload.get("browserContext"),
        "webRecord": payload.get("webRecord"),
        "sourceMatches": payload.get("sourceMatches"),
        "references": payload.get("references"),
        "teamMessages": payload.get("teamMessages"),
        "recentExtractions": payload.get("recentExtractions"),
        "activeProfile": payload.get("activeProfile"),
    }
    encoded = json.dumps(focused, indent=2, ensure_ascii=False)
    if len(encoded) > MAX_CONTEXT_CHARS:
        encoded = encoded[:MAX_CONTEXT_CHARS] + "\n...[context truncated]"
    return (
        "Create a concise research answer from this app/web context. Include a short synthesis, "
        "the best source leads with URLs, confidence/evidence cautions, and a recommended next extraction pass.\n\n"
        f"{encoded}"
    )


def extract_output_text(data: dict[str, Any]) -> str:
    if isinstance(data.get("output_text"), str):
        return data["output_text"].strip()
    parts: list[str] = []
    for item in data.get("output") or []:
        if not isinstance(item, dict):
            continue
        for content in item.get("content") or []:
            if not isinstance(content, dict):
                continue
            text = content.get("text")
            if isinstance(text, str):
                parts.append(text)
            elif isinstance(text, dict) and isinstance(text.get("value"), str):
                parts.append(text["value"])
    return "\n".join(part.strip() for part in parts if part and part.strip()).strip()
