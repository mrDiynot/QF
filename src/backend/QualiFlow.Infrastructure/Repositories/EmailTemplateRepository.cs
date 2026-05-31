using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;
using QualiFlow.Infrastructure.Data.Repositories;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for EmailTemplate entity operations.
/// Multi-tenancy is enforced automatically via EF Core global query filters.
/// All queries are automatically filtered by the current user's BusinessId.
/// </summary>
/// <param name="context">The database context.</param>
/// <param name="currentUserService">Service for accessing current user context.</param>
/// <param name="logger">The logger instance.</param>
public partial class EmailTemplateRepository(
    QualiFlowDbContext context,
    ICurrentUserService currentUserService,
    ILogger<EmailTemplateRepository> logger) : IEmailTemplateRepository
{
    /// <inheritdoc />
    public Task<EmailTemplate?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogGettingEmailTemplate(logger, id, businessId);

        // MULTI-TENANCY: Explicit BusinessId filtering for defense-in-depth
        return context.EmailTemplates
            .AsNoTracking()
            .Where(t => t.BusinessId == businessId && t.Id == id && t.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<EmailTemplate>> GetAllAsync(
        Guid businessId,
        EmailTemplateType? type = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        LogGettingAllEmailTemplates(logger, businessId, type, isActive);

        var query = context.EmailTemplates
            .AsNoTracking()
            .Where(t => t.BusinessId == businessId && t.DeletedAt == null);

        if (type.HasValue)
        {
            query = query.Where(t => t.Type == type.Value);
        }

        if (isActive.HasValue)
        {
            query = query.Where(t => t.IsActive == isActive.Value);
        }

        return await query
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<EmailTemplate> CreateAsync(EmailTemplate template, CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogCreatingEmailTemplate(logger, template.Id, businessId);

        await context.EmailTemplates.AddAsync(template, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        return template;
    }

    /// <inheritdoc />
    public async Task UpdateAsync(EmailTemplate template, CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogUpdatingEmailTemplate(logger, template.Id, businessId);

        context.EmailTemplates.Update(template);
        await context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogDeletingEmailTemplate(logger, id, businessId);

        var template = await context.EmailTemplates
            .Where(t => t.Id == id)
            .FirstOrDefaultAsync(cancellationToken);

        if (template != null)
        {
            template.DeletedAt = DateTime.UtcNow;
            context.EmailTemplates.Update(template);
            await context.SaveChangesAsync(cancellationToken);
        }
    }
}

