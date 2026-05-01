(function () {
  const API = "";
  const CURRENT_USER_KEY = "sh_currentUser";

  function setCurrentUser(user) {
    if (user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(CURRENT_USER_KEY);
  }

  function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem(CURRENT_USER_KEY)); } catch { return null; }
  }

  function setGlobalAlert(message, type) {
    const el = document.getElementById("authAlert");
    if (!el) return;
    if (!message) { el.textContent = ""; el.className = "alert"; return; }
    el.textContent = message;
    el.className = "alert alert--visible " + (type === "error" ? "alert--error" : "alert--success");
  }

  function clearFieldErrors() {
    document.querySelectorAll(".field-error").forEach(el => { el.textContent = ""; });
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    clearFieldErrors();

    const email = document.getElementById("loginEmail")?.value.trim().toLowerCase();
    const password = document.getElementById("loginPassword")?.value;
    const emailError = document.getElementById("loginEmailError");
    const passwordError = document.getElementById("loginPasswordError");

    let hasError = false;
    if (!email) { emailError.textContent = "Email is required."; hasError = true; }
    if (!password) { passwordError.textContent = "Password is required."; hasError = true; }
    if (hasError) return;

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGlobalAlert(data.error || "Login failed.", "error");
        return;
      }
      setCurrentUser(data);
      setGlobalAlert("Logged in successfully. Redirecting...", "success");
      setTimeout(() => { window.location.href = "feed.html"; }, 500);
    } catch {
      setGlobalAlert("Could not connect to server. Is the app running?", "error");
    }
  }

  function init() {
    if (getCurrentUser()) { window.location.href = "feed.html"; return; }
    const form = document.getElementById("loginForm");
    if (form) form.addEventListener("submit", handleLoginSubmit);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
