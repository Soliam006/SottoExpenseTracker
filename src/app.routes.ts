import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'entries',
    loadComponent: () => import('./components/entries/entries.component'),
  },
  {
    path: 'projects',
    loadComponent: () => import('./components/projects/projects.component'),
  },
  {
    path: 'calendar',
    loadComponent: () => import('./components/calendar/calendar.component'),
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
