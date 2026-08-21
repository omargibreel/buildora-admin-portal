import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-panel">
        <!-- Logo & Header -->
        <div class="brand-header">
          <img src="assets/images/logo-plum.svg" alt="Buildora" class="brand-main-logo">
          <p class="brand-subtitle">Enterprise Application Review Portal</p>
        </div>

        <!-- Login Card -->
        <div class="login-card admin-card">
          <div class="card-intro">
            <h2>Admin Sign In</h2>
            <p>Enter your administrator credentials to access submissions.</p>
          </div>

          <!-- Error Alert Banner -->
          <div *ngIf="errorMessage()" class="alert-error" role="alert">
            <span class="alert-icon">✕</span>
            <span>{{ errorMessage() }}</span>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>
            <!-- Email -->
            <div class="form-group" [class.has-error]="isInvalid('email')">
              <label for="email" class="form-label">Admin Email</label>
              <input
                id="email"
                type="email"
                class="form-control"
                formControlName="email"
                placeholder="Enter admin email"
                autocomplete="email"
              />
              <span *ngIf="isInvalid('email')" class="error-msg">Valid admin email is required.</span>
            </div>

            <!-- Password -->
            <div class="form-group" [class.has-error]="isInvalid('password')">
              <label for="password" class="form-label">Password</label>
              <input
                id="password"
                type="password"
                class="form-control"
                formControlName="password"
                placeholder="Enter password"
                autocomplete="current-password"
              />
              <span *ngIf="isInvalid('password')" class="error-msg">Password is required.</span>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="btn btn-primary btn-submit"
              [disabled]="isLoading()"
            >
              <span *ngIf="isLoading()" class="spinner"></span>
              <span>{{ isLoading() ? 'Signing in...' : 'Sign In to Review Portal' }}</span>
            </button>
          </form>
        </div>

        <div class="login-footer">
          <p>&copy; 2026 Buildora Construction Management Platform. Internal access only.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at top right, rgba(100, 57, 81, 0.12), transparent 50%),
                  radial-gradient(circle at bottom left, rgba(201, 123, 74, 0.1), transparent 50%),
                  var(--color-bg);
      padding: 1.5rem;

      @media (max-width: 480px) {
        padding: 1rem 0.75rem;
      }
    }

    .login-panel {
      width: 100%;
      max-width: 440px;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .brand-header {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.65rem;
      margin-bottom: 0.5rem;

      .brand-main-logo {
        height: 50px;
        width: auto;
        max-width: 260px;
        object-fit: contain;
        transition: transform 0.25s ease;

        &:hover {
          transform: scale(1.02);
        }

        @media (max-width: 480px) {
          height: 42px;
          max-width: 220px;
        }
      }

      .brand-subtitle {
        font-size: 0.88rem;
        font-weight: 500;
        color: var(--color-neutral-600);
        margin: 0;
        letter-spacing: 0.01em;

        @media (max-width: 480px) {
          font-size: 0.8rem;
        }
      }
    }

    .login-card {
      padding: 2.25rem 2rem;
      border-radius: var(--radius-xl);
      border-color: var(--color-primary-100);
      box-shadow: var(--shadow-lg);

      @media (max-width: 480px) {
        padding: 1.5rem 1.25rem;
        border-radius: var(--radius-lg);
      }

      .card-intro {
        margin-bottom: 1.5rem;
        h2 { 
          font-size: 1.35rem; 
          font-weight: 700; 
          margin-bottom: 0.25rem; 

          @media (max-width: 480px) {
            font-size: 1.2rem;
          }
        }
        p { font-size: 0.88rem; color: var(--color-neutral-500); }
      }
    }

    .alert-error {
      background-color: var(--color-error-bg);
      border: 1px solid var(--color-error-border);
      color: var(--color-error);
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.88rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.25rem;

      .alert-icon { font-weight: 800; }
    }

    .has-error .form-control {
      border-color: var(--color-error);
      background-color: #FFF9F9;
    }

    .error-msg {
      font-size: 0.78rem;
      color: var(--color-error);
      font-weight: 600;
      margin-top: 0.25rem;
    }

    .btn-submit {
      width: 100%;
      padding: 0.85rem;
      font-size: 0.95rem;
      margin-top: 0.5rem;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #FFFFFF;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    .login-footer {
      text-align: center;
      font-size: 0.78rem;
      color: var(--color-neutral-500);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  isInvalid(field: string): boolean {
    const ctrl = this.loginForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toast.success('Welcome back', 'Signed in successfully.');
        this.router.navigate(['/applications']);
      },
      error: (err) => {
        this.isLoading.set(false);
        let msg: string;
        if (err.status === 0) {
          msg = `Could not reach the Buildora API at ${environment.apiUrl}. Make sure the API is running and CORS is configured.`;
        } else if (err.error?.message) {
          msg = err.error.message;
        } else if (err.status === 401 || err.status === 403) {
          msg = 'Invalid email or password. Please verify your admin credentials.';
        } else {
          msg = `The API responded with an unexpected error (HTTP ${err.status}). Check the API logs for details.`;
        }
        this.errorMessage.set(msg);
      }
    });
  }
}
