import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, UserInfo } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly API_URL = `${environment.apiUrl}/api/auth`;
  private readonly TOKEN_KEY = 'buildora_admin_token';
  private readonly USER_KEY = 'buildora_admin_user';

  private readonly _token = signal<string | null>(this.getStoredToken());
  private readonly _currentUser = signal<UserInfo | null>(this.getStoredUser());

  readonly token = computed(() => this._token());
  readonly currentUser = computed(() => this._currentUser());
  readonly isAuthenticated = computed(() => {
    const t = this._token();
    if (!t) return false;
    if (this.isTokenExpired(t)) {
      this.clearSession();
      return false;
    }
    return true;
  });

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(res => {
        this.setSession(res.accessToken, res.user);
      })
    );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    const t = this._token();
    if (t && this.isTokenExpired(t)) {
      this.clearSession();
      return null;
    }
    return t;
  }

  isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) return false;
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch {
      return false;
    }
  }

  private setSession(token: string, user: UserInfo): void {
    this._token.set(token);
    this._currentUser.set(user);
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch {
      sessionStorage.setItem(this.TOKEN_KEY, token);
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  private clearSession(): void {
    this._token.set(null);
    this._currentUser.set(null);
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch {}
    try {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.USER_KEY);
    } catch {}
  }

  private getStoredToken(): string | null {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
      if (token && this.isTokenExpired(token)) {
        this.clearSession();
        return null;
      }
      return token;
    } catch {
      return null;
    }
  }

  private getStoredUser(): UserInfo | null {
    try {
      const data = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
}
