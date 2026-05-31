using Asp.Versioning;
using Microsoft.OpenApi.Models;
using QualiFlow.API.Filters;
using QualiFlow.Infrastructure.Constants;
using Serilog;

namespace QualiFlow.API.Extensions;

/// <summary>
/// Extension methods for configuring Controllers, API Versioning, Swagger, CORS, HSTS, SignalR, and Health Checks.
/// </summary>
public static class ApiExtensions
{
    /// <summary>
    /// Adds Controllers with JSON serialization, API Versioning, Swagger, CORS, HSTS, SignalR, and Health Checks.
    /// </summary>
    /// <returns>The <see cref="IServiceCollection"/> for chaining.</returns>
    public static IServiceCollection AddApiServices(
        this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        AddControllersAndVersioning(services);
        AddSwagger(services);
        AddHstsAndCors(services, configuration);
        AddSignalRServices(services, environment);
        AddHealthChecks(services, configuration);

        return services;
    }

    private static void AddControllersAndVersioning(IServiceCollection services)
    {
        services.AddControllers()
            .AddXmlSerializerFormatters()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
                options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
                options.JsonSerializerOptions.Converters.Add(new QualiFlow.API.Converters.TimeSpanToSecondsConverter());
            });

        services.AddApiVersioning(options =>
        {
            options.DefaultApiVersion = new ApiVersion(1, 0);
            options.AssumeDefaultVersionWhenUnspecified = true;
            options.ReportApiVersions = true;
        });
    }

    private static void AddSwagger(IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "QualiFlow API",
                Version = "v1",
                Description = "AI-powered omnichannel lead qualification and conversation management platform",
                Contact = new OpenApiContact
                {
                    Name = "QualiFlow Team",
                    Email = EmailConstants.SupportEmail
                }
            });

            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer"
            });

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });

            options.CustomSchemaIds(type => type.FullName?.Replace("+", ".", StringComparison.Ordinal));
            options.DocumentFilter<SwaggerVersionDocumentFilter>();

            var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            if (File.Exists(xmlPath))
            {
                options.IncludeXmlComments(xmlPath);
            }
        });
    }

    private static void AddSignalRServices(IServiceCollection services, IWebHostEnvironment environment)
    {
        services.AddSignalR(options =>
        {
            options.EnableDetailedErrors = environment.IsDevelopment();
            options.ClientTimeoutInterval = TimeSpan.FromSeconds(60);
            options.KeepAliveInterval = TimeSpan.FromSeconds(15);
            options.HandshakeTimeout = TimeSpan.FromSeconds(30);
            options.MaximumReceiveMessageSize = 1024 * 1024;
            options.MaximumParallelInvocationsPerClient = 1;
            options.StreamBufferCapacity = 10;
        });
    }

    private static void AddHealthChecks(IServiceCollection services, IConfiguration configuration)
    {
        var healthChecksBuilder = services.AddHealthChecks()
            .AddNpgSql(
                connectionString: configuration.GetConnectionString("DefaultConnection")!,
                name: "postgresql",
                failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Unhealthy,
                tags: new[] { "db", "postgresql", "ready" });

        var redisConnectionString = configuration.GetConnectionString("Redis");
        if (!string.IsNullOrEmpty(redisConnectionString))
        {
            healthChecksBuilder.AddRedis(
                redisConnectionString: redisConnectionString,
                name: "redis",
                failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Degraded,
                tags: new[] { "cache", "redis" });
        }

        var elasticsearchUrl = configuration.GetConnectionString("Elasticsearch");
        if (!string.IsNullOrEmpty(elasticsearchUrl))
        {
            healthChecksBuilder.AddElasticsearch(
                elasticsearchUri: elasticsearchUrl,
                name: "elasticsearch",
                failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Degraded,
                tags: new[] { "search", "elasticsearch" });
        }
    }

    private static void AddHstsAndCors(IServiceCollection services, IConfiguration configuration)
    {
        services.AddHsts(options =>
        {
            options.Preload = true;
            options.IncludeSubDomains = true;
            options.MaxAge = TimeSpan.FromDays(365);
        });

        services.AddCors(options =>
        {
            options.AddPolicy("QualiFlowCors", policy =>
            {
                var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
                if (allowedOrigins == null || allowedOrigins.Length == 0)
                {
                    allowedOrigins = new[]
                    {
                        "http://localhost:3000", "https://localhost:3000",
                        "http://localhost:3001", "https://localhost:3001",
                    };
                }

                Log.Information("CORS Allowed Origins: {Origins}", string.Join(", ", allowedOrigins));

                policy
                    .SetIsOriginAllowed(origin =>
                    {
                        if (allowedOrigins.Contains(origin))
                        {
                            return true;
                        }

                        if (origin.StartsWith("http://127.0.0.1:", StringComparison.OrdinalIgnoreCase))
                        {
                            return true;
                        }

                        return false;
                    })
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials()
                    .WithExposedHeaders("X-Total-Count", "X-Rate-Limit-Limit", "X-Rate-Limit-Remaining");
            });
        });
    }
}

