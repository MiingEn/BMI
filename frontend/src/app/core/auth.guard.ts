import { inject }                   from '@angular/core';
import { CanActivateFn, Router }    from '@angular/router';
import { AuthService }              from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const isAdminSession = auth.isLoggedIn() && auth.getRole() === 'ROLE_ADMIN';
  return isAdminSession ? true : router.createUrlTree(['/login']);
};
