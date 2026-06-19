// ─────────────────────────────────────────────────────
// post.js — Individual post page logic
// ─────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
  initThemeToggle();
  initNavToggle();

  const slug = getSlugFromUrl();
  if (!slug) { showError("No post specified."); return; }

  const post = await fetchPostBySlug(slug);
  if (!post) { showError("Post not found. It may have been moved or deleted."); return; }

  renderPost(post);
  updatePageMeta(post);
  initProgressBar();
  initShareButtons(post);

  const allPosts = await fetchPosts();
  renderRelated(post, allPosts);
});

function getSlugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("slug") || "";
}

function renderPost(post) {
  document.getElementById("postLoading").style.display = "none";
  document.getElementById("postContent").style.display = "block";

  const tech = Array.isArray(post.tech) ? post.tech : [post.tech];
  document.getElementById("postTags").innerHTML = renderTags(tech);
  document.getElementById("postTitle").textContent = post.title;
  document.getElementById("postDate").textContent = formatDate(post.date);
  document.getElementById("postReading").textContent = `${post.readingTime} min read`;

  const cat = CONFIG.TECH_MAP[tech[0]] || { cat: "azure" };
  const catInfo = CONFIG.CATEGORIES[cat.cat] || { name: tech[0] };
  const breadCat = document.getElementById("breadcrumbCat");
  breadCat.textContent = catInfo.name;
  breadCat.href = `category.html?cat=${cat.cat}`;
  document.getElementById("breadcrumbTitle").textContent =
    post.title.length > 50 ? post.title.substring(0, 50) + "..." : post.title;

  const body = document.getElementById("postBody");
  body.innerHTML = processContent(post.content || "");

  buildTOC(body);

  if (window.Prism) Prism.highlightAllUnder(body);

  window.scrollTo(0, 0);
}

function processContent(html) {
  return html.replace(/<pre>([\s\S]*?)<\/pre>/gi, (match, code) => {
    if (match.includes("<code")) return match;
    const lang = detectLanguage(code);
    const escaped = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<pre><code class="language-${lang}">${escaped}</code></pre>`;
  });
}

function detectLanguage(code) {
  if (/\b(public|private|namespace|using|class|async|await|Task|var|string|int|bool)\b/.test(code)) return "csharp";
  if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|FROM|WHERE|JOIN)\b/i.test(code)) return "sql";
  if (/\b(function|const|let|var|async|await|fetch|=>)\b/.test(code)) return "javascript";
  if (/<[a-z]+[\s>]/.test(code) && /\/>/.test(code)) return "markup";
  if (/^\s*(name:|on:|jobs:|steps:|uses:)/m.test(code)) return "yaml";
  if (/^\s*\{/.test(code.trim())) return "json";
  return "csharp";
}

function buildTOC(body) {
  const headings = body.querySelectorAll("h3");
  const nav = document.getElementById("tocNav");
  const sidebar = document.getElementById("tocSidebar");

  if (headings.length < 3) { if (sidebar) sidebar.style.display = "none"; return; }

  headings.forEach((h, i) => {
    const id = `section-${i}`;
    h.id = id;
    const link = document.createElement("a");
    link.className = "toc-link";
    link.href = `#${id}`;
    link.textContent = h.textContent;
    link.addEventListener("click", e => {
      e.preventDefault();
      h.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    nav.appendChild(link);
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll(".toc-link").forEach(l => l.classList.remove("active"));
        const active = nav.querySelector(`[href="#${entry.target.id}"]`);
        if (active) active.classList.add("active");
      }
    });
  }, { rootMargin: "-80px 0px -60% 0px" });

  headings.forEach(h => observer.observe(h));
}

function initProgressBar() {
  const bar = document.getElementById("progressBar");
  if (!bar) return;
  window.addEventListener("scroll", () => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const scroll = window.scrollY;
    bar.style.width = docH > 0 ? `${(scroll / docH) * 100}%` : "0%";
  });
}

function initShareButtons(post) {
  const url = encodeURIComponent(`${CONFIG.SITE_URL}/post.html?slug=${post.slug}`);
  const title = encodeURIComponent(post.title);
  const via = encodeURIComponent("techstackblog");

  const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
  const twUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}&via=${via}`;
  const rdUrl = `https://www.reddit.com/submit?url=${url}&title=${title}`;

  setHref("shareLinkedIn", liUrl);
  setHref("shareTwitter", twUrl);
  setHref("shareReddit", rdUrl);
  setHref("shareLinkedIn2", liUrl);
  setHref("shareTwitter2", twUrl);
  setHref("shareReddit2", rdUrl);

  const copyBtn = document.getElementById("shareCopy");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const rawUrl = `${CONFIG.SITE_URL}/post.html?slug=${post.slug}`;
      navigator.clipboard.writeText(rawUrl).then(() => {
        copyBtn.textContent = "Copied! ✓";
        setTimeout(() => { copyBtn.textContent = "Copy link"; }, 2000);
      });
    });
  }
}

function setHref(id, url) {
  const el = document.getElementById(id);
  if (el) el.href = url;
}

function renderRelated(current, allPosts) {
  const container = document.getElementById("relatedPosts");
  if (!container) return;

  const currentTech = Array.isArray(current.tech) ? current.tech[0] : current.tech;

  const related = allPosts.filter(p => {
    if (p.slug === current.slug) return false;
    const tags = Array.isArray(p.tech) ? p.tech : [p.tech];
    return tags.includes(currentTech);
  }).slice(0, 3);

  if (related.length < 3) {
    const others = allPosts.filter(p => p.slug !== current.slug && !related.find(r => r.slug === p.slug)).slice(0, 3 - related.length);
    related.push(...others);
  }

  if (!related.length) { container.closest(".related-section").style.display = "none"; return; }

  container.innerHTML = related.map(p => `
    <a class="post-card" href="${postUrl(p.slug)}">
      <div class="post-card-tags">${renderTags(p.tech)}</div>
      <h3 class="post-card-title">${p.title}</h3>
      <p class="post-card-excerpt">${p.excerpt || ""}</p>
      <div class="post-card-meta">${formatDate(p.date)} · ${p.readingTime} min read</div>
    </a>`).join("");
}

function updatePageMeta(post) {
  const url = `${CONFIG.SITE_URL}/post.html?slug=${post.slug}`;
  document.title = `${post.title} | TechStack Blog`;
  setMeta("description", post.excerpt || post.title);
  setMeta("og:title", post.title);
  setMeta("og:description", post.excerpt || "");
  setMeta("og:url", url);
  setCanonical(url);
}

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  if (el) el.setAttribute("content", content);
}

function setCanonical(url) {
  let el = document.getElementById("canonical");
  if (el) el.href = url;
}

function showError(msg) {
  document.getElementById("postLoading").innerHTML = `
    <div style="text-align:center;padding:4rem;">
      <div style="font-size:2rem;margin-bottom:1rem;">😕</div>
      <p style="color:var(--text2)">${msg}</p>
      <a href="/" style="margin-top:1rem;display:inline-block;font-family:var(--font-mono);font-size:0.85rem;color:var(--accent)">← Back to all posts</a>
    </div>`;
}
