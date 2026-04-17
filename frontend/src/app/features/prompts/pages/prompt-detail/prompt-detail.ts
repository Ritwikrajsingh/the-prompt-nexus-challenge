import { Component, OnInit } from '@angular/core';
import { map, Observable, shareReplay, switchMap, catchError, EMPTY, delay } from 'rxjs';
import { Prompt } from '../../../../core/models/prompt.model';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PromptService } from '../../services/prompt.service';
import { CommonModule } from '@angular/common';
import { TagComponent } from '../../components/tag/tag.component';
import { PromptDetailSkeletonComponent } from '../../components/loader/prompt-detail-skeleton.component/prompt-detail-skeleton.component';

type ComplexityStatus = {
  icon: string;
  text: string;
  badge: string;
  badgeText: string;
};

@Component({
  selector: 'app-prompt-detail',
  imports: [CommonModule, TagComponent, RouterLink, PromptDetailSkeletonComponent],
  templateUrl: './prompt-detail.html',
  styleUrl: './prompt-detail.css',
})
export class PromptDetail implements OnInit {
  prompt$!: Observable<Prompt>;
  complexityStatus$!: Observable<ComplexityStatus>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly service: PromptService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.prompt$ = this.route.paramMap.pipe(
      map((params) => params.get('id')),
      switchMap((id) =>
        this.service.getPromptById(id!).pipe(
          catchError((err) => {
            if (err.status === 404) {
              console.error('Prompt not found! Redirecting...', err, err.status);
              alert('\nPrompt not found!');
            } else {
              console.error('Unexpected server error! Redirecting...', err, err.status);
            }
            this.router.navigate(['/prompts']);
            return EMPTY; // Safely complete the observable stream
          }),
        ),
      ),
      shareReplay(1), //cache the last 1 emission to avoid second api call
    );

    this.complexityStatus$ = this.prompt$.pipe(
      map((prompt) => {
        const complexity = prompt.complexity;
        if (complexity <= 3) {
          return {
            icon: 'pi pi-chart-line text-xs',
            text: 'Straightforward reasoning.',
            badge: 'bg-[var(--color-badge-bg-low)] text-[var(--color-badge-text-low)]',
            badgeText: 'Low',
          };
        } else if (complexity <= 7) {
          return {
            icon: 'pi pi-chart-bar text-sm',
            text: 'Standard contextual logic.',
            badge: 'bg-[var(--color-badge-bg-med)] text-[var(--color-badge-text-med)]',
            badgeText: 'Medium',
          };
        } else {
          return {
            icon: 'pi pi-info-circle text-base',
            text: 'Advanced chain-of-thought processing.',
            badge: 'bg-[var(--color-badge-bg-high)] text-[var(--color-badge-text-high)]',
            badgeText: 'High',
          };
        }
      }),
    );
  }
}
