"""Extract readable research text from uploaded files.

The importer is intentionally dependency-light. It uses stdlib parsers for
text-like files, JSON, HTML, DOCX, and ZIP exports, and uses pypdf/PyPDF2 only
when those optional packages already exist in the environment.
"""

from __future__ import annotations

import html
import io
import json
import re
import zipfile
from pathlib import Path
from typing import Any
from xml.etree import ElementTree


TEXT_EXTENSIONS = {
    ".txt",
    ".md",
    ".markdown",
    ".py",
    ".js",
    ".ts",
    ".tsx",
    ".jsx",
    ".html",
    ".htm",
    ".json",
    ".csv",
    ".yaml",
    ".yml",
    ".xml",
}

MAX_TEXT_CHARS = 240_000
MAX_ZIP_MEMBERS = 80
MAX_ZIP_MEMBER_BYTES = 4_000_000


class FileImportError(ValueError):
    """Raised when a file cannot be parsed safely enough for import."""


def extract_uploaded_file(filename: str, content_type: str, data: bytes) -> dict[str, Any]:
    if not filename:
        raise FileImportError("Missing uploaded filename.")
    if not data:
        raise FileImportError("Uploaded file is empty.")

    suffix = Path(filename).suffix.lower()
    warnings: list[str] = []
    children: list[dict[str, Any]] = []

    if suffix in TEXT_EXTENSIONS:
        text = decode_text(data)
        parser = "text"
        if suffix in {".html", ".htm"}:
            text = html_to_text(text)
            parser = "html-strip"
        elif suffix == ".json":
            parser = "json-text"
            text = normalize_json_text(text, warnings)
    elif suffix == ".docx":
        text = extract_docx(data, warnings)
        parser = "docx-xml"
    elif suffix == ".pdf":
        text = extract_pdf(data, warnings)
        parser = "pdf"
    elif suffix == ".doc":
        text = extract_printable_binary(data)
        parser = "doc-binary-best-effort"
        warnings.append("Legacy .doc import is best-effort. Convert to .docx or .txt for cleaner extraction.")
    elif suffix == ".zip":
        text, children = extract_zip_export(data, warnings)
        parser = "zip-export"
    else:
        text = extract_printable_binary(data)
        parser = "binary-best-effort"
        warnings.append(f"Unsupported extension {suffix or '(none)'}; recovered printable text only.")

    clean = clean_text(text)
    if not clean:
        raise FileImportError("No readable text could be extracted from this file.")

    truncated = len(clean) > MAX_TEXT_CHARS
    clean = clean[:MAX_TEXT_CHARS]
    if truncated:
        warnings.append(f"Text was truncated to {MAX_TEXT_CHARS:,} characters for browser storage.")

    return {
        "fileName": filename,
        "extension": suffix or "unknown",
        "mimeType": content_type or "application/octet-stream",
        "size": len(data),
        "parser": parser,
        "text": clean,
        "summary": summarize_text(clean),
        "keywords": extract_keywords(clean),
        "children": children,
        "warnings": warnings,
    }


def decode_text(data: bytes) -> str:
    for encoding in ("utf-8-sig", "utf-8", "utf-16", "latin-1"):
        try:
            return data.decode(encoding)
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", errors="replace")


def clean_text(value: str) -> str:
    text = value.replace("\x00", " ")
    text = re.sub(r"\r\n?", "\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{4,}", "\n\n\n", text)
    return text.strip()


def html_to_text(value: str) -> str:
    no_script = re.sub(r"(?is)<(script|style).*?>.*?</\1>", " ", value)
    with_breaks = re.sub(r"(?i)<br\s*/?>|</p>|</h[1-6]>|</li>|</tr>", "\n", no_script)
    plain = re.sub(r"<[^>]+>", " ", with_breaks)
    return html.unescape(plain)


def normalize_json_text(value: str, warnings: list[str]) -> str:
    try:
        parsed = json.loads(value)
    except json.JSONDecodeError:
        warnings.append("JSON parse failed; imported as raw text.")
        return value
    return json.dumps(parsed, ensure_ascii=False, indent=2)


