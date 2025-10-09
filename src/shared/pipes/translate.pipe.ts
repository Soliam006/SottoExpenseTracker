import { Pipe, PipeTransform, inject } from '@angular/core';
import {LanguageService} from "@/src/core/services/language.service";

@Pipe({
    name: 'translate',
    standalone: true,
    pure: false,
})
export class TranslatePipe implements PipeTransform {
    private languageService = inject(LanguageService);

    transform(key: string): string {
        // By making the pipe impure, Angular will re-evaluate it when the component is checked.
        // When the languageService.translations() signal changes, components using this pipe will be
        // marked as dirty, and the pipe will re-run, fetching the new translation.
        return this.languageService.translations()[key] || key;
    }
}