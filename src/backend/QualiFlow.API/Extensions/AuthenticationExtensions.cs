using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Serilog;

namespace QualiFlow.API.Extensions;

/// <summary>
/// Extension methods for configuring JWT authentication and authorization policies.
/// </summary>
public static class AuthenticationExtensions
{
    /// <summary>
    /// Adds JWT Bearer authentication (Business + Admin schemes) and authorization policies.
    /// </summary>
    /// <returns>The <see cref="IServiceCollection"/> for chaining.</returns>
    public static IServiceCollection AddQualiFlowAuthentication(
        this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        AddJwtAuthentication(services, configuration, environment);
        AddAuthorizationPolicies(services);
        AddAuthorizationHandlers(services);

        return services;
    }

    private static void AddJwtAuthentication(
        IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.SaveToken = true;
            options.RequireHttpsMetadata = !environment.IsDevelopment();
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = configuration["Jwt:Issuer"],
                ValidAudience = configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(configuration["Jwt:Secret"]!)),
                ClockSkew = TimeSpan.Zero
            };

            options.Events = CreateBusinessJwtBearerEvents();
        })
        .AddJwtBearer("AdminBearer", options =>
        {
            options.SaveToken = true;
            options.RequireHttpsMetadata = !environment.IsDevelopment();
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = configuration["AdminJwt:Issuer"],
                ValidAudience = configuration["AdminJwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(configuration["AdminJwt:Secret"]
                        ?? configuration["Jwt:Secret"]!)),
                ClockSkew = TimeSpan.Zero
            };

            options.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = context =>
                {
                    Log.Warning("Admin JWT Authentication failed: {Error}", context.Exception.Message);
                    return Task.CompletedTask;
                },
                OnTokenValidated = context =>
                {
                    Log.Information("Admin JWT Token validated for admin: {Admin}", context.Principal?.Identity?.Name);
                    return Task.CompletedTask;
                }
            };
        });
    }

    private static JwtBearerEvents CreateBusinessJwtBearerEvents()
    {
        return new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var path = context.HttpContext.Request.Path;
                var connectionId = context.Request.Query["id"];
                var method = context.HttpContext.Request.Method;

                Log.Information("SignalR OnMessageReceived called: Path={Path}, Method={Method}", path, method);

                if (path.StartsWithSegments("/hubs", StringComparison.OrdinalIgnoreCase))
                {
                    Log.Information("Request is for a hub endpoint");

                    var headerCount = context.Request.Headers.Count;
                    Log.Information("Total headers: {HeaderCount}", headerCount);
                    foreach (var header in context.Request.Headers)
                    {
                        Log.Information(
                            "Header: {HeaderName} = {HeaderValue}",
                            header.Key,
                            header.Value.ToString().Substring(0, Math.Min(50, header.Value.ToString().Length)));
                    }

                    var authorizationHeader = context.Request.Headers.Authorization.ToString();
                    Log.Information("Authorization header value: '{AuthorizationHeader}'", authorizationHeader);
                    if (!string.IsNullOrEmpty(authorizationHeader) &&
                        authorizationHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                    {
                        var token = authorizationHeader.Substring("Bearer ".Length).Trim();
                        context.Token = token;
                        Log.Information("SignalR: Token extracted from Authorization header (token length: {TokenLength})", token.Length);
                        return Task.CompletedTask;
                    }

                    var accessToken = context.Request.Query["access_token"];
                    Log.Information(
                        "Access token from query string: '{AccessToken}'",
                        accessToken.ToString().Substring(0, Math.Min(50, accessToken.ToString().Length)));
                    if (!string.IsNullOrEmpty(accessToken))
                    {
                        context.Token = accessToken;
                        Log.Information("SignalR: Token extracted from query string (token length: {TokenLength})", accessToken.ToString().Length);
                        return Task.CompletedTask;
                    }

                    Log.Warning("SignalR: No access token found for {Path} (connectionId: {ConnectionId})", path, connectionId);
                }

                return Task.CompletedTask;
            },
            OnAuthenticationFailed = CreateOnAuthenticationFailed(),
            OnTokenValidated = CreateOnTokenValidated(),
            OnChallenge = CreateOnChallenge()
        };
    }

    private static Func<AuthenticationFailedContext, Task> CreateOnAuthenticationFailed()
    {
        return context =>
        {
            var path = context.HttpContext.Request.Path;
            var isHub = path.StartsWithSegments("/hubs", StringComparison.OrdinalIgnoreCase);

            if (isHub)
            {
                Log.Error(
                    "SignalR JWT Authentication failed: {Error} | Path: {Path}",
                    context.Exception?.Message ?? "Unknown error",
                    path);
                Log.Error(
                    "SignalR Exception details: {ExceptionType}: {ExceptionMessage}",
                    context.Exception?.GetType().Name,
                    context.Exception?.StackTrace);
            }
            else
            {
                Log.Warning("JWT Authentication failed: {Error}", context.Exception?.Message ?? "Unknown error");
            }

            return Task.CompletedTask;
        };
    }

    private static Func<TokenValidatedContext, Task> CreateOnTokenValidated()
    {
        return context =>
        {
            var path = context.HttpContext.Request.Path;
            var userName = context.Principal?.Identity?.Name ?? "Unknown";
            var claims = context.Principal?.Claims
                .Select(c => $"{c.Type}={c.Value}")
                .ToList() ?? new List<string>();
            var claimsStr = string.Join("; ", claims);

            if (path.StartsWithSegments("/hubs", StringComparison.OrdinalIgnoreCase))
            {
                Log.Information(
                    "SignalR JWT Token validated for user: {User} | Hub: {Hub} | Claims: {Claims}",
                    userName,
                    path,
                    claimsStr);
            }
            else
            {
                Log.Information(
                    "JWT Token validated for user: {User} | Path: {Path} | Claims: {Claims}",
                    userName,
                    path,
                    claimsStr);
            }

            return Task.CompletedTask;
        };
    }

    private static Func<JwtBearerChallengeContext, Task> CreateOnChallenge()
    {
        return context =>
        {
            var path = context.HttpContext.Request.Path;
            if (path.StartsWithSegments("/hubs", StringComparison.OrdinalIgnoreCase))
            {
                Log.Error(
                    "SignalR JWT Challenge issued. Error: {Error}, ErrorDescription: {ErrorDescription}, Path: {Path}",
                    context.Error,
                    context.ErrorDescription,
                    path);
            }
            else
            {
                Log.Warning(
                    "JWT Challenge issued. Error: {Error}, ErrorDescription: {ErrorDescription}",
                    context.Error,
                    context.ErrorDescription);
            }

            return Task.CompletedTask;
        };
    }

    private static void AddAuthorizationPolicies(IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            // Tier-based policies
            options.AddPolicy("RequiresTier_FreeFlow", policy =>
                policy.Requirements.Add(new Authorization.RequiresTierAttribute(Domain.Enums.SubscriptionTier.FreeFlow)));
            options.AddPolicy("RequiresTier_SmartFlow", policy =>
                policy.Requirements.Add(new Authorization.RequiresTierAttribute(Domain.Enums.SubscriptionTier.SmartFlow)));
            options.AddPolicy("RequiresTier_UltraFlow", policy =>
                policy.Requirements.Add(new Authorization.RequiresTierAttribute(Domain.Enums.SubscriptionTier.UltraFlow)));
            options.AddPolicy("RequiresTier_Enterprise", policy =>
                policy.Requirements.Add(new Authorization.RequiresTierAttribute(Domain.Enums.SubscriptionTier.Enterprise)));

            // Admin role policies
            options.AddPolicy(Application.Features.Admin.Authorization.AdminPolicies.RequirePlatformAdmin, policy =>
                policy.Requirements.Add(new Infrastructure.Authorization.AdminRoleRequirement(
                    Domain.Enums.AdminRole.SuperAdmin, Domain.Enums.AdminRole.PlatformAdmin)));

            options.AddPolicy(Application.Features.Admin.Authorization.AdminPolicies.RequireSupportAdmin, policy =>
                policy.Requirements.Add(new Infrastructure.Authorization.AdminRoleRequirement(
                    Domain.Enums.AdminRole.SuperAdmin, Domain.Enums.AdminRole.PlatformAdmin, Domain.Enums.AdminRole.SupportAdmin)));

            options.AddPolicy(Application.Features.Admin.Authorization.AdminPolicies.RequireBillingAdmin, policy =>
                policy.Requirements.Add(new Infrastructure.Authorization.AdminRoleRequirement(
                    Domain.Enums.AdminRole.SuperAdmin, Domain.Enums.AdminRole.PlatformAdmin, Domain.Enums.AdminRole.BillingAdmin)));

            options.AddPolicy(Application.Features.Admin.Authorization.AdminPolicies.RequireContentAdmin, policy =>
                policy.Requirements.Add(new Infrastructure.Authorization.AdminRoleRequirement(
                    Domain.Enums.AdminRole.SuperAdmin, Domain.Enums.AdminRole.PlatformAdmin, Domain.Enums.AdminRole.ContentAdmin)));

            options.AddPolicy(Application.Features.Admin.Authorization.AdminPolicies.RequireAnyAdmin, policy =>
                policy.Requirements.Add(new Infrastructure.Authorization.AdminRoleRequirement(
                    Domain.Enums.AdminRole.SuperAdmin, Domain.Enums.AdminRole.PlatformAdmin,
                    Domain.Enums.AdminRole.SupportAdmin, Domain.Enums.AdminRole.BillingAdmin, Domain.Enums.AdminRole.ContentAdmin)));

            // Business user role policies
            options.AddPolicy(Application.Features.Authorization.BusinessPolicies.RequireOwner, policy =>
                policy.Requirements.Add(new Infrastructure.Authorization.BusinessRoleRequirement(
                    Domain.Entities.ApplicationRole.Owner)));

            options.AddPolicy(Application.Features.Authorization.BusinessPolicies.RequireAdminOrOwner, policy =>
                policy.Requirements.Add(new Infrastructure.Authorization.BusinessRoleRequirement(
                    Domain.Entities.ApplicationRole.Owner, Domain.Entities.ApplicationRole.Admin)));

            options.AddPolicy(Application.Features.Authorization.BusinessPolicies.RequireManagerOrHigher, policy =>
                policy.Requirements.Add(new Infrastructure.Authorization.BusinessRoleRequirement(
                    Domain.Entities.ApplicationRole.Owner, Domain.Entities.ApplicationRole.Admin, Domain.Entities.ApplicationRole.Manager)));

            options.AddPolicy(Application.Features.Authorization.BusinessPolicies.RequireBusinessUser, policy =>
                policy.Requirements.Add(new Infrastructure.Authorization.BusinessRoleRequirement(
                    Domain.Entities.ApplicationRole.Owner, Domain.Entities.ApplicationRole.Admin,
                    Domain.Entities.ApplicationRole.Manager, Domain.Entities.ApplicationRole.Viewer)));

            // Global fallback policy
            options.FallbackPolicy = new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .Build();
        });
    }

    private static void AddAuthorizationHandlers(IServiceCollection services)
    {
        services.AddScoped<Microsoft.AspNetCore.Authorization.IAuthorizationHandler,
            Authorization.TierAuthorizationHandler>();

        services.AddScoped<Microsoft.AspNetCore.Authorization.IAuthorizationHandler,
            Infrastructure.Authorization.AdminRoleAuthorizationHandler>();

        services.AddScoped<Microsoft.AspNetCore.Authorization.IAuthorizationHandler,
            Infrastructure.Authorization.BusinessRoleAuthorizationHandler>();
    }
}

