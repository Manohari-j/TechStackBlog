// ═══════════════════════════════════════════════════════════════
// Models/Post.cs — Entity Framework "entity" (maps to Posts table)
// ═══════════════════════════════════════════════════════════════
namespace TechBlog.Api.Models;

/// <summary>
/// Represents a row in the Posts table.
/// EF Core creates the table from this class (code-first approach).
/// </summary>
public class Post
{
    public int    Id          { get; set; }
    public string Title       { get; set; } = string.Empty;
    public string Slug        { get; set; } = string.Empty;
    public string? Excerpt    { get; set; }
    public string Content     { get; set; } = string.Empty;
    public string? Tech       { get; set; }  // "C#,Azure,SQL"
    public int    ReadingTime { get; set; } = 5;
    public int    ViewCount   { get; set; } = 0;
    public bool   IsPublished { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// DTO (Data Transfer Object) — what the API actually returns.
/// We never return the raw entity to avoid over-exposing data.
/// </summary>
public class PostDto
{
    public int      Id          { get; set; }
    public string   Title       { get; set; } = string.Empty;
    public string   Slug        { get; set; } = string.Empty;
    public string?  Excerpt     { get; set; }
    public string   Content     { get; set; } = string.Empty;
    public string[] Tech        { get; set; } = [];  // split CSV → array
    public int      ReadingTime { get; set; }
    public string   Date        { get; set; } = string.Empty;
}

/// <summary>
/// DTO for creating a new post (POST /api/posts).
/// Only includes fields the client is allowed to set.
/// </summary>
public class CreatePostDto
{
    public string  Title       { get; set; } = string.Empty;
    public string  Slug        { get; set; } = string.Empty;
    public string? Excerpt     { get; set; }
    public string  Content     { get; set; } = string.Empty;
    public string? Tech        { get; set; }
    public int     ReadingTime { get; set; } = 5;
}


// ═══════════════════════════════════════════════════════════════
// Data/BlogDbContext.cs — EF Core Database Context
// ═══════════════════════════════════════════════════════════════
namespace TechBlog.Api.Data;
using TechBlog.Api.Models;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// The DbContext is your code's window into the database.
/// Each DbSet&lt;T&gt; property maps to a table.
/// EF Core generates SQL from LINQ queries on these sets.
/// </summary>
public class BlogDbContext : DbContext
{
    public BlogDbContext(DbContextOptions<BlogDbContext> options)
        : base(options) { }

    public DbSet<Post> Posts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure the Posts table
        modelBuilder.Entity<Post>(entity => {
            entity.ToTable("Posts");
            entity.HasKey(p => p.Id);

            entity.Property(p => p.Title)   .HasMaxLength(200).IsRequired();
            entity.Property(p => p.Slug)    .HasMaxLength(200).IsRequired();
            entity.Property(p => p.Excerpt) .HasMaxLength(500);
            entity.Property(p => p.Content) .HasColumnType("NVARCHAR(MAX)");
            entity.Property(p => p.Tech)    .HasMaxLength(200);

            // Index for fast slug lookups
            entity.HasIndex(p => p.Slug).IsUnique();
        });
    }
}


// ═══════════════════════════════════════════════════════════════
// Services/PostService.cs — Business Logic Layer
// ═══════════════════════════════════════════════════════════════
namespace TechBlog.Api.Services;
using TechBlog.Api.Data;
using TechBlog.Api.Models;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// Interface — defines the contract.
/// The controller depends on this interface, not the concrete class.
/// This makes unit testing easy (you can inject a mock).
/// </summary>
public interface IPostService
{
    Task<IEnumerable<PostDto>>  GetAllAsync();
    Task<PostDto?>              GetBySlugAsync(string slug);
    Task<PostDto>               CreateAsync(CreatePostDto dto);
    Task<bool>                  DeleteAsync(int id);
}

/// <summary>
/// Concrete implementation — the actual database logic.
/// </summary>
public class PostService : IPostService
{
    private readonly BlogDbContext _context;

