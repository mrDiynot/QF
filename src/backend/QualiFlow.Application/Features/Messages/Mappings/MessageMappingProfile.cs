using AutoMapper;
using QualiFlow.Application.Features.Messages.DTOs;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Features.Messages.Mappings;

/// <summary>
/// AutoMapper profile for Message entity mappings.
/// </summary>
public class MessageMappingProfile : Profile
{
    /// <summary>
    /// Initializes a new instance of the <see cref="MessageMappingProfile"/> class.
    /// </summary>
    public MessageMappingProfile()
    {
        // CreateMessageRequest -> Message
        CreateMap<CreateMessageRequest, Message>()
            .ForMember(dest => dest.SentAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.DeletedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Conversation, opt => opt.Ignore());

        // Message -> MessageResponse
        CreateMap<Message, MessageResponse>();

        // UpdateMessageRequest -> Message (for partial updates)
        CreateMap<UpdateMessageRequest, Message>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
    }
}

