// ═══════════════════════════════════════════════════════════════
// Program.cs — ASP.NET Core 8 Web API Entry Point
//
// This is the startup file. It:
//  1. Registers all services (dependency injection)
//  2. Configures the HTTP pipeline (middleware)
//  3. Starts listening for requests
//
// HOW IT WORKS:
// ASP.NET Core uses a builder pattern:
//   builder.Services.Add___()  →  register a service
//   app.Use___()               →  add middleware to the pipeline
// ═══════════════════════════════════════════════════════════════
using Microsoft.EntityFrameworkCore;
using TechBlog.Api.Data;
using TechBlog.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// ─── 1. ADD SERVICES ─────────────────────────────────────────────

// Controllers — scans for classes ending in "Controller"
builder.Services.AddControllers();

// Swagger/OpenAPI — generates interactive API documentation
// Visit /swagger when running locally to test all endpoints
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => {
    c.SwaggerDoc("v1", new() {
        Title       = "TechStack Blog API",
        Version     = "v1",
        Description = "REST API powering the TechStack Blog. Built with ASP.NET Core 8 + Entity Framework Core."
    });
});

// Entity Framework Core — connects to Azure SQL
// Connection string stored in appsettings.json (local) or Azure Key Vault (production)
builder.Services.AddDbContext<BlogDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.EnableRetryOnFailure(maxRetryCount: 3)
    )
);

// Dependency Injection — register our service
// AddScoped = one instance per HTTP request
builder.Services.AddScoped<IPostService, PostService>();

// CORS — allow the frontend (different origin) to call this API
// In production, replace "*" with your actual Static Web App URL
builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend", policy =>
        policy
            .WithOrigins(
                "http://localhost:3000",                          // local dev
                "https://your-blog.azurestaticapps.net"         // production ← change this
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
    );
});

// Application Insights — sends telemetry to Azure Monitor
// Comment this out if you don't have an App Insights resource yet
builder.Services.AddApplicationInsightsTelemetry(
    builder.Configuration["ApplicationInsights:ConnectionString"]
);

// Response caching — tell clients to cache GET /api/posts for 60 seconds
builder.Services.AddResponseCaching();

var app = builder.Build();

// ─── 2. CONFIGURE MIDDLEWARE PIPELINE ────────────────────────────
// Order matters! Middleware runs top-to-bottom for each request.

if (app.Environment.IsDevelopment()) {
    // Swagger UI only in development (not in production)
    app.UseSwagger();
    app.UseSwaggerUI();

    // Auto-apply migrations on startup in dev (run manually in prod)
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<BlogDbContext>();
    await db.Database.MigrateAsync();
}

app.UseHttpsRedirection();   // Redirect HTTP → HTTPS
app.UseCors("AllowFrontend"); // Apply CORS policy (must be before UseAuthorization)
app.UseResponseCaching();
app.UseAuthorization();
app.MapControllers();        // Route requests to controller methods

// Health check endpoint — Azure uses this to verify the app is running
app.MapGet("/health", () => new { status = "healthy", timestamp = DateTime.UtcNow });

app.Run();
