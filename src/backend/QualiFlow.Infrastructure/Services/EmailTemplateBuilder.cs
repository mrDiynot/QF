using System.Diagnostics.CodeAnalysis;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Utility class for building cross-platform compatible email templates.
/// Uses table-based layout for maximum email client compatibility.
/// </summary>
[SuppressMessage("Design", "CA1054:URI parameters should not be strings", Justification = "URLs are used in HTML templates")]
[SuppressMessage("SonarAnalyzer.CSharp", "S1075:URIs should not be hardcoded", Justification = "Email templates require hardcoded URLs")]
public static class EmailTemplateBuilder
{
    private const string FontStack = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
    private const string PrimaryColor = "#6366f1";
    private const string SecondaryColor = "#8b5cf6";
    private const string TextColor = "#1e293b";
    private const string MutedColor = "#64748b";
    private const string BackgroundColor = "#f4f4f5";
    private const string CardBackground = "#ffffff";

    /// <summary>
    /// Horizontal divider HTML constant.
    /// </summary>
    public const string DividerHtml = """
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 24px 0;">
            <tr>
                <td style="border-top: 1px solid #e2e8f0;"></td>
            </tr>
        </table>
        """;

    /// <summary>
    /// Wraps email content in a cross-platform compatible template.
    /// </summary>
    /// <param name="title">The email title for the HTML title tag.</param>
    /// <param name="content">The email body content.</param>
    /// <returns>Complete HTML email template.</returns>
    public static string WrapInTemplate(string title, string content)
    {
        return $$"""
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="x-apple-disable-message-reformatting" />
                <title>{{title}}</title>
                <!--[if mso]>
                <style type="text/css">
                    table, td, div, p, a { font-family: Arial, sans-serif; }
                </style>
                <![endif]-->
            </head>
            <body style="margin: 0; padding: 0; background-color: {{BackgroundColor}}; font-family: {{FontStack}};">
                <!-- Wrapper table for full width background -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: {{BackgroundColor}};">
                    <tr>
                        <td align="center" style="padding: 40px 20px;">
                            <!-- Content container -->
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%;">
                                <tr>
                                    <td style="background-color: {{CardBackground}}; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                        <!-- Inner padding table -->
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding: 40px;">
                                                    {{content}}
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <!-- Footer -->
                                <tr>
                                    <td style="padding: 24px 0; text-align: center;">
                                        <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                                            © 2025 QualiFlow. All rights reserved.<br />
                                            <a href="https://qualiflow.com/unsubscribe" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a> |
                                            <a href="https://qualiflow.com/privacy" style="color: #94a3b8; text-decoration: underline;">Privacy Policy</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """;
    }

    /// <summary>
    /// Creates a centered header with title.
    /// </summary>
    /// <param name="title">The header title text.</param>
    /// <param name="emoji">Optional emoji to prepend to the title.</param>
    /// <returns>HTML table element with centered header.</returns>
    public static string Header(string title, string? emoji = null)
    {
        var displayTitle = emoji != null ? $"{emoji} {title}" : title;
        return $"""
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                    <td align="center" style="padding-bottom: 30px;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: {PrimaryColor};">{displayTitle}</h1>
                    </td>
                </tr>
            </table>
            """;
    }

    /// <summary>
    /// Creates a paragraph of text.
    /// </summary>
    /// <param name="text">The paragraph text content.</param>
    /// <param name="muted">If true, uses muted color for the text.</param>
    /// <param name="fontSize">Font size in pixels.</param>
    /// <returns>HTML paragraph element.</returns>
    public static string Paragraph(string text, bool muted = false, int fontSize = 16)
    {
        var color = muted ? MutedColor : TextColor;
        return $"""
            <p style="margin: 0 0 16px 0; font-size: {fontSize}px; line-height: 1.6; color: {color};">{text}</p>
            """;
    }

    /// <summary>
    /// Creates a greeting paragraph.
    /// </summary>
    /// <param name="name">The recipient's name.</param>
    /// <returns>HTML paragraph element with greeting.</returns>
    public static string Greeting(string name)
    {
        return $"""
            <p style="margin: 0 0 16px 0; font-size: 18px; color: {TextColor};">Hi {name},</p>
            """;
    }

    /// <summary>
    /// Creates a highlighted box with gradient background.
    /// </summary>
    /// <param name="title">The box title.</param>
    /// <param name="content">The box content HTML.</param>
    /// <returns>HTML table element with gradient background.</returns>
    public static string HighlightBox(string title, string content)
    {
        return $"""
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                    <td style="background: linear-gradient(135deg, {PrimaryColor} 0%, {SecondaryColor} 100%); border-radius: 12px; padding: 24px;">
                        <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #ffffff; font-weight: bold;">{title}</h2>
                        {content}
                    </td>
                </tr>
            </table>
            """;
    }

    /// <summary>
    /// Creates a bullet list for use inside highlight boxes.
    /// </summary>
    /// <param name="items">The list items.</param>
    /// <returns>HTML unordered list element.</returns>
    public static string BulletList(params string[] items)
    {
        var listItems = string.Join("\n", items.Select(item => $"<li style=\"margin-bottom: 8px;\">{item}</li>"));
        return $"""
            <ul style="margin: 0; padding-left: 20px; color: #ffffff; line-height: 1.8;">
                {listItems}
            </ul>
            """;
    }

