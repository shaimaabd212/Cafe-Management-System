/* =========================================================
   layout.js — the shared page frame (navbar, footer, sidebar)
   Owner: Shaima (M3 Front of House) · used by ALL inner pages

   Each page only describes itself on <body>, and this file
   draws the frame around its content:

     <body data-root="../"        ← path back to the project root
           data-layout="site"     ← "site"  = top navbar + footer (customer pages)
                                     "staff" = red sidebar (cashier, barista, manager)
           data-page="cart"       ← which link is highlighted (see the lists below)
           data-roles="customer"> ← who may open the page (comma-separated).
                                     Leave it out for public pages (e.g. the menu).

   Scripts at the end of <body>, in this order:
     <script src="../js/shared/storage.js"></script>
     <script src="../js/shared/auth.js"></script>
     <script src="../js/shared/layout.js"></script>
     <script src="../js/<module>/<page>.js"></script>

   layout.js calls guard() for you when data-roles is set, so the
   page does NOT need its own <script>guard([...])</script>.

   Needs: i18n.js (in <head>) → t()   ·   auth.js → guard(), homeFor(), rootPath()
   ========================================================= */

/* ---------- 1. Links ---------- */

// Customer / public navbar. "roles" = only shown to those roles (none = everyone).
const SITE_LINKS = [
  { page: "home",      href: "index.html",              key: "nav.home" },
  { page: "menu",      href: "customer/menu.html",      key: "nav.menu" },
  { page: "cart",      href: "customer/cart.html",      key: "nav.cart",     roles: ["customer"], cartCount: true },
  { page: "my-orders", href: "customer/my-orders.html", key: "nav.myOrders", roles: ["customer"] },
];

// Staff sidebar, in sections. The manager sees everything (same as the admin pages).
const STAFF_SECTIONS = [
  { key: "nav.overview", links: [
    { page: "dashboard",  href: "admin/dashboard.html",  key: "nav.dashboard", roles: ["manager"] },
    { page: "reports",    href: "admin/reports.html",    key: "nav.reports",   roles: ["manager"] },
  ]},
  { key: "nav.manage", links: [
    { page: "users",      href: "admin/users.html",      key: "nav.users",     roles: ["manager"] },
    { page: "menu-admin", href: "admin/menu-admin.html", key: "nav.menu",      roles: ["manager"] },
    { page: "inventory",  href: "admin/inventory.html",  key: "nav.inventory", roles: ["manager"] },
  ]},
  { key: "nav.operations", links: [
    { page: "orders",     href: "cashier/orders.html",   key: "nav.orders",    roles: ["manager", "cashier"] },
    { page: "kitchen",    href: "barista/kitchen.html",  key: "nav.kitchen",   roles: ["manager", "barista"] },
  ]},
];

/* ---------- 2. Small helpers ---------- */

function canSee(link, role) {
  return !link.roles || (role && link.roles.includes(role));
}

// <a> for one link, with data-i18n so the Arabic switch updates it.
function navLink(link, activePage, extra) {
  const active = link.page === activePage ? ' class="active" aria-current="page"' : "";
  return `<a href="${rootPath()}${link.href}"${active}><span data-i18n="${link.key}">${t(link.key)}</span>${extra || ""}</a>`;
}

// Number of items in the cart (each cart line may have a qty).
function cartCount() {
  return load("cart", []).reduce((sum, item) => sum + (Number(item.qty) || 1), 0);
}

// Call this after changing the cart, so the navbar badge stays correct.
function updateCartCount() {
  const n = cartCount();
  document.querySelectorAll("[data-cart-count]").forEach(el => {
    el.textContent = n;
    el.hidden = n === 0;
  });
}

/* ---------- 3. Customer / public frame: navbar + footer ---------- */

