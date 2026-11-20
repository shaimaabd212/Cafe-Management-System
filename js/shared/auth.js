/* =========================================================
   auth.js — Login, register, logout, session and guard()
   Owner: Yasmina (M1 Administration) · shared by ALL pages

   Needs (in this order):
     js/shared/i18n.js     (in <head>)  → t()
     js/shared/storage.js  (Shaima)     → load(), save(), getSession(), setSession(), clearSession()

   How to use on any page:
     <body data-root="../">            ← path back to the project root
     <script src="../js/shared/storage.js"></script>
     <script src="../js/shared/auth.js"></script>
     <script>guard(["manager"]);</script>   ← roles allowed on this page

   All data goes through storage.js, so it lives under the shared keys:
     riwaq_users    → [{ id, name, email, phone, password, role, createdAt }]
     riwaq_session  → { id, name, role }   (same shape storage.js uses)
     riwaq_orders   → read by dashboard.js / reports.js
   ========================================================= */

const ROLES = ["manager", "cashier", "barista", "customer"];

/* ---------- 1–2. Users (stored by storage.js under "riwaq_users") ---------- */

function getUsers() {
  return load("users", []);
}

function saveUsers(users) {
  save("users", users);
}

// Find a user by e-mail (not case-sensitive).
function findUserByEmail(email) {
  const target = String(email).trim().toLowerCase();
  return getUsers().find(u => (u.email || "").toLowerCase() === target) || null;
}

// Next free id = biggest id + 1.
function nextUserId() {
  return getUsers().reduce((max, u) => Math.max(max, u.id), 0) + 1;
}

// Save "who is logged in" in the same shape storage.js uses: { id, name, role }.
function startSession(user) {
  setSession({ id: user.id, name: user.name, role: user.role });
}

/* ---------- 3. Validation ---------- */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim());
}

// Libyan mobile numbers: 09XXXXXXXX or +2189XXXXXXXX (optional field).
function isValidPhone(phone) {
  if (!phone) return true;
  return /^(\+218|0)9\d{8}$/.test(phone.replace(/[\s-]/g, ""));
}

/* ---------- 4. Login / register / logout ---------- */

// Returns { ok: true, user } or { ok: false, message }.
function login(email, password) {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    return { ok: false, message: t("err.wrongLogin") };
  }
  startSession(user);
  return { ok: true, user };
}

// Customers register themselves. Staff are added by the manager in users.html.
function register(data) {
  if (findUserByEmail(data.email)) {
    return { ok: false, message: t("err.emailTaken") };
  }
  const user = {
    id: nextUserId(),
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: (data.phone || "").trim(),
    password: data.password,
    role: "customer",
    createdAt: new Date().toISOString(),
  };
  const users = getUsers();
  users.push(user);
  saveUsers(users);
  startSession(user);
  return { ok: true, user };
}

// The full user record of whoever is logged in (null if nobody, or if the account was deleted).
function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  return getUsers().find(u => u.id === session.id) || null;
}

function logout() {
  clearSession();
  window.location.href = rootPath() + "login.html";
}

/* ---------- 5. Navigation & page guard ---------- */

// Each page tells us how to get back to the root folder: <body data-root="../">
function rootPath() {
  return (document.body && document.body.dataset.root) || "";
}

// The page each role lands on after login.
function homeFor(role) {
  const homes = {
    manager:  "admin/dashboard.html",
    cashier:  "cashier/orders.html",
    barista:  "barista/kitchen.html",
    customer: "customer/menu.html",
  };
  return rootPath() + (homes[role] || "index.html");
}

/*  guard(allowedRoles)
    Call at the top of every protected page.
    - No one logged in      → go to login (and come back after).
    - Role not allowed here → go to that role's home page.
    - The manager may open every page.                       */
function guard(allowedRoles) {
  const user = getCurrentUser();
  if (!user) {
    const back = encodeURIComponent(window.location.pathname);
    window.location.replace(rootPath() + "login.html?next=" + back);
    return null;
  }
  if (user.role !== "manager" && allowedRoles && !allowedRoles.includes(user.role)) {
    window.location.replace(homeFor(user.role));
    return null;
  }
  fillUserBox(user);
  return user;
}

