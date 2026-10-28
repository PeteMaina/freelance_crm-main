using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Controllers;
using Backend.Api.Data;
using Backend.Api.DTOs;
using Backend.Api.Services;
using Xunit;

namespace Backend.Tests
{
    public class ControllerTests
    {
        private ActivaDbContext GetInMemoryDbContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<ActivaDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;

            return new ActivaDbContext(options);
        }

        [Fact]
        public async Task FullControllerFlow_RegisterLoginCreateClientAndProject()
        {
            using var db = GetInMemoryDbContext("ControllerFlowDb");
            var hasher = new PasswordHasher();
            var jwt = new JwtService("secretkey1234567890_test_key_long_enough");

            var authService = new AuthService(db, hasher, jwt);
            var clientService = new ClientService(db);
            var projectService = new ProjectService(db);

            var authController = new AuthController(authService);

            // 1. Register User
            var regResult = await authController.Register(new UserCreateDto { Email = "developer@activa.com", Password = "securepassword" });
            Assert.IsType<OkObjectResult>(regResult);

            // 2. Login
            var loginResult = await authController.Login(new UserLoginDto { Email = "developer@activa.com", Password = "securepassword" });
            var okResult = Assert.IsType<OkObjectResult>(loginResult.Result);
            var tokenDto = Assert.IsType<TokenDto>(okResult.Value);
            Assert.NotNull(tokenDto.AccessToken);
        }
    }
}
