import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-500">{{ label }}</span>
        <span class="text-2xl">{{ icon }}</span>
      </div>
      <p class="text-3xl font-bold text-gray-900">{{ value }}</p>
      <p *ngIf="sub" class="text-xs text-gray-400">{{ sub }}</p>
    </div>
  `,
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: string | number = '—';
  @Input() icon = '';
  @Input() sub = '';
}
