/* =========================================================
   reports.js — Sales by day for a chosen period + CSV export
   Owner: Yasmina (M1 Administration)
   Needs: js/shared/i18n.js, js/shared/auth.js and js/admin/dashboard.js
          (uses getOrders, salesByDay, bestSellers, formatMoney…)
   ========================================================= */

const fromInput = document.getElementById("from-date");
const toInput   = document.getElementById("to-date");

// Value for <input type="date"> → "YYYY-MM-DD"
function toInputDate(date) {
  return dayKey(date);
}

// Quick ranges: last 7 days, last 30 days, this month.
function setRange(preset) {
  const to = new Date();
  const from = new Date();
  if (preset === "7") from.setDate(to.getDate() - 6);
  if (preset === "30") from.setDate(to.getDate() - 29);
  if (preset === "month") from.setDate(1);
  fromInput.value = toInputDate(from);
  toInput.value = toInputDate(to);
  document.querySelectorAll("[data-range]").forEach(b => b.classList.toggle("btn-primary", b.dataset.range === preset));
  document.querySelectorAll("[data-range]").forEach(b => b.classList.toggle("btn-ghost", b.dataset.range !== preset));
  renderReport();
}

// Orders that fall inside the chosen dates.
function ordersInRange() {
  const from = fromInput.value, to = toInput.value;
  return getOrders().filter(o => {
    const key = dayKey(o.createdAt);
    return key >= from && key <= to;
  });
}

// Read the period from the inputs (and fix it if "from" is after "to").
function getPeriod() {
  if (fromInput.value > toInput.value) [fromInput.value, toInput.value] = [toInput.value, fromInput.value];
  return { from: new Date(fromInput.value + "T00:00"), to: new Date(toInput.value + "T00:00") };
}

function renderReport() {
  const period = getPeriod();
  const orders = ordersInRange();
  const days = salesByDay(orders, period.from, period.to);
  const completed = orders.filter(isSale);
  const sales = totalSales(orders);

  // Summary tiles
  document.getElementById("r-sales").textContent = formatMoney(sales);
  document.getElementById("r-completed").textContent = completed.length;
  document.getElementById("r-cancelled").textContent = orders.filter(o => o.status === "Cancelled").length;
  document.getElementById("r-avg").textContent = formatMoney(completed.length ? sales / completed.length : 0);

  // Chart
  drawSalesChart(document.getElementById("report-chart"), days);

  // Daily table (newest first)
  document.getElementById("days-body").innerHTML = [...days].reverse().map(d => `
    <tr>
      <td>${new Date(d.key + "T00:00").toLocaleDateString(getLocale(), { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</td>
      <td class="num">${d.count}</td>
      <td class="num">${formatMoney(d.count ? d.total / d.count : 0)}</td>
      <td class="num">${formatMoney(d.total)}</td>
    </tr>`).join("");
  document.getElementById("days-foot").innerHTML = `
    <tr><td>${t("rep.total")}</td><td class="num">${completed.length}</td><td class="num"></td><td class="num">${formatMoney(sales)}</td></tr>`;

  // Best sellers table
  const best = bestSellers(orders, 10);
  document.getElementById("items-body").innerHTML = best.length
    ? best.map((it, i) => `
      <tr><td>${i + 1}</td><td>${escapeText(it.name)}</td><td class="num">${it.qty}</td><td class="num">${formatMoney(it.revenue)}</td></tr>`).join("")
    : `<tr><td colspan="4" class="empty">${t("rep.noCompleted")}</td></tr>`;

  document.getElementById("period-label").textContent =
    `${period.from.toLocaleDateString(getLocale(), { day: "numeric", month: "short" })} – ${period.to.toLocaleDateString(getLocale(), { day: "numeric", month: "short", year: "numeric" })}`;
}

/* ---------- CSV export ---------- */

// Put quotes around a value if it has a comma, quote or new line.
function csvCell(value) {
  const text = String(value == null ? "" : value);
  return /[",\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}

function buildCSV(rows) {
  return rows.map(row => row.map(csvCell).join(",")).join("\r\n");
}

// Make the browser download a text file.
function downloadFile(filename, text) {
  const blob = new Blob(["﻿" + text], { type: "text/csv;charset=utf-8" }); // BOM so Excel reads Arabic correctly
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

function exportDailyCSV() {
  const period = getPeriod();
  const days = salesByDay(ordersInRange(), period.from, period.to);
  const cur = t("currency");
  const rows = [[t("csv.date"), t("csv.completed"), t("csv.sales", { cur })]];
  days.forEach(d => rows.push([d.key, d.count, d.total.toFixed(2)]));
  rows.push([t("csv.total"), days.reduce((s, d) => s + d.count, 0), days.reduce((s, d) => s + d.total, 0).toFixed(2)]);
  downloadFile(`riwaq-sales-by-day_${fromInput.value}_to_${toInput.value}.csv`, buildCSV(rows));
}

function exportOrdersCSV() {
  const cur = t("currency");
  const rows = [[t("csv.orderId"), t("csv.date"), t("csv.time"), t("csv.type"), t("csv.table"),
                 t("csv.status"), t("csv.payment"), t("csv.items"), t("csv.totalCol", { cur })]];
  ordersInRange().forEach(o => {
    const d = new Date(o.createdAt);
    rows.push([
      o.id, dayKey(d), d.toTimeString().slice(0, 5), o.type ? t("type." + o.type) : "", o.table || "",
      t("status." + o.status), o.payment ? t("payment." + o.payment) : "",
      (o.items || []).map(it => `${it.qty}x ${it.name}`).join("; "),
      orderTotal(o).toFixed(2),
    ]);
  });
  downloadFile(`riwaq-orders_${fromInput.value}_to_${toInput.value}.csv`, buildCSV(rows));
}

/* ---------- Events ---------- */
document.querySelectorAll("[data-range]").forEach(btn => btn.addEventListener("click", () => setRange(btn.dataset.range)));
[fromInput, toInput].forEach(input => input.addEventListener("change", () => {
  document.querySelectorAll("[data-range]").forEach(b => { b.classList.remove("btn-primary"); b.classList.add("btn-ghost"); });
  renderReport();
}));
document.getElementById("export-days").addEventListener("click", exportDailyCSV);
document.getElementById("export-orders").addEventListener("click", exportOrdersCSV);
document.getElementById("print-report").addEventListener("click", () => window.print());
attachChartTooltip(document.getElementById("report-chart"), document.getElementById("report-tip"));
window.addEventListener("resize", renderReport);
document.addEventListener("langchange", renderReport); // redraw in the new language

setRange("7");
