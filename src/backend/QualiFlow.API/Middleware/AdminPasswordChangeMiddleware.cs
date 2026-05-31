using System.Net;
using System.Text.Json;

namespace QualiFlow.API.Middleware;

/// <summary>
/// Middleware that enforces the password-change requirement for admin users.
/// If the JWT contains the "pwd_change_required" claim, only password-change
/// and logout endpoints are allowed; all other admin API requests are rejected
/// with 403 Forbidden.
/// </summary>
public class AdminPasswordChangeMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<AdminPasswordChangeMiddleware> _logger;

    // Endpoints that are always allowed even when password change is required
    private static readonly string[] AllowedPaths =
    [
        "/api/v1/admin/auth/change-password",
        "/api/v1/admin/auth/logout",
        "/api/v1/admin/auth/refresh-token",
    ];

    public AdminPasswordChangeMiddleware(RequestDelegate next, ILogger<AdminPasswordChangeMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Only inspect admin API requests
        if (!context.Request.Path.StartsWithSegments("/api/v1/admin", StringComparison.OrdinalIgnoreCase))
        {
            await _next(context);
            return;
        }

        // Only apply to authenticated requests
        if (context.User.Identity?.IsAuthenticated != true)
        {
            await _next(context);
            return;
        }

        // Check for the restricted claim
        var pwdChangeRequired = context.User.FindFirst("pwd_change_required");
        if (pwdChangeRequired?.Value != "true")
        {
            await _next(context);
            return;
        }

        // Allow whitelisted endpoints (password change, logout, token refresh)
        var path = context.Request.Path.Value ?? string.Empty;
        if (Array.Exists(AllowedPaths, allowed => path.Equals(allowed, StringComparison.OrdinalIgnoreCase)))
        {
            await _next(context);
            return;
        }

        // Block everything else
        _logger.LogWarning(
            "Admin {AdminId} attempted to access {Path} without changing password first",
            context.User.FindFirst("admin_id")?.Value,
            path);

        context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
        context.Response.ContentType = "application/json";

        var problem = new
        {
            type = "https://tools.ietf.org/html/rfc9110#section-15.5.4",
            title = "Password Change Required",
            status = 403,
            detail = "You must change your password before accessing this resource.",
            instance = path,
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(problem));
    }
}

