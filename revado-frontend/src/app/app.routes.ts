import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth';
import { Dashboard } from './components/dashboard/dashboard';
import { authGuard } from './auth-guard'; // Import your new guard
import { ResetPasswordComponent } from './components/reset-pass/reset-password/reset-password'; // 1. Import the component


export const routes: Routes = [
  { path: 'login', component: AuthComponent },
  { 
    path: 'reset-password', 
    component: ResetPasswordComponent 
  },
  { 
    path: 'dashboard', 
    component: Dashboard, 
    canActivate: [authGuard] 
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' } 
];