import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { LoginDto, RegisterDto } from '../models/auth.dto';
import { Tokens } from '../models/tokens';

@Injectable({
  providedIn: 'root',
})
export class AuthApi {
  constructor(private http: HttpClient) {}

  login(body: LoginDto) {
    return this._crypto(body.password).pipe(
      switchMap((password: string) => {
        body.password = password;
        return this.http.post('/api/login', body);
      }),
    );
  }

  register(body: RegisterDto) {
    return this._crypto(body.password).pipe(
      switchMap((password: string) => {
        body.password = password;
        return this.http.post('/api/register', body);
      }),
    );
  }

  logout() {
    return this.http.post(`/logout`, {});
  }

  refreshToken() {
    return this.http.get<Tokens>(`/logout`);
  }

  /** 加密密码 */
  private _crypto(message: string): Observable<string> {
    // IE11 不支持 TextEncoder 可以考虑其他方式 stringToArrayBuffer
    // Polyfill see: https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder#Polyfill
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
    return from(crypto.subtle.digest('SHA-256', data)).pipe(
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array
      map((buffer) => new Uint8Array(buffer)),
      map((uint8) => String.fromCharCode.apply(null, (uint8 as unknown) as number[])),
      // https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa
      map((str) => btoa(str)),
    );
  }
}
