# EcoTag

EcoTag e uma API RESTful em ASP.NET Core para calcular e apresentar o volume de CO2e evitado quando um veiculo utiliza tag automatica em pedagios ou estacionamentos.

O MVP compara dois cenarios:

- Sem tag: o veiculo para, espera em fila/cabine, fica em marcha lenta, acelera novamente e pode gerar ticket em papel.
- Com tag: o veiculo passa de forma continua, sem parada.

A partir dessa diferenca, o backend transforma pequenas eficiencias operacionais em indicadores de sustentabilidade para o usuario.

## Status

Projeto em desenvolvimento como MVP academico.

Entrega atual:

- Backend ASP.NET Core REST API.
- Banco PostgreSQL local.
- Entity Framework Core com migrations.
- Autenticacao JWT.
- Swagger para demonstracao e testes.
- Frontend mantido no repositorio, mas a demonstracao principal desta fase e pelo Swagger.

## Tecnologias

- .NET 10
- ASP.NET Core Web API
- Entity Framework Core 10
- PostgreSQL
- Npgsql
- JWT Bearer Authentication
- BCrypt.Net-Next
- Swagger / Swashbuckle

## Estrutura do repositorio

```txt
Projeto-2-CesarSchool/
+-- Backend/
|   +-- EcoTag/
|       +-- Controllers/
|       +-- Core/
|       |   +-- DTOs/
|       |   +-- Interfaces/
|       |   +-- Mappers/
|       |   +-- Services/
|       |   +-- Swagger/
|       |   +-- Utils/
|       +-- Data/
|       +-- Database/
|       +-- Migrations/
|       +-- Models/
|       +-- Program.cs
|       +-- appsettings.json
|       +-- EcoTag.csproj
|       +-- DOCUMENTACAO_BACKEND.txt
|       +-- POSTGRESQL_SETUP.md
+-- Frontend/
+-- DER.png
+-- UML.png
+-- global.json
+-- README.md
```

## Organizacao do backend

O backend usa uma separacao em camadas para manter o codigo mais facil de entender, testar e apresentar.

### Controllers

Ficam em `Backend/EcoTag/Controllers`.

Responsabilidade:

- Receber requisicoes HTTP.
- Validar o modelo de entrada via DTO/Data Annotations.
- Identificar o usuario logado quando a rota exige JWT.
- Chamar os services.
- Retornar respostas HTTP adequadas, como `200`, `201`, `204`, `400`, `401`, `403` e `404`.

Controllers nao concentram regra de negocio pesada.

### Core/DTOs

Ficam em `Backend/EcoTag/Core/DTOs`.

Responsabilidade:

- Definir objetos de entrada e saida da API.
- Evitar expor diretamente os models do banco.
- Controlar quais campos entram pela request e quais campos saem na response.

Exemplos:

- `RegisterRequestDTO`
- `LoginRequestDTO`
- `CreateVeiculoRequestDTO`
- `PassagemTagResponseDTO`
- `DashboardImpactoResponseDTO`

### Core/Interfaces

Ficam em `Backend/EcoTag/Core/Interfaces`.

Responsabilidade:

- Definir contratos dos services.
- Facilitar injecao de dependencia.
- Reduzir acoplamento entre controllers e implementacoes.

### Core/Services

Ficam em `Backend/EcoTag/Core/Services`.

Responsabilidade:

- Executar regras de negocio.
- Consultar e alterar dados usando `AppDbContext`.
- Validar propriedade dos dados do usuario.
- Calcular CO2e evitado.
- Gerar token JWT.
- Aplicar regras de gamificacao, ranking e simulacao.

### Core/Mappers

Fica em `Backend/EcoTag/Core/Mappers`.

Responsabilidade:

- Converter models do banco em DTOs de resposta.
- Centralizar transformacoes simples entre entidades e saidas da API.

### Core/Swagger

Fica em `Backend/EcoTag/Core/Swagger`.

Responsabilidade:

- Melhorar a documentacao exibida no Swagger.
- Adicionar descricao das tags.
- Aplicar configuracoes de seguranca JWT no Swagger.

