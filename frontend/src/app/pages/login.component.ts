import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';

const ROLE_ADMIN = 'ROLE_ADMIN';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="card">
      <h2>Login or Register</h2>

      <form [formGroup]="form" (ngSubmit)="login()">

        <label>
          Username

          <input
            type="text"
            formControlName="username"
          />

          <div
            class="field-error"
            *ngIf="
              form.controls.username.touched &&
              form.controls.username.invalid
            "
          >
            <span
              *ngIf="form.controls.username.errors?.['required']"
            >
              Username is required.
            </span>

            <span
              *ngIf="form.controls.username.errors?.['minlength']"
            >
              Username must contain at least 3 characters.
            </span>

            <span
              *ngIf="form.controls.username.errors?.['maxlength']"
            >
              Username cannot exceed 40 characters.
            </span>
          </div>
        </label>

        <label>
          Password

          <input
            type="password"
            formControlName="password"
          />

          <div
            class="field-error"
            *ngIf="
              form.controls.password.touched &&
              form.controls.password.invalid
            "
          >
            <span
              *ngIf="form.controls.password.errors?.['required']"
            >
              Password is required.
            </span>

            <span
              *ngIf="form.controls.password.errors?.['minlength']"
            >
              Password must contain at least 6 characters.
            </span>

            <span
              *ngIf="form.controls.password.errors?.['maxlength']"
            >
              Password cannot exceed 72 characters.
            </span>
          </div>
        </label>

        <div class="btn-row">
          <button type="submit">
            Login
          </button>

          <button
            type="button"
            class="secondary"
            (click)="register()"
          >
            Register
          </button>
        </div>
      </form>

      <p
        class="error"
        *ngIf="errorMessage"
      >
        {{ errorMessage }}
      </p>

      <p class="hint">
        Default admin: admin / admin123
      </p>
    </section>

    <section class="card info-card">
      <h3>About This App</h3>

      <p>
        <strong>Frontend:</strong>
        Angular + TypeScript
      </p>

      <p>
        <strong>Backend:</strong>
        Spring Boot + Java
      </p>

      <p>
        <strong>Database:</strong>
        SQLite
      </p>

      <p>
        <strong>Features:</strong>
        BMI tracking, history, analytics, admin controls
      </p>
    </section>
  `,
  styles: [
    `
      .card {
        background: #fff;
        border-radius: 12px;
        padding: 1.2rem;
        box-shadow: 0 8px 24px rgba(0, 0, 0, .08);
        max-width: 420px;
        margin: 2rem auto;
      }

      label {
        display: block;
        margin-top: .75rem;
        font-weight: 600;
      }

      input {
        width: 100%;
        padding: .55rem;
        margin-top: .3rem;
        border: 1px solid #c9d4e2;
        border-radius: 8px;
        box-sizing: border-box;
      }

      input.ng-invalid.ng-touched {
        border-color: #b11131;
      }

      .field-error {
        color: #b11131;
        font-size: .82rem;
        margin-top: .25rem;
      }

      .field-error span {
        display: block;
      }

      .btn-row {
        display: flex;
        gap: .6rem;
        margin-top: 1rem;
      }

      button {
        border: none;
        border-radius: 8px;
        padding: .6rem 1rem;
        background: #0f67c4;
        color: #fff;
        cursor: pointer;
      }

      button.secondary {
        background: #6d7f96;
      }

      .error {
        color: #b11131;
        margin-top: .8rem;
      }

      .hint {
        color: #47627f;
        margin-top: .8rem;
        font-size: .9rem;
      }

      .info-card h3 {
        margin-top: 0;
      }

      .info-card p {
        margin: .45rem 0;
      }
    `
  ]
})
export class LoginComponent {

  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  errorMessage = '';

  form = this.fb.group({
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(40)
      ]
    ],

    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(72)
      ]
    ]
  });

  login(): void {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, password } = this.form.getRawValue();

    this.api.login(username!, password!).subscribe({
      next: (res) => {
        this.auth.setSession(res);
        this.redirectByRole(res.role);
      },

      error: (err) => {
        this.errorMessage =
          err?.error?.message ?? 'Login failed';
      }
    });
  }

  register(): void {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, password } = this.form.getRawValue();

    this.api.register(username!, password!).subscribe({
      next: (res) => {
        this.auth.setSession(res);
        this.redirectByRole(res.role);
      },

      error: (err) => {
        this.errorMessage =
          err?.error?.message ?? 'Registration failed';
      }
    });
  }

  private redirectByRole(role: string): void {
    this.router.navigate([
      role === ROLE_ADMIN ? '/admin' : '/user'
    ]);
  }
}