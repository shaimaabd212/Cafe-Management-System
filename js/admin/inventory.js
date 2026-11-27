Object.assign(I18N.en, {
  "inventory.title": "Inventory · Riwaq Admin",
  "inventory.heading": "Inventory",
  "inventory.sub": "Stock levels and low-stock alerts.",
  "inv.add": "+ Add stock item", "inv.all": "All stock", "inv.lowOnly": "Low / Out only",
  "inv.name": "Item", "inv.unit": "Unit", "inv.qty": "Quantity", "inv.min": "Min stock",
  "inv.ok": "In stock", "inv.low": "Low", "inv.out": "Out",
  "inv.restock": "+5", "inv.edit": "Edit", "inv.del": "Delete",
  "inv.cancel": "Cancel", "inv.save": "Save", "inv.saved": "Inventory saved."
});

Object.assign(I18N.ar, {
  "inventory.title": "المخزون · رواق",
  "inventory.heading": "المخزون",
  "inventory.sub": "متابعة كميات المخزون وتنبيهات انخفاض الكمية.",
  "inv.add": "+ إضافة مادة", "inv.all": "كل المواد", "inv.lowOnly": "المنخفض والمنتهي فقط",
  "inv.name": "المادة", "inv.unit": "الوحدة", "inv.qty": "الكمية", "inv.min": "الحد الأدنى",
  "inv.ok": "متوفر", "inv.low": "منخفض", "inv.out": "نافد",
  "inv.restock": "+5", "inv.edit": "تعديل", "inv.del": "حذف",
  "inv.cancel": "إلغاء", "inv.save": "حفظ", "inv.saved": "تم حفظ المخزون."
});

(() => {
  const DEFAULTS = [
    { id: 1, name: "Espresso Beans", unit: "kg", qty: 14, min: 5 },
    { id: 2, name: "Fresh Milk", unit: "L", qty: 4, min: 6 },
    { id: 3, name: "Matcha Powder", unit: "kg", qty: 0, min: 2 },
    { id: 4, name: "Cinnamon & Sugar Mix", unit: "kg", qty: 8, min: 3 }
  ];

  const getStock = () => {
    const cur = load("inventory", null);
    if (Array.isArray(cur)) return cur;
    save("inventory", DEFAULTS);
    return DEFAULTS;
  };

  const setStock = (items) => { save("inventory", items); showAlert(t("inv.saved")); render(); };
  const esc = (s) => String(s ?? "").replace(/[&<"]/g, c => ({ "&":"&amp;","<":"&lt;",'"':"&quot;" }[c]));

  const modal = document.getElementById("invModalBackdrop");
  const form = document.getElementById("invForm");
  modal?.classList.remove("open");
  modal?.setAttribute("aria-hidden", "true");

  function showAlert(msg) {
    const el = document.getElementById("invAlert");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
  }

  function openModal(item = null) {
    form.reset();
    document.getElementById("stockId").value = item?.id ?? "";
    document.getElementById("stockName").value = item?.name ?? "";
    document.getElementById("stockUnit").value = item?.unit ?? "kg";
    document.getElementById("stockQty").value = item?.qty ?? 0;
    document.getElementById("stockMin").value = item?.min ?? 5;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.getElementById("stockName").focus();
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  function render() {
    const q = (document.getElementById("invSearch")?.value || "").toLowerCase().trim();
    const onlyLow = document.getElementById("invFilter")?.value === "low";
    const list = getStock().filter(i => {
      const isLow = Number(i.qty) <= Number(i.min);
      return (!q || String(i.name).toLowerCase().includes(q)) && (!onlyLow || isLow);
    });

    document.getElementById("invTableWrap").innerHTML = `<table class="data"><thead><tr>
      <th>${esc(t("inv.name"))}</th><th>${esc(t("inv.unit"))}</th><th class="num">${esc(t("inv.qty"))}</th>
      <th class="num">${esc(t("inv.min"))}</th><th>Status</th><th></th></tr></thead><tbody>` +
      list.map(i => {
        const qty = Number(i.qty), min = Number(i.min);
        const state = qty <= 0 ? ["out", "badge-cancelled"] : qty <= min ? ["low", "badge-pending"] : ["ok", "badge-confirmed"];
        return `<tr>
          <td><strong>${esc(i.name)}</strong></td>
          <td>${esc(i.unit)}</td>
          <td class="num">${qty}</td>
          <td class="num">${min}</td>
          <td><span class="badge ${state[1]}">${esc(t("inv." + state[0]))}</span></td>
          <td><div class="row-actions">
            <button type="button" class="btn btn-outline btn-sm" data-act="add5" data-id="${i.id}">${esc(t("inv.restock"))}</button>
            <button type="button" class="btn btn-outline btn-sm" data-act="edit" data-id="${i.id}">${esc(t("inv.edit"))}</button>
            <button type="button" class="btn btn-danger btn-sm" data-act="del" data-id="${i.id}">${esc(t("inv.del"))}</button>
          </div></td></tr>`;
      }).join("") + `</tbody></table>`;
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const id = document.getElementById("stockId").value;
    const patch = {
      name: document.getElementById("stockName").value.trim(),
      unit: document.getElementById("stockUnit").value.trim(),
      qty: Number(document.getElementById("stockQty").value),
      min: Number(document.getElementById("stockMin").value)
    };
    if (!patch.name || !patch.unit || Number.isNaN(patch.qty) || patch.qty < 0) return;

    const list = getStock();
    if (id) Object.assign(list.find(x => String(x.id) === id) || {}, patch);
    else list.push({ id: list.reduce((a, b) => Math.max(a, +b.id || 0), 0) + 1, ...patch });

    closeModal();
    setStock(list);
  });

  document.getElementById("btnAddStock").onclick = () => openModal();
  document.getElementById("btnCancelInv").onclick = closeModal;
  modal.onclick = e => { if (e.target === modal) closeModal(); };
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
  document.getElementById("invSearch").oninput = render;
  document.getElementById("invFilter").onchange = render;

  document.getElementById("invTableWrap").onclick = e => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const list = getStock();
    const idx = list.findIndex(x => String(x.id) === btn.dataset.id);
    if (idx < 0) return;
    if (btn.dataset.act === "add5") { list[idx].qty = Number(list[idx].qty) + 5; setStock(list); }
    if (btn.dataset.act === "edit") openModal(list[idx]);
    if (btn.dataset.act === "del") { list.splice(idx, 1); setStock(list); }
  };

  document.addEventListener("langchange", render);
  window.addEventListener("storage", render);
  document.addEventListener("DOMContentLoaded", () => {
    closeModal();
    if (typeof guard === "function" && !guard(["manager"])) return;
    render();
  });
})();