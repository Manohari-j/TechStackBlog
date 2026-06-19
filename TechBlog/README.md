# &lt;TechStack/&gt; Blog

> Engineering concepts. Clearly explained.

A full-stack Azure blog built with HTML, CSS, JavaScript, C# ASP.NET Core, Azure SQL, and deployed via GitHub Actions CI/CD. Every post is written from real production experience — the blog itself is built with the technologies it teaches.

**Live site:** [www.techstackblog.com](https://www.techstackblog.com)
**Author:** Manohari Jayachandran — Azure Cloud & Integration Engineer

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Project Structure](#2-project-structure)
3. [Frontend](#3-frontend)
4. [Backend API](#4-backend-api)
5. [Database](#5-database)
6. [Running Locally](#6-running-locally)
7. [Deployment](#7-deployment)
8. [Admin Panel — Adding New Posts](#8-admin-panel--adding-new-posts)
9. [CI/CD Pipeline](#9-cicd-pipeline)
10. [Environment Variables & Secrets](#10-environment-variables--secrets)
11. [SEO Setup](#11-seo-setup)
12. [Troubleshooting](#12-troubleshooting)
13. [Roadmap](#13-roadmap)

---

## 1. Architecture Overview

```
Visitor
   │
   ▼
www.techstackblog.com  (Azure Static Web Apps — HTML/CSS/JS)
   │
   │  fetch()
   ▼
techblog-api.azurewebsites.net  (Azure App Service — C# ASP.NET Core 8 REST API)
   │
   │  Entity Framework Core
   ▼
Azure SQL Database  (Posts table)

Every push to main on GitHub → GitHub Actions → auto-deploys both
the frontend (Static Web Apps) and backend (App Service) independently.
```

| Layer | Technology | Hosting |
|---|---|---|
| Frontend | HTML, CSS, vanilla JavaScript | Azure Static Web Apps |
| API | C# ASP.NET Core 8, Entity Framework Core | Azure App Service |
| Database | Azure SQL (Serverless) | Azure SQL Database |
| CI/CD | GitHub Actions | — |
| Domain | Custom domain via Namecheap | techstackblog.com |

---

## 2. Project Structure

```
TechStackBlog/
├── frontend/
│   ├── index.html              # Homepage — categories, search, pagination
│   ├── post.html               # Single post template (slug via ?slug= query param)
│   ├── category.html           # Category listing page (?cat= query param)
│   ├── admin.html              # Password-protected content management panel
│   ├── sitemap.xml             # All post + category URLs for Google/Bing
│   ├── staticwebapp.config.json
│   ├── css/
│   │   └── styles.css          # All styling, light/dark theme, code highlighting
│   └── js/
│       ├── config.js           # API URL, category map, mock data fallback
│       ├── app.js              # Homepage logic (filter, search, sort, paginate)
│       ├── post.js             # Post page (TOC, share buttons, progress bar)
│       └── category.js         # Category page logic
│
├── backend/
│   ├── Program.cs              # App startup, CORS, EF Core, DI registration
│   ├── TechBlog.Api.csproj
│   ├── appsettings.json        # Connection string placeholder (real value in Azure)
│   ├── Models/
│   │   └── Post.cs             # Entity + DTOs
│   ├── Data/
│   │   └── BlogDbContext.cs    # EF Core DbContext
│   ├── Services/
│   │   └── PostService.cs      # Business logic / queries
│   └── Controllers/
│       └── PostsController.cs  # GET / POST / PUT / DELETE endpoints
│
├── database/
│   └── schema.sql              # Table definition + seed data
│
├── .github/workflows/
│   ├── main_techblog-api.yml                            # Builds & deploys the API
│   └── azure-static-web-apps-calm-island-0a7b4b30f.yml  # Builds & deploys the frontend
│
└── .gitignore
```

---

## 3. Frontend

Pure HTML/CSS/JavaScript — no framework, no build step.

### Pages

| Page | URL pattern | Purpose |
|---|---|---|
| Homepage | `/` | Featured post, category pills, paginated grid, search |
| Post page | `/post.html?slug=<slug>` | Full post with TOC, share buttons, related posts |
| Category page | `/category.html?cat=<key>` | All posts in one category |
| Admin panel | `/admin.html` | Create / edit / delete posts (password protected) |

### Key features

- **Light/dark theme** — toggled via the ◐ button, persisted in `localStorage`
- **Client-side search** — instant dropdown as you type, searches title/excerpt/tech
- **Syntax highlighting** — Prism.js auto-detects C#, SQL, YAML, JSON, JS in `<pre>` blocks
- **Reading progress bar** — fixed top bar fills as you scroll a post
- **Auto-generated table of contents** — built from `<h3>` tags on each post page
- **Share buttons** — pre-filled LinkedIn / Twitter / Reddit share links + copy-to-clipboard
- **Related posts** — shown at the bottom of each post, matched by tech tag
- **Graceful API fallback** — if the API is unreachable, `MOCK_POSTS` in `config.js` renders instead so the site never shows a blank page

### Where the API URL lives

`frontend/js/config.js`:
```javascript
const CONFIG = {
  API_BASE: "https://techblog-api-h0fdc9hkf5hmadg0.westus2-01.azurewebsites.net/api",
  SITE_URL: "https://www.techstackblog.com",
  ...
};
```
Update `API_BASE` here if the App Service URL ever changes.

---

## 4. Backend API

ASP.NET Core 8 Web API using Entity Framework Core to talk to Azure SQL.

### Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/api/posts` | All published posts, newest first |
| GET | `/api/posts/{slug}` | One post by slug (also increments view count) |
| POST | `/api/posts` | Create a new post |
| PUT | `/api/posts/{id}` | Update an existing post (used by admin.html) |
| DELETE | `/api/posts/{id}` | Delete a post |
| GET | `/health` | Health check — returns `{ status: "healthy" }` |

### Request/response shape

```json
// POST /api/posts and PUT /api/posts/{id} body
{
  "title": "Azure Service Bus Deep Dive",
  "slug": "azure-service-bus-deep-dive",
  "excerpt": "Short summary shown on the card.",
  "content": "<h2>...</h2><p>...</p>",
  "tech": "Azure",
  "readingTime": 15
}

// GET /api/posts response (array of these)
{
  "id": 8,
  "title": "Azure Service Bus Deep Dive",
  "slug": "azure-service-bus-deep-dive",
  "excerpt": "Short summary shown on the card.",
  "content": "<h2>...</h2><p>...</p>",
  "tech": ["Azure"],
  "readingTime": 15,
  "date": "2026-06-09"
}
```

### CORS

Configured in `Program.cs` to allow:
```
http://localhost:3000
https://www.techstackblog.com
https://techstackblog.com
https://calm-island-0a7b4b30f.7.azurestaticapps.net
```
Add any new frontend origin here before deploying it.

---

## 5. Database

Azure SQL, single `Posts` table. Schema and seed data in `database/schema.sql`.

```sql
CREATE TABLE Posts (
    Id          INT PRIMARY KEY IDENTITY(1,1),
    Title       NVARCHAR(200)  NOT NULL,
    Slug        NVARCHAR(200)  NOT NULL UNIQUE,
    Excerpt     NVARCHAR(500),
    Content     NVARCHAR(MAX)  NOT NULL,
    Tech        NVARCHAR(200),
    ReadingTime INT            DEFAULT 5,
    ViewCount   INT            DEFAULT 0,
    IsPublished BIT            DEFAULT 1,
    CreatedAt   DATETIME2      DEFAULT GETUTCDATE(),
    UpdatedAt   DATETIME2      DEFAULT GETUTCDATE()
);
```

Run `database/schema.sql` once in the Azure Portal Query Editor (or Azure Data Studio) against a fresh database to create the table and seed the first six posts.

---

## 6. Running Locally

### Frontend
No build step needed — it's static files.
```bash
cd frontend
python -m http.server 3000
# open http://localhost:3000
```
Or use the VS Code "Live Server" extension on `index.html`.

### Backend
Requires [.NET 8 SDK](https://dotnet.microsoft.com/download).
```bash
cd backend
dotnet restore
dotnet run
# API listens on http://localhost:5000
# Swagger UI (dev only): http://localhost:5000/swagger
```

Update `appsettings.json` with a local SQL Server connection string, or point it at the same Azure SQL instance used in production (read-only testing recommended).

---

## 7. Deployment

Everything deploys automatically via GitHub Actions on every push to `main`. No manual deployment steps are required day to day.

**Azure resources used:**

| Resource | Name | Purpose |
|---|---|---|
| Resource Group | `techblog-rg` | Container for all resources |
| Azure SQL Server + DB | `techblog-sql-server` / `TechBlogDb` | Database |
| App Service | `techblog-api` | Hosts the C# API |
| Static Web App | `calm-island-0a7b4b30f` | Hosts the frontend, custom domain `techstackblog.com` |

**First-time setup** (already done for this project, documented here for reference):
1. Create the Resource Group, then SQL Server + Database, then App Service, then Static Web App — in that order, all inside the same Resource Group.
2. Run `database/schema.sql` in the Query Editor.
3. In App Service → Configuration → Connection strings, add `DefaultConnection` pointing at the Azure SQL database.
4. In App Service → Deployment Center, connect to GitHub — this auto-generates the `main_techblog-api.yml` workflow and the three Azure service principal secrets.
5. Create the Static Web App via the Azure Portal "Create a resource" flow, pointing `App location` at `frontend` — this auto-generates the `azure-static-web-apps-*.yml` workflow and its deployment token secret.
6. Add the custom domain (`www.techstackblog.com` and `techstackblog.com`) under Static Web App → Custom domains, with matching CNAME/TXT records in Namecheap.

---

## 8. Admin Panel — Adding New Posts

Go to `https://www.techstackblog.com/admin.html`.

- **Password:** set in `frontend/admin.html` as the `ADMIN_PASSWORD` constant (currently a plain value for simplicity — see Security Notes below for a safer pattern).
- **New Post** → fill in Title (slug auto-generates), Tech tag, Excerpt, Content (HTML), Reading Time → **Publish Post**.
- Click any post in the left sidebar to **Edit** or **Delete** it.
- Word count and reading time are calculated automatically as you type.

After publishing, the post appears on the homepage and gets its own permanent URL at `/post.html?slug=your-slug` — no redeploy needed, since the admin panel talks directly to the live API.

### ⚠️ Security note
`ADMIN_PASSWORD` is currently hardcoded in `admin.html`, which is fine for a personal low-stakes blog but **is visible to anyone who views the page source** since the repo is public. For better security, either:
- Inject the password at build time via a GitHub Actions `sed` step reading from a GitHub Secret, or
- Enable Azure Static Web Apps built-in Authentication (Microsoft login) in front of `/admin.html` and remove the password logic entirely.

---

## 9. CI/CD Pipeline

Two independent GitHub Actions workflows, both triggered on push to `main`:

**`main_techblog-api.yml`** — builds and deploys the C# API
```
checkout → setup .NET 8 → restore → build → publish → zip
  → upload artifact → download artifact → azure/login
  → azure/webapps-deploy
```

**`azure-static-web-apps-*.yml`** — builds and deploys the frontend
```
checkout → Azure/static-web-apps-deploy (handles build + deploy in one step)
```

Both typically complete in 2–4 minutes. Check progress under the repo's **Actions** tab.

---

## 10. Environment Variables & Secrets

| Secret (GitHub) | Used by | Set via |
|---|---|---|
| `AZUREAPPSERVICE_CLIENTID_*` | API workflow | Auto-created by App Service Deployment Center |
| `AZUREAPPSERVICE_TENANTID_*` | API workflow | Auto-created by App Service Deployment Center |
| `AZUREAPPSERVICE_SUBSCRIPTIONID_*` | API workflow | Auto-created by App Service Deployment Center |
| `AZURE_STATIC_WEB_APPS_API_TOKEN_*` | Frontend workflow | Auto-created when Static Web App is linked to the repo |

| Config (Azure, not in code) | Where |
|---|---|
| `DefaultConnection` (SQL connection string) | App Service → Configuration → Connection strings |

**Never commit a real connection string.** `appsettings.json` in this repo intentionally contains a placeholder — the real value lives only in Azure App Service Configuration.

---

## 11. SEO Setup

- `sitemap.xml` lists the homepage, every category page, and every individual post URL — submitted to both Google Search Console and Bing Webmaster Tools.
- Each post page (`post.html`) dynamically sets its own `<title>`, meta description, Open Graph tags, and canonical URL via `post.js` based on the loaded post data.
- `staticwebapp.config.json` excludes `post.html`, `category.html`, and `admin.html` from the SPA fallback rewrite so query-string-based routing works correctly with direct links and search engine crawlers.
- Canonical domain is `https://www.techstackblog.com` — the bare domain and the old Azure-generated URL both redirect here.

---

## 12. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Homepage loads but shows mock/stale posts | API unreachable or CORS blocked | Check `/health` endpoint directly; check browser console for CORS errors; confirm origin is in `Program.cs` CORS policy |
| `post.html` shows "Post not found" | Slug typo, or post not yet published | Verify slug in admin panel matches the URL exactly |
| Admin panel "API unreachable" | App Service cold-started or down | Visit the `/health` endpoint to wake it up; check App Service logs |
| New post doesn't appear after publishing | Browser cache | Hard refresh (`Ctrl+Shift+R`); confirm via `GET /api/posts` directly |
| GitHub Actions fails on `dotnet restore` | Path mismatch in workflow `.csproj` path | Confirm the path in the workflow exactly matches the repo's folder structure |
| 404 on custom domain | DNS/Azure custom domain not yet validated | Check Azure Static Web Apps → Custom domains status; check DNS propagation at dnschecker.org |

---

## 13. Roadmap

- [ ] Move `ADMIN_PASSWORD` out of client-side code (GitHub Secrets injection or Azure AD auth)
- [ ] Add pagination to category pages (currently shows all matching posts on one page)
- [ ] Add an RSS feed
- [ ] Add comment support (`Comments` table already scaffolded in earlier schema versions)
- [ ] Expand topic coverage: SOLID Principles, Design Patterns, System Design, Data Structures
- [ ] Add Application Insights dashboard link from the admin panel

---

## License

MIT — fork it, learn from it, build your own version.

---

*Built with HTML, CSS, JavaScript, C#, Azure SQL, and Azure. Deployed via GitHub Actions.*
*Every technology in this stack is explained in the posts it serves — that's the whole point.*
