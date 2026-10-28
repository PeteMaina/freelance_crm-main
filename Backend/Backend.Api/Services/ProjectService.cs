using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Data;
using Backend.Api.DTOs;
using Backend.Api.Models;
using Task = System.Threading.Tasks.Task;

namespace Backend.Api.Services
{
    public interface IProjectService
    {
        Task<ProjectResponseDto> CreateProjectAsync(ProjectCreateDto dto, int userId);
        Task<List<ProjectResponseDto>> GetProjectsAsync(int userId, int skip = 0, int limit = 100, string? search = null, string? status = null, int? clientId = null, bool? isPersonal = null, bool? isGrowth = null, string? priority = null);
        Task<ProjectDetailDto?> GetProjectDetailAsync(int projectId, int userId);
        Task<ProjectResponseDto?> GetProjectAsync(int projectId, int userId);
        Task<ProjectResponseDto?> UpdateProjectAsync(int projectId, ProjectUpdateDto dto, int userId);
        Task<bool> DeleteProjectAsync(int projectId, int userId);

        Task<PhaseResponseDto> CreatePhaseAsync(PhaseCreateDto dto, int userId);
        Task<List<PhaseResponseDto>> GetPhasesAsync(int projectId, int userId);
        Task<PhaseResponseDto?> UpdatePhaseAsync(int phaseId, PhaseUpdateDto dto, int userId);
        Task<PhaseResponseDto?> TogglePhaseAsync(int phaseId, int userId);
        Task<bool> DeletePhaseAsync(int phaseId, int userId);

        Task<TaskResponseDto> CreateTaskAsync(TaskCreateDto dto, int userId);
        Task<List<TaskResponseDto>> GetTasksAsync(int? projectId, int userId, string? status = null, string? priority = null, string? assignee = null);
        Task<TaskResponseDto?> GetTaskAsync(int taskId, int userId);
        Task<TaskResponseDto?> UpdateTaskAsync(int taskId, TaskUpdateDto dto, int userId);
        Task<TaskResponseDto?> ToggleTaskAsync(int taskId, int userId);
        Task<bool> DeleteTaskAsync(int taskId, int userId);

        Task<MilestoneResponseDto> CreateMilestoneAsync(MilestoneCreateDto dto, int userId);
        Task<List<MilestoneResponseDto>> GetMilestonesAsync(int? projectId, int userId);
        Task<MilestoneResponseDto?> UpdateMilestoneAsync(int milestoneId, MilestoneUpdateDto dto, int userId);
        Task<MilestoneResponseDto?> ToggleMilestoneAsync(int milestoneId, int userId);
        Task<bool> DeleteMilestoneAsync(int milestoneId, int userId);

        Task<BugResponseDto> CreateBugAsync(BugCreateDto dto, int userId);
        Task<List<BugResponseDto>> GetBugsAsync(int? projectId, int userId, string? status = null, string? severity = null, string? priority = null);
        Task<BugResponseDto?> GetBugAsync(int bugId, int userId);
        Task<BugResponseDto?> UpdateBugAsync(int bugId, BugUpdateDto dto, int userId);
        Task<bool> DeleteBugAsync(int bugId, int userId);

        Task<Dictionary<string, object>?> GetProjectAnalyticsAsync(int projectId, int userId);
    }

    public class ProjectService : IProjectService
    {
        private static readonly string[] StandardPhases = new[]
        {
            "Discovery",
            "Requirements",
            "Design",
            "Development",
            "Testing",
            "Deployment",
            "Maintenance"
        };

        private readonly ActivaDbContext _db;

        public ProjectService(ActivaDbContext db)
        {
            _db = db;
        }

