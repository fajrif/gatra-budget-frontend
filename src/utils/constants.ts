import type { UserRole } from '@/types';

export const USER_ROLES: readonly UserRole[] = ['admin', 'user', 'operator'] as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
} as const;