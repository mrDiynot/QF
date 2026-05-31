using System.Text.Json;
using System.Text.RegularExpressions;

using Microsoft.Extensions.Logging;

using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Forms.DTOs;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Forms.Services;

/// <summary>
/// Service implementation for form business logic operations.
/// </summary>
public partial class FormService : IFormService
{
    private readonly IFormRepository _formRepository;
    private readonly IFormSubmissionRepository _submissionRepository;
    private readonly ILeadRepository _leadRepository;
    private readonly IFormFieldValidator _fieldValidator;
    private readonly INotificationService _notificationService;
    private readonly ILogger<FormService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="FormService"/> class.
    /// </summary>
    /// <param name="formRepository">The form repository.</param>
    /// <param name="submissionRepository">The form submission repository.</param>
    /// <param name="leadRepository">The lead repository.</param>
    /// <param name="fieldValidator">The form field validator.</param>
    /// <param name="notificationService">The in-app notification service.</param>
    /// <param name="logger">The logger instance.</param>
    public FormService(
        IFormRepository formRepository,
        IFormSubmissionRepository submissionRepository,
        ILeadRepository leadRepository,
        IFormFieldValidator fieldValidator,
        INotificationService notificationService,
        ILogger<FormService> logger)
    {
        _formRepository = formRepository;
        _submissionRepository = submissionRepository;
        _leadRepository = leadRepository;
        _fieldValidator = fieldValidator;
        _notificationService = notificationService;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<PagedFormResponse> GetFormsAsync(
        Guid businessId,
        int page = 1,
        int pageSize = 10,
        FormStatus? status = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        LogGettingForms(_logger, businessId, page, pageSize, status, isActive);

        var skip = (page - 1) * pageSize;
        var forms = await _formRepository.GetAllAsync(
            businessId, status, isActive, skip, pageSize, cancellationToken);
        var totalItems = await _formRepository.GetCountAsync(
            businessId, status, isActive, cancellationToken);

        return new PagedFormResponse
        {
            Items = forms.Select(MapToResponse).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems
        };
    }

    /// <inheritdoc />
    public async Task<FormResponse?> GetFormByIdAsync(
        Guid businessId,
        Guid formId,
        CancellationToken cancellationToken = default)
    {
        LogGettingFormById(_logger, formId, businessId);

        var form = await _formRepository.GetByIdAsync(businessId, formId, cancellationToken);
        return form == null ? null : MapToResponse(form);
    }

    /// <inheritdoc />
    public async Task<FormResponse?> GetFormBySlugAsync(
        Guid businessId,
        string slug,
        CancellationToken cancellationToken = default)
    {
        LogGettingFormBySlug(_logger, slug, businessId);

        var form = await _formRepository.GetBySlugAsync(businessId, slug, cancellationToken);
        return form == null ? null : MapToResponse(form);
    }

    /// <inheritdoc />
    public async Task<FormResponse> CreateFormAsync(
        Guid businessId,
        CreateFormRequest request,
        CancellationToken cancellationToken = default)
    {
        LogCreatingForm(_logger, request.Name, businessId);

        var slug = request.Slug ?? GenerateSlug(request.Name);

        // Ensure slug is unique
        if (await _formRepository.SlugExistsAsync(businessId, slug, null, cancellationToken))
        {
            slug = $"{slug}-{Guid.NewGuid().ToString()[..8]}";
        }

        var form = new Form
        {
            BusinessId = businessId,
            Name = request.Name,
            Description = request.Description,
            Fields = request.Fields,
            Styling = request.Styling,
            Status = FormStatus.Draft,
            IsActive = false,
            Slug = slug,
            ThankYouMessage = request.ThankYouMessage,
            RedirectUrl = request.RedirectUrl,
            NotifyOnSubmission = request.NotifyOnSubmission,
            NotificationEmails = request.NotificationEmails,
            CreatedAt = DateTime.UtcNow
        };

        var createdForm = await _formRepository.AddAsync(form, cancellationToken);
        LogFormCreated(_logger, createdForm.Id, businessId);

        return MapToResponse(createdForm);
    }

    /// <inheritdoc />
    public async Task<FormResponse?> UpdateFormAsync(
        Guid businessId,
        Guid formId,
        UpdateFormRequest request,
        CancellationToken cancellationToken = default)
    {
        LogUpdatingForm(_logger, formId, businessId);

        var form = await _formRepository.GetByIdAsync(businessId, formId, cancellationToken);
        if (form == null)
        {
            LogFormNotFound(_logger, formId, businessId);
            return null;
        }

        // Check slug uniqueness if being updated
        if (!string.IsNullOrEmpty(request.Slug) &&
            !string.Equals(request.Slug, form.Slug, StringComparison.Ordinal) &&
            await _formRepository.SlugExistsAsync(businessId, request.Slug, formId, cancellationToken))
        {
            throw new InvalidOperationException($"Slug '{request.Slug}' is already in use.");
        }

        ApplyFormUpdates(form, request);

        await _formRepository.UpdateAsync(form, cancellationToken);
        LogFormUpdated(_logger, formId, businessId);

        return MapToResponse(form);
    }

    /// <inheritdoc />
    public Task<bool> DeleteFormAsync(
        Guid businessId,
        Guid formId,
        CancellationToken cancellationToken = default)
    {
        LogDeletingForm(_logger, formId, businessId);
        return _formRepository.DeleteAsync(businessId, formId, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<FormResponse?> PublishFormAsync(
        Guid businessId,
        Guid formId,
        CancellationToken cancellationToken = default)
    {
        LogPublishingForm(_logger, formId, businessId);

        var form = await _formRepository.GetByIdAsync(businessId, formId, cancellationToken);
        if (form == null)
        {
            LogFormNotFound(_logger, formId, businessId);
            return null;
        }

        form.Status = FormStatus.Published;
        form.IsActive = true;
        await _formRepository.UpdateAsync(form, cancellationToken);

        LogFormPublished(_logger, formId, businessId);
        return MapToResponse(form);
    }

    /// <inheritdoc />
    public async Task<FormResponse?> ArchiveFormAsync(
        Guid businessId,
        Guid formId,
        CancellationToken cancellationToken = default)
    {
        LogArchivingForm(_logger, formId, businessId);

        var form = await _formRepository.GetByIdAsync(businessId, formId, cancellationToken);
        if (form == null)
        {
            LogFormNotFound(_logger, formId, businessId);
            return null;
        }

        form.Status = FormStatus.Archived;
        form.IsActive = false;
        await _formRepository.UpdateAsync(form, cancellationToken);

        LogFormArchived(_logger, formId, businessId);
        return MapToResponse(form);
    }

    /// <inheritdoc />
    public async Task<PagedFormSubmissionResponse> GetFormSubmissionsAsync(
        Guid businessId,
        Guid formId,
        int page = 1,
        int pageSize = 10,
        bool? isProcessed = null,
        CancellationToken cancellationToken = default)
    {
        LogGettingSubmissions(_logger, formId, businessId, page, pageSize);

        var skip = (page - 1) * pageSize;
        var submissions = await _submissionRepository.GetByFormIdAsync(
            businessId, formId, isProcessed, skip, pageSize, cancellationToken);
        var totalItems = await _submissionRepository.GetCountByFormIdAsync(
            businessId, formId, isProcessed, cancellationToken);

        return new PagedFormSubmissionResponse
        {
            Items = submissions.Select(MapToSubmissionResponse).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems
        };
    }

    /// <inheritdoc />
    public async Task<FormSubmissionResponse> CreateSubmissionAsync(
        Guid businessId,
        Guid formId,
        CreateFormSubmissionRequest request,
        CancellationToken cancellationToken = default)
    {
        LogCreatingSubmission(_logger, formId, businessId);

        // Verify form exists and is active
        var form = await _formRepository.GetByIdAsync(businessId, formId, cancellationToken);
        if (form == null)
        {
            throw new InvalidOperationException($"Form with ID {formId} not found.");
        }

        if (!form.IsActive || form.Status != FormStatus.Published)
        {
            throw new InvalidOperationException("Form is not accepting submissions.");
        }

        // Validate submitted data against form field definitions
        var validationResult = _fieldValidator.Validate(form.Fields, request.SubmittedData);
        if (!validationResult.IsValid)
        {
            var errorMessages = string.Join("; ", validationResult.Errors.Select(e => $"{e.FieldName}: {e.Message}"));
            throw new InvalidOperationException($"Validation failed: {errorMessages}");
        }

        // Extract contact info and create/find lead
        var contactInfo = ExtractContactInfoFromJson(request.SubmittedData);
        var lead = await FindOrCreateLeadAsync(businessId, contactInfo, form.Name, cancellationToken);

        var submission = new FormSubmission
        {
            BusinessId = businessId,
            FormId = formId,
            LeadId = lead?.Id, // Link submission to lead
            SubmittedData = request.SubmittedData,
            IpAddress = request.IpAddress,
            UserAgent = request.UserAgent,
            ReferrerUrl = request.ReferrerUrl,
            SubmittedAt = DateTime.UtcNow,
            IsProcessed = lead != null, // Mark as processed if lead was created
            ProcessedAt = lead != null ? DateTime.UtcNow : null,
            CreatedAt = DateTime.UtcNow
        };

        var createdSubmission = await _submissionRepository.AddAsync(submission, cancellationToken);
        LogSubmissionCreated(_logger, createdSubmission.Id, formId, businessId);

        if (lead != null)
        {
            LogLeadCreatedFromSubmission(_logger, lead.Id, createdSubmission.Id, formId);
        }

        // Send in-app notification for form submission (if enabled)
        if (form.NotifyOnSubmission)
        {
            try
            {
                // Extract submitter name from submitted data (common field names)
                var submitterName = ExtractSubmitterNameFromJson(request.SubmittedData);

                await _notificationService.NotifyFormSubmissionAsync(
                    businessId,
                    formId,
                    form.Name,
                    submitterName,
                    lead?.Id, // Include lead ID in notification
                    cancellationToken);
            }
            catch (Exception ex)
            {
                LogNotificationFailed(_logger, ex, createdSubmission.Id, formId);
            }
        }

        return MapToSubmissionResponse(createdSubmission);
    }

    /// <summary>
    /// Finds an existing lead or creates a new one from form submission data.
    /// </summary>
    private async Task<Lead?> FindOrCreateLeadAsync(
        Guid businessId,
        FormContactInfo contactInfo,
        string formName,
        CancellationToken cancellationToken)
    {
        // Need at least email or phone to create a lead
        if (string.IsNullOrWhiteSpace(contactInfo.Email) && string.IsNullOrWhiteSpace(contactInfo.Phone))
        {
            LogNoContactInfoForLead(_logger, businessId);
            return null;
        }

        // Try to find existing lead by email first
        Lead? existingLead = null;
        if (!string.IsNullOrWhiteSpace(contactInfo.Email))
        {
            existingLead = await _leadRepository.GetByEmailForBusinessAsync(
                businessId, contactInfo.Email, cancellationToken);
        }

        // If not found by email, try by phone
        if (existingLead == null && !string.IsNullOrWhiteSpace(contactInfo.Phone))
        {
            existingLead = await _leadRepository.GetByPhoneNumberAsync(
                businessId, contactInfo.Phone, cancellationToken);
        }

        if (existingLead != null)
        {
            LogExistingLeadFound(_logger, existingLead.Id, businessId);
            return existingLead;
        }

        // Create new lead
        var newLead = new Lead
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            Name = contactInfo.Name ?? $"Lead from {formName}",
            Email = contactInfo.Email ?? string.Empty,
            Phone = contactInfo.Phone ?? string.Empty,
            Status = LeadStatus.New,
            Score = 0,
            SourceChannel = "Form",
            Metadata = BuildLeadMetadata(formName, contactInfo.Company),
            CreatedAt = DateTime.UtcNow,
        };

        var createdLead = await _leadRepository.AddForBusinessAsync(newLead, cancellationToken);
        LogLeadCreated(_logger, createdLead.Id, businessId, contactInfo.Email ?? contactInfo.Phone ?? "unknown");

        // Send notification for new lead
        try
        {
            await _notificationService.NotifyNewLeadAsync(
                businessId,
                createdLead.Id,
                createdLead.Name,
                "Form",
                cancellationToken);
        }
        catch (Exception ex)
        {
            LogNewLeadNotificationFailed(_logger, ex, createdLead.Id);
        }

        return createdLead;
    }

    /// <summary>
    /// Builds JSON metadata for the lead from form submission data.
    /// </summary>
    private static string? BuildLeadMetadata(string formName, string? company)
    {
        var metadata = new Dictionary<string, object>
        {
            ["source_form"] = formName,
            ["submitted_at"] = DateTime.UtcNow.ToString("O"),
        };

        if (!string.IsNullOrWhiteSpace(company))
        {
            metadata["company"] = company;
        }

        return JsonSerializer.Serialize(metadata);
    }

    /// <summary>
    /// Extracts contact information from submitted JSON data.
    /// </summary>
    private static FormContactInfo ExtractContactInfoFromJson(string submittedDataJson)
    {
        string? name = null;
        string? email = null;
        string? phone = null;
        string? company = null;

        try
        {
            using var doc = JsonDocument.Parse(submittedDataJson);
            var root = doc.RootElement;

            // Extract email (most important for deduplication)
            var emailFields = new[] { "email", "Email", "EMAIL", "e-mail", "emailAddress", "email_address" };
            foreach (var field in emailFields)
            {
                if (TryGetStringProperty(root, field, out var value) && IsValidEmail(value))
                {
                    email = value;
                    break;
                }
            }

            // Also check all properties for email type fields
            if (email == null)
            {
                email = root.EnumerateObject()
                    .Where(prop => prop.Value.ValueKind == JsonValueKind.String)
                    .Select(prop => prop.Value.GetString())
                    .FirstOrDefault(value => value != null && IsValidEmail(value));
            }

            // Extract phone
            var phoneFields = new[] { "phone", "Phone", "PHONE", "telephone", "tel", "phoneNumber", "phone_number", "mobile" };
            foreach (var field in phoneFields)
            {
                if (TryGetStringProperty(root, field, out var value) && !string.IsNullOrWhiteSpace(value))
                {
                    phone = NormalizePhoneNumber(value);
                    break;
                }
            }

            // Extract name
            var nameFields = new[] { "name", "Name", "NAME", "fullName", "full_name", "fullname" };
            foreach (var field in nameFields)
            {
                if (TryGetStringProperty(root, field, out var value) && !string.IsNullOrWhiteSpace(value))
                {
                    name = value;
                    break;
                }
            }

            // If no full name, try first + last name
            if (name == null)
            {
                string? firstName = null;
                string? lastName = null;

                var firstNameFields = new[] { "firstName", "first_name", "firstname", "FirstName" };
                foreach (var field in firstNameFields)
                {
                    if (TryGetStringProperty(root, field, out var value) && !string.IsNullOrWhiteSpace(value))
                    {
                        firstName = value;
                        break;
                    }
                }

                var lastNameFields = new[] { "lastName", "last_name", "lastname", "LastName" };
                foreach (var field in lastNameFields)
                {
                    if (TryGetStringProperty(root, field, out var value) && !string.IsNullOrWhiteSpace(value))
                    {
                        lastName = value;
                        break;
                    }
                }

                if (!string.IsNullOrWhiteSpace(firstName) || !string.IsNullOrWhiteSpace(lastName))
                {
                    name = $"{firstName} {lastName}".Trim();
                }
            }

            // Extract company
            var companyFields = new[] { "company", "Company", "COMPANY", "organization", "business", "companyName", "company_name" };
            foreach (var field in companyFields)
            {
                if (TryGetStringProperty(root, field, out var value) && !string.IsNullOrWhiteSpace(value))
                {
                    company = value;
                    break;
                }
            }
        }
        catch
        {
            // If JSON parsing fails, return empty contact info
        }

        return new FormContactInfo(name, email, phone, company);
    }

    private static bool TryGetStringProperty(JsonElement element, string propertyName, out string value)
    {
        value = string.Empty;
        if (element.TryGetProperty(propertyName, out var prop) &&
            prop.ValueKind == JsonValueKind.String)
        {
            value = prop.GetString() ?? string.Empty;
            return !string.IsNullOrWhiteSpace(value);
        }

        return false;
    }

    private static bool IsValidEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return false;
        }

        // Basic email validation
        return email.Contains('@', StringComparison.Ordinal) &&
               email.Contains('.', StringComparison.Ordinal) &&
               email.Length >= 5;
    }

