// -----------------------------------------------------------------------
// <copyright file="IAIModelSelector.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Features.AI.DTOs;

namespace QualiFlow.Application.Features.AI.Interfaces;

/// <summary>
/// Service for selecting the optimal AI model based on task type and cost optimization.
/// </summary>
public interface IAIModelSelector
{
    /// <summary>
    /// Selects the optimal model for a given task type.
    /// </summary>
    /// <param name="taskType">The type of AI task.</param>
    /// <param name="businessId">Optional business ID for custom configurations.</param>
    /// <returns>The model selection with configuration.</returns>
    AIModelSelection SelectModel(AITaskType taskType, Guid? businessId = null);

    /// <summary>
    /// Gets the current AI model configuration.
    /// </summary>
    /// <param name="businessId">Optional business ID for custom configurations.</param>
    /// <returns>The AI model configuration.</returns>
    AIModelConfiguration GetConfiguration(Guid? businessId = null);

    /// <summary>
    /// Estimates the cost for a given prompt and task type.
    /// </summary>
    /// <param name="prompt">The prompt text.</param>
    /// <param name="taskType">The type of AI task.</param>
    /// <param name="estimatedOutputTokens">Estimated output tokens.</param>
    /// <returns>Estimated cost in USD.</returns>
    decimal EstimateCost(string prompt, AITaskType taskType, int estimatedOutputTokens = 500);
}
