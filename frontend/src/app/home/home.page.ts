import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
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

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    NgFor,
    NgIf,
    DatePipe,
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

  protected readonly exampleMessages = signal<ExampleMessageCard[]>([]);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isLoading = signal(true);

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
