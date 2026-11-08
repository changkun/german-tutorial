// Page behaviour: theme switch, contents drawer, figure zoom, German audio,
// and the word-list filter.

const root = document.body.dataset.root;
const html = document.documentElement;

// ---- theme: as on the other pages of changkun.de, the system's until one is
// chosen, and the choice shared with them ------------------------------------

document.querySelector(".theme-btn").addEventListener("click", () => {
  const t = html.dataset.theme === "dark" ? "light" : "dark";
  html.dataset.theme = t;
  try { localStorage.setItem("theme", t); } catch {}
});
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  let t = null;
  try { t = localStorage.getItem("theme"); } catch {}
  if (t !== "light" && t !== "dark") html.dataset.theme = e.matches ? "dark" : "light";
});

// ---- contents: a drawer on a narrow screen -----------------------------------

const side = document.getElementById("side");
const menu = document.querySelector(".menu-btn");

function setNav(open) {
  html.classList.toggle("nav-open", open);
  menu.setAttribute("aria-expanded", String(open));
}

menu.addEventListener("click", () => setNav(!html.classList.contains("nav-open")));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && html.classList.contains("nav-open")) { setNav(false); menu.focus(); }
});
document.addEventListener("click", (e) => {
  if (html.classList.contains("nav-open") && !side.contains(e.target) && !menu.contains(e.target)) setNav(false);
});
// The current page in sight in a long list, without scrolling the window.
const here = side.querySelector("[aria-current]");
if (here) side.scrollTop = here.offsetTop - side.clientHeight / 2;

// ---- figure zoom: drag to pan, wheel or pinch to zoom ------------------------

