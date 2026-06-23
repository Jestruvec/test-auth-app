import type { User } from "../entities/user";

export const mockAdminUser: User = {
  userId: "123e4567-e89b-12d3-a456-426614174000",
  username: "admin",
  email: "admin@thepalacecompany.com",
  firstName: "Admin",
  lastName: "User",
};

export const mockRegularUser: User = {
  userId: "223e4567-e89b-12d3-a456-426614174001",
  username: "jperez",
  email: "user@example.com",
  firstName: "Juan",
  lastName: "Pérez",
};

export const mockUnverifiedUser: User = {
  userId: "323e4567-e89b-12d3-a456-426614174002",
  username: "mgarcia",
  email: "unverified@example.com",
  firstName: "María",
  lastName: "García",
};

export const mockGuestUser: User = {
  userId: "423e4567-e89b-12d3-a456-426614174003",
  username: "guest",
  email: "guest@example.com",
  firstName: "Guest",
  lastName: "User",
};

export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    ...mockRegularUser,
    ...overrides,
  };
}
