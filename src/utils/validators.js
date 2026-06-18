export const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
export const isValidPassword = (v) => v.length >= 8;
export const isValidUsername = (v) => /^[a-zA-Z0-9_]{3,30}$/.test(v.trim());

export function validateLoginForm({ email, password }) {
  const errors = {};
  if (!isValidEmail(email))          errors.email    = "Enter a valid email address.";
  if (!password || password.length < 1) errors.password = "Password is required.";
  return errors;
}

export function validateRegisterForm({ email, password, username }) {
  const errors = {};
  if (!isValidEmail(email))       errors.email    = "Enter a valid email address.";
  if (!isValidPassword(password)) errors.password = "Password must be at least 8 characters.";
  if (!isValidUsername(username)) errors.username = "Username must be 3–30 alphanumeric characters or underscores.";
  return errors;
}
