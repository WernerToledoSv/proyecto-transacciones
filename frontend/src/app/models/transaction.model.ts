/**
 * Contratos alineados con los modelos del backend FastAPI.
 * Fuente: app/models/transaction.py y app/models/responses.py
 */

export type SourceType = 'stripe' | 'paypal' | 'bank_transfer' | 'unknown';
export type StatusType = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled' | 'unknown';

/** Transacción normalizada tal como la devuelve el backend. */
export interface NormalizedTransaction {
  id: string;
  source: SourceType;
  amount: number;
  currency: string;
  status: StatusType;
  timestamp: string; // ISO 8601
  extra_fields: Record<string, unknown>;
}

/** Registro que no pudo normalizarse. */
export interface InvalidRecord {
  raw: Record<string, unknown>;
  source_hint: string;
  error_type: string;
  error_detail: string;
}

/** Resultado del procesamiento de un archivo individual. */
export interface FileProcessingResult {
  filename: string;
  records_found: number;
  valid: number;
  invalid: number;
  errors: string[];
}

/** Respuesta completa del endpoint de upload. */
export interface ProcessingResponse {
  files: FileProcessingResult[];
  total_valid: number;
  total_invalid: number;
}

/** Métricas del procesamiento en memoria. */
export interface MetricsResponse {
  total_received: number;
  total_valid: number;
  total_invalid: number;
  amount_by_currency: Record<string, number>;
  count_by_source: Record<string, number>;
  count_by_status: Record<string, number>;
}

/** Filtros para el listado de transacciones. */
export interface TransactionFilters {
  source?: SourceType;
  status?: StatusType;
  currency?: string;
}
