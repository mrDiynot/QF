// -----------------------------------------------------------------------
// <copyright file="IAdminPlanManagementService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Features.Admin.Billing.DTOs;

namespace QualiFlow.Application.Features.Admin.Billing;

/// <summary>
/// Service interface for managing subscription plans, features, and limits.
/// Provides CRUD operations for core billing tables and ensures CMS sync.
/// </summary>
public interface IAdminPlanManagementService
{
    // ========================================================================
    // Subscription Plans
    // ========================================================================

    /// <summary>Gets all subscription plans with their limits and features.</summary>
    /// <returns>A list of all subscription plans.</returns>
    Task<IReadOnlyList<AdminPlanDto>> GetAllPlansAsync(bool includeInactive = false, CancellationToken cancellationToken = default);

    /// <summary>Gets a subscription plan by ID.</summary>
    /// <returns>The plan if found, null otherwise.</returns>
    Task<AdminPlanDto?> GetPlanByIdAsync(Guid planId, CancellationToken cancellationToken = default);

    /// <summary>Creates a new subscription plan.</summary>
    /// <returns>The created plan.</returns>
    Task<AdminPlanDto> CreatePlanAsync(AdminPlanRequest request, CancellationToken cancellationToken = default);

    /// <summary>Updates an existing subscription plan. Syncs to CMS if requested.</summary>
    /// <returns>The updated plan if found, null otherwise.</returns>
    Task<AdminPlanDto?> UpdatePlanAsync(Guid planId, AdminPlanRequest request, CancellationToken cancellationToken = default);

    /// <summary>Toggles a subscription plan's active/public status.</summary>
    /// <param name="planId">The plan ID.</param>
    /// <param name="isActive">Optional new active status.</param>
    /// <param name="isPublic">Optional new public status.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated plan if found, null otherwise.</returns>
    Task<AdminPlanDto?> TogglePlanStatusAsync(Guid planId, bool? isActive = null, bool? isPublic = null, CancellationToken cancellationToken = default);

    /// <summary>Soft-deletes a subscription plan (deactivates it).</summary>
    /// <returns>True if deleted, false if not found.</returns>
    Task<bool> DeletePlanAsync(Guid planId, CancellationToken cancellationToken = default);

    // ========================================================================
    // Features
    // ========================================================================

    /// <summary>Gets all features.</summary>
    /// <returns>A list of all features.</returns>
    Task<IReadOnlyList<AdminFeatureDto>> GetAllFeaturesAsync(bool includeInactive = false, CancellationToken cancellationToken = default);

    /// <summary>Gets a feature by ID.</summary>
    /// <returns>The feature if found, null otherwise.</returns>
    Task<AdminFeatureDto?> GetFeatureByIdAsync(Guid featureId, CancellationToken cancellationToken = default);

    /// <summary>Creates a new feature.</summary>
    /// <returns>The created feature.</returns>
    Task<AdminFeatureDto> CreateFeatureAsync(AdminFeatureRequest request, CancellationToken cancellationToken = default);

    /// <summary>Updates an existing feature.</summary>
    /// <returns>The updated feature if found, null otherwise.</returns>
    Task<AdminFeatureDto?> UpdateFeatureAsync(Guid featureId, AdminFeatureRequest request, CancellationToken cancellationToken = default);

    /// <summary>Soft-deletes a feature.</summary>
    /// <returns>True if deleted, false if not found.</returns>
    Task<bool> DeleteFeatureAsync(Guid featureId, CancellationToken cancellationToken = default);

    // ========================================================================
    // Plan Limits
    // ========================================================================

    /// <summary>Gets all plan limits.</summary>
    /// <returns>A list of all plan limits.</returns>
    Task<IReadOnlyList<AdminPlanLimitDto>> GetAllPlanLimitsAsync(Guid? planId = null, CancellationToken cancellationToken = default);

    /// <summary>Gets a plan limit by ID.</summary>
    /// <returns>The plan limit if found, null otherwise.</returns>
    Task<AdminPlanLimitDto?> GetPlanLimitByIdAsync(Guid limitId, CancellationToken cancellationToken = default);

    /// <summary>Creates or updates a plan limit (upsert by plan + limit key).</summary>
    /// <returns>The created or updated plan limit.</returns>
    Task<AdminPlanLimitDto> UpsertPlanLimitAsync(AdminPlanLimitRequest request, CancellationToken cancellationToken = default);

    /// <summary>Deletes a plan limit.</summary>
    /// <returns>True if deleted, false if not found.</returns>
    Task<bool> DeletePlanLimitAsync(Guid limitId, CancellationToken cancellationToken = default);

    // ========================================================================
    // Plan Features (Assignments)
    // ========================================================================

    /// <summary>Gets all plan feature assignments.</summary>
    /// <returns>A list of all plan feature assignments.</returns>
    Task<IReadOnlyList<AdminPlanFeatureDto>> GetAllPlanFeaturesAsync(Guid? planId = null, CancellationToken cancellationToken = default);

    /// <summary>Assigns a feature to a plan.</summary>
    /// <returns>The created plan feature assignment.</returns>
    Task<AdminPlanFeatureDto> AssignFeatureToPlanAsync(AdminPlanFeatureRequest request, CancellationToken cancellationToken = default);

    /// <summary>Removes a feature assignment from a plan.</summary>
    /// <returns>True if removed, false if not found.</returns>
    Task<bool> RemoveFeatureFromPlanAsync(Guid planId, Guid featureId, CancellationToken cancellationToken = default);

    // ========================================================================
    // CMS Sync
    // ========================================================================

    /// <summary>Syncs all subscription plans to CMS pricing plans.</summary>
    /// <returns>The number of plans synced.</returns>
    Task<int> SyncAllPlansToCmsAsync(CancellationToken cancellationToken = default);

    /// <summary>Validates CMS and billing data consistency.</summary>
    /// <returns>The validation result with any inconsistencies found.</returns>
    Task<CmsBillingValidationResult> ValidateCmsBillingConsistencyAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of CMS-Billing consistency validation.
/// </summary>
public class CmsBillingValidationResult
{
    /// <summary>Gets a value indicating whether all data is consistent.</summary>
    public bool IsValid { get; init; }

    /// <summary>Gets the list of inconsistencies found.</summary>
    public IReadOnlyList<string> Inconsistencies { get; init; } = [];

    /// <summary>Gets details about each plan comparison.</summary>
    public IReadOnlyList<PlanComparisonDetail> PlanComparisons { get; init; } = [];
}

/// <summary>
/// Detail of a single plan comparison between billing and CMS.
/// </summary>
public class PlanComparisonDetail
{
    /// <summary>Gets the plan name.</summary>
    public string PlanName { get; init; } = string.Empty;

    /// <summary>Gets a value indicating whether this plan is in sync.</summary>
    public bool IsInSync { get; init; }

    /// <summary>Gets the billing monthly price.</summary>
    public decimal BillingMonthly { get; init; }

    /// <summary>Gets the CMS monthly price (as string for display).</summary>
    public string? CmsMonthly { get; init; }

    /// <summary>Gets the billing onboarding price.</summary>
    public decimal? BillingOnboarding { get; init; }

    /// <summary>Gets the CMS onboarding price.</summary>
    public decimal? CmsOnboarding { get; init; }

    /// <summary>Gets the differences found.</summary>
    public IReadOnlyList<string> Differences { get; init; } = [];
}

