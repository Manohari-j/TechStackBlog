using TechBlog.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace TechBlog.Api.Data;

public class BlogDbContext : DbContext
{
    public BlogDbContext(DbContextOptions<BlogDbContext> options)
        : base(options) { }

    public DbSet<Post> Posts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Post>(entity => {
            entity.ToTable("Posts");
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Title).HasMaxLength(200).IsRequired();
            entity.Property(p => p.Slug).HasMaxLength(200).IsRequired();
            entity.Property(p => p.Excerpt).HasMaxLength(500);
            entity.Property(p => p.Content).HasColumnType("NVARCHAR(MAX)");
            entity.Property(p => p.Tech).HasMaxLength(200);
            entity.HasIndex(p => p.Slug).IsUnique();
        });
    }
}
