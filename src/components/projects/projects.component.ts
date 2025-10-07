
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './projects.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProjectsComponent {
  dataService = inject(DataService);
  private fb = inject(FormBuilder);
  
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

  openModal(project: Project | null = null) {
    this.editingProject.set(project);
    if (project) {
      this.projectForm.patchValue(project);
      this.imagePreview.set(project.imageUrl ?? null);
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

  saveProject() {
    if (this.projectForm.invalid) {
      return;
    }
    const formValue = this.projectForm.value;
    const projectData = {
        name: formValue.name!,
        client: formValue.client!,
        address: formValue.address!,
        mobile: formValue.mobile!,
        imageUrl: this.imagePreview() ?? undefined,
    };
    
    const currentProject = this.editingProject();
    if (currentProject) {
      this.dataService.updateProject({ ...projectData, id: currentProject.id });
    } else {
      this.dataService.addProject(projectData);
    }
    this.closeModal();
  }

  deleteProject(id: string) {
    if(confirm('Are you sure you want to delete this project? This will unassign it from all entries.')) {
        this.dataService.deleteProject(id);
    }
  }
}