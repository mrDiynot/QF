using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Repositories;

/// <summary>
/// Repository interface for EmailLog entity.
/// </summary>
public interface IEmailLogRepository
{
    /// <summary>
    /// Gets an email log by Resend email ID.
    /// </summary>
    /// <param name="resendEmailId">The Resend email ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The email log or null if not found.</returns>
    Task<EmailLog?> GetByResendEmailIdAsync(string resendEmailId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all email logs for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="status">Optional status filter.</param>
    /// <param name="templateId">Optional template ID filter.</param>
    /// <param name="limit">Maximum number of results.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of email logs.</returns>
    Task<IReadOnlyList<EmailLog>> GetAllAsync(
        Guid businessId,
        EmailStatus? status = null,
        Guid? templateId = null,
        int limit = 100,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new email log.
    /// </summary>
    /// <param name="emailLog">The email log to create.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created email log.</returns>
    Task<EmailLog> CreateAsync(EmailLog emailLog, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing email log.
    /// </summary>
    /// <param name="emailLog">The email log to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(EmailLog emailLog, CancellationToken cancellationToken = default);
}

