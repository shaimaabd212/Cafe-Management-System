/* =========================================================
   kitchen.js — Live kitchen queue (Pending -> Preparing -> Ready)
   Owner: Shora (Module M2)
   Uses storage.js helpers: load("orders", []), save("orders", orders)
   ========================================================= */

Object.assign(I18N.en, {
  "kitchen.title": "Kitchen · Riwaq",
  "kitchen.heading": "Kitchen queue",
  "kitchen.sub": "Move each order from Pending to Preparing to Ready.",
  "kitchen.refresh": "Refresh",
  "kitchen.filterActive": "Active queue",
  "kitchen.filterPending": "Pending",
  "kitchen.filterPreparing": "Preparing",
  "kitchen.filterReady": "Ready",
  "kitchen.empty": "No kitchen orders in this view right now.",
  "kitchen.order": "Order",
  "kitchen.table": "Table",
  "kitchen.takeaway": "Takeaway",
  "kitchen.dineIn": "Dine-in",
  "kitchen.startPrep": "Start preparing",
  "kitchen.markReady": "Mark ready",
  "kitchen.doneNote": "Ready for pickup / serving",
  "status.pending": "Pending",
  "status.preparing": "Preparing",
  "status.ready": "Ready",
  "status.completed": "Completed",
  "status.cancelled": "Cancelled"
});

Object.assign(I18N.ar, {
  "kitchen.title": "المطبخ · رواق",
  "kitchen.heading": "قائمة طلبات المطبخ",
  "kitchen.sub": "انقل كل طلب من قيد الانتظار إلى قيد التحضير ثم جاهز.",
  "kitchen.refresh": "تحديث",
  "kitchen.filterActive": "الطلبات النشطة",
  "kitchen.filterPending": "قيد الانتظار",
  "kitchen.filterPreparing": "قيد التحضير",
  "kitchen.filterReady": "جاهز",
  "kitchen.empty": "لا توجد طلبات في هذا العرض حالياً.",
  "kitchen.order": "طلب",
  "kitchen.table": "طاولة",
  "kitchen.takeaway": "سفري",
  "kitchen.dineIn": "داخل المقهى",
  "kitchen.startPrep": "بدء التحضير",
  "kitchen.markReady": "تعليم كجاهز",
  "kitchen.doneNote": "جاهز للتقديم أو الاستلام",
  "status.pending": "قيد الانتظار",
  "status.preparing": "قيد التحضير",
  "status.ready": "جاهز",
  "status.completed": "مكتمل",
  "status.cancelled": "ملغي"
});

