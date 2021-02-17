import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth.service';
import { User } from '../../models/user';

@Component({
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit {
  user$: Observable<User>;

  constructor(private router: Router, private authService: AuthService) {
    this.user$ = this.authService.getCurrentUser();
  }

  ngOnInit(): void {}

  logout() {
    this.authService.doLogoutUser();
    this.router.navigate([this.authService.LOGIN_PATH]);
  }
}
