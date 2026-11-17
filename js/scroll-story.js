/* =====================================================
   Scroll story
   One number drives everything: progress p (0 -> 1) while
   the sticky section scrolls. No libraries.

     0.02-0.26  curtains gather to the sides
     0.08-0.40  camera pushes in toward the doorway
     0.30-0.50  dallah lifts and tilts
     0.50-0.92  coffee pours, cup fills
     0.92-0.99  dallah returns, steam rises
   ===================================================== */
(function () {
  const story = document.querySelector("[data-story]");
  if (!story) return;

  const stage = story.querySelector(".story__stage");
  const $ = (id) => story.querySelector("#" + id);
  const cam = $("cam"), flapL = $("flapL"), flapR = $("flapR");
  const dallahShadow = $("dallahShadow"), dallah = $("dallah"), cup = $("cup"), steam = $("steam");
  const coffee = $("coffee"), shine = $("coffeeShine");
  const stream = $("stream"), flow = $("flow");
  const moon = story.querySelector(".story__moon");
  const captions = story.querySelectorAll(".story__caption");
  const hint = story.querySelector(".story__hint");

  // ---- Geometry (tent image coordinates; matches the files in img/story) ----
  const VIEW  = { cx: 600, cy: 320 };               // centre of the svg viewBox
  const FOCUS = { x: 600, y: 470 };                 // where the camera pushes in
  const DOOR  = { x1: 404, x2: 800 };               // doorway edges
  const D = { px: 520, py: 563, s: 0.215,           // dallah pivot position + scale
              pivot: [470, 780], tip: [698, 300],   // pivot + spout tip inside dallah.webp
              lift: 75, maxTilt: 34 };
  const C = { y: 568, s: 0.155,                     // cup base y + scale
              ox: 1, oy: -429, rx: 196, ry: 100 };  // cup opening ellipse (cup units)
  const STEPS = [0, 0.22, 0.5, 0.93];               // when each caption appears

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg   = (p, a, b) => clamp((p - a) / (b - a));
  const ease  = (t) => t * t * (3 - 2 * t);
  const lerp  = (a, b, t) => a + (b - a) * t;

  // Spout tip in tent coordinates for a given tilt and lift
  function tipAt(deg, lift) {
    const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
    const dx = (D.tip[0] - D.pivot[0]) * D.s, dy = (D.tip[1] - D.pivot[1]) * D.s;
    return { x: D.px + dx * c - dy * s, y: D.py - lift + dx * s + dy * c };
  }

  // Put the cup right under the spout's final position
  const cupX = tipAt(D.maxTilt, D.lift).x - C.ox * C.s;
  cup.setAttribute("transform", `translate(${cupX} ${C.y}) scale(${C.s})`);
  steam.setAttribute("transform", `translate(${cupX} ${C.y}) scale(${C.s})`);

  function zoomMax() { return window.innerWidth < 700 ? 2.3 : 1.75; }

  function render(p) {
    // 1) curtains gather to the doorway sides
    const s = 1 - 0.88 * ease(seg(p, 0.02, 0.26));
    flapL.setAttribute("transform", `translate(${DOOR.x1} 0) scale(${s} 1) translate(${-DOOR.x1} 0)`);
    flapR.setAttribute("transform", `translate(${DOOR.x2} 0) scale(${s} 1) translate(${-DOOR.x2} 0)`);

    // 2) camera push-in
    const z = ease(seg(p, 0.08, 0.40));
    const sc = lerp(1, zoomMax(), z);
    const fx = lerp(VIEW.cx, FOCUS.x, z), fy = lerp(VIEW.cy, FOCUS.y, z);
    cam.setAttribute("transform", `translate(${VIEW.cx} ${VIEW.cy}) scale(${sc}) translate(${-fx} ${-fy})`);

    // 3) dallah lifts, tilts, then returns
    const back = ease(seg(p, 0.92, 0.99));
    const lift = D.lift * ease(seg(p, 0.30, 0.40)) * (1 - back);
    const tilt = D.maxTilt * ease(seg(p, 0.36, 0.50)) * (1 - back);
    dallah.setAttribute("transform", `translate(${D.px} ${D.py - lift}) rotate(${tilt}) scale(${D.s})`);
    dallahShadow.setAttribute("opacity", (0.35 * (1 - lift / D.lift * 0.8)).toFixed(2));

    // 4) coffee level in the cup (visible opening is an ellipse seen from above)
    const f = ease(seg(p, 0.52, 0.92));
    const k = 0.84 + 0.14 * f;
    const cy = C.oy + C.ry * (1.75 * (1 - f) + 0.06);
    coffee.setAttribute("cy", cy.toFixed(1));
    coffee.setAttribute("rx", (C.rx * k * (f > 0.01 ? 1 : 0)).toFixed(1));
    coffee.setAttribute("ry", (C.ry * k * (f > 0.01 ? 1 : 0)).toFixed(1));
    shine.setAttribute("cx", (C.ox - C.rx * 0.25).toFixed(1));
    shine.setAttribute("cy", (cy - C.ry * 0.25).toFixed(1));
    shine.setAttribute("rx", (C.rx * k * 0.4 * (f > 0.01 ? 1 : 0)).toFixed(1));
    shine.setAttribute("ry", (C.ry * k * 0.22 * (f > 0.01 ? 1 : 0)).toFixed(1));

    // 5) the stream: falls from the spout to the coffee, then drains
    const tip = tipAt(tilt, lift);
    const startY = tip.y + 3;
    const endLocal = Math.min(cy, C.oy + C.ry * 0.35);
    const surface = C.y + endLocal * C.s;
    const bottom = lerp(startY, surface, ease(seg(p, 0.48, 0.53)));
    const top    = lerp(startY, surface, ease(seg(p, 0.90, 0.935)));
    const on = p > 0.48 && p < 0.935;
    [stream, flow].forEach((el) => {
      el.setAttribute("x1", tip.x.toFixed(1));
      el.setAttribute("x2", tip.x.toFixed(1));   // vertical stream
      el.setAttribute("y1", top.toFixed(1));
      el.setAttribute("y2", bottom.toFixed(1));
      el.setAttribute("opacity", on ? 1 : 0);
    });

    // 6) steam when the cup is full
    steam.setAttribute("opacity", seg(p, 0.93, 0.99).toFixed(2));

    // extras: moon crosses the sky, captions swap, hint fades
    if (moon) {
      moon.style.left = (8 + 74 * p).toFixed(1) + "%";
      moon.style.top = (30 - 20 * Math.sin(Math.PI * p)).toFixed(1) + "%";
    }
    let step = 0;
    STEPS.forEach((t, i) => { if (p >= t) step = i; });
    captions.forEach((c, i) => c.classList.toggle("is-active", i === step));
    if (hint) hint.classList.toggle("is-hidden", p > 0.03);
  }

  // ----- scroll -> progress -----
  function progress() {
    const navH = parseFloat(getComputedStyle(stage).top) || 0;
    const total = story.offsetHeight - stage.offsetHeight;
    return clamp((navH - story.getBoundingClientRect().top) / total);
  }
  function setNavOffset() {
    const nav = document.querySelector(".navbar");
    story.style.setProperty("--story-nav", (nav ? nav.offsetHeight : 0) + "px");
  }

  // Respect "reduce motion": show the finished scene
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    render(1);
    return;
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { render(progress()); ticking = false; });
  }

  setNavOffset();
  render(progress());
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => { setNavOffset(); onScroll(); });
})();