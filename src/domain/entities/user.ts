export interface User {
  userId: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export function getUserFullName(user: User): string {
  if (!user.firstName && !user.lastName) {
    return user.username;
  }
  return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
}

export function getUserInitials(user: User): string {
  if (!user.firstName && !user.lastName) {
    return user.username.slice(0, 2).toUpperCase();
  }
  const firstInitial = user.firstName?.charAt(0) ?? "";
  const lastInitial = user.lastName?.charAt(0) ?? "";
  return `${firstInitial}${lastInitial}`.toUpperCase();
}
