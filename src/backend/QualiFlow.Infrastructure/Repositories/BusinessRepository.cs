using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Business entity operations.
/// </summary>
/// <param name="context">The database context.</param>
/// <param name="logger">The logger instance.</param>
public partial class BusinessRepository(
    QualiFlowDbContext context,
    ILogger<BusinessRepository> logger) : IBusinessRepository
{
    /// <inheritdoc />
    public Task<Business?> GetByIdAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        LogGettingBusiness(logger, businessId);

        return context.Businesses
            .AsNoTracking()
            .Where(b => b.Id == businessId && b.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public Task UpdateAsync(
        Business business,
        CancellationToken cancellationToken = default)
    {
        LogUpdatingBusiness(logger, business.Id);

        context.Businesses.Update(business);
        return context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public Task<bool> ExistsByNameAsync(
        string businessName,
        CancellationToken cancellationToken = default)
    {
        LogCheckingBusinessName(logger, businessName);

        return context.Businesses
            .AsNoTracking()
            .Where(b => EF.Functions.ILike(b.Name, businessName) && b.DeletedAt == null)
            .AnyAsync(cancellationToken);
    }

    [LoggerMessage(EventId = 7001, Level = LogLevel.Information, Message = "Getting business {BusinessId}")]
    private static partial void LogGettingBusiness(ILogger logger, Guid businessId);

    [LoggerMessage(EventId = 7002, Level = LogLevel.Information, Message = "Updating business {BusinessId}")]
    private static partial void LogUpdatingBusiness(ILogger logger, Guid businessId);

    [LoggerMessage(EventId = 7003, Level = LogLevel.Information, Message = "Checking if business name exists: {BusinessName}")]
    private static partial void LogCheckingBusinessName(ILogger logger, string businessName);
}
