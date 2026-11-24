/* ============================================================
   Riwaq Cafe — orders.js
   my-orders.html : the customer's own orders, with live status.
   (orders.html for the cashier will also use this file later.)

   Needs: i18n.js → t(), getLocale() · storage.js → load(), save(), getSession()
          layout.js → updateCartCount()
          menu-common.js → esc(), money(), itemName(), getMenu(), findMenuItem()
   ============================================================ */

var STEPS = ["Pending", "Preparing", "Ready", "Completed"];
var currentFilter = "active"; // active | completed | cancelled | all

// ---------- small helpers ----------

function myOrders() {
  var session = getSession();
  var orders = load("orders", []);
  return orders
    .filter(function (o) { return o.customerId === session.id; })
    .sort(function (a, b) { return b.placedAt - a.placedAt; }); // newest first
}

function timeAgo(ts) {
  var mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1)  return t("time.now");
  if (mins < 60) return t("time.min", { n: mins });
  var hours = Math.round(mins / 60);
  if (hours < 24) return t("time.hours", { n: hours });
  return new Date(ts).toLocaleDateString(getLocale());
}

function isActive(order) {
  return order.status === "Pending" || order.status === "Preparing" || order.status === "Ready";
}

function matchesFilter(order) {
  if (currentFilter === "all") return true;
  if (currentFilter === "completed") return order.status === "Completed";
  if (currentFilter === "cancelled") return order.status === "Cancelled";
  return isActive(order);   // "active" = still moving through the kitchen
}

// Name of an ordered item in the current language (uses the menu if the item still exists).
function orderedName(menu, it) {
  var item = findMenuItem(menu, it.menuId);
  return item ? itemName(item) : it.name;
}

// ---------- building the page ----------

function statusTracker(order) {
  if (order.status === "Cancelled") return ""; // cancelled orders show only the badge
  var reached = STEPS.indexOf(order.status);
  var html = '<ol class="tracker">';
  for (var i = 0; i < STEPS.length; i++) {
    var cls = i < reached ? "done" : i === reached ? (order.status === "Completed" ? "done" : "now") : "";
    html += '<li class="' + cls + '"' + (i === reached ? ' aria-current="step"' : "") + '><span class="dot"></span>' +
      esc(t("status." + STEPS[i])) + "</li>";
  }
  return html + "</ol>";
}

function orderCard(order, menu) {
  var badgeClass = "badge-" + order.status.toLowerCase();
  var where = order.type === "dine-in"
    ? t("type.dine-in") + " · " + t("myOrders.table", { n: order.table })
    : t("type.takeaway");

  var rows = "";
  for (var i = 0; i < order.items.length; i++) {
    var it = order.items[i];
    rows +=
      "<tr><td>" + it.qty + " ×</td><td>" + esc(orderedName(menu, it)) + "</td>" +
      '<td class="num">' + esc(money(it.price * it.qty)) + "</td></tr>";
  }

  var buttons = "";
  if (order.status === "Pending") {
    buttons += '<button type="button" class="btn btn-danger" data-action="cancel" data-id="' + order.id + '">' + esc(t("myOrders.cancel")) + "</button>";
  }
  if (order.status === "Completed" || order.status === "Cancelled") {
    buttons += '<button type="button" class="btn btn-secondary" data-action="again" data-id="' + order.id + '">' + esc(t("myOrders.again")) + "</button>";
  }

  return (
    '<article class="card order">' +
      '<header class="order-head">' +
        "<div><h2>" + esc(t("cart.orderNo", { id: order.id })) + "</h2>" +
        '<p class="muted">' + esc(where) + " · " + esc(timeAgo(order.placedAt)) + "</p></div>" +
        '<span class="badge ' + badgeClass + '">' + esc(t("status." + order.status)) + "</span>" +
      "</header>" +
      statusTracker(order) +
      '<table class="order-items"><tbody>' + rows + "</tbody>" +
      '<tfoot><tr><td></td><td>' + esc(t("order.total")) + '</td><td class="num">' + esc(money(order.total)) + "</td></tr></tfoot></table>" +
      (order.note ? '<p class="order-note">' + esc(t("myOrders.note", { note: order.note })) + "</p>" : "") +
      (buttons ? '<footer class="order-actions">' + buttons + "</footer>" : "") +
    "</article>"
  );
}

function renderOrders() {
  var session = getSession();
  if (!session) return;
  document.getElementById("welcome").textContent = t("myOrders.welcome", { name: session.name });

  var all = myOrders();
  var menu = getMenu();
  var orders = all.filter(matchesFilter);
  document.getElementById("count-active").textContent = all.filter(isActive).length;

  var list = document.getElementById("orders-list");
  if (orders.length === 0) {
    list.innerHTML =
      '<div class="card text-center empty">' +
      "<p>" + esc(t("myOrders.none")) + "</p>" +
      '<a class="btn btn-primary" href="menu.html">' + esc(t("cart.browse")) + "</a></div>";
    return;
  }
  list.innerHTML = orders.map(function (o) { return orderCard(o, menu); }).join("");
}

// ---------- actions ----------

function setFilter(name) {
  currentFilter = name;
  document.querySelectorAll(".filter-tabs button").forEach(function (b) {
    var on = b.dataset.filter === name;
    b.classList.toggle("active", on);
    b.setAttribute("aria-pressed", on);
  });
  renderOrders();
}

function cancelOrder(id) {
  var orders = load("orders", []);
  for (var i = 0; i < orders.length; i++) {
    // only a Pending order can still be cancelled
    if (orders[i].id === id && orders[i].status === "Pending") {
      orders[i].status = "Cancelled";
    }
  }
  save("orders", orders);
  renderOrders();
}

// Put the items of an old order back in the cart (adding to what is already there).
function reorder(id) {
  var order = load("orders", []).filter(function (o) { return o.id === id; })[0];
  if (!order) return;
  var cart = load("cart", []);
  order.items.forEach(function (it) {
    var line = cart.filter(function (l) { return l.menuId === it.menuId; })[0];
    if (line) line.qty = (Number(line.qty) || 0) + it.qty;
    else cart.push({ menuId: it.menuId, name: it.name, price: it.price, qty: it.qty });
  });
  save("cart", cart);
  window.location.href = "cart.html";
}

// ---------- start ----------

document.addEventListener("DOMContentLoaded", function () {
  if (!getSession()) return;   // guard() is sending the visitor to the login page

  document.querySelector(".filter-tabs").addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-filter]");
    if (btn) setFilter(btn.dataset.filter);
  });
  document.getElementById("orders-list").addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-action]");
    if (!btn) return;
    var id = Number(btn.dataset.id);
    if (btn.dataset.action === "cancel") cancelOrder(id);
    else if (btn.dataset.action === "again") reorder(id);
  });

  renderOrders();
  document.addEventListener("langchange", renderOrders);   // Arabic / English switch

  // live updates: re-render when the kitchen (another tab) changes an order,
  // and refresh every 15 s so "x min ago" stays current.
  window.addEventListener("storage", renderOrders);
  setInterval(renderOrders, 15000);
});
