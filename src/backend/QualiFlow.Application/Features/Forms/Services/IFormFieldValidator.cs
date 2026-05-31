namespace QualiFlow.Application.Features.Forms.Services;

/// <summary>
/// Service for validating form submission data against form field definitions.
/// Supports text, email, phone, number, select, checkbox, radio, textarea, date, and url field types.
/// </summary>
public interface IFormFieldValidator
{
    /// <summary>
    /// Validates submitted data against the form's field definitions.
    /// </summary>
    /// <param name="fieldsJson">JSON array of form field definitions.</param>
    /// <param name="submittedDataJson">JSON object of submitted data.</param>
    /// <returns>Validation result with any errors.</returns>
    FormValidationResult Validate(string fieldsJson, string submittedDataJson);
}

