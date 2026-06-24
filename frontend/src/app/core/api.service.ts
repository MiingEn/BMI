import { Injectable }             from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable }             from 'rxjs';

// ── Public DTOs ───────────────────────────────────────────────────────────────

export interface AuthResponse {
  token:    string;
  username: string;
  role:     string;
}

export interface BmiRecord {
  id:        number;
  username:  string;
  heightCm:  number;
  weightKg:  number;
  bmi:       number;
  createdAt: string;
}

export interface AppUser {
  id:       number;
  username: string;
  role:     string;
}

export interface ProfileResponse {
  username:     string;
  role:         string;
  totalRecords: number;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ApiService {

  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private readonly http: HttpClient) {}

  // Auth
  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, { username, password });
  }

  register(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, { username, password });
  }

  // Profile
  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.baseUrl}/profile`);
  }

  updatePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/profile/password`, { currentPassword, newPassword });
  }

  // BMI
  createBmiRecord(heightCm: number, weightKg: number): Observable<BmiRecord> {
    return this.http.post<BmiRecord>(`${this.baseUrl}/bmi`, { heightCm, weightKg });
  }

  getBmiHistory(from?: string, to?: string): Observable<BmiRecord[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to)   params = params.set('to',   to);
    return this.http.get<BmiRecord[]>(`${this.baseUrl}/bmi/history`, { params });
  }

  updateBmiRecord(recordId: number, heightCm: number, weightKg: number): Observable<BmiRecord> {
    return this.http.put<BmiRecord>(`${this.baseUrl}/bmi/${recordId}`, { heightCm, weightKg });
  }

  deleteBmiRecord(recordId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/bmi/${recordId}`);
  }

  // Admin
  getAllUsers(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(`${this.baseUrl}/admin/users`);
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/users/${userId}`);
  }

  getAllBmiRecords(): Observable<BmiRecord[]> {
    return this.http.get<BmiRecord[]>(`${this.baseUrl}/admin/bmi`);
  }
}
