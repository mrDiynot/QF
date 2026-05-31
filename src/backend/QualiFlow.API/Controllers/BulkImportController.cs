// -----------------------------------------------------------------------
// <copyright file="BulkImportController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using System.Globalization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Authorization;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for bulk import operations (CSV).
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/bulk-import")]
[Authorize(AuthenticationSchemes = "Bearer")]
[Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
[Produces("application/json")]
public class BulkImportController : ControllerBase
{
    private readonly QualiFlowDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<BulkImportController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="BulkImportController"/> class.
    /// </summary>
    public BulkImportController(
        QualiFlowDbContext context,
        ICurrentUserService currentUserService,
        ILogger<BulkImportController> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Imports leads from a CSV file.
    /// </summary>
    /// <param name="file">CSV file to import.</param>
    /// <param name="skipDuplicates">Whether to skip duplicate entries (ignored if updateExisting is true).</param>
    /// <param name="updateExisting">Whether to update existing entries instead of skipping.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Import result.</returns>
    [HttpPost("leads")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(BulkImportResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10MB limit
    public async Task<ActionResult<BulkImportResult>> ImportLeadsAsync(
        IFormFile file,
        [FromQuery] bool skipDuplicates = true,
        [FromQuery] bool updateExisting = false,
        CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded" });
        }

        if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "Only CSV files are supported" });
        }

        var businessId = _currentUserService.GetBusinessId();
        _logger.LogInformation(
            "Starting lead import from CSV for business {BusinessId} (updateExisting={UpdateExisting})",
            businessId, updateExisting);

        var result = new BulkImportResult
        {
            EntityType = "leads",
            StartedAt = DateTime.UtcNow,
        };

        var errors = new List<ImportError>();
        var importedLeads = new List<Lead>();

        // Track identifiers already processed within this file to detect within-file duplicates
        var processedEmails = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var processedPhones = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        using var reader = new StreamReader(file.OpenReadStream());
        var headerLine = await reader.ReadLineAsync(cancellationToken);

        if (string.IsNullOrEmpty(headerLine))
        {
            return BadRequest(new { message = "CSV file is empty" });
        }

        var headers = ParseCsvLine(headerLine);
        var headerMap = CreateHeaderMap(headers);

        var lineNumber = 1;
        while (!reader.EndOfStream)
        {
            lineNumber++;
            var line = await reader.ReadLineAsync(cancellationToken);

            if (string.IsNullOrWhiteSpace(line))
            {
                continue;
            }

            try
            {
                var values = ParseCsvLine(line);
                var csvLead = CreateLeadFromCsvRow(businessId, headerMap, values);

                var hasEmail = !string.IsNullOrEmpty(csvLead.Email);
                var hasPhone = !string.IsNullOrEmpty(csvLead.Phone);

                // Check for within-file duplicates first
                if (hasEmail && processedEmails.Contains(csvLead.Email))
                {
                    result.SkippedCount++;
                    errors.Add(new ImportError { Row = lineNumber, Field = "email", Message = $"Duplicate email in file: {csvLead.Email}" });
                    continue;
                }

                if (!hasEmail && hasPhone && processedPhones.Contains(csvLead.Phone!))
                {
                    result.SkippedCount++;
                    errors.Add(new ImportError { Row = lineNumber, Field = "phone", Message = $"Duplicate phone in file: {csvLead.Phone}" });
                    continue;
                }

                // Check for existing lead in database by email OR phone (fallback)
                Lead? existingLead = null;

                if (hasEmail)
                {
                    existingLead = await _context.Leads
                        .FirstOrDefaultAsync(l => l.BusinessId == businessId && l.Email == csvLead.Email && l.DeletedAt == null, cancellationToken);
                }
                else if (hasPhone)
                {
                    // Fallback: check by phone when email is empty
                    existingLead = await _context.Leads
                        .FirstOrDefaultAsync(l => l.BusinessId == businessId && l.Phone == csvLead.Phone && l.DeletedAt == null, cancellationToken);
                }

                if (existingLead != null)
                {
                    if (updateExisting)
                    {
                        // Update existing lead with new data
                        UpdateLeadFromCsv(existingLead, headerMap, values);
                        existingLead.UpdatedAt = DateTime.UtcNow;
                        result.UpdatedCount++;
                    }
                    else if (skipDuplicates)
                    {
                        result.SkippedCount++;
                        var field = hasEmail ? "email" : "phone";
                        var value = hasEmail ? csvLead.Email : csvLead.Phone;
                        errors.Add(new ImportError { Row = lineNumber, Field = field, Message = $"Duplicate {field}: {value}" });
                    }
                    else
                    {
                        // Allow duplicates - add as new
                        importedLeads.Add(csvLead);
                        result.SuccessCount++;
                    }

                    // Track as processed
                    if (hasEmail)
                    {
                        processedEmails.Add(csvLead.Email);
                    }

                    if (hasPhone)
                    {
                        processedPhones.Add(csvLead.Phone!);
                    }

                    continue;
                }

                // Track as processed before adding
                if (hasEmail)
                {
                    processedEmails.Add(csvLead.Email!);
                }

                if (hasPhone)
                {
                    processedPhones.Add(csvLead.Phone!);
                }

                importedLeads.Add(csvLead);
                result.SuccessCount++;
            }
            catch (Exception ex)
            {
                result.FailedCount++;
                errors.Add(new ImportError { Row = lineNumber, Field = "row", Message = ex.Message });
            }
        }

        if (importedLeads.Count > 0)
        {
            await _context.Leads.AddRangeAsync(importedLeads, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);

        result.TotalRows = lineNumber - 1;
        result.CompletedAt = DateTime.UtcNow;
        result.Errors = errors.Take(100).ToList(); // Limit errors returned

        _logger.LogInformation(
            "Lead import completed for business {BusinessId}: {Success} imported, {Updated} updated, {Skipped} skipped, {Failed} failed",
            businessId, result.SuccessCount, result.UpdatedCount, result.SkippedCount, result.FailedCount);

        return Ok(result);
    }

    /// <summary>
    /// Imports contacts from a CSV file.
    /// </summary>
    /// <param name="file">CSV file to import.</param>
    /// <param name="skipDuplicates">Whether to skip duplicate entries (ignored if updateExisting is true).</param>
    /// <param name="updateExisting">Whether to update existing entries instead of skipping.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Import result.</returns>
    [HttpPost("contacts")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(BulkImportResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<ActionResult<BulkImportResult>> ImportContactsAsync(
        IFormFile file,
        [FromQuery] bool skipDuplicates = true,
        [FromQuery] bool updateExisting = false,
        CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded" });
        }

        var businessId = _currentUserService.GetBusinessId();
        _logger.LogInformation(
            "Starting contact import from CSV for business {BusinessId} (updateExisting={UpdateExisting})",
            businessId, updateExisting);

        var result = new BulkImportResult
        {
            EntityType = "contacts",
            StartedAt = DateTime.UtcNow,
        };

        var errors = new List<ImportError>();
        var importedContacts = new List<Contact>();

        // Track identifiers already processed within this file to detect within-file duplicates
        var processedEmails = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var processedPhones = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        using var reader = new StreamReader(file.OpenReadStream());
        var headerLine = await reader.ReadLineAsync(cancellationToken);

        if (string.IsNullOrEmpty(headerLine))
        {
            return BadRequest(new { message = "CSV file is empty" });
        }

        var headers = ParseCsvLine(headerLine);
        var headerMap = CreateHeaderMap(headers);

        var lineNumber = 1;
        while (!reader.EndOfStream)
        {
            lineNumber++;
            var line = await reader.ReadLineAsync(cancellationToken);

            if (string.IsNullOrWhiteSpace(line))
            {
                continue;
            }

            try
            {
                var values = ParseCsvLine(line);
                var csvContact = CreateContactFromCsvRow(businessId, headerMap, values);

                var hasEmail = !string.IsNullOrEmpty(csvContact.Email);
                var hasPhone = !string.IsNullOrEmpty(csvContact.PhoneNumber);

                // Check for within-file duplicates first
                if (hasEmail && processedEmails.Contains(csvContact.Email))
                {
                    result.SkippedCount++;
                    errors.Add(new ImportError { Row = lineNumber, Field = "email", Message = $"Duplicate email in file: {csvContact.Email}" });
                    continue;
                }

                if (!hasEmail && hasPhone && processedPhones.Contains(csvContact.PhoneNumber!))
                {
                    result.SkippedCount++;
                    errors.Add(new ImportError { Row = lineNumber, Field = "phone", Message = $"Duplicate phone in file: {csvContact.PhoneNumber}" });
                    continue;
                }

                // Check for existing contact in database by email OR phone (fallback)
                Contact? existingContact = null;

                if (hasEmail)
                {
                    existingContact = await _context.Contacts
                        .FirstOrDefaultAsync(c => c.BusinessId == businessId && c.Email == csvContact.Email && c.DeletedAt == null, cancellationToken);
                }
                else if (hasPhone)
                {
                    // Fallback: check by phone when email is empty
                    existingContact = await _context.Contacts
                        .FirstOrDefaultAsync(c => c.BusinessId == businessId && c.PhoneNumber == csvContact.PhoneNumber && c.DeletedAt == null, cancellationToken);
                }

                if (existingContact != null)
                {
                    if (updateExisting)
                    {
                        // Update existing contact with new data
                        UpdateContactFromCsv(existingContact, headerMap, values);
                        existingContact.UpdatedAt = DateTime.UtcNow;
                        result.UpdatedCount++;
                    }
                    else if (skipDuplicates)
                    {
                        result.SkippedCount++;
                        var field = hasEmail ? "email" : "phone";
                        var value = hasEmail ? csvContact.Email : csvContact.PhoneNumber;
                        errors.Add(new ImportError { Row = lineNumber, Field = field, Message = $"Duplicate {field}: {value}" });
                    }
                    else
                    {
                        // Allow duplicates - add as new
                        importedContacts.Add(csvContact);
                        result.SuccessCount++;
                    }

                    // Track as processed
                    if (hasEmail)
                    {
                        processedEmails.Add(csvContact.Email);
                    }

                    if (hasPhone)
                    {
                        processedPhones.Add(csvContact.PhoneNumber!);
                    }

                    continue;
                }

                // Track as processed before adding
                if (hasEmail)
                {
                    processedEmails.Add(csvContact.Email!);
                }

                if (hasPhone)
                {
                    processedPhones.Add(csvContact.PhoneNumber!);
                }

                importedContacts.Add(csvContact);
                result.SuccessCount++;
            }
            catch (Exception ex)
            {
                result.FailedCount++;
                errors.Add(new ImportError { Row = lineNumber, Field = "row", Message = ex.Message });
            }
        }

        if (importedContacts.Count > 0)
        {
            await _context.Contacts.AddRangeAsync(importedContacts, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);

        result.TotalRows = lineNumber - 1;
        result.CompletedAt = DateTime.UtcNow;
        result.Errors = errors.Take(100).ToList();

        _logger.LogInformation(
            "Contact import completed for business {BusinessId}: {Success} imported, {Updated} updated, {Skipped} skipped, {Failed} failed",
            businessId, result.SuccessCount, result.UpdatedCount, result.SkippedCount, result.FailedCount);

        return Ok(result);
    }

    /// <summary>
    /// Gets a sample CSV template for lead import.
    /// </summary>
    /// <returns>CSV template file.</returns>
    [HttpGet("templates/leads")]
    [Produces("text/csv")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public IActionResult GetLeadTemplate()
    {
        var template = "first_name,last_name,email,phone,company,job_title,source,score,notes\n" +
                       "John,Doe,john.doe@example.com,+1234567890,Acme Corp,CEO,website,75,Interested in premium plan\n" +
                       "Jane,Smith,jane.smith@example.com,+0987654321,Tech Inc,CTO,referral,85,Hot lead from conference";

        return File(System.Text.Encoding.UTF8.GetBytes(template), "text/csv", "lead-import-template.csv");
    }

    /// <summary>
    /// Gets a sample CSV template for contact import.
    /// </summary>
    /// <returns>CSV template file.</returns>
    [HttpGet("templates/contacts")]
    [Produces("text/csv")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public IActionResult GetContactTemplate()
    {
        var template = "first_name,last_name,email,phone,company,address,city,state,country,notes\n" +
                       "John,Doe,john.doe@example.com,+1234567890,Acme Corp,123 Main St,New York,NY,USA,VIP customer\n" +
                       "Jane,Smith,jane.smith@example.com,+0987654321,Tech Inc,456 Oak Ave,San Francisco,CA,USA,Enterprise account";

        return File(System.Text.Encoding.UTF8.GetBytes(template), "text/csv", "contact-import-template.csv");
    }

    /// <summary>
    /// Validates a CSV file before import.
    /// </summary>
    /// <param name="file">CSV file to validate.</param>
    /// <param name="entityType">Entity type (leads or contacts).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Validation result.</returns>
    [HttpPost("validate")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(CsvValidationResult), StatusCodes.Status200OK)]
    public async Task<ActionResult<CsvValidationResult>> ValidateCsvAsync(
        IFormFile file,
        [FromQuery] string entityType = "leads",
        CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded" });
        }

        var result = new CsvValidationResult
        {
            FileName = file.FileName,
            FileSize = file.Length,
        };

        using var reader = new StreamReader(file.OpenReadStream());
        var headerLine = await reader.ReadLineAsync(cancellationToken);

        if (string.IsNullOrEmpty(headerLine))
        {
            result.IsValid = false;
            result.Errors.Add("CSV file is empty");
            return Ok(result);
        }

        var headers = ParseCsvLine(headerLine);
        result.DetectedColumns = headers;
        result.TotalRows = 0;

        // Count rows
        while (!reader.EndOfStream)
        {
            var line = await reader.ReadLineAsync(cancellationToken);
            if (!string.IsNullOrWhiteSpace(line))
            {
                result.TotalRows++;
            }
        }

        // Validate required columns
        var requiredColumns = new[] { "email" };

        foreach (var required in requiredColumns)
        {
            if (!headers.Exists(h => h.Equals(required, StringComparison.OrdinalIgnoreCase)))
            {
                result.Warnings.Add($"Recommended column '{required}' not found");
            }
        }

        result.IsValid = result.Errors.Count == 0;
        result.ValidRows = result.TotalRows; // All non-empty rows are valid at this stage

        return Ok(result);
    }

    // ============================================================================
    // PRIVATE HELPERS
    // ============================================================================

    private static List<string> ParseCsvLine(string line)
    {
        var result = new List<string>();
        var inQuotes = false;
        var currentValue = new System.Text.StringBuilder();

        foreach (var c in line)
        {
            if (c == '"')
            {
                inQuotes = !inQuotes;
            }
            else if (c == ',' && !inQuotes)
            {
                result.Add(currentValue.ToString().Trim());
                currentValue.Clear();
            }
            else
            {
                currentValue.Append(c);
            }
        }

        result.Add(currentValue.ToString().Trim());
        return result;
    }

    private static Dictionary<string, int> CreateHeaderMap(List<string> headers)
    {
        var map = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        for (var i = 0; i < headers.Count; i++)
        {
            var header = headers[i].Trim().ToLowerInvariant().Replace(" ", "_", StringComparison.Ordinal);
            map[header] = i;
        }

        return map;
    }

    private static Lead CreateLeadFromCsvRow(Guid businessId, Dictionary<string, int> headerMap, List<string> values)
    {
        // Support both "name" (full name) and "first_name"/"last_name" columns
        var fullNameFromColumn = GetValue(headerMap, values, "name") ?? GetValue(headerMap, values, "full_name") ?? GetValue(headerMap, values, "fullname");
        string fullName;

        if (!string.IsNullOrEmpty(fullNameFromColumn))
        {
            // Use the full name column directly
            fullName = fullNameFromColumn;
        }
        else
        {
            // Fall back to first_name + last_name
            var firstName = GetValue(headerMap, values, "first_name") ?? GetValue(headerMap, values, "firstname") ?? "Unknown";
            var lastName = GetValue(headerMap, values, "last_name") ?? GetValue(headerMap, values, "lastname") ?? string.Empty;
            fullName = string.IsNullOrEmpty(lastName) ? firstName : $"{firstName} {lastName}";
        }

        var lead = new Lead
        {
            BusinessId = businessId,
            Name = fullName,
            Email = GetValue(headerMap, values, "email") ?? string.Empty,
            Phone = GetValue(headerMap, values, "phone") ?? GetValue(headerMap, values, "phone_number"),
            SourceChannel = GetValue(headerMap, values, "source") ?? "csv_import",
            Status = LeadStatus.New,
        };

        // Parse score
        var scoreStr = GetValue(headerMap, values, "score");
        if (!string.IsNullOrEmpty(scoreStr) && int.TryParse(scoreStr, CultureInfo.InvariantCulture, out var score))
        {
            lead.Score = Math.Clamp(score, 0, 100);
        }

        return lead;
    }

    private static Contact CreateContactFromCsvRow(Guid businessId, Dictionary<string, int> headerMap, List<string> values)
    {
        return new Contact
        {
            BusinessId = businessId,
            FirstName = GetValue(headerMap, values, "first_name") ?? GetValue(headerMap, values, "firstname") ?? "Unknown",
            LastName = GetValue(headerMap, values, "last_name") ?? GetValue(headerMap, values, "lastname") ?? string.Empty,
            Email = GetValue(headerMap, values, "email") ?? string.Empty,
            PhoneNumber = GetValue(headerMap, values, "phone") ?? GetValue(headerMap, values, "phone_number"),
            Company = GetValue(headerMap, values, "company") ?? GetValue(headerMap, values, "company_name"),
            JobTitle = GetValue(headerMap, values, "job_title") ?? GetValue(headerMap, values, "title"),
            Notes = GetValue(headerMap, values, "notes"),
        };
    }

    private static void UpdateLeadFromCsv(Lead existingLead, Dictionary<string, int> headerMap, List<string> values)
    {
        // Update name if provided - support both "name" (full name) and "first_name"/"last_name" columns
        var fullNameFromColumn = GetValue(headerMap, values, "name") ?? GetValue(headerMap, values, "full_name") ?? GetValue(headerMap, values, "fullname");
        if (!string.IsNullOrEmpty(fullNameFromColumn))
        {
            existingLead.Name = fullNameFromColumn;
        }
        else
        {
            var firstName = GetValue(headerMap, values, "first_name") ?? GetValue(headerMap, values, "firstname");
            var lastName = GetValue(headerMap, values, "last_name") ?? GetValue(headerMap, values, "lastname");
            if (!string.IsNullOrEmpty(firstName))
            {
                var fullName = string.IsNullOrEmpty(lastName) ? firstName : $"{firstName} {lastName}";
                existingLead.Name = fullName;
            }
        }

        // Update phone if provided
        var phone = GetValue(headerMap, values, "phone") ?? GetValue(headerMap, values, "phone_number");
        if (!string.IsNullOrEmpty(phone))
        {
            existingLead.Phone = phone;
        }

        // Update source if provided
        var source = GetValue(headerMap, values, "source");
        if (!string.IsNullOrEmpty(source))
        {
            existingLead.SourceChannel = source;
        }

        // Update score if provided
        var scoreStr = GetValue(headerMap, values, "score");
        if (!string.IsNullOrEmpty(scoreStr) && int.TryParse(scoreStr, CultureInfo.InvariantCulture, out var score))
        {
            existingLead.Score = Math.Clamp(score, 0, 100);
        }
    }

    private static void UpdateContactFromCsv(Contact existingContact, Dictionary<string, int> headerMap, List<string> values)
    {
        // Update first name if provided
        var firstName = GetValue(headerMap, values, "first_name") ?? GetValue(headerMap, values, "firstname");
        if (!string.IsNullOrEmpty(firstName))
        {
            existingContact.FirstName = firstName;
        }

        // Update last name if provided
        var lastName = GetValue(headerMap, values, "last_name") ?? GetValue(headerMap, values, "lastname");
        if (!string.IsNullOrEmpty(lastName))
        {
            existingContact.LastName = lastName;
        }

        // Update phone if provided
        var phone = GetValue(headerMap, values, "phone") ?? GetValue(headerMap, values, "phone_number");
        if (!string.IsNullOrEmpty(phone))
        {
            existingContact.PhoneNumber = phone;
        }

        // Update company if provided
        var company = GetValue(headerMap, values, "company") ?? GetValue(headerMap, values, "company_name");
        if (!string.IsNullOrEmpty(company))
        {
            existingContact.Company = company;
        }

        // Update job title if provided
        var jobTitle = GetValue(headerMap, values, "job_title") ?? GetValue(headerMap, values, "title");
        if (!string.IsNullOrEmpty(jobTitle))
        {
            existingContact.JobTitle = jobTitle;
        }

        // Update notes if provided
        var notes = GetValue(headerMap, values, "notes");
        if (!string.IsNullOrEmpty(notes))
        {
            existingContact.Notes = notes;
        }
    }

    private static string? GetValue(Dictionary<string, int> headerMap, List<string> values, string columnName)
    {
        if (headerMap.TryGetValue(columnName, out var index) && index < values.Count)
        {
            var value = values[index].Trim();
            return string.IsNullOrEmpty(value) ? null : value;
        }

        return null;
    }
}

// ============================================================================
// DTOs
// ============================================================================

#pragma warning disable CA1002, CA2227, MA0016 // Collection rules - DTOs need mutable collections for serialization

/// <summary>
/// Result of bulk import operation.
/// </summary>
public class BulkImportResult
{
    public string EntityType { get; set; } = string.Empty;
    public int TotalRows { get; set; }
    public int SuccessCount { get; set; }

    /// <summary>
    /// Gets the imported count (alias for SuccessCount for frontend compatibility).
    /// </summary>
    public int ImportedCount => SuccessCount;

    /// <summary>
    /// Gets or sets the count of existing records that were updated.
    /// </summary>
    public int UpdatedCount { get; set; }

    public int FailedCount { get; set; }
    public int SkippedCount { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public List<ImportError> Errors { get; set; } = [];
}

/// <summary>
/// Import error details.
/// </summary>
public class ImportError
{
    public int Row { get; set; }
    public string Field { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// CSV validation result.
/// </summary>
public class CsvValidationResult
{
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public bool IsValid { get; set; }
    public int TotalRows { get; set; }
    public int ValidRows { get; set; }
    public List<string> DetectedColumns { get; set; } = [];
    public List<string> Errors { get; set; } = [];
    public List<string> Warnings { get; set; } = [];
}
