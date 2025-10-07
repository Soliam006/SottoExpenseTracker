
import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection, ApplicationRef } from '@angular/core';
import { AppComponent } from './src/app.component';
import { importProvidersFrom } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    importProvidersFrom(ReactiveFormsModule)
  ],
}).then((appRef: ApplicationRef) => {
  // Defer app initialization to allow web components to be defined
  appRef.tick();
});

// AI Studio always uses an `index.tsx` file for all project types.
