import {inject, Injectable, signal} from '@angular/core';
import {en} from "@/public/i18n/en";
import {es} from "@/public/i18n/es";
import {ca} from "@/public/i18n/ca";

export type Language = 'en' | 'es' | 'ca';
type Translations = { [key: string]: string };

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    currentLang = signal<Language>('en');
    translations = signal<Translations>({});

    private allTranslations: { [key in Language]: Translations } = { en, es, ca };

    constructor() {
        const savedLang = localStorage.getItem('appLang') as Language;
        const lang = savedLang && this.allTranslations[savedLang] ? savedLang : 'ca';
        this.setLanguage(lang);
    }

    setLanguage(lang: Language) {
        this.currentLang.set(lang);
        this.translations.set(this.allTranslations[lang]);
        localStorage.setItem('appLang', lang);
    }

    get(key: string): string {
        return this.translations()[key] || key;
    }
}