        public async Task<ProjectResponseDto> CreateProjectAsync(ProjectCreateDto dto, int userId)
        {
            var project = new Project
            {
                UserId = userId,
                Title = dto.Title,
                Description = dto.Description,
                Status = dto.Status ?? "active",
                Priority = dto.Priority ?? "medium",
                Category = dto.Category,
                Tags = dto.Tags,
                IsPersonal = dto.IsPersonal,
                IsGrowth = dto.IsGrowth,
                Budget = dto.Budget,
                HourlyRate = dto.HourlyRate,
                Currency = dto.Currency ?? "USD",
                BillingType = dto.BillingType ?? "hourly",
                StartDate = dto.StartDate,
                ExpectedEndDate = dto.ExpectedEndDate,
                ClientId = dto.ClientId,
                CustomFields = dto.CustomFields,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Projects.Add(project);
            await _db.SaveChangesAsync();

            for (int idx = 0; idx < StandardPhases.Length; idx++)
            {
                var phase = new ProjectPhase
                {
                    Name = StandardPhases[idx],
                    ProjectId = project.Id,
                    Order = idx
                };
                _db.ProjectPhases.Add(phase);
            }
            await _db.SaveChangesAsync();

            return MapToResponseDto(project);
        }

        public async Task<List<ProjectResponseDto>> GetProjectsAsync(int userId, int skip = 0, int limit = 100, string? search = null, string? status = null, int? clientId = null, bool? isPersonal = null, bool? isGrowth = null, string? priority = null)
        {
            var query = _db.Projects.Where(p => p.UserId == userId);

            if (!string.IsNullOrWhiteSpace(search))
            {
                string term = search.ToLower();
                query = query.Where(p => p.Title.ToLower().Contains(term) || (p.Description != null && p.Description.ToLower().Contains(term)));
            }

            if (!string.IsNullOrWhiteSpace(status)) query = query.Where(p => p.Status == status);
            if (clientId.HasValue) query = query.Where(p => p.ClientId == clientId.Value);
            if (isPersonal.HasValue) query = query.Where(p => p.IsPersonal == isPersonal.Value);
            if (isGrowth.HasValue) query = query.Where(p => p.IsGrowth == isGrowth.Value);
            if (!string.IsNullOrWhiteSpace(priority)) query = query.Where(p => p.Priority == priority);

            var projects = await query.OrderByDescending(p => p.CreatedAt)
                                      .Skip(skip)
                                      .Take(limit)
                                      .ToListAsync();

            return projects.Select(MapToResponseDto).ToList();
        }

        public async Task<ProjectResponseDto?> GetProjectAsync(int projectId, int userId)
        {
            var p = await _db.Projects.FirstOrDefaultAsync(x => x.Id == projectId && x.UserId == userId);
            return p == null ? null : MapToResponseDto(p);
        }

        public async Task<ProjectDetailDto?> GetProjectDetailAsync(int projectId, int userId)
        {
            var p = await _db.Projects
                .Include(x => x.Phases)
                .Include(x => x.Tasks)
                .Include(x => x.Milestones)
                .Include(x => x.Bugs)
                .FirstOrDefaultAsync(x => x.Id == projectId && x.UserId == userId);

            if (p == null) return null;

            return new ProjectDetailDto
            {
                Id = p.Id,
                UserId = p.UserId,
                Title = p.Title,
                Description = p.Description,
                Status = p.Status,
                Priority = p.Priority,
                Category = p.Category,
                Tags = p.Tags,
                IsPersonal = p.IsPersonal,
                IsGrowth = p.IsGrowth,
                Budget = p.Budget,
                HourlyRate = p.HourlyRate,
                Currency = p.Currency,
                BillingType = p.BillingType,
                StartDate = p.StartDate,
                ExpectedEndDate = p.ExpectedEndDate,
                ActualEndDate = p.ActualEndDate,
                Progress = p.Progress,
                ClientId = p.ClientId,
                CustomFields = p.CustomFields,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                Phases = p.Phases.OrderBy(ph => ph.Order).Select(MapPhaseDto).ToList(),
                Tasks = p.Tasks.OrderBy(t => t.Order).Select(MapTaskDto).ToList(),
                Milestones = p.Milestones.OrderBy(m => m.DueDate).Select(MapMilestoneDto).ToList(),
                Bugs = p.Bugs.OrderByDescending(b => b.CreatedAt).Select(MapBugDto).ToList()
            };
        }

        public async Task<ProjectResponseDto?> UpdateProjectAsync(int projectId, ProjectUpdateDto dto, int userId)
        {
            var p = await _db.Projects.FirstOrDefaultAsync(x => x.Id == projectId && x.UserId == userId);
            if (p == null) return null;

            if (dto.Title != null) p.Title = dto.Title;
            if (dto.Description != null) p.Description = dto.Description;
            if (dto.Status != null) p.Status = dto.Status;
            if (dto.Priority != null) p.Priority = dto.Priority;
            if (dto.Category != null) p.Category = dto.Category;
            if (dto.Tags != null) p.Tags = dto.Tags;
            if (dto.IsPersonal.HasValue) p.IsPersonal = dto.IsPersonal.Value;
            if (dto.IsGrowth.HasValue) p.IsGrowth = dto.IsGrowth.Value;
            if (dto.Budget.HasValue) p.Budget = dto.Budget;
            if (dto.HourlyRate.HasValue) p.HourlyRate = dto.HourlyRate;
            if (dto.Currency != null) p.Currency = dto.Currency;
            if (dto.BillingType != null) p.BillingType = dto.BillingType;
            if (dto.StartDate.HasValue) p.StartDate = dto.StartDate;
            if (dto.ExpectedEndDate.HasValue) p.ExpectedEndDate = dto.ExpectedEndDate;
            if (dto.ActualEndDate.HasValue) p.ActualEndDate = dto.ActualEndDate;
            if (dto.Progress.HasValue) p.Progress = dto.Progress.Value;
            if (dto.ClientId.HasValue) p.ClientId = dto.ClientId;
            if (dto.CustomFields != null) p.CustomFields = dto.CustomFields;

            p.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return MapToResponseDto(p);
        }

        public async Task<bool> DeleteProjectAsync(int projectId, int userId)
        {
            var p = await _db.Projects.FirstOrDefaultAsync(x => x.Id == projectId && x.UserId == userId);
            if (p == null) return false;

            _db.Projects.Remove(p);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<PhaseResponseDto> CreatePhaseAsync(PhaseCreateDto dto, int userId)
        {
            var phase = new ProjectPhase
            {
                Name = dto.Name,
                Description = dto.Description,
                Order = dto.Order,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                ProjectId = dto.ProjectId
            };

            _db.ProjectPhases.Add(phase);
            await _db.SaveChangesAsync();

            return MapPhaseDto(phase);
        }

        public async Task<List<PhaseResponseDto>> GetPhasesAsync(int projectId, int userId)
        {
            var phases = await _db.ProjectPhases
                .Where(p => p.ProjectId == projectId)
                .OrderBy(p => p.Order)
                .ToListAsync();

            return phases.Select(MapPhaseDto).ToList();
        }

        public async Task<PhaseResponseDto?> UpdatePhaseAsync(int phaseId, PhaseUpdateDto dto, int userId)
        {
            var phase = await _db.ProjectPhases.Include(p => p.Project).FirstOrDefaultAsync(p => p.Id == phaseId);
            if (phase == null || (phase.Project != null && phase.Project.UserId != userId)) return null;

            if (dto.Name != null) phase.Name = dto.Name;
            if (dto.Description != null) phase.Description = dto.Description;
            if (dto.Completed.HasValue) phase.Completed = dto.Completed.Value;
            if (dto.Order.HasValue) phase.Order = dto.Order.Value;
            if (dto.StartDate.HasValue) phase.StartDate = dto.StartDate;
            if (dto.EndDate.HasValue) phase.EndDate = dto.EndDate;

            await RecalculatePhaseProgressAsync(phase.ProjectId);
            await _db.SaveChangesAsync();

            return MapPhaseDto(phase);
        }

        public async Task<PhaseResponseDto?> TogglePhaseAsync(int phaseId, int userId)
        {
            var phase = await _db.ProjectPhases.Include(p => p.Project).FirstOrDefaultAsync(p => p.Id == phaseId);
            if (phase == null || (phase.Project != null && phase.Project.UserId != userId)) return null;

            phase.Completed = !phase.Completed;
            await RecalculatePhaseProgressAsync(phase.ProjectId);
            await _db.SaveChangesAsync();

            return MapPhaseDto(phase);
        }

        public async Task<bool> DeletePhaseAsync(int phaseId, int userId)
        {
            var phase = await _db.ProjectPhases.Include(p => p.Project).FirstOrDefaultAsync(p => p.Id == phaseId);
            if (phase == null || (phase.Project != null && phase.Project.UserId != userId)) return false;

            int? projId = phase.ProjectId;
            _db.ProjectPhases.Remove(phase);
            await _db.SaveChangesAsync();

            if (projId.HasValue) await RecalculatePhaseProgressAsync(projId);
            return true;
        }

        public async Task<TaskResponseDto> CreateTaskAsync(TaskCreateDto dto, int userId)
        {
            var task = new Models.Task
            {
                UserId = userId,
                ProjectId = dto.ProjectId,
                Title = dto.Title,
                Description = dto.Description,
                Status = dto.Status ?? "todo",
                Priority = dto.Priority ?? "medium",
                Assignee = dto.Assignee,
                DueDate = dto.DueDate,
                StartDate = dto.StartDate,
                EstimatedHours = dto.EstimatedHours,
                ParentTaskId = dto.ParentTaskId,
                DependsOn = dto.DependsOn,
                Tags = dto.Tags,
                Order = dto.Order,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Tasks.Add(task);
            await _db.SaveChangesAsync();

            if (task.ProjectId.HasValue) await RecalculateTaskProgressAsync(task.ProjectId.Value);

            return MapTaskDto(task);
        }

        public async Task<List<TaskResponseDto>> GetTasksAsync(int? projectId, int userId, string? status = null, string? priority = null, string? assignee = null)
        {
            var query = _db.Tasks.Where(t => t.UserId == userId);

            if (projectId.HasValue) query = query.Where(t => t.ProjectId == projectId.Value);
            if (!string.IsNullOrWhiteSpace(status)) query = query.Where(t => t.Status == status);
            if (!string.IsNullOrWhiteSpace(priority)) query = query.Where(t => t.Priority == priority);
            if (!string.IsNullOrWhiteSpace(assignee)) query = query.Where(t => t.Assignee == assignee);

            var list = await query.OrderBy(t => t.Order).ToListAsync();
            return list.Select(MapTaskDto).ToList();
        }

        public async Task<TaskResponseDto?> GetTaskAsync(int taskId, int userId)
        {
            var t = await _db.Tasks.FirstOrDefaultAsync(x => x.Id == taskId && x.UserId == userId);
            return t == null ? null : MapTaskDto(t);
        }

        public async Task<TaskResponseDto?> UpdateTaskAsync(int taskId, TaskUpdateDto dto, int userId)
        {
            var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);
            if (task == null) return null;

            if (dto.Title != null) task.Title = dto.Title;
            if (dto.Description != null) task.Description = dto.Description;
            if (dto.Priority != null) task.Priority = dto.Priority;
            if (dto.Assignee != null) task.Assignee = dto.Assignee;
            if (dto.DueDate.HasValue) task.DueDate = dto.DueDate;
            if (dto.StartDate.HasValue) task.StartDate = dto.StartDate;
            if (dto.EstimatedHours.HasValue) task.EstimatedHours = dto.EstimatedHours;
            if (dto.ActualHours.HasValue) task.ActualHours = dto.ActualHours.Value;
            if (dto.Progress.HasValue) task.Progress = dto.Progress.Value;
            if (dto.ParentTaskId.HasValue) task.ParentTaskId = dto.ParentTaskId;
            if (dto.DependsOn != null) task.DependsOn = dto.DependsOn;
            if (dto.Tags != null) task.Tags = dto.Tags;
            if (dto.Order.HasValue) task.Order = dto.Order.Value;

            if (dto.Status == "done" || dto.IsCompleted == true)
            {
                task.IsCompleted = true;
                task.Status = "done";
                task.Progress = 100;
                if (!task.CompletedAt.HasValue) task.CompletedAt = DateTime.UtcNow;
            }
            else if ((dto.Status == "todo" || dto.Status == "in_progress") || dto.IsCompleted == false)
            {
                task.IsCompleted = false;
                if (dto.Status != null) task.Status = dto.Status;
                if (task.Progress == 100) task.Progress = 0;
                task.CompletedAt = null;
            }

            task.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            if (task.ProjectId.HasValue) await RecalculateTaskProgressAsync(task.ProjectId.Value);

            return MapTaskDto(task);
        }

        public async Task<TaskResponseDto?> ToggleTaskAsync(int taskId, int userId)
        {
            var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);
            if (task == null) return null;

            task.IsCompleted = !task.IsCompleted;
            task.Status = task.IsCompleted ? "done" : "todo";
            task.Progress = task.IsCompleted ? 100 : 0;
            task.CompletedAt = task.IsCompleted ? DateTime.UtcNow : null;
            task.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            if (task.ProjectId.HasValue) await RecalculateTaskProgressAsync(task.ProjectId.Value);

            return MapTaskDto(task);
        }

        public async Task<bool> DeleteTaskAsync(int taskId, int userId)
        {
            var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);
            if (task == null) return false;

            int? projId = task.ProjectId;
            _db.Tasks.Remove(task);
            await _db.SaveChangesAsync();

            if (projId.HasValue) await RecalculateTaskProgressAsync(projId.Value);

            return true;
        }

