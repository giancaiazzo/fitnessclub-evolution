# Despliegue en el VPS

Este despliegue publica los cinco servicios en un único VPS:

- `https://fcevolution.online`: frontend React.
- `https://api.fcevolution.online`: API ASP.NET Core.
- `https://n8n.fcevolution.online`: n8n.
- PostgreSQL: accesible solamente desde la red privada de Docker.
- Caddy: proxy inverso y certificados HTTPS automáticos.

## Primer despliegue

Desde `/opt/fitnessclub/app`:

```bash
git pull
cp .env.example .env
nano .env
```

Generá cuatro secretos distintos con el siguiente comando y pegá uno en cada
variable vacía del archivo `.env`:

```bash
openssl rand -hex 32
```

No completes `VITE_API_URL`: dentro del VPS el frontend utiliza `/api`.

Validá la configuración y levantá los servicios:

```bash
docker compose config --quiet
docker compose up -d --build
docker compose ps
```

La primera compilación puede demorar varios minutos. La API aplica las
migraciones de Entity Framework al iniciar. Caddy solicita automáticamente los
certificados de los tres dominios.

## Comprobaciones

```bash
curl -fsS https://api.fcevolution.online/health
curl -I https://fcevolution.online
curl -I https://n8n.fcevolution.online
docker compose ps
```

Después de la primera carga de n8n, abrí `https://n8n.fcevolution.online` y
creá su cuenta propietaria. Las credenciales de Meta y OpenAI se guardan desde
la interfaz de n8n, nunca en Git ni en el frontend.

La clave `N8N_API_KEY` se configura en n8n como credencial **Header Auth** con
el nombre `X-N8N-API-KEY`. El detalle de endpoints y workflows está en
[`BACKEND_MODULOS.md`](BACKEND_MODULOS.md).

## Actualizaciones

Si el VPS ya tenía `.env`, agregá `N8N_API_KEY` manualmente antes de recrear
los contenedores; no reemplaces el archivo porque contiene los secretos y datos
de la instalación actual.

```bash
mkdir -p /opt/fitnessclub/backups
docker compose exec -T postgres pg_dump -U fitnessclub -d fitnessclub_db \
  > /opt/fitnessclub/backups/fitnessclub_antes_actualizar.sql
git pull
docker compose config --quiet
docker compose up -d --build
docker image prune -f
```

Los `push` de GitHub no actualizan este VPS automáticamente. Estos comandos se
ejecutan manualmente salvo que más adelante se configure una CI/CD específica.

## Registros y respaldo manual

```bash
docker compose logs --tail=100 backend
docker compose logs --tail=100 n8n
docker compose logs --tail=100 caddy
docker compose exec -T postgres pg_dump -U fitnessclub -d fitnessclub_db > fitnessclub_db.sql
```

El archivo del respaldo contiene datos personales del gimnasio: debe guardarse
fuera del repositorio y protegerse como información confidencial.
