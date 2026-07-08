"use strict";

const TEAM_CHAT_KEY = "core-team-chat/messages";
const TEAM_CHAT_LIMIT = 200;
const MAX_BODY_BYTES = 3 * 1024 * 1024;
const TEAM_SOURCE_APPROVAL_THRESHOLD = 2;
const TEAM_USER_COUNT = 3;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export default {
  async fetch(request, env) {
    try {
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
      }

      const url = new URL(request.url);
      if (url.pathname === "/" || url.pathname === "/api/health") {
        return json({
          ok: true,
          service: "CORE Research Atlas Team Sync",
          routes: ["/api/health", "/api/team-chat"],
          storage: "Cloudflare Workers KV",
        });
      }

      if (url.pathname !== "/api/team-chat") {
        return json({ ok: false, error: "Unknown route." }, 404);
      }

      if (request.method === "GET") {
        return json({ ok: true, messages: await readMessages(env) });
      }

      if (request.method === "POST") {
        const bodySize = Number(request.headers.get("content-length") || 0);
        if (bodySize > MAX_BODY_BYTES) {
          return json({ ok: false, error: "Request body is too large." }, 413);
        }
        const payload = await request.json();
        const messages = await applyAction(env, payload);
        return json({ ok: true, messages });
      }

      return json({ ok: false, error: "Method not allowed." }, 405);
    } catch (error) {
      return json({ ok: false, error: error instanceof Error ? error.message : "Unexpected sync error." }, 500);
    }
  },
};

async function readMessages(env) {
  const text = await env.TEAM_CHAT_KV.get(TEAM_CHAT_KEY);
  if (!text) return [];
  try {
    const data = JSON.parse(text);
    const messages = Array.isArray(data?.messages) ? data.messages : Array.isArray(data) ? data : [];
    return messages.filter((item) => item && typeof item === "object").slice(0, TEAM_CHAT_LIMIT);
  } catch {
    return [];
  }
}

async function writeMessages(env, messages) {
  const cleanMessages = dedupe(messages).slice(0, TEAM_CHAT_LIMIT);
  await env.TEAM_CHAT_KV.put(TEAM_CHAT_KEY, JSON.stringify({ messages: cleanMessages }));
  return cleanMessages;
}

async function applyAction(env, payload) {
  const body = payload && typeof payload === "object" ? payload : {};
  const action = String(body.action || "").trim();
  const messages = await readMessages(env);

  if (action === "post") {
    messages.unshift(sanitizeMessage(body.item || body.message || {}));
  } else if (action === "vote") {
    applyVote(messages, body);
  } else if (action === "promote") {
    applyPromote(messages, body);
  } else {
    throw new Error("Unknown team chat action.");
  }

  return writeMessages(env, messages);
}

function applyVote(messages, body) {
  const id = String(body.id || "").trim();
  const user = String(body.user || "local").trim() || "local";
  const decision = String(body.decision || "").trim();
  if (!id || !["add", "reject"].includes(decision)) {
    throw new Error("Team chat vote must include an id and decision of add or reject.");
  }
  const message = messages.find((item) => item.id === id);
  if (!message) return;
  message.votes = isPlainObject(message.votes) ? message.votes : {};
  message.votes[user] = decision;
  message.status = teamVoteStatus(message.votes, decision, String(message.status || "review"));
}

function applyPromote(messages, body) {
  const id = String(body.id || "").trim();
  const user = String(body.user || "local").trim() || "local";
  const sourceId = String(body.sourceId || "").trim();
  if (!id) throw new Error("Promote action requires an id.");
  const message = messages.find((item) => item.id === id);
  if (!message) return;
  message.votes = isPlainObject(message.votes) ? message.votes : {};
  message.votes[user] = "add";
  message.status = "added to sources";
  if (sourceId) message.sourceId = sourceId.slice(0, 120);
}

function sanitizeMessage(raw) {
  if (!isPlainObject(raw)) throw new Error("Team chat item must be an object.");
  const id = String(raw.id || crypto.randomUUID()).trim();
  const text = String(raw.text || "").trim();
  if (!id || !text) throw new Error("Team chat item requires id and text.");
  let type = String(raw.type || "message").trim();
  if (!["message", "update", "recommendation", "link"].includes(type)) type = "message";
  return {
    id: id.slice(0, 96),
    type,
    owner: String(raw.owner || "local").trim().slice(0, 80) || "local",
    title: String(raw.title || "").trim().slice(0, 180),
    text: text.slice(0, 4000),
    url: String(raw.url || "").trim().slice(0, 1200),
    status: String(raw.status || (type === "recommendation" ? "open" : "posted")).trim().slice(0, 80),
    votes: isPlainObject(raw.votes) ? raw.votes : {},
    fileAttachment: sanitizeFileAttachment(raw.fileAttachment),
    createdAt: String(raw.createdAt || new Date().toISOString()).trim().slice(0, 80),
  };
}

function sanitizeFileAttachment(raw) {
  if (!isPlainObject(raw)) return null;
  let dataUrl = String(raw.dataUrl || "").trim();
  if (dataUrl.length > 2_200_000) dataUrl = "";
  const keywords = Array.isArray(raw.keywords) ? raw.keywords.map((item) => String(item).slice(0, 80)).slice(0, 16) : [];
  const warnings = Array.isArray(raw.warnings) ? raw.warnings.map((item) => String(item).slice(0, 220)).slice(0, 8) : [];
  return {
    id: String(raw.id || "").trim().slice(0, 96),
    fileName: String(raw.fileName || "").trim().slice(0, 220),
    extension: String(raw.extension || "").trim().slice(0, 24),
    mimeType: String(raw.mimeType || "").trim().slice(0, 120),
    size: Number(raw.size || 0),
    previewKind: String(raw.previewKind || "data").trim().slice(0, 40),
    summary: String(raw.summary || "").trim().slice(0, 1000),
    keywords,
    textExcerpt: String(raw.textExcerpt || "").trim().slice(0, 100000),
    dataUrl,
    storedPreview: Boolean(dataUrl),
    warnings,
    createdAt: String(raw.createdAt || "").trim().slice(0, 80),
  };
}

function teamVoteStatus(votes, latestDecision, currentStatus = "review") {
  const values = Object.values(isPlainObject(votes) ? votes : {});
  const addVotes = values.filter((vote) => vote === "add").length;
  const rejectVotes = values.filter((vote) => vote === "reject").length;
  if (addVotes >= TEAM_SOURCE_APPROVAL_THRESHOLD) {
    return currentStatus === "added to sources" ? "added to sources" : "approved for sources";
  }
  if (rejectVotes >= TEAM_SOURCE_APPROVAL_THRESHOLD) return "rejected";
  if (latestDecision === "add") return `review: ${addVotes}/${TEAM_USER_COUNT} add votes`;
  return `review: ${rejectVotes}/${TEAM_USER_COUNT} reject votes`;
}

function dedupe(messages) {
  const seen = new Set();
  const output = [];
  for (const message of messages) {
    const id = String(message?.id || "").trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    output.push(message);
  }
  return output;
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
