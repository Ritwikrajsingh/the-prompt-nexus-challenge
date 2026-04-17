import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { Prompt } from '../../../../core/models/prompt.model';
import { PromptService } from '../../services/prompt.service';
import { PromptCardSkeletonComponent } from '../../components/loader/prompt-card-skeleton.component/prompt-card-skeleton.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PromptCardComponent } from '../../components/prompt-card/prompt-card.component';

@Component({
  selector: 'app-prompt-list',
  imports: [CommonModule, RouterLink, PromptCardComponent, PromptCardSkeletonComponent],
  templateUrl: './prompt-list.html',
  styleUrl: './prompt-list.css',
})
export class PromptList implements OnInit {
  prompts$!: Observable<Prompt[]>;
  activeTag: string | null = null;

  constructor(
    private promptService: PromptService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.prompts$ = this.route.queryParamMap.pipe(
      map((params) => {
        this.activeTag = params.get('tag');
        return this.activeTag;
      }),
      switchMap((tag) => this.promptService.getPrompts(tag)),
    );
  }

  applyFilter(inputElement: HTMLInputElement): void {
    let tag = inputElement.value
      .trim()
      .toLocaleLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (tag) {
      this.router.navigate(['/prompts'], { queryParams: { tag } });
    }
  }

  clearFilter(): void {
    this.router.navigate(['/prompts']);
  }
}
