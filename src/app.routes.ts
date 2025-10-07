import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component'),
    canActivate: [guestGuard]
  },
  {
    path: 'signup',
    loadComponent: () => import('./components/signup/signup.component'),
    canActivate: [guestGuard]
  },
  {
    path: 'entries',
    loadComponent: () => import('./components/entries/entries.component'),
    canActivate: [authGuard],
  },
  {
    path: 'projects',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/projects/projects.component'),
        pathMatch: 'full'
      },
      {
        path: ':id',
        loadComponent: () => import('./components/project-detail/project-detail.component'),
      }
    ]
  },
  {
    path: 'calendar',
    loadComponent: () => import('./components/calendar/calendar.component'),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: '/entries',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/entries'
  }
];