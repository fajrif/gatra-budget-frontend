import type { UserRole } from '@/types';

/**
 * Determines the Tailwind CSS classes for a given role.
 * Falls back to the `operator` styling for unknown roles.
 */
export const getRoleColor = (role: UserRole | string | null | undefined): string => {
  const colors: Record<string, string> = {
    admin: 'bg-red-50 text-red-700 border-red-200',
    operator: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    user: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return colors[role as string] || colors.operator;
};