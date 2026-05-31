// -----------------------------------------------------------------------
// <copyright file="BusinessScoringConfigurationRepository.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for business scoring configuration operations.
/// </summary>
public sealed partial class BusinessScoringConfigurationRepository(
    QualiFlowDbContext context,
    ILogger<BusinessScoringConfigurationRepository> logger) : IBusinessScoringConfigurationRepository
{
    /// <inheritdoc />
    public async Task<BusinessScoringConfiguration?> GetByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken = default)
    {
        LogGettingConfiguration(businessId);
        return await context.BusinessScoringConfigurations
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.BusinessId == businessId && c.DeletedAt == null, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<BusinessScoringConfiguration> CreateAsync(BusinessScoringConfiguration configuration, CancellationToken cancellationToken = default)
    {
        LogCreatingConfiguration(configuration.BusinessId);
        context.BusinessScoringConfigurations.Add(configuration);
        await context.SaveChangesAsync(cancellationToken);
        return configuration;
    }

    /// <inheritdoc />
    public async Task UpdateAsync(BusinessScoringConfiguration configuration, CancellationToken cancellationToken = default)
    {
        LogUpdatingConfiguration(configuration.BusinessId);
        configuration.UpdatedAt = DateTime.UtcNow;
        context.BusinessScoringConfigurations.Update(configuration);
        await context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<BusinessScoringConfiguration> GetOrCreateDefaultAsync(Guid businessId, string? industry = null, CancellationToken cancellationToken = default)
    {
        var existing = await GetByBusinessIdAsync(businessId, cancellationToken);
        if (existing != null)
        {
            return existing;
        }

        LogCreatingDefaultConfiguration(businessId, industry);

        // Try to find industry template
        var template = industry != null
            ? await context.IndustryScoringTemplates
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Industry == industry && t.IsDefault && t.IsActive, cancellationToken)
            : null;

        var config = new BusinessScoringConfiguration
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            QualificationThreshold = template?.QualificationThreshold ?? 70,
            AIWeight = template?.AIWeight ?? 60,
            RulesWeight = template?.RulesWeight ?? 40,
            BudgetWeight = template?.BudgetWeight ?? 25,
            AuthorityWeight = template?.AuthorityWeight ?? 25,
            NeedWeight = template?.NeedWeight ?? 25,
            TimelineWeight = template?.TimelineWeight ?? 25,
            IndustryTemplate = industry,
            CreatedAt = DateTime.UtcNow,
        };

        return await CreateAsync(config, cancellationToken);
    }

    // Logging
    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting scoring configuration for business {BusinessId}")]
    private partial void LogGettingConfiguration(Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Creating scoring configuration for business {BusinessId}")]
    private partial void LogCreatingConfiguration(Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updating scoring configuration for business {BusinessId}")]
    private partial void LogUpdatingConfiguration(Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Creating default scoring configuration for business {BusinessId}, industry: {Industry}")]
    private partial void LogCreatingDefaultConfiguration(Guid businessId, string? industry);
}
