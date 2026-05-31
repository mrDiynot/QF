using System.Collections.ObjectModel;
using System.Text.Json;
using System.Text.RegularExpressions;

using Microsoft.Extensions.Logging;

namespace QualiFlow.Application.Features.Forms.Services;

/// <summary>
/// Implementation of form field validation service.
/// </summary>
public partial class FormFieldValidator : IFormFieldValidator
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly ILogger<FormFieldValidator> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="FormFieldValidator"/> class.
    /// </summary>
    /// <param name="logger">The logger instance.</param>
    public FormFieldValidator(ILogger<FormFieldValidator> logger)
    {
        _logger = logger;
    }

    /// <inheritdoc />
    public FormValidationResult Validate(string fieldsJson, string submittedDataJson)
    {
        var errors = new List<FormFieldError>();

        try
        {
            var fields = JsonSerializer.Deserialize<List<FormFieldDefinition>>(fieldsJson, JsonOptions) ?? [];
            var data = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(submittedDataJson, JsonOptions) ?? [];

            foreach (var field in fields)
            {
                var fieldErrors = ValidateField(field, data);
                errors.AddRange(fieldErrors);
            }
        }
        catch (JsonException ex)
        {
            LogJsonParseError(_logger, ex.Message);
            errors.Add(new FormFieldError
            {
                FieldName = "_form",
                Message = "Invalid form data format",
                Code = "INVALID_FORMAT"
            });
        }

        return new FormValidationResult { Errors = new Collection<FormFieldError>(errors) };
    }

    private static List<FormFieldError> ValidateField(FormFieldDefinition field, Dictionary<string, JsonElement> data)
    {
        var errors = new List<FormFieldError>();
        var hasValue = data.TryGetValue(field.LookupKey, out var value);
        var stringValue = GetStringValue(value);
        var isEmpty = string.IsNullOrWhiteSpace(stringValue);

        // Required validation
        if (field.Required && (!hasValue || isEmpty))
        {
            errors.Add(new FormFieldError
            {
                FieldName = field.Name,
                Message = $"{field.Label ?? field.Name} is required",
                Code = "REQUIRED"
            });
            return errors; // Skip other validations if required field is empty
        }

        if (isEmpty)
        {
            return errors; // Skip validations for optional empty fields
        }

        // Type-specific validation
        errors.AddRange(field.Type.ToUpperInvariant() switch
        {
            "EMAIL" => ValidateEmail(field, stringValue),
            "PHONE" or "TEL" => ValidatePhone(field, stringValue),
            "NUMBER" => ValidateNumber(field, stringValue),
            "URL" => ValidateUrl(field, stringValue),
            "DATE" => ValidateDate(field, stringValue),
            "SELECT" or "RADIO" => ValidateOption(field, stringValue),
            "CHECKBOX" => ValidateCheckbox(field, value),
            _ => ValidateText(field, stringValue)
        });

        return errors;
    }

    private static string GetStringValue(JsonElement element)
    {
        return element.ValueKind switch
        {
            JsonValueKind.String => element.GetString() ?? string.Empty,
            JsonValueKind.Number => element.GetRawText(),
            JsonValueKind.True => "true",
            JsonValueKind.False => "false",
            JsonValueKind.Null or JsonValueKind.Undefined => string.Empty,
            _ => element.GetRawText()
        };
    }

    private static List<FormFieldError> ValidateText(FormFieldDefinition field, string value)
    {
        var errors = new List<FormFieldError>();

        if (field.MinLength.HasValue && value.Length < field.MinLength.Value)
        {
            errors.Add(new FormFieldError
            {
                FieldName = field.Name,
                Message = $"{field.Label ?? field.Name} must be at least {field.MinLength} characters",
                Code = "MIN_LENGTH"
            });
        }

        if (field.MaxLength.HasValue && value.Length > field.MaxLength.Value)
        {
            errors.Add(new FormFieldError
            {
                FieldName = field.Name,
                Message = $"{field.Label ?? field.Name} must not exceed {field.MaxLength} characters",
                Code = "MAX_LENGTH"
            });
        }

        if (!string.IsNullOrEmpty(field.Pattern))
        {
            try
            {
                if (!Regex.IsMatch(value, field.Pattern, RegexOptions.None, TimeSpan.FromSeconds(1)))
                {
                    errors.Add(new FormFieldError
                    {
                        FieldName = field.Name,
                        Message = field.PatternMessage ?? $"{field.Label ?? field.Name} format is invalid",
                        Code = "PATTERN"
                    });
                }
            }
            catch (RegexParseException)
            {
                // Invalid regex pattern in form definition - skip validation
            }
        }

        return errors;
    }

    private static List<FormFieldError> ValidateEmail(FormFieldDefinition field, string value)
    {
        var errors = ValidateText(field, value);

        if (!EmailRegex().IsMatch(value))
        {
            errors.Add(new FormFieldError
            {
                FieldName = field.Name,
                Message = $"{field.Label ?? field.Name} must be a valid email address",
                Code = "INVALID_EMAIL"
            });
        }

        return errors;
    }

    private static List<FormFieldError> ValidatePhone(FormFieldDefinition field, string value)
    {
        var errors = ValidateText(field, value);

        if (!PhoneRegex().IsMatch(value))
        {
            errors.Add(new FormFieldError
            {
                FieldName = field.Name,
                Message = $"{field.Label ?? field.Name} must be a valid phone number",
                Code = "INVALID_PHONE"
            });
        }

        return errors;
    }

    private static List<FormFieldError> ValidateNumber(FormFieldDefinition field, string value)
    {
        var errors = new List<FormFieldError>();

        if (!double.TryParse(value, System.Globalization.CultureInfo.InvariantCulture, out var numValue))
        {
            errors.Add(new FormFieldError
            {
                FieldName = field.Name,
                Message = $"{field.Label ?? field.Name} must be a valid number",
                Code = "INVALID_NUMBER"
            });
            return errors;
        }

        if (field.Min.HasValue && numValue < field.Min.Value)
        {
            errors.Add(new FormFieldError
            {
                FieldName = field.Name,
                Message = $"{field.Label ?? field.Name} must be at least {field.Min}",
                Code = "MIN_VALUE"
            });
        }

        if (field.Max.HasValue && numValue > field.Max.Value)
        {
            errors.Add(new FormFieldError
            {
                FieldName = field.Name,
                Message = $"{field.Label ?? field.Name} must not exceed {field.Max}",
                Code = "MAX_VALUE"
            });
        }

        return errors;
    }

    private static List<FormFieldError> ValidateUrl(FormFieldDefinition field, string value)
    {
        var errors = ValidateText(field, value);

        if (!Uri.TryCreate(value, UriKind.Absolute, out var uri) ||
            (!string.Equals(uri.Scheme, Uri.UriSchemeHttp, StringComparison.OrdinalIgnoreCase) &&
             !string.Equals(uri.Scheme, Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase)))
        {
            errors.Add(new FormFieldError
            {
                FieldName = field.Name,
                Message = $"{field.Label ?? field.Name} must be a valid URL",
                Code = "INVALID_URL"
            });
        }

        return errors;
    }

    private static List<FormFieldError> ValidateDate(FormFieldDefinition field, string value)
    {
        var errors = new List<FormFieldError>();

        if (!DateTime.TryParse(value, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out _))
        {
            errors.Add(new FormFieldError
            {
                FieldName = field.Name,
                Message = $"{field.Label ?? field.Name} must be a valid date",
                Code = "INVALID_DATE"
            });
        }

        return errors;
    }

    private static List<FormFieldError> ValidateOption(FormFieldDefinition field, string value)
    {
        var errors = new List<FormFieldError>();

        if (field.Options != null && field.Options.Count > 0 &&
            !field.Options.Contains(value, StringComparer.OrdinalIgnoreCase))
        {
            errors.Add(new FormFieldError
            {
                FieldName = field.Name,
                Message = $"{field.Label ?? field.Name} must be one of the allowed options",
                Code = "INVALID_OPTION"
            });
        }

        return errors;
    }

    private static List<FormFieldError> ValidateCheckbox(FormFieldDefinition field, JsonElement value)
    {
        var errors = new List<FormFieldError>();

        // Checkbox can be boolean or array of selected values
        if (value.ValueKind == JsonValueKind.Array && field.Options != null)
        {
            foreach (var item in value.EnumerateArray())
            {
                var itemValue = item.GetString();
                if (itemValue != null && !field.Options.Contains(itemValue, StringComparer.OrdinalIgnoreCase))
                {
                    errors.Add(new FormFieldError
                    {
                        FieldName = field.Name,
                        Message = $"'{itemValue}' is not a valid option for {field.Label ?? field.Name}",
                        Code = "INVALID_OPTION"
                    });
                }
            }
        }

        return errors;
    }

    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.IgnoreCase, matchTimeoutMilliseconds: 1000)]
    private static partial Regex EmailRegex();

    [GeneratedRegex(@"^\+?[1-9]\d{1,14}$", RegexOptions.None, matchTimeoutMilliseconds: 1000)]
    private static partial Regex PhoneRegex();

    [LoggerMessage(Level = LogLevel.Warning, Message = "Failed to parse form field JSON: {Error}")]
    private static partial void LogJsonParseError(ILogger logger, string error);

    /// <summary>
    /// Represents a form field definition from JSON.
    /// This class is instantiated via JSON deserialization.
    /// </summary>
