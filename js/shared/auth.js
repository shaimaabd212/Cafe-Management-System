/* =========================================================
   auth.js — Login, register, logout, session and guard()
   Owner: Yasmina (M1 Administration) · shared by ALL pages

   Needs: js/shared/i18n.js (loaded in <head>) for t()

   How to use on any page:
     <body data-root="../">            ← path back to the project root
     <script src="../js/shared/auth.js"></script>
     <script>guard(["manager"]);</script>   ← roles allowed on this page

   localStorage keys used (shared data contract):
     cafe_users    → array of user objects
     cafe_session  → { userId, loginAt }
     cafe_orders   → array of order objects (read by dashboard/reports)
   ========================================================= */

const KEYS = {
  users:   "cafe_users",
  session: "cafe_session",
  orders:  "cafe_orders",
};

const ROLES = ["manager", "cashier", "barista", "customer"];

/* ---------- 1. Small storage helpers ---------- */

// Read JSON from localStorage. If the key is missing or broken, return the fallback.
function readData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

// Save any value as JSON in localStorage.
function writeData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ---------- 2. Users ---------- */

// The first time the site opens, create the sample staff accounts from the README.
function seedUsers() {
  if (readData(KEYS.users, null)) return;
  const now = new Date().toISOString();
  writeData(KEYS.users, [
    { id: 1, name: "Cafe Manager", email: "manager@cafe.com", phone: "", password: "1234", role: "manager", createdAt: now },
    { id: 2, name: "Front Cashier", email: "cashier@cafe.com", phone: "", password: "1234", role: "cashier", createdAt: now },
    { id: 3, name: "Head Barista", email: "barista@cafe.com", phone: "", password: "1234", role: "barista", createdAt: now },
  ]);
}

function getUsers() {
  return readData(KEYS.users, []);
}

function saveUsers(users) {
  writeData(KEYS.users, users);
}

// Find a user by e-mail (not case-sensitive).
function findUserByEmail(email) {
  const target = String(email).trim().toLowerCase();
  return getUsers().find(u => u.email.toLowerCase() === target) || null;
}

// Next free id = biggest id + 1.
function nextUserId() {
  return getUsers().reduce((max, u) => Math.max(max, u.id), 0) + 1;
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
  writeData(KEYS.session, { userId: user.id, loginAt: new Date().toISOString() });
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
  writeData(KEYS.session, { userId: user.id, loginAt: new Date().toISOString() });
  return { ok: true, user };
}

function getCurrentUser() {
  const session = readData(KEYS.session, null);
  if (!session) return null;
  return getUsers().find(u => u.id === session.userId) || null;
}

function logout() {
  localStorage.removeItem(KEYS.session);
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
  seedUsers();
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
  seedUsers();

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

    // Go back to the page the manager tried to open (only a path on this same site).
    const next = new URLSearchParams(window.location.search).get("next");
    const safeNext = next && next.startsWith("/") && !next.startsWith("//");
    window.location.href = safeNext && result.user.role === "manager" ? next : homeFor(result.user.role);
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
  seedUsers();

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
