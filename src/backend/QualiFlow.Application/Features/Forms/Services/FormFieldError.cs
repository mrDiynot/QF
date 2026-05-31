namespace QualiFlow.Application.Features.Forms.Services;

/// <summary>
/// Represents a validation error for a specific field.
/// </summary>
public record FormFieldError
{
    /// <summary>
    /// Gets the field name.
    /// </summary>
    public required string FieldName { get; init; }

    /// <summary>
    /// Gets the error message.
    /// </summary>
    public required string Message { get; init; }

    /// <summary>
    /// Gets the error code.
    /// </summary>
    public required string Code { get; init; }
}

