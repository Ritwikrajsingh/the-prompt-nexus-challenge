import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'prompts',
    pathMatch: 'full',
  },
  {
    path: 'prompts',
    loadChildren: () => import('./features/prompts/prompts.routes').then((r) => r.PROMPTS_ROUTES),
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((r) => r.AUTH_ROUTES),
  },
];
