# Ajustes Windows para NuGet e HTTPS

Use estes comandos apenas se o `dotnet restore` ou `dotnet run` falhar com erro de SSL ou NuGet.

## 1. Conferir .NET 10

```powershell
dotnet --list-sdks
dotnet --list-runtimes
```

O projeto espera SDK `10.0.103` ou superior e runtime `Microsoft.AspNetCore.App 10`.

## 2. Restaurar certificados e confiar no certificado de desenvolvimento

Abra o PowerShell como administrador:

```powershell
dotnet dev-certs https --clean
dotnet dev-certs https --trust
```

## 3. Recriar fonte NuGet oficial

```powershell
dotnet nuget remove source nuget.org
dotnet nuget add source https://api.nuget.org/v3/index.json -n nuget.org
dotnet nuget list source
```

## 4. Limpar caches

```powershell
dotnet nuget locals all --clear
dotnet restore Backend\EcoTag\EcoTag.csproj
```

## 5. Instalar ferramenta EF Core 10

O repositorio ja inclui uma ferramenta local. Na raiz do repositorio, tente primeiro:

```powershell
dotnet tool restore
dotnet ef --version
```

Se preferir ferramenta global:

```powershell
dotnet tool install --global dotnet-ef --version 10.0.3
dotnet ef --version
```

Se ela ja existir:

```powershell
dotnet tool update --global dotnet-ef --version 10.0.3
```

## 6. PostgreSQL local

Se o terminal mostrar erro de conexao com PostgreSQL local, confira se o servico esta rodando e se a senha em `appsettings.json` bate com a senha do usuario `postgres`.

Connection string usada pelo projeto:

```txt
Host=localhost;Port=5432;Database=ecotag;Username=postgres;Password=cafeinado
```

Para criar o banco manualmente no PostgreSQL, use:

```powershell
createdb -U postgres ecotag
```
