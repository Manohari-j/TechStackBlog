// ─────────────────────────────────────────────────────
// config.js — shared configuration across all pages
// ─────────────────────────────────────────────────────

const CONFIG = {
  API_BASE: "https://techblog-api-h0fdc9hkf5hmadg0.westus2-01.azurewebsites.net/api",
  SITE_URL: "https://www.techstackblog.com",
  POSTS_PER_PAGE: 9,

  TECH_MAP: {
    "Azure":    { label: "Azure",      cls: "tag-azure",  cat: "azure"          },
    "C#":       { label: "C#",         cls: "tag-csharp", cat: "csharp"         },
    "SQL":      { label: "SQL",        cls: "tag-sql",    cat: "database"       },
    "JavaScript":{ label: "JavaScript",cls: "tag-js",     cat: "web"            },
    "HTML/CSS": { label: "HTML/CSS",   cls: "tag-html",   cat: "web"            },
    "REST API": { label: "REST API",   cls: "tag-api",    cat: "web"            },
    "Computer Science": { label: "CS", cls: "tag-cs",     cat: "computer-science"},
    "DevOps":   { label: "DevOps",     cls: "tag-azure",  cat: "devops"         },
  },

  CATEGORIES: {
    "azure": {
      name: "Azure", icon: "☁️", title: "Azure Cloud Engineering",
      desc: "Logic Apps, Service Bus, API Management, Function Apps, Application Insights, CI/CD on Azure — from real production experience.",
      tags: ["Azure", "DevOps"]
    },
    "csharp": {
      name: "C#", icon: "🔷", title: "C# and .NET Development",
      desc: "ASP.NET Core, Entity Framework, LINQ, Lambda expressions, design patterns and modern C# techniques.",
      tags: ["C#"]
    },
    "computer-science": {
      name: "CS Fundamentals", icon: "💡", title: "Computer Science Fundamentals",
      desc: "SOLID Principles, Design Patterns, System Design, OOP concepts and Data Structures — the foundation every engineer needs.",
      tags: ["Computer Science"]
    },
    "web": {
      name: "Web", icon: "🌐", title: "Web Development",
      desc: "HTML, CSS, JavaScript, REST API design — the frontend and API layer of modern web applications.",
      tags: ["HTML/CSS", "JavaScript", "REST API"]
    },
    "database": {
      name: "Database", icon: "🗄️", title: "Database and SQL",
      desc: "SQL fundamentals, Azure SQL, Entity Framework Core queries and database design patterns.",
      tags: ["SQL"]
    },
    "devops": {
      name: "DevOps", icon: "⚙️", title: "DevOps and CI/CD",
      desc: "GitHub Actions, Azure DevOps, YAML pipelines, merge conflicts, deployment strategies.",
      tags: ["DevOps", "Azure"]
    }
  }
};

function getPrimaryTech(post) {
  if (Array.isArray(post.tech)) return post.tech[0] || "Azure";
  if (typeof post.tech === "string") return post.tech.split(",")[0].trim();
  return "Azure";
}

function renderTags(techArray) {
  if (!techArray) return "";
  const tags = Array.isArray(techArray) ? techArray : [techArray];
  return tags.map(t => {
    const info = CONFIG.TECH_MAP[t] || { label: t, cls: "tag-azure" };
    return `<span class="tag ${info.cls}">${info.label}</span>`;
  }).join("");
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function postUrl(slug) {
  return `post.html?slug=${slug}`;
}

function initTheme() {
  const saved = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);
}

function initThemeToggle() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });
}

function initNavToggle() {
  const btn = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  if (!btn || !nav) return;
  btn.addEventListener("click", () => nav.classList.toggle("open"));
}

