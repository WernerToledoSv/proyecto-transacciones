import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvalidRecordsService } from '../../core/services/invalid-records.service';
import { InvalidRecord } from '../../models/transaction.model';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { AlertComponent } from '../../shared/alert/alert.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { BadgeVariant } from '../../shared/badge/badge.component';

const ERROR_TYPE_VARIANT: Record<string, BadgeVariant> = {
  UnknownSource:    'neutral',
  NormalizationError: 'warning',
  ValidationError:  'danger',
  MissingNormalizer: 'info',
  UnexpectedError:  'danger',
};

@Component({
  selector: 'app-errors',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    SpinnerComponent, AlertComponent, EmptyStateComponent,
    PageHeaderComponent, BadgeComponent,
  ],
  template: `
    <app-page-header
      title="Registros inválidos"
      [subtitle]="'Total: ' + filtered().length + ' registros con error'"
    />

    <!-- Filtros -->
    <div class="bg-white border border-gray-200 rounded-xl p-4 mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <input
        type="text"
        [(ngModel)]="searchText"
        placeholder="Buscar en errores..."
        class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Buscar en errores"
      />
      <select
        [(ngModel)]="filterSource"
        class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Filtrar por fuente"
      >
        <option value="">Todas las fuentes</option>
        <option *ngFor="let s of availableSources()" [value]="s">{{ s }}</option>
      </select>
      <select
        [(ngModel)]="filterErrorType"
        class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Filtrar por tipo de error"
      >
        <option value="">Todos los tipos</option>
        <option *ngFor="let t of availableErrorTypes()" [value]="t">{{ t }}</option>
      </select>
    </div>

    <div class="flex justify-between items-center mb-4">
      <p class="text-xs text-gray-500">{{ filtered().length }} resultado(s)</p>
      <button (click)="reload()" class="text-sm text-blue-600 hover:text-blue-800 font-medium">↻ Recargar</button>
    </div>

    <!-- Spinner -->
    <app-spinner *ngIf="loading()" />

    <!-- Error de carga -->
    <app-alert *ngIf="fetchError()" type="error" [message]="fetchError()!" />

    <!-- Empty -->
    <app-empty-state
      *ngIf="!loading() && !fetchError() && filtered().length === 0"
      icon="✅"
      title="Sin registros inválidos"
      description="Todos los registros procesados hasta ahora son válidos."
    />

    <!-- Lista de errores -->
    <div *ngIf="!loading() && !fetchError() && filtered().length > 0" class="space-y-3">
      <div
        *ngFor="let rec of filtered(); let i = index"
        class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
      >
        <!-- Cabecera del error -->
        <div class="flex items-start justify-between px-5 py-3.5 bg-red-50 border-b border-red-100">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs text-gray-500 font-mono">#{{ i + 1 }}</span>
            <app-badge
              [text]="rec.error_type"
              [variant]="errorVariant(rec.error_type)"
            />
            <span class="text-xs text-gray-600 font-medium">
              Fuente: {{ rec.source_hint }}
            </span>
          </div>
          <button
            (click)="toggleExpand(i)"
            class="text-xs text-gray-500 hover:text-gray-800 ml-2 shrink-0"
            [attr.aria-label]="expanded().has(i) ? 'Colapsar' : 'Expandir'"
          >
            {{ expanded().has(i) ? '▲ Ocultar' : '▼ Ver datos' }}
          </button>
        </div>

        <!-- Descripción del error -->
        <div class="px-5 py-3">
          <p class="text-sm text-gray-800">{{ rec.error_detail }}</p>
        </div>

        <!-- Datos originales (expandible) -->
        <div *ngIf="expanded().has(i)" class="px-5 pb-4">
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Registro original
          </h3>
          <pre class="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap break-all">{{ rawJson(rec) }}</pre>
        </div>
      </div>
    </div>
  `,
})
export class ErrorsComponent implements OnInit {
  loading = signal(true);
  fetchError = signal<string | null>(null);
  records = signal<InvalidRecord[]>([]);
  expanded = signal<Set<number>>(new Set());

  searchText = '';
  filterSource = '';
  filterErrorType = '';

  filtered = computed(() => {
    let list = this.records();
    if (this.filterSource) {
      list = list.filter((r) => r.source_hint === this.filterSource);
    }
    if (this.filterErrorType) {
      list = list.filter((r) => r.error_type === this.filterErrorType);
    }
    if (this.searchText.trim()) {
      const q = this.searchText.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.error_detail.toLowerCase().includes(q) ||
          r.source_hint.toLowerCase().includes(q) ||
          r.error_type.toLowerCase().includes(q)
      );
    }
    return list;
  });

  availableSources = computed(() => [
    ...new Set(this.records().map((r) => r.source_hint)),
  ]);

  availableErrorTypes = computed(() => [
    ...new Set(this.records().map((r) => r.error_type)),
  ]);

  constructor(private invalidService: InvalidRecordsService) {}

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.fetchError.set(null);
    this.invalidService.getAll().subscribe({
      next: (data) => {
        this.records.set(data);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.fetchError.set(err.message);
        this.loading.set(false);
      },
    });
  }

  toggleExpand(index: number): void {
    this.expanded.update((set) => {
      const next = new Set(set);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  errorVariant(type: string): BadgeVariant {
    return ERROR_TYPE_VARIANT[type] ?? 'neutral';
  }

  rawJson(rec: InvalidRecord): string {
    return JSON.stringify(rec.raw, null, 2);
  }
}
