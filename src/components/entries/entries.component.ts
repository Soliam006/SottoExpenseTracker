import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Entry } from '../../models/entry.model';

@Component({
  selector: 'app-entries',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './entries.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EntriesComponent {
  dataService = inject(DataService);
  // FIX: Explicitly type `fb` to resolve TypeScript's incorrect type inference.
  private fb: FormBuilder = inject(FormBuilder);

  entries = this.dataService.entries;
  projects = this.dataService.projects;
  isModalOpen = signal(false);
  editingEntry = signal<Entry | null>(null);
  receiptImagePreviews = signal<string[]>([]);

  // Filters
  filterType = signal<'all' | 'receipt' | 'expense'>('all');
  filterProject = signal<string>('all');
  filterMonth = signal<string>('all');

  availableMonths = computed(() => {
    const entries = this.dataService.entries();
    const months = new Set<string>();
    entries.forEach(entry => {
      const month = entry.date.substring(0, 7); // 'YYYY-MM'
      months.add(month);
    });
    return Array.from(months).sort().reverse();
  });
  
  // Use a computed signal for enriched entries with project names
  enrichedEntries = computed(() => {
    const entries = this.entries();
    const projects = this.projects();
    const type = this.filterType();
    const projectId = this.filterProject();
    const month = this.filterMonth();

    return entries.filter(entry => {
        const typeMatch = type === 'all' || entry.type === type;
        const projectMatch = projectId === 'all' || entry.projectId === projectId;
        const monthMatch = month === 'all' || entry.date.startsWith(month);
        return typeMatch && projectMatch && monthMatch;
      })
      .map(entry => ({
        ...entry,
        projectName: projects.find(p => p.id === entry.projectId)?.name || 'N/A'
      }))
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  filteredTotal = computed(() => {
    return this.enrichedEntries().reduce((total, entry) => total + entry.price, 0);
  });

  entryForm = this.fb.group({
    type: ['receipt' as 'receipt' | 'expense', Validators.required],
    date: [this.getTodayString(), Validators.required],
    price: [0, [Validators.required, Validators.min(0.01)]],
    projectId: [''],
    description: ['', Validators.required],
  });

  get isReceipt() {
    return this.entryForm.get('type')?.value === 'receipt';
  }

  private getTodayString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  openModal(entry: Entry | null = null) {
    this.editingEntry.set(entry);
    this.receiptImagePreviews.set([]);
    if (entry) {
      this.entryForm.patchValue({
        type: entry.type,
        date: entry.date,
        price: entry.price,
        projectId: entry.projectId || '',
        description: entry.description,
      });
      if (entry.receiptImages) {
        this.receiptImagePreviews.set(entry.receiptImages);
      }
    } else {
      this.entryForm.reset({
        type: 'receipt',
        date: this.getTodayString(),
        price: 0,
        projectId: '',
        description: '',
      });
    }
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingEntry.set(null);
    this.entryForm.reset();
    this.receiptImagePreviews.set([]);
  }

  async onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    const currentImages = this.receiptImagePreviews();

    if (files.length + currentImages.length > 3) {
      alert('You can upload a maximum of 3 images.');
      input.value = ''; // Clear file input
      return;
    }

    const readAsDataURL = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
      });
    };

    try {
      const base64strings = await Promise.all(files.map(readAsDataURL));
      this.receiptImagePreviews.update(previews => [...previews, ...base64strings]);
    } catch (error) {
      console.error('Error reading files:', error);
    } finally {
        input.value = '';
    }
  }
  
  removeImage(indexToRemove: number) {
    this.receiptImagePreviews.update(previews => previews.filter((_, index) => index !== indexToRemove));
  }

  saveEntry() {
    if (this.entryForm.invalid) {
      return;
    }
    const formValue = this.entryForm.value;
    const entryData: Omit<Entry, 'id'> = {
        type: formValue.type!,
        date: formValue.date!,
        price: formValue.price!,
        projectId: formValue.projectId! === '' ? undefined : formValue.projectId!,
        description: formValue.description!,
        receiptImages: this.receiptImagePreviews(),
    };
    
    if (entryData.type !== 'receipt') {
        entryData.receiptImages = [];
    }

    const currentEntry = this.editingEntry();
    if (currentEntry) {
      this.dataService.updateEntry({ ...entryData, id: currentEntry.id });
    } else {
      this.dataService.addEntry(entryData);
    }
    this.closeModal();
  }

  deleteEntry(id: string) {
    if(confirm('Are you sure you want to delete this entry?')) {
        this.dataService.deleteEntry(id);
    }
  }

  formatMonth(month: string): string {
    const [year, monthNum] = month.split('-');
    const date = new Date(Number(year), Number(monthNum) - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  }
}