        public async Task<MilestoneResponseDto> CreateMilestoneAsync(MilestoneCreateDto dto, int userId)
        {
            var ms = new Milestone
            {
                UserId = userId,
                ProjectId = dto.ProjectId,
                Title = dto.Title,
                Description = dto.Description,
                DueDate = dto.DueDate,
                Status = dto.Status ?? "pending",
                IsCompleted = false
            };

            _db.Milestones.Add(ms);
            await _db.SaveChangesAsync();

            return MapMilestoneDto(ms);
        }

        public async Task<List<MilestoneResponseDto>> GetMilestonesAsync(int? projectId, int userId)
        {
            var query = _db.Milestones.Where(m => m.UserId == userId);
            if (projectId.HasValue) query = query.Where(m => m.ProjectId == projectId.Value);

            var list = await query.OrderBy(m => m.DueDate).ToListAsync();
            return list.Select(MapMilestoneDto).ToList();
        }

        public async Task<MilestoneResponseDto?> UpdateMilestoneAsync(int milestoneId, MilestoneUpdateDto dto, int userId)
        {
            var ms = await _db.Milestones.FirstOrDefaultAsync(m => m.Id == milestoneId && m.UserId == userId);
            if (ms == null) return null;

            if (dto.Title != null) ms.Title = dto.Title;
            if (dto.Description != null) ms.Description = dto.Description;
            if (dto.DueDate.HasValue) ms.DueDate = dto.DueDate;
            if (dto.Status != null) ms.Status = dto.Status;
            if (dto.IsCompleted.HasValue)
            {
                ms.IsCompleted = dto.IsCompleted.Value;
                if (ms.IsCompleted && !ms.CompletedAt.HasValue)
                {
                    ms.CompletedAt = DateTime.UtcNow;
                    ms.Status = "completed";
                }
            }

            await _db.SaveChangesAsync();
            return MapMilestoneDto(ms);
        }

