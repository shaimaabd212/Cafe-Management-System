/* =========================================================
   home.js — texts and small behaviour for index.html
   Owner: Shora · load AFTER layout.js and menu-common.js
   ========================================================= */

Object.assign(I18N.en, {
  "home.title": "Riwaq Café | Home",
  "home.eyebrow": "Coffee under the arches",
  "home.heading": "Riwaq Café",
  "home.lead": "Order from your table, follow it live from the kitchen, and enjoy a quiet moment in the riwaq.",
  "home.viewMenu": "View menu",
  "home.how": "How it works",
  "home.goDash": "Go to my page",
  "home.catTitle": "What are you in the mood for?",
  "home.catSub": "Pick a category to start your order.",
  "home.browse": "Browse",
  "home.howSub": "From your table to your cup in four steps.",
  "home.s1t": "Browse",       "home.s1d": "Explore the menu by category.",
  "home.s2t": "Add to cart",  "home.s2d": "Choose your items and quantities.",
  "home.s3t": "Place order",  "home.s3d": "Pick dine-in or takeaway and confirm.",
  "home.s4t": "Track",        "home.s4d": "Watch your order go from preparing to ready.",
  "home.visit": "Visit us",
  "home.hoursTitle": "Opening hours",
  "home.daysA": "Saturday – Thursday",
  "home.daysB": "Friday",
  "home.findTitle": "Find us",
  "home.address": "Benghazi, Libya",
  "home.ctaTitle": "Ready to order?",
  "home.ctaText": "Create a free account to order to your table and track every order.",
});

Object.assign(I18N.ar, {
  "home.title": "مقهى رواق | الرئيسية",
  "home.eyebrow": "قهوة تحت الأقواس",
  "home.heading": "مقهى رواق",
  "home.lead": "اطلب من طاولتك، وتابع طلبك مباشرة من المطبخ، واستمتع بلحظة هادئة في الرواق.",
  "home.viewMenu": "تصفّح القائمة",
  "home.how": "كيف يعمل",
  "home.goDash": "اذهب إلى صفحتي",
  "home.catTitle": "ماذا تشتهي اليوم؟",
  "home.catSub": "اختر فئة لتبدأ طلبك.",
  "home.browse": "تصفّح",
  "home.howSub": "من طاولتك إلى فنجانك في أربع خطوات.",
  "home.s1t": "تصفّح",           "home.s1d": "استكشف القائمة حسب الفئة.",
  "home.s2t": "أضف إلى السلة",   "home.s2d": "اختر أصنافك والكميات.",
  "home.s3t": "أرسل الطلب",      "home.s3d": "اختر داخل المقهى أو سفري ثم أكّد.",
  "home.s4t": "تابع",            "home.s4d": "شاهد طلبك من التحضير حتى يصبح جاهزاً.",
  "home.visit": "زورونا",
  "home.hoursTitle": "ساعات العمل",
  "home.daysA": "السبت – الخميس",
  "home.daysB": "الجمعة",
  "home.findTitle": "موقعنا",
  "home.address": "بنغازي، ليبيا",
  "home.ctaTitle": "جاهز للطلب؟",
  "home.ctaText": "أنشئ حساباً مجانياً لتطلب إلى طاولتك وتتابع كل طلب.",
});

// Put a real menu photo inside each category arch (first available item of that category).
function renderCategoryPhotos() {
  const menu = getMenu();
  document.querySelectorAll("[data-cat]").forEach(box => {
    const inCat = menu.filter(i => i.category === box.dataset.cat);
    const item = inCat.find(i => i.available) || inCat[0];
    box.innerHTML = item ? itemVisual(item) : photoPlaceholder();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderCategoryPhotos();

  // Logged-in users: hide the sign-up banner; staff get a button to their own page.
  const user = getCurrentUser();
  if (!user) return;

  const cta = document.getElementById("homeCta");
  if (cta) cta.hidden = true;

  const primary = document.getElementById("homePrimary");
  if (primary && user.role !== "customer") {
    primary.href = homeFor(user.role);
    primary.dataset.i18n = "home.goDash";
    primary.textContent = t("home.goDash");
  }
});