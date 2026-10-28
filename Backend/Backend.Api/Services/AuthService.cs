using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Data;
using Backend.Api.DTOs;
using Backend.Api.Models;

namespace Backend.Api.Services
{
    public interface IAuthService
    {
        Task<UserResponseDto> RegisterAsync(UserCreateDto dto);
        Task<TokenDto> LoginAsync(UserLoginDto dto);
        Task<UserResponseDto?> GetUserByEmailAsync(string email);
    }

    public class AuthService : IAuthService
    {
        private readonly ActivaDbContext _db;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtService _jwtService;

        public AuthService(ActivaDbContext db, IPasswordHasher passwordHasher, IJwtService jwtService)
        {
            _db = db;
            _passwordHasher = passwordHasher;
            _jwtService = jwtService;
        }

        public async Task<UserResponseDto> RegisterAsync(UserCreateDto dto)
        {
            var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (existingUser != null)
            {
                throw new InvalidOperationException("Email already registered");
            }

            string hashed = _passwordHasher.HashPassword(dto.Password);
            var user = new User
            {
                Email = dto.Email,
                HashedPassword = hashed
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return new UserResponseDto { Id = user.Id, Email = user.Email };
        }

        public async Task<TokenDto> LoginAsync(UserLoginDto dto)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null || !_passwordHasher.VerifyPassword(dto.Password, user.HashedPassword))
            {
                throw new UnauthorizedAccessException("Invalid credentials");
            }

            string token = _jwtService.GenerateToken(user.Email);
            return new TokenDto { AccessToken = token, TokenType = "bearer" };
        }

        public async Task<UserResponseDto?> GetUserByEmailAsync(string email)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return null;
            return new UserResponseDto { Id = user.Id, Email = user.Email };
        }
    }
}
