import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  currentUser = signal<User | null>(null);

  // A simple in-memory store for users. In a real app, this would be a backend.
  // For this demo, we'll use localStorage to persist users.
  private users: { [email: string]: string } = {};

  constructor() {
    this.loadUsers();
    this.checkAuth();
  }

  private loadUsers() {
    const storedUsers = localStorage.getItem('expense_tracker_users');
    if (storedUsers) {
      this.users = JSON.parse(storedUsers);
    }
  }

  private saveUsers() {
    localStorage.setItem('expense_tracker_users', JSON.stringify(this.users));
  }

  checkAuth() {
    const storedUser = localStorage.getItem('expense_tracker_user');
    if (storedUser) {
      this.currentUser.set(JSON.parse(storedUser));
    }
  }

  signup(email: string, password: string): boolean {
    if (this.users[email]) {
      // User already exists
      return false;
    }
    this.users[email] = password; // In a real app, hash the password!
    this.saveUsers();
    this.login(email, password);
    return true;
  }

  login(email: string, password: string): boolean {
    if (this.users[email] && this.users[email] === password) {
      const user: User = { email };
      this.currentUser.set(user);
      localStorage.setItem('expense_tracker_user', JSON.stringify(user));
      this.router.navigate(['/entries']);
      return true;
    }
    return false;
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('expense_tracker_user');
    this.router.navigate(['/login']);
  }
}
