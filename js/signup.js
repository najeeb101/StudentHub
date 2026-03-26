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
    if (!raw) return [];
    return safeParse(raw, []);
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
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

  function handleRegisterSubmit(event) {
    event.preventDefault();
    clearFieldErrors();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim().toLowerCase();
    const password = document.getElementById("registerPassword").value;
    const username = document.getElementById("registerUsername").value.trim();
    const bio = document.getElementById("registerBio").value.trim();
    const genderNode = document.querySelector('input[name="gender"]:checked');
    const gender = genderNode ? genderNode.value : null;

    let hasError = false;

    if (!name) {
      document.getElementById("registerNameError").textContent = "Name is required.";
      hasError = true;
    }
    if (!email) {
      document.getElementById("registerEmailError").textContent = "Email is required.";
      hasError = true;
    }
    if (!password || password.length < 6) {
      document.getElementById("registerPasswordError").textContent = "Password must be at least 6 characters.";
      hasError = true;
    }
    if (!username) {
      document.getElementById("registerUsernameError").textContent = "Username is required.";
      hasError = true;
    }
    if (!gender) {
      document.getElementById("genderError").textContent = "Please choose a gender.";
      hasError = true;
    }

    if (hasError) {
      setGlobalAlert("Please fix the errors above.", "error");
      return;
    }

    const users = loadUsers();
    
    // Check if email or username already exists
    const existingEmail = users.find((u) => typeof u.email === "string" && u.email.toLowerCase() === email);
    const existingUsername = users.find((u) => u.username && u.username.toLowerCase() === username.toLowerCase());

    if (existingEmail) {
      setGlobalAlert("An account with this email already exists.", "error");
      return;
    }
    if (existingUsername) {
      setGlobalAlert("This username is already taken. Try another.", "error");
      return;
    }

      const newUser = {
        id: createUserId(),
        name,
        username,
        email,
        password,
        bio,
        photo: "../media/user.png",
        following: [],
        gender,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      saveUsers(users);
      setCurrentUser(newUser);

      setGlobalAlert("Account created successfully. Redirecting...", "success");
      setTimeout(() => {window.location.href = "feed.html";}, 500);
    }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      const form = document.getElementById("registerForm");
      if (form) form.addEventListener("submit", handleRegisterSubmit);
    });
  } else {
    const form = document.getElementById("registerForm");
    if (form) form.addEventListener("submit", handleRegisterSubmit);
  }
})();
