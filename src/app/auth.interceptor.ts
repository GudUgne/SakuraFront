import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {AuthService} from './services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('access_token');

    // Skip adding token to login and register requests
    if (
      request.url.endsWith('/login/') ||
      request.url.endsWith('/register/')||
      request.url.endsWith('/token/refresh/') ||
      request.url.startsWith('https://kanjiapi.dev/')
    ) {
      return next.handle(request); // don't modify this request
    }

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(request).pipe(
      catchError((error) => {
        if (error.status === 401 && !request.url.endsWith('/token/refresh/')) {
          // Token likely expired — try to refresh
          return this.authService.refreshToken().pipe(
            switchMap(() => {
              const newToken = localStorage.getItem('access_token');
              const retryReq = request.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                },
              });
              return next.handle(retryReq);
            }),
            catchError((refreshErr) => {
              console.error('Refresh failed:', refreshErr);
              this.authService.logout();
              return throwError(() => refreshErr);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }
}
