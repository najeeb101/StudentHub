(function () {
  const DEFAULT_AVATAR = "../media/user.png";
  const USERS_KEY = "sh_users";
  const POSTS_KEY = "sh_posts";
  const CURRENT_USER_KEY = "sh_currentUser";

  // --- Helpers ---
  function safeParse(json, fallback) {
    try {
      return JSON.parse(json) ?? fallback;
    } catch {
      return fallback;
    }
  }
  function getActiveUser() {
    return (
      safeParse(localStorage.getItem(CURRENT_USER_KEY), null) ||
      safeParse(sessionStorage.getItem(CURRENT_USER_KEY), null)
    );
  }
  function loadUsers() {
    return safeParse(localStorage.getItem(USERS_KEY), []);
  }
  function saveUsers(u) {
    localStorage.setItem(USERS_KEY, JSON.stringify(u));
  }

  function ensureDefaultPhotos(users) {
    let changed = false;
    const updated = users.map((user) => {
      if (user && !user.photo) {
        changed = true;
        return { ...user, photo: DEFAULT_AVATAR };
      }
      return user;
    });
    if (changed) saveUsers(updated);
    return updated;
  }
  function loadPosts() {
    return safeParse(localStorage.getItem(POSTS_KEY), []);
  }
  function savePosts(p) {
    localStorage.setItem(POSTS_KEY, JSON.stringify(p));
  }

  function genId(prefix) {
    return (
      prefix +
      "_" +
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 6)
    );
  }

  function avatarSrc(user) {
    if (user && user.photo) return user.photo;
    return DEFAULT_AVATAR;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function timeAgo(iso) {
    const mins = Math.floor((Date.now() - new Date(iso)) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return mins + "m";
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + "h";
    return Math.floor(hrs / 24) + "d";
  }

  function showAlert(msg, type) {
    const el = document.getElementById("editAlert");
    if (!el) return;
    el.textContent = msg;
    el.className = type; // "error" or "success"
  }

  // --- Render comment ---
  function renderComment(c) {
    return `<div class="comment">
      <strong class="comment-author">${escapeHtml(c.authorName)}</strong>
      <span class="comment-text">${escapeHtml(c.text)}</span>
      <span class="comment-time">${timeAgo(c.timestamp)}</span>
    </div>`;
  }

  // --- Render a post with full like + comment interactivity ---
  function renderPost(post, currentUser) {
    const isOwn = post.authorId === currentUser.id;
    const liked = post.likes.includes(currentUser.id);
    const article = document.createElement("article");
    article.className = "post";
    article.dataset.postId = post.id;
    article.innerHTML = `
      <img src="${escapeHtml(post.authorPhoto || avatarSrc({ email: post.authorName }))}" class="post-avatar" alt="avatar" />
      <div class="post-body">
        <div class="post-header">
          <span class="post-author" style="font-weight:700;">${escapeHtml(post.authorName)}</span>
          <span class="post-username">@${escapeHtml(post.authorUsername)}</span>
          <span class="post-time">· ${timeAgo(post.timestamp)}</span>
          ${isOwn ? `<button class="delete-btn" data-post-id="${post.id}" title="Delete post">✕</button>` : ""}
        </div>
        <div class="post-text">${escapeHtml(post.text)}</div>
        <div class="post-footer">
          <button class="action-btn comment-toggle-btn" data-post-id="${post.id}">💬 ${post.comments.length}</button>
          <button class="action-btn like-btn${liked ? " liked" : ""}" data-post-id="${post.id}">${liked ? "❤️" : "🤍"} ${post.likes.length}</button>
        </div>
        <div class="comments-section" id="comments-${post.id}" style="display:none;">
          <div class="comments-list">${post.comments.map(renderComment).join("")}</div>
          <div class="comment-form">
            <input class="comment-input" type="text" placeholder="Write a comment..." maxlength="280" />
            <button class="btn-primary comment-submit-btn" data-post-id="${post.id}">Post</button>
          </div>
        </div>
      </div>`;
    return article;
  }

  function renderUserPosts(profileUser, currentUser) {
    const stream = document.getElementById("userPostStream");
    if (!stream) return;
    const posts = loadPosts()
      .filter((p) => p.authorId === profileUser.id)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    stream.innerHTML = "";
    if (posts.length === 0) {
      stream.innerHTML = `<p style="color:#888;text-align:center;padding:24px;">No posts yet.</p>`;
      return;
    }
    posts.forEach((p) => stream.appendChild(renderPost(p, currentUser)));
  }

  // --- Post interactions (like, delete, comment) ---
  function setupPostEvents(profileUser, currentUser) {
    const stream = document.getElementById("userPostStream");
    if (!stream) return;

    stream.addEventListener("click", (e) => {
      const btn = e.target;
      const postId = btn.dataset.postId;

      // Like / Unlike
      if (btn.classList.contains("like-btn")) {
        const posts = loadPosts();
        const post = posts.find((p) => p.id === postId);
        if (!post) return;
        const idx = post.likes.indexOf(currentUser.id);
        if (idx === -1) post.likes.push(currentUser.id);
        else post.likes.splice(idx, 1);
        savePosts(posts);
        renderUserPosts(profileUser, currentUser);
      }

      // Delete own post
      if (btn.classList.contains("delete-btn")) {
        savePosts(loadPosts().filter((p) => p.id !== postId));
        renderUserPosts(profileUser, currentUser);
        document.getElementById("statPosts").textContent = loadPosts().filter(
          (p) => p.authorId === profileUser.id,
        ).length;
      }

      // Toggle comments
      if (btn.classList.contains("comment-toggle-btn")) {
        const section = document.getElementById("comments-" + postId);
        if (section)
          section.style.display =
            section.style.display === "none" ? "block" : "none";
      }

      // Submit comment
      if (btn.classList.contains("comment-submit-btn")) {
        const section = document.getElementById("comments-" + postId);
        const input = section && section.querySelector(".comment-input");
        if (!input || !input.value.trim()) return;
        const posts = loadPosts();
        const post = posts.find((p) => p.id === postId);
        if (!post) return;
        post.comments.push({
          id: genId("c"),
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorUsername:
            currentUser.username || currentUser.email.split("@")[0],
          text: input.value.trim(),
          timestamp: new Date().toISOString(),
        });
        savePosts(posts);
        renderUserPosts(profileUser, currentUser);
        const newSection = document.getElementById("comments-" + postId);
        if (newSection) newSection.style.display = "block";
      }
    });
  }

  // --- Followers / Following modal ---
  function setupModal() {
    document
      .getElementById("modalCloseBtn")
      .addEventListener("click", closeModal);
    document.getElementById("usersModal").addEventListener("click", (e) => {
      if (e.target === document.getElementById("usersModal")) closeModal();
    });
  }

  function closeModal() {
    document.getElementById("usersModal").style.display = "none";
  }

  function openModal(title, userList) {
    document.getElementById("modalTitle").textContent = title;
    const ul = document.getElementById("modalUserList");
    if (userList.length === 0) {
      ul.innerHTML = `<li style="padding:20px;color:#888;text-align:center;">Nobody here yet.</li>`;
    } else {
      ul.innerHTML = userList
        .map(
          (u) => `
        <li>
          <img src="${escapeHtml(avatarSrc(u))}" class="modal-avatar" alt="avatar" />
          <div>
            <a href="profile.html?id=${u.id}" class="modal-name">${escapeHtml(u.name)}</a>
            <span class="modal-username">@${escapeHtml(u.username || "")}</span>
          </div>
        </li>`,
        )
        .join("");
    }
    document.getElementById("usersModal").style.display = "flex";
  }

  // --- Init ---
  function initProfile() {
    const currentUser = getActiveUser();
    if (!currentUser) {
      window.location.href = "login.html";
      return;
    }

    let users = ensureDefaultPhotos(loadUsers());
    const freshCurrentUser =
      users.find((u) => u.id === currentUser.id) || currentUser;
    if (freshCurrentUser && !freshCurrentUser.photo) {
      freshCurrentUser.photo = DEFAULT_AVATAR;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(freshCurrentUser));
    }

    // Navbar
    const usernameEl = document.querySelector(".user-profile .username");
    if (usernameEl) usernameEl.textContent = freshCurrentUser.name;
    const navAvatar = document.getElementById("navAvatar");
    if (navAvatar) navAvatar.src = avatarSrc(freshCurrentUser);

    // Clicking navbar avatar/name goes to own profile
    const userProfileEl = document.querySelector(".user-profile");
    if (userProfileEl) {
      userProfileEl.style.cursor = "pointer";
      userProfileEl.addEventListener("click", () => {
        window.location.href = `profile.html?id=${freshCurrentUser.id}`;
      });
    }

    document.getElementById("logoutBtn")?.addEventListener("click", () => {
      localStorage.removeItem(CURRENT_USER_KEY);
      sessionStorage.removeItem(CURRENT_USER_KEY);
      window.location.href = "login.html";
    });

    // Which profile to show
    const params = new URLSearchParams(window.location.search);
    const profileId = params.get("id");
    let profileUser = profileId
      ? users.find((u) => u.id === profileId)
      : freshCurrentUser;
    if (!profileUser) profileUser = freshCurrentUser;

    const isOwnProfile = profileUser.id === freshCurrentUser.id;

    // Fill profile info
    function displayProfile(pUser) {
      document.getElementById("profileAvatar").src = avatarSrc(pUser);
      document.getElementById("profileName").textContent = pUser.name;
      document.getElementById("profileUsername").textContent =
        "@" + (pUser.username || "");
      document.getElementById("profileBio").textContent = pUser.bio || "";

      const allPosts = loadPosts();
      const allUsers = loadUsers();
      document.getElementById("statPosts").textContent = allPosts.filter(
        (p) => p.authorId === pUser.id,
      ).length;
      document.getElementById("statFollowing").textContent = (
        pUser.following || []
      ).length;
      document.getElementById("statFollowers").textContent = allUsers.filter(
        (u) => (u.following || []).includes(pUser.id),
      ).length;
    }

    displayProfile(profileUser);

    // Followers / Following modal setup
    setupModal();

    document.getElementById("followingBtn").addEventListener("click", () => {
      const allUsers = loadUsers();
      const fresh =
        allUsers.find((u) => u.id === profileUser.id) || profileUser;
      const followingUsers = (fresh.following || [])
        .map((id) => allUsers.find((u) => u.id === id))
        .filter(Boolean);
      openModal("Following", followingUsers);
    });

    document.getElementById("followersBtn").addEventListener("click", () => {
      const allUsers = loadUsers();
      const followers = allUsers.filter((u) =>
        (u.following || []).includes(profileUser.id),
      );
      openModal("Followers", followers);
    });

    // Action buttons
    const actionsDiv = document.getElementById("profileActions");

    if (isOwnProfile) {
      actionsDiv.innerHTML = `<button class="btn-primary" id="editProfileBtn">Edit Profile</button>`;

      let removePhotoRequested = false;

      document
        .getElementById("editProfileBtn")
        .addEventListener("click", () => {
          document.getElementById("editUsername").value =
            profileUser.username || "";
          document.getElementById("editBio").value = profileUser.bio || "";
          document.getElementById("editPhoto").value = "";
          removePhotoRequested = false;
          const removePhotoBtn = document.getElementById("removePhotoBtn");
          if (removePhotoBtn) {
            const hasCustomPhoto = profileUser.photo && profileUser.photo !== DEFAULT_AVATAR;
            removePhotoBtn.style.display = hasCustomPhoto ? "inline-flex" : "none";
          }
          showAlert("", "");
          document.getElementById("editForm").style.display = "block";
          document
            .getElementById("editForm")
            .scrollIntoView({ behavior: "smooth" });
        });

      document.getElementById("cancelEditBtn").addEventListener("click", () => {
        document.getElementById("editForm").style.display = "none";
      });

      const removePhotoBtn = document.getElementById("removePhotoBtn");
      if (removePhotoBtn) {
        removePhotoBtn.addEventListener("click", () => {
          removePhotoRequested = false;
          const photoInput = document.getElementById("editPhoto");
          if (photoInput) photoInput.value = "";

          const updatedUsers = loadUsers();
          const idx = updatedUsers.findIndex((u) => u.id === profileUser.id);
          if (idx === -1) return;
          updatedUsers[idx].photo = DEFAULT_AVATAR;
          saveUsers(updatedUsers);
          localStorage.setItem(
            CURRENT_USER_KEY,
            JSON.stringify(updatedUsers[idx]),
          );
          profileUser = updatedUsers[idx];
          displayProfile(profileUser);
          if (navAvatar) navAvatar.src = updatedUsers[idx].photo;
          removePhotoBtn.style.display = "none";
          showAlert("Photo removed.", "success");
        });
      }

      document
        .getElementById("saveProfileBtn")
        .addEventListener("click", () => {
          const newUsername = document
            .getElementById("editUsername")
            .value.trim();
          const newBio = document.getElementById("editBio").value.trim();
          const photoFile = document.getElementById("editPhoto").files[0];

          if (!newUsername) {
            showAlert("Username cannot be empty.", "error");
            return;
          }

          const allUsers = loadUsers();
          const taken = allUsers.find(
            (u) =>
              u.id !== profileUser.id &&
              u.username &&
              u.username.toLowerCase() === newUsername.toLowerCase(),
          );
          if (taken) {
            showAlert("Username already taken.", "error");
            return;
          }

          function applyEdit(photoValue, shouldSetPhoto) {
            const updatedUsers = loadUsers();
            const idx = updatedUsers.findIndex((u) => u.id === profileUser.id);
            if (idx === -1) return;
            updatedUsers[idx].username = newUsername;
            updatedUsers[idx].bio = newBio;
            if (shouldSetPhoto) updatedUsers[idx].photo = photoValue;
            saveUsers(updatedUsers);
            localStorage.setItem(
              CURRENT_USER_KEY,
              JSON.stringify(updatedUsers[idx]),
            );
            profileUser = updatedUsers[idx];
            displayProfile(profileUser);
            if (shouldSetPhoto && navAvatar) navAvatar.src = updatedUsers[idx].photo;
            showAlert("Profile updated!", "success");
            document.getElementById("editForm").style.display = "block";
            setTimeout(() => {
              document.getElementById("editForm").style.display = "none";
            }, 1500);
            renderUserPosts(profileUser, freshCurrentUser);
          }

          if (photoFile) {
            if (photoFile.size > 2 * 1024 * 1024) {
              showAlert("Photo too large (max 2MB).", "error");
              return;
            }
            const reader = new FileReader();
            reader.onload = (e) => applyEdit(e.target.result, true);
            reader.readAsDataURL(photoFile);
          } else if (removePhotoRequested) {
            applyEdit(DEFAULT_AVATAR, true);
          } else {
            applyEdit(null, false);
          }
        });
    } else {
      // Other user — Follow / Unfollow button
      const isFollowing = (freshCurrentUser.following || []).includes(
        profileUser.id,
      );
      actionsDiv.innerHTML = `<button class="btn-secondary-small" id="followBtn">
        ${isFollowing ? "Unfollow" : "Follow"}
      </button>`;

      document.getElementById("followBtn").addEventListener("click", () => {
        const allUsers = loadUsers();
        const me = allUsers.find((u) => u.id === freshCurrentUser.id);
        if (!me) return;
        if (!me.following) me.following = [];
        const idx = me.following.indexOf(profileUser.id);
        if (idx === -1) me.following.push(profileUser.id);
        else me.following.splice(idx, 1);
        saveUsers(allUsers);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(me));
        freshCurrentUser.following = me.following;
        const nowFollowing = me.following.includes(profileUser.id);
        document.getElementById("followBtn").textContent = nowFollowing
          ? "Unfollow"
          : "Follow";
        const updatedUsers = loadUsers();
        document.getElementById("statFollowers").textContent =
          updatedUsers.filter((u) =>
            (u.following || []).includes(profileUser.id),
          ).length;
      });
    }

    renderUserPosts(profileUser, freshCurrentUser);
    setupPostEvents(profileUser, freshCurrentUser);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProfile);
  } else {
    initProfile();
  }
})();
