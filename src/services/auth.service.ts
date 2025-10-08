import {inject, Injectable, signal} from '@angular/core';
import {Router} from '@angular/router';
import {User} from '../models/user.model';
import {
  Auth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser
} from "@angular/fire/auth";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  currentUser = signal<User | null>(null);

  private firebaseAuth = inject(Auth);

  constructor() {
    this.checkAuth();
  }

  private checkAuth() {
    onAuthStateChanged(this.firebaseAuth, (user: FirebaseUser | null) => {
      if (user) {
        this.currentUser.set({ uid: user.uid, email: user.email });
        if (this.router.url.includes('/login') || this.router.url.includes('/signup')) {
            this.router.navigate(['/entries']);
        }
      } else {
        this.currentUser.set(null);
        this.router.navigate(['/login']);
      }
    });
  }

  async signup(email: string, password: string): Promise<void> {
    await createUserWithEmailAndPassword(this.firebaseAuth, email, password);
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.firebaseAuth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(this.firebaseAuth);
  }
}