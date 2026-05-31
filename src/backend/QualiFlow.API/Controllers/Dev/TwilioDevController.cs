using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Features.Channels.Services;

namespace QualiFlow.Api.Controllers.Dev;

/// <summary>
/// Development-only controller for Twilio sub-account management.
/// This controller is only available in Development environment.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/dev/twilio")]
[AllowAnonymous]
public class TwilioDevController : ControllerBase
{
    private readonly ITwilioService _twilioService;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<TwilioDevController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="TwilioDevController"/> class.
    /// </summary>
    public TwilioDevController(
        ITwilioService twilioService,
        IWebHostEnvironment environment,
        ILogger<TwilioDevController> logger)
    {
        _twilioService = twilioService;
        _environment = environment;
        _logger = logger;
    }

    /// <summary>
    /// Lists all Twilio sub-accounts under the main account.
    /// </summary>
    /// <returns>List of sub-accounts with their status.</returns>
    [HttpGet("sub-accounts")]
    [ProducesResponseType(typeof(SubAccountListResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ListSubAccounts(CancellationToken cancellationToken)
    {
        if (!_environment.IsDevelopment())
        {
            return Forbid("This endpoint is only available in Development environment.");
        }

        var subAccounts = await _twilioService.ListSubAccountsAsync(cancellationToken);

        return Ok(new SubAccountListResponse
        {
            TotalCount = subAccounts.Count,
            SubAccounts = subAccounts.Select(sa => new SubAccountInfo
            {
                AccountSid = sa.AccountSid,
                FriendlyName = sa.FriendlyName,
                Status = sa.Status,
                CreatedAt = sa.CreatedAt,
            }).ToList(),
        });
    }

    /// <summary>
    /// Closes a specific Twilio sub-account.
    /// Closed accounts are automatically deleted by Twilio after 30 days.
    /// </summary>
    /// <param name="subAccountSid">The sub-account SID to close.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Result of the close operation.</returns>
    [HttpPost("sub-accounts/{subAccountSid}/close")]
    [ProducesResponseType(typeof(CloseSubAccountResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CloseSubAccount(
        string subAccountSid,
        CancellationToken cancellationToken)
    {
        if (!_environment.IsDevelopment())
        {
            return Forbid("This endpoint is only available in Development environment.");
        }

        try
        {
            var success = await _twilioService.CloseSubAccountAsync(subAccountSid, cancellationToken);

            return Ok(new CloseSubAccountResponse
            {
                Success = success,
                SubAccountSid = subAccountSid,
                Message = success
                    ? "Sub-account closed successfully. It will be automatically deleted in 30 days."
                    : "Failed to close sub-account.",
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Closes ALL Twilio sub-accounts. Use with extreme caution!
    /// This is for development/testing cleanup only.
    /// </summary>
    /// <param name="confirm">Must be "yes-close-all" to confirm the operation.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Number of sub-accounts closed.</returns>
    [HttpPost("sub-accounts/close-all")]
    [ProducesResponseType(typeof(CloseAllSubAccountsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CloseAllSubAccounts(
        [FromQuery] string confirm,
        CancellationToken cancellationToken)
    {
        if (!_environment.IsDevelopment())
        {
            return Forbid("This endpoint is only available in Development environment.");
        }

        if (confirm != "yes-close-all")
        {
            return BadRequest(new
            {
                error = "Confirmation required. Pass ?confirm=yes-close-all to confirm.",
                warning = "This will close ALL Twilio sub-accounts. They will be deleted in 30 days.",
            });
        }

        _logger.LogWarning("Closing ALL Twilio sub-accounts - initiated by user");

        var closedCount = await _twilioService.CloseAllSubAccountsAsync(cancellationToken);

        return Ok(new CloseAllSubAccountsResponse
        {
            ClosedCount = closedCount,
            Message = $"Successfully closed {closedCount} sub-account(s). They will be deleted in 30 days.",
        });
    }
}

/// <summary>Response for listing sub-accounts.</summary>
public class SubAccountListResponse
{
    /// <summary>Gets or sets the total count of sub-accounts.</summary>
    public int TotalCount { get; set; }

    /// <summary>Gets or sets the list of sub-accounts.</summary>
    public IReadOnlyList<SubAccountInfo> SubAccounts { get; set; } = [];
}

/// <summary>Sub-account information.</summary>
public class SubAccountInfo
{
    /// <summary>Gets or sets the account SID.</summary>
    public string AccountSid { get; set; } = string.Empty;

    /// <summary>Gets or sets the friendly name.</summary>
    public string FriendlyName { get; set; } = string.Empty;

    /// <summary>Gets or sets the status.</summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>Gets or sets when the account was created.</summary>
    public DateTime CreatedAt { get; set; }
}

/// <summary>Response for closing a sub-account.</summary>
public class CloseSubAccountResponse
{
    /// <summary>Gets or sets a value indicating whether the operation was successful.</summary>
    public bool Success { get; set; }

    /// <summary>Gets or sets the sub-account SID that was closed.</summary>
    public string SubAccountSid { get; set; } = string.Empty;

    /// <summary>Gets or sets the result message.</summary>
    public string Message { get; set; } = string.Empty;
}

/// <summary>Response for closing all sub-accounts.</summary>
public class CloseAllSubAccountsResponse
{
    /// <summary>Gets or sets the number of sub-accounts closed.</summary>
    public int ClosedCount { get; set; }

    /// <summary>Gets or sets the result message.</summary>
    public string Message { get; set; } = string.Empty;
}

