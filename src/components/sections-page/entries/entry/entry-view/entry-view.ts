import {Component, input, output} from '@angular/core';
import {CurrencyPipe, DatePipe} from "@angular/common";
import {Entry} from "@/src/models/entry.model";
import {TranslatePipe} from "@/src/shared/pipes/translate.pipe";

@Component({
  selector: 'entries-view',
    imports: [
        CurrencyPipe,
        DatePipe,
        TranslatePipe
    ],
  templateUrl: './entry-view.html'
})
export class EntryView {
    readonly entries = input.required<Entry[]>();
}
