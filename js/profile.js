(function () {
  const API = "";
  const DEFAULT_AVATAR = "../media/user.png";
  const CURRENT_USER_KEY = "sh_currentUser";

  // --- Session ---
  function getActiveUser() {
    try { return JSON.parse(localStorage.getItem(CURRENT_USER_KEY)) || JSON.parse(sessionStorage.getItem(CURRENT_USER_KEY)); }
    catch { return null; }
  }

  // --- API ---
  async function apiFetch(path, opts = {}) {
    const res = await fetch(API + path, {
      headers: { "Content-Type": "application/json" },
      ...opts,
    });
    return res.json();
  }

  // --- Util ---
  function timeAgo(iso) {
    const mins = Math.floor((Date.now() - new Date(iso)) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return mins + "m";
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + "h";
    return Math.floor(hrs / 24) + "d";
  }
  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function avatarSrc(user) {
    return (user && user.photo) ? user.photo : DEFAULT_AVATAR;
  }
  function showAlert(msg, type) {
    const el = document.getElementById("editAlert");
    if (!el) return;
    el.textContent = msg;
    el.className = type;
  }

  // --- Render post ---
  function renderComment(c, currentUser) {
    const isOwn = c.author.id === currentUser.id;
    return `<div class="comment">
      <strong class="comment-author">${escapeHtml(c.author.name)}</strong>
      <span class="comment-text">${escapeHtml(c.text)}</span>
      <span class="comment-time">· ${timeAgo(c.createdAt)}</span>
      ${isOwn ? `<button class="comment-delete-btn" data-comment-id="${c.id}" title="Delete comment" type="button">Delete</button>` : ""}
    </div>`;
  }

  function renderPost(post, currentUser) {
    const isOwn = post.author.id === currentUser.id;
    const liked = post.likes.some(l => l.userId === currentUser.id);
    const article = document.createElement("article");
    article.className = "post";
    article.dataset.postId = post.id;
    article.innerHTML = `
      <img src="${escapeHtml(avatarSrc(post.author))}" class="post-avatar" alt="avatar"/>
      <div class="post-body">
        <div class="post-header">
          <span class="post-author" style="font-weight:700;">${escapeHtml(post.author.name)}</span>
          <span class="post-username">@${escapeHtml(post.author.username)}</span>
          <span class="post-time">· ${timeAgo(post.createdAt)}</span>
          ${isOwn ? `<button class="delete-btn" data-post-id="${post.id}" title="Delete post">✕</button>` : ""}
        </div>
        <div class="post-text">${escapeHtml(post.text)}</div>
        <div class="post-footer">
          <button class="action-btn comment-toggle-btn" data-post-id="${post.id}">💬 ${post.comments.length}</button>
          <button class="action-btn like-btn${liked ? " liked" : ""}" data-post-id="${post.id}">${liked ? "❤️" : "🤍"} ${post.likes.length}</button>
        </div>
        <div class="comments-section" id="comments-${post.id}" style="display:none;">
          <div class="comments-list">${post.comments.map(c => renderComment(c, currentUser)).join("")}</div>
          <div class="comment-form">
            <input class="comment-input" type="text" placeholder="Write a comment..." maxlength="280"/>
            <button class="btn-primary comment-submit-btn" data-post-id="${post.id}">Post</button>
          </div>
        </div>
      </div>`;
    return article;
  }

  async function renderUserPosts(profileUserId, currentUser) {
    const stream = document.getElementById("userPostStream");
    if (!stream) return;
    const posts = await apiFetch(`/api/posts?authorId=${profileUserId}`);
    stream.innerHTML = "";
    if (!posts.length) {
      stream.innerHTML = `<p style="color:#888;text-align:center;padding:24px;">No posts yet.</p>`;
      return;
    }
    posts.forEach(p => stream.appendChild(renderPost(p, currentUser)));
    return posts;
  }

  // --- Modal ---
  function setupModal() {
    document.getElementById("modalCloseBtn").addEventListener("click", closeModal);
    document.getElementById("usersModal").addEventListener("click", e => {
      if (e.target === document.getElementById("usersModal")) closeModal();
    });
  }
  function closeModal() { document.getElementById("usersModal").style.display = "none"; }
  function openModal(title, userList) {
    document.getElementById("modalTitle").textContent = title;
    const ul = document.getElementById("modalUserList");
    if (!userList.length) {
      ul.innerHTML = `<li style="padding:20px;color:#888;text-align:center;">Nobody here yet.</li>`;
    } else {
      ul.innerHTML = userList.map(u => `
        <li>
          <img src="${escapeHtml(avatarSrc(u))}" class="modal-avatar" alt="avatar"/>
          <div>
            <a href="profile.html?id=${u.id}" class="modal-name">${escapeHtml(u.name)}</a>
            <span class="modal-username">@${escapeHtml(u.username || "")}</span>
          </div>
        </li>`).join("");
    }
    document.getElementById("usersModal").style.display = "flex";
  }

  // --- Init ---
  async function initProfile() {
    const currentUser = getActiveUser();
    if (!currentUser) { window.location.href = "login.html"; return; }

    // Navbar
    const usernameEl = document.querySelector(".user-profile .username");
    if (usernameEl) usernameEl.textContent = currentUser.name;
    const navAvatar = document.getElementById("navAvatar");
    if (navAvatar) navAvatar.src = avatarSrc(currentUser);
    const userProfileEl = document.querySelector(".user-profile");
    if (userProfileEl) {
      userProfileEl.style.cursor = "pointer";
      userProfileEl.addEventListener("click", () => { window.location.href = `profile.html?id=${currentUser.id}`; });
    }
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
      localStorage.removeItem(CURRENT_USER_KEY);
      sessionStorage.removeItem(CURRENT_USER_KEY);
      window.location.href = "login.html";
    });

    // Which profile
    const params = new URLSearchParams(window.location.search);
    const profileId = params.get("id") || currentUser.id;
    const isOwnProfile = profileId === currentUser.id;

    // Fetch profile user + their followers/following
    let [profileUser, followersData, followingData] = await Promise.all([
      apiFetch(`/api/users/${profileId}`),
      apiFetch(`/api/users/${profileId}/followers`),
      apiFetch(`/api/users/${profileId}/following`),
    ]);
    if (!profileUser || profileUser.error) profileUser = await apiFetch(`/api/users/${currentUser.id}`);

    const followers = followersData.map(f => f.follower);
    const following = followingData.map(f => f.following);

    // Display profile header
    function displayProfile(u) {
      document.getElementById("profileAvatar").src = avatarSrc(u);
      document.getElementById("profileName").textContent = u.name;
      document.getElementById("profileUsername").textContent = "@" + (u.username || "");
      document.getElementById("profileBio").textContent = u.bio || "";
      document.getElementById("statPosts").textContent = u._count?.posts ?? 0;
      document.getElementById("statFollowing").textContent = following.length;
      document.getElementById("statFollowers").textContent = followers.length;
    }
    displayProfile(profileUser);

    // Modal
    setupModal();
    document.getElementById("followingBtn").addEventListener("click", () => openModal("Following", following));
    document.getElementById("followersBtn").addEventListener("click", () => openModal("Followers", followers));

    // Action buttons
    const actionsDiv = document.getElementById("profileActions");

    if (isOwnProfile) {
      actionsDiv.innerHTML = `<button class="btn-primary" id="editProfileBtn">Edit Profile</button>`;
      let removePhotoRequested = false;

      document.getElementById("editProfileBtn").addEventListener("click", () => {
        document.getElementById("editUsername").value = profileUser.username || "";
        document.getElementById("editBio").value = profileUser.bio || "";
        document.getElementById("editPhoto").value = "";
        removePhotoRequested = false;
        const removePhotoBtn = document.getElementById("removePhotoBtn");
        if (removePhotoBtn) {
          removePhotoBtn.style.display = (profileUser.photo && profileUser.photo !== DEFAULT_AVATAR) ? "inline-flex" : "none";
        }
        showAlert("", "");
        document.getElementById("editForm").style.display = "block";
        document.getElementById("editForm").scrollIntoView({ behavior: "smooth" });
      });

      document.getElementById("cancelEditBtn").addEventListener("click", () => {
        document.getElementById("editForm").style.display = "none";
      });

      const removePhotoBtn = document.getElementById("removePhotoBtn");
      if (removePhotoBtn) {
        removePhotoBtn.addEventListener("click", async () => {
          await apiFetch(`/api/users/${profileUser.id}`, {
            method: "PATCH",
            body: JSON.stringify({ photo: DEFAULT_AVATAR }),
          });
          profileUser.photo = DEFAULT_AVATAR;
          displayProfile(profileUser);
          if (navAvatar) navAvatar.src = DEFAULT_AVATAR;
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ ...currentUser, photo: DEFAULT_AVATAR }));
          removePhotoBtn.style.display = "none";
          showAlert("Photo removed.", "success");
        });
      }

      document.getElementById("saveProfileBtn").addEventListener("click", async () => {
        const newUsername = document.getElementById("editUsername").value.trim();
        const newBio = document.getElementById("editBio").value.trim();
        const photoFile = document.getElementById("editPhoto").files[0];

        if (!newUsername) { showAlert("Username cannot be empty.", "error"); return; }

        async function applyEdit(updates) {
          const updated = await apiFetch(`/api/users/${profileUser.id}`, {
            method: "PATCH",
            body: JSON.stringify(updates),
          });
          if (updated.error) { showAlert(updated.error, "error"); return; }
          profileUser = { ...profileUser, ...updated };
          displayProfile(profileUser);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ ...currentUser, ...updated }));
          if (updates.photo && navAvatar) navAvatar.src = updates.photo;
          showAlert("Profile updated!", "success");
          setTimeout(() => { document.getElementById("editForm").style.display = "none"; }, 1500);
          await renderUserPosts(profileUser.id, currentUser);
        }

        if (photoFile) {
          if (photoFile.size > 2 * 1024 * 1024) { showAlert("Photo too large (max 2MB).", "error"); return; }
          const reader = new FileReader();
          reader.onload = e => applyEdit({ username: newUsername, bio: newBio, photo: e.target.result });
          reader.readAsDataURL(photoFile);
        } else {
          applyEdit({ username: newUsername, bio: newBio });
        }
      });

    } else {
      // Other user — Follow/Unfollow
      const myFollowing = await apiFetch(`/api/users/${currentUser.id}/following`);
      let isFollowing = myFollowing.some(f => f.following.id === profileId);

      actionsDiv.innerHTML = `<button class="btn-secondary-small" id="followBtn">${isFollowing ? "Unfollow" : "Follow"}</button>`;
      document.getElementById("followBtn").addEventListener("click", async () => {
        await apiFetch("/api/follows", {
          method: isFollowing ? "DELETE" : "POST",
          body: JSON.stringify({ followerId: currentUser.id, followingId: profileId }),
        });
        isFollowing = !isFollowing;
        document.getElementById("followBtn").textContent = isFollowing ? "Unfollow" : "Follow";
        const updatedFollowers = await apiFetch(`/api/users/${profileId}/followers`);
        document.getElementById("statFollowers").textContent = updatedFollowers.length;
      });
    }

    await renderUserPosts(profileId, currentUser);

    // Post events (like, delete, comment)
    const stream = document.getElementById("userPostStream");
    if (stream) {
      stream.addEventListener("click", async e => {
        const btn = e.target.closest("button");
        if (!btn) return;
        const postId = btn.dataset.postId;
        const articlePostId = btn.closest(".post")?.dataset.postId;

        if (btn.classList.contains("like-btn")) {
          await apiFetch(`/api/posts/${postId}/likes`, { method: "POST", body: JSON.stringify({ userId: currentUser.id }) });
          await renderUserPosts(profileId, currentUser);
        }

        if (btn.classList.contains("delete-btn")) {
          await apiFetch(`/api/posts/${postId}`, { method: "DELETE" });
          const updated = await apiFetch(`/api/users/${profileId}`);
          document.getElementById("statPosts").textContent = updated._count?.posts ?? 0;
          await renderUserPosts(profileId, currentUser);
        }

        if (btn.classList.contains("comment-toggle-btn")) {
          const section = document.getElementById("comments-" + postId);
          if (section) section.style.display = section.style.display === "none" ? "block" : "none";
        }

        if (btn.classList.contains("comment-submit-btn")) {
          const section = document.getElementById("comments-" + postId);
          const input = section?.querySelector(".comment-input");
          if (!input?.value.trim()) return;
          await apiFetch(`/api/posts/${postId}/comments`, {
            method: "POST",
            body: JSON.stringify({ authorId: currentUser.id, text: input.value.trim() }),
          });
          await renderUserPosts(profileId, currentUser);
          const newSection = document.getElementById("comments-" + postId);
          if (newSection) newSection.style.display = "block";
        }

        if (btn.classList.contains("comment-delete-btn")) {
          await apiFetch(`/api/comments/${btn.dataset.commentId}`, {
            method: "DELETE",
            body: JSON.stringify({ userId: currentUser.id }),
          });
          await renderUserPosts(profileId, currentUser);
          const newSection = document.getElementById("comments-" + articlePostId);
          if (newSection) newSection.style.display = "block";
        }
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initProfile);
  else initProfile();
})();
