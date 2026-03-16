// StudentHub – front-end only authentication using localStorage.
// NOTE: Storing plain-text passwords in localStorage is NOT secure and
// is used here only for this coursework phase without a backend.

(function () {
  const USERS_KEY = "sh_users";
  const CURRENT_USER_KEY = "sh_currentUser";

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
    if (!raw) {
      const initial = [];
      localStorage.setItem(USERS_KEY, JSON.stringify(initial));
      return initial;
    }
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

  function createUserId() {
    return "u_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function validateEmail(email) {
    if (!email) return { ok: false, message: "Email is required." };
    const trimmed = email.trim();
    const basicPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!basicPattern.test(trimmed)) {
      return { ok: false, message: "Enter a valid email address." };
    }
    return { ok: true, message: "" };
  }

  function validatePassword(password) {
    if (!password) return { ok: false, message: "Password is required." };
    if (password.length < 8) {
      return { ok: false, message: "Password must be at least 8 characters." };
    }
    return { ok: true, message: "" };
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

  function switchTab(target) {
    const loginTab = document.getElementById("tab-login");
    const registerTab = document.getElementById("tab-register");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (!loginTab || !registerTab || !loginForm || !registerForm) return;

    if (target === "login") {
      loginTab.classList.add("auth-tab--active");
      loginTab.setAttribute("aria-selected", "true");
      registerTab.classList.remove("auth-tab--active");
      registerTab.setAttribute("aria-selected", "false");

      loginForm.classList.add("auth-form--active");
      registerForm.classList.remove("auth-form--active");
    } else {
      registerTab.classList.add("auth-tab--active");
      registerTab.setAttribute("aria-selected", "true");
      loginTab.classList.remove("auth-tab--active");
      loginTab.setAttribute("aria-selected", "false");

      registerForm.classList.add("auth-form--active");
      loginForm.classList.remove("auth-form--active");
    }
    clearFieldErrors();
    setGlobalAlert("", "success");
  }

  function showLoggedInUI(user) {
    const card = document.querySelector(".auth-card");
    const formsContainer = document.querySelector(".auth-forms");
    const tabs = document.querySelector(".auth-tabs");
    const subtitle = document.querySelector(".auth-subtitle");
    const loggedInPanel = document.getElementById("loggedInPanel");
    const headingEl = document.getElementById("loggedInHeading");
    const metaEl = document.getElementById("loggedInMeta");

    if (!card || !formsContainer || !tabs || !subtitle || !loggedInPanel) return;

    formsContainer.style.display = "none";
    tabs.style.display = "none";
    subtitle.style.display = "none";

    const displayName = user?.name || user?.email || "Student";
    headingEl.textContent = "Welcome back, " + displayName;

    if (metaEl && user?.createdAt) {
      const joinedDate = new Date(user.createdAt);
      if (!isNaN(joinedDate.getTime())) {
        metaEl.textContent =
          "Joined: " +
          joinedDate.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          }) +
          " · Session stored in localStorage.";
      }
    }

    loggedInPanel.style.display = "flex";
    setGlobalAlert("", "success");
  }

  function showLoggedOutUI() {
    const formsContainer = document.querySelector(".auth-forms");
    const tabs = document.querySelector(".auth-tabs");
    const subtitle = document.querySelector(".auth-subtitle");
    const loggedInPanel = document.getElementById("loggedInPanel");

    if (formsContainer) formsContainer.style.display = "block";
    if (tabs) tabs.style.display = "flex";
    if (subtitle) subtitle.style.display = "block";
    if (loggedInPanel) loggedInPanel.style.display = "none";

    switchTab("login");
  }

  function handleRegisterSubmit(event) {
    event.preventDefault();
    clearFieldErrors();

    const nameInput = document.getElementById("registerName");
    const emailInput = document.getElementById("registerEmail");
    const passwordInput = document.getElementById("registerPassword");
    const confirmInput = document.getElementById("registerConfirmPassword");

    const nameError = document.getElementById("registerNameError");
    const emailError = document.getElementById("registerEmailError");
    const passwordError = document.getElementById("registerPasswordError");
    const confirmError = document.getElementById("registerConfirmPasswordError");

    if (!nameInput || !emailInput || !passwordInput || !confirmInput) return;

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;

    let hasError = false;

    if (!name) {
      nameError.textContent = "Name is required.";
      hasError = true;
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.ok) {
      emailError.textContent = emailCheck.message;
      hasError = true;
    }

    const passCheck = validatePassword(password);
    if (!passCheck.ok) {
      passwordError.textContent = passCheck.message;
      hasError = true;
    }

    if (!confirmPassword) {
      confirmError.textContent = "Please confirm your password.";
      hasError = true;
    } else if (password !== confirmPassword) {
      confirmError.textContent = "Passwords do not match.";
      hasError = true;
    }

    if (hasError) {
      setGlobalAlert("Please fix the highlighted fields.", "error");
      return;
    }

    const users = loadUsers();
    const existing = users.find(
      (u) => typeof u.email === "string" && u.email.toLowerCase() === email
    );
    if (existing) {
      emailError.textContent = "An account with this email already exists.";
      setGlobalAlert("That email is already registered. Try logging in.", "error");
      return;
    }

    const nowIso = new Date().toISOString();
    const newUser = {
      id: createUserId(),
      name,
      email,
      password,
      createdAt: nowIso,
    };

    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);

    nameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
    confirmInput.value = "";

    setGlobalAlert("Account created and you are now logged in.", "success");
    showLoggedInUI(newUser);
  }

  function handleLoginSubmit(event) {
    event.preventDefault();
    clearFieldErrors();

    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");
    const emailError = document.getElementById("loginEmailError");
    const passwordError = document.getElementById("loginPasswordError");
    const rememberCheckbox = document.getElementById("rememberMe");

    if (!emailInput || !passwordInput) return;

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    let hasError = false;

    const emailCheck = validateEmail(email);
    if (!emailCheck.ok) {
      emailError.textContent = emailCheck.message;
      hasError = true;
    }

    if (!password) {
      passwordError.textContent = "Password is required.";
      hasError = true;
    }

    if (hasError) {
      setGlobalAlert("Please fix the highlighted fields.", "error");
      return;
    }

    const users = loadUsers();
    const found = users.find(
      (u) => typeof u.email === "string" && u.email.toLowerCase() === email
    );

    if (!found) {
      emailError.textContent = "No account found with this email.";
      setGlobalAlert("We couldn't find an account with that email.", "error");
      return;
    }

    if (found.password !== password) {
      passwordError.textContent = "Incorrect password.";
      setGlobalAlert("Incorrect email or password.", "error");
      return;
    }

    const shouldRemember = !rememberCheckbox || rememberCheckbox.checked;
    if (shouldRemember) {
      setCurrentUser(found);
    } else {
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found));
      localStorage.removeItem(CURRENT_USER_KEY);
    }

    emailInput.value = "";
    passwordInput.value = "";

    setGlobalAlert("Logged in successfully.", "success");
    showLoggedInUI(found);
  }

  function handleLogout() {
    setCurrentUser(null);
    sessionStorage.removeItem(CURRENT_USER_KEY);
    showLoggedOutUI();
    setGlobalAlert("You have been logged out.", "success");
  }

  function restoreSessionFromStorage() {
    const localUser = getCurrentUser();
    const sessionRaw = sessionStorage.getItem(CURRENT_USER_KEY);
    const sessionUser = sessionRaw ? safeParse(sessionRaw, null) : null;
    const activeUser = localUser || sessionUser;
    if (activeUser) {
      showLoggedInUI(activeUser);
    } else {
      showLoggedOutUI();
    }
  }

  function initAuthUI() {
    loadUsers();

    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");
    const logoutButton = document.getElementById("logoutButton");
    const tabLogin = document.getElementById("tab-login");
    const tabRegister = document.getElementById("tab-register");
    const goToRegister = document.getElementById("goToRegister");
    const goToLogin = document.getElementById("goToLogin");

    if (registerForm) {
      registerForm.addEventListener("submit", handleRegisterSubmit);
    }
    if (loginForm) {
      loginForm.addEventListener("submit", handleLoginSubmit);
    }
    if (logoutButton) {
      logoutButton.addEventListener("click", handleLogout);
    }
    if (tabLogin) {
      tabLogin.addEventListener("click", function () {
        switchTab("login");
      });
    }
    if (tabRegister) {
      tabRegister.addEventListener("click", function () {
        switchTab("register");
      });
    }
    if (goToRegister) {
      goToRegister.addEventListener("click", function () {
        switchTab("register");
      });
    }
    if (goToLogin) {
      goToLogin.addEventListener("click", function () {
        switchTab("login");
      });
    }

    restoreSessionFromStorage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAuthUI);
  } else {
    initAuthUI();
  }
})();

