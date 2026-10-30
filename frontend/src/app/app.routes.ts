import { Routes } from '@angular/router';
import { ShellComponent } from './layouts/shell/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'upload',
        loadComponent: () =>
          import('./features/upload/upload.component').then(
            (m) => m.UploadComponent
          ),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./features/transactions/transactions.component').then(
            (m) => m.TransactionsComponent
          ),
      },
      {
        path: 'errors',
        loadComponent: () =>
          import('./features/errors/errors.component').then(
            (m) => m.ErrorsComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
