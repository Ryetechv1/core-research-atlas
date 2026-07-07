# Extraction Results Architecture

The Extract Console and agent console now share one normalized result stream: `archive.extractionResults`.

## Display Pattern

- Store every extraction with a local ID, owner, timestamp, prompt objective, engine, status, request body, normalized items, and original response.
- Render every result item as a source card with title, primary URL, status/content chips, summary, and visible links/citations.
- Keep links clickable and visible rather than hiding them inside raw JSON.
- Let a user promote any result item into the main source archive with `citationStatus: "Needs verification"`.

This mirrors current AI-source UI guidance from OpenAI web search docs, Vercel AI Elements Sources/Inline Citation components, and Vercel AI generation persistence guidance.

## Providers

- `parallel`: `/api/extract`, backed by Parallel Extract when `PARALLEL_API_KEY` is configured.
- `scrape`: `/api/scrape`, backed by the local HTML/text scraper.
- `keyword-scrape`: user keyword input converted to `https://www.google.com/search?q=<encoded keywords>`.
- `agent-scrape`: the same keyword scraper, launched inside the ChatGPT 5.5 agent panel.
- `auto-bot`: opt-in recursive keyword search that pauses for user approval before adding sources.
- `file-import`: uploaded local/ChatGPT files parsed through `/api/import-file`, then normalized into source cards.
- `aiq`: reserved for a trusted NVIDIA AI-Q backend at `AIQ_SERVER_URL` or `http://localhost:8000`.
- `openai`: reserved for a future secure OpenAI Responses/Web Search backend.

## File Import and Browser Intake

The Import panel treats uploaded files as another source-card provider. It supports text, JSON, Markdown, code, HTML, DOCX, PDF, legacy DOC best-effort, and ZIP exports. ChatGPT conversation exports are detected from `conversations.json`-style structures and converted into one source record per conversation. Previous atlas JSON exports can be merged back into Sources.

The Browser panel embeds Google Programmable Search Engine `56f7592d1993141c3` with:

```html
<script async src="https://cse.google.com/cse.js?cx=56f7592d1993141c3"></script>
<div class="gcse-searchbox"></div>
<div class="gcse-searchresults"></div>
```

It also stores sandboxed iframe targets as `archive.browserHistory`. The fallback frame uses `https://cse.google.com/cse?cx=56f7592d1993141c3#gsc.tab=0`. Some pages may not visibly render in the frame because of embedding restrictions; the URL can still be opened externally or captured as a source lead.

## Review-Gated Automation

The automated bot does not silently mutate the archive. It stores findings as extraction results, opens a live review prompt, and only promotes a finding into a content section after a "Yes" decision. A "No" decision captures short feedback and uses it in the next recursive query.

## Production Upgrade Path

- Replace localStorage with a database table keyed by result ID.
- Add a result-detail URL such as `/extractions/:id` for collaboration and mobile sharing.
- Store AI/model token usage and provider cost metadata when live model calls are added.
- Keep original provider responses for audit, but show users normalized cards first.
- Health-check AIQ before sending prompts, and do not send secrets or private profile data to untrusted endpoints.

## References

- OpenAI Web Search tool docs: https://platform.openai.com/docs/guides/tools-web-search
- Vercel AI SDK message persistence: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence
- Vercel AI Elements Sources: https://elements.ai-sdk.dev/components/sources
- Vercel chatbot GitHub template: https://github.com/vercel/chatbot
- NVIDIA AI-Q Blueprint: https://github.com/NVIDIA-AI-Blueprints/aiq
- Parallel Extract setup/docs: https://docs.parallel.ai/getting-started/overview
- ChatGPT Apps file APIs: https://developers.openai.com/apps-sdk/build/chatgpt-ui
- MDN FileReader: https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsText
- MDN iframe sandbox: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe
