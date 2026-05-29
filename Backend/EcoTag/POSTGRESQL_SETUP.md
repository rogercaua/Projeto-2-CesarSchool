# Configuracao PostgreSQL local e .NET 10

O projeto esta configurado para usar PostgreSQL local.

## 1. Conferir o .NET

```powershell
dotnet --list-sdks
dotnet --list-runtimes
```

O projeto espera SDK `10.0.103` ou superior e runtime `Microsoft.AspNetCore.App 10`.

## 2. Conferir a connection string

O arquivo `appsettings.json` usa:

```txt
Host=localhost;Port=5432;Database=ecotag;Username=postgres;Password=cafeinado
```

Se sua senha do PostgreSQL for diferente, altere apenas o `Password`.

## 3. Criar o banco

Se o banco ainda nao existir:

```powershell
createdb -U postgres ecotag
```

Se o comando `createdb` nao estiver no PATH, crie o banco pelo pgAdmin com o nome `ecotag`.

## 4. Aplicar as tabelas

Opcao A: deixe a API aplicar automaticamente.

Em ambiente `Development`, a API executa as migrations ao iniciar:

```powershell
dotnet run --project Backend\EcoTag\EcoTag.csproj --launch-profile http
```

Opcao B: aplicar com EF Core:

```powershell
dotnet tool restore
dotnet ef database update --project Backend\EcoTag\EcoTag.csproj
```

Opcao C: criar pelo pgAdmin.

Abra o Query Tool do banco `ecotag`, cole o conteudo de `Backend\EcoTag\Database\postgresql-init.sql` e execute.

## 5. Rodar a API

```powershell
dotnet run --project Backend\EcoTag\EcoTag.csproj --launch-profile http
```

Swagger:

```txt
http://localhost:5295/swagger
```
