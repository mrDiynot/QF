using AutoMapper;
using QualiFlow.Application.Features.Conversations.DTOs;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Conversations.Mappings;

/// <summary>
/// AutoMapper profile for Conversation entity mappings.
/// </summary>
public class ConversationMappingProfile : Profile
{
    /// <summary>
    /// Initializes a new instance of the <see cref="ConversationMappingProfile"/> class.
    /// </summary>
    public ConversationMappingProfile()
    {
        // CreateConversationRequest -> Conversation
        CreateMap<CreateConversationRequest, Conversation>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.BusinessId, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status ?? ConversationStatus.Open))
            .ForMember(dest => dest.StartedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
            .ForMember(dest => dest.EndedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.DeletedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Business, opt => opt.Ignore())
            .ForMember(dest => dest.Lead, opt => opt.Ignore())
            .ForMember(dest => dest.Messages, opt => opt.Ignore());

        // Conversation -> ConversationResponse
        CreateMap<Conversation, ConversationResponse>()
            .ForMember(dest => dest.MessageCount, opt => opt.MapFrom(src => src.Messages.Count))
            .ForMember(dest => dest.UnreadCount, opt => opt.MapFrom(src => src.Messages.Count(m => m.ReadAt == null && m.Direction == MessageDirection.Inbound)));

        // UpdateConversationRequest -> Conversation (for partial updates)
        CreateMap<UpdateConversationRequest, Conversation>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
    }
}

