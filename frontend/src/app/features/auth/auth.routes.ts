import { Routes } from '@angular/router';
import { unsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/auth-layout').then((c) => c.AuthLayout),
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then((c) => c.Login),
        title: 'Prompt Nexus | Welcome Back',
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/register/register').then((c) => c.Register),
        title: 'Prompt Nexus | Get Started',
      },
    ],
  },
];
