import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { AuthStorageService } from '../services/auth-storage.service';

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const authStorage = inject(AuthStorageService);
  const token = authStorage.getToken();

  if (!token || !request.url.startsWith(environment.apiUrl)) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: {
      Authorization: `Token ${token}`,
    },
  }));
};
