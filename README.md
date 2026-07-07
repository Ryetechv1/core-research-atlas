# CORE Shapeshifting Research Atlas

A self-contained static research web app for building a collaborative archive around wolf, fox, kitsune, dragon, therianthropy, lycanthropy, alopecanthropy, dracanthrope, mental shifting, phantom shifting, occult metaphysics, and speculative biological or physiological models.

The app treats supernatural and metaphysical material as research artifacts with evidence labels. It does not present physical shapeshifting as established biomedical fact.

This build includes a local gated sign-in modal for the three project users, editable profile pages, source-type listings, file import, an in-app research browser, an extraction queue builder, a connector-ready AI synthesis console, team chat with recommendation review, an uploaded Internal Core System Gateway model profile, an ErydirCeisiwr backend mechanics scaffold, a metadata-only uploaded PDF reference layer, and Python-backed endpoints for Parallel, local HTML/text scraping, uploaded-file parsing, and team messages.

## Open The App

For the full app with the Parallel Extract proxy, run:

```powershell
python server.py
```

Then open:

```text
http://127.0.0.1:5177/
```

The static UI can still be opened directly with `index.html`, but `/api/extract` only works through the Python server.

## Files

- `index.html` - app shell and semantic UI.
- `styles.css` - responsive dashboard styling.
- `app.js` - local state, filters, add-source flow, browser-context synthesis, team chat, and browser exports.
- `server.py` - local Python static server, `/api/extract` proxy for Parallel, `/api/scrape` local scraper, `/api/import-file` parser, and `/api/team-chat` runtime message endpoint.
- `render.yaml` - Render Web Service blueprint with health check and server-side secret wiring.
- `vercel.json` - static routing plus Vercel Python API function routing.
- `manifest.webmanifest` - installable web-app metadata for future hosted/mobile use.
- `.env.example` - local environment variable template. Keep real keys in `.env.local` or the process environment.
- `api/` - Vercel-compatible Python serverless handlers.
- `cloudflare-extraction-agent/` - Cloudflare Workers / Agents SDK extraction scaffold.
- `data/internal_model_gateway.json` - uploaded OpenAPI-style gateway profile for future backend wiring.
- `data/reference_ingest.json` - metadata-only ingest of uploaded PDFs; no long source text is embedded.
- `data/research_seed.json` - importable starter schema and source log.
- `scripts/parallel_extract.py` - Python REST client for `https://api.parallel.ai/v1/extract`.
- `scripts/web_scrape_extract.py` - dependency-free local HTML/text scraper with private-target safeguards.
- `scripts/file_import_extract.py` - dependency-light importer for text, JSON, HTML, DOCX, PDF, legacy DOC best-effort, and ZIP exports.
- `scripts/export_pack.py` - creates JSON, JS, TXT, and HTML exports in `dist/`.
- `integrations/parallel_extract.ts` - server-side TypeScript example using `parallel-web`.
- `docs/codex-build-brief.txt` - direct prompt/integration guide for future Codex work.
- `docs/extraction-deployment.md` - deployment guide for Python, Render, Vercel, Cloudflare, and Catalyst notes.
- `docs/extraction-results-architecture.md` - normalized source-card result display and persistence contract.
- `assets/concept-dashboard.png` - generated design reference.
- `assets/morphogenesis-diagram.png` - generated framework panel illustration.

## Offline Export

Run:

```powershell
python scripts/export_pack.py
```

The script writes:

- `dist/core-research-atlas.json`
- `dist/core-research-atlas.seed.js`
- `dist/core-research-atlas.txt`
- `dist/core-research-atlas-digest.html`
- `dist/internal_model_gateway.json`
- `dist/reference_ingest.json`

## Parallel Extract API

Configure the key outside tracked source files:

```powershell
$env:PARALLEL_API_KEY = "your_parallel_key"
python server.py
```

Or put `PARALLEL_API_KEY=...` in ignored `.env.local`.

The app posts to `/api/extract`, which proxies:

