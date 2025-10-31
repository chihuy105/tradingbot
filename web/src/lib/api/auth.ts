"use client";

import type { User } from "@/types/user";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

function createMockUser(email: string): User {
  return {
    id: `user-${email}`,
    name: email.split("@")[0],
    email,
    roles: ["user"],
    avatarUrl: null,
  };
}

export async function loginRequest(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const user = createMockUser(credentials.email);

  return {
    token: credentials.email,
    user,
  };
}

export async function fetchUserRequest(token: string): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return createMockUser(token);
}

export async function logoutRequest(token: string | null): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));
}
