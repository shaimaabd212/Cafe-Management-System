/* ============================================================
   Riwaq Cafe — cashier/orders.js
   cashier/orders.html : the cashier receives orders, confirms them,
   takes walk-in orders, and opens the bill to take payment.
   Owner: Shaima (M3 Front of House)

   How an order moves:
     customer places it  → status "Pending", confirmed: false   (shown here as "New")
     cashier confirms    → confirmed: true  (the kitchen can start it)
     barista             → "Preparing" → "Ready"                 (barista/kitchen.html)
     cashier takes money → paid: true        (cashier/bill.html)
     cashier hands over  → "Completed"       (only when paid)
   The cashier can cancel a new order (before confirming it).

   Needs: i18n.js → t(), getLocale() · storage.js → load(), save()
          auth.js → getCurrentUser(), setFieldError()
          menu-common.js → esc(), money(), itemName(), getMenu(), getCategories(), findMenuItem(), receiptHtml(), askConfirm(),
                           timeAgo(), orderWhere(), orderLineName(), loadOrders(), nextOrderId()
   ============================================================ */

var FILTERS = ["new", "kitchen", "ready", "done"];
var cashState = { filter: "new" };
var walkQty = {};   // walk-in form: menuId → qty

// ---------- which tab an order is in ----------

function stageOf(o) {
  if (o.status === "Cancelled" || o.status === "Completed") return "done";
  if (o.status === "Ready") return "ready";
  if (o.status === "Pending" && !o.confirmed) return "new";
  return "kitchen";                                  // confirmed Pending, or Preparing
}

// Change one order and save it. fn(order) edits the order in place.
function updateOrder(id, fn) {
  var orders = loadOrders();
  var o = orders.find(function (x) { return x.id === id; });
  if (!o) return null;
  fn(o);
  save("orders", orders);
  renderOrders();
  return o;
}

function showToast(message) {
  var toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(function () { toast.classList.remove("show"); }, 2600);
}

// ---------- drawing the page ----------

var TAB_KEYS = { new: "cash.fNew", kitchen: "cash.fKitchen", ready: "cash.fReady", done: "cash.fDone" };

function renderTabs(orders) {
  document.getElementById("filter-tabs").innerHTML = FILTERS.map(function (f) {
    var n = orders.filter(function (o) { return stageOf(o) === f; }).length;
    return '<button type="button" data-filter="' + f + '" aria-pressed="' + (f === cashState.filter) + '">' +
      esc(t(TAB_KEYS[f])) + (f === "done" ? "" : '<span class="n">' + n + "</span>") + "</button>";
  }).join("");
}

// One status tag per card.
function badgeHtml(o) {
  var stage = stageOf(o);
  if (stage === "new") return '<span class="badge badge-new">' + esc(t("cash.newTag")) + "</span>";
  var status = shownStatus(o);                       // "Confirmed" until the kitchen starts it
  return '<span class="badge badge-' + status.toLowerCase() + '">' + esc(t("status." + status)) + "</span>";
}

// The one next step for this order (plus a small link when needed).
function actionsHtml(o) {
  var stage = stageOf(o);
  var billUrl = "bill.html?id=" + o.id;
  if (stage === "new") {
    return '<button type="button" class="btn btn-secondary" data-action="confirm" data-id="' + o.id + '">' + esc(t("cash.confirm")) + "</button>" +
      '<button type="button" class="link-btn" data-action="cancel" data-id="' + o.id + '">' + esc(t("cash.cancel")) + "</button>";
  }
  if (stage === "ready" && !o.paid) {
    return '<a class="btn btn-primary" href="' + billUrl + '">' + esc(t("cash.payBill")) + "</a>";
  }
  if (stage === "ready" && o.paid) {
    return '<button type="button" class="btn btn-secondary" data-action="handover" data-id="' + o.id + '">' + esc(t("cash.handOver")) + "</button>" +
      '<a class="link-btn" href="' + billUrl + '">' + esc(t("cash.printBill")) + "</a>";
  }
  if (stage === "done" && o.paid) {
    return '<a class="link-btn" href="' + billUrl + '">' + esc(t("cash.bill")) + "</a>";
  }
  return "";                                          // in the kitchen: nothing to do yet
}

