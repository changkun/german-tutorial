// Audio next to each German sentence. The build finds the German text,
// asks for one audio file per distinct text (.audio/wanted.json), and puts a
// play button wherever that file already exists; tools/audio.py synthesizes
// the missing files with the voice set up in site/audio.json. Ids hash that
// setup with the text, so changing the voice asks for new files.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const CACHE = join(ROOT, ".audio");
const VOICE = JSON.stringify(JSON.parse(readFileSync(join(ROOT, "site/audio.json"), "utf8")));
const wanted = new Map();
let page = "";

// The page being built, recorded with each text for review.
export const audioPage = (src) => { page = src; };

export const norm = (text) => text.replace(/\s*\/\s*/g, ", ").replace(/\s+/g, " ").replace(/([.!?]),/g, "$1").trim();

export function audioId(text) {
  return createHash("sha1").update(`${VOICE}|${norm(text)}`).digest("hex").slice(0, 16);
}

const decode = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");

// What a voice should read out of a piece of HTML: no struck-out (wrong)
// words, no notes or optional words in brackets, no IPA; arrows, dashes and
// semicolons between examples become pauses.
export function speakable(html) {
  return tidy(decode(html.replace(STRUCK, "").replace(/<[^>]+>/g, "")));
}

// What a voice should read out of a word-list cell: the word with the forms
// in ( ), but not the Chinese notes in （ ）, the case after a preposition
// (+ 宾格), or the brackets around an optional article.
export function wordSpeakable(html) {
  return tidy(decode(html.replace(STRUCK, "").replace(/<[^>]+>/g, ""))
    .replace(/（[^）]*）/g, "")
    .replace(/\+\s*[\u3400-\u9fff]+/g, "")
    .replace(/^\((\p{L}+)\)\s*/u, "$1 ")
    .replace(/\s*\(([^)]*)\)/g, ", $1"));
}

// Letters in brackets inside a word are an optional part of it, wär(e)st:
// say the long form, wärest, rather than drop them and split the word.
const INWORD = /(\p{L})\((\p{Ll}+)\)(\p{Ll})/gu;

// A hyphen between two lower-case letters marks a stem and its ending in the
// paradigm tables (wohn-st): the voice reads the whole word.
function tidy(text) {
  return norm(text
    .replace(/(\p{Ll})-(\p{Ll})/gu, "$1$2")
    .replace(INWORD, "$1$2$3")
    .replace(/（[^）]*）|\([^)]*\)|\[[^\]]*\]/g, "")
    .replace(/\s*(?:→|=|；|;|\s–)\s*/g, ", ")
    .replace(/…/g, ", ")
    .replace(/([.!?])\s*,\s*/g, "$1 ")
    .replace(/\s+([,.!?])/g, "$1")
    .replace(/,\s*,/g, ","));
}

const STRUCK = /<(s|del)>[\s\S]*?<\/\1>/g;

const SPEAKER = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6h2.5L8 3v10L4.5 10H2Z"/><path d="M10.5 5.2a3.5 3.5 0 0 1 0 5.6l-.9-1.2a2 2 0 0 0 0-3.2ZM12.3 3a6.3 6.3 0 0 1 0 10l-.9-1.2a4.8 4.8 0 0 0 0-7.6Z"/></svg>';

// Ask for audio of text; its id, or null when it has no audio file yet.
function wantText(text) {
  const t = norm(text);
  const id = audioId(t);
  if (!wanted.has(id)) wanted.set(id, { text: t, page });
  return existsSync(join(CACHE, `${id}.mp3`)) ? id : null;
}

// A play button for text, or "" until its audio file exists. A button that
// leads a table cell gets the class say-lead.
export function sayButton(text, lead = false) {
  if (!/[A-Za-zÄÖÜäöüß]/.test(text)) return "";
  const id = wantText(text);
  if (!id) return "";
  const label = norm(text).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  return `<button class="say${lead ? " say-lead" : ""}" type="button" data-say="${id}" title="朗读" aria-label="朗读：${label}">${SPEAKER}</button>`;
}

// A button after inline text, joined to the last word so that it never
// wraps onto a line of its own.
const trailing = (button) => button && "\u2060" + button;

// ---- telling German sentences from English ones -----------------------------

// Short, frequent words, minus those that are words in both languages
// (in, an, am, so, was, will, also, war, bin, hat, man, kind, die …).
const DE = new Set(`ich du er sie es wir ihr mich dich sich uns euch mir dir ihm ihn ihnen der die das den dem des
ein eine einen einem einer eines kein keine keinen nicht und oder aber denn sondern dass ob weil wenn als wie
ist sind bist seid sein war waren gewesen habe hast haben hatte hatten wird werden wurde worden kann können
muss müssen darf soll sollen möchte mit auf aus bei von zu zum zur für nach vor über unter um durch gegen ohne
noch nur schon sehr auch immer nie heute morgen gestern hier dort jetzt dann doch ja nein gern gut mein dein
sein unser euer wer wo wohin woher warum wann welche welcher welches dieser diese dieses jeder alle viel`.split(/\s+/));
const EN = new Set(`the a is are been being have has had do does did i you he she it we they me
him her us them my your his its our their not and of to on at for with from by what where how when why who which
this that these those would can could should must shall there here very too but or no yes please
thank thanks already never always often maybe much more some any every one going go goes went got like love want
know think say said take came give tell told good new old today tomorrow yesterday people`.split(/\s+/));

