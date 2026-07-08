from __future__ import annotations

import json
import tempfile
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler
from pathlib import Path
from typing import Any

from api._common import read_json, write_json, write_options


MESSAGES: list[dict[str, Any]] = []
TEAM_CHAT_LIMIT = 200
TEAM_CHAT_PATH = Path(tempfile.gettempdir()) / "core_team_chat_runtime.json"
TEAM_SOURCE_APPROVAL_THRESHOLD = 2
TEAM_USER_COUNT = 3
TEAM_VOTABLE_TYPES = {"update", "link", "promote", "recommendation"}


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self) -> None:
        write_options(self)

    def do_GET(self) -> None:
        write_json(self, {"ok": True, "messages": read_messages()[:TEAM_CHAT_LIMIT]})

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
    MESSAGES = read_messages()
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
                if not is_team_message_votable(message):
                    break
                votes = message.setdefault("votes", {})
                if isinstance(votes, dict):
                    votes[user] = decision
                    message["status"] = team_vote_status(votes, decision, str(message.get("status", "review")))
                break
    elif action == "promote":
        item_id = str(body.get("id", "")).strip()
        user = str(body.get("user", "local")).strip() or "local"
        source_id = str(body.get("sourceId", "")).strip()
        for message in MESSAGES:
            if message.get("id") == item_id:
                if not is_team_message_votable(message):
                    break
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
    write_messages(MESSAGES)
    return MESSAGES


def read_messages() -> list[dict[str, Any]]:
    global MESSAGES
    if MESSAGES:
        return MESSAGES
    try:
        data = json.loads(TEAM_CHAT_PATH.read_text(encoding="utf-8"))
        messages = data.get("messages", data if isinstance(data, list) else [])
        if isinstance(messages, list):
            MESSAGES = [message for message in messages if isinstance(message, dict)][:TEAM_CHAT_LIMIT]
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        MESSAGES = []
    return MESSAGES


def write_messages(messages: list[dict[str, Any]]) -> None:
    try:
        TEAM_CHAT_PATH.write_text(
            json.dumps({"messages": messages[:TEAM_CHAT_LIMIT]}, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
    except OSError:
        pass


def sanitize_message(raw: Any) -> dict[str, Any]:
    if not isinstance(raw, dict):
        raise ValueError("Team chat item must be an object.")
    item_id = str(raw.get("id", "")).strip()
    text = str(raw.get("text", "")).strip()
    if not item_id or not text:
        raise ValueError("Team chat item requires id and text.")
    item_type = str(raw.get("type", "message")).strip()
    if item_type not in {"message", "update", "recommendation", "link", "promote"}:
        item_type = "message"
    if item_type == "recommendation":
        item_type = "promote"
    default_status = "review" if item_type in TEAM_VOTABLE_TYPES else "posted"
    return {
        "id": item_id[:96],
        "type": item_type,
        "owner": str(raw.get("owner", "local")).strip()[:80] or "local",
        "title": str(raw.get("title", "")).strip()[:180],
        "text": text[:4000],
        "url": str(raw.get("url", "")).strip()[:1200],
        "status": str(raw.get("status", default_status)).strip()[:80],
        "votes": raw.get("votes") if isinstance(raw.get("votes"), dict) else {},
        "fileAttachment": sanitize_file_attachment(raw.get("fileAttachment")),
        "createdAt": str(raw.get("createdAt", "")).strip()[:80],
    }


def sanitize_file_attachment(raw: Any) -> dict[str, Any] | None:
    if not isinstance(raw, dict):
        return None
    data_url = str(raw.get("dataUrl", "")).strip()
    if len(data_url) > 2_200_000:
        data_url = ""
    return {
        "id": str(raw.get("id", "")).strip()[:96],
        "fileName": str(raw.get("fileName", "")).strip()[:220],
        "extension": str(raw.get("extension", "")).strip()[:24],
        "mimeType": str(raw.get("mimeType", "")).strip()[:120],
        "size": int(raw.get("size", 0) or 0),
        "previewKind": str(raw.get("previewKind", "data")).strip()[:40],
        "summary": str(raw.get("summary", "")).strip()[:1000],
        "keywords": raw.get("keywords") if isinstance(raw.get("keywords"), list) else [],
        "textExcerpt": str(raw.get("textExcerpt", "")).strip()[:100000],
        "dataUrl": data_url,
        "storedPreview": bool(data_url),
        "warnings": raw.get("warnings") if isinstance(raw.get("warnings"), list) else [],
        "createdAt": str(raw.get("createdAt", "")).strip()[:80],
    }


def team_vote_status(votes: dict[str, Any], latest_decision: str, current_status: str = "review") -> str:
    add_votes = sum(1 for vote in votes.values() if vote == "add")
    reject_votes = sum(1 for vote in votes.values() if vote == "reject")
    if add_votes >= TEAM_SOURCE_APPROVAL_THRESHOLD:
        return "added to sources" if current_status == "added to sources" else "approved for sources"
    if reject_votes >= TEAM_SOURCE_APPROVAL_THRESHOLD:
        return "rejected"
    if latest_decision == "add":
        return f"review: {add_votes}/{TEAM_USER_COUNT} add votes"
    return f"review: {reject_votes}/{TEAM_USER_COUNT} reject votes"


def is_team_message_votable(message: dict[str, Any]) -> bool:
    return str(message.get("type", "message")).strip().lower() in TEAM_VOTABLE_TYPES


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
