import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';
import { LoginComponent } from './containers/login/login.component';
import { UserComponent } from './containers/user/user.component';
import { AccountGuard, AuthGuard, RoleGuard } from './guards';
import { AuthRoutingModule } from './auth-routing.module';

@NgModule({
  declarations: [LoginComponent, UserComponent],
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatButtonModule, MatIconModule, MatInputModule, AuthRoutingModule],
  providers: [
    AccountGuard,
    AuthGuard,
    RoleGuard,
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
})
export class AuthModule {}
