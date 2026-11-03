// Bracket generation: rules + random draw (no UI here, easy to test).
import { isDeadlinePassed } from './registrations.js';

export const MIN_TEAMS = 2;

export function isPowerOfTwo(n) {
  return Number.isInteger(n) && n > 0 && (n & (n - 1)) === 0;
}

export function nextPowerOfTwo(n) {
  let size = 1;
  while (size < n) size *= 2;
  return size;
}

/** Fisher-Yates shuffle. `rng` can be injected to make tests deterministic. */
export function shuffle(items, rng = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function validatedRegistrations(registrations, tournamentId) {
  return registrations.filter(
    (r) => r.tournamentId === tournamentId && r.status === 'accepted',
  );
}

/** Registrations are closed once the deadline has passed or the tournament left "registration_open". */
export function isRegistrationClosed(tournament, now = new Date()) {
  if (tournament.status !== 'registration_open') return true;
  // No deadline set: the organizer decides when to close by generating the bracket.
  if (!tournament.registrationDeadline) return true;
  return isDeadlinePassed(tournament, now);
}

export function roundName(round, totalRounds) {
  const teamsInRound = 2 ** (totalRounds - round + 1);
  if (teamsInRound === 2) return 'Final';
  if (teamsInRound === 4) return 'Semi-finals';
  if (teamsInRound === 8) return 'Quarter-finals';
  return `Round of ${teamsInRound}`;
}

const toTeam = (r) => (r ? { registrationId: r.id, name: r.teamName } : null);

/** Builds the rounds from a list of validated registrations (random draw + random byes). */
export function buildBracket(teams, rng = Math.random) {
  const size = nextPowerOfTwo(teams.length);
  const byeCount = size - teams.length;
  const matchCount = size / 2;
  const totalRounds = Math.log2(size);

  // Since teams.length > size / 2, byeCount < matchCount: no match ever has 2 byes.
  const shuffled = shuffle(teams, rng);
  const byeMatches = new Set(
    shuffle([...Array(matchCount).keys()], rng).slice(0, byeCount),
  );

  let next = 0;
  const firstRound = [];
  for (let i = 0; i < matchCount; i++) {
    const isBye = byeMatches.has(i);
    const team1 = toTeam(shuffled[next++]);
    const team2 = isBye ? null : toTeam(shuffled[next++]);
    firstRound.push({
      id: `r1-m${i + 1}`,
      round: 1,
      index: i,
      team1,
      team2,
      bye: isBye,
      winner: isBye ? team1 : null,
    });
  }

  const rounds = [firstRound];
  for (let r = 2; r <= totalRounds; r++) {
    rounds.push(
      Array.from({ length: size / 2 ** r }, (_, i) => ({
        id: `r${r}-m${i + 1}`,
        round: r,
        index: i,
        team1: null,
        team2: null,
        bye: false,
        winner: null,
      })),
    );
  }

  // Teams with a bye go straight to round 2.
  if (totalRounds >= 2) {
    firstRound.forEach((m) => {
      if (!m.bye) return;
      const target = rounds[1][Math.floor(m.index / 2)];
      target[m.index % 2 === 0 ? 'team1' : 'team2'] = m.winner;
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    size,
    teamCount: teams.length,
    byeCount,
    rounds,
  };
}

/** Returns a reason why the bracket cannot be generated yet, or null. */
export function bracketBlocker(tournament, registrations, now = new Date()) {
  if (tournament.status === 'finished') {
    return 'This tournament is finished.';
  }
  if (!tournament.bracket && !isRegistrationClosed(tournament, now)) {
    return 'Registrations are still open.';
  }
  if (validatedRegistrations(registrations, tournament.id).length < MIN_TEAMS) {
    return `At least ${MIN_TEAMS} validated teams are required.`;
  }
  return null;
}

/**
 * Generates the bracket. A second generation needs `confirmed: true`,
 * otherwise `needsConfirmation` is returned so the UI can show a warning.
 */
export function generateBracket(
  tournament,
  registrations,
  account,
  { confirmed = false, rng = Math.random, now = new Date() } = {},
) {
  if (account?.role !== 'organizer') {
    return { ok: false, error: 'Only an organizer can generate a bracket.' };
  }

  const blocker = bracketBlocker(tournament, registrations, now);
  if (blocker) return { ok: false, error: blocker };

  if (tournament.bracket && !confirmed) {
    return {
      ok: false,
      needsConfirmation: true,
      error: 'A bracket already exists for this tournament.',
    };
  }

  const teams = validatedRegistrations(registrations, tournament.id);
  return { ok: true, bracket: buildBracket(teams, rng) };
}
