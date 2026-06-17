export interface PasswordRule {
  id: string
  label: string
  test: (pw: string) => boolean
}

export const PASSWORD_RULES: PasswordRule[] = [
  { id: 'length', label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { id: 'upper', label: 'One uppercase letter (A–Z)', test: (pw) => /[A-Z]/.test(pw) },
  { id: 'lower', label: 'One lowercase letter (a–z)', test: (pw) => /[a-z]/.test(pw) },
  { id: 'number', label: 'One number (0–9)', test: (pw) => /[0-9]/.test(pw) },
  { id: 'special', label: 'One special character (!@#$…)', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
]

export function validatePassword(pw: string): { valid: boolean; errors: string[] } {
  const errors = PASSWORD_RULES.filter((r) => !r.test(pw)).map((r) => r.label)
  return { valid: errors.length === 0, errors }
}
