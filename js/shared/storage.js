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
var SEED_VERSION = 3;

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

  // Menu categories (managed in admin/menu-admin.html)
  save("categories", [
    { id: "cold",    name: "Cold drinks" },
    { id: "hot",     name: "Hot drinks" },
    { id: "bakery",  name: "Bakery" },
    { id: "cookies", name: "Cookies" },
    { id: "rolls",   name: "Cinnamon rolls" }
  ]);

  // Menu items. "category" is a category id from above.
  // "art" describes the packaging drawing on the menu page (js/customer/menu.js);
  // it is optional — items without it get a default drawing for their category.
  save("menu", [
    { id: 1,  name: "Iced Coffee",         category: "cold", price: 12, available: true, desc: "Espresso over ice with cold milk.", nameAr: "قهوة مثلجة", descAr: "إسبريسو على الثلج مع حليب بارد.",    art: { kind: "iced", top: "#E9D6B6", bottom: "#6B4226" } },
    { id: 2,  name: "Iced Mocha",          category: "cold", price: 14, available: true, desc: "Espresso, dark chocolate and milk.", nameAr: "موكا مثلجة", descAr: "إسبريسو وشوكولاتة داكنة وحليب.",   art: { kind: "iced", top: "#8A5636", bottom: "#3B2216" } },
    { id: 3,  name: "Matcha Latte",        category: "cold", price: 15, available: true, desc: "Ceremonial matcha poured over milk.", nameAr: "ماتشا لاتيه", descAr: "ماتشا فاخرة تُسكب على الحليب.",  art: { kind: "iced", top: "#6E9B3E", bottom: "#F1EBDD" } },
    { id: 4,  name: "Caramel Latte",       category: "cold", price: 14, available: true, desc: "Espresso and caramel, layered on milk.", nameAr: "كراميل لاتيه", descAr: "إسبريسو وكراميل فوق طبقة من الحليب.", art: { kind: "iced", top: "#B86C2C", bottom: "#F0E2C8" } },
    { id: 5,  name: "Orange Juice",        category: "cold", price: 10, available: true, desc: "Freshly squeezed oranges.", nameAr: "عصير برتقال", descAr: "برتقال معصور طازجاً.",           art: { kind: "iced", top: "#F4A51C", bottom: "#EE9612" } },
    { id: 6,  name: "Strawberry Smoothie", category: "cold", price: 13, available: true, desc: "Strawberries, yoghurt and honey.", nameAr: "سموذي الفراولة", descAr: "فراولة وزبادي وعسل.",    art: { kind: "iced", top: "#D9535B", bottom: "#C8434C" } },
    { id: 7,  name: "Mojito",              category: "cold", price: 11, available: true, desc: "Lime, fresh mint and soda.", nameAr: "موهيتو", descAr: "ليمون ونعناع طازج وصودا.",          art: { kind: "iced", top: "#C3DE7A", bottom: "#9CC84E" } },
    { id: 8,  name: "Espresso",            category: "hot",  price: 6,  available: true, desc: "A short, strong single shot.", nameAr: "إسبريسو", descAr: "جرعة قصيرة وقوية.",        art: { kind: "hot", sleeve: "#1F5C43" } },
    { id: 9,  name: "Cappuccino",          category: "hot",  price: 9,  available: true, desc: "Espresso with steamed milk foam.", nameAr: "كابتشينو", descAr: "إسبريسو مع رغوة الحليب المبخّر.",    art: { kind: "hot", sleeve: "#B3261E" } },
    { id: 10, name: "Butter Croissant",    category: "bakery", price: 7,  available: true, desc: "Flaky, all-butter and baked daily.", nameAr: "كرواسون بالزبدة", descAr: "هشّ بالزبدة ويُخبز يومياً.",   art: { kind: "bag", pastry: "croissant" } },
    { id: 11, name: "Almond Croissant",    category: "bakery", price: 9,  available: true, desc: "Almond cream and toasted flakes.", nameAr: "كرواسون باللوز", descAr: "كريمة اللوز ورقائق محمّصة.",     art: { kind: "bag", pastry: "croissant", flakes: true } },
    { id: 12, name: "Chocolate Loaf Cake", category: "bakery", price: 10, available: true, desc: "Moist cocoa loaf with ganache.", nameAr: "كيك الشوكولاتة", descAr: "كيك كاكاو طري مع الغاناش.",       art: { kind: "box", pastry: "cake" } },
    { id: 13, name: "Chocolate Muffin",    category: "bakery", price: 8,  available: true, desc: "Double chocolate, soft centre.", nameAr: "مافن الشوكولاتة", descAr: "شوكولاتة مضاعفة وقلب طري.",       art: { kind: "box", pastry: "muffin" } },
    { id: 14, name: "Club Sandwich",       category: "bakery", price: 15, available: true, desc: "Toasted, with chicken and fresh salad.", nameAr: "كلوب ساندويتش", descAr: "محمّص مع الدجاج والسلطة الطازجة.", art: { kind: "box", pastry: "sandwich" } },
    { id: 15, name: "Red Velvet Cookie",   category: "cookies", price: 7, available: true, desc: "White chocolate chunks.", nameAr: "كوكيز ريد فيلفت", descAr: "قطع الشوكولاتة البيضاء.",             art: { kind: "bag", pastry: "cookie", c1: "#7E1E24", c2: "#F5EFE3" } },
    { id: 16, name: "Matcha Cookie",       category: "cookies", price: 7, available: true, desc: "Matcha dough, white chocolate.", nameAr: "كوكيز الماتشا", descAr: "عجينة الماتشا مع الشوكولاتة البيضاء.",      art: { kind: "bag", pastry: "cookie", c1: "#7FA05A", c2: "#F5EFE3" } },
    { id: 17, name: "Chocolate Chip Cookie", category: "cookies", price: 6, available: true, desc: "Brown sugar dough, dark chips.", nameAr: "كوكيز رقائق الشوكولاتة", descAr: "عجينة السكر البني ورقائق داكنة.",    art: { kind: "bag", pastry: "cookie", c1: "#C98B4E", c2: "#3B2216" } },
    { id: 18, name: "Brown Butter Cookie", category: "cookies", price: 6, available: true, desc: "Nutty brown butter and sea salt.", nameAr: "كوكيز الزبدة البنية", descAr: "زبدة بنية بنكهة البندق وملح البحر.",    art: { kind: "bag", pastry: "cookie", c1: "#B9773E", c2: "#8A4F22" } },
    { id: 19, name: "Classic Cinnamon Roll",   category: "rolls", price: 9,  available: true,  desc: "Cinnamon sugar swirl.", nameAr: "سينابون كلاسيك", descAr: "لفائف القرفة والسكر.",            art: { kind: "box", pastry: "roll", c1: "#C98A4B" } },
    { id: 20, name: "Chocolate Cinnamon Roll", category: "rolls", price: 10, available: true,  desc: "Topped with chocolate drizzle.", nameAr: "سينابون بالشوكولاتة", descAr: "مغطى بصلصة الشوكولاتة.",   art: { kind: "box", pastry: "roll", c1: "#C98A4B", c2: "#4A2A1A", drizzle: true } },
    { id: 21, name: "Oreo Cinnamon Roll",      category: "rolls", price: 10, available: true,  desc: "Cream glaze and cookie crumb.", nameAr: "سينابون أوريو", descAr: "كريمة وفتات البسكويت.",    art: { kind: "box", pastry: "roll", c1: "#C98A4B", c2: "#F3ECE0", drizzle: true } },
    { id: 22, name: "Blueberry Cinnamon Roll", category: "rolls", price: 10, available: false, desc: "Blueberry jam and lemon glaze.", nameAr: "سينابون التوت الأزرق", descAr: "مربى التوت الأزرق وكريمة الليمون.",   art: { kind: "box", pastry: "roll", c1: "#C98A4B", c2: "#5B4A8A", drizzle: true } }
  ]);

  // Sample orders for the demo customer (id 4)
  var now = Date.now();
  save("orders", [
    {
      id: 1001, customerId: 4, customerName: "Aya Ali",
      type: "dine-in", table: "5",
      items: [
        { menuId: 9,  name: "Cappuccino",       price: 9, qty: 2 },
        { menuId: 10, name: "Butter Croissant", price: 7, qty: 1 }
      ],
      total: 25, status: "Preparing",
      placedAt: now - 9 * 60 * 1000, paid: false
    },
    {
      id: 1002, customerId: 4, customerName: "Aya Ali",
      type: "takeaway", table: "",
      items: [ { menuId: 1, name: "Iced Coffee", price: 12, qty: 1 } ],
      total: 12, status: "Pending",
      placedAt: now - 2 * 60 * 1000, paid: false
    },
    {
      id: 1000, customerId: 4, customerName: "Aya Ali",
      type: "dine-in", table: "3",
      items: [
        { menuId: 8,  name: "Espresso",         price: 6, qty: 2 },
        { menuId: 15, name: "Red Velvet Cookie", price: 7, qty: 2 }
      ],
      total: 26, status: "Completed",
      placedAt: now - 26 * 60 * 60 * 1000, paid: true
    }
  ]);

  save("cart", []);
  save("seeded", SEED_VERSION);
}

seedData();

// (removed by Yasmina: the TEMPORARY auto-login of the sample customer.
//  auth.js is ready now — pages call guard() and real login is used.)
