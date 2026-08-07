export type Ejercicio = {
  idEjercicio: number;
  nombre: string;
  grupoMuscular: string;
  descripcion: string | null;
  estado: boolean;
  tieneImagenPreview: boolean;
  nombreArchivoImagen: string | null;
  tipoContenidoImagen: string | null;
  tamanoImagenBytes: number | null;
  imagenPreviewUrl: string | null;
  tieneVideoTutorial: boolean;
  nombreArchivoVideo: string | null;
  tipoContenidoVideo: string | null;
  tamanoVideoBytes: number | null;
  duracionVideoSegundos: number | null;
  videoTutorialUrl: string | null;
  fechaRegistro: string;
  fechaActualizacion: string | null;
};

export const GRUPOS_MUSCULARES = [
  "Pecho",
  "Espalda",
  "Hombros",
  "Bíceps",
  "Tríceps",
  "Antebrazos",
  "Lumbares",
  "Femorales",
  "Cuádriceps",
  "Glúteos",
  "Aductores",
  "Abductores",
  "Pantorrillas",
  "Abdominales",
  "Cardio y movilidad",
  "Cuerpo completo",
] as const;

export const ORDEN_GRUPOS_MUSCULARES: readonly string[] = [
  ...GRUPOS_MUSCULARES,
  "Sin clasificar",
];

export function formatearDuracion(segundos: number | null) {
  if (!segundos) return "Video breve";
  return segundos === 1 ? "1 segundo" : `${segundos} segundos`;
}
