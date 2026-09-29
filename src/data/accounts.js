// TEST accounts
// Passwords are in plain text only because this is a mockup:
export const accounts = [
  { id: 1, username: 'organizer', password: 'org123', name: 'Alex Organizer', role: 'organizer' },
  { id: 2, username: 'captain', password: 'cap123', name: 'Camille Captain', role: 'captain' },
  { id: 3, username: 'spectator', password: 'spec123', name: 'Sam Spectator', role: 'spectator' },
];

/** Strips the password before keeping an account in the session. */
export function publicAccount({ password, ...account }) {
  return account;
}

/**
 * Looks for an account matching both username AND password.
 * Returns the public account, or null (without saying which one is wrong).
 */
export function authenticate(username, password) {
  const found = accounts.find(
    (a) => a.username === (username ?? '').trim() && a.password === password,
  );
  return found ? publicAccount(found) : null;
}

export function findAccountById(id) {
  const found = accounts.find((a) => a.id === id);
  return found ? publicAccount(found) : null;
}