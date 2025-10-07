
import { Component, ChangeDetectionStrategy, output, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

export type View = 'entries' | 'projects' | 'calendar';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgOptimizedImage]
})
export class HeaderComponent {
  activeView = input.required<View>();
  viewChange = output<View>();

  setView(view: View) {
    this.viewChange.emit(view);
  }
}
