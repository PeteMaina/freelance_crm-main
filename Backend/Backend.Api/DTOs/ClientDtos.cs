using System;
using System.Collections.Generic;

namespace Backend.Api.DTOs
{
    public class ClientCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Company { get; set; }
        public string? Address { get; set; }
        public string? Industry { get; set; }
        public string? Source { get; set; }
        public string Status { get; set; } = "active";
        public int Rating { get; set; } = 0;
        public double? BudgetRangeMin { get; set; }
        public double? BudgetRangeMax { get; set; }
        public string? Timezone { get; set; }
        public string Language { get; set; } = "en";
        public string? Notes { get; set; }
        public string? Tags { get; set; }
        public string? AvatarUrl { get; set; }
        public string PaymentTerms { get; set; } = "net30";
        public string? CustomFields { get; set; }
    }

    public class ClientUpdateDto
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Company { get; set; }
        public string? Address { get; set; }
        public string? Industry { get; set; }
        public string? Source { get; set; }
        public string? Status { get; set; }
        public int? Rating { get; set; }
        public double? BudgetRangeMin { get; set; }
        public double? BudgetRangeMax { get; set; }
        public string? Timezone { get; set; }
        public string? Language { get; set; }
        public string? Notes { get; set; }
        public string? Tags { get; set; }
        public string? AvatarUrl { get; set; }
        public string? PaymentTerms { get; set; }
        public string? CustomFields { get; set; }
    }

    public class ClientResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Company { get; set; }
        public string? Address { get; set; }
        public string? Industry { get; set; }
        public string? Source { get; set; }
        public string Status { get; set; } = "active";
        public int Rating { get; set; } = 0;
        public double? BudgetRangeMin { get; set; }
        public double? BudgetRangeMax { get; set; }
        public string? Timezone { get; set; }
        public string Language { get; set; } = "en";
        public string? Notes { get; set; }
        public string? Tags { get; set; }
        public string? AvatarUrl { get; set; }
        public double LifetimeValue { get; set; }
        public double TotalRevenue { get; set; }
        public int ProjectCount { get; set; }
        public int HealthScore { get; set; }
        public int EngagementScore { get; set; }
        public int SatisfactionScore { get; set; }
        public int CommunicationFrequency { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? LastContacted { get; set; }
        public DateTime? ContractExpiry { get; set; }
        public string? CustomFields { get; set; }
        public string PaymentTerms { get; set; } = "net30";
        public double AverageProjectValue { get; set; }
        public string? MagicLinkToken { get; set; }
        public string? MagicLinkPassword { get; set; }
        public DateTime? MagicLinkExpiresAt { get; set; }
    }

    public class ClientDetailDto : ClientResponseDto
    {
        public List<ProjectResponseDto> Projects { get; set; } = new List<ProjectResponseDto>();
        public List<ClientContactResponseDto> Contacts { get; set; } = new List<ClientContactResponseDto>();
        public List<ClientContractResponseDto> Contracts { get; set; } = new List<ClientContractResponseDto>();
        public List<InvoiceResponseDto> Invoices { get; set; } = new List<InvoiceResponseDto>();
        public List<CommunicationResponseDto> Communications { get; set; } = new List<CommunicationResponseDto>();
    }

    public class ClientContactCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Role { get; set; }
        public bool IsPrimary { get; set; } = false;
        public int? ClientId { get; set; }
    }

    public class ClientContactResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int? ClientId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Role { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class ClientContractCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public double Value { get; set; } = 0;
        public string Status { get; set; } = "draft";
        public string? DocumentUrl { get; set; }
        public int? ClientId { get; set; }
    }

    public class ClientContractResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int? ClientId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public double Value { get; set; }
        public string Status { get; set; } = "draft";
        public string? DocumentUrl { get; set; }
    }

    public class InvoiceCreateDto
    {
        public string InvoiceNumber { get; set; } = string.Empty;
        public double Amount { get; set; } = 0;
        public string Status { get; set; } = "pending";
        public DateTime? IssueDate { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? PaidDate { get; set; }
        public string? Description { get; set; }
        public int? ClientId { get; set; }
    }

    public class InvoiceResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int? ClientId { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public double Amount { get; set; }
        public string Status { get; set; } = "pending";
        public DateTime? IssueDate { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? PaidDate { get; set; }
        public string? Description { get; set; }
    }

    public class CommunicationCreateDto
    {
        public string Type { get; set; } = string.Empty;
        public string Direction { get; set; } = string.Empty;
        public string? Subject { get; set; }
        public string? Notes { get; set; }
        public int? Duration { get; set; }
        public DateTime? OccurredAt { get; set; }
        public int? ClientId { get; set; }
        public int? ProjectId { get; set; }
    }

    public class CommunicationResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int? ClientId { get; set; }
        public int? ProjectId { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Direction { get; set; } = string.Empty;
        public string? Subject { get; set; }
        public string? Notes { get; set; }
        public int? Duration { get; set; }
        public DateTime OccurredAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class MagicLinkLoginDto
    {
        public string Token { get; set; } = string.Empty;
        public string? Password { get; set; }
    }

    public class MagicLinkResponseDto
    {
        public string MagicLinkToken { get; set; } = string.Empty;
        public string? Password { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
