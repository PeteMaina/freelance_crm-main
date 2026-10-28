using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Backend.Api.DTOs;
using Xunit;

namespace Backend.Tests
{
    public class DtoValidationTests
    {
        [Fact]
        public void UserCreateDto_ValidEmailAndPassword_PassesValidation()
        {
            var dto = new UserCreateDto
            {
                Email = "test@example.com",
                Password = "password123"
            };

            var context = new ValidationContext(dto);
            var results = new List<ValidationResult>();
            bool isValid = Validator.TryValidateObject(dto, context, results, true);

            Assert.True(isValid);
            Assert.Empty(results);
        }

        [Fact]
        public void UserCreateDto_InvalidEmail_FailsValidation()
        {
            var dto = new UserCreateDto
            {
                Email = "invalid-email",
                Password = "password123"
            };

            var context = new ValidationContext(dto);
            var results = new List<ValidationResult>();
            bool isValid = Validator.TryValidateObject(dto, context, results, true);

            Assert.False(isValid);
            Assert.NotEmpty(results);
        }

        [Fact]
        public void UserCreateDto_ShortPassword_FailsValidation()
        {
            var dto = new UserCreateDto
            {
                Email = "test@example.com",
                Password = "123"
            };

            var context = new ValidationContext(dto);
            var results = new List<ValidationResult>();
            bool isValid = Validator.TryValidateObject(dto, context, results, true);

            Assert.False(isValid);
            Assert.NotEmpty(results);
        }
    }
}