def extract_docx(data: bytes, warnings: list[str]) -> str:
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            document = archive.read("word/document.xml")
    except (KeyError, zipfile.BadZipFile) as error:
        raise FileImportError("Could not read DOCX document.xml.") from error

    try:
        root = ElementTree.fromstring(document)
    except ElementTree.ParseError as error:
        raise FileImportError("Could not parse DOCX XML content.") from error

    namespace = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
    paragraphs: list[str] = []
    for paragraph in root.iter(f"{namespace}p"):
        parts = [node.text or "" for node in paragraph.iter(f"{namespace}t")]
        line = "".join(parts).strip()
        if line:
            paragraphs.append(line)
    if not paragraphs:
        warnings.append("DOCX parsed but no paragraph text was found.")
    return "\n\n".join(paragraphs)


def extract_pdf(data: bytes, warnings: list[str]) -> str:
    for module_name in ("pypdf", "PyPDF2"):
        try:
            module = __import__(module_name)
            reader = module.PdfReader(io.BytesIO(data))
            pages = []
            for index, page in enumerate(reader.pages[:80], start=1):
                pages.append(f"[Page {index}]\n{page.extract_text() or ''}")
            if len(reader.pages) > 80:
                warnings.append("PDF extraction was limited to the first 80 pages.")
            return "\n\n".join(pages)
        except ImportError:
            continue
        except Exception as error:  # pragma: no cover - depends on third-party parser internals.
            warnings.append(f"{module_name} could not extract this PDF: {error}")
            break

    warnings.append("No PDF parser package was available; recovered printable strings only.")
    return extract_printable_binary(data)


def extract_zip_export(data: bytes, warnings: list[str]) -> tuple[str, list[dict[str, Any]]]:
    try:
        archive = zipfile.ZipFile(io.BytesIO(data))
    except zipfile.BadZipFile as error:
        raise FileImportError("Uploaded ZIP could not be opened.") from error

    blocks: list[str] = []
    children: list[dict[str, Any]] = []
    with archive:
        members = [info for info in archive.infolist() if not info.is_dir()]
        supported = [info for info in members if Path(info.filename).suffix.lower() in TEXT_EXTENSIONS | {".docx", ".pdf", ".doc"}]
        for info in supported[:MAX_ZIP_MEMBERS]:
            if info.file_size > MAX_ZIP_MEMBER_BYTES:
                warnings.append(f"Skipped {info.filename}: larger than {MAX_ZIP_MEMBER_BYTES:,} bytes.")
                continue
            try:
                child_data = archive.read(info)
                child = extract_uploaded_file(info.filename, "", child_data)
            except Exception as error:
                warnings.append(f"Skipped {info.filename}: {error}")
                continue
            child_summary = {
                "fileName": child["fileName"],
                "extension": child["extension"],
                "size": child["size"],
                "parser": child["parser"],
                "summary": child["summary"],
                "keywords": child["keywords"],
            }
            children.append(child_summary)
            blocks.append(f"===== {info.filename} =====\n{child['text']}")
        if len(supported) > MAX_ZIP_MEMBERS:
            warnings.append(f"ZIP import was limited to {MAX_ZIP_MEMBERS} supported files.")
    if not blocks:
        raise FileImportError("ZIP did not contain supported readable files.")
    return "\n\n".join(blocks), children


def extract_printable_binary(data: bytes) -> str:
    text = decode_text(data)
    chunks = re.findall(r"[\x20-\x7E]{4,}", text)
    if chunks:
        return "\n".join(chunks)
    return text


def summarize_text(value: str) -> str:
    text = clean_text(value)
    paragraphs = [part.strip() for part in re.split(r"\n\s*\n", text) if part.strip()]
    if not paragraphs:
        return text[:700]
    summary = " ".join(paragraphs[:3])
    return summary[:900]


def extract_keywords(value: str) -> list[str]:
    words = re.findall(r"[A-Za-z][A-Za-z-]{3,}", value.lower())
    stop = {
        "that",
        "this",
        "with",
        "from",
        "have",
        "into",
        "about",
        "there",
        "their",
        "would",
        "could",
        "should",
        "research",
        "source",
        "sources",
    }
    counts: dict[str, int] = {}
    for word in words:
        if word in stop:
            continue
        counts[word] = counts.get(word, 0) + 1
    return [word for word, _ in sorted(counts.items(), key=lambda item: (-item[1], item[0]))[:16]]
