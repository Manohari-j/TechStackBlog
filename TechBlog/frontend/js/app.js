// ─────────────────────────────────────────────────────────────────
// app.js — TechStack Blog Frontend
//
// HOW THIS WORKS:
// 1. On page load, we call the API to get all blog posts
// 2. The API (C# / ASP.NET) queries Azure SQL and returns JSON
// 3. We render the posts as cards using plain DOM manipulation
// 4. Clicking a card opens a modal with the full post content
//
// When running LOCALLY without a backend, we use MOCK_DATA below.
// When deployed to Azure, set API_BASE_URL to your Azure App Service URL.
// ─────────────────────────────────────────────────────────────────

const API_BASE_URL = "https://your-api.azurewebsites.net/api";
// Change this ↑ to your actual Azure API URL when deployed.
// For local development: "http://localhost:5000/api"

// ─── MOCK DATA (used when API is unavailable) ───────────────────
// This mirrors the exact JSON your C# API will return.
// Each object matches the BlogPost model in the backend.

const MOCK_POSTS = [
  {
    id: 1,
    title: "HTML & CSS: The Foundation of Every Web Page",
    slug: "html-css-foundation",
    tech: ["HTML/CSS"],
    excerpt: "HTML gives a page structure. CSS gives it style. Together they are the bones and skin of every website you have ever visited.",
    date: "2025-01-15",
    readingTime: 8,
    content: `
      <h2>HTML & CSS: The Foundation of Every Web Page</h2>
      <p class="meta">Jan 15, 2025 · 8 min read · HTML/CSS</p>

      <h3>What is HTML?</h3>
      <p>HTML (HyperText Markup Language) is a set of <em>tags</em> that describe the structure of a web page. It is not a programming language — it cannot do math or make decisions. It simply says: "this is a heading", "this is a paragraph", "this is a button".</p>
      <pre>&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;My Blog&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Hello, World!&lt;/h1&gt;
    &lt;p&gt;This is my first post.&lt;/p&gt;
  &lt;/body&gt;
&lt;/html&gt;</pre>

      <h3>What is CSS?</h3>
      <p>CSS (Cascading Style Sheets) controls how HTML looks. Colors, fonts, layout, spacing — all CSS. It "cascades" because multiple rules can apply to the same element, and the browser resolves which wins using specificity.</p>
      <pre>/* Target all h1 elements */
h1 {
  color: #1D4ED8;
  font-size: 2.5rem;
  font-family: 'Georgia', serif;
}

/* Target only elements with class="post-card" */
.post-card {
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 1.5rem;
}</pre>

      <h3>CSS Variables — the modern superpower</h3>
      <p>Modern CSS supports variables (custom properties). This entire blog's theme — light mode, dark mode, colors — is driven by CSS variables.</p>
      <pre>:root {
  --accent: #1D4ED8;   /* blue */
  --bg: #FAFAF7;        /* near-white */
}

[data-theme="dark"] {
  --accent: #60A5FA;   /* lighter blue for dark mode */
  --bg: #111110;
}</pre>

      <h3>In this project</h3>
      <ul>
        <li>HTML structures the blog layout (header, cards, modal)</li>
        <li>CSS handles theming, responsive grid, animations</li>
        <li>No frameworks — pure vanilla HTML/CSS</li>
        <li>Everything is one file: <code>index.html</code> + <code>styles.css</code></li>
      </ul>

      <h3>What to learn next</h3>
      <p>CSS Grid and Flexbox are the two layout systems that replaced the old "table-based" layouts. Learn both — they solve different problems. MDN Web Docs (developer.mozilla.org) is the best reference.</p>
    `
  },
  {
    id: 2,
    title: "JavaScript: Making Pages Come Alive",
    slug: "javascript-interactivity",
    tech: ["JavaScript"],
    excerpt: "JavaScript is the only language that runs natively in the browser. It lets you fetch data, respond to clicks, and update the page without reloading.",
    date: "2025-01-22",
    readingTime: 10,
    content: `
      <h2>JavaScript: Making Pages Come Alive</h2>
      <p class="meta">Jan 22, 2025 · 10 min read · JavaScript</p>

      <h3>What is JavaScript?</h3>
      <p>JavaScript is a programming language that runs <em>inside the browser</em>. It is the only language browsers can execute natively (without a plugin). It can read and change HTML, respond to user events (clicks, keystrokes), and call APIs over the network.</p>

      <h3>The DOM — your bridge to HTML</h3>
      <p>The DOM (Document Object Model) is the browser's in-memory representation of your HTML page. JavaScript reads and writes the DOM to change what users see.</p>
      <pre>// Find an element by its id
const grid = document.getElementById('postsGrid');

// Create a new element
const card = document.createElement('div');
card.className = 'post-card';
card.textContent = 'Hello!';

// Add it to the page
grid.appendChild(card);</pre>

      <h3>Fetch API — talking to your backend</h3>
      <p>The Fetch API is how JavaScript calls your C# REST API. It is asynchronous — it doesn't block the page while waiting for a response.</p>
      <pre>// async/await style — modern and readable
async function loadPosts() {
  try {
    const response = await fetch('/api/posts');

    if (!response.ok) {
      throw new Error('API returned ' + response.status);
    }

    const posts = await response.json(); // parse JSON
    renderPosts(posts);

  } catch (error) {
    console.error('Failed to load posts:', error);
    showError('Could not load posts. Try again.');
  }
}

loadPosts(); // call it on page load</pre>

      <h3>Events — responding to users</h3>
      <pre>// Listen for a click on any card
document.querySelectorAll('.post-card').forEach(card => {
  card.addEventListener('click', () => {
    const postId = card.dataset.postId;
    openModal(postId);
  });
});</pre>

      <h3>In this project</h3>
      <ul>
        <li>JavaScript calls the C# API: <code>GET /api/posts</code></li>
        <li>Renders returned JSON as HTML cards</li>
        <li>Opens/closes the modal with post content</li>
        <li>Handles dark mode toggle (writes to <code>localStorage</code>)</li>
        <li>Falls back to mock data if the API is offline</li>
      </ul>
    `
  },
  {
    id: 3,
    title: "SQL: The Language of Databases",
    slug: "sql-database-basics",
    tech: ["SQL"],
    excerpt: "SQL (Structured Query Language) is how you store, retrieve, and organize data. Every serious web application uses a relational database.",
    date: "2025-01-29",
    readingTime: 12,
    content: `
      <h2>SQL: The Language of Databases</h2>
      <p class="meta">Jan 29, 2025 · 12 min read · SQL</p>

      <h3>What is a relational database?</h3>
      <p>A relational database stores data in <em>tables</em> — like spreadsheet tabs — with rows (records) and columns (fields). Tables relate to each other via foreign keys. Azure SQL is Microsoft's cloud-hosted relational database, powered by SQL Server.</p>

      <h3>Creating tables</h3>
      <pre>-- Create the Posts table
CREATE TABLE Posts (
    Id          INT PRIMARY KEY IDENTITY(1,1),
    Title       NVARCHAR(200)   NOT NULL,
    Slug        NVARCHAR(200)   NOT NULL UNIQUE,
    Excerpt     NVARCHAR(500),
    Content     NVARCHAR(MAX)   NOT NULL,
    Tech        NVARCHAR(200),
    ReadingTime INT             DEFAULT 5,
    CreatedAt   DATETIME2       DEFAULT GETUTCDATE(),
    IsPublished BIT             DEFAULT 1
);

-- Create the Tags table
CREATE TABLE Tags (
    Id   INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL UNIQUE
);</pre>

      <h3>The four core operations: CRUD</h3>
      <pre>-- CREATE (INSERT)
INSERT INTO Posts (Title, Slug, Excerpt, Content, Tech)
VALUES ('My First Post', 'my-first-post', 'A short excerpt...', 'Full content here...', 'SQL');

-- READ (SELECT)
SELECT Id, Title, Excerpt, CreatedAt
FROM   Posts
WHERE  IsPublished = 1
ORDER  BY CreatedAt DESC;

-- UPDATE
UPDATE Posts
SET    Title = 'Updated Title'
WHERE  Id = 1;

-- DELETE
DELETE FROM Posts
WHERE  Id = 1;</pre>

      <h3>JOINs — combining tables</h3>
      <pre>-- Get posts with their view count
SELECT p.Title, p.CreatedAt, COUNT(v.Id) AS Views
FROM   Posts p
LEFT   JOIN PostViews v ON v.PostId = p.Id
GROUP  BY p.Id, p.Title, p.CreatedAt
ORDER  BY Views DESC;</pre>

      <h3>In this project</h3>
      <ul>
        <li>Azure SQL hosts the database in the cloud</li>
        <li>The C# API uses Entity Framework Core to query it</li>
        <li>EF Core translates C# LINQ to SQL automatically</li>
        <li>The schema file is in <code>database/schema.sql</code></li>
      </ul>
    `
  },
  {
    id: 4,
    title: "C# REST API with ASP.NET Core",
    slug: "csharp-rest-api",
    tech: ["C#"],
    excerpt: "C# is Microsoft's elegant, statically-typed language. ASP.NET Core lets you build fast, cross-platform REST APIs that your JavaScript frontend can call.",
    date: "2025-02-05",
    readingTime: 15,
    content: `
      <h2>C# REST API with ASP.NET Core</h2>
      <p class="meta">Feb 5, 2025 · 15 min read · C# / .NET</p>

      <h3>What is a REST API?</h3>
      <p>A REST API is a set of URLs (endpoints) your frontend can call to read or write data. It communicates using HTTP verbs: GET (read), POST (create), PUT (update), DELETE (remove). Responses are JSON.</p>

      <h3>Controller — the entry point</h3>
      <pre>// Controllers/PostsController.cs
[ApiController]
[Route("api/[controller]")]
public class PostsController : ControllerBase
{
    private readonly IPostService _postService;

    public PostsController(IPostService postService)
    {
        _postService = postService;
    }

    // GET /api/posts
    [HttpGet]
    public async Task&lt;ActionResult&lt;IEnumerable&lt;PostDto&gt;&gt;&gt; GetAll()
    {
        var posts = await _postService.GetAllAsync();
        return Ok(posts);
    }

    // GET /api/posts/html-css-foundation
    [HttpGet("{slug}")]
    public async Task&lt;ActionResult&lt;PostDto&gt;&gt; GetBySlug(string slug)
    {
        var post = await _postService.GetBySlugAsync(slug);
        if (post == null) return NotFound();
        return Ok(post);
    }

    // POST /api/posts
    [HttpPost]
    [Authorize]  // requires authentication
    public async Task&lt;ActionResult&lt;PostDto&gt;&gt; Create([FromBody] CreatePostDto dto)
    {
        var post = await _postService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetBySlug),
            new { slug = post.Slug }, post);
    }
}</pre>

      <h3>Entity Framework Core — C# to SQL</h3>
      <pre>// No raw SQL needed! EF Core translates LINQ to SQL.
public async Task&lt;IEnumerable&lt;PostDto&gt;&gt; GetAllAsync()
{
    return await _context.Posts
        .Where(p =&gt; p.IsPublished)
        .OrderByDescending(p =&gt; p.CreatedAt)
        .Select(p =&gt; new PostDto
        {
            Id          = p.Id,
            Title       = p.Title,
            Slug        = p.Slug,
            Excerpt     = p.Excerpt,
            Tech        = p.Tech,
            ReadingTime = p.ReadingTime,
            Date        = p.CreatedAt.ToString("yyyy-MM-dd")
        })
        .ToListAsync();
}</pre>

      <h3>In this project</h3>
      <ul>
        <li>ASP.NET Core 8 Minimal API or Controller-based</li>
        <li>Entity Framework Core 8 for database access</li>
        <li>CORS configured to allow the frontend origin</li>
        <li>Azure Key Vault stores the connection string (never hardcoded)</li>
        <li>App Insights logs every request automatically</li>
      </ul>
    `
  },
  {
    id: 5,
    title: "REST API Design: Principles & Patterns",
    slug: "rest-api-design",
    tech: ["REST API"],
    excerpt: "A well-designed API is intuitive, consistent, and hard to misuse. Learn the naming conventions, status codes, and versioning strategies used in production.",
    date: "2025-02-12",
    readingTime: 11,
    content: `
      <h2>REST API Design: Principles & Patterns</h2>
      <p class="meta">Feb 12, 2025 · 11 min read · REST API</p>

      <h3>REST is a style, not a protocol</h3>
      <p>REST (Representational State Transfer) is a set of architectural constraints, not a spec. The core ideas: use HTTP verbs for actions, use nouns for resources, be stateless (each request is self-contained).</p>

      <h3>URL conventions</h3>
      <pre>✅ GOOD                        ❌ BAD
GET    /api/posts              GET /api/getPosts
GET    /api/posts/42           GET /api/getPostById?id=42
POST   /api/posts              POST /api/createPost
PUT    /api/posts/42           POST /api/updatePost
DELETE /api/posts/42           POST /api/deletePost</pre>

      <h3>HTTP Status Codes</h3>
      <pre>200 OK            — Request succeeded, returns data
201 Created       — Resource was created (use with POST)
204 No Content    — Success, nothing to return (use with DELETE)
400 Bad Request   — Client sent invalid data
401 Unauthorized  — Not logged in
403 Forbidden     — Logged in but not allowed
404 Not Found     — Resource doesn't exist
500 Internal Error — Something broke on the server</pre>

      <h3>Response envelope</h3>
      <pre>// Consistent response wrapper
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 42,
    "page": 1,
    "pageSize": 10
  }
}

// Error response — same shape
{
  "success": false,
  "error": {
    "code": "POST_NOT_FOUND",
    "message": "No post found with slug 'xyz'"
  }
}</pre>

      <h3>CORS — why browsers block API calls</h3>
      <p>Browsers enforce CORS (Cross-Origin Resource Sharing) to prevent malicious sites from reading your data. Your C# API must explicitly allow your frontend's origin.</p>
      <pre>// Program.cs
builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("https://your-blog.azurestaticapps.net")
              .AllowAnyMethod()
              .AllowAnyHeader());
});</pre>
    `
  },
  {
    id: 6,
    title: "Microsoft Azure: Hosting in the Cloud",
    slug: "azure-cloud-hosting",
    tech: ["Azure"],
    excerpt: "Azure is Microsoft's cloud platform with 200+ services. For this blog we use Static Web Apps, App Service, Azure SQL, Key Vault, and Application Insights.",
    date: "2025-02-19",
    readingTime: 14,
    content: `
      <h2>Microsoft Azure: Hosting in the Cloud</h2>
      <p class="meta">Feb 19, 2025 · 14 min read · Azure</p>

      <h3>What is cloud hosting?</h3>
      <p>Instead of buying and maintaining a physical server, you rent computing resources from Microsoft on demand. You pay for what you use, they handle hardware failures and security patches.</p>

      <h3>Azure services used in this project</h3>

      <h3>1. Azure Static Web Apps (Frontend)</h3>
      <p>Hosts HTML/CSS/JS files with global CDN distribution. Free tier available. Auto-deploys from GitHub on every push.</p>
      <pre># Automatic CI/CD — just push to main branch
git add .
git commit -m "Add new post"
git push origin main
# Azure detects the push → builds → deploys automatically</pre>

      <h3>2. Azure App Service (C# API Backend)</h3>
      <p>A managed platform for running your ASP.NET Core API. Handles HTTPS, load balancing, auto-scaling. Free tier (F1) available for learning.</p>

      <h3>3. Azure SQL Database</h3>
      <p>Fully managed SQL Server in the cloud. Automatic backups, high availability. Free tier: 32 GB, 100,000 vCore-seconds/month.</p>

      <h3>4. Azure Key Vault (Secrets)</h3>
      <p>Stores secrets (database passwords, API keys) so they never appear in code or GitHub.</p>
      <pre>// Retrieve secret in C# — never hardcode passwords!
var client = new SecretClient(
    new Uri("https://your-vault.vault.azure.net/"),
    new DefaultAzureCredential()
);
var secret = await client.GetSecretAsync("DbConnectionString");</pre>

      <h3>5. Application Insights (Monitoring)</h3>
      <p>Automatically collects logs, request traces, exceptions, and performance metrics. Free 5 GB/month. You can see every API call in the Azure portal.</p>

      <h3>Free tier summary</h3>
      <ul>
        <li>Static Web Apps: Free forever (100 GB bandwidth/month)</li>
        <li>App Service F1: Free (60 CPU-minutes/day, no custom domain)</li>
        <li>Azure SQL: Free 100,000 vCore-seconds/month</li>
        <li>Key Vault: First 10,000 operations/month free</li>
        <li>App Insights: 5 GB data ingestion/month free</li>
      </ul>
    `
  }
];

