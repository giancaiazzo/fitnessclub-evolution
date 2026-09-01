# FitnessClubEvolution

Proyecto de tesis compuesto por un portal público para clientes y una web de
gestión para usuarios autorizados del gimnasio.

## Ejecutar el proyecto

### 1. Backend

La cadena de conexión no se guarda en Git. Configurala una vez mediante los
secretos locales de .NET, reemplazando los valores de ejemplo:

```bash
cd BackEnd/FitnessClubEvolution.Api
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=fitnessclub_db;Username=postgres;Password=TU_CLAVE_LOCAL"
```

Después iniciá la API:

```bash
dotnet restore
dotnet ef database update
dotnet run --launch-profile http
```

La API queda disponible en `http://localhost:5157`.

`dotnet ef database update` aplica las migraciones de pagos, servicios y
rutinas. Además de las fechas de cada cuota, agrega el almacenamiento binario
de imágenes y PDF en PostgreSQL y crea la relación obligatoria entre cada
cliente y su rutina actual.

Si la base ya tenía clientes, la migración no intenta adivinar qué rutina les
correspondía porque el sistema anterior no guardaba ese dato. Esos registros se
marcan como **Pendiente de reasignación** y deben corregirse una sola vez desde
el botón Modificar del listado de clientes.

### 2. Frontend

En otra terminal, desde la carpeta raíz:

```bash
npm install
npm run dev
```

Abrí `http://localhost:5173/#/` en el navegador.

## Módulo 1: portal público

- Inicio: `/#/`
- Presentación del gimnasio: `/#/about`
- Servicios, entrenamientos y rutinas: `/#/services`
- Biblioteca de ejercicios: `/#/exercises`
- Detalle de entrenamientos y horarios: `/#/classes`
- Calculadora de IMC: `/#/calc-imc`
- Planes: `/#/pricing`
- Contacto y ubicación: `/#/contact`
- Tour virtual 360°: `/#/tour-virtual`

## Módulo 2: web de gestión

El acceso se encuentra en `/#/SignIn`. Si las credenciales son correctas, el
sistema redirige a `/#/gestion`, donde están los accesos de Clientes, Planes,
Rutinas, Servicios y Pagos en el menú lateral.

El flujo de pagos permite buscar un cliente por nombre, apellido o documento,
consultar su vencimiento y días restantes, registrar una renovación y conservar
el historial completo. La primera cuota comienza automáticamente en la fecha de
registro del cliente y vence un mes calendario después, sin asociarse a un
servicio. Si se paga antes del vencimiento, el nuevo mes comienza desde la fecha
ya abonada para que el cliente no pierda días.

Servicios incluye alta con imagen promocional, listado, búsqueda por nombre,
modificación y eliminación. Este catálogo es independiente de los pagos. Las
imágenes admitidas son JPG, PNG y WEBP de hasta 5 MB.

La sección pública **Servicios** consulta ese mismo catálogo mediante
`GET /api/servicios`. Por eso, cada alta, modificación o baja realizada en
Gestión se refleja al cargar nuevamente la página, sin mantener una segunda
lista estática en el frontend. Solo los endpoints de lectura son públicos;
crear, modificar y eliminar continúan requiriendo autenticación.

Rutinas incluye alta, listado, búsqueda, visualización, modificación y
eliminación. El PDF se valida en el backend y admite hasta 10 páginas y 10 MB.
Los listados reciben únicamente metadatos; la imagen o el PDF se descarga desde
su endpoint cuando el usuario lo visualiza.

El alta de clientes carga las rutinas reales de este CRUD y guarda `IdRutina`
como clave foránea. El listado muestra la rutina asignada y el formulario de
modificación permite reemplazarla. Una rutina no puede eliminarse mientras esté
asignada a uno o más clientes. El futuro flujo de n8n/WhatsApp podrá utilizar el
cambio de `IdRutina` como evento para reenviar el PDF correspondiente.

Durante el desarrollo, Vite dirige automáticamente las peticiones `/api` a
`http://localhost:5157`. Para utilizar una API publicada, copiá `.env.example`
a `.env` y completá `VITE_API_URL`.

El despliegue conjunto del frontend, API, PostgreSQL, n8n y HTTPS en el VPS se
encuentra documentado en [`DEPLOYMENT.md`](DEPLOYMENT.md).

## Módulo 3: bot y n8n

La API interna para WhatsApp, cobranzas, rutinas y consentimiento está protegida
por una clave exclusiva entre backend y n8n. La recuperación de los dos
administradores se realiza por correo SMTP, sin depender de Meta. También incorpora
deduplicación por ID de Meta y un outbox persistente para reintentos seguros.
El mapa de endpoints, tablas, workflows y pruebas se encuentra en
[`BACKEND_MODULOS.md`](BACKEND_MODULOS.md).

## Estilos globales

Todos los estilos externos, las variables del tema y las reglas compartidas se
centralizan en `src/styles/global.css`. `src/main.tsx` importa ese archivo una
única vez y los componentes invocan sus utilidades y clases globales mediante
`className`. Las secciones del archivo están comentadas para identificar tema,
reglas base, patrones compartidos, autenticación, scrollbar y accesibilidad.

## Comprobaciones del frontend

```bash
npm run build
npm run lint
```

> Las contraseñas de usuarios se almacenan con `PasswordHasher` de ASP.NET Core;
> las claves de PostgreSQL, n8n, Meta e IA deben permanecer en secretos del VPS
> o en Credentials de n8n y nunca incluirse en Git.
