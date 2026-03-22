import { APP_INITIALIZER, inject } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, PreloadAllModules, provideRouter, withPreloading } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { JsonapiBootstrap } from 'ngx-jsonapi';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { ExampleMessageService } from './app/shared/services/jsonapi-services/example-message.service';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideHttpClient(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        const exampleMessageService = inject(ExampleMessageService);

        return async () => {
          JsonapiBootstrap.bootstrap({
            user_config: { url: environment.apiUrl },
          });

          exampleMessageService.getService();
        };
      },
      multi: true,
    },
  ],
});
