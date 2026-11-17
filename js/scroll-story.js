(function () {
  const story = document.querySelector("[data-story]");
  if (!story) return;

  const stage = story.querySelector(".story__stage");
  const $ = (id) => story.querySelector("#" + id);
  const cam = $("cam");
  const flapL = $("flapL");
  const flapR = $("flapR");
  const dallahShadow = $("dallahShadow");
  const dallah = $("dallah");
  const cup = $("cup");
  const steam = $("steam");
  const coffee = $("coffee");
  const shine = $("coffeeShine");
  const stream = $("stream");
  const flow = $("flow");
  const captions = story.querySelectorAll(".story__caption");
  const hint = story.querySelector(".story__hint");

  const VIEW  = { cx: 600, cy: 360 };
  const FOCUS = { x: 600, y: 450 };
  const DOOR  = { x1: 420, x2: 780 };
  const D = {
    px: 530, py: 565, s: 0.22,
    pivot: [-20, -40], tip: [230, -290],
    lift: 65, maxTilt: 32
  };
  const C = {
    y: 572, s: 0.16,
    ox: 0, oy: -360, rx: 165, ry: 82
  };
  const STEPS = [0, 0.22, 0.5, 0.93];

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg   = (p, a, b) => clamp((p - a) / (b - a));
  const ease  = (t) => t * t * (3 - 2 * t);
  const lerp  = (a, b, t) => a + (b - a) * t;

  function tipAt(deg, lift) {
    const r = (deg * Math.PI) / 180;
    const c = Math.cos(r);
    const s = Math.sin(r);
    const dx = (D.tip[0] - D.pivot[0]) * D.s;
    const dy = (D.tip[1] - D.pivot[1]) * D.s;
    return {
      x: D.px + dx * c - dy * s,
      y: D.py - lift + dx * s + dy * c
    };
  }

  const cupX = tipAt(D.maxTilt, D.lift).x - C.ox * C.s;
  if (cup) cup.setAttribute("transform", `translate(${cupX.toFixed(1)} ${C.y}) scale(${C.s})`);
  if (steam) steam.setAttribute("transform", `translate(${cupX.toFixed(1)} ${C.y}) scale(${C.s})`);

  function zoomMax() {
    return window.innerWidth < 700 ? 1.2 : 1.15;
  }

  function render(p) {
    // 1. Curtains open to the sides
    const openAmt = ease(seg(p, 0.02, 0.26));
    const curtainScale = lerp(1, 0.12, openAmt);
    if (flapL) flapL.setAttribute("transform", `translate(${DOOR.x1} 0) scale(${curtainScale.toFixed(3)} 1) translate(${-DOOR.x1} 0)`);
    if (flapR) flapR.setAttribute("transform", `translate(${DOOR.x2} 0) scale(${curtainScale.toFixed(3)} 1) translate(${-DOOR.x2} 0)`);

    // 2. Subtle camera push-in (keeps tent crisp)
    const z = ease(seg(p, 0.08, 0.40));
    const sc = lerp(1, zoomMax(), z);
    const fx = lerp(VIEW.cx, FOCUS.x, z);
    const fy = lerp(VIEW.cy, FOCUS.y, z);
    if (cam) cam.setAttribute("transform", `translate(${VIEW.cx} ${VIEW.cy}) scale(${sc.toFixed(3)}) translate(${-fx.toFixed(1)} ${-fy.toFixed(1)})`);

    // 3. Dallah lifts and tilts, then returns
    const back = ease(seg(p, 0.92, 0.99));
    const lift = D.lift * ease(seg(p, 0.30, 0.40)) * (1 - back);
    const tilt = D.maxTilt * ease(seg(p, 0.36, 0.50)) * (1 - back);
    if (dallah) {
      dallah.setAttribute("transform", `translate(${D.px} ${(D.py - lift).toFixed(1)}) rotate(${tilt.toFixed(2)}) scale(${D.s})`);
    }
    if (dallahShadow) {
      dallahShadow.setAttribute("opacity", (0.35 * (1 - (lift / D.lift) * 0.75)).toFixed(2));
    }

    // 4. Coffee fills inside cup
    const f = ease(seg(p, 0.52, 0.92));
    const k = 0.84 + 0.14 * f;
    const cy = C.oy + C.ry * (1.5 * (1 - f) + 0.05);
    const rx = f > 0.01 ? C.rx * k : 0;
    const ry = f > 0.01 ? C.ry * k : 0;

    if (coffee) {
      coffee.setAttribute("cy", cy.toFixed(1));
      coffee.setAttribute("rx", rx.toFixed(1));
      coffee.setAttribute("ry", ry.toFixed(1));
    }
    if (shine) {
      shine.setAttribute("cx", (C.ox - C.rx * 0.22).toFixed(1));
      shine.setAttribute("cy", (cy - C.ry * 0.22).toFixed(1));
      shine.setAttribute("rx", (rx * 0.38).toFixed(1));
      shine.setAttribute("ry", (ry * 0.22).toFixed(1));
    }

    // 5. Pouring stream
    const tip = tipAt(tilt, lift);
    const startY = tip.y + 4;
    const endLocal = Math.min(cy, C.oy + C.ry * 0.3);
    const surface = C.y + endLocal * C.s;
    const bottom = lerp(startY, surface, ease(seg(p, 0.48, 0.53)));
    const top = lerp(startY, surface, ease(seg(p, 0.90, 0.935)));
    const on = p > 0.48 && p < 0.935;

    [stream, flow].forEach((el) => {
      if (!el) return;
      el.setAttribute("x1", tip.x.toFixed(1));
      el.setAttribute("x2", tip.x.toFixed(1));
      el.setAttribute("y1", top.toFixed(1));
      el.setAttribute("y2", bottom.toFixed(1));
      el.setAttribute("opacity", on ? "1" : "0");
    });

    // 6. Steam
    if (steam) steam.setAttribute("opacity", seg(p, 0.93, 0.99).toFixed(2));

    // Captions & hint
    let step = 0;
    STEPS.forEach((t, i) => { if (p >= t) step = i; });
    captions.forEach((c, i) => c.classList.toggle("is-active", i === step));
    if (hint) hint.classList.toggle("is-hidden", p > 0.03);
  }

  function getProgress() {
    if (!story || !stage) return 0;
    const rect = story.getBoundingClientRect();
    const nav = document.querySelector(".navbar");
    const navH = nav ? nav.offsetHeight : 0;
    const scrollable = story.offsetHeight - stage.offsetHeight;
    if (scrollable <= 0) return 0;
    return clamp((navH - rect.top) / scrollable);
  }

  let smoothP = getProgress();
  let ticking = false;

  function update() {
    const targetP = getProgress();
    smoothP += (targetP - smoothP) * 0.22;
    render(smoothP);

    if (Math.abs(targetP - smoothP) > 0.001) {
      requestAnimationFrame(update);
    } else {
      smoothP = targetP;
      render(smoothP);
      ticking = false;
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    render(1);
    return;
  }

  render(smoothP);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
})();