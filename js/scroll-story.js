import { scroll } from "https://cdn.jsdelivr.net/npm/motion@11/+esm";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduced) {
  const beans = [...document.querySelectorAll(".bean")].map((el) => ({
    el,
    speed: +el.dataset.speed,
    start: +el.dataset.start,
    rot: +el.dataset.rot,
  }));

  function updateBeans(p) {
    const screenHeight = window.innerHeight;
    
    beans.forEach((b) => {
      // As you scroll down (p goes from 0 to 1), each bean travels down 
      // past the screen height plus its starting offset so it fully exits the bottom viewport.
      const totalDistance = screenHeight + 300 + b.start;
      const y = -150 - b.start + p * totalDistance * b.speed;

      b.el.style.transform = `translate3d(0, ${y}px, 0) rotate(${p * b.rot * 720}deg)`;
    });
  }

  updateBeans(0);

  scroll((progress) => updateBeans(progress), {
    target: document.body,
    offset: ["start start", "end end"],
  });
}