    private static string NormalizePhoneNumber(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
        {
            return phoneNumber;
        }

        // Remove all non-numeric characters except the leading +
        var normalized = phoneNumber.Trim();
        if (normalized.StartsWith('+'))
        {
            return "+" + new string(normalized.Skip(1).Where(char.IsDigit).ToArray());
        }

        return new string(normalized.Where(char.IsDigit).ToArray());
    }

    private static string ExtractSubmitterNameFromJson(string submittedDataJson)
    {
        try
        {
            using var doc = System.Text.Json.JsonDocument.Parse(submittedDataJson);
            var root = doc.RootElement;

            // Try common field names for name
            var nameFields = new[] { "name", "fullName", "full_name", "firstName", "first_name" };

            foreach (var field in nameFields)
            {
                if (root.TryGetProperty(field, out var prop) &&
                    prop.ValueKind == System.Text.Json.JsonValueKind.String)
                {
                    var name = prop.GetString();
                    if (!string.IsNullOrWhiteSpace(name))
                    {
                        return name;
                    }
                }
            }

            // Fall back to email if available
            if (root.TryGetProperty("email", out var emailProp) &&
                emailProp.ValueKind == System.Text.Json.JsonValueKind.String)
            {
                var email = emailProp.GetString();
                if (!string.IsNullOrWhiteSpace(email))
                {
                    return email;
                }
            }
        }
        catch
        {
            // If JSON parsing fails, return default
        }

        return "Anonymous Visitor";
    }

