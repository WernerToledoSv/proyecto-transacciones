import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NormalizedTransaction } from '../../../models/transaction.model';
import { BadgeComponent } from '../../../shared/badge/badge.component';
import { statusVariant, sourceLabel } from '../transaction.helpers';

@Component({
  selector: 'app-transaction-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, BadgeComponent],
  template: `
    <!-- Backdrop -->
    <div
      class="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4"
      (click)="close.emit()"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="'Detalle de transacción ' + tx.id"
    >
      <div
        class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-900">Detalle de transacción</h2>
          <button
            (click)="close.emit()"
            class="text-gray-400 hover:text-gray-700 text-xl leading-none"
            aria-label="Cerrar"
          >×</button>
        </div>

        <!-- Body -->
        <div class="px-6 py-5 space-y-4">
          <dl class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt class="text-gray-500 font-medium">ID</dt>
              <dd class="text-gray-900 font-mono break-all mt-0.5">{{ tx.id }}</dd>
            </div>
            <div>
              <dt class="text-gray-500 font-medium">Fuente</dt>
              <dd class="mt-0.5">{{ sourceLabel(tx.source) }}</dd>
            </div>
            <div>
              <dt class="text-gray-500 font-medium">Monto</dt>
              <dd class="text-gray-900 font-semibold mt-0.5">
                {{ tx.amount | number:'1.2-2' }} {{ tx.currency }}
              </dd>
            </div>
            <div>
              <dt class="text-gray-500 font-medium">Estado</dt>
              <dd class="mt-0.5">
                <app-badge [text]="tx.status" [variant]="statusVariant(tx.status)" />
              </dd>
            </div>
            <div class="col-span-2">
              <dt class="text-gray-500 font-medium">Fecha y hora</dt>
              <dd class="text-gray-900 mt-0.5">{{ tx.timestamp | date:'dd/MM/yyyy HH:mm:ss' : 'UTC' }} UTC</dd>
            </div>
          </dl>

          <!-- Extra fields -->
          <ng-container *ngIf="extraKeys.length > 0">
            <hr class="border-gray-100" />
            <div>
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Campos adicionales
              </h3>
              <dl class="space-y-1.5">
                <div *ngFor="let key of extraKeys" class="flex gap-3 text-sm">
                  <dt class="text-gray-500 min-w-[140px] shrink-0">{{ key }}</dt>
                  <dd class="text-gray-800 break-all font-mono text-xs">{{ tx.extra_fields[key] }}</dd>
                </div>
              </dl>
            </div>
          </ng-container>
        </div>
      </div>
    </div>
  `,
})
export class TransactionDetailComponent {
  @Input() tx!: NormalizedTransaction;
  @Output() close = new EventEmitter<void>();

  statusVariant = statusVariant;
  sourceLabel = sourceLabel;

  get extraKeys(): string[] {
    return Object.keys(this.tx.extra_fields ?? {});
  }
}
