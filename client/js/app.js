let csrfToken = "";
async function csrf() {
  if (!csrfToken) {
    const r = await fetch("/api/csrf-token");
    csrfToken = (await r.json()).csrfToken;
  }
  return csrfToken;
}
async function api(url, options = {}) {
  const token = await csrf();
  const isForm = options.body instanceof FormData;
  const res = await fetch(url, {
    ...options,
    headers: {
      "x-csrf-token": token,
      ...(isForm ? {} : { "content-type": "application/json" }),
      ...(options.headers || {}),
    },
  });
  const data = await res
    .json()
    .catch(() => ({ message: "Unexpected response." }));
  if (res.status === 401 && location.pathname.includes("dashboard"))
    location = "/login.html";
  if (!res.ok) throw new Error(data.message);
  return data;
}
function toast(msg, ok = false) {
  const t =
    document.querySelector(".toast") ||
    Object.assign(document.body.appendChild(document.createElement("div")), {
      className: "toast",
    });
  t.textContent = msg;
  t.style.background = ok ? "#126b54" : "";
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3500);
}
function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}
function bindPassword() {
  document.querySelectorAll("[data-toggle]").forEach(
    (b) =>
      (b.onclick = () => {
        const i = document.querySelector(b.dataset.toggle);
        i.type = i.type === "password" ? "text" : "password";
        b.innerHTML =
          i.type === "password"
            ? '<i class="fa fa-eye"></i>'
            : '<i class="fa fa-eye-slash"></i>';
      }),
  );
}
function theme() {
  document
    .querySelector("[data-theme]")
    ?.addEventListener("click", () => document.body.classList.toggle("light"));
}
document.addEventListener("DOMContentLoaded", () => {
  bindPassword();
  theme();
});
