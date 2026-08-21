import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'applications'
      },
      {
        path: 'applications',
        loadComponent: () => import('./pages/applications-list/applications-list.component').then(m => m.ApplicationsListComponent)
      },
      {
        path: 'applications/:id',
        loadComponent: () => import('./pages/application-detail/application-detail.component').then(m => m.ApplicationDetailComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'applications'
  }
];
