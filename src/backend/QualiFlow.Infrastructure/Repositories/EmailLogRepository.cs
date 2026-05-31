using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;
using QualiFlow.Infrastructure.Data.Repositories;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for EmailLog entity operations.
/// Multi-tenancy is enforced automatically via EF Core global query filters.
/// All queries are automatically filtered by the current user's BusinessId.
/// </summary>
/// <param name="context">The database context.</param>
/// <param name="currentUserService">Service for accessing current user context.</param>
/// <param name="logger">The logger instance.</param>
public partial class EmailLogRepository(
    QualiFlowDbContext context,
    ICurrentUserService currentUserService,
    ILogger<EmailLogRepository> logger) : IEmailLogRepository
{
    /// <inheritdoc />
    public Task<EmailLog?> GetByResendEmailIdAsync(string resendEmailId, CancellationToken cancellationToken = default)
    {
        LogGettingEmailLogByResendId(logger, resendEmailId);

        return context.EmailLogs
            .Where(e => e.ResendEmailId == resendEmailId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<EmailLog>> GetAllAsync(
        Guid businessId,
        EmailStatus? status = null,
        Guid? templateId = null,
        int limit = 100,
        CancellationToken cancellationToken = default)
    {
        LogGettingAllEmailLogs(logger, businessId, status, templateId, limit);

        var query = context.EmailLogs
            .AsNoTracking()
            .Where(e => e.BusinessId == businessId);

        if (status.HasValue)
        {
            query = query.Where(e => e.Status == status.Value);
        }

        if (templateId.HasValue)
        {
            query = query.Where(e => e.EmailTemplateId == templateId.Value);
        }

        return await query
            .OrderByDescending(e => e.CreatedAt)
            .Take(limit)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<EmailLog> CreateAsync(EmailLog emailLog, CancellationToken cancellationToken = default)
    {
        // BusinessId should already be set on the emailLog entity
        // If not set, try to get from current user (for authenticated requests)
        if (emailLog.BusinessId == Guid.Empty)
        {
            try
            {
                emailLog.BusinessId = currentUserService.GetBusinessId();
            }
            catch (UnauthorizedAccessException)
            {
                // During registration, user is not authenticated yet
                // BusinessId should be set by the caller (EmailService)
                logger.LogWarning("BusinessId not set on EmailLog and no authenticated user context available");
            }
        }

        LogCreatingEmailLog(logger, emailLog.Id, emailLog.BusinessId);

        await context.EmailLogs.AddAsync(emailLog, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        return emailLog;
    }

    /// <inheritdoc />
    public async Task UpdateAsync(EmailLog emailLog, CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogUpdatingEmailLog(logger, emailLog.Id, businessId);

        context.EmailLogs.Update(emailLog);
        await context.SaveChangesAsync(cancellationToken);
    }
}

