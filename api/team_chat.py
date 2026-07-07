from __future__ import annotations

import json
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler
from typing import Any

from api._common import read_json, write_json


MESSAGES: list[dict[str, Any]] = []
TEAM_CHAT_LIMIT = 200


class handler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        write_json(self, {"ok": True, "messages": MESSAGES[:TEAM_CHAT_LIMIT]})

    def do_POST(self) -> None:
        try:
            body = read_json(self)
            messages = apply_action(body)
        except (ValueError, json.JSONDecodeError) as error:
            write_json(self, {"ok": False, "error": str(error)}, HTTPStatus.BAD_REQUEST)
            return
        write_json(self, {"ok": True, "messages": messages})


def apply_action(body: dict[str, Any]) -> list[dict[str, Any]]:
    global MESSAGES
    action = str(body.get("action", "")).strip()
    if action == "post":
        MESSAGES.insert(0, sanitize_message(body.get("item") or body.get("message") or {}))
    elif action == "vote":
        item_id = str(body.get("id", "")).strip()
        user = str(body.get("user", "local")).strip() or "local"
        decision = str(body.get("decision", "")).strip()
        if decision not in {"add", "reject"}:
            raise ValueError("Team chat vote must be add or reject.")
        for message in MESSAGES:
            if message.get("id") == item_id:
                votes = message.setdefault("votes", {})
                if isinstance(votes, dict):
                    votes[user] = decision
                if decision == "reject":
                    message["status"] = "rejected"
                break
    elif action == "promote":
        item_id = str(body.get("id", "")).strip()
        user = str(body.get("user", "local")).strip() or "local"
        source_id = str(body.get("sourceId", "")).strip()
        for message in MESSAGES:
            if message.get("id") == item_id:
                votes = message.setdefault("votes", {})
                if isinstance(votes, dict):
                    votes[user] = "add"
                message["status"] = "added to sources"
                if source_id:
                    message["sourceId"] = source_id
                break
    else:
        raise ValueError("Unknown team chat action.")
    MESSAGES = dedupe(MESSAGES)[:TEAM_CHAT_LIMIT]
    return MESSAGES


def sanitize_message(raw: Any) -> dict[str, Any]:
    if not isinstance(raw, dict):
        raise ValueError("Team chat item must be an object.")
    item_id = str(raw.get("id", "")).strip()
    text = str(raw.get("text", "")).strip()
    if not item_id or not text:
        raise ValueError("Team chat item requires id and text.")
    item_type = str(raw.get("type", "message")).strip()
    if item_type not in {"message", "update", "recommendation", "link"}:
        item_type = "message"
    return {
        "id": item_id[:96],
        "type": item_type,
        "owner": str(raw.get("owner", "local")).strip()[:80] or "local",
        "title": str(raw.get("title", "")).strip()[:180],
        "text": text[:4000],
        "url": str(raw.get("url", "")).strip()[:1200],
        "status": str(raw.get("status", "open" if item_type == "recommendation" else "posted")).strip()[:80],
        "votes": raw.get("votes") if isinstance(raw.get("votes"), dict) else {},
        "createdAt": str(raw.get("createdAt", "")).strip()[:80],
    }


def dedupe(messages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[str] = set()
    output: list[dict[str, Any]] = []
    for message in messages:
        item_id = str(message.get("id", "")).strip()
        if not item_id or item_id in seen:
            continue
        seen.add(item_id)
        output.append(message)
    return output
