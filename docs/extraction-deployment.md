# Web Scraping Extraction Deployment

This project exposes local extraction, import, free-model, and collaboration APIs:

- `POST /api/scrape` runs the local dependency-free HTML/text scraper.
- `POST /api/import-file` parses uploaded research files for source import.
- `POST /api/local-agent` calls a free local Ollama-compatible model endpoint.
- `POST /api/agent` optionally calls OpenAI when `OPENAI_API_KEY` is configured.
- `GET/POST /api/team-chat` syncs runtime team messages, updates, links, recommendations, votes, rejects, and promote-to-source actions.

`/api/scrape` accepts:

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

`include_links` controls whether the scraper returns page links for in-app previews.

`/api/local-agent` accepts archive, profile, browser, source, extraction, and memory-bank context from the agent console and returns a synthesized answer from the configured local model.

`/api/import-file` accepts multipart form data with a field named `file`. It returns extracted text, summary, keywords, parser warnings, and child-file summaries for ZIP exports.

## Local Python

```powershell
$env:LOCAL_AGENT_MODEL = "llama3.2:3b"
$env:LOCAL_AGENT_BASE_URL = "http://127.0.0.1:11434"
python server.py
```

Open `http://127.0.0.1:5177/`.

For mobile testing on the same network, bind to all interfaces and use the computer's LAN IP:

```powershell
python server.py --host 0.0.0.0 --port 5177
```

Open `http://YOUR-LAN-IP:5177/` from the mobile browser. Do not use `localhost` from the phone because it points to the phone itself.

For the free model path, install and run Ollama separately, then pull a model:

```powershell
ollama pull llama3.2:3b
```

If Ollama is not running, the app falls back to the optional OpenAI route and then to the browser-only synthesis path.

## Result Display, Previews, and Persistence

The browser app stores normalized extraction records in `archive.extractionResults`. Each record has:

- A stable local ID, owner, timestamp, engine, status, request, and source prompt.
- Normalized result items with title, URL, final URL, content type/status, summary, preview links, citations, and fetched text.
- Copy JSON and Promote actions for moving a result item into the source archive.

This follows the same persistence rule used for AI generation UIs: every expensive or non-repeatable generation/extraction gets an ID and is stored immediately. The current build persists to localStorage and exported JSON/HTML/TXT; production should replace that with a database.

The Extract panel also renders the newest result in a visual feed/browser card, with the fetched information, original URL, links, and an Open In-App action.

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

- Text-like files are decoded directly, including TXT, Markdown, HTML, JSON,
  Python, JavaScript, and CSS.
- `.docx` uses stdlib ZIP/XML extraction.
- `.pdf` uses `pypdf` or `PyPDF2` if present, otherwise printable text recovery.
- `.doc` is printable-text best effort.
- `.zip` is treated as an export bundle and scans supported child files.
- Image files such as PNG, JPG, JPEG, WebP, GIF, SVG, BMP, TIFF, HEIC, and AVIF
  are imported as metadata records for source logging and review.

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

## Free Local Model Options

The implemented backend route uses Ollama because it is the simplest free local model path for this Python app: the browser posts to `/api/local-agent`, and Python posts to `LOCAL_AGENT_BASE_URL/api/chat`.

Other no-billing options are documented for future work:

- WebLLM can run models in the browser with WebGPU and no server key.
- Transformers.js can run smaller browser-side or Node-side models.
- llama.cpp-compatible servers can be adapted by changing `LOCAL_AGENT_BASE_URL` and the request adapter.

## Internal Memory Bank

The app stores a memory bank in browser localStorage under the app namespace. Each successful archive update creates a timestamped snapshot with:

- reason
- owner
- source/chat/document/extraction counts
- the complete archive payload

This protects against accidental in-app overwrites, but it is still browser storage. Users should export the memory bank before clearing browser data, changing browsers, or moving devices.

## Render Web Service

Use `render.yaml`.

- Start command binds to `0.0.0.0` and `$PORT`.
- Health check path is `/api/health`.
- `LOCAL_AGENT_MODEL` and `LOCAL_AGENT_BASE_URL` are declared for the local model adapter. Hosted Render services usually cannot access a model running on your laptop; use this route for self-hosted model infrastructure or keep the browser fallback.

## Vercel

Use `vercel.json` plus the `api/` Python serverless handlers.

No paid extraction key is required. Optional OpenAI support uses `OPENAI_API_KEY`; the free local model route requires an accessible Ollama-compatible server.

Useful Vercel REST API endpoints for automation:

- `GET /v9/projects`
- `POST /v9/projects/:id/env`
- `GET /v13/deployments`

## Cloudflare Workers / Agents

The old paid extraction Worker scaffold was removed. A future Cloudflare Worker can still be added for durable scraping queues, scheduled research jobs, or a hosted model gateway, but it should be built around the current normalized `archive.extractionResults` shape.

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
