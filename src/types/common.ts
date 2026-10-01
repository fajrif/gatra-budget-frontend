/**
 * Backend IDs are PostgreSQL `uuid` columns (Go `uuid.UUID`), which serialize to
 * JSON strings. Keep this alias so the provenance stays obvious at a glance.
 */
export type UUID = string;

/** RFC 3339 timestamp as emitted by Go's `time.Time` JSON encoding. */
export type ISODateString = string;

/** Query params accepted by every paginated list endpoint. */
export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  /**
   * When `"true"` the backend skips pagination entirely and returns every row.
   * The grid pages rely on this and page client-side via AG Grid instead.
   */
  all?: boolean;
}

/** Mirrors `helpers.PaginationMeta` in the Go backend. */
export interface PaginationMeta {
  page: number;
  limit: number;
  /** `int64` on the wire; safe to treat as number since row counts stay well under 2^53. */
  total: number;
  total_pages: number;
}

/**
 * Mirrors `helpers.CreatePaginationResponse`: the collection is keyed by a
 * per-resource name rather than a fixed `data` field, so the key is a type param.
 */
export type ListEnvelope<K extends string, T> = { pagination: PaginationMeta } & Record<K, T[]>;

/** Mirrors the `{ "error": "..." }` bodies returned on non-2xx responses. */
export interface ApiErrorBody {
  error: string;
}