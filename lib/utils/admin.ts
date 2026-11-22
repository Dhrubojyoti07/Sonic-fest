export const PRIMARY_ADMIN_EMAIL = "dhrubojyotipatra2007@gmail.com";

/**
 * Checks whether the given email has administrator privileges.
 * Strict check: only dhrubojyotipatra2007@gmail.com is allowed admin access.
 */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
}
