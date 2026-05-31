// <copyright file="SavedSearchesController.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Search.Repositories;
using QualiFlow.Application.Features.Search.Services;
using QualiFlow.Domain.Entities;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for managing saved searches (S15-BE-003).
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize(AuthenticationSchemes = "Bearer")]
[Produces("application/json")]
public class SavedSearchesController(
    ISavedSearchRepository savedSearchRepository,
    IElasticsearchService elasticsearchService,
    ICurrentUserService currentUserService) : ControllerBase
{
    /// <summary>
    /// Creates a new saved search.
    /// </summary>
    /// <param name="request">The saved search creation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created saved search.</returns>
    /// <response code="201">Saved search created successfully.</response>
    /// <response code="400">Invalid request data.</response>
    /// <response code="401">Unauthorized - invalid or missing JWT token.</response>
    [HttpPost]
    [ProducesResponseType(typeof(SavedSearch), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<SavedSearch>> CreateSavedSearch(
        [FromBody] CreateSavedSearchRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Validation Error",
                Detail = "Name is required.",
                Status = StatusCodes.Status400BadRequest,
            });
        }

        var businessId = currentUserService.GetBusinessId();
        var userId = currentUserService.GetUserId();

        if (!userId.HasValue)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Unauthorized",
                Detail = "User is not authenticated.",
                Status = StatusCodes.Status401Unauthorized,
            });
        }

        var savedSearch = new SavedSearch
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            UserId = userId.Value,
            Name = request.Name,
            Description = request.Description,
            EntityType = request.EntityType,
            SearchCriteriaJson = request.SearchCriteriaJson,
            IsShared = request.IsShared,
        };

        var created = await savedSearchRepository.CreateAsync(savedSearch, cancellationToken);

        return CreatedAtAction(
            nameof(GetSavedSearchById),
            new { id = created.Id },
            created);
    }

    /// <summary>
    /// Gets all saved searches for the current user.
    /// </summary>
    /// <param name="includeShared">If true, include shared searches from other users.</param>
    /// <param name="entityType">Filter by entity type (optional).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of saved searches.</returns>
    /// <response code="200">Saved searches retrieved successfully.</response>
    /// <response code="401">Unauthorized - invalid or missing JWT token.</response>
    [HttpGet]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(IReadOnlyList<SavedSearch>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyList<SavedSearch>>> GetSavedSearches(
        [FromQuery] bool includeShared = true,
        [FromQuery] string? entityType = null,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        var userId = currentUserService.GetUserId();

        if (!userId.HasValue)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Unauthorized",
                Detail = "User is not authenticated.",
                Status = StatusCodes.Status401Unauthorized,
            });
        }

        IReadOnlyList<SavedSearch> savedSearches;

        if (!string.IsNullOrWhiteSpace(entityType))
        {
            savedSearches = await savedSearchRepository.GetByEntityTypeAsync(
                businessId,
                userId.Value,
                entityType,
                cancellationToken);
        }
        else
        {
            savedSearches = await savedSearchRepository.GetAllAsync(
                businessId,
                userId.Value,
                includeShared,
                cancellationToken);
        }

        return Ok(savedSearches);
    }

    /// <summary>
    /// Gets a saved search by ID.
    /// </summary>
    /// <param name="id">The saved search ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The saved search.</returns>
    /// <response code="200">Saved search retrieved successfully.</response>
    /// <response code="404">Saved search not found.</response>
    /// <response code="401">Unauthorized - invalid or missing JWT token.</response>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(SavedSearch), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<SavedSearch>> GetSavedSearchById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var businessId = currentUserService.GetBusinessId();

        var savedSearch = await savedSearchRepository.GetByIdAsync(id, businessId, cancellationToken);

        if (savedSearch == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Detail = $"Saved search with ID {id} not found.",
                Status = StatusCodes.Status404NotFound,
            });
        }

        return Ok(savedSearch);
    }

    /// <summary>
    /// Updates an existing saved search.
    /// </summary>
    /// <param name="id">The saved search ID.</param>
    /// <param name="request">The update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated saved search.</returns>
    /// <response code="200">Saved search updated successfully.</response>
    /// <response code="404">Saved search not found.</response>
    /// <response code="401">Unauthorized - invalid or missing JWT token.</response>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(SavedSearch), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<SavedSearch>> UpdateSavedSearch(
        Guid id,
        [FromBody] UpdateSavedSearchRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = currentUserService.GetBusinessId();

        var savedSearch = await savedSearchRepository.GetByIdAsync(id, businessId, cancellationToken);

        if (savedSearch == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Detail = $"Saved search with ID {id} not found.",
                Status = StatusCodes.Status404NotFound,
            });
        }

        // Update properties
        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            savedSearch.Name = request.Name;
        }

        if (request.Description != null)
        {
            savedSearch.Description = request.Description;
        }

        if (!string.IsNullOrWhiteSpace(request.SearchCriteriaJson))
        {
            savedSearch.SearchCriteriaJson = request.SearchCriteriaJson;
        }

        if (request.IsShared.HasValue)
        {
            savedSearch.IsShared = request.IsShared.Value;
        }

        var updated = await savedSearchRepository.UpdateAsync(savedSearch, cancellationToken);

        return Ok(updated);
    }

    /// <summary>
    /// Deletes a saved search.
    /// </summary>
    /// <param name="id">The saved search ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    /// <response code="204">Saved search deleted successfully.</response>
    /// <response code="404">Saved search not found.</response>
    /// <response code="401">Unauthorized - invalid or missing JWT token.</response>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DeleteSavedSearch(
        Guid id,
        CancellationToken cancellationToken)
    {
        var businessId = currentUserService.GetBusinessId();

        var deleted = await savedSearchRepository.DeleteAsync(id, businessId, cancellationToken);

        if (!deleted)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Detail = $"Saved search with ID {id} not found.",
                Status = StatusCodes.Status404NotFound,
            });
        }

        return NoContent();
    }

    /// <summary>
    /// Executes a saved search and returns results.
    /// </summary>
    /// <param name="id">The saved search ID.</param>
    /// <param name="page">Page number (default: 1).</param>
    /// <param name="pageSize">Results per page (default: 20, max: 100).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Search results.</returns>
    /// <response code="200">Search executed successfully.</response>
    /// <response code="404">Saved search not found.</response>
    /// <response code="401">Unauthorized - invalid or missing JWT token.</response>
    [HttpPost("{id}/execute")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ExecuteSavedSearch(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();

        var savedSearch = await savedSearchRepository.GetByIdAsync(id, businessId, cancellationToken);

        if (savedSearch == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Detail = $"Saved search with ID {id} not found.",
                Status = StatusCodes.Status404NotFound,
            });
        }

        // Increment usage count
        await savedSearchRepository.IncrementUsageAsync(id, businessId, cancellationToken);

        // Parse search criteria JSON
        var criteria = System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.JsonElement>(
            savedSearch.SearchCriteriaJson);

        var query = criteria.TryGetProperty("query", out var queryProp) ? queryProp.GetString() : "*";

        if (pageSize > 100)
        {
            pageSize = 100;
        }

        // Execute search based on entity type
        var indexName = savedSearch.EntityType.ToLowerInvariant() switch
        {
            "lead" => "qualiflow-leads",
            "contact" => "qualiflow-contacts",
            "conversation" => "qualiflow-conversations",
            "message" => "qualiflow-messages",
            _ => "qualiflow-leads",
        };

        // Use dynamic type for search results
        var searchMethod = typeof(IElasticsearchService).GetMethod(nameof(IElasticsearchService.SearchAsync));
        var documentType = savedSearch.EntityType.ToLowerInvariant() switch
        {
            "lead" => typeof(QualiFlow.Application.Features.Search.Models.LeadDocument),
            "contact" => typeof(QualiFlow.Application.Features.Search.Models.ContactDocument),
            "conversation" => typeof(QualiFlow.Application.Features.Search.Models.ConversationDocument),
            "message" => typeof(QualiFlow.Application.Features.Search.Models.MessageDocument),
            _ => typeof(QualiFlow.Application.Features.Search.Models.LeadDocument),
        };

        var genericMethod = searchMethod!.MakeGenericMethod(documentType);
        var searchTask = (Task)genericMethod.Invoke(
            elasticsearchService,
            [indexName, query ?? "*", businessId, page, pageSize, cancellationToken])!;

        await searchTask;

        var resultProperty = searchTask.GetType().GetProperty("Result");
        var result = resultProperty!.GetValue(searchTask);

        return Ok(new
        {
            success = true,
            data = result,
            savedSearch = new
            {
                savedSearch.Id,
                savedSearch.Name,
                savedSearch.EntityType,
            },
        });
    }
}

/// <summary>
/// Request model for creating a saved search.
/// </summary>
public record CreateSavedSearchRequest
{
    /// <summary>
    /// Gets the name of the saved search.
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// Gets the description of the saved search.
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// Gets the entity type (Lead, Contact, Conversation, Message, Deal).
    /// </summary>
    public required string EntityType { get; init; }

    /// <summary>
    /// Gets the search criteria as JSON.
    /// </summary>
    public required string SearchCriteriaJson { get; init; }

    /// <summary>
    /// Gets a value indicating whether this search is shared with team members.
    /// </summary>
    public bool IsShared { get; init; }
}

/// <summary>
/// Request model for updating a saved search.
/// </summary>
public record UpdateSavedSearchRequest
{
    /// <summary>
    /// Gets the updated name of the saved search.
    /// </summary>
    public string? Name { get; init; }

    /// <summary>
    /// Gets the updated description of the saved search.
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// Gets the updated search criteria as JSON.
    /// </summary>
    public string? SearchCriteriaJson { get; init; }

    /// <summary>
    /// Gets a value indicating whether this search is shared with team members.
    /// </summary>
    public bool? IsShared { get; init; }
}

