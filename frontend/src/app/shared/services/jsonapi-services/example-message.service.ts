import { Injectable } from '@angular/core';
import { Resource, Service } from 'ngx-jsonapi';
import { lastValueFrom } from 'rxjs';

export interface ExampleMessageCard {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

export class ExampleMessage extends Resource {
  public override attributes = {
    title: '',
    body: '',
    created_at: '',
  };

  public override relationships = {};
}

@Injectable({
  providedIn: 'root',
})
export class ExampleMessageService extends Service<ExampleMessage> {
  public override resource = ExampleMessage;
  public override type = 'ExampleMessage';
  public override path = '/api/example-messages';

  public async fetchPublishedMessages(): Promise<ExampleMessageCard[]> {
    const response = await lastValueFrom(this.all());

    return response.data.map((message) => ({
      id: message.id,
      title: message.attributes.title,
      body: message.attributes.body,
      createdAt: message.attributes.created_at,
    }));
  }
}
