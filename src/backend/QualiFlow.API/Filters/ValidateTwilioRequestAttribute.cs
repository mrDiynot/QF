using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Twilio.Security;

namespace QualiFlow.API.Filters;

/// <summary>
/// Action filter attribute that validates incoming Twilio webhook requests using signature verification.
/// This prevents unauthorized requests from being processed by webhook endpoints.
/// Twilio signs each request with your Auth Token, and this filter validates that signature.
/// </summary>
/// <remarks>
/// <para>
/// Security: In production, ALL Twilio webhook endpoints MUST use this filter to prevent spoofing.
/// Twilio sends an X-Twilio-Signature header with each request that is computed using your Auth Token.
/// </para>
/// <para>
/// Test Mode: When Twilio:UseTestMode is true, signature validation is skipped to allow local testing.
/// </para>
/// </remarks>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
public sealed class ValidateTwilioRequestAttribute : Attribute, IAsyncActionFilter
{
    /// <summary>
    /// Validates the Twilio request signature before the action executes.
    /// </summary>
    /// <param name="context">The action executing context.</param>
    /// <param name="next">The delegate to execute the next filter or action.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var httpContext = context.HttpContext;
        var logger = httpContext.RequestServices.GetRequiredService<ILogger<ValidateTwilioRequestAttribute>>();
        var configuration = httpContext.RequestServices.GetRequiredService<IConfiguration>();

        // Read directly from configuration to ensure user secrets are respected
        var useTestMode = configuration.GetValue<bool>("Twilio:UseTestMode");
        logger.LogInformation("ValidateTwilioRequest: UseTestMode={UseTestMode}", useTestMode);

        // Skip validation in test mode for local development
        if (useTestMode)
        {
            logger.LogDebug("Twilio signature validation skipped - test mode enabled");
            await next();
            return;
        }

        // Get the auth token for signature validation - try direct config first, then Live/Test credentials
        var authToken = configuration["Twilio:AuthToken"];
        if (string.IsNullOrEmpty(authToken))
        {
            authToken = configuration["Twilio:Live:AuthToken"];
        }

        if (string.IsNullOrEmpty(authToken))
        {
            logger.LogError("Twilio Auth Token not configured - cannot validate webhook signature");
            context.Result = new StatusCodeResult(StatusCodes.Status500InternalServerError);
            return;
        }

        // Get the X-Twilio-Signature header
        var twilioSignature = httpContext.Request.Headers["X-Twilio-Signature"].FirstOrDefault();
        if (string.IsNullOrEmpty(twilioSignature))
        {
            logger.LogWarning(
                "Missing X-Twilio-Signature header on webhook request from {IP}",
                httpContext.Connection.RemoteIpAddress);

            // Return empty TwiML response for Twilio webhooks (XML-compatible)
            context.Result = new ContentResult
            {
                Content = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>",
                ContentType = "application/xml",
                StatusCode = StatusCodes.Status401Unauthorized,
            };
            return;
        }

        // Build the full URL that Twilio used to sign the request
        var request = httpContext.Request;
        var requestUrl = $"{request.Scheme}://{request.Host}{request.Path}{request.QueryString}";

        // For ngrok or proxied requests, use X-Forwarded headers if available
        if (request.Headers.TryGetValue("X-Forwarded-Proto", out var forwardedProto) &&
            request.Headers.TryGetValue("X-Forwarded-Host", out var forwardedHost))
        {
            requestUrl = $"{forwardedProto}://{forwardedHost}{request.Path}{request.QueryString}";
        }

        // Extract form parameters for signature validation
        var formParams = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        if (request.HasFormContentType)
        {
            // Enable buffering to read the form multiple times
            request.EnableBuffering();
            var form = await request.ReadFormAsync();
            foreach (var key in form.Keys)
            {
                formParams[key] = form[key].ToString();
            }

            // Reset the request body position for model binding
            request.Body.Position = 0;
        }

        // Validate the signature
        var validator = new RequestValidator(authToken);
        var isValid = validator.Validate(requestUrl, formParams, twilioSignature);

        if (!isValid)
        {
            logger.LogWarning(
                "Invalid Twilio signature on webhook request. URL: {Url}, IP: {IP}",
                requestUrl,
                httpContext.Connection.RemoteIpAddress);

            // Return empty TwiML response for Twilio webhooks (XML-compatible)
            context.Result = new ContentResult
            {
                Content = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>",
                ContentType = "application/xml",
                StatusCode = StatusCodes.Status401Unauthorized,
            };
            return;
        }

        logger.LogDebug("Twilio webhook signature validated successfully");
        await next();
    }
}

