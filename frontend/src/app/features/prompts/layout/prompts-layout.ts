import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-prompts-layout',
  imports: [RouterOutlet, RouterLink],
  template: `<div class="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-3">
      @if (isLoggedIn) {
        <div
          class="flex items-center gap-2 bg-surface/90 backdrop-blur-md border border-border shadow-sm rounded-full p-1.5 pr-4 transition-all hover:shadow-md"
        >
          <div
            class="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 ring-2 ring-white"
          >
            <i class="pi pi-check text-xs"></i>
          </div>
          <span class="text-xs font-bold tracking-wider uppercase text-text-main hidden sm:block"
            >Authorized</span
          >

          <div class="h-4 w-px bg-border mx-1"></div>

          <button
            (click)="logout()"
            class="text-xs font-bold text-text-muted hover:text-red-600 transition-colors flex items-center gap-1.5"
            title="Log out of your account"
          >
            <i class="pi pi-sign-out text-[10px]"></i>
            <span class="hidden xs:block">Logout</span>
          </button>
        </div>
      } @else {
        <div
          class="flex items-center gap-2 bg-surface/90 backdrop-blur-md border border-border shadow-sm rounded-full p-1.5 transition-all hover:shadow-md"
        >
          <a
            routerLink="/auth/login"
            class="text-xs font-bold text-text-muted hover:text-primary px-3 transition-colors"
          >
            Log in
          </a>
          <a
            routerLink="/auth/register"
            class="text-xs font-bold bg-primary text-white px-4 py-1.5 rounded-full hover:bg-[#0047FF] transition-colors shadow-sm"
          >
            Sign up
          </a>
        </div>
      }
    </div>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <router-outlet></router-outlet>
    </div> `,
  styles: ``,
})
export class PromptsLayout {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth', 'login']);
  }
}
