#pragma warning disable S3260 // Private record classes should be sealed
#pragma warning disable CA1812 // Internal class never instantiated
#pragma warning disable CA1852 // Type can be sealed
#pragma warning disable S3459 // Unassigned auto-property
#pragma warning disable S1144 // Unused private accessor

using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.Meta.Interfaces;

namespace QualiFlow.Infrastructure.ExternalServices.Meta;

/// <summary>
/// Service for sending messages via Meta platforms (Facebook Messenger, Instagram).
/// </summary>
public partial class MetaMessagingService : IMetaMessagingService
{
    private readonly IMetaApiClient _apiClient;
    private readonly IMetaTokenManager _tokenManager;
    private readonly ILogger<MetaMessagingService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="MetaMessagingService"/> class.
    /// </summary>
    public MetaMessagingService(
        IMetaApiClient apiClient,
        IMetaTokenManager tokenManager,
        ILogger<MetaMessagingService> logger)
    {
        _apiClient = apiClient;
        _tokenManager = tokenManager;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<MetaSendMessageResult> SendTextMessageAsync(
        string pageId,
        string recipientId,
        string text,
        MetaMessagingType messagingType = MetaMessagingType.Response,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var accessToken = await _tokenManager.GetAccessTokenForPageAsync(pageId, cancellationToken);
            if (string.IsNullOrEmpty(accessToken))
            {
                LogNoAccessToken(_logger, pageId);
                return MetaSendMessageResult.FailureResult($"No access token found for page {pageId}");
            }

            var request = new SendMessageRequest
            {
                Recipient = new RecipientId { Id = recipientId },
                MessagingType = MapMessagingType(messagingType),
                Message = new MessagePayload { Text = text },
            };

            var response = await _apiClient.PostAsync<SendMessageRequest, SendMessageResponse>(
                $"{pageId}/messages",
                accessToken,
                request,
                cancellationToken);

            if (response != null && !string.IsNullOrEmpty(response.MessageId))
            {
                LogMessageSent(_logger, response.MessageId, recipientId, pageId);
                return MetaSendMessageResult.SuccessResult(response.MessageId, response.RecipientId ?? recipientId);
            }

            return MetaSendMessageResult.FailureResult("Unknown error sending message");
        }
        catch (MetaApiException ex)
        {
            LogSendError(_logger, ex.ErrorCode, ex.Message, recipientId);
            return MetaSendMessageResult.FailureResult(ex.Message, ex.ErrorCode);
        }
        catch (Exception ex)
        {
            LogSendException(_logger, ex, recipientId);
            return MetaSendMessageResult.FailureResult(ex.Message);
        }
    }

