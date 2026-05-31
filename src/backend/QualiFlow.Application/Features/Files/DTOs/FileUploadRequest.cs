using Microsoft.AspNetCore.Http;

namespace QualiFlow.Application.Features.Files.DTOs;

/// <summary>
/// Request for uploading a file.
/// </summary>
public record FileUploadRequest
{
    /// <summary>
    /// Gets the file to upload.
    /// </summary>
    public required IFormFile File { get; init; }

    /// <summary>
    /// Gets the optional message ID to attach the file to.
    /// </summary>
    public Guid? MessageId { get; init; }
}

