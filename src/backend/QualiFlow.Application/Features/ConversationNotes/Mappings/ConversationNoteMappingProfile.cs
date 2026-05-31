using AutoMapper;
using QualiFlow.Application.Features.ConversationNotes.DTOs;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Features.ConversationNotes.Mappings;

/// <summary>
/// AutoMapper profile for ConversationNote mappings.
/// </summary>
public class ConversationNoteMappingProfile : Profile
{
    /// <summary>
    /// Initializes a new instance of the <see cref="ConversationNoteMappingProfile"/> class.
    /// </summary>
    public ConversationNoteMappingProfile()
    {
        CreateMap<ConversationNote, ConversationNoteResponse>()
            .ForMember(dest => dest.CreatedByUserName, opt => opt.MapFrom(src => src.CreatedByUser != null ? src.CreatedByUser.FullName : null));
    }
}

