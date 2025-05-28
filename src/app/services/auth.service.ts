import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {catchError, Observable, tap, throwError, BehaviorSubject, take, filter} from 'rxjs';
import {switchMap} from 'rxjs/operators';

interface AuthResponse {
  access: string;
  refresh: string;
  verification_status?: boolean;
}

interface RefreshResponse {
  access: string;
  refresh?: string; // only included if ROTATE_REFRESH_TOKENS is True
}

export interface User {
  id?: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_teacher: boolean;
  verification_status: boolean;
}

export interface UserUpdateData {
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  password?: string;
  current_password?: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  is_teacher: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api/users/';
  private tokenUrl = 'http://127.0.0.1:8000/api/token/';
  private currentUser: User | null = null;
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<RefreshResponse | null> = new BehaviorSubject<RefreshResponse | null>(null);

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.tokenUrl, { username, password }).pipe(
      tap(response => {
        if (response.access && response.refresh) {
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);
          this.fetchAndStoreCurrentUser();
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  private fetchAndStoreCurrentUser(): void {
    this.http.get<User>(`${this.apiUrl}me/`).subscribe({
      next: (user) => {
        console.log('Fetched user info after login:', user);
        this.currentUser = user;
        localStorage.setItem('user_id', user.id!.toString());
      },
      error: (error) => {
        console.error('Error fetching user info after login', error);
      }
    });
  }

  register(userData: RegisterData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}register/`, userData).pipe(
      tap(response => {

        if (response.access && response.refresh) {
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);
        }
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    this.currentUser = null;
    this.isRefreshing = false;
    this.refreshTokenSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getCurrentUser(): Observable<User> {
    if (this.currentUser) {
      return new Observable((observer) => {
        observer.next(this.currentUser!);
        observer.complete();
      });
    }

    return this.http.get<User>(`${this.apiUrl}me/`).pipe(
      tap((user) => {
        this.currentUser = user;
      }),
      catchError(error => {
        console.error('Error fetching current user:', error);
        if (error.status === 401) {
          this.logout();
        }
        return throwError(() => error);
      })
    );
  }

  updateUser(data: UserUpdateData): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}me/`, data).pipe(
      tap((updatedUser) => {
        this.currentUser = updatedUser;
      }),
      catchError(error => {
        console.error('Error updating user:', error);
        return throwError(() => error);
      })
    );
  }

  refreshToken(): Observable<RefreshResponse> {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      console.error('No refresh token available');
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    // If already refreshing, wait for the current refresh to complete
    if (this.isRefreshing) {
      return this.refreshTokenSubject.asObservable().pipe(
        filter(result => result !== null),
        take(1),
        switchMap(result => {
          if (result) {
            return new Observable<RefreshResponse>(observer => {
              observer.next(result);
              observer.complete();
            });
          } else {
            throw new Error('Token refresh failed');
          }
        }),
        catchError(error => {
          console.error('Error waiting for token refresh:', error);
          return throwError(() => error);
        })
      );
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    console.log('Attempting refresh with token:', refreshToken);

    return this.http.post<RefreshResponse>(
      `${this.tokenUrl}refresh/`,
      { refresh: refreshToken }
    ).pipe(
      tap((response) => {
        console.log('Refresh response:', response);

        // Store the new access token
        localStorage.setItem('access_token', response.access);

        // If a new refresh token is provided (when ROTATE_REFRESH_TOKENS is True), store it
        if (response.refresh) {
          localStorage.setItem('refresh_token', response.refresh);
        }

        this.isRefreshing = false;
        this.refreshTokenSubject.next(response);
      }),
      catchError((error) => {
        console.error('Refresh failed:', error);
        this.isRefreshing = false;
        this.refreshTokenSubject.next(null);

        // If refresh fails, logout
        this.logout();
        return throwError(() => error);
      })
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
}
