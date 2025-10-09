import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('@/src/components/auth/login/login.component'),
    canActivate: [guestGuard]
  },
  {
    path: 'signup',
    loadComponent: () => import('@/src/components/auth/signup/signup.component'),
    canActivate: [guestGuard]
  },
  {
    path: 'entries',
    loadComponent: () => import('@/src/components/sections-page/entries/entry/entries.component'),
    canActivate: [authGuard],
  },
  {
    path: 'projects',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('@/src/components/sections-page/project/projects/projects.component'),
        pathMatch: 'full'
      },
      {
        path: ':id',
        loadComponent: () => import('@/src/components/sections-page/project/project-detail/project-detail.component'),
      }
    ]
  },
  {
    path: 'calendar',
    loadComponent: () => import('@/src/components/sections-page/calendar/calendar/calendar.component'),
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