    /// <inheritdoc />
    public Task<bool> MarkSubmissionAsProcessedAsync(
        Guid businessId,
        Guid submissionId,
        CancellationToken cancellationToken = default)
    {
        LogMarkingSubmissionProcessed(_logger, submissionId, businessId);
        return _submissionRepository.MarkAsProcessedAsync(businessId, submissionId, cancellationToken);
    }

    private static FormResponse MapToResponse(Form form)
    {
        return new FormResponse
        {
            Id = form.Id,
            BusinessId = form.BusinessId,
            Name = form.Name,
            Description = form.Description,
            Fields = form.Fields,
            Styling = form.Styling,
            Status = form.Status,
            IsActive = form.IsActive,
            Slug = form.Slug ?? string.Empty,
            ThankYouMessage = form.ThankYouMessage,
            RedirectUrl = form.RedirectUrl,
            NotifyOnSubmission = form.NotifyOnSubmission,
            NotificationEmails = form.NotificationEmails,
            SubmissionCount = form.Submissions?.Count ?? 0,
            CreatedAt = form.CreatedAt,
            UpdatedAt = form.UpdatedAt
        };
    }

    private static FormSubmissionResponse MapToSubmissionResponse(FormSubmission submission)
    {
        return new FormSubmissionResponse
        {
            Id = submission.Id,
            BusinessId = submission.BusinessId,
            FormId = submission.FormId,
            FormName = submission.Form?.Name,
            LeadId = submission.LeadId,
            LeadName = submission.Lead?.Name,
            SubmittedData = submission.SubmittedData,
            IpAddress = submission.IpAddress,
            UserAgent = submission.UserAgent,
            ReferrerUrl = submission.ReferrerUrl,
            SubmittedAt = submission.SubmittedAt,
            IsProcessed = submission.IsProcessed,
            ProcessedAt = submission.ProcessedAt
        };
    }

