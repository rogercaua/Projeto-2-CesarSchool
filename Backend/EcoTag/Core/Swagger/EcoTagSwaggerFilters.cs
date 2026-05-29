using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace EcoTag.Core.Swagger
{
    public class BearerSecurityOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var allowAnonymous = context.MethodInfo
                .GetCustomAttributes(true)
                .OfType<AllowAnonymousAttribute>()
                .Any();

            if (allowAnonymous)
            {
                return;
            }

            var authorizeAttributes = context.MethodInfo
                .GetCustomAttributes(true)
                .OfType<AuthorizeAttribute>()
                .Concat(context.MethodInfo.DeclaringType?
                    .GetCustomAttributes(true)
                    .OfType<AuthorizeAttribute>() ?? []);

            var requiresAuth = authorizeAttributes.Any();

            if (!requiresAuth)
            {
                return;
            }

            operation.Responses ??= new OpenApiResponses();
            operation.Responses.TryAdd("401", new OpenApiResponse { Description = "Token JWT ausente, invalido ou expirado." });

            if (authorizeAttributes.Any(attribute => !string.IsNullOrWhiteSpace(attribute.Roles)))
            {
                operation.Responses.TryAdd("403", new OpenApiResponse { Description = "Usuario autenticado sem permissao para esta rota." });
            }

            operation.Security ??= [];
            operation.Security.Add(new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference("bearer", context.Document)] = []
            });
        }
    }

    public class EcoTagTagDescriptionsDocumentFilter : IDocumentFilter
    {
        public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
        {
            swaggerDoc.Tags = new HashSet<OpenApiTag>
            {
                new OpenApiTag { Name = "Auth", Description = "Cadastro e login para emissao do JWT." },
                new OpenApiTag { Name = "Users", Description = "Perfil do usuario autenticado." },
                new OpenApiTag { Name = "Veiculos", Description = "CRUD dos veiculos do proprio usuario." },
                new OpenApiTag { Name = "Passagens", Description = "Registro e consulta de passagens com calculo automatico de CO2e evitado." },
                new OpenApiTag { Name = "Dashboard", Description = "Indicadores de impacto ambiental do usuario." },
                new OpenApiTag { Name = "Simulador", Description = "Estimativa de impacto sem salvar historico." },
                new OpenApiTag { Name = "Gamificacao", Description = "Pontos sustentaveis e selos do usuario." },
                new OpenApiTag { Name = "Ranking", Description = "Leaderboard mensal por pontos sustentaveis." },
                new OpenApiTag { Name = "AdminFatoresEmissao", Description = "#rota de admin: fatores usados no motor de calculo." },
                new OpenApiTag { Name = "AdminParametrosCenario", Description = "#rota de admin: parametros do cenario sem tag." },
                new OpenApiTag { Name = "AdminLocaisUso", Description = "#rota de admin: locais disponiveis para passagens e simulacoes." }
            };
        }
    }
}
