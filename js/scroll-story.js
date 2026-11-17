// Scroll story: every value is linked to scroll progress (0 → 1),
// so scrolling back up plays it in reverse. Uses Motion's vanilla scroll().
import { scroll } from "https://cdn.jsdelivr.net/npm/motion@11/+esm";

const story = document.getElementById("story");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (story && !reduced) {
  const stage = document.getElementById("storyStage");
  const texts = [1, 2, 3].map((n) => document.getElementById("storyText" + n));
  const pour = document.getElementById("storyPour");
  const cup = document.getElementById("storyCup");
  const liquid = document.getElementById("liquid");
  const steam = document.getElementById("steam");
  const beans = [...document.querySelectorAll(".bean")].map((el) => ({
    el,
    speed: +el.dataset.speed,
    start: +el.dataset.start,
    rot: +el.dataset.rot,
  }));

  // ----- helpers -----
  const clamp01 = (n) => Math.min(1, Math.max(0, n));
  const range = (p, a, b) => clamp01((p - a) / (b - a));
  const ease = (t) => t * t * (3 - 2 * t);
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

  function colorAt(stops, p) {
    for (let i = 0; i < stops.length - 1; i++) {
      const [p0, c0] = stops[i];
      const [p1, c1] = stops[i + 1];
      if (p <= p1) {
        const t = ease(range(p, p0, p1));
        const a = rgb(c0), b = rgb(c1);
        return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * t)).join(",")})`;
      }
    }
    return stops[stops.length - 1][1];
  }

  // brand colors (same as :root in style.css)
  const CREAM = "#FAF1E6", SAND = "#EFE0CC", RED = "#A52A22";
  const bgStops   = [[0, CREAM], [0.28, CREAM], [0.40, RED], [0.60, RED], [0.72, SAND], [1, SAND]];
  const textStops = [[0, RED],   [0.28, RED],   [0.40, CREAM], [0.60, CREAM], [0.72, RED], [1, RED]];

  // slide a headline in from the right and out to the left
  function slide(el, p, inA, inB, outA, outB) {
    const enter = ease(range(p, inA, inB));
    const exit = ease(range(p, outA, outB));
    const x = (1 - enter) * 60 - exit * 60; // in vw
    el.style.transform = `translate(${x}vw, -50%)`;
    el.style.opacity = enter * (1 - exit);
  }

  function update(p) {
    const H = stage.clientHeight;

    // background and text color
    stage.style.background = colorAt(bgStops, p);
    const tc = colorAt(textStops, p);
    texts.forEach((t) => (t.style.color = tc));

    // headlines
    slide(texts[0], p, -1, 0, 0.25, 0.38);
    slide(texts[1], p, 0.30, 0.42, 0.58, 0.70);
    slide(texts[2], p, 0.66, 0.78, 2, 3); // stays until the end

    // beans fall (parallax: different speeds and delays)
    const q = range(p, 0, 0.55);
    beans.forEach((b) => {
      const y = -140 - b.start + q * (H + 280 + b.start) * b.speed;
      b.el.style.transform = `translate3d(0, ${y}px, 0) rotate(${q * b.rot * 360}deg)`;
    });

    // cup rises in, pour stream, cup fills, steam
    const appear = ease(range(p, 0.38, 0.50));
    cup.style.opacity = appear;
    cup.style.transform = `translate(-50%, ${(1 - appear) * 80}px)`;

    pour.style.transform = `scaleY(${ease(range(p, 0.40, 0.52))})`;
    pour.style.opacity = 1 - range(p, 0.66, 0.72);

    liquid.style.transform = `translateY(${(1 - ease(range(p, 0.45, 0.68))) * 90}px)`;
    steam.style.opacity = range(p, 0.72, 0.88);
  }

  update(0);

  // progress goes 0 → 1 while the tall .story section scrolls past
  scroll((progress) => update(progress), {
    target: story,
    offset: ["start start", "end end"],
  });
}