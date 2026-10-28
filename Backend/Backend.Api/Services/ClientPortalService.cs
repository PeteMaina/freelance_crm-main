using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Data;
using Backend.Api.DTOs;
using Backend.Api.Models;

namespace Backend.Api.Services
{
    public interface IClientPortalService
    {
        Task<ClientResponseDto?> LoginPortalAsync(string token, string? password);
        Task<ClientDetailDto?> GetPortalDashboardAsync(int clientId);
        Task<List<ProjectResponseDto>> GetPortalProjectsAsync(int clientId);
        Task<List<BugResponseDto>> GetPortalProjectBugsAsync(int projectId, int clientId);
        Task<BugResponseDto> ReportPortalBugAsync(int projectId, BugCreateDto bugDto, int clientId);
    }

    public class ClientPortalService : IClientPortalService
    {
        private readonly ActivaDbContext _db;
        private readonly IProjectService _projectService;

        public ClientPortalService(ActivaDbContext db, IProjectService projectService)
        {
            _db = db;
            _projectService = projectService;
        }

        public async Task<ClientResponseDto?> LoginPortalAsync(string token, string? password)
        {
            var client = await _db.Clients.FirstOrDefaultAsync(c => c.MagicLinkToken == token);
            if (client == null) return null;

            if (client.MagicLinkExpiresAt.HasValue && client.MagicLinkExpiresAt.Value < DateTime.UtcNow)
            {
                throw new UnauthorizedAccessException("Magic link expired");
            }

            if (!string.IsNullOrEmpty(client.MagicLinkPassword) && client.MagicLinkPassword != password)
            {
                throw new UnauthorizedAccessException("Invalid magic link password");
            }

            return new ClientResponseDto
            {
                Id = client.Id,
                UserId = client.UserId,
                Name = client.Name,
                Email = client.Email,
                Company = client.Company,
                MagicLinkToken = client.MagicLinkToken
            };
        }

        public async Task<ClientDetailDto?> GetPortalDashboardAsync(int clientId)
        {
            var client = await _db.Clients
                .Include(c => c.Projects)
                .Include(c => c.Invoices)
                .FirstOrDefaultAsync(c => c.Id == clientId);

            if (client == null) return null;

            return new ClientDetailDto
            {
                Id = client.Id,
                UserId = client.UserId,
                Name = client.Name,
                Email = client.Email,
                Company = client.Company,
                Projects = client.Projects.Select(p => new ProjectResponseDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Status = p.Status,
                    Progress = p.Progress,
                    StartDate = p.StartDate,
                    ExpectedEndDate = p.ExpectedEndDate
                }).ToList(),
                Invoices = client.Invoices.Select(i => new InvoiceResponseDto
                {
                    Id = i.Id,
                    InvoiceNumber = i.InvoiceNumber,
                    Amount = i.Amount,
                    Status = i.Status,
                    DueDate = i.DueDate
                }).ToList()
            };
        }

        public async Task<List<ProjectResponseDto>> GetPortalProjectsAsync(int clientId)
        {
            var projects = await _db.Projects.Where(p => p.ClientId == clientId).ToListAsync();
            return projects.Select(p => new ProjectResponseDto
            {
                Id = p.Id,
                UserId = p.UserId,
                Title = p.Title,
                Description = p.Description,
                Status = p.Status,
                Priority = p.Priority,
                Progress = p.Progress,
                ClientId = p.ClientId
            }).ToList();
        }

        public async Task<List<BugResponseDto>> GetPortalProjectBugsAsync(int projectId, int clientId)
        {
            var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == projectId && p.ClientId == clientId);
            if (project == null) throw new KeyNotFoundException("Access denied or project not found");

            return await _projectService.GetBugsAsync(projectId, project.UserId);
        }

        public async Task<BugResponseDto> ReportPortalBugAsync(int projectId, BugCreateDto bugDto, int clientId)
        {
            var project = await _db.Projects.Include(p => p.Client).FirstOrDefaultAsync(p => p.Id == projectId && p.ClientId == clientId);
            if (project == null) throw new KeyNotFoundException("Access denied or project not found");

            bugDto.ProjectId = projectId;
            bugDto.Reporter = $"Client: {project.Client?.Name ?? "Client"}";

            return await _projectService.CreateBugAsync(bugDto, project.UserId);
        }
    }
}
