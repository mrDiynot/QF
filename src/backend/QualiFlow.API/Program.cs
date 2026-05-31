using QualiFlow.API.Extensions;
using Serilog;

// ============================================================================
// QualiFlow API — Composition Root
// ============================================================================

var builder = WebApplication.CreateBuilder(args);

// 1. Logging (Serilog, Sentry, Azure Key Vault)
builder.AddSerilogLogging();
builder.AddSentryMonitoring();
builder.AddAzureKeyVault();

// 2. Infrastructure (Caching, Redis, Elasticsearch, Compression, Rate Limiting)
builder.Services.AddInfrastructureServices(builder.Configuration);

// 3. Database (EF Core + PostgreSQL/pgvector, Identity)
builder.Services.AddDatabase(builder.Configuration, builder.Environment);
builder.Services.AddIdentityServices();

// 4. Authentication & Authorization (JWT, Admin JWT, Policies)
builder.Services.AddQualiFlowAuthentication(builder.Configuration, builder.Environment);

// 5. API Services (Controllers, Versioning, Swagger, CORS, HSTS, SignalR, Health Checks)
builder.Services.AddApiServices(builder.Configuration, builder.Environment);

// 6. Application Services (Repositories, Services, External Integrations)
builder.Services.AddApplicationServices(builder.Configuration, builder.Environment);

// 7. Background Jobs (Hangfire, Workflow Core)
builder.Services.AddBackgroundJobs(builder.Configuration, builder.Environment);

// ============================================================================
// Build & Configure Pipeline
// ============================================================================

var app = builder.Build();

app.ConfigureMiddlewarePipeline();

// Initialize database (migrations + seeding)
await app.InitializeDatabaseAsync();

// Run the application
try
{
    Log.Information("Starting QualiFlow API");
    await app.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "QualiFlow API terminated unexpectedly");
}
finally
{
    await Log.CloseAndFlushAsync();
}