(function () {
  let currentFilter = "active";

  function readOrders() {
    if (typeof load === "function") return load("orders", []);
    try {
      return JSON.parse(localStorage.getItem("riwaq_orders")) || [];
    } catch {
      return [];
    }
  }

  function writeOrders(orders) {
    if (typeof save === "function") {
      save("orders", orders);
      return;
    }
    localStorage.setItem("riwaq_orders", JSON.stringify(orders));
  }

  function normalizeStatus(status) {
    return String(status || "pending").trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function badgeClass(status) {
    const map = {
      pending: "badge badge-pending",
      preparing: "badge badge-preparing",
      ready: "badge badge-ready",
      completed: "badge badge-completed",
      cancelled: "badge badge-cancelled"
    };
    return map[normalizeStatus(status)] || "badge badge-pending";
  }

  function nextAction(status) {
    const s = normalizeStatus(status);
    if (s === "pending") {
      return { nextStatus: "preparing", labelKey: "kitchen.startPrep", btnClass: "btn btn-sm btn-primary" };
    }
    if (s === "preparing") {
      return { nextStatus: "ready", labelKey: "kitchen.markReady", btnClass: "btn btn-sm btn-secondary" };
    }
    return null;
  }

  function formatTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function updateCounts(orders) {
    const counts = { pending: 0, preparing: 0, ready: 0 };
    orders.forEach((o) => {
      const s = normalizeStatus(o.status);
      if (s in counts) counts[s]++;
    });

    const pEl = document.getElementById("countPending");
    const prEl = document.getElementById("countPreparing");
    const rEl = document.getElementById("countReady");

    if (pEl) pEl.textContent = `${t("kitchen.filterPending")}: ${counts.pending}`;
    if (prEl) prEl.textContent = `${t("kitchen.filterPreparing")}: ${counts.preparing}`;
    if (rEl) rEl.textContent = `${t("kitchen.filterReady")}: ${counts.ready}`;
  }

  function renderCard(order) {
    const status = normalizeStatus(order.status);
    const id = order.id ?? order.orderId ?? "—";
    const orderType = String(order.orderType || order.type || "dine-in").toLowerCase();
    const typeLabel = orderType === "takeaway" ? t("kitchen.takeaway") : t("kitchen.dineIn");
    const tableVal = order.tableNumber ?? order.table;
    const tableInfo = tableVal ? ` · ${t("kitchen.table")} ${escapeHtml(tableVal)}` : "";
    const timeStr = formatTime(order.createdAt || order.date);

    const items = Array.isArray(order.items) ? order.items : [];
    const itemsHtml = items.length
      ? `<ul class="kitchen-items">${items.map((item) => {
          const name = escapeHtml(item.name || item.title || "Item");
          const qty = Number(item.qty ?? item.quantity ?? 1);
          const note = item.note ? ` <span class="muted">(${escapeHtml(item.note)})</span>` : "";
          return `<li><strong>${qty}×</strong> ${name}${note}</li>`;
        }).join("")}</ul>`
      : `<p class="muted">${escapeHtml(order.notes || "")}</p>`;

    const action = nextAction(status);
    const actionHtml = action
      ? `<button type="button" class="${action.btnClass}" data-action="advance" data-id="${escapeHtml(id)}" data-next="${action.nextStatus}">${t(action.labelKey)}</button>`
      : `<span class="muted">${t("kitchen.doneNote")}</span>`;

    return `
      <article class="card kitchen-card" data-status="${escapeHtml(status)}">
        <div class="kitchen-card-head">
          <div>
            <strong>${t("kitchen.order")} #${escapeHtml(id)}</strong>
            <div class="muted kitchen-meta">${escapeHtml(typeLabel)}${tableInfo}${timeStr ? ` · ${escapeHtml(timeStr)}` : ""}</div>
          </div>
          <span class="${badgeClass(status)}">${escapeHtml(t("status." + status))}</span>
        </div>
        ${itemsHtml}
        <div class="kitchen-card-foot">
          ${actionHtml}
        </div>
      </article>
    `;
  }

  function render() {
    const queueEl = document.getElementById("kitchenQueue");
    if (!queueEl) return;

    const orders = readOrders();
    updateCounts(orders);

    const visible = orders.filter((order) => {
      const s = normalizeStatus(order.status);
      if (currentFilter === "active") return s === "pending" || s === "preparing" || s === "ready";
      return s === currentFilter;
    });

    if (!visible.length) {
      queueEl.innerHTML = `
        <div class="card empty">
          <div class="kilim-strip"></div>
          <p>${t("kitchen.empty")}</p>
        </div>
      `;
      return;
    }

    queueEl.innerHTML = visible.map(renderCard).join("");
  }

  function bindEvents() {
    document.querySelectorAll(".kitchen-filters [data-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentFilter = btn.dataset.filter;
        document.querySelectorAll(".kitchen-filters [data-filter]").forEach((b) => {
          const active = b === btn;
          b.classList.toggle("active", active);
          b.classList.toggle("btn-primary", active);
          b.classList.toggle("btn-outline", !active);
        });
        render();
      });
    });

    const refreshBtn = document.getElementById("kitchenRefresh");
    if (refreshBtn) refreshBtn.addEventListener("click", render);

    const queueEl = document.getElementById("kitchenQueue");
    if (queueEl) {
      queueEl.addEventListener("click", (event) => {
        const btn = event.target.closest('[data-action="advance"]');
        if (!btn) return;

        const targetId = String(btn.dataset.id);
        const nextStatus = btn.dataset.next;
        const orders = readOrders();
        const order = orders.find((o) => String(o.id ?? o.orderId) === targetId);
        if (!order) return;

        order.status = nextStatus;
        writeOrders(orders);
        render();
      });
    }

    document.addEventListener("langchange", render);
    window.addEventListener("storage", render);
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (typeof guard === "function") {
      const user = guard(["barista"]);
      if (!user) return;
    }
    bindEvents();
    render();
  });
})();