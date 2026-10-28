using System;

namespace Backend.Api.DTOs
{
    public class CallCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public DateTime? ScheduledAt { get; set; }
        public int? Duration { get; set; }
        public string CallType { get; set; } = "general";
        public int? ProjectId { get; set; }
    }

    public class CallUpdateDto
    {
        public string? Title { get; set; }
        public string? Notes { get; set; }
        public bool? Completed { get; set; }
        public DateTime? ScheduledAt { get; set; }
        public int? Duration { get; set; }
        public string? CallType { get; set; }
        public int? ProjectId { get; set; }
    }

    public class CallResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public bool Completed { get; set; }
        public DateTime? ScheduledAt { get; set; }
        public int? Duration { get; set; }
        public string CallType { get; set; } = "general";
        public int? ProjectId { get; set; }
        public int UserId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class SprintCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Goal { get; set; }
        public string Status { get; set; } = "planning";
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public double Velocity { get; set; } = 0;
        public double Capacity { get; set; } = 0;
        public int? ProjectId { get; set; }
    }

    public class SprintUpdateDto
    {
        public string? Name { get; set; }
        public string? Goal { get; set; }
        public string? Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public double? Velocity { get; set; }
        public double? Capacity { get; set; }
        public int? ProjectId { get; set; }
    }

    public class SprintResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Goal { get; set; }
        public string Status { get; set; } = "planning";
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public double Velocity { get; set; }
        public double Capacity { get; set; }
        public int? ProjectId { get; set; }
        public int UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class PersonalTodoCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = "todo";
        public string Priority { get; set; } = "medium";
        public DateTime? DueDate { get; set; }
        public DateTime? StartDate { get; set; }
        public double? EstimatedHours { get; set; }
        public bool IsRecurring { get; set; } = false;
        public string? RecurrencePattern { get; set; }
        public string? Context { get; set; }
        public string? Location { get; set; }
        public string? Category { get; set; }
        public string? Tags { get; set; }
        public bool IsWaiting { get; set; } = false;
        public string? WaitingFor { get; set; }
        public bool IsSomeday { get; set; } = false;
        public int Order { get; set; } = 0;
    }

    public class PersonalTodoUpdateDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
        public string? Priority { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? StartDate { get; set; }
        public double? EstimatedHours { get; set; }
        public double? ActualHours { get; set; }
        public int? Progress { get; set; }
        public bool? IsCompleted { get; set; }
        public bool? IsRecurring { get; set; }
        public string? RecurrencePattern { get; set; }
        public string? Context { get; set; }
        public string? Location { get; set; }
        public string? Category { get; set; }
        public string? Tags { get; set; }
        public bool? IsWaiting { get; set; }
        public string? WaitingFor { get; set; }
        public bool? IsSomeday { get; set; }
        public int? Order { get; set; }
    }

    public class PersonalTodoResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = "todo";
        public string Priority { get; set; } = "medium";
        public DateTime? DueDate { get; set; }
        public DateTime? StartDate { get; set; }
        public double? EstimatedHours { get; set; }
        public double ActualHours { get; set; }
        public int Progress { get; set; }
        public bool IsCompleted { get; set; }
        public bool IsRecurring { get; set; }
        public string? RecurrencePattern { get; set; }
        public string? Context { get; set; }
        public string? Location { get; set; }
        public string? Category { get; set; }
        public string? Tags { get; set; }
        public bool IsWaiting { get; set; }
        public string? WaitingFor { get; set; }
        public bool IsSomeday { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int Order { get; set; }
    }

    public class NotificationResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Message { get; set; }
        public string Type { get; set; } = string.Empty;
        public int RelatedId { get; set; }
        public string AlertType { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? ProjectId { get; set; }
    }
}