    /// <inheritdoc />
    public async Task<MetaSendMessageResult> SendQuickReplyMessageAsync(
        string pageId,
        string recipientId,
        string text,
        IEnumerable<MetaQuickReply> quickReplies,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var accessToken = await _tokenManager.GetAccessTokenForPageAsync(pageId, cancellationToken);
            if (string.IsNullOrEmpty(accessToken))
            {
                return MetaSendMessageResult.FailureResult($"No access token found for page {pageId}");
            }

            var request = new SendMessageRequest
            {
                Recipient = new RecipientId { Id = recipientId },
                MessagingType = "RESPONSE",
                Message = new MessagePayload
                {
                    Text = text,
                    QuickReplies = quickReplies.Select(qr => new QuickReplyPayload
                    {
                        ContentType = qr.ContentType,
                        Title = qr.Title.Length > 20 ? qr.Title[..20] : qr.Title,
                        Payload = qr.Payload,
                    }).ToList(),
                },
            };

            var response = await _apiClient.PostAsync<SendMessageRequest, SendMessageResponse>(
                $"{pageId}/messages",
                accessToken,
                request,
                cancellationToken);

            if (response != null && !string.IsNullOrEmpty(response.MessageId))
            {
                return MetaSendMessageResult.SuccessResult(response.MessageId, response.RecipientId ?? recipientId);
            }

            return MetaSendMessageResult.FailureResult("Unknown error sending message");
        }
        catch (MetaApiException ex)
        {
            return MetaSendMessageResult.FailureResult(ex.Message, ex.ErrorCode);
        }
    }

    /// <inheritdoc />
    public async Task<bool> SendTypingIndicatorAsync(
        string pageId,
        string recipientId,
        bool isTyping,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var accessToken = await _tokenManager.GetAccessTokenForPageAsync(pageId, cancellationToken);
            if (string.IsNullOrEmpty(accessToken))
            {
                return false;
            }

            var request = new SenderActionRequest
            {
                Recipient = new RecipientId { Id = recipientId },
                SenderAction = isTyping ? "typing_on" : "typing_off",
            };

            await _apiClient.PostAsync<SenderActionRequest, object>(
                $"{pageId}/messages",
                accessToken,
                request,
                cancellationToken);

            return true;
        }
        catch
        {
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<bool> MarkAsSeenAsync(string pageId, string recipientId, CancellationToken cancellationToken = default)
    {
        return await SendSenderActionAsync(pageId, recipientId, "mark_seen", cancellationToken);
    }

    private async Task<bool> SendSenderActionAsync(
        string pageId,
        string recipientId,
        string action,
        CancellationToken cancellationToken)
    {
        try
        {
            var accessToken = await _tokenManager.GetAccessTokenForPageAsync(pageId, cancellationToken);
            if (string.IsNullOrEmpty(accessToken))
            {
                return false;
            }

            var request = new SenderActionRequest
            {
                Recipient = new RecipientId { Id = recipientId },
                SenderAction = action,
            };

            await _apiClient.PostAsync<SenderActionRequest, object>(
                $"{pageId}/messages",
                accessToken,
                request,
                cancellationToken);

            return true;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Sends a media message via Meta platforms.
    /// </summary>
    /// <param name="pageId">The Page ID to send from.</param>
    /// <param name="recipientId">The recipient's PSID or IGSID.</param>
    /// <param name="mediaType">The type of media to send.</param>
    /// <param name="mediaUri">The URI of the media to send.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The result of the send operation.</returns>
    public async Task<MetaSendMessageResult> SendMediaMessageAsync(
        string pageId,
        string recipientId,
        MetaMediaType mediaType,
        Uri mediaUri,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var accessToken = await _tokenManager.GetAccessTokenForPageAsync(pageId, cancellationToken);
            if (string.IsNullOrEmpty(accessToken))
            {
                return MetaSendMessageResult.FailureResult($"No access token found for page {pageId}");
            }

            var request = new SendMediaMessageRequest
            {
                Recipient = new RecipientId { Id = recipientId },
                MessagingType = "RESPONSE",
                Message = new MediaMessagePayload
                {
                    Attachment = new AttachmentPayload
                    {
                        Type = MapMediaType(mediaType),
                        Payload = new AttachmentUrlPayload { Url = mediaUri.ToString(), IsReusable = true },
                    },
                },
            };

            var response = await _apiClient.PostAsync<SendMediaMessageRequest, SendMessageResponse>(
                $"{pageId}/messages",
                accessToken,
                request,
                cancellationToken);

            if (response != null && !string.IsNullOrEmpty(response.MessageId))
            {
                LogMediaSent(_logger, response.MessageId, mediaType.ToString(), recipientId);
                return MetaSendMessageResult.SuccessResult(response.MessageId, response.RecipientId ?? recipientId);
            }

            return MetaSendMessageResult.FailureResult("Unknown error sending media message");
        }
        catch (MetaApiException ex)
        {
            return MetaSendMessageResult.FailureResult(ex.Message, ex.ErrorCode);
        }
    }

    /// <summary>
    /// Sends a template message via Meta platforms.
    /// </summary>
    /// <param name="pageId">The Page ID to send from.</param>
    /// <param name="recipientId">The recipient's PSID or IGSID.</param>
    /// <param name="templateName">The name of the template to use.</param>
    /// <param name="templateParameters">Optional template parameters.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The result of the send operation.</returns>
    public async Task<MetaSendMessageResult> SendTemplateMessageAsync(
        string pageId,
        string recipientId,
        string templateName,
        IDictionary<string, string>? templateParameters = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var accessToken = await _tokenManager.GetAccessTokenForPageAsync(pageId, cancellationToken);
            if (string.IsNullOrEmpty(accessToken))
            {
                return MetaSendMessageResult.FailureResult($"No access token found for page {pageId}");
            }

            var request = new SendTemplateMessageRequest
            {
                Recipient = new RecipientId { Id = recipientId },
                MessagingType = "MESSAGE_TAG",
                Tag = "CONFIRMED_EVENT_UPDATE",
                Message = new TemplateMessagePayload
                {
                    Attachment = new TemplateAttachment
                    {
                        Type = "template",
                        Payload = new TemplatePayload
                        {
                            TemplateType = "generic",
                            Elements = [new TemplateElement { Title = templateName }],
                        },
                    },
                },
            };

            var response = await _apiClient.PostAsync<SendTemplateMessageRequest, SendMessageResponse>(
                $"{pageId}/messages",
                accessToken,
                request,
                cancellationToken);

            if (response != null && !string.IsNullOrEmpty(response.MessageId))
            {
                LogTemplateSent(_logger, response.MessageId, templateName, recipientId);
                return MetaSendMessageResult.SuccessResult(response.MessageId, response.RecipientId ?? recipientId);
            }

            return MetaSendMessageResult.FailureResult("Unknown error sending template message");
        }
        catch (MetaApiException ex)
        {
            return MetaSendMessageResult.FailureResult(ex.Message, ex.ErrorCode);
        }
    }

    private static string MapMessagingType(MetaMessagingType type) => type switch
    {
        MetaMessagingType.Response => "RESPONSE",
        MetaMessagingType.MessageTag => "MESSAGE_TAG",
        MetaMessagingType.Update => "UPDATE",
        _ => "RESPONSE"
    };

    private static string MapMediaType(MetaMediaType type) => type switch
    {
        MetaMediaType.Image => "image",
        MetaMediaType.Video => "video",
        MetaMediaType.Audio => "audio",
        MetaMediaType.File => "file",
        _ => "image"
    };

    // Logging methods
    [LoggerMessage(Level = LogLevel.Warning, Message = "No access token found for page {PageId}")]
    private static partial void LogNoAccessToken(ILogger logger, string pageId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Message {MessageId} sent to {RecipientId} via page {PageId}")]
    private static partial void LogMessageSent(ILogger logger, string messageId, string recipientId, string pageId);

    [LoggerMessage(Level = LogLevel.Error, Message = "Meta API error {ErrorCode}: {Message} for recipient {RecipientId}")]
    private static partial void LogSendError(ILogger logger, int errorCode, string message, string recipientId);

    [LoggerMessage(Level = LogLevel.Error, Message = "Exception sending message to {RecipientId}")]
    private static partial void LogSendException(ILogger logger, Exception ex, string recipientId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Media {MediaType} sent with ID {MessageId} to {RecipientId}")]
    private static partial void LogMediaSent(ILogger logger, string messageId, string mediaType, string recipientId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Template {TemplateName} sent with ID {MessageId} to {RecipientId}")]
    private static partial void LogTemplateSent(ILogger logger, string messageId, string templateName, string recipientId);

    // Request/Response DTOs
    private record SendMessageRequest
    {
        public RecipientId Recipient { get; init; } = new();
        public string MessagingType { get; init; } = "RESPONSE";
        public MessagePayload Message { get; init; } = new();
    }

    private record RecipientId
    {
        public string Id { get; init; } = string.Empty;
    }

    private record MessagePayload
    {
        public string? Text { get; init; }
        public List<QuickReplyPayload>? QuickReplies { get; init; }
    }

    private record QuickReplyPayload
    {
        public string ContentType { get; init; } = "text";
        public string Title { get; init; } = string.Empty;
        public string Payload { get; init; } = string.Empty;
    }

    private record SenderActionRequest
    {
        public RecipientId Recipient { get; init; } = new();
        public string SenderAction { get; init; } = string.Empty;
    }

    private record SendMessageResponse
    {
        public string? MessageId { get; init; }
        public string? RecipientId { get; init; }
    }

    // Media message DTOs
    private record SendMediaMessageRequest
    {
        public RecipientId Recipient { get; init; } = new();
        public string MessagingType { get; init; } = "RESPONSE";
        public MediaMessagePayload Message { get; init; } = new();
    }

    private record MediaMessagePayload
    {
        public AttachmentPayload Attachment { get; init; } = new();
    }

    private record AttachmentPayload
    {
        public string Type { get; init; } = "image";
        public AttachmentUrlPayload Payload { get; init; } = new();
    }

    private record AttachmentUrlPayload
    {
        public string Url { get; init; } = string.Empty;
        public bool IsReusable { get; init; } = true;
    }

    // Template message DTOs
    private record SendTemplateMessageRequest
    {
        public RecipientId Recipient { get; init; } = new();
        public string MessagingType { get; init; } = "MESSAGE_TAG";
        public string Tag { get; init; } = string.Empty;
        public TemplateMessagePayload Message { get; init; } = new();
    }

    private record TemplateMessagePayload
    {
        public TemplateAttachment Attachment { get; init; } = new();
    }

    private record TemplateAttachment
    {
        public string Type { get; init; } = "template";
        public TemplatePayload Payload { get; init; } = new();
    }

    private record TemplatePayload
    {
        public string TemplateType { get; init; } = "generic";
        public List<TemplateElement> Elements { get; init; } = [];
    }

    private record TemplateElement
    {
        public string Title { get; init; } = string.Empty;
        public string? Subtitle { get; init; }
        public string? ImageUrl { get; init; }
    }
}

