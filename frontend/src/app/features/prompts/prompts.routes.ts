import { Routes } from '@angular/router';
import { unsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';
import { authGuard } from '../../core/guards/auth.guard';

export const PROMPTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/prompts-layout').then((c) => c.PromptsLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/prompt-list/prompt-list').then((c) => c.PromptList),
        title: 'Prompt Nexus | Explore',
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./pages/prompt-create/prompt-create').then((c) => c.PromptCreate),
        title: 'Prompt Nexus | New Prompt',
        canActivate: [authGuard],
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/prompt-detail/prompt-detail').then((c) => c.PromptDetail),
        title: 'Prompt Nexus | Details',
      },
    ],
  },
];
