/* =========================================================
   users.js — Manager adds / edits / deletes staff accounts
   Owner: Yasmina (M1 Administration)
   Needs: js/shared/i18n.js (t, getLocale) and js/shared/auth.js (getUsers, saveUsers, isValidEmail…)
   ========================================================= */

const usersBody   = document.getElementById("users-body");
const usersEmpty  = document.getElementById("users-empty");
const searchInput = document.getElementById("user-search");
const roleFilter  = document.getElementById("role-filter");
const modal       = document.getElementById("user-modal");
const userForm    = document.getElementById("user-form");

// Turn "2026-11-16T10:00:00Z" into "16 Nov 2026" / "16 نوفمبر 2026".
function formatDate(iso) {
  return new Date(iso).toLocaleDateString(getLocale(), { day: "numeric", month: "short", year: "numeric" });
}

// Escape text before putting it inside innerHTML (protects the table from broken HTML).
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text == null ? "" : String(text);
  return div.innerHTML;
}

// 1) Draw the table, using the search box and the role filter.
function renderUsers() {
  const query = searchInput.value.trim().toLowerCase();
  const role = roleFilter.value;
  const me = getCurrentUser();

  const list = getUsers().filter(u => {
    const roleOk = role === "staff" ? u.role !== "customer" : u.role === role;
    const textOk = !query || u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
    return roleOk && textOk;
  });

  usersEmpty.hidden = list.length > 0;
  usersBody.innerHTML = list.map(u => `
    <tr>
      <td><strong>${escapeHtml(u.name)}</strong>${me && me.id === u.id ? ' <small style="color:var(--ink-soft)">' + t("users.you") + '</small>' : ""}</td>
      <td><bdi>${escapeHtml(u.email)}</bdi></td>
      <td><bdi>${escapeHtml(u.phone) || "—"}</bdi></td>
      <td><span class="badge ${u.role}">${t("role." + u.role)}</span></td>
      <td>${formatDate(u.createdAt)}</td>
      <td>
        <div class="row-actions">
          <button class="btn btn-outline btn-sm" data-edit="${u.id}">${t("btn.edit")}</button>
          ${me && me.id === u.id ? "" : `<button class="btn btn-danger btn-sm" data-delete="${u.id}">${t("btn.delete")}</button>`}
        </div>
      </td>
    </tr>`).join("");
}

// 2) Open the form. No id = add new; with id = edit that user.
function openUserForm(id) {
  userForm.reset();
  userForm.querySelectorAll(".field").forEach(f => f.classList.remove("invalid"));
  userForm.querySelectorAll(".error").forEach(e => (e.textContent = ""));

  const f = userForm.elements;
  const user = id ? getUsers().find(u => u.id === id) : null;

  document.getElementById("modal-title").textContent = t(user ? "users.modalEdit" : "users.modalAdd");
  document.getElementById("pw-hint").textContent = t(user ? "users.pwHintEdit" : "users.pwHintNew");

  // Customers can be edited too, so add "customer" to the role list only when needed.
  const customerOpt = f.role.querySelector('option[value="customer"]');
  if (user && user.role === "customer" && !customerOpt) {
    f.role.insertAdjacentHTML("beforeend", `<option value="customer" data-i18n="role.customer">${t("role.customer")}</option>`);
  } else if ((!user || user.role !== "customer") && customerOpt) {
    customerOpt.remove();
  }

  if (user) {
    f.id.value = user.id;
    f.name.value = user.name;
    f.email.value = user.email;
    f.phone.value = user.phone || "";
    f.role.value = user.role;
  } else {
    f.id.value = "";
  }
  modal.classList.add("open");
  f.name.focus();
}

function closeUserForm() {
  modal.classList.remove("open");
}

// 3) Check the form. Returns true when everything is valid.
function validateUserForm() {
  const f = userForm.elements;
  const id = Number(f.id.value) || null;
  let ok = true;

  if (f.name.value.trim().length < 3) { setFieldError(f.name, t("err.name3")); ok = false; }
  else setFieldError(f.name, "");

  const sameEmail = findUserByEmail(f.email.value);
  if (!isValidEmail(f.email.value)) { setFieldError(f.email, t("err.emailInvalid")); ok = false; }
  else if (sameEmail && sameEmail.id !== id) { setFieldError(f.email, t("err.emailUsed")); ok = false; }
  else setFieldError(f.email, "");

  if (!isValidPhone(f.phone.value)) { setFieldError(f.phone, t("err.phone")); ok = false; }
  else setFieldError(f.phone, "");

  const needPassword = !id; // new accounts must have a password
  if ((needPassword || f.password.value) && f.password.value.length < 4) {
    setFieldError(f.password, t("err.password4")); ok = false;
  } else setFieldError(f.password, "");

  // The manager cannot remove their own manager role (otherwise nobody can manage).
  const me = getCurrentUser();
  if (id && me && id === me.id && f.role.value !== "manager") {
    setFieldError(f.role, t("err.ownRole")); ok = false;
  } else setFieldError(f.role, "");

  return ok;
}

// 4) Save: add a new user or update an existing one.
function saveUser(event) {
  event.preventDefault();
  if (!validateUserForm()) return;

  const f = userForm.elements;
  const users = getUsers();
  const id = Number(f.id.value) || null;
  const data = {
    name: f.name.value.trim(),
    email: f.email.value.trim().toLowerCase(),
    phone: f.phone.value.trim(),
    role: f.role.value,
  };

  if (id) {
    const user = users.find(u => u.id === id);
    Object.assign(user, data);
    if (f.password.value) user.password = f.password.value;
    showToast(t("toast.updated"));
  } else {
    users.push({ id: nextUserId(), ...data, password: f.password.value, createdAt: new Date().toISOString() });
    showToast(t("toast.added"));
  }

  saveUsers(users);
  closeUserForm();
  renderUsers();
}

// 5) Delete after the manager confirms.
function deleteUser(id) {
  const user = getUsers().find(u => u.id === id);
  if (!user) return;
  if (!confirm(t("users.confirmDelete", { name: user.name }))) return;
  saveUsers(getUsers().filter(u => u.id !== id));
  renderUsers();
  showToast(t("toast.deleted"));
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ---------- Events ---------- */
document.getElementById("add-user-btn").addEventListener("click", () => openUserForm());
document.getElementById("cancel-user").addEventListener("click", closeUserForm);
modal.addEventListener("click", e => { if (e.target === modal) closeUserForm(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeUserForm(); });
userForm.addEventListener("submit", saveUser);
searchInput.addEventListener("input", renderUsers);
roleFilter.addEventListener("change", renderUsers);
document.addEventListener("langchange", () => {
  renderUsers(); // redraw the table in the new language
  // If the form is open, translate its title and hint too.
  const editing = Boolean(userForm.elements.id.value);
  document.getElementById("modal-title").textContent = t(editing ? "users.modalEdit" : "users.modalAdd");
  document.getElementById("pw-hint").textContent = t(editing ? "users.pwHintEdit" : "users.pwHintNew");
});

// One listener for all Edit/Delete buttons in the table (event delegation).
usersBody.addEventListener("click", e => {
  const edit = e.target.closest("[data-edit]");
  const del = e.target.closest("[data-delete]");
  if (edit) openUserForm(Number(edit.dataset.edit));
  if (del) deleteUser(Number(del.dataset.delete));
});

renderUsers();
