/* ============================================================
   Riwaq Cafe — cart.js
   customer/cart.html : change quantities, choose dine-in or
   takeaway, and place the order (saved to "riwaq_orders").
   Owner: Shaima (M3 Front of House)

   Needs: i18n.js → t() · storage.js → load(), save()
          auth.js → getCurrentUser(), setFieldError(), showAlert()
          layout.js → updateCartCount()
          menu-common.js → esc(), money(), itemName(), getMenu(), getCart(), findMenuItem(), artSvg()
   Order saved: { id, customerId, customerName, type, table, note, items, total,
                  status: "Pending", placedAt, paid: false }
   ============================================================ */

var lastOrderId = null;   // set after placing an order, to show the "thank you" screen

// Cart lines joined with the current menu: current price, name and availability.
function cartLines() {
  var menu = getMenu();
  return getCart().map(function (line) {
    var item = findMenuItem(menu, line.menuId);
    return {
      menuId: line.menuId,
      qty: Number(line.qty) || 0,
      item: item,
      price: item ? item.price : line.price,
      name: item ? item.name : line.name,
      available: Boolean(item) && item.available !== false
    };
  }).filter(function (l) { return l.qty > 0; });
}

function setLineQty(menuId, qty) {
  var cart = getCart().filter(function (line) { return line.menuId !== menuId; });
  var old = getCart().filter(function (line) { return line.menuId === menuId; })[0];
  if (qty > 0 && old) cart.push({ menuId: menuId, name: old.name, price: old.price, qty: qty });
  // keep the original order of the lines
  var order = getCart().map(function (l) { return l.menuId; });
  cart.sort(function (a, b) { return order.indexOf(a.menuId) - order.indexOf(b.menuId); });
  save("cart", cart);
  updateCartCount();
  renderCart();
}

// ---------- building the page ----------

function rowHtml(l) {
  var name = esc(l.item ? itemName(l.item) : l.name);
  var art = l.item ? artSvg(l.item) : "";
  var stepper = l.available
    ? '<div class="stepper">' +
        '<button type="button" data-action="dec" data-id="' + l.menuId + '" aria-label="' + esc(t("menu.removeOne", { name: name })) + '">−</button>' +
        '<span class="qty" aria-live="polite">' + l.qty + "</span>" +
        '<button type="button" class="plus" data-action="add" data-id="' + l.menuId + '" aria-label="' + esc(t("menu.addOne", { name: name })) + '">+</button>' +
      "</div>"
    : "<span></span>";
  return '<li class="cart-row' + (l.available ? "" : " unavailable") + '">' +
    '<div class="thumb" aria-hidden="true">' + art + "</div>" +
    "<div>" +
      "<h2>" + name + "</h2>" +
      '<p class="unit">' + esc(t("cart.each", { price: money(l.price) })) + "</p>" +
      (l.available ? "" : '<span class="warn">' + esc(t("cart.unavailable")) + "</span><br>") +
      '<button type="button" class="remove" data-action="remove" data-id="' + l.menuId + '">' + esc(t("cart.remove")) + "</button>" +
    "</div>" +
    stepper +
    '<span class="line-total">' + esc(money(l.qty * l.price)) + "</span>" +
    "</li>";
}

function renderCart() {
  var done = document.getElementById("cart-done");
  var empty = document.getElementById("cart-empty");
  var main = document.getElementById("cart-main");

  if (lastOrderId !== null) {             // "thank you" screen after placing an order
    done.hidden = false; empty.hidden = true; main.hidden = true;
    document.getElementById("done-number").textContent = t("cart.orderNo", { id: lastOrderId });
    document.getElementById("done-text").textContent = t("cart.doneText");
    return;
  }

  var lines = cartLines();
  done.hidden = true;
  empty.hidden = lines.length > 0;
  main.hidden = lines.length === 0;
  if (!lines.length) return;

  document.getElementById("cart-list").innerHTML = lines.map(rowHtml).join("");

  var ok = lines.filter(function (l) { return l.available; });
  var count = ok.reduce(function (s, l) { return s + l.qty; }, 0);
  var total = ok.reduce(function (s, l) { return s + l.qty * l.price; }, 0);
  document.getElementById("cart-count").textContent = t("order.items", { n: count });
  document.getElementById("cart-total").textContent = money(total);

  var blocked = ok.length !== lines.length;
  var alertBox = document.getElementById("cart-alert");
  if (blocked) showAlert(alertBox, t("cart.removeUnavailable"));
  else if (alertBox.textContent === t("cart.removeUnavailable")) alertBox.hidden = true;
}

function showTableField() {
  var dineIn = document.getElementById("type-dine").checked;
  document.getElementById("table-field").hidden = !dineIn;
  if (!dineIn) setFieldError(document.getElementById("table"), "");
}

// ---------- placing the order ----------

function placeOrder(event) {
  event.preventDefault();
  var form = event.target;
  var alertBox = document.getElementById("cart-alert");
  var lines = cartLines();
  var user = getCurrentUser();
  if (!user) return;

  if (!lines.length) { renderCart(); return; }
  if (lines.some(function (l) { return !l.available; })) {
    showAlert(alertBox, t("cart.removeUnavailable"));
    return;
  }

  var type = form.elements.type.value;
  var tableInput = form.elements.table;
  var table = "";
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

  var items = lines.map(function (l) {
    return { menuId: l.menuId, name: l.name, price: l.price, qty: l.qty };
  });
  var total = items.reduce(function (s, it) { return s + it.price * it.qty; }, 0);

  var orders = load("orders", []);
  var id = orders.reduce(function (max, o) { return Math.max(max, Number(o.id) || 0); }, 1000) + 1;
  orders.push({
    id: id,
    customerId: user.id,
    customerName: user.name,
    type: type,
    table: table,
    note: form.elements.note.value.trim(),
    items: items,
    total: total,
    status: "Pending",
    placedAt: Date.now(),
    paid: false
  });
  save("orders", orders);
  save("cart", []);
  updateCartCount();

  lastOrderId = id;
  alertBox.hidden = true;
  form.reset();
  showTableField();
  renderCart();
  document.getElementById("cart-done").scrollIntoView({ block: "start" });
}

// ---------- start ----------

document.addEventListener("DOMContentLoaded", function () {
  if (!getCurrentUser()) return;   // guard() is sending the visitor to the login page

  document.getElementById("cart-list").addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-action]");
    if (!btn) return;
    var id = Number(btn.dataset.id);
    var line = cartLines().filter(function (l) { return l.menuId === id; })[0];
    if (!line) return;
    var action = btn.dataset.action;
    setLineQty(id, action === "add" ? line.qty + 1 : action === "dec" ? line.qty - 1 : 0);
    var again = document.querySelector('#cart-list button[data-id="' + id + '"][data-action="' + action + '"]');
    if (again) again.focus();
  });

  document.querySelectorAll('input[name="type"]').forEach(function (r) {
    r.addEventListener("change", showTableField);
  });
  document.getElementById("checkout-form").addEventListener("submit", placeOrder);

  showTableField();
  renderCart();
  document.addEventListener("langchange", renderCart);
  window.addEventListener("storage", function () { if (lastOrderId === null) renderCart(); });
});
