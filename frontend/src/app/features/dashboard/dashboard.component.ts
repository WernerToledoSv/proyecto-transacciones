import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MetricsService } from '../../core/services/metrics.service';
import { MetricsResponse } from '../../models/transaction.model';
import { StatCardComponent } from '../../shared/stat-card/stat-card.component';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { AlertComponent } from '../../shared/alert/alert.component';
import { BarChartComponent, ChartEntry } from '../../shared/bar-chart/bar-chart.component';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, DecimalPipe,
    StatCardComponent, SpinnerComponent, AlertComponent,
    BarChartComponent, PageHeaderComponent,
  ],
  template: `
    <app-page-header
      title="Dashboard"
      subtitle="Resumen del procesamiento de transacciones en memoria."
    />

    <!-- Carga -->
    <app-spinner *ngIf="loading()" message="Cargando métricas..." />

    <!-- Error -->
    <app-alert
      *ngIf="error()"
      type="error"
      title="No se pudieron cargar las métricas"
      [message]="error()!"
    />

    <ng-container *ngIf="!loading() && !error() && metrics()">
      <!-- KPI Cards -->
      <section class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" aria-label="Indicadores clave">
        <app-stat-card
          label="Recibidas"
          [value]="metrics()!.total_received"
          icon="📥"
        />
        <app-stat-card
          label="Válidas"
          [value]="metrics()!.total_valid"
          icon="✅"
        />
        <app-stat-card
          label="Inválidas"
          [value]="metrics()!.total_invalid"
          icon="❌"
        />
        <app-stat-card
          label="Tasa de éxito"
          [value]="successRate()"
          icon="📈"
          sub="del total recibido"
        />
      </section>

      <!-- Monto por moneda -->
      <section class="mb-8">
        <h2 class="text-base font-semibold text-gray-800 mb-4">Monto total por moneda</h2>
        <div *ngIf="currencyEntries().length > 0; else noCurrency"
             class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            *ngFor="let entry of currencyEntries()"
            class="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between"
          >
            <span class="text-sm font-medium text-gray-600">{{ entry.currency }}</span>
            <span class="text-lg font-bold text-gray-900">
              {{ entry.amount | number:'1.2-2' }}
            </span>
          </div>
        </div>
        <ng-template #noCurrency>
          <p class="text-sm text-gray-400">Sin transacciones procesadas.</p>
        </ng-template>
      </section>

      <!-- Gráficos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Por fuente -->
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 class="text-base font-semibold text-gray-800 mb-4">Transacciones por fuente</h2>
          <app-bar-chart [entries]="sourceEntries()" />
        </div>

        <!-- Por estado -->
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 class="text-base font-semibold text-gray-800 mb-4">Transacciones por estado</h2>
          <app-bar-chart [entries]="statusEntries()" />
        </div>
      </div>
    </ng-container>

    <!-- Botón de recarga -->
    <div class="mt-6 flex justify-end" *ngIf="!loading()">
      <button
        (click)="load()"
        class="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
      >
        ↻ Actualizar
      </button>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);
  metrics = signal<MetricsResponse | null>(null);

  successRate = computed(() => {
    const m = this.metrics();
    if (!m || m.total_received === 0) return '—';
    return ((m.total_valid / m.total_received) * 100).toFixed(1) + '%';
  });

  currencyEntries = computed(() => {
    const m = this.metrics();
    if (!m) return [];
    return Object.entries(m.amount_by_currency).map(([currency, amount]) => ({
      currency,
      amount,
    }));
  });

  sourceEntries = computed<ChartEntry[]>(() => {
    const m = this.metrics();
    if (!m) return [];
    return Object.entries(m.count_by_source).map(([label, value]) => ({ label, value }));
  });

  statusEntries = computed<ChartEntry[]>(() => {
    const m = this.metrics();
    if (!m) return [];
    const colors: Record<string, string> = {
      completed: 'bg-green-500',
      pending:   'bg-yellow-400',
      failed:    'bg-red-500',
      refunded:  'bg-purple-500',
      cancelled: 'bg-gray-400',
      unknown:   'bg-gray-300',
    };
    return Object.entries(m.count_by_status).map(([label, value]) => ({
      label,
      value,
      color: colors[label],
    }));
  });

  constructor(private metricsService: MetricsService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.metricsService.getMetrics().subscribe({
      next: (data) => {
        this.metrics.set(data);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
