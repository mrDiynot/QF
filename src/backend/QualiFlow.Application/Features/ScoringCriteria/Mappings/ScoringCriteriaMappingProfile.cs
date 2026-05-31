// -----------------------------------------------------------------------
// <copyright file="ScoringCriteriaMappingProfile.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using AutoMapper;
using QualiFlow.Application.Features.ScoringCriteria.DTOs;

namespace QualiFlow.Application.Features.ScoringCriteria.Mappings;

/// <summary>
/// AutoMapper profile for ScoringCriteria mappings.
/// </summary>
public class ScoringCriteriaMappingProfile : Profile
{
    /// <summary>Initializes a new instance of the <see cref="ScoringCriteriaMappingProfile"/> class.</summary>
    public ScoringCriteriaMappingProfile()
    {
        // Entity to Response
        CreateMap<Domain.Entities.ScoringCriteria, ScoringCriteriaResponse>();

        // Request to Entity
        CreateMap<CreateScoringCriteriaRequest, Domain.Entities.ScoringCriteria>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.BusinessId, opt => opt.Ignore())
            .ForMember(dest => dest.Business, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
    }
}

