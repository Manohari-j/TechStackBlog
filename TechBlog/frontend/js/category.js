// ─────────────────────────────────────────────────────
// category.js — Category page logic
// ─────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
  initThemeToggle();
  initNavToggle();

  const catKey = new URLSearchParams(window.location.search).get("cat") || "azure";
  const catInfo = CONFIG.CATEGORIES[catKey];

  if (!catInfo) {
    document.getElementById("catTitle").textContent = "Category not found";
    return;
  }

  document.getElementById("catName").textContent = catInfo.name;
  document.getElementById("catTitle").textContent = `${catInfo.icon} ${catInfo.title}`;
  document.getElementById("catDesc").textContent = catInfo.desc;
  document.title = `${catInfo.name} | TechStack Blog`;

  const canonical = document.getElementById("canonical");
  if (canonical) canonical.href = `${CONFIG.SITE_URL}/category.html?cat=${catKey}`;

  const descMeta = document.getElementById("pageDesc");
  if (descMeta) descMeta.setAttribute("content", catInfo.desc);

  document.querySelectorAll(".main-nav a").forEach(a => {
    if (a.href.includes(`cat=${catKey}`)) a.style.color = "var(--accent)";
  });

  const allPosts = await fetchPosts();
  const catPosts = allPosts.filter(p => {
    const tags = Array.isArray(p.tech) ? p.tech : [p.tech || ""];
    return catInfo.tags.some(t => tags.includes(t));
  });

  const metaEl = document.getElementById("catMeta");
  if (metaEl) metaEl.textContent = `${catPosts.length} post${catPosts.length !== 1 ? "s" : ""}`;

  const grid = document.getElementById("catPostsGrid");
  if (!catPosts.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;padding:3rem;text-align:center;color:var(--text2)">
        <div style="font-size:2rem;margin-bottom:1rem">✍️</div>
        <p>No posts in this category yet.</p>
        <p style="margin-top:0.5rem;font-size:0.9rem">New posts are added weekly — check back soon!</p>
        <a href="/" style="display:inline-block;margin-top:1.5rem;font-family:var(--font-mono);font-size:0.82rem;color:var(--accent)">← View all posts</a>
      </div>`;
    return;
  }

  grid.innerHTML = catPosts.map(p => `
    <a class="post-card" href="${postUrl(p.slug)}">
      <div class="post-card-tags">${renderTags(p.tech)}</div>
      <h3 class="post-card-title">${p.title}</h3>
      <p class="post-card-excerpt">${p.excerpt || ""}</p>
      <div class="post-card-meta">${formatDate(p.date)} · ${p.readingTime} min read</div>
    </a>`).join("");
});
