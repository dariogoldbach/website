// Scorebord voor "Ren, Dario!": GET geeft de top, POST zet een nieuwe score erbij.
// De scores staan in Netlify Blobs. Testlinks en de echte site hebben elk hun eigen lijst.
import { getStore } from "@netlify/blobs";

const MAX = 50;          // zoveel scores bewaren we
const SHOW = 10;         // zoveel laten we zien
const PER_SEC = 25;      // sneller dan dit kan niemand scoren

function clean(name) {
  return String(name || "")
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 16);
}

async function hash(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf).slice(0, 8), (b) => b.toString(16).padStart(2, "0")).join("");
}

// Scores die eruit moeten (op verzoek van Dario). Alleen scores van vóór het verzoek, zodat een nieuwe
// gelijke score gewoon blijft staan. Ze verdwijnen bij het eerstvolgende bezoek aan het scorebord.
const REMOVE = [{ score: 985, before: Date.parse("2026-10-12T13:10:00Z") }];
function prune(board) {
  const n = board.top.length;
  board.top = board.top.filter((e) => !REMOVE.some((r) => e.score === r.score && e.at < r.before));
  return board.top.length !== n;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export default async (req, context) => {
  const store = getStore({ name: "leaderboard", consistency: "strong" });
  const key = context.deploy && context.deploy.context === "production" ? "live" : "test";

  if (req.method === "GET") {
    const found = await store.getWithMetadata(key, { type: "json" });
    const board = (found && found.data) || { top: [] };
    if (found && prune(board)) await store.setJSON(key, board, { onlyIfMatch: found.etag });
    return json({ top: board.top.slice(0, SHOW) });
  }
  if (req.method !== "POST") return json({ error: "Alleen GET of POST" }, 405);

  let body;
  try { body = await req.json(); } catch { return json({ error: "Geen geldige invoer" }, 400); }
  const name = clean(body.name);
  const score = Math.floor(Number(body.score));
  const secs = Number(body.secs);
  if (!name) return json({ error: "Vul een naam in" }, 400);
  if (!Number.isFinite(score) || score < 1 || score > 100000) return json({ error: "Ongeldige score" }, 400);
  if (!Number.isFinite(secs) || score > secs * PER_SEC + 10) return json({ error: "Ongeldige score" }, 400);

  const who = await hash((context.ip || "") + key);
  const now = Date.now();
  // Opslaan met een controle, zodat twee spelers tegelijk elkaars score niet wegschrijven.
  for (let i = 0; i < 5; i++) {
    const found = await store.getWithMetadata(key, { type: "json" });
    const board = (found && found.data) || { top: [], recent: {} };
    board.recent = board.recent || {};
    prune(board);
    for (const k of Object.keys(board.recent)) if (now - board.recent[k] > 10 * 60 * 1000) delete board.recent[k];
    if (board.recent[who] && now - board.recent[who] < 5000) return json({ error: "Even rustig aan" }, 429);
    board.recent[who] = now;
    const entry = { name, score, at: now };
    board.top.push(entry);
    board.top.sort((a, b) => b.score - a.score || a.at - b.at);
    board.top = board.top.slice(0, MAX);
    const rank = board.top.indexOf(entry) + 1;
    const opts = found ? { onlyIfMatch: found.etag } : { onlyIfNew: true };
    const res = await store.setJSON(key, board, opts);
    if (res && res.modified === false) continue;
    return json({ top: board.top.slice(0, SHOW), rank: rank || null });
  }
  return json({ error: "Probeer het nog eens" }, 503);
};

export const config = { path: "/api/scores" };
