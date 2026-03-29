import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';

import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, IonContent, IonSpinner],
})
export class ResetPasswordPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly title = inject(Title);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly resetPasswordForm = this.formBuilder.nonNullable.group({
    new_password1: ['', [Validators.required]],
    new_password2: ['', [Validators.required]],
  });

  readonly uid = this.route.snapshot.paramMap.get('uid') ?? '';
  readonly token = this.route.snapshot.paramMap.get('token') ?? '';

  isSubmitting = false;
  errorMessage = '';

  constructor() {
    this.title.setTitle('Choose New Password');
  }

  async submit(): Promise<void> {
    if (this.resetPasswordForm.invalid || this.isSubmitting) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const result = await this.authService.confirmPasswordReset({
      ...this.resetPasswordForm.getRawValue(),
      uid: this.uid,
      token: this.token,
    });

    this.isSubmitting = false;

    if (result.ok) {
      await this.router.navigate(['/login'], {
        queryParams: {
          reset: 'success',
        },
      });
      return;
    }

    this.errorMessage = result.message ?? 'Unable to update the password.';
  }
}
