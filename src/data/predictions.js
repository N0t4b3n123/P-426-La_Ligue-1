/**
 * Spectator predictions. One record per (user, tournament, match).
 * Points are intentionally informational only; no money or payment handling.
 */
export function getPrediction(predictions, userId, tournamentId, matchId) {
  return predictions.find((p) =>
    p.userId === userId &&
    p.tournamentId === tournamentId &&
    p.matchId === matchId
  ) ?? null;
}

export function savePrediction(predictions, tournament, match, account, teamRegistrationId) {
  if (account?.role !== "spectator") {
    return { ok: false, error: "Only a connected spectator can make a prediction." };
  }
  if (!tournament?.bracket || !match) {
    return { ok: false, error: "Match not found." };
  }
  if (match.bye || !match.team1 || !match.team2) {
    return { ok: false, error: "Both teams must be qualified before predicting." };
  }
  if (match.started === true || match.status === "finished") {
    return { ok: false, error: "Predictions are closed because this match has started." };
  }
  const selectedTeam = [match.team1, match.team2].find(
    (team) => team.registrationId === teamRegistrationId
  );
  if (!selectedTeam) {
    return { ok: false, error: "Select one of the two teams." };
  }

  const existing = getPrediction(predictions, account.id, tournament.id, match.id);
  const prediction = {
    id: existing?.id ?? `${account.id}:${tournament.id}:${match.id}`,
    userId: account.id,
    tournamentId: tournament.id,
    matchId: match.id,
    teamRegistrationId: selectedTeam.registrationId,
    teamName: selectedTeam.name,
    updatedAt: new Date().toISOString(),
  };
  if (existing) Object.assign(existing, prediction);
  else predictions.push(prediction);

  return { ok: true, prediction, updated: !!existing };
}
