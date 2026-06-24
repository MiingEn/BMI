import { inject }            from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService }       from './auth.service';

/**
 * Attaches the JWT bearer token to every outgoing HTTP request.
 * Reads the token through AuthService so the token-storage strategy
 * is encapsulated in one place.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();

  if (!token) {
    return next(req);
  }

  const authenticatedRequest = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  return next(authenticatedRequest);
};
