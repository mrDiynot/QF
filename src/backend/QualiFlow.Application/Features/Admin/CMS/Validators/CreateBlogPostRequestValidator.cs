using FluentValidation;
using QualiFlow.Application.Features.Admin.CMS.DTOs;

namespace QualiFlow.Application.Features.Admin.CMS.Validators;

/// <summary>
/// Validator for CreateBlogPostRequest.
/// </summary>
public class CreateBlogPostRequestValidator : AbstractValidator<CreateBlogPostRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="CreateBlogPostRequestValidator"/> class.
    /// </summary>
    public CreateBlogPostRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(300).WithMessage("Title must not exceed 300 characters");

        RuleFor(x => x.Slug)
            .MaximumLength(300).WithMessage("Slug must not exceed 300 characters")
            .Matches(@"^[a-z0-9]+(?:-[a-z0-9]+)*$").WithMessage("Slug must be lowercase with hyphens only")
            .When(x => !string.IsNullOrEmpty(x.Slug));

        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Content is required")
            .MaximumLength(500_000).WithMessage("Content must not exceed 500,000 characters");

        RuleFor(x => x.Excerpt)
            .MaximumLength(1000).WithMessage("Excerpt must not exceed 1000 characters")
            .When(x => !string.IsNullOrEmpty(x.Excerpt));

        RuleFor(x => x.AuthorName)
            .NotEmpty().WithMessage("Author name is required")
            .MaximumLength(200).WithMessage("Author name must not exceed 200 characters");

        RuleFor(x => x.FeaturedImagePath)
            .MaximumLength(2000).WithMessage("Featured image path must not exceed 2000 characters")
            .When(x => !string.IsNullOrEmpty(x.FeaturedImagePath));

        RuleFor(x => x.AuthorAvatarPath)
            .MaximumLength(2000).WithMessage("Author avatar path must not exceed 2000 characters")
            .When(x => !string.IsNullOrEmpty(x.AuthorAvatarPath));

        RuleFor(x => x.Category)
            .MaximumLength(100).WithMessage("Category must not exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.Category));

        RuleFor(x => x.MetaTitle)
            .MaximumLength(200).WithMessage("Meta title must not exceed 200 characters")
            .When(x => !string.IsNullOrEmpty(x.MetaTitle));

        RuleFor(x => x.MetaDescription)
            .MaximumLength(500).WithMessage("Meta description must not exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.MetaDescription));

        RuleFor(x => x.Tags)
            .Must(tags => tags == null || tags.Count <= 20)
            .WithMessage("Maximum 20 tags allowed");

        RuleForEach(x => x.Tags)
            .MaximumLength(50).WithMessage("Each tag must not exceed 50 characters")
            .When(x => x.Tags != null && x.Tags.Count > 0);
    }
}

