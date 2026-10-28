using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Data;
using Backend.Api.DTOs;
using Backend.Api.Services;
using Xunit;

namespace Backend.Tests
{
    public class ServiceLayerTests
    {
        private ActivaDbContext GetInMemoryDbContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<ActivaDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;

            return new ActivaDbContext(options);
        }

        [Fact]
        public async Task AuthService_RegisterAndLogin_Success()
        {
            using var db = GetInMemoryDbContext("AuthTestDb");
            var hasher = new PasswordHasher();
            var jwt = new JwtService("secretkey1234567890_test_key_long_enough");
            var authService = new AuthService(db, hasher, jwt);

            var registerDto = new UserCreateDto { Email = "test@activa.com", Password = "password123" };
            var registered = await authService.RegisterAsync(registerDto);

            Assert.True(registered.Id > 0);
            Assert.Equal("test@activa.com", registered.Email);

            var token = await authService.LoginAsync(new UserLoginDto { Email = "test@activa.com", Password = "password123" });
            Assert.NotNull(token.AccessToken);
        }

        [Fact]
        public async Task ProjectService_CreateProject_GeneratesStandardPhases()
        {
            using var db = GetInMemoryDbContext("ProjectTestDb");
            var projService = new ProjectService(db);

            var createDto = new ProjectCreateDto
            {
                Title = "New Web App",
                Description = "Building CRM system",
                Priority = "high"
            };

            var project = await projService.CreateProjectAsync(createDto, userId: 1);
            Assert.True(project.Id > 0);

            var detail = await projService.GetProjectDetailAsync(project.Id, userId: 1);
            Assert.NotNull(detail);
            Assert.Equal(7, detail.Phases.Count);
            Assert.Equal("Discovery", detail.Phases[0].Name);
        }

        [Fact]
        public async Task ClientService_CreateClientAndMagicLink_Success()
        {
            using var db = GetInMemoryDbContext("ClientTestDb");
            var clientService = new ClientService(db);

            var createDto = new ClientCreateDto
            {
                Name = "Acme Corp",
                Email = "contact@acme.com",
                Company = "Acme Inc"
            };

            var client = await clientService.CreateClientAsync(createDto, userId: 1);
            Assert.True(client.Id > 0);

            var magicLink = await clientService.GenerateMagicLinkAsync(client.Id, userId: 1);
            Assert.NotNull(magicLink);
            Assert.NotNull(magicLink.MagicLinkToken);
            Assert.Equal(8, magicLink.Password?.Length);
        }
    }
}
