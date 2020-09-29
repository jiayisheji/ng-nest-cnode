import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Tokens } from './models/tokens';
import { Role, User } from './models/user';

@Injectable()
export class AuthService {
  readonly INITIAL_PATH = '/';
  readonly LOGIN_PATH = '/login';
  private readonly ACCESS_TOKEN = 'ACCESS_TOKEN';
  private readonly REFRESH_TOKEN = 'REFRESH_TOKEN';
  private readonly LOGGED_USER = 'LOGGED_USER';
  private readonly loggedUser$: BehaviorSubject<User> = new BehaviorSubject(null);

  constructor() {
    // 初始化获取用户信息
    let user: User = null;
    try {
      user = JSON.parse(localStorage.getItem(this.LOGGED_USER)) as User;
    } catch (_ignoreError) {}
    this.loggedUser$.next(user);
  }

  /**
   * 登录成功调用
   * @param user
   * @param token
   */
  doLoginUser(user: User, token: Tokens) {
    if (user) {
      this.storeUser(user);
    }
    if (token) {
      this.storeTokens(token);
    }
  }

  /**
   * 登出成功调用
   */
  doLogoutUser(): void {
    this.removeTokens();
    this.removeUser();
  }

  /**
   * 获取当前用户信息
   */
  getCurrentUser(): Observable<User> {
    return this.loggedUser$.asObservable();
  }

  /**
   * 获取当前用户角色
   */
  getUserRole(): Observable<Role[]> {
    return this.getCurrentUser().pipe(map((user) => user.roles));
  }

  /**
   * 是否通过身份认证
   */
  isAuthenticated(): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map((user) => user != null),
      catchError(() => of(false)),
    );
  }

  /**
   * 获取 jwt token
   */
  getJwtToken() {
    return localStorage.getItem(this.ACCESS_TOKEN);
  }

  /**
   * 获取 refresh token
   */
  getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN);
  }

  /**
   * 存储 用户基本信息
   */
  private storeUser(user: User) {
    // JSON.stringify 会出现错误 出错以后我们就不需要存入localStorage
    try {
      localStorage.setItem(this.LOGGED_USER, JSON.stringify(user));
      this.loggedUser$.next(user);
    } catch (_ignoreError) {}
  }

  /**
   * 存储 jwt token
   * @param tokens
   */
  private storeJwtToken(token: string) {
    localStorage.setItem(this.ACCESS_TOKEN, token);
  }

  /**
   * 存储 jwt 和 refresh token
   * @param tokens
   */
  private storeTokens(tokens: Tokens) {
    this.storeJwtToken(tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN, tokens.refreshToken);
  }

  /**
   * 删除用户信息
   */
  private removeUser() {
    this.loggedUser$.next(null);
    localStorage.removeItem(this.LOGGED_USER);
  }

  /**
   * 删除token信息
   */
  private removeTokens() {
    localStorage.removeItem(this.ACCESS_TOKEN);
    localStorage.removeItem(this.REFRESH_TOKEN);
  }
}
