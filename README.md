<div align="center">

# 🌱 EcoTag

### API RESTful para medir CO₂e evitado com o uso de tag automática em pedágios e estacionamentos

![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-Web_API-5C2D91?style=for-the-badge&logo=dotnet&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Local-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Entity Framework](https://img.shields.io/badge/Entity_Framework-Core-6DB33F?style=for-the-badge)
![JWT](https://img.shields.io/badge/Auth-JWT-orange?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Swagger](https://img.shields.io/badge/Docs-Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)

</div>

---

## 📌 Sobre o projeto

O **EcoTag** é uma API RESTful desenvolvida em **ASP.NET Core** para calcular e apresentar o volume de **CO₂e evitado** quando um veículo utiliza **tag automática** em pedágios ou estacionamentos.

O MVP compara dois cenários:

| Cenário | Descrição |
|---|---|
| 🚗 **Sem tag** | O veículo para, espera em fila/cabine, fica em marcha lenta, acelera novamente e pode gerar ticket em papel. |
| 🏷️ **Com tag** | O veículo passa de forma contínua, sem parada e com menor impacto operacional. |

A partir dessa diferença, o backend transforma pequenas eficiências operacionais em **indicadores de sustentabilidade** para o usuário.

---

## ✅ Status do projeto

Projeto em desenvolvimento como **MVP acadêmico**.

### Entrega atual

- ✅ Backend em **ASP.NET Core REST API**
- ✅ Banco de dados **PostgreSQL local**
- ✅ **Entity Framework Core** com migrations
- ✅ Autenticação com **JWT**
- ✅ Controle de permissões com **roles**
- ✅ Swagger para demonstração e testes
- ✅ Frontend mantido no repositório
- ✅ Demonstração principal da fase atual via **Swagger**

---

## 🧰 Tecnologias utilizadas

| Tecnologia | Uso no projeto |
|---|---|
| **.NET 10** | Plataforma principal do backend |
| **ASP.NET Core Web API** | Criação da API REST |
| **Entity Framework Core 10** | ORM e migrations |
| **PostgreSQL** | Banco de dados relacional |
| **Npgsql** | Provider PostgreSQL para .NET |
| **JWT Bearer Authentication** | Autenticação das rotas protegidas |
| **BCrypt.Net-Next** | Hash seguro de senhas |
| **Swagger / Swashbuckle** | Documentação e testes da API |

---

## 🗂️ Estrutura do repositório

```txt
Projeto-2-CesarSchool/
├── Backend/
│   └── EcoTag/
│       ├── Controllers/
│       ├── Core/
│       │   ├── DTOs/
│       │   ├── Interfaces/
│       │   ├── Mappers/
│       │   ├── Services/
│       │   ├── Swagger/
│       │   └── Utils/
│       ├── Data/
│       ├── Database/
│       ├── Migrations/
│       ├── Models/
│       ├── Program.cs
│       ├── appsettings.json
│       ├── EcoTag.csproj
│       ├── DOCUMENTACAO_BACKEND.txt
│       └── POSTGRESQL_SETUP.md
├── Frontend/
├── DER.png
├── UML.png
├── global.json
└── README.md
```

---

## 🧱 Organização do backend

O backend utiliza uma separação em camadas para manter o código mais limpo, testável e fácil de apresentar.

| Camada | Caminho | Responsabilidade |
|---|---|---|
| **Controllers** | `Backend/EcoTag/Controllers` | Receber requisições HTTP, validar entrada, chamar services e retornar respostas HTTP. |
| **DTOs** | `Backend/EcoTag/Core/DTOs` | Controlar os dados de entrada e saída da API. |
| **Interfaces** | `Backend/EcoTag/Core/Interfaces` | Definir contratos dos services e reduzir acoplamento. |
| **Services** | `Backend/EcoTag/Core/Services` | Executar regras de negócio, cálculos, validações e geração de token JWT. |
| **Mappers** | `Backend/EcoTag/Core/Mappers` | Converter models do banco em DTOs de resposta. |
| **Swagger** | `Backend/EcoTag/Core/Swagger` | Melhorar a documentação e configurar autenticação JWT no Swagger. |
| **Utils** | `Backend/EcoTag/Core/Utils` | Normalizar valores e centralizar constantes aceitas pelo sistema. |
| **Models** | `Backend/EcoTag/Models` | Representar as tabelas do banco de dados. |
| **Data** | `Backend/EcoTag/Data` | Configurar o `AppDbContext`, relacionamentos, índices, constraints e seed inicial. |
| **Migrations** | `Backend/EcoTag/Migrations` | Versionar a estrutura do banco de dados. |

> Os **Controllers não concentram regra de negócio pesada**. Eles recebem a requisição, validam o modelo e delegam o processamento para os services.

---

## 🧩 Modelo de dados

### Entidades principais

```txt
UserModel
├── Id
├── Nome
├── Email
├── PasswordHash
├── Role
└── CreatedAt

VeiculoModel
├── Id
├── UsuarioId
├── TipoVeiculo
└── TipoCombustivel

FatorEmissaoModel
├── TipoCombustivel
├── FatorEmissao
├── ConsumoMarchaLenta
└── ConsumoAdicionalAceleracao

ParametrosCenarioSemTagModel
├── TipoLocal
├── TempoMedioFilaMinutos
├── TempoEsperaCabineSegundos
└── EmissaoTicketPapelKg

LocalUsoModel
├── Id
├── Nome
└── TipoLocal

PassagemTagModel
├── Id
├── VeiculoId
├── LocalUsoId
├── DataHora
└── Co2EvitadoKg
```

### Relacionamentos principais

- Um **usuário** possui vários **veículos**.
- Um **veículo** possui várias **passagens**.
- Uma **passagem** ocorre em um **local de uso**.
- Um **veículo** usa um tipo de combustível que referencia um **fator de emissão**.
- Um **local de uso** usa um tipo de local que referencia **parâmetros ambientais**.

---

## ⚙️ Regras de negócio

### Tipos aceitos

| Categoria | Valores aceitos |
|---|---|
| **Tipo de veículo** | `carro`, `moto`, `caminhao` |
| **Tipo de combustível** | `gasolina`, `etanol`, `diesel` |
| **Tipo de local** | `pedagio`, `estacionamento` |

---

## 🧮 Cálculo de CO₂e evitado

Quando uma passagem é registrada, o cliente **não envia** o CO₂e evitado.  
O backend calcula automaticamente para evitar manipulação dos dados pelo usuário.

### Fórmula

```txt
tempoParadoHoras =
((tempoMedioFilaMinutos * 60) + tempoEsperaCabineSegundos) / 3600

litrosEvitados =
(consumoMarchaLenta * tempoParadoHoras) + consumoAdicionalAceleracao

co2EvitadoKg =
(litrosEvitados * fatorEmissao) + emissaoTicketPapelKg
```

O resultado é arredondado para **6 casas decimais**.

---

## 📊 Funcionalidades principais

### Dashboard

O dashboard soma as passagens do usuário autenticado e retorna:

- CO₂e evitado no mês atual
- CO₂e evitado no ano atual
- CO₂e histórico total
- Total de passagens
- Pontos sustentáveis

### Simulador

O simulador calcula o impacto estimado de um cenário, mas **não salva histórico**.

```txt
totalPassagens = dias * passagensPorDia
co2Total = co2PorPassagem * totalPassagens
```

### Gamificação

```txt
pontos = floor(totalCo2EvitadoKg * 100)
```

| Selo | Requisito |
|---|---|
| 🌱 **Iniciante Verde** | 1 kg |
| 🚗 **Motorista Consciente** | 5 kg |
| 🛡️ **Guardião do Ar** | 10 kg |
| 🏆 **Referência Sustentável** | 25 kg |

### Ranking

O ranking mensal soma o CO₂e evitado no mês atual e converte para pontos usando a mesma regra da gamificação.

---

## 🔐 Autenticação e permissões

O sistema utiliza **JWT Bearer Token**.

### Fluxo de autenticação

```txt
1. Cadastrar usuário
   POST /api/auth/register

2. Fazer login
   POST /api/auth/login

3. Copiar o token JWT retornado

4. Enviar o token nas rotas protegidas:
   Authorization: Bearer SEU_TOKEN
```

No Swagger, clique em **Authorize** e cole o token JWT.

### Roles

| Role | Permissão |
|---|---|
| `user` | Usuário comum, criado no cadastro padrão |
| `admin` | Acesso às rotas administrativas |

Para testar rotas admin em ambiente local, promova um usuário diretamente no banco:

```sql
UPDATE "Users"
SET "Role" = 'admin'
WHERE "Email" = 'email@teste.com';
```

Depois faça login novamente para gerar um novo token com a role atualizada.

---

## 🌐 Rotas principais

### Rotas públicas

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/auth/register` | Cadastra usuário comum |
| `POST` | `/api/auth/login` | Autentica usuário e retorna JWT |

### Rotas do usuário autenticado

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/users/me` | Retorna perfil do usuário logado |
| `PUT` | `/api/users/me` | Atualiza nome e email do usuário logado |
| `GET` | `/api/veiculos` | Lista veículos do usuário |
| `POST` | `/api/veiculos` | Cadastra veículo |
| `PUT` | `/api/veiculos/{id}` | Atualiza veículo do usuário |
| `DELETE` | `/api/veiculos/{id}` | Exclui veículo do usuário |
| `GET` | `/api/passagens` | Lista histórico de passagens do usuário |
| `POST` | `/api/passagens` | Registra passagem e calcula CO₂e evitado |
| `GET` | `/api/dashboard/impacto` | Retorna indicadores ambientais do usuário |
| `POST` | `/api/simulador` | Simula impacto sem salvar histórico |
| `GET` | `/api/gamificacao/me` | Retorna pontos e selos do usuário |
| `GET` | `/api/ranking?periodo=mensal&limit=10` | Retorna ranking mensal |

### Rotas administrativas

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/admin/fatores-emissao` | Lista fatores de emissão |
| `GET` | `/api/admin/fatores-emissao/{tipoCombustivel}` | Busca fator por combustível |
| `POST` | `/api/admin/fatores-emissao` | Cria fator de emissão |
| `PUT` | `/api/admin/fatores-emissao/{tipoCombustivel}` | Atualiza fator de emissão |
| `DELETE` | `/api/admin/fatores-emissao/{tipoCombustivel}` | Remove fator de emissão |
| `GET` | `/api/admin/parametros-cenario` | Lista parâmetros ambientais |
| `GET` | `/api/admin/parametros-cenario/{tipoLocal}` | Busca parâmetros por tipo de local |
| `POST` | `/api/admin/parametros-cenario` | Cria parâmetros ambientais |
| `PUT` | `/api/admin/parametros-cenario/{tipoLocal}` | Atualiza parâmetros ambientais |
| `DELETE` | `/api/admin/parametros-cenario/{tipoLocal}` | Remove parâmetros ambientais |
| `GET` | `/api/admin/locais-uso` | Lista locais de uso |
| `GET` | `/api/admin/locais-uso/{id}` | Busca local por id |
| `POST` | `/api/admin/locais-uso` | Cria local de uso |
| `PUT` | `/api/admin/locais-uso/{id}` | Atualiza local de uso |
| `DELETE` | `/api/admin/locais-uso/{id}` | Remove local de uso |

A documentação detalhada com exemplos de request e response está em:

```txt
Backend/EcoTag/DOCUMENTACAO_BACKEND.txt
```

---

## 📬 Códigos HTTP usados

| Código | Uso |
|---|---|
| `200 OK` | Consulta, login, atualização ou simulação bem-sucedida |
| `201 Created` | Recurso criado |
| `204 No Content` | Recurso excluído sem corpo de resposta |
| `400 Bad Request` | Dados inválidos ou regra de negócio violada |
| `401 Unauthorized` | Token ausente, inválido ou expirado |
| `403 Forbidden` | Usuário autenticado sem permissão de admin |
| `404 Not Found` | Recurso inexistente ou que não pertence ao usuário |

Formato comum de erro:

```json
{
  "message": "Descrição do erro."
}
```

---

## 🚀 Configuração local

### Requisitos

- **.NET SDK 10.0.103** ou superior
- **PostgreSQL** instalado e rodando localmente
- Banco de dados chamado `ecotag`

O arquivo `global.json` fixa o SDK esperado:

```json
{
  "sdk": {
    "version": "10.0.103",
    "rollForward": "latestFeature"
  }
}
```

---

## 🐘 Banco de dados

A connection string fica em:

```txt
Backend/EcoTag/appsettings.json
```

Exemplo para ambiente local:

```txt
Host=localhost;Port=5432;Database=ecotag;Username=postgres;Password=SUA_SENHA
```

> Recomenda-se não versionar senhas reais de banco ou chaves JWT reais.

Para criar o banco pelo terminal:

```powershell
createdb -U postgres ecotag
```

Se `createdb` não estiver no PATH, crie o banco pelo **pgAdmin** com o nome:

```txt
ecotag
```

---

## ▶️ Como rodar o projeto

Execute os comandos na raiz do repositório.

### Restaurar dependências

```powershell
dotnet restore Backend\EcoTag\EcoTag.csproj
```

### Rodar a API

```powershell
dotnet run --project Backend\EcoTag\EcoTag.csproj --launch-profile http
```

Em ambiente `Development`, a API executa as migrations automaticamente ao iniciar:

```csharp
dbContext.Database.Migrate();
```

### Build

```powershell
dotnet build Backend\EcoTag\EcoTag.csproj
```

---

## 🔎 URLs úteis

| Recurso | URL |
|---|---|
| API local | `http://localhost:5295` |
| Swagger | `http://localhost:5295/swagger` |

---

## 🌱 Seed inicial

O banco recebe dados técnicos mínimos para a demonstração:

- Fatores de emissão para `gasolina`, `etanol` e `diesel`
- Parâmetros para `pedagio` e `estacionamento`
- Locais de uso demo

Isso permite testar rapidamente:

- Cadastro de usuário
- Login
- Cadastro de veículo
- Registro de passagem
- Dashboard
- Simulador
- Gamificação
- Ranking

---

## 🧪 Ordem sugerida para demonstração

1. Abrir `http://localhost:5295/swagger`.
2. Cadastrar usuário em `POST /api/auth/register`.
3. Fazer login em `POST /api/auth/login`.
4. Copiar o token JWT.
5. Autorizar no Swagger pelo botão **Authorize**.
6. Cadastrar veículo em `POST /api/veiculos`.
7. Listar veículos em `GET /api/veiculos`.
8. Registrar passagem em `POST /api/passagens`.
9. Consultar histórico em `GET /api/passagens`.
10. Ver impacto em `GET /api/dashboard/impacto`.
11. Testar simulador em `POST /api/simulador`.
12. Ver gamificação em `GET /api/gamificacao/me`.
13. Ver ranking em `GET /api/ranking?periodo=mensal&limit=10`.
14. Explicar rotas admin e premissas ambientais editáveis.

---

## 🌍 CORS

O backend possui CORS configurado para testes locais.

### Origens configuradas

```txt
http://localhost:3000
http://localhost:5173
http://localhost:5500
http://localhost:5000
http://127.0.0.1:3000
http://127.0.0.1:5173
http://127.0.0.1:5500
```

Também aceita origin `null`, útil para testar HTML aberto diretamente no navegador.

---

## 📖 Swagger

O Swagger está configurado em `Program.cs`.

Recursos importantes:

- Título e descrição da API
- Botão **Authorize** para JWT
- Filtros para melhorar descrições
- Ajuste de compatibilidade para o Swagger UI reconhecer a versão OpenAPI gerada

---

## 🛡️ Observações de segurança

O `appsettings.json` atual deve ser usado apenas para desenvolvimento local.

Em produção, o ideal é configurar valores sensíveis via variáveis de ambiente:

```txt
ConnectionStrings__DefaultConnection
Jwt__Key
Jwt__Issuer
Jwt__Audience
```

Boas práticas aplicadas ou recomendadas:

- Senhas armazenadas com **hash BCrypt**
- Autenticação via **JWT**
- Rotas sensíveis protegidas por **role admin**
- CO₂e calculado no backend, evitando manipulação pelo cliente
- DTOs usados para evitar exposição direta dos models
- Connection string e chaves reais fora do versionamento

---

## 📎 Arquivos complementares

| Arquivo | Descrição |
|---|---|
| `Backend/EcoTag/DOCUMENTACAO_BACKEND.txt` | Documentação detalhada das rotas, requests, responses e retornos HTTP |
| `Backend/EcoTag/POSTGRESQL_SETUP.md` | Guia rápido de configuração local do PostgreSQL |
| `UML.png` | Diagrama de classes |
| `DER.png` | Diagrama entidade-relacionamento |

---

## 🎤 Pontos fortes para apresentar

- Separação clara entre **controllers, services, DTOs, models e banco**
- JWT protege rotas do usuário
- Role `admin` protege rotas sensíveis de configuração ambiental
- CO₂e evitado é calculado no backend, evitando manipulação pelo cliente
- Simulador não altera histórico
- Dashboard, gamificação e ranking usam passagens reais
- Premissas ambientais podem ser alteradas por admin sem mudar o código-fonte

---

<div align="center">

**EcoTag**  
Transformando eficiência operacional em indicador de sustentabilidade.

</div>