function buildSiteNavbar(user, activePage) {
  const role = user && user.role;
  const links = SITE_LINKS.filter(l => canSee(l, role))
    .map(l => navLink(l, activePage, l.cartCount ? ' <span class="nav-count" data-cart-count hidden>0</span>' : ""))
    .join("");

  let account;
  if (!user) {
    account = `<a class="btn btn-primary btn-sm" href="${rootPath()}login.html" data-i18n="nav.login">${t("nav.login")}</a>`;
  } else {
    // Who is logged in: name + a role badge (same colours as on the Users page).
    // fillUserBox() in auth.js fills the name and the translated role.
    account = `<span class="nav-user">
        <span class="name" data-user-name></span>
        <span class="badge badge-${role}" data-user-role>${t("role." + role)}</span>
      </span>
      <button type="button" class="btn btn-outline btn-sm" data-logout data-i18n="logout">${t("logout")}</button>`;
  }

  const header = document.createElement("header");
  header.className = "navbar";
  header.innerHTML = `
    <div class="container">
      <a class="brand" href="${rootPath()}index.html"><img src="${rootPath()}img/riwaq-lockup.svg" alt="Riwaq · رواق · ⵔⵉⵡⴰⵇ"></a>
      <nav data-i18n-aria="nav.main" aria-label="${t("nav.main")}">
        ${links}
        ${account}
        <button type="button" class="lang-btn" data-lang-toggle>${t("switchTo")}</button>
      </nav>
    </div>`;
  return header;
}

function buildSiteFooter() {
  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="container">
      <span data-i18n="footer.tagline">${t("footer.tagline")}</span>
      <span data-i18n="footer.course">${t("footer.course")}</span>
    </div>`;
  return footer;
}

function kilimBand() {
  const band = document.createElement("div");
  band.className = "kilim-band";
  band.setAttribute("aria-hidden", "true");
  return band;
}

function renderSiteLayout(user, activePage) {
  const main = document.querySelector("main");
  document.body.prepend(buildSiteNavbar(user, activePage), kilimBand());
  if (main) main.after(buildSiteFooter(), kilimBand());
  updateCartCount();
}

/* ---------- 4. Staff frame: sidebar (same look as the admin pages) ---------- */

function buildSidebar(user, activePage) {
  const role = user && user.role;
  const nav = STAFF_SECTIONS.map(section => {
    const links = section.links.filter(l => canSee(l, role));
    if (!links.length) return "";
    return `<div class="section" data-i18n="${section.key}">${t(section.key)}</div>`
      + links.map(l => navLink(l, activePage)).join("");
  }).join("");

  const aside = document.createElement("aside");
  aside.className = "sidebar";
  aside.innerHTML = `
    <a class="brand" href="${role ? homeFor(role) : rootPath() + "index.html"}"><img src="${rootPath()}img/riwaq-lockup-light.svg" alt="Riwaq · رواق · ⵔⵉⵡⴰⵇ"></a>
    <div class="kilim-strip"></div>
    <nav>${nav}</nav>
    <div class="me">
      <div class="who" data-user-name></div>
      <div class="role" data-user-role></div>
      <div class="me-actions">
        <button type="button" class="btn btn-ghost btn-sm" data-lang-toggle>${t("switchTo")}</button>
        <button type="button" class="btn btn-ghost btn-sm" data-logout data-i18n="logout">${t("logout")}</button>
      </div>
    </div>`;
  return aside;
}

function renderStaffLayout(user, activePage) {
  const shell = document.querySelector(".admin-layout");
  if (shell) shell.prepend(buildSidebar(user, activePage));
}

/* ---------- 5. Start ---------- */

function initLayout() {
  const body = document.body;
  const layout = body.dataset.layout;
  const activePage = body.dataset.page || "";
  const roles = body.dataset.roles ? body.dataset.roles.split(",").map(r => r.trim()) : null;
  const user = getCurrentUser();

  // Customer-only pages (menu, cart, my orders): staff are sent to their own home page.
  // Guests may still look at the menu. This also covers the manager, who may open every other page.
  if (body.hasAttribute("data-customer-only") && user && user.role !== "customer") {
    window.location.replace(homeFor(user.role));
    return;
  }

  if (layout === "site") renderSiteLayout(user, activePage);
  else if (layout === "staff") renderStaffLayout(user, activePage);

  // Protected page → guard() checks the role (and fills the name / wires Log out).
  // Public page    → just fill the name and wire Log out if someone is logged in.
  if (roles) guard(roles);
  else if (user) fillUserBox(user);
}

// Runs straight away (scripts sit at the end of <body>), so the frame is in the
// page BEFORE i18n.js translates it on DOMContentLoaded.
initLayout();
