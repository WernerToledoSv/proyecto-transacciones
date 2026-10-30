import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Componente raíz mínimo.
 * El layout real (sidebar + topbar) vive en ShellComponent,
 * cargado por el router en la ruta raíz.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent {}
