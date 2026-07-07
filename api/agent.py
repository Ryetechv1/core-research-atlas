from __future__ import annotations

import json
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler

from api._common import load_workspace_imports, read_json, write_json


load_workspace_imports()

from scripts.openai_agent import OpenAIAgentApiError, OpenAIAgentConfigError, create_research_answer  # noqa: E402


class handler(BaseHTTPRequestHandler):
    def do_POST(self) -> None:
        try:
            body = read_json(self)
            response = create_research_answer(body)
        except OpenAIAgentConfigError as error:
            write_json(
                self,
                {
                    "ok": False,
                    "error": str(error),
                    "fallback": "Use the local app synthesizer until OPENAI_API_KEY is configured on the backend host.",
                },
                HTTPStatus.SERVICE_UNAVAILABLE,
            )
            return
        except (OpenAIAgentApiError, ValueError, json.JSONDecodeError) as error:
            write_json(self, {"ok": False, "error": str(error)}, HTTPStatus.BAD_GATEWAY)
            return
        write_json(self, {"ok": True, "response": response})
