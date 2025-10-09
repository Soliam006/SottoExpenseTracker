import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslatePipe} from "@/src/shared/pipes/translate.pipe";
import {DataService} from "@/src/services/data.service";
import {CloudinaryService} from "@/src/services/cloudinary.service";
import {LanguageService} from "@/src/core/services/language.service";
import {Entry} from "@/src/models/entry.model";

interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  totalExpense: number;
}

interface EnrichedEntry extends Entry {
  projectName: string;
  receiptImageUrls?: string[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './calendar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CalendarComponent {
  dataService = inject(DataService);
  cloudinaryService = inject(CloudinaryService);
  languageService = inject(LanguageService);

  viewDate = signal(new Date());

  // Modal state
  isModalOpen = signal(false);
  modalDate = signal<Date | null>(null);
  modalEntries = signal<EnrichedEntry[]>([]);

  daysOfWeek = computed(() => {
    const translationKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return translationKeys.map(day => this.languageService.get(`calendar.day.${day}`));
  });

  calendarGrid = computed<CalendarDay[]>(() => {
    const entries = this.dataService.entries();
    const date = this.viewDate();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()));

    const grid: CalendarDay[] = [];
    let currentDate = new Date(startDate);
    const today = new Date();
    today.setHours(0,0,0,0);

    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const monthStr = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const dayStr = currentDate.getDate().toString().padStart(2, '0');
      const ymd = `${year}-${monthStr}-${dayStr}`;

      const dailyEntries = entries.filter(e => e.date === ymd);
      const totalExpense = dailyEntries.reduce((sum, e) => sum + e.price, 0);

      grid.push({
        date: new Date(currentDate),
        dayOfMonth: currentDate.getDate(),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.getTime() === today.getTime(),
        totalExpense: totalExpense
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return grid;
  });

  monthlyTotal = computed(() => {
    const entries = this.dataService.entries();
    const date = this.viewDate();
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-based month
    const monthString = month.toString().padStart(2, '0');

    return entries
        .filter(e => e.date.startsWith(`${year}-${monthString}`))
        .reduce((sum, e) => sum + e.price, 0);
  });

  changeMonth(offset: number) {
    this.viewDate.update(d => {
      const newDate = new Date(d);
      newDate.setMonth(d.getMonth() + offset);
      return newDate;
    });
  }

  openDayModal(day: CalendarDay) {
    if (day.totalExpense === 0) {
      return; // Do nothing if there are no entries
    }

    this.modalDate.set(day.date);

    const projects = this.dataService.projects();
    const entries = this.dataService.entries();

    const year = day.date.getFullYear();
    const month = (day.date.getMonth() + 1).toString().padStart(2, '0');
    const dayOfMonth = day.date.getDate().toString().padStart(2, '0');
    const ymd = `${year}-${month}-${dayOfMonth}`;

    const dayEntries = entries
        .filter(entry => entry.date === ymd)
        .map(entry => ({
          ...entry,
          projectName: projects.find(p => p.id === entry.projectId)?.name || 'N/A',
          receiptImageUrls: entry.receiptImagePublicIds?.map(id => this.cloudinaryService.getImageUrl(id, 64, 64))
        }));

    this.modalEntries.set(dayEntries);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.modalDate.set(null);
    this.modalEntries.set([]);
  }
}
