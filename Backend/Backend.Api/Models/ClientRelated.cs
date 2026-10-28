using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Api.Models
{
    [Table("client_contacts")]
    public class ClientContact
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; } = 1;

        [Column("client_id")]
        public int? ClientId { get; set; }

        [Required]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("email")]
        public string? Email { get; set; }

        [Column("phone")]
        public string? Phone { get; set; }

        [Column("role")]
        public string? Role { get; set; }

        [Column("is_primary")]
        public bool IsPrimary { get; set; } = false;

        [ForeignKey("ClientId")]
        public Client? Client { get; set; }
    }

    [Table("client_contracts")]
    public class ClientContract
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; } = 1;

        [Column("client_id")]
        public int? ClientId { get; set; }

        [Required]
        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("start_date")]
        public DateTime? StartDate { get; set; }

        [Column("end_date")]
        public DateTime? EndDate { get; set; }

        [Column("value")]
        public double Value { get; set; } = 0;

        [Column("status")]
        public string Status { get; set; } = "draft";

        [Column("document_url")]
        public string? DocumentUrl { get; set; }

        [ForeignKey("ClientId")]
        public Client? Client { get; set; }
    }

    [Table("invoices")]
    public class Invoice
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; } = 1;

        [Column("client_id")]
        public int? ClientId { get; set; }

        [Required]
        [Column("invoice_number")]
        public string InvoiceNumber { get; set; } = string.Empty;

        [Column("amount")]
        public double Amount { get; set; } = 0;

        [Column("status")]
        public string Status { get; set; } = "pending";

        [Column("issue_date")]
        public DateTime? IssueDate { get; set; }

        [Column("due_date")]
        public DateTime? DueDate { get; set; }

        [Column("paid_date")]
        public DateTime? PaidDate { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [ForeignKey("ClientId")]
        public Client? Client { get; set; }
    }

    [Table("communications")]
    public class Communication
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; } = 1;

        [Column("client_id")]
        public int? ClientId { get; set; }

        [Column("project_id")]
        public int? ProjectId { get; set; }

        [Required]
        [Column("type")]
        public string Type { get; set; } = string.Empty;

        [Required]
        [Column("direction")]
        public string Direction { get; set; } = string.Empty;

        [Column("subject")]
        public string? Subject { get; set; }

        [Column("notes")]
        public string? Notes { get; set; }

        [Column("duration")]
        public int? Duration { get; set; }

        [Column("occurred_at")]
        public DateTime OccurredAt { get; set; } = DateTime.UtcNow;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("ClientId")]
        public Client? Client { get; set; }

        [ForeignKey("ProjectId")]
        public Project? Project { get; set; }
    }
}
