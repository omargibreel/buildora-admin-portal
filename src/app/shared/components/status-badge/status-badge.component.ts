import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="badgeClass">
      <span class="dot"></span>
      <span>{{ label }}</span>
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.3rem 0.75rem;
      border-radius: var(--radius-full);
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      line-height: 1;

      .dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
      }

      &.pending {
        background-color: var(--color-warning-bg);
        color: var(--color-warning);
        border: 1px solid var(--color-warning-border);
        .dot { background-color: var(--color-warning); }
      }

      &.approved {
        background-color: var(--color-success-bg);
        color: var(--color-success);
        border: 1px solid var(--color-success-border);
        .dot { background-color: var(--color-success); }
      }

      &.rejected {
        background-color: var(--color-error-bg);
        color: var(--color-error);
        border: 1px solid var(--color-error-border);
        .dot { background-color: var(--color-error); }
      }
    }
  `]
})
export class StatusBadgeComponent {
  @Input() status: 'Pending' | 'Approved' | 'Rejected' | string = 'Pending';

  get label(): string {
    return this.status || 'Pending';
  }

  get badgeClass(): string {
    const s = this.status?.toLowerCase();
    if (s === 'approved') return 'approved';
    if (s === 'rejected') return 'rejected';
    return 'pending';
  }
}
