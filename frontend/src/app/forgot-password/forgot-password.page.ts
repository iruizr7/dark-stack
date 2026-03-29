import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';

import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, IonContent, IonSpinner],
})
export class ForgotPasswordPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly title = inject(Title);
  private readonly authService = inject(AuthService);

  readonly forgotPasswordForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor() {
    this.title.setTitle('Forgot Password');
  }

  async submit(): Promise<void> {
    if (this.forgotPasswordForm.invalid || this.isSubmitting) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const result = await this.authService.requestPasswordReset(
      this.forgotPasswordForm.controls.email.value.trim(),
    );

    this.isSubmitting = false;

    if (result.ok) {
      this.successMessage = 'If the e-mail exists, a password reset link has been sent.';
      return;
    }

    this.errorMessage = result.message ?? 'Unable to request a password reset.';
  }
}
