// ---- CONFIG ----
const API_BASE = ""; // for Render: "https://your-app.onrender.com"

// ---- HELPERS ----
const $ = (id) => document.getElementById(id);

function toast(msg) {
  const el = $("toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 2600);
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getToken() {
  return localStorage.getItem("token");
}
function setToken(t) {
  localStorage.setItem("token", t);
}
function clearToken() {
  localStorage.removeItem("token");
}

async function api(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

// ---- ELEMENTS ----
const authView = $("authView");
const feed = $("feed");
const composer = $("composer");

const profileView = $("profileView");
const profileCard = $("profileCard");
const profileActions = $("profileActions");

const notificationsView = $("notificationsView");
const notificationsList = $("notificationsList");

const openComposer = $("openComposer");
const postBtn = $("postBtn");
const postText = $("postText");

const logoutBtn = $("logoutBtn");
const miniAvatar = $("miniAvatar");
const miniName = $("miniName");
const miniUser = $("miniUser");
const composerAvatar = $("composerAvatar");

const tabForYou = $("tabForYou");
const tabFollowing = $("tabFollowing");

const prevPage = $("prevPage");
const nextPage = $("nextPage");
const pageInfo = $("pageInfo");
const postsRoot = $("posts");

const searchInput = $("searchInput");
const searchBtn = $("searchBtn");
const searchResults = $("searchResults");

let page = 1;
const limit = 6;
let mode = "posts"; 

let isLoading = false;
let reachedEnd = false;

let authTab = "login";

let currentView = "home";

let meUser = null; 

function setAuthTab(next) {
  authTab = next;
  const tLogin = $("authTabLogin");
  const tReg = $("authTabRegister");
  const fLogin = $("loginForm");
  const fReg = $("registerForm");

  if (tLogin && tReg && fLogin && fReg) {
    const onLogin = authTab === "login";
    tLogin.classList.toggle("active", onLogin);
    tReg.classList.toggle("active", !onLogin);
    tLogin.setAttribute("aria-selected", String(onLogin));
    tReg.setAttribute("aria-selected", String(!onLogin));
    fLogin.classList.toggle("hidden", !onLogin);
    fReg.classList.toggle("hidden", onLogin);
  }
}

function showAuth() {
  authView.classList.remove("hidden");
  feed.classList.add("hidden");
  composer.classList.add("hidden");
  profileView?.classList.add("hidden");
  notificationsView?.classList.add("hidden");

  openComposer.disabled = true;
  logoutBtn.classList.add("hidden");

  miniName.textContent = "Not logged";
  miniUser.textContent = "—";
  miniAvatar.innerHTML = "";
  composerAvatar.innerHTML = "";

  setAuthTab("login");
}

function showApp() {
  authView.classList.add("hidden");
  feed.classList.remove("hidden");
  composer.classList.add("hidden"); 

  profileView?.classList.add("hidden");
  notificationsView?.classList.add("hidden");

  openComposer.disabled = false;
  logoutBtn.classList.remove("hidden");
}

function showView(next) {
  currentView = next;

  feed.classList.add("hidden");
  composer.classList.add("hidden");
  profileView?.classList.add("hidden");
  notificationsView?.classList.add("hidden");

  const headerTabs = document.querySelector(".centerHeader");
  if (headerTabs) headerTabs.style.display = next === "home" || next === "following" ? "block" : "none";

  if (next === "home" || next === "following") {
    feed.classList.remove("hidden");
  }

  if (next === "profile") profileView?.classList.remove("hidden");
  if (next === "notifications") notificationsView?.classList.remove("hidden");
}

function renderProfile(u) {
  if (!profileCard) return;
  const joined = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "";
  const avatarInner = u.avatarUrl
    ? `<img src="${escapeHtml(u.avatarUrl)}" alt="avatar" style="width:56px;height:56px;border-radius:50%;object-fit:cover;">`
    : "";
  profileCard.innerHTML = `
    <div class="profileHeader">
      <div class="profileAvatar">${avatarInner}</div>
      <div style="flex:1; min-width:0;">
        <div class="profileName">@${escapeHtml(u.username || "unknown")}</div>
        <div class="profileMeta">${escapeHtml(u.role || "user")}${joined ? ` · joined ${escapeHtml(joined)}` : ""}</div>
      </div>
    </div>
    <div class="profileBio">${escapeHtml(u.bio || "") || '<span class="muted small">No bio yet</span>'}</div>
  `;
}

async function loadMyProfile() {
  if (!getToken()) return;
  try {
    const data = await api("/api/auth/me");
    const u = data.user || {};
    meUser = u;
    renderProfile(u);

    if (profileActions) {
      profileActions.innerHTML = `
        <button class="ghost" id="editProfileBtn" type="button">Edit profile</button>
        <label class="ghost" style="cursor:pointer;">
          Change avatar
          <input type="file" id="avatarInput" accept="image/*" style="display:none;" />
        </label>
      `;
      $("editProfileBtn")?.addEventListener("click", () => openEditProfile(u));
      $("avatarInput")?.addEventListener("change", async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append("avatar", file);
        try {
          const headers = {};
          const token = getToken();
          if (token) headers.Authorization = "Bearer " + token;
          const res = await fetch("/api/users/avatar", { method: "POST", headers, body: fd });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Upload failed");
          toast("Avatar updated");
          await loadMe();
          await loadMyProfile();
        } catch (err) {
          toast(err.message);
        }
      });
    }
  } catch (e) {
    toast(e.message);
  }
}

function openEditProfile(u) {
  if (!profileActions) return;
  profileActions.innerHTML = `
    <form class="form" id="editProfileForm">
      <label class="field">
        <span class="label">Bio</span>
        <textarea name="bio" maxlength="200" placeholder="Tell something about you...">${escapeHtml(u.bio || "")}</textarea>
      </label>
      <button class="primary" type="submit">Save</button>
      <button class="ghost" id="cancelEditProfile" type="button">Cancel</button>
    </form>
  `;
  $("cancelEditProfile")?.addEventListener("click", async () => {
    profileActions.innerHTML = "";
    await loadMyProfile();
  });

  $("editProfileForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const bio = String(fd.get("bio") || "").trim();

    try {
      const data = await api("/api/users/profile", { method: "PUT", body: { bio } });
      toast("Profile updated");
      profileActions.innerHTML = "";
      renderProfile(data.user || { ...u, bio });
    } catch (err) {
      toast(err.message);
    }
  });
}

function seedNotificationsEmpty() {
  if (!notificationsList) return;
  notificationsList.innerHTML = `<div class="muted small">No notifications yet</div>`;
}

async function loadNotifications() {
  if (!notificationsList) return;

  notificationsList.innerHTML = `<div class="muted small">Loading...</div>`;
  try {
    await api("/api/notifications/read", { method: "POST" }).catch(() => {});

    const data = await api(`/api/notifications?page=1&limit=20`);
    const items = data.items || [];
    if (!items.length) return seedNotificationsEmpty();

    notificationsList.innerHTML = items
      .map((n) => {
        const who = n.sender?.username || "someone";
        const time = n.createdAt ? new Date(n.createdAt).toLocaleString() : "";
        const postSnippet = n.post?.text ? escapeHtml(n.post.text.slice(0, 60)) : "";

        let icon = "";
        let text = "";
        if (n.type === "like") {
          icon = `<span style="color:var(--danger)">&#9829;</span>`;
          text = `<b>@${escapeHtml(who)}</b> liked your post` + (postSnippet ? `: "${postSnippet}…"` : "");
        } else if (n.type === "comment") {
          icon = `<span style="color:var(--accent)">&#9998;</span>`;
          text = `<b>@${escapeHtml(who)}</b> commented on your post` + (postSnippet ? `: "${postSnippet}…"` : "");
        } else if (n.type === "follow") {
          icon = `<span style="color:#7c5cff">&#10010;</span>`;
          text = `<b>@${escapeHtml(who)}</b> started following you`;
        } else {
          text = `<b>@${escapeHtml(who)}</b> interacted with you`;
        }

        return `
          <div class="listItem" style="${n.read ? "" : "border-color:rgba(29,155,240,0.4);background:rgba(29,155,240,0.06);"}">
            <div class="listTitle">${icon} ${text}</div>
            <div class="listSub">${escapeHtml(time)}</div>
          </div>
        `;
      })
      .join("");
  } catch (e) {
    notificationsList.innerHTML = `<div class="muted small">Failed to load</div>`;
    toast(e.message);
  }
}

function setTabs() {
  if (mode === "posts") {
    tabForYou.classList.add("active");
    tabFollowing.classList.remove("active");
  } else {
    tabFollowing.classList.add("active");
    tabForYou.classList.remove("active");
  }
}

$("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = Object.fromEntries(fd.entries());

  try {
    const data = await api("/api/auth/login", { method: "POST", body: payload });
    setToken(data.token);
    toast("Logged in");
    e.target.reset();
    await boot();
  } catch (err) {
    toast(err.message);
  }
});