function cardHtml(o, menu) {
  var lines = (o.items || []).map(function (line) {
    return "<li><b>" + line.qty + " ×</b> " + esc(orderLineName(menu, line)) + "</li>";
  }).join("");
  var actions = actionsHtml(o);

  return '<article class="card order-card' + (o.status === "Cancelled" ? " is-cancelled" : "") + '" data-order="' + o.id + '">' +
    '<div class="top"><h2>#' + o.id + "</h2>" + badgeHtml(o) + "</div>" +
    '<p class="meta"><b>' + esc(o.customerName || t("cash.walkIn")) + "</b> · " + esc(orderWhere(o)) + " · " + esc(timeAgo(o.placedAt)) + "</p>" +
    '<ul class="order-lines">' + lines + "</ul>" +
    (o.note ? '<p class="note"><strong>' + esc(t("cash.notePrefix")) + "</strong> " + esc(o.note) + "</p>" : "") +
    '<div class="total"><span>' + esc(t("order.total")) + '</span><span class="value">' + esc(money(o.total)) + "</span></div>" +
    (actions ? '<div class="actions">' + actions + "</div>" : "") +
    "</article>";
}

function renderOrders() {
  var orders = loadOrders();
  var menu = getMenu();
  renderTabs(orders);

  var list = orders.filter(function (o) { return stageOf(o) === cashState.filter; });
  // Open orders: oldest first (first come, first served). Done: newest first.
  list.sort(function (a, b) {
    return cashState.filter === "done" ? b.placedAt - a.placedAt : a.placedAt - b.placedAt;
  });

  document.getElementById("order-grid").innerHTML = list.map(function (o) { return cardHtml(o, menu); }).join("");
  var empty = document.getElementById("orders-empty");
  empty.hidden = list.length > 0;
  empty.textContent = t("cash.none");
}

// ---------- actions on an order ----------

// Confirm & print: the card changes to "✓ Confirmed", the receipt pops up and the print window opens.
// When the receipt is closed, the order moves to "In the kitchen".
function confirmOrder(id) {
  var me = getCurrentUser();
  var orders = loadOrders();
  var o = orders.find(function (x) { return x.id === id; });
  if (!o || stageOf(o) !== "new") return;
  o.confirmed = true;
  o.confirmedAt = Date.now();
  o.confirmedBy = me ? me.name : "";
  save("orders", orders);

  var card = document.querySelector('.order-card[data-order="' + id + '"]');
  if (card) {
    card.querySelector(".badge").outerHTML = badgeHtml(o);
    card.querySelector(".actions").innerHTML =
      '<button type="button" class="btn btn-outline is-confirmed" disabled>' + esc(t("cash.confirmed")) + "</button>";
  }
  showToast(t("cash.tConfirmed", { id: id }));
  openReceipt(o);
  setTimeout(function () { window.print(); }, 300);
}

// ---------- receipt popup ----------

var receiptOrderId = null;

function openReceipt(o) {
  receiptOrderId = o.id;
  document.getElementById("receipt").innerHTML = receiptHtml(o);   // menu-common.js
  document.getElementById("receipt-modal").classList.add("open");
  document.getElementById("receipt-done").focus();
}

function closeReceipt() {
  var modal = document.getElementById("receipt-modal");
  if (!modal.classList.contains("open")) return;
  modal.classList.remove("open");
  receiptOrderId = null;
  renderOrders();                                    // the confirmed order moves to "In the kitchen"
}

