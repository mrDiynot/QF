namespace QualiFlow.Domain.Entities;

/// <summary>
/// Types of field interaction events.
/// </summary>
public enum FieldInteractionEventType
{
    /// <summary>
    /// User focused on the field.
    /// </summary>
    Focus,

    /// <summary>
    /// User left the field (blur).
    /// </summary>
    Blur,

    /// <summary>
    /// User changed the field value.
    /// </summary>
    Change,

    /// <summary>
    /// Validation error occurred.
    /// </summary>
    ValidationError,

    /// <summary>
    /// User submitted the field (for multi-step forms).
    /// </summary>
    Submit,

    /// <summary>
    /// User abandoned the form at this field.
    /// </summary>
    Abandon
}

/// <summary>
/// Represents a user interaction with a specific form field.
/// </summary>
public class FieldInteraction
{
    /// <summary>
    /// Gets or sets the unique identifier for the field interaction.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the form view ID this interaction belongs to.
    /// </summary>
    public Guid FormViewId { get; set; }

    /// <summary>
    /// Gets or sets the field identifier (from form schema).
    /// </summary>
    public string FieldId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the field label/name.
    /// </summary>
    public string? FieldLabel { get; set; }

    /// <summary>
    /// Gets or sets the field type (text, email, select, etc.).
    /// </summary>
    public string? FieldType { get; set; }

    /// <summary>
    /// Gets or sets the type of event (Focus, Blur, Change, ValidationError, etc.).
    /// </summary>
    public FieldInteractionEventType EventType { get; set; }

    /// <summary>
    /// Gets or sets when the event occurred.
    /// </summary>
    public DateTime EventAt { get; set; }

    /// <summary>
    /// Gets or sets the time spent on this field (in seconds).
    /// </summary>
    public int? TimeSpentSeconds { get; set; }

    /// <summary>
    /// Gets or sets the number of characters entered (for text fields).
    /// </summary>
    public int? CharactersEntered { get; set; }

    /// <summary>
    /// Gets or sets the number of times the field was edited/changed.
    /// </summary>
    public int? EditCount { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the field had validation errors.
    /// </summary>
    public bool HadValidationError { get; set; }

    /// <summary>
    /// Gets or sets the validation error message (if any).
    /// </summary>
    public string? ValidationErrorMessage { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the user abandoned the form at this field.
    /// </summary>
    public bool AbandonedAtField { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the form view this interaction belongs to.
    /// </summary>
    public FormView FormView { get; set; } = null!;
}
