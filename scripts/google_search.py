#!/usr/bin/env python3
"""Google Programmable Search JSON API helper.

This module keeps Google API keys on the server side. The static browser app
receives normalized result cards only.
"""

from __future__ import annotations

import json
import os
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen


DEFAULT_CSE_ID = "56f7592d1993141c3"
GOOGLE_SEARCH_ENDPOINT = "https://customsearch.googleapis.com/customsearch/v1"
DEFAULT_TIMEOUT = 16
MAX_RESULTS = 10
USER_AGENT = "CORE-Research-Atlas/1.0"


class GoogleSearchConfigError(RuntimeError):
    """Raised when the Google search backend is not configured."""


class GoogleSearchApiError(RuntimeError):
    """Raised when Google search returns a failed response."""


def configured_api_key() -> str:
    key = (
        os.environ.get("GOOGLE_CUSTOM_SEARCH_API_KEY")
        or os.environ.get("GOOGLE_CSE_API_KEY")
        or os.environ.get("CUSTOM_SEARCH_API_KEY")
    )
    if not key:
        raise GoogleSearchConfigError(
            "GOOGLE_CUSTOM_SEARCH_API_KEY is not configured. Use the embedded Google CSE fallback or set the key server-side."
        )
    return key


def configured_cx(cx: str | None = None) -> str:
    value = (cx or os.environ.get("GOOGLE_CSE_ID") or DEFAULT_CSE_ID).strip()
    if not value:
        raise GoogleSearchConfigError("GOOGLE_CSE_ID is not configured.")
    return value


def search_google(
    query: str,
    *,
    cx: str | None = None,
    num: int = 8,
    search_type: str = "",
    file_type: str = "",
    site_search: str = "",
    date_restrict: str = "",
    language_restrict: str = "",
    safe: str = "active",
) -> dict[str, Any]:
    text = query.strip()
    if not text:
        raise ValueError("Search query is required.")

    api_key = configured_api_key()
    count = max(1, min(MAX_RESULTS, int(num or 8)))
    params: dict[str, str | int] = {
        "key": api_key,
        "cx": configured_cx(cx),
        "q": text,
        "num": count,
        "safe": safe or "active",
    }
    if search_type:
        params["searchType"] = search_type
    if file_type:
        params["fileType"] = file_type
    if site_search:
        params["siteSearch"] = site_search
    if date_restrict:
        params["dateRestrict"] = date_restrict
    if language_restrict:
        params["lr"] = language_restrict

    url = f"{GOOGLE_SEARCH_ENDPOINT}?{urlencode(params)}"
    request = Request(url, headers={"Accept": "application/json", "User-Agent": USER_AGENT})
    try:
        with urlopen(request, timeout=DEFAULT_TIMEOUT) as response:
            raw = response.read().decode("utf-8", errors="replace")
            payload = json.loads(raw or "{}")
    except HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")[:1200]
        raise GoogleSearchApiError(f"Google search HTTP {error.code}: {detail}") from error
    except URLError as error:
        raise GoogleSearchApiError(f"Google search request failed: {error.reason}") from error
    except json.JSONDecodeError as error:
        raise GoogleSearchApiError(f"Google search returned invalid JSON: {error}") from error

    return normalize_google_search(payload, query=text, cx=str(params["cx"]))


def normalize_google_search(payload: dict[str, Any], *, query: str, cx: str) -> dict[str, Any]:
    items = []
    for index, item in enumerate(payload.get("items") or []):
        if not isinstance(item, dict):
            continue
        pagemap = item.get("pagemap") if isinstance(item.get("pagemap"), dict) else {}
        metatags = pagemap.get("metatags") if isinstance(pagemap.get("metatags"), list) else []
        meta = metatags[0] if metatags and isinstance(metatags[0], dict) else {}
        url = str(item.get("link") or "").strip()
        title = str(item.get("title") or item.get("htmlTitle") or url or f"Search result {index + 1}").strip()
        snippet = str(item.get("snippet") or item.get("htmlSnippet") or meta.get("og:description") or "").strip()
        items.append(
            {
                "title": title,
                "url": url,
                "finalUrl": url,
                "summary": snippet,
                "contentType": str(item.get("mime") or ""),
                "publishDate": str(meta.get("article:published_time") or meta.get("date") or ""),
                "displayLink": str(item.get("displayLink") or ""),
                "formattedUrl": str(item.get("formattedUrl") or ""),
                "cacheId": str(item.get("cacheId") or ""),
                "links": [],
            }
        )

    search_info = payload.get("searchInformation") if isinstance(payload.get("searchInformation"), dict) else {}
    queries = payload.get("queries") if isinstance(payload.get("queries"), dict) else {}
    return {
        "ok": True,
        "provider": "google-custom-search-json",
        "query": query,
        "cx": cx,
        "totalResults": str(search_info.get("totalResults") or "0"),
        "searchTime": search_info.get("searchTime"),
        "items": items,
        "request": (queries.get("request") or [{}])[0] if isinstance(queries.get("request"), list) else {},
    }


def fallback_search_url(query: str, cx: str | None = None) -> str:
    return f"https://cse.google.com/cse?cx={configured_cx(cx)}#gsc.tab=0&gsc.q={quote(query)}"
