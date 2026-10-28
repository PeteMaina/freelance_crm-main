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
    public interface IClientService
    {
        Task<ClientResponseDto> CreateClientAsync(ClientCreateDto dto, int userId);
        Task<List<ClientResponseDto>> GetClientsAsync(int userId, int skip = 0, int limit = 100, string? search = null, string? status = null);
        Task<ClientDetailDto?> GetClientDetailAsync(int clientId, int userId);
        Task<ClientResponseDto?> GetClientAsync(int clientId, int userId);
        Task<ClientResponseDto?> UpdateClientAsync(int clientId, ClientUpdateDto dto, int userId);
        Task<bool> DeleteClientAsync(int clientId, int userId);

        Task<ClientContactResponseDto> CreateContactAsync(ClientContactCreateDto dto, int userId);
        Task<List<ClientContactResponseDto>> GetContactsAsync(int? clientId, int userId);
        Task<ClientContractResponseDto> CreateContractAsync(ClientContractCreateDto dto, int userId);
        Task<List<ClientContractResponseDto>> GetContractsAsync(int? clientId, int userId);
        Task<InvoiceResponseDto> CreateInvoiceAsync(InvoiceCreateDto dto, int userId);
        Task<List<InvoiceResponseDto>> GetInvoicesAsync(int? clientId, int userId, int skip = 0, int limit = 100, string? status = null);
        Task<InvoiceResponseDto?> GetInvoiceAsync(int invoiceId, int userId);
        Task<InvoiceResponseDto?> UpdateInvoiceAsync(int invoiceId, Dictionary<string, object> updates, int userId);
        Task<CommunicationResponseDto> CreateCommunicationAsync(CommunicationCreateDto dto, int userId);
        Task<List<CommunicationResponseDto>> GetCommunicationsAsync(int? clientId, int userId);

        Task<MagicLinkResponseDto?> GenerateMagicLinkAsync(int clientId, int userId);
    }

    public class ClientService : IClientService
    {
        private readonly ActivaDbContext _db;

        public ClientService(ActivaDbContext db)
        {
            _db = db;
        }

        public async Task<ClientResponseDto> CreateClientAsync(ClientCreateDto dto, int userId)
        {
            var client = new Client
            {
                UserId = userId,
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                Company = dto.Company,
                Address = dto.Address,
                Industry = dto.Industry,
                Source = dto.Source,
                Status = dto.Status ?? "active",
                Rating = dto.Rating,
                BudgetRangeMin = dto.BudgetRangeMin,
                BudgetRangeMax = dto.BudgetRangeMax,
                Timezone = dto.Timezone,
                Language = dto.Language ?? "en",
                Notes = dto.Notes,
                Tags = dto.Tags,
                AvatarUrl = dto.AvatarUrl,
                PaymentTerms = dto.PaymentTerms ?? "net30",
                CustomFields = dto.CustomFields,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Clients.Add(client);
            await _db.SaveChangesAsync();

            return MapToResponseDto(client);
        }

        public async Task<List<ClientResponseDto>> GetClientsAsync(int userId, int skip = 0, int limit = 100, string? search = null, string? status = null)
        {
            var query = _db.Clients.Where(c => c.UserId == userId);

            if (!string.IsNullOrWhiteSpace(search))
            {
                string term = search.ToLower();
                query = query.Where(c => c.Name.ToLower().Contains(term) ||
                                         (c.Email != null && c.Email.ToLower().Contains(term)) ||
                                         (c.Company != null && c.Company.ToLower().Contains(term)));
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(c => c.Status == status);
            }

            var clients = await query.OrderByDescending(c => c.CreatedAt)
                                     .Skip(skip)
                                     .Take(limit)
                                     .ToListAsync();

            return clients.Select(MapToResponseDto).ToList();
        }

        public async Task<ClientResponseDto?> GetClientAsync(int clientId, int userId)
        {
            var client = await _db.Clients.FirstOrDefaultAsync(c => c.Id == clientId && c.UserId == userId);
            return client == null ? null : MapToResponseDto(client);
        }

        public async Task<ClientDetailDto?> GetClientDetailAsync(int clientId, int userId)
        {
            var client = await _db.Clients
                .Include(c => c.Projects)
                .Include(c => c.Contacts)
                .Include(c => c.Contracts)
                .Include(c => c.Invoices)
                .Include(c => c.Communications)
                .FirstOrDefaultAsync(c => c.Id == clientId && c.UserId == userId);

            if (client == null) return null;

            return MapToDetailDto(client);
        }

        public async Task<ClientResponseDto?> UpdateClientAsync(int clientId, ClientUpdateDto dto, int userId)
        {
            var client = await _db.Clients.FirstOrDefaultAsync(c => c.Id == clientId && c.UserId == userId);
            if (client == null) return null;

            if (dto.Name != null) client.Name = dto.Name;
            if (dto.Email != null) client.Email = dto.Email;
            if (dto.Phone != null) client.Phone = dto.Phone;
            if (dto.Company != null) client.Company = dto.Company;
            if (dto.Address != null) client.Address = dto.Address;
            if (dto.Industry != null) client.Industry = dto.Industry;
            if (dto.Source != null) client.Source = dto.Source;
            if (dto.Status != null) client.Status = dto.Status;
            if (dto.Rating.HasValue) client.Rating = dto.Rating.Value;
            if (dto.BudgetRangeMin.HasValue) client.BudgetRangeMin = dto.BudgetRangeMin;
            if (dto.BudgetRangeMax.HasValue) client.BudgetRangeMax = dto.BudgetRangeMax;
            if (dto.Timezone != null) client.Timezone = dto.Timezone;
            if (dto.Language != null) client.Language = dto.Language;
            if (dto.Notes != null) client.Notes = dto.Notes;
            if (dto.Tags != null) client.Tags = dto.Tags;
            if (dto.AvatarUrl != null) client.AvatarUrl = dto.AvatarUrl;
            if (dto.PaymentTerms != null) client.PaymentTerms = dto.PaymentTerms;
            if (dto.CustomFields != null) client.CustomFields = dto.CustomFields;

            client.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return MapToResponseDto(client);
        }

        public async Task<bool> DeleteClientAsync(int clientId, int userId)
        {
            var client = await _db.Clients.FirstOrDefaultAsync(c => c.Id == clientId && c.UserId == userId);
            if (client == null) return false;

            _db.Clients.Remove(client);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<ClientContactResponseDto> CreateContactAsync(ClientContactCreateDto dto, int userId)
        {
            var contact = new ClientContact
            {
                UserId = userId,
                ClientId = dto.ClientId,
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                Role = dto.Role,
                IsPrimary = dto.IsPrimary
            };

            _db.ClientContacts.Add(contact);
            await _db.SaveChangesAsync();

            return new ClientContactResponseDto
            {
                Id = contact.Id,
                UserId = contact.UserId,
                ClientId = contact.ClientId,
                Name = contact.Name,
                Email = contact.Email,
                Phone = contact.Phone,
                Role = contact.Role,
                IsPrimary = contact.IsPrimary
            };
        }

        public async Task<List<ClientContactResponseDto>> GetContactsAsync(int? clientId, int userId)
        {
            var query = _db.ClientContacts.Where(c => c.UserId == userId);
            if (clientId.HasValue) query = query.Where(c => c.ClientId == clientId.Value);

            var list = await query.ToListAsync();
            return list.Select(c => new ClientContactResponseDto
            {
                Id = c.Id,
                UserId = c.UserId,
                ClientId = c.ClientId,
                Name = c.Name,
                Email = c.Email,
                Phone = c.Phone,
                Role = c.Role,
                IsPrimary = c.IsPrimary
            }).ToList();
        }

        public async Task<ClientContractResponseDto> CreateContractAsync(ClientContractCreateDto dto, int userId)
        {
            var contract = new ClientContract
            {
                UserId = userId,
                ClientId = dto.ClientId,
                Title = dto.Title,
                Description = dto.Description,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Value = dto.Value,
                Status = dto.Status ?? "draft",
                DocumentUrl = dto.DocumentUrl
            };

            _db.ClientContracts.Add(contract);
            await _db.SaveChangesAsync();

            return new ClientContractResponseDto
            {
                Id = contract.Id,
                UserId = contract.UserId,
                ClientId = contract.ClientId,
                Title = contract.Title,
                Description = contract.Description,
                StartDate = contract.StartDate,
                EndDate = contract.EndDate,
                Value = contract.Value,
                Status = contract.Status,
                DocumentUrl = contract.DocumentUrl
            };
        }

        public async Task<List<ClientContractResponseDto>> GetContractsAsync(int? clientId, int userId)
        {
            var query = _db.ClientContracts.Where(c => c.UserId == userId);
            if (clientId.HasValue) query = query.Where(c => c.ClientId == clientId.Value);

            var list = await query.ToListAsync();
            return list.Select(c => new ClientContractResponseDto
            {
                Id = c.Id,
                UserId = c.UserId,
                ClientId = c.ClientId,
                Title = c.Title,
                Description = c.Description,
                StartDate = c.StartDate,
                EndDate = c.EndDate,
                Value = c.Value,
                Status = c.Status,
                DocumentUrl = c.DocumentUrl
            }).ToList();
        }

        public async Task<InvoiceResponseDto> CreateInvoiceAsync(InvoiceCreateDto dto, int userId)
        {
            var invoice = new Invoice
            {
                UserId = userId,
                ClientId = dto.ClientId,
                InvoiceNumber = dto.InvoiceNumber,
                Amount = dto.Amount,
                Status = dto.Status ?? "pending",
                IssueDate = dto.IssueDate,
                DueDate = dto.DueDate,
                PaidDate = dto.PaidDate,
                Description = dto.Description
            };

            _db.Invoices.Add(invoice);
            await _db.SaveChangesAsync();

            return MapInvoiceDto(invoice);
        }

        public async Task<List<InvoiceResponseDto>> GetInvoicesAsync(int? clientId, int userId, int skip = 0, int limit = 100, string? status = null)
        {
            var query = _db.Invoices.Where(i => i.UserId == userId);
            if (clientId.HasValue) query = query.Where(i => i.ClientId == clientId.Value);
            if (!string.IsNullOrWhiteSpace(status)) query = query.Where(i => i.Status == status);

            var list = await query.Skip(skip).Take(limit).ToListAsync();
            return list.Select(MapInvoiceDto).ToList();
        }

        public async Task<InvoiceResponseDto?> GetInvoiceAsync(int invoiceId, int userId)
        {
            var inv = await _db.Invoices.FirstOrDefaultAsync(i => i.Id == invoiceId && i.UserId == userId);
            return inv == null ? null : MapInvoiceDto(inv);
        }

        public async Task<InvoiceResponseDto?> UpdateInvoiceAsync(int invoiceId, Dictionary<string, object> updates, int userId)
        {
            var inv = await _db.Invoices.FirstOrDefaultAsync(i => i.Id == invoiceId && i.UserId == userId);
            if (inv == null) return null;

            foreach (var kvp in updates)
            {
                string key = kvp.Key.ToLower();
                string val = kvp.Value?.ToString() ?? "";

                if (key == "status") inv.Status = val;
                else if (key == "amount" && double.TryParse(val, out double amt)) inv.Amount = amt;
                else if (key == "description") inv.Description = val;
            }

            await _db.SaveChangesAsync();
            return MapInvoiceDto(inv);
        }

        public async Task<CommunicationResponseDto> CreateCommunicationAsync(CommunicationCreateDto dto, int userId)
        {
            var comm = new Communication
            {
                UserId = userId,
                ClientId = dto.ClientId,
                ProjectId = dto.ProjectId,
                Type = dto.Type,
                Direction = dto.Direction,
                Subject = dto.Subject,
                Notes = dto.Notes,
                Duration = dto.Duration,
                OccurredAt = dto.OccurredAt ?? DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            _db.Communications.Add(comm);
            await _db.SaveChangesAsync();

            return new CommunicationResponseDto
            {
                Id = comm.Id,
                UserId = comm.UserId,
                ClientId = comm.ClientId,
                ProjectId = comm.ProjectId,
                Type = comm.Type,
                Direction = comm.Direction,
                Subject = comm.Subject,
                Notes = comm.Notes,
                Duration = comm.Duration,
                OccurredAt = comm.OccurredAt,
                CreatedAt = comm.CreatedAt
            };
        }

        public async Task<List<CommunicationResponseDto>> GetCommunicationsAsync(int? clientId, int userId)
        {
            var query = _db.Communications.Where(c => c.UserId == userId);
            if (clientId.HasValue) query = query.Where(c => c.ClientId == clientId.Value);

            var list = await query.OrderByDescending(c => c.OccurredAt).ToListAsync();
            return list.Select(c => new CommunicationResponseDto
            {
                Id = c.Id,
                UserId = c.UserId,
                ClientId = c.ClientId,
                ProjectId = c.ProjectId,
                Type = c.Type,
                Direction = c.Direction,
                Subject = c.Subject,
                Notes = c.Notes,
                Duration = c.Duration,
                OccurredAt = c.OccurredAt,
                CreatedAt = c.CreatedAt
            }).ToList();
        }

        public async Task<MagicLinkResponseDto?> GenerateMagicLinkAsync(int clientId, int userId)
        {
            var client = await _db.Clients.FirstOrDefaultAsync(c => c.Id == clientId && c.UserId == userId);
            if (client == null) return null;

            string token = Guid.NewGuid().ToString("N");
            string password = RandomString(8);
            DateTime expiresAt = DateTime.UtcNow.AddDays(7);

            client.MagicLinkToken = token;
            client.MagicLinkPassword = password;
            client.MagicLinkExpiresAt = expiresAt;

            await _db.SaveChangesAsync();

            return new MagicLinkResponseDto
            {
                MagicLinkToken = token,
                Password = password,
                ExpiresAt = expiresAt
            };
        }

        private static ClientResponseDto MapToResponseDto(Client c)
        {
            return new ClientResponseDto
            {
                Id = c.Id,
                UserId = c.UserId,
                Name = c.Name,
                Email = c.Email,
                Phone = c.Phone,
                Company = c.Company,
                Address = c.Address,
                Industry = c.Industry,
                Source = c.Source,
                Status = c.Status,
                Rating = c.Rating,
                BudgetRangeMin = c.BudgetRangeMin,
                BudgetRangeMax = c.BudgetRangeMax,
                Timezone = c.Timezone,
                Language = c.Language,
                Notes = c.Notes,
                Tags = c.Tags,
                AvatarUrl = c.AvatarUrl,
                LifetimeValue = c.LifetimeValue,
                TotalRevenue = c.TotalRevenue,
                ProjectCount = c.ProjectCount,
                HealthScore = c.HealthScore,
                EngagementScore = c.EngagementScore,
                SatisfactionScore = c.SatisfactionScore,
                CommunicationFrequency = c.CommunicationFrequency,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                LastContacted = c.LastContacted,
                ContractExpiry = c.ContractExpiry,
                CustomFields = c.CustomFields,
                PaymentTerms = c.PaymentTerms,
                AverageProjectValue = c.AverageProjectValue,
                MagicLinkToken = c.MagicLinkToken,
                MagicLinkPassword = c.MagicLinkPassword,
                MagicLinkExpiresAt = c.MagicLinkExpiresAt
            };
        }

        private static ClientDetailDto MapToDetailDto(Client c)
        {
            var baseDto = MapToResponseDto(c);
            return new ClientDetailDto
            {
                Id = baseDto.Id,
                UserId = baseDto.UserId,
                Name = baseDto.Name,
                Email = baseDto.Email,
                Phone = baseDto.Phone,
                Company = baseDto.Company,
                Address = baseDto.Address,
                Industry = baseDto.Industry,
                Source = baseDto.Source,
                Status = baseDto.Status,
                Rating = baseDto.Rating,
                BudgetRangeMin = baseDto.BudgetRangeMin,
                BudgetRangeMax = baseDto.BudgetRangeMax,
                Timezone = baseDto.Timezone,
                Language = baseDto.Language,
                Notes = baseDto.Notes,
                Tags = baseDto.Tags,
                AvatarUrl = baseDto.AvatarUrl,
                LifetimeValue = baseDto.LifetimeValue,
                TotalRevenue = baseDto.TotalRevenue,
                ProjectCount = baseDto.ProjectCount,
                HealthScore = baseDto.HealthScore,
                EngagementScore = baseDto.EngagementScore,
                SatisfactionScore = baseDto.SatisfactionScore,
                CommunicationFrequency = baseDto.CommunicationFrequency,
                CreatedAt = baseDto.CreatedAt,
                UpdatedAt = baseDto.UpdatedAt,
                LastContacted = baseDto.LastContacted,
                ContractExpiry = baseDto.ContractExpiry,
                CustomFields = baseDto.CustomFields,
                PaymentTerms = baseDto.PaymentTerms,
                AverageProjectValue = baseDto.AverageProjectValue,
                MagicLinkToken = baseDto.MagicLinkToken,
                MagicLinkPassword = baseDto.MagicLinkPassword,
                MagicLinkExpiresAt = baseDto.MagicLinkExpiresAt,
                Projects = c.Projects?.Select(p => new ProjectResponseDto
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
                }).ToList() ?? new List<ProjectResponseDto>(),
                Contacts = c.Contacts?.Select(ct => new ClientContactResponseDto
                {
                    Id = ct.Id,
                    UserId = ct.UserId,
                    ClientId = ct.ClientId,
                    Name = ct.Name,
                    Email = ct.Email,
                    Phone = ct.Phone,
                    Role = ct.Role,
                    IsPrimary = ct.IsPrimary
                }).ToList() ?? new List<ClientContactResponseDto>(),
                Contracts = c.Contracts?.Select(ct => new ClientContractResponseDto
                {
                    Id = ct.Id,
                    UserId = ct.UserId,
                    ClientId = ct.ClientId,
                    Title = ct.Title,
                    Description = ct.Description,
                    StartDate = ct.StartDate,
                    EndDate = ct.EndDate,
                    Value = ct.Value,
                    Status = ct.Status,
                    DocumentUrl = ct.DocumentUrl
                }).ToList() ?? new List<ClientContractResponseDto>(),
                Invoices = c.Invoices?.Select(MapInvoiceDto).ToList() ?? new List<InvoiceResponseDto>(),
                Communications = c.Communications?.Select(comm => new CommunicationResponseDto
                {
                    Id = comm.Id,
                    UserId = comm.UserId,
                    ClientId = comm.ClientId,
                    ProjectId = comm.ProjectId,
                    Type = comm.Type,
                    Direction = comm.Direction,
                    Subject = comm.Subject,
                    Notes = comm.Notes,
                    Duration = comm.Duration,
                    OccurredAt = comm.OccurredAt,
                    CreatedAt = comm.CreatedAt
                }).ToList() ?? new List<CommunicationResponseDto>()
            };
        }

        private static InvoiceResponseDto MapInvoiceDto(Invoice i)
        {
            return new InvoiceResponseDto
            {
                Id = i.Id,
                UserId = i.UserId,
                ClientId = i.ClientId,
                InvoiceNumber = i.InvoiceNumber,
                Amount = i.Amount,
                Status = i.Status,
                IssueDate = i.IssueDate,
                DueDate = i.DueDate,
                PaidDate = i.PaidDate,
                Description = i.Description
            };
        }

        private static string RandomString(int length)
        {
            const string chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length).Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}
