using System.Diagnostics.CodeAnalysis;

using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Factory interface for creating CRM adapters.
/// </summary>
[SuppressMessage("Naming", "S101:Types should be named in PascalCase", Justification = "CRM is a well-known acronym")]
public interface ICRMAdapterFactory
{
    /// <summary>
    /// Creates a CRM adapter for the given provider.
    /// </summary>
    /// <param name="provider">The CRM provider configuration.</param>
    /// <returns>The appropriate CRM adapter instance.</returns>
    ICRMAdapter CreateAdapter(CRMProvider provider);

    /// <summary>
    /// Creates a CRM adapter for the given provider type.
    /// </summary>
    /// <param name="providerType">The CRM provider type.</param>
    /// <returns>The appropriate CRM adapter instance.</returns>
    ICRMAdapter CreateAdapter(CRMProviderType providerType);
}

