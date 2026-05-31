// <copyright file="SurveyDto.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

namespace QualiFlow.Application.Features.Surveys.DTOs;

/// <summary>
/// DTO for survey data.
/// </summary>
public record SurveyDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Status { get; init; } = "draft";
    public string Questions { get; init; } = "[]";
    public int ResponseCount { get; init; }
    public decimal? AverageScore { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

/// <summary>
/// Request to create a survey.
/// </summary>
public record CreateSurveyRequest
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Questions { get; init; } = "[]";
}

/// <summary>
/// Request to update a survey.
/// </summary>
public record UpdateSurveyRequest
{
    public string? Name { get; init; }
    public string? Description { get; init; }
    public string? Status { get; init; }
    public string? Questions { get; init; }
    public bool? IsActive { get; init; }
}

/// <summary>
/// DTO for survey response data.
/// </summary>
public record SurveyResponseDto
{
    public Guid Id { get; init; }
    public Guid SurveyId { get; init; }
    public string? Email { get; init; }
    public string Answers { get; init; } = "{}";
    public decimal? Score { get; init; }
    public DateTime CreatedAt { get; init; }
}

/// <summary>
/// Request to submit a survey response.
/// </summary>
public record SubmitSurveyResponseRequest
{
    public string? Email { get; init; }
    public string Answers { get; init; } = "{}";
    public decimal? Score { get; init; }
}

/// <summary>
/// Statistics for surveys.
/// </summary>
public record SurveyStatsDto
{
    public int TotalSurveys { get; init; }
    public int TotalResponses { get; init; }
    public int PublishedSurveys { get; init; }
    public int DraftSurveys { get; init; }
}

/// <summary>
/// Analytics data for a survey including NPS and response breakdown.
/// </summary>
public record SurveyAnalyticsDto
{
    public Guid SurveyId { get; init; }
    public string SurveyName { get; init; } = string.Empty;
    public int TotalResponses { get; init; }
    public double? AverageScore { get; init; }
    public double? NpsScore { get; init; }
    public double CompletionRate { get; init; }
    public IReadOnlyList<ResponseTimelineEntry> ResponseTimeline { get; init; } = [];
    public ScoreDistributionDto ScoreDistribution { get; init; } = new();
}

/// <summary>
/// Entry for response timeline (responses per day).
/// </summary>
public record ResponseTimelineEntry
{
    public DateTime Date { get; init; }
    public int Count { get; init; }
}

/// <summary>
/// NPS score distribution (Promoters, Passives, Detractors).
/// </summary>
public record ScoreDistributionDto
{
    public int Promoters { get; init; }
    public int Passives { get; init; }
    public int Detractors { get; init; }
}
