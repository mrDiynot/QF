using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCMSEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "blog_posts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    slug = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    excerpt = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    content = table.Column<string>(type: "text", nullable: false),
                    featured_image_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    author_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    author_avatar_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    tags = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    meta_title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    meta_description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    is_published = table.Column<bool>(type: "boolean", nullable: false),
                    published_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_featured = table.Column<bool>(type: "boolean", nullable: false),
                    reading_time_minutes = table.Column<int>(type: "integer", nullable: false),
                    view_count = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_blog_posts", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "cms_pages",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    slug = table.Column<string>(type: "text", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    meta_title = table.Column<string>(type: "text", nullable: true),
                    meta_description = table.Column<string>(type: "text", nullable: true),
                    is_published = table.Column<bool>(type: "boolean", nullable: false),
                    published_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    section = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_cms_pages", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "cms_pricing_add_ons",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    price = table.Column<string>(type: "text", nullable: false),
                    unit = table.Column<string>(type: "text", nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_cms_pricing_add_ons", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "cms_pricing_plans",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    monthly_price = table.Column<string>(type: "text", nullable: false),
                    annual_price = table.Column<string>(type: "text", nullable: true),
                    price_period = table.Column<string>(type: "text", nullable: false),
                    features_json = table.Column<string>(type: "text", nullable: false),
                    is_popular = table.Column<bool>(type: "boolean", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    cta_text = table.Column<string>(type: "text", nullable: false),
                    cta_link = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_cms_pricing_plans", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "feature_modules",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    icon_name = table.Column<string>(type: "text", nullable: false),
                    gradient = table.Column<string>(type: "text", nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    section = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_feature_modules", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "frequently_asked_questions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    question = table.Column<string>(type: "text", nullable: false),
                    answer = table.Column<string>(type: "text", nullable: false),
                    category = table.Column<string>(type: "text", nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    show_on_landing_page = table.Column<bool>(type: "boolean", nullable: false),
                    show_in_help_center = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_frequently_asked_questions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "help_articles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    slug = table.Column<string>(type: "text", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    category = table.Column<string>(type: "text", nullable: false),
                    tags = table.Column<string>(type: "text", nullable: true),
                    is_published = table.Column<bool>(type: "boolean", nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    view_count = table.Column<int>(type: "integer", nullable: false),
                    helpful_count = table.Column<int>(type: "integer", nullable: false),
                    not_helpful_count = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_help_articles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "landing_page_contents",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    section_key = table.Column<string>(type: "text", nullable: false),
                    content_json = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_landing_page_contents", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "landing_page_statistics",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    value = table.Column<string>(type: "text", nullable: false),
                    label = table.Column<string>(type: "text", nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_landing_page_statistics", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "prebuilt_journeys",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    icon_name = table.Column<string>(type: "text", nullable: false),
                    gradient = table.Column<string>(type: "text", nullable: false),
                    background_color = table.Column<string>(type: "text", nullable: false),
                    accent_color = table.Column<string>(type: "text", nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_prebuilt_journeys", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "pricing_feature_comparisons",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    category = table.Column<string>(type: "text", nullable: false),
                    feature_name = table.Column<string>(type: "text", nullable: false),
                    free_flow_value = table.Column<string>(type: "text", nullable: false),
                    smart_flow_value = table.Column<string>(type: "text", nullable: false),
                    ultra_flow_value = table.Column<string>(type: "text", nullable: false),
                    enterprise_value = table.Column<string>(type: "text", nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_pricing_feature_comparisons", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "testimonials",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    quote = table.Column<string>(type: "text", nullable: false),
                    author_name = table.Column<string>(type: "text", nullable: false),
                    author_role = table.Column<string>(type: "text", nullable: false),
                    company_name = table.Column<string>(type: "text", nullable: true),
                    avatar_path = table.Column<string>(type: "text", nullable: true),
                    company_logo_path = table.Column<string>(type: "text", nullable: true),
                    rating = table.Column<int>(type: "integer", nullable: false),
                    is_featured = table.Column<bool>(type: "boolean", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_testimonials", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "trusted_companies",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    logo_path = table.Column<string>(type: "text", nullable: true),
                    website_link = table.Column<string>(type: "text", nullable: true),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_trusted_companies", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_blog_posts_category",
                table: "blog_posts",
                column: "category");

            migrationBuilder.CreateIndex(
                name: "ix_blog_posts_is_featured",
                table: "blog_posts",
                column: "is_featured");

            migrationBuilder.CreateIndex(
                name: "ix_blog_posts_is_published",
                table: "blog_posts",
                column: "is_published");

            migrationBuilder.CreateIndex(
                name: "ix_blog_posts_published_at",
                table: "blog_posts",
                column: "published_at");

            migrationBuilder.CreateIndex(
                name: "ix_blog_posts_slug",
                table: "blog_posts",
                column: "slug",
                unique: true);

            // ========================================================================
            // Seed CMS Data - Landing Page Statistics
            // ========================================================================
            migrationBuilder.Sql(@"
                INSERT INTO landing_page_statistics (id, value, label, display_order, is_active, created_at)
                VALUES
                (gen_random_uuid(), '10M+', 'Leads Qualified', 1, true, NOW()),
                (gen_random_uuid(), '500K+', 'Appointments Booked', 2, true, NOW()),
                (gen_random_uuid(), '98%', 'Customer Satisfaction', 3, true, NOW()),
                (gen_random_uuid(), '24/7', 'AI Availability', 4, true, NOW());
            ");

            // ========================================================================
            // Seed CMS Data - Trusted Companies
            // ========================================================================
            migrationBuilder.Sql(@"
                INSERT INTO trusted_companies (id, name, logo_path, website_link, display_order, is_active, created_at)
                VALUES
                (gen_random_uuid(), 'TechCorp', NULL, NULL, 1, true, NOW()),
                (gen_random_uuid(), 'InnovateCo', NULL, NULL, 2, true, NOW()),
                (gen_random_uuid(), 'GrowthLabs', NULL, NULL, 3, true, NOW()),
                (gen_random_uuid(), 'ScaleUp', NULL, NULL, 4, true, NOW()),
                (gen_random_uuid(), 'NextGen', NULL, NULL, 5, true, NOW()),
                (gen_random_uuid(), 'FutureTech', NULL, NULL, 6, true, NOW());
            ");

            // ========================================================================
            // Seed CMS Data - FAQs
            // ========================================================================
            migrationBuilder.Sql(@"
                INSERT INTO frequently_asked_questions (id, question, answer, category, display_order, is_active, show_on_landing_page, show_in_help_center, created_at)
                VALUES
                (gen_random_uuid(), 'Can I switch plans anytime?', 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we will prorate any charges.', 'Billing', 1, true, true, true, NOW()),
                (gen_random_uuid(), 'Is there a contract or commitment?', 'No contracts required. Monthly plans can be cancelled anytime. Annual plans offer 20% savings with a yearly commitment.', 'Billing', 2, true, true, true, NOW()),
                (gen_random_uuid(), 'What payment methods do you accept?', 'We accept all major credit cards (Visa, MasterCard, Amex) and ACH transfers for Enterprise plans.', 'Billing', 3, true, true, true, NOW()),
                (gen_random_uuid(), 'What happens if I exceed my limits?', 'We will notify you at 80% usage. After that, overage pricing applies automatically - no service interruptions.', 'Usage', 4, true, true, true, NOW()),
                (gen_random_uuid(), 'Do you offer refunds?', 'We offer a 7-day free trial on Free Flow. For paid plans, we provide a 14-day money-back guarantee if you are not satisfied.', 'Billing', 5, true, true, true, NOW()),
                (gen_random_uuid(), 'Can I get a custom Enterprise plan?', 'Absolutely! Contact our sales team to discuss your specific needs. We will create a tailored plan with custom pricing and features.', 'Enterprise', 6, true, true, true, NOW());
            ");

            // ========================================================================
            // Seed CMS Data - Testimonials
            // ========================================================================
            migrationBuilder.Sql(@"
                INSERT INTO testimonials (id, quote, author_name, author_role, company_name, avatar_path, company_logo_path, rating, is_featured, is_active, display_order, created_at)
                VALUES
                (gen_random_uuid(), 'QualiFlow increased our booking rate by 340% in just 3 months. The AI never misses a lead.', 'Sarah Johnson', 'CEO', 'TechStart', NULL, NULL, 5, true, true, 1, NOW()),
                (gen_random_uuid(), 'We used to lose 60% of leads to slow response times. Now our AI responds in seconds, 24/7.', 'Michael Chen', 'Owner', 'GrowthCo', NULL, NULL, 5, true, true, 2, NOW()),
                (gen_random_uuid(), 'The ROI was immediate. We reduced our cost per acquisition by 70% while scaling faster.', 'Emily Rodriguez', 'CMO', 'ScaleUp', NULL, NULL, 5, true, true, 3, NOW());
            ");

            // ========================================================================
            // Seed CMS Data - CMS Pricing Add-Ons
            // ========================================================================
            migrationBuilder.Sql(@"
                INSERT INTO cms_pricing_add_ons (id, title, price, unit, display_order, is_active, created_at)
                VALUES
                (gen_random_uuid(), 'Additional AI Interactions', '$0.012', 'per interaction', 1, true, NOW()),
                (gen_random_uuid(), 'Additional Voice Minutes', '$0.08', 'per minute', 2, true, NOW()),
                (gen_random_uuid(), 'Additional SMS', '$0.015', 'per SMS', 3, true, NOW()),
                (gen_random_uuid(), 'Additional Storage', '$5', 'per 10MB', 4, true, NOW());
            ");

            // ========================================================================
            // Seed CMS Data - Feature Modules (8 Powerful Modules)
            // ========================================================================
            migrationBuilder.Sql(@"
                INSERT INTO feature_modules (id, title, description, icon_name, gradient, display_order, is_active, section, created_at)
                VALUES
                (gen_random_uuid(), 'Omnichannel Lead Capture', 'Web Chat, Forms, QR Codes, SMS, Surveys, Phone, Instagram, Facebook — all in one system', 'MessageSquare', 'from-cyan-400 to-blue-500', 1, true, 0, NOW()),
                (gen_random_uuid(), 'AI Qualification', 'AI understands intent, urgency, service needed, budget, timeline automatically', 'Target', 'from-purple-400 to-pink-500', 2, true, 0, NOW()),
                (gen_random_uuid(), 'Lead Scoring', 'AI scores each lead 0-100 based on intent signals, behavior, and engagement', 'Award', 'from-orange-400 to-red-500', 3, true, 0, NOW()),
                (gen_random_uuid(), 'Smart Booking + Scheduling', 'AI books appointments, sends confirmations, handles reschedules, reduces no-shows', 'Calendar', 'from-green-400 to-emerald-500', 4, true, 0, NOW()),
                (gen_random_uuid(), 'AI Outbound Calling', 'AI instantly calls, qualifies, books appointments, and recovers missed conversations', 'Phone', 'from-blue-400 to-indigo-500', 5, true, 0, NOW()),
                (gen_random_uuid(), 'Journey Automation Engine™', 'Autopilot for entire customer lifecycle - decides next steps automatically', 'Zap', 'from-yellow-400 to-orange-500', 6, true, 0, NOW()),
                (gen_random_uuid(), 'Built-In CRM + AI Segmentation', 'Lightweight CRM with contacts, timeline, lists, tags, scoring, and AI summaries', 'Database', 'from-teal-400 to-cyan-500', 7, true, 0, NOW()),
                (gen_random_uuid(), 'Analytics & Reporting', 'Simple dashboards showing leads, channels, bookings, reviews, and ROI', 'BarChart3', 'from-violet-400 to-purple-500', 8, true, 0, NOW());
            ");

            // ========================================================================
            // Seed CMS Data - Feature Cards (Perfect For Businesses)
            // ========================================================================
            migrationBuilder.Sql(@"
                INSERT INTO feature_modules (id, title, description, icon_name, gradient, display_order, is_active, section, created_at)
                VALUES
                (gen_random_uuid(), 'Appointments', 'Automated booking & scheduling 24/7', 'Calendar', 'from-purple-500 to-indigo-500', 1, true, 1, NOW()),
                (gen_random_uuid(), 'Customer Engagement', 'Multi-channel conversations at scale', 'Users', 'from-green-500 to-emerald-500', 2, true, 1, NOW()),
                (gen_random_uuid(), '24/7 Instant Replies', 'AI responds in seconds, never miss a lead', 'Clock', 'from-blue-500 to-cyan-500', 3, true, 1, NOW()),
                (gen_random_uuid(), 'More Revenue', 'Increase conversions without more staff', 'TrendingUp', 'from-orange-500 to-amber-500', 4, true, 1, NOW());
            ");

            // ========================================================================
            // Seed CMS Data - Lifecycle Steps (Customer Lifecycle Automation)
            // ========================================================================
            migrationBuilder.Sql(@"
                INSERT INTO feature_modules (id, title, description, icon_name, gradient, display_order, is_active, section, created_at)
                VALUES
                (gen_random_uuid(), 'Lead Captured', '', 'User', 'from-cyan-500 to-blue-600', 1, true, 2, NOW()),
                (gen_random_uuid(), 'AI Responds', '', 'MessageSquare', 'from-purple-500 to-indigo-600', 2, true, 2, NOW()),
                (gen_random_uuid(), 'AI Qualifies', '', 'Target', 'from-green-500 to-emerald-600', 3, true, 2, NOW()),
                (gen_random_uuid(), 'AI Scores', '', 'Trophy', 'from-orange-500 to-amber-600', 4, true, 2, NOW()),
                (gen_random_uuid(), 'AI Books', '', 'Calendar', 'from-pink-500 to-rose-600', 5, true, 2, NOW()),
                (gen_random_uuid(), 'Creates Proposal', '', 'FileText', 'from-indigo-500 to-purple-600', 6, true, 2, NOW()),
                (gen_random_uuid(), 'Assigns Reviewer', '', 'Users', 'from-teal-500 to-cyan-600', 7, true, 2, NOW()),
                (gen_random_uuid(), 'Sends Proposal', '', 'Send', 'from-blue-500 to-indigo-600', 8, true, 2, NOW()),
                (gen_random_uuid(), 'Tracks Acceptance', '', 'CheckCircle', 'from-emerald-500 to-green-600', 9, true, 2, NOW()),
                (gen_random_uuid(), 'AI Follows Up', '', 'RefreshCw', 'from-violet-500 to-purple-600', 10, true, 2, NOW()),
                (gen_random_uuid(), 'Collects Reviews', '', 'Star', 'from-yellow-500 to-orange-600', 11, true, 2, NOW()),
                (gen_random_uuid(), 'CRM Updated', '', 'BarChart3', 'from-blue-600 to-indigo-700', 12, true, 2, NOW());
            ");

            // ========================================================================
            // Seed CMS Data - Prebuilt Journeys (10 Prebuilt Journeys)
            // ========================================================================
            migrationBuilder.Sql(@"
                INSERT INTO prebuilt_journeys (id, title, description, icon_name, gradient, background_color, accent_color, display_order, is_active, created_at)
                VALUES
                (gen_random_uuid(), 'New Lead Qualification → Booking', 'AI responds instantly, qualifies, scores, and books appointments automatically.', 'Target', 'from-green-500 to-emerald-600', 'bg-green-50', 'border-green-200', 1, true, NOW()),
                (gen_random_uuid(), 'Missed Call Recovery', 'When a call is missed, AI sends SMS, email, and can place an outbound call to recover the lead.', 'Phone', 'from-blue-500 to-cyan-600', 'bg-blue-50', 'border-blue-200', 2, true, NOW()),
                (gen_random_uuid(), 'No-Show Recovery', 'Automatically re-engages customers who miss appointments and helps them rebook.', 'RefreshCw', 'from-purple-500 to-violet-600', 'bg-purple-50', 'border-purple-200', 3, true, NOW()),
                (gen_random_uuid(), 'Review + Survey Flow', 'After completed appointments, AI sends thank-you messages, review requests, and surveys.', 'Star', 'from-yellow-500 to-amber-600', 'bg-yellow-50', 'border-yellow-200', 4, true, NOW()),
                (gen_random_uuid(), 'Cold Lead Revival', 'AI reactivates leads who stopped responding using smart timing and personalized messaging.', 'Zap', 'from-pink-500 to-rose-600', 'bg-pink-50', 'border-pink-200', 5, true, NOW()),
                (gen_random_uuid(), 'Retention & Re-Engagement', 'AI targets inactive customers, offers incentives, and brings them back.', 'Users', 'from-indigo-500 to-purple-600', 'bg-indigo-50', 'border-indigo-200', 6, true, NOW()),
                (gen_random_uuid(), 'Proposal Creation + Assignment', 'AI creates proposals, assigns reviewers, and tracks review stages automatically.', 'FileText', 'from-teal-500 to-cyan-600', 'bg-teal-50', 'border-teal-200', 7, true, NOW()),
                (gen_random_uuid(), 'Proposal Sending + Acceptance', 'AI sends proposals, tracks views, accepts/declines, and triggers next actions.', 'Send', 'from-emerald-500 to-teal-600', 'bg-emerald-50', 'border-emerald-200', 8, true, NOW()),
                (gen_random_uuid(), 'Abandoned Form Recovery', 'When someone starts but does not submit a form, AI follows up instantly to recover them.', 'CheckCircle', 'from-orange-500 to-amber-600', 'bg-orange-50', 'border-orange-200', 9, true, NOW()),
                (gen_random_uuid(), 'Post-Purchase Flow', 'After the sale, AI provides onboarding messages, upsell opportunities, and retention touchpoints.', 'Trophy', 'from-violet-500 to-purple-600', 'bg-violet-50', 'border-violet-200', 10, true, NOW());
            ");

            // ========================================================================
            // Seed CMS Data - CMS Pricing Plans (for landing page display)
            // ========================================================================
            migrationBuilder.Sql(@"
                INSERT INTO cms_pricing_plans (id, name, monthly_price, annual_price, price_period, features_json, is_popular, is_active, display_order, cta_text, cta_link, created_at)
                VALUES
                (gen_random_uuid(), 'Free Flow', '$0', '$0', 'per month', '[""50 AI Interactions"",""2 AI Voice Agents"",""5 AI Voice Minutes"",""20 AI SMS"",""3 Prebuilt Journeys"",""Basic Analytics"",""1 Team Member""]', false, true, 1, 'Get Started', '/register', NOW()),
                (gen_random_uuid(), 'SmartFlow', '$49', '$470', 'per month', '[""250 AI Interactions"",""Unlimited AI Voice Agents"",""75 AI Voice Minutes"",""500 AI SMS"",""AI Email"",""10 Prebuilt Journeys"",""Custom Journey Builder"",""Standard Analytics"",""3 Team Members""]', false, true, 2, 'Start Free Trial', '/register', NOW()),
                (gen_random_uuid(), 'UltraFlow', '$149', '$1430', 'per month', '[""1,500 AI Interactions"",""Unlimited AI Voice Agents"",""300 AI Voice Minutes"",""2,500 AI SMS"",""AI Email"",""Unlimited Prebuilt Journeys"",""Custom Journey Builder"",""Advanced Analytics"",""Unlimited Team Members""]', true, true, 3, 'Start Free Trial', '/register', NOW()),
                (gen_random_uuid(), 'Enterprise', 'Custom', NULL, 'pricing', '[""8,000+ AI Interactions"",""Unlimited AI Voice Agents"",""1,500+ AI Voice Minutes"",""7,500+ AI SMS"",""AI Email"",""Unlimited Prebuilt Journeys"",""Custom Journey Builder"",""Custom Analytics"",""Unlimited Team Members""]', false, true, 4, 'Contact Sales', '/contact', NOW());
            ");

            // ========================================================================
            // Seed CMS Data - Pricing Feature Comparisons
            // ========================================================================
            // AI Engagement Category
            migrationBuilder.Sql(@"
                INSERT INTO pricing_feature_comparisons (id, category, feature_name, free_flow_value, smart_flow_value, ultra_flow_value, enterprise_value, display_order, is_active, created_at)
                VALUES
                (gen_random_uuid(), 'AI Engagement', 'AI Interactions', '50', '250', '1,500', '8,000+', 1, true, NOW()),
                (gen_random_uuid(), 'AI Engagement', 'AI Voice Agents', '2', 'Unlimited', 'Unlimited', 'Unlimited', 2, true, NOW()),
                (gen_random_uuid(), 'AI Engagement', 'AI Voice Minutes', '5', '75', '300', '1,500+', 3, true, NOW()),
                (gen_random_uuid(), 'AI Engagement', 'AI SMS', '20', '500', '2,500', '7,500+', 4, true, NOW()),
                (gen_random_uuid(), 'AI Engagement', 'AI Email', '❌', '❌', '✓', '✓', 5, true, NOW()),
                (gen_random_uuid(), 'AI Engagement', 'AI Follow-Ups', 'Basic', 'Standard', 'Advanced', 'Custom', 6, true, NOW());
            ");

            // Automation System Category
            migrationBuilder.Sql(@"
                INSERT INTO pricing_feature_comparisons (id, category, feature_name, free_flow_value, smart_flow_value, ultra_flow_value, enterprise_value, display_order, is_active, created_at)
                VALUES
                (gen_random_uuid(), 'Automation System', 'Prebuilt Journeys', '3', '10', 'Unlimited', 'Unlimited', 7, true, NOW()),
                (gen_random_uuid(), 'Automation System', 'Custom Journey Builder', '❌', '✓', '✓', '✓', 8, true, NOW()),
                (gen_random_uuid(), 'Automation System', 'Conditions, Triggers, Delays', '❌', 'Basic', 'Advanced', 'Advanced', 9, true, NOW());
            ");

            // Booking System Category
            migrationBuilder.Sql(@"
                INSERT INTO pricing_feature_comparisons (id, category, feature_name, free_flow_value, smart_flow_value, ultra_flow_value, enterprise_value, display_order, is_active, created_at)
                VALUES
                (gen_random_uuid(), 'Booking System', 'Smart Calendar', '✓', '✓', '✓', '✓', 10, true, NOW()),
                (gen_random_uuid(), 'Booking System', 'Multi-Calendar Routing', '❌', '❌', '✓', '✓', 11, true, NOW()),
                (gen_random_uuid(), 'Booking System', 'No-Show A.I.', '❌', '✓', '✓', '✓', 12, true, NOW());
            ");

            // Retention & Reviews Category
            migrationBuilder.Sql(@"
                INSERT INTO pricing_feature_comparisons (id, category, feature_name, free_flow_value, smart_flow_value, ultra_flow_value, enterprise_value, display_order, is_active, created_at)
                VALUES
                (gen_random_uuid(), 'Retention & Reviews', 'Review Requests', '❌', '✓', '✓', '✓', 13, true, NOW()),
                (gen_random_uuid(), 'Retention & Reviews', 'Retention AI', '❌', 'Basic', 'Advanced', 'Custom', 14, true, NOW()),
                (gen_random_uuid(), 'Retention & Reviews', 'Winback Sequences', '❌', '❌', '✓', '✓', 15, true, NOW());
            ");

            // CRM Integrations Category
            migrationBuilder.Sql(@"
                INSERT INTO pricing_feature_comparisons (id, category, feature_name, free_flow_value, smart_flow_value, ultra_flow_value, enterprise_value, display_order, is_active, created_at)
                VALUES
                (gen_random_uuid(), 'CRM Integrations', 'HubSpot', '❌', '✓', '✓', '✓', 16, true, NOW()),
                (gen_random_uuid(), 'CRM Integrations', 'Zoho', '❌', '✓', '✓', '✓', 17, true, NOW()),
                (gen_random_uuid(), 'CRM Integrations', 'Salesforce', '❌', '❌', '✓', '✓', 18, true, NOW()),
                (gen_random_uuid(), 'CRM Integrations', 'GoHighLevel', '❌', '✓', '✓', '✓', 19, true, NOW()),
                (gen_random_uuid(), 'CRM Integrations', 'Pipedrive', '❌', '✓', '✓', '✓', 20, true, NOW()),
                (gen_random_uuid(), 'CRM Integrations', 'Monday', '❌', '✓', '✓', '✓', 21, true, NOW());
            ");

            // Communication Channels Category
            migrationBuilder.Sql(@"
                INSERT INTO pricing_feature_comparisons (id, category, feature_name, free_flow_value, smart_flow_value, ultra_flow_value, enterprise_value, display_order, is_active, created_at)
                VALUES
                (gen_random_uuid(), 'Communication Channels', 'Voice', '✓', '✓', '✓', '✓', 22, true, NOW()),
                (gen_random_uuid(), 'Communication Channels', 'SMS', '✓', '✓', '✓', '✓', 23, true, NOW()),
                (gen_random_uuid(), 'Communication Channels', 'Email', '❌', '❌', '✓', '✓', 24, true, NOW()),
                (gen_random_uuid(), 'Communication Channels', 'Webchat', '✓', '✓', '✓', '✓', 25, true, NOW()),
                (gen_random_uuid(), 'Communication Channels', 'Social (FB/IG)', '❌', '❌', '✓', '✓', 26, true, NOW());
            ");

            // Other Platform Features Category
            migrationBuilder.Sql(@"
                INSERT INTO pricing_feature_comparisons (id, category, feature_name, free_flow_value, smart_flow_value, ultra_flow_value, enterprise_value, display_order, is_active, created_at)
                VALUES
                (gen_random_uuid(), 'Other Platform Features', 'Unified Inbox', 'Basic', 'Standard', 'Advanced', 'Enterprise', 27, true, NOW()),
                (gen_random_uuid(), 'Other Platform Features', 'Knowledge Base', '5MB', '20MB', '100MB', '100MB+', 28, true, NOW()),
                (gen_random_uuid(), 'Other Platform Features', 'Analytics', 'Basic', 'Standard', 'Advanced', 'Custom', 29, true, NOW()),
                (gen_random_uuid(), 'Other Platform Features', 'Team Access', '1', '3', 'Unlimited', 'Unlimited', 30, true, NOW()),
                (gen_random_uuid(), 'Other Platform Features', 'Usage Meters', '❌', '✓', '✓', '✓', 31, true, NOW());
            ");

            // ========================================================================
            // Seed CMS Data - Landing Page Content (Hero Section)
            // ========================================================================
            migrationBuilder.Sql(@"
                INSERT INTO landing_page_contents (id, section_key, content_json, is_active, created_at)
                VALUES
                (gen_random_uuid(), 'hero', '{""title"":""AI-Powered Lead Qualification"",""subtitle"":""& Conversation Management"",""description"":""Transform your customer journey with intelligent automation. Capture, qualify, and convert leads 24/7 with AI that never sleeps."",""primaryCta"":{""text"":""Start Free Trial"",""link"":""/register""},""secondaryCta"":{""text"":""Watch Demo"",""link"":""#demo""}}', true, NOW()),
                (gen_random_uuid(), 'lifecycle_header', '{""badge"":""Complete Automation"",""title"":""Customer Lifecycle Automation"",""subtitle"":""From first contact to loyal customer — fully automated""}', true, NOW()),
                (gen_random_uuid(), 'features_header', '{""badge"":""Built for Growth"",""title"":""Perfect For Businesses That Need"",""titleHighlight"":""Scalable Growth"",""description"":""Automate your entire customer journey without hiring more staff""}', true, NOW()),
                (gen_random_uuid(), 'modules_header', '{""badge"":""Comprehensive Platform"",""title"":""8 Powerful Modules"",""description"":""Everything you need to automate your customer journey in one platform""}', true, NOW()),
                (gen_random_uuid(), 'journeys_header', '{""badge"":""Ready-to-Use Workflows"",""title"":""10 Prebuilt Journeys"",""description"":""Turn on powerful automation in seconds — no configuration needed""}', true, NOW()),
                (gen_random_uuid(), 'testimonials_header', '{""badge"":""Success Stories"",""title"":""Loved by Growing"",""titleHighlight"":""Businesses"",""description"":""See how companies are transforming their customer journey with QualiFlow""}', true, NOW()),
                (gen_random_uuid(), 'pricing_header', '{""badge"":""Simple Pricing"",""title"":""Choose Your Plan"",""description"":""Start free, scale as you grow. No hidden fees.""}', true, NOW()),
                (gen_random_uuid(), 'cta_section', '{""title"":""Ready to Transform Your Lead Management?"",""description"":""Join thousands of businesses using QualiFlow to automate their customer journey."",""primaryCta"":{""text"":""Start Your Free Trial"",""link"":""/register""},""note"":""No credit card required • 14-day free trial""}', true, NOW());
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "blog_posts");

            migrationBuilder.DropTable(
                name: "cms_pages");

            migrationBuilder.DropTable(
                name: "cms_pricing_add_ons");

            migrationBuilder.DropTable(
                name: "cms_pricing_plans");

            migrationBuilder.DropTable(
                name: "feature_modules");

            migrationBuilder.DropTable(
                name: "frequently_asked_questions");

            migrationBuilder.DropTable(
                name: "help_articles");

            migrationBuilder.DropTable(
                name: "landing_page_contents");

            migrationBuilder.DropTable(
                name: "landing_page_statistics");

            migrationBuilder.DropTable(
                name: "prebuilt_journeys");

            migrationBuilder.DropTable(
                name: "pricing_feature_comparisons");

            migrationBuilder.DropTable(
                name: "testimonials");

            migrationBuilder.DropTable(
                name: "trusted_companies");
        }
    }
}
