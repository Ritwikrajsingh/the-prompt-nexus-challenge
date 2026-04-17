import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ErrorBanner } from '../../components/error-banner/error-banner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ErrorBanner],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  registerForm!: FormGroup;
  isSubmitting = signal(false);
  showPassword = false;
  showConfirmPassword = false;
  errorMessage: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly service: AuthService,
    private readonly router: Router,
  ) {
    this.registerForm = this.fb.group(
      {
        username: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  get username() {
    return this.registerForm.get('username');
  }
  get password() {
    return this.registerForm.get('password');
  }
  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      console.warn('Registration form is invalid! Check fields.');
      return;
    }

    this.isSubmitting.set(true);

    const { confirmPassword, ...payload } = this.registerForm.value;

    this.service.register(payload).subscribe({
      next: (user: any) => {
        this.isSubmitting.set(false);
        this.router.navigate(['/auth', 'login'], { queryParams: { registered: 'true' } });
      },
      error: (err) => {
        console.error('Registration failed:', err);
        this.errorMessage =
          err?.error?.error || err.message || 'Registration failed. Please try again.';
        this.isSubmitting.set(false);
      },
    });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });

      return { passwordMismatch: true };
    }
    return null;
  }
}
