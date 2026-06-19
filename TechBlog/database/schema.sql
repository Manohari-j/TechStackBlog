-- ═══════════════════════════════════════════════════════════════
-- TechStack Blog — Database Schema
-- Database: Azure SQL (SQL Server compatible)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE Posts (
    Id          INT             NOT NULL PRIMARY KEY IDENTITY(1,1),
    Title       NVARCHAR(200)   NOT NULL,
    Slug        NVARCHAR(200)   NOT NULL,
    Excerpt     NVARCHAR(500)   NULL,
    Content     NVARCHAR(MAX)   NOT NULL,
    Tech        NVARCHAR(200)   NULL,
    ReadingTime INT             NOT NULL DEFAULT 5,
    ViewCount   INT             NOT NULL DEFAULT 0,
    IsPublished BIT             NOT NULL DEFAULT 1,
    CreatedAt   DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt   DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

ALTER TABLE Posts ADD CONSTRAINT UQ_Posts_Slug UNIQUE (Slug);
CREATE INDEX IX_Posts_Slug ON Posts (Slug);
CREATE INDEX IX_Posts_CreatedAt ON Posts (CreatedAt DESC) WHERE IsPublished = 1;

-- ─── SEED DATA ───────────────────────────────────────────────────
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
    'JavaScript is the only language that runs natively in the browser.',
    '<p>Full content here...</p>',
    'JavaScript',
    10
),
(
    'SQL: The Language of Databases',
    'sql-database-basics',
    'SQL is how you store, retrieve, and organize data.',
    '<p>Full content here...</p>',
    'SQL',
    12
),
(
    'C# REST API with ASP.NET Core',
    'csharp-rest-api',
    'C# is elegant and statically-typed. ASP.NET Core lets you build fast REST APIs.',
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
    'Azure is Microsoft cloud platform with 200+ services.',
    '<p>Full content here...</p>',
    'Azure',
    14
);
