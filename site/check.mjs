// Load every built page in Chrome and report what a reader would hit:
// console errors, failed requests, links to missing pages or anchors,
// horizontal overflow or overlapping header controls at any width, and a
// header that does not stay put when the page bounces at the top.
//
//   node site/check.mjs                  check _site/
//   node site/check.mjs --shots DIR      also save screenshots into DIR
//
// The site is served under /german-tutorial/, as in production. Chrome is
// $CHROME, or the installed Google Chrome.
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const SITE = fileURLToPath(new URL("../_site/", import.meta.url));
const BASE = "/german-tutorial/";
const WIDTHS = [320, 375, 414, 560, 768, 1000, 1024, 1280, 1440, 1920, 2560];
const shotsArg = process.argv.indexOf("--shots");
const SHOTS = shotsArg > 0 ? process.argv[shotsArg + 1] : null;
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };

const server = createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (!url.startsWith(BASE)) { res.writeHead(404).end(); return; }
  let file = join(SITE, url.slice(BASE.length));
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) { res.writeHead(404).end("not found"); return; }
  res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" }).end(readFileSync(file));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = `http://127.0.0.1:${server.address().port}`;

const chrome = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({ executablePath: chrome });
const problems = [];
const report = (page, msg) => problems.push(`${page}: ${msg}`);

// Crawl from the home page; every internal link must load and every #anchor exist.
const pages = [BASE];
const seen = new Set(pages);
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
for (let i = 0; i < pages.length; i++) {
  const path = pages[i];
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && report(path, `console: ${m.text()}`));
  page.on("pageerror", (e) => report(path, `error: ${e.message}`));
  page.on("requestfailed", (r) => report(path, `request failed: ${r.url()}`));
  page.on("response", (r) => r.status() >= 400 && report(path, `${r.status()} ${r.url()}`));
  await page.goto(origin + path, { waitUntil: "networkidle" });
  const links = await page.$$eval("a[href]", (as) => as.map((a) => a.href));
  for (const href of links) {
    const u = new URL(href);
    if (u.origin !== origin) continue;
    if (!u.pathname.startsWith(BASE)) { report(path, `link leaves the site: ${u.pathname}`); continue; }
    if (u.hash) {
      const id = decodeURIComponent(u.hash.slice(1));
      if (u.pathname === path) {
        if (!(await page.$(`[id="${id.replace(/"/g, '\\"')}"]`))) report(path, `missing anchor ${u.hash}`);
      } else {
        const target = readFileSync(join(SITE, u.pathname.slice(BASE.length), "index.html"), "utf8");
        if (!target.includes(`id="${id}"`)) report(path, `missing anchor ${u.pathname}${u.hash}`);
      }
    }
    if (!seen.has(u.pathname)) { seen.add(u.pathname); pages.push(u.pathname); }
  }
  await page.close();
}

// Layout at every width: nothing wider than the window, header parts apart.
for (const width of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  for (const path of pages) {
    await page.goto(origin + path, { waitUntil: "load" });
    const r = await page.evaluate(() => {
      const box = (s) => document.querySelector(s)?.getBoundingClientRect();
      const parts = [".menu-btn", ".brand", ".crumbs", ".top-actions"].map(box).filter((b) => b && b.width > 0);
      let overlap = false;
      for (let a = 0; a < parts.length; a++) for (let b = a + 1; b < parts.length; b++) {
        if (parts[a].right > parts[b].left + 0.5 && parts[b].right > parts[a].left + 0.5) overlap = true;
      }
      const top = box(".top");
      return {
        overflow: document.documentElement.scrollWidth - innerWidth,
        overlap,
        offscreen: parts.some((p) => p.right > innerWidth + 0.5 || p.left < -0.5),
        headerHeight: top.height,
      };
    });
    if (r.overflow > 0) report(path, `${width}px: page is ${r.overflow}px wider than the window`);
    if (r.overlap) report(path, `${width}px: header controls overlap`);
    if (r.offscreen) report(path, `${width}px: header control off screen`);
  }
  await page.close();
}

// The header stays fixed and the page keeps its elastic bounce: no
// overscroll-behavior anywhere, and a fling past the top leaves the header at 0.
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(origin + BASE + "grammar/order/", { waitUntil: "load" });
  const css = await page.evaluate(() => ({
    html: getComputedStyle(document.documentElement).overscrollBehaviorY,
    body: getComputedStyle(document.body).overscrollBehaviorY,
    position: getComputedStyle(document.querySelector(".top")).position,
  }));
  if (css.html !== "auto" || css.body !== "auto") report("bounce", `overscroll-behavior is ${css.html}/${css.body}`);
  if (css.position !== "fixed") report("bounce", `header position is ${css.position}`);
  const cdp = await page.context().newCDPSession(page);
  // yDistance > 0 scrolls up, so these push past the top.
  await cdp.send("Input.synthesizeScrollGesture", { x: 640, y: 400, yDistance: 600, speed: 2000, gestureSourceType: "touch" });
  await cdp.send("Input.synthesizeScrollGesture", { x: 640, y: 400, yDistance: 1200, speed: 3000, gestureSourceType: "touch" });
  await page.waitForTimeout(600);
  const after = await page.evaluate(() => ({ y: scrollY, top: document.querySelector(".top").getBoundingClientRect().top }));
  if (after.y !== 0 || after.top !== 0) report("bounce", `after a fling past the top: scrollY ${after.y}, header at ${after.top}`);
  await cdp.send("Input.synthesizeScrollGesture", { x: 640, y: 400, yDistance: -1500, speed: 3000, gestureSourceType: "touch" });
  await page.waitForTimeout(600);
  const down = await page.evaluate(() => ({ y: scrollY, top: document.querySelector(".top").getBoundingClientRect().top }));
  if (down.y <= 0 || down.top !== 0) report("bounce", `after scrolling down: scrollY ${down.y}, header at ${down.top}`);
  await page.close();
}

if (SHOTS) {
  mkdirSync(SHOTS, { recursive: true });
  const shots = [
    ["home", BASE, 1280], ["home-phone", BASE, 390],
    ["chapter", BASE + "grammar/present/", 1280], ["chapter-phone", BASE + "grammar/present/", 390],
    ["list", BASE + "wordlist/A1/", 1280],
  ];
  for (const theme of ["light", "dark"]) {
    for (const [name, path, width] of shots) {
      const page = await browser.newPage({ viewport: { width, height: width < 600 ? 844 : 900 }, deviceScaleFactor: 2 });
      await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
      await page.goto(origin + path, { waitUntil: "networkidle" });
      await page.screenshot({ path: join(SHOTS, `${name}-${theme}.png`) });
      await page.close();
    }
  }
}

await browser.close();
server.close();
console.log(`${pages.length} pages × ${WIDTHS.length} widths`);
if (problems.length) {
  console.log(problems.join("\n"));
  process.exit(1);
}
console.log("no problems");
