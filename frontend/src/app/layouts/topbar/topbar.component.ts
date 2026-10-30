import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-topbar',
  standalone: true,
  template: `
    <header class="h-16 bg-white border-b border-gray-200 flex items-center px-4 md:px-6 gap-4 shrink-0">
      <!-- Botón hamburguesa (solo móvil) -->
      <button
        (click)="menuToggle.emit()"
        class="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        aria-label="Abrir menú"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <h1 class="text-base font-semibold text-gray-800 truncate">
        Sistema de Normalización de Transacciones
      </h1>

      <div class="ml-auto flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
          <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          Backend: <span class="font-mono">:8000</span>
        </span>
      </div>
    </header>
  `,
})
export class TopbarComponent {
  @Output() menuToggle = new EventEmitter<void>();
}
