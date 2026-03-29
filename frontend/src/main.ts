import { APP_INITIALIZER, inject } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, PreloadAllModules, provideRouter, withPreloading } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { JsonapiBootstrap } from 'ngx-jsonapi';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { authTokenInterceptor } from './app/shared/interceptors/auth-token.interceptor';
import { AuthService } from './app/shared/services/auth.service';
import { ExampleMessageService } from './app/shared/services/jsonapi-services/example-message.service';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideHttpClient(withInterceptors([authTokenInterceptor])),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        const authService = inject(AuthService);
        const exampleMessageService = inject(ExampleMessageService);

        return async () => {
          JsonapiBootstrap.bootstrap({
            user_config: { url: environment.apiUrl },
          });

          await authService.initialize();
          exampleMessageService.getService();
        };
      },
      multi: true,
    },
  ],
});
