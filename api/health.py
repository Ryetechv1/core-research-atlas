from __future__ import annotations

import os
from http.server import BaseHTTPRequestHandler

from api._common import write_json


class handler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        write_json(
            self,
            {
                "ok": True,
                "service": "CORE Research Atlas",
                "platform": "vercel",
                "parallelConfigured": bool(os.environ.get("PARALLEL_API_KEY")),
                "googleSearchConfigured": bool(
                    os.environ.get("GOOGLE_CUSTOM_SEARCH_API_KEY")
                    or os.environ.get("GOOGLE_CSE_API_KEY")
                    or os.environ.get("CUSTOM_SEARCH_API_KEY")
                ),
                "routes": ["/api/health", "/api/extract", "/api/search", "/api/scrape", "/api/import-file", "/api/team-chat"],
            },
        )
