import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../../models/api-response.model';
import { ProcessingResponse } from '../../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class UploadService extends ApiService {
  /**
   * Envía uno o varios archivos JSON al backend para su procesamiento.
   * Usa multipart/form-data con el campo `files`.
   */
  uploadFiles(files: File[]): Observable<ProcessingResponse> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file, file.name));

    return this.unwrap(
      this.http.post<ApiResponse<ProcessingResponse>>(
        `${this.base}/upload/`,
        formData
      )
    );
  }
}
