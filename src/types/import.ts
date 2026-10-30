/** Which resource an Excel import targets. */
export type ImportKind = 'projects' | 'transactions' | 'invoices';

/** One Excel row as sent to `POST /<resource>/import`: every cell is text, `row` is the sheet row number. */
export type ImportRow = { row: number } & Record<string, string | number>;

/** One validation problem the server found in an import row. */
export interface ImportRowError {
  row: number;
  field: string;
  message: string;
}

/** Body of a successful import. */
export interface ImportResult {
  total: number;
  created: number;
  updated: number;
}

/** Body of a failed (422) import: nothing was saved. */
export interface ImportErrorBody {
  error: string;
  errors: ImportRowError[];
}
