import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ChartEntry {
  label: string;
  value: number;
  color?: string;
}

const DEFAULT_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500',
  'bg-amber-500', 'bg-rose-500', 'bg-cyan-500',
];

/**
 * Gráfico de barras horizontal simple, sin dependencias externas.
 * Los valores se normalizan respecto al máximo para calcular anchos relativos.
 */
@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-3">
      <div *ngFor="let entry of entries; let i = index" class="flex items-center gap-3">
        <span class="text-xs text-gray-600 w-28 truncate shrink-0 text-right">{{ entry.label }}</span>
        <div class="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            [ngClass]="entry.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]"
            class="h-3 rounded-full transition-all duration-500"
            [style.width.%]="pct(entry.value)"
          ></div>
        </div>
        <span class="text-xs font-semibold text-gray-700 w-8 text-right">{{ entry.value }}</span>
      </div>
      <p *ngIf="entries.length === 0" class="text-sm text-gray-400 text-center py-4">Sin datos</p>
    </div>
  `,
})
export class BarChartComponent implements OnChanges {
  @Input() entries: ChartEntry[] = [];

  readonly DEFAULT_COLORS = DEFAULT_COLORS;
  private max = 1;

  ngOnChanges(): void {
    this.max = Math.max(1, ...this.entries.map((e) => e.value));
  }

  pct(value: number): number {
    return Math.round((value / this.max) * 100);
  }
}
