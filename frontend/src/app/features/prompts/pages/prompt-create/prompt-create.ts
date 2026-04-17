import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PromptService } from '../../services/prompt.service';
import { Tag } from '../../../../core/models/prompt.model';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-prompt-create',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './prompt-create.html',
  styleUrl: './prompt-create.css',
})
export class PromptCreate implements OnInit {
  form!: FormGroup;
  isSubmitting = signal(false);
  isSubmitted = false;

  selectedTags: Tag[] = [];
  tagError: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly promptService: PromptService,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    // Initialize Reactive Form with strict validators
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(20)]],
      complexity: [7, [Validators.required, Validators.min(1), Validators.max(10)]],
    });
  }

  get title() {
    return this.form.get('title');
  }
  get content() {
    return this.form.get('content');
  }
  get complexity() {
    return this.form.get('complexity');
  }

  get complexityLabel(): string {
    const value = this.complexity?.value || 0;

    if (value <= 3) return 'LOW';
    if (value <= 7) return 'MEDIUM';
    return 'HIGH';
  }

  get complexityPillClass(): string {
    const val = this.complexity?.value || 0;
    if (val <= 3) return 'bg-green-100 text-green-700';
    if (val <= 7) return 'bg-blue-100 text-blue-700';
    return 'bg-red-100 text-red-700';
  }

  get hasUnsavedChanges(): boolean {
    if (this.isSubmitting() || this.isSubmitted) return false;

    const titleValue = this.title?.value?.trim();
    const contentValue = this.content?.value?.trim();

    return !!titleValue || !!contentValue || this.selectedTags.length > 0;
  }

  onTagInput(inputElement: HTMLInputElement): void {
    this.clearTagError();

    let val = inputElement.value;
    val = val
      .toLowerCase()
      .replace(/\s+/g, '-') // Convert spaces to hyphens
      .replace(/[^a-z0-9-]/g, '') // Remove invalid characters
      .replace(/-+/g, '-'); // Prevent consecutive hyphens while typing

    inputElement.value = val;
  }

  handleTagKeydown(event: KeyboardEvent, inputElement: HTMLInputElement): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addTag(inputElement);
    }
  }

  addTag(inputElement: HTMLInputElement): void {
    // 1. Clean the tag: lowercase, valid chars, single hyphens
    let tag = inputElement.value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');

    // 2. Remove leading and trailing hyphens (e.g., "-api-" becomes "api")
    tag = tag.replace(/^-+|-+$/g, '');

    // 3. Validation: Check if empty
    if (!tag) {
      this.tagError = 'Please enter a valid tag before adding.';
      // Reset input if they only typed hyphens
      inputElement.value = '';
      return;
    }

    // 4. Validation: Check for duplicates
    if (this.selectedTags.includes(tag)) {
      this.tagError = 'This tag has already been added.';
      return;
    }

    // 5. Success: Add tag and reset
    this.selectedTags.push(tag);
    inputElement.value = '';
    this.clearTagError();
  }

  removeTag(tagToRemove: string): void {
    this.selectedTags = this.selectedTags.filter((t) => t !== tagToRemove);
    this.clearTagError(); // Clear errors if they interact with existing tags
  }

  isValidTag(tag: string): boolean {
    return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(tag);
  }

  private clearTagError(): void {
    this.tagError = null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // Added a console warning so you can see if submission is blocked by validation
      console.warn('Form is invalid! Ensure required fields are valid!');
      return;
    }

    this.isSubmitting.set(true);

    const formVale = this.form.value;

    const payload = {
      ...formVale,
      tags: this.selectedTags,
    };

    this.promptService.createPrompt(payload).subscribe({
      next: (newPrompt) => {
        this.isSubmitting.set(false);
        this.isSubmitted = true;
        this.router.navigate(['/prompts', newPrompt.id]);
      },
      error: (err) => {
        alert(
          'Failed to create prompt!\n\n' +
            (err?.error?.error || err.message || 'Something went wrong. Please try again.'),
        );

        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          this.router.navigate(['/auth', 'login']);
        }
        console.warn('Failed to create prompt', err);
        this.isSubmitted = true;
        this.isSubmitting.set(false);
      },
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload($event: BeforeUnloadEvent) {
    if (this.hasUnsavedChanges) {
      $event.returnValue = true;
    }
  }
}
