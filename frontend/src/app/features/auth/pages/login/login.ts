import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ErrorBanner } from '../../components/error-banner/error-banner';
import { AuthService } from '../../services/auth.service';
import { SuccessBanner } from '../../components/success-banner/success-banner';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ErrorBanner, SuccessBanner],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  isSubmitting = signal(false);
  showPassword = false;
  errorMessage: string | null = null;

  justRegistered = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly service: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false],
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      if (params.get('registered') === 'true') this.justRegistered = true;
    });
  }

  get username() {
    return this.loginForm.get('username');
  }
  get password() {
    return this.loginForm.get('password');
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      console.warn('Login form is invalid! Enter valid details!');
      return;
    }

    this.isSubmitting.set(true);

    const payload = this.loginForm.value;

    this.service.login(payload).subscribe({
      next: (tokens: any) => {
        this.isSubmitting.set(false);
        // Navigate to the repository view on success
        this.router.navigate(['/prompts']);
      },

      error: (err) => {
        console.error('Authentication failed:', err);
        this.errorMessage =
          err?.error?.error || err.message || 'Something went wrong. Please try again.';
        this.isSubmitting.set(false);
      },
    });
  }
}