$("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = Object.fromEntries(fd.entries());

  try {
    const data = await api("/api/auth/register", { method: "POST", body: payload });
    setToken(data.token);
    toast("Registered");
    e.target.reset();
    await boot();
  } catch (err) {
    toast(err.message);
  }
});

function avatarHtml(url, fallbackChar, size) {
  if (url) {
    return `<img src="${escapeHtml(url)}" alt="avatar" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;">`;
  }
  return "";
}

async function loadMe() {
  const data = await api("/api/auth/me");
  const u = data.user;
  meUser = u;

  if (u.avatarUrl) {
    miniAvatar.innerHTML = `<img src="${escapeHtml(u.avatarUrl)}" alt="" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">`;
    composerAvatar.innerHTML = `<img src="${escapeHtml(u.avatarUrl)}" alt="" style="width:44px;height:44px;border-radius:50%;object-fit:cover;">`;
  } else {
    miniAvatar.innerHTML = "";
    composerAvatar.innerHTML = "";
  }

  miniName.textContent = u.username;
  miniUser.textContent = `@${u.username}`;
}

async function loadCurrent({ append = false } = {}) {
  if (isLoading) return;
  isLoading = true;

  try {
    if (!append) {
      reachedEnd = false;
      postsRoot.innerHTML = "";
    }

    const endpoint =
      mode === "feed" ? `/api/feed?page=${page}&limit=${limit}` : `/api/posts?page=${page}&limit=${limit}`;
    const data = await api(endpoint);

    const items = data.items || [];
    if (!items.length) reachedEnd = true;

    pageInfo.textContent =
      mode === "feed"
        ? `Following feed · page ${data.page ?? page}`
        : `For you · page ${data.page ?? page} / total ${data.total ?? "—"}`;

    renderPosts(items, { append });
  } finally {
    isLoading = false;
  }
}

