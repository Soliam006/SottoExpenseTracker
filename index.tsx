import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection, ApplicationRef } from '@angular/core';
import { AppComponent } from './src/app.component';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './src/app.routes';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeCa from '@angular/common/locales/ca';

registerLocaleData(localeEs);
registerLocaleData(localeCa);

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation())
  ],
}).then((appRef: ApplicationRef) => {
  // Defer app initialization to allow web components to be defined
  appRef.tick();
});

// AI Studio always uses an `index.tsx` file for all project types.