```text
POST https://api.parallel.ai/v1/extract
```

with the JSON body:

```json
{
  "urls": ["https://www.google.com"],
  "objective": "Optional focused research prompt from the Extract Console or agent console.",
  "advanced_settings": { "full_content": false }
}
```

Successful and failed runs are normalized into clickable Extraction Results cards. Each card keeps the source prompt, request ID, returned URLs, links/citations, summary text, and a "Promote" action that turns a result into a normal archive source record.

The TypeScript example in `integrations/parallel_extract.ts` mirrors the `parallel-web` client call with `process.env.PARALLEL_API_KEY` and optional `objective`.

## Google Search and Local Web Scraper

The app also posts to `/api/scrape` for dependency-free HTML/text extraction. It blocks localhost, private, reserved, and link-local targets by default, caps page fetches at 2 MB, and does not execute JavaScript.

Keyword search now uses `/api/search` first. That route calls the Google Custom Search JSON API with the configured Programmable Search Engine ID and a server-side `GOOGLE_CUSTOM_SEARCH_API_KEY`. If no key or backend is available, the UI falls back to the embedded Google Programmable Search Element and internal browser cards.

Set this on a backend host when you want server-side Google result cards:

```powershell
$env:GOOGLE_CUSTOM_SEARCH_API_KEY = "your-google-api-key"
$env:GOOGLE_CSE_ID = "56f7592d1993141c3"
python server.py
```

The Agent Keyword Scraper, Global Web Extraction Console keyword mode, Keyword Search Scraper, Auto Bot, and ChatGPT Pro Research Agent all use this search-first path. When `/api/search` returns URLs, the app also tries `/api/scrape` against the top result pages to create site extraction cards.

```powershell
python scripts/web_scrape_extract.py https://www.google.com
```

## OpenAI Research Agent

The ChatGPT Pro Research Agent now calls `/api/agent` when the app is running on a backend host with `OPENAI_API_KEY` configured. That route uses the OpenAI Responses API with `OPENAI_AGENT_MODEL`, defaulting to `gpt-5.5`, optional hosted `web_search`, and reasoning effort from `OPENAI_AGENT_REASONING_EFFORT`. It sends the model the active prompt, browser context, web result cards, scraped site previews, source matches, collaboration documents, uploaded-reference metadata, team posts, and active profile data.

Local setup:

```powershell
$env:OPENAI_AGENT_MODEL = "gpt-5.5"
$env:OPENAI_AGENT_WEB_SEARCH = "1"
$env:OPENAI_AGENT_REASONING_EFFORT = "low"
python server.py
```

The API key belongs in `.env.local` or the host's secret manager, never in browser JavaScript. On GitHub Pages, `/api/agent` cannot run because Pages is static, so the agent automatically falls back to the local app synthesizer while keeping source URLs and CSE/browser cards visible. If `/api/agent` is reachable but OpenAI returns `billing_not_active`, the code path and key are wired, but the OpenAI project must have billing/model access enabled before live model responses will work.

Deployment notes for Render, Vercel, Cloudflare Workers/Agents, and Catalyst are in `docs/extraction-deployment.md`.

## File Import

The Import panel accepts `.txt`, `.json`, `.py`, `.md`, `.html`, `.doc`, `.docx`, `.pdf`, `.csv`, `.xml`, `.yaml`, `.yml`, and `.zip`. It posts files to `/api/import-file`, extracts readable text, detects ChatGPT conversation exports and previous app archive JSON, then creates normalized Source records and File Import extraction-result cards.

When the app is hosted inside ChatGPT as an Apps SDK widget, it feature-detects `window.openai.selectFiles`, `window.openai.uploadFile`, and `window.openai.getFileDownloadUrl`. Outside ChatGPT, the same panel falls back to the normal browser file picker.

PDF extraction uses `pypdf` or `PyPDF2` only if already installed; otherwise it falls back to printable text recovery. Legacy `.doc` import is also best-effort, so `.docx`, `.txt`, `.md`, or ChatGPT JSON exports are cleaner.