// ─── STATE ──────────────────────────────────────────────────────
let allPosts = [];

// ─── TAG RENDERING ───────────────────────────────────────────────
function getTechClass(tech) {
  const map = {
    "HTML/CSS": "tag-html",
    "JavaScript": "tag-js",
    "SQL": "tag-sql",
    "C#": "tag-cs",
    "REST API": "tag-api",
    "Azure": "tag-azure"
  };
  return map[tech] || "tag-azure";
}

function renderTags(techArray) {
  return techArray.map(t =>
    `<span class="tag ${getTechClass(t)}">${t}</span>`
  ).join("");
}

// ─── RENDER POSTS GRID ───────────────────────────────────────────
function renderPosts(posts) {
  const grid = document.getElementById("postsGrid");
  if (!posts.length) {
    grid.innerHTML = `<p class="loading-state">No posts found.</p>`;
    return;
  }
  grid.innerHTML = posts.map(post => `
    <article class="post-card" data-post-id="${post.id}" role="button" tabindex="0">
      <div class="post-card-tag">${renderTags(post.tech)}</div>
      <h3 class="post-card-title">${post.title}</h3>
      <p class="post-card-excerpt">${post.excerpt}</p>
      <div class="post-card-meta">
        ${post.date} · ${post.readingTime} min read
      </div>
    </article>
  `).join("");

  // Attach click handlers
  grid.querySelectorAll(".post-card").forEach(card => {
    card.addEventListener("click", () => openPost(parseInt(card.dataset.postId)));
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") openPost(parseInt(card.dataset.postId));
    });
  });
}

