# ============================================================================
# QualiFlow Backend API - Multi-stage Dockerfile
# ============================================================================
# Build: docker build -t qualiflow-api .
# Run:   docker run -p 5000:8080 qualiflow-api
# ============================================================================

# Stage 1: Build (using Azure Linux variant for better Azure compatibility)
FROM mcr.microsoft.com/dotnet/sdk:10.0-azurelinux3.0 AS build
WORKDIR /src

# Copy all source code
COPY . .

# Restore, build, and publish (API project only - excludes test projects)
RUN dotnet restore QualiFlow.API/QualiFlow.API.csproj
RUN dotnet build QualiFlow.API/QualiFlow.API.csproj -c Release --no-restore
RUN dotnet publish QualiFlow.API/QualiFlow.API.csproj -c Release -o /app/publish --no-build

# Stage 2: Runtime (using Azure Linux variant for better Azure compatibility)
FROM mcr.microsoft.com/dotnet/aspnet:10.0-azurelinux3.0 AS runtime
WORKDIR /app

# Install curl and shadow-utils for health checks and user management (Azure Linux uses tdnf)
RUN tdnf install -y curl shadow-utils && tdnf clean all

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy published application
COPY --from=build /app/publish .

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port (Azure App Service expects 8080)
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_RUNNING_IN_CONTAINER=true

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Disable diagnostics that can cause issues on some platforms
ENV DOTNET_EnableDiagnostics=0
ENV COMPlus_EnableDiagnostics=0

# Entry point
ENTRYPOINT ["dotnet", "QualiFlow.API.dll"]
