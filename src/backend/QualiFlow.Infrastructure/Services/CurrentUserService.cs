using System.Security.Claims;

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

using QualiFlow.Application.Common.Interfaces;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for accessing information about the currently authenticated user.
/// Extracts user information from HTTP context and JWT claims.
/// </summary>
public partial class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<CurrentUserService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="CurrentUserService"/> class.
    /// </summary>
    /// <param name="httpContextAccessor">HTTP context accessor for accessing current request context.</param>
    /// <param name="logger">Logger for logging authentication and authorization events.</param>
    public CurrentUserService(
        IHttpContextAccessor httpContextAccessor,
        ILogger<CurrentUserService> logger)
    {
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    /// <inheritdoc />
    public Guid? GetUserId()
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User
            .FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
        {
            return null;
        }

        if (Guid.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }

        LogInvalidUserIdClaim(_logger, userIdClaim);
        return null;
    }

    /// <inheritdoc />
    public Guid GetBusinessId()
    {
        var businessId = TryGetBusinessId();

        if (businessId == null)
        {
            LogMissingBusinessIdClaim(_logger);
            throw new UnauthorizedAccessException(
                "Business ID claim is missing. User must be authenticated with a valid business context.");
        }

        return businessId.Value;
    }

    /// <inheritdoc />
    public Guid? TryGetBusinessId()
    {
        var businessIdClaim = _httpContextAccessor.HttpContext?.User
            .FindFirst("businessId")?.Value;

        if (string.IsNullOrEmpty(businessIdClaim))
        {
            return null;
        }

        if (Guid.TryParse(businessIdClaim, out var businessId))
        {
            return businessId;
        }

        LogInvalidBusinessIdClaim(_logger, businessIdClaim);
        return null;
    }

    /// <inheritdoc />
    public string? GetUserEmail()
    {
        return _httpContextAccessor.HttpContext?.User
            .FindFirst(ClaimTypes.Email)?.Value;
    }

    /// <inheritdoc />
    public bool IsAuthenticated()
    {
        return _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
    }

    // ============================================================================
    // LoggerMessage Delegates (High-Performance Logging)
    // ============================================================================

    [LoggerMessage(Level = LogLevel.Warning, Message = "Invalid user ID claim value: {UserIdClaim}")]
    private static partial void LogInvalidUserIdClaim(ILogger logger, string userIdClaim);

    [LoggerMessage(Level = LogLevel.Error, Message = "Business ID claim is missing from authenticated user")]
    private static partial void LogMissingBusinessIdClaim(ILogger logger);

    [LoggerMessage(Level = LogLevel.Error, Message = "Invalid business ID claim value: {BusinessIdClaim}")]
    private static partial void LogInvalidBusinessIdClaim(ILogger logger, string businessIdClaim);
}

