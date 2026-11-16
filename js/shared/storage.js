/* ============================================================
   Riwaq Cafe — storage.js (shared data layer)
   All data lives in localStorage as JSON under "riwaq_" keys.
   Every other JS file reads and writes through these helpers.
   ============================================================ */

// ---------- generic helpers ----------

// Load a value from localStorage, or return the fallback if missing.
function load(key, fallback) {
  try {
    var raw = localStorage.getItem("riwaq_" + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

// Save a value to localStorage as JSON.
function save(key, value) {
  localStorage.setItem("riwaq_" + key, JSON.stringify(value));
}

// ---------- session (who is logged in) ----------

function getSession() { return load("session", null); }
function setSession(user) { save("session", user); }
function clearSession() { localStorage.removeItem("riwaq_session"); }

// ---------- sample data (runs once, first visit) ----------

// Bump this number when the sample data changes, so browsers that
// already have old sample data get the new version once.
var SEED_VERSION = 2;

function seedData() {
  if (load("seeded", 0) >= SEED_VERSION) return; // already done

  // Users log in with e-mail + password (auth.js). Same ids as before,
  // so the sample orders below still belong to customer 4.
  // (changed by Yasmina: e-mail login for auth.js — was username/admin123)
  var joined = new Date().toISOString();
  save("users", [
    { id: 1, name: "Cafe Manager", email: "manager@cafe.com",  phone: "", password: "1234", role: "manager",  createdAt: joined },
    { id: 2, name: "Front Cashier",email: "cashier@cafe.com",  phone: "", password: "1234", role: "cashier",  createdAt: joined },
    { id: 3, name: "Head Barista", email: "barista@cafe.com",  phone: "", password: "1234", role: "barista",  createdAt: joined },
    { id: 4, name: "Aya Ali",      email: "customer@cafe.com", phone: "", password: "1234", role: "customer", createdAt: joined }
  ]);

  save("menu", [
    { id: 1, name: "Arabic Coffee",   category: "Hot drinks",  price: 6,  available: true, desc: "With cardamom, served with dates" },
    { id: 2, name: "Libyan Tea",      category: "Hot drinks",  price: 5,  available: true, desc: "Strong tea with roasted peanuts" },
    { id: 3, name: "Espresso",        category: "Hot drinks",  price: 7,  available: true, desc: "Double shot" },
    { id: 4, name: "Iced Latte",      category: "Cold drinks", price: 10, available: true, desc: "Espresso, milk and ice" },
    { id: 5, name: "Orange Juice",    category: "Cold drinks", price: 8,  available: true, desc: "Freshly squeezed" },
    { id: 6, name: "Maqrood",         category: "Sweets",      price: 8,  available: true, desc: "Semolina, dates and honey" },
    { id: 7, name: "Basbousa",        category: "Sweets",      price: 7,  available: true, desc: "With syrup and almonds" },
    { id: 8, name: "Cheese Sandwich", category: "Food",        price: 12, available: true, desc: "Toasted, with olives" }
  ]);

  // Sample orders for the demo customer (id 4)
  var now = Date.now();
  save("orders", [
    {
      id: 1001, customerId: 4, customerName: "Aya Ali",
      type: "dine-in", table: "5",
      items: [
        { menuId: 1, name: "Arabic Coffee", price: 6, qty: 2 },
        { menuId: 6, name: "Maqrood",       price: 8, qty: 1 }
      ],
      total: 20, status: "Preparing",
      placedAt: now - 9 * 60 * 1000, paid: false
    },
    {
      id: 1002, customerId: 4, customerName: "Aya Ali",
      type: "takeaway", table: "",
      items: [ { menuId: 4, name: "Iced Latte", price: 10, qty: 1 } ],
      total: 10, status: "Pending",
      placedAt: now - 2 * 60 * 1000, paid: false
    },
    {
      id: 1000, customerId: 4, customerName: "Aya Ali",
      type: "dine-in", table: "3",
      items: [
        { menuId: 2, name: "Libyan Tea", price: 5, qty: 2 },
        { menuId: 7, name: "Basbousa",   price: 7, qty: 2 }
      ],
      total: 24, status: "Completed",
      placedAt: now - 26 * 60 * 60 * 1000, paid: true
    }
  ]);

  save("cart", []);
  save("seeded", SEED_VERSION);
}

seedData();

// (removed by Yasmina: the TEMPORARY auto-login of the sample customer.
//  auth.js is ready now — pages call guard() and real login is used.)
