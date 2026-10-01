import type { ISODateString, UUID } from './common';

/** Mirrors `models.User` in the Go backend. */
export interface User {
  id: UUID;
  email: string;
  full_name: string;
  role: UserRole;
  /**
   * Go declares this as `*string` with `json:"photo_url,omitempty"`, so the
   * backend may omit the key entirely rather than sending `null`.
   */
  photo_url?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/**
 * The backend stores `Role` as a plain `string` with no DB constraint, but the
 * admin UI only ever assigns these three values (see `zod` schema in
 * `src/utils/validations/User.ts`). Narrowing here documents that contract; if
 * the backend grows a fourth role, this is the one line to widen.
 */
export type UserRole = 'admin' | 'user' | 'operator';

/**
 * Mirrors `handlers.LoginRequest`. Note `User.photo_url` is absent here — login
 * returns a reduced user object.
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Mirrors `models.UserRequest`, used for both create and update. */
export interface UserRequest {
  email?: string;
  password?: string;
  full_name?: string;
  role?: UserRole;
}

/** Mirrors `handlers.UpdateMeRequest`. */
export interface UpdateMeRequest {
  full_name: string;
  password?: string;
}

/** The reduced user object returned by `POST /auth/login`. */
export type AuthUser = Pick<User, 'id' | 'email' | 'full_name' | 'role'>;

/** Mirrors the `POST /auth/login` response body. */
export interface LoginResponse {
  token: string;
  user: AuthUser;
}