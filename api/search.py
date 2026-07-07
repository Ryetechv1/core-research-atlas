from __future__ import annotations

import json
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler

from api._common import load_workspace_imports, read_json, write_json


load_workspace_imports()

from scripts.google_search import GoogleSearchApiError, GoogleSearchConfigError, fallback_search_url, search_google  # noqa: E402


class handler(BaseHTTPRequestHandler):
    def do_POST(self) -> None:
        try:
            body = read_json(self)
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
            write_json(
                self,
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
            write_json(self, {"ok": False, "error": str(error)}, HTTPStatus.BAD_GATEWAY)
            return
        write_json(self, {"ok": True, "response": response})

