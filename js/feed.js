// js/feed.js
(function () {
  const CURRENT_USER_KEY = "sh_currentUser";

  function safeParse(json, fallback) {
    try {
      return JSON.parse(json) || fallback;
    } catch {
      return fallback;
    }
  }

  function getActiveUser() {
    const localRaw = localStorage.getItem(CURRENT_USER_KEY);
    const sessionRaw = sessionStorage.getItem(CURRENT_USER_KEY);
    if (localRaw) return safeParse(localRaw, null);
    if (sessionRaw) return safeParse(sessionRaw, null);
    return null;
  }

  function handleLogout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = "login.html";
  }

  function initFeed() {
    const user = getActiveUser();
    
    // Check authentication: if no user is found, redirect back to login
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    // Populate user profile info in navbar and compose box
    const displayName = user.name || user.email || "Student";
    const avatarDataUrl = user.photo || null;

    const usernameEls = document.querySelectorAll(".user-profile .username");
    const avatarEls = document.querySelectorAll(".user-profile .avatar, .compose-avatar");
    
    usernameEls.forEach(el => {
      el.textContent = displayName;
    });

    avatarEls.forEach(el => {
      if (avatarDataUrl) {
        el.src = avatarDataUrl;
      } else {
        const seed = encodeURIComponent(user.email || displayName);
        el.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4`;
      }
    });

    const navProfileIcon = document.getElementById("navProfileIcon");
    if (navProfileIcon && avatarDataUrl) {
      navProfileIcon.src = avatarDataUrl;
    }

    // Setup logout button
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", handleLogout);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFeed);
  } else {
    initFeed();
  }
})();
