# Web Scraping Extraction Deployment

This project now exposes three extraction APIs plus one collaboration endpoint:

- `POST /api/extract` proxies Parallel Extract with `PARALLEL_API_KEY`.
- `POST /api/scrape` runs the local dependency-free HTML/text scraper.
- `POST /api/import-file` parses uploaded research files for source import.
- `GET/POST /api/team-chat` syncs runtime team messages, updates, links, recommendations, votes, rejects, and promote-to-source actions.

Both accept:

```json
{
  "urls": ["https://www.google.com"],
  "objective": "Optional focused research prompt from the Extract Console or agent console.",
  "advanced_settings": {
    "full_content": false,
    "include_links": true
  }
}
```

`include_links` applies to `/api/scrape`; Parallel ignores it.

`/api/import-file` accepts multipart form data with a field named `file`. It returns extracted text, summary, keywords, parser warnings, and child-file summaries for ZIP exports.

## Local Python

```powershell
$env:PARALLEL_API_KEY = "your_parallel_key"
python server.py
```

Open `http://127.0.0.1:5177/`.

For mobile testing on the same network, bind to all interfaces and use the computer's LAN IP:

```powershell
python server.py --host 0.0.0.0 --port 5177
```

Open `http://YOUR-LAN-IP:5177/` from the mobile browser. Do not use `localhost` from the phone because it points to the phone itself.

## Result Display and Persistence

The browser app stores normalized extraction records in `archive.extractionResults`. Each record has:

- A stable local ID, owner, timestamp, engine, status, request, and source prompt.
- Normalized result items with title, URL, final URL, content type/status, summary, and links/citations.
- Copy JSON and Promote actions for moving a result item into the source archive.

This follows the same persistence rule used for AI generation UIs: every expensive or non-repeatable generation/extraction gets an ID and is stored immediately. The current build persists to localStorage and exported JSON/HTML/TXT; production should replace that with a database.

## Keyword Search Mode

The visible UI accepts search keywords, not raw Google URLs. The app builds the target internally:

```text
https://www.google.com/search?q=<encoded keywords>
```

Each keyword search opens a choice modal:

- Open the generated Google search URL externally.
- Show the `/api/scrape` output inside the current Extract or Agent subwindow.

This keeps links visible and lets the user choose between browser-native search and in-app source-card review.

Extraction jobs and agent replies include the active Browser panel URL, recent browser history, captured browser source leads, and browser search text as context. Production storage should persist that browser context alongside each extraction result so links remain auditable later.

## Automated AI Research Bot

The bot is opt-in and review-gated:

- It rotates through content sections and builds one focused keyword query per attempt.
- It runs no more than once per minute while active.
- It pauses when it finds a useful result and asks: "do you like this information?"
- "Yes" adds a source record to the matching content section with `citationStatus: "Needs verification"`.
- "No" asks what to improve and uses that feedback in the next recursive query.

## File Import and In-App Browser

The Import panel posts uploads to `/api/import-file`, then creates normalized `file-import` extraction results and optional Source records. The server parser is dependency-light:

- Text-like files are decoded directly.
- `.docx` uses stdlib ZIP/XML extraction.
- `.pdf` uses `pypdf` or `PyPDF2` if present, otherwise printable text recovery.
- `.doc` is printable-text best effort.
- `.zip` is treated as an export bundle and scans supported child files.

When hosted inside ChatGPT as an Apps SDK widget, the UI feature-detects `window.openai.selectFiles`, `window.openai.uploadFile`, and `window.openai.getFileDownloadUrl`. The normal file input remains the fallback.

The Browser panel embeds Google Programmable Search Engine `56f7592d1993141c3`:

```html
<script async src="https://cse.google.com/cse.js?cx=56f7592d1993141c3"></script>
<div class="gcse-searchbox"></div>
<div class="gcse-searchresults"></div>
```

Its public fallback URL is `https://cse.google.com/cse?cx=56f7592d1993141c3#gsc.tab=0`. The panel also uses a sandboxed iframe for fallback viewing and records history in `archive.browserHistory`. Some websites block iframe embedding; use the external-open action for those pages.

## Team Chat and Recommendation Review

The Team panel posts to `/api/team-chat` when the Python server or Vercel handler is available. Each recommendation can be rejected or promoted into Sources. Local static use still works through browser storage, but production should replace the runtime JSON/serverless memory layer with a database-backed collaboration table.

## NVIDIA AIQ Research Component

NVIDIA AI-Q is registered as an optional backend at `http://localhost:8000`. It is not called automatically. A production connector should health-check the trusted AI-Q server first, then attach returned reports, citations, and source URLs as `extractionResults` records.

## Render Web Service

Use `render.yaml`.

- Start command binds to `0.0.0.0` and `$PORT`.
- Health check path is `/api/health`.
- `PARALLEL_API_KEY` is declared as a non-synced secret.

## Vercel

Use `vercel.json` plus the `api/` Python serverless handlers.

Required project environment variable:

```text
PARALLEL_API_KEY
```

Useful Vercel REST API endpoints for automation:

- `GET /v9/projects`
- `POST /v9/projects/:id/env`
- `GET /v13/deployments`

## Cloudflare Workers / Agents

Use `cloudflare-extraction-agent/`.

```bash
cd cloudflare-extraction-agent
npm install
npx wrangler secret put PARALLEL_API_KEY
npm run deploy
```

The Worker exposes `/api/health`, `/api/extract`, `/api/scrape`, and an Agents SDK route at `/agents/ExtractionAgent/{session}`.

Cloudflare Agents provide durable state, real-time connections, scheduling, and tool-style routing. This scaffold keeps request history in the agent state and mirrors the Python API shape.

## Catalyst by Zoho

Catalyst deployment is blocked until this workspace is initialized with `catalyst init`.

Do not manually create `.catalystrc`, `catalyst.json`, or `functions/`. The Catalyst CLI must generate those IDs and deployment targets interactively.

## ChatGPT App Submission

This repo is not currently an MCP server and does not expose MCP tool descriptors, annotations, widget metadata, or output schemas. Because of that, `chatgpt-app-submission.json` is not generated yet. Create an MCP server layer first, then run the submission workflow.

## Performance Notes

The static app is dependency-free and serves local assets. For production, prefer:

- Compression and long-lived caching for static files.
- `Cache-Control: no-store` only on API responses.
- Fixed image dimensions to avoid layout shift.
- Health checks on `/api/health`.
