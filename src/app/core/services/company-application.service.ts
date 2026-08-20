import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CompanyApplicationListItem,
  CompanyApplicationDetail,
  CompanyApplicationSummary,
  PagedResult,
  RejectPayload
} from '../models/application.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompanyApplicationService {
  private readonly http = inject(HttpClient);
  private readonly API_ORIGIN = environment.apiUrl;
  private readonly API_BASE = `${this.API_ORIGIN}/api/admin/company-applications`;

  /**
   * Resolves a relative tax image path (e.g. "/uploads/tax-documents/xxx.jpg", as stored
   * on the application entity) to an absolute URL pointing at the API's static file host.
   */
  resolveTaxImageUrl(taxImagePath?: string | null): string | null {
    if (!taxImagePath) {
      return null;
    }
    return taxImagePath.startsWith('http') ? taxImagePath : `${this.API_ORIGIN}${taxImagePath}`;
  }

  getApplications(
    status?: string,
    search?: string,
    page = 1,
    pageSize = 10,
    sortBy?: string
  ): Observable<PagedResult<CompanyApplicationListItem>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (status && status !== 'All') {
      params = params.set('status', status);
    }
    if (search && search.trim().length > 0) {
      params = params.set('search', search.trim());
    }
    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }

    return this.http.get<PagedResult<CompanyApplicationListItem>>(this.API_BASE, { params });
  }

  getApplicationById(id: string): Observable<CompanyApplicationDetail> {
    return this.http.get<CompanyApplicationDetail>(`${this.API_BASE}/${id}`);
  }

  getSummary(): Observable<CompanyApplicationSummary> {
    return this.http.get<CompanyApplicationSummary>(`${this.API_BASE}/summary`);
  }

  approveApplication(id: string): Observable<CompanyApplicationDetail> {
    return this.http.put<CompanyApplicationDetail>(`${this.API_BASE}/${id}/approve`, {});
  }

  rejectApplication(id: string, reason: string): Observable<CompanyApplicationDetail> {
    const body: RejectPayload = { reason };
    return this.http.put<CompanyApplicationDetail>(`${this.API_BASE}/${id}/reject`, body);
  }
}
