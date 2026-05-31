using AutoMapper;
using QualiFlow.Application.Features.Bookings.DTOs;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Features.Bookings.Mappings;

/// <summary>
/// AutoMapper profile for Booking mappings.
/// </summary>
public class BookingMappingProfile : Profile
{
    /// <summary>
    /// Initializes a new instance of the <see cref="BookingMappingProfile"/> class.
    /// </summary>
    public BookingMappingProfile()
    {
        CreateMap<Booking, BookingResponse>();
    }
}

