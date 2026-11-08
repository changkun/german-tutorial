// Build the reading site from the Markdown sources into _site/.
//
//   node site/build.mjs
//
// The table of contents in README.md is the list of pages and the order of
// the main thread. Every page gets a clean URL (grammar/nouns.md becomes
// grammar/nouns/, wordlist/A1/README.md becomes wordlist/A1/), links between
// .md files are rewritten to those URLs,
// SVG figures referenced as images are inlined so they follow the theme, and
// the nav line that ends each chapter becomes the pager. All URLs are
// relative, so the site works under any path.
import MarkdownIt from "markdown-it";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { audioPage, finishAudio, pageAudio, sayButton, wordSpeakable } from "./audio.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "_site");

// The styles and scripts are published in a folder named by their content,
// assets/<hash>/, so a cache in front of the server (Cloudflare keeps them
// for hours) never pairs a new page with an old script. The audio and the
// icon stay at assets/.
const CODE = ["site.css", "app.js"];
const CODE_DIR = (() => {
  const h = createHash("sha256");
  const add = (rel) => {
    const file = join(ROOT, "site/assets", rel);
    if (statSync(file).isDirectory()) readdirSync(file).sort().forEach((f) => add(posix.join(rel, f)));
    else h.update(rel).update(readFileSync(file));
  };
  CODE.forEach(add);
  return "assets/" + h.digest("hex").slice(0, 10);
})();
const SITE = "德语零基础教程";
const AUTHOR = { name: "欧长坤", url: "https://changkun.de/" };

const read = (p) => readFileSync(join(ROOT, p), "utf8");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const plain = (html) => html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');

// ---- table of contents ------------------------------------------------------

// grammar/nouns.md -> grammar/nouns/, wordlist/A1/README.md -> wordlist/A1/
const outOf = (src) => src.replace(/(^|\/)README\.md$/, "$1").replace(/\.md$/, "/");

