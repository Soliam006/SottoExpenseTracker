
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
export class EntriesComponent {
  dataService = inject(DataService);
  private fb = inject(FormBuilder);

  entries = this.dataService.entries;
  projects = this.dataService.projects;
  isModalOpen = signal(false);
  editingEntry = signal<Entry | null>(null);
  receiptImagePreview = signal<string | null>(null);
  
  // Use a computed signal for enriched entries with project names
  enrichedEntries = computed(() => {
    const entries = this.entries();
    const projects = this.projects();
    return entries.map(entry => ({
      ...entry,
      projectName: projects.find(p => p.id === entry.projectId)?.name || 'N/A'
    })).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  entryForm = this.fb.group({
    type: ['receipt' as 'receipt' | 'expense', Validators.required],
    date: [this.getTodayString(), Validators.required],
    price: [0, [Validators.required, Validators.min(0.01)]],
    projectId: [''],
    description: ['', Validators.required],
    receiptImage: [''],
  });

  get isReceipt() {
    return this.entryForm.get('type')?.value === 'receipt';
  }

  private getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  openModal(entry: Entry | null = null) {
    this.editingEntry.set(entry);
    this.receiptImagePreview.set(null);
    if (entry) {
      this.entryForm.patchValue({
        type: entry.type,
        date: entry.date,
        price: entry.price,
        projectId: entry.projectId || '',
        description: entry.description,
        receiptImage: '' // Do not pre-fill file input
      });
      if (entry.receiptImage) {
        this.receiptImagePreview.set(entry.receiptImage);
      }
    } else {
      this.entryForm.reset({
        type: 'receipt',
        date: this.getTodayString(),
        price: 0,
        projectId: '',
        description: '',
        receiptImage: ''
      });
    }
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingEntry.set(null);
    this.entryForm.reset();
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.entryForm.patchValue({ receiptImage: base64String });
        this.receiptImagePreview.set(base64String);
      };
      reader.readAsDataURL(file);
    }
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
        receiptImage: formValue.receiptImage || undefined,
    };
    
    // If not a receipt, clear image
    if (entryData.type !== 'receipt') {
        entryData.receiptImage = undefined;
    }

    const currentEntry = this.editingEntry();
    if (currentEntry) {
        // If user didn't upload a new image while editing, keep the old one.
        if (!entryData.receiptImage && currentEntry.receiptImage) {
            entryData.receiptImage = currentEntry.receiptImage;
        }
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
}
