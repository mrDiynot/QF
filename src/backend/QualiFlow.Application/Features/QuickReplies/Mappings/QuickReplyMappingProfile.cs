using AutoMapper;
using QualiFlow.Application.Features.QuickReplies.DTOs;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Features.QuickReplies.Mappings;

/// <summary>
/// AutoMapper profile for QuickReply mappings.
/// </summary>
public class QuickReplyMappingProfile : Profile
{
    /// <summary>
    /// Initializes a new instance of the <see cref="QuickReplyMappingProfile"/> class.
    /// </summary>
    public QuickReplyMappingProfile()
    {
        CreateMap<QuickReply, QuickReplyResponse>();
    }
}

