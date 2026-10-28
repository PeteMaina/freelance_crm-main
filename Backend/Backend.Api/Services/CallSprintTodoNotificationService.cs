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
    public interface ICallSprintTodoNotificationService
    {
        Task<CallResponseDto> CreateCallAsync(CallCreateDto dto, int userId);
        Task<List<CallResponseDto>> GetCallsAsync(int userId, int? projectId = null, bool? completed = null);
        Task<CallResponseDto?> GetCallAsync(int callId, int userId);
        Task<CallResponseDto?> UpdateCallAsync(int callId, CallUpdateDto dto, int userId);
        Task<CallResponseDto?> ToggleCallAsync(int callId, int userId);
        Task<bool> DeleteCallAsync(int callId, int userId);

        Task<SprintResponseDto> CreateSprintAsync(SprintCreateDto dto, int userId);
        Task<List<SprintResponseDto>> GetSprintsAsync(int userId, int? projectId = null, string? status = null);
        Task<SprintResponseDto?> GetSprintAsync(int sprintId, int userId);
        Task<SprintResponseDto?> UpdateSprintAsync(int sprintId, SprintUpdateDto dto, int userId);
        Task<bool> DeleteSprintAsync(int sprintId, int userId);

        Task<PersonalTodoResponseDto> CreatePersonalTodoAsync(PersonalTodoCreateDto dto, int userId);
        Task<List<PersonalTodoResponseDto>> GetPersonalTodosAsync(int userId, string? status = null, string? priority = null, string? category = null, bool? isWaiting = null, bool? isSomeday = null);
        Task<PersonalTodoResponseDto?> GetPersonalTodoAsync(int todoId, int userId);
        Task<PersonalTodoResponseDto?> UpdatePersonalTodoAsync(int todoId, PersonalTodoUpdateDto dto, int userId);
        Task<PersonalTodoResponseDto?> TogglePersonalTodoAsync(int todoId, int userId);
        Task<bool> DeletePersonalTodoAsync(int todoId, int userId);

        Task<List<NotificationResponseDto>> GetNotificationsAsync(int userId);
        Task<NotificationResponseDto?> MarkNotificationAsReadAsync(int notificationId, int userId);
        Task RefreshNotificationsAsync(int userId);
    }

    public class CallSprintTodoNotificationService : ICallSprintTodoNotificationService
    {
        private readonly ActivaDbContext _db;

        public CallSprintTodoNotificationService(ActivaDbContext db)
        {
            _db = db;
        }

        public async Task<CallResponseDto> CreateCallAsync(CallCreateDto dto, int userId)
        {
            var call = new Call
            {
                UserId = userId,
                Title = dto.Title,
                Notes = dto.Notes,
                ScheduledAt = dto.ScheduledAt,
                Duration = dto.Duration,
                CallType = dto.CallType ?? "general",
                ProjectId = dto.ProjectId,
                CreatedAt = DateTime.UtcNow
            };

            _db.Calls.Add(call);
            await _db.SaveChangesAsync();

            return MapCallDto(call);
        }

        public async Task<List<CallResponseDto>> GetCallsAsync(int userId, int? projectId = null, bool? completed = null)
        {
            var query = _db.Calls.Where(c => c.UserId == userId);
            if (projectId.HasValue) query = query.Where(c => c.ProjectId == projectId.Value);
            if (completed.HasValue) query = query.Where(c => c.Completed == completed.Value);

            var list = await query.OrderByDescending(c => c.ScheduledAt ?? c.CreatedAt).ToListAsync();
            return list.Select(MapCallDto).ToList();
        }

        public async Task<CallResponseDto?> GetCallAsync(int callId, int userId)
        {
            var c = await _db.Calls.FirstOrDefaultAsync(x => x.Id == callId && x.UserId == userId);
            return c == null ? null : MapCallDto(c);
        }

        public async Task<CallResponseDto?> UpdateCallAsync(int callId, CallUpdateDto dto, int userId)
        {
            var call = await _db.Calls.FirstOrDefaultAsync(c => c.Id == callId && c.UserId == userId);
            if (call == null) return null;

            if (dto.Title != null) call.Title = dto.Title;
            if (dto.Notes != null) call.Notes = dto.Notes;
            if (dto.Completed.HasValue) call.Completed = dto.Completed.Value;
            if (dto.ScheduledAt.HasValue) call.ScheduledAt = dto.ScheduledAt;
            if (dto.Duration.HasValue) call.Duration = dto.Duration;
            if (dto.CallType != null) call.CallType = dto.CallType;
            if (dto.ProjectId.HasValue) call.ProjectId = dto.ProjectId;

            await _db.SaveChangesAsync();
            return MapCallDto(call);
        }

        public async Task<CallResponseDto?> ToggleCallAsync(int callId, int userId)
        {
            var call = await _db.Calls.FirstOrDefaultAsync(c => c.Id == callId && c.UserId == userId);
            if (call == null) return null;

            call.Completed = !call.Completed;
            await _db.SaveChangesAsync();
            return MapCallDto(call);
        }

        public async Task<bool> DeleteCallAsync(int callId, int userId)
        {
            var call = await _db.Calls.FirstOrDefaultAsync(c => c.Id == callId && c.UserId == userId);
            if (call == null) return false;

            _db.Calls.Remove(call);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<SprintResponseDto> CreateSprintAsync(SprintCreateDto dto, int userId)
        {
            var sprint = new Sprint
            {
                UserId = userId,
                Name = dto.Name,
                Goal = dto.Goal,
                Status = dto.Status ?? "planning",
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Velocity = dto.Velocity,
                Capacity = dto.Capacity,
                ProjectId = dto.ProjectId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Sprints.Add(sprint);
            await _db.SaveChangesAsync();

            return MapSprintDto(sprint);
        }

        public async Task<List<SprintResponseDto>> GetSprintsAsync(int userId, int? projectId = null, string? status = null)
        {
            var query = _db.Sprints.Where(s => s.UserId == userId);
            if (projectId.HasValue) query = query.Where(s => s.ProjectId == projectId.Value);
            if (!string.IsNullOrWhiteSpace(status)) query = query.Where(s => s.Status == status);

            var list = await query.OrderByDescending(s => s.CreatedAt).ToListAsync();
            return list.Select(MapSprintDto).ToList();
        }

        public async Task<SprintResponseDto?> GetSprintAsync(int sprintId, int userId)
        {
            var s = await _db.Sprints.FirstOrDefaultAsync(x => x.Id == sprintId && x.UserId == userId);
            return s == null ? null : MapSprintDto(s);
        }

        public async Task<SprintResponseDto?> UpdateSprintAsync(int sprintId, SprintUpdateDto dto, int userId)
        {
            var sprint = await _db.Sprints.FirstOrDefaultAsync(s => s.Id == sprintId && s.UserId == userId);
            if (sprint == null) return null;

            if (dto.Name != null) sprint.Name = dto.Name;
            if (dto.Goal != null) sprint.Goal = dto.Goal;
            if (dto.Status != null) sprint.Status = dto.Status;
            if (dto.StartDate.HasValue) sprint.StartDate = dto.StartDate;
            if (dto.EndDate.HasValue) sprint.EndDate = dto.EndDate;
            if (dto.Velocity.HasValue) sprint.Velocity = dto.Velocity.Value;
            if (dto.Capacity.HasValue) sprint.Capacity = dto.Capacity.Value;
            if (dto.ProjectId.HasValue) sprint.ProjectId = dto.ProjectId;

            sprint.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return MapSprintDto(sprint);
        }

        public async Task<bool> DeleteSprintAsync(int sprintId, int userId)
        {
            var sprint = await _db.Sprints.FirstOrDefaultAsync(s => s.Id == sprintId && s.UserId == userId);
            if (sprint == null) return false;

            _db.Sprints.Remove(sprint);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<PersonalTodoResponseDto> CreatePersonalTodoAsync(PersonalTodoCreateDto dto, int userId)
        {
            var todo = new PersonalTodo
            {
                UserId = userId,
                Title = dto.Title,
                Description = dto.Description,
                Status = dto.Status ?? "todo",
                Priority = dto.Priority ?? "medium",
                DueDate = dto.DueDate,
                StartDate = dto.StartDate,
                EstimatedHours = dto.EstimatedHours,
                IsRecurring = dto.IsRecurring,
                RecurrencePattern = dto.RecurrencePattern,
                Context = dto.Context,
                Location = dto.Location,
                Category = dto.Category,
                Tags = dto.Tags,
                IsWaiting = dto.IsWaiting,
                WaitingFor = dto.WaitingFor,
                IsSomeday = dto.IsSomeday,
                Order = dto.Order,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.PersonalTodos.Add(todo);
            await _db.SaveChangesAsync();

            return MapTodoDto(todo);
        }

        public async Task<List<PersonalTodoResponseDto>> GetPersonalTodosAsync(int userId, string? status = null, string? priority = null, string? category = null, bool? isWaiting = null, bool? isSomeday = null)
        {
            var query = _db.PersonalTodos.Where(t => t.UserId == userId);

            if (!string.IsNullOrWhiteSpace(status)) query = query.Where(t => t.Status == status);
            if (!string.IsNullOrWhiteSpace(priority)) query = query.Where(t => t.Priority == priority);
            if (!string.IsNullOrWhiteSpace(category)) query = query.Where(t => t.Category == category);
            if (isWaiting.HasValue) query = query.Where(t => t.IsWaiting == isWaiting.Value);
            if (isSomeday.HasValue) query = query.Where(t => t.IsSomeday == isSomeday.Value);

            var list = await query.OrderBy(t => t.Order).ToListAsync();
            return list.Select(MapTodoDto).ToList();
        }

        public async Task<PersonalTodoResponseDto?> GetPersonalTodoAsync(int todoId, int userId)
        {
            var t = await _db.PersonalTodos.FirstOrDefaultAsync(x => x.Id == todoId && x.UserId == userId);
            return t == null ? null : MapTodoDto(t);
        }

        public async Task<PersonalTodoResponseDto?> UpdatePersonalTodoAsync(int todoId, PersonalTodoUpdateDto dto, int userId)
        {
            var todo = await _db.PersonalTodos.FirstOrDefaultAsync(t => t.Id == todoId && t.UserId == userId);
            if (todo == null) return null;

            if (dto.Title != null) todo.Title = dto.Title;
            if (dto.Description != null) todo.Description = dto.Description;
            if (dto.Priority != null) todo.Priority = dto.Priority;
            if (dto.DueDate.HasValue) todo.DueDate = dto.DueDate;
            if (dto.StartDate.HasValue) todo.StartDate = dto.StartDate;
            if (dto.EstimatedHours.HasValue) todo.EstimatedHours = dto.EstimatedHours;
            if (dto.ActualHours.HasValue) todo.ActualHours = dto.ActualHours.Value;
            if (dto.Progress.HasValue) todo.Progress = dto.Progress.Value;
            if (dto.IsRecurring.HasValue) todo.IsRecurring = dto.IsRecurring.Value;
            if (dto.RecurrencePattern != null) todo.RecurrencePattern = dto.RecurrencePattern;
            if (dto.Context != null) todo.Context = dto.Context;
            if (dto.Location != null) todo.Location = dto.Location;
            if (dto.Category != null) todo.Category = dto.Category;
            if (dto.Tags != null) todo.Tags = dto.Tags;
            if (dto.IsWaiting.HasValue) todo.IsWaiting = dto.IsWaiting.Value;
            if (dto.WaitingFor != null) todo.WaitingFor = dto.WaitingFor;
            if (dto.IsSomeday.HasValue) todo.IsSomeday = dto.IsSomeday.Value;
            if (dto.Order.HasValue) todo.Order = dto.Order.Value;

            if (dto.Status == "done" || dto.IsCompleted == true)
            {
                todo.IsCompleted = true;
                todo.Status = "done";
                todo.Progress = 100;
                if (!todo.CompletedAt.HasValue) todo.CompletedAt = DateTime.UtcNow;
            }
            else if ((dto.Status == "todo" || dto.Status == "in_progress") || dto.IsCompleted == false)
            {
                todo.IsCompleted = false;
                if (dto.Status != null) todo.Status = dto.Status;
                if (todo.Progress == 100) todo.Progress = 0;
                todo.CompletedAt = null;
            }

            todo.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return MapTodoDto(todo);
        }

        public async Task<PersonalTodoResponseDto?> TogglePersonalTodoAsync(int todoId, int userId)
        {
            var todo = await _db.PersonalTodos.FirstOrDefaultAsync(t => t.Id == todoId && t.UserId == userId);
            if (todo == null) return null;

            todo.IsCompleted = !todo.IsCompleted;
            todo.Status = todo.IsCompleted ? "done" : "todo";
            todo.Progress = todo.IsCompleted ? 100 : 0;
            todo.CompletedAt = todo.IsCompleted ? DateTime.UtcNow : null;
            todo.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return MapTodoDto(todo);
        }

        public async Task<bool> DeletePersonalTodoAsync(int todoId, int userId)
        {
            var todo = await _db.PersonalTodos.FirstOrDefaultAsync(t => t.Id == todoId && t.UserId == userId);
            if (todo == null) return false;

            _db.PersonalTodos.Remove(todo);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<List<NotificationResponseDto>> GetNotificationsAsync(int userId)
        {
            var list = await _db.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return list.Select(MapNotifDto).ToList();
        }

        public async Task<NotificationResponseDto?> MarkNotificationAsReadAsync(int notificationId, int userId)
        {
            var notif = await _db.Notifications.FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);
            if (notif == null) return null;

            notif.IsRead = true;
            await _db.SaveChangesAsync();

            return MapNotifDto(notif);
        }

        public async Task RefreshNotificationsAsync(int userId)
        {
            DateTime now = DateTime.UtcNow;

            var milestones = await _db.Milestones
                .Where(m => m.UserId == userId && !m.IsCompleted && m.DueDate.HasValue && m.DueDate.Value <= now.AddDays(1))
                .ToListAsync();

            foreach (var m in milestones)
            {
                bool exists = await _db.Notifications.AnyAsync(n => n.UserId == userId && n.Type == "milestone" && n.RelatedId == m.Id && n.AlertType == "due");
                if (!exists)
                {
                    _db.Notifications.Add(new Notification
                    {
                        UserId = userId,
                        Title = $"Milestone Due: {m.Title}",
                        Message = $"Milestone '{m.Title}' is due soon.",
                        Type = "milestone",
                        RelatedId = m.Id,
                        AlertType = "due",
                        ProjectId = m.ProjectId,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            var tasks = await _db.Tasks
                .Where(t => t.UserId == userId && !t.IsCompleted && t.DueDate.HasValue && t.DueDate.Value <= now.AddDays(1))
                .ToListAsync();

            foreach (var t in tasks)
            {
                bool exists = await _db.Notifications.AnyAsync(n => n.UserId == userId && n.Type == "task" && n.RelatedId == t.Id && n.AlertType == "due");
                if (!exists)
                {
                    _db.Notifications.Add(new Notification
                    {
                        UserId = userId,
                        Title = $"Task Due: {t.Title}",
                        Message = $"Task '{t.Title}' is due soon.",
                        Type = "task",
                        RelatedId = t.Id,
                        AlertType = "due",
                        ProjectId = t.ProjectId,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            await _db.SaveChangesAsync();
        }

        private static CallResponseDto MapCallDto(Call c) => new CallResponseDto
        {
            Id = c.Id,
            Title = c.Title,
            Notes = c.Notes,
            Completed = c.Completed,
            ScheduledAt = c.ScheduledAt,
            Duration = c.Duration,
            CallType = c.CallType,
            ProjectId = c.ProjectId,
            UserId = c.UserId,
            CreatedAt = c.CreatedAt
        };

        private static SprintResponseDto MapSprintDto(Sprint s) => new SprintResponseDto
        {
            Id = s.Id,
            Name = s.Name,
            Goal = s.Goal,
            Status = s.Status,
            StartDate = s.StartDate,
            EndDate = s.EndDate,
            Velocity = s.Velocity,
            Capacity = s.Capacity,
            ProjectId = s.ProjectId,
            UserId = s.UserId,
            CreatedAt = s.CreatedAt,
            UpdatedAt = s.UpdatedAt
        };

        private static PersonalTodoResponseDto MapTodoDto(PersonalTodo t) => new PersonalTodoResponseDto
        {
            Id = t.Id,
            UserId = t.UserId,
            Title = t.Title,
            Description = t.Description,
            Status = t.Status,
            Priority = t.Priority,
            DueDate = t.DueDate,
            StartDate = t.StartDate,
            EstimatedHours = t.EstimatedHours,
            ActualHours = t.ActualHours,
            Progress = t.Progress,
            IsCompleted = t.IsCompleted,
            IsRecurring = t.IsRecurring,
            RecurrencePattern = t.RecurrencePattern,
            Context = t.Context,
            Location = t.Location,
            Category = t.Category,
            Tags = t.Tags,
            IsWaiting = t.IsWaiting,
            WaitingFor = t.WaitingFor,
            IsSomeday = t.IsSomeday,
            CreatedAt = t.CreatedAt,
            UpdatedAt = t.UpdatedAt,
            CompletedAt = t.CompletedAt,
            Order = t.Order
        };

        private static NotificationResponseDto MapNotifDto(Notification n) => new NotificationResponseDto
        {
            Id = n.Id,
            UserId = n.UserId,
            Title = n.Title,
            Message = n.Message,
            Type = n.Type,
            RelatedId = n.RelatedId,
            AlertType = n.AlertType,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt,
            ProjectId = n.ProjectId
        };
    }
}