#pragma warning disable CA1812 // Avoid uninstantiated internal classes - instantiated via JSON deserialization
#pragma warning disable S3459 // Unassigned members - assigned via JSON deserialization
#pragma warning disable S1144 // Unused private types - used via JSON deserialization
    private sealed class FormFieldDefinition
    {
        /// <summary>Gets or sets the field ID (primary key for submitted data lookup).</summary>
        public string Id { get; set; } = string.Empty;

        /// <summary>Gets or sets the field name (fallback for legacy forms).</summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Gets the key to use for looking up submitted values.
        /// Prefers Id over Name for compatibility with frontend form builder.
        /// </summary>
        public string LookupKey => !string.IsNullOrEmpty(Id) ? Id : Name;

        /// <summary>Gets or sets the field type.</summary>
        public string Type { get; set; } = "text";

        /// <summary>Gets or sets the field label.</summary>
        public string? Label { get; set; }

        /// <summary>Gets or sets a value indicating whether the field is required.</summary>
        public bool Required { get; set; }

        /// <summary>Gets or sets the minimum length for text fields.</summary>
        public int? MinLength { get; set; }

        /// <summary>Gets or sets the maximum length for text fields.</summary>
        public int? MaxLength { get; set; }

        /// <summary>Gets or sets the minimum value for number fields.</summary>
        public double? Min { get; set; }

        /// <summary>Gets or sets the maximum value for number fields.</summary>
        public double? Max { get; set; }

        /// <summary>Gets or sets the regex pattern for validation.</summary>
        public string? Pattern { get; set; }

        /// <summary>Gets or sets the custom message for pattern validation failures.</summary>
        public string? PatternMessage { get; set; }

        /// <summary>Gets or sets the allowed options for select/radio/checkbox fields.</summary>
        public List<string>? Options { get; set; }
    }
#pragma warning restore S1144
#pragma warning restore S3459
#pragma warning restore CA1812
}
