using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;

namespace QualiFlow.Infrastructure.ExternalServices;

/// <summary>
/// Azure Blob Storage service implementation.
/// </summary>
public partial class AzureBlobStorageService : IBlobStorageService
{
    // Containers that serve public content (blog images, etc.) need Blob-level public access
    private static readonly HashSet<string> PublicContainers = new(StringComparer.OrdinalIgnoreCase)
    {
        "cms-images",
    };

    private readonly BlobServiceClient _blobServiceClient;
    private readonly ILogger<AzureBlobStorageService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AzureBlobStorageService"/> class.
    /// </summary>
    /// <param name="configuration">The configuration.</param>
    /// <param name="logger">The logger.</param>
    public AzureBlobStorageService(IConfiguration configuration, ILogger<AzureBlobStorageService> logger)
    {
        var connectionString = configuration.GetConnectionString("AzureBlobStorage")
            ?? configuration["AzureBlobStorage:ConnectionString"]
            ?? throw new InvalidOperationException("Azure Blob Storage connection string not configured.");

        _blobServiceClient = new BlobServiceClient(connectionString);
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<string> UploadAsync(
        string containerName,
        string blobName,
        Stream content,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);

        // Always create with None — account-level "Allow Blob public access" may be disabled
        await containerClient.CreateIfNotExistsAsync(PublicAccessType.None, cancellationToken: cancellationToken);

        var blobClient = containerClient.GetBlobClient(blobName);
        var headers = new BlobHttpHeaders { ContentType = contentType };

        await blobClient.UploadAsync(content, new BlobUploadOptions { HttpHeaders = headers }, cancellationToken);
        LogBlobUploaded(blobName, containerName);

        // For public containers (blog images, etc.) return a long-lived SAS URL
        // so images are accessible even when account-level public access is disabled
        if (PublicContainers.Contains(containerName) && blobClient.CanGenerateSasUri)
        {
            return GenerateSasUrl(containerName, blobName, TimeSpan.FromDays(3650));
        }

        return blobClient.Uri.ToString();
    }

    /// <inheritdoc/>
    public async Task<Stream> DownloadAsync(
        string containerName,
        string blobName,
        CancellationToken cancellationToken = default)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
        var blobClient = containerClient.GetBlobClient(blobName);

        var response = await blobClient.DownloadAsync(cancellationToken);
        LogBlobDownloaded(blobName, containerName);

        return response.Value.Content;
    }

    /// <inheritdoc/>
    public async Task<bool> DeleteAsync(
        string containerName,
        string blobName,
        CancellationToken cancellationToken = default)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
        var blobClient = containerClient.GetBlobClient(blobName);

        var response = await blobClient.DeleteIfExistsAsync(cancellationToken: cancellationToken);
        if (response.Value)
        {
            LogBlobDeleted(blobName, containerName);
        }

        return response.Value;
    }

    /// <inheritdoc/>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1055:URI-like return values should not be strings", Justification = "URL returned as string for flexibility")]
    public string GenerateSasUrl(string containerName, string blobName, TimeSpan expiresIn)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
        var blobClient = containerClient.GetBlobClient(blobName);

        if (!blobClient.CanGenerateSasUri)
        {
            throw new InvalidOperationException("Cannot generate SAS URI. Ensure the client was created with account credentials.");
        }

        var sasBuilder = new BlobSasBuilder
        {
            BlobContainerName = containerName,
            BlobName = blobName,
            Resource = "b",
            ExpiresOn = DateTimeOffset.UtcNow.Add(expiresIn),
        };
        sasBuilder.SetPermissions(BlobSasPermissions.Read);

        return blobClient.GenerateSasUri(sasBuilder).ToString();
    }

    /// <inheritdoc/>
    public async Task<bool> ExistsAsync(
        string containerName,
        string blobName,
        CancellationToken cancellationToken = default)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
        var blobClient = containerClient.GetBlobClient(blobName);

        return await blobClient.ExistsAsync(cancellationToken);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Blob uploaded: {BlobName} to {ContainerName}")]
    private partial void LogBlobUploaded(string blobName, string containerName);

    [LoggerMessage(Level = LogLevel.Information, Message = "Blob downloaded: {BlobName} from {ContainerName}")]
    private partial void LogBlobDownloaded(string blobName, string containerName);

    [LoggerMessage(Level = LogLevel.Information, Message = "Blob deleted: {BlobName} from {ContainerName}")]
    private partial void LogBlobDeleted(string blobName, string containerName);
}

