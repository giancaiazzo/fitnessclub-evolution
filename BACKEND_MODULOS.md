# Backend y base de datos de los módulos 1, 2 y 3

Este documento describe la preparación realizada en ASP.NET Core y PostgreSQL.
Los comentarios XML ubicados sobre los métodos esenciales de cada controlador
explican también qué consulta cada endpoint y qué devuelve.

## Regla de arquitectura

```text
Portal / Gestión ──HTTPS──> ASP.NET Core ──red privada──> PostgreSQL
                                  ▲
                                  │ X-N8N-API-KEY
                                  ▼
                               n8n ──> Meta WhatsApp / IA / Instagram
```

n8n no recibe la contraseña de PostgreSQL ni consulta tablas directamente. El
backend conserva las reglas de clientes, cuotas, rutinas, consentimiento y
deduplicación. PostgreSQL no publica el puerto 5432 fuera de Docker.

## Cambios en PostgreSQL

La migración `20260820120000_PrepararAutomatizacionYSeguridad` agrega:

- consentimiento y baja de WhatsApp en `Clientes`;
- usuario normalizado, rol, estado y hash en `Entrenadores`;
- códigos de recuperación con hash, vencimiento e intentos limitados;
- un outbox en `Notificaciones`, con clave única de idempotencia y resultados;
- `MensajesWhatsapp`, que guarda únicamente la auditoría mínima y el ID único de Meta;
- índices para teléfono, vencimientos, notificaciones pendientes y deduplicación.

Al iniciar en producción, `Database__ApplyMigrations=true` aplica la migración.
Luego `LegacyCredentialMigration` transforma las contraseñas históricas al hash
oficial de ASP.NET Core y pone el campo de texto plano en `NULL`.

## Métodos esenciales

### Módulo 1 — portal público

| Método | Consulta | Devuelve |
|---|---|---|
| `GET /api/servicios` | Catálogo y metadatos, opcionalmente filtrado con `ILIKE` | JSON liviano y URL de cada imagen |
| `GET /api/servicios/{id}/imagen` | Solo binario y tipo MIME | Archivo o 404 |
| `GET /api/ejercicios` | Ejercicios activos y metadatos | JSON y URLs de imagen/video |
| `GET /api/ejercicios/{id}/video` | Solo el video permitido | Binario con soporte de rangos o 404 |

### Módulo 2 — gestión

| Método | Consulta/acción | Devuelve |
|---|---|---|
| `POST /api/auth/login` | Usuario normalizado + hash; crea cookie | Sesión sin contraseña/hash |
| `POST /api/auth/recuperacion/solicitar` | Cuenta activa y teléfono; guarda código con hash | 202 genérico y dispara webhook de n8n |
| `POST /api/auth/recuperacion/confirmar` | Vencimiento, intentos y hash del código | 204 al cambiar la clave |
| `POST /api/clientes` | Rutina y documento único | Cliente creado y evento de rutina si consintió |
| `PUT /api/clientes/{id}` | Actualiza ficha, rutina y consentimiento | Cliente actualizado y posible evento idempotente |
| `GET /api/clientes/estado-pagos` | Última cuota confirmada por cliente | Vigencia, fechas y días restantes/vencidos |
| `POST /api/pagos` | Último vencimiento confirmado | Pago y nuevo mes sin perder días abonados |
| `GET /api/pagos/cliente/{id}` | Historial completo del cliente | Pagos ordenados desde el más reciente |
| `POST /api/rutinas` | Firma, tamaño y páginas del PDF | Metadatos de la rutina creada |
| `POST /api/entrenadores` | Usuario único y contraseña recibida por HTTPS | Cuenta con hash; nunca devuelve la clave |

### Módulo 3 — bot y automatizaciones

Todos estos endpoints exigen `X-N8N-API-KEY`:

| Método | Uso en n8n | Devuelve |
|---|---|---|
| `POST /api/integraciones/n8n/mensajes/reservar` | Primer nodo tras WhatsApp Trigger | `procesar=true` una sola vez por ID de Meta |
| `POST /api/integraciones/n8n/mensajes/resultado` | Último nodo del workflow | 204 y estado de auditoría |
| `GET /api/integraciones/n8n/clientes/por-telefono/{tel}` | Autorizar funciones privadas | cliente, cuota, rutina, consentimiento y bandera de acceso |
| `POST /api/integraciones/n8n/cobranzas/reservar?dias=3` | Cron diario | avisos nuevos; nunca repite la misma cuota |
| `GET /api/integraciones/n8n/notificaciones/pendientes` | Rutinas y reintentos | outbox procesable con teléfono y referencia |
| `POST /api/integraciones/n8n/notificaciones/{id}/tomar` | Antes de llamar a Meta | 204 para un solo worker; 409 para duplicados |
| `POST /api/integraciones/n8n/notificaciones/resultado` | Resultado de Meta | 204 y trazabilidad enviada/entregada/leída/fallida |
| `GET /api/integraciones/n8n/clientes/{id}/rutina/pdf` | Adjuntar rutina en Meta | PDF privado, sin URL pública |
| `POST /api/integraciones/n8n/consentimiento` | `ALTA`/`BAJA` del bot | consentimiento actualizado o conflicto si el teléfono es ambiguo |

