(function () {
  const CURRENT_USER_KEY = "sh_currentUser"; // Key for storing the currently logged-in user's data in localStorage/sessionStorage.
  const POSTS_KEY = "sh_posts";
  const USERS_KEY = "sh_users"; // For potential future use if we want to store multiple users or a user directory.
  // Defining the above keys for storing user and post data in localStorage/sessionStorage.

  function safeParse(json, fallback) {
    try {
      return JSON.parse(json) ?? fallback;
    } catch {
      return fallback;
    }
  }

  function getActiveUser() {
    const localRaw = localStorage.getItem(CURRENT_USER_KEY);
    const sessionRaw = sessionStorage.getItem(CURRENT_USER_KEY);
    return safeParse(localRaw, null) || safeParse(sessionRaw, null);
  }

  function loadUsers() {
    const usersRaw = localStorage.getItem(USERS_KEY);
    return safeParse(usersRaw, []);
  } // Function to load the list of users from localStorage, returning an empty array if no users are found or if parsing fails.

  function loadPosts() {
    const postsRaw = localStorage.getItem(POSTS_KEY);
    return safeParse(postsRaw, []);
  } // Function to load the list of posts from localStorage, returning an empty array if no posts are found or if parsing fails.

  function savePosts(p) {
    localStorage.setItem(POSTS_KEY, JSON.stringify(p));
  } // Function to save the list of posts to localStorage by converting it to a JSON string.

  function saveUsers(u) {
    localStorage.setItem(USERS_KEY, JSON.stringify(u));
  } // Function to save the list of users to localStorage by converting it to a JSON string.

  function genId(prefix) {
    return prefix +"_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  } // Function to generate a unique ID by combining a given prefix with a random string.

  function timeAgo(iso) {
    const mins = Math.floor((Date.now() - new Date(iso)) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return mins + " m";
    const hours = Math.floor(mins / 60);
    if (hours < 24) return hours + " h";
    return Math.floor(hours / 24) + " d";
  } // Function to convert an ISO timestamp into a human-readable "time ago" format, such as "Just now", "5 minutes ago", or "2 hours ago".

  function avatarSrc(user) {
    if (user && user.photo) {
      return user.photo;
    }
    const seed = encodeURIComponent((user.id && (user.email || user.name)) || "user");
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4`;
  } // Function to determine the avatar image source for a user. If the user has a custom photo, it returns that; otherwise, it generates a unique avatar using the Dicebear Avatars API based on the user's email or name.

  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  } // Function for code injection security

  function syncUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    const users = loadUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = user;
      saveUsers(users);
    }
    } // Function to synchronize the current user's data across localStorage and the users list. It updates the current user's information in localStorage and also updates the corresponding user entry in the users list if it exists.

    function renderComment(c) {
      return `<div class="comment">
        <strong class="comment-author">${escapeHtml(c.authorName)}</strong>
        <span class= "comment-text">${escapeHtml(c.text)}</span>
        <span class="comment-time">${timeAgo(c.timestamp)}</span>
      </div>`;
    }

    function renderPost(post, currentUser) {
      const isOwn = post.authorId === currentUser.id;
      const liked = post.likes.includes(currentUser.id);

      const article = document.createElement("article");
      article.className = "post";
      article.dataset.postId = post.id;

      article.innerHTML = `
      <img src="${escapeHtml(post.authorPhoto || avatarSrc({email: post.authorName}))}" class="post-avatar" alt="avatar"/>
        <div class="post-body">
          <div class="post-header">
          <a href="profile.html?id=${post.authorId}" class="post-author">${escapeHtml(post.authorName)}</a>
          <span class="post-username">@${escapeHtml(post.authorUsername)}</span>
          <span class="post-time">${timeAgo(post.timestamp)}</span>
          ${isOwn ? `<button class="delete-btn" data-post-id="${post.id}" title="Delete Post">🗑️</button>` : ""}
        </div>
        <div class ="post-text">${escapeHtml(post.text)}</div>
        <div class="post-footer">
          <button class="action-btn comment-toggle-btn" data-post-id="${post.id}">💬 ${post.comments.length}</button>
          <button class="action-btn like-btn ${liked ? "liked" : ""}" data-post-id="${post.id}">${liked ? "❤️" : "🤍"} ${post.likes.length}</button>
        </div>
        <div class="comments-section" id="comments-${post.id}" style="display:none;">
          <div class="comments-list">${post.comments.map(renderComment).join("")}</div>
          <div class="comment-form">
            <input class="comment-input" type="text" placeholder="Write a comment..." maxlength="500"/>
            <button class="btn-primary comment-submit-btn" data-post-id="${post.id}">Post</button>
          </div>
        </div>
      </div>`;
      return article;
    }

    function renderFeed(currentUser) {
      const stream = document.querySelector(".post-stream");
      if (!stream) return;

      const allPosts = loadPosts();
      const following = currentUser.following || [];

      let posts = following.length === 0 ? allPosts : allPosts.filter(p => p.authorId === currentUser.id || following.includes(p.authorId));
      posts = posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      stream.innerHTML = "";
      if(posts.length === 0) {
      stream.innerHTML= `<p style="text-align:center;color:#888;padding:32px;">No posts to display.</p>`;
        return;
      }
      posts.forEach(post => stream.appendChild(renderPost(post, currentUser)));
    }

    function renderWhoTOFollow(currentUser) {
      const list = document.querySelector(".follow-list");
      if(!list) return;

      const users = loadUsers();
      const following = currentUser.following || [];
      const others = users.filter(u => u.id !== currentUser.id);

      if(others.length === 0) {
        list.innerHTML= `<li style="color:#888;font-size:14px;padding:8px 0;"> No other users yet.</li>`;
        return;
      }

      list.innerHTML = others.map(u => {
        const isFollowing = following.includes(u.id);
        return `<li class="follow-item">
          <img src="${escapeHtml(avatarSrc(u))}" class="follow-avatar" alt="avatar"/>
          <div class="follow-info">
            <a href="profile.html?userId=${u.id}" class="follow-name">${escapeHtml(u.name)}</a>
            <span class="follow-username">@${escapeHtml(u.username || "")}</span>
          </div>
          <button class="btn-secondary-small follow-btn" data-user-id="${u.id}" data-following="${isFollowing}">${isFollowing ? "Unfollow" : "Follow"}</button>
        </li>`;
      }).join("");
    }

    function setupCreatePost(currentUser){
      const textarea = document.querySelector(".compose-input");
      const postBtn = document.querySelector(".compose-actions .btn-primary");
      const sidebarBtn = document.querySelector(".btn-compose");

    function submitPost(){
      const text = textarea ? textarea.value.trim() : "";
      if (!text) return;
      const posts = loadPosts();
      posts.unshift({
        id: genId("p"),
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorUsername: currentUser.username || currentUser.email.split("@")[0],
        authorPhoto: currentUser.photo || null,
        text,
        timestamp: new Date().toISOString(),
        likes: [],
        comments: [],
      });
      savePosts(posts);
      if (textarea) textarea.value = "";
      renderFeed(currentUser);
    }

    if (postBtn) {
      postBtn.addEventListener("click", submitPost);
    }
    if (sidebarBtn) {
      sidebarBtn.addEventListener("click", () => textarea && textarea.focus());
    }
    if (textarea) {
      textarea.addEventListener("keydown", e => {
        if (e.key === "Enter" && (!e.shiftKey || e.metaKey)) submitPost();
      });
    }
  }

    function setupFeedEvents(currentUser) {
      const stream = document.querySelector(".post-stream");
      if(!stream) return;

      stream.addEventListener("click", e => {
        const btn = e.target;
        const postId = btn.dataset.postId;

        if (btn.classList.contains("like-btn")) {
          const posts = loadPosts();
          const post = posts.find(p => p.id === postId);
          if (!post) return;
          const idx = post.likes.indexOf(currentUser.id);
          if (idx === -1) post.likes.push(currentUser.id);
          else post.likes.splice(idx, 1);
          savePosts(posts);
          renderFeed(currentUser);
        } // Like/unlike post

        if (btn.classList.contains("delete-btn")) {
          savePosts(loadPosts().filter(p => p.id !== postId));
          renderFeed(currentUser);
        } // Delete post

        if (btn.classList.contains("comment-toggle-btn")) {
          const section = document.getElementById("comments-" + postId);
          if (section) section.style.display = section.style.display === "none" ? "block" : "none";
        } // Toggle comments section

        if (btn.classList.contains("comment-submit-btn")) {
          const section = document.getElementById("comments-" + postId);
          const input = section && section.querySelector(".comment-input");
          if (!input || !input.value.trim()) return;

          const posts = loadPosts();
          const post = posts.find(p => p.id === postId);

          if (!post) return;

          post.comments.push({
            id: genId("c"),
            authorId: currentUser.id,
            authorName: currentUser.name,
            authorUsername: currentUser.username || currentUser.email.split("@")[0],
            text: input.value.trim(),
            timestamp: new Date().toISOString(),
          });
          savePosts(posts);
          renderFeed(currentUser);

          const newSection = document.getElementById("comments-" + postId);
          if (newSection) {
            newSection.style.display = "block";
          }
        }
        }); // Add comment
    }

    function setupFollowEvents(currentUser) {
      const list = document.querySelector(".follow-list");
      if(!list) return;

      list.addEventListener("click", e => {
        if(!e.target.classList.contains("follow-btn")) return;
        const userId = e.target.dataset.userId;
        const isFollowing = e.target.dataset.following === "true";
        
        const users = loadUsers();
        const me = users.find(u => u.id === currentUser.id);
        if(!me) return;
        if(!me.following) me.following = [];
        if(isFollowing) me.following = me.following.filter(id => id !== userId);
        else me.following.push(userId);

        saveUsers(users);
        currentUser.following = me.following;
        syncUser(currentUser);
        renderWhoTOFollow(currentUser);
        renderFeed(currentUser);
      });
    }

  function initFeed() {
    let user = getActiveUser();
    
    // Check authentication: if no user is found, redirect back to login
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const users = loadUsers();
    user = users.find(u => u.id === user.id) || user; // Sync with latest user data if available

    const usernameEls = document.querySelector(".user-profile .username");
    if(usernameEls) usernameEls.textContent = user.name;
    document.querySelectorAll(".user-profile .avatar, .compose-avatar").forEach(el => {
      el.src = avatarSrc(user);
    }); // Set profile avatar in header and compose section

    const navProfileIcon = document.getElementById("navProfileIcon");
    if (navProfileIcon) {
      navProfileIcon.src = avatarSrc(user);
    }

    const profileNavLink = document.querySelector('a[href="profile.html"]');
    if (profileNavLink) profileNavLink.setAttribute("href", `profile.html?userId=${user.id}`);

    const userProfileEls = document.querySelector(".user-profile");
    if (userProfileEls) {
      userProfileEls.style.cursor = "pointer";
      userProfileEls.addEventListener("click", () => {
        window.location.href = `profile.html?userId=${user.id}`;
      });
    }

    // Setup logout button
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
      localStorage.removeItem(CURRENT_USER_KEY);
      sessionStorage.removeItem(CURRENT_USER_KEY);
      window.location.href = "login.html";
    });
    
    renderFeed(user);
    renderWhoTOFollow(user);
    setupCreatePost(user);
    setupFeedEvents(user);
    setupFollowEvents(user);
  }

   if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFeed);
  } else {
    initFeed();
  }
})();
