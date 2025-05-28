import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, Observable, throwError, switchMap, filter, take } from 'rxjs';
import { AuthService } from './services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getAccessToken();

    if (this.shouldSkipToken(request)) {
      return next.handle(request);
    }

    // Add token to request if available
    if (token) {
      request = this.addTokenToRequest(request, token);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 errors (unauthorized)
        if (error.status === 401 && !this.shouldSkipToken(request)) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private shouldSkipToken(request: HttpRequest<any>): boolean {
    const skipUrls = [
      '/api/token/',
      '/api/token/refresh/',
      '/api/users/login/',
      '/api/users/register/',
    ];

    const isExternalApi = request.url.startsWith('https://kanjiapi.dev/') ||
      request.url.startsWith('https://jotoba.de/');

    return skipUrls.some(url => request.url.endsWith(url)) || isExternalApi;
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('401 error encountered, attempting token refresh');

    return this.authService.refreshToken().pipe(
      switchMap(() => {
        console.log('Token refreshed successfully, retrying request');
        // Retry the original request with the new token
        const newToken = this.authService.getAccessToken();
        if (newToken) {
          const retryRequest = this.addTokenToRequest(request, newToken);
          return next.handle(retryRequest);
        } else {
          throw new Error('No access token after refresh');
        }
      }),
      catchError((refreshError) => {
        console.error('Token refresh failed:', refreshError);

        // If refresh fails, logout and redirect
        this.authService.logout();

        return throwError(() => refreshError);
      })
    );
  }
}
