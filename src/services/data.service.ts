import { Injectable, signal } from '@angular/core';
import { Project } from '../models/project.model';
import { Entry } from '../models/entry.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  projects = signal<Project[]>([]);
  entries = signal<Entry[]>([]);

  constructor() {
    // Load mock data
    this.projects.set([
      { id: 'proj1', name: 'Downtown Office Renovation', client: 'Innovate Corp', address: '123 Main St, Anytown', mobile: '555-1234' },
      { id: 'proj2', name: 'Residential Kitchen Remodel', client: 'The Smiths', address: '456 Oak Ave, Suburbia', mobile: '555-5678' },
    ]);

    this.entries.set([
      { id: 'entry1', type: 'receipt', date: this.getYMD(new Date()), price: 125.50, projectId: 'proj1', description: 'Lumber purchase', receiptImages: [] },
      { id: 'entry2', type: 'expense', date: this.getYMD(new Date(), -2), price: 45.00, projectId: 'proj2', description: 'Client Lunch' },
      { id: 'entry3', type: 'receipt', date: this.getYMD(new Date(), -5), price: 850.00, projectId: 'proj1', description: 'Window fixtures', receiptImages: [] },
    ]);
  }
  
  private getYMD(date: Date, dayOffset = 0): string {
    const d = new Date(date);
    d.setDate(d.getDate() + dayOffset);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Project Methods
  addProject(project: Omit<Project, 'id'>) {
    const newProject: Project = { ...project, id: `proj_${Date.now()}` };
    this.projects.update(projects => [...projects, newProject]);
  }

  updateProject(updatedProject: Project) {
    this.projects.update(projects =>
      projects.map(p => (p.id === updatedProject.id ? updatedProject : p))
    );
  }

  deleteProject(id: string) {
    // Also unassign from entries
    this.entries.update(entries => entries.map(e => e.projectId === id ? {...e, projectId: undefined} : e));
    this.projects.update(projects => projects.filter(p => p.id !== id));
  }
  
  getProjectById(id: string): Project | undefined {
    return this.projects().find(p => p.id === id);
  }

  // Entry Methods
  addEntry(entry: Omit<Entry, 'id'>) {
    const newEntry: Entry = { ...entry, id: `entry_${Date.now()}` };
    this.entries.update(entries => [...entries, newEntry]);
  }

  updateEntry(updatedEntry: Entry) {
    this.entries.update(entries =>
      entries.map(e => (e.id === updatedEntry.id ? updatedEntry : e))
    );
  }

  deleteEntry(id: string) {
    this.entries.update(entries => entries.filter(e => e.id !== id));
  }
}