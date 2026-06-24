import { Component, OnInit, inject } from '@angular/core';
import { CommonModule }              from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ApiService, ProfileResponse } from '../core/api.service';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword     = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return newPassword === confirmPassword ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page">

      <!-- ── Profile info card ─────────────────────────────────────────── -->
      <article class="card" *ngIf="profile">
        <h2>My Profile</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Username</span>
            <span class="info-value">{{ profile.username }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Role</span>
            <span class="role-badge" [class.admin]="profile.role === 'ROLE_ADMIN'">
              {{ profile.role === 'ROLE_ADMIN' ? 'Admin' : 'User' }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">BMI Records</span>
            <span class="info-value highlight">{{ profile.totalRecords }}</span>
          </div>
        </div>
      </article>

      <!-- ── Change password card ──────────────────────────────────────── -->
      <article class="card">
        <h2>Change Password</h2>

        <form [formGroup]="passwordForm" (ngSubmit)="submitPasswordChange()">
          <label>Current Password
            <input type="password" formControlName="currentPassword"
                   placeholder="Enter current password" />
            <span class="field-error"
                  *ngIf="f['currentPassword'].touched && f['currentPassword'].errors?.['required']">
              Required
            </span>
          </label>

          <label>New Password
            <input type="password" formControlName="newPassword"
                   placeholder="At least 6 characters" />
            <span class="field-error"
                  *ngIf="f['newPassword'].touched && f['newPassword'].errors?.['minlength']">
              Minimum 6 characters
            </span>
          </label>

          <label>Confirm New Password
            <input type="password" formControlName="confirmPassword"
                   placeholder="Repeat new password" />
            <span class="field-error"
                  *ngIf="f['confirmPassword'].touched && passwordForm.errors?.['passwordsMismatch']">
              Passwords do not match
            </span>
          </label>

          <div class="btn-row">
            <button type="submit" class="primary" [disabled]="passwordForm.invalid || isSaving">
              {{ isSaving ? 'Saving…' : 'Update Password' }}
            </button>
          </div>
        </form>

        <p class="success-msg" *ngIf="successMessage">✅ {{ successMessage }}</p>
        <p class="error-msg"   *ngIf="errorMessage">❌ {{ errorMessage }}</p>
      </article>
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1rem; max-width: 520px; }

    .card {
      background: #fff; border-radius: 12px;
      padding: 1.25rem; box-shadow: 0 4px 20px rgba(0,0,0,.08);
    }
    h2 { margin: 0 0 1rem; font-size: 1.05rem; color: #1e3a5f; }

    /* Info grid */
    .info-grid  { display: flex; flex-direction: column; gap: .75rem; }
    .info-item  { display: flex; align-items: center; gap: 1rem; padding: .55rem .7rem;
                  background: #f5f8fc; border-radius: 8px; }
    .info-label { font-size: .8rem; color: #6b84a0; width: 110px; flex-shrink: 0; }
    .info-value { font-weight: 600; color: #1e3a5f; }
    .info-value.highlight { font-size: 1.2rem; color: #0f67c4; }
    .role-badge { padding: .2rem .7rem; border-radius: 20px; font-size: .8rem;
                  font-weight: 600; background: #d8e7fa; color: #0f67c4; }
    .role-badge.admin { background: #fef3c7; color: #92400e; }

    /* Form */
    label { display: block; margin-top: .75rem; font-size: .85rem; color: #4b6080; }
    input {
      display: block; width: 100%; padding: .45rem .6rem; margin-top: .25rem;
      border: 1px solid #c9d4e2; border-radius: 8px;
      box-sizing: border-box; font-size: .95rem; outline: none;
    }
    input:focus { border-color: #0f67c4; }

    .field-error { display: block; font-size: .75rem; color: #ef4444; margin-top: .2rem; }

    .btn-row { margin-top: .9rem; }
    button.primary {
      border: none; border-radius: 8px; padding: .55rem 1.2rem;
      background: #0f67c4; color: #fff; cursor: pointer; font-size: .9rem;
    }
    button:disabled { opacity: .6; cursor: not-allowed; }

    .success-msg { margin-top: .75rem; color: #059669; font-size: .9rem; }
    .error-msg   { margin-top: .75rem; color: #ef4444; font-size: .9rem; }
  `]
})
export class ProfileComponent implements OnInit {

  private readonly api = inject(ApiService);
  private readonly fb  = inject(FormBuilder);

  profile: ProfileResponse | null = null;
  isSaving      = false;
  successMessage = '';
  errorMessage   = '';

  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword:     ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatchValidator });

  get f() { return this.passwordForm.controls; }

  ngOnInit(): void {
    this.api.getProfile().subscribe(profile => { this.profile = profile; });
  }

  submitPasswordChange(): void {
    if (this.passwordForm.invalid) return;

    this.isSaving      = true;
    this.successMessage = '';
    this.errorMessage   = '';

    const { currentPassword, newPassword } = this.passwordForm.getRawValue();

    this.api.updatePassword(currentPassword!, newPassword!).subscribe({
      next: () => {
        this.isSaving       = false;
        this.successMessage  = 'Password updated successfully.';
        this.passwordForm.reset();
      },
      error: (err) => {
        this.isSaving     = false;
        this.errorMessage  = err?.error?.message ?? 'Failed to update password.';
      }
    });
  }
}
