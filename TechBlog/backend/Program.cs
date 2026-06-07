using Microsoft.EntityFrameworkCore;
using TechBlog.Api.Data;
using TechBlog.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<BlogDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.EnableRetryOnFailure(maxRetryCount: 3)
    )
);

builder.Services.AddScoped<IPostService, PostService>();

builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(
            "http://localhost:3000",
            "https://calm-island-0a7b4b30f.7.azurestaticapps.net"
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
    );
});

var app = builder.Build();

if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

app.MapGet("/health", () => new {
    status = "healthy",
    timestamp = DateTime.UtcNow
});

app.Run();
