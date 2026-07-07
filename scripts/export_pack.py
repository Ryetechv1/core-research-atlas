#!/usr/bin/env python3
"""Create offline export files from data/research_seed.json.

The web app already exports JSON, TXT, and HTML in-browser. This script gives
Codex or a collaborator a reproducible command-line packer with no dependencies.
"""

from __future__ import annotations

import html
import json
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SEED_PATH = ROOT / "data" / "research_seed.json"
GATEWAY_PATH = ROOT / "data" / "internal_model_gateway.json"
REFERENCE_INGEST_PATH = ROOT / "data" / "reference_ingest.json"
DIST = ROOT / "dist"


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
    shutil.copyfile(GATEWAY_PATH, DIST / "internal_model_gateway.json")
    shutil.copyfile(REFERENCE_INGEST_PATH, DIST / "reference_ingest.json")


def write_txt(seed: dict) -> None:
    project = seed["project"]
    model = seed.get("internalModel", {})
    gateway = model.get("gateway", {})
    gateway_path = next(iter(gateway.get("paths", {"/resource/fetch": {}})))
    gateway_operation = (
        gateway.get("paths", {})
        .get(gateway_path, {})
        .get("get", {})
        .get("operationId", model.get("gatewayOperation", "fetchInternalData"))
    )
    core = seed.get("backendCore", {})
    parallel_api = seed.get("externalApis", {}).get("parallelExtract", {})
    scraper_api = seed.get("externalApis", {}).get("localWebScraper", {})
    cse_api = seed.get("externalApis", {}).get("googleProgrammableSearch", {})
    aiq_api = seed.get("externalApis", {}).get("nvidiaAIQResearch", {})
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
        "Internal model core:",
        f"{model.get('displayName', '')} - {model.get('status', '')}",
        f"Gateway operation: {gateway_operation}({model.get('targetParameter', 'target_id')}) at {gateway_path}",
        model.get("providerNote", ""),
        "",
        "Backend mechanics core:",
        f"{core.get('title', '')}: {core.get('summary', '')}",
        f"Stages: {', '.join(core.get('stages', []))}",
        "",
        "Parallel Extract API:",
        f"Local endpoint: {parallel_api.get('localEndpoint', '/api/extract')}",
        f"Upstream endpoint: {parallel_api.get('upstreamEndpoint', 'https://api.parallel.ai/v1/extract')}",
        f"Authentication: {parallel_api.get('auth', 'Server-side PARALLEL_API_KEY')}",
        f"Saved request logs: {len(seed.get('parallelExtractRuns', []))}",
        "",
        "Local Web Scraper:",
        f"Local endpoint: {scraper_api.get('localEndpoint', '/api/scrape')}",
        f"Authentication: {scraper_api.get('auth', 'No API key; public http/https targets only')}",
        f"Saved request logs: {len(seed.get('webScrapeRuns', []))}",
        f"Keyword mode: {scraper_api.get('keywordMode', False)}",
        f"Hidden search base: {scraper_api.get('searchBaseUrl', 'https://www.google.com/search?q=')}",
        f"Safeguards: {', '.join(scraper_api.get('safeguards', []))}",
        "",
        "Google Programmable Search:",
        f"Search engine ID: {cse_api.get('searchEngineId', '56f7592d1993141c3')}",
        f"Script URL: {cse_api.get('scriptUrl', 'https://cse.google.com/cse.js?cx=56f7592d1993141c3')}",
        f"Public URL: {cse_api.get('publicUrl', 'https://cse.google.com/cse?cx=56f7592d1993141c3#gsc.tab=0')}",
        f"Elements: {', '.join(cse_api.get('elements', ['gcse-searchbox', 'gcse-searchresults']))}",
        "",
        "Automated AI Research Bot:",
        f"Findings logged: {len(seed.get('autoBotFindings', []))}",
        f"Accepted findings: {len([entry for entry in seed.get('autoBotFindings', []) if entry.get('accepted')])}",
        "Cadence: opt-in, one attempt per minute, pauses for user review.",
        "",
        "File Import Layer:",
        f"Imported file logs: {len(seed.get('importedFiles', []))}",
        f"Created source records: {sum(item.get('recordsCreated', 0) for item in seed.get('importedFiles', []))}",
        "",
        "In-App Browser:",
        f"Captured browser targets: {len(seed.get('browserHistory', []))}",
        "",
        "NVIDIA AIQ Research:",
        f"Backend URL: {aiq_api.get('backendUrl', 'http://localhost:8000')}",
        f"Status: {aiq_api.get('status', 'Optional local/self-hosted research backend')}",
        f"Capabilities: {', '.join(aiq_api.get('capabilities', []))}",
        "",
        "Extraction results:",
    ]
    results = seed.get("extractionResults", [])
    if results:
        for result in results:
            lines.append(
                f"- {result.get('engine', '')} / {result.get('createdAt', '')} / "
                f"{len(result.get('items', []))} items"
            )
            lines.append(f"  Prompt: {result.get('sourcePrompt', 'Direct URL extraction run')}")
            for item in result.get("items", [])[:4]:
                url = item.get("url", "")
                lines.append(f"  * {item.get('title', '')}{f' - {url}' if url else ''}")
    else:
        lines.append("- No normalized extraction results yet.")
    lines.extend(
        [
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
    lines.extend(["", "Extraction jobs:"])
    jobs = seed.get("extractionJobs", [])
    if jobs:
        for job in jobs:
            lines.append(f"- {job.get('prompt', '')} [{job.get('mode', '')}; {', '.join(job.get('sourceTypes', []))}]")
    else:
        lines.append("- No queued extraction jobs in seed.")
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
    model = seed.get("internalModel", {})
    gateway = model.get("gateway", {})
    gateway_path = next(iter(gateway.get("paths", {"/resource/fetch": {}})))
    gateway_operation = (
        gateway.get("paths", {})
        .get(gateway_path, {})
        .get("get", {})
        .get("operationId", model.get("gatewayOperation", "fetchInternalData"))
    )
    core = seed.get("backendCore", {})
    parallel_api = seed.get("externalApis", {}).get("parallelExtract", {})
    scraper_api = seed.get("externalApis", {}).get("localWebScraper", {})
    cse_api = seed.get("externalApis", {}).get("googleProgrammableSearch", {})
    aiq_api = seed.get("externalApis", {}).get("nvidiaAIQResearch", {})
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
    result_rows = []
    for result in seed.get("extractionResults", []):
        for item in result.get("items", []):
            url = item.get("url", "")
            link = f'<a href="{html.escape(url)}">{html.escape(url)}</a>' if url else ""
            result_rows.append(
                "<tr>"
                f"<td>{html.escape(result.get('engine', ''))}</td>"
                f"<td>{html.escape(result.get('sourcePrompt', 'Direct URL extraction run'))}</td>"
                f"<td>{html.escape(item.get('title', ''))}</td>"
                f"<td>{link}</td>"
                f"<td>{html.escape(item.get('summary', ''))}</td>"
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
<h2>Internal Model Core</h2>
<p>{html.escape(model.get("displayName", ""))} / {html.escape(model.get("status", ""))}. Gateway: {html.escape(gateway_operation)}({html.escape(model.get("targetParameter", "target_id"))}) at {html.escape(gateway_path)}.</p>
<p>{html.escape(core.get("title", ""))}: {html.escape(core.get("summary", ""))}</p>
<h2>Parallel Extract API</h2>
<p>Local endpoint: {html.escape(parallel_api.get("localEndpoint", "/api/extract"))}. Upstream endpoint: {html.escape(parallel_api.get("upstreamEndpoint", "https://api.parallel.ai/v1/extract"))}. Authentication: {html.escape(parallel_api.get("auth", "Server-side PARALLEL_API_KEY"))}.</p>
<h2>Local Web Scraper</h2>
<p>Local endpoint: {html.escape(scraper_api.get("localEndpoint", "/api/scrape"))}. Authentication: {html.escape(scraper_api.get("auth", "No API key; public http/https targets only"))}. Keyword mode: {html.escape(str(bool(scraper_api.get("keywordMode", False))))}. Hidden search base: {html.escape(scraper_api.get("searchBaseUrl", "https://www.google.com/search?q="))}. Safeguards: {html.escape(", ".join(scraper_api.get("safeguards", [])))}.</p>
<h2>Google Programmable Search</h2>
<p>Search engine ID: {html.escape(cse_api.get("searchEngineId", "56f7592d1993141c3"))}. Script URL: {html.escape(cse_api.get("scriptUrl", "https://cse.google.com/cse.js?cx=56f7592d1993141c3"))}. Public URL: {html.escape(cse_api.get("publicUrl", "https://cse.google.com/cse?cx=56f7592d1993141c3#gsc.tab=0"))}.</p>
<h2>Automated AI Research Bot</h2>
<p>{html.escape(str(len(seed.get("autoBotFindings", []))))} findings logged; {html.escape(str(len([entry for entry in seed.get("autoBotFindings", []) if entry.get("accepted")])))} accepted into source sections. Cadence: opt-in, one attempt per minute, pauses for user review.</p>
<h2>File Import Layer</h2>
<p>{html.escape(str(len(seed.get("importedFiles", []))))} imported file logs; {html.escape(str(sum(item.get("recordsCreated", 0) for item in seed.get("importedFiles", []))))} source records created from uploaded files.</p>
<h2>In-App Browser</h2>
<p>{html.escape(str(len(seed.get("browserHistory", []))))} captured browser targets.</p>
<h2>NVIDIA AIQ Research</h2>
<p>Backend URL: {html.escape(aiq_api.get("backendUrl", "http://localhost:8000"))}. Status: {html.escape(aiq_api.get("status", "Optional local/self-hosted research backend"))}.</p>
<h2>Extraction Results</h2>
<table>
<thead><tr><th>Engine</th><th>Prompt</th><th>Title</th><th>URL</th><th>Summary</th></tr></thead>
<tbody>{''.join(result_rows) or '<tr><td colspan="5">No normalized extraction results yet.</td></tr>'}</tbody>
</table>
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
