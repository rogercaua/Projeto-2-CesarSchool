using System.Text;
using EcoTag.Core.Interfaces;
using EcoTag.Core.Services;
using EcoTag.Core.Swagger;
using EcoTag.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);
const string CorsPolicyName = "EcoTagLocalCors";

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

builder.Configuration.AddEnvironmentVariables();

var jwtKey = builder.Configuration["Jwt:Key"];

if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException("Jwt:Key nao configurada.");
}

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(builder.Environment.ContentRootPath, ".keys")))
    .SetApplicationName("EcoTag");
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicyName, policy =>
    {
        var allowedOrigins = builder.Configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>() ?? [];

        policy.SetIsOriginAllowed(origin =>
            origin.Equals("null", StringComparison.OrdinalIgnoreCase) ||
            allowedOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase) ||
            (allowedOrigins.Length == 0 && (
                origin.StartsWith("http://localhost", StringComparison.OrdinalIgnoreCase) ||
                origin.StartsWith("https://localhost", StringComparison.OrdinalIgnoreCase) ||
                origin.StartsWith("http://127.0.0.1", StringComparison.OrdinalIgnoreCase) ||
                origin.StartsWith("https://127.0.0.1", StringComparison.OrdinalIgnoreCase))));

        policy
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "EcoTag API",
        Version = "v1",
        Description = "API REST para calculo de CO2e evitado por uso de tag automatica. Use o botao Authorize para informar o token JWT."
    });

    options.CustomSchemaIds(type => type.FullName?.Replace("+", "."));
    options.IncludeXmlComments(typeof(Program).Assembly);
    options.OperationFilter<BearerSecurityOperationFilter>();
    options.DocumentFilter<EcoTagTagDescriptionsDocumentFilter>();

    options.AddSecurityDefinition("bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Token JWT obtido em POST /api/auth/login. Cole apenas o token ou use o formato Bearer {token}."
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IVeiculoService, VeiculoService>();
builder.Services.AddScoped<ICalculoEmissaoService, CalculoEmissaoService>();
builder.Services.AddScoped<IPassagemService, PassagemService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<ISimuladorService, SimuladorService>();
builder.Services.AddScoped<IGamificacaoService, GamificacaoService>();
builder.Services.AddScoped<IRankingService, RankingService>();
builder.Services.AddScoped<IFatorEmissaoService, FatorEmissaoService>();
builder.Services.AddScoped<IParametrosCenarioSemTagService, ParametrosCenarioSemTagService>();
builder.Services.AddScoped<ILocalUsoService, LocalUsoService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.Use(async (context, next) =>
    {
        if (!context.Request.Path.Equals("/swagger/v1/swagger.json", StringComparison.OrdinalIgnoreCase))
        {
            await next();
            return;
        }

        var originalBody = context.Response.Body;
        await using var buffer = new MemoryStream();
        context.Response.Body = buffer;

        await next();

        buffer.Position = 0;
        var swaggerJson = await new StreamReader(buffer).ReadToEndAsync();

        // Swagger UI usado no projeto nao reconhece a revisao 3.0.4 emitida pelo Microsoft.OpenApi 2.x.
        swaggerJson = swaggerJson.Replace("\"openapi\": \"3.0.4\"", "\"openapi\": \"3.0.1\"");

        var bytes = Encoding.UTF8.GetBytes(swaggerJson);
        context.Response.Body = originalBody;
        context.Response.ContentType = "application/json; charset=utf-8";
        context.Response.ContentLength = bytes.Length;

        await context.Response.Body.WriteAsync(bytes);
    });

    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "EcoTag v1");
    });
}

app.UseCors(CorsPolicyName);
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
