#!/usr/bin/env python3
"""Serve the static app and proxy Parallel Extract requests.

Run with:
  python server.py

The server reads PARALLEL_API_KEY from the process environment, .env.local, or
.env. It never sends the key to the browser.
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
from scripts.multipart_upload import MultipartUploadError, read_uploaded_file
from scripts.parallel_extract import ParallelApiError, ParallelConfigError, extract_urls
from scripts.web_scrape_extract import scrape_urls


ROOT = Path(__file__).resolve().parent


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
                    "parallelConfigured": bool(os.environ.get("PARALLEL_API_KEY")),
                    "routes": ["/api/health", "/api/extract", "/api/scrape", "/api/import-file"],
                }
            )
            return
        super().do_GET()

    def do_POST(self) -> None:
        if self.path == "/api/extract":
            self.handle_parallel_extract()
            return
        if self.path == "/api/scrape":
            self.handle_web_scrape()
            return
        if self.path == "/api/import-file":
            self.handle_file_import()
            return
        self.write_json({"ok": False, "error": "Unknown API route."}, HTTPStatus.NOT_FOUND)

    def handle_parallel_extract(self) -> None:
        load_local_env()
        try:
            body = self.read_json_body()
            urls = body.get("urls", [])
            if isinstance(urls, str):
                urls = [urls]
            urls = [str(url).strip() for url in urls if str(url).strip()]
            settings = body.get("advanced_settings", {})
            full_content = bool(settings.get("full_content", False))
            objective = str(body.get("objective", "")).strip() or None
            response = extract_urls(urls, full_content=full_content, objective=objective)
        except ParallelConfigError as error:
            self.write_json({"ok": False, "error": str(error)}, HTTPStatus.SERVICE_UNAVAILABLE)
            return
        except (ParallelApiError, ValueError, json.JSONDecodeError) as error:
            self.write_json({"ok": False, "error": str(error)}, HTTPStatus.BAD_GATEWAY)
            return
        self.write_json({"ok": True, "response": response})

    def handle_web_scrape(self) -> None:
        try:
            body = self.read_json_body()
            urls = body.get("urls", [])
            if isinstance(urls, str):
                urls = [urls]
            urls = [str(url).strip() for url in urls if str(url).strip()]
            settings = body.get("advanced_settings", {})
            response = scrape_urls(
                urls,
                full_content=bool(settings.get("full_content", False)),
                include_links=bool(settings.get("include_links", True)),
            )
        except (ValueError, json.JSONDecodeError) as error:
            self.write_json({"ok": False, "error": str(error)}, HTTPStatus.BAD_REQUEST)
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
        self.end_headers()
        self.wfile.write(body)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Serve the CORE Research Atlas.")
    parser.add_argument("--host", default=os.environ.get("HOST", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", "5177")))
    return parser.parse_args()


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
