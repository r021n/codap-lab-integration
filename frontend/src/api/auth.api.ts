import { apiClient } from "./client";
export type { User } from "../types/user";
import type { User } from "../types/user";

type LoginResponse = {
  token: string;
  user: User;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  school?: string;
  class?: string;
  age?: number;
  gender?: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type UpdateProfilePayload = {
  name: string;
  email: string;
  school?: string;
  class?: string;
  age?: number;
  gender?: string;
};

type UpdatePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", payload);
  return data;
}

export async function register(payload: RegisterPayload): Promise<void> {
  await apiClient.post("/auth/register", payload);
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/me");
  return data;
}

export async function updateProfile(
  payload: UpdateProfilePayload,
): Promise<{ user?: User }> {
  const { data } = await apiClient.put<{ user?: User }>(
    "/auth/profile",
    payload,
  );
  return data;
}

export async function updatePassword(
  payload: UpdatePasswordPayload,
): Promise<void> {
  await apiClient.put("/auth/password", payload);
}
