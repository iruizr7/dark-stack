import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { AuthService } from '../shared/services/auth.service';
import { ExampleProfile, ExampleProfileService } from '../shared/services/jsonapi-services/example-profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
})
export class ProfilePage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly exampleProfileService = inject(ExampleProfileService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  private currentProfile: ExampleProfile | null = null;

  protected readonly profileForm = this.formBuilder.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
  });

  protected currentPhotoUrl: string | null = null;
  protected isLoading = true;
  protected isSaving = false;
  protected errorMessage = '';
  protected successMessage = '';

  public ngOnInit(): void {
    void this.initializePage();
  }

  protected async onPhotoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] ?? null;

    if (!this.currentProfile || !file) {
      return;
    }

    this.currentProfile.attributes.profile_photo = file;
    this.currentPhotoUrl = URL.createObjectURL(file);
  }

  protected async submit(): Promise<void> {
    if (!this.currentProfile || this.profileForm.invalid || this.isSaving) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { firstName, lastName } = this.profileForm.getRawValue();
    this.currentProfile.attributes.first_name = firstName.trim();
    this.currentProfile.attributes.last_name = lastName.trim();

    try {
      await this.exampleProfileService.saveProfile(this.currentProfile);
      this.currentPhotoUrl = typeof this.currentProfile.attributes.profile_photo === 'string'
        ? this.currentProfile.attributes.profile_photo
        : this.currentPhotoUrl;
      this.successMessage = 'Profile updated successfully.';
    } catch (error) {
      console.error(error);
      this.errorMessage = 'The profile could not be saved.';
    } finally {
      this.isSaving = false;
    }
  }

  private async initializePage(): Promise<void> {
    if (!this.authService.isAuthenticated()) {
      await this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/profile' },
        replaceUrl: true,
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const profile = await this.exampleProfileService.fetchCurrentProfile();
      this.currentProfile = profile;
      this.currentPhotoUrl = typeof profile.attributes.profile_photo === 'string'
        ? profile.attributes.profile_photo
        : null;
      this.profileForm.setValue({
        firstName: profile.attributes.first_name,
        lastName: profile.attributes.last_name,
      });
    } catch (error) {
      console.error(error);
      this.errorMessage = 'The profile could not be loaded.';
    } finally {
      this.isLoading = false;
    }
  }
}
