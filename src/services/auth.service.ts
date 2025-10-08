import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, Auth, User as FirebaseUser } from 'firebase/auth';
import { firebaseConfig } from '../firebase.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  currentUser = signal<User | null>(null);

  private auth: Auth;

  constructor() {
    const app = initializeApp(firebaseConfig);
    this.auth = getAuth(app);
    this.checkAuth();
  }

  private checkAuth() {
    onAuthStateChanged(this.auth, (user: FirebaseUser | null) => {
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
    await createUserWithEmailAndPassword(this.auth, email, password);
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}