export const STATUSES = {
  registration_open: 'Registration open',
  in_progress: 'In progress',
  finished: 'Finished',
};

export const testTournaments = [
  {
    id: 1,
    name: 'ETML Cup',
    game: 'Rocket League',
    date: '2026-12-22',
    registrationDeadline: '2026-12-15', 
    maxTeams: 8,
    status: 'registration_open',
    organizer: 'Alex Organizer',
  },
  {
    id: 2,
    name: 'Lausanne Open',
    game: 'Counter-Strike 2',
    date: '2027-01-16',
    registrationDeadline: '2027-01-09',
    maxTeams: 16,
    status: 'registration_open',
    organizer: 'Alex Organizer',
  },
];

/**
 * Validates a new registration deadline (format YYYY-MM-DD).
 * Past dates are allowed on purpose: the organizer can close registrations early.
 */
export function updateRegistrationDeadline(tournament, account, newDeadline) {
  if (account?.role !== 'organizer') {
    return { ok: false, error: 'Only an organizer can change a deadline.' };
  }
  if (tournament.status !== 'registration_open') {
    return {
      ok: false,
      error: 'The deadline can no longer be changed: registrations are closed.',
    };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(newDeadline ?? '') || Number.isNaN(Date.parse(newDeadline))) {
    return { ok: false, error: 'Please enter a valid date.' };
  }
  if (tournament.date && newDeadline > tournament.date) {
    return { ok: false, error: 'The deadline cannot be after the tournament date.' };
  }
  return { ok: true, registrationDeadline: newDeadline };
}