    /// <summary>
    /// Creates a numbered list with optional action links for use inside highlight boxes.
    /// </summary>
    /// <param name="items">Tuples of (content, optional action URL). URLs can be absolute (http/https) or relative.</param>
    /// <returns>HTML ordered list element with styled numbered items.</returns>
    public static string NumberedList(params (string content, string? actionUrl)[] items)
    {
        var listItems = string.Join("\n", items.Select(item =>
        {
            if (string.IsNullOrEmpty(item.actionUrl))
            {
                return $"<li style=\"margin-bottom: 12px;\">{item.content}</li>";
            }

            // Use URL as-is if it's already absolute, otherwise it's used as passed
            var href = item.actionUrl;
            var actionLink = $" <a href=\"{href}\" style=\"color: #a5b4fc; text-decoration: underline;\">Go →</a>";
            return $"<li style=\"margin-bottom: 12px;\">{item.content}{actionLink}</li>";
        }));
        return $"""
            <ol style="margin: 0; padding-left: 20px; color: #ffffff; line-height: 1.8;">
                {listItems}
            </ol>
            """;
    }

    /// <summary>
    /// Creates a centered call-to-action button.
    /// </summary>
    /// <param name="text">The button text.</param>
    /// <param name="url">The button link URL.</param>
    /// <returns>HTML table element with styled button link.</returns>
    public static string Button(string text, string url)
    {
        return $"""
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                    <td align="center">
                        <!--[if mso]>
                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{url}" style="height:48px;v-text-anchor:middle;width:200px;" arcsize="17%" strokecolor="{PrimaryColor}" fillcolor="{PrimaryColor}">
                            <w:anchorlock/>
                            <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">{text}</center>
                        </v:roundrect>
                        <![endif]-->
                        <!--[if !mso]><!-->
                        <a href="{url}" style="display: inline-block; background: linear-gradient(135deg, {PrimaryColor} 0%, {SecondaryColor} 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">{text}</a>
                        <!--<![endif]-->
                    </td>
                </tr>
            </table>
            """;
    }

    /// <summary>
    /// Creates an info box with light background.
    /// </summary>
    /// <param name="title">The info box title.</param>
    /// <param name="content">The info box content HTML.</param>
    /// <returns>HTML table element with light background.</returns>
    public static string InfoBox(string title, string content)
    {
        return $"""
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                    <td style="background-color: #f8fafc; border-radius: 8px; padding: 20px;">
                        <h3 style="margin: 0 0 12px 0; font-size: 16px; color: {TextColor}; font-weight: bold;">{title}</h3>
                        {content}
                    </td>
                </tr>
            </table>
            """;
    }

    /// <summary>
    /// Creates a link list for resources.
    /// </summary>
    /// <param name="links">Array of tuples containing link text and URL.</param>
    /// <returns>HTML unordered list element with links.</returns>
    public static string LinkList(params (string text, string url)[] links)
    {
        var listItems = string.Join("\n", links.Select(link =>
            $"<li style=\"margin-bottom: 8px;\"><a href=\"{link.url}\" style=\"color: {PrimaryColor}; text-decoration: underline;\">{link.text}</a></li>"));
        return $"""
            <ul style="margin: 0; padding-left: 20px; color: {MutedColor}; line-height: 1.8; font-size: 14px;">
                {listItems}
            </ul>
            """;
    }

    /// <summary>
    /// Creates a large OTP code display.
    /// </summary>
    /// <param name="code">The OTP code to display.</param>
    /// <returns>HTML table element with styled OTP code.</returns>
    public static string OtpCode(string code)
    {
        return $"""
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 24px 0;">
                <tr>
                    <td align="center">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border-radius: 12px; border: 2px dashed #e2e8f0;">
                            <tr>
                                <td style="padding: 24px 48px;">
                                    <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: {PrimaryColor}; font-family: 'Courier New', monospace;">{code}</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            """;
    }

    /// <summary>
    /// Creates a security notice.
    /// </summary>
    /// <param name="text">The security notice text.</param>
    /// <returns>HTML table element with warning-styled notice.</returns>
    public static string SecurityNotice(string text)
    {
        return $"""
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 24px;">
                <tr>
                    <td style="background-color: #fef3c7; border-radius: 8px; padding: 16px; border-left: 4px solid #f59e0b;">
                        <p style="margin: 0; font-size: 14px; color: #92400e;">
                            <strong>🔒 Security Notice:</strong> {text}
                        </p>
                    </td>
                </tr>
            </table>
            """;
    }

    /// <summary>
    /// Creates a horizontal divider.
    /// </summary>
    /// <returns>HTML table element with horizontal line.</returns>
    public static string Divider() => DividerHtml;

    /// <summary>
    /// Creates a signature block.
    /// </summary>
    /// <param name="signOff">The sign-off text (e.g., "Best regards").</param>
    /// <param name="teamName">The team or sender name.</param>
    /// <returns>HTML paragraph element with signature.</returns>
    public static string Signature(string signOff, string teamName)
    {
        return $"""
            <p style="margin: 24px 0 0 0; font-size: 14px; color: {MutedColor};">
                {signOff}<br />
                <strong>{teamName}</strong>
            </p>
            """;
    }
}

