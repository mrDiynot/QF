using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixTwilioChannelVerificationStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Fix existing Twilio channels that are active but have Pending verification status
            // These channels have been successfully provisioned with Twilio resources
            // (they have external_account_id and phone_number set)
            migrationBuilder.Sql(@"
                UPDATE channels
                SET verification_status = 'Verified',
                    last_verified_at = NOW()
                WHERE is_active = true
                  AND external_account_id IS NOT NULL
                  AND phone_number IS NOT NULL
                  AND type IN ('SMS', 'Voice', 'WhatsApp')
                  AND verification_status = 'Pending'
                  AND deleted_at IS NULL;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert back to Pending status (though this is generally not needed)
            migrationBuilder.Sql(@"
                UPDATE channels
                SET verification_status = 'Pending',
                    last_verified_at = NULL
                WHERE verification_status = 'Verified'
                  AND external_account_id IS NOT NULL
                  AND type IN ('SMS', 'Voice', 'WhatsApp')
                  AND deleted_at IS NULL;
            ");
        }
    }
}
