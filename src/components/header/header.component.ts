import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {TranslatePipe} from "@/src/shared/pipes/translate.pipe";
import {DropdownLanguage} from "@/src/components/header/dropdown-language/dropdown-language";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe, DropdownLanguage, TranslatePipe],
  templateUrl : './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  authService = inject(AuthService);

  isMobileMenuOpen = signal(false);
  isLangMenuOpen = signal(false);


  readonly languages = [
    { code: 'en', label: 'language.english' },
    { code: 'es', label: 'language.spanish' },
    { code: 'ca', label: 'language.catalan' },
  ] as const;

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(isOpen => !isOpen);
    if(this.isLangMenuOpen()) {
      this.isLangMenuOpen.set(false);
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  async logout() {
    this.closeMobileMenu();
    await this.authService.logout();
  }
}