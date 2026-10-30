import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger:  'bg-red-100 text-red-800',
  info:    'bg-blue-100 text-blue-800',
  neutral: 'bg-gray-100 text-gray-700',
};

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [ngClass]="classes" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
      {{ text }}
    </span>
  `,
})
export class BadgeComponent {
  @Input() text = '';
  @Input() variant: BadgeVariant = 'neutral';

  get classes(): string {
    return VARIANT_CLASSES[this.variant] ?? VARIANT_CLASSES['neutral'];
  }
}
