#!/usr/bin/env python3
"""Conservative server-side web scraping extractor.

The extractor is dependency-free and intended for research lead generation, not
for bypassing paywalls, login walls, robots policies, or rate limits.
"""

from __future__ import annotations

import argparse
import html
import ipaddress
import json
import os
import re
import socket
import sys
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from typing import Any


DEFAULT_MAX_BYTES = 2_000_000
DEFAULT_TIMEOUT = 20
USER_AGENT = "CORE-Research-Atlas/0.3 (+local research extractor)"


class ScrapeError(RuntimeError):
    """Raised when a page cannot be fetched or extracted safely."""


class HtmlTextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._skip_depth = 0
        self._active_tag = ""
        self.title_parts: list[str] = []
        self.meta_description = ""
        self.headings: list[str] = []
        self.paragraphs: list[str] = []
        self.links: list[dict[str, str]] = []
        self._link_href = ""

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        attr_map = {name.lower(): value or "" for name, value in attrs}
        if tag in {"script", "style", "noscript", "svg", "canvas"}:
            self._skip_depth += 1
        if tag == "meta":
            name = attr_map.get("name", "").lower()
            prop = attr_map.get("property", "").lower()
            if name == "description" or prop == "og:description":
                self.meta_description = clean_text(attr_map.get("content", ""))[:500]
        if tag == "a":
            self._link_href = attr_map.get("href", "")
        self._active_tag = tag

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag in {"script", "style", "noscript", "svg", "canvas"} and self._skip_depth:
            self._skip_depth -= 1
        if tag == "a":
            self._link_href = ""
        self._active_tag = ""

    def handle_data(self, data: str) -> None:
        if self._skip_depth:
            return
        text = clean_text(data)
        if not text:
            return
        if self._active_tag == "title":
            self.title_parts.append(text)
        elif self._active_tag in {"h1", "h2", "h3"} and len(self.headings) < 20:
            self.headings.append(text)
        elif self._active_tag == "p" and len(text) > 30 and len(self.paragraphs) < 60:
            self.paragraphs.append(text)
        elif self._active_tag == "a" and self._link_href and len(self.links) < 40:
            self.links.append({"text": text[:160], "href": self._link_href})


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(value)).strip()


def resolve_public_host(hostname: str) -> None:
    if os.environ.get("ALLOW_PRIVATE_SCRAPE_TARGETS") == "1":
        return
    lowered = hostname.lower()
    if lowered in {"localhost", "localhost.localdomain"} or lowered.endswith(".local"):
        raise ScrapeError("Private or local host targets are disabled.")
    try:
        addresses = socket.getaddrinfo(hostname, None, proto=socket.IPPROTO_TCP)
    except socket.gaierror as error:
        raise ScrapeError(f"Could not resolve host: {hostname}") from error
    for family, _, _, _, sockaddr in addresses:
        raw_ip = sockaddr[0]
        try:
            ip = ipaddress.ip_address(raw_ip)
        except ValueError:
            continue
        if (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_multicast
            or ip.is_reserved
            or ip.is_unspecified
        ):
            raise ScrapeError("Private, reserved, loopback, and link-local scrape targets are disabled.")


def normalize_url(url: str) -> str:
    parsed = urllib.parse.urlparse(url.strip())
    if parsed.scheme not in {"http", "https"}:
        raise ScrapeError("Only http and https URLs are supported.")
    if not parsed.hostname:
        raise ScrapeError("URL must include a host.")
    if parsed.username or parsed.password:
        raise ScrapeError("URLs with embedded credentials are not supported.")
    resolve_public_host(parsed.hostname)
    return urllib.parse.urlunparse(parsed)


def decode_body(raw: bytes, content_type: str) -> str:
    match = re.search(r"charset=([\w.-]+)", content_type, re.IGNORECASE)
    charset = match.group(1) if match else "utf-8"
    try:
        return raw.decode(charset, errors="replace")
    except LookupError:
        return raw.decode("utf-8", errors="replace")


def scrape_url(url: str, *, full_content: bool = False, include_links: bool = True, timeout: int = DEFAULT_TIMEOUT) -> dict[str, Any]:
    normalized = normalize_url(url)
    request = urllib.request.Request(
        normalized,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            content_type = response.headers.get("Content-Type", "")
            raw = response.read(DEFAULT_MAX_BYTES + 1)
            truncated = len(raw) > DEFAULT_MAX_BYTES
            raw = raw[:DEFAULT_MAX_BYTES]
            final_url = response.geturl()
            status = getattr(response, "status", 200)
    except urllib.error.HTTPError as error:
        raise ScrapeError(f"HTTP {error.code} while fetching {normalized}") from error
    except urllib.error.URLError as error:
        raise ScrapeError(f"Fetch failed for {normalized}: {error.reason}") from error

    text = decode_body(raw, content_type)
    parser = HtmlTextExtractor()
    parser.feed(text)
    combined_text = clean_text(" ".join(parser.headings + parser.paragraphs))
    output: dict[str, Any] = {
        "url": normalized,
        "finalUrl": final_url,
        "status": status,
        "contentType": content_type,
        "truncated": truncated,
        "title": clean_text(" ".join(parser.title_parts))[:240],
        "description": parser.meta_description,
        "headings": parser.headings,
        "summary": combined_text[:1200],
        "textLength": len(combined_text),
    }
    if include_links:
        output["links"] = [
            {"text": link["text"], "href": urllib.parse.urljoin(final_url, link["href"])}
            for link in parser.links
            if link.get("href")
        ]
    if full_content:
        output["content"] = combined_text[:25_000]
    return output


def scrape_urls(urls: list[str], *, full_content: bool = False, include_links: bool = True) -> dict[str, Any]:
    results = []
    for url in urls:
        try:
            results.append({"ok": True, **scrape_url(url, full_content=full_content, include_links=include_links)})
        except ScrapeError as error:
            results.append({"ok": False, "url": url, "error": str(error)})
    return {"results": results}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run local web scraping extraction.")
    parser.add_argument("urls", nargs="+")
    parser.add_argument("--full-content", action="store_true")
    parser.add_argument("--no-links", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    payload = scrape_urls(args.urls, full_content=args.full_content, include_links=not args.no_links)
    print(json.dumps(payload, indent=2, ensure_ascii=False))
    return 0 if all(item.get("ok") for item in payload["results"]) else 1


if __name__ == "__main__":
    raise SystemExit(main())
