using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Api.Services
{
    public interface IPasswordHasher
    {
        string HashPassword(string password);
        bool VerifyPassword(string plainPassword, string hashedPassword);
    }

    public class PasswordHasher : IPasswordHasher
    {
        public string HashPassword(string password)
        {
            string normalizedPassword = TruncatePassword(password);
            return BCrypt.Net.BCrypt.HashPassword(normalizedPassword);
        }

        public bool VerifyPassword(string plainPassword, string hashedPassword)
        {
            try
            {
                string normalizedPassword = TruncatePassword(plainPassword);
                return BCrypt.Net.BCrypt.Verify(normalizedPassword, hashedPassword);
            }
            catch
            {
                return false;
            }
        }

        private static string TruncatePassword(string password)
        {
            if (string.IsNullOrEmpty(password)) return string.Empty;
            byte[] bytes = Encoding.UTF8.GetBytes(password);
            if (bytes.Length > 72)
            {
                return Encoding.UTF8.GetString(bytes, 0, 72);
            }
            return password;
        }
    }

    public interface IJwtService
    {
        string GenerateToken(string email);
        ClaimsPrincipal? ValidateToken(string token);
    }

    public class JwtService : IJwtService
    {
        private readonly string _secretKey;
        private readonly int _expiryMinutes;

        public JwtService(IConfiguration configuration)
        {
            _secretKey = configuration["SECRET_KEY"] ?? Environment.GetEnvironmentVariable("SECRET_KEY") ?? "supersecretkey";
            _expiryMinutes = 60 * 24;
        }

        public JwtService(string secretKey, int expiryMinutes = 60 * 24)
        {
            _secretKey = secretKey;
            _expiryMinutes = expiryMinutes;
        }

        public string GenerateToken(string email)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_secretKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, email),
                    new Claim(ClaimTypes.Email, email),
                    new Claim("sub", email)
                }),
                Expires = DateTime.UtcNow.AddMinutes(_expiryMinutes),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public ClaimsPrincipal? ValidateToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_secretKey);

            try
            {
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
                return principal;
            }
            catch
            {
                return null;
            }
        }
    }
}