function heartIcon() {
  return `
    <span class="heart" aria-hidden="true">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21s-7-4.6-9.5-9.1C.9 8.7 3 6 6.2 6c1.9 0 3.2 1 3.8 1.8C10.6 7 11.9 6 13.8 6 17 6 19.1 8.7 21.5 11.9 19 16.4 12 21 12 21Z" stroke-linejoin="round" stroke-linecap="round" stroke-width="2"/>
      </svg>
    </span>`;
}

function renderPosts(items, { append = false } = {}) {
  if (!append) postsRoot.innerHTML = "";

  if (!items.length) {
    postsRoot.innerHTML = `<div class="post"><div class="muted small">No posts yet</div></div>`;
    return;
  }

  items.forEach((p) => {
    const author = p.author?.username || "unknown";
    const authorAvatar = p.author?.avatarUrl;
    const created = p.createdAt ? new Date(p.createdAt).toLocaleString() : "";

    const el = document.createElement("div");
    el.className = "post";

    const avatarEl = authorAvatar
      ? `<img src="${escapeHtml(authorAvatar)}" alt="" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">`
      : `<div class="miniAvatar"></div>`;

    el.innerHTML = `
      <div class="postTop">
        <div style="display:flex;gap:10px;align-items:center;">
          ${avatarEl}
          <div>
            <span class="postAuthor">@${escapeHtml(author)}</span>
            <span class="badge">· ${escapeHtml(created)}</span>
          </div>
        </div>
      </div>

      <div class="postText">${escapeHtml(p.text)}</div>

      <div class="postActions">
        <button class="likeBtn ${p.likedByMe ? "liked" : ""}" data-like-toggle="${p._id}" type="button">${heartIcon()} <span>Like</span> <span class="badge" data-like-count="${p._id}">${p.likesCount || 0}</span></button>
        <button class="ghost" data-comments="${p._id}">Comments <span class="badge">${p.commentsCount || 0}</span></button>
      </div>

      <div class="comments hidden" id="c_${p._id}">
        <form class="form" data-add-comment="${p._id}">
          <input name="text" placeholder="Write a comment..." maxlength="300" required />
          <button class="primary" type="submit">Reply</button>
        </form>
        <div class="muted small">Loading comments...</div>
      </div>
    `;
    postsRoot.appendChild(el);
  });

  postsRoot.querySelectorAll("[data-like-toggle]").forEach((b) => {
    b.addEventListener("click", async () => {
      if (!getToken()) return toast("Login first");

      const postId = b.dataset.likeToggle;
      const countEl = postsRoot.querySelector(`[data-like-count="${CSS.escape(postId)}"]`);
      const prevLiked = b.classList.contains("liked");
      const prevCount = Number(countEl?.textContent || 0);

      b.classList.toggle("liked", !prevLiked);
      b.classList.add("burst");
      setTimeout(() => b.classList.remove("burst"), 500);
      if (countEl) countEl.textContent = String(Math.max(0, prevCount + (prevLiked ? -1 : 1)));

      try {
        await api(`/api/posts/${postId}/like`, { method: prevLiked ? "DELETE" : "POST" });
      } catch (e) {
        b.classList.toggle("liked", prevLiked);
        if (countEl) countEl.textContent = String(prevCount);
        toast(e.message);
      }
    });
  });

  postsRoot.querySelectorAll("[data-comments]").forEach((b) => {
    b.addEventListener("click", async () => {
      const postId = b.dataset.comments;
      const box = document.getElementById(`c_${postId}`);
      box.classList.toggle("hidden");
      if (!box.classList.contains("hidden")) await loadComments(postId);
    });
  });

  postsRoot.querySelectorAll("form[data-add-comment]").forEach((f) => {
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const postId = f.dataset.addComment;
      const fd = new FormData(f);
      const text = (fd.get("text") || "").trim();
      if (!text) return;

      try {
        await api(`/api/posts/${postId}/comments`, { method: "POST", body: { text } });
        f.reset();
        await loadComments(postId);
        await loadCurrent();
      } catch (err) {
        toast(err.message);
      }
    });
  });
}

