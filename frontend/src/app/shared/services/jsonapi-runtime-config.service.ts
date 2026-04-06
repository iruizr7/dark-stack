import { Injectable } from '@angular/core';
import { JsonapiConfig } from 'ngx-jsonapi';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class JsonapiRuntimeConfigService {
  private configPromise: Promise<JsonapiConfig> | null = null;

  public resolveConfig(): Promise<JsonapiConfig> {
    if (!this.configPromise) {
      this.configPromise = this.buildConfig();
    }

    return this.configPromise;
  }

  private async buildConfig(): Promise<JsonapiConfig> {
    const config = new JsonapiConfig();
    config.url = environment.apiUrl;

    return config;
  }
}
