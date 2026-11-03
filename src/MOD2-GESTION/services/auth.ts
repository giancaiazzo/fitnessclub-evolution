export type SesionAdministrador = {
  idEntrenador: number;
  nombreUsuario: string;
  apellido: string;
  nombreCompleto: string;
  rol: string;
};

export type Credenciales = {
  nombreUsuario: string;
  contrasena: string;
  mantenerSesion: boolean;
};

export type ConfirmarRecuperacion = {
  correoElectronico: string;
  codigo: string;
  nuevaContrasena: string;
};

const apiConfigurada = import.meta.env.VITE_API_URL?.trim();
const API_URL = (apiConfigurada || "/api").replace(/\/$/, "");

async function leerError(response: Response) {
  try {
    const body = (await response.json()) as { mensaje?: string };
    return body.mensaje;
  } catch {
    return undefined;
  }
}

async function enviarJson(ruta: string, body: object): Promise<Response> {
  try {
    return await fetch(`${API_URL}/${ruta}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "No se pudo conectar con la API. Verifica que el backend esté ejecutándose.",
    );
  }
}

export async function iniciarSesion(
  credenciales: Credenciales,
): Promise<SesionAdministrador> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(credenciales),
    });
  } catch {
    throw new Error(
      "No se pudo conectar con la API. Verifica que el backend esté ejecutándose.",
    );
  }

  if (!response.ok) {
    const mensaje = await leerError(response);
    throw new Error(mensaje || "No fue posible iniciar sesión.");
  }

  return response.json() as Promise<SesionAdministrador>;
}

export async function obtenerSesion(): Promise<SesionAdministrador | null> {
  try {
    const response = await fetch(`${API_URL}/auth/sesion`, {
      credentials: "include",
    });

    if (response.status === 401) {
      return null;
    }

    if (!response.ok) {
      throw new Error();
    }

    return response.json() as Promise<SesionAdministrador>;
  } catch {
    return null;
  }
}

export async function cerrarSesion(): Promise<void> {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // La sesión también se elimina del estado local si la API no está disponible.
  }
}

export async function solicitarRecuperacion(
  correoElectronico: string,
): Promise<string> {
  const response = await enviarJson("auth/recuperacion/solicitar", {
    correoElectronico,
  });

  if (!response.ok) {
    const mensaje = await leerError(response);
    throw new Error(mensaje || "No fue posible solicitar la recuperación.");
  }

  const body = (await response.json()) as { mensaje?: string };
  return (
    body.mensaje ||
    "Si el correo está asociado a una cuenta activa, recibirás un código para continuar."
  );
}

export async function confirmarRecuperacion(
  datos: ConfirmarRecuperacion,
): Promise<void> {
  const response = await enviarJson("auth/recuperacion/confirmar", datos);

  if (!response.ok) {
    const mensaje = await leerError(response);
    throw new Error(mensaje || "El código es inválido o venció.");
  }
}
