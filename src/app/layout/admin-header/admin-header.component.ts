import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="admin-topbar">
      <div class="topbar-container">
        <!-- Logo & Brand -->
        <a routerLink="/applications" class="brand-link" title="Buildora">
          <img src="assets/images/logo-cream.svg" alt="Buildora" class="brand-logo-img">
        </a>

        <!-- Admin User Controls -->
        <div class="user-action-area" *ngIf="authService.currentUser() as user">
          <div class="user-badge">
            <div class="avatar">{{ getInitials(user.fullName || user.email) }}</div>
            <div class="user-details">
              <span class="user-name">{{ user.fullName || 'Admin' }}</span>
              <span class="user-role">{{ user.roles[0] || 'Administrator' }}</span>
            </div>
          </div>

          <button type="button" class="btn btn-logout" (click)="onLogout()" title="Sign Out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .admin-topbar {
      background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-700) 100%);
      color: #FFFFFF;
      box-shadow: 0 4px 20px rgba(28, 16, 23, 0.15);
      position: sticky;
      top: 0;
      z-index: 100;
      border-bottom: 1px solid rgba(255, 248, 203, 0.15);
    }

    .topbar-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0.85rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;

      @media (max-width: 640px) {
        padding: 0.75rem 1rem;
      }
    }

    .brand-link {
      display: flex;
      align-items: center;
      text-decoration: none;
      transition: opacity 0.2s ease, transform 0.2s ease;
      flex-shrink: 0;

      &:hover {
        opacity: 0.92;
        transform: translateY(-1px);
      }
    }

    .brand-logo-img {
      height: 38px;
      width: auto;
      max-height: 42px;
      object-fit: contain;
      display: block;

      @media (max-width: 520px) {
        height: 28px;
      }
    }

    .user-action-area {
      display: flex;
      align-items: center;
      gap: 1.25rem;

      @media (max-width: 640px) {
        gap: 0.65rem;
      }
    }

    .user-badge {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: rgba(255, 255, 255, 0.1);
      padding: 0.35rem 0.85rem 0.35rem 0.45rem;
      border-radius: var(--radius-full);
      border: 1px solid rgba(255, 255, 255, 0.12);

      @media (max-width: 520px) {
        padding: 0.25rem;
        background: transparent;
        border-color: transparent;
      }
    }

    .avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background-color: var(--color-accent-500);
      color: #FFFFFF;
      font-weight: 700;
      font-size: 0.78rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .user-details {
      display: flex;
      flex-direction: column;

      @media (max-width: 520px) {
        display: none;
      }
    }

    .user-name {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--color-cream-100);
      line-height: 1.1;
    }

    .user-role {
      font-size: 0.68rem;
      color: var(--color-primary-200);
    }

    .btn-logout {
      background: transparent;
      color: var(--color-cream-200);
      border: 1px solid rgba(255, 248, 203, 0.3);
      padding: 0.45rem 0.9rem;
      font-size: 0.82rem;
      border-radius: var(--radius-md);
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      flex-shrink: 0;

      &:hover {
        background: rgba(255, 248, 203, 0.15);
        color: #FFFFFF;
        border-color: var(--color-cream-200);
      }

      @media (max-width: 440px) {
        padding: 0.45rem;
        span {
          display: none;
        }
      }
    }
  `]
})
export class AdminHeaderComponent {
  readonly authService = inject(AuthService);

  getInitials(name: string): string {
    if (!name) return 'AD';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  onLogout(): void {
    this.authService.logout();
  }
}
