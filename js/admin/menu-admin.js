/* =========================================================
   menu-admin.js — Menu items & categories CRUD + sold-out toggle
   Owner: Shora (Module M2)
   Uses storage.js helpers: load("menu", []), save("menu", menu)
   ========================================================= */

Object.assign(I18N.en, {
  "menuAdmin.title": "Menu Admin · Riwaq",
  "menuAdmin.heading": "Menu management",
  "menuAdmin.sub": "Add, edit, or remove menu items and categories, and toggle availability.",
  "menuAdmin.addItem": "+ Add menu item",
  "menuAdmin.searchLabel": "Search",
  "menuAdmin.searchPlaceholder": "Search by item name...",
  "menuAdmin.categoryLabel": "Category",
  "menuAdmin.allCategories": "All categories",
  "menuAdmin.statusLabel": "Availability",
  "menuAdmin.allStatus": "All items",
  "menuAdmin.available": "Available",
  "menuAdmin.soldOut": "Sold out",
  "menuAdmin.listTitle": "Menu items",
  "menuAdmin.modalAdd": "Add menu item",
  "menuAdmin.modalEdit": "Edit menu item",
  "menuAdmin.fieldName": "Item name",
  "menuAdmin.fieldCategory": "Category",
  "menuAdmin.fieldPrice": "Price (LYD)",
  "menuAdmin.fieldImageUrl": "Image path or URL",
  "menuAdmin.fieldImageFile": "Or upload image",
  "menuAdmin.imageHint": "Supports image URL/path or local file preview.",
  "menuAdmin.noPreview": "No image selected",
  "menuAdmin.removePhoto": "Remove photo",
  "menuAdmin.fieldAvailable": "Availability",
  "menuAdmin.cancel": "Cancel",
  "menuAdmin.save": "Save item",
  "menuAdmin.colItem": "Item",
  "menuAdmin.colCategory": "Category",
  "menuAdmin.colPrice": "Price",
  "menuAdmin.colStatus": "Status",
  "menuAdmin.colActions": "Actions",
  "menuAdmin.toggleSoldOut": "Mark sold out",
  "menuAdmin.toggleAvailable": "Mark available",
  "menuAdmin.edit": "Edit",
  "menuAdmin.delete": "Delete",
  "menuAdmin.confirmDelete": "Delete this menu item?",
  "menuAdmin.empty": "No menu items match your current filter.",
  "menuAdmin.errName": "Please enter an item name.",
  "menuAdmin.errCategory": "Please enter or choose a category.",
  "menuAdmin.errPrice": "Please enter a valid price of 0 or more.",
  "menuAdmin.errStorage": "Could not save changes. Try a smaller image or an image path.",
  "menuAdmin.saved": "Menu item saved.",
  "menuAdmin.deleted": "Menu item removed.",
  "menuAdmin.toggled": "Availability updated."
});

