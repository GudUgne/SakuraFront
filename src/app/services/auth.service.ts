import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  verification_status: boolean;
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
  private currentUser: User | null = null;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}login/`, { username, password }).pipe(
      tap(response => {
        if (response.access_token && response.refresh_token) {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);
          this.fetchAndStoreCurrentUser();
        }
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

  register(userData: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}register/`, userData).pipe(
      tap(response => {
        if (response.access_token && response.refresh_token) {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUser = null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token'); // Returns true if token exists
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
      })
    );
  }

  //when updating profile information
  updateUser(data: UserUpdateData): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}me/`, data).pipe(
      tap((updatedUser) => {
        this.currentUser = updatedUser;
      })
    );
  }

  refreshToken(): Observable<any> {
    const refresh_token = localStorage.getItem('refresh_token');
    return this.http.post<{ access: string }>(
      'http://127.0.0.1:8000/api/users/token/refresh/',
      { refresh: refresh_token }
    ).pipe(
      tap((response) => {
        localStorage.setItem('access_token', response.access);
      })
    );
  }

}
