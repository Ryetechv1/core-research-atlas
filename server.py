#!/usr/bin/env python3
"""Serve the static app and local research endpoints.

Run with:
  python server.py

The server reads local configuration from the process environment, .env.local,
or .env. It never sends secrets to the browser.
"""

from __future__ import annotations

import argparse
import json
import os
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

from scripts.file_import_extract import FileImportError, extract_uploaded_file
from scripts.google_search import GoogleSearchApiError, GoogleSearchConfigError, fallback_search_url, search_google
from scripts.multipart_upload import MultipartUploadError, read_uploaded_file
from scripts.openai_chat import OpenAIChatApiError, OpenAIChatConfigError, openai_chat_response


ROOT = Path(__file__).resolve().parent
TEAM_CHAT_PATH = ROOT / "data" / "team_chat_runtime.json"
TEAM_CHAT_LIMIT = 200
TEAM_SOURCE_APPROVAL_THRESHOLD = 2
TEAM_USER_COUNT = 3
TEAM_VOTABLE_TYPES = {"update", "link", "promote", "recommendation"}


def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        name, value = line.split("=", 1)
        name = name.strip()
        value = value.strip().strip('"').strip("'")
        if name and name not in os.environ:
            os.environ[name] = value


def load_local_env() -> None:
    load_env_file(ROOT / ".env.local")
    load_env_file(ROOT / ".env")


