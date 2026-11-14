/** Reads a string field from a caught value, if it is an object that has one. */
const readStringField = (error: unknown, field: string): string => {
  if (typeof error !== 'object' || error === null || !(field in error)) return '';
  const value = (error as Record<string, unknown>)[field];
  return typeof value === 'string' ? value.trim() : '';
};

/**
 * Text to show for anything a `catch` block received. Caught values are
 * `unknown`: usually an Error, but API helpers also throw plain objects with
 * a `message` (EmailJS uses `text`), and some code throws strings.
 */
export const getErrorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.'): string => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error.trim()) return error;
  return readStringField(error, 'message') || readStringField(error, 'text') || fallback;
};

/** The machine-readable code on a caught value (e.g. Firebase's `auth/too-many-requests`), or ''. */
export const getErrorCode = (error: unknown): string => readStringField(error, 'code');
