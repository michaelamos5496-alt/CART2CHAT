const FRIENDLY_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "That email or password doesn't look right.",
  "Email not confirmed": "Please verify your email before logging in.",
  "User already registered": "An account with this email already exists.",
};

export function getAuthErrorMessage(message: string): string {
  return FRIENDLY_MESSAGES[message] ?? message;
}
