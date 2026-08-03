const apiConfigurada = import.meta.env.VITE_API_URL?.trim();
const API_URL = (apiConfigurada || "/api").replace(/\/$/, "");

export function apiUrl(ruta: string) {
  return `${API_URL}/${ruta.replace(/^\//, "")}`;
}

export async function apiFetch(ruta: string, opciones: RequestInit = {}) {
  const headers = new Headers(opciones.headers);
  const esFormulario = opciones.body instanceof FormData;
  if (opciones.body && !esFormulario && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(apiUrl(ruta), {
    ...opciones,
    headers,
    credentials: "include",
  });
}

export async function mensajeErrorHttp(
  respuesta: Response,
  mensajePredeterminado: string,
) {
  const detalle = (await respuesta.json().catch(() => null)) as
    | {
        message?: string;
        mensaje?: string;
        title?: string;
        errors?: Record<string, string[]>;
      }
    | null;

  const primerErrorValidacion = detalle?.errors
    ? Object.values(detalle.errors).flat()[0]
    : undefined;

  return (
    detalle?.message ??
    detalle?.mensaje ??
    primerErrorValidacion ??
    detalle?.title ??
    mensajePredeterminado
  );
}

export function mensajeErrorDesconocido(
  error: unknown,
  mensajePredeterminado: string,
) {
  return error instanceof Error ? error.message : mensajePredeterminado;
}
