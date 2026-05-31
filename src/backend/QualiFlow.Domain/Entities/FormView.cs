namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a view/visit to a form, tracking visitor behavior.
/// </summary>
public class FormView
{
    /// <summary>
    /// Gets or sets the unique identifier for the form view.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the form ID that was viewed.
    /// </summary>
    public Guid FormId { get; set; }

    /// <summary>
    /// Gets or sets when the form was viewed.
    /// </summary>
    public DateTime ViewedAt { get; set; }

    /// <summary>
    /// Gets or sets the IP address of the visitor.
    /// </summary>
    public string? IpAddress { get; set; }

    /// <summary>
    /// Gets or sets the user agent string.
    /// </summary>
    public string? UserAgent { get; set; }

    /// <summary>
    /// Gets or sets the referrer URL.
    /// </summary>
    public string? Referrer { get; set; }

    /// <summary>
    /// Gets or sets UTM source parameter.
    /// </summary>
    public string? UtmSource { get; set; }

    /// <summary>
    /// Gets or sets UTM medium parameter.
    /// </summary>
    public string? UtmMedium { get; set; }

    /// <summary>
    /// Gets or sets UTM campaign parameter.
    /// </summary>
    public string? UtmCampaign { get; set; }

    /// <summary>
    /// Gets or sets a unique session identifier.
    /// </summary>
    public string? SessionId { get; set; }

    /// <summary>
    /// Gets or sets the device type (Mobile, Tablet, Desktop).
    /// </summary>
    public string? DeviceType { get; set; }

    /// <summary>
    /// Gets or sets the browser name.
    /// </summary>
    public string? Browser { get; set; }

    /// <summary>
    /// Gets or sets the operating system.
    /// </summary>
    public string? OperatingSystem { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the visitor submitted the form.
    /// </summary>
    public bool Submitted { get; set; }

    /// <summary>
    /// Gets or sets the submission ID (if submitted).
    /// </summary>
    public Guid? SubmissionId { get; set; }

    /// <summary>
    /// Gets or sets when the form was submitted (if applicable).
    /// </summary>
    public DateTime? SubmittedAt { get; set; }

    /// <summary>
    /// Gets or sets the time spent on the form (in seconds).
    /// </summary>
    public int? TimeSpentSeconds { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the visitor bounced (left without interacting).
    /// </summary>
    public bool Bounced { get; set; }

    /// <summary>
    /// Gets or sets the furthest field reached before abandoning.
    /// </summary>
    public string? FurthestFieldReached { get; set; }

    /// <summary>
    /// Gets or sets the percentage of form completed (0-100).
    /// </summary>
    public int? CompletionPercentage { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the form that was viewed.
    /// </summary>
    public Form Form { get; set; } = null!;

    /// <summary>
    /// Gets the collection of field interactions during this view.
    /// </summary>
    public ICollection<FieldInteraction> FieldInteractions { get; init; } = new List<FieldInteraction>();
}