    private static void ApplyFormUpdates(Form form, UpdateFormRequest request)
    {
        if (request.Name != null)
        {
            form.Name = request.Name;
        }

        if (request.Description != null)
        {
            form.Description = request.Description;
        }

        if (request.Fields != null)
        {
            form.Fields = request.Fields;
        }

        if (request.Styling != null)
        {
            form.Styling = request.Styling;
        }

        if (request.Status.HasValue)
        {
            form.Status = request.Status.Value;
        }

        if (request.IsActive.HasValue)
        {
            form.IsActive = request.IsActive.Value;
        }

        if (request.Slug != null)
        {
            form.Slug = request.Slug;
        }

        if (request.ThankYouMessage != null)
        {
            form.ThankYouMessage = request.ThankYouMessage;
        }

        if (request.RedirectUrl != null)
        {
            form.RedirectUrl = request.RedirectUrl;
        }

        if (request.NotifyOnSubmission.HasValue)
        {
            form.NotifyOnSubmission = request.NotifyOnSubmission.Value;
        }

        if (request.NotificationEmails != null)
        {
            form.NotificationEmails = request.NotificationEmails;
        }
    }

    private static string GenerateSlug(string name)
    {
        // Convert to lowercase for URL-friendly slug
#pragma warning disable CA1308 // Normalize strings to uppercase - slugs must be lowercase
        var slug = name.ToLowerInvariant();
#pragma warning restore CA1308

        slug = SlugRegex().Replace(slug, "-");
        slug = MultiDashRegex().Replace(slug, "-");
        return slug.Trim('-');
    }

    [GeneratedRegex(@"[^a-z0-9\-]", RegexOptions.None, matchTimeoutMilliseconds: 1000)]
    private static partial Regex SlugRegex();

    [GeneratedRegex(@"-+", RegexOptions.None, matchTimeoutMilliseconds: 1000)]
    private static partial Regex MultiDashRegex();

    /// <summary>
    /// Contact information extracted from form submission.
    /// </summary>
    /// <param name="Name">The contact's name.</param>
    /// <param name="Email">The contact's email address.</param>
    /// <param name="Phone">The contact's phone number.</param>
    /// <param name="Company">The contact's company name.</param>
    private sealed record FormContactInfo(
        string? Name,
        string? Email,
        string? Phone,
        string? Company);
}