Object.assign(I18N.ar, {
  "menuAdmin.title": "إدارة القائمة · رواق",
  "menuAdmin.heading": "إدارة القائمة",
  "menuAdmin.sub": "إضافة وتعديل وحذف أصناف القائمة والفئات، وتبديل حالة التوفر.",
  "menuAdmin.addItem": "+ إضافة صنف",
  "menuAdmin.searchLabel": "بحث",
  "menuAdmin.searchPlaceholder": "ابحث باسم الصنف...",
  "menuAdmin.categoryLabel": "الفئة",
  "menuAdmin.allCategories": "كل الفئات",
  "menuAdmin.statusLabel": "التوفر",
  "menuAdmin.allStatus": "كل الأصناف",
  "menuAdmin.available": "متوفر",
  "menuAdmin.soldOut": "نفد",
  "menuAdmin.listTitle": "أصناف القائمة",
  "menuAdmin.modalAdd": "إضافة صنف جديد",
  "menuAdmin.modalEdit": "تعديل الصنف",
  "menuAdmin.fieldName": "اسم الصنف",
  "menuAdmin.fieldCategory": "الفئة",
  "menuAdmin.fieldPrice": "السعر (د.ل)",
  "menuAdmin.fieldImageUrl": "مسار أو رابط الصورة",
  "menuAdmin.fieldImageFile": "أو رفع صورة",
  "menuAdmin.imageHint": "يدعم رابط/مسار صورة أو معاينة ملف محلي.",
  "menuAdmin.noPreview": "لا توجد صورة محددة",
  "menuAdmin.removePhoto": "حذف الصورة",
  "menuAdmin.fieldAvailable": "التوفر",
  "menuAdmin.cancel": "إلغاء",
  "menuAdmin.save": "حفظ الصنف",
  "menuAdmin.colItem": "الصنف",
  "menuAdmin.colCategory": "الفئة",
  "menuAdmin.colPrice": "السعر",
  "menuAdmin.colStatus": "الحالة",
  "menuAdmin.colActions": "الإجراءات",
  "menuAdmin.toggleSoldOut": "تعليم كنفد",
  "menuAdmin.toggleAvailable": "تعليم كمتوفر",
  "menuAdmin.edit": "تعديل",
  "menuAdmin.delete": "حذف",
  "menuAdmin.confirmDelete": "هل تريد حذف هذا الصنف من القائمة؟",
  "menuAdmin.empty": "لا توجد أصناف مطابقة للتصفية الحالية.",
  "menuAdmin.errName": "يرجى إدخال اسم الصنف.",
  "menuAdmin.errCategory": "يرجى إدخال أو اختيار فئة.",
  "menuAdmin.errPrice": "يرجى إدخال سعر صحيح (0 أو أكثر).",
  "menuAdmin.errStorage": "تعذر حفظ التغييرات. جرّب صورة أصغر أو مسار صورة.",
  "menuAdmin.saved": "تم حفظ الصنف.",
  "menuAdmin.deleted": "تم حذف الصنف.",
  "menuAdmin.toggled": "تم تحديث حالة التوفر."
});