// ─── RENDER RECENT LIST ──────────────────────────────────────────
function renderRecent(posts) {
  const list = document.getElementById("recentList");
  list.innerHTML = posts.slice(0, 6).map(post => `
    <div class="recent-item" data-post-id="${post.id}" role="button" tabindex="0">
      <span class="recent-date">${post.date}</span>
      <span class="recent-title">${post.title}</span>
      <div class="recent-tags">${renderTags(post.tech)}</div>
    </div>
  `).join("");

  list.querySelectorAll(".recent-item").forEach(item => {
    item.addEventListener("click", () => openPost(parseInt(item.dataset.postId)));
  });
}

// ─── MODAL ───────────────────────────────────────────────────────
function openPost(id) {
  const post = allPosts.find(p => p.id === id);
  if (!post) return;

  const modal   = document.getElementById("postModal");
  const content = document.getElementById("modalContent");
  content.innerHTML = post.content;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closePost() {
  document.getElementById("postModal").hidden = true;
  document.body.style.overflow = "";
}

document.getElementById("modalClose").addEventListener("click", closePost);
document.getElementById("modalBackdrop").addEventListener("click", closePost);
document.addEventListener("keydown", e => { if (e.key === "Escape") closePost(); });

// ─── API CALL ────────────────────────────────────────────────────
// This function tries the real API first.
// If it fails (local dev, API not deployed yet), falls back to mock data.
async function loadPosts() {
  const grid = document.getElementById("postsGrid");

  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(5000) // 5-second timeout
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    allPosts = await response.json();
    console.log(`✅ Loaded ${allPosts.length} posts from API`);
  } catch (err) {
    console.warn("⚠️  API unavailable, using mock data.", err.message);
    allPosts = MOCK_POSTS;
  }

  renderPosts(allPosts);
  renderRecent(allPosts);
}

// ─── DARK MODE ───────────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);
}

document.getElementById("themeToggle").addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
});

// ─── INIT ────────────────────────────────────────────────────────
initTheme();
loadPosts();
