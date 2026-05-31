using System.Text;
using System.Text.Json;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Middleware;

/// <summary>
/// Middleware for logging all admin platform actions to the audit log.
/// </summary>
public class AdminAuditLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<AdminAuditLoggingMiddleware> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AdminAuditLoggingMiddleware"/> class.
    /// </summary>
    public AdminAuditLoggingMiddleware(
        RequestDelegate next,
        ILogger<AdminAuditLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    /// <summary>
    /// Invokes the middleware.
    /// </summary>
    /// <param name="context">The HTTP context.</param>
    /// <param name="dbContext">The database context.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task InvokeAsync(HttpContext context, QualiFlowDbContext dbContext)
    {
        // Only log admin API requests
        if (!context.Request.Path.StartsWithSegments("/api/v1/admin", StringComparison.OrdinalIgnoreCase))
        {
            await _next(context);
            return;
        }

        // Skip audit logging for login and refresh-token endpoints (too noisy)
        if (context.Request.Path.Value?.Contains("/auth/login", StringComparison.OrdinalIgnoreCase) == true ||
            context.Request.Path.Value?.Contains("/auth/refresh-token", StringComparison.OrdinalIgnoreCase) == true)
        {
            await _next(context);
            return;
        }

        // Capture request details
        var requestPath = context.Request.Path.Value ?? string.Empty;
        var httpMethod = context.Request.Method;
        var ipAddress = context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        var userAgent = context.Request.Headers.UserAgent.ToString();

        // Get admin user ID from claims (admin JWT uses "admin_id" claim)
        var adminUserIdClaim = context.User.FindFirst("admin_id")?.Value;
        Guid? adminUserId = null;
        if (!string.IsNullOrEmpty(adminUserIdClaim) && Guid.TryParse(adminUserIdClaim, out var parsedAdminUserId))
        {
            adminUserId = parsedAdminUserId;
        }

        // Capture response
        var originalBodyStream = context.Response.Body;
        using var responseBody = new MemoryStream();
        context.Response.Body = responseBody;

        Exception? exception = null;
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            exception = ex;
            throw;
        }
        finally
        {
            // Only log if user is authenticated as admin
            if (adminUserId.HasValue)
            {
                try
                {
                    var statusCode = context.Response.StatusCode;
                    var success = statusCode >= 200 && statusCode < 300;

                    var auditLog = new AdminAuditLog
                    {
                        AdminUserId = adminUserId.Value,
                        Action = DetermineAction(httpMethod, requestPath),
                        EntityType = ExtractEntityType(requestPath),
                        EntityId = ExtractEntityId(requestPath),
                        IpAddress = ipAddress,
                        UserAgent = userAgent,
                        HttpMethod = httpMethod,
                        RequestPath = requestPath,
                        StatusCode = statusCode,
                        Success = success,
                        ErrorMessage = exception?.Message
                    };

                    await dbContext.AdminAuditLogs.AddAsync(auditLog);
                    await dbContext.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to write admin audit log");
                }
            }

            // Copy response back to original stream
            responseBody.Seek(0, SeekOrigin.Begin);
            await responseBody.CopyToAsync(originalBodyStream);
        }
    }

    private static string DetermineAction(string httpMethod, string requestPath)
    {
        var segments = requestPath.Split('/', StringSplitOptions.RemoveEmptyEntries);
        var action = httpMethod switch
        {
            "GET" => "View",
            "POST" => requestPath.Contains("/reactivate", StringComparison.OrdinalIgnoreCase) ? "Reactivate" : "Create",
            "PUT" => "Update",
            "PATCH" => "Update",
            "DELETE" => "Delete",
            _ => "Unknown"
        };

        var entity = segments.Length >= 3 ? segments[2] : "Unknown";
        return $"{action}{entity}";
    }

    private static string? ExtractEntityType(string requestPath)
    {
        var segments = requestPath.Split('/', StringSplitOptions.RemoveEmptyEntries);
        return segments.Length >= 3 ? segments[2] : null;
    }

    private static string? ExtractEntityId(string requestPath)
    {
        var segments = requestPath.Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (segments.Length >= 4 && Guid.TryParse(segments[3], out _))
        {
            return segments[3];
        }

        return null;
    }
}

