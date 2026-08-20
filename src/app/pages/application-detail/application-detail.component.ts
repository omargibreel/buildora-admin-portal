import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CompanyApplicationService } from '../../core/services/company-application.service';
import { ToastService } from '../../core/services/toast.service';
import { CompanyApplicationDetail } from '../../core/models/application.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgeComponent, ConfirmModalComponent],
  template: `
    <div class="detail-page" *ngIf="application() as app">
      <!-- Top Navigation & Actions Bar -->
      <div class="detail-nav-bar">
        <a routerLink="/applications" class="back-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Back to All Applications</span>
        </a>

        <!-- Action Buttons (Only when Pending) -->
        <div class="action-buttons" *ngIf="app.status === 'Pending'">
          <button type="button" class="btn btn-outline-danger" (click)="openRejectModal()">
            <span>Reject Application</span>
          </button>
          <button type="button" class="btn btn-success" (click)="openApproveModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Approve &amp; Provision Workspace</span>
          </button>
        </div>
      </div>

      <!-- Application Banner -->
      <div class="application-banner admin-card">
        <div class="banner-main">
          <div class="banner-badge-row">
            <app-status-badge [status]="app.statusName"></app-status-badge>
            <span class="app-id">ID: {{ app.id }}</span>
          </div>
          <h1 class="company-heading">{{ app.companyName }}</h1>
          <p class="submitted-timestamp">
            Submitted on {{ app.submittedAtUtc | date:'fullDate' }} at {{ app.submittedAtUtc | date:'mediumTime' }} (UTC)
          </p>
        </div>

        <!-- Right Side Decision Summary if already Actioned -->
        <div *ngIf="app.status !== 'Pending'" class="decision-pill" [ngClass]="app.status.toLowerCase()">
          <div class="pill-label">Review Status</div>
          <div class="pill-value">{{ app.statusName }}</div>
          <div class="pill-meta" *ngIf="app.reviewedAtUtc">
            on {{ app.reviewedAtUtc | date:'mediumDate' }}
          </div>
          <div class="pill-admin" *ngIf="app.reviewedByAdminName">
            by {{ app.reviewedByAdminName }}
          </div>
        </div>
      </div>

      <!-- Grid Layout for 3 Sections -->
      <div class="details-grid">
        <!-- GROUP 1: Company Information -->
        <div class="group-card admin-card">
          <div class="group-header">
            <span class="group-num">1</span>
            <h3>Company Information</h3>
          </div>
          <div class="group-content">
            <div class="field-item">
              <span class="field-label">Company Legal Name</span>
              <span class="field-value highlight">{{ app.companyName }}</span>
            </div>
            <div class="field-item">
              <span class="field-label">Industry Type</span>
              <span class="field-value capitalize">{{ app.industryType }}</span>
            </div>
            <div class="field-item">
              <span class="field-label">Company Size Range</span>
              <span class="field-value">{{ app.companySizeRange }}</span>
            </div>
            <div class="field-item">
              <span class="field-label">Country / Jurisdiction</span>
              <span class="field-value">{{ app.country }}</span>
            </div>
            <div class="field-item">
              <span class="field-label">Tax Registration Number</span>
              <span class="field-value highlight">{{ app.taxNumber || 'Not provided' }}</span>
            </div>
            <div class="field-item">
              <span class="field-label">Tax Registration Document</span>
              <span class="field-value" *ngIf="taxImageUrl(app) as imgUrl; else noTaxImage">
                <a [href]="imgUrl" target="_blank" rel="noopener noreferrer" class="link-email">
                  View / Download File
                </a>
              </span>
              <ng-template #noTaxImage>
                <span class="field-value text-muted">Not attached</span>
              </ng-template>
            </div>
          </div>
        </div>

        <!-- GROUP 2: Contact Person -->
        <div class="group-card admin-card">
          <div class="group-header">
            <span class="group-num">2</span>
            <h3>Contact Person</h3>
          </div>
          <div class="group-content">
            <div class="field-item">
              <span class="field-label">Full Name</span>
              <span class="field-value highlight">{{ app.contactFullName }}</span>
            </div>
            <div class="field-item">
              <span class="field-label">Job Title</span>
              <span class="field-value">{{ app.jobTitle || 'Not specified' }}</span>
            </div>
            <div class="field-item">
              <span class="field-label">Business Email</span>
              <span class="field-value">
                <a [href]="'mailto:' + app.email" class="link-email">
                  {{ app.email }}
                </a>
              </span>
            </div>
            <div class="field-item">
              <span class="field-label">Phone Number</span>
              <span class="field-value">
                <a [href]="'tel:' + app.phoneNumber" class="link-phone">
                  {{ app.phoneNumber }}
                </a>
              </span>
            </div>
          </div>
        </div>

        <!-- GROUP 3: Application Details & Management Goals -->
        <div class="group-card admin-card span-full">
          <div class="group-header">
            <span class="group-num">3</span>
            <h3>Application Details &amp; Management Goals</h3>
          </div>
          <div class="group-content">
            <div class="field-row">
              <div class="field-item">
                <span class="field-label">Active Projects Count</span>
                <span class="field-value">{{ app.activeProjectsCount != null ? app.activeProjectsCount : 'None specified' }}</span>
              </div>
              <div class="field-item">
                <span class="field-label">Consent Given</span>
                <span class="field-value text-emerald font-bold">
                  ✓ Yes (Applicant agreed to application terms)
                </span>
              </div>
            </div>

            <!-- Management Goals / Interests Read-only Chips -->
            <div class="field-item mt-4">
              <span class="field-label mb-2">What they are looking to manage with Buildora:</span>
              <div class="interest-chips" *ngIf="app.interests && app.interests.length > 0">
                <div class="interest-chip" *ngFor="let interest of app.interests">
                  <span class="chip-dot"></span>
                  <span class="chip-text">{{ interest.label }}</span>
                  <span class="chip-code">{{ interest.code }}</span>
                </div>
              </div>
              <div *ngIf="!app.interests || app.interests.length === 0" class="no-interests">
                No specific interests selected.
              </div>
            </div>

            <!-- Additional Notes / Message -->
            <div class="field-item mt-4">
              <span class="field-label">Additional Message from Applicant</span>
              <div class="notes-box">
                {{ app.additionalNotes || 'No additional message was provided with this application.' }}
              </div>
            </div>
          </div>
        </div>

        <!-- REVIEW AUDIT TRAIL (When Reviewed) -->
        <div *ngIf="app.status !== 'Pending'" class="group-card admin-card span-full audit-section" [ngClass]="app.status.toLowerCase()">
          <div class="group-header">
            <span class="group-num">✓</span>
            <h3>Review Audit Trail &amp; Notification History</h3>
          </div>
          <div class="audit-body">
            <div class="audit-meta-grid">
              <div class="field-item">
                <span class="field-label">Final Decision</span>
                <span class="field-value font-bold" [ngClass]="app.status === 'Approved' ? 'text-emerald' : 'text-terracotta'">
                  {{ app.statusName }}
                </span>
              </div>
              <div class="field-item">
                <span class="field-label">Reviewed By Admin</span>
                <span class="field-value">{{ app.reviewedByAdminName || 'Buildora Admin' }}</span>
              </div>
              <div class="field-item">
                <span class="field-label">Review Completed At</span>
                <span class="field-value">{{ app.reviewedAtUtc | date:'medium' }} UTC</span>
              </div>
            </div>

            <!-- Rejection Reason if Rejected -->
            <div *ngIf="app.status === 'Rejected'" class="rejection-box mt-4">
              <span class="field-label text-terracotta font-bold">Documented Rejection Reason (Sent via Email):</span>
              <p class="rejection-text">{{ app.rejectionReason }}</p>
            </div>

            <!-- Email Delivery Logs -->
            <div class="email-logs mt-4" *ngIf="app.emailLogs && app.emailLogs.length > 0">
              <span class="field-label mb-2">Automated Notification Dispatch Log:</span>
              
              <!-- Desktop / Tablet Table View -->
              <div class="log-table-wrapper desktop-log-view">
                <table class="log-table">
                  <thead>
                    <tr>
                      <th>Recipient</th>
                      <th>Email Type</th>
                      <th>Sent Time</th>
                      <th>Delivery Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let log of app.emailLogs">
                      <td class="cell-recipient">{{ log.recipientEmail }}</td>
                      <td>{{ log.emailType }} Notice</td>
                      <td>{{ log.sentAtUtc | date:'medium' }}</td>
                      <td>
                        <span *ngIf="log.success" class="log-badge success">✓ Sent Successfully</span>
                        <span *ngIf="!log.success" class="log-badge failed" [title]="log.errorMessage || ''">
                          ✕ Logged (SMTP Offline)
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Mobile Card List View -->
              <div class="mobile-log-view">
                <div class="log-card-item" *ngFor="let log of app.emailLogs">
                  <div class="log-card-header">
                    <span class="log-type-tag">{{ log.emailType }} Notice</span>
                    <span *ngIf="log.success" class="log-badge success">✓ Sent Successfully</span>
                    <span *ngIf="!log.success" class="log-badge failed" [title]="log.errorMessage || ''">
                      ✕ Logged (SMTP Offline)
                    </span>
                  </div>
                  <div class="log-card-body">
                    <div class="log-field">
                      <span class="log-label">Recipient</span>
                      <span class="log-value">{{ log.recipientEmail }}</span>
                    </div>
                    <div class="log-field">
                      <span class="log-label">Sent Time</span>
                      <span class="log-value">{{ log.sentAtUtc | date:'medium' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- APPROVE CONFIRMATION MODAL -->
      <app-confirm-modal
        [isOpen]="isApproveModalOpen()"
        [title]="'Approve Application'"
        [subtitle]="app.companyName"
        [message]="'Approving this application will mark it as Approved in the database and automatically dispatch the approval notification email to ' + app.email + '.'"
        [confirmText]="'Confirm & Approve'"
        [variant]="'success'"
        [isLoading]="isProcessingAction()"
        (confirmed)="onApproveConfirmed()"
        (cancelled)="closeModals()"
      ></app-confirm-modal>

      <!-- REJECT CONFIRMATION MODAL -->
      <app-confirm-modal
        [isOpen]="isRejectModalOpen()"
        [title]="'Reject Application'"
        [subtitle]="app.companyName"
        [message]="'Please state the reason for rejection. This reason will be recorded and automatically emailed to ' + app.email + '.'"
        [confirmText]="'Confirm Rejection'"
        [variant]="'danger'"
        [requireReason]="true"
        [isLoading]="isProcessingAction()"
        (confirmed)="onRejectConfirmed($event)"
        (cancelled)="closeModals()"
      ></app-confirm-modal>
    </div>

    <!-- Loading State -->
    <div *ngIf="isLoading()" class="detail-loading">
      <div class="spinner-lg"></div>
      <p>Loading application details...</p>
    </div>
  `,
  styles: [`
    .detail-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      width: 100%;
      min-width: 0;
      max-width: 100%;
    }

    .detail-nav-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      width: 100%;
      min-width: 0;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
        gap: 0.85rem;
      }

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--color-primary-600);
        transition: color 0.15s ease;

        &:hover {
          color: var(--color-primary-900);
          text-decoration: underline;
        }
      }

      .action-buttons {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        @media (max-width: 768px) {
          flex-direction: column-reverse;
          width: 100%;

          .btn {
            width: 100%;
            justify-content: center;
          }
        }
      }
    }

    .application-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.75rem 2rem;
      background: linear-gradient(to right, #FFFFFF, var(--color-neutral-50));
      gap: 1.25rem;
      min-width: 0;
      width: 100%;
      box-sizing: border-box;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
        padding: 1.25rem 1rem;
        gap: 1rem;
      }

      .banner-main {
        min-width: 0;
        width: 100%;
      }

      .banner-badge-row {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        margin-bottom: 0.5rem;
        flex-wrap: wrap;

        .app-id {
          font-size: 0.78rem;
          color: var(--color-neutral-500);
          font-family: monospace;
          word-break: break-all;
          background: var(--color-neutral-100);
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
        }
      }

      .company-heading {
        font-size: 2rem;
        font-weight: 800;
        color: var(--color-primary-900);
        word-break: break-word;
        line-height: 1.2;

        @media (max-width: 640px) {
          font-size: 1.4rem;
        }
      }

      .submitted-timestamp {
        font-size: 0.85rem;
        color: var(--color-neutral-500);
        margin-top: 0.35rem;
        word-break: break-word;

        @media (max-width: 640px) {
          font-size: 0.78rem;
        }
      }

      .decision-pill {
        text-align: right;
        padding: 0.75rem 1.25rem;
        border-radius: var(--radius-lg);
        border: 1px solid transparent;
        flex-shrink: 0;
        min-width: 180px;

        @media (max-width: 768px) {
          text-align: left;
          width: 100%;
          min-width: unset;
          box-sizing: border-box;
          padding: 0.85rem 1rem;
        }

        &.approved {
          background-color: var(--color-success-bg);
          border-color: var(--color-success-border);
          .pill-label { color: var(--color-success); }
          .pill-value { color: var(--color-success); }
        }

        &.rejected {
          background-color: var(--color-error-bg);
          border-color: var(--color-error-border);
          .pill-label { color: var(--color-error); }
          .pill-value { color: var(--color-error); }
        }

        .pill-label {
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .pill-value {
          font-family: 'Outfit', sans-serif;
          font-size: 1.4rem;
          font-weight: 800;
          line-height: 1.2;
          margin: 0.15rem 0;
        }

        .pill-meta {
          font-size: 0.78rem;
          color: var(--color-neutral-700);
        }

        .pill-admin {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--color-primary-800);
        }
      }
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1.5rem;
      width: 100%;
      min-width: 0;

      @media (max-width: 860px) {
        grid-template-columns: minmax(0, 1fr);
        gap: 1.25rem;
      }

      .span-full {
        grid-column: 1 / -1;
      }
    }

    .group-card {
      min-width: 0;
      width: 100%;
      box-sizing: border-box;
      overflow: hidden;

      .group-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.25rem;
        padding-bottom: 0.85rem;
        border-bottom: 1px solid var(--color-neutral-100);

        .group-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--color-primary-50);
          color: var(--color-primary-600);
          font-weight: 800;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        h3 {
          font-size: 1.15rem;
          font-weight: 700;
          word-break: break-word;

          @media (max-width: 480px) {
            font-size: 1.05rem;
          }
        }
      }

      .group-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        min-width: 0;
        width: 100%;
      }
    }

    .field-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1.5rem;
      width: 100%;
      min-width: 0;

      @media (max-width: 640px) {
        grid-template-columns: minmax(0, 1fr);
        gap: 1rem;
      }
    }

    .field-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 0;
      width: 100%;

      .field-label {
        font-size: 0.78rem;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--color-neutral-500);
        letter-spacing: 0.04em;
        word-break: break-word;
      }

      .field-value {
        font-size: 0.95rem;
        color: var(--color-neutral-900);
        word-break: break-word;
        overflow-wrap: anywhere;

        &.highlight { font-weight: 700; font-size: 1.05rem; }
        &.capitalize { text-transform: capitalize; }
      }

      .link-email, .link-phone {
        color: var(--color-primary-600);
        font-weight: 600;
        text-decoration: underline;
        word-break: break-all;
        overflow-wrap: anywhere;

        &:hover { color: var(--color-accent-500); }
      }
    }

    .interest-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      width: 100%;
    }

    .interest-chip {
      background-color: var(--color-primary-50);
      border: 1px solid var(--color-primary-200);
      border-radius: var(--radius-full);
      padding: 0.4rem 0.85rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      max-width: 100%;
      box-sizing: border-box;
      flex-wrap: wrap;

      @media (max-width: 480px) {
        padding: 0.35rem 0.65rem;
        border-radius: var(--radius-md);
        gap: 0.35rem;
      }

      .chip-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background-color: var(--color-accent-500);
        flex-shrink: 0;
      }

      .chip-text {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--color-primary-800);
        word-break: break-word;
        overflow-wrap: break-word;

        @media (max-width: 480px) {
          font-size: 0.8rem;
        }
      }

      .chip-code {
        font-size: 0.7rem;
        color: var(--color-primary-500);
        background: rgba(100, 57, 81, 0.08);
        padding: 0.15rem 0.4rem;
        border-radius: var(--radius-sm);
        font-family: monospace;
        word-break: break-all;

        @media (max-width: 480px) {
          font-size: 0.65rem;
        }
      }
    }

    .notes-box {
      background: var(--color-neutral-50);
      border: 1px solid var(--color-neutral-200);
      border-radius: var(--radius-md);
      padding: 1rem 1.25rem;
      font-size: 0.92rem;
      line-height: 1.6;
      color: var(--color-neutral-800);
      white-space: pre-wrap;
      word-break: break-word;
      overflow-wrap: anywhere;
      max-width: 100%;
      box-sizing: border-box;

      @media (max-width: 480px) {
        padding: 0.85rem 1rem;
        font-size: 0.88rem;
      }
    }

    /* Audit Section */
    .audit-section {
      border-left: 4px solid transparent;
      min-width: 0;
      width: 100%;

      &.approved {
        border-left-color: var(--color-success);
        background: linear-gradient(to bottom right, #FFFFFF, #F8FCF9);
      }
      &.rejected {
        border-left-color: var(--color-accent-500);
        background: linear-gradient(to bottom right, #FFFFFF, #FFF9F7);
      }

      .audit-body {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        min-width: 0;
        width: 100%;
      }

      .audit-meta-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1rem;
        width: 100%;
        min-width: 0;

        @media (max-width: 768px) {
          grid-template-columns: minmax(0, 1fr);
          gap: 0.85rem;
        }
      }

      .rejection-box {
        background: #FFF5F3;
        border: 1px solid rgba(201, 123, 74, 0.3);
        border-radius: var(--radius-md);
        padding: 1rem 1.25rem;
        word-break: break-word;
        overflow-wrap: anywhere;

        .rejection-text {
          margin-top: 0.35rem;
          font-size: 0.95rem;
          color: var(--color-neutral-900);
          line-height: 1.5;
          word-break: break-word;
          overflow-wrap: anywhere;
        }
      }

      .email-logs {
        min-width: 0;
        width: 100%;
      }

      .desktop-log-view {
        display: block;
        @media (max-width: 640px) {
          display: none;
        }
      }

      .mobile-log-view {
        display: none;
        @media (max-width: 640px) {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
      }

      .log-table-wrapper {
        border: 1px solid var(--color-neutral-200);
        border-radius: var(--radius-md);
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        width: 100%;
        max-width: 100%;
        min-width: 0;
        box-sizing: border-box;
        background: #FFFFFF;
      }

      .log-table {
        width: 100%;
        min-width: 480px;
        border-collapse: collapse;
        font-size: 0.85rem;

        th {
          background: var(--color-neutral-50);
          padding: 0.65rem 1rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-neutral-500);
          text-transform: uppercase;
          letter-spacing: 0.03em;
          border-bottom: 1px solid var(--color-neutral-200);
        }

        td {
          padding: 0.75rem 1rem;
          border-top: 1px solid var(--color-neutral-100);
          vertical-align: middle;

          &.cell-recipient {
            font-weight: 600;
            color: var(--color-primary-900);
            word-break: break-all;
          }
        }
      }

      .mobile-log-view {
        .log-card-item {
          background: #FFFFFF;
          border: 1px solid var(--color-neutral-200);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          box-shadow: var(--shadow-sm);

          .log-card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--color-neutral-100);

            .log-type-tag {
              font-weight: 700;
              font-size: 0.85rem;
              color: var(--color-primary-900);
            }
          }

          .log-card-body {
            display: flex;
            flex-direction: column;
            gap: 0.45rem;

            .log-field {
              display: flex;
              flex-direction: column;
              gap: 0.15rem;

              .log-label {
                font-size: 0.7rem;
                font-weight: 700;
                text-transform: uppercase;
                color: var(--color-neutral-500);
                letter-spacing: 0.03em;
              }

              .log-value {
                font-size: 0.85rem;
                color: var(--color-neutral-800);
                word-break: break-all;
              }
            }
          }
        }
      }

      .log-badge {
        font-weight: 700;
        font-size: 0.75rem;
        padding: 0.25rem 0.55rem;
        border-radius: var(--radius-sm);
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        white-space: nowrap;

        &.success {
          background: var(--color-success-bg);
          color: var(--color-success);
          border: 1px solid var(--color-success-border);
        }
        &.failed {
          background: var(--color-warning-bg);
          color: var(--color-warning);
          border: 1px solid var(--color-warning-border);
        }
      }
    }

    .detail-loading {
      padding: 6rem 2rem;
      text-align: center;
      color: var(--color-neutral-500);
      .spinner-lg {
        width: 40px;
        height: 40px;
        border: 3px solid var(--color-primary-100);
        border-top-color: var(--color-primary-500);
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
        margin: 0 auto 1rem;
      }
    }

    .text-muted { color: var(--color-neutral-400); font-style: italic; }
    .text-emerald { color: var(--color-success); }
    .text-terracotta { color: var(--color-accent-500); }
    .font-bold { font-weight: 700; }
    .mt-4 { margin-top: 1rem; }
    .mb-2 { margin-bottom: 0.5rem; }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ApplicationDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly appService = inject(CompanyApplicationService);
  private readonly toast = inject(ToastService);

  application = signal<CompanyApplicationDetail | null>(null);
  isLoading = signal(false);
  isProcessingAction = signal(false);

  isApproveModalOpen = signal(false);
  isRejectModalOpen = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadApplication(id);
    }
  }

  taxImageUrl(app: CompanyApplicationDetail): string | null {
    return this.appService.resolveTaxImageUrl(app.taxImagePath);
  }

  loadApplication(id: string): void {
    this.isLoading.set(true);
    this.appService.getApplicationById(id).subscribe({
      next: (data) => {
        this.application.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error('Not Found', 'Application details could not be retrieved.');
        this.router.navigate(['/applications']);
      }
    });
  }

  openApproveModal(): void {
    this.isApproveModalOpen.set(true);
  }

  openRejectModal(): void {
    this.isRejectModalOpen.set(true);
  }

  closeModals(): void {
    this.isApproveModalOpen.set(false);
    this.isRejectModalOpen.set(false);
  }

  onApproveConfirmed(): void {
    const current = this.application();
    if (!current) return;

    this.isProcessingAction.set(true);
    this.appService.approveApplication(current.id).subscribe({
      next: (updated) => {
        this.isProcessingAction.set(false);
        this.closeModals();
        this.application.set(updated);
        this.toast.success(
          'Application Approved',
          `Workspace provision request for ${updated.companyName} approved. Automated notification sent.`
        );
      },
      error: (err) => {
        this.isProcessingAction.set(false);
        const msg = err.error?.message || 'Failed to approve application.';
        this.toast.error('Action Failed', msg);
      }
    });
  }

  onRejectConfirmed(reason?: string): void {
    const current = this.application();
    if (!current || !reason) return;

    this.isProcessingAction.set(true);
    this.appService.rejectApplication(current.id, reason).subscribe({
      next: (updated) => {
        this.isProcessingAction.set(false);
        this.closeModals();
        this.application.set(updated);
        this.toast.warning(
          'Application Rejected',
          `Application for ${updated.companyName} declined. Reason delivered to applicant.`
        );
      },
      error: (err) => {
        this.isProcessingAction.set(false);
        const msg = err.error?.message || 'Failed to reject application.';
        this.toast.error('Action Failed', msg);
      }
    });
  }
}
