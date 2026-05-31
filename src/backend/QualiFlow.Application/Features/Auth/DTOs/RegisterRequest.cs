namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// Request DTO for user registration with automatic business creation.
/// </summary>
public class RegisterRequest
{
    /// <summary>
    /// Gets or sets the user's email address.
    /// This will be used as the username and for verification.
    /// </summary>
    /// <example>john.doe@example.com.</example>
    public required string Email { get; set; }

    /// <summary>
    /// Gets or sets the user's password.
    /// Must meet OWASP ASVS Level 2 requirements:
    /// At least 8 characters,
    /// at least one uppercase letter,
    /// at least one lowercase letter,
    /// at least one digit,
    /// at least one special character.
    /// </summary>
    /// <example>SecureP@ssw0rd!.</example>
    public required string Password { get; set; }

    /// <summary>
    /// Gets or sets the password confirmation.
    /// Must match the Password field.
    /// </summary>
    /// <example>SecureP@ssw0rd!.</example>
    public required string ConfirmPassword { get; set; }

    /// <summary>
    /// Gets or sets the user's first name.
    /// </summary>
    /// <example>John.</example>
    public required string FirstName { get; set; }

    /// <summary>
    /// Gets or sets the user's last name.
    /// </summary>
    /// <example>Doe.</example>
    public required string LastName { get; set; }

    /// <summary>
    /// Gets or sets the business name.
    /// A new business (tenant) will be created with this name.
    /// </summary>
    /// <example>Acme Corporation.</example>
    public required string BusinessName { get; set; }

    /// <summary>
    /// Gets or sets the user's phone number (required).
    /// Must be in E.164 format (e.g., +1234567890).
    /// </summary>
    /// <example>+1234567890.</example>
    public required string PhoneNumber { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the user accepts the Terms of Service.
    /// Must be true to complete registration.
    /// </summary>
    /// <example>true.</example>
    public required bool AcceptTerms { get; set; }

    /// <summary>
    /// Gets or sets the selected subscription plan name.
    /// Optional - defaults to FreeFlow if not provided.
    /// Valid values: freeflow, smartflow, ultraflow, enterprise.
    /// </summary>
    /// <example>smartflow.</example>
    public string? SelectedPlan { get; set; }
}

