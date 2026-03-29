import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthStorageService {
  private readonly tokenStorageKey = 'dark-stack.auth.token';

  async initialize(): Promise<void> {
    return Promise.resolve();
  }

  getToken(): string | null {
    return globalThis.localStorage?.getItem(this.tokenStorageKey) ?? null;
  }

  async setToken(token: string): Promise<void> {
    globalThis.localStorage?.setItem(this.tokenStorageKey, token);
  }

  async clearToken(): Promise<void> {
    globalThis.localStorage?.removeItem(this.tokenStorageKey);
  }
}