        public async Task<MilestoneResponseDto?> ToggleMilestoneAsync(int milestoneId, int userId)
        {
            var ms = await _db.Milestones.FirstOrDefaultAsync(m => m.Id == milestoneId && m.UserId == userId);
            if (ms == null) return null;

            ms.IsCompleted = !ms.IsCompleted;
            ms.Status = ms.IsCompleted ? "completed" : "pending";
            ms.CompletedAt = ms.IsCompleted ? DateTime.UtcNow : null;

            await _db.SaveChangesAsync();
            return MapMilestoneDto(ms);
        }

        public async Task<bool> DeleteMilestoneAsync(int milestoneId, int userId)
        {
            var ms = await _db.Milestones.FirstOrDefaultAsync(m => m.Id == milestoneId && m.UserId == userId);
            if (ms == null) return false;

            _db.Milestones.Remove(ms);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<BugResponseDto> CreateBugAsync(BugCreateDto dto, int userId)
        {
            var bug = new Bug
            {
                UserId = userId,
                ProjectId = dto.ProjectId,
                Title = dto.Title,
                Description = dto.Description,
                Severity = dto.Severity ?? "medium",
                Priority = dto.Priority ?? "medium",
                Status = dto.Status ?? "open",
                StepsToReproduce = dto.StepsToReproduce,
                ExpectedBehavior = dto.ExpectedBehavior,
                ActualBehavior = dto.ActualBehavior,
                Environment = dto.Environment,
                Browser = dto.Browser,
                OperatingSystem = dto.OperatingSystem,
                Device = dto.Device,
                Assignee = dto.Assignee,
                Reporter = dto.Reporter,
                AttachmentUrl = dto.AttachmentUrl,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Bugs.Add(bug);
            await _db.SaveChangesAsync();

            return MapBugDto(bug);
        }

        public async Task<List<BugResponseDto>> GetBugsAsync(int? projectId, int userId, string? status = null, string? severity = null, string? priority = null)
        {
            var query = _db.Bugs.Where(b => b.UserId == userId);

            if (projectId.HasValue) query = query.Where(b => b.ProjectId == projectId.Value);
            if (!string.IsNullOrWhiteSpace(status)) query = query.Where(b => b.Status == status);
            if (!string.IsNullOrWhiteSpace(severity)) query = query.Where(b => b.Severity == severity);
            if (!string.IsNullOrWhiteSpace(priority)) query = query.Where(b => b.Priority == priority);

            var list = await query.OrderByDescending(b => b.CreatedAt).ToListAsync();
            return list.Select(MapBugDto).ToList();
        }

        public async Task<BugResponseDto?> GetBugAsync(int bugId, int userId)
        {
            var b = await _db.Bugs.FirstOrDefaultAsync(x => x.Id == bugId && x.UserId == userId);
            return b == null ? null : MapBugDto(b);
        }

        public async Task<BugResponseDto?> UpdateBugAsync(int bugId, BugUpdateDto dto, int userId)
        {
            var bug = await _db.Bugs.FirstOrDefaultAsync(b => b.Id == bugId && b.UserId == userId);
            if (bug == null) return null;

            if (dto.Title != null) bug.Title = dto.Title;
            if (dto.Description != null) bug.Description = dto.Description;
            if (dto.Severity != null) bug.Severity = dto.Severity;
            if (dto.Priority != null) bug.Priority = dto.Priority;
            if (dto.Status != null) bug.Status = dto.Status;
            if (dto.StepsToReproduce != null) bug.StepsToReproduce = dto.StepsToReproduce;
            if (dto.ExpectedBehavior != null) bug.ExpectedBehavior = dto.ExpectedBehavior;
            if (dto.ActualBehavior != null) bug.ActualBehavior = dto.ActualBehavior;
            if (dto.Environment != null) bug.Environment = dto.Environment;
            if (dto.Browser != null) bug.Browser = dto.Browser;
            if (dto.OperatingSystem != null) bug.OperatingSystem = dto.OperatingSystem;
            if (dto.Device != null) bug.Device = dto.Device;
            if (dto.Assignee != null) bug.Assignee = dto.Assignee;
            if (dto.Reporter != null) bug.Reporter = dto.Reporter;
            if (dto.AttachmentUrl != null) bug.AttachmentUrl = dto.AttachmentUrl;

            if (dto.Status == "resolved" && !bug.ResolvedAt.HasValue) bug.ResolvedAt = DateTime.UtcNow;
            else if (dto.Status == "closed" && !bug.ClosedAt.HasValue) bug.ClosedAt = DateTime.UtcNow;

            bug.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return MapBugDto(bug);
        }

        public async Task<bool> DeleteBugAsync(int bugId, int userId)
        {
            var bug = await _db.Bugs.FirstOrDefaultAsync(b => b.Id == bugId && b.UserId == userId);
            if (bug == null) return false;

            _db.Bugs.Remove(bug);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<Dictionary<string, object>?> GetProjectAnalyticsAsync(int projectId, int userId)
        {
            var project = await _db.Projects
                .Include(p => p.Tasks)
                .Include(p => p.Bugs)
                .Include(p => p.Phases)
                .FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);

            if (project == null) return null;

            var tasks = project.Tasks ?? new List<Models.Task>();
            var bugs = project.Bugs ?? new List<Bug>();
            var phases = project.Phases ?? new List<ProjectPhase>();

            return new Dictionary<string, object>
            {
                { "total_tasks", tasks.Count },
                { "completed_tasks", tasks.Count(t => t.IsCompleted) },
                { "in_progress_tasks", tasks.Count(t => t.Status == "in_progress") },
                { "todo_tasks", tasks.Count(t => t.Status == "todo") },
                { "total_bugs", bugs.Count },
                { "open_bugs", bugs.Count(b => b.Status == "open") },
                { "resolved_bugs", bugs.Count(b => b.Status == "resolved") },
                { "critical_bugs", bugs.Count(b => b.Severity == "critical") },
                { "total_hours", tasks.Sum(t => t.ActualHours) },
                { "estimated_hours", tasks.Sum(t => t.EstimatedHours ?? 0) },
                { "progress", project.Progress },
                { "phases_completed", phases.Count(p => p.Completed) },
                { "total_phases", phases.Count }
            };
        }

        private async Task RecalculatePhaseProgressAsync(int? projectId)
        {
            if (!projectId.HasValue) return;

            var project = await _db.Projects.Include(p => p.Phases).FirstOrDefaultAsync(p => p.Id == projectId.Value);
            if (project == null || !project.Phases.Any()) return;

            int completedCount = project.Phases.Count(p => p.Completed);
            project.Progress = (int)Math.Round((double)completedCount / project.Phases.Count * 100);
            await _db.SaveChangesAsync();
        }

        private async Task RecalculateTaskProgressAsync(int projectId)
        {
            var project = await _db.Projects.Include(p => p.Tasks).FirstOrDefaultAsync(p => p.Id == projectId);
            if (project == null || !project.Tasks.Any()) return;

            int completedCount = project.Tasks.Count(t => t.IsCompleted);
            project.Progress = (int)Math.Round((double)completedCount / project.Tasks.Count * 100);
            await _db.SaveChangesAsync();
        }

        private static ProjectResponseDto MapToResponseDto(Project p)
        {
            return new ProjectResponseDto
            {
                Id = p.Id,
                UserId = p.UserId,
                Title = p.Title,
                Description = p.Description,
                Status = p.Status,
                Priority = p.Priority,
                Category = p.Category,
                Tags = p.Tags,
                IsPersonal = p.IsPersonal,
                IsGrowth = p.IsGrowth,
                Budget = p.Budget,
                HourlyRate = p.HourlyRate,
                Currency = p.Currency,
                BillingType = p.BillingType,
                StartDate = p.StartDate,
                ExpectedEndDate = p.ExpectedEndDate,
                ActualEndDate = p.ActualEndDate,
                Progress = p.Progress,
                ClientId = p.ClientId,
                CustomFields = p.CustomFields,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            };
        }

        private static PhaseResponseDto MapPhaseDto(ProjectPhase ph) => new PhaseResponseDto
        {
            Id = ph.Id,
            Name = ph.Name,
            Description = ph.Description,
            Completed = ph.Completed,
            Order = ph.Order,
            StartDate = ph.StartDate,
            EndDate = ph.EndDate,
            ProjectId = ph.ProjectId
        };

        private static TaskResponseDto MapTaskDto(Models.Task t) => new TaskResponseDto
        {
            Id = t.Id,
            ProjectId = t.ProjectId,
            UserId = t.UserId,
            Title = t.Title,
            Description = t.Description,
            Status = t.Status,
            Priority = t.Priority,
            Assignee = t.Assignee,
            DueDate = t.DueDate,
            StartDate = t.StartDate,
            EstimatedHours = t.EstimatedHours,
            ActualHours = t.ActualHours,
            Progress = t.Progress,
            IsCompleted = t.IsCompleted,
            ParentTaskId = t.ParentTaskId,
            DependsOn = t.DependsOn,
            Tags = t.Tags,
            Order = t.Order,
            CreatedAt = t.CreatedAt,
            UpdatedAt = t.UpdatedAt,
            CompletedAt = t.CompletedAt
        };

        private static MilestoneResponseDto MapMilestoneDto(Milestone m) => new MilestoneResponseDto
        {
            Id = m.Id,
            ProjectId = m.ProjectId,
            UserId = m.UserId,
            Title = m.Title,
            Description = m.Description,
            DueDate = m.DueDate,
            Status = m.Status,
            IsCompleted = m.IsCompleted,
            CompletedAt = m.CompletedAt
        };

        private static BugResponseDto MapBugDto(Bug b) => new BugResponseDto
        {
            Id = b.Id,
            ProjectId = b.ProjectId,
            UserId = b.UserId,
            Title = b.Title,
            Description = b.Description,
            Severity = b.Severity,
            Priority = b.Priority,
            Status = b.Status,
            StepsToReproduce = b.StepsToReproduce,
            ExpectedBehavior = b.ExpectedBehavior,
            ActualBehavior = b.ActualBehavior,
            Environment = b.Environment,
            Browser = b.Browser,
            OperatingSystem = b.OperatingSystem,
            Device = b.Device,
            Assignee = b.Assignee,
            Reporter = b.Reporter,
            AttachmentUrl = b.AttachmentUrl,
            CreatedAt = b.CreatedAt,
            UpdatedAt = b.UpdatedAt,
            ResolvedAt = b.ResolvedAt,
            ClosedAt = b.ClosedAt
        };
    }
}
