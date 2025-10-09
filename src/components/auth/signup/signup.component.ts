import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import {TranslatePipe} from "@/src/shared/pipes/translate.pipe";

@Component({
  selector: 'app-signup',
  standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './signup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SignupComponent {
  private fb: FormBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  signupForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  errorMessage = signal<string | null>(null);

  async signup() {
    if (this.signupForm.invalid) {
      return;
    }
    this.errorMessage.set(null);
    const { email, password } = this.signupForm.value;
    try {
      await this.authService.signup(email!, password!);
    } catch (error: any) {
      this.errorMessage.set(this.getFirebaseErrorMessage(error));
    }
  }

  private getFirebaseErrorMessage(error: any): string {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/invalid-email':
        return 'Invalid email address format.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use a stronger password.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}