function parseToc(readme) {
  const section = readme.split(/^## 目录\s*$/m)[1].split(/^## /m)[0];
  const parts = [], stops = [], intro = [];
  let gap = false;
  for (const line of section.split("\n")) {
    const h = line.match(/^### (\S+) (.+)$/);
    if (h) { parts.push({ id: parts.length, label: h[1], name: h[2] }); gap = false; continue; }
    const m = line.match(/^(\s*)- \[(.+?)\]\((.+?\.md)\)/);
    if (m && gap && !/^\d/.test(m[2])) {
      stops.push({ num: "", zh: m[2], en: "", src: m[3], out: outOf(m[3]), part: -1, leaf: false, parent: null, leaves: [] });
      continue;
    }
    gap = !line.trim() && stops.length > 0;
    if (m) {
      const t = m[2].match(/^(\d\.\d+a?)\s+(.+?)(?:\s+([A-Z][A-Za-z:,\- ]+))?$/);
      const [num, zh, en] = t ? [t[1], t[2], t[3] || ""] : ["", m[2], ""];
      const leaf = m[1].length > 0;
      const parent = leaf ? stops.findLast((s) => !s.leaf) : null;
      const stop = { num, zh, en, src: m[3], out: outOf(m[3]), part: parts.at(-1).id, leaf, parent, leaves: [] };
      if (parent) parent.leaves.push(stop);
      stops.push(stop);
      continue;
    }
    if (!parts.length && line.trim()) intro.push(line);
  }
  return { parts, stops, intro: intro.join("\n") };
}

const README = read("README.md");
const { parts, stops, intro: tocIntro } = parseToc(README);
const HOME = { src: "README.md", out: "", num: "", zh: SITE, en: "" };
const bySrc = new Map([[HOME.src, HOME], ...stops.map((s) => [s.src, s])]);
const label = (s) => (s.num ? `${s.num} ${s.zh}` : s.zh);

// rel("grammar/1.1-nouns/", "") === "../../"; directories always end in "/".
function rel(from, to) {
  const r = posix.relative("/" + from, "/" + to);
  return r === "" ? "./" : r + "/";
}

// Resolve a link written in page.src. null means the target is not part of
// the site (a script README, say): the link is dropped and its text kept.
function resolveHref(href, page) {
  if (/^([a-z]+:|#|\/)/i.test(href)) return href;
  const [path, hash] = href.split("#");
  if (!path.endsWith(".md")) return href;
  const target = bySrc.get(posix.normalize(posix.join(posix.dirname(page.src), path)));
  if (!target) return null;
  return rel(page.out, target.out) + (hash ? "#" + hash : "");
}

// ---- markdown ---------------------------------------------------------------

const md = new MarkdownIt({ html: true });

// GitHub's heading slugs, so #anchors written for GitHub keep working.
const slug = (text) => text.trim().toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, "").replace(/\s/g, "-");

md.core.ruler.push("heading_ids", (state) => {
  const seen = new Map();
  state.env.headings = [];
  state.tokens.forEach((t, i) => {
    if (t.type !== "heading_open") return;
    const text = state.tokens[i + 1].children
      .filter((c) => c.type === "text" || c.type === "code_inline").map((c) => c.content).join("");
    let id = slug(text);
    const n = seen.get(id) || 0;
    seen.set(id, n + 1);
    if (n) id += "-" + n;
    t.attrSet("id", id);
    state.env.headings.push({ level: Number(t.tag[1]), id, text });
  });
});

const linkKept = [];
md.renderer.rules.link_open = (tokens, i, opts, env, self) => {
  const href = resolveHref(tokens[i].attrGet("href"), env.page);
  linkKept.push(href !== null);
  if (href === null) return "<span>";
  tokens[i].attrSet("href", href);
  if (/^https?:/.test(href)) {
    tokens[i].attrSet("target", "_blank");
    tokens[i].attrSet("rel", "noopener");
  }
  return self.renderToken(tokens, i, opts);
};
md.renderer.rules.link_close = (tokens, i, opts, env, self) =>
  linkKept.pop() ? self.renderToken(tokens, i, opts) : "</span>";

// A line break inside a paragraph is a space in English but nothing in
// Chinese: the sources keep one sentence per line.
const CJK = /[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]/;
function nearChar(tokens, i, step) {
  for (let j = i + step; j >= 0 && j < tokens.length; j += step) {
    const c = tokens[j].content;
    if (c) return step < 0 ? c.at(-1) : c[0];
  }
  return "";
}
md.renderer.rules.softbreak = (tokens, i) =>
  CJK.test(nearChar(tokens, i, -1)) || CJK.test(nearChar(tokens, i, 1)) ? "" : "\n";

md.renderer.rules.table_open = () => '<div class="table-wrap"><table>\n';
md.renderer.rules.table_close = () => "</table></div>\n";

// The pseudo-code blocks are Python-like with # and // comments.
function highlight(code) {
  const text = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return text.replace(
    /("(?:[^"\\\n]|\\.)*")|((?:#|\/\/).*$)|\b(def|if|elif|else|return|for|in|not|and|or|while|assert|set|True|False|None)\b/gm,
    (m, str, comment, kw) => `<span class="${str ? "c-str" : comment ? "c-com" : "c-kw"}">${m}</span>`,
  );
}
md.renderer.rules.fence = (tokens, i) => `<pre class="code"><code>${highlight(tokens[i].content)}</code></pre>\n`;

// A figure is an SVG file referenced as an image; its alt text is the caption.
// It is inlined so its colours follow the theme. Its <style> holds fallbacks
// for viewing the file on its own and is dropped, and its ids are prefixed so
// two figures on one page cannot collide.
md.renderer.rules.image = (tokens, i, opts, env) => {
  const t = tokens[i], src = t.attrGet("src"), alt = t.content;
  const file = posix.normalize(posix.join(posix.dirname(env.page.src), src));
  if (!src.endsWith(".svg") || !existsSync(join(ROOT, file))) {
    throw new Error(`${env.page.src}: figure ${src} not found`);
  }
  const name = posix.basename(file, ".svg");
  const svg = read(file)
    .replace(/<\?xml[^>]*>\s*/, "")
    .replace(/<style[\s\S]*?<\/style>\s*/g, "")
    .replace(/\bid="([^"]+)"/g, `id="${name}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${name}-$1)`)
    .replace(/href="#([^"]+)"/g, `href="#${name}-$1"`)
    .replace(/<svg\b/, `<svg role="img" aria-label="${esc(alt)}"`);
  return `<figure class="fig" id="fig-${name}"><div class="fig-body">${svg}</div>` +
    `<figcaption><span>${md.renderInline(alt)}</span><button class="fig-zoom" type="button" aria-label="放大查看">` +
    `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6.5 2a4.5 4.5 0 1 0 2.6 8.2l3.4 3.3 1-1-3.3-3.4A4.5 4.5 0 0 0 6.5 2Zm0 1.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM5.8 4.8v1h-1v1.4h1v1h1.4v-1h1V5.8h-1v-1Z"/></svg>放大</button></figcaption></figure>`;
};

