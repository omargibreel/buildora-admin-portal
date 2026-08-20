import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-wrapper" *ngIf="toastService.toasts().length > 0">
      <div 
        *ngFor="let toast of toastService.toasts()" 
        class="toast-item"
        [ngClass]="toast.type"
      >
        <div class="toast-icon">
          <span *ngIf="toast.type === 'success'">✓</span>
          <span *ngIf="toast.type === 'error'">✕</span>
          <span *ngIf="toast.type === 'warning'">⚠</span>
          <span *ngIf="toast.type === 'info'">ℹ</span>
        </div>
        <div class="toast-content">
          <div class="toast-title">{{ toast.title }}</div>
          <div class="toast-message">{{ toast.message }}</div>
        </div>
        <button type="button" class="toast-close" (click)="toastService.remove(toast.id)">&times;</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-wrapper {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 380px;
      width: 100%;

      @media (max-width: 480px) {
        bottom: 12px;
        right: 12px;
        left: 12px;
        max-width: calc(100% - 24px);
      }
    }

    .toast-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      border-radius: var(--radius-md);
      background: #FFFFFF;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      border-left: 4px solid transparent;
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);

      &.success {
        border-color: var(--color-success);
        .toast-icon { color: var(--color-success); }
      }
      &.error {
        border-color: var(--color-error);
        .toast-icon { color: var(--color-error); }
      }
      &.warning {
        border-color: var(--color-warning);
        .toast-icon { color: var(--color-warning); }
      }
      &.info {
        border-color: var(--color-info);
        .toast-icon { color: var(--color-info); }
      }
    }

    .toast-icon {
      font-size: 1.15rem;
      font-weight: 800;
      line-height: 1;
      margin-top: 2px;
    }

    .toast-content {
      flex: 1;
    }

    .toast-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--color-primary-900);
      margin-bottom: 2px;
    }

    .toast-message {
      font-size: 0.82rem;
      color: var(--color-neutral-700);
      line-height: 1.4;
    }

    .toast-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: var(--color-neutral-400);
      cursor: pointer;
      line-height: 1;
      padding: 0;

      &:hover { color: var(--color-neutral-900); }
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
}
