using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for Business entity operations.
/// </summary>
public interface IBusinessRepository
{
    /// <summary>
    /// Gets a business by ID.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The business if found; otherwise, null.</returns>
    Task<Business?> GetByIdAsync(Guid businessId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing business.
    /// </summary>
    /// <param name="business">The business to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(Business business, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a business with the given name already exists.
    /// </summary>
    /// <param name="businessName">The business name to check.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if a business with the name exists; otherwise, false.</returns>
    Task<bool> ExistsByNameAsync(string businessName, CancellationToken cancellationToken = default);
}
