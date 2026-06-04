# &lt;TechStack/&gt; Blog — Full-Stack Azure Learning Project

> **One project. Six technologies. Infinite learning.**
> This blog is itself the learning material — every post explains a technology used to build the very site you are reading.

[![Deploy Status](https://github.com/your-username/TechStackBlog/actions/workflows/deploy.yml/badge.svg)](https://github.com/your-username/TechStackBlog/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Table of Contents

1. [What You Will Build](#1-what-you-will-build)
2. [Architecture Overview](#2-architecture-overview)
3. [Technology Deep Dives](#3-technology-deep-dives)
4. [Software You Need to Install](#4-software-you-need-to-install)
5. [Run Locally — Step by Step](#5-run-locally--step-by-step)
6. [Upload to GitHub — Step by Step](#6-upload-to-github--step-by-step)
7. [Deploy to Azure — Free Tier](#7-deploy-to-azure--free-tier)
8. [Can I Open a Real Website for Free?](#8-can-i-open-a-real-website-for-free)
9. [Can I Earn Money From This?](#9-can-i-earn-money-from-this)
10. [Daily Content Strategy](#10-daily-content-strategy)
11. [Project File Structure](#11-project-file-structure)
12. [FAQ](#12-faq)

---

## 1. What You Will Build

A fully functional blog website where:
- **Visitors** read posts about full-stack web development
- **You** write and publish posts through a REST API
- **Azure** hosts everything in the cloud, automatically deploying when you push to GitHub

The site uses every technology it teaches. It is simultaneously a blog *about* these technologies and a working example *of* them.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                  │
│  HTML + CSS + JavaScript (frontend/index.html)                   │
│  Fetches data: GET https://your-api.azurewebsites.net/api/posts  │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP / JSON
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AZURE APP SERVICE                             │
│  C# ASP.NET Core REST API (backend/)                            │
│  - Receives HTTP requests                                        │
│  - Applies business logic                                        │
│  - Queries the database via Entity Framework                     │
│  - Returns JSON responses                                        │
└──────────────────────────────┬──────────────────────────────────┘
                               │ SQL / EF Core
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AZURE SQL                                   │
│  Relational database (database/schema.sql)                      │
│  Tables: Posts, Tags, PostTags, Comments                        │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SUPPORTING AZURE SERVICES                       │
│  Key Vault      — stores database password securely             │
│  App Insights   — logs every request, error, and performance    │
│  Static Web Apps— hosts the HTML/CSS/JS frontend                │
│  GitHub Actions — auto-deploys on every git push                │
└─────────────────────────────────────────────────────────────────┘
```

**The data flow for every page load:**
1. Your browser downloads `index.html`, `styles.css`, `app.js` from Azure Static Web Apps (CDN)
2. `app.js` runs and calls `GET /api/posts` on the C# API
3. The C# API queries Azure SQL: `SELECT * FROM Posts WHERE IsPublished=1`
4. Azure SQL returns rows; C# maps them to JSON
5. JSON arrives in the browser; JavaScript renders the post cards
6. User clicks a card → modal opens with full post content

---

## 3. Technology Deep Dives

### HTML & CSS
**What it is:** HTML (HyperText Markup Language) is the structure of every web page. CSS (Cascading Style Sheets) is the visual presentation.

**How it works in this project:**
- `frontend/index.html` — all page structure: header, hero, cards, modal
- `frontend/css/styles.css` — all visual styling using CSS variables for theming

**Key concepts to understand:**
- **Semantic HTML:** `<header>`, `<section>`, `<article>`, `<nav>` describe *what* content is, not just how it looks
- **CSS Custom Properties:** `--accent: #1D4ED8` defined once, reused everywhere — change one line to retheme the whole site
- **CSS Grid:** `display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))` — a responsive card grid with zero media queries
- **The Cascade:** when two CSS rules target the same element, *specificity* determines which wins

**Resources:** [MDN Web Docs](https://developer.mozilla.org) is the definitive reference. Start with "Getting started with HTML".

---

### JavaScript
**What it is:** The only programming language that runs natively in the browser. Used to make pages interactive and to call APIs.

**How it works in this project:**
- `frontend/js/app.js` — all client-side logic
- Calls the C# API on page load using the Fetch API
- Renders API response as HTML cards using DOM manipulation
- Handles dark mode via `localStorage`
- Falls back to mock data when the API is offline (great for development)

**Key concepts:**
- **Async/Await:** `async function loadPosts() { const data = await fetch(...) }` — non-blocking code
- **DOM Manipulation:** `document.getElementById('grid').innerHTML = ...` — update the page without reloading
- **JSON:** `response.json()` — parse the API's text response into a JavaScript object
- **localStorage:** `localStorage.setItem('theme', 'dark')` — persist user preferences in the browser

---

### SQL Database
**What it is:** SQL (Structured Query Language) is how you store and retrieve data. Azure SQL is Microsoft's cloud SQL Server.

**How it works in this project:**
- `database/schema.sql` — table definitions and seed data
- Entity Framework Core (C# library) translates LINQ to SQL — you rarely write raw SQL
- The `Posts` table stores every blog post

**Key concepts:**
- **Tables:** like spreadsheet sheets. `Posts` table has columns: `Id`, `Title`, `Slug`, `Content`, etc.
- **Primary Key:** `Id INT PRIMARY KEY IDENTITY(1,1)` — a unique number that auto-increments
- **Indexes:** `CREATE INDEX IX_Posts_Slug` — makes slug lookups fast (like a book index)
- **CRUD:** Create (INSERT), Read (SELECT), Update (UPDATE), Delete (DELETE) — the four operations

---

### C# REST API
**What it is:** C# is Microsoft's statically-typed, object-oriented language. ASP.NET Core is the framework for building web APIs.

**How it works in this project:**
- `backend/Program.cs` — application startup and service registration
- `backend/AllCode.cs` — contains Models, DbContext, Service, and Controller

**Key concepts:**
- **Controller:** a class with methods that handle HTTP requests. `[HttpGet]` maps to `GET /api/posts`
- **Dependency Injection:** services (like the database context) are "injected" into constructors automatically
- **Entity Framework Core:** write C# LINQ queries; EF translates to SQL. `_context.Posts.Where(p => p.IsPublished).ToListAsync()`
- **DTOs (Data Transfer Objects):** separate "database model" from "API response shape" for security and flexibility
- **Middleware pipeline:** every HTTP request flows through: HTTPS redirect → CORS → auth → controller

**File organization (recommended):**
```
backend/
  Controllers/    ← HTTP request handlers
  Models/         ← Entity (DB) and DTO (API response) classes
  Data/           ← DbContext (EF Core)
  Services/       ← Business logic
  Program.cs      ← Startup
```

---

### REST API Design
**What it is:** REST (Representational State Transfer) is an architectural style for designing APIs. It uses HTTP verbs and URLs as a universal language.

**URL design rules:**
```
GET    /api/posts          → list all posts
GET    /api/posts/{slug}   → get one post
POST   /api/posts          → create a post
PUT    /api/posts/{id}     → replace a post
PATCH  /api/posts/{id}     → partially update a post
DELETE /api/posts/{id}     → delete a post
```

**HTTP Status Codes (memorize these):**
```
200 OK             → success, returns data
201 Created        → resource was created
204 No Content     → success, nothing to return
400 Bad Request    → client error (invalid data)
401 Unauthorized   → not authenticated
403 Forbidden      → authenticated but not allowed
404 Not Found      → resource doesn't exist
500 Server Error   → something broke on the server
```

---

### Microsoft Azure
**What it is:** Microsoft's cloud computing platform. Instead of owning servers, you rent computing power on demand.

**Services used:**

| Service | Purpose | Free Tier |
|---|---|---|
| Azure Static Web Apps | Host the HTML/CSS/JS frontend | Free forever |
| Azure App Service (F1) | Run the C# API | Free (60 CPU-min/day) |
| Azure SQL Database | Store blog posts | Free 100K vCore-sec/month |
| Azure Key Vault | Store secrets securely | 10,000 ops/month free |
| Azure Application Insights | Monitor API health | 5 GB/month free |

---

## 4. Software You Need to Install

Install these on your Windows or Mac computer:

### Required

| Software | Why | Download |
|---|---|---|
| **Visual Studio Code** | Code editor (free) | https://code.visualstudio.com |
| **Git** | Version control + GitHub uploads | https://git-scm.com |
| **.NET 8 SDK** | Compile and run C# | https://dotnet.microsoft.com/download |
| **Azure Data Studio** | Manage Azure SQL database | https://aka.ms/azuredatastudio |

### Accounts (all free)

| Account | Why | Signup |
|---|---|---|
| **GitHub** | Host your code | https://github.com |
| **Microsoft Azure** | Host your website | https://azure.microsoft.com/free |

### VS Code Extensions (install inside VS Code)
1. `C# Dev Kit` — C# language support
2. `SQLTools` — run SQL queries from VS Code
3. `REST Client` — test API endpoints without leaving VS Code
4. `GitLens` — enhanced Git integration

### Verify your installation
Open a terminal (PowerShell on Windows, Terminal on Mac) and run:
```bash
dotnet --version     # should print 8.x.x
git --version        # should print 2.x.x
code --version       # should print 1.x.x
```

---

## 5. Run Locally — Step by Step

### Step 1: Download the project
```bash
git clone https://github.com/your-username/TechStackBlog.git
cd TechStackBlog
```

### Step 2: Open the frontend (no setup needed)
```bash
# Option A: VS Code Live Server extension (recommended)
code frontend/index.html
# Right-click → Open with Live Server

# Option B: Python simple server
cd frontend
python -m http.server 3000
# Open http://localhost:3000
```
The site will load with mock data (the JavaScript falls back automatically when the API isn't running).

### Step 3: Set up and run the C# API
```bash
cd backend

# Restore NuGet packages (downloads dependencies)
dotnet restore

# Run the API (listens on http://localhost:5000)
dotnet run
```

Open http://localhost:5000/swagger to see and test all API endpoints interactively.

### Step 4: Connect to a local database (optional)
1. Install **SQL Server Express** (free): https://aka.ms/sqlserver-downloads
2. Update `backend/appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=TechBlogDb;Trusted_Connection=True;"
   }
   ```
3. Run migrations to create tables:
   ```bash
   cd backend
   dotnet tool install --global dotnet-ef
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

---

## 6. Upload to GitHub — Step by Step

GitHub hosts your code and enables collaboration. Every push can trigger automatic deployment to Azure.

### Step 1: Create a GitHub account
Go to https://github.com and sign up.

### Step 2: Create a new repository
1. Click the **+** button (top right) → **New repository**
2. Name it: `TechStackBlog`
3. Set to **Public** (required for free Azure Static Web Apps)
4. Do NOT check "Add README" (you already have one)
5. Click **Create repository**

### Step 3: Initialize and push your code
Open a terminal in the `TechStackBlog` folder:
```bash
# Initialize Git in your project folder
git init

# Tell Git who you are (one-time setup)
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Stage all files
git add .

# First commit
git commit -m "Initial commit: TechStack Blog project"

# Connect to your GitHub repo (copy the URL from GitHub)
git remote add origin https://github.com/YOUR-USERNAME/TechStackBlog.git

# Push to GitHub
git push -u origin main
```

### Step 4: Every future update
```bash
# After making changes:
git add .
git commit -m "Add post about Azure Logic Apps"
git push
```
That's it. GitHub receives your code. GitHub Actions auto-deploys to Azure.

---

## 7. Deploy to Azure — Free Tier

### Step 1: Create an Azure account
Go to https://azure.microsoft.com/free — get $200 credit for 30 days + always-free services.

### Step 2: Deploy the frontend (Azure Static Web Apps)
1. Azure Portal → **Create a resource** → search "Static Web App"
2. Connect to your GitHub repository
3. Set **App location** to `/frontend`
4. Azure automatically creates a GitHub Actions workflow
5. Your site will be live at `https://random-name.azurestaticapps.net`

### Step 3: Create Azure SQL Database
1. Azure Portal → **Create a resource** → "SQL Database"
2. Create a new server: choose a username and password
3. Select **Free serverless** tier
4. Note the connection string from the portal
5. Open the Query Editor and run `database/schema.sql`

### Step 4: Deploy the C# API (Azure App Service)
1. Azure Portal → **Create a resource** → "Web App"
2. Runtime stack: **.NET 8 (LTS)**
3. Operating System: **Linux**
4. Pricing plan: **Free F1**
5. Under **Deployment** → enable **GitHub Actions**
6. Add the connection string under **Configuration → Application settings**

### Step 5: Update the frontend API URL
In `frontend/js/app.js`, line 11:
```javascript
const API_BASE_URL = "https://YOUR-APP-NAME.azurewebsites.net/api";
```

---

## 8. Can I Open a Real Website for Free?

**Yes. Completely free.** Here is what you get at zero cost:

| What | Service | Cost |
|---|---|---|
| Website hosting | Azure Static Web Apps | Free forever |
| API backend | Azure App Service F1 | Free (with limits) |
| Database | Azure SQL Free tier | Free |
| Custom domain | Your own domain (.com) | ~$12/year |
| SSL (HTTPS) | Included with Azure | Free |
| CI/CD (auto-deploy) | GitHub Actions | Free for public repos |

### For a custom domain (e.g. techstackblog.com):
1. Buy a domain from Namecheap (~$10-12/year) or Google Domains (~$12/year)
2. In Azure Static Web Apps → **Custom domains** → Add your domain
3. Follow the DNS verification steps (takes 10-30 minutes)

### Free tier limits to know:
- App Service F1: 60 CPU-minutes/day — enough for a blog with light traffic
- Azure SQL Free: ~500MB storage — enough for thousands of posts
- When you outgrow free, the cheapest paid tier is ~$13/month total

---

## 9. Can I Earn Money From This?

**Yes. Multiple revenue streams are possible.** Here is a realistic roadmap:

### Path 1: Ad Revenue (passive, takes time)
- **Google AdSense** — display ads on your site. Earns $1-5 per 1,000 page views.
- **Requirements:** AdSense requires a real website with original content and some traffic.
- **Timeline:** 3-6 months of consistent posting to get meaningful traffic.
- **Realistic**: With 100 daily visitors: ~$30-50/month. With 1,000: ~$300-500/month.

### Path 2: Sponsor Posts / Affiliate Links (faster ROI)
- Write about tools you use (VS Code, GitHub, Azure). Include affiliate links.
- Microsoft has partner programs for Azure content creators.
- Amazon has affiliate links for tech books.
- No minimum traffic requirement to start.

### Path 3: Consulting & Jobs (highest value)
- A public blog demonstrating Azure + C# + SQL expertise is a portfolio.
- Azure blog posts improve your LinkedIn SEO and GitHub profile.
- Recruiters search for "Azure Integration Engineer blog" — your posts can rank.
- This is directly relevant to the roles you are targeting.

### Path 4: Premium Content (future)
- Free posts on the blog. Premium deep-dives on Substack or Gumroad.
- Sell a "Complete Azure Integration Course" based on your posts.
- $49-99 one-time course: even 10 sales/month = $500-1,000/month.

### Realistic first-year expectation (posting 3-5x/week):
- Months 1-3: $0 (building content, traffic)
- Months 4-6: $20-100/month (first AdSense + affiliate income)
- Months 7-12: $100-500/month (growing traffic, sponsorships)
- Year 2+: Potential for $1,000-5,000/month with consistent effort

---

## 10. Daily Content Strategy

### Post ideas using your existing expertise:

**Azure Integration (your strength):**
- "Azure Logic Apps: My First Real-World Workflow"
- "Service Bus vs Event Grid: When to Use Which"
- "OAuth Token Management with Azure Key Vault"
- "API Management Policies That Saved My Integration"
- "Monitoring Azure Logic Apps with App Insights"

**Azure Cloud:**
- "Azure Free Tier: What's Really Free in 2025"
- "Setting Up Your First Azure SQL Database in 10 Minutes"
- "GitHub Actions to Azure: Complete CI/CD Guide"

**C# / .NET:**
- "Entity Framework Core Migrations: A Visual Guide"
- "C# LINQ for SQL Developers: Side-by-Side Comparison"
- "ASP.NET Core Dependency Injection Explained Simply"

**Beginner-friendly (drives traffic):**
- "What is a REST API? Explained With a Real Example"
- "SQL vs NoSQL: Which Should You Learn First?"
- "Git Commands Every Developer Uses Daily"

### Content schedule suggestion:
- **Monday:** Azure/cloud post
- **Wednesday:** C#/.NET post
- **Friday:** beginner concept or tutorial

---

## 11. Project File Structure

```
TechStackBlog/
│
├── frontend/                   ← HTML/CSS/JS (deployed to Azure Static Web Apps)
│   ├── index.html              ← main page
│   ├── css/
│   │   └── styles.css          ← all styles
│   └── js/
│       └── app.js              ← all JavaScript logic
│
├── backend/                    ← C# API (deployed to Azure App Service)
│   ├── TechBlog.Api.csproj     ← project file with NuGet dependencies
│   ├── Program.cs              ← startup, service registration
│   ├── appsettings.json        ← configuration (no secrets!)
│   ├── Controllers/
│   │   └── PostsController.cs  ← HTTP endpoints
│   ├── Models/
│   │   └── Post.cs             ← entity + DTO classes
│   ├── Data/
│   │   └── BlogDbContext.cs    ← EF Core context
│   └── Services/
│       └── PostService.cs      ← database query logic
│
├── database/
│   └── schema.sql              ← table definitions + seed data
│
├── .github/
│   └── workflows/
│       └── deploy.yml          ← CI/CD: auto-deploy on git push
│
├── .gitignore                  ← files Git should not track
└── README.md                   ← this file
```

---

## 12. FAQ

**Q: Do I need to know C# before starting?**
A: No. The code is heavily commented. Read it top to bottom, run it, then modify small pieces. Learning by doing is faster than reading.

**Q: What if the API isn't deployed yet — will the site still work?**
A: Yes. The JavaScript (`app.js`) detects API failures and falls back to `MOCK_POSTS` automatically. You can develop the frontend entirely without a running backend.

**Q: How do I add a new post?**
A: Currently, use the REST API directly:
```bash
curl -X POST https://your-api.azurewebsites.net/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"My New Post","slug":"my-new-post","content":"...","tech":"Azure"}'
```
Future enhancement: build an admin panel (a form that calls this API).

**Q: Is this secure? Can anyone delete my posts?**
A: Currently the DELETE and POST endpoints are open (no authentication). Before going public, uncomment the `[Authorize]` attributes and add Azure AD or API key authentication.

**Q: Can I use this with MySQL instead of Azure SQL?**
A: Yes. In `TechBlog.Api.csproj`, replace `Microsoft.EntityFrameworkCore.SqlServer` with `Pomelo.EntityFrameworkCore.MySql`. Change `UseSqlServer` to `UseMySql` in `Program.cs`.

**Q: What is the total cost per month for a live blog?**
A: Within free tiers: $0. With a custom domain: ~$1/month amortized. If traffic grows beyond free limits: ~$13-20/month for the lowest paid Azure tiers.

---

## License

MIT — use freely, modify, share, learn.

---

*Built with HTML, CSS, JavaScript, C#, SQL, and Azure. Deployed via GitHub Actions.*
*Every technology in this stack is explained in the posts it serves.*
