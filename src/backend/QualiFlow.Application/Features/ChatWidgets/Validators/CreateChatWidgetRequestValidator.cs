// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using FluentValidation;
using QualiFlow.Application.Features.ChatWidgets.DTOs;

namespace QualiFlow.Application.Features.ChatWidgets.Validators;

/// <summary>
/// Validator for CreateChatWidgetRequest.
/// </summary>
public class CreateChatWidgetRequestValidator : AbstractValidator<CreateChatWidgetRequest>
{
    public CreateChatWidgetRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Widget name is required")
            .MaximumLength(100).WithMessage("Widget name cannot exceed 100 characters");

        RuleFor(x => x.AllowedDomains)
            .MaximumLength(2000).WithMessage("Allowed domains cannot exceed 2000 characters");

        RuleFor(x => x.PrimaryColor)
            .MaximumLength(20).WithMessage("Primary color cannot exceed 20 characters")
            .Matches(@"^#[0-9A-Fa-f]{6}$").When(x => !string.IsNullOrEmpty(x.PrimaryColor))
            .WithMessage("Primary color must be a valid hex color (e.g., #FF5733)");

        RuleFor(x => x.Position)
            .Must(p => string.IsNullOrEmpty(p) || new[] { "bottom-right", "bottom-left", "top-right", "top-left" }.Contains(p))
            .WithMessage("Position must be one of: bottom-right, bottom-left, top-right, top-left");

        RuleFor(x => x.GreetingMessage)
            .MaximumLength(500).WithMessage("Greeting message cannot exceed 500 characters");

        RuleFor(x => x.OfflineMessage)
            .MaximumLength(500).WithMessage("Offline message cannot exceed 500 characters");

        RuleFor(x => x.SessionTimeoutMinutes)
            .InclusiveBetween(5, 1440).WithMessage("Session timeout must be between 5 and 1440 minutes");

        RuleFor(x => x.CustomCss)
            .MaximumLength(10000).WithMessage("Custom CSS cannot exceed 10000 characters");
    }
}

/// <summary>
/// Validator for UpdateChatWidgetRequest.
/// </summary>
public class UpdateChatWidgetRequestValidator : AbstractValidator<UpdateChatWidgetRequest>
{
    public UpdateChatWidgetRequestValidator()
    {
        RuleFor(x => x.Name)
            .MaximumLength(100).WithMessage("Widget name cannot exceed 100 characters")
            .When(x => x.Name != null);

        RuleFor(x => x.AllowedDomains)
            .MaximumLength(2000).WithMessage("Allowed domains cannot exceed 2000 characters");

        RuleFor(x => x.PrimaryColor)
            .MaximumLength(20).WithMessage("Primary color cannot exceed 20 characters")
            .Matches(@"^#[0-9A-Fa-f]{6}$").When(x => !string.IsNullOrEmpty(x.PrimaryColor))
            .WithMessage("Primary color must be a valid hex color (e.g., #FF5733)");

        RuleFor(x => x.Position)
            .Must(p => string.IsNullOrEmpty(p) || new[] { "bottom-right", "bottom-left", "top-right", "top-left" }.Contains(p))
            .WithMessage("Position must be one of: bottom-right, bottom-left, top-right, top-left");

        RuleFor(x => x.GreetingMessage)
            .MaximumLength(500).WithMessage("Greeting message cannot exceed 500 characters");

        RuleFor(x => x.OfflineMessage)
            .MaximumLength(500).WithMessage("Offline message cannot exceed 500 characters");

        RuleFor(x => x.SessionTimeoutMinutes)
            .InclusiveBetween(5, 1440).WithMessage("Session timeout must be between 5 and 1440 minutes")
            .When(x => x.SessionTimeoutMinutes.HasValue);

        RuleFor(x => x.CustomCss)
            .MaximumLength(10000).WithMessage("Custom CSS cannot exceed 10000 characters");
    }
}

/// <summary>
/// Validator for StartChatSessionRequest.
/// </summary>
public class StartChatSessionRequestValidator : AbstractValidator<StartChatSessionRequest>
{
    public StartChatSessionRequestValidator()
    {
        RuleFor(x => x.WidgetKey)
            .NotEmpty().WithMessage("Widget key is required")
            .MaximumLength(64).WithMessage("Widget key cannot exceed 64 characters");

        RuleFor(x => x.VisitorName)
            .MaximumLength(200).WithMessage("Visitor name cannot exceed 200 characters");

        RuleFor(x => x.VisitorEmail)
            .EmailAddress().When(x => !string.IsNullOrEmpty(x.VisitorEmail))
            .WithMessage("Invalid email format")
            .MaximumLength(255).WithMessage("Email cannot exceed 255 characters");

        RuleFor(x => x.VisitorPhone)
            .MaximumLength(20).WithMessage("Phone cannot exceed 20 characters");

        RuleFor(x => x.PageUrl)
            .MaximumLength(2000).WithMessage("Page URL cannot exceed 2000 characters");
    }
}

/// <summary>
/// Validator for SendChatMessageRequest.
/// </summary>
public class SendChatMessageRequestValidator : AbstractValidator<SendChatMessageRequest>
{
    public SendChatMessageRequestValidator()
    {
        RuleFor(x => x.SessionToken)
            .NotEmpty().WithMessage("Session token is required")
            .MaximumLength(128).WithMessage("Session token cannot exceed 128 characters");

        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Message content is required")
            .MaximumLength(4000).WithMessage("Message content cannot exceed 4000 characters");

        RuleFor(x => x.AttachmentUrls)
            .Must(urls => urls == null || urls.Count <= 10)
            .WithMessage("Cannot attach more than 10 files");
    }
}

