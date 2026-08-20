export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected';

export interface ApplicationInterest {
  id: number;
  code: string;
  label: string;
}

export interface EmailLog {
  id: string;
  recipientEmail: string;
  emailType: string;
  sentAtUtc: string;
  success: boolean;
  errorMessage?: string;
}

export interface CompanyApplicationListItem {
  id: string;
  companyName: string;
  industryType: string;
  companySizeRange: string;
  country: string;
  contactFullName: string;
  jobTitle?: string;
  email: string;
  phoneNumber: string;
  taxNumber: string;
  taxImagePath?: string;
  activeProjectsCount?: number;
  status: ApplicationStatus;
  statusName: string;
  submittedAtUtc: string;
  reviewedAtUtc?: string;
  reviewedByAdminName?: string;
}

export interface CompanyApplicationDetail extends CompanyApplicationListItem {
  additionalNotes?: string;
  consentGiven: boolean;
  reviewedByAdminId?: string;
  rejectionReason?: string;
  interests: ApplicationInterest[];
  emailLogs: EmailLog[];
}

export interface CompanyApplicationSummary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface RejectPayload {
  reason: string;
}
