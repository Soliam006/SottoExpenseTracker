import { Injectable, signal, inject, effect } from '@angular/core';
import { Project } from '../models/project.model';
import { Entry } from '../models/entry.model';
import { AuthService } from './auth.service';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, writeBatch, Firestore, Unsubscribe } from 'firebase/firestore';
import { firebaseConfig } from '../firebase.config';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private authService = inject(AuthService);
  private db: Firestore;

  projects = signal<Project[]>([]);
  entries = signal<Entry[]>([]);

  private projectsUnsubscribe: Unsubscribe | null = null;
  private entriesUnsubscribe: Unsubscribe | null = null;

  constructor() {
    // NOTE: It's safe to call initializeApp multiple times.
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);

    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.subscribeToData(user.uid);
      } else {
        this.unsubscribeFromData();
      }
    });
  }

  private subscribeToData(uid: string) {
    this.unsubscribeFromData();
    
    const projectsCollection = collection(this.db, 'users', uid, 'projects');
    this.projectsUnsubscribe = onSnapshot(projectsCollection, (snapshot) => {
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      this.projects.set(projects);
    });

    const entriesCollection = collection(this.db, 'users', uid, 'entries');
    this.entriesUnsubscribe = onSnapshot(entriesCollection, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Entry));
      this.entries.set(entries);
    });
  }

  private unsubscribeFromData() {
    if (this.projectsUnsubscribe) {
      this.projectsUnsubscribe();
      this.projectsUnsubscribe = null;
    }
    if (this.entriesUnsubscribe) {
      this.entriesUnsubscribe();
      this.entriesUnsubscribe = null;
    }
    this.projects.set([]);
    this.entries.set([]);
  }

  private getUid(): string | null {
    return this.authService.currentUser()?.uid ?? null;
  }

  // Project Methods
  async addProject(project: Omit<Project, 'id'>) {
    const uid = this.getUid();
    if (!uid) throw new Error('User not logged in');
    await addDoc(collection(this.db, 'users', uid, 'projects'), project);
  }

  async updateProject(updatedProject: Project) {
    const uid = this.getUid();
    if (!uid) throw new Error('User not logged in');
    const { id, ...projectData } = updatedProject;
    await updateDoc(doc(this.db, 'users', uid, 'projects', id), projectData);
  }

  async deleteProject(id: string) {
    const uid = this.getUid();
    if (!uid) throw new Error('User not logged in');

    const entriesQuery = query(collection(this.db, 'users', uid, 'entries'), where('projectId', '==', id));
    const entriesSnapshot = await getDocs(entriesQuery);
    const batch = writeBatch(this.db);
    entriesSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    
    await deleteDoc(doc(this.db, 'users',uid, 'projects', id));
  }
  
  getProjectById(id: string): Project | undefined {
    return this.projects().find(p => p.id === id);
  }

  // Entry Methods
  async addEntry(entry: Omit<Entry, 'id'>) {
    const uid = this.getUid();
    if (!uid) throw new Error('User not logged in');
    await addDoc(collection(this.db, 'users', uid, 'entries'), entry);
  }

  async updateEntry(updatedEntry: Entry) {
    const uid = this.getUid();
    if (!uid) throw new Error('User not logged in');
    const { id, ...entryData } = updatedEntry;
    await updateDoc(doc(this.db, 'users', uid, 'entries', id), entryData);
  }

  async deleteEntry(id: string) {
    const uid = this.getUid();
    if (!uid) throw new Error('User not logged in');
    await deleteDoc(doc(this.db, 'users', uid, 'entries', id));
  }
}