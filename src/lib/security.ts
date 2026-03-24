/**
 * Security utilities – password strength validation & env helpers.
 */

/**
 * Returns `true` when the password meets minimum strength requirements:
 *  - At least 8 characters
 *  - Contains uppercase letter
 *  - Contains lowercase letter
 *  - Contains digit
 *  - Contains special character
 */
export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[^A-Za-z0-9]/.test(password)) return false;
  return true;
}

/**
 * Read a required environment variable or throw.
 */
export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
