namespace QualiFlow.Application.Features.Admin.BusinessManagement.DTOs;

/// <summary>
/// Request to update a business.
/// </summary>
public class UpdateBusinessRequest
{
    /// <summary>
    /// Gets or sets the business name.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the business email.
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// Gets or sets the business phone number.
    /// </summary>
    public string? Phone { get; set; }

    /// <summary>
    /// Gets or sets the business industry.
    /// </summary>
    public string? Industry { get; set; }

    /// <summary>
    /// Gets or sets the business size.
    /// </summary>
    public string? Size { get; set; }
}

