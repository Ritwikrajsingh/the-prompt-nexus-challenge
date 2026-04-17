import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Prompt } from '../../../../core/models/prompt.model';
import { TagComponent } from '../tag/tag.component';
import { ComplexityBadgeComponent } from '../complexity-badge/complexity-badge.component';

@Component({
  selector: 'app-prompt-card',
  imports: [CommonModule, RouterLink, TagComponent, ComplexityBadgeComponent],
  templateUrl: './prompt-card.component.html',
})
export class PromptCardComponent {
  @Input() prompt!: Prompt;
}
