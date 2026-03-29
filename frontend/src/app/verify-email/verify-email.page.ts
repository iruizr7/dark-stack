import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';

import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.page.html',
  styleUrls: ['./verify-email.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonContent, IonSpinner],
})
export class VerifyEmailPage implements OnInit {
  private readonly title = inject(Title);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  readonly key = this.route.snapshot.paramMap.get('key') ?? '';

  isSubmitting = true;
  successMessage = '';
  errorMessage = '';

  constructor() {
    this.title.setTitle('Verify E-mail');
  }

  ngOnInit(): void {
    void this.verifyEmail();
  }

  private async verifyEmail(): Promise<void> {
    if (!this.key) {
      this.isSubmitting = false;
      this.errorMessage = 'This verification link is not valid.';
      return;
    }

    const result = await this.authService.confirmEmailVerification(this.key);

    this.isSubmitting = false;

    if (result.ok) {
      this.successMessage = 'Your e-mail address has been verified. You can now sign in.';
      return;
    }

    this.errorMessage = result.message ?? 'Unable to verify the e-mail address.';
  }
}