async function loadComments(postId) {
  const box = document.getElementById(`c_${postId}`);
  try {
    const data = await api(`/api/posts/${postId}/comments?page=1&limit=10`);
    const items = data.items || [];
    const html = items
      .map((c) => {
        const author = c.author?.username || "unknown";
        return `<div class="comment"><b>@${escapeHtml(author)}</b>: ${escapeHtml(c.text)}</div>`;
      })
      .join("");

    const placeholder = box.querySelector(".muted");
    if (placeholder) placeholder.outerHTML = html || `<div class="muted small">No comments</div>`;
    else box.insertAdjacentHTML("beforeend", html || `<div class="muted small">No comments</div>`);
  } catch (err) {
    toast(err.message);
  }
}

function renderList(id, items) {
  const root = $(id);
  root.innerHTML = items
    .map(
      (x) => `
    <div class="listItem">
      <div class="listTitle">${escapeHtml(x.title)}</div>
      <div class="listSub">${escapeHtml(x.sub)}</div>
    </div>`
    )
    .join("");
}

function seedRightBar() {
  renderList("trends", [
    { title: "#Connectify", sub: "Trending in Kazakhstan · 12.4K posts" },
    { title: "#AITU", sub: "Tech · 6,120 posts" },
    { title: "#MongoDB", sub: "Databases · 4,901 posts" },
    { title: "#NodeJS", sub: "Backend · 3,210 posts" },
  ]);

  renderList("news", [
    { title: "Connectify deployed on Render", sub: "Project · Today" },
    { title: "JWT security for REST APIs", sub: "Dev · 2h ago" },
    { title: "MongoDB modelling tips", sub: "Databases · 1d ago" },
  ]);

  renderList("suggestions", [
    { title: "@nurbol", sub: "Suggested for you" },
    { title: "@adilbek", sub: "Suggested for you" },
    { title: "@connectify", sub: "Official" },
  ]);

  $("searchResults").innerHTML = `<div class="muted small">Search for users to follow</div>`;
}

