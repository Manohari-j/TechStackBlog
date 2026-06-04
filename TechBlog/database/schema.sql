-- ═══════════════════════════════════════════════════════════════
-- TechStack Blog — Database Schema
-- Database: Azure SQL (SQL Server compatible)
-- Run this script in Azure Data Studio, SSMS, or the Azure Portal
-- Query Editor to create all tables.
-- ═══════════════════════════════════════════════════════════════

-- ─── POSTS ───────────────────────────────────────────────────────
-- The main table. One row per blog post.
CREATE TABLE Posts (
    Id          INT             NOT NULL PRIMARY KEY IDENTITY(1,1),
    Title       NVARCHAR(200)   NOT NULL,
    Slug        NVARCHAR(200)   NOT NULL,   -- URL-friendly: "html-css-foundation"
    Excerpt     NVARCHAR(500)   NULL,
    Content     NVARCHAR(MAX)   NOT NULL,   -- Full HTML content of the post
    Tech        NVARCHAR(200)   NULL,       -- Comma-separated: "C#,Azure,SQL"
    ReadingTime INT             NOT NULL DEFAULT 5,
    ViewCount   INT             NOT NULL DEFAULT 0,
    IsPublished BIT             NOT NULL DEFAULT 1,
    CreatedAt   DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt   DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

-- Unique constraint: two posts cannot share a slug
ALTER TABLE Posts ADD CONSTRAINT UQ_Posts_Slug UNIQUE (Slug);

-- Index for fast slug lookups (used on every page view)
CREATE INDEX IX_Posts_Slug ON Posts (Slug);

-- Index for chronological listing
CREATE INDEX IX_Posts_CreatedAt ON Posts (CreatedAt DESC) WHERE IsPublished = 1;

-- ─── TAGS ────────────────────────────────────────────────────────
CREATE TABLE Tags (
    Id   INT           NOT NULL PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL
);
ALTER TABLE Tags ADD CONSTRAINT UQ_Tags_Name UNIQUE (Name);

-- ─── POST TAGS (many-to-many join) ───────────────────────────────
-- A post can have many tags; a tag can belong to many posts.
CREATE TABLE PostTags (
    PostId INT NOT NULL REFERENCES Posts(Id) ON DELETE CASCADE,
    TagId  INT NOT NULL REFERENCES Tags(Id)  ON DELETE CASCADE,
    PRIMARY KEY (PostId, TagId)
);

-- ─── COMMENTS (optional future feature) ─────────────────────────
CREATE TABLE Comments (
    Id        INT           NOT NULL PRIMARY KEY IDENTITY(1,1),
    PostId    INT           NOT NULL REFERENCES Posts(Id) ON DELETE CASCADE,
    AuthorName NVARCHAR(100) NOT NULL,
    Body      NVARCHAR(2000) NOT NULL,
    IsApproved BIT          NOT NULL DEFAULT 0,
    CreatedAt DATETIME2     NOT NULL DEFAULT GETUTCDATE()
);

-- ─── SEED DATA ───────────────────────────────────────────────────
-- Insert the six starter posts so the site has content on day one.

INSERT INTO Posts (Title, Slug, Excerpt, Content, Tech, ReadingTime)
VALUES
(
    'HTML & CSS: The Foundation of Every Web Page',
    'html-css-foundation',
    'HTML gives a page structure. CSS gives it style. Together they are the bones and skin of every website you have ever visited.',
    '<p>Full HTML content stored here by the API...</p>',
    'HTML/CSS',
    8
),
(
    'JavaScript: Making Pages Come Alive',
    'javascript-interactivity',
    'JavaScript is the only language that runs natively in the browser. It lets you fetch data, respond to clicks, and update the page without reloading.',
    '<p>Full content here...</p>',
    'JavaScript',
    10
),
(
    'SQL: The Language of Databases',
    'sql-database-basics',
    'SQL is how you store, retrieve, and organize data. Every serious web application uses a relational database.',
    '<p>Full content here...</p>',
    'SQL',
    12
),
(
    'C# REST API with ASP.NET Core',
    'csharp-rest-api',
    'C# is Microsoft s elegant, statically-typed language. ASP.NET Core lets you build fast REST APIs your JavaScript frontend can call.',
    '<p>Full content here...</p>',
    'C#',
    15
),
(
    'REST API Design: Principles and Patterns',
    'rest-api-design',
    'A well-designed API is intuitive, consistent, and hard to misuse.',
    '<p>Full content here...</p>',
    'REST API',
    11
),
(
    'Microsoft Azure: Hosting in the Cloud',
    'azure-cloud-hosting',
    'Azure is Microsoft s cloud platform with 200+ services. Learn which ones to use and how they connect.',
    '<p>Full content here...</p>',
    'Azure',
    14
);

-- Insert tags
INSERT INTO Tags (Name) VALUES ('HTML'), ('CSS'), ('JavaScript'), ('SQL'), ('C#'), ('.NET'), ('Azure'), ('REST API'), ('ASP.NET Core');

-- ─── USEFUL QUERIES ──────────────────────────────────────────────
-- Run these in Azure Portal Query Editor to inspect your data.

-- List all published posts, newest first
-- SELECT Id, Title, Slug, Tech, CreatedAt FROM Posts WHERE IsPublished=1 ORDER BY CreatedAt DESC;

-- Count posts by technology
-- SELECT Tech, COUNT(*) AS PostCount FROM Posts GROUP BY Tech ORDER BY PostCount DESC;

-- Find most-viewed posts
-- SELECT TOP 5 Title, ViewCount FROM Posts ORDER BY ViewCount DESC;

-- Update view count (called by API on each post load)
-- UPDATE Posts SET ViewCount = ViewCount + 1 WHERE Slug = 'html-css-foundation';
