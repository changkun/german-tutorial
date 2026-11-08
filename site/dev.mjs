// Rebuild on every change to the sources and serve _site/ at
// http://localhost:4411/. Reload the page to see a change.
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync, watch } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SITE = join(ROOT, "_site");
const PORT = Number(process.env.PORT || 4411);
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml" };

function build() {
  try { execFileSync("node", [join(ROOT, "site/build.mjs")], { stdio: "inherit" }); } catch {}
}

let timer;
for (const dir of ["grammar", "wordlist", "figures", "site", "README.md"]) {
  const path = join(ROOT, dir);
  if (!existsSync(path)) continue;
  watch(path, { recursive: true }, () => { clearTimeout(timer); timer = setTimeout(build, 100); });
}
build();

createServer((req, res) => {
  let file = join(SITE, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!file.startsWith(SITE) || !existsSync(file)) { res.writeHead(404).end("not found"); return; }
  res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream", "cache-control": "no-store" });
  res.end(readFileSync(file));
}).listen(PORT, () => console.log(`serving http://localhost:${PORT}/`));