// Show the logged-in user's name/role and wire every [data-logout] button.
function fillUserBox(user) {
  document.querySelectorAll("[data-user-name]").forEach(el => (el.textContent = user.name));
  const showRole = () => document.querySelectorAll("[data-user-role]").forEach(el => (el.textContent = t("role." + user.role)));
  showRole();
  document.addEventListener("langchange", showRole);
  document.querySelectorAll("[data-logout]").forEach(btn => btn.addEventListener("click", logout));
}

/* ---------- 6. Form helpers ---------- */

// When the language changes, old error messages are in the wrong language → clear them.
function clearFormMessages() {
  document.querySelectorAll(".field.invalid").forEach(f => f.classList.remove("invalid"));
  document.querySelectorAll(".field .error").forEach(e => (e.textContent = ""));
  document.querySelectorAll(".alert").forEach(a => (a.hidden = true));
}
document.addEventListener("langchange", clearFormMessages);

function setFieldError(input, message) {
  const field = input.closest(".field");
  if (!field) return;
  field.classList.toggle("invalid", Boolean(message));
  const box = field.querySelector(".error");
  if (box) box.textContent = message || "";
}

function showAlert(box, message, type) {
  box.textContent = message;
  box.className = "alert" + (type === "success" ? " success" : "");
  box.hidden = false;
}

/* ---------- 7. Login page ---------- */

function initLoginPage() {
  const form = document.getElementById("login-form");
  if (!form) return;

  // Already logged in? Go straight to the right home page.
  const current = getCurrentUser();
  if (current) { window.location.replace(homeFor(current.role)); return; }

  const email = form.elements.email;
  const password = form.elements.password;
  const alertBox = document.getElementById("login-alert");

  form.addEventListener("submit", event => {
    event.preventDefault();
    let ok = true;

    if (!email.value.trim()) { setFieldError(email, t("err.emailRequired")); ok = false; }
    else if (!isValidEmail(email.value)) { setFieldError(email, t("err.emailInvalid")); ok = false; }
    else setFieldError(email, "");

    if (!password.value) { setFieldError(password, t("err.passwordRequired")); ok = false; }
    else setFieldError(password, "");

    if (!ok) return;

    const result = login(email.value, password.value);
    if (!result.ok) { showAlert(alertBox, result.message); return; }

    // Go back to the page the user tried to open (only a path on this same site).
    // That page runs guard() again, so a role that may not see it is sent to its home page.
    // (changed by Shaima: customers too, so a guest who opened the cart comes back to it)
    const next = new URLSearchParams(window.location.search).get("next");
    const safeNext = next && next.startsWith("/") && !next.startsWith("//");
    window.location.href = safeNext ? next : homeFor(result.user.role);
  });

  // "Try a sample account" buttons fill the form for the demo.
  document.querySelectorAll("[data-demo]").forEach(btn => {
    btn.addEventListener("click", () => {
      email.value = btn.dataset.demo;
      password.value = "1234";
      email.focus();
    });
  });
}

/* ---------- 8. Register page ---------- */

function initRegisterPage() {
  const form = document.getElementById("register-form");
  if (!form) return;

  const f = form.elements;
  const alertBox = document.getElementById("register-alert");

  form.addEventListener("submit", event => {
    event.preventDefault();
    let ok = true;

    if (f.name.value.trim().length < 3) { setFieldError(f.name, t("err.name3")); ok = false; }
    else setFieldError(f.name, "");

    if (!isValidEmail(f.email.value)) { setFieldError(f.email, t("err.emailInvalid")); ok = false; }
    else if (findUserByEmail(f.email.value)) { setFieldError(f.email, t("err.emailTaken")); ok = false; }
    else setFieldError(f.email, "");

    if (!isValidPhone(f.phone.value)) { setFieldError(f.phone, t("err.phone")); ok = false; }
    else setFieldError(f.phone, "");

    if (f.password.value.length < 6) { setFieldError(f.password, t("err.password6")); ok = false; }
    else setFieldError(f.password, "");

    if (f.confirm.value !== f.password.value) { setFieldError(f.confirm, t("err.confirm")); ok = false; }
    else setFieldError(f.confirm, "");

    if (!ok) return;

    const result = register({ name: f.name.value, email: f.email.value, phone: f.phone.value, password: f.password.value });
    if (!result.ok) { showAlert(alertBox, result.message); return; }

    showAlert(alertBox, t("register.welcome", { name: result.user.name }), "success");
    setTimeout(() => (window.location.href = homeFor("customer")), 900);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLoginPage();
  initRegisterPage();
});