export function language(sentence) {
  const words = sentence.toLowerCase().match(/[a-zäöüßé']+/g) || [];
  let de = /[äöüß]/i.test(sentence) ? 2 : 0;
  let en = /\b\w+'(s|t|m|re|ll|ve|d)\b|n't\b/i.test(sentence) ? 2 : 0;
  for (const w of words) {
    if (DE.has(w)) de++;
    if (EN.has(w)) en++;
  }
  return de > en ? "de" : en > de ? "en" : "";
}

// Insert a button after every German sentence in a run of inline HTML.
// A sentence here is Latin-script text outside <code> that starts with a
// capital, ends in . ! or ?, has two words or more and reads as German;
// Chinese characters and full-width punctuation end a run.
const CJK = /[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]/;
export function markSentences(html) {
  if (html.includes('class="say')) return html;
  // plain text, with the HTML offset just after each character
  const chars = [], ends = [], flags = [];
  let inCode = 0, inDel = 0;
  for (let i = 0; i < html.length;) {
    if (html[i] === "<") {
      const j = html.indexOf(">", i);
      const tag = html.slice(i, j + 1);
      if (/^<code\b/.test(tag)) inCode++;
      if (/^<\/code>/.test(tag)) inCode--;
      if (/^<(s|del)>/.test(tag)) inDel++;
      if (/^<\/(s|del)>/.test(tag)) inDel--;
      if (/^<br\b/.test(tag)) { chars.push("\n"); ends.push(j + 1); flags.push(0); }
      i = j + 1;
      continue;
    }
    let ch = html[i], next = i + 1;
    if (ch === "&") { const j = html.indexOf(";", i); ch = decode(html.slice(i, j + 1)); next = j + 1; }
    chars.push(ch); ends.push(next); flags.push(inCode ? 2 : inDel ? 1 : 0);
    i = next;
  }
  const text = chars.join("");
  const inserts = [];
  const run = new RegExp(`[^${CJK.source.slice(1, -1)}\\n]+`, "g");
  for (let m; (m = run.exec(text));) {
    const sentence = /[A-ZÄÖÜ][^.!?]*[.!?]+/g;
    for (let s; (s = sentence.exec(m[0]));) {
      const start = m.index + s.index, end = start + s[0].length;
      if (flags.slice(start, end).some(Boolean)) continue;         // code, or struck out as wrong
      if (/___|…|\([^)]*[,/]/.test(s[0])) continue;                   // an exercise or a pattern
      if ((s[0].match(/[A-Za-zÄÖÜäöüß]+/g) || []).length < 2) continue;
      if (language(s[0]) !== "de") continue;
      inserts.push([ends[end - 1], tidy(s[0])]);
    }
  }
  let out = html;
  for (const [at, s] of inserts.reverse()) {
    let pos = at;
    // step out of an inline element the sentence ends inside (… <strong>gått.</strong>)
    while (/^<\/(strong|em|b|i)>/.test(out.slice(pos))) pos = out.indexOf(">", pos) + 1;
    const button = trailing(sayButton(s));
    if (button) out = out.slice(0, pos) + button + out.slice(pos);
  }
  return out;
}

// The German in a table cell: the words before a gloss or an IPA bracket,
// and every item of a list separated by 、；→ and the like. Latin words that
// sit inside a Chinese phrase (以 -a 结尾的 en 词) are explanation, not
// examples, and suffixes (-het) are not words.
export function cellText(html) {
  const text = decode(html.replace(STRUCK, "").replace(/<[^>]+>/g, ""))
    .replace(/(\p{Ll})-(\p{Ll})/gu, "$1$2")
    .replace(INWORD, "$1$2$3")
    .replace(/（[^）]*）|\([^)]*\)|\[[^\]]*\]/g, " ")
    .replace(/^…\s*/, "");
  const parts = [];
  const seg = new RegExp(`(^|[、；;,，：:→+/–]|${CJK.source})\\s*([A-Za-zÄÖÜäöüßé][A-Za-zÄÖÜäöüßé' ,.!?"“”-]*)`, "g");
  for (const [, before, words] of text.matchAll(seg)) {
    if (CJK.test(before) && !/[、；：]/.test(before)) continue;
    const w = words.replace(/[\s,]+$/, "").trim();
    if (w.replace(/[^A-Za-zÄÖÜäöüßé]/g, "").length < 2 || w.endsWith("-")) continue;
    // a cell can pair a German sentence with its English translation
    const sentences = w.match(/[^.!?]+[.!?]+|[^.!?]+$/g).map((x) => x.trim());
    parts.push(...sentences.filter((x) => !/[.!?]$/.test(x) || language(x) !== "en"));
  }
  return parts.map((p, i) => (i < parts.length - 1 && !/[.!?]$/.test(p) ? p + "," : p)).join(" ");
}

