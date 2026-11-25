/* ============================================================
   Riwaq Cafe — cashier/bill.js
   cashier/bill.html?id=1003 : show the bill for one order,
   take the payment (cash or card) and print the receipt.
   Without ?id= it lists the orders that are not paid yet.
   Owner: Shaima (M3 Front of House)

   Payment adds to the order:
     paid: true, paidAt, payMethod: "cash" | "card", cashGiven, change, paidBy
   (Handing the order over — status "Completed" — is done on orders.html.)

   Needs: i18n.js → t(), getLocale() · storage.js → load(), save()
          auth.js → getCurrentUser(), setFieldError()
          menu-common.js → esc(), money(), getMenu(), orderWhere(), orderLineName(), loadOrders()
   ============================================================ */

var billId = Number(new URLSearchParams(location.search).get("id")) || null;

// ---------- small helpers ----------

function findOrder(id) {
  return loadOrders().find(function (o) { return o.id === id; }) || null;
}

function dateTime(ts) {
  return new Date(ts).toLocaleString(getLocale(), { dateStyle: "medium", timeStyle: "short" });
}

function round2(n) { return Math.round(n * 100) / 100; }

function showToast(message) {
  var toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(function () { toast.classList.remove("show"); }, 2600);
}

// ---------- no order chosen: list of unpaid orders ----------

function renderChooser() {
  var open = loadOrders()
    .filter(function (o) { return !o.paid && o.status !== "Cancelled"; })
    .sort(function (a, b) { return a.placedAt - b.placedAt; });

  var box = document.getElementById("choose-list");
  if (!open.length) {
    box.innerHTML = '<p class="empty">' + esc(t("bill.noneOpen")) + "</p>";
    return;
  }
  box.innerHTML = '<table class="data"><thead><tr>' +
    "<th>" + esc(t("th.order")) + "</th><th>" + esc(t("rc.customer")) + "</th><th>" + esc(t("th.where")) + "</th>" +
    "<th>" + esc(t("th.status")) + '</th><th class="num">' + esc(t("th.total")) + "</th><th></th></tr></thead><tbody>" +
    open.map(function (o) {
      return "<tr><td><strong>#" + o.id + "</strong></td>" +
        "<td>" + esc(o.customerName || t("cash.walkIn")) + "</td>" +
        "<td>" + esc(orderWhere(o)) + "</td>" +
        '<td><span class="badge badge-' + o.status.toLowerCase() + '">' + esc(t("status." + o.status)) + "</span></td>" +
        '<td class="num">' + esc(money(o.total)) + "</td>" +
        '<td><a class="btn btn-primary btn-sm" href="bill.html?id=' + o.id + '">' + esc(t("bill.open")) + "</a></td></tr>";
    }).join("") + "</tbody></table>";
}

// ---------- the receipt ----------

function receiptHtml(o) {
  var menu = getMenu();
  var me = getCurrentUser();
  var rows = (o.items || []).map(function (line) {
    return '<tr><td class="qty">' + line.qty + "×</td>" +
      "<td>" + esc(orderLineName(menu, line)) + "</td>" +
      '<td class="num">' + esc(money(round2(line.price * line.qty))) + "</td></tr>";
  }).join("");

  var stamp;
  if (o.status === "Cancelled") stamp = '<span class="stamp cancelled">' + esc(t("rc.cancelled")) + "</span>";
  else if (o.paid) stamp = '<span class="stamp paid">' + esc(t("rc.paid")) + "</span>";
  else stamp = '<span class="stamp unpaid">' + esc(t("rc.unpaid")) + "</span>";

  var paybox = "";
  if (o.paid) {
    paybox = '<div class="paybox">' +
      "<div><span>" + esc(t("rc.method")) + "</span><span>" + esc(t(o.payMethod === "card" ? "pay.card" : "pay.cash")) + "</span></div>" +
      (o.payMethod === "cash" && o.cashGiven != null
        ? "<div><span>" + esc(t("rc.received")) + "</span><span>" + esc(money(o.cashGiven)) + "</span></div>" +
          "<div><span>" + esc(t("rc.change")) + "</span><span>" + esc(money(o.change || 0)) + "</span></div>"
        : "") +
      "</div>";
  }

  return '<div class="head">' +
      '<img src="' + rootPath() + 'img/riwaq-logo.svg" alt="">' +
      '<p class="cafe">' + esc(t("rc.cafe")) + "</p>" +
      '<p class="ar" lang="ar">رواق</p>' +
    "</div>" +
    "<dl>" +
      "<dt>" + esc(t("rc.order")) + "</dt><dd>#" + o.id + "</dd>" +
      "<dt>" + esc(t("rc.date")) + "</dt><dd>" + esc(dateTime(o.paidAt || o.placedAt)) + "</dd>" +
      "<dt>" + esc(t("rc.customer")) + "</dt><dd>" + esc(o.customerName || t("cash.walkIn")) + "</dd>" +
      "<dt>" + esc(t("rc.type")) + "</dt><dd>" + esc(orderWhere(o)) + "</dd>" +
      "<dt>" + esc(t("rc.cashier")) + "</dt><dd>" + esc(o.paidBy || (me ? me.name : "")) + "</dd>" +
    "</dl>" +
    "<table><thead><tr><th>" + esc(t("th.qty")) + "</th><th>" + esc(t("th.item")) + '</th><th class="num">' + esc(t("rc.price")) + "</th></tr></thead>" +
    "<tbody>" + rows + "</tbody></table>" +
    '<div class="grand"><span>' + esc(t("rc.total")) + '</span><span class="value">' + esc(money(o.total)) + "</span></div>" +
    paybox +
    (o.note ? '<p class="note">' + esc(t("cash.notePrefix")) + " " + esc(o.note) + "</p>" : "") +
    stamp +
    '<p class="thanks">' + esc(t("rc.thanks")) + "</p>" +
    '<div class="kilim-strip"></div>';
}

