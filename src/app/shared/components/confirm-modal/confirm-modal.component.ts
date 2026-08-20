import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" *ngIf="isOpen" (click)="onCancel()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="header-icon" [ngClass]="variant">
            <span *ngIf="variant === 'success'">✓</span>
            <span *ngIf="variant === 'danger'">✕</span>
            <span *ngIf="variant === 'primary'">ℹ</span>
          </div>
          <div>
            <h3 class="modal-title">{{ title }}</h3>
            <p class="modal-subtitle">{{ subtitle }}</p>
          </div>
        </div>

        <div class="modal-body">
          <p class="message-text">{{ message }}</p>

          <!-- Optional textarea for Rejection Reason -->
          <div *ngIf="requireReason" class="reason-container">
            <label class="form-label" for="reasonInput">
              Rejection Reason &amp; Feedback <span class="required-star">*</span>
            </label>
            <textarea
              id="reasonInput"
              class="form-control"
              rows="4"
              [(ngModel)]="reasonText"
              placeholder="Provide a clear explanation that will be emailed to the applicant..."
            ></textarea>
            <span *ngIf="reasonError" class="error-msg">{{ reasonError }}</span>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="onCancel()" [disabled]="isLoading">
            Cancel
          </button>
          <button 
            type="button" 
            class="btn" 
            [ngClass]="'btn-' + variant"
            (click)="onConfirm()"
            [disabled]="isLoading"
          >
            <span *ngIf="isLoading" class="spinner"></span>
            <span>{{ confirmText }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(28, 16, 23, 0.65);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
      animation: fadeIn 0.2s ease-out;
    }

    .modal-card {
      background: #FFFFFF;
      border-radius: var(--radius-xl);
      border: 1px solid var(--color-primary-100);
      box-shadow: var(--shadow-xl);
      width: 100%;
      max-width: 520px;
      overflow: hidden;
      animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);

      @media (max-width: 480px) {
        border-radius: var(--radius-lg);
      }
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--color-neutral-100);
      display: flex;
      align-items: flex-start;
      gap: 1rem;

      @media (max-width: 480px) {
        padding: 1.25rem 1rem;
      }

      .header-icon {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        font-weight: 800;
        flex-shrink: 0;

        &.success {
          background-color: var(--color-success-bg);
          color: var(--color-success);
          border: 1px solid var(--color-success-border);
        }

        &.danger {
          background-color: var(--color-error-bg);
          color: var(--color-error);
          border: 1px solid var(--color-error-border);
        }

        &.primary {
          background-color: var(--color-primary-50);
          color: var(--color-primary-500);
          border: 1px solid var(--color-primary-200);
        }
      }

      .modal-title {
        font-size: 1.2rem;
        font-weight: 700;

        @media (max-width: 480px) {
          font-size: 1.1rem;
        }
      }

      .modal-subtitle {
        font-size: 0.85rem;
        color: var(--color-neutral-500);
        margin-top: 0.15rem;
      }
    }

    .modal-body {
      padding: 1.5rem;
      font-size: 0.95rem;
      color: var(--color-neutral-700);
      line-height: 1.5;

      @media (max-width: 480px) {
        padding: 1.25rem 1rem;
        font-size: 0.88rem;
      }

      .message-text {
        margin-bottom: 1rem;
      }

      .reason-container {
        margin-top: 1rem;
        .required-star { color: var(--color-error); }
        .error-msg {
          color: var(--color-error);
          font-size: 0.8rem;
          font-weight: 600;
          margin-top: 0.35rem;
          display: block;
        }
      }
    }

    .modal-footer {
      padding: 1.25rem 1.5rem;
      background-color: var(--color-neutral-50);
      border-top: 1px solid var(--color-neutral-100);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;

      @media (max-width: 480px) {
        padding: 1rem;
        flex-direction: column-reverse;
        gap: 0.5rem;

        .btn {
          width: 100%;
        }
      }
    }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #FFFFFF;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      display: inline-block;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(16px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() subtitle = '';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Confirm';
  @Input() variant: 'primary' | 'success' | 'danger' = 'primary';
  @Input() requireReason = false;
  @Input() isLoading = false;

  @Output() confirmed = new EventEmitter<string | undefined>();
  @Output() cancelled = new EventEmitter<void>();

  reasonText = '';
  reasonError = '';

  onConfirm(): void {
    if (this.requireReason) {
      if (!this.reasonText || this.reasonText.trim().length < 5) {
        this.reasonError = 'Please provide a valid rejection explanation (at least 5 characters).';
        return;
      }
      this.reasonError = '';
      this.confirmed.emit(this.reasonText.trim());
    } else {
      this.confirmed.emit(undefined);
    }
  }

  onCancel(): void {
    this.reasonText = '';
    this.reasonError = '';
    this.cancelled.emit();
  }
}
