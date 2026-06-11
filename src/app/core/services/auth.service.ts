import { Injectable, signal, effect } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, user, User as FirebaseUser } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { User, UserRole } from '../models/user.model';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<User | null>(null);
  private firebaseUser = signal<FirebaseUser | null>(null);

  // Usuario provisional para desarrollo
  private readonly DEV_USERS: Record<string, User> = {
    'admin@perritos.com': {
      uid: 'dev-admin-001',
      email: 'admin@perritos.com',
      displayName: 'Administrador Dev',
      role: 'admin',
      isActive: true,
      createdAt: new Date()
    },
    'colab@perritos.com': {
      uid: 'dev-colab-001',
      email: 'colab@perritos.com',
      displayName: 'Colaborador Dev',
      role: 'collaborator',
      isActive: true,
      createdAt: new Date()
    }
  };

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    effect(() => {
      const fbUser = user(this.auth);
      fbUser.subscribe(user => {
        this.firebaseUser.set(user);
        if (user) {
          this.loadUserData(user.uid);
        } else {
          this.currentUser.set(null);
        }
      });
    });
  }

  private async loadUserData(uid: string): Promise<void> {
    try {
      const userDoc = doc(this.firestore, `users/${uid}`);
      const userSnap = await getDoc(userDoc);
      if (userSnap.exists()) {
        const userData = userSnap.data() as User;
        this.currentUser.set({ ...userData, uid });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  async login(email: string, password: string): Promise<void> {
    // Login provisional para desarrollo (contraseña: 123456)
    if (!environment.production && password === '123456') {
      const devUser = this.DEV_USERS[email.toLowerCase()];
      if (devUser) {
        this.currentUser.set(devUser);
        console.log('🔓 Login de desarrollo exitoso:', devUser.displayName);
        return;
      }
    }

    // Login real con Firebase
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      await this.loadUserData(credential.user.uid);
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUser.set(null);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }

  hasRole(allowedRoles: string[]): boolean {
    const user = this.currentUser();
    if (!user) return false;
    return allowedRoles.includes(user.role);
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  isCollaborator(): boolean {
    return this.currentUser()?.role === 'collaborator';
  }
}
