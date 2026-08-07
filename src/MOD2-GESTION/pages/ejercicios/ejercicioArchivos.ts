export const MAX_IMAGEN_BYTES = 5 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 30 * 1024 * 1024;
export const MAX_VIDEO_SEGUNDOS = 60;

const TIPOS_IMAGEN = new Set(["image/jpeg", "image/png", "image/webp"]);
const TIPOS_VIDEO = new Set(["video/mp4", "video/webm"]);

export function validarImagen(archivo: File) {
  if (!TIPOS_IMAGEN.has(archivo.type)) {
    return "La imagen debe estar en formato JPG, PNG o WEBP.";
  }
  if (archivo.size > MAX_IMAGEN_BYTES) {
    return "La imagen no puede superar los 5 MB.";
  }
  return "";
}

export async function validarVideo(archivo: File) {
  if (!TIPOS_VIDEO.has(archivo.type)) {
    return { error: "El video debe estar en formato MP4 o WEBM.", duracion: 0 };
  }
  if (archivo.size > MAX_VIDEO_BYTES) {
    return { error: "El video no puede superar los 30 MB.", duracion: 0 };
  }

  try {
    const duracion = await leerDuracionVideo(archivo);
    if (!Number.isFinite(duracion) || duracion <= 0) {
      return {
        error: "No se pudo determinar la duración del video.",
        duracion: 0,
      };
    }
    if (duracion > MAX_VIDEO_SEGUNDOS) {
      return {
        error: `El video tutorial no puede superar los ${MAX_VIDEO_SEGUNDOS} segundos.`,
        duracion: 0,
      };
    }
    return { error: "", duracion: Math.max(1, Math.ceil(duracion)) };
  } catch {
    return {
      error: "No se pudo leer el video. Probá con otro archivo MP4 o WEBM.",
      duracion: 0,
    };
  }
}

function leerDuracionVideo(archivo: File) {
  return new Promise<number>((resolve, reject) => {
    const url = URL.createObjectURL(archivo);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duracion = video.duration;
      URL.revokeObjectURL(url);
      resolve(duracion);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Video inválido"));
    };
    video.src = url;
  });
}
