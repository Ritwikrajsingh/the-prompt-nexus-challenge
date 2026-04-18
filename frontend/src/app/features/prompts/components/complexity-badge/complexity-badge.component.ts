import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-complexity-badge',
  imports: [CommonModule],
  templateUrl: './complexity-badge.component.html'
})
export class ComplexityBadgeComponent {
  @Input() complexity!: number;

  get colorClass(): string {
    if (this.complexity <= 3) return 'bg-[var(--color-badge-bg-low)] text-[var(--color-badge-text-low)]';
    if (this.complexity <= 7) return 'bg-[var(--color-badge-bg-med)] text-[var(--color-badge-text-med)]';
    return 'bg-[var(--color-badge-bg-high)] text-[var(--color-badge-text-high)]';
  }
}
