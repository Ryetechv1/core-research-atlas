from __future__ import annotations

import os
from http.server import BaseHTTPRequestHandler

from api._common import load_workspace_imports
from api._common import write_json


load_workspace_imports()

from scripts.local_free_agent import configured_local_model, is_local_agent_available  # noqa: E402


class handler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        write_json(
            self,
            {
                "ok": True,
                "service": "CORE Research Atlas",
                "platform": "vercel",
                "freeLocalAgentConfigured": is_local_agent_available(),
                "localAgentModel": configured_local_model(),
                "googleSearchConfigured": bool(
                    os.environ.get("GOOGLE_CUSTOM_SEARCH_API_KEY")
                    or os.environ.get("GOOGLE_CSE_API_KEY")
                    or os.environ.get("CUSTOM_SEARCH_API_KEY")
                ),
                "openaiAgentConfigured": bool(os.environ.get("OPENAI_API_KEY")),
                "agentModel": os.environ.get("OPENAI_AGENT_MODEL", "gpt-5.5"),
                "routes": [
                    "/api/health",
                    "/api/local-agent",
                    "/api/search",
                    "/api/agent",
                    "/api/scrape",
                    "/api/import-file",
                    "/api/team-chat",
                ],
            },
        )
