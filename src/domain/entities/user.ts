import type { UserRole } from "../types/user-role";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  emailVerified: boolean;
  avatar?: string | null;
  phone?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function getUserFullName(user: User): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function getUserInitials(user: User): string {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
}

export function hasRole(user: User, role: UserRole): boolean {
  return user.role === role;
}

export function isAdmin(user: User): boolean {
  return hasRole(user, "admin");
}