### Core/Utils

Fica em `Backend/EcoTag/Core/Utils`.

Responsabilidade:

- Normalizar textos como combustivel, tipo de veiculo e tipo de local.
- Guardar constantes aceitas pelo sistema.

### Models

Ficam em `Backend/EcoTag/Models`.

Responsabilidade:

- Representar as tabelas do banco de dados.
- Definir propriedades e relacionamentos das entidades.

Entidades principais:

- `UserModel`
- `VeiculoModel`
- `FatorEmissaoModel`
- `ParametrosCenarioSemTagModel`
- `LocalUsoModel`
- `PassagemTagModel`

### Data

Fica em `Backend/EcoTag/Data`.

Responsabilidade:

- Configurar o `AppDbContext`.
- Definir chaves primarias, relacionamentos, indices, constraints e seed inicial.

### Migrations

Fica em `Backend/EcoTag/Migrations`.

Responsabilidade:

- Versionar a estrutura do banco.
- Criar tabelas, relacionamentos e dados iniciais.

## Modelo de dados

Resumo das entidades:

```txt
UserModel
- Id
- Nome
- Email
- PasswordHash
- Role
- CreatedAt

VeiculoModel
- Id
- UsuarioId
- TipoVeiculo
- TipoCombustivel

FatorEmissaoModel
- TipoCombustivel
- FatorEmissao
- ConsumoMarchaLenta
- ConsumoAdicionalAceleracao

ParametrosCenarioSemTagModel
- TipoLocal
- TempoMedioFilaMinutos
- TempoEsperaCabineSegundos
- EmissaoTicketPapelKg

LocalUsoModel
- Id
- Nome
- TipoLocal

PassagemTagModel
- Id
- VeiculoId
- LocalUsoId
- DataHora
- Co2EvitadoKg
```

Relacionamentos principais:

- Um usuario possui varios veiculos.
- Um veiculo possui varias passagens.
- Uma passagem ocorre em um local de uso.
- Um veiculo usa um tipo de combustivel que referencia um fator de emissao.
- Um local de uso usa um tipo de local que referencia parametros ambientais.

## Regras de negocio

### Tipos aceitos

Tipos de veiculo:

- `carro`
- `moto`
- `caminhao`

Tipos de combustivel:

- `gasolina`
- `etanol`
- `diesel`

Tipos de local:

- `pedagio`
- `estacionamento`

### Calculo de CO2e evitado

Quando uma passagem e registrada, o cliente nao envia o CO2e evitado. O backend calcula automaticamente.

Formula:

```txt
tempoParadoHoras =
((tempoMedioFilaMinutos * 60) + tempoEsperaCabineSegundos) / 3600

litrosEvitados =
(consumoMarchaLenta * tempoParadoHoras) + consumoAdicionalAceleracao

co2EvitadoKg =
(litrosEvitados * fatorEmissao) + emissaoTicketPapelKg
```

O resultado e arredondado para 6 casas decimais.

### Dashboard

O dashboard soma as passagens do usuario autenticado e retorna:

- CO2e evitado no mes atual.
- CO2e evitado no ano atual.
- CO2e historico total.
- Total de passagens.
- Pontos sustentaveis.

### Simulador

O simulador calcula o impacto estimado de um cenario, mas nao salva historico.

Formula geral:

```txt
totalPassagens = dias * passagensPorDia
co2Total = co2PorPassagem * totalPassagens
```

### Gamificacao

Pontos sustentaveis:

```txt
pontos = floor(totalCo2EvitadoKg * 100)
```

Selos:

- `Iniciante Verde`: 1 kg.
- `Motorista Consciente`: 5 kg.
- `Guardiao do Ar`: 10 kg.
- `Referencia Sustentavel`: 25 kg.

### Ranking

O ranking mensal soma o CO2e evitado no mes atual e converte para pontos usando a mesma regra da gamificacao.

## Autenticacao e permissao

O sistema usa JWT Bearer Token.

Fluxo:

