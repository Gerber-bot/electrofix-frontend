export interface CatalogItem {
  id: string;
  nombre: string;
  modelo?: string | null;
  categoria: string;
  precio: number;
  tiempo_estimado: string;
  stock: number;
  descripcion: string;
  palabras_clave: string[];
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface CreateCatalogItemInput {
  nombre: string;
  modelo?: string;
  categoria: string;
  precio: number;
  tiempo_estimado: string;
  stock: number;
  descripcion: string;
  palabras_clave: string[];
  activo?: boolean;
}

export interface UpdateCatalogItemInput {
  nombre?: string;
  modelo?: string;
  categoria?: string;
  precio?: number;
  tiempo_estimado?: string;
  stock?: number;
  descripcion?: string;
  palabras_clave?: string[];
  activo?: boolean;
}
