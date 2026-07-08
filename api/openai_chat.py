from __future__ import annotations

import json
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler

from api._common import load_workspace_imports, read_json, write_json


load_workspace_imports()

from scripts.openai_chat import OpenAIChatApiError, OpenAIChatConfigError, openai_chat_response  # noqa: E402


class handler(BaseHTTPRequestHandler):
    def do_POST(self) -> None:
        try:
            body = read_json(self)
            response = openai_chat_response(
                body.get("messages") or [],
                body.get("context") if isinstance(body.get("context"), dict) else None,
                body.get("options") if isinstance(body.get("options"), dict) else None,
            )
        except OpenAIChatConfigError as error:
            write_json(self, {"ok": False, "error": str(error)}, HTTPStatus.SERVICE_UNAVAILABLE)
            return
        except ValueError as error:
            write_json(self, {"ok": False, "error": str(error)}, HTTPStatus.BAD_REQUEST)
            return
        except OpenAIChatApiError as error:
            write_json(
                self,
                {"ok": False, "error": str(error), "errorType": error.error_type},
                safe_http_status(error.status_code, HTTPStatus.BAD_GATEWAY),
            )
            return
        except json.JSONDecodeError as error:
            write_json(self, {"ok": False, "error": str(error), "errorType": "invalid_json"}, HTTPStatus.BAD_GATEWAY)
            return
        write_json(self, {"ok": True, **response})


def safe_http_status(status_code: int, fallback: HTTPStatus) -> HTTPStatus:
    try:
        if 400 <= int(status_code) <= 599:
            return HTTPStatus(int(status_code))
    except (TypeError, ValueError):
        pass
    return fallback
