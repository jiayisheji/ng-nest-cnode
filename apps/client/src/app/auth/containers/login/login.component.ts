import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthApi } from '../../api/auth.api';
import { AuthService } from '../../auth.service';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  validateForm!: FormGroup;
  private redirectUrl!: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private authApi: AuthApi,
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.redirectUrl = this.route.snapshot.queryParamMap.get('redirectUrl') || this.authService.INITIAL_PATH;
  }

  onSubmitForm() {
    const { controls, value } = this.validateForm;

    Object.keys(controls).forEach((key) => {
      controls[key].markAsDirty();
      controls[key].updateValueAndValidity();
    });

    this.authService.doLoginUser(
      {
        id: '1',
        username: 'jiayi',
        avatar: '',
        roles: ['user'],
      },
      null!,
    );
    this.authApi.login(value).subscribe((data: any) => {
      this.authService.doLoginUser(data.user, data.tokens);
      this.router.navigateByUrl(this.redirectUrl);
    });
  }

  private createForm(): void {
    this.validateForm = this.fb.group({
      username: [null, [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
      password: [null, [Validators.required, Validators.minLength(6), Validators.maxLength(18)]],
    });
  }
}
