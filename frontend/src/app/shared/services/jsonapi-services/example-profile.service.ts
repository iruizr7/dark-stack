import { Injectable } from '@angular/core';
import { Resource, Service } from 'ngx-jsonapi';
import { lastValueFrom } from 'rxjs';

export class ExampleProfile extends Resource {
  public override attributes = {
    email: '',
    first_name: '',
    last_name: '',
    profile_photo: null as string | File | null,
  };

  public override relationships = {};
}

@Injectable({
  providedIn: 'root',
})
export class ExampleProfileService extends Service<ExampleProfile> {
  public override resource = ExampleProfile;
  public override type = 'User';
  public override path = '/api/profiles';

  public async fetchCurrentProfile(): Promise<ExampleProfile> {
    const collection = await lastValueFrom(this.all({
      page: {
        number: 1,
        size: 1,
      },
    }));

    const profile = collection.data[0];
    if (!profile) {
      throw new Error('No authenticated profile found.');
    }

    return profile;
  }

  public async saveProfile(profile: ExampleProfile): Promise<ExampleProfile> {
    await lastValueFrom(profile.save({ saveTransport: 'multipart' }));
    return profile;
  }
}
