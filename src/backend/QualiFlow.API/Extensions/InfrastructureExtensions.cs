namespace QualiFlow.API.Extensions;

/// <summary>
/// Extension methods for configuring caching, Redis, Elasticsearch, compression, and rate limiting.
/// </summary>
public static class InfrastructureExtensions
{
    /// <summary>
    /// Adds memory cache, response caching, Redis distributed cache, Elasticsearch,
    /// response compression, and rate limiting services.
    /// </summary>
    /// <returns>The <see cref="IServiceCollection"/> for chaining.</returns>
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Memory cache (fallback for Redis)
        services.AddMemoryCache();

        // Response caching
        services.AddResponseCaching(options =>
        {
            options.MaximumBodySize = 1024 * 1024;
            options.UseCaseSensitivePaths = false;
            options.SizeLimit = 100 * 1024 * 1024;
        });

        // Rate limiting
        services.Configure<AspNetCoreRateLimit.IpRateLimitOptions>(configuration.GetSection("IpRateLimiting"));
        services.Configure<AspNetCoreRateLimit.IpRateLimitPolicies>(configuration.GetSection("IpRateLimitPolicies"));
        services.AddSingleton<AspNetCoreRateLimit.IIpPolicyStore, AspNetCoreRateLimit.MemoryCacheIpPolicyStore>();
        services.AddSingleton<AspNetCoreRateLimit.IRateLimitCounterStore, AspNetCoreRateLimit.MemoryCacheRateLimitCounterStore>();
        services.AddSingleton<AspNetCoreRateLimit.IRateLimitConfiguration, AspNetCoreRateLimit.RateLimitConfiguration>();
        services.AddSingleton<AspNetCoreRateLimit.IProcessingStrategy, AspNetCoreRateLimit.AsyncKeyLockProcessingStrategy>();

        // Redis distributed cache
        AddRedisCache(services, configuration);

        // Elasticsearch
        AddElasticsearch(services, configuration);

        // Response compression
        AddResponseCompression(services);

        return services;
    }

    private static void AddRedisCache(IServiceCollection services, IConfiguration configuration)
    {
        var redisConnectionString = configuration.GetConnectionString("Redis");
        if (!string.IsNullOrEmpty(redisConnectionString))
        {
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = redisConnectionString;
                options.InstanceName = "QualiFlow:";
            });

            services.AddSingleton<StackExchange.Redis.IConnectionMultiplexer>(sp =>
            {
                var config = StackExchange.Redis.ConfigurationOptions.Parse(redisConnectionString);
                config.AbortOnConnectFail = false;
                config.ConnectTimeout = 5000;
                config.SyncTimeout = 5000;
                return StackExchange.Redis.ConnectionMultiplexer.Connect(config);
            });

            services.AddSingleton<QualiFlow.Application.Features.Caching.Services.ICacheService,
                QualiFlow.Infrastructure.Services.RedisCacheService>();
        }
        else
        {
            services.AddSingleton<QualiFlow.Application.Features.Caching.Services.ICacheService,
                QualiFlow.Infrastructure.Services.InMemoryCacheService>();
        }
    }

    private static void AddElasticsearch(IServiceCollection services, IConfiguration configuration)
    {
        var elasticsearchUrl = configuration.GetConnectionString("Elasticsearch");
        if (!string.IsNullOrEmpty(elasticsearchUrl))
        {
            var settings = new Nest.ConnectionSettings(new Uri(elasticsearchUrl))
                .DefaultIndex("qualiflow")
                .EnableApiVersioningHeader()
                .ThrowExceptions(false)
                .PrettyJson();

            var client = new Nest.ElasticClient(settings);
            services.AddSingleton<Nest.IElasticClient>(client);
            services.AddSingleton<QualiFlow.Application.Features.Search.Services.IElasticsearchService,
                QualiFlow.Infrastructure.Services.ElasticsearchService>();
        }
    }

    private static void AddResponseCompression(IServiceCollection services)
    {
        services.AddResponseCompression(options =>
        {
            options.EnableForHttps = true;
            options.Providers.Add<Microsoft.AspNetCore.ResponseCompression.BrotliCompressionProvider>();
            options.Providers.Add<Microsoft.AspNetCore.ResponseCompression.GzipCompressionProvider>();
            options.MimeTypes = Microsoft.AspNetCore.ResponseCompression.ResponseCompressionDefaults.MimeTypes.Concat(new[]
            {
                "application/json", "application/javascript", "text/plain",
                "text/html", "text/css", "text/xml", "application/xml",
            });
        });

        services.Configure<Microsoft.AspNetCore.ResponseCompression.BrotliCompressionProviderOptions>(options =>
            options.Level = System.IO.Compression.CompressionLevel.Optimal);

        services.Configure<Microsoft.AspNetCore.ResponseCompression.GzipCompressionProviderOptions>(options =>
            options.Level = System.IO.Compression.CompressionLevel.Optimal);
    }
}

