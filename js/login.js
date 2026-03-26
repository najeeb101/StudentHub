// StudentHub – front-end only login logic
(function () {
  const USERS_KEY = "sh_users";
  const CURRENT_USER_KEY = "sh_currentUser";
  const DEFAULT_AVATAR = "../media/user.png";

  function safeParse(json, fallback) {
    try {
      const parsed = JSON.parse(json);
      return Array.isArray(fallback) && !Array.isArray(parsed) ? fallback : parsed;
    } catch {
      return fallback;
    }
  }

  function loadUsers() {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return safeParse(raw, []);
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getCurrentUser() {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    return safeParse(raw, null);
  }

  function setCurrentUser(userOrNull) {
    if (!userOrNull) {
      localStorage.removeItem(CURRENT_USER_KEY);
      return;
    }
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userOrNull));
  }

  function clearFieldErrors() {
    const errorEls = document.querySelectorAll(".field-error");
    errorEls.forEach((el) => {
      el.textContent = "";
    });
  }

  function setGlobalAlert(message, type) {
    const alert = document.getElementById("authAlert");
    if (!alert) return;
    if (!message) {
      alert.textContent = "";
      alert.className = "alert";
      return;
    }
    alert.textContent = message;
    alert.className = "alert alert--visible " + (type === "error" ? "alert--error" : "alert--success");
  }

  function handleLoginSubmit(event) {
    event.preventDefault();
    clearFieldErrors();

    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");
    const emailError = document.getElementById("loginEmailError");
    const passwordError = document.getElementById("loginPasswordError");

    if (!emailInput || !passwordInput) return;

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    let hasError = false;

    if (!email) {
      emailError.textContent = "Email is required.";
      hasError = true;
    }

    if (!password) {
      passwordError.textContent = "Password is required.";
      hasError = true;
    }

    if (hasError) return;

    const users = loadUsers();
    const found = users.find(
      (u) => typeof u.email === "string" && u.email.toLowerCase() === email
    );

    if (!found) {
      setGlobalAlert("The email address you entered isn't connected to an account.", "error");
      return;
    }

    if (found.password !== password) {
      setGlobalAlert("The password you've entered is incorrect.", "error");
      return;
    }

    if (!found.photo) {
      found.photo = DEFAULT_AVATAR;
      saveUsers(users);
    }

    setCurrentUser(found);

    emailInput.value = "";
    passwordInput.value = "";

    setGlobalAlert("Logged in successfully. Redirecting...", "success");
    setTimeout(() => {
      window.location.href = "feed.html";
    }, 500);
  }

  function restoreSessionFromStorage() {
    const localUser = getCurrentUser();
    const sessionRaw = sessionStorage.getItem(CURRENT_USER_KEY);
    const sessionUser = sessionRaw ? safeParse(sessionRaw, null) : null;
    const activeUser = localUser || sessionUser;
    if (activeUser) {
      window.location.href = "feed.html";
    }
  }

  function initAuthUI() {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", handleLoginSubmit);
    }
    restoreSessionFromStorage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAuthUI);
  } else {
    initAuthUI();
  }
})();
