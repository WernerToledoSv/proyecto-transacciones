import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../../models/api-response.model';
import { NormalizedTransaction, TransactionFilters } from '../../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionsService extends ApiService {

  getAll(filters?: TransactionFilters): Observable<NormalizedTransaction[]> {
    const params = this.buildParams({
      source: filters?.source,
      status: filters?.status,
      currency: filters?.currency,
    });
    return this.unwrap(
      this.http.get<ApiResponse<NormalizedTransaction[]>>(
        `${this.base}/transactions/`,
        { params }
      )
    );
  }

  getById(id: string): Observable<NormalizedTransaction> {
    return this.unwrap(
      this.http.get<ApiResponse<NormalizedTransaction>>(
        `${this.base}/transactions/${encodeURIComponent(id)}`
      )
    );
  }

  clearAll(): Observable<{ message: string }> {
    return this.unwrap(
      this.http.delete<ApiResponse<{ message: string }>>(
        `${this.base}/transactions/`
      )
    );
  }
}
