#!/usr/bin/env python3
"""Parallel Extract API client.

Uses the REST endpoint directly so the integration works without installing
third-party packages. Set PARALLEL_API_KEY in the process environment or in an
ignored local env file loaded by server.py.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from typing import Any


PARALLEL_EXTRACT_URL = "https://api.parallel.ai/v1/extract"


class ParallelConfigError(RuntimeError):
    """Raised when local API configuration is missing."""


class ParallelApiError(RuntimeError):
    """Raised when the upstream API returns an error."""


def extract_urls(
    urls: list[str],
    *,
    full_content: bool = False,
    objective: str | None = None,
    api_key: str | None = None,
    timeout: int = 60,
) -> dict[str, Any]:
    key = api_key or os.environ.get("PARALLEL_API_KEY")
    if not key:
        raise ParallelConfigError("PARALLEL_API_KEY is not configured.")
    if not urls:
        raise ValueError("At least one URL is required.")

    payload = {
        "urls": urls,
        "advanced_settings": {
            "full_content": full_content,
        },
    }
    if objective:
        payload["objective"] = objective
    body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        PARALLEL_EXTRACT_URL,
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "x-api-key": key,
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise ParallelApiError(f"Parallel API returned HTTP {error.code}: {detail}") from error
    except urllib.error.URLError as error:
        raise ParallelApiError(f"Parallel API request failed: {error.reason}") from error


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run a Parallel Extract request.")
    parser.add_argument("urls", nargs="+", help="One or more URLs to extract.")
    parser.add_argument("--full-content", action="store_true", help="Request full page content.")
    parser.add_argument("--objective", default="", help="Optional focused extraction objective.")
    parser.add_argument("--timeout", type=int, default=60, help="HTTP timeout in seconds.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        response = extract_urls(args.urls, full_content=args.full_content, objective=args.objective or None, timeout=args.timeout)
    except (ParallelConfigError, ParallelApiError, ValueError) as error:
        print(json.dumps({"ok": False, "error": str(error)}, indent=2), file=sys.stderr)
        return 1
    print(json.dumps(response, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
