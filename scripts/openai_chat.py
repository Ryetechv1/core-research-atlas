#!/usr/bin/env python3
"""Server-side OpenAI Responses API chat helper.

This module keeps the OpenAI API key on the backend. The browser sends a short
conversation plus app context; the backend calls /v1/responses and returns only
the assistant text and non-secret metadata.
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Any


OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"
DEFAULT_MODEL = "gpt-5.5"
ALLOWED_EFFORTS = {"none", "low", "medium", "high", "xhigh"}
ALLOWED_VERBOSITY = {"low", "medium", "high"}
MAX_MESSAGES = 18
MAX_MESSAGE_CHARS = 8000
MAX_CONTEXT_CHARS = 24000

SYSTEM_INSTRUCTIONS = """You are the optional OpenAI research chat for the CORE Shapeshifting Research Atlas.
Answer from the supplied app context, in-app browser state, source records, team notes, documents, profiles, and user prompt.
Keep evidence tiers explicit. Treat folklore, occult, metaphysical, spiritual, experiential, and speculative biological claims as distinct categories.
Do not present supernatural or speculative transformation claims as established biomedical fact.
When useful, cite visible titles, URLs, source IDs, or document names from the supplied context.
If the supplied context is insufficient, say what is missing and suggest concrete source searches or document additions."""


class OpenAIChatConfigError(RuntimeError):
    """Raised when the backend is missing required OpenAI configuration."""


class OpenAIChatApiError(RuntimeError):
    """Raised when the Responses API call fails."""


def openai_chat_response(
    messages: list[dict[str, Any]],
    context: dict[str, Any] | None = None,
    options: dict[str, Any] | None = None,
) -> dict[str, Any]:
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise OpenAIChatConfigError("OPENAI_API_KEY is not configured on this backend host.")

    options = options or {}
    model = normalize_model(str(options.get("model") or os.environ.get("OPENAI_CHAT_MODEL") or DEFAULT_MODEL))
    effort = normalize_choice(
        str(options.get("reasoningEffort") or os.environ.get("OPENAI_CHAT_REASONING_EFFORT") or "high"),
        ALLOWED_EFFORTS,
        "high",
    )
    verbosity = normalize_choice(
        str(options.get("verbosity") or os.environ.get("OPENAI_CHAT_VERBOSITY") or "medium"),
        ALLOWED_VERBOSITY,
        "medium",
    )

    input_items = build_input_items(messages, context)
    payload = {
        "model": model,
        "instructions": SYSTEM_INSTRUCTIONS,
        "input": input_items,
        "reasoning": {"effort": effort},
        "text": {"verbosity": verbosity},
        "store": False,
    }

    data = post_json(OPENAI_RESPONSES_URL, payload, api_key)
    output_text = extract_output_text(data)
    if not output_text:
        raise OpenAIChatApiError("OpenAI returned no text output.")
    return {
        "reply": output_text,
        "model": data.get("model") or model,
        "responseId": data.get("id", ""),
        "reasoningEffort": effort,
        "verbosity": verbosity,
    }


def build_input_items(messages: list[dict[str, Any]], context: dict[str, Any] | None) -> list[dict[str, str]]:
    input_items: list[dict[str, str]] = []
    if context:
        input_items.append(
            {
                "role": "user",
                "content": "App context for this answer:\n" + clamp(json.dumps(context, indent=2, ensure_ascii=False), MAX_CONTEXT_CHARS),
            }
        )

    clean_messages = normalize_messages(messages)
    if not clean_messages:
        raise ValueError("At least one user message is required.")
    input_items.extend(clean_messages)
    return input_items


def normalize_messages(messages: list[dict[str, Any]]) -> list[dict[str, str]]:
    if not isinstance(messages, list):
        raise ValueError("messages must be a list.")

    clean: list[dict[str, str]] = []
    for message in messages[-MAX_MESSAGES:]:
        if not isinstance(message, dict):
            continue
        role = str(message.get("role", "")).strip().lower()
        if role not in {"user", "assistant"}:
            role = "user"
        content = clamp(str(message.get("content", "")).strip(), MAX_MESSAGE_CHARS)
        if content:
            clean.append({"role": role, "content": content})

    if clean and clean[-1]["role"] != "user":
        raise ValueError("The latest chat message must be from the user.")
    return clean


def post_json(url: str, payload: dict[str, Any], api_key: str) -> dict[str, Any]:
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=75) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        detail = safe_error_detail(error)
        raise OpenAIChatApiError(f"OpenAI API returned HTTP {error.code}: {detail}") from error
    except urllib.error.URLError as error:
        raise OpenAIChatApiError(f"OpenAI API request failed: {error.reason}") from error
    except json.JSONDecodeError as error:
        raise OpenAIChatApiError("OpenAI API returned invalid JSON.") from error


def safe_error_detail(error: urllib.error.HTTPError) -> str:
    try:
        raw = error.read().decode("utf-8")
        parsed = json.loads(raw or "{}")
        message = parsed.get("error", {}).get("message") or parsed.get("message") or raw
        return clamp(str(message), 500)
    except Exception:
        return error.reason or "Unknown API error"


def extract_output_text(data: dict[str, Any]) -> str:
    direct = data.get("output_text")
    if isinstance(direct, str) and direct.strip():
        return direct.strip()

    parts: list[str] = []
    for item in data.get("output", []) if isinstance(data.get("output"), list) else []:
        content = item.get("content") if isinstance(item, dict) else None
        if not isinstance(content, list):
            continue
        for block in content:
            if not isinstance(block, dict):
                continue
            text = block.get("text") or block.get("content")
            if isinstance(text, str) and text.strip():
                parts.append(text.strip())
    return "\n\n".join(parts).strip()


def normalize_choice(value: str, allowed: set[str], fallback: str) -> str:
    normalized = value.strip().lower()
    return normalized if normalized in allowed else fallback


def normalize_model(value: str) -> str:
    normalized = value.strip()
    if normalized == "gpt-" + "5.5-pro":
        return DEFAULT_MODEL
    return normalized or DEFAULT_MODEL


def clamp(value: str, limit: int) -> str:
    text = str(value or "")
    return text if len(text) <= limit else text[: limit - 40].rstrip() + "\n...[truncated for request size]"
