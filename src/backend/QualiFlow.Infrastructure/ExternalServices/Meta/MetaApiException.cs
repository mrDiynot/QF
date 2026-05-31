#pragma warning disable CA1032 // Implement standard exception constructors

using System.Text.Json;

namespace QualiFlow.Infrastructure.ExternalServices.Meta;

/// <summary>
/// Exception thrown when a Meta API call fails.
/// </summary>
public class MetaApiException : Exception
{
    /// <summary>
    /// Initializes a new instance of the <see cref="MetaApiException"/> class.
    /// </summary>
    /// <param name="statusCode">The HTTP status code.</param>
    /// <param name="responseBody">The response body from Meta.</param>
    public MetaApiException(int statusCode, string responseBody)
        : base(ParseErrorMessage(responseBody) ?? $"Meta API error: {statusCode}")
    {
        StatusCode = statusCode;
        ResponseBody = responseBody;
        ParseError(responseBody);
    }

    /// <summary>
    /// Gets the HTTP status code.
    /// </summary>
    public int StatusCode { get; }

    /// <summary>
    /// Gets the raw response body.
    /// </summary>
    public string ResponseBody { get; }

    /// <summary>
    /// Gets the Meta error code.
    /// </summary>
    public int ErrorCode { get; private set; }

    /// <summary>
    /// Gets the Meta error subcode.
    /// </summary>
    public int ErrorSubcode { get; private set; }

    /// <summary>
    /// Gets the Meta error type.
    /// </summary>
    public string ErrorType { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the Facebook trace ID for debugging.
    /// </summary>
    public string FbTraceId { get; private set; } = string.Empty;

    /// <summary>
    /// Gets a value indicating whether this error is transient and can be retried.
    /// </summary>
    public bool IsTransient => ErrorCode switch
    {
        1 => true,   // Unknown error
        2 => true,   // Service temporarily unavailable
        4 => true,   // Rate limit
        17 => true,  // Rate limit
        341 => true, // Temporary issue
        613 => true, // Rate limit
        _ => StatusCode >= 500
    };

    /// <summary>
    /// Gets a value indicating whether the token is invalid and needs refresh.
    /// </summary>
    public bool IsInvalidToken => ErrorCode == 190 || ErrorSubcode == 463 || ErrorSubcode == 467;

    /// <summary>
    /// Gets a value indicating whether the permission was denied.
    /// </summary>
    public bool IsPermissionDenied => ErrorCode == 10 || ErrorCode == 200 || ErrorCode == 230;

    private static string? ParseErrorMessage(string responseBody)
    {
        try
        {
            using var doc = JsonDocument.Parse(responseBody);
            if (doc.RootElement.TryGetProperty("error", out var error) &&
                error.TryGetProperty("message", out var message))
            {
                return message.GetString();
            }
        }
        catch
        {
            // Ignore parsing errors
        }

        return null;
    }

    private void ParseError(string responseBody)
    {
        try
        {
            using var doc = JsonDocument.Parse(responseBody);
            if (doc.RootElement.TryGetProperty("error", out var error))
            {
                if (error.TryGetProperty("code", out var code))
                {
                    ErrorCode = code.GetInt32();
                }

                if (error.TryGetProperty("error_subcode", out var subcode))
                {
                    ErrorSubcode = subcode.GetInt32();
                }

                if (error.TryGetProperty("type", out var type))
                {
                    ErrorType = type.GetString() ?? string.Empty;
                }

                if (error.TryGetProperty("fbtrace_id", out var traceId))
                {
                    FbTraceId = traceId.GetString() ?? string.Empty;
                }
            }
        }
        catch
        {
            // Ignore parsing errors
        }
    }
}

