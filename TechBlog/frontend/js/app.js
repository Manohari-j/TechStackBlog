// ─────────────────────────────────────────────────────
// app.js — Homepage logic
// ─────────────────────────────────────────────────────

let allPosts = [];
let filteredPosts = [];
let currentPage = 1;
let currentCat = "all";
const PER_PAGE = CONFIG.POSTS_PER_PAGE;

document.addEventListener("DOMContentLoaded", async () => {
  initThemeToggle();
  initNavToggle();
  initSearch();
  initCatPills();
  initSort();
  await loadPosts();
});

async function loadPosts() {
  allPosts = await fetchPosts();
  document.getElementById("postCount").textContent = allPosts.length;
  filteredPosts = [...allPosts];
  renderFeatured(allPosts);
  renderGrid();
}

function renderFeatured(posts) {
  const el = document.getElementById("featuredPost");
  if (!posts.length) { el.innerHTML = ""; return; }
  const p = posts[0];
  el.innerHTML = `
    <a class="featured-card" href="${postUrl(p.slug)}">
      <div class="featured-body">
        <div class="featured-label">✦ Latest Post</div>
        <div class="featured-tags">${renderTags(p.tech)}</div>
        <h2 class="featured-title">${p.title}</h2>
        <p class="featured-excerpt">${p.excerpt || ""}</p>
        <div class="featured-meta">${formatDate(p.date)} · ${p.readingTime} min read</div>
      </div>
      <div class="featured-cta">Read post →</div>
    </a>`;
}

function renderGrid() {
  const grid = document.getElementById("postsGrid");
  const title = document.getElementById("postsTitle");

  const posts = currentCat === "all" ? filteredPosts.slice(1) : filteredPosts;

  if (!posts.length) {
    grid.innerHTML = `<p class="loading-state">No posts found in this category yet. Check back soon!</p>`;
    document.getElementById("pagination").innerHTML = "";
    return;
  }

  const totalPages = Math.ceil(posts.length / PER_PAGE);
  const start = (currentPage - 1) * PER_PAGE;
  const pagePosts = posts.slice(start, start + PER_PAGE);

  title.textContent = currentCat === "all" ? "All Posts" : `${currentCat} Posts`;

  grid.innerHTML = pagePosts.map(p => `
    <a class="post-card" href="${postUrl(p.slug)}">
      <div class="post-card-tags">${renderTags(p.tech)}</div>
      <h3 class="post-card-title">${p.title}</h3>
      <p class="post-card-excerpt">${p.excerpt || ""}</p>
      <div class="post-card-meta">${formatDate(p.date)} · ${p.readingTime} min read</div>
    </a>`).join("");

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const el = document.getElementById("pagination");
  if (totalPages <= 1) { el.innerHTML = ""; return; }
  let html = "";
  if (currentPage > 1) html += `<button class="page-btn" onclick="goPage(${currentPage - 1})">← Prev</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === currentPage ? "active" : ""}" onclick="goPage(${i})">${i}</button>`;
  }
  if (currentPage < totalPages) html += `<button class="page-btn" onclick="goPage(${currentPage + 1})">Next →</button>`;
  el.innerHTML = html;
}

function goPage(n) {
  currentPage = n;
  renderGrid();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function initCatPills() {
  document.querySelectorAll(".cat-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".cat-pill").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCat = btn.dataset.cat;
      currentPage = 1;
      const featSection = document.getElementById("featuredSection");
      if (currentCat === "all") {
        filteredPosts = [...allPosts];
        featSection.style.display = "block";
      } else {
        filteredPosts = allPosts.filter(p => {
          const tags = Array.isArray(p.tech) ? p.tech : [p.tech];
          return tags.some(t => t === currentCat);
        });
        featSection.style.display = "none";
      }
      renderGrid();
    });
  });
}

function initSort() {
  const sel = document.getElementById("sortSelect");
  if (!sel) return;
  sel.addEventListener("change", () => {
    const val = sel.value;
    if (val === "newest") filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    else if (val === "oldest") filteredPosts.sort((a, b) => new Date(a.date) - new Date(b.date));
    else if (val === "reading") filteredPosts.sort((a, b) => a.readingTime - b.readingTime);
    currentPage = 1;
    renderGrid();
  });
}

function initSearch() {
  const input = document.getElementById("searchInput");
  const dropdown = document.getElementById("searchResults");
  if (!input || !dropdown) return;

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { dropdown.classList.remove("open"); dropdown.innerHTML = ""; return; }

    const results = allPosts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.excerpt || "").toLowerCase().includes(q) ||
      (Array.isArray(p.tech) ? p.tech.join(" ") : p.tech || "").toLowerCase().includes(q)
    ).slice(0, 6);

    if (!results.length) {
      dropdown.innerHTML = `<div class="search-item"><div class="search-item-title">No results for "${q}"</div></div>`;
    } else {
      dropdown.innerHTML = results.map(p => `
        <a class="search-item" href="${postUrl(p.slug)}">
          <div class="search-item-title">${p.title}</div>
          <div class="search-item-meta">${renderTags(p.tech)} · ${p.readingTime} min read</div>
        </a>`).join("");
    }
    dropdown.classList.add("open");
  });

  document.addEventListener("click", e => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) dropdown.classList.remove("open");
  });

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const first = dropdown.querySelector(".search-item");
      if (first) first.click();
    }
  });
}
