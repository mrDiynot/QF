using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;
using Serilog;

namespace QualiFlow.API.Extensions;

/// <summary>
/// Extension methods for configuring Entity Framework Core, PostgreSQL, and ASP.NET Core Identity.
/// </summary>
public static class DatabaseExtensions
{
    /// <summary>
    /// Adds Entity Framework Core with PostgreSQL and pgvector support.
    /// </summary>
    /// <returns>The <see cref="IServiceCollection"/> for chaining.</returns>
    public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        services.AddDbContext<QualiFlowDbContext>((serviceProvider, options) =>
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.UseVector();
                npgsqlOptions.CommandTimeout(30);
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 3,
                    maxRetryDelay: TimeSpan.FromSeconds(5),
                    errorCodesToAdd: null);
            })
            .UseSnakeCaseNamingConvention();

            // Sprint 31: Add automatic auditing interceptor
            var httpContextAccessor = serviceProvider.GetService<IHttpContextAccessor>();
            if (httpContextAccessor != null)
            {
                var auditingInterceptor = new QualiFlow.Infrastructure.Data.Interceptors.AuditingInterceptor(httpContextAccessor);
                options.AddInterceptors(auditingInterceptor);
            }

            if (environment.IsDevelopment())
            {
                options.EnableDetailedErrors();

                var enableSensitive = configuration.GetValue<bool>("Ef:EnableSensitiveDataLogging");
                if (enableSensitive)
                {
                    options.EnableSensitiveDataLogging();
                }

                options.LogTo(
                    message => Log.Information("[EF Core Query] {Message}", message),
                    new[] { Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.CommandExecuted },
                    minimumLevel: Microsoft.Extensions.Logging.LogLevel.Information,
                    options: Microsoft.EntityFrameworkCore.Diagnostics.DbContextLoggerOptions.DefaultWithUtcTime);
            }
        });

        return services;
    }

    /// <summary>
    /// Adds ASP.NET Core Identity with OWASP-compliant settings.
    /// </summary>
    /// <returns>The <see cref="IServiceCollection"/> for chaining.</returns>
    public static IServiceCollection AddIdentityServices(this IServiceCollection services)
    {
        services.AddIdentityCore<ApplicationUser>(options =>
        {
            // Password requirements (OWASP ASVS Level 2)
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = true;
            options.Password.RequiredLength = 8;
            options.Password.RequiredUniqueChars = 1;

            // User lockout
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.AllowedForNewUsers = true;

            // User options
            options.User.RequireUniqueEmail = true;
            options.SignIn.RequireConfirmedEmail = false;
            options.SignIn.RequireConfirmedPhoneNumber = false;
        })
        .AddRoles<ApplicationRole>()
        .AddEntityFrameworkStores<QualiFlowDbContext>()
        .AddSignInManager<SignInManager<ApplicationUser>>()
        .AddDefaultTokenProviders();

        return services;
    }
}

