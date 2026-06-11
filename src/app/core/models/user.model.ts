export type UserRole = 'admin' | 'collaborator';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  cedula?: string;
  photoUrl?: string;
  createdAt: Date;
  isActive: boolean;
}
