using System.Diagnostics.CodeAnalysis;

using Microsoft.Extensions.DependencyInjection;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.CRM.Adapters;

namespace QualiFlow.Infrastructure.CRM.Factories;

/// <summary>
/// Factory for creating CRM adapters based on provider type.
/// Implements the Factory Pattern.
/// </summary>
[SuppressMessage("Naming", "S101:Types should be named in PascalCase", Justification = "CRM is a well-known acronym")]
public class CRMAdapterFactory : ICRMAdapterFactory
{
    private readonly IServiceProvider _serviceProvider;

    /// <summary>
    /// Initializes a new instance of the <see cref="CRMAdapterFactory"/> class.
    /// </summary>
    /// <param name="serviceProvider">The service provider.</param>
    public CRMAdapterFactory(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    /// <inheritdoc/>
    public ICRMAdapter CreateAdapter(CRMProvider provider)
    {
        return provider.ProviderType switch
        {
            CRMProviderType.QualiFlow => _serviceProvider.GetRequiredService<QualiFlowCRMAdapter>(),
            CRMProviderType.HubSpot => throw new NotSupportedException("HubSpot adapter will be implemented in Sprint 7"),
            CRMProviderType.Salesforce => throw new NotSupportedException("Salesforce adapter will be implemented in Sprint 7"),
            CRMProviderType.Pipedrive => throw new NotSupportedException("Pipedrive adapter is planned for Phase 2"),
            CRMProviderType.Zoho => throw new NotSupportedException("Zoho adapter is planned for Phase 2"),
            _ => throw new NotSupportedException($"CRM provider type '{provider.ProviderType}' is not supported")
        };
    }

    /// <inheritdoc/>
    public ICRMAdapter CreateAdapter(CRMProviderType providerType)
    {
        return providerType switch
        {
            CRMProviderType.QualiFlow => _serviceProvider.GetRequiredService<QualiFlowCRMAdapter>(),
            CRMProviderType.HubSpot => throw new NotSupportedException("HubSpot adapter will be implemented in Sprint 7"),
            CRMProviderType.Salesforce => throw new NotSupportedException("Salesforce adapter will be implemented in Sprint 7"),
            CRMProviderType.Pipedrive => throw new NotSupportedException("Pipedrive adapter is planned for Phase 2"),
            CRMProviderType.Zoho => throw new NotSupportedException("Zoho adapter is planned for Phase 2"),
            _ => throw new NotSupportedException($"CRM provider type '{providerType}' is not supported")
        };
    }
}

