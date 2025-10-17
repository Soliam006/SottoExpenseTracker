import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../../../../services/data.service';
import { Project } from '../../../../models/project.model';
import { Entry } from '../../../../models/entry.model';
import { CloudinaryService } from '../../../../services/cloudinary.service';
import {TranslatePipe} from "@/src/shared/pipes/translate.pipe";
import {EntryView} from "@/src/components/sections-page/entries/entry/entry-view/entry-view";

@Component({
  selector: 'app-project-detail',
  standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe, EntryView],
  templateUrl: './project-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProjectDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dataService = inject(DataService);
  private cloudinaryService = inject(CloudinaryService);
  // FIX: Explicitly type `fb` to resolve TypeScript's incorrect type inference.
  private fb: FormBuilder = inject(FormBuilder);

  projectId = signal<string | null>(null);

  project = computed<Project | null>(() => {
    const id = this.projectId();
    if (!id) return null;
    return this.dataService.projects().find(p => p.id === id) ?? null;
  });
  
  projectImageUrl = computed(() => {
    const p = this.project();
    if (p?.imagePublicId) {
      return this.cloudinaryService.getImageUrl(p.imagePublicId, 800, 256);
    }
    return null;
  });

  projectEntries = computed(() => {
    const id = this.projectId();
    const allEntries = this.dataService.entries();
    if (!id) return [];
    return allEntries
      .filter(e => e.projectId === id)
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  totalExpenses = computed(() => {
    return this.projectEntries().reduce((sum, entry) => sum + entry.price, 0);
  });

  // Edit modal state and form
  isEditModalOpen = signal(false);
  imagePreview = signal<string | null>(null);
  projectForm = this.fb.group({
    name: ['', Validators.required],
    client: ['', Validators.required],
    address: ['', Validators.required],
    mobile: ['', Validators.required],
  });

  // Delete modal state and form
  isDeleteModalOpen = signal(false);
  deleteConfirmationForm = this.fb.group({
    confirmationText: ['', Validators.required]
  });

  constructor() {
    this.route.paramMap.subscribe(params => {
      this.projectId.set(params.get('id'));
    });

    effect(() => {
        const p = this.project();
        untracked(() => {
            if (!p && this.projectId()) {
                // If projectId is set but project is not found, redirect.
                // This can happen after deletion.
                const projects = this.dataService.projects();
                if (projects.length > 0) { // check if data is loaded
                    this.router.navigate(['/projects']);
                }
            }
        })
    });
  }

  // --- Edit Logic ---
  openEditModal() {
    const p = this.project();
    if (!p) return;
    this.projectForm.patchValue(p);
    this.imagePreview.set(p.imagePublicId ? this.cloudinaryService.getImageUrl(p.imagePublicId) : null);
    this.isEditModalOpen.set(true);
  }

  closeEditModal() {
    this.isEditModalOpen.set(false);
    this.projectForm.reset();
    this.imagePreview.set(null);
  }

  async onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        input.value = '';
        return;
    }
    try {
        const base64string = await this.readAsDataURL(file);
        this.imagePreview.set(base64string);
    } catch (error) {
        console.error('Error reading file:', error);
        alert('There was an error reading the file.');
    } finally {
        input.value = '';
    }
  }

  private readAsDataURL(file: File): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
      });
  }
  
  removeImage() {
      this.imagePreview.set(null);
  }

  async saveProject() {
    if (this.projectForm.invalid) return;
    
    const p = this.project();
    if (!p) return;

    let imagePublicId: string | null = p.imagePublicId;
    const preview = this.imagePreview();

    try {
      if (preview && preview.startsWith('data:image')) {
        const uploadResponse = await this.cloudinaryService.uploadImage(preview);
        imagePublicId = uploadResponse.public_id;
      } else if (!preview) {
        imagePublicId = null;
      }

      const formValue = this.projectForm.value;
      const projectData = {
          name: formValue.name!,
          client: formValue.client!,
          address: formValue.address!,
          mobile: formValue.mobile!,
          imagePublicId: imagePublicId,
      };
      
      await this.dataService.updateProject({ ...projectData, id: p.id });
      this.closeEditModal();
    } catch(error) {
        console.error("Error updating project:", error);
        alert("There was an error updating the project. Please try again.");
    }
  }
  
  // --- Delete Logic ---
  openDeleteModal() {
    this.isDeleteModalOpen.set(true);
    this.deleteConfirmationForm.reset();
  }
  
  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
  }

  async deleteProject() {
      const p = this.project();
      if (!p) return;

      const expectedConfirmation = `delete project ${p.name}`;
      const enteredConfirmation = this.deleteConfirmationForm.value.confirmationText?.trim();

      if (expectedConfirmation === enteredConfirmation) {
          try {
              await this.dataService.deleteProject(p.id);
              // Navigation will be handled by the effect
          } catch (error) {
              console.error("Error deleting project:", error);
              alert("There was an error deleting the project. Please try again.");
          }
      } else {
          alert('Confirmation text does not match.');
      }
  }
}
