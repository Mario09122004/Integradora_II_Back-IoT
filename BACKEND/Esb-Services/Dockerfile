# STAGE 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar solución y código
COPY OnlyESBservice.sln ./
COPY . ./

# Restaurar paquetes NuGet
RUN dotnet restore OnlyESBservice.sln

# Publicar el proyecto correcto (case sensitive)
RUN dotnet publish OnlyESBservice/OnlyESBservice.csproj -c Release -o /app/publish

# STAGE 2: Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

# Exponer puerto 8080 (ajusta si usas otro puerto)
EXPOSE 8080

# Ejecutar la app usando el nombre correcto del DLL
ENTRYPOINT ["dotnet", "OnlyESBservice.dll"]
