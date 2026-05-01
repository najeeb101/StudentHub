(function () {
  const API = "";
  const CURRENT_USER_KEY = "sh_currentUser";

  function setCurrentUser(user) {
    if (user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(CURRENT_USER_KEY);
  }

  function clearFieldErrors() {
    document.querySelectorAll(".field-error").forEach(el => { el.textContent = ""; });
  }

  function setGlobalAlert(message, type) {
    const el = document.getElementById("authAlert");
    if (!el) return;
    if (!message) { el.textContent = ""; el.className = "alert"; return; }
    el.textContent = message;
    el.className = "alert alert--visible " + (type === "error" ? "alert--error" : "alert--success");
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    clearFieldErrors();

    const name     = document.getElementById("registerName").value.trim();
    const email    = document.getElementById("registerEmail").value.trim().toLowerCase();
    const password = document.getElementById("registerPassword").value;
    const username = document.getElementById("registerUsername").value.trim();
    const bio      = document.getElementById("registerBio").value.trim();
    const genderNode = document.querySelector('input[name="gender"]:checked');
    const gender   = genderNode ? genderNode.value : null;

    let hasError = false;
    if (!name)     { document.getElementById("registerNameError").textContent = "Name is required."; hasError = true; }
    if (!email)    { document.getElementById("registerEmailError").textContent = "Email is required."; hasError = true; }
    else if (!email.includes("@")) { document.getElementById("registerEmailError").textContent = "Email must be in the correct format."; hasError = true; }
    if (!password || password.length < 6) { document.getElementById("registerPasswordError").textContent = "Password must be at least 6 characters."; hasError = true; }
    if (!username) { document.getElementById("registerUsernameError").textContent = "Username is required."; hasError = true; }
    if (!gender)   { document.getElementById("genderError").textContent = "Please choose a gender."; hasError = true; }
    if (hasError)  { setGlobalAlert("Please fix the errors above.", "error"); return; }

    try {
      const res = await fetch(`${API}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, username, bio, gender }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error?.includes("email")) setGlobalAlert("An account with this email already exists.", "error");
        else if (data.error?.includes("username")) setGlobalAlert("This username is already taken. Try another.", "error");
        else setGlobalAlert(data.error || "Registration failed.", "error");
        return;
      }
      setCurrentUser(data);
      setGlobalAlert("Account created successfully. Redirecting...", "success");
      setTimeout(() => { window.location.href = "feed.html"; }, 500);
    } catch {
      setGlobalAlert("Could not connect to server. Is the app running?", "error");
    }
  }

  function init() {
    const form = document.getElementById("registerForm");
    if (form) form.addEventListener("submit", handleRegisterSubmit);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
