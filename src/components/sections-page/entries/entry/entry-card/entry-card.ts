import {Component, input, output} from '@angular/core';
import {CurrencyPipe, DatePipe} from "@angular/common";
import {TranslatePipe} from "@/src/shared/pipes/translate.pipe";
import {EnrichedEntry} from "@/src/models/entry.model";

@Component({
  selector: 'entry-card',
    imports: [
        CurrencyPipe,
        DatePipe,
        TranslatePipe
    ],
  templateUrl: './entry-card.html'
})
export class EntryCard {

    readonly entries = input.required<EnrichedEntry[]>();
    readonly edit = output<EnrichedEntry>();
    readonly delete = output<string>();
}