// ---- post-processing of rendered HTML ---------------------------------------

const LANG = { 德语: ["de", "德"], 英语: ["en", "英"], 中文: ["zh", "中"] };

// "- 德语：… / - 英语：… / - 中文：…" lists become example cards.
function exampleCards(html) {
  const item = /<li>(德语|英语|中文)：((?:(?!<\/li>)[\s\S])*)<\/li>\n/g;
  return html.replace(/<ul>\n((?:<li>(?:德语|英语|中文)：(?:(?!<\/li>)[\s\S])*<\/li>\n)+)<\/ul>\n/g, (m, items) => {
    const rows = [...items.matchAll(item)].map(([, lang, text]) => {
      const [code, tag] = LANG[lang];
      return `<div class="ex-row ex-${code}"><span class="ex-tag" title="${lang}">${tag}</span>` +
        `<span class="ex-text"${code === "zh" ? "" : ` lang="${code}"`}>${text.trim()}</span></div>`;
    });
    return `<div class="ex">${rows.join("")}</div>\n`;
  });
}

// "> 例子：" quotes: a label chip, the German line marked as German, and
// "解释：" / "英语：" / "中文：" paragraphs labelled the same way.
function exampleQuotes(html) {
  const chip = '<span class="lbl lbl-ex">例子</span>';
  return html.replace(/<blockquote>\n<p>例子：<\/p>\n([\s\S]*?)<\/blockquote>/g, (m, body) => {
    let first = true;
    body = body.replace(/<p>((?:(?!<\/p>)[\s\S])*)<\/p>/g, (p, text) => {
      const lbl = text.match(/^(解释|英语|中文)：/);
      if (lbl) return `<p class="q-${lbl[1] === "解释" ? "explain" : "gloss"}"><span class="lbl">${lbl[1]}</span>${text.slice(lbl[0].length)}</p>`;
      if (first && /^[A-Za-zÄÖÜäöüß*<]/.test(text) && !CJK.test(plain(text))) { first = false; return `<p class="q-de">${chip}<span lang="de">${text}</span></p>`; }
      if (first) { first = false; return `<p>${chip}${text}</p>`; }
      return p;
    });
    return `<blockquote class="ex-quote">\n${body}</blockquote>`;
  });
}

// Wrap each h2 and what follows it in a <section>, so a filter can hide a
// whole group of a word list and the styles can space groups.
function sections(html) {
  const parts = html.split(/(?=<h2 )/);
  return parts.map((p, i) => (i === 0 && !p.startsWith("<h2 ") ? p : `<section class="sec">\n${p}</section>\n`)).join("");
}

// Word-list tables: the kind of each entry (for the filter), the German
// cells marked as German (every column but 英语 and 中文), the article
// coloured by gender, and a button that reads the German of the row, forms
// included.
function rowKind(de, en, zh) {
  if (/^(\(das\) )?(der|die|das) /.test(de)) return "noun";
  if (/^to /.test(en)) return "verb";
  if (/的(?:$|[；，（])/.test(zh)) return "adj";
  return "other";
}

