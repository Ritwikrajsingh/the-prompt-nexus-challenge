import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Tag } from '../../../../core/models/prompt.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tag',
  template: `
    <a
      [routerLink]="['/prompts']"
      [queryParams]="{ tag }"
      class="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-600"
      [ngClass]="[bgClass, roundedClass]"
    >
      #{{ tag }}
    </a>
  `,
  imports: [CommonModule, RouterLink],
})
export class TagComponent {
  @Input() tag!: Tag;
  @Input() bg: string | null = null;
  @Input() roundedFull: boolean = false;

  get bgClass(): string {
    return this.bg || 'bg-gray-100';
  }

  get roundedClass(): string {
    return this.roundedFull ? 'rounded-full px-3' : 'rounded';
  }
}
