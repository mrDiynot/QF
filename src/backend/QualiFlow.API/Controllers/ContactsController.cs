using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Features.CRM.Services;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for managing CRM contacts.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/contacts")]
[Authorize]
public partial class ContactsController(
    IContactService contactService,
    ILogger<ContactsController> logger) : ControllerBase
{
    /// <summary>
    /// Gets all contacts for the current business.
    /// </summary>
    /// <param name="status">Optional status filter.</param>
    /// <param name="assignedToUserId">Optional assigned user filter.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The list of contacts.</returns>
    [HttpGet]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(IEnumerable<Contact>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IEnumerable<Contact>>> GetAllContactsAsync(
        [FromQuery] ContactStatus? status,
        [FromQuery] Guid? assignedToUserId,
        CancellationToken cancellationToken)
    {
        LogGettingAllContacts(status, assignedToUserId);

        var contacts = await contactService.GetAllAsync(status, assignedToUserId, cancellationToken);

        return Ok(contacts);
    }

    /// <summary>
    /// Gets a contact by ID.
    /// </summary>
    /// <param name="id">The contact ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The contact.</returns>
    [HttpGet("{id}")]
    [CacheControl(60, "Authorization")] // Cache for 1 minute per user
    [ProducesResponseType(typeof(Contact), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Contact>> GetContactByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        LogGettingContact(id);

        var contact = await contactService.GetByIdAsync(id, cancellationToken);

        if (contact == null)
        {
            return NotFound($"Contact with ID {id} not found");
        }

        return Ok(contact);
    }

    /// <summary>
    /// Searches contacts by query.
    /// </summary>
    /// <param name="q">The search query.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The list of matching contacts.</returns>
    [HttpGet("search")]
    [ProducesResponseType(typeof(IEnumerable<Contact>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IEnumerable<Contact>>> SearchContactsAsync(
        [FromQuery] string q,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(q))
        {
            return BadRequest("Search query is required");
        }

        LogSearchingContacts(q);

        var contacts = await contactService.SearchAsync(q, cancellationToken);

        return Ok(contacts);
    }

    /// <summary>
    /// Creates a new contact.
    /// </summary>
    /// <param name="contact">The contact to create.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The created contact.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(Contact), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<Contact>> CreateContactAsync(
        [FromBody] Contact contact,
        CancellationToken cancellationToken)
    {
        LogCreatingContact(contact.Email);

        try
        {
            var created = await contactService.CreateAsync(contact, cancellationToken);

            return CreatedAtAction(
                nameof(GetContactByIdAsync),
                new { id = created.Id },
                created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Updates an existing contact.
    /// </summary>
    /// <param name="id">The contact ID.</param>
    /// <param name="contact">The updated contact data.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The updated contact.</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(Contact), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Contact>> UpdateContactAsync(
        Guid id,
        [FromBody] Contact contact,
        CancellationToken cancellationToken)
    {
        if (id != contact.Id)
        {
            return BadRequest("Contact ID mismatch");
        }

        LogUpdatingContact(id);

        try
        {
            var updated = await contactService.UpdateAsync(contact, cancellationToken);

            return Ok(updated);
        }
        catch (UnauthorizedAccessException)
        {
            return NotFound($"Contact with ID {id} not found");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Deletes a contact.
    /// </summary>
    /// <param name="id">The contact ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteContactAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        LogDeletingContact(id);

        try
        {
            await contactService.DeleteAsync(id, cancellationToken);

            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return NotFound($"Contact with ID {id} not found");
        }
    }

    /// <summary>
    /// Gets contact count.
    /// </summary>
    /// <param name="status">Optional status filter.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The contact count.</returns>
    [HttpGet("count")]
    [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<int>> GetContactCountAsync(
        [FromQuery] ContactStatus? status,
        CancellationToken cancellationToken)
    {
        LogGettingContactCount(status);

        var count = await contactService.CountAsync(status, cancellationToken);

        return Ok(count);
    }

    // ============================================================================
    // LoggerMessage Source Generators
    // ============================================================================

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting all contacts with status={Status}, assignedTo={AssignedToUserId}")]
    private partial void LogGettingAllContacts(ContactStatus? status, Guid? assignedToUserId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting contact {ContactId}")]
    private partial void LogGettingContact(Guid contactId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Searching contacts with query: {Query}")]
    private partial void LogSearchingContacts(string query);

    [LoggerMessage(Level = LogLevel.Information, Message = "Creating contact: {Email}")]
    private partial void LogCreatingContact(string email);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updating contact {ContactId}")]
    private partial void LogUpdatingContact(Guid contactId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Deleting contact {ContactId}")]
    private partial void LogDeletingContact(Guid contactId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting contact count with status={Status}")]
    private partial void LogGettingContactCount(ContactStatus? status);
}
