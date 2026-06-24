import { Routes } from '@angular/router';
import { LoginComponent }          from './pages/login.component';
import { UserDashboardComponent }  from './pages/user-dashboard.component';
import { AdminDashboardComponent } from './pages/admin-dashboard.component';
import { ProfileComponent }        from './pages/profile.component';
import { adminGuard, authGuard }   from './core/auth.guard';

export const routes: Routes = [
  { path: '',        pathMatch: 'full', redirectTo: 'login' },
  { path: 'login',   component: LoginComponent },
  { path: 'user',    component: UserDashboardComponent,  canActivate: [authGuard]  },
  { path: 'profile', component: ProfileComponent,        canActivate: [authGuard]  },
  { path: 'admin',   component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: '**',      redirectTo: 'login' }
];
