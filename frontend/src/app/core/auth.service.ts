import { Injectable } from '@angular/core';

interface SessionPayload {
  token:    string;
  username: string;
  role:     string;
}

/**
 * Single source of truth for session state.
 * All token reads/writes go through this service —
 * no other file touches localStorage directly.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly TOKEN_KEY    = 'bmi-token';
  private readonly USERNAME_KEY = 'bmi-username';
  private readonly ROLE_KEY     = 'bmi-role';

  setSession(payload: SessionPayload): void {
    localStorage.setItem(this.TOKEN_KEY,    payload.token);
    localStorage.setItem(this.USERNAME_KEY, payload.username);
    localStorage.setItem(this.ROLE_KEY,     payload.role);
  }

  getToken(): string    { return localStorage.getItem(this.TOKEN_KEY)    ?? ''; }
  getRole(): string     { return localStorage.getItem(this.ROLE_KEY)     ?? ''; }
  getUsername(): string { return localStorage.getItem(this.USERNAME_KEY) ?? ''; }

  isLoggedIn(): boolean { return this.getToken().length > 0; }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
    localStorage.removeItem(this.ROLE_KEY);
  }
}