    // Constructor injection — EF Core DbContext is injected automatically
    public PostService(BlogDbContext context) => _context = context;

    public async Task<IEnumerable<PostDto>> GetAllAsync()
    {
        return await _context.Posts
            .AsNoTracking()                          // read-only: no change tracking
            .Where(p => p.IsPublished)               // only published posts
            .OrderByDescending(p => p.CreatedAt)     // newest first
            .Select(p => MapToDto(p))                // project to DTO
            .ToListAsync();                          // execute query, return list
    }

    public async Task<PostDto?> GetBySlugAsync(string slug)
    {
        var post = await _context.Posts
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Slug == slug && p.IsPublished);

        if (post == null) return null;

        // Increment view count (fire-and-forget)
        await _context.Posts
            .Where(p => p.Id == post.Id)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.ViewCount, p => p.ViewCount + 1));

        return MapToDto(post);
    }

    public async Task<PostDto> CreateAsync(CreatePostDto dto)
    {
        var post = new Post {
            Title       = dto.Title,
            Slug        = dto.Slug,
            Excerpt     = dto.Excerpt,
            Content     = dto.Content,
            Tech        = dto.Tech,
            ReadingTime = dto.ReadingTime,
            CreatedAt   = DateTime.UtcNow,
            UpdatedAt   = DateTime.UtcNow
        };

        _context.Posts.Add(post);        // stage the insert
        await _context.SaveChangesAsync(); // execute INSERT

        return MapToDto(post);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var rows = await _context.Posts
            .Where(p => p.Id == id)
            .ExecuteDeleteAsync();
        return rows > 0;
    }

    // Private helper — converts entity → DTO
    private static PostDto MapToDto(Post p) => new PostDto {
        Id          = p.Id,
        Title       = p.Title,
        Slug        = p.Slug,
        Excerpt     = p.Excerpt,
        Content     = p.Content,
        Tech        = p.Tech?.Split(',', StringSplitOptions.RemoveEmptyEntries) ?? [],
        ReadingTime = p.ReadingTime,
        Date        = p.CreatedAt.ToString("yyyy-MM-dd")
    };
}


// ═══════════════════════════════════════════════════════════════
// Controllers/PostsController.cs — HTTP Request Handlers
// ═══════════════════════════════════════════════════════════════
namespace TechBlog.Api.Controllers;
using Microsoft.AspNetCore.Mvc;
using TechBlog.Api.Models;
using TechBlog.Api.Services;

[ApiController]
[Route("api/[controller]")]  // → /api/posts
public class PostsController : ControllerBase
{
    private readonly IPostService _postService;
    private readonly ILogger<PostsController> _logger;

    public PostsController(IPostService postService, ILogger<PostsController> logger)
    {
        _postService = postService;
        _logger      = logger;
    }

    /// <summary>GET /api/posts — returns all published posts</summary>
    [HttpGet]
    [ResponseCache(Duration = 60)] // cache for 60 seconds
    public async Task<ActionResult<IEnumerable<PostDto>>> GetAll()
    {
        _logger.LogInformation("GET /api/posts called");
        var posts = await _postService.GetAllAsync();
        return Ok(posts);
    }

    /// <summary>GET /api/posts/{slug} — returns one post by URL slug</summary>
    [HttpGet("{slug}")]
    public async Task<ActionResult<PostDto>> GetBySlug(string slug)
    {
        var post = await _postService.GetBySlugAsync(slug);
        if (post == null) {
            _logger.LogWarning("Post not found: {slug}", slug);
            return NotFound(new { error = $"No post found with slug '{slug}'" });
        }
        return Ok(post);
    }

    /// <summary>POST /api/posts — create a new post</summary>
    [HttpPost]
    // [Authorize]  // uncomment when you add authentication
    public async Task<ActionResult<PostDto>> Create([FromBody] CreatePostDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var post = await _postService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetBySlug), new { slug = post.Slug }, post);
    }

    /// <summary>DELETE /api/posts/{id}</summary>
    [HttpDelete("{id:int}")]
    // [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _postService.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent(); // 204
    }
}
