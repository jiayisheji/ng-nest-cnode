import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthApi } from './api/auth.api';
import { AuthService } from './auth.service';
import { Tokens } from './models/tokens';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string>('');

  constructor(private authService: AuthService, private authApi: AuthApi) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // 为api接口添加token
    if (request.url.startsWith('/api')) {
      const token = this.authService.getJwtToken();
      if (token) {
        request = this.addToken(request, token);
      }
    }
    return next.handle(request).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        } else {
          return throwError(error);
        }
      }),
    );
  }

  private addToken(request: HttpRequest<unknown>, token: string) {
    return request.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next('');

      return this.authApi.refreshToken().pipe(
        switchMap((token: Tokens) => {
          const accessToken = token.accessToken;
          this.isRefreshing = false;
          this.refreshTokenSubject.next(accessToken);
          this.authService.doLoginUser(null, token);
          return next.handle(this.addToken(request, accessToken));
        }),
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== ''),
        take(1),
        switchMap((jwt) => {
          return next.handle(this.addToken(request, jwt));
        }),
      );
    }
  }
}
