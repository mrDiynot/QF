using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.ApiKeys.DTOs;
using QualiFlow.Application.Features.ApiKeys.Services;
using QualiFlow.Application.Features.Authorization;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for managing API keys.
/// Requires Owner role for all operations (API keys provide full programmatic access).
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/api-keys")]
[Authorize(AuthenticationSchemes = "Bearer", Policy = BusinessPolicies.RequireOwner)]
public partial class ApiKeysController(
    IApiKeyService apiKeyService,
    ICurrentUserService currentUserService,
    ILogger<ApiKeysController> logger) : ControllerBase
{
    /// <summary>
    /// Generates a new API key for the current business.
    /// </summary>
    /// <param name="request">The API key creation request.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The generated API key (includes plain text key - only shown once).</returns>
    /// <response code="201">API key generated successfully.</response>
    /// <response code="400">Invalid request data.</response>
    /// <response code="401">Unauthorized.</response>
    [HttpPost]
    [ProducesResponseType(typeof(GenerateApiKeyResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<GenerateApiKeyResponse>> GenerateApiKeyAsync(
        [FromBody] CreateApiKeyRequest request,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();

        LogGeneratingApiKey(logger, businessId, request.Name);

        var response = await apiKeyService.GenerateAsync(businessId, request, cancellationToken);

        LogApiKeyGenerated(logger, response.Id, businessId);

        return StatusCode(StatusCodes.Status201Created, response);
    }

    /// <summary>
    /// Gets all API keys for the current business.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A list of API keys (without plain text values).</returns>
    /// <response code="200">API keys retrieved successfully.</response>
    /// <response code="401">Unauthorized.</response>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ApiKeyDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyList<ApiKeyDto>>> GetApiKeysAsync(
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();

        LogGettingApiKeys(logger, businessId);

        var apiKeys = await apiKeyService.GetAllAsync(businessId, cancellationToken);

        return Ok(apiKeys);
    }

    /// <summary>
    /// Deletes an API key.
    /// </summary>
    /// <param name="id">The API key ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>No content.</returns>
    /// <response code="204">API key deleted successfully.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="404">API key not found.</response>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteApiKeyAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();

        LogDeletingApiKey(logger, id, businessId);

        try
        {
            await apiKeyService.DeleteAsync(id, businessId, cancellationToken);
            LogApiKeyDeleted(logger, id, businessId);
            return NoContent();
        }
        catch (InvalidOperationException)
        {
            return NotFound($"API key {id} not found");
        }
    }

    // Logger message delegates

    [LoggerMessage(EventId = 1, Level = LogLevel.Information, Message = "Generating API key '{Name}' for business {BusinessId}")]
    private static partial void LogGeneratingApiKey(ILogger logger, Guid businessId, string name);

    [LoggerMessage(EventId = 2, Level = LogLevel.Information, Message = "API key {ApiKeyId} generated for business {BusinessId}")]
    private static partial void LogApiKeyGenerated(ILogger logger, Guid apiKeyId, Guid businessId);

    [LoggerMessage(EventId = 3, Level = LogLevel.Information, Message = "Getting API keys for business {BusinessId}")]
    private static partial void LogGettingApiKeys(ILogger logger, Guid businessId);

    [LoggerMessage(EventId = 4, Level = LogLevel.Information, Message = "Deleting API key {ApiKeyId} for business {BusinessId}")]
    private static partial void LogDeletingApiKey(ILogger logger, Guid apiKeyId, Guid businessId);

    [LoggerMessage(EventId = 5, Level = LogLevel.Information, Message = "API key {ApiKeyId} deleted for business {BusinessId}")]
    private static partial void LogApiKeyDeleted(ILogger logger, Guid apiKeyId, Guid businessId);
}