## Configuración segura de n8n

1. Generar `N8N_API_KEY` con `openssl rand -hex 32` y guardarla solamente en
   `.env` del VPS.
2. En cada nodo **HTTP Request** de n8n agregar el header
   `X-N8N-API-KEY: <valor de N8N_API_KEY>` mediante una credencial de tipo Header
   Auth. No escribir el valor directamente dentro del workflow exportado.
3. En el Webhook `recuperacion-contrasena`, exigir el mismo header y responder
   rápidamente con 2xx después de validar el payload.
4. Guardar los tokens de Meta y la clave del proveedor de IA en **Credentials**
   de n8n. No deben estar en nodos Code, Git, variables del frontend ni logs.
5. Para el workflow de recuperación, desactivar el guardado de datos de
   ejecuciones exitosas, porque el payload contiene un código temporal.

## Contrato sugerido de los cinco workflows

1. **Router entrante:** WhatsApp Trigger → reservar ID Meta → consultar teléfono
   → Switch registrado/activo → IA con límites o respuestas públicas → informar resultado.
2. **Recuperación:** Webhook del backend → plantilla de autenticación de Meta.
3. **Cobranzas:** Schedule diario → reservar vencimientos a 3 días → tomar cada
   notificación → plantilla aprobada → informar resultado.
4. **Rutina asignada:** Schedule/Webhook → notificaciones pendientes tipo
   `RutinaAsignada` → tomar → descargar PDF → enviar por Meta → informar resultado.
5. **Publicación de la dueña:** WhatsApp Trigger → verificar número autorizado
   → confirmación explícita → Graph API de Instagram. Este flujo no debe dar
   acceso de publicación a un cliente común.

El modelo de IA no decide si una persona está autorizada. El Switch debe usar
`permiteDatosPrivados` entregado por el backend antes de ejecutar el nodo de IA.

## Crear las cuentas solicitadas sin guardar claves en Git

`POST /api/entrenadores` permite crear **PaoMu** y **RodrigoGue** con hash. Se
necesita el teléfono real de WhatsApp de cada persona para la recuperación; por
eso no se insertan cuentas incompletas ni contraseñas en una migración. Después
del despliegue, iniciar sesión como administrador, conservar la cookie y ejecutar
el alta desde HTTPS/Postman. Ejemplo de cuerpo:

```json
{
  "nombre": "Paola",
  "apellido": "Muse",
  "telefono": "598XXXXXXXX",
  "nombreUsuario": "PaoMu",
  "contrasena": "INGRESAR_EN_POSTMAN_NO_EN_GIT",
  "rol": "Administrador"
}
```

Repetir con Rodrigo Guerrero, `RodrigoGue` y su teléfono. El endpoint responde
sin el campo `contrasena` ni `contrasenaHash`.

## Verificación después del despliegue

```bash
# 1. Crear un respaldo fuera del repositorio.
mkdir -p /opt/fitnessclub/backups
docker compose exec -T postgres pg_dump -U fitnessclub -d fitnessclub_db \
  > /opt/fitnessclub/backups/fitnessclub_antes_modulo3.sql

# 2. Validar variables y construir.
docker compose config --quiet
docker compose up -d --build

# 3. Verificar salud, contenedores y migración.
curl -fsS https://api.fcevolution.online/health
docker compose ps
docker compose logs --tail=120 backend
docker compose exec -T postgres psql -U fitnessclub -d fitnessclub_db \
  -c 'SELECT "MigrationId" FROM "__EFMigrationsHistory" ORDER BY "MigrationId" DESC LIMIT 3;'

# 4. Confirmar que no quedan contraseñas históricas en texto plano.
docker compose exec -T postgres psql -U fitnessclub -d fitnessclub_db \
  -c 'SELECT COUNT(*) AS pendientes FROM "Entrenadores" WHERE "Contrasena" IS NOT NULL;'
```

Antes del primer envío real, usar el número de prueba de Meta y confirmar:
deduplicación, visitante no registrado, cliente activo, baja de consentimiento,
cuota a tres días, rutina PDF y recuperación vencida/incorrecta.