class CoreResearchHandler(SimpleHTTPRequestHandler):
    server_version = "CoreResearchServer/1.0"

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self) -> None:
        if self.path == "/api/health":
            load_local_env()
            self.write_json(
                {
                    "ok": True,
                    "service": "CORE Research Atlas",
                    "googleSearchConfigured": bool(
                        os.environ.get("GOOGLE_CUSTOM_SEARCH_API_KEY")
                        or os.environ.get("GOOGLE_CSE_API_KEY")
                        or os.environ.get("CUSTOM_SEARCH_API_KEY")
                    ),
                    "openAiChatConfigured": bool(os.environ.get("OPENAI_API_KEY")),
                    "routes": [
                        "/api/health",
                        "/api/search",
                        "/api/import-file",
                        "/api/team-chat",
                        "/api/openai-chat",
                    ],
                }
            )
            return
        if self.path == "/api/team-chat":
            self.write_json({"ok": True, "messages": read_team_messages()})
            return
        super().do_GET()

    def do_POST(self) -> None:
        if self.path == "/api/search":
            self.handle_google_search()
            return
        if self.path == "/api/import-file":
            self.handle_file_import()
            return
        if self.path == "/api/team-chat":
            self.handle_team_chat()
            return
        if self.path == "/api/openai-chat":
            self.handle_openai_chat()
            return
        self.write_json({"ok": False, "error": "Unknown API route."}, HTTPStatus.NOT_FOUND)

    def do_OPTIONS(self) -> None:
        if self.path.startswith("/api/"):
            self.send_response(HTTPStatus.NO_CONTENT)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
            self.send_header("Access-Control-Max-Age", "86400")
            self.end_headers()
            return
        self.send_error(HTTPStatus.NOT_FOUND, "Unknown route.")

    def handle_google_search(self) -> None:
        load_local_env()
        try:
            body = self.read_json_body()
            query = str(body.get("query", "")).strip()
            response = search_google(
                query,
                cx=str(body.get("cx", "")).strip() or None,
                num=int(body.get("num", 8) or 8),
                search_type=str(body.get("searchType", "")).strip(),
                file_type=str(body.get("fileType", "")).strip(),
                site_search=str(body.get("siteSearch", "")).strip(),
                date_restrict=str(body.get("dateRestrict", "")).strip(),
                language_restrict=str(body.get("languageRestrict", "")).strip(),
            )
        except GoogleSearchConfigError as error:
            query = str(locals().get("body", {}).get("query", "")).strip()
            self.write_json(
                {
                    "ok": False,
                    "error": str(error),
                    "fallback": {
                        "provider": "google-programmable-search-element",
                        "searchUrl": fallback_search_url(query) if query else "",
                    },
                },
                HTTPStatus.SERVICE_UNAVAILABLE,
            )
            return
        except (GoogleSearchApiError, ValueError, json.JSONDecodeError) as error:
            self.write_json({"ok": False, "error": str(error)}, HTTPStatus.BAD_GATEWAY)
            return
        self.write_json({"ok": True, "response": response})

    def handle_file_import(self) -> None:
        try:
            filename, content_type, data = read_uploaded_file(self.headers, self.rfile)
            response = extract_uploaded_file(
                filename=filename,
                content_type=content_type,
                data=data,
            )
        except (FileImportError, MultipartUploadError) as error:
            self.write_json({"ok": False, "error": str(error)}, HTTPStatus.BAD_REQUEST)
            return
        except Exception as error:
            self.write_json({"ok": False, "error": f"File import failed: {error}"}, HTTPStatus.BAD_GATEWAY)
            return
        self.write_json({"ok": True, "file": response})

    def handle_team_chat(self) -> None:
        try:
            body = self.read_json_body()
            messages = apply_team_chat_action(body)
        except (ValueError, json.JSONDecodeError) as error:
            self.write_json({"ok": False, "error": str(error)}, HTTPStatus.BAD_REQUEST)
            return
        self.write_json({"ok": True, "messages": messages})

    def handle_openai_chat(self) -> None:
        load_local_env()
        try:
            body = self.read_json_body()
            response = openai_chat_response(
                body.get("messages") or [],
                body.get("context") if isinstance(body.get("context"), dict) else None,
                body.get("options") if isinstance(body.get("options"), dict) else None,
            )
        except OpenAIChatConfigError as error:
            self.write_json({"ok": False, "error": str(error)}, HTTPStatus.SERVICE_UNAVAILABLE)
            return
        except ValueError as error:
            self.write_json({"ok": False, "error": str(error)}, HTTPStatus.BAD_REQUEST)
            return
        except OpenAIChatApiError as error:
            status = safe_http_status(error.status_code, HTTPStatus.BAD_GATEWAY)
            self.write_json({"ok": False, "error": str(error), "errorType": error.error_type}, status)
            return
        except json.JSONDecodeError as error:
            self.write_json({"ok": False, "error": str(error), "errorType": "invalid_json"}, HTTPStatus.BAD_GATEWAY)
            return
        self.write_json({"ok": True, **response})

    def read_json_body(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length).decode("utf-8")
        return json.loads(raw or "{}")

    def write_json(self, payload: dict[str, Any], status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(payload, indent=2, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
        self.wfile.write(body)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Serve the CORE Research Atlas.")
    parser.add_argument("--host", default=os.environ.get("HOST", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", "5177")))
    return parser.parse_args()


def read_team_messages() -> list[dict[str, Any]]:
    try:
        data = json.loads(TEAM_CHAT_PATH.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return []
    messages = data.get("messages", data if isinstance(data, list) else [])
    if not isinstance(messages, list):
        return []
    return [message for message in messages if isinstance(message, dict)][:TEAM_CHAT_LIMIT]


def write_team_messages(messages: list[dict[str, Any]]) -> None:
    TEAM_CHAT_PATH.parent.mkdir(parents=True, exist_ok=True)
    clean_messages = messages[:TEAM_CHAT_LIMIT]
    TEAM_CHAT_PATH.write_text(json.dumps({"messages": clean_messages}, indent=2, ensure_ascii=False), encoding="utf-8")


def apply_team_chat_action(body: dict[str, Any]) -> list[dict[str, Any]]:
    action = str(body.get("action", "")).strip()
    messages = read_team_messages()
    if action == "post":
        item = sanitize_team_message(body.get("item") or body.get("message") or {})
        messages.insert(0, item)
    elif action == "vote":
        item_id = str(body.get("id", "")).strip()
        user = str(body.get("user", "local")).strip() or "local"
        decision = str(body.get("decision", "")).strip()
        if decision not in {"add", "reject"}:
            raise ValueError("Team chat vote must be add or reject.")
        for message in messages:
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
        for message in messages:
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
    elif action == "react":
        item_id = str(body.get("id", "")).strip()
        user = str(body.get("user", "local")).strip() or "local"
        reaction = str(body.get("reaction", "")).strip()
        if reaction not in {"like", "dislike", ""}:
            raise ValueError("Team chat reaction must be like, dislike, or empty.")
        for message in messages:
            if message.get("id") == item_id:
                reactions = message.setdefault("reactions", {})
                if isinstance(reactions, dict):
                    if reaction:
                        reactions[user] = reaction
                    else:
                        reactions.pop(user, None)
                break
    else:
        raise ValueError("Unknown team chat action.")

    messages = dedupe_team_messages(messages)
    write_team_messages(messages)
    return messages


def sanitize_team_message(raw: Any) -> dict[str, Any]:
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
        "reactions": raw.get("reactions") if isinstance(raw.get("reactions"), dict) else {},
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


def dedupe_team_messages(messages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[str] = set()
    output: list[dict[str, Any]] = []
    for message in messages:
        item_id = str(message.get("id", "")).strip()
        if not item_id or item_id in seen:
            continue
        seen.add(item_id)
        output.append(message)
    return output[:TEAM_CHAT_LIMIT]


def safe_http_status(status_code: int, fallback: HTTPStatus) -> HTTPStatus:
    try:
        if 400 <= int(status_code) <= 599:
            return HTTPStatus(int(status_code))
    except (TypeError, ValueError):
        pass
    return fallback


def main() -> int:
    load_local_env()
    args = parse_args()
    server = ThreadingHTTPServer((args.host, args.port), CoreResearchHandler)
    print(f"CORE Research Atlas running at http://{args.host}:{args.port}/", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