1. Cadastrar usuario em `POST /api/auth/register`.
2. Fazer login em `POST /api/auth/login`.
3. Copiar o token JWT retornado.
4. Enviar nas rotas protegidas pelo header:

```txt
Authorization: Bearer SEU_TOKEN
```

No Swagger, clique em `Authorize` e cole o token.

### Roles

O cadastro comum cria usuario com role:

```txt
user
```

Rotas administrativas exigem:

```txt
admin
```

Para testar rotas admin em ambiente local, promova um usuario no banco:

```sql
UPDATE "Users" SET "Role" = 'admin' WHERE "Email" = 'email@teste.com';
```

Depois faca login novamente para gerar um novo token com a role atualizada.

## Rotas principais

### Publicas

| Metodo | Rota | Descricao |
| --- | --- | --- |
| POST | `/api/auth/register` | Cadastra usuario comum |
| POST | `/api/auth/login` | Autentica usuario e retorna JWT |

### Usuario autenticado

| Metodo | Rota | Descricao |
| --- | --- | --- |
| GET | `/api/users/me` | Retorna perfil do usuario logado |
| PUT | `/api/users/me` | Atualiza nome e email do usuario logado |
| GET | `/api/veiculos` | Lista veiculos do usuario |
| POST | `/api/veiculos` | Cadastra veiculo |
| PUT | `/api/veiculos/{id}` | Atualiza veiculo do usuario |
| DELETE | `/api/veiculos/{id}` | Exclui veiculo do usuario |
| GET | `/api/passagens` | Lista historico de passagens do usuario |
| POST | `/api/passagens` | Registra passagem e calcula CO2e evitado |
| GET | `/api/dashboard/impacto` | Retorna indicadores ambientais do usuario |
| POST | `/api/simulador` | Simula impacto sem salvar historico |
| GET | `/api/gamificacao/me` | Retorna pontos e selos do usuario |
| GET | `/api/ranking?periodo=mensal&limit=10` | Retorna ranking mensal |

### Administrativas

| Metodo | Rota | Descricao |
| --- | --- | --- |
| GET | `/api/admin/fatores-emissao` | Lista fatores de emissao |
| GET | `/api/admin/fatores-emissao/{tipoCombustivel}` | Busca fator por combustivel |
| POST | `/api/admin/fatores-emissao` | Cria fator de emissao |
| PUT | `/api/admin/fatores-emissao/{tipoCombustivel}` | Atualiza fator de emissao |
| DELETE | `/api/admin/fatores-emissao/{tipoCombustivel}` | Remove fator de emissao |
| GET | `/api/admin/parametros-cenario` | Lista parametros ambientais |
| GET | `/api/admin/parametros-cenario/{tipoLocal}` | Busca parametros por tipo de local |
| POST | `/api/admin/parametros-cenario` | Cria parametros ambientais |
| PUT | `/api/admin/parametros-cenario/{tipoLocal}` | Atualiza parametros ambientais |
| DELETE | `/api/admin/parametros-cenario/{tipoLocal}` | Remove parametros ambientais |
| GET | `/api/admin/locais-uso` | Lista locais de uso |
| GET | `/api/admin/locais-uso/{id}` | Busca local por id |
| POST | `/api/admin/locais-uso` | Cria local de uso |
| PUT | `/api/admin/locais-uso/{id}` | Atualiza local de uso |
| DELETE | `/api/admin/locais-uso/{id}` | Remove local de uso |

Documentacao detalhada com exemplos de request e response:

```txt
Backend/EcoTag/DOCUMENTACAO_BACKEND.txt
```

## Codigos HTTP usados

| Codigo | Uso |
| --- | --- |
| 200 | Consulta, login, atualizacao ou simulacao bem sucedida |
| 201 | Recurso criado |
| 204 | Recurso excluido sem corpo de resposta |
| 400 | Dados invalidos ou regra de negocio violada |
| 401 | Token ausente, invalido ou expirado |
| 403 | Usuario autenticado sem permissao de admin |
| 404 | Recurso inexistente ou nao pertence ao usuario |

Formato comum de erro:

```json
{
  "message": "Descricao do erro."
}
```

## Configuracao local

