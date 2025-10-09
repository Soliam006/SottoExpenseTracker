import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@/src/services/auth.service';
import {TranslatePipe} from "@/src/shared/pipes/translate.pipe";

@Component({
  selector: 'app-login',
  standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent {
  private fb: FormBuilder = inject(FormBuilder);
  private authService = inject(AuthService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  errorMessage = signal<string | null>(null);

  async login() {
    if (this.loginForm.invalid) {
      return;
    }
    this.errorMessage.set(null);
    const { email, password } = this.loginForm.value;
    try {
      await this.authService.login(email!, password!);
    } catch (error: any) {
      this.errorMessage.set(this.getFirebaseErrorMessage(error));
    }
  }

  private getFirebaseErrorMessage(error: any): string {
    switch (error.code) {
      case 'auth/invalid-email':
        return 'Invalid email address format.';
      case 'auth/user-disabled':
        return 'This user account has been disabled.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}