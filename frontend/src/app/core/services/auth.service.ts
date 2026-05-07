import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthRequest, AuthResponse, RegisterRequest, User, Role } from '../models/user.model';

const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'current_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiBase = 'http://localhost:8080/api';

  private _currentUser = signal<User | null>(this.loadStoredUser());
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly role = computed(() => this._currentUser()?.role ?? null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'ADMIN');
  readonly isRecruiter = computed(() => this._currentUser()?.role === 'RECRUITER');
  readonly isCandidate = computed(() => this._currentUser()?.role === 'CANDIDATE');

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: AuthRequest) {
    return this.http.post<AuthResponse>(`${this.apiBase}/auth/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem(TOKEN_KEY, res.token);
        const user = this.mapResponseToUser(res);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this._currentUser.set(user);
      })
    );
  }

  register(req: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.apiBase}/auth/register`, req).pipe(
      tap(res => {
        localStorage.setItem(TOKEN_KEY, res.token);
        const user = this.mapResponseToUser(res);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this._currentUser.set(user);
      })
    );
  }

  getMe() {
    return this.http.get<{ id: number; email: string; firstName: string; lastName: string; department?: string; jobTitle?: string; roles: string[]; enabled: boolean; createdAt: string }>(`${this.apiBase}/users/me`);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private mapResponseToUser(res: AuthResponse): User {
    // Backend returns 'ROLE_ADMIN', strip prefix to get 'ADMIN'
    const rawRole = res.roles?.[0] ?? 'ROLE_CANDIDATE';
    const role = rawRole.replace('ROLE_', '') as Role;
    return {
      id: res.userId,
      email: res.email,
      firstName: res.firstName,
      lastName: res.lastName,
      role,
      enabled: true,
      createdAt: new Date().toISOString()
    };
  }

  private loadStoredUser(): User | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    // Check token expiry
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        return null;
      }
    } catch {
      return null;
    }
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  }
}
