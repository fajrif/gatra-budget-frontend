import { useAuthContext, type AuthContextValue } from '@/context/AuthContext';

export const useAuth = (): AuthContextValue => useAuthContext();

export type { AuthContextValue };