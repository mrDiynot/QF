using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Hangfire.Dashboard;
using Microsoft.IdentityModel.Tokens;

namespace QualiFlow.API.Filters;

/// <summary>
/// Hangfire dashboard authorization filter that validates Admin JWT tokens.
/// Accepts tokens via query string (?access_token=...) or Authorization header.
/// Only allows access to authenticated admin users (SuperAdmin or PlatformAdmin).
/// </summary>
public class HangfireAdminAuthorizationFilter : IDashboardAuthorizationFilter
{
    private readonly string _secret;
    private readonly string _issuer;
    private readonly string _audience;

    /// <summary>
    /// Initializes a new instance of the <see cref="HangfireAdminAuthorizationFilter"/> class.
    /// </summary>
    /// <param name="configuration">The application configuration.</param>
    public HangfireAdminAuthorizationFilter(IConfiguration configuration)
    {
        _secret = configuration["AdminJwt:Secret"]
            ?? configuration["Jwt:Secret"]
            ?? throw new InvalidOperationException("AdminJwt:Secret or Jwt:Secret must be configured.");
        _issuer = configuration["AdminJwt:Issuer"] ?? "https://api-dev.qualiflow.ai";
        _audience = configuration["AdminJwt:Audience"] ?? "https://dev.qualiflow.ai";
    }

    /// <inheritdoc/>
    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();

        // Try to get token from query string first (?access_token=...)
        var token = httpContext.Request.Query["access_token"].FirstOrDefault();

        // Fall back to Authorization header (Bearer <token>)
        if (string.IsNullOrEmpty(token))
        {
            var authHeader = httpContext.Request.Headers.Authorization.FirstOrDefault();
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                token = authHeader["Bearer ".Length..].Trim();
            }
        }

        // Fall back to cookie (set by admin portal)
        if (string.IsNullOrEmpty(token))
        {
            token = httpContext.Request.Cookies["admin_access_token"];
        }

        if (string.IsNullOrEmpty(token))
        {
            return false;
        }

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _issuer,
                ValidAudience = _audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret)),
                ClockSkew = TimeSpan.FromMinutes(1)
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out _);

            // Verify this is an admin token with appropriate role
            var isAdmin = principal.Claims.Any(c => c.Type == "is_admin" && c.Value == "true");
            var adminRole = principal.Claims.FirstOrDefault(c => c.Type == "admin_role")?.Value;

            // Only SuperAdmin and PlatformAdmin can access Hangfire dashboard
            return isAdmin && adminRole is "SuperAdmin" or "PlatformAdmin";
        }
        catch
        {
            return false;
        }
    }
}

