import { APP_INITIALIZER, Injector, inject } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, PreloadAllModules, provideRouter, withPreloading } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { JsonapiCore, provideNgxJsonapiStandalone } from 'ngx-jsonapi';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { authTokenInterceptor } from './app/shared/interceptors/auth-token.interceptor';
import { AuthService } from './app/shared/services/auth.service';
import { ExampleMessageService } from './app/shared/services/jsonapi-services/example-message.service';
import { JsonapiRuntimeConfigService } from './app/shared/services/jsonapi-runtime-config.service';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideHttpClient(withInterceptors([authTokenInterceptor])),
    provideNgxJsonapiStandalone(() => inject(JsonapiRuntimeConfigService).resolveConfig()),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        const authService = inject(AuthService);
        const exampleMessageService = inject(ExampleMessageService);
        const injector = inject(Injector);
        const jsonapiRuntimeConfigService = inject(JsonapiRuntimeConfigService);

        return async () => {
          await jsonapiRuntimeConfigService.resolveConfig();
          injector.get(JsonapiCore);
          await authService.initialize();
          exampleMessageService.getService();
        };
      },
      multi: true,
    },
  ],
});
