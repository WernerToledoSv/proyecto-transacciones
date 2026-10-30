import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../../models/api-response.model';
import { InvalidRecord } from '../../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class InvalidRecordsService extends ApiService {
  getAll(): Observable<InvalidRecord[]> {
    return this.unwrap(
      this.http.get<ApiResponse<InvalidRecord[]>>(`${this.base}/invalid/`)
    );
  }
}
