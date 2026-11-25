/* ============================================================
   Riwaq Cafe — menu-common.js
   Helpers shared by the pages that show menu items:
   customer/menu.html, cart.html, my-orders.html and cashier/orders.html, bill.html.
   Item photos live in img/menu/ (see img/menu/README.md).
   Owner: Shaima (M3 Front of House)

   Needs: i18n.js → t(), getLang() · storage.js → load()
          layout.js → rootPath()
   ============================================================ */

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

function getMenu() { return load("menu", []); }
function getCategories() { return load("categories", []); }
function getCart() { return load("cart", []); }

// The menu item with this id, or null if it was deleted from the menu.
function findMenuItem(menu, id) {
  for (var i = 0; i < menu.length; i++) if (menu[i].id === id) return menu[i];
  return null;
}

// ---------- orders (my-orders, cashier orders + bill) ----------

// "just now", "5 min ago", "2 h ago", or the date.
function timeAgo(ts) {
  var mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1)  return t("time.now");
  if (mins < 60) return t("time.min", { n: mins });
  var hours = Math.round(mins / 60);
  if (hours < 24) return t("time.hours", { n: hours });
  return new Date(ts).toLocaleDateString(getLocale());
}

// "Dine-in · Table 5" or "Takeaway"
function orderWhere(o) {
  return o.type === "dine-in"
    ? t("type.dine-in") + (o.table ? " · " + t("where.table", { n: o.table }) : "")
    : t("type.takeaway");
}

// Name of an ordered item in the current language (uses the stored name if the item was removed from the menu).
function orderLineName(menu, line) {
  var item = findMenuItem(menu, line.menuId);
  return item ? itemName(item) : line.name;
}

function loadOrders() { return load("orders", []); }

// Next free order number (orders start at 1001).
function nextOrderId(orders) {
  return orders.reduce(function (max, o) { return Math.max(max, Number(o.id) || 0); }, 1000) + 1;
}

// ---------- photo placeholder ----------

// Shown where an item's photo goes until the photo is added to img/menu/.
// An arch with a faded Riwaq logo and a small picture icon (sizes come from the page CSS).
function photoPlaceholder() {
  return '<span class="item-placeholder" aria-hidden="true">' +
    '<img class="ph-logo" src="' + rootPath() + 'img/riwaq-logo.svg" alt="">' +
    '<svg class="ph-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/></svg>' +
    "</span>";
}

// ---------- item photos ----------
//
// Put a photo in  img/menu/  named after the item's English name:
//   "Iced Coffee" → img/menu/iced-coffee.jpg   (.jpg, .png or .webp)
// An item can also name its own file:  image: "img/menu/my-photo.jpg"
// Until a photo exists, the placeholder above is shown instead.

var PHOTO_EXTS = ["jpg", "png", "webp"];
var photoFound = {};   // first URL tried → the photo URL that loaded, or false (so each file is looked up once)

// "Chocolate Chip Cookie" → "chocolate-chip-cookie"
function itemSlug(item) {
  return String(item.name || "item").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// Photo + placeholder. The placeholder shows until the photo has loaded, and stays if there is no photo.
function itemVisual(item) {
  var first = item.image ? rootPath() + item.image : rootPath() + "img/menu/" + itemSlug(item) + "." + PHOTO_EXTS[0];
  var placeholder = photoPlaceholder();
  var known = photoFound[first];
  if (known === false) return placeholder;                                  // looked before: no photo
  if (known) return '<img class="item-photo loaded" src="' + esc(known) + '" alt="">' + placeholder;
  return '<img class="item-photo" src="' + esc(first) + '" alt="" data-first="' + esc(first) + '" data-ext="' +
    (item.image ? "" : "0") + '">' + placeholder;
}

// load / error do not bubble, so listen in the capture phase for every .item-photo on the page.
document.addEventListener("load", function (e) {
  var img = e.target;
  if (!img.classList || !img.classList.contains("item-photo")) return;
  img.classList.add("loaded");                       // CSS shows the photo and hides the placeholder
  if (img.dataset.first) photoFound[img.dataset.first] = img.getAttribute("src");
}, true);

document.addEventListener("error", function (e) {
  var img = e.target;
  if (!img.classList || !img.classList.contains("item-photo")) return;
  var i = img.dataset.ext === "" ? -1 : Number(img.dataset.ext);
  if (i >= 0 && i + 1 < PHOTO_EXTS.length) {         // try the next file type (.png, then .webp)
    img.dataset.ext = String(i + 1);
    img.src = img.src.replace(/\.[a-z]+$/, "." + PHOTO_EXTS[i + 1]);
  } else {
    if (img.dataset.first) photoFound[img.dataset.first] = false;
    img.remove();                                    // no photo: keep the placeholder
  }
}, true);