## In-App Browser

The Browser panel now embeds Google Programmable Search Engine directly with this search engine ID:

```text
56f7592d1993141c3
```

The page loads:

```html
<script async src="https://cse.google.com/cse.js?cx=56f7592d1993141c3"></script>
<div class="gcse-searchbox"></div>
<div class="gcse-searchresults"></div>
```

The public fallback URL is:

```text
https://cse.google.com/cse?cx=56f7592d1993141c3#gsc.tab=0
```

The Browser panel also provides a virtual in-app browser pane. It defaults to:

```html
<iframe src="https://cse.google.com/cse?cx=56f7592d1993141c3#gsc.tab=0" width="100%" height="500px"></iframe>
```

It accepts a full URL, a domain, or keywords. Browser-panel keyword input opens the Google CSE public URL with `gsc.q=<encoded keywords>`. External result links now open as in-app source previews first, because many public sites block iframe embedding with browser security headers such as `X-Frame-Options` or CSP `frame-ancestors`. When `/api/scrape` is available, the preview is enriched with title, summary, headings, and discovered links.

The Extract Console and ChatGPT Pro Research Agent attach the active in-app browser URL, recent browser history, captured browser source leads, Google/CSE result cards, and browser search text to generated extraction jobs and local synthesis responses.

## Team Chat

The Team panel lets the three project users post messages, updates, links, and recommendations. Recommendations can be rejected or promoted directly into Sources. When `server.py` or another backend host is running, messages sync through `/api/team-chat`; the app also keeps a dedicated local fallback in browser storage and uses `BroadcastChannel`/storage events so same-browser tabs stay in sync.

GitHub Pages is static, so it cannot share new team posts across different devices by itself. Cross-device team chat requires a backend deployment for `/api/team-chat` or a real database-backed service.

## Collaboration Docs

The Docs panel is a local-first drafting workspace for research briefs, PDF drafts, source reviews, meeting notes, and grimoire chapters. It supports rich text drafting, inserting the active in-app browser lead, importing `.txt`, `.md`, `.html`, `.json`, `.py`, `.js`, `.css`, `.doc`, `.docx`, and `.pdf` files, exporting individual documents to TXT/HTML/JSON, exporting the full document library, print-to-PDF handoff, and promoting a document into Sources.

Browser-only imports parse text, Markdown, HTML, JSON, and code directly. DOC, DOCX, and PDF imports are stored as metadata-only document drafts unless a backend parser is added. Guest mode can browse documents and profiles but cannot edit, import, export, post, promote, or save changes.

## Automated AI Research Bot

The Extract panel includes an opt-in automated research bot. It rotates through content sections, builds a focused keyword query, runs at most one scrape attempt per minute, and pauses when it finds a useful source card. The user must answer "Yes" before the finding is added to a source section. "No" opens a short feedback prompt and uses that feedback on the next recursive search.

## Optional NVIDIA AIQ Research

The app registers NVIDIA AI-Q Research as an optional deep-research backend at `http://localhost:8000`. It is shown in the agent context and model-core panel, but no prompt is sent to AIQ unless a trusted AI-Q server is running and connected in a future backend step.

## Mobile Access

For another device on the same Wi-Fi, run the server on all interfaces:

```powershell
python server.py --host 0.0.0.0 --port 5177
```

Then open `http://YOUR-LAN-IP:5177/` from the phone. `127.0.0.1` and `localhost` only work on the computer running the server.

## Next Build Targets

- Replace static demo sign-in with real backend auth and secure password hashing.
- URL/PDF/source ingestion with citation metadata.
- Live extraction workers for URLs, documentation sites, PDFs, WebP/image OCR, archives, and datasets.
- Activate billing/model access on the OpenAI project used by `/api/agent` if live model calls return `billing_not_active`.
- Team ownership fields for the two additional contributors.
- Graph view for terms, traditions, entities, species forms, and CORE framework links.
- Database-backed collaboration when a backend is chosen.
- Durable team chat storage with authenticated review history.
