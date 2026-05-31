using Microsoft.EntityFrameworkCore;
using Serilog;

namespace QualiFlow.API.Extensions;

/// <summary>
/// Extension methods for configuring the HTTP request/response middleware pipeline.
/// </summary>
public static class MiddlewarePipelineExtensions
{
    /// <summary>
    /// Configures the full middleware pipeline including security headers, authentication,
    /// endpoint mapping, and database initialization.
    /// </summary>
    /// <returns>The <see cref="WebApplication"/> for chaining.</returns>
    public static WebApplication ConfigureMiddlewarePipeline(this WebApplication app)
    {
        ConfigureSwagger(app);
        ConfigureSecurityHeaders(app);
        ConfigureRequestPipeline(app);
        MapEndpoints(app);
        app.UseHangfireRecurringJobs();
        MapHealthCheckEndpoints(app);

        return app;
    }

    private static void ConfigureSwagger(WebApplication app)
    {
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "QualiFlow API v1");
            options.RoutePrefix = "swagger";
        });
    }

    private static void ConfigureSecurityHeaders(WebApplication app)
    {
        app.Use(async (context, next) =>
        {
            context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
            context.Response.Headers.Append("X-Frame-Options", "DENY");
            context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
            context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");

            var csp = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; " +
                      "img-src 'self' data: https:; font-src 'self'; connect-src 'self' ws: wss:; " +
                      "frame-ancestors 'none'; base-uri 'self'; form-action 'self'";
            context.Response.Headers.Append("Content-Security-Policy", csp);

            var permissionsPolicy = "geolocation=(), microphone=(), camera=(), payment=(), " +
                                   "usb=(), magnetometer=(), gyroscope=(), accelerometer=()";
            context.Response.Headers.Append("Permissions-Policy", permissionsPolicy);

            context.Response.Headers.Remove("Server");
            context.Response.Headers.Remove("X-Powered-By");
            context.Response.Headers.Remove("X-AspNet-Version");
            context.Response.Headers.Remove("X-AspNetMvc-Version");

            await next();
        });
    }

    private static void ConfigureRequestPipeline(WebApplication app)
    {
        app.UseMiddleware<QualiFlow.API.Middleware.GlobalExceptionHandlingMiddleware>();
        app.UseSerilogRequestLogging();

        if (app.Environment.IsProduction())
        {
            app.UseHsts();
        }

        app.UseHttpsRedirection();

        app.UseStaticFiles(new StaticFileOptions
        {
            OnPrepareResponse = ctx =>
            {
                ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
                ctx.Context.Response.Headers.Append("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
                ctx.Context.Response.Headers.Append("Access-Control-Allow-Headers", "Content-Type");
                ctx.Context.Response.Headers.Append("Cache-Control", "public, max-age=3600");
            }
        });

        app.UseResponseCompression();
        app.UseWebSockets();
        app.UseCors("QualiFlowCors");

        if (!app.Environment.IsDevelopment())
        {
            app.UseResponseCaching();
        }

        app.UseMiddleware<AspNetCoreRateLimit.IpRateLimitMiddleware>();
        app.UseAuthentication();
        app.UseAuthorization();
        app.UseMiddleware<QualiFlow.API.Middleware.AdminPasswordChangeMiddleware>();
        app.UseMiddleware<QualiFlow.API.Middleware.AdminAuditLoggingMiddleware>();

        if (!app.Environment.IsEnvironment("Testing"))
        {
            app.UseMiddleware<QualiFlow.API.Middleware.SubscriptionCheckMiddleware>();
        }
    }

    private static void MapEndpoints(WebApplication app)
    {
        app.MapControllers();

        // SignalR Hubs
        app.MapHub<QualiFlow.API.Hubs.ConversationHub>("/hubs/conversation");
        app.MapHub<QualiFlow.API.Hubs.PublicChatHub>("/hubs/public-chat").AllowAnonymous();
        app.MapHub<QualiFlow.API.Hubs.NotificationHub>("/hubs/notifications");

        // Twilio Media Streams WebSocket
        app.Map("/api/v1/webhooks/twilio/media-stream", async (HttpContext context) =>
        {
            if (!context.WebSockets.IsWebSocketRequest)
            {
                context.Response.StatusCode = 400;
                return;
            }

            var agentIdStr = context.Request.Query["agentId"].ToString();
            var callSid = context.Request.Query["callSid"].ToString();

            if (!Guid.TryParse(agentIdStr, out var agentId))
            {
                context.Response.StatusCode = 400;
                return;
            }

            var webSocket = await context.WebSockets.AcceptWebSocketAsync();
            var handler = context.RequestServices.GetRequiredService<QualiFlow.API.Hubs.MediaStreamHandler>();
            await handler.HandleWebSocketAsync(webSocket, agentId, callSid, context.RequestAborted);
        });
    }

    private static void MapHealthCheckEndpoints(WebApplication app)
    {
        app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
        {
            Predicate = check => check.Tags.Contains("ready"),
            ResponseWriter = HealthChecks.UI.Client.UIResponseWriter.WriteHealthCheckUIResponse,
            AllowCachingResponses = false,
        }).AllowAnonymous();

        app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
        {
            Predicate = check => check.Tags.Contains("ready"),
            ResponseWriter = HealthChecks.UI.Client.UIResponseWriter.WriteHealthCheckUIResponse,
            AllowCachingResponses = false,
        }).AllowAnonymous();

        app.MapHealthChecks("/health/live", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
        {
            Predicate = _ => false,
            ResponseWriter = HealthChecks.UI.Client.UIResponseWriter.WriteHealthCheckUIResponse,
            AllowCachingResponses = false,
        }).AllowAnonymous();
    }

    /// <summary>
    /// Applies database migrations and seeds data.
    /// </summary>
    /// <returns>A <see cref="Task"/> representing the asynchronous operation.</returns>
    public static async Task InitializeDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<QualiFlow.Infrastructure.Data.QualiFlowDbContext>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

        try
        {
            logger.LogInformation("Checking database connection...");
            var canConnect = await context.Database.CanConnectAsync();
            if (!canConnect)
            {
                logger.LogWarning("Cannot connect to database. Application will start but database operations will fail.");
            }
            else
            {
                var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
                if (pendingMigrations.Any())
                {
                    logger.LogInformation("Applying {Count} pending database migrations...", pendingMigrations.Count());
                    await context.Database.MigrateAsync();
                    logger.LogInformation("Database migrations applied successfully");
                }
                else
                {
                    logger.LogInformation("Database is up to date - no pending migrations");
                }
            }
        }
        catch (Exception ex)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
            var connectionStringPreview = connectionString.Length > 50
                ? connectionString[..50]
                : connectionString;

            logger.LogError(
                ex,
                "Failed to apply database migrations. Connection string: {ConnectionString}",
                connectionStringPreview);

            logger.LogWarning("Continuing application startup despite database migration failure...");
        }

        // Seed admin data
        await QualiFlow.Infrastructure.Data.Seeds.AdminSeedData.SeedSuperAdminAsync(
            context, configuration, logger);

        // Seed test data in Development
        var environment = configuration["ASPNETCORE_ENVIRONMENT"]
            ?? Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        if (string.Equals(environment, "Development", StringComparison.OrdinalIgnoreCase))
        {
            logger.LogInformation("Development environment detected. Seeding test data...");
            await QualiFlow.Infrastructure.Data.Seeds.TestDataSeeder.SeedTestDataAsync(context, logger);
        }

        // Seed Coming Soon chat widget and Knowledge Base
        var openAiService = scope.ServiceProvider
            .GetService<QualiFlow.Application.Common.Interfaces.IOpenAIService>();
        logger.LogInformation("Seeding/updating Coming Soon chat widget and Knowledge Base...");
        await QualiFlow.Infrastructure.Data.SeedData.ComingSoonChatWidgetSeeder.SeedAsync(
            context, logger, openAiService);
    }
}

