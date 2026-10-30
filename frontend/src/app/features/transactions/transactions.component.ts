import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionsService } from '../../core/services/transactions.service';
import { NormalizedTransaction, SourceType, StatusType, TransactionFilters } from '../../models/transaction.model';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { AlertComponent } from '../../shared/alert/alert.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { TransactionDetailComponent } from './transaction-detail/transaction-detail.component';
import { statusVariant, sourceLabel } from './transaction.helpers';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DatePipe, DecimalPipe,
    BadgeComponent, SpinnerComponent, AlertComponent,
    EmptyStateComponent, PageHeaderComponent, TransactionDetailComponent,
  ],
  template: `
    <app-page-header
      title="Transacciones normalizadas"
      [subtitle]="'Total: ' + filtered().length + ' registros'"
    />

    <!-- Filtros -->
    <div class="bg-white border border-gray-200 rounded-xl p-4 mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <!-- Búsqueda local por ID -->
      <input
        type="text"
        [value]="searchId()"
        (input)="onSearchInput($event)"
        placeholder="Buscar por ID..."
        class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-1 sm:col-span-2 lg:col-span-1"
        aria-label="Buscar por identificador"
      />

      <!-- Fuente -->
      <select
        [(ngModel)]="filterSource"
        (ngModelChange)="onServerFilterChange()"
        class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Filtrar por fuente"
      >
        <option value="">Todas las fuentes</option>
        <option value="stripe">Stripe</option>
        <option value="paypal">PayPal</option>
        <option value="bank_transfer">Transferencia bancaria</option>
        <option value="unknown">Desconocida</option>
      </select>

      <!-- Estado -->
      <select
        [(ngModel)]="filterStatus"
        (ngModelChange)="onServerFilterChange()"
        class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Filtrar por estado"
      >
        <option value="">Todos los estados</option>
        <option value="completed">Completada</option>
        <option value="pending">Pendiente</option>
        <option value="failed">Fallida</option>
        <option value="refunded">Reembolsada</option>
        <option value="cancelled">Cancelada</option>
        <option value="unknown">Desconocido</option>
      </select>

      <!-- Moneda -->
      <input
        type="text"
        [(ngModel)]="filterCurrency"
        (ngModelChange)="onServerFilterChange()"
        placeholder="Moneda (USD, EUR…)"
        maxlength="3"
        class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
        aria-label="Filtrar por moneda"
      />
    </div>

    <!-- Acciones -->
    <div class="flex justify-between items-center mb-4">
      <p class="text-xs text-gray-500">
        Mostrando {{ pageStart() + 1 }}–{{ pageEnd() }} de {{ filtered().length }}
      </p>
      <button
        (click)="reload()"
        class="text-sm text-blue-600 hover:text-blue-800 font-medium"
      >↻ Recargar</button>
    </div>

    <!-- Spinner -->
    <app-spinner *ngIf="loading()" />

    <!-- Error -->
    <app-alert *ngIf="error()" type="error" [message]="error()!" />

    <!-- Tabla -->
    <ng-container *ngIf="!loading() && !error()">
      <app-empty-state
        *ngIf="filtered().length === 0"
        icon="📋"
        title="Sin transacciones"
        description="Sube archivos JSON desde la sección de carga para ver resultados aquí."
      />

      <div *ngIf="filtered().length > 0" class="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table class="min-w-full divide-y divide-gray-100 text-sm" role="table">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">ID</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Fuente</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Monto</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Moneda</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Estado</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Fecha</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              *ngFor="let tx of paginated()"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3 font-mono text-xs text-gray-700 max-w-[140px] truncate" [title]="tx.id">{{ tx.id }}</td>
              <td class="px-4 py-3 text-gray-700">{{ sourceLabel(tx.source) }}</td>
              <td class="px-4 py-3 text-right font-semibold text-gray-900">{{ tx.amount | number:'1.2-2' }}</td>
              <td class="px-4 py-3 text-gray-600 font-mono">{{ tx.currency }}</td>
              <td class="px-4 py-3">
                <app-badge [text]="tx.status" [variant]="statusVariant(tx.status)" />
              </td>
              <td class="px-4 py-3 text-gray-500 whitespace-nowrap">{{ tx.timestamp | date:'dd/MM/yy HH:mm' : 'UTC' }}</td>
              <td class="px-4 py-3">
                <button
                  (click)="selectedTx.set(tx)"
                  class="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  [attr.aria-label]="'Ver detalle de ' + tx.id"
                >Ver</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div *ngIf="totalPages() > 1" class="flex items-center justify-center gap-2 mt-4">
        <button
          (click)="page.set(page() - 1)"
          [disabled]="page() === 0"
          class="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-100"
          aria-label="Página anterior"
        >‹</button>
        <span class="text-sm text-gray-600">
          Página {{ page() + 1 }} de {{ totalPages() }}
        </span>
        <button
          (click)="page.set(page() + 1)"
          [disabled]="page() === totalPages() - 1"
          class="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-100"
          aria-label="Página siguiente"
        >›</button>
      </div>
    </ng-container>

    <!-- Modal de detalle -->
    <app-transaction-detail
      *ngIf="selectedTx()"
      [tx]="selectedTx()!"
      (close)="selectedTx.set(null)"
    />
  `,
})
export class TransactionsComponent implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);
  transactions = signal<NormalizedTransaction[]>([]);
  selectedTx = signal<NormalizedTransaction | null>(null);
  page = signal(0);

  // Signal reactivo para que computed() lo detecte correctamente
  searchId = signal('');

  filterSource = '';
  filterStatus = '';
  filterCurrency = '';

  readonly statusVariant = statusVariant;
  readonly sourceLabel = sourceLabel;

  filtered = computed(() => {
    const q = this.searchId().trim().toLowerCase();
    if (!q) return this.transactions();
    return this.transactions().filter((t) => t.id.toLowerCase().includes(q));
  });

  paginated = computed(() => {
    const start = this.page() * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  pageStart = computed(() => this.page() * PAGE_SIZE);
  pageEnd = computed(() =>
    Math.min((this.page() + 1) * PAGE_SIZE, this.filtered().length)
  );
  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / PAGE_SIZE))
  );

  constructor(private txService: TransactionsService) {}

  ngOnInit(): void {
    this.reload();
  }

  /** Búsqueda local reactiva por ID — no hace request al servidor */
  onSearchInput(event: Event): void {
    this.searchId.set((event.target as HTMLInputElement).value);
    this.page.set(0);
  }

  /** Filtros de fuente/estado/moneda — delegan al servidor */
  onServerFilterChange(): void {
    this.page.set(0);
    this.searchId.set('');
    this.applyServerFilters();
  }

  applyServerFilters(): void {
    const filters: TransactionFilters = {};
    if (this.filterSource) filters.source = this.filterSource as SourceType;
    if (this.filterStatus) filters.status = this.filterStatus as StatusType;
    if (this.filterCurrency) filters.currency = this.filterCurrency.toUpperCase();
    this.fetch(filters);
  }

  reload(): void {
    this.filterSource = '';
    this.filterStatus = '';
    this.filterCurrency = '';
    this.searchId.set('');
    this.fetch();
  }

  private fetch(filters?: TransactionFilters): void {
    this.loading.set(true);
    this.error.set(null);
    this.txService.getAll(filters).subscribe({
      next: (data) => {
        this.transactions.set(data);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
