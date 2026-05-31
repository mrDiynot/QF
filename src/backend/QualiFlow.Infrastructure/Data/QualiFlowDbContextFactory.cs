using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace QualiFlow.Infrastructure.Data;

/// <summary>
/// Design-time factory for creating QualiFlowDbContext instances during migrations.
/// This factory is used by EF Core tools (dotnet ef migrations) to create the DbContext
/// without requiring the full application startup and dependency injection.
/// </summary>
public class QualiFlowDbContextFactory : IDesignTimeDbContextFactory<QualiFlowDbContext>
{
    /// <summary>
    /// Creates a new instance of QualiFlowDbContext for design-time operations.
    /// </summary>
    /// <param name="args">Command-line arguments.</param>
    /// <returns>A configured QualiFlowDbContext instance.</returns>
    public QualiFlowDbContext CreateDbContext(string[] args)
    {
        // Build configuration from appsettings.json and user secrets
        // Determine the API project path based on current directory
        var currentDir = Directory.GetCurrentDirectory();
        var apiProjectPath = Path.Combine(currentDir, "..", "QualiFlow.API");

        var configuration = new ConfigurationBuilder()
            .SetBasePath(apiProjectPath)
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddUserSecrets("qualiflow-api-secrets")
            .AddEnvironmentVariables()
            .Build();

        // Get connection string
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        // Configure DbContext options
        var optionsBuilder = new DbContextOptionsBuilder<QualiFlowDbContext>();
        optionsBuilder.UseNpgsql(connectionString, npgsqlOptions =>
        {
            // Enable pgvector extension
            npgsqlOptions.UseVector();

            // Set command timeout (30 seconds)
            npgsqlOptions.CommandTimeout(30);

            // Enable retry on failure (transient fault handling)
            npgsqlOptions.EnableRetryOnFailure(
                maxRetryCount: 3,
                maxRetryDelay: TimeSpan.FromSeconds(5),
                errorCodesToAdd: null);
        })
        .UseSnakeCaseNamingConvention(); // Convert all table/column names to snake_case

        // Create DbContext without ICurrentUserService (null is allowed for migrations)
        return new QualiFlowDbContext(optionsBuilder.Options, currentUserService: null);
    }
}