### Requisitos

- .NET SDK 10.0.103 ou superior.
- PostgreSQL instalado e rodando localmente.
- Banco chamado `ecotag`.

O arquivo `global.json` fixa o SDK esperado:

```json
{
  "sdk": {
    "version": "10.0.103",
    "rollForward": "latestFeature"
  }
}
```

### Banco de dados

Connection string atual em `Backend/EcoTag/appsettings.json`:

```txt
Host=localhost;Port=5432;Database=ecotag;Username=postgres;Password=cafeexpresso
```

Se a senha do PostgreSQL local for diferente, altere apenas o `Password`.

Para criar o banco pelo terminal:

```powershell
createdb -U postgres ecotag
```

Se `createdb` nao estiver no PATH, crie o banco pelo pgAdmin com o nome:

```txt
ecotag
```

### Restaurar dependencias

Execute na raiz do repositorio:

```powershell
dotnet restore Backend\EcoTag\EcoTag.csproj
```

### Rodar a API

Execute na raiz do repositorio:

```powershell
dotnet run --project Backend\EcoTag\EcoTag.csproj --launch-profile http
```

Em ambiente `Development`, a API executa as migrations automaticamente ao iniciar:

```csharp
dbContext.Database.Migrate();
```

URL padrao:

```txt
http://localhost:5295
```

Swagger:

```txt
http://localhost:5295/swagger
```

### Build

```powershell
dotnet build Backend\EcoTag\EcoTag.csproj
```

## Seed inicial

O banco recebe dados tecnicos minimos para a demonstracao:

- Fatores de emissao para `gasolina`, `etanol` e `diesel`.
- Parametros para `pedagio` e `estacionamento`.
- Locais de uso demo.

Isso permite testar rapidamente:

- Cadastro de usuario.
- Login.
- Cadastro de veiculo.
- Registro de passagem.
- Dashboard.
- Simulador.
- Gamificacao.
- Ranking.

## Ordem sugerida

1. Abrir `http://localhost:5295/swagger`.
2. Cadastrar usuario em `POST /api/auth/register`.
3. Fazer login em `POST /api/auth/login`.
4. Copiar o token JWT.
5. Autorizar no Swagger pelo botao `Authorize`.
6. Cadastrar veiculo em `POST /api/veiculos`.
7. Listar veiculos em `GET /api/veiculos`.
8. Registrar passagem em `POST /api/passagens`.
9. Consultar historico em `GET /api/passagens`.
10. Ver impacto em `GET /api/dashboard/impacto`.
11. Testar simulador em `POST /api/simulador`.
12. Ver gamificacao em `GET /api/gamificacao/me`.
13. Ver ranking em `GET /api/ranking?periodo=mensal&limit=10`.
14. Rotas admin

## CORS

O backend possui CORS configurado para testes locais.

Origens configuradas:

- `http://localhost:3000`
- `http://localhost:5173`
- `http://localhost:5500`
- `http://localhost:5000`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:5500`

Tambem aceita origin `null`, util para testar HTML aberto diretamente no navegador.

## Swagger

O Swagger esta configurado em `Program.cs`.

Recursos importantes:

- Titulo e descricao da API.
- Botao `Authorize` para JWT.
- Filtros para melhorar descricoes.
- Ajuste de compatibilidade para o Swagger UI reconhecer a versao OpenAPI gerada.

## Observacoes de seguranca

O `appsettings.json` atual usa configuracoes locais de desenvolvimento.

Em producao, o ideal e configurar via variaveis de ambiente:

- `ConnectionStrings__DefaultConnection`
- `Jwt__Key`
- `Jwt__Issuer`
- `Jwt__Audience`

## Arquivos complementares

- `Backend/EcoTag/DOCUMENTACAO_BACKEND.txt`: documentacao detalhada das rotas, requests, responses e retornos HTTP.
- `Backend/EcoTag/POSTGRESQL_SETUP.md`: guia rapido de configuracao local do PostgreSQL.
- `UML.png`: diagrama de classes.
- `DER.png`: diagrama entidade-relacionamento.
