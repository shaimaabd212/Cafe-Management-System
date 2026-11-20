/* ============================================================
   Riwaq Cafe — menu.js
   customer/menu.html : browse the menu, filter by category,
   search, and add items to the cart (localStorage "riwaq_cart").
   Owner: Shaima (M3 Front of House)

   Needs: i18n.js → t(), getLang() · storage.js → load(), save()
          layout.js → updateCartCount(), rootPath()
   Cart lines: [{ menuId, name, price, qty }]  (same shape as orders.js)
   ============================================================ */

var menuState = { cat: "all", q: "" };

// ---------- small helpers ----------

// Escape text that came from localStorage before putting it in HTML.
function esc(text) {
  return String(text == null ? "" : text).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function money(n) { return n + " " + t("currency"); }

// Item name / description in the current language (Arabic falls back to English).
function itemName(it) { return (getLang() === "ar" && it.nameAr) || it.name; }
function itemDesc(it) { return (getLang() === "ar" && it.descAr) || it.desc || ""; }

// Category label: translated if i18n.js has "cat.<id>", otherwise the stored name.
function catLabel(cat) {
  var key = "cat." + cat.id;
  var label = t(key);
  return label === key ? cat.name : label;
}

function getMenu() { return load("menu", []); }
function getCategories() { return load("categories", []); }
function getCart() { return load("cart", []); }

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

// ---------- packaging drawings (SVG, 200 × 220) ----------

// Default drawing for items that have no "art" (e.g. new items added by the manager).
function defaultArt(item) {
  if (item.category === "cold") return { kind: "iced" };
  if (item.category === "hot") return { kind: "hot" };
  return { kind: "bag", pastry: "croissant" };
}

function pastrySvg(a) {
  var p = a.pastry || "";
  var c1 = a.c1 || "#C98A4B", c2 = a.c2 || "#3B2216";
  var s = "";
  if (p === "croissant") {
    s = '<ellipse cx="100" cy="76" rx="48" ry="20" fill="#B9762F"/>' +
      '<ellipse cx="100" cy="70" rx="34" ry="22" fill="#D99A4C"/>' +
      '<ellipse cx="96" cy="62" rx="16" ry="8" fill="#E8B670" opacity="0.8"/>' +
      '<path d="M76 58 C84 70 84 82 78 92 M90 50 C97 66 97 84 92 94 M110 50 C103 66 103 84 108 94 M124 58 C116 70 116 82 122 92" stroke="#93561F" stroke-width="3" fill="none" stroke-linecap="round"/>';
    if (a.flakes) {
      s += '<rect x="84" y="52" width="10" height="4" rx="2" fill="#F6EAD3" transform="rotate(-20 89 54)"/>' +
        '<rect x="100" y="48" width="10" height="4" rx="2" fill="#F6EAD3" transform="rotate(15 105 50)"/>' +
        '<rect x="114" y="58" width="9" height="4" rx="2" fill="#F6EAD3" transform="rotate(-35 118 60)"/>' +
        '<rect x="74" y="64" width="9" height="4" rx="2" fill="#F6EAD3" transform="rotate(30 78 66)"/>' +
        '<rect x="96" y="62" width="10" height="4" rx="2" fill="#F6EAD3" transform="rotate(-10 101 64)"/>';
    }
  } else if (p === "cookie") {
    s = '<g transform="rotate(-12 100 70)">' +
      '<circle cx="100" cy="70" r="36" fill="' + c1 + '"/>' +
      '<circle cx="100" cy="70" r="36" fill="none" stroke="#000" stroke-opacity="0.15" stroke-width="3"/>' +
      '<path d="M74 60 C82 54 90 62 98 56 M104 82 C112 76 120 84 126 78 M80 84 C86 80 92 86 96 82" stroke="#000" stroke-opacity="0.12" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<rect x="84" y="52" width="9" height="8" rx="2" fill="' + c2 + '" transform="rotate(20 88 56)"/>' +
      '<rect x="108" y="58" width="10" height="8" rx="2" fill="' + c2 + '" transform="rotate(-15 113 62)"/>' +
      '<rect x="94" y="72" width="9" height="9" rx="2" fill="' + c2 + '" transform="rotate(35 98 76)"/>' +
      '<rect x="116" y="78" width="8" height="7" rx="2" fill="' + c2 + '"/>' +
      '<rect x="76" y="74" width="8" height="8" rx="2" fill="' + c2 + '" transform="rotate(-25 80 78)"/>' +
      '<rect x="102" y="42" width="8" height="7" rx="2" fill="' + c2 + '" transform="rotate(10 106 45)"/></g>';
  } else if (p === "roll") {
    s = '<circle cx="100" cy="72" r="32" fill="' + c1 + '"/>' +
      '<circle cx="100" cy="72" r="32" fill="none" stroke="#8A4B22" stroke-width="3"/>' +
      '<path d="M97 72 a3 3 0 1 1 6 0 a7 7 0 1 1 -13 0 a11 11 0 1 1 21 0 a15 15 0 1 1 -29 0 a19 19 0 1 1 37 0 a23 23 0 1 1 -45 0" stroke="#8A4B22" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
    if (a.drizzle) s += '<path d="M74 60 L84 80 L94 56 L104 84 L114 58 L126 80" stroke="' + c2 + '" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  } else if (p === "muffin") {
    s = '<path d="M68 80 L132 80 L124 112 L76 112 Z" fill="#7A2E22"/>' +
      '<path d="M80 82 L84 110 M92 82 L94 110 M104 82 L104 110 M116 82 L114 110" stroke="#5C2018" stroke-width="2"/>' +
      '<path d="M62 82 C62 40 138 40 138 82 Z" fill="#4A2A1A"/>' +
      '<circle cx="84" cy="64" r="3" fill="#2A1810"/><circle cx="100" cy="54" r="3" fill="#2A1810"/>' +
      '<circle cx="116" cy="66" r="3" fill="#2A1810"/><circle cx="96" cy="72" r="3" fill="#2A1810"/>' +
      '<path d="M78 58 C86 50 96 48 104 49" stroke="#6E4632" stroke-width="3" fill="none" stroke-linecap="round"/>';
  } else if (p === "sandwich") {
    s = '<path d="M58 96 L100 40 L142 96 Z" fill="#E6B565" stroke="#B97E35" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M72 90 L100 54 L128 90 Z" fill="#F3D9A4"/>' +
      '<path d="M78 76 L122 76" stroke="#D9473F" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M74 84 C80 79 86 88 92 83 C98 79 104 88 110 83 C116 79 122 87 126 84" stroke="#6FA34A" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '<path d="M86 66 L114 66" stroke="#F0C9A0" stroke-width="5" stroke-linecap="round"/>';
  } else if (p === "cake") {
    s = '<rect x="60" y="50" width="80" height="46" rx="8" fill="#5A3322"/>' +
      '<path d="M60 60 C60 47 140 47 140 60 L140 66 C132 71 128 62 121 68 C113 76 107 63 99 70 C91 77 85 62 77 68 C70 73 66 65 60 68 Z" fill="#2E1A12"/>' +
      '<circle cx="84" cy="54" r="2.5" fill="#E3A21A"/><circle cx="104" cy="52" r="2.5" fill="#E3A21A"/><circle cx="122" cy="55" r="2.5" fill="#E3A21A"/>';
  }
  if (!s) return "";
  return '<g transform="' + (a.kind === "box" ? "translate(0 58)" : "translate(0 0)") + '">' + s + "</g>";
}

// The Riwaq logo, drawn inside the SVG (red on light packaging, cream on red).
function logoSvg(x, y, w, light) {
  var file = light ? "img/riwaq-logo-light.svg" : "img/riwaq-logo.svg";
  return '<image href="' + rootPath() + file + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + (w * 308 / 250.1).toFixed(1) + '"/>';
}

function artSvg(item) {
  var a = item.art || defaultArt(item);
  var kind = a.kind || "bag";
  var body = "";

  if (kind === "box") {   // back of the open box, behind the pastry
    body += '<path d="M36 140 L36 100 L164 100 L164 140 Z" fill="#CDB48C"/><path d="M36 100 L22 84 L178 84 L164 100 Z" fill="#D9C29C"/>';
  }
  if (kind === "box" || kind === "bag") body += pastrySvg(a);

  if (kind === "iced") {
    var clip = "cup-clip-" + item.id;
    body += '<defs><clipPath id="' + clip + '"><path d="M52 46 L148 46 L135.5 210 L64.5 210 Z"/></clipPath></defs>' +
      '<ellipse cx="100" cy="214" rx="46" ry="5" fill="#000" opacity="0.08"/>' +
      '<g clip-path="url(#' + clip + ')">' +
      '<rect x="0" y="62" width="200" height="160" fill="' + (a.top || "#E9D6B6") + '"/>' +
      '<path d="M30 128 C60 116 82 140 106 126 C128 114 150 134 170 124 L170 220 L30 220 Z" fill="' + (a.bottom || "#6B4226") + '"/>' +
      '<rect x="64" y="64" width="22" height="19" rx="4" fill="#fff" opacity="0.45" transform="rotate(-12 75 73)"/>' +
      '<rect x="92" y="58" width="24" height="21" rx="4" fill="#fff" opacity="0.4" transform="rotate(8 104 68)"/>' +
      '<rect x="120" y="66" width="19" height="18" rx="4" fill="#fff" opacity="0.45" transform="rotate(-20 129 75)"/>' +
      '<rect x="76" y="88" width="18" height="16" rx="4" fill="#fff" opacity="0.3" transform="rotate(14 85 96)"/></g>' +
      '<path d="M50 44 L150 44 L137 212 L63 212 Z" fill="#fff" fill-opacity="0.18" stroke="#D2C4AE" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M60 54 L70 202" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.55"/>' +
      '<circle cx="100" cy="157" r="28" fill="#FAF5EA"/><circle cx="100" cy="157" r="28" fill="none" stroke="#B3261E" stroke-width="1.5"/>' +
      logoSvg(88, 136, 24, false) +
      '<text x="100" y="179" text-anchor="middle" font-family="Marcellus, Georgia, serif" font-size="7.5" fill="#B3261E">Riwaq</text>' +
      '<path d="M46 44 C52 16 148 16 154 44 Z" fill="#fff" fill-opacity="0.35" stroke="#D2C4AE" stroke-width="2"/>' +
      '<ellipse cx="100" cy="44" rx="56" ry="6" fill="#fff" fill-opacity="0.7" stroke="#D2C4AE" stroke-width="2"/>' +
      '<rect x="112" y="2" width="8" height="74" rx="4" fill="#211A17" transform="rotate(12 116 40)"/>';
  } else if (kind === "hot") {
    body += '<path d="M86 32 C80 24 92 18 86 8 M106 34 C100 26 112 20 106 10" stroke="#CDB48C" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8"/>' +
      '<ellipse cx="100" cy="214" rx="38" ry="5" fill="#000" opacity="0.08"/>' +
      '<path d="M58 58 L142 58 L131 212 L69 212 Z" fill="#FAF5EA" stroke="#E0D2B8" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M61.4 104 L138.6 104 L134.4 166 L65.6 166 Z" fill="' + (a.sleeve || "#B3261E") + '"/>' +
      '<path d="M68 190 L132 190" stroke="#E0D2B8" stroke-width="2"/>' +
      '<rect x="52" y="46" width="96" height="14" rx="4" fill="#3A2E28"/><rect x="62" y="38" width="76" height="10" rx="4" fill="#4A3B33"/>' +
      logoSvg(86, 113, 28, true);
  } else if (kind === "bag") {
    var d = "M48 92";
    for (var x = 48; x < 152; x += 8) d += " L" + (x + 4) + " 86 L" + (x + 8) + " 92";
    d += " L152 214 L48 214 Z";
    body += '<ellipse cx="100" cy="215" rx="54" ry="5" fill="#000" opacity="0.08"/>' +
      '<path d="' + d + '" fill="#B3261E"/>' +
      '<rect x="138" y="90" width="14" height="124" fill="#000" opacity="0.14"/>' +
      '<path d="M48 200 L152 200" stroke="#000" stroke-opacity="0.12" stroke-width="2"/>' +
      '<path d="M70 182 L88 182 M112 182 L130 182" stroke="#FAF5EA" stroke-width="1"/>' +
      logoSvg(84, 116, 32, true) +
      '<text x="100" y="176" text-anchor="middle" font-family="Marcellus, Georgia, serif" font-size="14" fill="#FAF5EA">Riwaq</text>' +
      '<text x="100" y="185" text-anchor="middle" font-family="Marcellus, Georgia, serif" font-size="6" letter-spacing="1.4" fill="#FAF5EA">A LIBYAN CAFÉ</text>';
  } else if (kind === "box") {   // front of the box
    body += '<ellipse cx="100" cy="215" rx="72" ry="5" fill="#000" opacity="0.08"/>' +
      '<rect x="30" y="140" width="140" height="74" rx="3" fill="#E4CDA7" stroke="#CDB48C" stroke-width="2"/>' +
      '<rect x="30" y="140" width="140" height="8" fill="#B3261E"/>' +
      '<path d="M30 152 L170 152" stroke="#211A17" stroke-width="1" stroke-dasharray="2 4" opacity="0.35"/>' +
      logoSvg(89, 158, 22, false) +
      '<text x="100" y="204" text-anchor="middle" font-family="Marcellus, Georgia, serif" font-size="11" fill="#B3261E">Riwaq</text>';
  }
  return '<svg width="200" height="220" viewBox="0 0 200 220" aria-hidden="true" focusable="false">' + body + "</svg>";
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
    '<div class="art" role="img" aria-label="' + name + '">' + artSvg(it) + "</div>" +
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
