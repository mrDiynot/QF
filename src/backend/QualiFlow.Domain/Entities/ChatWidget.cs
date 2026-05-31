// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents an embeddable chat widget configuration for a business.
/// </summary>
public class ChatWidget : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID that owns this widget.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the widget display name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the unique widget key for embedding (URL-safe).
    /// </summary>
    public string WidgetKey { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets a value indicating whether this widget is active.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Gets or sets the allowed domains for embedding (comma-separated).
    /// Empty string means all domains are allowed.
    /// </summary>
    public string AllowedDomains { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the primary color (hex code).
    /// </summary>
    public string PrimaryColor { get; set; } = "#6366f1";

    /// <summary>
    /// Gets or sets the widget position (bottom-right, bottom-left).
    /// </summary>
    public string Position { get; set; } = "bottom-right";

    /// <summary>
    /// Gets or sets the greeting message shown to visitors.
    /// </summary>
    public string GreetingMessage { get; set; } = "Hello! How can we help you today?";

    /// <summary>
    /// Gets or sets the offline message when no agents available.
    /// </summary>
    public string OfflineMessage { get; set; } = "We're currently offline. Please leave a message.";

    /// <summary>
    /// Gets or sets a value indicating whether to show the pre-chat form.
    /// </summary>
    public bool ShowPreChatForm { get; set; } = true;

    /// <summary>
    /// Gets or sets the pre-chat form fields as JSON.
    /// </summary>
    public string PreChatFormFieldsJson { get; set; } = "[{\"name\":\"name\",\"label\":\"Name\",\"type\":\"text\",\"required\":true},{\"name\":\"email\",\"label\":\"Email\",\"type\":\"email\",\"required\":true}]";

    /// <summary>
    /// Gets or sets a value indicating whether AI auto-response is enabled.
    /// </summary>
    public bool EnableAIResponse { get; set; } = true;

    /// <summary>
    /// Gets or sets the AI response delay in milliseconds (for natural feel).
    /// </summary>
    public int AIResponseDelayMs { get; set; } = 1500;

    /// <summary>
    /// Gets or sets the business name to use in AI conversations (overrides Business.Name if set).
    /// </summary>
    public string? BusinessName { get; set; }

    /// <summary>
    /// Gets or sets a custom system prompt for AI behavior (overrides default if set).
    /// </summary>
    public string? CustomSystemPrompt { get; set; }

    /// <summary>
    /// Gets or sets the AI personality type (professional, friendly, technical, casual).
    /// </summary>
    public string AiPersonality { get; set; } = "professional";

    /// <summary>
    /// Gets or sets the industry type for specialized prompts (real_estate, saas, consulting, healthcare, legal, ecommerce, other).
    /// </summary>
    public string? IndustryType { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether content moderation is enabled.
    /// </summary>
    public bool EnableContentModeration { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether PII (Personally Identifiable Information) protection is enabled.
    /// </summary>
    public bool EnablePiiProtection { get; set; } = true;

    /// <summary>
    /// Gets or sets the session timeout in minutes.
    /// </summary>
    public int SessionTimeoutMinutes { get; set; } = 30;

    /// <summary>
    /// Gets or sets a value indicating whether to auto-create leads from chat.
    /// </summary>
    public bool AutoCreateLead { get; set; } = true;

    /// <summary>
    /// Gets or sets the business hours as JSON.
    /// </summary>
    public string BusinessHoursJson { get; set; } = "{}";

    /// <summary>
    /// Gets or sets custom CSS for the widget.
    /// </summary>
    public string CustomCss { get; set; } = string.Empty;

    // Navigation properties

    /// <summary>
    /// Gets or sets the business that owns this widget.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets the chat sessions for this widget.
    /// </summary>
    public ICollection<ChatSession> Sessions { get; } = [];
}

