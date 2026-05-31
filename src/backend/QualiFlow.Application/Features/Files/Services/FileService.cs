using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Files.DTOs;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Features.Files.Services;

/// <summary>
/// Service for file upload and management operations.
/// </summary>
public partial class FileService : IFileService
{
    private const string ContainerName = "message-attachments";
    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB

    private static readonly HashSet<string> AllowedContentTypes =
    [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
        "text/csv",
    ];

    private readonly IBlobStorageService _blobStorage;
    private readonly IMessageAttachmentRepository _attachmentRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<FileService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="FileService"/> class.
    /// </summary>
    /// <param name="blobStorage">The blob storage service.</param>
    /// <param name="attachmentRepository">The attachment repository.</param>
    /// <param name="currentUserService">The current user service.</param>
    /// <param name="logger">The logger.</param>
    public FileService(
        IBlobStorageService blobStorage,
        IMessageAttachmentRepository attachmentRepository,
        ICurrentUserService currentUserService,
        ILogger<FileService> logger)
    {
        _blobStorage = blobStorage;
        _attachmentRepository = attachmentRepository;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<FileUploadResponse> UploadAsync(
        IFormFile file,
        Guid? messageId = null,
        CancellationToken cancellationToken = default)
    {
        ValidateFile(file);

        var businessId = _currentUserService.GetBusinessId();
        var blobName = GenerateBlobName(businessId, file.FileName);

        await using var stream = file.OpenReadStream();
        var blobUrl = await _blobStorage.UploadAsync(
            ContainerName,
            blobName,
            stream,
            file.ContentType,
            cancellationToken);

        var attachment = new MessageAttachment
        {
            MessageId = messageId ?? Guid.Empty,
            FileName = file.FileName,
            ContentType = file.ContentType,
            FileSize = file.Length,
            BlobUrl = blobUrl,
            BlobName = blobName,
            ContainerName = ContainerName,
        };

        await _attachmentRepository.AddAsync(attachment, cancellationToken);
        LogFileUploaded(file.FileName, file.Length, blobName);

        return MapToResponse(attachment);
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<FileUploadResponse>> GetByMessageIdAsync(
        Guid messageId,
        CancellationToken cancellationToken = default)
    {
        var attachments = await _attachmentRepository.GetByMessageIdAsync(messageId, cancellationToken);
        return attachments.Select(MapToResponse).ToList();
    }

    /// <inheritdoc/>
    public async Task<bool> DeleteAsync(Guid attachmentId, CancellationToken cancellationToken = default)
    {
        var attachment = await _attachmentRepository.GetByIdAsync(attachmentId, cancellationToken);
        if (attachment == null)
        {
            return false;
        }

        await _blobStorage.DeleteAsync(attachment.ContainerName, attachment.BlobName, cancellationToken);
        await _attachmentRepository.DeleteAsync(attachment, cancellationToken);
        LogFileDeleted(attachment.FileName, attachment.BlobName);

        return true;
    }

    /// <inheritdoc/>
    public async Task<string?> GetDownloadUrlAsync(
        Guid attachmentId,
        TimeSpan? expiresIn = null,
        CancellationToken cancellationToken = default)
    {
        var attachment = await _attachmentRepository.GetByIdAsync(attachmentId, cancellationToken);
        if (attachment == null)
        {
            return null;
        }

        var expiry = expiresIn ?? TimeSpan.FromHours(1);
        return _blobStorage.GenerateSasUrl(attachment.ContainerName, attachment.BlobName, expiry);
    }

    private static void ValidateFile(IFormFile file)
    {
        if (file.Length == 0)
        {
            throw new ArgumentException("File is empty.", nameof(file));
        }

        if (file.Length > MaxFileSizeBytes)
        {
            throw new ArgumentException($"File size exceeds maximum of {MaxFileSizeBytes / 1024 / 1024} MB.", nameof(file));
        }

        if (!AllowedContentTypes.Contains(file.ContentType))
        {
            throw new ArgumentException($"File type '{file.ContentType}' is not allowed.", nameof(file));
        }
    }

    private static string GenerateBlobName(Guid businessId, string fileName)
    {
        var extension = Path.GetExtension(fileName);
        var uniqueId = Guid.NewGuid().ToString("N");
        return $"{businessId}/{DateTime.UtcNow:yyyy/MM/dd}/{uniqueId}{extension}";
    }

    private static FileUploadResponse MapToResponse(MessageAttachment attachment)
    {
        return new FileUploadResponse
        {
            Id = attachment.Id,
            FileName = attachment.FileName,
            ContentType = attachment.ContentType,
            FileSize = attachment.FileSize,
            Url = attachment.BlobUrl,
            UploadedAt = attachment.CreatedAt,
        };
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "File uploaded: {FileName} ({FileSize} bytes) -> {BlobName}")]
    private partial void LogFileUploaded(string fileName, long fileSize, string blobName);

    [LoggerMessage(Level = LogLevel.Information, Message = "File deleted: {FileName} ({BlobName})")]
    private partial void LogFileDeleted(string fileName, string blobName);
}

