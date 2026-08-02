# FitnessClubEvolution

Proyecto de tesis compuesto por un portal público para clientes y una web de
gestión para usuarios autorizados del gimnasio.

## Ejecutar el proyecto

### 1. Backend

```bash
cd BackEnd/FitnessClubEvolution.Api
dotnet run --launch-profile http
```

La API queda disponible en `http://localhost:5157`.

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
- Detalle de entrenamientos y horarios: `/#/classes`
- Calculadora de IMC: `/#/calc-imc`
- Planes: `/#/pricing`
- Contacto y ubicación: `/#/contact`
- Tour virtual 360°: `/#/tour-virtual`

## Módulo 2: web de gestión

El acceso se encuentra en `/#/SignIn`. Si las credenciales son correctas, el
sistema redirige a `/#/gestion`, donde están los accesos de Clientes, Planes,
Rutinas, Servicios y Pagos en el menú lateral.

Durante el desarrollo, Vite dirige automáticamente las peticiones `/api` a
`http://localhost:5157`. Para utilizar una API publicada, copiá `.env.example`
a `.env` y completá `VITE_API_URL`.

## Comprobaciones del frontend

```bash
npm run build
npx eslint src/MOD1-CLIENTES src/pages src/layouts src/types src/App.tsx
```

> Antes de publicar el sistema, la contraseña administrativa debe almacenarse
> con un hash seguro y la conexión a la base de datos debe configurarse mediante
> secretos del entorno de despliegue.
