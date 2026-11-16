/* ============================================================
   Riwaq Cafe — orders.js
   my-orders.html : the customer's own orders, with live status.
   (orders.html for the cashier will also use this file later.)
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
  if (mins < 1)  return "just now";
  if (mins < 60) return mins + " min ago";
  var hours = Math.round(mins / 60);
  if (hours < 24) return hours + " h ago";
  return new Date(ts).toLocaleDateString();
}

function matchesFilter(order) {
  if (currentFilter === "all") return true;
  if (currentFilter === "completed") return order.status === "Completed";
  if (currentFilter === "cancelled") return order.status === "Cancelled";
  // "active" = still moving through the kitchen
  return order.status === "Pending" || order.status === "Preparing" || order.status === "Ready";
}

// ---------- building the page ----------

function statusTracker(order) {
  if (order.status === "Cancelled") return ""; // cancelled orders show only the badge
  var reached = STEPS.indexOf(order.status);
  var html = '<ol class="tracker">';
  for (var i = 0; i < STEPS.length; i++) {
    var cls = i < reached ? "done" : i === reached ? (order.status === "Completed" ? "done" : "now") : "";
    html += '<li class="' + cls + '"><span class="dot"></span>' + STEPS[i] + "</li>";
  }
  return html + "</ol>";
}

function orderCard(order) {
  var badgeClass = "badge-" + order.status.toLowerCase();
  var where = order.type === "dine-in" ? "Dine-in · Table " + order.table : "Takeaway";

  var rows = "";
  for (var i = 0; i < order.items.length; i++) {
    var it = order.items[i];
    rows +=
      "<tr><td>" + it.qty + " ×</td><td>" + it.name + "</td>" +
      '<td class="num">' + (it.price * it.qty) + " LYD</td></tr>";
  }

  var buttons = "";
  if (order.status === "Pending") {
    buttons += '<button class="btn btn-danger" onclick="cancelOrder(' + order.id + ')">Cancel order</button> ';
  }
  if (order.status === "Completed" || order.status === "Cancelled") {
    buttons += '<button class="btn btn-secondary" onclick="reorder(' + order.id + ')">Order again</button>';
  }

  return (
    '<article class="card order">' +
      '<header class="order-head">' +
        "<div><h2>Order #" + order.id + "</h2>" +
        '<p class="muted">' + where + " · " + timeAgo(order.placedAt) + "</p></div>" +
        '<span class="badge ' + badgeClass + '">' + order.status + "</span>" +
      "</header>" +
      statusTracker(order) +
      '<table class="order-items"><tbody>' + rows + "</tbody>" +
      '<tfoot><tr><td></td><td>Total</td><td class="num">' + order.total + " LYD</td></tr></tfoot></table>" +
      (buttons ? '<footer class="order-actions">' + buttons + "</footer>" : "") +
    "</article>"
  );
}

function renderOrders() {
  var list = document.getElementById("orders-list");
  var orders = myOrders().filter(matchesFilter);

  // update the count shown on each filter tab
  var all = myOrders();
  document.getElementById("count-active").textContent =
    all.filter(function (o) { return o.status === "Pending" || o.status === "Preparing" || o.status === "Ready"; }).length;

  if (orders.length === 0) {
    list.innerHTML =
      '<div class="card text-center empty">' +
      "<p>No orders here yet.</p>" +
      '<a class="btn btn-primary" href="menu.html">Browse the menu</a></div>';
    return;
  }
  var html = "";
  for (var i = 0; i < orders.length; i++) html += orderCard(orders[i]);
  list.innerHTML = html;
}

// ---------- actions ----------

function setFilter(name, btn) {
  currentFilter = name;
  var tabs = document.querySelectorAll(".filter-tabs button");
  for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove("active");
  btn.classList.add("active");
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

function reorder(id) {
  var orders = load("orders", []);
  var cart = load("cart", []);
  for (var i = 0; i < orders.length; i++) {
    if (orders[i].id === id) {
      for (var j = 0; j < orders[i].items.length; j++) {
        var it = orders[i].items[j];
        cart.push({ menuId: it.menuId, name: it.name, price: it.price, qty: it.qty });
      }
    }
  }
  save("cart", cart);
  window.location.href = "cart.html";
}

// ---------- start ----------

document.addEventListener("DOMContentLoaded", function () {
  var session = getSession();
  document.getElementById("hello-name").textContent = session.name;
  renderOrders();

  // live updates: re-render when the kitchen (another tab) changes an order,
  // and refresh every 15 s so "x min ago" stays current.
  window.addEventListener("storage", renderOrders);
  setInterval(renderOrders, 15000);
});
