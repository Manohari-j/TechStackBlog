using Microsoft.AspNetCore.Mvc;
using TechBlog.Api.Models;
using TechBlog.Api.Services;

namespace TechBlog.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PostsController : ControllerBase
{
    private readonly IPostService _postService;
    private readonly ILogger<PostsController> _logger;
    private readonly BlogDbContext _context;

    public PostsController(IPostService postService, ILogger<PostsController> logger, BlogDbContext context)
    {
        _postService = postService;
        _logger = logger;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PostDto>>> GetAll()
    {
        _logger.LogInformation("GET /api/posts called");
        var posts = await _postService.GetAllAsync();
        return Ok(posts);
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<PostDto>> GetBySlug(string slug)
    {
        var post = await _postService.GetBySlugAsync(slug);
        if (post == null)
            return NotFound(new { error = $"No post found with slug '{slug}'" });
        return Ok(post);
    }

    [HttpPost]
    public async Task<ActionResult<PostDto>> Create([FromBody] CreatePostDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var post = await _postService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetBySlug), new { slug = post.Slug }, post);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _postService.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }

    [HttpPut("{id:int}")]
public async Task<ActionResult<PostDto>> Update(int id, [FromBody] CreatePostDto dto)
{
    var post = await _context.Posts.FindAsync(id);
    if (post == null) return NotFound();

    post.Title = dto.Title;
    post.Slug = dto.Slug;
    post.Excerpt = dto.Excerpt ?? post.Excerpt;
    post.Content = dto.Content;
    post.Tech = dto.Tech;
    post.ReadingTime = dto.ReadingTime;
    post.UpdatedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();
    return Ok(post);
}
}
