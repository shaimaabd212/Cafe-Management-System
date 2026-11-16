/* =========================================================
   dashboard.js — Today's sales, order count, pending orders,
   best-selling items and the sales-by-day chart.
   Owner: Yasmina (M1 Administration)
   Needs: js/shared/i18n.js (t, getLocale), js/shared/auth.js (readData, KEYS)

   The calculation functions here are also used by reports.js.

   Order shape expected in localStorage "cafe_orders"
   (written by Shaima's cart/orders pages):
   {
     id: 101,
     customerId: 4,                // or null for walk-in
     items: [ { itemId: 3, name: "Latte", price: 7, qty: 2 } ],
     total: 14,
     status: "Pending" | "Preparing" | "Ready" | "Completed" | "Cancelled",
     type: "dine-in" | "takeaway",
     table: 5,
     payment: "cash" | "card" | null,
     createdAt: "2026-11-16T09:30:00.000Z"
   }
   ========================================================= */

/* ---------- Calculations ---------- */

function getOrders() {
  return readData(KEYS.orders, []);
}

// Money and dates
// 52 → "52.00 LD" in English, "52.00 د.ل" in Arabic
function formatMoney(value) {
  return Number(value || 0).toFixed(2) + " " + t("currency");
}

// "YYYY-MM-DD" in local time — used to group orders by day.
function dayKey(date) {
  const d = new Date(date);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

// The money of an order: use order.total, or add up its items.
function orderTotal(order) {
  if (typeof order.total === "number") return order.total;
  return (order.items || []).reduce((sum, it) => sum + it.price * it.qty, 0);
}

// Only paid / finished orders count as sales (not cancelled, not still open).
function isSale(order) {
  return order.status === "Completed";
}

function ordersOnDay(orders, key) {
  return orders.filter(o => dayKey(o.createdAt) === key);
}

function totalSales(orders) {
  return orders.filter(isSale).reduce((sum, o) => sum + orderTotal(o), 0);
}

function countPending(orders) {
  return orders.filter(o => ["Pending", "Preparing", "Ready"].includes(o.status)).length;
}

// Top items by quantity sold → [{ name, qty, revenue }]
function bestSellers(orders, limit) {
  const map = {};
  orders.filter(isSale).forEach(order => {
    (order.items || []).forEach(item => {
      if (!map[item.name]) map[item.name] = { name: item.name, qty: 0, revenue: 0 };
      map[item.name].qty += item.qty;
      map[item.name].revenue += item.price * item.qty;
    });
  });
  return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, limit || 5);
}

// Sales for each day between two dates (inclusive) → [{ key, label, total, count }]
function salesByDay(orders, fromDate, toDate) {
  const days = [];
  const day = new Date(fromDate); day.setHours(0, 0, 0, 0);
  const end = new Date(toDate);   end.setHours(0, 0, 0, 0);
  while (day <= end) {
    const key = dayKey(day);
    const list = ordersOnDay(orders, key);
    days.push({
      key,
      label: day.toLocaleDateString(getLocale(), { weekday: "short", day: "numeric" }),
      total: totalSales(list),
      count: list.filter(isSale).length,
    });
    day.setDate(day.getDate() + 1);
  }
  return days;
}

/* ---------- Bar chart on <canvas> ---------- */

