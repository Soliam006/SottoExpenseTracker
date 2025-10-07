
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent, View } from './components/header/header.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { EntriesComponent } from './components/entries/entries.component';
import { CalendarComponent } from './components/calendar/calendar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    ProjectsComponent,
    EntriesComponent,
    CalendarComponent
  ],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  activeView = signal<View>('entries');

  onViewChange(view: View) {
    this.activeView.set(view);
  }
}
