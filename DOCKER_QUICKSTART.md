# 🚀 Inicio Rápido con Docker

## En 3 pasos simples:

### 1️⃣ Configurar variables de entorno

```bash
# Windows PowerShell
Copy-Item .env.docker .env

# Linux/Mac
cp .env.docker .env
```

### 2️⃣ Iniciar el sistema

**Opción A: Script automático (Recomendado)**

```bash
# Windows PowerShell
.\docker-start.ps1

# Linux/Mac
chmod +x docker-start.sh
./docker-start.sh
```

**Opción B: Comando directo**

```bash
docker-compose up -d
```

### 3️⃣ Acceder a la aplicación

- **Aplicación**: http://localhost
- **n8n**: http://localhost/n8n
- **API**: http://localhost/api/health

## 👤 Credenciales por defecto

| Usuario | Email | Password |
|---------|-------|----------|
| Admin | admin@manufactura.com | admin123 |
| Operador | operador@manufactura.com | operador123 |

## 🛑 Detener el sistema

```bash
docker-compose down
```

## 📖 Documentación completa

Ver [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) para más detalles.