function wordRows(html) {
  return html.replace(/<thead>([\s\S]*?)<\/thead>\n<tbody>([\s\S]*?)<\/tbody>/g, (m, head, body) => {
    const heads = [...head.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((c) => plain(c[1]).trim());
    const de = heads.map((h) => !/英语|中文/.test(h));
    const en = heads.indexOf("英语"), zh = heads.indexOf("中文");
    body = body.replace(/<tr>\n((?:<td>[\s\S]*?<\/td>\n)+)<\/tr>/g, (row, cells) => {
      const tds = [...cells.matchAll(/<td>([\s\S]*?)<\/td>/g)].map((c) => c[1]);
      const kind = rowKind(plain(tds[0]), en < 0 ? "" : plain(tds[en] || ""), zh < 0 ? "" : plain(tds[zh] || ""));
      const say = sayButton(tds.filter((_, j) => de[j]).map(wordSpeakable).filter(Boolean).join(", "), true);
      const pl = /只有复数/.test(tds[0]);
      const out = tds.map((c, j) => {
        if (j === 0) c = say + c.replace(/^(der|die|das) /, (a, art) => `<span class="art art-${pl ? "pl" : art}">${art}</span> `);
        return de[j] ? `<td lang="de">${c}</td>` : `<td>${c}</td>`;
      });
      return `<tr data-kind="${kind}">\n${out.join("\n")}\n</tr>`;
    });
    return `<thead>${head}</thead>\n<tbody>${body}</tbody>`;
  });
}

const unwrapFigures = (html) => html.replace(/<p>(<figure[\s\S]*?<\/figure>)<\/p>/g, "$1");

// ---- page chrome ------------------------------------------------------------

const icon = {
  moon: '<svg class="icon-moon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
  sun: '<svg class="icon-sun" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></g></svg>',
};

// The contents at the window's edge, in plain text as in the other books on
// changkun.de: parts as quiet labels over their sections, the current page
// in ink and weight.
function sidebar(page) {
  const cur = (s) => (s === page ? ' aria-current="page"' : "");
  return `<nav class="side" id="side" aria-label="目录">
  <a href="${rel(page.out, "")}"${cur(HOME)}>前言</a>
${parts.map((p) => `  <p class="nav-part">${p.label} ${p.name}</p>
  <ol class="nav-list">${stops.filter((s) => s.part === p.id).map((s) =>
    `<li><a href="${rel(page.out, s.out)}"${cur(s)}>${s.num ? `<span class="nav-num">${s.num}</span>` : ""}<span class="nav-title">${esc(s.zh)}</span></a></li>`).join("")}</ol>`).join("\n")}
${stops.filter((s) => s.part < 0).map((s) => `  <a class="nav-end" href="${rel(page.out, s.out)}"${cur(s)}>${esc(s.zh)}</a>`).join("\n")}
</nav>`;
}

// The contents on the home page: the same list with the English names, and
// the branches marked as such.
function routeMap() {
  return parts.map((p) => {
    const items = stops.filter((s) => s.part === p.id);
    return `<div class="route"><h3>${p.label} ${p.name}</h3><ol>${items.map((s) =>
      `<li><a href="${rel("", s.out)}">${s.num ? `<span class="route-num">${s.num}</span>` : ""}${esc(s.zh)}</a>` +
      `${s.leaf ? '<span class="route-en">支线</span>' : ""}${s.en ? `<span class="route-en" lang="en">${esc(s.en)}</span>` : ""}</li>`,
    ).join("")}</ol></div>`;
  }).join("") + stops.filter((s) => s.part < 0).map((s) =>
    `<div class="route"><h3>${esc(s.zh)}</h3><ol><li><a href="${rel("", s.out)}">${esc(s.zh)}</a></li></ol></div>`).join("");
}

function layout({ page, title, description, body, kind }) {
  const root = rel(page.out, "");
  const part = page === HOME ? null : parts[page.part];
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="${AUTHOR.name}">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="${root}assets/logo.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="${root}${CODE_DIR}/site.css">
<script>(function(){var t;try{t=localStorage.getItem("theme")}catch(e){}if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t})()</script>
<script type="module" src="${root}${CODE_DIR}/app.js"></script>
</head>
<body class="k-${kind}" data-root="${root}">
<header class="top">
  <button class="menu-btn" type="button" aria-label="目录" aria-controls="side" aria-expanded="false"><span></span></button>
  <a class="brand" href="${root}">${SITE}</a>
  <span class="crumbs">${part ? `${part.label} ${part.name}` : ""}</span>
  <div class="top-actions">
    <button class="theme-btn" type="button" aria-label="切换浅色或深色">${icon.moon}${icon.sun}</button>
  </div>
</header>
${sidebar(page)}
<main class="main">
${body}
</main>
<footer class="foot">
  <span>${SITE}</span>
  <span>作者 <a href="${AUTHOR.url}">${AUTHOR.name}</a></span>
  <span>采用 <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh-hans" rel="license">CC BY-NC-ND 4.0</a> 许可</span>
  <span>朗读为 <a href="https://platform.openai.com/docs/guides/text-to-speech">OpenAI</a> 的 AI 合成语音，读音未必完全准确</span>
</footer>
</body>
</html>
`;
}

function render(src, page) {
  const env = { page };
  const html = md.render(src, env);
  return { html, headings: env.headings };
}

function processBody(html, opts) {
  return sections(pageAudio(unwrapFigures(exampleQuotes(exampleCards(html))), opts));
}

// ---- pages ------------------------------------------------------------------

function sectionChips(headings) {
  const h2 = headings.filter((h) => h.level === 2);
  if (h2.length < 2) return "";
  return `<nav class="toc-chips" aria-label="本节内容"><span class="toc-chips-lbl">本节</span>${h2.map((h) => `<a href="#${h.id}">${esc(h.text)}</a>`).join("")}</nav>`;
}

function pagerCard(page, target, dir, cls) {
  return `<a class="pg ${cls}" href="${rel(page.out, target.out)}"><span class="pg-dir">${dir}</span><span class="pg-t">${esc(label(target))}</span></a>`;
}

function chapter(stop) {
  let src = read(stop.src);
  // The last line is the nav line; it becomes the pager.
  const lines = src.trimEnd().split("\n");
  const nav = lines.at(-1).startsWith("[返回目录]") ? lines.pop() : "";
  src = lines.join("\n").replace(/^# .+\n/, "");
  if (stop.leaf) src = src.replace(/^\s*> 本节是 .+的支线。\n/, "");
  const links = Object.fromEntries([...nav.matchAll(/\[(上一节|下一节|返回主线|继续主线) [^\]]+\]\(([^)]+)\)/g)]
    .map(([, k, href]) => [k, bySrc.get(posix.normalize(posix.join(posix.dirname(stop.src), href)))]));

  audioPage(stop.src);
  const { html, headings } = render(src, stop);
  const isList = stop.src.startsWith("wordlist/");
  let body = processBody(html, { tables: !isList });
  if (isList) body = wordRows(body);

  const part = parts[stop.part];
  const kicker = stop.leaf
    ? `支线，挂在 <a href="${rel(stop.out, stop.parent.out)}">${esc(label(stop.parent))}</a> 上`
    : part ? `${part.label} ${part.name}` : "";
  const filter = isList ? `<div class="filter" role="search">
  <input type="search" placeholder="筛选：德语、英语或中文" aria-label="筛选词条" autocomplete="off" spellcheck="false">
  <div class="filter-kinds" role="group" aria-label="词类">${[["", "全部"], ["noun", "名词"], ["verb", "动词"], ["adj", "形容词"], ["other", "其他"]].map(([k, t]) => `<button type="button" data-kind="${k}" aria-pressed="${k === ""}">${t}</button>`).join("")}</div>
  <span class="filter-count" aria-live="polite"></span>
</div>` : "";

  const pager = [
    links["上一节"] && pagerCard(stop, links["上一节"], "上一节", "pg-prev"),
    links["返回主线"] && pagerCard(stop, links["返回主线"], "返回主线", "pg-prev"),
    ...stop.leaves.map((l) => pagerCard(stop, l, "支线", "pg-leaf")),
    links["下一节"] && pagerCard(stop, links["下一节"], "下一节", "pg-next"),
    links["继续主线"] && pagerCard(stop, links["继续主线"], "继续主线", "pg-next"),
  ].filter(Boolean).join("");

  const first = body.match(/<p>((?:(?!<\/p>)[\s\S])+)<\/p>/);
  return layout({
    page: stop,
    kind: isList ? "list" : "chapter",
    title: `${label(stop)} · ${SITE}`,
    description: first ? plain(first[1]).slice(0, 140) : SITE,
    body: `<article class="doc p${stop.part}">
<header class="doc-head">
  <p class="kicker">${kicker}</p>
  <h1>${stop.num ? `<span class="h-num">${stop.num}</span>` : ""}${esc(stop.zh)}</h1>
  ${stop.en ? `<p class="h-en" lang="en">${esc(stop.en)}</p>` : ""}
  ${sectionChips(headings)}
</header>
${filter}
<div class="prose">
${body}
</div>
<nav class="pager" aria-label="翻页">${pager}</nav>
</article>`,
  });
}

function home() {
  const [head, rest] = README.split(/^## 目录\s*$/m);
  // The TODO list is for the repository, not for readers.
  const after = rest.slice(rest.search(/^## /m)).replace(/^## TODO\n[\s\S]*?(?=^## )/m, "");
  const preface = head.replace(/^# .+\n/, "");
  const first = stops[0];
  audioPage(HOME.src);
  const pre = processBody(render(preface, HOME).html);
  const intro = render(tocIntro, HOME).html;
  const tail = processBody(render(after, HOME).html);
  const slot = (w, t, cls = "") => `<span class="slot${cls}"><span class="slot-w" lang="de">${w}</span><span class="slot-t">${t}</span></span>`;
  return layout({
    page: HOME,
    kind: "home",
    title: `${SITE} · 写给会中文和英语的人`,
    description: plain(pre.match(/<p>([\s\S]*?)<\/p>/)[1]),
    body: `<section class="hero">
  <div class="hero-text">
    <p class="kicker">A1 – B2 · 中文讲解 · 德语、英语、中文三方对照</p>
    <h1>${SITE}</h1>
    <p class="hero-by">作者 <a href="${AUTHOR.url}">${AUTHOR.name}</a> · ${stops.filter((s) => s.src.startsWith("grammar/") && s.part >= 0).length} 节语法，${stops.filter((s) => s.src.startsWith("wordlist/")).length} 份清单</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="${rel("", first.out)}">从 ${first.num} ${esc(first.zh)}开始读</a>
      <a class="btn" href="#路线图">看路线图</a>
    </div>
  </div>
  <div class="hero-demo" aria-label="例句：Heute trinke ich keinen Kaffee.（今天我不喝咖啡。）">
    <div class="slots">${slot("Heute", "第一位")}${slot("trinke", "变位动词", " slot-v")}${slot("ich", "主语")}${slot("keinen Kaffee.", "宾语")}</div>
    <p class="hero-demo-cap">${sayButton("Heute trinke ich keinen Kaffee.")}今天我不喝咖啡。句首不是主语时，主语挪到动词后面，变位动词始终守在第二位。</p>
  </div>
</section>
<article class="doc p0">
<div class="prose">
${pre}
<section class="sec route-sec">
<h2 id="路线图">路线图</h2>
${intro}
<div class="route-map">${routeMap()}</div>
</section>
${tail}
</div>
</article>`,
  });
}

// ---- write ------------------------------------------------------------------

function write(out, html) {
  const file = join(OUT, out, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(join(ROOT, "site/assets"), join(OUT, "assets"), {
  recursive: true,
  filter: (src) => !CODE.some((c) => src.startsWith(join(ROOT, "site/assets", c))),
});
for (const c of CODE) cpSync(join(ROOT, "site/assets", c), join(OUT, CODE_DIR, c), { recursive: true });
write("", home());
for (const s of stops) write(s.out, chapter(s));
const audio = finishAudio(OUT);
console.log(`built ${stops.length + 1} pages into _site/; audio for ${audio.have} of ${audio.wanted} texts` +
  (audio.have < audio.wanted ? " (make audio synthesizes the rest)" : ""));
