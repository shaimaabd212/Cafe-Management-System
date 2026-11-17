import { scroll } from "https://cdn.jsdelivr.net/npm/motion@11/+esm";

const story = document.getElementById("story");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (story && !reduced) {
  const stage = document.getElementById("storyStage");
  const texts = [1, 2, 3].map((n) => document.getElementById("storyText" + n));
  const pour = document.getElementById("storyPour");
  const cup = document.getElementById("storyCup");
  const cupFilled = document.getElementById("cupFilled");
  const beans = [...document.querySelectorAll(".bean")].map((el) => ({
    el,
    speed: +el.dataset.speed,
    start: +el.dataset.start,
    rot: +el.dataset.rot,
  }));

  const clamp01 = (n) => Math.min(1, Math.max(0, n));
  const range = (p, a, b) => clamp01((p - a) / (b - a));
  const ease = (t) => t * t * (3 - 2 * t);

  function slide(el, p, inA, inB, outA, outB) {
    const enter = ease(range(p, inA, inB));
    const exit = ease(range(p, outA, outB));
    const x = (1 - enter) * 60 - exit * 60;
    el.style.transform = `translate(${x}vw, -50%)`;
    el.style.opacity = enter * (1 - exit);
  }

  function update(p) {
    const H = stage.clientHeight;

    // Headlines
    slide(texts[0], p, -1, 0, 0.25, 0.38);
    slide(texts[1], p, 0.30, 0.42, 0.58, 0.70);
    slide(texts[2], p, 0.66, 0.78, 2, 3);

    // Individual falling coffee beans
    const q = range(p, 0, 0.55);
    beans.forEach((b) => {
      const y = -140 - b.start + q * (H + 280 + b.start) * b.speed;
      b.el.style.transform = `translate3d(0, ${y}px, 0) rotate(${q * b.rot * 360}deg)`;
    });

    // Cup appearance and rise
    const appear = ease(range(p, 0.38, 0.50));
    cup.style.opacity = appear;
    cup.style.transform = `translate(-50%, ${(1 - appear) * 80}px)`;

    // Pour stream animation
    const pourProgress = ease(range(p, 0.40, 0.52));
    pour.style.transform = `scaleY(${pourProgress})`;
    pour.style.opacity = 1 - range(p, 0.66, 0.72);

    // Cup filling animation (reveal filled cup layer from bottom to top)
    const fillProgress = ease(range(p, 0.45, 0.68));
    const clipPercent = 100 - (fillProgress * 100);
    cupFilled.style.clipPath = `inset(${clipPercent}% 0 0 0)`;
  }

  update(0);

  scroll((progress) => update(progress), {
    target: story,
    offset: ["start start", "end end"],
  });
}