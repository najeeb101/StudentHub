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

  function populateDates() {
    const daySelect = document.getElementById("dobDay");
    const yearSelect = document.getElementById("dobYear");
    if (daySelect) {
      for (let i = 1; i <= 31; i++) {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = i;
        daySelect.appendChild(opt);
      }
    }
    if (yearSelect) {
      const currentYear = new Date().getFullYear();
      for (let i = currentYear; i >= 1905; i--) {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = i;
        yearSelect.appendChild(opt);
      }
    }
  }

  function handleRegisterSubmit(event) {
    event.preventDefault();
    clearFieldErrors();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("registerEmail").value.trim().toLowerCase();
    const mobile = document.getElementById("registerMobile").value.trim();
    const password = document.getElementById("registerPassword").value;
    
    // New fields
    const usernameInput = document.getElementById("registerUsername");
    const username = usernameInput ? usernameInput.value.trim() : "";
    
    const bioInput = document.getElementById("registerBio");
    const bio = bioInput ? bioInput.value.trim() : "";
    
    const photoFileInput = document.getElementById("registerPhoto");
    
    const dobDay = document.getElementById("dobDay").value;
    const dobMonth = document.getElementById("dobMonth").value;
    const dobYear = document.getElementById("dobYear").value;

    const genderNode = document.querySelector('input[name="gender"]:checked');
    const gender = genderNode ? genderNode.value : null;

    let hasError = false;

    if (!firstName) {
      document.getElementById("firstNameError").textContent = "First name is required.";
      hasError = true;
    }
    if (!lastName) {
      document.getElementById("lastNameError").textContent = "Last name is required.";
      hasError = true;
    }
    if (!email) {
      document.getElementById("registerEmailError").textContent = "Email is required.";
      hasError = true;
    }
    if (!mobile) {
      document.getElementById("registerMobileError").textContent = "Mobile number is required.";
      hasError = true;
    }
    if (!password || password.length < 6) {
      document.getElementById("registerPasswordError").textContent = "Password must be at least 6 characters.";
      hasError = true;
    }
    if (!username) {
      if (document.getElementById("registerUsernameError")) {
        document.getElementById("registerUsernameError").textContent = "Username is required.";
      }
      hasError = true;
    }
    if (!dobDay || !dobMonth || !dobYear) {
      document.getElementById("dobError").textContent = "Complete your birthday.";
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
    const existingMobile = users.find((u) => typeof u.mobile === "string" && u.mobile === mobile);
    const existingUsername = users.find((u) => u.username && u.username.toLowerCase() === username.toLowerCase());

    if (existingEmail) {
      setGlobalAlert("An account with this email already exists.", "error");
      return;
    }
    if (existingMobile) {
      setGlobalAlert("An account with this mobile number already exists.", "error");
      return;
    }
    if (existingUsername) {
      setGlobalAlert("This username is already taken. Try another.", "error");
      return;
    }

    // Process photo as Base64 if attached
    if (photoFileInput && photoFileInput.files && photoFileInput.files[0]) {
      const file = photoFileInput.files[0];
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        document.getElementById("registerPhotoError").textContent = "File is too large (max 2MB).";
        setGlobalAlert("Please fix the errors above.", "error");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = function(e) {
        finishRegistration(e.target.result);
      };
      reader.onerror = function() {
        if (document.getElementById("registerPhotoError")) {
          document.getElementById("registerPhotoError").textContent = "Error reading file.";
        }
        setGlobalAlert("Please fix the errors above.", "error");
      };
      reader.readAsDataURL(file);
    } else {
      finishRegistration(null);
    }

    function finishRegistration(photoBase64) {
      const newUser = {
        id: createUserId(),
        name: firstName + " " + lastName,
        firstName,
        lastName,
        username,
        email,
        mobile,
        password,
        bio,
        photo: photoBase64,
        dob: `${dobYear}-${dobMonth}-${dobDay}`,
        gender,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      saveUsers(users);
      setCurrentUser(newUser);

      setGlobalAlert("Account created successfully. Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "feed.html";
      }, 500);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      populateDates();
      const form = document.getElementById("registerForm");
      if (form) form.addEventListener("submit", handleRegisterSubmit);
    });
  } else {
    populateDates();
    const form = document.getElementById("registerForm");
    if (form) form.addEventListener("submit", handleRegisterSubmit);
  }
})();
