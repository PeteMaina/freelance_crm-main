using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Api.Models
{
    [Table("clients")]
    public class Client
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Required]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("email")]
        public string? Email { get; set; }

        [Column("phone")]
        public string? Phone { get; set; }

        [Column("company")]
        public string? Company { get; set; }

        [Column("address")]
        public string? Address { get; set; }

        [Column("industry")]
        public string? Industry { get; set; }

        [Column("source")]
        public string? Source { get; set; }

        [Column("status")]
        public string Status { get; set; } = "active";

        [Column("rating")]
        public int Rating { get; set; } = 0;

        [Column("budget_range_min")]
        public double? BudgetRangeMin { get; set; }

        [Column("budget_range_max")]
        public double? BudgetRangeMax { get; set; }

        [Column("timezone")]
        public string? Timezone { get; set; }

        [Column("language")]
        public string Language { get; set; } = "en";

        [Column("notes")]
        public string? Notes { get; set; }

        [Column("tags")]
        public string? Tags { get; set; }

        [Column("avatar_url")]
        public string? AvatarUrl { get; set; }

        [Column("lifetime_value")]
        public double LifetimeValue { get; set; } = 0;

        [Column("total_revenue")]
        public double TotalRevenue { get; set; } = 0;

        [Column("project_count")]
        public int ProjectCount { get; set; } = 0;

        [Column("health_score")]
        public int HealthScore { get; set; } = 100;

        [Column("engagement_score")]
        public int EngagementScore { get; set; } = 0;

        [Column("satisfaction_score")]
        public int SatisfactionScore { get; set; } = 0;

        [Column("communication_frequency")]
        public int CommunicationFrequency { get; set; } = 0;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("last_contacted")]
        public DateTime? LastContacted { get; set; }

        [Column("contract_expiry")]
        public DateTime? ContractExpiry { get; set; }

        [Column("custom_fields")]
        public string? CustomFields { get; set; }

        [Column("payment_terms")]
        public string PaymentTerms { get; set; } = "net30";

        [Column("average_project_value")]
        public double AverageProjectValue { get; set; } = 0;

        [Column("magic_link_token")]
        public string? MagicLinkToken { get; set; }

        [Column("magic_link_password")]
        public string? MagicLinkPassword { get; set; }

        [Column("magic_link_expires_at")]
        public DateTime? MagicLinkExpiresAt { get; set; }

        public ICollection<Project> Projects { get; set; } = new List<Project>();
        public ICollection<ClientContact> Contacts { get; set; } = new List<ClientContact>();
        public ICollection<ClientContract> Contracts { get; set; } = new List<ClientContract>();
        public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
        public ICollection<Communication> Communications { get; set; } = new List<Communication>();
    }
}
