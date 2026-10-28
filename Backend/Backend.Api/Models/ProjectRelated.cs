using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Api.Models
{
    [Table("projects")]
    public class Project
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Required]
        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("status")]
        public string Status { get; set; } = "active";

        [Column("priority")]
        public string Priority { get; set; } = "medium";

        [Column("category")]
        public string? Category { get; set; }

        [Column("tags")]
        public string? Tags { get; set; }

        [Column("is_personal")]
        public bool IsPersonal { get; set; } = false;

        [Column("is_growth")]
        public bool IsGrowth { get; set; } = false;

        [Column("budget")]
        public double? Budget { get; set; }

        [Column("hourly_rate")]
        public double? HourlyRate { get; set; }

        [Column("currency")]
        public string Currency { get; set; } = "USD";

        [Column("billing_type")]
        public string BillingType { get; set; } = "hourly";

        [Column("start_date")]
        public DateTime? StartDate { get; set; }

        [Column("expected_end_date")]
        public DateTime? ExpectedEndDate { get; set; }

        [Column("actual_end_date")]
        public DateTime? ActualEndDate { get; set; }

        [Column("progress")]
        public int Progress { get; set; } = 0;

        [Column("client_id")]
        public int? ClientId { get; set; }

        [Column("custom_fields")]
        public string? CustomFields { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("ClientId")]
        public Client? Client { get; set; }

        public ICollection<ProjectPhase> Phases { get; set; } = new List<ProjectPhase>();
        public ICollection<Call> Calls { get; set; } = new List<Call>();
        public ICollection<Sprint> Sprints { get; set; } = new List<Sprint>();
        public ICollection<Communication> Communications { get; set; } = new List<Communication>();
        public ICollection<Task> Tasks { get; set; } = new List<Task>();
        public ICollection<Milestone> Milestones { get; set; } = new List<Milestone>();
        public ICollection<Bug> Bugs { get; set; } = new List<Bug>();
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    }

    [Table("tasks")]
    public class Task
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("project_id")]
        public int? ProjectId { get; set; }

        [Column("user_id")]
        public int UserId { get; set; } = 1;

        [Required]
        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("status")]
        public string Status { get; set; } = "todo";

        [Column("priority")]
        public string Priority { get; set; } = "medium";

        [Column("assignee")]
        public string? Assignee { get; set; }

        [Column("due_date")]
        public DateTime? DueDate { get; set; }

        [Column("start_date")]
        public DateTime? StartDate { get; set; }

        [Column("estimated_hours")]
        public double? EstimatedHours { get; set; }

        [Column("actual_hours")]
        public double ActualHours { get; set; } = 0;

        [Column("progress")]
        public int Progress { get; set; } = 0;

        [Column("is_completed")]
        public bool IsCompleted { get; set; } = false;

        [Column("parent_task_id")]
        public int? ParentTaskId { get; set; }

        [Column("depends_on")]
        public string? DependsOn { get; set; }

        [Column("tags")]
        public string? Tags { get; set; }

        [Column("order")]
        public int Order { get; set; } = 0;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("completed_at")]
        public DateTime? CompletedAt { get; set; }

        [ForeignKey("ProjectId")]
        public Project? Project { get; set; }
    }

    [Table("milestones")]
    public class Milestone
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("project_id")]
        public int? ProjectId { get; set; }

        [Column("user_id")]
        public int UserId { get; set; } = 1;

        [Required]
        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("due_date")]
        public DateTime? DueDate { get; set; }

        [Column("status")]
        public string Status { get; set; } = "pending";

        [Column("is_completed")]
        public bool IsCompleted { get; set; } = false;

        [Column("completed_at")]
        public DateTime? CompletedAt { get; set; }

        [ForeignKey("ProjectId")]
        public Project? Project { get; set; }
    }

    [Table("bugs")]
    public class Bug
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("project_id")]
        public int? ProjectId { get; set; }

        [Column("user_id")]
        public int UserId { get; set; } = 1;

        [Required]
        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("severity")]
        public string Severity { get; set; } = "medium";

        [Column("priority")]
        public string Priority { get; set; } = "medium";

        [Column("status")]
        public string Status { get; set; } = "open";

        [Column("steps_to_reproduce")]
        public string? StepsToReproduce { get; set; }

        [Column("expected_behavior")]
        public string? ExpectedBehavior { get; set; }

        [Column("actual_behavior")]
        public string? ActualBehavior { get; set; }

        [Column("environment")]
        public string? Environment { get; set; }

        [Column("browser")]
        public string? Browser { get; set; }

        [Column("operating_system")]
        public string? OperatingSystem { get; set; }

        [Column("device")]
        public string? Device { get; set; }

        [Column("assignee")]
        public string? Assignee { get; set; }

        [Column("reporter")]
        public string? Reporter { get; set; }

        [Column("attachment_url")]
        public string? AttachmentUrl { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("resolved_at")]
        public DateTime? ResolvedAt { get; set; }

        [Column("closed_at")]
        public DateTime? ClosedAt { get; set; }

        [ForeignKey("ProjectId")]
        public Project? Project { get; set; }
    }

    [Table("project_phases")]
    public class ProjectPhase
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("completed")]
        public bool Completed { get; set; } = false;

        [Column("order")]
        public int Order { get; set; } = 0;

        [Column("start_date")]
        public DateTime? StartDate { get; set; }

        [Column("end_date")]
        public DateTime? EndDate { get; set; }

        [Column("project_id")]
        public int? ProjectId { get; set; }

        [ForeignKey("ProjectId")]
        public Project? Project { get; set; }
    }

    [Table("calls")]
    public class Call
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Column("notes")]
        public string? Notes { get; set; }

        [Column("completed")]
        public bool Completed { get; set; } = false;

        [Column("scheduled_at")]
        public DateTime? ScheduledAt { get; set; }

        [Column("duration")]
        public int? Duration { get; set; }

        [Column("call_type")]
        public string CallType { get; set; } = "general";

        [Column("project_id")]
        public int? ProjectId { get; set; }

        [Column("user_id")]
        public int UserId { get; set; } = 1;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("ProjectId")]
        public Project? Project { get; set; }
    }

    [Table("sprints")]
    public class Sprint
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("goal")]
        public string? Goal { get; set; }

        [Column("status")]
        public string Status { get; set; } = "planning";

        [Column("start_date")]
        public DateTime? StartDate { get; set; }

        [Column("end_date")]
        public DateTime? EndDate { get; set; }

        [Column("velocity")]
        public double Velocity { get; set; } = 0;

        [Column("capacity")]
        public double Capacity { get; set; } = 0;

        [Column("project_id")]
        public int? ProjectId { get; set; }

        [Column("user_id")]
        public int UserId { get; set; } = 1;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("ProjectId")]
        public Project? Project { get; set; }
    }

    [Table("personal_todos")]
    public class PersonalTodo
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Required]
        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("status")]
        public string Status { get; set; } = "todo";

        [Column("priority")]
        public string Priority { get; set; } = "medium";

        [Column("due_date")]
        public DateTime? DueDate { get; set; }

        [Column("start_date")]
        public DateTime? StartDate { get; set; }

        [Column("estimated_hours")]
        public double? EstimatedHours { get; set; }

        [Column("actual_hours")]
        public double ActualHours { get; set; } = 0;

        [Column("progress")]
        public int Progress { get; set; } = 0;

        [Column("is_completed")]
        public bool IsCompleted { get; set; } = false;

        [Column("is_recurring")]
        public bool IsRecurring { get; set; } = false;

        [Column("recurrence_pattern")]
        public string? RecurrencePattern { get; set; }

        [Column("context")]
        public string? Context { get; set; }

        [Column("location")]
        public string? Location { get; set; }

        [Column("category")]
        public string? Category { get; set; }

        [Column("tags")]
        public string? Tags { get; set; }

        [Column("is_waiting")]
        public bool IsWaiting { get; set; } = false;

        [Column("waiting_for")]
        public string? WaitingFor { get; set; }

        [Column("is_someday")]
        public bool IsSomeday { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("completed_at")]
        public DateTime? CompletedAt { get; set; }

        [Column("order")]
        public int Order { get; set; } = 0;
    }

    [Table("notifications")]
    public class Notification
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Required]
        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Column("message")]
        public string? Message { get; set; }

        [Required]
        [Column("type")]
        public string Type { get; set; } = string.Empty;

        [Column("related_id")]
        public int RelatedId { get; set; }

        [Required]
        [Column("alert_type")]
        public string AlertType { get; set; } = string.Empty;

        [Column("is_read")]
        public bool IsRead { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("project_id")]
        public int? ProjectId { get; set; }

        [ForeignKey("ProjectId")]
        public Project? Project { get; set; }
    }
}
