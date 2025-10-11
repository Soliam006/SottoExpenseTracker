import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {DataService} from '@/src/services/data.service';
import {Project} from '@/src/models/project.model';
import {RouterModule} from '@angular/router';
import {CloudinaryService} from '@/src/services/cloudinary.service';
import {TranslatePipe} from "@/src/shared/pipes/translate.pipe";

@Component({
  selector: 'app-projects',
  standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  templateUrl: './projects.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProjectsComponent {
  dataService = inject(DataService);
  cloudinaryService = inject(CloudinaryService);
  // FIX: Explicitly type `fb` to resolve TypeScript's incorrect type inference.
  private fb: FormBuilder = inject(FormBuilder);
  
  projects = this.dataService.projects;
  isModalOpen = signal(false);
  editingProject = signal<Project | null>(null);
  imagePreview = signal<string | null>(null);

  projectForm = this.fb.group({
    name: ['', Validators.required],
    client: ['', Validators.required],
    address: ['', Validators.required],
    mobile: ['', Validators.required],
  });

  loadingState= signal(false); // Loading state for save operation

  openModal(project: Project | null = null) {
    this.editingProject.set(project);
    if (project) {
      this.projectForm.patchValue(project);
      this.imagePreview.set(project.imagePublicId ? this.cloudinaryService.getImageUrl(project.imagePublicId) : null);
    } else {
      this.projectForm.reset();
      this.imagePreview.set(null);
    }
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingProject.set(null);
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
    if (this.projectForm.invalid) {
      return;
    }


    this.loadingState.set(true); // Set loading state to true at the start of the operation
    let imagePublicId: string | undefined = this.editingProject()?.imagePublicId;
    const preview = this.imagePreview();
    
    try {
      if (preview && preview.startsWith('data:image')) {
        const uploadResponse = await this.cloudinaryService.uploadImage(preview);
        imagePublicId = uploadResponse.public_id;
      } else if (!preview) {
        imagePublicId = undefined;
      }

      const formValue = this.projectForm.value;
      const projectData = {
          name: formValue.name!,
          client: formValue.client!,
          address: formValue.address!,
          mobile: formValue.mobile!,
          imagePublicId: imagePublicId || null,
      };
      
      const currentProject = this.editingProject();
      if (currentProject) {
        await this.dataService.updateProject({ ...projectData, id: currentProject.id });
      } else {
        await this.dataService.addProject(projectData);
      }
      this.closeModal();

    } catch (error) {
        console.error("Error saving project:", error);
        alert("There was an error saving the project. Please try again.");
    } finally {
        this.loadingState.set(false); // Reset loading state at the end of the operation
    }
  }

  getProjectImageUrl(publicId: string): string {
    return this.cloudinaryService.getImageUrl(publicId, 400, 192);
  }
}
