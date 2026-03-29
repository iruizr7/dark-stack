import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthStorageService } from './auth-storage.service';

interface LoginResponse {
  key: string;
}

interface DetailResponse {
  detail?: string;
}

export interface AuthUser {
  pk: number;
  email: string;
  first_name: string;
  last_name: string;
  profile_photo: string | null;
}

export interface LoginResult {
  ok: boolean;
  message?: string;
  requiresEmailVerification?: boolean;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password1: string;
  password2: string;
}

export interface PasswordResetConfirmPayload {
  uid: string;
  token: string;
  new_password1: string;
  new_password2: string;
}

export interface ActionResult {
  ok: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authStorage = inject(AuthStorageService);

  readonly initialized = signal(false);
  readonly currentUser = signal<AuthUser | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null && this.token !== null);

  get token(): string | null {
    return this.authStorage.getToken();
  }

  async initialize(): Promise<void> {
    await this.authStorage.initialize();
    const token = this.token;

    if (!token) {
      this.initialized.set(true);
      return;
    }

    try {
      await this.refreshCurrentUser();
    } catch {
      await this.clearSession();
    } finally {
      this.initialized.set(true);
    }
  }

  async login(email: string, password: string): Promise<LoginResult> {
    try {
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(this.buildApiUrl('/api/auth/login/'), { email, password }),
      );

      await this.authStorage.setToken(response.key);
      await this.refreshCurrentUser();

      return { ok: true };
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        const message = this.extractErrorMessage(error) ?? 'Unable to sign in with these credentials.';
        return {
          ok: false,
          message,
          requiresEmailVerification: this.isVerificationError(message),
        };
      }

      throw error;
    }
  }

  async register(payload: RegisterPayload): Promise<ActionResult> {
    try {
      const response = await firstValueFrom(
        this.http.post<DetailResponse>(this.buildApiUrl('/api/auth/reg/'), payload),
      );

      return {
        ok: true,
        message: response.detail ?? 'Verification e-mail sent.',
      };
    } catch (error) {
      return this.handleActionError(error, 'Unable to complete the registration.');
    }
  }

  async resendVerificationEmail(email: string): Promise<ActionResult> {
    try {
      await firstValueFrom(
        this.http.post(this.buildApiUrl('/api/auth/reg/resend-email/'), { email }),
      );

      return { ok: true };
    } catch (error) {
      return this.handleActionError(error, 'Unable to resend the verification e-mail.');
    }
  }

  async requestPasswordReset(email: string): Promise<ActionResult> {
    try {
      const response = await firstValueFrom(
        this.http.post<DetailResponse>(this.buildApiUrl('/api/auth/password/reset/'), { email }),
      );

      return {
        ok: true,
        message: response.detail ?? 'Password reset e-mail has been sent.',
      };
    } catch (error) {
      return this.handleActionError(error, 'Unable to request a password reset.');
    }
  }

  async confirmPasswordReset(payload: PasswordResetConfirmPayload): Promise<ActionResult> {
    try {
      await firstValueFrom(
        this.http.post(this.buildApiUrl('/api/auth/password/reset/confirm/'), payload),
      );

      return { ok: true };
    } catch (error) {
      return this.handleActionError(error, 'Unable to update the password.');
    }
  }

  async confirmEmailVerification(key: string): Promise<ActionResult> {
    try {
      await firstValueFrom(
        this.http.post(this.buildApiUrl('/api/auth/reg/verify-email/'), { key }),
      );

      return { ok: true };
    } catch (error) {
      return this.handleActionError(error, 'Unable to verify the e-mail address.');
    }
  }

  async refreshCurrentUser(): Promise<AuthUser> {
    const user = await firstValueFrom(
      this.http.get<AuthUser>(this.buildApiUrl('/api/auth/user/')),
    );

    this.currentUser.set(user);
    return user;
  }

  logout(): void {
    void this.clearSession();
  }

  private async clearSession(): Promise<void> {
    this.currentUser.set(null);
    await this.authStorage.clearToken();
  }

  private buildApiUrl(path: string): string {
    return `${environment.apiUrl}${path}`;
  }

  private handleActionError(error: unknown, fallbackMessage: string): ActionResult {
    if (error instanceof HttpErrorResponse) {
      return {
        ok: false,
        message: this.extractErrorMessage(error) ?? fallbackMessage,
      };
    }

    return {
      ok: false,
      message: fallbackMessage,
    };
  }

  private extractErrorMessage(error: HttpErrorResponse): string | null {
    const payload = error.error;

    if (typeof payload === 'string' && payload.trim()) {
      return payload;
    }

    if (Array.isArray(payload)) {
      const messages: string[] = [];

      for (const entry of payload) {
        if (typeof entry === 'string' && entry.trim()) {
          messages.push(entry);
          continue;
        }

        if (entry && typeof entry === 'object' && typeof (entry as { detail?: unknown }).detail === 'string') {
          messages.push((entry as { detail: string }).detail);
        }
      }

      return messages.length > 0 ? messages.join('\n') : null;
    }

    if (!payload || typeof payload !== 'object') {
      return null;
    }

    if (typeof (payload as { detail?: unknown }).detail === 'string') {
      return (payload as { detail: string }).detail;
    }

    const messages: string[] = [];

    for (const value of Object.values(payload as Record<string, unknown>)) {
      if (typeof value === 'string' && value.trim()) {
        messages.push(value);
        continue;
      }

      if (!Array.isArray(value)) {
        continue;
      }

      for (const entry of value) {
        if (typeof entry === 'string' && entry.trim().length > 0) {
          messages.push(entry);
        }
      }
    }

    return messages.length > 0 ? messages.join('\n') : null;
  }

  private isVerificationError(message: string): boolean {
    const normalizedMessage = message.toLowerCase();
    return normalizedMessage.includes('verify') || normalizedMessage.includes('verified');
  }
}
