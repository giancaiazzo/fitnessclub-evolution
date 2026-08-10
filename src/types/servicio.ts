/**
 * Forma de un servicio tal como lo devuelve ServiciosController.
 * Se comparte entre el catálogo público y el CRUD administrativo para evitar
 * que ambas pantallas definan contratos distintos para la misma información.
 */
export type Servicio = {
  idServicio: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  duracion: string | null;
  tieneImagen: boolean;
  nombreArchivoImagen: string | null;
  tipoContenidoImagen: string | null;
  imagenUrl: string | null;
};

/** Muestra los precios del gimnasio en pesos uruguayos. */
export function formatearPrecioServicio(precio: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 2,
  }).format(precio);
}