// Cancel a new order — after the "Are you sure?" popup.
function cancelOrder(id) {
  askConfirm({                                   // menu-common.js
    title: t("cancel.title"),
    text: t("cancel.text", { id: id }),
    yes: t("cancel.yes"),
    no: t("cancel.keep")
  }).then(function (ok) {
    if (!ok) return;
    updateOrder(id, function (o) {
      if (stageOf(o) === "new") { o.status = "Cancelled"; o.cancelledAt = Date.now(); }
    });
    showToast(t("cash.tCancelled", { id: id }));
  });
}

function handOver(id) {
  updateOrder(id, function (o) {
    if (o.status === "Ready" && o.paid) { o.status = "Completed"; o.completedAt = Date.now(); }
  });
  showToast(t("cash.tDone", { id: id }));
}

// ---------- walk-in order form ----------

function walkTotal(menu) {
  return Object.keys(walkQty).reduce(function (sum, id) {
    var item = findMenuItem(menu, Number(id));
    return item ? sum + item.price * walkQty[id] : sum;
  }, 0);
}

function renderWalkItems() {
  var menu = getMenu().filter(function (it) { return it.available !== false; });
  var needle = document.getElementById("walk-find").value.trim().toLowerCase();
  var html = getCategories().map(function (cat) {
    var items = menu.filter(function (it) {
      return it.category === cat.id &&
        (!needle || [it.name, it.nameAr].join(" ").toLowerCase().indexOf(needle) >= 0);
    });
    if (!items.length) return "";
    var label = t("cat." + cat.id);
    if (label === "cat." + cat.id) label = cat.name;
    return "<h3>" + esc(label) + "</h3>" + items.map(function (it) {
      var qty = walkQty[it.id] || 0;
      return '<div class="walk-row"><div><div class="nm">' + esc(itemName(it)) + '</div><div class="pr">' + esc(money(it.price)) + "</div></div>" +
        '<div class="stepper">' +
        '<button type="button" data-walk="dec" data-id="' + it.id + '" aria-label="' + esc(t("menu.removeOne", { name: itemName(it) })) + '"' + (qty ? "" : " disabled") + ">−</button>" +
        '<span class="qty">' + qty + "</span>" +
        '<button type="button" class="plus" data-walk="add" data-id="' + it.id + '" aria-label="' + esc(t("menu.addOne", { name: itemName(it) })) + '">+</button>' +
        "</div></div>";
    }).join("");
  }).join("");
  document.getElementById("walk-items").innerHTML = html || '<p class="walk-row">' + esc(t("walk.empty")) + "</p>";
  document.getElementById("walk-total").textContent = money(walkTotal(getMenu()));
}

function showWalkTable() {
  var dine = document.getElementById("walk-dine").checked;
  document.getElementById("walk-table-field").hidden = !dine;
}

function openWalkIn() {
  walkQty = {};
  var form = document.getElementById("walk-form");
  form.reset();
  setFieldError(form.elements.table, "");
  document.getElementById("walk-error").textContent = "";
  showWalkTable();
  renderWalkItems();
  document.getElementById("walk-modal").classList.add("open");
  document.getElementById("walk-find").focus();
}

function closeWalkIn() {
  var modal = document.getElementById("walk-modal");
  if (!modal.classList.contains("open")) return;
  modal.classList.remove("open");
  document.getElementById("new-order").focus();
}

