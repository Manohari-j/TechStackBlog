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

    public PostsController(IPostService postService, ILogger<PostsController> logger)
    {
        _postService = postService;
        _logger = logger;
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
}
