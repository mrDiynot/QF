using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Local file system implementation of blob storage for development.
/// Stores files in a local directory and returns absolute URLs that work cross-origin.
/// </summary>
public partial class LocalBlobStorageService : IBlobStorageService
{
    private readonly string _basePath;
    private readonly string _baseUrl;
    private readonly ILogger<LocalBlobStorageService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="LocalBlobStorageService"/> class.
    /// </summary>
    /// <param name="logger">The logger.</param>
    /// <param name="configuration">The configuration.</param>
    public LocalBlobStorageService(ILogger<LocalBlobStorageService> logger, IConfiguration configuration)
    {
        _logger = logger;

        // Store files in a local directory within the project
        _basePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

        // Get API base URL from configuration (for cross-origin access from frontend)
        // Default to localhost:5050 if not configured (development port)
#pragma warning disable S1075 // URIs should not be hardcoded - default fallback for local development
        var apiBaseUrl = configuration["ApiBaseUrl"] ?? "http://localhost:5050";
#pragma warning restore S1075
        _baseUrl = $"{apiBaseUrl.TrimEnd('/')}/uploads";

        // Ensure directory exists
        if (!Directory.Exists(_basePath))
        {
            Directory.CreateDirectory(_basePath);
        }
    }

    /// <inheritdoc/>
    public async Task<string> UploadAsync(
        string containerName,
        string blobName,
        Stream content,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        var containerPath = Path.Combine(_basePath, containerName);
        if (!Directory.Exists(containerPath))
        {
            Directory.CreateDirectory(containerPath);
        }

        // Ensure subdirectories exist
        var fullPath = Path.Combine(containerPath, blobName);
        var directory = Path.GetDirectoryName(fullPath);
        if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory);
        }

        // Write file
        await using var fileStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write);
        await content.CopyToAsync(fileStream, cancellationToken);

        LogBlobUploaded(blobName, containerName);

        // Return a URL that can be served by static files middleware
        var url = $"{_baseUrl}/{containerName}/{blobName}".Replace("\\", "/", StringComparison.Ordinal);
        return url;
    }

    /// <inheritdoc/>
    public async Task<Stream> DownloadAsync(
        string containerName,
        string blobName,
        CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(_basePath, containerName, blobName);

        if (!File.Exists(fullPath))
        {
            throw new FileNotFoundException($"Blob not found: {containerName}/{blobName}");
        }

        var memoryStream = new MemoryStream();
        await using (var fileStream = new FileStream(fullPath, FileMode.Open, FileAccess.Read))
        {
            await fileStream.CopyToAsync(memoryStream, cancellationToken);
        }

        memoryStream.Position = 0;
        LogBlobDownloaded(blobName, containerName);

        return memoryStream;
    }

    /// <inheritdoc/>
    public Task<bool> DeleteAsync(
        string containerName,
        string blobName,
        CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(_basePath, containerName, blobName);

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            LogBlobDeleted(blobName, containerName);
            return Task.FromResult(true);
        }

        return Task.FromResult(false);
    }

    /// <inheritdoc/>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1055:URI-like return values should not be strings", Justification = "URL returned as string for flexibility")]
    public string GenerateSasUrl(string containerName, string blobName, TimeSpan expiresIn)
    {
        // For local development, just return the direct URL (no SAS needed)
        return $"{_baseUrl}/{containerName}/{blobName}".Replace("\\", "/", StringComparison.Ordinal);
    }

    /// <inheritdoc/>
    public Task<bool> ExistsAsync(
        string containerName,
        string blobName,
        CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(_basePath, containerName, blobName);
        return Task.FromResult(File.Exists(fullPath));
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "[Local] Blob uploaded: {BlobName} to {ContainerName}")]
    private partial void LogBlobUploaded(string blobName, string containerName);

    [LoggerMessage(Level = LogLevel.Information, Message = "[Local] Blob downloaded: {BlobName} from {ContainerName}")]
    private partial void LogBlobDownloaded(string blobName, string containerName);

    [LoggerMessage(Level = LogLevel.Information, Message = "[Local] Blob deleted: {BlobName} from {ContainerName}")]
    private partial void LogBlobDeleted(string blobName, string containerName);
}

