using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;

namespace QualiFlow.API.Controllers;

/// <summary>
/// EXAMPLE CONTROLLER - DO NOT USE IN PRODUCTION
/// This is a template showing caching best practices.
/// Copy patterns from this controller to your own controllers.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/example-caching")]
[Produces("application/json")]
public class CachingExampleController : ControllerBase
{
    /// <summary>
    /// Example: Login endpoint - authentication should never be cached.
    /// </summary>
    /// <returns>See docs/RESPONSE_CACHING_STRATEGY.md.</returns>
    [HttpPost("login")]
    [NoCache] // Authentication credentials must never be cached
    [AllowAnonymous]
    public IActionResult Login()
    {
        // Copy this pattern to your AuthController
        return Ok("See docs/RESPONSE_CACHING_STRATEGY.md");
    }

    /// <summary>
    /// Example: Logout endpoint - state change should never be cached.
    /// </summary>
    /// <returns>See docs/RESPONSE_CACHING_STRATEGY.md.</returns>
    [HttpPost("logout")]
    [NoCache] // Logout is a state-changing operation
    [Authorize]
    public IActionResult Logout()
    {
        // Copy this pattern to your AuthController
        return Ok("See docs/RESPONSE_CACHING_STRATEGY.md");
    }

    // ============================================================================
    // USER PROFILE ENDPOINTS - Never cache (user-specific data)
    // ============================================================================

    /// <summary>
    /// Example: Get current user profile - user-specific data.
    /// </summary>
    /// <returns>See docs/RESPONSE_CACHING_STRATEGY.md.</returns>
    [HttpGet("profile")]
    [NoCache] // User profile is unique to each user
    [Authorize]
    public IActionResult GetProfile()
    {
        // Copy this pattern to your ProfileController
        return Ok("See docs/RESPONSE_CACHING_STRATEGY.md");
    }

    // ============================================================================
    // REAL-TIME DATA ENDPOINTS - Never cache (conversations, messages, notifications)
    // ============================================================================

    /// <summary>
    /// Example: Get conversation messages - real-time data.
    /// </summary>
    /// <returns>See docs/RESPONSE_CACHING_STRATEGY.md.</returns>
    [HttpGet("messages")]
    [NoCache] // Real-time data that updates frequently
    [Authorize]
    public IActionResult GetMessages()
    {
        // Copy this pattern to your ConversationController
        return Ok("See docs/RESPONSE_CACHING_STRATEGY.md");
    }

    // ============================================================================
    // FREQUENTLY-UPDATED DATA - Short-term cache (5 minutes)
    // ============================================================================

    /// <summary>
    /// Example: Get leads list - changes frequently, slight staleness acceptable.
    /// </summary>
    /// <returns>See docs/RESPONSE_CACHING_STRATEGY.md.</returns>
    [HttpGet("leads")]
    [CacheControl(CacheStrategies.ShortTerm)] // 5 min cache for dynamic business data
    [Authorize]
    public IActionResult GetLeads()
    {
        // Copy this pattern to your LeadsController
        return Ok("See docs/RESPONSE_CACHING_STRATEGY.md");
    }

    // ============================================================================
    // SEMI-STATIC DATA - Medium-term cache (30 minutes)
    // ============================================================================

    /// <summary>
    /// Example: Get scoring criteria - rarely changes, 30 min cache is safe.
    /// </summary>
    /// <returns>See docs/RESPONSE_CACHING_STRATEGY.md.</returns>
    [HttpGet("scoring-criteria")]
    [CacheControl(CacheStrategies.MediumTerm)] // 30 min cache for config data
    [Authorize]
    public IActionResult GetScoringCriteria()
    {
        // Copy this pattern to your ScoringController
        return Ok("See docs/RESPONSE_CACHING_STRATEGY.md");
    }

    // ============================================================================
    // STATIC REFERENCE DATA - Long-term cache (1 hour)
    // ============================================================================

    /// <summary>
    /// Example: Get subscription plans - rarely changes, 1 hour cache is safe.
    /// </summary>
    /// <returns>See docs/RESPONSE_CACHING_STRATEGY.md.</returns>
    [HttpGet("public/plans")]
    [CacheControl(CacheStrategies.LongTerm)] // 1 hour cache for stable reference data
    [AllowAnonymous]
    public IActionResult GetSubscriptionPlans()
    {
        // Copy this pattern to your PublicController
        return Ok("See docs/RESPONSE_CACHING_STRATEGY.md");
    }

    // ============================================================================
    // USER-SPECIFIC CACHING (Per User)
    // ============================================================================

    /// <summary>
    /// Example: Get user's dashboard - different per user, but can cache per user.
    /// </summary>
    /// <returns>See docs/RESPONSE_CACHING_STRATEGY.md.</returns>
    [HttpGet("dashboard")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")] // Cache per user
    [Authorize]
    public IActionResult GetUserDashboard()
    {
        // Each user gets their own cached response based on Authorization header
        return Ok("See docs/RESPONSE_CACHING_STRATEGY.md");
    }
}

// ============================================================================
// CACHING DECISION GUIDE
// ============================================================================

/*
 * Use [NoCache] when:
 * ✓ Endpoint requires authentication (login, logout, refresh token)
 * ✓ Endpoint returns user-specific data (profile, settings, preferences)
 * ✓ Endpoint is real-time (messages, conversations, notifications)
 * ✓ Endpoint modifies state (POST, PUT, DELETE operations)
 * ✓ Endpoint requires fresh data (current balance, live chat)
 * ✓ Data is sensitive (password, billing, PII)
 *
 * Use [CacheControl(CacheStrategies.ShortTerm)] - 5 minutes:
 * ✓ Frequently-updated business data (leads, contacts, deals)
 * ✓ Dynamic dashboards and analytics
 * ✓ User-specific data that changes often
 * ✓ Performance-critical but freshness important
 *
 * Use [CacheControl(CacheStrategies.MediumTerm)] - 30 minutes:
 * ✓ Configuration data (scoring criteria, templates)
 * ✓ Team rosters and permissions
 * ✓ Business settings that rarely change
 * ✓ Reference data used for lookups
 *
 * Use [CacheControl(CacheStrategies.LongTerm)] - 1 hour:
 * ✓ Static reference data (plans, pricing, industries)
 * ✓ Public content (landing pages, marketing copy)
 * ✓ Catalog data (products, features, tiers)
 * ✓ Configuration that almost never changes
 *
 * Use [CacheControl(CacheStrategies.VeryLongTerm)] - 24 hours:
 * ✓ Truly immutable data (ID mappings, static lookups)
 * ✓ Data that never changes during platform lifetime
 * ✓ Reference data with permanent validity
 *
 * Use no attribute (default behavior):
 * ✓ Everything else (defaults to no caching for safety)
 */
