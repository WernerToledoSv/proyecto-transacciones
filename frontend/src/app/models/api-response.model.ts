/**
 * Envoltura genérica que el backend devuelve en todos los endpoints.
 * { success: boolean, data?: T, error?: string }
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
