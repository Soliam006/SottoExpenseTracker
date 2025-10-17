import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../../../../services/data.service';
import { Entry } from '../../../../models/entry.model';
import { CloudinaryService } from '../../../../services/cloudinary.service';
import {TranslatePipe} from "@/src/shared/pipes/translate.pipe";
import {EntryCard} from "@/src/components/sections-page/entries/entry/entry-card/entry-card";

@Component({
  selector: 'app-entries',
  standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslatePipe, EntryCard],
  templateUrl: './entries.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EntriesComponent {
  dataService = inject(DataService);
  cloudinaryService = inject(CloudinaryService);
  // FIX: Explicitly type `fb` to resolve TypeScript's incorrect type inference.
  private fb: FormBuilder = inject(FormBuilder);

  entries = this.dataService.entries;
  projects = this.dataService.projects;
  isModalOpen = signal(false);
  editingEntry = signal<Entry | null>(null);
  loadingButton = signal(false);
  
  // Image states
  receiptImagePreviews = signal<string[]>([]); // holds base64 strings for new images
  existingReceiptImages = signal<{publicId: string, url: string}[]>([]); // holds info for already uploaded images

  // Filters
  filterType = signal<'all' | 'receipt' | 'expense'>('all');
  filterProject = signal<string>('all');
  filterMonth = signal<string>('all');
  isFilterVisibleOnMobile = signal(false);

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


  toggleFilters() {
    this.isFilterVisibleOnMobile.update(v => !v);
  }

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
    this.existingReceiptImages.set([]);

    if (entry) {
      this.entryForm.patchValue({
        type: entry.type,
        date: entry.date,
        price: entry.price,
        projectId: entry.projectId || null,
        description: entry.description,
      });
      if (entry.receiptImagePublicIds) {
        this.existingReceiptImages.set(
          entry.receiptImagePublicIds.map(id => ({
            publicId: id,
            url: this.cloudinaryService.getImageUrl(id, 100, 100)
          }))
        );
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
    this.existingReceiptImages.set([]);
  }

  async onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    const currentNewCount = this.receiptImagePreviews().length;
    const currentExistingCount = this.existingReceiptImages().length;

    if (files.length + currentNewCount + currentExistingCount > 3) {
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
  
  removeNewImage(indexToRemove: number) {
    this.receiptImagePreviews.update(previews => previews.filter((_, index) => index !== indexToRemove));
  }

  removeExistingImage(publicIdToRemove: string) {
    this.existingReceiptImages.update(images => images.filter(img => img.publicId !== publicIdToRemove));
  }


  async saveEntry() {
    if (this.entryForm.invalid) {
      return;
    }

      this.loadingButton.set(true); // Stop multiple clicks
    try {
        const uploadPromises = this.receiptImagePreviews().map(base64 => this.cloudinaryService.uploadImage(base64));
        const newUploads = await Promise.all(uploadPromises);
        const newPublicIds = newUploads.map(res => res.public_id);
        
        const existingPublicIds = this.existingReceiptImages().map(img => img.publicId);

        if (this.receiptImagePreviews().length > 0 && newPublicIds.length === 0) {
          alert('No se pudieron subir las imágenes. Intenta nuevamente.');
          return;
        }

        const formValue = this.entryForm.value;
        const entryData: Omit<Entry, 'id'> = {
            type: formValue.type!,
            date: formValue.date!,
            price: formValue.price!,
            projectId: formValue.projectId! === '' ? null : formValue.projectId!,
            description: formValue.description!,
            receiptImagePublicIds: [...existingPublicIds, ...newPublicIds],
        };
        
        if (entryData.type !== 'receipt') {
            entryData.receiptImagePublicIds = [];
        }

        const currentEntry = this.editingEntry();
        if (currentEntry) {
          await this.dataService.updateEntry({ ...entryData, id: currentEntry.id });
        } else {
          await this.dataService.addEntry(entryData);
        }
        this.closeModal();
    } catch (error) {
        console.error("Error saving entry:", error);
        alert("There was an error saving the entry. Please try again.");
    } finally {
        this.loadingButton.set(false);
    }
  }

  async deleteEntry(id: string) {
    if(confirm('Are you sure you want to delete this entry?')) {
        try {
            await this.dataService.deleteEntry(id);
        } catch (error) {
            console.error("Error deleting entry:", error);
            alert("There was an error deleting the entry. Please try again.");
        }
    }
  }

  formatMonth(month: string): string {
    const [year, monthNum] = month.split('-');
    const date = new Date(Number(year), Number(monthNum) - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  }
}
