using AutoMapper;
using QualiFlow.Application.Features.Leads.DTOs;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Leads.Mappings;

/// <summary>
/// AutoMapper profile for Lead entity mappings.
/// </summary>
public class LeadMappingProfile : Profile
{
    /// <summary>
    /// Initializes a new instance of the <see cref="LeadMappingProfile"/> class.
    /// </summary>
    public LeadMappingProfile()
    {
        // CreateLeadRequest -> Lead
        CreateMap<CreateLeadRequest, Lead>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.BusinessId, opt => opt.Ignore()) // Set by service
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status ?? LeadStatus.New))
            .ForMember(dest => dest.Score, opt => opt.MapFrom(src => 0)) // Default score
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.DeletedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Business, opt => opt.Ignore())
            .ForMember(dest => dest.Conversations, opt => opt.Ignore())
            .ForMember(dest => dest.Qualifications, opt => opt.Ignore())
            .ForMember(dest => dest.Bookings, opt => opt.Ignore());

        // Lead -> LeadResponse
        CreateMap<Lead, LeadResponse>();

        // UpdateLeadRequest -> Lead (for partial updates)
        CreateMap<UpdateLeadRequest, Lead>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
    }
}

