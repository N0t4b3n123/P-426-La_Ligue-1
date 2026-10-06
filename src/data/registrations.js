// Team registrations: rules + validation (no UI here, easy to test).

export const REGISTRATION_STATUSES = {
  pending_validation: 'Pending validation',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 5;

export const testRegistrations = [];

function normalize(text) {
  return (text ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function isDeadlinePassed(tournament, now = new Date()) {
  if (!tournament.registrationDeadline) return false;
  return now > new Date(`${tournament.registrationDeadline}T23:59:59`);
}

export function activeRegistrations(registrations, tournamentId) {
  return registrations.filter(
    (r) => r.tournamentId === tournamentId && r.status !== 'rejected',
  );
}

export function isFull(tournament, registrations) {
  return activeRegistrations(registrations, tournament.id).length >= tournament.maxTeams;
}

export function registrationState(tournament, registrations, now = new Date()) {
  if (tournament.status !== 'registration_open') return 'closed';
  if (isDeadlinePassed(tournament, now)) return 'deadline_passed';
  if (isFull(tournament, registrations)) return 'full';
  return 'open';
}

export function registerTeam(registrations, tournament, account, { teamName, players }) {
  if (account?.role !== 'captain') {
    return { ok: false, error: 'Only a captain can register a team.' };
  }

  const state = registrationState(tournament, registrations);
  if (state === 'closed') {
    return { ok: false, error: 'Registration is not open for this tournament.' };
  }
  if (state === 'deadline_passed') {
    return { ok: false, error: 'The registration deadline has passed.' };
  }
  if (state === 'full') {
    return { ok: false, error: 'This tournament is full.' };
  }

  const name = (teamName ?? '').trim().replace(/\s+/g, ' ');
  if (!name) {
    return { ok: false, error: 'The team name is required.' };
  }

  const cleanPlayers = (players ?? []).map((p) => (p ?? '').trim()).filter(Boolean);
  if (cleanPlayers.length < MIN_PLAYERS || cleanPlayers.length > MAX_PLAYERS) {
    return {
      ok: false,
      error: `A team needs between ${MIN_PLAYERS} and ${MAX_PLAYERS} players.`,
    };
  }

  const taken = activeRegistrations(registrations, tournament.id).some(
    (r) => normalize(r.teamName) === normalize(name),
  );
  if (taken) {
    return { ok: false, error: 'This team name is already used in this tournament.' };
  }

  return {
    ok: true,
    registration: {
      id: Date.now(),
      tournamentId: tournament.id,
      teamName: name,
      players: cleanPlayers,
      captainId: account.id,
      status: 'pending_validation',
      createdAt: new Date().toISOString(),
    },
  };
}