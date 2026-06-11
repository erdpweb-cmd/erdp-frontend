import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  docData, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  QueryConstraint
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private firestore = inject(Firestore);

  // Generic CRUD operations
  getCollection<T>(path: string, ...constraints: QueryConstraint[]): Observable<T[]> {
    const col = collection(this.firestore, path);
    const q = constraints.length > 0 ? query(col, ...constraints) : col;
    return collectionData(q, { idField: 'id' }) as Observable<T[]>;
  }

  getDocument<T>(path: string, id: string): Observable<T | null> {
    const document = doc(this.firestore, path, id);
    return docData(document, { idField: 'id' }) as Observable<T | null>;
  }

  async addDocument<T extends { [x: string]: any }>(path: string, data: T): Promise<string> {
    const col = collection(this.firestore, path);
    const docRef = await addDoc(col, data);
    return docRef.id;
  }

  async setDocument<T extends { [x: string]: any }>(path: string, id: string, data: T): Promise<void> {
    const document = doc(this.firestore, path, id);
    await setDoc(document, data);
  }

  async updateDocument(path: string, id: string, data: Partial<unknown>): Promise<void> {
    const document = doc(this.firestore, path, id);
    await updateDoc(document, data);
  }

  async deleteDocument(path: string, id: string): Promise<void> {
    const document = doc(this.firestore, path, id);
    await deleteDoc(document);
  }

  // Helper methods for common queries
  getByField<T>(path: string, field: string, value: unknown): Observable<T[]> {
    const col = collection(this.firestore, path);
    const q = query(col, where(field, '==', value));
    return collectionData(q, { idField: 'id' }) as Observable<T[]>;
  }

  getOrderedBy<T>(path: string, field: string, direction: 'asc' | 'desc' = 'desc'): Observable<T[]> {
    const col = collection(this.firestore, path);
    const q = query(col, orderBy(field, direction));
    return collectionData(q, { idField: 'id' }) as Observable<T[]>;
  }

  getLimited<T>(path: string, count: number): Observable<T[]> {
    const col = collection(this.firestore, path);
    const q = query(col, limit(count));
    return collectionData(q, { idField: 'id' }) as Observable<T[]>;
  }
}
