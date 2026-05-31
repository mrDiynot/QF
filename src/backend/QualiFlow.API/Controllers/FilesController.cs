using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Features.Files.Services;

namespace QualiFlow.API.Controllers;

/// <summary>
/// API controller for file upload and management operations.
/// </summary>
/// <param name="fileService">The file service.</param>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize]
[Produces("application/json")]
public class FilesController(IFileService fileService) : ControllerBase
{
    /// <summary>
    /// Uploads a file and optionally attaches it to a message.
    /// </summary>
    /// <param name="file">The file to upload.</param>
    /// <param name="messageId">Optional message ID to attach the file to.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The uploaded file details.</returns>
    /// <response code="200">File uploaded successfully.</response>
    /// <response code="400">Invalid file or request.</response>
    /// <response code="401">Unauthorized.</response>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10 MB
    public async Task<IActionResult> UploadAsync(
        IFormFile file,
        [FromQuery] Guid? messageId = null,
        CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file provided.");
        }

        var result = await fileService.UploadAsync(file, messageId, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Gets all attachments for a message.
    /// </summary>
    /// <param name="messageId">The message ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of file attachments.</returns>
    /// <response code="200">Attachments retrieved successfully.</response>
    /// <response code="401">Unauthorized.</response>
    [HttpGet("message/{messageId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetByMessageIdAsync(
        Guid messageId,
        CancellationToken cancellationToken = default)
    {
        var attachments = await fileService.GetByMessageIdAsync(messageId, cancellationToken);
        return Ok(attachments);
    }

    /// <summary>
    /// Gets a temporary download URL for a file.
    /// </summary>
    /// <param name="id">The attachment ID.</param>
    /// <param name="expiresInMinutes">How long the URL should be valid (default: 60 minutes).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The download URL.</returns>
    /// <response code="200">Download URL generated successfully.</response>
    /// <response code="404">Attachment not found.</response>
    /// <response code="401">Unauthorized.</response>
    [HttpGet("{id:guid}/download-url")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetDownloadUrlAsync(
        Guid id,
        [FromQuery] int expiresInMinutes = 60,
        CancellationToken cancellationToken = default)
    {
        var url = await fileService.GetDownloadUrlAsync(
            id,
            TimeSpan.FromMinutes(expiresInMinutes),
            cancellationToken);

        if (url == null)
        {
            return NotFound();
        }

        return Ok(new { url });
    }

    /// <summary>
    /// Deletes a file attachment.
    /// </summary>
    /// <param name="id">The attachment ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content if successful.</returns>
    /// <response code="204">File deleted successfully.</response>
    /// <response code="404">Attachment not found.</response>
    /// <response code="401">Unauthorized.</response>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var deleted = await fileService.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}

