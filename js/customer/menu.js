/* ============================================================
   Riwaq Cafe — menu.js
   customer/menu.html : browse the menu, filter by category,
   search, and add items to the cart (localStorage "riwaq_cart").
   Owner: Shaima (M3 Front of House)

   Needs: i18n.js → t(), getLang() · storage.js → load(), save()
          layout.js → updateCartCount(), rootPath()
          menu-common.js → esc(), money(), itemName(), itemDesc(), getMenu(), getCart(), itemVisual()
   Cart lines: [{ menuId, name, price, qty }]  (same shape as orders.js)
   ============================================================ */

var menuState = { cat: "all", q: "" };

// ---------- small helpers ----------

// Category label: translated if i18n.js has "cat.<id>", otherwise the stored name.
function catLabel(cat) {
  var key = "cat." + cat.id;
  var label = t(key);
  return label === key ? cat.name : label;
}


function qtyInCart(cart, menuId) {
  return cart.reduce(function (sum, line) {
    return line.menuId === menuId ? sum + (Number(line.qty) || 0) : sum;
  }, 0);
}

// Set how many of one item are in the cart (merges duplicate lines into one).
function setQty(item, qty) {
  var cart = getCart().filter(function (line) { return line.menuId !== item.id; });
  if (qty > 0) cart.push({ menuId: item.id, name: item.name, price: item.price, qty: qty });
  save("cart", cart);
  updateCartCount();      // navbar badge (layout.js)
  renderMenu();
}

function matchesSearch(it, needle) {
  if (!needle) return true;
  var text = [it.name, it.desc, it.nameAr, it.descAr].join(" ").toLowerCase();
  return text.indexOf(needle) >= 0;
}

// ---------- building the page ----------

function renderCategories(menu, needle) {
  var cats = [{ id: "all" }].concat(getCategories());
  var html = cats.map(function (c) {
    var count = menu.filter(function (it) {
      return (c.id === "all" || it.category === c.id) && matchesSearch(it, needle);
    }).length;
    var label = c.id === "all" ? t("menu.all") : catLabel(c);
    return '<button type="button" data-cat="' + esc(c.id) + '" aria-pressed="' + (c.id === menuState.cat) + '">' +
      esc(label) + ' <span class="n">· ' + count + "</span></button>";
  }).join("");
  document.getElementById("cat-pills").innerHTML = html;
}

function cardHtml(it, qty) {
  var soldOut = it.available === false;
  var name = esc(itemName(it));
  var action;
  if (soldOut) {
    action = '<button type="button" class="btn-add" disabled>' + esc(t("menu.unavailable")) + "</button>";
  } else if (qty === 0) {
    action = '<button type="button" class="btn-add" data-action="add" data-id="' + it.id + '" aria-label="' +
      esc(t("menu.addAria", { name: itemName(it) })) + '">' + esc(t("menu.add")) + "</button>";
  } else {
    action = '<div class="stepper">' +
      '<button type="button" data-action="dec" data-id="' + it.id + '" aria-label="' + esc(t("menu.removeOne", { name: itemName(it) })) + '">−</button>' +
      '<span class="qty" aria-live="polite">' + qty + "</span>" +
      '<button type="button" class="plus" data-action="add" data-id="' + it.id + '" aria-label="' + esc(t("menu.addOne", { name: itemName(it) })) + '">+</button>' +
      "</div>";
  }
  return '<article class="item-card' + (soldOut ? " sold-out" : "") + '">' +
    (soldOut ? '<span class="tag">' + esc(t("menu.soldOut")) + "</span>" : "") +
    '<div class="art" role="img" aria-label="' + name + '">' + itemVisual(it) + "</div>" +
    "<h2>" + name + "</h2>" +
    '<p class="desc">' + esc(itemDesc(it)) + "</p>" +
    '<div class="foot"><span class="price">' + esc(money(it.price)) + "</span>" + action + "</div>" +
    "</article>";
}

function renderItems(menu, cart, needle) {
  var visible = menu.filter(function (it) {
    return (menuState.cat === "all" || it.category === menuState.cat) && matchesSearch(it, needle);
  });
  document.getElementById("item-grid").innerHTML = visible.map(function (it) {
    return cardHtml(it, qtyInCart(cart, it.id));
  }).join("");

  var none = document.getElementById("no-results");
  none.hidden = visible.length > 0;
  document.getElementById("no-results-title").textContent = menuState.q
    ? t("menu.noResults", { q: menuState.q })
    : t("menu.emptyCat");
}

function renderOrder(menu, cart) {
  var count = 0, total = 0, lines = "";
  cart.forEach(function (line) {
    var item = menu.find(function (m) { return m.id === line.menuId; });
    var price = item ? item.price : line.price;
    var qty = Number(line.qty) || 0;
    count += qty;
    total += qty * price;
    lines += "<li><span><b>" + qty + " ×</b> " + esc(item ? itemName(item) : line.name) + "</span>" +
      '<span class="line-total">' + esc(money(qty * price)) + "</span></li>";
  });

  document.getElementById("order-count").textContent = t("order.items", { n: count });
  document.getElementById("order-empty").hidden = count > 0;
  document.getElementById("order-lines").innerHTML = lines;
  document.getElementById("order-total").textContent = money(total);

  var go = document.getElementById("go-cart");
  go.textContent = count > 0 ? t("order.goCartTotal", { total: money(total) }) : t("order.goCart");
  if (count > 0) go.removeAttribute("aria-disabled");
  else go.setAttribute("aria-disabled", "true");
}

function renderMenu() {
  var menu = getMenu();
  var cart = getCart();
  var needle = menuState.q.trim().toLowerCase();
  renderCategories(menu, needle);
  renderItems(menu, cart, needle);
  renderOrder(menu, cart);
}

// ---------- start ----------

document.addEventListener("DOMContentLoaded", function () {
  var search = document.getElementById("menu-search");
  search.addEventListener("input", function () {
    menuState.q = search.value;
    renderMenu();
  });

  document.getElementById("cat-pills").addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-cat]");
    if (!btn) return;
    menuState.cat = btn.dataset.cat;
    renderMenu();
  });

  document.getElementById("item-grid").addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-action]");
    if (!btn) return;
    var id = Number(btn.dataset.id);
    var item = getMenu().find(function (m) { return m.id === id; });
    if (!item || item.available === false) return;
    var qty = qtyInCart(getCart(), id);
    setQty(item, btn.dataset.action === "add" ? qty + 1 : qty - 1);
    // keep keyboard focus on the same item after the grid is redrawn
    var again = document.querySelector('#item-grid button[data-id="' + id + '"][data-action="' + btn.dataset.action + '"]') ||
      document.querySelector('#item-grid button[data-id="' + id + '"]');
    if (again) again.focus();
  });

  renderMenu();
  document.addEventListener("langchange", renderMenu);   // Arabic / English switch
  window.addEventListener("storage", renderMenu);        // cart or menu changed in another tab
});
