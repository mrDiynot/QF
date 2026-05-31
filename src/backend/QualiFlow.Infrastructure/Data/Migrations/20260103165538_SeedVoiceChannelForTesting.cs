using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class SeedVoiceChannelForTesting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Seed Voice channel with toll-free number for inbound call testing
            // Links to first business in database
            migrationBuilder.Sql(@"
                INSERT INTO channels (id, business_id, type, name, phone_number, is_active, configuration, verification_status, created_at)
                SELECT 
                    gen_random_uuid(),
                    (SELECT id FROM businesses ORDER BY created_at LIMIT 1),
                    2, -- ChannelType.Voice
                    'AI Voice - Toll Free',
                    '+18776765329',
                    true,
                    '{}',
                    'Verified',
                    NOW()
                WHERE NOT EXISTS (
                    SELECT 1 FROM channels WHERE phone_number = '+18776765329'
                )
                AND EXISTS (SELECT 1 FROM businesses);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM channels WHERE phone_number = '+18776765329';
            ");
        }
    }
}
