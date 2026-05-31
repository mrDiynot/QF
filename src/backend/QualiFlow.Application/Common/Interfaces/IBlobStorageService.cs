namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Interface for Azure Blob Storage operations.
/// </summary>
public interface IBlobStorageService
{
    /// <summary>
    /// Uploads a file to blob storage.
    /// </summary>
    /// <param name="containerName">The container name.</param>
    /// <param name="blobName">The blob name (path within container).</param>
    /// <param name="content">The file content stream.</param>
    /// <param name="contentType">The content type (MIME type).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The URL of the uploaded blob.</returns>
    Task<string> UploadAsync(
        string containerName,
        string blobName,
        Stream content,
        string contentType,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Downloads a file from blob storage.
    /// </summary>
    /// <param name="containerName">The container name.</param>
    /// <param name="blobName">The blob name.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The file content stream.</returns>
    Task<Stream> DownloadAsync(
        string containerName,
        string blobName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a file from blob storage.
    /// </summary>
    /// <param name="containerName">The container name.</param>
    /// <param name="blobName">The blob name.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if deleted, false if not found.</returns>
    Task<bool> DeleteAsync(
        string containerName,
        string blobName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates a SAS URL for temporary access to a blob.
    /// </summary>
    /// <param name="containerName">The container name.</param>
    /// <param name="blobName">The blob name.</param>
    /// <param name="expiresIn">How long the URL should be valid.</param>
    /// <returns>The SAS URL.</returns>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1055:URI-like return values should not be strings", Justification = "URL returned as string for flexibility")]
    string GenerateSasUrl(string containerName, string blobName, TimeSpan expiresIn);

    /// <summary>
    /// Checks if a blob exists.
    /// </summary>
    /// <param name="containerName">The container name.</param>
    /// <param name="blobName">The blob name.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if exists.</returns>
    Task<bool> ExistsAsync(
        string containerName,
        string blobName,
        CancellationToken cancellationToken = default);
}

