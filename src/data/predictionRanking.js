// Prediction leaderboard: points, correct/total and tie-break (no UI here, easy to test).
// Points are only a game score: no real money involved.
import { findAccountById } from "./accounts.js";

/** Points won for each correct prediction (to be validated with the client). */
export const POINTS_PER_CORRECT = 1;

function findMatch(tournament, matchId) {
  for (const round of tournament?.bracket?.rounds ?? []) {
    const match = round.find((m) => m.id === matchId);
    if (match) return match;
  }
  return null;
}

/**
 * Result of one prediction:
 * - "correct" / "wrong": the match is finished
 * - "pending": the match is not finished yet (no points yet)
 * - null: the prediction no longer matches the bracket (e.g. bracket regenerated) -> ignored
 */
export function evaluatePrediction(prediction, tournament) {
  const match = findMatch(tournament, prediction.matchId);
  if (!match || match.bye) return null;

  const playsInMatch = [match.team1, match.team2].some(
    (t) => t?.registrationId === prediction.teamRegistrationId,
  );
  if (!playsInMatch) return null;

  if (match.status !== "finished" || !match.winner) return "pending";
  return match.winner.registrationId === prediction.teamRegistrationId
    ? "correct"
    : "wrong";
}

/** Success rate comparison without floating point: <0 if a has the better rate (sorts first). */
function compareAccuracy(a, b) {
  return a.total * b.correct - b.total * a.correct;
}

/**
 * Ranking of all participants (users with at least one prediction).
 * Order: points DESC, then success rate (correct / total) DESC, then name.
 * Participants still equal after the tie-break share the same rank (ex aequo).
 * `tournamentId` = null -> all tournaments.
 */
export function calculatePredictionRanking(
  predictions,
  tournaments,
  { tournamentId = null, getUserName = (id) => findAccountById(id)?.name ?? "Unknown" } = {},
) {
  const byUser = new Map();

  for (const p of predictions ?? []) {
    if (tournamentId !== null && p.tournamentId !== tournamentId) continue;

    const tournament = tournaments.find((t) => t.id === p.tournamentId);
    const result = tournament ? evaluatePrediction(p, tournament) : null;
    if (!result) continue;

    if (!byUser.has(p.userId)) {
      byUser.set(p.userId, {
        userId: p.userId,
        name: getUserName(p.userId),
        points: 0,
        correct: 0,
        total: 0, // predictions on finished matches
        pending: 0, // predictions on matches not finished yet
      });
    }
    const row = byUser.get(p.userId);

    if (result === "pending") {
      row.pending += 1;
      continue;
    }
    row.total += 1;
    if (result === "correct") {
      row.correct += 1;
      row.points += POINTS_PER_CORRECT;
    }
  }

  const sorted = [...byUser.values()].sort(
    (a, b) =>
      b.points - a.points ||
      compareAccuracy(a, b) ||
      a.name.localeCompare(b.name, "fr"),
  );

  let currentRank = 0;
  return sorted.map((row, index) => {
    const prev = sorted[index - 1];
    if (!prev || prev.points !== row.points || compareAccuracy(prev, row) !== 0) {
      currentRank = index + 1;
    }
    return { ...row, rank: currentRank };
  });
}
