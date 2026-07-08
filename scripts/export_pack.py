#!/usr/bin/env python3
"""Create offline export files from data/research_seed.json.

The web app already exports JSON, TXT, and HTML in-browser. This script gives
Codex or a collaborator a reproducible command-line packer with no dependencies.
"""

from __future__ import annotations

import html
import json
import re
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SEED_PATH = ROOT / "data" / "research_seed.json"
REFERENCE_INGEST_PATH = ROOT / "data" / "reference_ingest.json"
DIST = ROOT / "dist"


def strip_html(value: str) -> str:
    text = re.sub(r"<(script|style)[\s\S]*?</\1>", " ", str(value or ""), flags=re.IGNORECASE)
    text = re.sub(r"<br\s*/?>|</p>|</h[1-6]>|</li>", "\n", text, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", text)
    return html.unescape(re.sub(r"\s+", " ", text)).strip()


def load_seed() -> dict:
    with SEED_PATH.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def write_json(seed: dict) -> None:
    (DIST / "core-research-atlas.json").write_text(
        json.dumps(seed, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def write_js(seed: dict) -> None:
    payload = json.dumps(seed, indent=2, ensure_ascii=False)
    (DIST / "core-research-atlas.seed.js").write_text(
        "window.CORE_RESEARCH_SEED = " + payload + ";\n",
        encoding="utf-8",
    )


def write_support_files() -> None:
    shutil.copyfile(REFERENCE_INGEST_PATH, DIST / "reference_ingest.json")


def write_txt(seed: dict) -> None:
    project = seed["project"]
    core = seed.get("backendCore", {})
    cse_api = seed.get("externalApis", {}).get("googleProgrammableSearch", {})
    google_json_api = seed.get("externalApis", {}).get("googleCustomSearchJson", {})
    lines = [
        project["name"],
        f"Version: {project['version']}",
        "",
        "Epistemic policy:",
        project["epistemicPolicy"],
        "",
        "AI/search connector note:",
        project.get("aiConnectorNote", "Live web fetching and model execution require a backend/API connector."),
        "",
        "Backend mechanics core:",
        f"{core.get('title', '')}: {core.get('summary', '')}",
        f"Stages: {', '.join(core.get('stages', []))}",
        "",
        "Google Programmable Search:",
        f"Search engine ID: {cse_api.get('searchEngineId', '56f7592d1993141c3')}",
        f"Script URL: {cse_api.get('scriptUrl', 'https://cse.google.com/cse.js?cx=56f7592d1993141c3')}",
        f"Public URL: {cse_api.get('publicUrl', 'https://cse.google.com/cse?cx=56f7592d1993141c3#gsc.tab=0')}",
        f"Elements: {', '.join(cse_api.get('elements', ['gcse-searchbox', 'gcse-searchresults']))}",
        "",
        "Google Custom Search JSON API:",
        f"Local endpoint: {google_json_api.get('localEndpoint', '/api/search')}",
        f"Authentication: {google_json_api.get('auth', 'Server-side GOOGLE_CUSTOM_SEARCH_API_KEY')}",
        f"Status: {google_json_api.get('status', 'Preferred backend search path with CSE fallback.')}",
        "",
        "File Import Layer:",
        f"Imported file logs: {len(seed.get('importedFiles', []))}",
        f"Created source records: {sum(item.get('recordsCreated', 0) for item in seed.get('importedFiles', []))}",
        "",
        "In-App Browser:",
        f"Captured browser targets: {len(seed.get('browserHistory', []))}",
        "",
        "Team Chat and Recommendations:",
        f"Team posts stored: {len(seed.get('teamMessages', []))}",
        f"Open recommendations: {len([item for item in seed.get('teamMessages', []) if item.get('type') == 'recommendation' and item.get('status') != 'rejected'])}",
        "",
        "Collaboration Documents:",
        f"Draft documents stored: {len(seed.get('collabDocs', []))}",
    ]
    for doc in seed.get("collabDocs", [])[:8]:
        lines.append(
            f"- {doc.get('title', '')} "
            f"({doc.get('type', 'Document')}; {doc.get('status', 'Draft')}; {doc.get('owner', 'Unassigned')})"
        )
    lines.extend(
        [
            "",
            "Internal Memory Bank:",
            "Browser runtime snapshots are stored locally by the app and exported separately from the live browser.",
            "",
            "Uploaded reference layer:",
        ]
    )
    for reference in seed.get("referenceLibrary", []):
        lines.append(
            f"- {reference.get('title', '')} "
            f"({reference.get('pageCount', 0)} pages; {reference.get('evidenceTier', '')}; "
            f"{reference.get('citationStatus', '')})"
        )
    lines.extend(
        [
            "",
            "Key terms:",
        ]
    )
    lines.extend(f"- {term}" for term in seed.get("keyTerms", []))
    lines.extend(["", "User profiles:"])
    for profile in seed.get("profiles", []):
        lines.extend(
            [
                f"- {profile.get('username', '')}: {profile.get('animalForm', '')}",
                f"  Spirits: {profile.get('animalSpirits', '')}",
                f"  Identity: {profile.get('identityStatement', '')}",
            ]
        )
    lines.extend(["", "Source log:"])
    for source in seed["sources"]:
        lines.extend(
            [
                "",
                f"## {source['title']}",
                f"Category: {source['category']}",
                f"Form: {source['species']}",
                f"Domain: {source['domain']}",
                f"Source type: {source.get('sourceType', 'URL')}",
                f"Evidence: {source['evidenceTier']}",
                f"Citation: {source['citationStatus']}",
                f"Locator: {source.get('url', 'None yet') or 'None yet'}",
                f"Terms: {', '.join(source['terms']) or 'None yet'}",
                f"Notes: {source['notes']}",
            ]
        )
    (DIST / "core-research-atlas.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_html(seed: dict) -> None:
    project = seed["project"]
    core = seed.get("backendCore", {})
    cse_api = seed.get("externalApis", {}).get("googleProgrammableSearch", {})
    google_json_api = seed.get("externalApis", {}).get("googleCustomSearchJson", {})
    reference_rows = []
    for reference in seed.get("referenceLibrary", []):
        reference_rows.append(
            "<tr>"
            f"<td>{html.escape(reference.get('title', ''))}</td>"
            f"<td>{html.escape(str(reference.get('pageCount', 0)))}</td>"
            f"<td>{html.escape(reference.get('evidenceTier', ''))}</td>"
            f"<td>{html.escape(reference.get('citationStatus', ''))}</td>"
            f"<td>{html.escape(reference.get('backendUse', ''))}</td>"
            "</tr>"
        )
    rows = []
    for source in seed["sources"]:
        rows.append(
            "<tr>"
            f"<td>{html.escape(source['title'])}</td>"
            f"<td>{html.escape(source['category'])}</td>"
            f"<td>{html.escape(source['species'])}</td>"
            f"<td>{html.escape(source['domain'])}</td>"
            f"<td>{html.escape(source.get('sourceType', 'URL'))}</td>"
            f"<td>{html.escape(source['evidenceTier'])}</td>"
            f"<td>{html.escape(source['citationStatus'])}</td>"
            "</tr>"
        )
    doc_rows = []
    for doc in seed.get("collabDocs", []):
        doc_rows.append(
            "<tr>"
            f"<td>{html.escape(doc.get('title', ''))}</td>"
            f"<td>{html.escape(doc.get('type', 'Document'))}</td>"
            f"<td>{html.escape(doc.get('status', 'Draft'))}</td>"
            f"<td>{html.escape(doc.get('owner', 'Unassigned'))}</td>"
            f"<td>{html.escape(strip_html(doc.get('contentHtml', ''))[:220])}</td>"
            "</tr>"
        )
    document = f"""<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>{html.escape(project["name"])} Digest</title>
<style>
body{{font-family:Inter,Arial,sans-serif;margin:32px;color:#17211f;background:#f7f8f4}}
h1{{font-size:28px}}p{{max-width:900px;line-height:1.5;color:#59645f}}
table{{border-collapse:collapse;width:100%;background:#fff}}
th,td{{border:1px solid #d8ded7;padding:10px;text-align:left;font-size:13px}}
th{{background:#edf1ed}}
</style>
<h1>{html.escape(project["name"])}</h1>
<p>{html.escape(project["epistemicPolicy"])}</p>
<p>{html.escape(project.get("aiConnectorNote", "Live web fetching and model execution require a backend/API connector."))}</p>
<p>{html.escape(core.get("title", ""))}: {html.escape(core.get("summary", ""))}</p>
<h2>Google Programmable Search</h2>
<p>Search engine ID: {html.escape(cse_api.get("searchEngineId", "56f7592d1993141c3"))}. Script URL: {html.escape(cse_api.get("scriptUrl", "https://cse.google.com/cse.js?cx=56f7592d1993141c3"))}. Public URL: {html.escape(cse_api.get("publicUrl", "https://cse.google.com/cse?cx=56f7592d1993141c3#gsc.tab=0"))}.</p>
<h2>Google Custom Search JSON API</h2>
<p>Local endpoint: {html.escape(google_json_api.get("localEndpoint", "/api/search"))}. Authentication: {html.escape(google_json_api.get("auth", "Server-side GOOGLE_CUSTOM_SEARCH_API_KEY"))}. Status: {html.escape(google_json_api.get("status", "Preferred backend search path with CSE fallback."))}</p>
<h2>File Import Layer</h2>
<p>{html.escape(str(len(seed.get("importedFiles", []))))} imported file logs; {html.escape(str(sum(item.get("recordsCreated", 0) for item in seed.get("importedFiles", []))))} source records created from uploaded files.</p>
<h2>In-App Browser</h2>
<p>{html.escape(str(len(seed.get("browserHistory", []))))} captured browser targets.</p>
<h2>Team Chat and Recommendations</h2>
<p>{html.escape(str(len(seed.get("teamMessages", []))))} team posts stored; {html.escape(str(len([item for item in seed.get("teamMessages", []) if item.get("type") == "recommendation" and item.get("status") != "rejected"])))} open recommendations.</p>
<h2>Collaboration Documents</h2>
<table>
<thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Owner</th><th>Preview</th></tr></thead>
<tbody>{''.join(doc_rows) or '<tr><td colspan="5">No collaboration documents yet.</td></tr>'}</tbody>
</table>
<h2>Internal Memory Bank</h2>
<p>Browser runtime snapshots are stored locally by the app and can be exported from the Memory tab.</p>
<h2>Uploaded Reference Layer</h2>
<table>
<thead><tr><th>Title</th><th>Pages</th><th>Evidence</th><th>Citation</th><th>Backend Use</th></tr></thead>
<tbody>{''.join(reference_rows)}</tbody>
</table>
<h2>Source Log</h2>
<table>
<thead><tr><th>Title</th><th>Category</th><th>Form</th><th>Domain</th><th>Type</th><th>Evidence</th><th>Citation</th></tr></thead>
<tbody>{''.join(rows)}</tbody>
</table>
</html>
"""
    (DIST / "core-research-atlas-digest.html").write_text(document, encoding="utf-8")


def main() -> None:
    DIST.mkdir(exist_ok=True)
    seed = load_seed()
    write_json(seed)
    write_js(seed)
    write_support_files()
    write_txt(seed)
    write_html(seed)
    print(f"Wrote export pack to {DIST}")


if __name__ == "__main__":
    main()
