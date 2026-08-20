import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { ToastContainerComponent } from '../../shared/components/toast/toast-container.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminHeaderComponent, ToastContainerComponent],
  template: `
    <div class="admin-shell">
      <app-admin-header></app-admin-header>
      <main class="admin-content">
        <router-outlet></router-outlet>
      </main>
      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .admin-shell {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      width: 100%;
      max-width: 100vw;
      overflow-x: hidden;
    }

    .admin-content {
      flex: 1;
      max-width: 1400px;
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
      margin: 0 auto;
      padding: 2rem 1.5rem 4rem;

      @media (max-width: 768px) {
        padding: 1.25rem 1rem 3rem;
      }

      @media (max-width: 480px) {
        padding: 1rem 0.75rem 2.5rem;
      }
    }
  `]
})
export class AdminLayoutComponent {}
