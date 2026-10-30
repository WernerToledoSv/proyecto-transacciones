import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';

/**
 * Servicio base HTTP.
 * Centraliza la URL base y el manejo de errores.
 * Los servicios de dominio extienden este o lo inyectan.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  protected readonly base = environment.apiUrl;
  protected readonly http = inject(HttpClient);

  /** Extrae `data` de la envoltura ApiResponse<T>. */
  protected unwrap<T>(obs: Observable<ApiResponse<T>>): Observable<T> {
    return obs.pipe(
      map((res) => {
        if (!res.success || res.data === undefined) {
          throw new Error(res.error ?? 'Respuesta inesperada del servidor.');
        }
        return res.data;
      }),
      catchError(this.handleError)
    );
  }

  protected buildParams(filters: Record<string, string | undefined>): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value);
      }
    }
    return params;
  }

  private handleError(err: HttpErrorResponse | Error): Observable<never> {
    if (err instanceof HttpErrorResponse) {
      const detail = err.error?.detail ?? err.message;
      return throwError(() => new Error(`Error ${err.status}: ${detail}`));
    }
    return throwError(() => err);
  }
}