(function () {
  let uploadedDataUrl = "";
  let photoCleared = false;

  function readMenu() {
    if (typeof load === "function") return load("menu", []);
    try {
      return JSON.parse(localStorage.getItem("riwaq_menu")) || [];
    } catch {
      return [];
    }
  }

  function writeMenu(items) {
    try {
      if (typeof save === "function") {
        save("menu", items);
        return true;
      }
      localStorage.setItem("riwaq_menu", JSON.stringify(items));
      return true;
    } catch {
      showNotice(t("menuAdmin.errStorage"), "error");
      return false;
    }
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function isAvailable(item) {
    if (typeof item.available === "boolean") return item.available;
    if (typeof item.soldOut === "boolean") return !item.soldOut;
    return String(item.status || "available").toLowerCase() !== "soldout";
  }

  function resolveImgSrc(src) {
    if (!src) return "";
    if (src.startsWith("data:") || src.startsWith("http") || src.startsWith("../") || src.startsWith("/")) {
      return src;
    }
    return "../" + src.replace(/^\.?\//, "");
  }

  function showNotice(msg, type = "success") {
    const box = document.getElementById("menuAlert");
    if (!box) return;
    box.textContent = msg;
    box.className = "alert" + (type === "success" ? " success" : "");
    box.hidden = false;
  }

  function ensureClearPhotoBtn() {
    const img = document.getElementById("imagePreview");
    if (!img || !img.parentElement) return null;
    img.parentElement.style.position = "relative";

    let btn = document.getElementById("btnClearPhoto");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.id = "btnClearPhoto";
      btn.textContent = "✕";
      btn.style.cssText =
        "position:absolute;top:6px;inset-inline-end:6px;width:24px;height:24px;border-radius:999px;" +
        "border:none;background:rgba(0,0,0,.72);color:#fff;font-size:13px;line-height:1;cursor:pointer;";
      btn.addEventListener("click", clearPhoto);
      img.parentElement.appendChild(btn);
    }
    btn.title = t("menuAdmin.removePhoto");
    btn.setAttribute("aria-label", t("menuAdmin.removePhoto"));
    return btn;
  }

  function clearPhoto() {
    uploadedDataUrl = "";
    photoCleared = true;
    const fileInput = document.getElementById("itemImageFile");
    const urlInput = document.getElementById("itemImageUrl");
    if (fileInput) fileInput.value = "";
    if (urlInput) urlInput.value = "";
    updatePreview("");
  }

  function updatePreview(src) {
    const img = document.getElementById("imagePreview");
    const placeholder = document.getElementById("imagePreviewPlaceholder");
    const clearBtn = ensureClearPhotoBtn();
    if (!img) return;

    const resolved = resolveImgSrc(src);
    if (resolved) {
      img.src = resolved;
      img.hidden = false;
      if (placeholder) placeholder.hidden = true;
      if (clearBtn) clearBtn.hidden = false;
    } else {
      img.removeAttribute("src");
      img.hidden = true;
      if (placeholder) placeholder.hidden = false;
      if (clearBtn) clearBtn.hidden = true;
    }
  }

  function compressImage(file, maxSize = 480, quality = 0.72) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const im = new Image();
        im.onload = () => {
          const scale = Math.min(1, maxSize / Math.max(im.width, im.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(im.width * scale));
          canvas.height = Math.max(1, Math.round(im.height * scale));
          canvas.getContext("2d").drawImage(im, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        im.onerror = reject;
        im.src = String(reader.result || "");
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function openModal(item = null) {
    const backdrop = document.getElementById("menuModalBackdrop");
    const title = document.getElementById("menuModalTitle");
    const form = document.getElementById("menuItemForm");
    if (!backdrop || !form) return;

    form.reset();
    form.querySelectorAll(".field.invalid").forEach((f) => f.classList.remove("invalid"));
    form.querySelectorAll(".field .error").forEach((e) => (e.textContent = ""));
    uploadedDataUrl = "";
    photoCleared = false;

    if (item) {
      title.textContent = t("menuAdmin.modalEdit");
      document.getElementById("itemId").value = item.id ?? "";
      document.getElementById("itemName").value = item.name || "";
      document.getElementById("itemCategory").value = item.category || "";
      document.getElementById("itemPrice").value = item.price ?? "";
      const imgVal = item.image || "";
      document.getElementById("itemImageUrl").value = imgVal.startsWith("data:") ? "" : imgVal;
      if (imgVal.startsWith("data:")) uploadedDataUrl = imgVal;
      document.getElementById("itemAvailable").value = String(isAvailable(item));
      updatePreview(imgVal);
    } else {
      title.textContent = t("menuAdmin.modalAdd");
      document.getElementById("itemId").value = "";
      document.getElementById("itemAvailable").value = "true";
      updatePreview("");
    }

    backdrop.classList.add("open");
    backdrop.setAttribute("aria-hidden", "false");
    document.getElementById("itemName").focus();
  }

  function closeModal() {
    const backdrop = document.getElementById("menuModalBackdrop");
    if (!backdrop) return;
    backdrop.classList.remove("open");
    backdrop.setAttribute("aria-hidden", "true");
  }

  function syncCategoryOptions(menu) {
    const select = document.getElementById("categoryFilter");
    const datalist = document.getElementById("categorySuggestions");
    if (!select) return;

    const currentVal = select.value;
    const categories = Array.from(
      new Set(menu.map((m) => (m.category || "").trim()).filter(Boolean))
    );

    select.innerHTML = `<option value="all">${escapeHtml(t("menuAdmin.allCategories"))}</option>` +
      categories.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
    select.value = categories.includes(currentVal) ? currentVal : "all";

    if (datalist) {
      const defaults = ["Cold drinks", "Hot drinks", "Bakery", "Cookies", "Cinnamon rolls"];
      const allCats = Array.from(new Set([...defaults, ...categories]));
      datalist.innerHTML = allCats.map((c) => `<option value="${escapeHtml(c)}">`).join("");
    }
  }

  function render() {
    const menu = readMenu();
    syncCategoryOptions(menu);

    const searchTerm = (document.getElementById("menuSearch")?.value || "").trim().toLowerCase();
    const catFilter = document.getElementById("categoryFilter")?.value || "all";
    const availFilter = document.getElementById("availabilityFilter")?.value || "all";

    const filtered = menu.filter((item) => {
      const nameMatch = !searchTerm || String(item.name || "").toLowerCase().includes(searchTerm);
      const catMatch = catFilter === "all" || (item.category || "") === catFilter;
      const itemAvail = isAvailable(item);
      const statusMatch =
        availFilter === "all" ||
        (availFilter === "available" && itemAvail) ||
        (availFilter === "soldout" && !itemAvail);
      return nameMatch && catMatch && statusMatch;
    });

    const countEl = document.getElementById("menuCount");
    if (countEl) countEl.textContent = `${filtered.length} / ${menu.length}`;

    const wrap = document.getElementById("menuTableWrap");
    if (!wrap) return;

    if (!filtered.length) {
      wrap.innerHTML = `
        <div class="empty">
          <div class="kilim-strip"></div>
          <p>${escapeHtml(t("menuAdmin.empty"))}</p>
        </div>
      `;
      return;
    }

    const rows = filtered.map((item) => {
      const avail = isAvailable(item);
      const imgSrc = resolveImgSrc(item.image);
      const thumb = imgSrc
        ? `<img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(item.name)}" class="menu-thumb">`
        : `<span class="menu-thumb menu-thumb-empty">☕</span>`;
      const badge = avail
        ? `<span class="badge badge-confirmed">${escapeHtml(t("menuAdmin.available"))}</span>`
        : `<span class="badge badge-cancelled">${escapeHtml(t("menuAdmin.soldOut"))}</span>`;
      const toggleLabel = avail ? t("menuAdmin.toggleSoldOut") : t("menuAdmin.toggleAvailable");

      return `
        <tr>
          <td>
            <div class="menu-item-cell">
              ${thumb}
              <strong>${escapeHtml(item.name)}</strong>
            </div>
          </td>
          <td>${escapeHtml(item.category || "—")}</td>
          <td class="num">${Number(item.price || 0).toFixed(2)}</td>
          <td>${badge}</td>
          <td>
            <div class="row-actions">
              <button type="button" class="btn btn-outline btn-sm" data-action="toggle" data-id="${escapeHtml(item.id)}">${escapeHtml(toggleLabel)}</button>
              <button type="button" class="btn btn-outline btn-sm" data-action="edit" data-id="${escapeHtml(item.id)}">${escapeHtml(t("menuAdmin.edit"))}</button>
              <button type="button" class="btn btn-danger btn-sm" data-action="delete" data-id="${escapeHtml(item.id)}">${escapeHtml(t("menuAdmin.delete"))}</button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    wrap.innerHTML = `
      <table class="data">
        <thead>
          <tr>
            <th>${escapeHtml(t("menuAdmin.colItem"))}</th>
            <th>${escapeHtml(t("menuAdmin.colCategory"))}</th>
            <th class="num">${escapeHtml(t("menuAdmin.colPrice"))}</th>
            <th>${escapeHtml(t("menuAdmin.colStatus"))}</th>
            <th>${escapeHtml(t("menuAdmin.colActions"))}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const nameInput = document.getElementById("itemName");
    const catInput = document.getElementById("itemCategory");
    const priceInput = document.getElementById("itemPrice");
    const imgUrlInput = document.getElementById("itemImageUrl");
    const availSelect = document.getElementById("itemAvailable");
    const idVal = document.getElementById("itemId").value;

    let valid = true;
    const setErr = (el, msg) => {
      const field = el.closest(".field");
      field.classList.toggle("invalid", Boolean(msg));
      const errBox = field.querySelector(".error");
      if (errBox) errBox.textContent = msg || "";
      if (msg) valid = false;
    };

    setErr(nameInput, nameInput.value.trim() ? "" : t("menuAdmin.errName"));
    setErr(catInput, catInput.value.trim() ? "" : t("menuAdmin.errCategory"));

    const priceNum = Number(priceInput.value);
    setErr(priceInput, priceInput.value === "" || Number.isNaN(priceNum) || priceNum < 0 ? t("menuAdmin.errPrice") : "");

    if (!valid) return;

    const menu = readMenu();
    const typedUrl = imgUrlInput.value.trim();
    const existingItem = idVal ? menu.find((m) => String(m.id) === String(idVal)) : null;
    const chosenImage = typedUrl || uploadedDataUrl || (photoCleared ? "" : (existingItem?.image || ""));
    const availBool = availSelect.value === "true";

    if (existingItem) {
      Object.assign(existingItem, {
        name: nameInput.value.trim(),
        category: catInput.value.trim(),
        price: priceNum,
        image: chosenImage,
        available: availBool,
        soldOut: !availBool
      });
    } else {
      const nextId = menu.reduce((max, m) => Math.max(max, Number(m.id) || 0), 0) + 1;
      menu.push({
        id: nextId,
        name: nameInput.value.trim(),
        category: catInput.value.trim(),
        price: priceNum,
        image: chosenImage,
        available: availBool,
        soldOut: !availBool
      });
    }

    if (!writeMenu(menu)) return;
    closeModal();
    render();
    showNotice(t("menuAdmin.saved"), "success");
  }

  function bindEvents() {
    document.getElementById("btnNewItem")?.addEventListener("click", () => openModal(null));
    document.getElementById("btnCancelModal")?.addEventListener("click", closeModal);

    document.getElementById("menuModalBackdrop")?.addEventListener("click", (e) => {
      if (e.target.id === "menuModalBackdrop") closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });

    document.getElementById("menuSearch")?.addEventListener("input", render);
    document.getElementById("categoryFilter")?.addEventListener("change", render);
    document.getElementById("availabilityFilter")?.addEventListener("change", render);

    document.getElementById("itemImageUrl")?.addEventListener("input", (e) => {
      const val = e.target.value.trim();
      if (val) {
        uploadedDataUrl = "";
        photoCleared = false;
      }
      updatePreview(val || uploadedDataUrl);
    });

    document.getElementById("itemImageFile")?.addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) {
        uploadedDataUrl = "";
        updatePreview(document.getElementById("itemImageUrl").value.trim());
        return;
      }
      try {
        uploadedDataUrl = await compressImage(file);
        photoCleared = false;
        if (document.getElementById("itemImageUrl")) {
          document.getElementById("itemImageUrl").value = "";
        }
        updatePreview(uploadedDataUrl);
      } catch {
        showNotice(t("menuAdmin.errStorage"), "error");
      }
    });

    document.getElementById("menuItemForm")?.addEventListener("submit", handleFormSubmit);

    document.getElementById("menuTableWrap")?.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;

      const id = btn.dataset.id;
      const action = btn.dataset.action;
      const menu = readMenu();
      const idx = menu.findIndex((m) => String(m.id) === String(id));
      if (idx === -1) return;

      if (action === "edit") {
        openModal(menu[idx]);
      } else if (action === "toggle") {
        const nextAvail = !isAvailable(menu[idx]);
        menu[idx].available = nextAvail;
        menu[idx].soldOut = !nextAvail;
        if (writeMenu(menu)) {
          render();
          showNotice(t("menuAdmin.toggled"), "success");
        }
      } else if (action === "delete") {
        if (!window.confirm(t("menuAdmin.confirmDelete"))) return;
        menu.splice(idx, 1);
        if (writeMenu(menu)) {
          render();
          showNotice(t("menuAdmin.deleted"), "success");
        }
      }
    });

    document.addEventListener("langchange", render);
    window.addEventListener("storage", render);
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (typeof guard === "function") {
      const user = guard(["manager"]);
      if (!user) return;
    }
    bindEvents();
    render();
  });
})();