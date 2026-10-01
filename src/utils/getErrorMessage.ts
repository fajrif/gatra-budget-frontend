import { isAxiosError } from 'axios';
import type { ApiErrorBody } from '@/types';

/**
 * Normalises anything thrown by a mutation into a displayable message.
 *
 * Backend failures come back as `{ "error": "..." }`; when the request never
 * reached the API (network, timeout) `response` is absent, so we fall back to
 * the caller-supplied message.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.error || fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}