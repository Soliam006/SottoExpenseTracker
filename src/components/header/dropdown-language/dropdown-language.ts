import {Component, computed, inject, output, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslatePipe} from "@/src/shared/pipes/translate.pipe";
import {LanguageService} from "@/src/core/services/language.service";


@Component({
  selector: 'dropdown-language',
  imports: [
    TranslatePipe,CommonModule
  ],
  templateUrl: './dropdown-language.html'
})
export class DropdownLanguage {

  private readonly translation = inject(LanguageService);

  readonly currentLang = computed(() => this.translation.currentLang());
  readonly isMenuOpen = signal(false);

  readonly languageSelected = output<string>();

  readonly languages = [
    { code: 'en', label: 'language.english' },
    { code: 'es', label: 'language.spanish' },
    { code: 'ca', label: 'language.catalan' },
  ] as const;

  toggleMenu() {
    this.isMenuOpen.update((v) => !v);
  }

  selectLanguage(lang: 'es' | 'en' | 'ca') {
    this.translation.setLanguage(lang);
    this.isMenuOpen.set(false);
    this.languageSelected.emit(lang); // Emit event
  }
}
