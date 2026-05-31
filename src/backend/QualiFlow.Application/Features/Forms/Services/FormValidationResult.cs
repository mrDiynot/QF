namespace QualiFlow.Application.Features.Forms.Services;

/// <summary>
/// Result of form field validation.
/// </summary>
public record FormValidationResult
{
    /// <summary>
    /// Gets a value indicating whether validation passed.
    /// </summary>
    public bool IsValid => Errors.Count == 0;

    /// <summary>
    /// Gets the list of validation errors.
    /// </summary>
    public IReadOnlyCollection<FormFieldError> Errors { get; init; } = [];
}