function drawSalesChart(canvas, data) {
  const ctx = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth, height = canvas.clientHeight;
  canvas.width = width * ratio; canvas.height = height * ratio;
  ctx.scale(ratio, ratio);
  ctx.clearRect(0, 0, width, height);

  // In Arabic (right-to-left) the chart is mirrored: oldest day on the right, axis numbers on the right.
  const rtl = document.documentElement.dir === "rtl";
  const pad = rtl ? { top: 16, right: 48, bottom: 28, left: 8 } : { top: 16, right: 8, bottom: 28, left: 48 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const max = niceMax(Math.max(...data.map(d => d.total), 0));

  // Grid lines + y labels (quiet, so the bars stand out)
  const font = getComputedStyle(document.body).fontFamily; // same font as the page (Arabic or English)
  ctx.font = "12px " + font;
  ctx.textBaseline = "middle";
  for (let i = 0; i <= 5; i++) {   // 5 steps → round numbers (e.g. 0, 50, 100 … 250)
    const value = (max / 5) * i;
    const y = pad.top + plotH - (value / max) * plotH;
    ctx.strokeStyle = i === 0 ? "#CDBB9C" : "#EFE5D3";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.left, y + .5); ctx.lineTo(width - pad.right, y + .5); ctx.stroke();
    ctx.fillStyle = "#7A6E66";
    ctx.textAlign = rtl ? "left" : "right";
    ctx.fillText(Math.round(value), rtl ? width - pad.right + 8 : pad.left - 8, y);
  }

  // Bars (rounded top, flat on the baseline)
  const slot = plotW / data.length;
  const barW = Math.min(36, slot * 0.6);
  const todayKey = dayKey(new Date());
  canvas._bars = [];
  data.forEach((d, i) => {
    const pos = rtl ? data.length - 1 - i : i; // position from the left edge
    const x = pad.left + slot * pos + (slot - barW) / 2;
    const h = max ? (d.total / max) * plotH : 0;
    const y = pad.top + plotH - h;
    ctx.fillStyle = "#B3261E";
    roundTopRect(ctx, x, y, barW, h, Math.min(4, h));
    canvas._bars.push({ x, y, w: barW, h, slotX: pad.left + slot * pos, slotW: slot, d });

    // x labels: show all if few days, otherwise every few
    const every = Math.ceil(data.length / 10);
    if (i % every === 0 || i === data.length - 1) {
      ctx.fillStyle = d.key === todayKey ? "#211A17" : "#7A6E66";
      ctx.font = (d.key === todayKey ? "bold " : "") + "12px " + font;
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText(d.key === todayKey ? t("today") : d.label, x + barW / 2, pad.top + plotH + 8);
    }
  });
}

function roundTopRect(ctx, x, y, w, h, r) {
  if (h <= 0) return;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
}

// Round the top of the axis to a friendly number (e.g. 87 → 100).
function niceMax(value) {
  if (value <= 0) return 10;
  const power = Math.pow(10, Math.floor(Math.log10(value)));
  const steps = [1, 2, 2.5, 5, 10];
  for (const s of steps) if (s * power >= value) return s * power;
  return 10 * power;
}

// Tooltip when the mouse is over a day.
function attachChartTooltip(canvas, tip) {
  canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const bar = (canvas._bars || []).find(b => mx >= b.slotX && mx < b.slotX + b.slotW);
    if (!bar) { tip.style.opacity = 0; return; }
    tip.innerHTML = `<b>${bar.d.label}</b><br>${t("chart.tip", { amount: formatMoney(bar.d.total), n: bar.d.count })}`;
    tip.style.left = bar.x + bar.w / 2 + "px";
    tip.style.top = Math.max(bar.y, 30) + "px";
    tip.style.opacity = 1;
  });
  canvas.addEventListener("mouseleave", () => (tip.style.opacity = 0));
}

/* ---------- Best-seller list (HTML bars) ---------- */

function renderBestSellers(listEl, items) {
  if (!items.length) {
    listEl.innerHTML = `<li class="empty" style="display:block">${t("dash.noSales")}</li>`;
    return;
  }
  const top = items[0].qty;
  listEl.innerHTML = items.map((it, i) => `
    <li>
      <span class="rank">${i + 1}</span>
      <span class="name">${escapeText(it.name)}</span>
      <span class="qty">${t("dash.sold", { n: it.qty })}</span>
      <span class="track"><span class="fill" style="width:${(it.qty / top) * 100}%"></span></span>
    </li>`).join("");
}

