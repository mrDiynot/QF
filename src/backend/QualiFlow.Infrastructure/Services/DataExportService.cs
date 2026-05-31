// <copyright file="DataExportService.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using System.Globalization;
using System.Text;
using System.Text.Json;
using ClosedXML.Excel;
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.DataExport.DTOs;
using QualiFlow.Application.Features.DataExport.Services;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service implementation for data export and import operations.
/// </summary>
public partial class DataExportService(
    QualiFlowDbContext context,
    ILogger<DataExportService> logger) : IDataExportService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    /// <inheritdoc/>
    public async Task<ExportResult> ExportDataAsync(
        Guid businessId,
        ExportRequest request,
        CancellationToken cancellationToken = default)
    {
        LogExportStarted(logger, businessId, request.EntityType, request.Format);

        return request.EntityType.ToLowerInvariant() switch
        {
            "lead" => await ExportLeadsAsync(businessId, request, cancellationToken),
            "contact" => await ExportContactsAsync(businessId, request, cancellationToken),
            "conversation" => await ExportConversationsAsync(businessId, request, cancellationToken),
            "deal" => await ExportDealsAsync(businessId, request, cancellationToken),
            _ => throw new ArgumentException($"Unsupported entity type: {request.EntityType}", nameof(request)),
        };
    }

    /// <inheritdoc/>
    public async Task<ImportResult> ImportDataAsync(
        Guid businessId,
        ImportRequest request,
        CancellationToken cancellationToken = default)
    {
        LogImportStarted(logger, businessId, request.EntityType, request.FileName);

        return request.EntityType.ToLowerInvariant() switch
        {
            "lead" => await ImportLeadsAsync(businessId, request, cancellationToken),
            "contact" => await ImportContactsAsync(businessId, request, cancellationToken),
            "deal" => await ImportDealsAsync(businessId, request, cancellationToken),
            _ => throw new ArgumentException($"Unsupported entity type: {request.EntityType}", nameof(request)),
        };
    }

    private async Task<ExportResult> ExportLeadsAsync(
        Guid businessId,
        ExportRequest request,
        CancellationToken cancellationToken)
    {
        var query = context.Leads
            .AsNoTracking()
            .Where(l => l.BusinessId == businessId);

        if (request.EntityIds != null && request.EntityIds.Count > 0)
        {
            query = query.Where(l => request.EntityIds.Contains(l.Id));
        }

        if (request.StartDate.HasValue)
        {
            query = query.Where(l => l.CreatedAt >= request.StartDate.Value);
        }

        if (request.EndDate.HasValue)
        {
            query = query.Where(l => l.CreatedAt <= request.EndDate.Value);
        }

        var leads = await query.ToListAsync(cancellationToken);

        return request.Format.ToLowerInvariant() switch
        {
            "csv" => ExportToCsv(leads, "leads"),
            "excel" => ExportToExcel(leads, "leads"),
            "json" => ExportToJson(leads, "leads"),
            _ => throw new ArgumentException($"Unsupported format: {request.Format}", nameof(request)),
        };
    }

    private static ExportResult ExportToCsv<T>(IEnumerable<T> data, string entityName)
    {
        using var memoryStream = new MemoryStream();
        using var writer = new StreamWriter(memoryStream, Encoding.UTF8);
        using var csv = new CsvWriter(writer, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
        });

        csv.WriteRecords(data);
        writer.Flush();

        var fileContent = memoryStream.ToArray();
        var fileName = $"{entityName}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";

        return new ExportResult
        {
            FileName = fileName,
            ContentType = "text/csv",
            FileContent = fileContent.ToList(),
            RecordCount = data.Count(),
        };
    }

    private static ExportResult ExportToExcel<T>(IEnumerable<T> data, string entityName)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add(entityName);

        // Add data to worksheet
        var dataList = data.ToList();
        if (dataList.Count > 0)
        {
            worksheet.Cell(1, 1).InsertTable(dataList);
        }

        using var memoryStream = new MemoryStream();
        workbook.SaveAs(memoryStream);

        var fileContent = memoryStream.ToArray();
        var fileName = $"{entityName}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.xlsx";

        return new ExportResult
        {
            FileName = fileName,
            ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            FileContent = fileContent.ToList(),
            RecordCount = dataList.Count,
        };
    }

    private static ExportResult ExportToJson<T>(IEnumerable<T> data, string entityName)
    {
        var json = JsonSerializer.Serialize(data, JsonOptions);

        var fileContent = Encoding.UTF8.GetBytes(json);
        var fileName = $"{entityName}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.json";

        return new ExportResult
        {
            FileName = fileName,
            ContentType = "application/json",
            FileContent = fileContent.ToList(),
            RecordCount = data.Count(),
        };
    }

    private async Task<ExportResult> ExportContactsAsync(
        Guid businessId,
        ExportRequest request,
        CancellationToken cancellationToken)
    {
        var query = context.Contacts
            .AsNoTracking()
            .Where(c => c.BusinessId == businessId);

        if (request.EntityIds != null && request.EntityIds.Count > 0)
        {
            query = query.Where(c => request.EntityIds.Contains(c.Id));
        }

        if (request.StartDate.HasValue)
        {
            query = query.Where(c => c.CreatedAt >= request.StartDate.Value);
        }

        if (request.EndDate.HasValue)
        {
            query = query.Where(c => c.CreatedAt <= request.EndDate.Value);
        }

        var contacts = await query.ToListAsync(cancellationToken);

        return request.Format.ToLowerInvariant() switch
        {
            "csv" => ExportToCsv(contacts, "contacts"),
            "excel" => ExportToExcel(contacts, "contacts"),
            "json" => ExportToJson(contacts, "contacts"),
            _ => throw new ArgumentException($"Unsupported format: {request.Format}", nameof(request)),
        };
    }

    private async Task<ExportResult> ExportConversationsAsync(
        Guid businessId,
        ExportRequest request,
        CancellationToken cancellationToken)
    {
        var query = context.Conversations
            .AsNoTracking()
            .Where(c => c.BusinessId == businessId);

        if (request.EntityIds != null && request.EntityIds.Count > 0)
        {
            query = query.Where(c => request.EntityIds.Contains(c.Id));
        }

        if (request.StartDate.HasValue)
        {
            query = query.Where(c => c.CreatedAt >= request.StartDate.Value);
        }

        if (request.EndDate.HasValue)
        {
            query = query.Where(c => c.CreatedAt <= request.EndDate.Value);
        }

        var conversations = await query.ToListAsync(cancellationToken);

        return request.Format.ToLowerInvariant() switch
        {
            "csv" => ExportToCsv(conversations, "conversations"),
            "excel" => ExportToExcel(conversations, "conversations"),
            "json" => ExportToJson(conversations, "conversations"),
            _ => throw new ArgumentException($"Unsupported format: {request.Format}", nameof(request)),
        };
    }

    private async Task<ExportResult> ExportDealsAsync(
        Guid businessId,
        ExportRequest request,
        CancellationToken cancellationToken)
    {
        var query = context.Deals
            .AsNoTracking()
            .Where(d => d.BusinessId == businessId);

        if (request.EntityIds != null && request.EntityIds.Count > 0)
        {
            query = query.Where(d => request.EntityIds.Contains(d.Id));
        }

        if (request.StartDate.HasValue)
        {
            query = query.Where(d => d.CreatedAt >= request.StartDate.Value);
        }

        if (request.EndDate.HasValue)
        {
            query = query.Where(d => d.CreatedAt <= request.EndDate.Value);
        }

        var deals = await query.ToListAsync(cancellationToken);

        return request.Format.ToLowerInvariant() switch
        {
            "csv" => ExportToCsv(deals, "deals"),
            "excel" => ExportToExcel(deals, "deals"),
            "json" => ExportToJson(deals, "deals"),
            _ => throw new ArgumentException($"Unsupported format: {request.Format}", nameof(request)),
        };
    }

    private async Task<ImportResult> ImportLeadsAsync(
        Guid businessId,
        ImportRequest request,
        CancellationToken cancellationToken)
    {
        var errors = new List<ImportError>();
        var importedCount = 0;
        var skippedCount = 0;
        var totalRecords = 0;

        try
        {
            using var memoryStream = new MemoryStream(request.FileContent.ToArray());
            using var reader = new StreamReader(memoryStream);
            using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture));

            var records = new List<dynamic>();
            await foreach (var record in csv.GetRecordsAsync<dynamic>(cancellationToken))
            {
                records.Add(record);
            }

            totalRecords = records.Count;

            var rowNumber = 1;
            foreach (var record in records)
            {
                rowNumber++;
                try
                {
                    var recordDict = (IDictionary<string, object>)record;
                    var email = recordDict.TryGetValue("Email", out var emailValue) ? emailValue?.ToString() : null;

                    if (string.IsNullOrEmpty(email))
                    {
                        errors.Add(new ImportError
                        {
                            RowNumber = rowNumber,
                            ErrorMessage = "Email is required.",
                        });
                        continue;
                    }

                    // Check for duplicates
                    var existingLead = await context.Leads
                        .FirstOrDefaultAsync(l => l.BusinessId == businessId && l.Email == email, cancellationToken);

                    if (existingLead != null)
                    {
                        if (request.SkipDuplicates && !request.UpdateExisting)
                        {
                            skippedCount++;
                            continue;
                        }

                        if (request.UpdateExisting)
                        {
                            // Update existing lead
                            if (recordDict.TryGetValue("Name", out var nameValue))
                            {
                                existingLead.Name = nameValue?.ToString() ?? existingLead.Name;
                            }

                            if (recordDict.TryGetValue("Phone", out var phoneValue))
                            {
                                existingLead.Phone = phoneValue?.ToString();
                            }

                            existingLead.UpdatedAt = DateTime.UtcNow;
                            importedCount++;
                            continue;
                        }
                    }

                    // Create new lead
                    var name = recordDict.TryGetValue("Name", out var newNameValue) ? newNameValue?.ToString() ?? string.Empty : string.Empty;
                    var phone = recordDict.TryGetValue("Phone", out var newPhoneValue) ? newPhoneValue?.ToString() : null;

                    var lead = new Lead
                    {
                        BusinessId = businessId,
                        Email = email,
                        Name = name,
                        Phone = phone,
                        Status = LeadStatus.New,
                        Score = 0,
                        CreatedAt = DateTime.UtcNow,
                    };

                    await context.Leads.AddAsync(lead, cancellationToken);
                    importedCount++;
                }
                catch (Exception ex)
                {
                    errors.Add(new ImportError
                    {
                        RowNumber = rowNumber,
                        ErrorMessage = ex.Message,
                    });
                }
            }

            await context.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            errors.Add(new ImportError
            {
                RowNumber = 0,
                ErrorMessage = $"File parsing error: {ex.Message}",
            });
        }

        LogImportCompleted(logger, businessId, request.EntityType, importedCount, skippedCount, errors.Count);

        return new ImportResult
        {
            TotalRecords = totalRecords,
            ImportedCount = importedCount,
            SkippedCount = skippedCount,
            FailedCount = errors.Count,
            Errors = errors.Count > 0 ? errors : null,
        };
    }

    private static Task<ImportResult> ImportContactsAsync(
        Guid businessId,
        ImportRequest request,
        CancellationToken cancellationToken = default)
    {
        _ = businessId;
        _ = request;
        _ = cancellationToken;

        // Similar implementation to ImportLeadsAsync
        throw new NotSupportedException("Contact import not yet implemented.");
    }

    private static Task<ImportResult> ImportDealsAsync(
        Guid businessId,
        ImportRequest request,
        CancellationToken cancellationToken = default)
    {
        _ = businessId;
        _ = request;
        _ = cancellationToken;

        // Similar implementation to ImportLeadsAsync
        throw new NotSupportedException("Deal import not yet implemented.");
    }
}

