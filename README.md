# CORE Shapeshifting Research Atlas

A local-first research web app for organizing shapeshifting sources, browser leads, uploaded files, team posts, collaboration drafts, user profiles, and memory snapshots.

The removed panels are no longer part of this build. The app now focuses on browsing, logging, importing, drafting, and reviewing sources.

## Run Locally

```powershell
python server.py --host 127.0.0.1 --port 5177
```

Open `http://127.0.0.1:5177/`.

The static UI can also be opened directly with `index.html`, but backend routes such as `/api/search`, `/api/import-file`, and `/api/team-chat` only work through the Python server.

## Backend Routes

- `GET /api/health` reports available backend routes and Google Search configuration.
- `POST /api/search` calls Google Custom Search JSON when `GOOGLE_CUSTOM_SEARCH_API_KEY` is configured.
- `POST /api/import-file` reads supported uploads and returns summaries, keywords, and parser notes.
- `GET/POST /api/team-chat` stores shared team messages for the running Python server.

## Main Files

- `index.html` - single-page app shell.
- `styles.css` - monochrome gradient interface.
- `app.js` - browser state, source logging, imports, in-app browser, team chat, collaboration docs, profiles, and memory bank.
- `server.py` - local Python static server and backend routes.
- `api/` - Vercel-style Python route handlers.
- `scripts/google_search.py` - Google Custom Search helper.
- `scripts/file_import_extract.py` - upload reader for text, JSON, Markdown, code, HTML, DOCX, PDF best-effort, ZIP, and image metadata.
- `scripts/mini_file_explorer.py` - Tkinter folder picker and command-line scanner that exports `workspace_tree.json` for File Manager import.
- `scripts/export_pack.py` - regenerates the downloadable integration files in `dist/`.
- `data/research_seed.json` - starter archive data.

## User Access

The sign-in modal has three write-enabled users plus a guest mode:

- `UserSeth`
- `UserSemaj`
- `UserKhiimori`
- `Login as Guest` for read-only viewing

Guest mode can browse and inspect content, but cannot save sources, profiles, documents, imports, team posts, or memory snapshots.

## In-App Browser

The Browser panel accepts a URL, domain, or keywords. Keyword input routes through the configured Google Programmable Search Engine:

- CSE ID: `56f7592d1993141c3`
- Public URL: `https://cse.google.com/cse?cx=56f7592d1993141c3#gsc.tab=0`

Search results and clicked links are mirrored into internal cards where possible. Many public sites block iframe display, so the app keeps URL, preview, and source metadata visible even when a page cannot render in-frame.

The Browser panel also embeds the Cloudflare AI Search snippet:

```html
<script type="module" src="https://4afc7ed7-768d-4ed9-857f-94db2d87917e.search.ai.cloudflare.com/assets/v0.0.40/search-snippet.es.js"></script>
<chat-page-snippet theme="dark"></chat-page-snippet>
```

## File Import

The Import panel supports common research formats:

`.txt`, `.json`, `.py`, `.js`, `.css`, `.md`, `.html`, `.doc`, `.docx`, `.pdf`, `.csv`, `.xml`, `.yaml`, `.yml`, `.zip`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.svg`, `.bmp`, `.tif`, `.tiff`, `.heic`, `.avif`

Imports can create Source records and file logs. ChatGPT export structures are detected so useful conversation data can be reviewed inside the atlas.

## File Manager Workspace Tree

The File Manager can import a `workspace_tree.json` produced by the local mini explorer helper. This recreates the scanned folder/file hierarchy inside the app's virtual Explorer tree.

GUI picker:

```powershell
python scripts/mini_file_explorer.py
```

Direct scan:

```powershell
python scripts/mini_file_explorer.py --path "C:\Users\alola\Downloads\Example"
```

Then import the generated `workspace_tree.json` through File Manager > Import Files.

## Collaboration

The Team panel supports posts, updates, links, and recommendations. Recommendations can be rejected or added to Sources by signed-in users.

The Docs panel supports local drafting, import, export as JSON/HTML/TXT, print-to-PDF, and inserting the active browser lead into a draft.

## Memory Bank

The Memory panel stores local recovery snapshots in browser storage under `core-shapeshifting-research-atlas:memory-bank`, plus a last-good backup of the main archive. Export the memory bank periodically for durable backup outside browser storage.

## Public Hosting

GitHub Pages can host the static app, including the UI, CSE browser, localStorage archive, guest browsing, docs, profiles, and exports.

Python backend routes require a server host such as Render, Vercel Functions, Cloudflare Workers, or a local Python process. GitHub Pages cannot run Python routes.

For team chat across users who are not on the same Wi-Fi, use a public HTTPS sync backend. A ready-to-deploy Cloudflare Worker is included at `cloudflare/team-sync/`. After deployment, paste the Worker URL into the Team tab's Shared team sync server field on all three devices, or open the app with:

```text
https://ryetechv1.github.io/core-research-atlas/?sync=https://core-research-team-sync.<your-cloudflare-subdomain>.workers.dev
```
