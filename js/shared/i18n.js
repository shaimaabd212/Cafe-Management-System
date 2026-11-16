/* =========================================================
   i18n.js — Arabic / English switch (i18n = "internationalization")
   Owner: Yasmina (M1 Administration) · can be used by ALL pages

   How it works:
   1. Every text in the HTML gets a key:   <h2 data-i18n="login.heading">Welcome back</h2>
   2. The dictionary below has that key in English and Arabic.
   3. applyLanguage() puts the right text in every element and sets
      <html lang="ar" dir="rtl">  so the page flows right-to-left.
   4. In JavaScript, use t("key") to get a translated string.
   5. The choice is saved in localStorage ("cafe_lang").

   Load it in <head> (before the other scripts):
     <script src="js/shared/i18n.js"></script>
   Add a switch button anywhere:
     <button data-lang-toggle></button>
   ========================================================= */

const LANG_KEY = "cafe_lang";

const I18N = {
  en: {
    "switchTo": "العربية",
    "currency": "LD",
    "today": "Today",

    /* Roles & statuses */
    "role.manager": "Manager", "role.cashier": "Cashier", "role.barista": "Barista", "role.customer": "Customer",
    "status.Pending": "Pending", "status.Preparing": "Preparing", "status.Ready": "Ready",
    "status.Completed": "Completed", "status.Cancelled": "Cancelled",
    "type.dine-in": "Dine-in", "type.takeaway": "Takeaway",
    "payment.cash": "Cash", "payment.card": "Card",

    /* Sidebar */
    "nav.overview": "Overview", "nav.dashboard": "Dashboard", "nav.reports": "Reports",
    "nav.manage": "Manage", "nav.users": "Users", "nav.menu": "Menu", "nav.inventory": "Inventory",
    "nav.operations": "Operations", "nav.orders": "Orders", "nav.kitchen": "Kitchen",
    "logout": "Log out",

    /* Brand panel */
    "brand.tagline": "Coffee under <span>the arches</span>",
    "brand.text": "Riwaq is the shaded arcade where people pause, sit, and talk — a place of welcome, connection, and timeless hospitality.",
    "back": "← Back to home",

    /* Fields */
    "field.email": "E-mail", "field.password": "Password", "field.fullName": "Full name",
    "field.phone": "Phone", "field.optional": "(optional)", "field.confirm": "Confirm password",
    "field.role": "Role",
    "ph.name": "e.g. Yasmina Ali", "ph.password6": "6+ characters",

    /* Login */
    "login.title": "Log in · Riwaq Café",
    "login.heading": "Welcome back",
    "login.sub": "Log in to order, serve, or manage the café.",
    "login.submit": "Log in",
    "login.newCustomer": "New customer?",
    "login.createAccount": "Create an account",
    "login.demoTitle": "Sample accounts (password 1234)",

    /* Register */
    "register.title": "Create account · Riwaq Café",
    "register.tagline": "Pull up a chair <span>in the riwaq</span>",
    "register.text": "Create your account to browse the menu, order to your table, and follow your coffee from the bar to your hands.",
    "register.heading": "Create your account",
    "register.sub": "It takes less than a minute.",
    "register.submit": "Create account",
    "register.haveAccount": "Already have an account?",
    "register.login": "Log in",
    "register.welcome": "Welcome to Riwaq, {name}! Taking you to the menu…",

    /* Errors */
    "err.emailRequired": "Please enter your e-mail.",
    "err.emailInvalid": "This e-mail is not valid.",
    "err.passwordRequired": "Please enter your password.",
    "err.wrongLogin": "Wrong e-mail or password.",
    "err.emailTaken": "This e-mail is already registered.",
    "err.name3": "Name must be at least 3 letters.",
    "err.phone": "Use a Libyan number like 0912345678.",
    "err.password6": "Password must be at least 6 characters.",
    "err.password4": "At least 4 characters.",
    "err.confirm": "Passwords do not match.",
    "err.ownRole": "You can't remove your own manager role.",
    "err.emailUsed": "E-mail already used.",

    /* Users */
    "users.title": "Users · Riwaq Admin",
    "users.heading": "Staff accounts",
    "users.sub": "Add, edit, or remove the people who run the café.",
    "users.add": "+ Add staff",
    "users.search": "Search",
    "users.searchPh": "Name or e-mail",
    "users.allStaff": "All staff",
    "users.customers": "Customers",
    "users.empty": "No accounts match your search.",
    "users.you": "(you)",
    "users.modalAdd": "Add staff",
    "users.modalEdit": "Edit account",
    "users.pwHintNew": "At least 4 characters.",
    "users.pwHintEdit": "Leave empty to keep the current password.",
    "users.confirmDelete": "Delete {name}'s account? This cannot be undone.",
    "toast.updated": "Account updated", "toast.added": "Staff member added", "toast.deleted": "Account deleted",
    "btn.edit": "Edit", "btn.delete": "Delete", "btn.cancel": "Cancel", "btn.save": "Save",
    "th.name": "Name", "th.email": "E-mail", "th.phone": "Phone", "th.role": "Role", "th.joined": "Joined",

    /* Dashboard */
    "dash.title": "Dashboard · Riwaq Admin",
    "dash.greeting": "Good day,",
    "dash.viewReports": "View reports",
    "dash.noOrders": "No orders yet",
    "dash.noOrdersText": "When customers and cashiers place orders, today's numbers will appear here.",
    "dash.loadSample": "Load sample orders for a demo",
    "kpi.todaySales": "Today's sales", "kpi.ordersToday": "Orders today", "kpi.allStatuses": "All statuses",
    "kpi.pending": "Pending orders", "kpi.pendingNote": "Pending, preparing or ready",
    "kpi.avg": "Average order", "kpi.avgNote": "Completed orders today",
    "kpi.vsYesterday": "{arrow} {pct}% vs yesterday", "kpi.noYesterday": "No sales yesterday",
    "dash.chartTitle": "Sales, last 7 days", "dash.thisWeek": "{amount} this week",
    "dash.best": "Best sellers", "dash.byQty": "by quantity", "dash.sold": "{n} sold", "dash.noSales": "No sales yet.",
    "dash.latest": "Latest orders", "dash.allOrders": "All orders →",
    "th.order": "Order", "th.time": "Time", "th.where": "Where", "th.items": "Items", "th.status": "Status", "th.total": "Total",
    "where.table": "Table {n}",
    "chart.tip": "{amount} · {n} orders",
    "chart.week": "Bar chart of sales for the last 7 days",

    /* Reports */
    "rep.title": "Reports · Riwaq Admin",
    "rep.heading": "Sales reports",
    "rep.exportDays": "Export daily CSV", "rep.exportOrders": "Export orders CSV", "rep.print": "Print",
    "rep.quick": "Quick range", "rep.last7": "Last 7 days", "rep.last30": "Last 30 days", "rep.month": "This month",
    "rep.from": "From", "rep.to": "To",
    "rep.totalSales": "Total sales", "rep.completed": "Completed orders", "rep.cancelled": "Cancelled orders",
    "rep.byDay": "Sales by day", "rep.completedOnly": "Completed orders only",
    "rep.daily": "Daily breakdown", "rep.total": "Total",
    "rep.topItems": "Top items", "rep.noCompleted": "No completed orders in this period.",
    "th.date": "Date", "th.orders": "Orders", "th.average": "Average", "th.sales": "Sales",
    "th.item": "Item", "th.qty": "Qty", "th.revenue": "Revenue",
    "csv.date": "Date", "csv.completed": "Completed orders", "csv.sales": "Sales ({cur})", "csv.total": "TOTAL",
    "csv.orderId": "Order ID", "csv.time": "Time", "csv.type": "Type", "csv.table": "Table", "csv.status": "Status",
    "csv.payment": "Payment", "csv.items": "Items", "csv.totalCol": "Total ({cur})",
  },

  ar: {
    "switchTo": "English",
    "currency": "د.ل",
    "today": "اليوم",

    "role.manager": "مدير", "role.cashier": "كاشير", "role.barista": "باريستا", "role.customer": "زبون",
    "status.Pending": "قيد الانتظار", "status.Preparing": "قيد التحضير", "status.Ready": "جاهز",
    "status.Completed": "مكتمل", "status.Cancelled": "ملغى",
    "type.dine-in": "داخل المقهى", "type.takeaway": "سفري",
    "payment.cash": "نقدًا", "payment.card": "بطاقة",

    "nav.overview": "نظرة عامة", "nav.dashboard": "لوحة التحكم", "nav.reports": "التقارير",
    "nav.manage": "الإدارة", "nav.users": "المستخدمون", "nav.menu": "قائمة الطعام", "nav.inventory": "المخزون",
    "nav.operations": "التشغيل", "nav.orders": "الطلبات", "nav.kitchen": "المطبخ",
    "logout": "تسجيل الخروج",

    "brand.tagline": "قهوة <span>تحت الأقواس</span>",
    "brand.text": "رواق هو الممر المظلّل الذي يحيط بالمكان، حيث يتوقف الناس للجلوس والحديث. إنه مساحة ترحيب وتواصل وكرم ضيافة دائم.",
    "back": "→ العودة إلى الرئيسية",

    "field.email": "البريد الإلكتروني", "field.password": "كلمة المرور", "field.fullName": "الاسم الكامل",
    "field.phone": "رقم الهاتف", "field.optional": "(اختياري)", "field.confirm": "تأكيد كلمة المرور",
    "field.role": "الدور",
    "ph.name": "مثال: ياسمينة علي", "ph.password6": "6 أحرف أو أكثر",

    "login.title": "تسجيل الدخول · مقهى رواق",
    "login.heading": "مرحبًا بعودتك",
    "login.sub": "سجّل دخولك لتطلب أو تخدم أو تدير المقهى.",
    "login.submit": "تسجيل الدخول",
    "login.newCustomer": "زبون جديد؟",
    "login.createAccount": "أنشئ حسابًا",
    "login.demoTitle": "حسابات تجريبية (كلمة المرور 1234)",

    "register.title": "إنشاء حساب · مقهى رواق",
    "register.tagline": "تفضّل بالجلوس <span>في الرواق</span>",
    "register.text": "أنشئ حسابك لتتصفح قائمة الطعام، وتطلب إلى طاولتك، وتتابع قهوتك من البار حتى تصل إلى يديك.",
    "register.heading": "أنشئ حسابك",
    "register.sub": "لن يستغرق ذلك أكثر من دقيقة.",
    "register.submit": "إنشاء الحساب",
    "register.haveAccount": "لديك حساب بالفعل؟",
    "register.login": "سجّل الدخول",
    "register.welcome": "أهلًا بك في رواق يا {name}! سننقلك إلى قائمة الطعام…",

    "err.emailRequired": "يرجى إدخال البريد الإلكتروني.",
    "err.emailInvalid": "البريد الإلكتروني غير صالح.",
    "err.passwordRequired": "يرجى إدخال كلمة المرور.",
    "err.wrongLogin": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    "err.emailTaken": "هذا البريد الإلكتروني مسجّل مسبقًا.",
    "err.name3": "يجب ألا يقل الاسم عن 3 أحرف.",
    "err.phone": "أدخل رقمًا ليبيًا مثل 0912345678.",
    "err.password6": "يجب ألا تقل كلمة المرور عن 6 أحرف.",
    "err.password4": "4 أحرف على الأقل.",
    "err.confirm": "كلمتا المرور غير متطابقتين.",
    "err.ownRole": "لا يمكنك إزالة صلاحية المدير عن حسابك.",
    "err.emailUsed": "البريد الإلكتروني مستخدم مسبقًا.",

    "users.title": "المستخدمون · إدارة رواق",
    "users.heading": "حسابات الموظفين",
    "users.sub": "أضف الموظفين الذين يديرون المقهى، أو عدّل بياناتهم، أو احذفهم.",
    "users.add": "+ إضافة موظف",
    "users.search": "بحث",
    "users.searchPh": "الاسم أو البريد الإلكتروني",
    "users.allStaff": "كل الموظفين",
    "users.customers": "الزبائن",
    "users.empty": "لا توجد حسابات تطابق بحثك.",
    "users.you": "(أنت)",
    "users.modalAdd": "إضافة موظف",
    "users.modalEdit": "تعديل الحساب",
    "users.pwHintNew": "4 أحرف على الأقل.",
    "users.pwHintEdit": "اتركها فارغة للإبقاء على كلمة المرور الحالية.",
    "users.confirmDelete": "هل تريد حذف حساب {name}؟ لا يمكن التراجع عن هذه العملية.",
    "toast.updated": "تم تحديث الحساب", "toast.added": "تمت إضافة الموظف", "toast.deleted": "تم حذف الحساب",
    "btn.edit": "تعديل", "btn.delete": "حذف", "btn.cancel": "إلغاء", "btn.save": "حفظ",
    "th.name": "الاسم", "th.email": "البريد الإلكتروني", "th.phone": "الهاتف", "th.role": "الدور", "th.joined": "تاريخ الانضمام",

    "dash.title": "لوحة التحكم · إدارة رواق",
    "dash.greeting": "مرحبًا،",
    "dash.viewReports": "عرض التقارير",
    "dash.noOrders": "لا توجد طلبات بعد",
    "dash.noOrdersText": "عندما يضع الزبائن والكاشير طلباتهم، ستظهر أرقام اليوم هنا.",
    "dash.loadSample": "تحميل طلبات تجريبية للعرض",
    "kpi.todaySales": "مبيعات اليوم", "kpi.ordersToday": "طلبات اليوم", "kpi.allStatuses": "بجميع حالاتها",
    "kpi.pending": "الطلبات المعلّقة", "kpi.pendingNote": "قيد الانتظار أو التحضير أو جاهزة",
    "kpi.avg": "متوسط الطلب", "kpi.avgNote": "الطلبات المكتملة اليوم",
    "kpi.vsYesterday": "{arrow} {pct}% مقارنة بالأمس", "kpi.noYesterday": "لا توجد مبيعات بالأمس",
    "dash.chartTitle": "المبيعات في آخر 7 أيام", "dash.thisWeek": "{amount} هذا الأسبوع",
    "dash.best": "الأكثر مبيعًا", "dash.byQty": "حسب الكمية", "dash.sold": "{n} قطعة", "dash.noSales": "لا توجد مبيعات بعد.",
    "dash.latest": "أحدث الطلبات", "dash.allOrders": "كل الطلبات ←",
    "th.order": "الطلب", "th.time": "الوقت", "th.where": "المكان", "th.items": "الأصناف", "th.status": "الحالة", "th.total": "الإجمالي",
    "where.table": "طاولة {n}",
    "chart.tip": "{amount} · {n} طلب",
    "chart.week": "رسم بياني بالأعمدة لمبيعات آخر 7 أيام",

    "rep.title": "التقارير · إدارة رواق",
    "rep.heading": "تقارير المبيعات",
    "rep.exportDays": "تصدير المبيعات اليومية CSV", "rep.exportOrders": "تصدير الطلبات CSV", "rep.print": "طباعة",
    "rep.quick": "فترة سريعة", "rep.last7": "آخر 7 أيام", "rep.last30": "آخر 30 يومًا", "rep.month": "هذا الشهر",
    "rep.from": "من", "rep.to": "إلى",
    "rep.totalSales": "إجمالي المبيعات", "rep.completed": "الطلبات المكتملة", "rep.cancelled": "الطلبات الملغاة",
    "rep.byDay": "المبيعات حسب اليوم", "rep.completedOnly": "الطلبات المكتملة فقط",
    "rep.daily": "التفصيل اليومي", "rep.total": "الإجمالي",
    "rep.topItems": "الأصناف الأكثر مبيعًا", "rep.noCompleted": "لا توجد طلبات مكتملة في هذه الفترة.",
    "th.date": "التاريخ", "th.orders": "الطلبات", "th.average": "المتوسط", "th.sales": "المبيعات",
    "th.item": "الصنف", "th.qty": "الكمية", "th.revenue": "الإيراد",
    "csv.date": "التاريخ", "csv.completed": "الطلبات المكتملة", "csv.sales": "المبيعات ({cur})", "csv.total": "الإجمالي",
    "csv.orderId": "رقم الطلب", "csv.time": "الوقت", "csv.type": "النوع", "csv.table": "الطاولة", "csv.status": "الحالة",
    "csv.payment": "الدفع", "csv.items": "الأصناف", "csv.totalCol": "الإجمالي ({cur})",
  },
};

