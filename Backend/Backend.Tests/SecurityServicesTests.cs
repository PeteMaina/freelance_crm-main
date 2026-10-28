using Backend.Api.Services;
using Xunit;

namespace Backend.Tests
{
    public class SecurityServicesTests
    {
        [Fact]
        public void PasswordHasher_HashAndVerify_Success()
        {
            var hasher = new PasswordHasher();
            string rawPassword = "mysecretpassword123";

            string hashedPassword = hasher.HashPassword(rawPassword);

            Assert.NotNull(hashedPassword);
            Assert.NotEqual(rawPassword, hashedPassword);
            Assert.True(hasher.VerifyPassword(rawPassword, hashedPassword));
            Assert.False(hasher.VerifyPassword("wrongpassword", hashedPassword));
        }

        [Fact]
        public void JwtService_GenerateAndValidate_ReturnsPrincipalWithEmail()
        {
            var jwtService = new JwtService("supersecretkeyforunit testing_1234567890");
            string testEmail = "user@example.com";

            string token = jwtService.GenerateToken(testEmail);
            Assert.NotNull(token);

            var principal = jwtService.ValidateToken(token);
            Assert.NotNull(principal);

            var subClaim = principal?.FindFirst("sub")?.Value;
            Assert.Equal(testEmail, subClaim);
        }
    }
}