function escapeText(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/* ---------- Sample orders (only for demos when there is no data) ---------- */

function loadSampleOrders() {
  const menu = [
    { itemId: 1, name: "Arabic Coffee", price: 4 },  { itemId: 2, name: "Espresso", price: 5 },
    { itemId: 3, name: "Latte", price: 8 },          { itemId: 4, name: "Cappuccino", price: 8 },
    { itemId: 5, name: "Mint Tea", price: 4 },       { itemId: 6, name: "Date Cake", price: 9 },
    { itemId: 7, name: "Bseesa Bites", price: 6 },   { itemId: 8, name: "Fresh Orange Juice", price: 7 },
  ];
  const statuses = ["Completed", "Completed", "Completed", "Completed", "Completed", "Cancelled"];
  const orders = [];
  let id = 1000;
  for (let back = 13; back >= 0; back--) {
    const perDay = 6 + Math.floor(Math.random() * 10);
    for (let n = 0; n < perDay; n++) {
      const date = new Date();
      date.setDate(date.getDate() - back);
      date.setHours(8 + Math.floor(Math.random() * 13), Math.floor(Math.random() * 60), 0, 0);
      if (back === 0 && date > new Date()) date.setTime(Date.now() - n * 600000);
      const items = [];
      const lines = 1 + Math.floor(Math.random() * 3);
      for (let l = 0; l < lines; l++) {
        const m = menu[Math.floor(Math.random() * menu.length)];
        items.push({ ...m, qty: 1 + Math.floor(Math.random() * 2) });
      }
      let status = statuses[Math.floor(Math.random() * statuses.length)];
      if (back === 0 && n < 3) status = ["Pending", "Preparing", "Ready"][n];
      orders.push({
        id: ++id, customerId: null, items,
        total: items.reduce((s, it) => s + it.price * it.qty, 0),
        status, type: Math.random() < 0.6 ? "dine-in" : "takeaway",
        table: 1 + Math.floor(Math.random() * 12),
        payment: status === "Completed" ? (Math.random() < 0.7 ? "cash" : "card") : null,
        createdAt: date.toISOString(),
      });
    }
  }
  writeData(KEYS.orders, orders);
}

/* ---------- Page: dashboard.html ---------- */

function renderDashboard() {
  const orders = getOrders();
  // Show the empty state first, so the chart is drawn while visible (correct width).
  document.getElementById("no-orders").hidden = orders.length > 0;
  document.getElementById("dash-content").hidden = orders.length === 0;

  document.getElementById("today-label").textContent =
    new Date().toLocaleDateString(getLocale(), { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const today = dayKey(new Date());
  const todays = ordersOnDay(orders, today);

  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const ySales = totalSales(ordersOnDay(orders, dayKey(yesterday)));
  const tSales = totalSales(todays);

  document.getElementById("kpi-sales").textContent = formatMoney(tSales);
  document.getElementById("kpi-sales-note").textContent = ySales
    ? t("kpi.vsYesterday", { arrow: tSales >= ySales ? "▲" : "▼", pct: Math.abs(Math.round(((tSales - ySales) / ySales) * 100)) })
    : t("kpi.noYesterday");
  document.getElementById("kpi-orders").textContent = todays.length;
  document.getElementById("kpi-pending").textContent = countPending(orders);
  const done = todays.filter(isSale);
  document.getElementById("kpi-avg").textContent = formatMoney(done.length ? tSales / done.length : 0);

  // Chart: last 7 days
  const from = new Date(); from.setDate(from.getDate() - 6);
  const week = salesByDay(orders, from, new Date());
  const canvas = document.getElementById("sales-chart");
  drawSalesChart(canvas, week);
  document.getElementById("week-total").textContent = t("dash.thisWeek", { amount: formatMoney(week.reduce((s, d) => s + d.total, 0)) });

  renderBestSellers(document.getElementById("best-list"), bestSellers(orders, 5));

  // Latest 6 orders
  const latest = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  document.getElementById("recent-body").innerHTML = latest.map(o => `
    <tr>
      <td>#${o.id}</td>
      <td>${new Date(o.createdAt).toLocaleString(getLocale(), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
      <td>${o.type === "takeaway" ? t("type.takeaway") : t("where.table", { n: o.table || "—" })}</td>
      <td>${(o.items || []).reduce((s, it) => s + it.qty, 0)}</td>
      <td><span class="badge ${o.status}">${t("status." + o.status)}</span></td>
      <td class="num">${formatMoney(orderTotal(o))}</td>
    </tr>`).join("");

}

function initDashboard() {
  if (!document.getElementById("dashboard")) return; // not on this page
  renderDashboard();
  attachChartTooltip(document.getElementById("sales-chart"), document.getElementById("chart-tip"));
  document.getElementById("load-sample").addEventListener("click", () => { loadSampleOrders(); renderDashboard(); });
  window.addEventListener("resize", renderDashboard);
  document.addEventListener("langchange", renderDashboard); // redraw in the new language
  // Refresh when another tab (e.g. the cashier) changes the orders.
  window.addEventListener("storage", e => { if (e.key === KEYS.orders) renderDashboard(); });
}

initDashboard();
