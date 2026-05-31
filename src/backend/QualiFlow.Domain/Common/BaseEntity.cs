namespace QualiFlow.Domain.Common;

/// <summary>
/// Base entity class for all domain entities.
/// Provides common properties for auditing and soft delete.
/// </summary>
public abstract class BaseEntity
{
    /// <summary>
    /// Gets or sets the unique identifier for the entity.
    /// </summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Gets or sets the date and time when the entity was created (UTC).
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets the date and time when the entity was last updated (UTC).
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the entity was soft deleted (UTC).
    /// Null indicates the entity is not deleted.
    /// </summary>
    public DateTime? DeletedAt { get; set; }

    /// <summary>
    /// Gets a value indicating whether the entity is soft deleted.
    /// </summary>
    public bool IsDeleted => this.DeletedAt.HasValue;
}


