using Microsoft.AspNetCore.Http;
using QualiFlow.Application.Features.Files.DTOs;

namespace QualiFlow.Application.Features.Files.Services;

/// <summary>
/// Interface for file upload and management operations.
/// </summary>
public interface IFileService
{
    /// <summary>
    /// Uploads a file and optionally attaches it to a message.
    /// </summary>
    /// <param name="file">The file to upload.</param>
    /// <param name="messageId">Optional message ID to attach to.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The upload response with file details.</returns>
    Task<FileUploadResponse> UploadAsync(
        IFormFile file,
        Guid? messageId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets attachments for a message.
    /// </summary>
    /// <param name="messageId">The message ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of file responses.</returns>
    Task<IReadOnlyList<FileUploadResponse>> GetByMessageIdAsync(
        Guid messageId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a file attachment.
    /// </summary>
    /// <param name="attachmentId">The attachment ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if deleted.</returns>
    Task<bool> DeleteAsync(Guid attachmentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a temporary download URL for a file.
    /// </summary>
    /// <param name="attachmentId">The attachment ID.</param>
    /// <param name="expiresIn">How long the URL should be valid.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The download URL.</returns>
    Task<string?> GetDownloadUrlAsync(
        Guid attachmentId,
        TimeSpan? expiresIn = null,
        CancellationToken cancellationToken = default);
}