async function doSearch() {
  const q = (searchInput.value || "").trim();
  if (!q) {
    searchResults.innerHTML = `<div class="muted small">Type a username…</div>`;
    return;
  }

  try {
    const data = await api(`/api/users/search?q=${encodeURIComponent(q)}`);
    const items = data.items || data.users || [];

    if (!items.length) {
      searchResults.innerHTML = `<div class="muted small">No users found</div>`;
      return;
    }

    searchResults.innerHTML = items
      .map((u) => {
        const id = u._id || u.id;
        const uname = u.username || "unknown";
        return `
          <div class="listItem">
            <div class="listTitle">
              @${escapeHtml(uname)}
              <button class="followBtn" data-follow="${escapeHtml(id)}" type="button">Follow</button>
            </div>
            <div class="listSub">${escapeHtml(u.email || "")}</div>
          </div>
        `;
      })
      .join("");

    searchResults.querySelectorAll("[data-follow]").forEach((b) => {
      b.addEventListener("click", async () => {
        if (!getToken()) return toast("Login first");
        try {
          await api(`/api/follows/${b.dataset.follow}`, { method: "POST" });
          toast("Followed ✅");
        } catch (e) {
          toast(e.message);
        }
      });
    });
  } catch (e) {
    toast(e.message);
  }
}

openComposer.addEventListener("click", () => {
  if (!getToken()) {
    showAuth();
    toast("Please login first");
    return;
  }
  composer.classList.toggle("hidden");
  if (!composer.classList.contains("hidden")) postText.focus();
});

postBtn.addEventListener("click", async () => {
  if (!getToken()) return toast("Login first");
  const text = (postText.value || "").trim();
  if (!text) return toast("Text required");

  try {
    await api("/api/posts", { method: "POST", body: { text, mediaUrls: [] } });
    postText.value = "";
    toast("Posted");
    page = 1;
    await loadCurrent({ append: false });
  } catch (e) {
    toast(e.message);
  }
});

logoutBtn.addEventListener("click", () => {
  clearToken();
  toast("Logged out");
  boot();
});

tabForYou.addEventListener("click", async () => {
  if (!getToken()) return showAuth();
  mode = "posts";
  setTabs();
  page = 1;
  await loadCurrent({ append: false });
});

tabFollowing.addEventListener("click", async () => {
  if (!getToken()) return showAuth();
  mode = "feed";
  setTabs();
  page = 1;
  await loadCurrent({ append: false });
});

prevPage.addEventListener("click", async () => {
  if (!getToken()) return showAuth();
  if (page <= 1) return;
  page -= 1;
  await loadCurrent({ append: false });
});

nextPage.addEventListener("click", async () => {
  if (!getToken()) return showAuth();
  if (reachedEnd) return;
  page += 1;
  await loadCurrent({ append: false });
});

searchBtn.addEventListener("click", doSearch);
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") doSearch();
});

document.querySelectorAll(".navItem").forEach((btn) => {
  btn.addEventListener("click", async () => {
    document.querySelectorAll(".navItem").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const view = btn.dataset.view;

    if (!getToken()) {
      showAuth();
      toast("Please login first");
      return;
    }

    if (view === "home") {
      mode = "posts";
      setTabs();
      page = 1;
      showView("home");
      await loadCurrent({ append: false });
      return;
    }

    if (view === "following") {
      mode = "feed";
      setTabs();
      page = 1;
      showView("following");
      await loadCurrent({ append: false });
      return;
    }

    if (view === "profile") {
      showView("profile");
      if (profileCard) profileCard.innerHTML = `<div class="muted small">Loading...</div>`;
      await loadMyProfile();
      return;
    }

    if (view === "notifications") {
      showView("notifications");
      await loadNotifications();
      return;
    }
  });
});

$("authTabLogin")?.addEventListener("click", () => setAuthTab("login"));
$("authTabRegister")?.addEventListener("click", () => setAuthTab("register"));
async function boot() {
  seedRightBar();

  const token = getToken();
  if (!token) {
    showAuth();
    setTabs();
    return;
  }

  showApp();
  setTabs();
  showView("home");

  try {
    await loadMe();
    page = 1;
    await loadCurrent({ append: false });
  } catch (err) {
    clearToken();
    toast("Session expired. Please login again.");
    showAuth();
  }
}

boot();