function zoom(fig) {
  const src = fig.querySelector(".fig-body svg");
  const box = src.viewBox.baseVal;
  const svg = src.cloneNode(true);
  const layer = document.createElement("div");
  layer.className = "zoom";
  layer.setAttribute("role", "dialog");
  layer.setAttribute("aria-modal", "true");
  layer.setAttribute("aria-label", "放大的图");
  layer.innerHTML = `<div class="zoom-bar"><span class="zoom-title"></span>
    <button class="btn" type="button" data-z="out" aria-label="缩小">−</button>
    <button class="btn" type="button" data-z="in" aria-label="放大">＋</button>
    <button class="btn" type="button" data-z="fit">适合窗口</button>
    <button class="btn" type="button" data-z="close" aria-label="关闭">关闭</button></div>
    <div class="zoom-stage"></div>`;
  layer.querySelector(".zoom-title").textContent = fig.querySelector("figcaption span").textContent;
  const stage = layer.querySelector(".zoom-stage");
  stage.append(svg);
  document.body.append(layer);
  const back = document.activeElement;

  // The SVG keeps its own size (w × h) and is moved with a transform.
  const w = box.width, h = box.height;
  svg.setAttribute("width", w);
  svg.setAttribute("height", h);
  let k = 1, x = 0, y = 0;
  const draw = () => { svg.style.transform = `translate(${x}px, ${y}px) scale(${k})`; };
  const fit = () => {
    const r = stage.getBoundingClientRect();
    k = Math.min((r.width - 32) / w, (r.height - 32) / h);
    x = (r.width - w * k) / 2;
    y = (r.height - h * k) / 2;
    draw();
  };
  const zoomAt = (f, cx, cy) => {
    const nk = Math.min(Math.max(k * f, 0.2), 12);
    x = cx - (cx - x) * (nk / k);
    y = cy - (cy - y) * (nk / k);
    k = nk;
    draw();
  };
  fit();

  const pts = new Map();
  let last = null;
  stage.addEventListener("pointerdown", (e) => {
    stage.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    stage.classList.add("drag");
  });
  stage.addEventListener("pointermove", (e) => {
    if (!pts.has(e.pointerId)) return;
    const prev = pts.get(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1) {
      x += e.clientX - prev.x;
      y += e.clientY - prev.y;
      draw();
    } else if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const r = stage.getBoundingClientRect();
      if (last) zoomAt(d / last, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
      last = d;
    }
  });
  const up = (e) => {
    pts.delete(e.pointerId);
    if (pts.size < 2) last = null;
    if (!pts.size) stage.classList.remove("drag");
  };
  stage.addEventListener("pointerup", up);
  stage.addEventListener("pointercancel", up);
  stage.addEventListener("wheel", (e) => {
    e.preventDefault();
    const r = stage.getBoundingClientRect();
    zoomAt(Math.exp(-e.deltaY * 0.002), e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
  stage.addEventListener("dblclick", (e) => {
    const r = stage.getBoundingClientRect();
    zoomAt(2, e.clientX - r.left, e.clientY - r.top);
  });

  const close = () => {
    layer.remove();
    removeEventListener("keydown", onKey);
    removeEventListener("resize", fit);
    back?.focus?.();
  };
  const onKey = (e) => {
    if (e.key === "Escape") close();
    if (e.key === "+" || e.key === "=") zoomAt(1.25, stage.clientWidth / 2, stage.clientHeight / 2);
    if (e.key === "-") zoomAt(0.8, stage.clientWidth / 2, stage.clientHeight / 2);
  };
  addEventListener("keydown", onKey);
  addEventListener("resize", fit);
  layer.querySelector(".zoom-bar").addEventListener("click", (e) => {
    const z = e.target.closest("[data-z]")?.dataset.z;
    if (z === "close") close();
    if (z === "fit") fit();
    if (z === "in") zoomAt(1.25, stage.clientWidth / 2, stage.clientHeight / 2);
    if (z === "out") zoomAt(0.8, stage.clientWidth / 2, stage.clientHeight / 2);
  });
  layer.querySelector("[data-z=close]").focus();
}

for (const fig of document.querySelectorAll(".fig")) {
  fig.querySelector(".fig-zoom").addEventListener("click", () => zoom(fig));
  fig.querySelector(".fig-body").addEventListener("click", () => zoom(fig));
}

// ---- German audio -------------------------------------------------------------

// The build puts a button with the id of a recorded file (data-say) next to
// each German sentence; one player plays them, one at a time.
const player = new Audio();
let playing = null;

function stop() {
  player.pause();
  playing?.classList.remove("on");
  playing = null;
}

function play(btn) {
  const again = playing === btn;
  stop();
  if (again) return;
  playing = btn;
  btn.classList.add("on");
  player.src = `${root}assets/audio/${btn.dataset.say}.mp3`;
  player.play().catch(stop);
}

player.addEventListener("ended", stop);
document.addEventListener("click", (e) => {
  const b = e.target.closest(".say");
  if (b) play(b);
});

// ---- word-list filter ---------------------------------------------------------

// Letters without their marks, so "fur" finds "für" on a keyboard without ü.
const fold = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const filter = document.querySelector(".filter");
if (filter) {
  const input = filter.querySelector("input");
  const count = filter.querySelector(".filter-count");
  const rows = [...document.querySelectorAll(".prose tr[data-kind]")].map((tr) => ({ tr, text: fold(tr.textContent) }));
  const secs = [...document.querySelectorAll(".prose .sec")];
  let kind = "";
  const empty = document.createElement("p");
  empty.className = "filter-empty";
  empty.textContent = "没有匹配的词条。";
  empty.hidden = true;
  document.querySelector(".prose").append(empty);

  const run = () => {
    const q = fold(input.value.trim());
    let n = 0;
    for (const r of rows) {
      const show = (!kind || r.tr.dataset.kind === kind) && (!q || r.text.includes(q));
      r.tr.hidden = !show;
      n += show;
    }
    const active = q || kind;
    for (const s of secs) s.hidden = active && !s.querySelector("tr[data-kind]:not([hidden])");
    count.textContent = active ? `${n} / ${rows.length} 条` : `共 ${rows.length} 条`;
    empty.hidden = n > 0;
  };
  input.addEventListener("input", run);
  for (const b of filter.querySelectorAll("[data-kind]")) {
    b.addEventListener("click", () => {
      kind = b.dataset.kind;
      for (const x of filter.querySelectorAll("[data-kind]")) x.setAttribute("aria-pressed", String(x === b));
      run();
    });
  }
  run();
}