async function fetchPosts() {
  try {
    const res = await fetch(`${CONFIG.API_BASE}/posts`, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error("API " + res.status);
    return await res.json();
  } catch (e) {
    console.warn("API unavailable, using mock data", e.message);
    return MOCK_POSTS;
  }
}

async function fetchPostBySlug(slug) {
  try {
    const res = await fetch(`${CONFIG.API_BASE}/posts/${slug}`, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error("API " + res.status);
    return await res.json();
  } catch (e) {
    console.warn("API error for slug:", slug, e.message);
    return MOCK_POSTS.find(p => p.slug === slug) || null;
  }
}

const MOCK_POSTS = [
  { id: 1, slug: "html-css-foundation", title: "HTML & CSS: The Foundation of Every Web Page",
    excerpt: "HTML gives a page structure. CSS gives it style.",
    tech: ["HTML/CSS"], readingTime: 8, date: "2026-06-06", content: "<p>Loading from API...</p>" },
  { id: 2, slug: "javascript-interactivity", title: "JavaScript: Making Pages Come Alive",
    excerpt: "JavaScript is the only language that runs natively in the browser.",
    tech: ["JavaScript"], readingTime: 10, date: "2026-06-06", content: "<p>Loading from API...</p>" },
  { id: 3, slug: "sql-database-basics", title: "SQL: The Language of Databases",
    excerpt: "SQL is how you store, retrieve, and organize data.",
    tech: ["SQL"], readingTime: 12, date: "2026-06-06", content: "<p>Loading from API...</p>" },
  { id: 4, slug: "csharp-rest-api", title: "C# REST API with ASP.NET Core",
    excerpt: "C# is elegant and statically-typed.",
    tech: ["C#"], readingTime: 15, date: "2026-06-06", content: "<p>Loading from API...</p>" },
  { id: 5, slug: "rest-api-design", title: "REST API Design: Principles and Patterns",
    excerpt: "A well-designed API is intuitive, consistent, and hard to misuse.",
    tech: ["REST API"], readingTime: 11, date: "2026-06-06", content: "<p>Loading from API...</p>" },
  { id: 6, slug: "azure-cloud-hosting", title: "Microsoft Azure: Hosting in the Cloud",
    excerpt: "Azure is Microsoft cloud platform with 200+ services.",
    tech: ["Azure"], readingTime: 14, date: "2026-06-06", content: "<p>Loading from API...</p>" },
  { id: 7, slug: "azure-logic-apps-intro", title: "Azure Logic Apps: My First Real-World Workflow",
    excerpt: "Logic Apps let you automate workflows visually.",
    tech: ["Azure"], readingTime: 12, date: "2026-06-08", content: "<p>Loading from API...</p>" },
  { id: 8, slug: "azure-service-bus-deep-dive", title: "Azure Service Bus: Topics, Subscriptions and Dead Letter Queues",
    excerpt: "Service Bus is the enterprise messaging backbone of Azure.",
    tech: ["Azure"], readingTime: 15, date: "2026-06-09", content: "<p>Loading from API...</p>" },
  { id: 9, slug: "azure-api-management-deep-dive", title: "Azure API Management: Gateway, Policies, Auth and More",
    excerpt: "APIM sits in front of all your APIs as a gateway.",
    tech: ["Azure"], readingTime: 15, date: "2026-06-10", content: "<p>Loading from API...</p>" },
  { id: 10, slug: "azure-function-apps-deep-dive", title: "Azure Function Apps: Triggers, Bindings and Durable Functions",
    excerpt: "Function Apps run small focused C# code in the cloud.",
    tech: ["Azure"], readingTime: 15, date: "2026-06-11", content: "<p>Loading from API...</p>" },
  { id: 11, slug: "azure-app-insights-deep-dive", title: "Azure Application Insights: Monitoring, KQL and Observability",
    excerpt: "App Insights is Azure observability backbone.",
    tech: ["Azure"], readingTime: 15, date: "2026-06-12", content: "<p>Loading from API...</p>" },
  { id: 12, slug: "csharp-lambda-linq-deep-dive", title: "C# Lambda Expressions and LINQ",
    excerpt: "Lambda expressions and LINQ make code dramatically shorter.",
    tech: ["C#"], readingTime: 14, date: "2026-06-13", content: "<p>Loading from API...</p>" },
  { id: 13, slug: "cicd-yaml-azure-devops-deep-dive", title: "CI/CD, YAML, Azure DevOps and Merge Conflicts",
    excerpt: "CI/CD automates the path from code to production.",
    tech: ["Azure"], readingTime: 15, date: "2026-06-14", content: "<p>Loading from API...</p>" }
];

initTheme();
