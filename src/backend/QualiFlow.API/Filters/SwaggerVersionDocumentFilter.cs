// -----------------------------------------------------------------------
// <copyright file="OpenApiVersionTransformer.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace QualiFlow.API.Filters;

/// <summary>
/// Swagger document filter that substitutes {version} in paths with the actual version number
/// and removes version parameters from operations.
/// </summary>
public sealed class SwaggerVersionDocumentFilter : IDocumentFilter
{
    /// <summary>
    /// Applies the filter to the Swagger document.
    /// </summary>
    /// <param name="swaggerDoc">The Swagger document.</param>
    /// <param name="context">The document filter context.</param>
    public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
    {
        if (swaggerDoc.Paths is null || swaggerDoc.Info?.Version is null)
        {
            return;
        }

        // Get paths that contain version placeholder
        var pathsToUpdate = swaggerDoc.Paths
            .Where(p => p.Key.Contains("{version}", StringComparison.OrdinalIgnoreCase))
            .ToList();

        foreach (var path in pathsToUpdate)
        {
            // Replace {version} with just the version number (e.g., "1" not "v1")
            // since the route already has "v" prefix: api/v{version}/...
            var versionNumber = swaggerDoc.Info.Version.TrimStart('v', 'V');
            var newKey = path.Key.Replace("{version}", versionNumber, StringComparison.OrdinalIgnoreCase);
            swaggerDoc.Paths.Remove(path.Key);
            swaggerDoc.Paths.Add(newKey, path.Value);

            // Remove version parameter from all operations in this path
            var versionParams = path.Value.Operations.Values
                .SelectMany(op => op.Parameters)
                .Where(p => p.Name.Equals("version", StringComparison.OrdinalIgnoreCase))
                .ToList();

            foreach (var versionParam in versionParams)
            {
                foreach (var operation in path.Value.Operations.Values)
                {
                    operation.Parameters.Remove(versionParam);
                }
            }
        }
    }
}

