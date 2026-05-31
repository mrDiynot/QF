// Copyright (c) QualiFlow. All Rights Reserved.

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Features.VoiceAgents.Services;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for voice preview and voice options.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/voice-preview")]
[Authorize(AuthenticationSchemes = "Bearer")]
[Produces("application/json")]
public class VoicePreviewController : ControllerBase
{
    private readonly IRealtimeVoiceService _voiceService;
    private readonly ILogger<VoicePreviewController> _logger;

    public VoicePreviewController(
        IRealtimeVoiceService voiceService,
        ILogger<VoicePreviewController> logger)
    {
        _voiceService = voiceService;
        _logger = logger;
    }

    /// <summary>
    /// Gets available voice options.
    /// </summary>
    /// <returns>List of available voice options.</returns>
    [HttpGet("voices")]
    [ProducesResponseType(typeof(IEnumerable<VoiceOptionDto>), StatusCodes.Status200OK)]
    public ActionResult<IEnumerable<VoiceOptionDto>> GetVoices()
    {
        var voices = _voiceService.AvailableVoices.Select(v => new VoiceOptionDto
        {
            Id = v.Id,
            DisplayName = v.DisplayName,
            Gender = v.Gender,
            Description = v.Description
        });

        return Ok(voices);
    }

    /// <summary>
    /// Generates a voice preview audio clip.
    /// </summary>
    /// <param name="request">Preview request with text and voice settings.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Audio file (MP3).</returns>
    [HttpPost("generate")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GeneratePreview(
        [FromBody] VoicePreviewRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Text))
        {
            return BadRequest(new { message = "Text is required" });
        }

        if (request.Text.Length > 500)
        {
            return BadRequest(new { message = "Text must be 500 characters or less" });
        }

        _logger.LogInformation(
            "Generating voice preview for voice type {VoiceType}",
            request.VoiceType);

        try
        {
            var audioData = await _voiceService.GenerateVoicePreviewAsync(
                request.Text,
                request.VoiceType ?? "Female - Professional",
                request.Speed ?? 1.0m,
                cancellationToken);

            return File(audioData, "audio/mpeg", "preview.mp3");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate voice preview");
            return StatusCode(500, new { message = "Failed to generate voice preview" });
        }
    }

    /// <summary>
    /// Gets a sample greeting for a voice type.
    /// </summary>
    /// <param name="voiceType">The voice type to sample.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Audio file with sample greeting.</returns>
    [HttpGet("sample/{voiceType}")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSample(
        string voiceType,
        CancellationToken cancellationToken)
    {
        var sampleText = "Hello! I'm your AI voice assistant. How can I help you today?";

        try
        {
            var audioData = await _voiceService.GenerateVoicePreviewAsync(
                sampleText,
                voiceType,
                1.0m,
                cancellationToken);

            return File(audioData, "audio/mpeg", "sample.mp3");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate sample for voice {VoiceType}", voiceType);
            return StatusCode(500, new { message = "Failed to generate voice sample" });
        }
    }
}

/// <summary>
/// DTO for voice option.
/// </summary>
public record VoiceOptionDto
{
    public string Id { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
    public string Gender { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
}

/// <summary>
/// Request to generate a voice preview.
/// </summary>
public record VoicePreviewRequest
{
    public string Text { get; init; } = string.Empty;
    public string? VoiceType { get; init; }
    public decimal? Speed { get; init; }
}
