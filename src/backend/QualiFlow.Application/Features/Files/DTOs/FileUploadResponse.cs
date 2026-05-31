namespace QualiFlow.Application.Features.Files.DTOs;

/// <summary>
/// Response after uploading a file.
/// </summary>
public record FileUploadResponse
{
    /// <summary>
    /// Gets the attachment ID.
    /// </summary>
    public Guid Id { get; init; }

    /// <summary>
    /// Gets the original file name.
    /// </summary>
    public string FileName { get; init; } = string.Empty;

    /// <summary>
    /// Gets the content type.
    /// </summary>
    public string ContentType { get; init; } = string.Empty;

    /// <summary>
    /// Gets the file size in bytes.
    /// </summary>
    public long FileSize { get; init; }

    /// <summary>
    /// Gets the URL to access the file.
    /// </summary>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "URL returned as string for JSON serialization")]
    public string Url { get; init; } = string.Empty;

    /// <summary>
    /// Gets when the file was uploaded.
    /// </summary>
    public DateTime UploadedAt { get; init; }
}

