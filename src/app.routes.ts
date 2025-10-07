import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'entries',
    loadComponent: () => import('./components/entries/entries.component'),
  },
  {
    path: 'projects',
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
