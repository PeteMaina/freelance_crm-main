using System;
using System.Collections.Generic;

namespace Backend.Api.DTOs
{
    public class ProjectCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = "active";
        public string Priority { get; set; } = "medium";
        public string? Category { get; set; }
        public string? Tags { get; set; }
        public bool IsPersonal { get; set; } = false;
        public bool IsGrowth { get; set; } = false;
        public double? Budget { get; set; }
        public double? HourlyRate { get; set; }
        public string Currency { get; set; } = "USD";
        public string BillingType { get; set; } = "hourly";
        public DateTime? StartDate { get; set; }
        public DateTime? ExpectedEndDate { get; set; }
        public int? ClientId { get; set; }
        public string? CustomFields { get; set; }
    }

    public class ProjectUpdateDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
        public string? Priority { get; set; }
        public string? Category { get; set; }
        public string? Tags { get; set; }
        public bool? IsPersonal { get; set; }
        public bool? IsGrowth { get; set; }
        public double? Budget { get; set; }
        public double? HourlyRate { get; set; }
        public string? Currency { get; set; }
        public string? BillingType { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? ExpectedEndDate { get; set; }
        public DateTime? ActualEndDate { get; set; }
        public int? Progress { get; set; }
        public int? ClientId { get; set; }
        public string? CustomFields { get; set; }
    }

    public class ProjectResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = "active";
        public string Priority { get; set; } = "medium";
        public string? Category { get; set; }
        public string? Tags { get; set; }
        public bool IsPersonal { get; set; }
        public bool IsGrowth { get; set; }
        public double? Budget { get; set; }
        public double? HourlyRate { get; set; }
        public string Currency { get; set; } = "USD";
        public string BillingType { get; set; } = "hourly";
        public DateTime? StartDate { get; set; }
        public DateTime? ExpectedEndDate { get; set; }
        public DateTime? ActualEndDate { get; set; }
        public int Progress { get; set; }
        public int? ClientId { get; set; }
        public string? CustomFields { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class ProjectDetailDto : ProjectResponseDto
    {
        public List<PhaseResponseDto> Phases { get; set; } = new List<PhaseResponseDto>();
        public List<TaskResponseDto> Tasks { get; set; } = new List<TaskResponseDto>();
        public List<MilestoneResponseDto> Milestones { get; set; } = new List<MilestoneResponseDto>();
        public List<BugResponseDto> Bugs { get; set; } = new List<BugResponseDto>();
    }

    public class TaskCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = "todo";
        public string Priority { get; set; } = "medium";
        public string? Assignee { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? StartDate { get; set; }
        public double? EstimatedHours { get; set; }
        public int? ParentTaskId { get; set; }
        public string? DependsOn { get; set; }
        public string? Tags { get; set; }
        public int Order { get; set; } = 0;
        public int? ProjectId { get; set; }
    }

    public class TaskUpdateDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
        public string? Priority { get; set; }
        public string? Assignee { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? StartDate { get; set; }
        public double? EstimatedHours { get; set; }
        public double? ActualHours { get; set; }
        public int? Progress { get; set; }
        public bool? IsCompleted { get; set; }
        public int? ParentTaskId { get; set; }
        public string? DependsOn { get; set; }
        public string? Tags { get; set; }
        public int? Order { get; set; }
    }

    public class TaskResponseDto
    {
        public int Id { get; set; }
        public int? ProjectId { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = "todo";
        public string Priority { get; set; } = "medium";
        public string? Assignee { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? StartDate { get; set; }
        public double? EstimatedHours { get; set; }
        public double ActualHours { get; set; }
        public int Progress { get; set; }
        public bool IsCompleted { get; set; }
        public int? ParentTaskId { get; set; }
        public string? DependsOn { get; set; }
        public string? Tags { get; set; }
        public int Order { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

    public class MilestoneCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public string Status { get; set; } = "pending";
        public int? ProjectId { get; set; }
    }

    public class MilestoneUpdateDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public string? Status { get; set; }
        public bool? IsCompleted { get; set; }
    }

    public class MilestoneResponseDto
    {
        public int Id { get; set; }
        public int? ProjectId { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public string Status { get; set; } = "pending";
        public bool IsCompleted { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

    public class BugCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Severity { get; set; } = "medium";
        public string Priority { get; set; } = "medium";
        public string Status { get; set; } = "open";
        public string? StepsToReproduce { get; set; }
        public string? ExpectedBehavior { get; set; }
        public string? ActualBehavior { get; set; }
        public string? Environment { get; set; }
        public string? Browser { get; set; }
        public string? OperatingSystem { get; set; }
        public string? Device { get; set; }
        public string? Assignee { get; set; }
        public string? Reporter { get; set; }
        public string? AttachmentUrl { get; set; }
        public int? ProjectId { get; set; }
    }

    public class BugUpdateDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Severity { get; set; }
        public string? Priority { get; set; }
        public string? Status { get; set; }
        public string? StepsToReproduce { get; set; }
        public string? ExpectedBehavior { get; set; }
        public string? ActualBehavior { get; set; }
        public string? Environment { get; set; }
        public string? Browser { get; set; }
        public string? OperatingSystem { get; set; }
        public string? Device { get; set; }
        public string? Assignee { get; set; }
        public string? Reporter { get; set; }
        public string? AttachmentUrl { get; set; }
    }

    public class BugResponseDto
    {
        public int Id { get; set; }
        public int? ProjectId { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Severity { get; set; } = "medium";
        public string Priority { get; set; } = "medium";
        public string Status { get; set; } = "open";
        public string? StepsToReproduce { get; set; }
        public string? ExpectedBehavior { get; set; }
        public string? ActualBehavior { get; set; }
        public string? Environment { get; set; }
        public string? Browser { get; set; }
        public string? OperatingSystem { get; set; }
        public string? Device { get; set; }
        public string? Assignee { get; set; }
        public string? Reporter { get; set; }
        public string? AttachmentUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public DateTime? ClosedAt { get; set; }
    }

    public class PhaseCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Order { get; set; } = 0;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? ProjectId { get; set; }
    }

    public class PhaseUpdateDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool? Completed { get; set; }
        public int? Order { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class PhaseResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool Completed { get; set; }
        public int Order { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? ProjectId { get; set; }
    }
}
