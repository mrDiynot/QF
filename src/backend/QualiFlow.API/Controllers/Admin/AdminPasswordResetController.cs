using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Controllers.Admin;

/// <summary>
/// Temporary controller for resetting admin passwords in development.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/dev")]
public class AdminPasswordResetController : ControllerBase
{
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<AdminPasswordResetController> _logger;
    private readonly IConfiguration _configuration;

    public AdminPasswordResetController(
        QualiFlowDbContext context,
        ILogger<AdminPasswordResetController> logger,
        IConfiguration configuration)
    {
        _context = context;
        _logger = logger;
        _configuration = configuration;
    }

    /// <summary>
    /// Resets admin password for development purposes.
    /// Only works in Development environment.
    /// </summary>
    /// <param name="request">The password reset request.</param>
    /// <returns>Password reset result.</returns>
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var environment = _configuration["ASPNETCORE_ENVIRONMENT"];
        if (!string.Equals(environment, "Development", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { error = "This endpoint is only available in Development environment" });
        }

        try
        {
            var admin = await _context.AdminUsers
                .Where(a => a.Email == request.Email && a.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (admin == null)
            {
                return NotFound(new { error = $"Admin user with email {request.Email} not found" });
            }

            // Hash the new password using BCrypt
            admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            admin.TwoFactorEnabled = false; // Disable 2FA for easier testing
            admin.MustChangePassword = false;
            admin.FailedLoginAttempts = 0;
            admin.LockoutEndAt = null; // Clear lockout so the account is accessible
            admin.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogWarning(
                "DEV: Password reset for admin {Email}. 2FA disabled for testing.",
                request.Email);

            return Ok(new
            {
                message = "Password reset successfully",
                email = admin.Email,
                twoFactorEnabled = false,
                note = "2FA has been disabled for easier testing"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to reset admin password");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Creates a test admin user for development.
    /// </summary>
    /// <returns>Test admin creation result.</returns>
    [HttpPost("create-test-admin")]
    public async Task<IActionResult> CreateTestAdmin()
    {
        var environment = _configuration["ASPNETCORE_ENVIRONMENT"];
        if (!string.Equals(environment, "Development", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { error = "This endpoint is only available in Development environment" });
        }

        try
        {
            var email = "admin@test.local";
            var password = "Admin@123";

            // Check if admin already exists
            var existing = await _context.AdminUsers
                .Where(a => a.Email == email && a.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (existing != null)
            {
                // Update existing admin
                existing.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
                existing.TwoFactorEnabled = false;
                existing.MustChangePassword = false;
                existing.IsActive = true;
                existing.FailedLoginAttempts = 0;
                existing.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Test admin updated",
                    email,
                    password,
                    note = "Use these credentials to log in"
                });
            }

            // Create new admin
            var admin = new QualiFlow.Domain.Entities.AdminUser
            {
                Email = email,
                NormalizedEmail = email.ToUpperInvariant(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                FirstName = "Test",
                LastName = "Admin",
                Role = QualiFlow.Domain.Enums.AdminRole.SuperAdmin,
                IsActive = true,
                TwoFactorEnabled = false,
                MustChangePassword = false,
                FailedLoginAttempts = 0,
                CreatedAt = DateTime.UtcNow
            };

            await _context.AdminUsers.AddAsync(admin);
            await _context.SaveChangesAsync();

            _logger.LogWarning("DEV: Test admin created with email {Email}", email);

            return Ok(new
            {
                message = "Test admin created successfully",
                email,
                password,
                note = "Use these credentials to log in at /admin/login"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create test admin");
            return StatusCode(500, new { error = ex.Message });
        }
    }
}

public class ResetPasswordRequest
{
    public string Email { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
