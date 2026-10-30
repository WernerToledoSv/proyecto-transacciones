import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

const CONFIG: Record<AlertType, { bg: string; text: string; icon: string }> = {
  success: { bg: 'bg-green-50 border-green-200', text: 'text-green-800', icon: '✅' },
  error:   { bg: 'bg-red-50 border-red-200',     text: 'text-red-800',   icon: '❌' },
  warning: { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-800', icon: '⚠️' },
  info:    { bg: 'bg-blue-50 border-blue-200',   text: 'text-blue-800',  icon: 'ℹ️' },
};

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [ngClass]="[cfg.bg, cfg.text]" class="border rounded-lg p-4 flex gap-3 items-start text-sm" role="alert">
      <span class="mt-0.5 shrink-0" aria-hidden="true">{{ cfg.icon }}</span>
      <div>
        <p *ngIf="title" class="font-semibold mb-0.5">{{ title }}</p>
        <p>{{ message }}</p>
      </div>
    </div>
  `,
})
export class AlertComponent {
  @Input() type: AlertType = 'info';
  @Input() title = '';
  @Input() message = '';

  get cfg() { return CONFIG[this.type]; }
}
