import type { User } from "../entities/user";
import { UserRole } from "../types/user-role";

export const mockAdminUser: User = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  email: "admin@thepalacecompany.com",
  firstName: "Admin",
  lastName: "User",
  role: UserRole.ADMIN,
  emailVerified: true,
  avatar: "https://i.pravatar.cc/150?u=admin",
  phone: "+34612345678",
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-15T10:30:00Z"),
};

export const mockRegularUser: User = {
  id: "223e4567-e89b-12d3-a456-426614174001",
  email: "user@example.com",
  firstName: "Juan",
  lastName: "Pérez",
  role: UserRole.USER,
  emailVerified: true,
  avatar: "https://i.pravatar.cc/150?u=user",
  phone: "+34698765432",
  createdAt: new Date("2024-02-01T00:00:00Z"),
  updatedAt: new Date("2024-02-10T14:20:00Z"),
};

export const mockUnverifiedUser: User = {
  id: "323e4567-e89b-12d3-a456-426614174002",
  email: "unverified@example.com",
  firstName: "María",
  lastName: "García",
  role: UserRole.USER,
  emailVerified: false,
  avatar: null,
  phone: null,
  createdAt: new Date("2024-03-01T00:00:00Z"),
  updatedAt: new Date("2024-03-01T00:00:00Z"),
};

export const mockGuestUser: User = {
  id: "423e4567-e89b-12d3-a456-426614174003",
  email: "guest@example.com",
  firstName: "Guest",
  lastName: "User",
  role: UserRole.GUEST,
  emailVerified: true,
  avatar: null,
  phone: null,
  createdAt: new Date("2024-04-01T00:00:00Z"),
  updatedAt: new Date("2024-04-01T00:00:00Z"),
};

export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    ...mockRegularUser,
    ...overrides,
  };
}
