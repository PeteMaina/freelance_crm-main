using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Api.DTOs
{
    public class UserCreateDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
    }

    public class UserLoginDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class TokenDto
    {
        public string AccessToken { get; set; } = string.Empty;
        public string TokenType { get; set; } = "bearer";
    }

    public class UserResponseDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
    }
}
