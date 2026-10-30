import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',       path: '/dashboard',     icon: '📊' },
  { label: 'Cargar archivos', path: '/upload',        icon: '📤' },
  { label: 'Transacciones',   path: '/transactions',  icon: '📋' },
  { label: 'Errores',         path: '/errors',        icon: '⚠️' },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside
      [class.translate-x-0]="open"
      [class.-translate-x-full]="!open"
      class="fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white flex flex-col
             transition-transform duration-200 ease-in-out
             lg:relative lg:translate-x-0 lg:flex"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center px-5 border-b border-gray-700 shrink-0">
        <span class="text-lg font-bold tracking-tight">💳 TxNormalizer</span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1" aria-label="Navegación principal">
        <a
          *ngFor="let item of navItems"
          [routerLink]="item.path"
          routerLinkActive="bg-blue-600 text-white"
          [routerLinkActiveOptions]="{ exact: false }"
          (click)="close.emit()"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <span class="text-base" aria-hidden="true">{{ item.icon }}</span>
          {{ item.label }}
        </a>
      </nav>

      <!-- Footer -->
      <div class="p-4 border-t border-gray-700">
        <p class="text-xs text-gray-500 text-center">v1.0.0 · FastAPI + Angular</p>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
  navItems = NAV_ITEMS;
}
