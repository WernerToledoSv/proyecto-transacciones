import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex">

      <!-- Overlay móvil -->
      <div
        *ngIf="sidebarOpen()"
        (click)="sidebarOpen.set(false)"
        class="fixed inset-0 z-20 bg-black/40 lg:hidden"
        aria-hidden="true"
      ></div>

      <!-- Sidebar -->
      <app-sidebar
        [open]="sidebarOpen()"
        (close)="sidebarOpen.set(false)"
      />

      <!-- Contenido principal -->
      <div class="flex-1 flex flex-col min-w-0">
        <app-topbar (menuToggle)="sidebarOpen.set(!sidebarOpen())" />
        <main class="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class ShellComponent {
  sidebarOpen = signal(false);
}
