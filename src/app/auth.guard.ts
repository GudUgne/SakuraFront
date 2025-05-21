import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService} from './services/auth.service';
import {map} from 'rxjs/operators';
import {catchError, Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/join']);
      return false;
    }

    // If route requires teacher role, check if user is a teacher
    const teacherOnly = route.data['teacherOnly'];
    if (teacherOnly) {
      return this.authService.getCurrentUser().pipe(
        map(user => {
          if (user && user.is_teacher) {
            return true; // Allow access if user is a teacher
          } else {
            this.router.navigate(['/app/home']); // Redirect to home page
            return false; // Deny access
          }
        }),
        catchError(() => {
          this.router.navigate(['/app/home']);
          return of(false);
        })
      );
    }

    // If no teacher check is needed, allow access
    return true;
  }
}
