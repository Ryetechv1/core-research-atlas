import { Agent, type Connection, routeAgentRequest } from "agents";

type Env = {
  PARALLEL_API_KEY?: string;
  ALLOW_PRIVATE_SCRAPE_TARGETS?: string;
  EXTRACTION_AGENT: DurableObjectNamespace;
};

type ExtractionState = {
  runs: Array<{
    id: string;
    engine: "parallel" | "scrape";
    createdAt: string;
    urls: string[];
    ok: boolean;
  }>;
};

type ExtractRequest = {
  urls?: string[] | string;
  advanced_settings?: {
    full_content?: boolean;
    include_links?: boolean;
  };
};

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

export class ExtractionAgent extends Agent<Env, ExtractionState> {
  initialState: ExtractionState = {
    runs: [],
  };

  async onConnect(connection: Connection) {
    connection.send(JSON.stringify({ type: "ready", runs: this.state.runs.slice(0, 10) }));
  }

  async onMessage(connection: Connection, message: string) {
    const request = JSON.parse(message) as ExtractRequest & { engine?: "parallel" | "scrape" };
    const urls = normalizeUrls(request.urls);
    const engine = request.engine || "scrape";
    const response = engine === "parallel"
      ? await runParallelExtract(urls, request.advanced_settings || {}, this.env)
      : await runWorkerScrape(urls, request.advanced_settings || {}, this.env);
    this.rememberRun(engine, urls, response.ok !== false);
    connection.send(JSON.stringify({ type: "result", engine, response }));
  }

  private rememberRun(engine: "parallel" | "scrape", urls: string[], ok: boolean) {
    this.setState({
      runs: [
        { id: crypto.randomUUID(), engine, createdAt: new Date().toISOString(), urls, ok },
        ...this.state.runs,
      ].slice(0, 50),
    });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const agentResponse = await routeAgentRequest(request, env);
    if (agentResponse) return agentResponse;

    if (request.method === "GET" && url.pathname === "/api/health") {
      return json({
        ok: true,
        service: "CORE Research Atlas",
        platform: "cloudflare-workers",
        parallelConfigured: Boolean(env.PARALLEL_API_KEY),
        routes: ["/api/health", "/api/extract", "/api/scrape", "/agents/ExtractionAgent/{session}"],
      });
    }

    if (request.method === "POST" && url.pathname === "/api/extract") {
      const body = await readJson(request);
      const response = await runParallelExtract(normalizeUrls(body.urls), body.advanced_settings || {}, env);
      return json(response, response.ok === false ? 503 : 200);
    }

    if (request.method === "POST" && url.pathname === "/api/scrape") {
      const body = await readJson(request);
      const response = await runWorkerScrape(normalizeUrls(body.urls), body.advanced_settings || {}, env);
      return json(response);
    }

    return new Response("Not found", { status: 404 });
  },
};

async function readJson(request: Request): Promise<ExtractRequest> {
  try {
    return await request.json<ExtractRequest>();
  } catch {
    return {};
  }
}

function normalizeUrls(input: string[] | string | undefined): string[] {
  const urls = Array.isArray(input) ? input : input ? [input] : [];
  return urls.map((item) => String(item).trim()).filter(Boolean);
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload, null, 2), { status, headers: jsonHeaders });
}

async function runParallelExtract(
  urls: string[],
  settings: NonNullable<ExtractRequest["advanced_settings"]>,
  env: Env,
) {
  if (!env.PARALLEL_API_KEY) {
    return { ok: false, error: "PARALLEL_API_KEY is not configured." };
  }
  const upstream = await fetch("https://api.parallel.ai/v1/extract", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.PARALLEL_API_KEY,
    },
    body: JSON.stringify({
      urls,
      advanced_settings: {
        full_content: Boolean(settings.full_content),
      },
    }),
  });
  const text = await upstream.text();
  let payload: unknown = text;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = { raw: text };
  }
  return upstream.ok
    ? { ok: true, response: payload }
    : { ok: false, status: upstream.status, response: payload };
}

async function runWorkerScrape(
  urls: string[],
  settings: NonNullable<ExtractRequest["advanced_settings"]>,
  env: Env,
) {
  const results = [];
  for (const rawUrl of urls) {
    try {
      const safeUrl = normalizePublicUrl(rawUrl, env);
      const response = await fetch(safeUrl, {
        headers: {
          "User-Agent": "CORE-Research-Atlas/0.3 (+cloudflare extraction agent)",
          "Accept": "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5",
        },
      });
      const text = await response.text();
      const content = extractText(text);
      results.push({
        ok: response.ok,
        url: safeUrl,
        finalUrl: response.url,
        status: response.status,
        contentType: response.headers.get("Content-Type") || "",
        title: extractTitle(text),
        summary: content.slice(0, 1200),
        content: settings.full_content ? content.slice(0, 25000) : undefined,
        links: settings.include_links === false ? undefined : extractLinks(text, safeUrl).slice(0, 40),
      });
    } catch (error) {
      results.push({ ok: false, url: rawUrl, error: error instanceof Error ? error.message : String(error) });
    }
  }
  return { ok: true, response: { results } };
}

function normalizePublicUrl(rawUrl: string, env: Env): string {
  const url = new URL(rawUrl);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http and https URLs are supported.");
  }
  if (url.username || url.password) {
    throw new Error("URLs with embedded credentials are not supported.");
  }
  if (env.ALLOW_PRIVATE_SCRAPE_TARGETS !== "1") {
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".local") || /^[\d.]+$/.test(host) || host.includes(":")) {
      throw new Error("Private, local, and literal IP targets are disabled in the Worker scaffold.");
    }
  }
  return url.toString();
}

function extractTitle(html: string): string {
  return stripTags((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "")).slice(0, 240);
}

function extractText(html: string): string {
  return stripTags(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<\/(p|h1|h2|h3|li)>/gi, "\n"),
  ).slice(0, 100000);
}

function stripTags(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function extractLinks(html: string, baseUrl: string) {
  const links: Array<{ text: string; href: string }> = [];
  const pattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(pattern)) {
    try {
      links.push({ href: new URL(match[1], baseUrl).toString(), text: stripTags(match[2]).slice(0, 160) });
    } catch {
      // Ignore malformed links from source pages.
    }
  }
  return links;
}
