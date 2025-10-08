import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection, ApplicationRef } from '@angular/core';
import { AppComponent } from './src/app.component';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './src/app.routes';
import {provideHttpClient} from "@angular/common/http";
import {initializeApp, provideFirebaseApp} from "@angular/fire/app";
import {firebaseConfig} from "@/src/firebase.config";
import {provideFirestore} from "@angular/fire/firestore";
import {getFirestore} from "firebase/firestore";
import {provideAuth} from "@angular/fire/auth";
import {getAuth} from "firebase/auth";

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(),

    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
}).then((appRef: ApplicationRef) => {
  // Defer app initialization to allow web components to be defined
  appRef.tick();
});

// AI Studio always uses an `index.tsx` file for all project types.