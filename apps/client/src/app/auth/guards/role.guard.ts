import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const { expectedRole } = route.data;
    return this.authService.isAuthenticated().pipe(
      switchMap((isLoggedIn) => {
        if (isLoggedIn && expectedRole) {
          return this.authService.getUserRole().pipe(map((roles) => roles.includes(expectedRole)));
        }
        return of(false);
      }),
    );
  }
}