function createWalkIn(event) {
  event.preventDefault();
  var form = event.target;
  var menu = getMenu();
  var type = form.elements.type.value;
  var tableInput = form.elements.table;
  var table = "";
  var errorBox = document.getElementById("walk-error");

  if (type === "dine-in") {
    var n = Number(tableInput.value);
    if (!tableInput.value.trim() || !Number.isInteger(n) || n < 1 || n > 50) {
      setFieldError(tableInput, t("cart.tableError"));
      tableInput.focus();
      return;
    }
    setFieldError(tableInput, "");
    table = String(n);
  }

  var items = [];
  Object.keys(walkQty).forEach(function (id) {
    var item = findMenuItem(menu, Number(id));
    if (item && walkQty[id] > 0) items.push({ menuId: item.id, name: item.name, price: item.price, qty: walkQty[id] });
  });
  if (!items.length) { errorBox.textContent = t("walk.noItems"); return; }
  errorBox.textContent = "";

  var me = getCurrentUser();
  var orders = loadOrders();
  var id = nextOrderId(orders);
  orders.push({
    id: id,
    customerId: null,                         // walk-in: no customer account
    customerName: form.elements.name.value.trim() || t("cash.walkIn"),
    type: type,
    table: table,
    note: form.elements.note.value.trim(),
    items: items,
    total: items.reduce(function (s, it) { return s + it.price * it.qty; }, 0),
    status: "Pending",
    confirmed: true,                          // the cashier took it, so it goes straight to the kitchen
    confirmedAt: Date.now(),
    confirmedBy: me ? me.name : "",
    placedAt: Date.now(),
    paid: false
  });
  save("orders", orders);

  closeWalkIn();
  cashState.filter = "kitchen";
  renderOrders();
  showToast(t("cash.tCreated", { id: id }));
}

// ---------- start ----------

document.addEventListener("DOMContentLoaded", function () {
  // Start on the first tab that has something to do: New, then Ready, then In the kitchen.
  var all = loadOrders();
  cashState.filter = ["new", "ready", "kitchen"].find(function (f) {
    return all.some(function (o) { return stageOf(o) === f; });
  }) || "new";

  document.getElementById("filter-tabs").addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-filter]");
    if (!btn) return;
    cashState.filter = btn.dataset.filter;
    renderOrders();
  });

  document.getElementById("order-grid").addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-action]");
    if (!btn) return;
    var id = Number(btn.dataset.id);
    if (btn.dataset.action === "confirm") confirmOrder(id);
    else if (btn.dataset.action === "cancel") cancelOrder(id);
    else if (btn.dataset.action === "handover") handOver(id);
  });

  // Walk-in form
  document.getElementById("new-order").addEventListener("click", openWalkIn);
  document.getElementById("walk-close").addEventListener("click", closeWalkIn);
  document.getElementById("walk-modal").addEventListener("click", function (e) {
    if (e.target.id === "walk-modal") closeWalkIn();          // click on the dark background
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeWalkIn(); closeReceipt(); }
  });

  // Receipt popup
  document.getElementById("receipt-done").addEventListener("click", closeReceipt);
  document.getElementById("receipt-print").addEventListener("click", function () { window.print(); });
  document.getElementById("receipt-modal").addEventListener("click", function (e) {
    if (e.target.id === "receipt-modal") closeReceipt();
  });
  document.getElementById("walk-form").addEventListener("submit", createWalkIn);
  document.getElementById("walk-find").addEventListener("input", renderWalkItems);
  document.querySelectorAll('#walk-form input[name="type"]').forEach(function (r) {
    r.addEventListener("change", showWalkTable);
  });
  document.getElementById("walk-items").addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-walk]");
    if (!btn) return;
    var id = btn.dataset.id;
    walkQty[id] = Math.max(0, (walkQty[id] || 0) + (btn.dataset.walk === "add" ? 1 : -1));
    if (!walkQty[id]) delete walkQty[id];
    document.getElementById("walk-error").textContent = "";
    renderWalkItems();
    var again = document.querySelector('#walk-items button[data-id="' + id + '"][data-walk="' + btn.dataset.walk + '"]:not([disabled])') ||
      document.querySelector('#walk-items button[data-id="' + id + '"][data-walk="add"]');
    if (again) again.focus();
  });

  renderOrders();
  document.addEventListener("langchange", function () {
    renderOrders();
    if (document.getElementById("walk-modal").classList.contains("open")) renderWalkItems();
    if (receiptOrderId) {
      var o = loadOrders().find(function (x) { return x.id === receiptOrderId; });
      if (o) document.getElementById("receipt").innerHTML = receiptHtml(o);
    }
  });
  window.addEventListener("storage", renderOrders);   // a customer placed an order in another tab
  setInterval(renderOrders, 30000);                   // keep "5 min ago" fresh
});
