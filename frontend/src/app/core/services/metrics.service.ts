import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../../models/api-response.model';
import { MetricsResponse } from '../../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class MetricsService extends ApiService {
  getMetrics(): Observable<MetricsResponse> {
    return this.unwrap(
      this.http.get<ApiResponse<MetricsResponse>>(`${this.base}/metrics/`)
    );
  }
}
