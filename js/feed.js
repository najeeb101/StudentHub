(function () {
  const API = "";
  const DEFAULT_AVATAR = "../media/user.png";
  const CURRENT_USER_KEY = "sh_currentUser";

  // --- Session helpers ---
  function getActiveUser() {
    try {
      return (
        JSON.parse(localStorage.getItem(CURRENT_USER_KEY)) ||
        JSON.parse(sessionStorage.getItem(CURRENT_USER_KEY))
      );
    } catch {
      return null;
    }
  }
  function syncUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  // --- API helpers ---
  async function apiFetch(path, opts = {}) {
    const res = await fetch(API + path, {
      headers: { "Content-Type": "application/json" },
      ...opts,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(
        data?.error || `Request failed with status ${res.status}`,
      );
    }
    return data;
  }

  // --- Util ---
  function timeAgo(iso) {
    const mins = Math.floor((Date.now() - new Date(iso)) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return mins + " m";
    const hours = Math.floor(mins / 60);
    if (hours < 24) return hours + " h";
    return Math.floor(hours / 24) + " d";
  }
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function avatarSrc(user) {
    return user && user.photo ? user.photo : DEFAULT_AVATAR;
  }

  // --- Render ---
  function renderComment(c, currentUser) {
    const isOwn = c.author.id === currentUser.id;
    return `<div class="comment">
      <strong class="comment-author">${escapeHtml(c.author.name)}</strong>
      <span class="comment-text">${escapeHtml(c.text)}</span>
      <span class="comment-time">${timeAgo(c.createdAt)}</span>
      ${isOwn ? `<button class="comment-delete-btn" data-comment-id="${c.id}" title="Delete comment" type="button">Delete</button>` : ""}
    </div>`;
  }

  function renderPost(post, currentUser) {
    const isOwn = post.author.id === currentUser.id;
    const liked = post.likes.some((l) => l.userId === currentUser.id);
    const article = document.createElement("article");
    article.className = "post";
    article.dataset.postId = post.id;
    article.innerHTML = `
      <img src="${escapeHtml(avatarSrc(post.author))}" class="post-avatar" alt="avatar"/>
      <div class="post-body">
        <div class="post-header">
          <a href="profile.html?id=${post.author.id}" class="post-author">${escapeHtml(post.author.name)}</a>
          <span class="post-username">@${escapeHtml(post.author.username)}</span>
          <span class="post-time">${timeAgo(post.createdAt)}</span>
          ${isOwn ? `<button class="delete-btn" data-post-id="${post.id}" title="Delete Post">🗑️</button>` : ""}
        </div>
        <div class="post-text">${escapeHtml(post.text)}</div>
        <div class="post-footer">
          <button class="action-btn comment-toggle-btn" data-post-id="${post.id}">💬 ${post.comments.length}</button>
          <button class="action-btn like-btn ${liked ? "liked" : ""}" data-post-id="${post.id}">${liked ? "❤️" : "🤍"} ${post.likes.length}</button>
        </div>
        <div class="comments-section" id="comments-${post.id}" style="display:none;">
          <div class="comments-list">${post.comments.map((c) => renderComment(c, currentUser)).join("")}</div>
          <div class="comment-form">
            <input class="comment-input" type="text" placeholder="Write a comment..." maxlength="500"/>
            <button class="btn-primary comment-submit-btn" data-post-id="${post.id}">Post</button>
          </div>
        </div>
      </div>`;
    return article;
  }

  function renderFeed(posts, currentUser, followingIds) {
    const stream = document.querySelector(".post-stream");
    if (!stream) return;
    let feed =
      followingIds.length === 0
        ? posts
        : posts.filter(
            (p) =>
              p.author.id === currentUser.id ||
              followingIds.includes(p.author.id),
          );
    stream.innerHTML = "";
    if (feed.length === 0) {
      stream.innerHTML = `<p style="text-align:center;color:#888;padding:32px;">No posts to display.</p>`;
      return;
    }
    feed.forEach((p) => stream.appendChild(renderPost(p, currentUser)));
  }

  function renderWhoToFollow(users, currentUser, followingIds) {
    const list = document.querySelector(".follow-list");
    if (!list) return;
    const others = users.filter((u) => u.id !== currentUser.id);
    if (others.length === 0) {
      list.innerHTML = `<li style="color:#888;font-size:14px;padding:8px 0;">No other users yet.</li>`;
      return;
    }
    list.innerHTML = others
      .map((u) => {
        const isFollowing = followingIds.includes(u.id);
        return `<li class="follow-item">
        <img src="${escapeHtml(avatarSrc(u))}" class="follow-avatar" alt="avatar"/>
        <div class="follow-info">
          <a href="profile.html?id=${u.id}" class="follow-name">${escapeHtml(u.name)}</a>
          <span class="follow-username">@${escapeHtml(u.username || "")}</span>
        </div>
        <button class="btn-secondary-small follow-btn" data-user-id="${u.id}" data-following="${isFollowing}">${isFollowing ? "Unfollow" : "Follow"}</button>
      </li>`;
      })
      .join("");
  }

  // --- Init ---
  async function initFeed() {
    const user = getActiveUser();
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    // Navbar
    document
      .querySelectorAll(".user-profile .avatar, .compose-avatar")
      .forEach((el) => {
        el.src = avatarSrc(user);
      });
    const usernameEl = document.querySelector(".user-profile .username");
    if (usernameEl) usernameEl.textContent = user.name;
    const navProfileIcon = document.getElementById("navProfileIcon");
    if (navProfileIcon) navProfileIcon.src = avatarSrc(user);
    const profileNavLink = document.querySelector('a[href="profile.html"]');
    if (profileNavLink)
      profileNavLink.setAttribute("href", `profile.html?id=${user.id}`);
    const userProfileEl = document.querySelector(".user-profile");
    if (userProfileEl) {
      userProfileEl.style.cursor = "pointer";
      userProfileEl.addEventListener("click", () => {
        window.location.href = `profile.html?id=${user.id}`;
      });
    }
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
      localStorage.removeItem(CURRENT_USER_KEY);
      sessionStorage.removeItem(CURRENT_USER_KEY);
      window.location.href = "login.html";
    });

    // Fetch data
    let posts, users;
    try {
      [posts, users] = await Promise.all([
        apiFetch("/api/posts"),
        apiFetch("/api/users"),
      ]);
    } catch (err) {
      const stream = document.querySelector(".post-stream");
      if (stream)
        stream.innerHTML = `<p style="color:#e53e3e;text-align:center;padding:32px;">Failed to load feed: ${err.message}</p>`;
      console.error("initFeed fetch error:", err);
      return;
    }
    let followingData = [];
    try {
      followingData = await apiFetch(`/api/users/${user.id}/following`);
    } catch {
      followingData = [];
    }

    const activeUser = users.find((u) => u.id === user.id);
    if (!activeUser) {
      localStorage.removeItem(CURRENT_USER_KEY);
      sessionStorage.removeItem(CURRENT_USER_KEY);
      window.alert(
        "Your saved session no longer exists in the database. Please log in again.",
      );
      window.location.href = "login.html";
      return;
    }

    let followingIds = followingData.map((f) => f.following.id);

    renderFeed(posts, user, followingIds);
    renderWhoToFollow(users, user, followingIds);

    // Create post
    const textarea = document.querySelector(".compose-input");
    const postBtn = document.querySelector(".compose-actions .btn-primary");
    const sidebarBtn = document.querySelector(".btn-compose");

    async function submitPost() {
      const text = textarea?.value.trim();
      if (!text) return;
      try {
        const post = await apiFetch("/api/posts", {
          method: "POST",
          body: JSON.stringify({ authorId: user.id, text }),
        });
        if (textarea) textarea.value = "";
        posts = [post, ...posts];
        renderFeed(posts, user, followingIds);
      } catch (error) {
        window.alert(
          error instanceof Error ? error.message : "Could not create post.",
        );
      }
    }
    if (postBtn) postBtn.addEventListener("click", submitPost);
    if (sidebarBtn)
      sidebarBtn.addEventListener("click", () => textarea?.focus());
    if (textarea)
      textarea.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          submitPost();
        }
      });

    // Feed events (like, delete, comment)
    const stream = document.querySelector(".post-stream");
    if (stream) {
      stream.addEventListener("click", async (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        const postId = btn.dataset.postId;
        const articlePostId = btn.closest(".post")?.dataset.postId;

        if (btn.classList.contains("like-btn")) {
          await apiFetch(`/api/posts/${postId}/likes`, {
            method: "POST",
            body: JSON.stringify({ userId: user.id }),
          });
          posts = await apiFetch("/api/posts");
          renderFeed(posts, user, followingIds);
        }

        if (btn.classList.contains("delete-btn")) {
          await apiFetch(`/api/posts/${postId}`, {
            method: "DELETE",
            body: JSON.stringify({ userId: user.id }),
          });
          posts = await apiFetch("/api/posts");
          renderFeed(posts, user, followingIds);
        }

        if (btn.classList.contains("comment-toggle-btn")) {
          const section = document.getElementById("comments-" + postId);
          if (section)
            section.style.display =
              section.style.display === "none" ? "block" : "none";
        }

        if (btn.classList.contains("comment-submit-btn")) {
          const section = document.getElementById("comments-" + postId);
          const input = section?.querySelector(".comment-input");
          if (!input?.value.trim()) return;
          await apiFetch(`/api/posts/${postId}/comments`, {
            method: "POST",
            body: JSON.stringify({
              authorId: user.id,
              text: input.value.trim(),
            }),
          });
          posts = await apiFetch("/api/posts");
          renderFeed(posts, user, followingIds);
          const newSection = document.getElementById("comments-" + postId);
          if (newSection) newSection.style.display = "block";
        }

        if (btn.classList.contains("comment-delete-btn")) {
          await apiFetch(`/api/comments/${btn.dataset.commentId}`, {
            method: "DELETE",
            body: JSON.stringify({ userId: user.id }),
          });
          posts = await apiFetch("/api/posts");
          renderFeed(posts, user, followingIds);
          const newSection = document.getElementById(
            "comments-" + articlePostId,
          );
          if (newSection) newSection.style.display = "block";
        }
      });
    }

    // Follow events
    const followList = document.querySelector(".follow-list");
    if (followList) {
      followList.addEventListener("click", async (e) => {
        if (!e.target.classList.contains("follow-btn")) return;
        const userId = e.target.dataset.userId;
        const isFollowing = e.target.dataset.following === "true";
        await apiFetch("/api/follows", {
          method: isFollowing ? "DELETE" : "POST",
          body: JSON.stringify({ followerId: user.id, followingId: userId }),
        });
        const updatedFollowing = await apiFetch(
          `/api/users/${user.id}/following`,
        );
        followingIds = updatedFollowing.map((f) => f.following.id);
        renderWhoToFollow(users, user, followingIds);
        renderFeed(posts, user, followingIds);
      });
    }
  }

  function safeInitFeed() {
    initFeed().catch((err) => {
      console.error("initFeed failed:", err);
    });
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", safeInitFeed);
  else safeInitFeed();
})();
