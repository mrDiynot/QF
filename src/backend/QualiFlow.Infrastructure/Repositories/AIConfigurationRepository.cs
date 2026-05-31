using Microsoft.EntityFrameworkCore;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for AI Configuration operations.
/// </summary>
public class AIConfigurationRepository : IAIConfigurationRepository
{
    private readonly QualiFlowDbContext _context;

    public AIConfigurationRepository(QualiFlowDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc />
    public async Task<AIConfiguration?> GetByBusinessIdAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Set<AIConfiguration>()
            .FirstOrDefaultAsync(c => c.BusinessId == businessId, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<AIConfiguration> CreateAsync(
        AIConfiguration configuration,
        CancellationToken cancellationToken = default)
    {
        configuration.CreatedAt = DateTime.UtcNow;
        configuration.UpdatedAt = DateTime.UtcNow;

        await _context.Set<AIConfiguration>().AddAsync(configuration, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return configuration;
    }

    /// <inheritdoc />
    public async Task<AIConfiguration> UpdateAsync(
        AIConfiguration configuration,
        CancellationToken cancellationToken = default)
    {
        configuration.UpdatedAt = DateTime.UtcNow;

        _context.Set<AIConfiguration>().Update(configuration);
        await _context.SaveChangesAsync(cancellationToken);

        return configuration;
    }

    /// <inheritdoc />
    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var configuration = await _context.Set<AIConfiguration>()
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (configuration != null)
        {
            _context.Set<AIConfiguration>().Remove(configuration);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
