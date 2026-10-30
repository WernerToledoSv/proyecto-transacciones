import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
      <span class="text-5xl" role="img" [attr.aria-label]="title">{{ icon }}</span>
      <p class="text-base font-medium text-gray-500">{{ title }}</p>
      <p *ngIf="description" class="text-sm text-center max-w-xs">{{ description }}</p>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() icon = '📭';
  @Input() title = 'Sin datos';
  @Input() description = '';
}
