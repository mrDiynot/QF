using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for Form entity operations.
/// All operations are scoped to a specific business (tenant) for multi-tenancy isolation.
/// </summary>
public interface IFormRepository
{
    /// <summary>
    /// Gets a form by ID within the specified business context.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="formId">The form ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The form if found; otherwise, null.</returns>
    Task<Form?> GetByIdAsync(Guid businessId, Guid formId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a form by slug within the specified business context.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="slug">The form's unique slug.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The form if found; otherwise, null.</returns>
    Task<Form?> GetBySlugAsync(Guid businessId, string slug, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all forms for a business with optional filtering and pagination.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="status">Optional status filter.</param>
    /// <param name="isActive">Optional active status filter.</param>
    /// <param name="skip">Number of records to skip for pagination.</param>
    /// <param name="take">Number of records to take for pagination.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of forms.</returns>
    Task<IReadOnlyList<Form>> GetAllAsync(
        Guid businessId,
        FormStatus? status = null,
        bool? isActive = null,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the total count of forms for a business with optional filtering.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="status">Optional status filter.</param>
    /// <param name="isActive">Optional active status filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The total count of forms.</returns>
    Task<int> GetCountAsync(
        Guid businessId,
        FormStatus? status = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new form to the database.
    /// </summary>
    /// <param name="form">The form to add.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The added form with generated ID.</returns>
    Task<Form> AddAsync(Form form, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing form in the database.
    /// </summary>
    /// <param name="form">The form to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(Form form, CancellationToken cancellationToken = default);

    /// <summary>
    /// Soft deletes a form by setting DeletedAt.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="formId">The form ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the form was deleted; false if not found.</returns>
    Task<bool> DeleteAsync(Guid businessId, Guid formId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a form with the given slug exists within the business.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="slug">The slug to check.</param>
    /// <param name="excludeFormId">Optional form ID to exclude from check (for updates).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if a form with the slug exists; otherwise, false.</returns>
    Task<bool> SlugExistsAsync(
        Guid businessId,
        string slug,
        Guid? excludeFormId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a published and active form by slug for public access.
    /// This method does not require a business ID as it's used for anonymous form submissions.
    /// </summary>
    /// <param name="slug">The form's unique slug.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The form if found, published, and active; otherwise, null.</returns>
    Task<Form?> GetPublicFormBySlugAsync(string slug, CancellationToken cancellationToken = default);
}

