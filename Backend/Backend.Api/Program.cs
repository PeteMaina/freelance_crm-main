using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Backend.Api.Data;
using Backend.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

string dbUrl = Environment.GetEnvironmentVariable("DATABASE_URL") ?? builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=crm.db";
if (dbUrl.StartsWith("postgresql://") || dbUrl.StartsWith("postgres://"))
{
    dbUrl = "Data Source=crm.db";
}

builder.Services.AddDbContext<ActivaDbContext>(options =>
{
    options.UseSqlite(dbUrl.StartsWith("Data Source") ? dbUrl : "Data Source=crm.db");
});

builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<ICallSprintTodoNotificationService, CallSprintTodoNotificationService>();
builder.Services.AddScoped<IClientPortalService, ClientPortalService>();

string secretKey = Environment.GetEnvironmentVariable("SECRET_KEY") ?? builder.Configuration["SECRET_KEY"] ?? "supersecretkey";
var key = Encoding.UTF8.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();
builder.Services.AddControllers();

string rawOrigins = Environment.GetEnvironmentVariable("CORS_ORIGINS") ?? "http://localhost:5173,http://127.0.0.1:5173";
string[] corsOrigins = rawOrigins == "*"
    ? new[] { "*" }
    : rawOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy("ActivaCorsPolicy", policy =>
    {
        if (corsOrigins.Contains("*"))
        {
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
        }
        else
        {
            policy.WithOrigins(corsOrigins).AllowAnyHeader().AllowAnyMethod().AllowCredentials();
        }
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ACTIVA Operations API v1.0");
    c.RoutePrefix = "docs";
});

app.UseCors("ActivaCorsPolicy");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/", () => new { message = "ACTIVA Operations API v1.0 is running." });

app.MapGet("/health/diagnostics", (ActivaDbContext db) =>
{
    bool dbOk = false;
    string? dbError = null;
    try
    {
        dbOk = db.Database.CanConnect();
    }
    catch (Exception ex)
    {
        dbError = ex.Message;
    }

    return Results.Ok(new
    {
        status = "online",
        database = new
        {
            connected = dbOk,
            error = dbError,
            type = db.Database.ProviderName
        },
        cors = new
        {
            configured_origins = corsOrigins,
            raw_env = Environment.GetEnvironmentVariable("CORS_ORIGINS") ?? "not set"
        },
        environment = new
        {
            has_secret_key = !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("SECRET_KEY")),
            database_url_provided = !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("DATABASE_URL")),
            port = Environment.GetEnvironmentVariable("PORT") ?? "8000"
        }
    });
});

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ActivaDbContext>();
    dbContext.Database.EnsureCreated();
}

app.Run();