// Columns that hold Chinese, English, spellings or notes rather than German
// words, tested on the header without its bracketed note.
const NOT_DE = /英语|中文|含义|作用|说明|询问|类型|构成|情况|^性别$|时态|发音|近似|名称|^字母$|写法|词尾|位置|数字|^时间$|后缀|连接成分/;

export function tableAudio(html) {
  return html.replace(/<table>\n<thead>([\s\S]*?)<\/thead>([\s\S]*?)<\/table>/g, (m, head, body) => {
    const heads = [...head.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)]
      .map((c) => decode(c[1].replace(/<[^>]+>/g, "")).replace(/（[^）]*）|\([^)]*\)/g, "").trim());
    // The sound-shift table (0.1) sets English words against German ones.
    if (heads[0] === "英语") return m;
    // A slot table (0.5): one sentence per row, read as a whole.
    if (/^(第一位|变位动词|主句)$/.test(heads[0])) {
      body = body.replace(/<tr>\n<td([^>]*)>([\s\S]*?<\/tr>)/g, (row, attrs, rest) => {
        const words = [...("<td>" + rest).matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => speakable(c[1])).filter(Boolean);
        return `<tr>\n<td${attrs}>${sayButton(words.join(" "), true)}${rest}`;
      });
      return `<table>\n<thead>${head}</thead>${body}</table>`;
    }
    body = body.replace(/<tr>([\s\S]*?)<\/tr>/g, (row, cells) => {
      let j = 0;
      return "<tr>" + cells.replace(/<td([^>]*)>([\s\S]*?)<\/td>/g, (c, attrs, inner) => {
        const h = heads[j++] || "";
        if (NOT_DE.test(h)) return c;
        const t = cellText(inner);
        // a gloss row in English inside a German table (the man, the child)
        return t && language(t) !== "en" ? `<td${attrs}>${inner}${trailing(sayButton(t))}</td>` : c;
      }) + "</tr>";
    });
    return `<table>\n<thead>${head}</thead>${body}</table>`;
  });
}

// Buttons for one page body: example cards, example quotes, tables, and the
// German sentences inside paragraphs and list items, except in exercises,
// where the sentences are to be worked out (the answers get buttons).
export function pageAudio(html, { tables = true } = {}) {
  html = html.replace(/(<span class="ex-text" lang="de">)([\s\S]*?)<\/span><\/div>/g,
    (m, open, text) => `${open}${text}</span>${sayButton(speakable(text))}</div>`);
  html = html.replace(/(<p class="q-de">[\s\S]*?<span lang="de">)([\s\S]*?)<\/span><\/p>/g,
    (m, open, text) => `${open}${text}</span>${sayButton(speakable(text))}</p>`);
  if (tables) html = tableAudio(html);
  const mark = (part) => part.replace(/<(p|li)>((?:(?!<\/?(?:p|li|ul|ol)\b)[\s\S])*?)<\/\1>/g,
    (m, tag, inner) => `<${tag}>${markSentences(inner)}</${tag}>`);
  return html.split(/(<h2 id="练习">[\s\S]*?(?=<details>|<h2 |$))/).map((part, i) => (i % 2 ? part : mark(part))).join("");
}

// An ID3 tag with text as the title. The site's static server tells a file's
// type from its first bytes, and only an MP3 that starts with such a tag is
// served as audio/mpeg, which Safari wants. German fits in Latin-1.
function id3(text) {
  const title = Buffer.from(text.replace(/[^\x00-\xff]/g, "?"), "latin1");
  const size = Buffer.alloc(4);
  size.writeUInt32BE(title.length + 1);
  const frame = Buffer.concat([Buffer.from("TIT2"), size, Buffer.from([0, 0, 0]), title]);
  const n = frame.length;
  return Buffer.concat([Buffer.from([0x49, 0x44, 0x33, 3, 0, 0, (n >> 21) & 127, (n >> 14) & 127, (n >> 7) & 127, n & 127]), frame]);
}

// After the build: list what is wanted and copy what exists into the site
// (the buttons carry the ids).
export function finishAudio(out) {
  mkdirSync(CACHE, { recursive: true });
  const list = [...wanted].map(([id, { text, page }]) => ({ id, text, page }));
  writeFileSync(join(CACHE, "wanted.json"), JSON.stringify(list, null, 0));
  const dir = join(out, "assets/audio");
  mkdirSync(dir, { recursive: true });
  let have = 0;
  for (const { id, text } of list) {
    if (!existsSync(join(CACHE, `${id}.mp3`))) continue;
    writeFileSync(join(dir, `${id}.mp3`), Buffer.concat([id3(text), readFileSync(join(CACHE, `${id}.mp3`))]));
    have++;
  }
  return { wanted: list.length, have };
}
