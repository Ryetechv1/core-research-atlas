from __future__ import annotations

import json
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler

from api._common import load_workspace_imports, read_json, write_json

load_workspace_imports()

from scripts.parallel_extract import ParallelApiError, ParallelConfigError, extract_urls  # noqa: E402


class handler(BaseHTTPRequestHandler):
    def do_POST(self) -> None:
        try:
            body = read_json(self)
            urls = body.get("urls", [])
            if isinstance(urls, str):
                urls = [urls]
            urls = [str(url).strip() for url in urls if str(url).strip()]
            settings = body.get("advanced_settings", {})
            objective = str(body.get("objective", "")).strip() or None
            response = extract_urls(urls, full_content=bool(settings.get("full_content", False)), objective=objective)
        except ParallelConfigError as error:
            write_json(self, {"ok": False, "error": str(error)}, HTTPStatus.SERVICE_UNAVAILABLE)
            return
        except (ParallelApiError, ValueError, json.JSONDecodeError) as error:
            write_json(self, {"ok": False, "error": str(error)}, HTTPStatus.BAD_GATEWAY)
            return
        write_json(self, {"ok": True, "response": response})