/* ---------- Functions ---------- */

// Saved choice → otherwise the browser's language → otherwise English.
function getLang() {
  const saved = localStorage.getItem(LANG_KEY);
  if (saved === "ar" || saved === "en") return saved;
  return (navigator.language || "").toLowerCase().startsWith("ar") ? "ar" : "en";
}

// t("dash.sold", { n: 5 }) → "5 sold" / "5 قطعة"
function t(key, vars) {
  let text = I18N[getLang()][key];
  if (text === undefined) text = I18N.en[key];
  if (text === undefined) return key;
  if (vars) Object.keys(vars).forEach(k => (text = text.split("{" + k + "}").join(vars[k])));
  return text;
}

// Locale for dates and numbers. "-u-nu-latn" keeps digits as 0-9 in Arabic, as used in Libya.
function getLocale() {
  return getLang() === "ar" ? "ar-LY-u-nu-latn" : "en-GB";
}

// Put the right text into every element that has a data-i18n… attribute.
function applyLanguage() {
  const lang = getLang();
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

  document.querySelectorAll("[data-i18n]").forEach(el => (el.textContent = t(el.dataset.i18n)));
  document.querySelectorAll("[data-i18n-html]").forEach(el => (el.innerHTML = t(el.dataset.i18nHtml)));
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => (el.placeholder = t(el.dataset.i18nPlaceholder)));
  document.querySelectorAll("[data-i18n-aria]").forEach(el => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
  document.querySelectorAll("[data-lang-toggle]").forEach(btn => {
    btn.textContent = t("switchTo");
    btn.lang = lang === "ar" ? "en" : "ar";
  });
  const title = document.querySelector("title[data-i18n]");
  if (title) document.title = t(title.dataset.i18n);
}

// Change language, then tell the page so it can redraw tables and charts.
function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
  applyLanguage();
  document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
}

function toggleLang() {
  setLang(getLang() === "ar" ? "en" : "ar");
}

// Set direction immediately (before the page is drawn) to avoid a flash of the wrong layout.
document.documentElement.lang = getLang();
document.documentElement.dir = getLang() === "ar" ? "rtl" : "ltr";

document.addEventListener("DOMContentLoaded", () => {
  applyLanguage();
  document.querySelectorAll("[data-lang-toggle]").forEach(btn => btn.addEventListener("click", toggleLang));
});
