import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';

import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, IonContent, IonSpinner],
})
export class RegisterPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly title = inject(Title);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly registerForm = this.formBuilder.nonNullable.group({
    first_name: ['', [Validators.maxLength(150)]],
    last_name: ['', [Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email]],
    password1: ['', [Validators.required]],
    password2: ['', [Validators.required]],
  }, {
    validators: [RegisterPage.passwordsMatchValidator],
  });

  isSubmitting = false;
  errorMessage = '';

  constructor() {
    this.title.setTitle('Register');
  }

  async submit(): Promise<void> {
    if (this.registerForm.invalid || this.isSubmitting) {
      this.registerForm.markAllAsTouched();
      this.registerForm.updateValueAndValidity();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const result = await this.authService.register({
      ...this.registerForm.getRawValue(),
      first_name: this.registerForm.controls.first_name.value.trim(),
      last_name: this.registerForm.controls.last_name.value.trim(),
      email: this.registerForm.controls.email.value.trim(),
    });

    this.isSubmitting = false;

    if (result.ok) {
      await this.router.navigate(['/login'], {
        queryParams: {
          registered: 1,
          verification: 'sent',
        },
      });
      return;
    }

    this.errorMessage = result.message ?? 'Unable to complete the registration.';
  }

  private static passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password1 = control.get('password1')?.value ?? '';
    const password2 = control.get('password2')?.value ?? '';

    if (!password1 || !password2 || password1 === password2) {
      return null;
    }

    return {
      passwordMismatch: true,
    };
  }
}
