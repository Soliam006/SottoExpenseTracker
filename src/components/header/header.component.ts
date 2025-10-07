// Fix: Replaced corrupted file content with a valid Angular component definition.
import { Component, ChangeDetectionStrategy, output, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type View = 'entries' | 'projects' | 'calendar';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="bg-gray-800 text-white shadow-md relative">
      <div class="p-4 flex justify-between items-center">
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mr-3 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14" />
          </svg>
          <h1 class="text-xl font-bold">Construction Expense Tracker</h1>
        </div>
        
        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center">
          <button 
            (click)="setView('entries')"
            [class]="'px-3 py-2 rounded-md text-sm font-medium transition-colors ' + (activeView() === 'entries' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white')">
            Entries
          </button>
          <button 
            (click)="setView('projects')"
            [class]="'ml-4 px-3 py-2 rounded-md text-sm font-medium transition-colors ' + (activeView() === 'projects' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white')">
            Projects
          </button>
          <button 
            (click)="setView('calendar')"
            [class]="'ml-4 px-3 py-2 rounded-md text-sm font-medium transition-colors ' + (activeView() === 'calendar' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white')">
            Calendar
          </button>
        </nav>
        
        <!-- Mobile Menu Button -->
        <div class="md:hidden">
          <button (click)="toggleMobileMenu()" class="text-gray-300 hover:text-white focus:outline-none p-2 rounded-md">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              @if (!isMobileMenuOpen()) {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              } @else {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              }
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Nav -->
      @if (isMobileMenuOpen()) {
        <nav class="md:hidden bg-gray-800 border-t border-gray-700">
          <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button 
              (click)="setView('entries')"
              [class]="'w-full text-left block px-3 py-2 rounded-md text-base font-medium transition-colors ' + (activeView() === 'entries' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white')">
              Entries
            </button>
            <button 
              (click)="setView('projects')"
              [class]="'w-full text-left block px-3 py-2 rounded-md text-base font-medium transition-colors ' + (activeView() === 'projects' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white')">
              Projects
            </button>
            <button 
              (click)="setView('calendar')"
              [class]="'w-full text-left block px-3 py-2 rounded-md text-base font-medium transition-colors ' + (activeView() === 'calendar' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white')">
              Calendar
            </button>
          </div>
        </nav>
      }
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  activeView = input.required<View>();
  viewChange = output<View>();
  
  isMobileMenuOpen = signal(false);

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(isOpen => !isOpen);
  }

  setView(view: View) {
    this.viewChange.emit(view);
    this.isMobileMenuOpen.set(false);
  }
}
