import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';

import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, IonContent, IonSpinner],
})
export class LoginPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly authService = inject(AuthService);

  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  isSubmitting = false;
  isResendingVerification = false;
  errorMessage = '';
  infoMessage = '';
  showResendVerification = false;
  returnUrl = '/home';

  ngOnInit(): void {
    this.title.setTitle('Login');

    if (this.authService.isAuthenticated()) {
      void this.router.navigateByUrl('/home', { replaceUrl: true });
      return;
    }

    const queryParams = this.route.snapshot.queryParamMap;
    const returnUrl = queryParams.get('returnUrl');

    if (returnUrl) {
      this.returnUrl = returnUrl;
    }

    if (queryParams.get('reset') === 'success') {
      this.infoMessage = 'Your password has been updated. You can now sign in.';
    } else if (queryParams.has('registered')) {
      const verification = queryParams.get('verification');

      if (verification === 'sent') {
        this.infoMessage = 'Your account was created. Check your e-mail to verify it.';
      } else if (verification === 'error') {
        this.infoMessage = 'Your account was created, but the verification e-mail could not be sent.';
      } else {
        this.infoMessage = 'Your account was created successfully. You can sign in now.';
      }
    }
  }

  async submit(): Promise<void> {
    if (this.loginForm.invalid || this.isSubmitting) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.infoMessage = '';
    this.showResendVerification = false;

    const { email, password } = this.loginForm.getRawValue();
    const result = await this.authService.login(email.trim(), password);

    this.isSubmitting = false;

    if (result.ok) {
      await this.router.navigateByUrl(this.returnUrl, { replaceUrl: true });
      return;
    }

    this.errorMessage = result.message ?? 'Unable to sign in.';
    this.showResendVerification = Boolean(result.requiresEmailVerification);
  }

  async resendVerificationEmail(): Promise<void> {
    const email = this.loginForm.controls.email.value.trim();

    if (!email || this.loginForm.controls.email.invalid || this.isResendingVerification) {
      this.loginForm.controls.email.markAsTouched();
      return;
    }

    this.isResendingVerification = true;

    const result = await this.authService.resendVerificationEmail(email);

    this.isResendingVerification = false;

    if (result.ok) {
      this.errorMessage = '';
      this.infoMessage = 'A new verification e-mail has been sent.';
      this.showResendVerification = false;
      return;
    }

    this.errorMessage = result.message ?? 'Unable to resend the verification e-mail.';
  }
}
