// -----------------------------------------------------------------------
// <copyright file="UsersController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Users.DTOs;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Controllers;

/// <summary>
/// API controller for user profile management.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize(AuthenticationSchemes = "Bearer")]
[Produces("application/json")]
public partial class UsersController : ControllerBase
{
    private readonly QualiFlowDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<UsersController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="UsersController"/> class.
    /// </summary>
    /// <param name="dbContext">The database context.</param>
    /// <param name="currentUserService">The current user service.</param>
    /// <param name="logger">The logger.</param>
    public UsersController(
        QualiFlowDbContext dbContext,
        ICurrentUserService currentUserService,
        ILogger<UsersController> logger)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Gets the current user's profile.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The user profile.</returns>
    [HttpGet("me")]
    [NoCache]
    [ProducesResponseType(typeof(UserProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserProfileResponse>> GetCurrentUserAsync(
        CancellationToken cancellationToken)
    {
        var userId = _currentUserService.GetUserId();

        if (!userId.HasValue)
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Unauthorized",
                Detail = "User is not authenticated.",
            });
        }

        var user = await _dbContext.Users
            .Include(u => u.Business)
            .FirstOrDefaultAsync(u => u.Id == userId.Value, cancellationToken);

        if (user == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "User not found",
                Detail = "The current user could not be found.",
            });
        }

        return Ok(MapToResponse(user));
    }

    /// <summary>
    /// Updates the current user's profile.
    /// </summary>
    /// <param name="request">The update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated user profile.</returns>
    [HttpPatch("me")]
    [ProducesResponseType(typeof(UserProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserProfileResponse>> UpdateCurrentUserAsync(
        [FromBody] UpdateUserProfileRequest request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUserService.GetUserId();

        if (!userId.HasValue)
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Unauthorized",
                Detail = "User is not authenticated.",
            });
        }

        var user = await _dbContext.Users
            .Include(u => u.Business)
            .FirstOrDefaultAsync(u => u.Id == userId.Value, cancellationToken);

        if (user == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "User not found",
                Detail = "The current user could not be found.",
            });
        }

        // Update fields if provided
        if (!string.IsNullOrWhiteSpace(request.FirstName))
        {
            user.FirstName = request.FirstName;
        }

        if (!string.IsNullOrWhiteSpace(request.LastName))
        {
            user.LastName = request.LastName;
        }

        if (request.PhoneNumber != null)
        {
            user.PhoneNumber = request.PhoneNumber;
        }

        if (request.ProfilePictureUrl != null)
        {
            user.ProfilePictureUrl = request.ProfilePictureUrl;
        }

        user.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        LogUserProfileUpdated(userId.Value);

        return Ok(MapToResponse(user));
    }

    /// <summary>
    /// Uploads a profile picture for the current user.
    /// </summary>
    /// <param name="file">The image file to upload.</param>
    /// <param name="blobStorage">The blob storage service.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The profile picture URL.</returns>
    [HttpPost("me/picture")]
    [RequestSizeLimit(5 * 1024 * 1024)] // 5 MB max
    [ProducesResponseType(typeof(ProfilePictureUploadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ProfilePictureUploadResponse>> UploadProfilePictureAsync(
        IFormFile file,
        [FromServices] Application.Common.Interfaces.IBlobStorageService blobStorage,
        CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "No file provided",
                Detail = "Please upload an image file.",
            });
        }

        // Validate file type
        var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType.ToLowerInvariant()))
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid file type",
                Detail = "Only JPEG, PNG, GIF, and WebP images are allowed.",
            });
        }

        var userId = _currentUserService.GetUserId();

        if (!userId.HasValue)
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Unauthorized",
                Detail = "User ID could not be determined.",
            });
        }

        var user = await _dbContext.Set<ApplicationUser>()
            .FirstOrDefaultAsync(u => u.Id == userId.Value, cancellationToken);

        if (user == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "User not found",
            });
        }

        // Generate unique blob name
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var blobName = $"profile-pictures/{userId}/{Guid.NewGuid()}{extension}";

        // Upload to blob storage
        await using var stream = file.OpenReadStream();
        var blobUrl = await blobStorage.UploadAsync(
            "attachments",
            blobName,
            stream,
            file.ContentType,
            cancellationToken);

        // Update user profile
        user.ProfilePictureUrl = blobUrl;
        user.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        LogProfilePictureUploaded(userId.Value);

        return Ok(new ProfilePictureUploadResponse { ProfilePictureUrl = blobUrl });
    }

    private static UserProfileResponse MapToResponse(ApplicationUser user)
    {
        return new UserProfileResponse
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            ProfilePictureUrl = user.ProfilePictureUrl,
            BusinessId = user.BusinessId,
            BusinessName = user.Business?.Name ?? string.Empty,
            IsActive = user.IsActive,
            IsOAuthUser = user.IsOAuthUser,
            OAuthProvider = user.OAuthProvider,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
        };
    }

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "User {UserId} updated their profile")]
    private partial void LogUserProfileUpdated(Guid userId);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "User {UserId} uploaded a profile picture")]
    private partial void LogProfilePictureUploaded(Guid userId);
}

/// <summary>
/// Response DTO for profile picture upload.
/// </summary>
public record ProfilePictureUploadResponse
{
    /// <summary>
    /// Gets the URL of the uploaded profile picture.
    /// </summary>
#pragma warning disable CA1056 // URI properties should not be strings
    public string ProfilePictureUrl { get; init; } = string.Empty;
#pragma warning restore CA1056 // URI properties should not be strings
}

