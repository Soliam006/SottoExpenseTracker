
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
export class ProjectsComponent {
  dataService = inject(DataService);
  private fb = inject(FormBuilder);
  
  projects = this.dataService.projects;
  isModalOpen = signal(false);
  editingProject = signal<Project | null>(null);

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
    } else {
      this.projectForm.reset();
    }
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingProject.set(null);
    this.projectForm.reset();
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
