import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-background">
      <div
        class="w-full max-w-250 flex flex-col md:flex-row bg-surface rounded-2xl shadow-xl border border-border overflow-hidden"
      >
        <div
          class="hidden md:flex flex-col justify-start w-1/2 p-12 bg-linear-to-br from-[#F4F7F9] to-[#E2E8F0] relative overflow-hidden"
        >
          <div class="z-10">
            <h1 class="text-4xl font-extrabold tracking-tight text-text-main mb-3 mt-10">
              Prompt <span class="text-primary">Nexus</span>
            </h1>
            <p class="text-sm text-text-muted max-w-sm leading-relaxed">
              Discover, manage, and scale your AI generation prompts.
            </p>
          </div>
        </div>

        <div class="w-full md:w-1/2 p-8 sm:p-12 lg:p-14 bg-surface">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class AuthLayout {}
