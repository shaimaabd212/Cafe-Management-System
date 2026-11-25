/* =========================================================
   i18n.js — Arabic / English switch (i18n = "internationalization")
   Owner: Yasmina (M1 Administration) · can be used by ALL pages

   How it works:
   1. Every text in the HTML gets a key:   <h2 data-i18n="login.heading">Welcome back</h2>
   2. The dictionary below has that key in English and Arabic.
   3. applyLanguage() puts the right text in every element and sets
      <html lang="ar" dir="rtl">  so the page flows right-to-left.
   4. In JavaScript, use t("key") to get a translated string.
   5. The choice is saved in localStorage ("riwaq_lang").

   Load it in <head> (before the other scripts):
     <script src="js/shared/i18n.js"></script>
   Add a switch button anywhere:
     <button data-lang-toggle></button>
   ========================================================= */

const LANG_KEY = "riwaq_lang";

const I18N = {
  en: {
    "switchTo": "العربية",
    "currency": "LYD",
    "today": "Today",

    /* Roles & statuses */
    "role.manager": "Manager", "role.cashier": "Cashier", "role.barista": "Barista", "role.customer": "Customer",
    "status.Pending": "Pending", "status.Preparing": "Preparing", "status.Ready": "Ready",
    "status.Completed": "Completed", "status.Cancelled": "Cancelled",
    "type.dine-in": "Dine-in", "type.takeaway": "Takeaway",
    "paid.yes": "Yes", "paid.no": "No",

    /* Sidebar */
    "nav.overview": "Overview", "nav.dashboard": "Dashboard", "nav.reports": "Reports",
    "nav.manage": "Manage", "nav.users": "Users", "nav.menu": "Menu", "nav.inventory": "Inventory",
    "nav.operations": "Operations", "nav.orders": "Orders", "nav.kitchen": "Kitchen",
    "logout": "Log out",

    /* Shared layout (layout.js, Shaima): customer navbar + footer */
    "nav.main": "Main menu", "nav.home": "Home", "nav.cart": "Cart", "nav.myOrders": "My Orders",
    "nav.login": "Log in",
    "footer.tagline": "Riwaq Café · رواق — coffee under the arches",
    "footer.course": "Intro to Web · Project 3 · Group 2",
    "layout.soon": "This page is being built.",

    /* Page headings (new pages) */
    "menu.title": "Menu · Riwaq Café", "menu.eyebrow": "Our menu", "menu.heading": "Coffee under the arches",
    "menu.sub": "Order from your table or for takeaway. All prices are in Libyan dinar (LYD).",
    "menu.search": "Search the menu", "ph.menuSearch": "Latte, croissant, cookie…",
    "menu.categories": "Categories", "menu.items": "Menu items", "menu.all": "All",
    "cat.cold": "Cold drinks", "cat.hot": "Hot drinks", "cat.bakery": "Bakery", "cat.cookies": "Cookies", "cat.rolls": "Cinnamon rolls",
    "menu.add": "Add", "menu.addAria": "Add {name} to cart", "menu.addOne": "Add one more {name}", "menu.removeOne": "Remove one {name}",
    "menu.soldOut": "Sold out", "menu.unavailable": "Unavailable",
    "menu.noResults": "Nothing matches “{q}”", "menu.noResultsHint": "Try another word, or pick a different category.",
    "menu.emptyCat": "No items here yet",
    "order.title": "Your order", "order.items": "{n} items", "order.total": "Total",
    "order.empty": "Your cart is empty. Add something from the menu to start an order.",
    "order.goCart": "Go to cart", "order.goCartTotal": "Go to cart · {total}",
    "order.note": "You choose dine-in (with your table number) or takeaway on the next step.",
    "cart.title": "Cart · Riwaq Café", "cart.heading": "Your cart",
    "cart.sub": "Check your order, choose dine-in or takeaway, then place it.",
    "cart.itemsLabel": "Items in your cart", "cart.continue": "← Continue shopping",
    "cart.each": "{price} each", "cart.remove": "Remove",
    "cart.unavailable": "No longer available", "cart.removeUnavailable": "Some items are no longer available. Please remove them to continue.",
    "cart.checkout": "Checkout", "cart.howLegend": "How would you like it?",
    "cart.dineHint": "We bring it to your table", "cart.takeHint": "Pick it up at the counter",
    "cart.table": "Table number", "cart.tableHint": "You'll find it on the card on your table.",
    "cart.tableError": "Enter your table number (1–50).",
    "cart.note": "Note for the barista", "ph.note": "Less sugar, oat milk…",
    "cart.place": "Place order", "cart.payNote": "You pay at the counter when your order is ready.",
    "cart.emptyTitle": "Your cart is empty", "cart.emptyText": "Browse the menu and add a drink or something sweet to start an order.",
    "cart.browse": "Browse the menu", "cart.myOrders": "My orders",
    "cart.doneTitle": "Thank you — your order is in!", "cart.orderNo": "Order #{id}",
    "cart.doneText": "The kitchen has your order. Follow it from Pending to Ready on My Orders.",
    "cart.track": "Track my order", "cart.backMenu": "Back to the menu",
    "myOrders.title": "My Orders · Riwaq Café", "myOrders.heading": "My Orders",
    "myOrders.welcome": "Welcome back, {name}. Track your orders here — the status updates as the kitchen works.",
    "myOrders.filter": "Filter orders", "myOrders.active": "Active",
    "myOrders.table": "Table {n}", "myOrders.note": "Note: {note}",
    "myOrders.cancel": "Cancel order", "myOrders.again": "Order again", "myOrders.none": "No orders here yet.",
    "time.now": "just now", "time.min": "{n} min ago", "time.hours": "{n} h ago",
    "orders.title": "Orders · Riwaq", "orders.heading": "Orders",
    "orders.sub": "Confirm new orders, then take the payment and print the bill when they are ready.",
    "orders.new": "New walk-in order",
    "bill.title": "Bill · Riwaq", "bill.heading": "Bill & payment",
    "bill.sub": "Take the payment and print the receipt.",
    "bill.back": "← Back to orders",

    /* Cashier: orders + bill (Shaima, M3) */
    "cash.filter": "Show orders", "cash.fNew": "New", "cash.fKitchen": "In the kitchen", "cash.fReady": "Ready", "cash.fDone": "Done",
    "cash.walkIn": "Walk-in customer", "cash.newTag": "New", "cash.notePrefix": "Note:",
    "cash.confirm": "Confirm order", "cash.cancel": "Cancel", "cash.payBill": "Payment & bill", "cash.bill": "Bill",
    "cash.handOver": "Hand over", "cash.printBill": "Print the bill again",
    "cash.cancelAsk": "Cancel order #{id}? This can't be undone.",
    "cash.none": "No orders here.",
    "cash.tConfirmed": "Order #{id} confirmed and sent to the kitchen.", "cash.tCancelled": "Order #{id} cancelled.",
    "cash.tDone": "Order #{id} handed over.", "cash.tCreated": "Walk-in order #{id} sent to the kitchen.",
    "walk.title": "New walk-in order", "walk.name": "Customer name", "ph.walkName": "Walk-in customer",
    "walk.items": "Items", "ph.itemSearch": "Find an item…", "walk.noItems": "Add at least one item.",
    "walk.create": "Send to the kitchen", "walk.close": "Close", "walk.empty": "No items found.",
    "bill.choose": "Choose an order", "bill.chooseSub": "Orders that are not paid yet.",
    "bill.open": "Open bill", "bill.noneOpen": "Every order is paid.", "bill.notFound": "Order #{id} was not found.",
    "rc.cafe": "Riwaq Café", "rc.order": "Order", "rc.date": "Date", "rc.customer": "Customer", "rc.cashier": "Cashier",
    "rc.type": "Order type", "rc.price": "Price", "rc.total": "Total", "rc.method": "Paid by",
    "rc.received": "Cash received", "rc.change": "Change", "rc.unpaid": "Not paid yet", "rc.paid": "Paid",
    "rc.cancelled": "Cancelled", "rc.thanks": "Thank you for visiting Riwaq!",
    "pay.title": "Payment", "pay.due": "Amount due", "pay.method": "Payment method",
    "pay.cash": "Cash", "pay.card": "Card", "pay.cashHint": "Count the cash", "pay.cardHint": "Card machine",
    "pay.received": "Cash received", "pay.exact": "Exact", "pay.change": "Change to give",
    "pay.short": "That is less than the total ({total}).",
    "pay.confirm": "Confirm payment & print", "pay.print": "Print bill",
    "pay.doneText": "Paid ({method}) · {time}.", "pay.cancelledText": "This order was cancelled, so it can't be paid.",
    "pay.tPaid": "Order #{id} is paid.",
    "kitchen.title": "Kitchen · Riwaq", "kitchen.heading": "Kitchen queue",
    "kitchen.sub": "Move each order from Pending to Preparing to Ready.",
    "menuAdmin.title": "Menu · Riwaq Admin", "menuAdmin.heading": "Menu items",
    "menuAdmin.sub": "Add, edit and hide items and categories.",
    "menuAdmin.add": "Add item",
    "inventory.title": "Inventory · Riwaq Admin", "inventory.heading": "Inventory",
    "inventory.sub": "Stock levels and low-stock alerts.",

    /* Brand panel */
    "brand.tagline": "Coffee under <span>the arches</span>",
    "brand.text": "Riwaq is the shaded arcade where people pause, sit, and talk — a place of welcome, connection, and timeless hospitality.",
    "back": "← Back to home",

    /* Fields */
    "field.email": "E-mail", "field.password": "Password", "field.fullName": "Full name",
    "field.phone": "Phone", "field.optional": "(optional)", "field.confirm": "Confirm password",
    "field.role": "Role",
    "ph.name": "Your full name", "ph.email": "your@email.com", "ph.phone": "09XXXXXXXX", "ph.password6": "6+ characters",

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
    "err.phone": "Enter a Libyan mobile number (09XXXXXXXX).",
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
    "dash.addSample": "Add sample orders",
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
    "csv.payment": "Paid", "csv.items": "Items", "csv.totalCol": "Total ({cur})",
  },

  ar: {
    "switchTo": "English",
    "currency": "د.ل",
    "today": "اليوم",

    "role.manager": "مدير", "role.cashier": "كاشير", "role.barista": "باريستا", "role.customer": "زبون",
    "status.Pending": "قيد الانتظار", "status.Preparing": "قيد التحضير", "status.Ready": "جاهز",
    "status.Completed": "مكتمل", "status.Cancelled": "ملغى",
    "type.dine-in": "داخل المقهى", "type.takeaway": "عالماشي",
    "paid.yes": "نعم", "paid.no": "لا",

    "nav.overview": "نظرة عامة", "nav.dashboard": "لوحة التحكم", "nav.reports": "التقارير",
    "nav.manage": "الإدارة", "nav.users": "المستخدمون", "nav.menu": "قائمة الطعام", "nav.inventory": "المخزون",
    "nav.operations": "التشغيل", "nav.orders": "الطلبات", "nav.kitchen": "المطبخ",
    "logout": "تسجيل الخروج",

    "nav.main": "القائمة الرئيسية", "nav.home": "الرئيسية", "nav.cart": "السلة", "nav.myOrders": "طلباتي",
    "nav.login": "تسجيل الدخول",
    "footer.tagline": "مقهى رواق — قهوة تحت الأقواس",
    "footer.course": "مقدمة في الويب · المشروع 3 · المجموعة 2",
    "layout.soon": "هذه الصفحة قيد الإنشاء.",

    "menu.title": "القائمة · مقهى رواق", "menu.eyebrow": "قائمتنا", "menu.heading": "قهوة تحت الأقواس",
    "menu.sub": "اطلب من طاولتك أو سفري. جميع الأسعار بالدينار الليبي (د.ل).",
    "menu.search": "ابحث في القائمة", "ph.menuSearch": "لاتيه، كرواسون، كوكيز…",
    "menu.categories": "الفئات", "menu.items": "أصناف القائمة", "menu.all": "الكل",
    "cat.cold": "مشروبات باردة", "cat.hot": "مشروبات ساخنة", "cat.bakery": "المخبوزات", "cat.cookies": "الكوكيز", "cat.rolls": "لفائف القرفة",
    "menu.add": "أضف", "menu.addAria": "أضف {name} إلى السلة", "menu.addOne": "أضف {name} آخر", "menu.removeOne": "أزل {name} واحد",
    "menu.soldOut": "نفد", "menu.unavailable": "غير متوفر",
    "menu.noResults": "لا توجد نتائج لـ «{q}»", "menu.noResultsHint": "جرّب كلمة أخرى، أو اختر فئة مختلفة.",
    "menu.emptyCat": "لا توجد أصناف هنا بعد",
    "order.title": "طلبك", "order.items": "{n} أصناف", "order.total": "المجموع",
    "order.empty": "سلتك فارغة. أضف شيئاً من القائمة لتبدأ طلبك.",
    "order.goCart": "اذهب إلى السلة", "order.goCartTotal": "اذهب إلى السلة · {total}",
    "order.note": "تختار في الخطوة التالية داخل المقهى (مع رقم طاولتك) أو سفري.",
    "cart.title": "السلة · مقهى رواق", "cart.heading":"سلتي",
    "cart.sub": "راجع طلبك، واختر داخل المقهى أو سفري، ثم أرسله.",
    "cart.itemsLabel": "الأصناف في سلتك", "cart.continue": "→ متابعة التسوق",
    "cart.each": "{price} للواحد", "cart.remove": "إزالة",
    "cart.unavailable": "لم يعد متوفراً", "cart.removeUnavailable": "بعض الأصناف لم تعد متوفرة. يرجى إزالتها للمتابعة.",
    "cart.checkout": "إتمام الطلب", "cart.howLegend": "كيف تريد طلبك؟",
    "cart.dineHint": "نحضره إلى طاولتك", "cart.takeHint": "استلمه من الكاونتر",
    "cart.table": "رقم الطاولة", "cart.tableHint": "تجده على البطاقة الموجودة على طاولتك.",
    "cart.tableError": "أدخل رقم طاولتك (من 1 إلى 50).",
    "cart.note": "ملاحظة للباريستا", "ph.note": "سكر أقل، حليب الشوفان…",
    "cart.place": "أرسل الطلب", "cart.payNote": "تدفع عند الكاونتر عندما يصبح طلبك جاهزاً.",
    "cart.emptyTitle": "سلتك فارغة", "cart.emptyText": "تصفّح القائمة وأضف مشروباً أو شيئاً حلواً لتبدأ طلبك.",
    "cart.browse": "تصفّح القائمة", "cart.myOrders": "طلباتي",
    "cart.doneTitle": "شكراً لك — وصلنا طلبك!", "cart.orderNo": "الطلب رقم {id}",
    "cart.doneText": "طلبك الآن في المطبخ. تابعه من قيد الانتظار حتى جاهز في صفحة طلباتي.",
    "cart.track": "تابع طلبي", "cart.backMenu": "العودة إلى القائمة",
    "myOrders.title": "طلباتي · مقهى رواق", "myOrders.heading": "طلباتي",
    "myOrders.welcome": "مرحباً بعودتك يا {name}. تابع طلباتك هنا — تتحدث الحالة أثناء عمل المطبخ.",
    "myOrders.filter": "تصفية الطلبات", "myOrders.active": "النشطة",
    "myOrders.table": "طاولة {n}", "myOrders.note": "ملاحظة: {note}",
    "myOrders.cancel": "إلغاء الطلب", "myOrders.again": "اطلب مرة أخرى", "myOrders.none": "لا توجد طلبات هنا بعد.",
    "time.now": "الآن", "time.min": "منذ {n} دقيقة", "time.hours": "منذ {n} ساعة",
    "orders.title": "الطلبات · رواق", "orders.heading": "الطلبات",
    "orders.sub": "أكّد الطلبات الجديدة، ثم استلم المبلغ واطبع الفاتورة عندما تجهز.",
    "orders.new": "طلب جديد",
    "bill.title": "الفاتورة · رواق", "bill.heading": "الفاتورة والدفع",
    "bill.sub": "استلم المبلغ واطبع الإيصال.",
    "bill.back": "→ العودة إلى الطلبات",

    /* الكاشير: الطلبات + الفاتورة (شيماء، M3) */
    "cash.filter": "عرض الطلبات", "cash.fNew": "جديدة", "cash.fKitchen": "في المطبخ", "cash.fReady": "جاهزة", "cash.fDone": "منتهية",
    "cash.walkIn": "زبون حاضر", "cash.newTag": "جديد", "cash.notePrefix": "ملاحظة:",
    "cash.confirm": "تأكيد الطلب", "cash.cancel": "إلغاء", "cash.payBill": "الدفع والفاتورة", "cash.bill": "الفاتورة",
    "cash.handOver": "تسليم الطلب", "cash.printBill": "اطبع الفاتورة مرة أخرى",
    "cash.cancelAsk": "إلغاء الطلب رقم {id}؟ لا يمكن التراجع عن ذلك.",
    "cash.none": "لا توجد طلبات هنا.",
    "cash.tConfirmed": "تم تأكيد الطلب رقم {id} وإرساله إلى المطبخ.", "cash.tCancelled": "تم إلغاء الطلب رقم {id}.",
    "cash.tDone": "تم تسليم الطلب رقم {id}.", "cash.tCreated": "أُرسل الطلب رقم {id} إلى المطبخ.",
    "walk.title": "طلب جديد لزبون حاضر", "walk.name": "اسم الزبون", "ph.walkName": "زبون حاضر",
    "walk.items": "الأصناف", "ph.itemSearch": "ابحث عن صنف…", "walk.noItems": "أضف صنفاً واحداً على الأقل.",
    "walk.create": "أرسل إلى المطبخ", "walk.close": "إغلاق", "walk.empty": "لا توجد أصناف.",
    "bill.choose": "اختر طلباً", "bill.chooseSub": "الطلبات التي لم تُدفع بعد.",
    "bill.open": "افتح الفاتورة", "bill.noneOpen": "كل الطلبات مدفوعة.", "bill.notFound": "لم يُعثر على الطلب رقم {id}.",
    "rc.cafe": "مقهى رواق", "rc.order": "الطلب", "rc.date": "التاريخ", "rc.customer": "الزبون", "rc.cashier": "الكاشير",
    "rc.type": "نوع الطلب", "rc.price": "السعر", "rc.total": "الإجمالي", "rc.method": "طريقة الدفع",
    "rc.received": "المبلغ المستلم", "rc.change": "الباقي", "rc.unpaid": "لم يُدفع بعد", "rc.paid": "مدفوع",
    "rc.cancelled": "ملغى", "rc.thanks": "شكراً لزيارتكم رواق!",
    "pay.title": "الدفع", "pay.due": "المبلغ المطلوب", "pay.method": "طريقة الدفع",
    "pay.cash": "نقداً", "pay.card": "بطاقة", "pay.cashHint": "عُدّ المبلغ", "pay.cardHint": "جهاز البطاقات",
    "pay.received": "المبلغ المستلم", "pay.exact": "المبلغ بالضبط", "pay.change": "الباقي للزبون",
    "pay.short": "المبلغ أقل من الإجمالي ({total}).",
    "pay.confirm": "تأكيد الدفع والطباعة", "pay.print": "اطبع الفاتورة",
    "pay.doneText": "مدفوع ({method}) · {time}.", "pay.cancelledText": "هذا الطلب ملغى، لذلك لا يمكن دفعه.",
    "pay.tPaid": "تم دفع الطلب رقم {id}.",
    "kitchen.title": "المطبخ · رواق", "kitchen.heading": "طابور المطبخ",
    "kitchen.sub": "انقل كل طلب من قيد الانتظار إلى قيد التحضير ثم جاهز.",
    "menuAdmin.title": "القائمة · إدارة رواق", "menuAdmin.heading": "أصناف القائمة",
    "menuAdmin.sub": "أضف الأصناف والفئات وعدّلها وأخفِها.",
    "menuAdmin.add": "إضافة صنف",
    "inventory.title": "المخزون · إدارة رواق", "inventory.heading": "المخزون",
    "inventory.sub": "مستويات المخزون وتنبيهات النقص.",

    "brand.tagline": "قهوة <span>تحت الأقواس</span>",
    "brand.text": "رواق هو الممر المظلّل الذي يحيط بالمكان، حيث يتوقف الناس للجلوس والحديث. إنه مساحة ترحيب وتواصل وكرم ضيافة دائم.",
    "back": "→ العودة إلى الرئيسية",

    "field.email": "البريد الإلكتروني", "field.password": "كلمة المرور", "field.fullName": "الاسم الكامل",
    "field.phone": "رقم الهاتف", "field.optional": "(اختياري)", "field.confirm": "تأكيد كلمة المرور",
    "field.role": "الدور",
    "ph.name": "اسمك الكامل", "ph.email": "your@email.com", "ph.phone": "09XXXXXXXX", "ph.password6": "6 أحرف أو أكثر",

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
    "err.phone": "أدخل رقم هاتف ليبيًا بالشكل 09XXXXXXXX.",
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
    "dash.addSample": "إضافة طلبات تجريبية",
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
    "csv.payment": "مدفوع", "csv.items": "الأصناف", "csv.totalCol": "الإجمالي ({cur})",
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
