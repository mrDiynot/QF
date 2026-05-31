using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Repositories;

/// <summary>
/// Repository interface for EmailTemplate entity.
/// </summary>
public interface IEmailTemplateRepository
{
    /// <summary>
    /// Gets an email template by ID.
    /// </summary>
    /// <param name="id">The template ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The email template or null if not found.</returns>
    Task<EmailTemplate?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all email templates for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="type">Optional template type filter.</param>
    /// <param name="isActive">Optional active status filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of email templates.</returns>
    Task<IReadOnlyList<EmailTemplate>> GetAllAsync(
        Guid businessId,
        EmailTemplateType? type = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new email template.
    /// </summary>
    /// <param name="template">The email template to create.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created email template.</returns>
    Task<EmailTemplate> CreateAsync(EmailTemplate template, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing email template.
    /// </summary>
    /// <param name="template">The email template to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(EmailTemplate template, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes an email template.
    /// </summary>
    /// <param name="id">The template ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

