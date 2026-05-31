using System.Net;
using System.Text.Json;

using FluentValidation;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Serilog;

namespace QualiFlow.API.Middleware;

/// <summary>
/// Global exception handling middleware that catches unhandled exceptions
/// and returns appropriate HTTP responses without crashing the server.
/// </summary>
public class GlobalExceptionHandlingMiddleware
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    /// <summary>
    /// Initializes a new instance of the <see cref="GlobalExceptionHandlingMiddleware"/> class.
    /// </summary>
    /// <param name="next">The next middleware in the pipeline.</param>
    /// <param name="logger">The logger instance.</param>
    /// <param name="environment">The host environment.</param>
    public GlobalExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionHandlingMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    /// <summary>
    /// Invokes the middleware.
    /// </summary>
    /// <param name="context">The HTTP context.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        // Get the innermost exception for better error details
        var innerException = GetInnermostException(exception);
        var fullMessage = GetFullExceptionMessage(exception);

        // Log the exception with full details including inner exceptions
        _logger.LogError(exception, "Unhandled exception occurred: {Message}. Inner: {InnerMessage}. Full: {FullMessage}",
            exception.Message, innerException.Message, fullMessage);

        // Also log to Serilog for Sentry
        Log.Error(exception, "Unhandled exception: {ExceptionType} - {Message}. Inner: {InnerType} - {InnerMessage}",
            exception.GetType().Name, exception.Message, innerException.GetType().Name, innerException.Message);

        var errorInfo = MapExceptionToError(exception);

        context.Response.StatusCode = (int)errorInfo.StatusCode;
        context.Response.ContentType = "application/problem+json";

        var problemDetails = new ProblemDetails
        {
            Type = $"https://tools.ietf.org/html/rfc9110#section-15.{GetSectionNumber(errorInfo.StatusCode)}",
            Title = errorInfo.Title,
            Status = (int)errorInfo.StatusCode,
            Detail = errorInfo.Detail,
            Instance = context.Request.Path.Value,
        };

        // Include stack trace in development
        if (_environment.IsDevelopment())
        {
            problemDetails.Extensions["exception"] = exception.GetType().Name;
            problemDetails.Extensions["stackTrace"] = exception.StackTrace;
        }

        await context.Response.WriteAsync(JsonSerializer.Serialize(problemDetails, JsonOptions));
    }

    private ErrorInfo MapExceptionToError(Exception exception)
    {
        return exception switch
        {
            ValidationException validationEx => new ErrorInfo(
                HttpStatusCode.BadRequest,
                "Validation Error",
                string.Join("; ", validationEx.Errors.Select(e => e.ErrorMessage))),

            UnauthorizedAccessException unauthorizedEx => new ErrorInfo(
                HttpStatusCode.Unauthorized,
                "Unauthorized",
                unauthorizedEx.Message),

            KeyNotFoundException => new ErrorInfo(
                HttpStatusCode.NotFound,
                "Not Found",
                "The requested resource was not found."),

            InvalidOperationException invalidOpEx => new ErrorInfo(
                HttpStatusCode.BadRequest,
                "Invalid Operation",
                invalidOpEx.Message),

            ArgumentException argEx => new ErrorInfo(
                HttpStatusCode.BadRequest,
                "Invalid Argument",
                argEx.Message),

            DbUpdateException dbEx => new ErrorInfo(
                HttpStatusCode.InternalServerError,
                "Database Error",
                GetDbUpdateExceptionMessage(dbEx)),

            HttpRequestException httpEx => new ErrorInfo(
                HttpStatusCode.BadGateway,
                "External Service Error",
                GetHttpRequestExceptionMessage(httpEx)),

            TaskCanceledException => new ErrorInfo(
                HttpStatusCode.RequestTimeout,
                "Request Timeout",
                "The request timed out."),

            OperationCanceledException => new ErrorInfo(
                HttpStatusCode.BadRequest,
                "Operation Cancelled",
                "The operation was cancelled."),

            _ => new ErrorInfo(
                HttpStatusCode.InternalServerError,
                "Internal Server Error",
                GetDefaultExceptionMessage(exception)),
        };
    }

    private string GetHttpRequestExceptionMessage(HttpRequestException ex)
    {
        return _environment.IsDevelopment()
            ? ex.Message
            : "An error occurred while communicating with an external service.";
    }

    private string GetDefaultExceptionMessage(Exception ex)
    {
        return _environment.IsDevelopment()
            ? ex.Message
            : "An unexpected error occurred. Please try again later.";
    }

    private static string GetSectionNumber(HttpStatusCode statusCode) => statusCode switch
    {
        HttpStatusCode.BadRequest => "5.1",
        HttpStatusCode.Unauthorized => "5.2",
        HttpStatusCode.Forbidden => "5.4",
        HttpStatusCode.NotFound => "5.5",
        HttpStatusCode.RequestTimeout => "5.8",
        HttpStatusCode.InternalServerError => "6.1",
        HttpStatusCode.BadGateway => "6.3",
        _ => "6.1",
    };

    private string GetDbUpdateExceptionMessage(DbUpdateException ex)
    {
        var innerException = GetInnermostException(ex);
        return _environment.IsDevelopment()
            ? $"{ex.Message} Inner: {innerException.Message}"
            : "A database error occurred while saving changes.";
    }

    private static Exception GetInnermostException(Exception ex)
    {
        var current = ex;
        while (current.InnerException != null)
        {
            current = current.InnerException;
        }

        return current;
    }

    private static string GetFullExceptionMessage(Exception ex)
    {
        var messages = new List<string>();
        var current = ex;
        while (current != null)
        {
            messages.Add($"[{current.GetType().Name}] {current.Message}");
            current = current.InnerException;
        }

        return string.Join(" -> ", messages);
    }

    private sealed record ErrorInfo(HttpStatusCode StatusCode, string Title, string Detail);
}

