import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CompanyApplicationService } from '../../core/services/company-application.service';
import { CompanyApplicationListItem, CompanyApplicationSummary } from '../../core/models/application.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-applications-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusBadgeComponent],
  template: `
    <div class="dashboard-page">
      <!-- Top Title & Controls -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Company Applications</h1>
          <p class="page-subtitle">Manage, review, and action enterprise workspace onboarding requests.</p>
        </div>
        <button type="button" class="btn btn-secondary" (click)="loadData()" [disabled]="isLoading()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [class.spin-icon]="isLoading()">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      <!-- Section 1: Dashboard Summary Stat Cards -->
      <div class="stats-grid">
        <!-- Total Card -->
        <div class="stat-card" [class.active]="selectedStatus() === 'All'" (click)="filterByStatus('All')">
          <div class="stat-meta">
            <span class="stat-label">Total Applications</span>
            <span class="stat-value">{{ summary()?.total ?? 0 }}</span>
          </div>
          <div class="stat-icon total-icon">📋</div>
        </div>

        <!-- Pending Card -->
        <div class="stat-card pending-card" [class.active]="selectedStatus() === 'Pending'" (click)="filterByStatus('Pending')">
          <div class="stat-meta">
            <span class="stat-label">Pending Review</span>
            <span class="stat-value text-amber">{{ summary()?.pending ?? 0 }}</span>
          </div>
          <div class="stat-icon pending-icon">⏳</div>
        </div>

        <!-- Approved Card -->
        <div class="stat-card approved-card" [class.active]="selectedStatus() === 'Approved'" (click)="filterByStatus('Approved')">
          <div class="stat-meta">
            <span class="stat-label">Approved Workspaces</span>
            <span class="stat-value text-emerald">{{ summary()?.approved ?? 0 }}</span>
          </div>
          <div class="stat-icon approved-icon">✓</div>
        </div>

        <!-- Rejected Card -->
        <div class="stat-card rejected-card" [class.active]="selectedStatus() === 'Rejected'" (click)="filterByStatus('Rejected')">
          <div class="stat-meta">
            <span class="stat-label">Declined Requests</span>
            <span class="stat-value text-terracotta">{{ summary()?.rejected ?? 0 }}</span>
          </div>
          <div class="stat-icon rejected-icon">✕</div>
        </div>
      </div>

      <!-- Section 2: Filter Toolbar -->
      <div class="toolbar admin-card">
        <!-- Status Filter Tabs -->
        <div class="status-tabs">
          <button 
            type="button" 
            class="tab-btn" 
            [class.active]="selectedStatus() === 'All'"
            (click)="filterByStatus('All')"
          >
            All Submissions
          </button>
          <button 
            type="button" 
            class="tab-btn" 
            [class.active]="selectedStatus() === 'Pending'"
            (click)="filterByStatus('Pending')"
          >
            Pending ({{ summary()?.pending ?? 0 }})
          </button>
          <button 
            type="button" 
            class="tab-btn" 
            [class.active]="selectedStatus() === 'Approved'"
            (click)="filterByStatus('Approved')"
          >
            Approved ({{ summary()?.approved ?? 0 }})
          </button>
          <button 
            type="button" 
            class="tab-btn" 
            [class.active]="selectedStatus() === 'Rejected'"
            (click)="filterByStatus('Rejected')"
          >
            Rejected ({{ summary()?.rejected ?? 0 }})
          </button>
        </div>

        <!-- Search Bar -->
        <div class="search-box">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            class="search-input"
            placeholder="Search company, contact, or email..."
            [(ngModel)]="searchQuery"
            (keyup.enter)="onSearch()"
            (ngModelChange)="onSearchInputChange($event)"
          />
          <button *ngIf="searchQuery" type="button" class="clear-search" (click)="clearSearch()">&times;</button>
        </div>
      </div>

      <!-- Section 3: Applications Data Table -->
      <div class="table-container admin-card">
        <!-- Loading Overlay -->
        <div *ngIf="isLoading()" class="table-loading">
          <div class="spinner-lg"></div>
          <span>Loading submissions...</span>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading() && applications().length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>No applications found</h3>
          <p *ngIf="searchQuery">No results matching "{{ searchQuery }}". Try clearing the search or status filter.</p>
          <p *ngIf="!searchQuery">There are currently no company applications in this status category.</p>
          <button *ngIf="searchQuery || selectedStatus() !== 'All'" type="button" class="btn btn-secondary mt-3" (click)="resetFilters()">
            Reset All Filters
          </button>
        </div>

        <!-- Real Data Table -->
        <table *ngIf="!isLoading() && applications().length > 0" class="applications-table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Industry</th>
              <th>Contact Person</th>
              <th>Email</th>
              <th>Submitted Date</th>
              <th>Status</th>
              <th class="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of applications()" [routerLink]="['/applications', item.id]" class="clickable-row">
              <td class="cell-company">
                <div class="company-name">{{ item.companyName }}</div>
                <div class="company-sub">{{ item.country }} &bull; {{ item.companySizeRange }}</div>
                <div class="company-tax">Tax #: {{ item.taxNumber || 'Not provided' }}</div>
              </td>
              <td>
                <span class="industry-chip">{{ item.industryType }}</span>
              </td>
              <td class="cell-contact">
                <div class="contact-name">{{ item.contactFullName }}</div>
                <div class="contact-title" *ngIf="item.jobTitle">{{ item.jobTitle }}</div>
              </td>
              <td class="cell-email">{{ item.email }}</td>
              <td class="cell-date">
                {{ item.submittedAtUtc | date:'mediumDate' }}
                <span class="date-time">{{ item.submittedAtUtc | date:'shortTime' }}</span>
              </td>
              <td>
                <app-status-badge [status]="item.statusName"></app-status-badge>
              </td>
              <td class="text-right" (click)="$event.stopPropagation()">
                <a [routerLink]="['/applications', item.id]" class="btn btn-secondary btn-sm">
                  <span>View Details</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </a>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Table Footer / Pagination -->
        <div class="table-footer" *ngIf="!isLoading() && totalCount() > 0">
          <div class="pagination-info">
            Showing <strong>{{ (currentPage() - 1) * pageSize + 1 }}</strong> - <strong>{{ getEndIndex() }}</strong> of <strong>{{ totalCount() }}</strong> applications
          </div>

          <div class="pagination-controls" *ngIf="totalPages() > 1">
            <button 
              type="button" 
              class="page-btn" 
              [disabled]="currentPage() === 1"
              (click)="changePage(currentPage() - 1)"
            >
              Previous
            </button>
            
            <span class="page-indicator">Page {{ currentPage() }} of {{ totalPages() }}</span>

            <button 
              type="button" 
              class="page-btn" 
              [disabled]="currentPage() === totalPages()"
              (click)="changePage(currentPage() + 1)"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      width: 100%;
      min-width: 0;
      max-width: 100%;
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.75rem;
      width: 100%;
      min-width: 0;

      @media (max-width: 640px) {
        flex-direction: column;
        align-items: stretch;
      }

      .page-title {
        font-size: 1.85rem;
        font-weight: 800;

        @media (max-width: 640px) {
          font-size: 1.45rem;
        }
      }

      .page-subtitle {
        color: var(--color-neutral-500);
        font-size: 0.95rem;
        margin-top: 0.2rem;

        @media (max-width: 640px) {
          font-size: 0.85rem;
        }
      }
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1.25rem;
      margin-bottom: 1.75rem;
      width: 100%;
      min-width: 0;

      @media (max-width: 1024px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      @media (max-width: 540px) {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    .stat-card {
      background: #FFFFFF;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: var(--shadow-sm);
      cursor: pointer;
      transition: var(--transition-smooth);

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
        border-color: var(--color-primary-300);
      }

      &.active {
        border-color: var(--color-primary-500);
        box-shadow: 0 0 0 2px rgba(100, 57, 81, 0.2);
      }

      .stat-meta {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .stat-label {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--color-neutral-500);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .stat-value {
        font-family: 'Outfit', sans-serif;
        font-size: 1.85rem;
        font-weight: 800;
        color: var(--color-primary-900);
        line-height: 1;
      }

      .text-amber { color: var(--color-warning); }
      .text-emerald { color: var(--color-success); }
      .text-terracotta { color: var(--color-accent-500); }

      .stat-icon {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.35rem;
        background: var(--color-neutral-50);
      }

      &.pending-card .stat-icon { background: var(--color-warning-bg); }
      &.approved-card .stat-icon { background: var(--color-success-bg); }
      &.rejected-card .stat-icon { background: var(--color-error-bg); }
    }

    /* Toolbar */
    .toolbar {
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
        padding: 1rem;
      }
    }

    .status-tabs {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: var(--color-neutral-50);
      padding: 0.3rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-neutral-200);
      overflow-x: auto;
      max-width: 100%;
      -webkit-overflow-scrolling: touch;

      &::-webkit-scrollbar {
        height: 3px;
      }

      .tab-btn {
        background: none;
        border: none;
        padding: 0.45rem 0.95rem;
        border-radius: var(--radius-sm);
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--color-neutral-700);
        cursor: pointer;
        transition: var(--transition-fast);
        white-space: nowrap;
        flex-shrink: 0;

        &:hover {
          color: var(--color-primary-900);
        }

        &.active {
          background: #FFFFFF;
          color: var(--color-primary-800);
          font-weight: 700;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
        }
      }
    }

    .search-box {
      position: relative;
      min-width: 260px;
      flex: 1;
      max-width: 400px;

      @media (max-width: 768px) {
        max-width: 100%;
        min-width: 100%;
      }

      .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--color-neutral-400);
      }

      .search-input {
        width: 100%;
        padding: 0.55rem 2.25rem 0.55rem 2.35rem;
        border: 1.5px solid var(--color-neutral-300);
        border-radius: var(--radius-md);
        font-size: 0.88rem;

        &:focus {
          outline: none;
          border-color: var(--color-primary-500);
          box-shadow: 0 0 0 3px rgba(100, 57, 81, 0.1);
        }
      }

      .clear-search {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        font-size: 1.2rem;
        color: var(--color-neutral-400);
        cursor: pointer;
      }
    }

    /* Table Container */
    .table-container {
      padding: 0;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      position: relative;
    }

    .table-loading {
      padding: 4rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      color: var(--color-neutral-500);
      font-size: 0.95rem;

      .spinner-lg {
        width: 36px;
        height: 36px;
        border: 3px solid var(--color-primary-100);
        border-top-color: var(--color-primary-500);
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }
    }

    .empty-state {
      padding: 4rem 2rem;
      text-align: center;

      .empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
      h3 { font-size: 1.25rem; margin-bottom: 0.35rem; }
      p { color: var(--color-neutral-500); font-size: 0.9rem; max-width: 450px; margin: 0 auto; }
    }

    .applications-table {
      width: 100%;
      min-width: 680px;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;

      th {
        background-color: var(--color-neutral-50);
        color: var(--color-neutral-700);
        font-size: 0.78rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 0.9rem 1.25rem;
        border-bottom: 1px solid var(--color-neutral-200);
        white-space: nowrap;
      }

      td {
        padding: 1rem 1.25rem;
        border-bottom: 1px solid var(--color-neutral-100);
        vertical-align: middle;
      }

      .clickable-row {
        cursor: pointer;
        transition: var(--transition-fast);

        &:hover {
          background-color: var(--color-primary-50);
        }
      }

      .cell-company {
        .company-name { font-weight: 700; color: var(--color-primary-900); font-size: 0.95rem; }
        .company-sub { font-size: 0.78rem; color: var(--color-neutral-500); margin-top: 2px; }
        .company-tax { font-size: 0.75rem; color: var(--color-neutral-400); font-family: monospace; margin-top: 2px; }
      }

      .industry-chip {
        display: inline-block;
        background-color: var(--color-neutral-100);
        color: var(--color-primary-800);
        padding: 0.2rem 0.6rem;
        border-radius: var(--radius-sm);
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: capitalize;
        white-space: nowrap;
      }

      .cell-contact {
        .contact-name { font-weight: 600; color: var(--color-neutral-900); white-space: nowrap; }
        .contact-title { font-size: 0.78rem; color: var(--color-neutral-500); }
      }

      .cell-email {
        color: var(--color-neutral-700);
        font-family: monospace;
        font-size: 0.85rem;
      }

      .cell-date {
        color: var(--color-neutral-700);
        font-size: 0.85rem;
        white-space: nowrap;
        .date-time { display: block; font-size: 0.75rem; color: var(--color-neutral-400); }
      }

      .text-right { text-align: right; }
      .btn-sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; white-space: nowrap; }
    }

    .table-footer {
      padding: 1rem 1.25rem;
      background-color: var(--color-neutral-50);
      border-top: 1px solid var(--color-neutral-200);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.85rem;
      color: var(--color-neutral-700);
      gap: 1rem;
      flex-wrap: wrap;

      @media (max-width: 640px) {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .page-btn {
        background: #FFFFFF;
        border: 1px solid var(--color-neutral-300);
        padding: 0.35rem 0.85rem;
        border-radius: var(--radius-sm);
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        &:hover:not(:disabled) {
          border-color: var(--color-primary-500);
          color: var(--color-primary-600);
        }
      }

      .page-indicator {
        font-weight: 600;
        color: var(--color-neutral-700);
      }
    }

    .spin-icon {
      animation: spin 1s linear infinite;
    }

    .mt-3 { margin-top: 0.75rem; }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ApplicationsListComponent implements OnInit {
  private readonly appService = inject(CompanyApplicationService);

  applications = signal<CompanyApplicationListItem[]>([]);
  summary = signal<CompanyApplicationSummary | null>(null);
  isLoading = signal(false);

  selectedStatus = signal<string>('All');
  searchQuery = '';
  currentPage = signal(1);
  pageSize = 10;
  totalCount = signal(0);
  totalPages = signal(1);

  private searchTimeout: any;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);

    // Load Summary Metric Cards
    this.appService.getSummary().subscribe({
      next: (sum) => this.summary.set(sum),
      error: () => console.error('Failed to fetch summary stats')
    });

    // Load Paged Table
    this.appService.getApplications(
      this.selectedStatus(),
      this.searchQuery,
      this.currentPage(),
      this.pageSize
    ).subscribe({
      next: (res) => {
        this.applications.set(res.items);
        this.totalCount.set(res.totalCount);
        this.totalPages.set(res.totalPages || 1);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.applications.set([]);
      }
    });
  }

  filterByStatus(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
    this.loadData();
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadData();
  }

  onSearchInputChange(val: string): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.onSearch();
    }, 350);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage.set(1);
    this.loadData();
  }

  resetFilters(): void {
    this.selectedStatus.set('All');
    this.searchQuery = '';
    this.currentPage.set(1);
    this.loadData();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadData();
    }
  }

  getEndIndex(): number {
    const end = this.currentPage() * this.pageSize;
    return end > this.totalCount() ? this.totalCount() : end;
  }
}
