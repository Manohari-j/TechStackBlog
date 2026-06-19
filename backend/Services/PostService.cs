using TechBlog.Api.Data;
using TechBlog.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace TechBlog.Api.Services;

public interface IPostService
{
    Task<IEnumerable<PostDto>> GetAllAsync();
    Task<PostDto?> GetBySlugAsync(string slug);
    Task<PostDto> CreateAsync(CreatePostDto dto);
    Task<bool> DeleteAsync(int id);
}

public class PostService : IPostService
{
    private readonly BlogDbContext _context;

    public PostService(BlogDbContext context) => _context = context;

    public async Task<IEnumerable<PostDto>> GetAllAsync()
    {
        return await _context.Posts
            .AsNoTracking()
            .Where(p => p.IsPublished)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => MapToDto(p))
            .ToListAsync();
    }

    public async Task<PostDto?> GetBySlugAsync(string slug)
    {
        var post = await _context.Posts
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Slug == slug && p.IsPublished);

        if (post == null) return null;

        await _context.Posts
            .Where(p => p.Id == post.Id)
            .ExecuteUpdateAsync(s => s.SetProperty(
                p => p.ViewCount,
                p => p.ViewCount + 1));

        return MapToDto(post);
    }

    public async Task<PostDto> CreateAsync(CreatePostDto dto)
    {
        var post = new Post {
            Title = dto.Title,
            Slug = dto.Slug,
            Excerpt = dto.Excerpt,
            Content = dto.Content,
            Tech = dto.Tech,
            ReadingTime = dto.ReadingTime,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Posts.Add(post);
        await _context.SaveChangesAsync();
        return MapToDto(post);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var rows = await _context.Posts
            .Where(p => p.Id == id)
            .ExecuteDeleteAsync();
        return rows > 0;
    }

    private static PostDto MapToDto(Post p) => new PostDto {
        Id = p.Id,
        Title = p.Title,
        Slug = p.Slug,
        Excerpt = p.Excerpt,
        Content = p.Content,
        Tech = p.Tech?.Split(',', StringSplitOptions.RemoveEmptyEntries) ?? [],
        ReadingTime = p.ReadingTime,
        Date = p.CreatedAt.ToString("yyyy-MM-dd")
    };
}
