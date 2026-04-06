import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { ExampleMessageCard, ExampleMessageService } from '../shared/services/jsonapi-services/example-message.service';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    NgFor,
    NgIf,
    DatePipe,
    RouterLink,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonTitle,
    IonToolbar,
  ],
})
export class HomePage implements OnInit {
  private readonly exampleMessageService = inject(ExampleMessageService);
  private readonly authService = inject(AuthService);

  protected readonly exampleMessages = signal<ExampleMessageCard[]>([]);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isAuthenticated = this.authService.isAuthenticated;

  public ngOnInit(): void {
    void this.loadExampleMessages();
  }

  private async loadExampleMessages(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      this.exampleMessages.set(await this.exampleMessageService.fetchPublishedMessages());
    } catch (error) {
      console.error(error);
      this.errorMessage.set('The sample JSON:API endpoint could not be loaded.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