// ---------- the payment panel ----------

// Exact amount + the next round notes above it (5, 10, 20, 50).
function quickAmounts(total) {
  var list = [total];
  [5, 10, 20, 50].forEach(function (step) {
    var v = Math.ceil(total / step) * step;
    if (v > total && list.indexOf(v) < 0) list.push(v);
  });
  return list.slice(0, 4);
}

function updateChange(o) {
  var given = Number(document.getElementById("cash-given").value) || 0;
  var change = round2(given - o.total);
  document.getElementById("change").textContent = money(change > 0 ? change : 0);
}

function showCashPart() {
  document.getElementById("cash-part").hidden = !document.getElementById("m-cash").checked;
}

function renderPanel(o) {
  var form = document.getElementById("pay-form");
  var done = document.getElementById("pay-done");

  if (o.status === "Cancelled") {
    form.hidden = true;
    done.hidden = false;
    done.className = "done cancelled";
    done.textContent = t("pay.cancelledText");
    return;
  }
  if (o.paid) {
    form.hidden = true;
    done.hidden = false;
    done.className = "done";
    done.textContent = t("pay.doneText", {
      method: t(o.payMethod === "card" ? "pay.card" : "pay.cash"),
      time: dateTime(o.paidAt || Date.now())
    });
    return;
  }

  form.hidden = false;
  done.hidden = true;
  document.getElementById("pay-due").textContent = money(o.total);
  var given = document.getElementById("cash-given");
  if (!given.value) given.value = o.total;
  document.getElementById("quick").innerHTML = quickAmounts(o.total).map(function (v, i) {
    return '<button type="button" data-amount="' + v + '">' + esc(i === 0 ? t("pay.exact") : money(v)) + "</button>";
  }).join("");
  showCashPart();
  updateChange(o);
}

function renderBill() {
  var o = findOrder(billId);
  if (!o) {
    document.getElementById("bill").hidden = true;
    document.getElementById("not-found").hidden = false;
    document.getElementById("not-found-text").textContent = t("bill.notFound", { id: billId });
    return;
  }
  document.getElementById("bill").hidden = false;
  document.getElementById("receipt").innerHTML = receiptHtml(o);
  renderPanel(o);
}

function takePayment(event) {
  event.preventDefault();
  var o = findOrder(billId);
  if (!o || o.paid || o.status === "Cancelled") { renderBill(); return; }

  var method = event.target.elements.method.value;
  var givenInput = document.getElementById("cash-given");
  var given = Number(givenInput.value);
  if (method === "cash") {
    if (!givenInput.value || !(given >= o.total)) {
      setFieldError(givenInput, t("pay.short", { total: money(o.total) }));
      givenInput.focus();
      return;
    }
    setFieldError(givenInput, "");
  }

  var me = getCurrentUser();
  var orders = loadOrders();
  var order = orders.find(function (x) { return x.id === billId; });
  order.paid = true;
  order.paidAt = Date.now();
  order.payMethod = method;
  order.cashGiven = method === "cash" ? given : null;
  order.change = method === "cash" ? round2(given - order.total) : 0;
  order.paidBy = me ? me.name : "";
  save("orders", orders);

  renderBill();
  showToast(t("pay.tPaid", { id: billId }));
  setTimeout(function () { window.print(); }, 300);   // print the receipt
}

// ---------- start ----------

document.addEventListener("DOMContentLoaded", function () {
  if (!billId) {
    document.getElementById("choose").hidden = false;
    renderChooser();
    document.addEventListener("langchange", renderChooser);
    window.addEventListener("storage", renderChooser);
    return;
  }

  document.getElementById("pay-form").addEventListener("submit", takePayment);
  document.getElementById("print-btn").addEventListener("click", function () { window.print(); });
  document.querySelectorAll('#pay-form input[name="method"]').forEach(function (r) {
    r.addEventListener("change", showCashPart);
  });
  document.getElementById("cash-given").addEventListener("input", function () {
    var o = findOrder(billId);
    if (o) updateChange(o);
  });
  document.getElementById("quick").addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-amount]");
    if (!btn) return;
    var input = document.getElementById("cash-given");
    input.value = btn.dataset.amount;
    setFieldError(input, "");
    var o = findOrder(billId);
    if (o) updateChange(o);
  });

  renderBill();
  document.addEventListener("langchange", renderBill);
  window.addEventListener("storage", renderBill);
});
